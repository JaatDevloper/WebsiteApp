import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { mongoStorage } from "./mongoStorage";
import { insertUserSchema, insertQuizSchema, insertQuestionSchema } from "@shared/schema";
import { z } from "zod";
import multer from "multer";
import { randomUUID } from "crypto";

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/plain' || file.originalname.endsWith('.txt')) {
      cb(null, true);
    } else {
      cb(new Error('Only .txt files are allowed'));
    }
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  // User routes
  app.get("/api/user", async (req, res) => {
    try {
      const telegramId = req.query.telegramId as string;
      if (!telegramId) {
        return res.status(400).json({ error: "Telegram ID required" });
      }

      const user = await storage.getUserByTelegramId(telegramId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/user", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existing = await storage.getUserByTelegramId(userData.telegramId);
      if (existing) {
        return res.json(existing);
      }

      const user = await storage.createUser(userData);
      res.status(201).json(user);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Quiz routes
  app.get("/api/quizzes", async (req, res) => {
    try {
      const userId = req.query.userId as string;
      console.log('📋 [API] Fetching quizzes for userId:', userId);
      
      if (!userId) {
        console.log('❌ [API] User ID missing in request');
        return res.status(400).json({ error: "User ID required" });
      }

      // Check if MongoDB is connected and if we are using mongoStorage
      console.log('🔍 [API] Using storage:', storage.constructor.name);

      const quizzes = await storage.getQuizzesByUserId(userId);
      console.log(`✅ [API] Found ${quizzes.length} quizzes for user ${userId}`);
      
      // Add question count to each quiz
      const quizzesWithCounts = await Promise.all(
        quizzes.map(async (quiz) => {
          const questions = await storage.getQuestionsByQuizId(quiz.id);
          return { ...quiz, questionCount: questions.length };
        })
      );

      res.json(quizzesWithCounts);
    } catch (error) {
      console.error('❌ [API] Error fetching quizzes:', error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/quizzes/:id", async (req, res) => {
    try {
      const quiz = await storage.getQuiz(req.params.id);
      if (!quiz) {
        return res.status(404).json({ error: "Quiz not found" });
      }

      const questions = await storage.getQuestionsByQuizId(quiz.id);
      res.json({ ...quiz, questions });
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/quizzes", async (req, res) => {
    try {
      const quizData = insertQuizSchema.parse(req.body);
      const quiz = await storage.createQuiz(quizData);
      res.status(201).json(quiz);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.put("/api/quizzes/:id", async (req, res) => {
    try {
      const quiz = await storage.updateQuiz(req.params.id, req.body);
      if (!quiz) {
        return res.status(404).json({ error: "Quiz not found" });
      }
      res.json(quiz);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.delete("/api/quizzes/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteQuiz(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Quiz not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Question routes
  app.get("/api/quizzes/:quizId/questions", async (req, res) => {
    try {
      const questions = await storage.getQuestionsByQuizId(req.params.quizId);
      res.json(questions);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/quizzes/:quizId/questions", async (req, res) => {
    try {
      const questionData = insertQuestionSchema.parse({
        ...req.body,
        quizId: req.params.quizId,
      });
      const question = await storage.createQuestion(questionData);
      res.status(201).json(question);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Stats endpoint
  app.get("/api/stats", async (req, res) => {
    try {
      const userId = req.query.userId as string;
      console.log('📊 Fetching stats for userId:', userId);
      
      if (!userId) {
        console.log('❌ User ID missing in stats request');
        return res.status(400).json({ error: "User ID required" });
      }

      const quizzes = await storage.getQuizzesByUserId(userId);
      const totalQuizzes = quizzes.length;
      const freeQuizzes = quizzes.filter(q => !q.isPaid).length;
      const paidQuizzes = quizzes.filter(q => q.isPaid).length;
      const engagement = quizzes.reduce((sum, q) => sum + (q.participants || 0), 0);

      console.log(`✅ Stats for user ${userId}: ${totalQuizzes} total, ${freeQuizzes} free, ${paidQuizzes} paid`);
      
      res.json({
        totalQuizzes,
        freeQuizzes,
        paidQuizzes,
        engagement,
      });
    } catch (error) {
      console.error('❌ Error fetching stats:', error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // File upload endpoint for .txt quiz creation
  app.post("/api/quizzes/upload", upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const userId = req.body.userId;
      const title = req.body.title || 'Imported Quiz';
      const isPaid = req.body.isPaid === 'true';
      const price = parseInt(req.body.price || '0');
      const timer = parseInt(req.body.timer || '30');
      const negativeMarking = parseFloat(req.body.negativeMarking || '0');

      if (!userId) {
        return res.status(400).json({ error: "User ID required" });
      }

      // Parse the .txt file content
      const content = req.file.buffer.toString('utf-8');
      const questions = parseTxtQuiz(content);

      if (questions.length === 0) {
        return res.status(400).json({ error: "No valid questions found in file" });
      }

      // Create the quiz
      const quiz = await storage.createQuiz({
        userId,
        title,
        description: `Imported quiz with ${questions.length} questions`,
        isPaid,
        price,
        timer,
        negativeMarking,
      });

      // Add questions to the quiz
      for (let i = 0; i < questions.length; i++) {
        await storage.createQuestion({
          quizId: quiz.id,
          question: questions[i].question,
          options: questions[i].options,
          correctAnswer: questions[i].correctAnswer,
          order: i,
        });
      }

      res.status(201).json({ quiz, questionCount: questions.length });
    } catch (error: any) {
      console.error('File upload error:', error);
      res.status(500).json({ error: error.message || "Failed to process quiz file" });
    }
  });

  // Quiz attempt endpoints
  app.post("/api/quiz-attempts", async (req, res) => {
    try {
      const attemptData = z.object({
        userId: z.string(),
        quizId: z.string(),
        quizTitle: z.string(),
        score: z.number(),
        totalQuestions: z.number(),
        correctAnswers: z.number(),
        incorrectAnswers: z.number(),
        scorePercentage: z.number(),
        timeTaken: z.number().optional(),
        answers: z.array(z.any()).optional(),
        negativeMarking: z.number().optional(),
      }).parse(req.body);

      await mongoStorage.saveQuizAttempt(attemptData);
      res.status(201).json({ success: true, message: "Quiz attempt saved" });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error('Quiz attempt error:', error);
      res.status(500).json({ error: "Failed to save quiz attempt" });
    }
  });

  app.get("/api/quiz-attempts/:userId", async (req, res) => {
    try {
      const history = await mongoStorage.getUserQuizHistory(req.params.userId);
      res.json(history);
    } catch (error) {
      console.error('Get quiz history error:', error);
      res.status(500).json({ error: "Failed to retrieve quiz history" });
    }
  });

  // Premium user check
  app.get("/api/premium/:userId", async (req, res) => {
    try {
      const isPremium = await mongoStorage.isPremiumUser(req.params.userId);
      res.json({ isPremium });
    } catch (error) {
      console.error('Premium check error:', error);
      res.status(500).json({ error: "Failed to check premium status" });
    }
  });

  // Get user profile
  app.get("/api/user-profile/:userId", async (req, res) => {
    try {
      const profile = await mongoStorage.getUserProfile(req.params.userId);
      if (!profile) {
        return res.status(404).json({ error: "Profile not found" });
      }
      res.json(profile);
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({ error: "Failed to get user profile" });
    }
  });

  // Telegram bot webhook endpoint
  app.post("/webhook/telegram", async (req, res) => {
    try {
      const update = req.body;
      console.log('📨 Received Telegram webhook:', JSON.stringify(update, null, 2));

      // Process the webhook update
      // This allows the Python bot to sync with the web app
      if (update.message) {
        const message = update.message;
        const userId = message.from?.id;
        
        if (userId) {
          // Auto-create/update user profile when bot interaction detected
          await storage.createUser({
            telegramId: userId.toString(),
            username: message.from.username,
            firstName: message.from.first_name,
            lastName: message.from.last_name,
          });
        }
      }

      res.status(200).json({ ok: true });
    } catch (error) {
      console.error('Webhook error:', error);
      res.status(500).json({ error: "Webhook processing failed" });
    }
  });

  // Health check
  app.get("/health", (req, res) => {
    res.json({ status: "ok" });
  });

  const httpServer = createServer(app);

  return httpServer;
}

// Helper function to parse .txt quiz files
// Supports both English and Hindi formats
// Examples:
// Format 1: महाराणा प्रताप कहा के राजा थे? (no number)
//           (a) उदयपुर
//           (b) चित्तौड़ ✅
// Format 2: 1. What is JavaScript?
//           A) A programming language *
//           B) A database
function parseTxtQuiz(content: string): Array<{
  question: string;
  options: string[];
  correctAnswer: number;
}> {
  const questions: Array<{ question: string; options: string[]; correctAnswer: number }> = [];
  const lines = content.split('\n').map(line => line.trim()).filter(line => line.length > 0);

  let currentQuestion: { question: string; options: string[]; correctAnswer: number } | null = null;
  let optionIndex = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Check if line is an option (starts with A., B., C., D., or (a), (b), (c), (d), or a), b), c), d))
    const optionMatch = line.match(/^[\(\[]?[A-Da-d][\)\.\]]\s*/);
    
    if (optionMatch) {
      if (currentQuestion) {
        const optionText = line.replace(/^[\(\[]?[A-Da-d][\)\.\]]\s*/, '').trim();
        
        // Check if this is the correct answer (marked with * or ✅ emoji)
        const isCorrect = optionText.includes('*') || 
                         optionText.includes('✅') || 
                         optionText.includes('(correct)') || 
                         optionText.toLowerCase().includes('(answer)');
        
        if (isCorrect) {
          currentQuestion.correctAnswer = optionIndex;
        }

        // Clean up the option text - remove markers
        const cleanOption = optionText
          .replace(/\*+/g, '')
          .replace(/✅/g, '')
          .replace(/\(correct\)/gi, '')
          .replace(/\(answer\)/gi, '')
          .trim();

        currentQuestion.options.push(cleanOption);
        optionIndex++;
      }
    }
    // Check for answer indicator on separate line
    else if (line.match(/^(Answer|Correct|Ans):/i) && currentQuestion) {
      const answerMatch = line.match(/[A-Da-d]/);
      if (answerMatch) {
        const answerLetter = answerMatch[0].toUpperCase();
        currentQuestion.correctAnswer = answerLetter.charCodeAt(0) - 'A'.charCodeAt(0);
      }
    }
    // If not an option and not an answer line, treat it as a question
    // This handles questions with or without numbers (supports Hindi and English)
    else {
      // Save previous question if exists
      if (currentQuestion && currentQuestion.options.length > 0) {
        questions.push(currentQuestion);
      }

      // Start new question - remove optional question number prefix
      const questionText = line.replace(/^(Q\.|Question|[0-9]+\.|\*)\s*/i, '').trim();
      
      // Only create new question if the text is substantial (not just a number or marker)
      if (questionText.length > 0) {
        currentQuestion = {
          question: questionText,
          options: [],
          correctAnswer: 0,
        };
        optionIndex = 0;
      }
    }
  }

  // Add the last question
  if (currentQuestion && currentQuestion.options.length > 0) {
    questions.push(currentQuestion);
  }

  return questions;
}
