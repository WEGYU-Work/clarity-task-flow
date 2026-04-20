import { useState, memo } from 'react';
import { Plus } from 'lucide-react';
import { Input } from './ui/input';
import { motion } from 'framer-motion';

interface TaskFormProps {
  onAdd: (title: string) => void;
}

export const TaskForm = memo(function TaskForm({ onAdd }: TaskFormProps) {
  const [title, setTitle] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onAdd(title.trim());
    setTitle('');
  };

  return (
    <form onSubmit={handleSubmit} className="relative">
      <Input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Add a new task..."
        className="w-full h-14 pl-5 pr-14 text-lg bg-neutral-50 dark:bg-neutral-800/50 border-none shadow-inner rounded-2xl focus-visible:ring-2 focus-visible:ring-primary/20"
      />
      <div className="absolute right-2 top-2">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          type="submit"
          className="h-10 w-10 flex items-center justify-center bg-primary text-primary-foreground rounded-xl shadow-lg shadow-primary/20"
        >
          <Plus className="w-6 h-6" />
        </motion.button>
      </div>
    </form>
  );
});