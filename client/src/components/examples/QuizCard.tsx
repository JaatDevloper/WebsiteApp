import QuizCard from '../QuizCard';

export default function QuizCardExample() {
  const mockQuiz = {
    id: '1',
    userId: 'user1',
    title: 'JavaScript Fundamentals',
    description: 'Test your knowledge of JavaScript basics',
    isPaid: false,
    price: 0,
    participants: 45,
    questionCount: 10,
    createdAt: new Date(),
  };

  return (
    <div className="p-4 bg-background">
      <QuizCard 
        quiz={mockQuiz}
        onEdit={() => console.log('Edit quiz')}
        onDelete={() => console.log('Delete quiz')}
      />
    </div>
  );
}
