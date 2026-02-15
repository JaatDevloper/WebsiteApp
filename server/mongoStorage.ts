import { type User, type InsertUser, type Quiz as QuizType, type InsertQuiz, type Question, type InsertQuestion } from "@shared/schema";
import { type IStorage } from "./storage";
import { connectToMongoDB, UserProfile, Quiz, PremiumUser, VerifiedUser, QuizAttempt } from "./mongodb";
import { randomUUID } from "crypto";

export class MongoStorage implements IStorage {
  private initialized = false;

  private async ensureConnection() {
    if (!this.initialized) {
      await connectToMongoDB();
      this.initialized = true;
    }
  }

  async getUser(id: string): Promise<User | undefined> {
    await this.ensureConnection();
    const profile = await UserProfile.findOne({ user_id: parseInt(id) });
    if (!profile) return undefined;

    return {
      id: profile.user_id.toString(),
      telegramId: profile.user_id.toString(),
      username: profile.username || null,
      firstName: profile.first_name || null,
      lastName: profile.last_name || null,
      createdAt: profile.created_at,
    };
  }

  async getUserByTelegramId(telegramId: string): Promise<User | undefined> {
    await this.ensureConnection();
    const userId = parseInt(telegramId);
    const profile = await UserProfile.findOne({ user_id: userId });
    
    if (!profile) return undefined;

    return {
      id: profile.user_id.toString(),
      telegramId: profile.user_id.toString(),
      username: profile.username || null,
      firstName: profile.first_name || null,
      lastName: profile.last_name || null,
      createdAt: profile.created_at,
    };
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    await this.ensureConnection();
    const userIdStr = insertUser.telegramId;
    const userId = parseInt(userIdStr);
    
    // Check if user already exists
    let profile = await UserProfile.findOne({ user_id: userId });
    
    if (!profile) {
      profile = await UserProfile.create({
        user_id: userId,
        username: insertUser.username,
        first_name: insertUser.firstName,
        last_name: insertUser.lastName,
        quizzes_taken: [],
        total_quizzes: 0,
        total_questions_answered: 0,
        total_correct_answers: 0,
        total_incorrect_answers: 0,
        avg_score_percentage: 0,
        categories: new Map(),
        achievements: [],
        streak: {
          current: 0,
          best: 0,
        },
        is_premium: false,
      });

      // Also add to verified users
      await VerifiedUser.findOneAndUpdate(
        { user_id: userId },
        { user_id: userId, registered_at: new Date() },
        { upsert: true }
      );
    }

    return {
      id: profile.user_id.toString(),
      telegramId: profile.user_id.toString(),
      username: profile.username || null,
      firstName: profile.first_name || null,
      lastName: profile.last_name || null,
      createdAt: (profile as any).created_at || new Date(),
    };
  }

  async getQuizzesByUserId(userId: string): Promise<QuizType[]> {
    await this.ensureConnection();
    
    const quizzes = await Quiz.find({ 
      $or: [
        { creator_id: userId },
        { creator_id: Number(userId) },
        { creator_id: userId.toString() },
        { "questions.creator_id": userId },
        { "questions.creator_id": Number(userId) }
      ]
    }).lean().sort({ created_at: -1 });

    return (quizzes || []).map(quiz => {
      const id = (quiz as any).quiz_id || (quiz as any)._id?.toString() || 'unknown';
      const title = (quiz as any).title || (quiz as any).quiz_name || 'Untitled Quiz';
      
      let timer = (quiz as any).timer;
      if (timer === undefined && (quiz as any).questions && (quiz as any).questions.length > 0) {
        timer = (quiz as any).questions[0].timer;
      }

      return {
        id,
        userId: ((quiz as any).creator_id || userId).toString(),
        title,
        description: (quiz as any).description || null,
        isPaid: (quiz as any).is_paid || false,
        price: (quiz as any).price || 0,
        timer: timer ?? 15,
        negativeMarking: (quiz as any).negative_marking ?? 0,
        participants: (quiz as any).participants || 0,
        createdAt: (quiz as any).created_at || ((quiz as any).timestamp ? new Date((quiz as any).timestamp) : new Date()),
      };
    });
  }

