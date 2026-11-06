import { CalendarCheck } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import type { Credentials } from '../api/auth';
import { ApiError } from '../api/client';
import { useAuth } from '../auth/auth-context';
import { Alert } from '../components/ui/Alert';
import { Button } from '../components/ui/Button';
import { TextField } from '../components/ui/TextField';

export function LoginPage() {
  const { login } = useAuth();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Credentials>({ defaultValues: { email: '', password: '' } });

  // No navigation here: <GuestOnly> redirects as soon as the auth state flips to authenticated.
  const onSubmit = handleSubmit(async (credentials) => {
    setSubmitError(null);
    try {
      await login(credentials);
    } catch (error) {
      setSubmitError(loginErrorMessage(error));
    }
  });

  return (
    <main className="grid min-h-dvh place-items-center bg-surface-muted/50 p-4">
      <title>Sign in · WFH Attendance</title>
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <span className="grid size-12 place-items-center rounded-xl bg-accent text-accent-fg shadow-sm">
            <CalendarCheck aria-hidden className="size-6" />
          </span>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">WFH Attendance</h1>
            <p className="mt-1 text-sm text-fg-muted">Sign in with your work account</p>
          </div>
        </div>

        <form
          noValidate
          onSubmit={onSubmit}
          className="flex flex-col gap-4 rounded-xl border bg-surface p-6 shadow-sm"
        >
          {submitError && <Alert tone="danger">{submitError}</Alert>}

          <TextField
            label="Email"
            type="email"
            autoComplete="email"
            autoFocus
            error={errors.email?.message}
            {...register('email', {
              required: 'Email is required',
              pattern: { value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email address' },
            })}
          />
          <TextField
            label="Password"
            type="password"
            autoComplete="current-password"
            error={errors.password?.message}
            {...register('password', { required: 'Password is required' })}
          />

          <Button type="submit" loading={isSubmitting} className="mt-2">
            Sign in
          </Button>
        </form>
      </div>
    </main>
  );
}

function loginErrorMessage(error: unknown): string {
  if (!(error instanceof ApiError)) {
    return 'Something went wrong. Please try again.';
  }
  // Inactive accounts get the same 401, by design, so the message can't single them out.
  return error.status === 401 ? 'Incorrect email or password.' : error.message;
}
