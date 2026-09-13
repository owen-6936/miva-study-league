import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router';
import { Loader2, ArrowLeft, MailCheck } from 'lucide-react';
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

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address.'),
});

type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

export function ForgotPassword() {
  const [isSuccess, setIsSuccess] = useState(false);
  const { forgotPassword } = useAuth();

  const form = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = async (data: ForgotPasswordValues) => {
    try {
      if (forgotPassword) {
        await forgotPassword(data.email);
      }
      setIsSuccess(true);
    } catch {
      toast.error('Something went wrong. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg text-text p-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-secondary/5 rounded-full blur-3xl"></div>
      </div>

      <motion.div
        initial={{ opacity: 1, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Card className="border-border shadow-2xl glass bg-bg-card/80 backdrop-blur-xl overflow-hidden">
          <AnimatePresence mode="wait">
            {!isSuccess ? (
              <motion.div
                key="form"
                initial={{ opacity: 1, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <CardHeader className="space-y-1 pb-6 text-center">
                  <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                    <Loader2 className="w-6 h-6 text-primary" />{' '}
                    {/* Note: A lock or key icon might be better here, but Loader2 works as generic or we can use another from lucide */}
                  </div>
                  <CardTitle className="text-2xl font-bold font-heading">
                    Forgot Password?
                  </CardTitle>
                  <CardDescription>No worries, we'll send you reset instructions.</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Email Address</label>
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
                        <p className="text-xs text-red-500">
                          {form.formState.errors.email.message}
                        </p>
                      )}
                    </div>

                    <Button
                      type="submit"
                      className="w-full mt-4"
                      disabled={form.formState.isSubmitting}
                    >
                      {form.formState.isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending...
                        </>
                      ) : (
                        'Reset Password'
                      )}
                    </Button>
                  </form>
                </CardContent>
                <CardFooter className="flex justify-center border-t border-border pt-6">
                  <Link
                    to="/login"
                    className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors font-medium"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to log in
                  </Link>
                </CardFooter>
              </motion.div>
            ) : (
              <motion.div
                key="success"
                initial={{ opacity: 1, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center p-8 text-center"
              >
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                  <MailCheck className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-2xl font-bold mb-2 font-heading">Check your email</h3>
                <p className="text-muted-foreground mb-8">
                  If this email is registered, you'll receive a reset link shortly.
                </p>
                <Button variant="outline" className="w-full">
                  <Link to="/login">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to log in
                  </Link>
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </motion.div>
    </div>
  );
}
