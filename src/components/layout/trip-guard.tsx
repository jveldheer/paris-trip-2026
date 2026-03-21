'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { Loader2 } from 'lucide-react';

interface TripGuardProps {
  children: React.ReactNode;
}

export function TripGuard({ children }: TripGuardProps) {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    const tripAccess = Cookies.get('trip_access');
    if (tripAccess) {
      setHasAccess(true);
    } else {
      router.replace('/');
    }
    setChecking(false);
  }, [router]);

  if (checking) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-3 text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="text-sm">Loading trip...</p>
      </div>
    );
  }

  if (!hasAccess) return null;

  return <>{children}</>;
}
