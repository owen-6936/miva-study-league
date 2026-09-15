import { useState } from 'react';
import { motion } from 'motion/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { getApiError } from '@/lib/api/client';
import { Button } from '@/components/ui/button';

import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import { useAuth } from '@/lib/api/hooks/useAuth';
import { toast } from 'sonner';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address.'),
  password: z.string().min(6, 'Password must be at least 6 characters.'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [isShake, setIsShake] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  

  const onSubmit = async (data: LoginFormValues) => {
    try {
      if (login) {
        await login(data.email, data.password);
      }
      toast.success('Logged in successfully');
      navigate('/dashboard');
    } catch (error) {
      setIsShake(true);
      setTimeout(() => setIsShake(false), 500);
      toast.error(getApiError(error, 'Login failed. Please check your credentials.'));
    }
  };

  return (
    <div className="min-h-screen flex bg-bg text-text">
      {/* Left side - Animated Gradient */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-zinc-950 items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 z-0"></div>
        <motion.div
          animate={{
            scale: [1, 1.05, 1],
            rotate: [0, 5, -5, 0],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          className="z-10 flex flex-col items-center"
        >
          <img
            src="https://miva-university.s3.eu-west-2.amazonaws.com/wp-content/uploads/2023/05/03200256/Miva-Logo-White-Vertical-1.png"
            alt="MIVA Open University"
            className="h-32 object-contain opacity-80"
          />
          <h2 className="text-3xl font-bold text-white mt-8 tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60">
            Study League
          </h2>
        </motion.div>

        {/* Animated mesh dots */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:24px_24px] z-0"></div>
      </div>

      {/* Right side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 1, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="lg:hidden flex items-center justify-center mb-8">
            <span className="text-2xl font-black text-primary">MIVA Study League</span>
          </div>

          <motion.div
            animate={isShake ? { x: [-10, 10, -10, 10, 0] } : {}}
            transition={{ duration: 0.4 }}
          >
            <Card className="border-border shadow-xl glass bg-bg-card/80 backdrop-blur-xl">
              <CardHeader className="space-y-1 pb-4">
                <CardTitle className="text-3xl font-bold font-heading">Welcome back</CardTitle>
                <CardDescription>Enter your credentials to access your account</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Email</label>
                    <Input
                      placeholder="student@miva.edu.ng"
                      {...form.register('email')}
                      className={
                        form.formState.errors.email
                          ? 'border-red-500 focus-visible:ring-red-500'
                          : ''
                      }
                    />
                    {form.formState.errors.email && (
                      <p className="text-xs text-red-500">{form.formState.errors.email.message}</p>
                    )}
                  </div>

                  <div className="space-y-2 relative">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium">Password</label>
                      <Link
                        to="/forgot-password"
                        className="text-xs text-primary hover:underline font-medium"
                      >
                        Forgot Password?
                      </Link>
                    </div>
                    <div className="relative">
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        {...form.register('password')}
                        className={
                          form.formState.errors.password
                            ? 'border-red-500 focus-visible:ring-red-500'
                            : ''
                        }
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {form.formState.errors.password && (
                      <p className="text-xs text-red-500">
                        {form.formState.errors.password.message}
                      </p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    className="w-full mt-6"
                    disabled={form.formState.isSubmitting}
                  >
                    {form.formState.isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Signing in...
                      </>
                    ) : (
                      'Sign In'
                    )}
                  </Button>
                </form>
              </CardContent>
              <CardFooter className="flex justify-center border-t border-border pt-6">
                <p className="text-sm text-muted-foreground">
                  Don't have an account?{' '}
                  <Link to="/register" className="text-primary font-medium hover:underline">
                    Register
                  </Link>
                </p>
              </CardFooter>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
