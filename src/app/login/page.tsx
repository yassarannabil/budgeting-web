
"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, Lock, Chrome } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoadingEmail, setIsLoadingEmail] = useState(false);
  const [isLoadingGoogle, setIsLoadingGoogle] = useState(false);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoadingEmail(true);
    // TODO: Implement Firebase email login logic
    console.log('Attempting email login with:', { email, password });
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    console.log('Email login placeholder complete.');
    setIsLoadingEmail(false);
    // On success, redirect or update state
  };

  const handleGoogleLogin = async () => {
    setIsLoadingGoogle(true);
    // TODO: Implement Firebase Google Sign-In logic
    console.log('Attempting Google login...');
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    console.log('Google login placeholder complete.');
    setIsLoadingGoogle(false);
    // On success, redirect or update state
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-var(--header-height,0px))] bg-background p-4 py-12 sm:py-16 md:py-20"> {/* Adjusted min-h for potential header */}
      <Card className="w-full max-w-md shadow-xl rounded-lg">
        <CardHeader className="text-center space-y-2 pt-8">
          <CardTitle className="text-3xl font-bold tracking-tight text-primary">
            Selamat Datang!
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Masuk untuk melanjutkan ke SpendWise.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 px-6 sm:px-8 pt-6 pb-8">
          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="font-medium">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="nama@contoh.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pl-10 h-11 text-base"
                  disabled={isLoadingEmail || isLoadingGoogle}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Kata Sandi</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pl-10 h-11 text-base"
                  disabled={isLoadingEmail || isLoadingGoogle}
                />
              </div>
              <div className="text-right">
                <Link href="/forgot-password" legacyBehavior>
                  <a className="text-sm text-primary hover:underline">
                    Lupa kata sandi?
                  </a>
                </Link>
              </div>
            </div>
            <Button 
              type="submit" 
              className="w-full h-11 text-base font-semibold bg-primary hover:bg-primary/90 text-primary-foreground"
              disabled={isLoadingEmail || isLoadingGoogle}
            >
              {isLoadingEmail ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Memproses...
                </>
              ) : (
                'Masuk dengan Email'
              )}
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">
                Atau
              </span>
            </div>
          </div>

          <Button 
            variant="outline" 
            className="w-full h-11 text-base font-semibold border-input hover:bg-accent hover:text-accent-foreground" 
            onClick={handleGoogleLogin}
            disabled={isLoadingEmail || isLoadingGoogle}
          >
            {isLoadingGoogle ? (
               <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Memproses...
                </>
            ) : (
              <>
                <Chrome className="mr-2 h-5 w-5" />
                Masuk dengan Google
              </>
            )}
          </Button>
        </CardContent>
        <CardFooter className="justify-center text-sm pb-8">
          <p className="text-muted-foreground">
            Belum punya akun?{' '}
            <Link href="/signup" legacyBehavior>
              <a className="font-medium text-primary hover:underline">
                Daftar di sini
              </a>
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
