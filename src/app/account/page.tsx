
"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Settings, HelpCircle, LogOut, UserCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function AccountPage() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <UserCircle2 className="h-10 w-10 text-primary" />
            <div>
              <CardTitle className="text-2xl">Akun Saya</CardTitle>
              <CardDescription>Kelola informasi akun dan preferensi Anda.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Placeholder for user info */}
          <div className="p-4 border rounded-lg bg-muted/50">
            <p className="font-medium">Nama Pengguna: John Doe (Contoh)</p>
            <p className="text-sm text-muted-foreground">Email: john.doe@example.com (Contoh)</p>
          </div>

          <Button variant="outline" className="w-full justify-start gap-2">
            <Settings className="h-5 w-5" />
            Pengaturan Aplikasi
          </Button>
          <Button variant="outline" className="w-full justify-start gap-2">
            <HelpCircle className="h-5 w-5" />
            Pusat Bantuan & Dukungan
          </Button>
          <Button variant="destructive" className="w-full justify-start gap-2">
            <LogOut className="h-5 w-5" />
            Keluar
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
            <CardTitle>Tentang SpendWise</CardTitle>
        </CardHeader>
        <CardContent>
            <p className="text-muted-foreground">Versi Aplikasi: 1.0.0</p>
            <p className="text-sm mt-2">SpendWise membantu Anda mengelola keuangan dengan cerdas dan mudah.</p>
            <Link href="/privacy-policy" passHref legacyBehavior><a className="text-sm text-primary hover:underline mt-2 block">Kebijakan Privasi</a></Link>
            <Link href="/terms-of-service" passHref legacyBehavior><a className="text-sm text-primary hover:underline mt-1 block">Ketentuan Layanan</a></Link>
        </CardContent>
      </Card>
    </div>
  );
}

    
