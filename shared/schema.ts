import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  telegramId: varchar("telegram_id").notNull().unique(),
  username: text("username"),
  firstName: text("first_name"),
  lastName: text("last_name"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const quizzes = pgTable("quizzes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  isPaid: boolean("is_paid").default(false),
  price: integer("price").default(0),
  participants: integer("participants").default(0),
  timer: integer("timer").default(30),
  negativeMarking: integer("negative_marking").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const questions = pgTable("questions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  quizId: varchar("quiz_id").notNull(),
  question: text("question").notNull(),
  options: text("options").array().notNull(),
  correctAnswer: integer("correct_answer").notNull(),
  order: integer("order").default(0),
});

export const insertUserSchema = createInsertSchema(users).pick({
  telegramId: true,
  username: true,
  firstName: true,
  lastName: true,
});

export const insertQuizSchema = createInsertSchema(quizzes).pick({
  userId: true,
  title: true,
  description: true,
  isPaid: true,
  price: true,
  timer: true,
  negativeMarking: true,
});

export const insertQuestionSchema = createInsertSchema(questions).pick({
  quizId: true,
  question: true,
  options: true,
  correctAnswer: true,
  order: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertQuiz = z.infer<typeof insertQuizSchema>;
export type Quiz = typeof quizzes.$inferSelect;
export type InsertQuestion = z.infer<typeof insertQuestionSchema>;
export type Question = typeof questions.$inferSelect;
