'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export function CodeEntry() {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [shaking, setShaking] = useState(false);
  const router = useRouter();

  const triggerShake = () => {
    setShaking(true);
    setTimeout(() => setShaking(false), 600);
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = code.trim();
    if (!trimmed) return;

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: trimmed.toLowerCase() }),
      });
      const data = await res.json();

      if (data.valid) {
        Cookies.set('trip_access', trimmed.toLowerCase(), {
          expires: 90,
          path: '/',
          sameSite: 'lax',
        });
        router.push('/trip');
      } else {
        setError("That's not the magic word. Try again!");
        triggerShake();
      }
    } catch {
      setError('Something went wrong. Check your connection and try again.');
      triggerShake();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12 bg-gradient-to-br from-blue-50 via-white to-rose-50">
      {/* Decorative blobs */}
      <div
        className="absolute top-[-80px] left-[-80px] w-72 h-72 bg-blue-200 rounded-full opacity-20 blur-3xl pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute bottom-[-80px] right-[-80px] w-72 h-72 bg-rose-200 rounded-full opacity-20 blur-3xl pointer-events-none"
        aria-hidden="true"
      />

      <div className="relative w-full max-w-xs animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-4" aria-hidden="true">
            🗺️
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Family Trip 2026</h1>
          <p className="text-sm text-gray-500">Enter your trip code to get started</p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className={cn(
            'space-y-3 transition-transform',
            shaking && 'animate-[shake_0.6s_ease-in-out]'
          )}
        >
          <Input
            type="text"
            placeholder="Trip code"
            value={code}
            onChange={(e) => {
              setCode(e.target.value);
              if (error) setError('');
            }}
            className={cn(
              'text-center text-lg h-14 rounded-2xl border-2 bg-white shadow-sm font-mono tracking-widest',
              error ? 'border-destructive focus-visible:ring-destructive' : 'border-gray-200'
            )}
            autoComplete="off"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            autoFocus
            disabled={loading}
          />

          <Button
            type="submit"
            className="w-full h-12 text-base rounded-2xl shadow-sm font-semibold"
            disabled={loading || !code.trim()}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Checking...
              </>
            ) : (
              "Let's Go! ✈️"
            )}
          </Button>

          {error && (
            <p className="text-sm text-destructive text-center pt-1 animate-in fade-in duration-200">
              {error}
            </p>
          )}
        </form>
      </div>

      {/* Inline shake keyframes via a style tag */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          15%       { transform: translateX(-6px); }
          30%       { transform: translateX(6px); }
          45%       { transform: translateX(-4px); }
          60%       { transform: translateX(4px); }
          75%       { transform: translateX(-2px); }
          90%       { transform: translateX(2px); }
        }
      `}</style>
    </div>
  );
}
