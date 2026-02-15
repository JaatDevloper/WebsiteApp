# Premium Quiz Bot - Telegram Mini App

A beautiful, modern Telegram Mini App for creating and managing quizzes with your existing Premium Quiz Bot.

![Dashboard](attached_assets/IMG_20251102_222843_265_1762197082889.jpg)

## Features

✨ **Dashboard**
- Beautiful gradient header with user welcome
- Real-time statistics (Total Quizzes, Free Quizzes, Paid Quizzes, Engagement)
- Quick actions for common tasks

📝 **Quiz Creation**
- Easy-to-use quiz builder
- Multiple choice questions with 4 options
- Free or paid quiz options
- Question reordering and management

📚 **Quiz Management**
- View all your quizzes
- Filter by type (All, Free, Paid)
- Search functionality
- Edit and delete quizzes

🎨 **Modern Design**
- iOS-inspired interface
- Smooth animations and transitions
- Dark mode support
- Haptic feedback
- Responsive design optimized for mobile

## Tech Stack

### Frontend
- React 18 with TypeScript
- Tailwind CSS for styling
- Shadcn UI components
- Wouter for routing
- TanStack Query for data fetching
- Telegram WebApp SDK

### Backend
- Node.js with Express
- TypeScript
- In-memory storage (expandable to PostgreSQL)
- Drizzle ORM
- Session management

## Quick Start

### Prerequisites
- Node.js 20 or higher
- npm or yarn
- Telegram Bot Token

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd premium-quiz-bot
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file:
```bash
cp .env.example .env
```

4. Add your environment variables:
```env
TELEGRAM_BOT_TOKEN=your_bot_token_here
TELEGRAM_BOT_USERNAME=your_bot_username
SESSION_SECRET=your_random_secret_here
```

5. Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5000`

## Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions for Koyeb.

### Quick Deploy to Koyeb

1. Push your code to GitHub
2. Connect your GitHub repository to Koyeb
3. Set environment variables in Koyeb dashboard
4. Deploy!

## Project Structure

```
├── client/              # Frontend React app
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── pages/       # Page components
│   │   ├── lib/         # Utilities and helpers
│   │   └── App.tsx      # Main app component
├── server/              # Backend Express app
│   ├── routes.ts        # API routes
│   ├── storage.ts       # Data storage layer
│   └── index.ts         # Server entry point
├── shared/              # Shared types and schemas
│   └── schema.ts        # Database schemas
├── Dockerfile           # Docker configuration
└── package.json         # Dependencies and scripts
```

## API Endpoints

### User Management
- `GET /api/user` - Get current user
- `POST /api/user` - Create user

### Quiz Management
- `GET /api/quizzes` - Get all quizzes
- `GET /api/quizzes/:id` - Get quiz by ID
- `POST /api/quizzes` - Create new quiz
- `PUT /api/quizzes/:id` - Update quiz
- `DELETE /api/quizzes/:id` - Delete quiz

### Question Management
- `GET /api/quizzes/:quizId/questions` - Get quiz questions
- `POST /api/quizzes/:quizId/questions` - Add question

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `TELEGRAM_BOT_TOKEN` | Your Telegram bot token | Yes |
| `TELEGRAM_BOT_USERNAME` | Your bot's username | Yes |
| `SESSION_SECRET` | Secret for session encryption | Yes |
| `NODE_ENV` | Environment (development/production) | No |
| `PORT` | Server port (default: 5000) | No |

## Development

### Run in Development Mode
```bash
npm run dev
```

### Build for Production
```bash
npm run build
npm start
```

### Type Checking
```bash
npm run check
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - feel free to use this project for your own quiz bot!

## Support

For issues and questions:
- Check the [DEPLOYMENT.md](DEPLOYMENT.md) guide
- Review Telegram Mini Apps documentation
- Open an issue on GitHub

## Screenshots

*Dashboard with statistics and quick actions*

*Quiz creation interface*

*Quiz management with filters*

---

Built with ❤️ for the Telegram community