  async getQuiz(id: string): Promise<QuizType | undefined> {
    await this.ensureConnection();
    const quiz = await Quiz.findOne({ 
      $or: [{ quiz_id: id }, { _id: id }] 
    }).lean();
    if (!quiz) return undefined;

    return {
      id: (quiz as any).quiz_id || (quiz as any)._id.toString(),
      userId: ((quiz as any).creator_id || '').toString(),
      title: (quiz as any).title || (quiz as any).quiz_name || 'Untitled',
      description: (quiz as any).description || null,
      isPaid: (quiz as any).is_paid || false,
      price: (quiz as any).price || 0,
      timer: (quiz as any).timer ?? 15,
      negativeMarking: (quiz as any).negative_marking ?? 0,
      participants: (quiz as any).participants || 0,
      createdAt: (quiz as any).created_at || ((quiz as any).timestamp ? new Date((quiz as any).timestamp) : new Date()),
    };
  }

  async createQuiz(insertQuiz: InsertQuiz): Promise<QuizType> {
    await this.ensureConnection();
    const quizId = randomUUID();
    const creatorId = insertQuiz.userId;

    const quiz = await Quiz.create({
      quiz_id: quizId,
      creator_id: creatorId,
      title: insertQuiz.title,
      description: insertQuiz.description,
      is_paid: insertQuiz.isPaid ?? false,
      price: insertQuiz.price ?? 0,
      timer: insertQuiz.timer ?? 15,
      negative_marking: insertQuiz.negativeMarking ?? 0,
      questions: [],
      participants: 0,
      total_attempts: 0,
      avg_score: 0,
    });

    return {
      id: quiz.quiz_id,
      userId: quiz.creator_id.toString(),
      title: quiz.title,
      description: quiz.description || null,
      isPaid: quiz.is_paid || null,
      price: quiz.price || null,
      timer: quiz.timer ?? 15,
      negativeMarking: quiz.negative_marking ?? 0,
      participants: quiz.participants || 0,
      createdAt: quiz.created_at,
    };
  }

  async updateQuiz(id: string, updates: Partial<QuizType>): Promise<QuizType | undefined> {
    await this.ensureConnection();
    const updateData: any = { updated_at: new Date() };

    if (updates.title !== undefined) updateData.title = updates.title;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.isPaid !== undefined) updateData.is_paid = updates.isPaid;
    if (updates.price !== undefined) updateData.price = updates.price;
    if (updates.timer !== undefined) updateData.timer = updates.timer;
    if (updates.negativeMarking !== undefined) updateData.negative_marking = updates.negativeMarking;
    if (updates.participants !== undefined) updateData.participants = updates.participants;

    const quiz = await Quiz.findOneAndUpdate(
      { quiz_id: id },
      { $set: updateData },
      { new: true }
    );

    if (!quiz) return undefined;

