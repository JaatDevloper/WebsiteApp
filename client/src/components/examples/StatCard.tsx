import StatCard from '../StatCard';
import { Layers } from 'lucide-react';

export default function StatCardExample() {
  return (
    <div className="p-4 bg-background">
      <StatCard 
        title="Total Quizzes" 
        value={24} 
        icon={Layers}
        iconColor="bg-primary"
      />
    </div>
  );
}
