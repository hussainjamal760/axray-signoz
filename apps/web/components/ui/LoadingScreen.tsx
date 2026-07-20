export const LoadingScreen = ({ message = "Loading..." }: { message?: string }) => (
  <div className="fixed inset-0 bg-background flex items-center justify-center z-50">
    <div className="flex flex-col items-center gap-4">
      <div className="w-10 h-10 border-4 border-primary-fixed border-t-transparent animate-spin" />
      <span className="font-mono-label text-xs uppercase tracking-widest text-on-surface-variant">
        {message}
      </span>
    </div>
  </div>
);
