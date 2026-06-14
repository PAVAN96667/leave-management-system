'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    if (!token) {
      router.push('/login');
    } else if (role === 'ADMIN') {
      router.push('/dashboard/admin');
    } else if (role === 'MANAGER') {
      router.push('/dashboard/manager');
    } else {
      router.push('/dashboard/user');
    }
  }, []);

  return <div className="flex items-center justify-center h-screen">Redirecting...</div>;
}