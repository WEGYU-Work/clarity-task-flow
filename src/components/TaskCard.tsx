import { motion } from 'framer-motion';
import { CheckCircle2, Circle, Trash2, Calendar, Database } from 'lucide-react';
import { Task } from '../hooks/useTasks';
import { Button } from './ui/button';
import { format } from 'date-fns';
import { cn } from '../lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { memo } from 'react';

interface TaskCardProps {
  task: Task;
  onToggle: (id: string, status: 'pending' | 'completed') => void;
  onDelete: (id: string) => void;
}

export const TaskCard = memo(function TaskCard({ task, onToggle, onDelete }: TaskCardProps) {
  const isCompleted = task.status === 'completed';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, x: -20 }}
      whileHover={{ y: -2 }}
      className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4 shadow-sm flex items-center gap-4 group hover:shadow-md transition-all"
    >
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => onToggle(task.id, isCompleted ? 'pending' : 'completed')}
              className={cn(
                "flex-shrink-0 transition-transform hover:scale-110 active:scale-95",
                isCompleted ? "text-emerald-500" : "text-neutral-300 dark:text-neutral-700 hover:text-primary"
              )}
            >
              {isCompleted ? (
                <CheckCircle2 className="w-7 h-7" />
              ) : (
                <Circle className="w-7 h-7" />
              )}
            </button>
          </TooltipTrigger>
          <TooltipContent>
            {isCompleted ? 'Mark as pending' : 'Mark as complete'}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <div className="flex-1 min-w-0">
        <h3 className={cn(
          "font-semibold text-lg truncate transition-all",
          isCompleted ? "text-neutral-400 line-through" : "text-neutral-900 dark:text-neutral-100"
        )}>
          {task.title}
        </h3>
        <div className="flex items-center gap-3 text-xs text-neutral-500 dark:text-neutral-400 mt-1">
          <div className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            <span>{format(new Date(task.created_at), 'MMM d')}</span>
          </div>
          <div className="flex items-center gap-1">
            <Database className="w-3.5 h-3.5" />
            <span>Supabase</span>
          </div>
        </div>
      </div>

      <Button
        variant="ghost"
        size="icon"
        onClick={() => onDelete(task.id)}
        className="opacity-0 group-hover:opacity-100 transition-opacity text-neutral-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
      >
        <Trash2 className="w-4 h-4" />
      </Button>
    </motion.div>
  );
});