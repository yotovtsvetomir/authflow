'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Input } from '@/ui-components/Input/Input';
import { Button } from '@/ui-components/Button/Button';
import styles from '../PasswordReset.module.css';

export default function ResetPassword() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<{ newPassword?: string; confirmPassword?: string; apiError?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const router = useRouter();
  const params = useParams<{ token: string }>();
  const token = params.token;

  function validate() {
    const errs: { newPassword?: string; confirmPassword?: string } = {};
    if (!newPassword) {
      errs.newPassword = 'Please enter a new password';
    }
    if (!confirmPassword) {
      errs.confirmPassword = 'Please confirm the password';
    }
    if (newPassword && confirmPassword && newPassword !== confirmPassword) {
      errs.confirmPassword = 'Passwords do not match';
    }
    return errs;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setErrors({});

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/password-reset/confirm/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, new_password: newPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Password has been successfully changed.');
        setTimeout(() => router.push('/login'), 3000);
      } else {
        let errorMessage = 'Invalid token or user.';

        if (Array.isArray(data)) {
          errorMessage = data.map((err) => err.msg).join(', ');
        } else if (data.detail) {
          errorMessage = data.detail;
        }

        setErrors({ apiError: errorMessage });
      }
    } catch (err) {
      console.error('Reset error:', err);
      setErrors({ apiError: 'An error occurred. Please try again later.' });
    }
  };

  return (
    <div className="container fullHeight">
      <form onSubmit={handleSubmit} className={styles.form} noValidate>
        <h2 className={styles.heading}>Change Password</h2>

        <Input
          id="newPassword"
          name="newPassword"
          type="password"
          label="New Password"
          value={newPassword}
          error={errors.newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />

        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          label="Confirm Password"
          value={confirmPassword}
          error={errors.confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        <Button type="submit" width="100%" disabled={isSubmitting}>
          {isSubmitting ? 'Submitted' : 'Change Password'}
        </Button>

        {message && <p className={`${styles.message} ${styles.success}`}>{message}</p>}
        {errors.apiError && <p className={`${styles.message} ${styles.error}`}>{errors.apiError}</p>}
      </form>
    </div>
  );
}
