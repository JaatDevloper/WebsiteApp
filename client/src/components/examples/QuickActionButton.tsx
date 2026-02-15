import QuickActionButton from '../QuickActionButton';
import { Play } from 'lucide-react';

export default function QuickActionButtonExample() {
  return (
    <div className="p-4 bg-background">
      <QuickActionButton 
        title="Start New Quiz" 
        icon={Play}
        onClick={() => console.log('Quick action clicked')}
      />
    </div>
  );
}
