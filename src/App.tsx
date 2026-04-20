import { useTasks, Task } from './hooks/useTasks';
import { useAuth } from './hooks/useAuth';
import { TaskCard } from './components/TaskCard';
import { TaskForm } from './components/TaskForm';
import { AuthForm } from './components/AuthForm';
import { Toaster } from './components/ui/sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutList, Server, WifiOff, Loader2, Search, ArrowUpDown, ChevronLeft, ChevronRight, LogOut, User } from 'lucide-react';
import { Badge } from './components/ui/badge';
import { Skeleton } from './components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from './components/ui/alert';
import { Input } from './components/ui/input';
import { Button } from './components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/select';
import { useDeferredValue, Suspense, lazy, memo } from 'react';

// Lazy load non-critical components
const LazyAuthForm = lazy(() => import('./components/AuthForm').then(module => ({ default: module.AuthForm })));
const LazyTaskForm = lazy(() => import('./components/TaskForm').then(module => ({ default: module.TaskForm })));

// Memoized Task List for performance
const TaskList = memo(({ 
  tasks, 
  onToggle, 
  onDelete, 
  loading, 
  search 
}: { 
  tasks: Task[], 
  onToggle: (id: string, status: 'pending' | 'completed') => void, 
  onDelete: (id: string) => void, 
  loading: boolean, 
  search: string 
}) => {
  if (loading && tasks.length === 0) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <Skeleton key={i} className="h-20 w-full rounded-2xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-12">
      <AnimatePresence mode="popLayout">
        {tasks.length > 0 ? (
          <div className="grid gap-3">
            {tasks.map(task => (
              <TaskCard 
                key={task.id} 
                task={task} 
                onToggle={onToggle} 
                onDelete={onDelete} 
              />
            ))}
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20 px-6 bg-white dark:bg-neutral-900/50 rounded-3xl border border-dashed border-neutral-200 dark:border-neutral-800 shadow-sm"
          >
            <div className="w-16 h-16 bg-neutral-100 dark:bg-neutral-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-neutral-300" />
            </div>
            <h3 className="text-xl font-bold mb-2">No tasks found</h3>
            <p className="text-neutral-500 max-w-xs mx-auto">
              {search ? `No results for "${search}". Try a different query.` : "Your schedule is clear!"}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

TaskList.displayName = 'TaskList';

function App() {
  const { user, token, loading: authLoading, login, signup, logout } = useAuth();
  
  const { 
    tasks, 
    loading: tasksLoading, 
    isUsingMock, 
    addTask, 
    updateTaskStatus, 
    deleteTask,
    search,
    setSearch,
    page,
    setPage,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    totalPages
  } = useTasks(token);

  // Use deferred value for search to keep UI responsive while typing
  const deferredSearch = useDeferredValue(search);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-950">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-50">
      {/* Background patterns */}
      <div className="fixed inset-0 pointer-events-none opacity-20 dark:opacity-10 overflow-hidden">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-blue-500/20 blur-[120px] rounded-full" />
      </div>

      <div className="relative max-w-3xl mx-auto px-6 py-12 md:py-20 flex flex-col min-h-screen">
        <header className="mb-12 flex items-center justify-between">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-4"
          >
            <div className="w-12 h-12 bg-primary text-primary-foreground rounded-2xl flex items-center justify-center shadow-2xl shadow-primary/30 rotate-3">
              <LayoutList className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight">FocusFlow</h1>
              <p className="text-neutral-500 font-medium">Simplify your workflow</p>
            </div>
          </motion.div>

          <div className="flex gap-2">
            {user ? (
              <div className="flex items-center gap-4">
                <Badge variant="secondary" className="hidden sm:flex h-8 gap-1.5 px-3 bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400">
                  <User className="w-3.5 h-3.5" />
                  {user.email}
                </Badge>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-10 w-10 rounded-xl hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/20"
                  onClick={logout}
                >
                  <LogOut className="w-5 h-5" />
                </Button>
              </div>
            ) : (
              isUsingMock ? (
                <Badge variant="outline" className="h-8 gap-1.5 px-3 bg-amber-500/10 text-amber-600 border-amber-500/20">
                  <WifiOff className="w-3.5 h-3.5" />
                  Local Mode
                </Badge>
              ) : (
                <Badge variant="outline" className="h-8 gap-1.5 px-3 bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                  <Server className="w-3.5 h-3.5" />
                  API Connected
                </Badge>
              )
            )}
          </div>
        </header>

        <AnimatePresence mode="wait">
          {!user ? (
            <motion.div
              key="auth"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Suspense fallback={<Skeleton className="h-[400px] w-full rounded-3xl" />}>
                <LazyAuthForm onLogin={login} onSignup={signup} />
              </Suspense>
            </motion.div>
          ) : (
            <motion.div
              key="tasks"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col flex-1"
            >
              {isUsingMock && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-8"
                >
                  <Alert className="bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/50">
                    <WifiOff className="h-4 w-4 text-amber-600" />
                    <AlertTitle className="text-amber-800 dark:text-amber-400 font-bold">Backend Offline</AlertTitle>
                    <AlertDescription className="text-amber-700 dark:text-amber-500/80">
                      The PostgreSQL server is not connected or unauthorized. Check your token and server logs.
                    </AlertDescription>
                  </Alert>
                </motion.div>
              )}

              <section className="mb-8">
                <Suspense fallback={<Skeleton className="h-14 w-full rounded-2xl" />}>
                  <LazyTaskForm onAdd={addTask} />
                </Suspense>
              </section>

              {/* Search and Sort Controls */}
              <section className="mb-8 flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <Input 
                    placeholder="Search tasks..." 
                    className="pl-10 rounded-xl"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto">
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-[140px] rounded-xl">
                      <ArrowUpDown className="w-3.5 h-3.5 mr-2" />
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="created_at">Created At</SelectItem>
                      <SelectItem value="title">Title</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="rounded-xl"
                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  >
                    <span className="text-xs font-bold">{sortOrder.toUpperCase()}</span>
                  </Button>
                </div>
              </section>

              <main className="flex-1 space-y-10">
                <TaskList 
                  tasks={tasks} 
                  onToggle={updateTaskStatus} 
                  onDelete={deleteTask} 
                  loading={tasksLoading} 
                  search={deferredSearch} 
                />

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-4 pt-4">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="rounded-xl gap-2"
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      <ChevronLeft className="w-4 h-4" /> Previous
                    </Button>
                    <span className="text-sm font-bold">
                      Page {page} of {totalPages}
                    </span>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="rounded-xl gap-2"
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                    >
                      Next <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </main>
            </motion.div>
          )}
        </AnimatePresence>

        <footer className="mt-20 pt-8 border-t border-neutral-200 dark:border-neutral-800 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-neutral-500 font-medium">
          <p>\u00a9 2024 FocusFlow Task Manager</p>
          <div className="flex items-center gap-6">
            <span className="hover:text-primary transition-colors cursor-pointer">MVC Docs</span>
            <span className="hover:text-primary transition-colors cursor-pointer">PostgreSQL</span>
            <span className="hover:text-primary transition-colors cursor-pointer">Support</span>
          </div>
        </footer>
      </div>
      <Toaster position="top-center" richColors />
    </div>
  );
}

export default App;