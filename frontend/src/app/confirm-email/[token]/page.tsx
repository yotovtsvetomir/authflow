'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/ui-components/Button/Button';
import styles from './ConfirmEmail.module.css';

export default function ConfirmEmailPage() {
  const params = useParams();
  const router = useRouter();
  const tokenParam = params.token;
  const token = Array.isArray(tokenParam) ? tokenParam[0] : tokenParam;

  const searchParams = useSearchParams();
  const from = searchParams.get('from') || '/profile';

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    if (!token) return;

    const confirmEmail = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/users/confirm-email/${encodeURIComponent(token)}?from=${encodeURIComponent(from)}`
        );
        const data = await res.json();

        if (res.ok) {
          setStatus('success');
          setMessage(data.message || 'Email confirmed successfully!');
        } else {
          setStatus('error');
          setMessage(data.detail || data.error || 'Failed to confirm email.');
        }
      } catch (err: unknown) {
        setStatus('error');
        // Narrow the unknown type to Error if possible
        if (err instanceof Error) {
          setMessage(err.message);
        } else {
          setMessage('Server error');
        }
      }
    };

    confirmEmail();
  }, [token]);

  return (
    <div className="container fullHeight centerWrapper">
      {status === 'loading' && <p>Confirming your email...</p>}
      {status === 'success' && (
        <>
          <p className={styles.success}>{message}</p>
          <Button onClick={() => router.push(`/login?from=${from}`)}>Go to Login</Button>
        </>
      )}
      {status === 'error' && (
        <>
          <p className={styles.error}>{message}</p>
          <Button onClick={() => router.push(`/login?from=${from}`)}>Back to Login</Button>
        </>
      )}
    </div>
  );
}
