import { Link } from 'react-router';

export function NotFoundPage() {
  return (
    <main className="grid min-h-dvh place-items-center p-4">
      <title>Page not found · WFH Attendance</title>
      <div className="flex flex-col items-center gap-2 text-center">
        <p className="text-sm font-semibold text-primary-ink">404</p>
        <h1 className="text-2xl font-semibold tracking-tight">Page not found</h1>
        <p className="text-sm text-fg-muted">The page you're looking for doesn't exist.</p>
        <Link
          to="/"
          className="mt-4 text-sm font-medium text-primary-ink underline-offset-4 hover:underline"
        >
          Back to home
        </Link>
      </div>
    </main>
  );
}
