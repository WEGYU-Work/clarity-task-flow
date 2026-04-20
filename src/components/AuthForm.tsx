import { useState } from 'react';
import { motion } from 'framer-motion';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Mail, Lock, UserPlus, LogIn, Loader2, Info } from 'lucide-react';

interface AuthFormProps {
  onLogin: (email: string, pass: string) => Promise<void>;
  onSignup: (email: string, pass: string) => Promise<void>;
}

const EXAMPLE_CREDENTIALS = {
  email: 'test@example.com',
  password: 'password123'
};

export function AuthForm({ onLogin, onSignup }: AuthFormProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        await onLogin(email, password);
      } else {
        await onSignup(email, password);
      }
    } catch (err) {
      // Error handled in hook/toast
    } finally {
      setLoading(false);
    }
  };

  const handleUseExample = () => {
    setEmail(EXAMPLE_CREDENTIALS.email);
    setPassword(EXAMPLE_CREDENTIALS.password);
    setIsLogin(true);
  };

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full space-y-8 bg-white dark:bg-neutral-900 p-8 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-xl"
      >
        <div className="text-center">
          <motion.div
            initial={{ y: -20 }}
            animate={{ y: 0 }}
            className="mx-auto h-16 w-16 bg-primary text-primary-foreground rounded-2xl flex items-center justify-center mb-6 shadow-lg rotate-6"
          >
            {isLogin ? <LogIn className="w-8 h-8" /> : <UserPlus className="w-8 h-8" />}
          </motion.div>
          <h2 className="text-3xl font-extrabold tracking-tight">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="mt-2 text-neutral-500">
            {isLogin ? 'Enter your credentials to access your flow' : 'Start managing your workflow with FocusFlow'}
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <Input
                  id="email"
                  type="email"
                  required
                  placeholder="name@example.com"
                  className="pl-10 rounded-xl h-12"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <Input
                  id="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  className="pl-10 rounded-xl h-12"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full h-12 rounded-xl text-lg font-bold shadow-lg shadow-primary/20"
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              isLogin ? 'Sign In' : 'Sign Up'
            )}
          </Button>

          <div className="text-center">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm font-medium text-primary hover:underline underline-offset-4"
            >
              {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
            </button>
          </div>
        </form>

        {/* Test Credentials Display */}
        <div className="mt-8 pt-6 border-t border-neutral-100 dark:border-neutral-800">
          <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-800">
            <div className="flex items-center gap-2 mb-3 text-sm font-semibold text-neutral-600 dark:text-neutral-400">
              <Info className="w-4 h-4" />
              <span>Test Account</span>
            </div>
            <div className="space-y-1 mb-4">
              <p className="text-xs text-neutral-500 font-mono">Email: {EXAMPLE_CREDENTIALS.email}</p>
              <p className="text-xs text-neutral-500 font-mono">Password: {EXAMPLE_CREDENTIALS.password}</p>
            </div>
            <Button
              variant="secondary"
              size="sm"
              className="w-full rounded-xl text-xs"
              onClick={handleUseExample}
              type="button"
            >
              Auto-fill Test Credentials
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}