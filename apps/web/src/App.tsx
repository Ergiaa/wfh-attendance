function App() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-6 p-6">
      <div className="rounded-xl border bg-surface p-6 shadow-sm">
        <h1 className="text-xl font-semibold">WFH Attendance</h1>
        <p className="mt-1 text-sm text-fg-muted">Styling is set up. Pages come next.</p>
        <div className="mt-6 flex flex-wrap gap-2">
          <span className="rounded-full bg-primary-soft px-2.5 py-0.5 text-xs font-medium text-primary">
            Primary
          </span>
          <span className="rounded-full bg-success-soft px-2.5 py-0.5 text-xs font-medium text-success">
            Success
          </span>
          <span className="rounded-full bg-warning-soft px-2.5 py-0.5 text-xs font-medium text-warning">
            Warning
          </span>
          <span className="rounded-full bg-danger-soft px-2.5 py-0.5 text-xs font-medium text-danger">
            Danger
          </span>
        </div>
        <button
          type="button"
          className="mt-6 w-full rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-fg hover:bg-primary-hover"
        >
          Button
        </button>
      </div>
    </main>
  );
}

export default App;
