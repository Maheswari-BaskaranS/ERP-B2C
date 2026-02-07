import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { useLazyQuery } from '@apollo/client';
import { FORGOT_PASSWORD_MUTATION } from '@/graphql/LoginQueries';

const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const [userName, setuserName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [forgotPassword] = useLazyQuery(FORGOT_PASSWORD_MUTATION);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!userName) return;
    setIsLoading(true);
    try {
      const res: any = await forgotPassword({ variables: { userName } });
      const result = res?.data?.b2cCustomerForgotPassword || res?.data?.forgotPassword;
      if (result?.isSuccess) {
        toast({ title: 'Success', description: 'Password sent! Check your email.' });
        setTimeout(() => navigate('/login'), 1500);
      } else {
        toast({ title: 'Error', description: result?.errorMessage || 'Something went wrong' });
      }
    } catch (err: any) {
      console.error(err);
      toast({ title: 'Error', description: err?.message || 'Unexpected error' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader>
            <CardTitle>Forgot Password</CardTitle>
            <CardDescription>Enter your User Name to receive a reset email.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="forgot-userName">User Name</Label>
                <Input id="forgot-userName" value={userName} onChange={(e) => setuserName((e.target as HTMLInputElement).value)} placeholder="userName" />
              </div>

              <Button type="submit" className="w-full" disabled={!userName || isLoading}>
                {isLoading ? 'Sending...' : 'Submit'}
              </Button>

              <div className="text-center">
                <Link to="/auth" className="text-sm text-primary hover:underline">Back to login</Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ForgotPassword;