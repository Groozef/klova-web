'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';

export const dynamic = 'force-dynamic';

function Loader() {
  return (
    <div className="min-h-screen flex items-center justify-center text-mute">
      Входим в Klova…
    </div>
  );
}

function GoogleSuccessInner() {
  const router = useRouter();
  const params = useSearchParams();
  const { signinFromOAuth } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const access_token = params.get('access_token');
    const refresh_token = params.get('refresh_token');
    const user_id = params.get('user_id');
    const role = params.get('role');
    const locale = params.get('locale');

    if (!access_token || !refresh_token || !user_id || !role || !locale) {
      setError('Не пришли токены от Google. Попробуй ещё раз.');
      return;
    }

    signinFromOAuth({
      access_token,
      refresh_token,
      user: {
        id: user_id,
        role: role as 'executor' | 'customer' | 'both',
        locale: locale as 'ru' | 'kk' | 'en',
      },
    });
  }, [params, signinFromOAuth, router]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="max-w-md text-center flex flex-col gap-4">
          <p className="text-coral">{error}</p>
          <a href="/auth/signin" className="text-jade hover:underline">
            Вернуться ко входу
          </a>
        </div>
      </div>
    );
  }

  return <Loader />;
}

export default function GoogleSuccessPage() {
  return (
    <Suspense fallback={<Loader />}>
      <GoogleSuccessInner />
    </Suspense>
  );
}
