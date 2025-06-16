"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authUtils } from '@/utils/auth';
import { useUser } from '@/context/UserContext';

export default function ProtectedRoute({ children }) {
  const router = useRouter();
  const { user, loadingUser } = useUser();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const authenticated = authUtils.isAuthenticated();

    if (!authenticated || (!loadingUser && !user)) {
      router.push('/login');
    } else {
      setIsChecking(false);
    }
  }, [router, loadingUser, user]);

  if (isChecking || loadingUser) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl">Carregando...</div>
      </div>
    );
  }

  return children;
}