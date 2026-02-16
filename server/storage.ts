import { type User, type InsertUser, type Quiz, type InsertQuiz, type Question, type InsertQuestion } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByTelegramId(telegramId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getQuizzesByUserId(userId: string): Promise<Quiz[]>;
  getQuiz(id: string): Promise<Quiz | undefined>;
  createQuiz(quiz: InsertQuiz): Promise<Quiz>;
  updateQuiz(id: string, quiz: Partial<Quiz>): Promise<Quiz | undefined>;
  deleteQuiz(id: string): Promise<boolean>;
  
  getQuestionsByQuizId(quizId: string): Promise<Question[]>;
  createQuestion(question: InsertQuestion): Promise<Question>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private quizzes: Map<string, Quiz>;
  private questions: Map<string, Question>;

  constructor() {
    this.users = new Map();
    this.quizzes = new Map();
    this.questions = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByTelegramId(telegramId: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.telegramId === telegramId,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      id,
      telegramId: insertUser.telegramId,
      username: insertUser.username ?? null,
      firstName: insertUser.firstName ?? null,
      lastName: insertUser.lastName ?? null,
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async getQuizzesByUserId(userId: string): Promise<Quiz[]> {
    return Array.from(this.quizzes.values()).filter(
      (quiz) => quiz.userId === userId,
    );
  }

  async getQuiz(id: string): Promise<Quiz | undefined> {
    return this.quizzes.get(id);
  }

  async createQuiz(insertQuiz: InsertQuiz): Promise<Quiz> {
    const id = randomUUID();
    const quiz: Quiz = {
      id,
      userId: insertQuiz.userId,
      title: insertQuiz.title,
      description: insertQuiz.description ?? null,
      isPaid: insertQuiz.isPaid ?? null,
      price: insertQuiz.price ?? null,
      participants: 0,
      timer: insertQuiz.timer ?? null,
      negativeMarking: insertQuiz.negativeMarking ?? null,
      createdAt: new Date(),
    };
    this.quizzes.set(id, quiz);
    return quiz;
  }

  async updateQuiz(id: string, updates: Partial<Quiz>): Promise<Quiz | undefined> {
    const quiz = this.quizzes.get(id);
    if (!quiz) return undefined;
    
    const updated = { ...quiz, ...updates };
    this.quizzes.set(id, updated);
    return updated;
  }

  async deleteQuiz(id: string): Promise<boolean> {
    return this.quizzes.delete(id);
  }

  async getQuestionsByQuizId(quizId: string): Promise<Question[]> {
    return Array.from(this.questions.values()).filter(
      (question) => question.quizId === quizId,
    );
  }

  async createQuestion(insertQuestion: InsertQuestion): Promise<Question> {
    const id = randomUUID();
    const question: Question = {
      id,
      quizId: insertQuestion.quizId,
      question: insertQuestion.question,
      options: insertQuestion.options,
      correctAnswer: insertQuestion.correctAnswer,
      order: insertQuestion.order ?? null,
    };
    this.questions.set(id, question);
    return question;
  }
}

import { mongoStorage } from "./mongoStorage";

const useMemory = !process.env.MONGODB_URI;
if (useMemory) {
  console.log("⚠️ MONGODB_URI not set, using in-memory storage");
}

export const storage: IStorage = useMemory ? new MemStorage() : mongoStorage;
