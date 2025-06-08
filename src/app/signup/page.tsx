
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
import { Mail, Lock, User, Chrome } from 'lucide-react';
import Link from 'next/link';

export default function SignupPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoadingEmail, setIsLoadingEmail] = useState(false);
  const [isLoadingGoogle, setIsLoadingGoogle] = useState(false);

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      // TODO: Show error toast or message
      console.error("Passwords do not match");
      return;
    }
    setIsLoadingEmail(true);
    // TODO: Implement Firebase email sign-up logic
    console.log('Attempting email sign-up with:', { fullName, email, password });
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    console.log('Email sign-up placeholder complete.');
    setIsLoadingEmail(false);
    // On success, redirect or update state
  };

  const handleGoogleSignup = async () => {
    setIsLoadingGoogle(true);
    // TODO: Implement Firebase Google Sign-Up logic
    console.log('Attempting Google sign-up...');
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    console.log('Google sign-up placeholder complete.');
    setIsLoadingGoogle(false);
    // On success, redirect or update state
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4 py-12 sm:py-16 md:py-20">
      <Card className="w-full max-w-md shadow-xl rounded-lg">
        <CardHeader className="text-center space-y-2 pt-8">
          <CardTitle className="text-3xl font-bold tracking-tight text-primary">
            Buat Akun Baru
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Bergabunglah dengan SpendWise untuk mengelola keuangan Anda.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 px-6 sm:px-8 pt-6 pb-8">
          <form onSubmit={handleEmailSignup} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="font-medium">Nama Lengkap</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Nama Anda"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="pl-10 h-11 text-base"
                  disabled={isLoadingEmail || isLoadingGoogle}
                />
              </div>
            </div>
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
                  placeholder="•••••••• (minimal 6 karakter)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="pl-10 h-11 text-base"
                  disabled={isLoadingEmail || isLoadingGoogle}
                />
              </div>
            </div>
             <div className="space-y-2">
              <Label htmlFor="confirmPassword">Konfirmasi Kata Sandi</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Ulangi kata sandi Anda"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="pl-10 h-11 text-base"
                  disabled={isLoadingEmail || isLoadingGoogle}
                />
              </div>
              {password && confirmPassword && password !== confirmPassword && (
                <p className="text-sm text-destructive">Kata sandi tidak cocok.</p>
              )}
            </div>
            <Button
              type="submit"
              className="w-full h-11 text-base font-semibold bg-primary hover:bg-primary/90 text-primary-foreground"
              disabled={isLoadingEmail || isLoadingGoogle || (password !== confirmPassword && !!confirmPassword)}
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
                'Daftar dengan Email'
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
            onClick={handleGoogleSignup}
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
                Daftar dengan Google
              </>
            )}
          </Button>
        </CardContent>
        <CardFooter className="justify-center text-sm pb-8">
          <p className="text-muted-foreground">
            Sudah punya akun?{' '}
            <Link href="/login" legacyBehavior>
              <a className="font-medium text-primary hover:underline">
                Masuk di sini
              </a>
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
