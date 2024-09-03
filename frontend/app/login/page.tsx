"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useLogin } from '@/app/loginContext';

export default function PasswordForm() {
  const [password, setPassword] = useState('');
  const { login, error, isLogin } = useLogin();
  const router = useRouter();

  useEffect(() => {
    if (isLogin) {
      router.push('/');
    }
  }, [isLogin, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(password);
  };

  return (
    <div className="container mx-auto p-4 flex justify-center items-center min-h-screen">
      <Card className="max-w-md w-full">
        <CardHeader className="bg-gray-100 p-4">
          <h2 className="text-xl font-semibold">Enter Your Password</h2>
        </CardHeader>
        <CardContent className="p-4">
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-2"
              />
            </div>
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <Button type="submit" className="w-full mt-4">
              Submit
            </Button>
          </form>
        </CardContent>
        <CardFooter className="bg-gray-50 p-4 text-center">
          <p className="text-gray-600">Please enter the correct password.</p>
        </CardFooter>
      </Card>
    </div>
  );
}
