export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <p className="text-sm font-medium text-muted-foreground">
        404
      </p>

      <h1 className="mt-2 text-3xl font-semibold tracking-tight">
        Page not found
      </h1>

      <p className="mt-3 max-w-md text-sm text-muted-foreground">
        The page you are looking for doesn&apos;t exist or may have been moved.
      </p>
    </main>
  );
}
