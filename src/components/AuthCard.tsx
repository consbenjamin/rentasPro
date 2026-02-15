import Link from "next/link";

export function AuthCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="w-full max-w-md">
      <Link
        href="/"
        className="inline-flex items-center gap-2 mb-8 transition-colors group"
      >
        <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-600 dark:bg-emerald-500 text-white font-bold text-lg shadow-lg shadow-emerald-500/25 group-hover:bg-emerald-700 dark:group-hover:bg-emerald-400 transition-colors">
          R
        </span>
        <span className="text-xl font-bold text-slate-800 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
          Rentas Pro
        </span>
      </Link>
      <div className="bg-white dark:bg-slate-800/95 backdrop-blur-xl rounded-2xl shadow-2xl shadow-slate-900/5 dark:shadow-slate-950/50 border border-slate-200/80 dark:border-slate-700/80 p-6 sm:p-8">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100 mb-1 tracking-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base mb-6">{subtitle}</p>
        )}
        {children}
      </div>
    </div>
  );
}
