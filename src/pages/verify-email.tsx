import { useState } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Loader2, ArrowRight, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAuthStore } from '@/lib/stores/auth-store';
import { apiClient } from '@/lib/api/client';
import { toast } from 'sonner';

export function VerifyEmail() {
  const [code, setCode] = useState('');
  const [isCodeRequested, setIsCodeRequested] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [isShake, setIsShake] = useState(false);

  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const navigate = useNavigate();

  const handleSendCode = async () => {
    setIsResending(true);
    try {
      await apiClient.post('/auth/request-email-verification-code');
      setIsCodeRequested(true);
      toast.success('Verification code sent to your email');
    } catch {
      toast.error('Failed to send verification code');
    } finally {
      setIsResending(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length < 6) {
      toast.error('Please enter the 6-digit code');
      return;
    }

    setIsSubmitting(true);
    try {
      await apiClient.post('/auth/verify-email', { code });

      if (user) {
        setUser({ ...user, verified: true });
      }

      toast.success('Email verified successfully!');
      navigate('/dashboard');
    } catch {
      setIsShake(true);
      setTimeout(() => setIsShake(false), 500);
      toast.error('Invalid verification code');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-bg text-text relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[100px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/20 rounded-full blur-[100px]" />

      <motion.div
        initial={{ opacity: 1, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md z-10"
      >
        <motion.div
          animate={isShake ? { x: [-10, 10, -10, 10, 0] } : {}}
          transition={{ duration: 0.4 }}
        >
          <Card className="border-border shadow-2xl glass bg-bg-card/80 backdrop-blur-xl min-h-[400px] flex flex-col justify-center">
            <AnimatePresence mode="wait">
              {!isCodeRequested ? (
                <motion.div
                  key="request-view"
                  initial={{ opacity: 1, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="w-full"
                >
                  <CardHeader className="text-center space-y-4 pb-6">
                    <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-2">
                      <Mail size={32} />
                    </div>
                    <CardTitle className="text-3xl font-bold font-heading">
                      Verify your email
                    </CardTitle>
                    <CardDescription className="text-base px-4">
                      To keep the league secure, we need to verify your school email address.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col items-center">
                    <div className="w-full p-4 bg-secondary/30 rounded-lg border border-border mb-6 text-center">
                      <span className="font-semibold text-foreground">
                        {user?.email || 'your email'}
                      </span>
                    </div>
                    <Button
                      onClick={handleSendCode}
                      className="w-full h-12 text-lg"
                      disabled={isResending}
                    >
                      {isResending ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Sending...
                        </>
                      ) : (
                        <>
                          Send Code <Send className="ml-2 w-4 h-4" />
                        </>
                      )}
                    </Button>
                  </CardContent>
                </motion.div>
              ) : (
                <motion.div
                  key="verify-view"
                  initial={{ opacity: 1, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="w-full"
                >
                  <CardHeader className="text-center space-y-4 pb-6">
                    <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-2">
                      <Mail size={32} />
                    </div>
                    <CardTitle className="text-3xl font-bold font-heading">
                      Check your inbox
                    </CardTitle>
                    <CardDescription className="text-base">
                      We sent a 6-digit verification code to <br />
                      <span className="font-semibold text-foreground">
                        {user?.email || 'your email'}
                      </span>
                    </CardDescription>
                    <div className="mt-2 text-sm text-amber-500/90 bg-amber-500/10 px-3 py-2 rounded-md inline-block">
                      ⚠️ Don't see it? Please check your <strong>spam</strong> or junk folder.
                    </div>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleVerify} className="space-y-6">
                      <div className="space-y-2">
                        <Input
                          type="text"
                          placeholder="Enter 6-digit code"
                          value={code}
                          onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                          className="text-center text-2xl tracking-[0.5em] font-mono py-6"
                          maxLength={6}
                        />
                      </div>

                      <Button
                        type="submit"
                        className="w-full h-12 text-lg"
                        disabled={isSubmitting || code.length < 6}
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Verifying...
                          </>
                        ) : (
                          <>
                            Verify Email <ArrowRight className="ml-2 w-5 h-5" />
                          </>
                        )}
                      </Button>
                    </form>

                    <div className="mt-8 text-center">
                      <p className="text-sm text-muted-foreground mb-2">Didn't receive the code?</p>
                      <Button
                        variant="outline"
                        onClick={handleSendCode}
                        disabled={isResending}
                        className="w-full"
                      >
                        {isResending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Resend Code
                      </Button>
                    </div>
                  </CardContent>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}
