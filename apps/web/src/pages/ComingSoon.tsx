import { PageHeader } from '../components/PageHeader';

// Temporary stand-in so navigation and guards can be exercised before each page is built.
export function ComingSoon({ title }: { title: string }) {
  return (
    <>
      <PageHeader title={title} />
      <div className="rounded-xl border border-dashed bg-surface p-10 text-center text-sm text-fg-muted">
        This page is coming next.
      </div>
    </>
  );
}