    return {
      id: quiz.quiz_id,
      userId: quiz.creator_id.toString(),
      title: quiz.title,
      description: quiz.description || null,
      isPaid: quiz.is_paid || null,
      price: quiz.price || null,
      timer: quiz.timer ?? 30,
      negativeMarking: quiz.negative_marking ?? 0,
      participants: quiz.participants || 0,
      createdAt: quiz.created_at,
    };
  }

  async deleteQuiz(id: string): Promise<boolean> {
    await this.ensureConnection();
    const result = await Quiz.deleteOne({ quiz_id: id });
    return result.deletedCount > 0;
  }

  async getQuestionsByQuizId(quizId: string): Promise<Question[]> {
    await this.ensureConnection();
    
    // The logs show quizId is a string UUID like "6ac78953-740e-4db9-85d8-83d5e919b72f"
    // We should try searching by quiz_id field first
    let quiz = await Quiz.findOne({ quiz_id: quizId }).lean();
    
    // If not found, only then try _id if it's a valid ObjectId
    if (!quiz && /^[0-9a-fA-F]{24}$/.test(quizId)) {
      quiz = await Quiz.findOne({ _id: quizId }).lean();
    }
    
    if (!quiz || !quiz.questions) return [];

    return quiz.questions.map((q: any, index: number) => ({
      id: q._id?.toString() || `${quizId}-q${index}`,
      quizId: quizId,
      question: q.question || "",
      options: q.options || [],
      correctAnswer: q.answer ?? q.correct_answer ?? 0,
      order: index,
    }));
  }

  async createQuestion(insertQuestion: InsertQuestion): Promise<Question> {
    await this.ensureConnection();
    const quiz = await Quiz.findOne({ quiz_id: insertQuestion.quizId });
    if (!quiz) throw new Error('Quiz not found');

    const questionData = {
      question: insertQuestion.question,
      options: insertQuestion.options,
      answer: insertQuestion.correctAnswer, // Changed from correct_answer to answer
      explanation: '',
      reference: '',
    };

    quiz.questions.push(questionData);
    await quiz.save();

    const questionId = `${insertQuestion.quizId}-q${quiz.questions.length - 1}`;
    
    return {
      id: questionId,
      quizId: insertQuestion.quizId,
      question: insertQuestion.question,
      options: insertQuestion.options,
      correctAnswer: insertQuestion.correctAnswer,
      order: insertQuestion.order || null,
    };
  }

  // Additional methods for quiz attempts and premium users
  async saveQuizAttempt(attempt: {
    userId: string;
    quizId: string;
    quizTitle: string;
    score: number;
    totalQuestions: number;
    correctAnswers: number;
    incorrectAnswers: number;
    scorePercentage: number;
    timeTaken?: number;
    answers?: any[];
  }) {
    await this.ensureConnection();
    const userId = parseInt(attempt.userId);

    // Save quiz attempt
    await QuizAttempt.create({
      user_id: userId,
      quiz_id: attempt.quizId,
      quiz_title: attempt.quizTitle,
      score: attempt.score,
      total_questions: attempt.totalQuestions,
      correct_answers: attempt.correctAnswers,
      incorrect_answers: attempt.incorrectAnswers,
      score_percentage: attempt.scorePercentage,
      time_taken: attempt.timeTaken || 0,
      answers: attempt.answers || [],
    });

    // Update user profile
    const profile = await UserProfile.findOne({ user_id: userId });
    if (profile) {
      profile.quizzes_taken.push({
        quiz_id: attempt.quizId,
        quiz_title: attempt.quizTitle,
        score: attempt.score,
        total_questions: attempt.totalQuestions,
        correct_answers: attempt.correctAnswers,
        incorrect_answers: attempt.incorrectAnswers,
        score_percentage: attempt.scorePercentage,
        taken_at: new Date(),
      });

      profile.total_quizzes += 1;
      profile.total_questions_answered += attempt.totalQuestions;
      profile.total_correct_answers += attempt.correctAnswers;
      profile.total_incorrect_answers += attempt.incorrectAnswers;
      
      if (profile.total_questions_answered > 0) {
        profile.avg_score_percentage = 
          (profile.total_correct_answers / profile.total_questions_answered) * 100;
      }

      profile.last_updated = new Date();
      await profile.save();
    }

    // Update quiz participants count
    await Quiz.findOneAndUpdate(
      { quiz_id: attempt.quizId },
      { 
        $inc: { total_attempts: 1 },
        $set: { updated_at: new Date() }
      }
    );
  }

  async isPremiumUser(userId: string): Promise<boolean> {
    await this.ensureConnection();
    const premiumUser = await PremiumUser.findOne({ user_id: parseInt(userId) });
    return !!premiumUser;
  }

  async getUserQuizHistory(userId: string) {
    await this.ensureConnection();
    const profile = await UserProfile.findOne({ user_id: parseInt(userId) });
    return profile?.quizzes_taken || [];
  }

  async getUserProfile(userId: string) {
    await this.ensureConnection();
    const profile = await UserProfile.findOne({ user_id: parseInt(userId) });
    if (!profile) return null;
    
    return {
      user_id: profile.user_id,
      username: profile.username,
      first_name: profile.first_name,
      last_name: profile.last_name,
      total_quizzes: profile.total_quizzes || 0,
      total_questions_answered: profile.total_questions_answered || 0,
      total_correct_answers: profile.total_correct_answers || 0,
      total_incorrect_answers: profile.total_incorrect_answers || 0,
      avg_score_percentage: profile.avg_score_percentage || 0,
      achievements: profile.achievements || [],
      streak: profile.streak || { current: 0, best: 0 },
      is_premium: profile.is_premium || false,
    };
  }
}

export const mongoStorage = new MongoStorage();
