import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = (process.env.MONGODB_DB_NAME && process.env.MONGODB_DB_NAME.trim() !== 'quizzes') ? process.env.MONGODB_DB_NAME.trim() : 'quizbot';
const COLLECTION_NAME = 'quizzes';

let isConnected = false;

export async function connectToMongoDB() {
  if (isConnected) {
    console.log('✅ Using existing MongoDB connection');
    return mongoose.connection;
  }

  try {
    const options = {
      dbName: DB_NAME,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 5000,
    };

    if (!MONGODB_URI) {
      throw new Error("MONGODB_URI is not defined in environment variables");
    }

    await mongoose.connect(MONGODB_URI, options);
    isConnected = true;
    console.log(`✅ MongoDB connected successfully to database: ${DB_NAME}`);
    return mongoose.connection;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    throw error;
  }
}

mongoose.connection.on('disconnected', () => {
  isConnected = false;
  console.log('⚠️ MongoDB disconnected');
});

mongoose.connection.on('error', (error) => {
  console.error('❌ MongoDB connection error:', error);
});

// User Profile Schema (matches Python bot's user_profiles collection)
const userProfileSchema = new mongoose.Schema({
  user_id: { type: Number, required: true, unique: true },
  username: String,
  first_name: String,
  last_name: String,
  quizzes_taken: [{
    quiz_id: String,
    quiz_title: String,
    score: Number,
    total_questions: Number,
    correct_answers: Number,
    incorrect_answers: Number,
    score_percentage: Number,
    taken_at: Date,
  }],
  total_quizzes: { type: Number, default: 0 },
  total_questions_answered: { type: Number, default: 0 },
  total_correct_answers: { type: Number, default: 0 },
  total_incorrect_answers: { type: Number, default: 0 },
  avg_score_percentage: { type: Number, default: 0 },
  categories: { type: Map, of: Object },
  achievements: [String],
  streak: {
    current: { type: Number, default: 0 },
    best: { type: Number, default: 0 },
    last_quiz_date: Date,
  },
  is_premium: { type: Boolean, default: false },
  created_at: { type: Date, default: Date.now },
  last_updated: { type: Date, default: Date.now },
}, { collection: 'user_profiles' });

// Quiz Schema (matches Python bot's quizzes collection)
const quizSchema = new mongoose.Schema({
  quiz_id: { type: String, required: true, unique: true },
  creator_id: { type: mongoose.Schema.Types.Mixed, required: true },
  title: { type: String, required: true },
  description: String,
  is_paid: { type: Boolean, default: false },
  price: { type: Number, default: 0 },
  timer: { type: Number, default: 30 },
  negative_marking: { type: Number, default: 0 },
  category: String,
  difficulty: String,
  questions: [{
    question: { type: String, required: true },
    options: [String],
    answer: { type: Number, required: true },
    explanation: String,
    reference: String,
    timestamp: String,
    category: String,
    quiz_name: String,
    quiz_id: String,
    creator_id: String,
    creator: String,
    timer: Number
  }],
  participants: { type: Number, default: 0 },
  total_attempts: { type: Number, default: 0 },
  avg_score: { type: Number, default: 0 },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
  timestamp: String,
}, { collection: 'quizzes', strict: false });

// Premium Users Schema
const premiumUserSchema = new mongoose.Schema({
  user_id: { type: Number, required: true, unique: true },
  premium_since: { type: Date, default: Date.now },
}, { collection: 'premium_users' });

// Verified Users Schema
const verifiedUserSchema = new mongoose.Schema({
  user_id: { type: Number, required: true, unique: true },
  registered_at: { type: Date, default: Date.now },
}, { collection: 'verified_users' });

// Quiz Attempts Schema (for tracking individual attempts)
const quizAttemptSchema = new mongoose.Schema({
  user_id: { type: Number, required: true },
  quiz_id: { type: String, required: true },
  quiz_title: String,
  score: Number,
  total_questions: Number,
  correct_answers: Number,
  incorrect_answers: Number,
  score_percentage: Number,
  time_taken: Number,
  answers: [{
    question_index: Number,
    user_answer: Number,
    correct_answer: Number,
    is_correct: Boolean,
  }],
  completed_at: { type: Date, default: Date.now },
}, { collection: 'quiz_attempts' });

// Export models
export const UserProfile = mongoose.model('UserProfile', userProfileSchema);
export const Quiz = mongoose.model('Quiz', quizSchema);
export const PremiumUser = mongoose.model('PremiumUser', premiumUserSchema);
export const VerifiedUser = mongoose.model('VerifiedUser', verifiedUserSchema);
export const QuizAttempt = mongoose.model('QuizAttempt', quizAttemptSchema);
