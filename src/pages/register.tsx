import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router';
import { Loader2, CheckCircle2 } from 'lucide-react';
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

const registerSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters.'),
  matricNumber: z.string().min(1, 'Matriculation Number is required.'),
  email: z
    .string()
    .email('Please enter a valid email address.')
    .refine((val) => val.endsWith('@miva.edu.ng'), {
      message: 'Must be a valid institutional @miva.edu.ng email.',
    }),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export function Register() {
  const [isSuccess, setIsSuccess] = useState(false);
  const [isShake, setIsShake] = useState(false);
  const { register: registerUser } = useAuth();

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { fullName: '', matricNumber: '', email: '' },
  });

  const onSubmit = async (data: RegisterFormValues) => {
    try {
      if (registerUser) {
        await registerUser({
          email: data.email,
          fullName: data.fullName,
          matricNumber: data.matricNumber,
        });
      }
      setIsSuccess(true);
      toast.success('Registration initiated successfully!');
    } catch {
      setIsShake(true);
      setTimeout(() => setIsShake(false), 500);
      toast.error('Registration failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex bg-bg text-text">
      {/* Left side - Animated Gradient */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-zinc-950 items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-bl from-secondary/20 to-primary/20 z-0"></div>
        <motion.div
          animate={{
            scale: [1, 1.05, 1],
            rotate: [0, -5, 5, 0],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
          className="z-10 flex flex-col items-center"
        >
          <img
            src="https://miva-university.s3.eu-west-2.amazonaws.com/wp-content/uploads/2023/05/03200256/Miva-Logo-White-Vertical-1.png"
            alt="MIVA Open University"
            className="h-32 object-contain opacity-80"
          />
          <h2 className="text-3xl font-bold text-white mt-8 tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white/60 to-white">
            Join the League
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
            <Card className="border-border shadow-xl glass bg-bg-card/80 backdrop-blur-xl overflow-hidden relative">
              <AnimatePresence mode="wait">
                {!isSuccess ? (
                  <motion.div
                    key="form"
                    initial={{ opacity: 1, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                  >
                    <CardHeader className="space-y-1 pb-6">
                      <CardTitle className="text-3xl font-bold font-heading">
                        Create an account
                      </CardTitle>
                      <CardDescription>
                        Enter your details to join the MIVA Study League
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Full Name</label>
                          <Input
                            placeholder="John Doe"
                            {...form.register('fullName')}
                            className={
                              form.formState.errors.fullName
                                ? 'border-red-500 focus-visible:ring-red-500'
                                : ''
                            }
                          />
                          {form.formState.errors.fullName && (
                            <p className="text-xs text-red-500">
                              {form.formState.errors.fullName.message}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium">Matriculation Number</label>
                          <Input
                            placeholder="2026/A/SENG/0036"
                            {...form.register('matricNumber')}
                            className={
                              form.formState.errors.matricNumber
                                ? 'border-red-500 focus-visible:ring-red-500'
                                : ''
                            }
                          />
                          {form.formState.errors.matricNumber && (
                            <p className="text-xs text-red-500">
                              {form.formState.errors.matricNumber.message}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium">School Email</label>
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
                          className="w-full mt-6"
                          disabled={form.formState.isSubmitting}
                        >
                          {form.formState.isSubmitting ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Registering...
                            </>
                          ) : (
                            'Join the League'
                          )}
                        </Button>
                      </form>
                    </CardContent>
                    <CardFooter className="flex justify-center border-t border-border pt-6">
                      <p className="text-sm text-muted-foreground">
                        Already have an account?{' '}
                        <Link to="/login" className="text-primary font-medium hover:underline">
                          Sign In
                        </Link>
                      </p>
                    </CardFooter>
                  </motion.div>
                ) : (
                  <motion.div
                    key="success"
                    initial={{ opacity: 1, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center p-12 text-center"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', delay: 0.2 }}
                      className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-6"
                    >
                      <CheckCircle2 className="w-10 h-10 text-green-600 dark:text-green-400" />
                    </motion.div>
                    <h3 className="text-2xl font-bold mb-2">Registration Started!</h3>
                    <p className="text-muted-foreground mb-8">
                      Check your school email ({form.getValues().email}) for a password setup link
                      to complete your registration.
                    </p>
                    <Button variant="outline">
                      <Link to="/login">Back to Login</Link>
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
