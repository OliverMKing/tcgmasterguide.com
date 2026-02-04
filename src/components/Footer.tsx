export default function Footer() {
  return (
    <footer className="bg-white dark:bg-slate-800 border-t border-stone-200 dark:border-slate-700 relative overflow-hidden">
      {/* Subtle gradient accent */}
      <div className="absolute inset-0 bg-gradient-to-r from-violet-500/5 via-transparent to-purple-500/5" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative">
        <div className="flex flex-col items-center gap-6">
          {/* Brand */}
          <div className="text-center">
            <span className="text-lg font-bold bg-gradient-to-r from-violet-600 to-purple-500 dark:from-violet-400 dark:to-purple-400 bg-clip-text text-transparent">
              TCG Master Guide
            </span>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
              Expert deck guides by Grant Manley
            </p>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 w-full max-w-xs">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-stone-200 dark:via-neutral-700 to-transparent" />
            <div className="w-1.5 h-1.5 rounded-full bg-violet-400" />
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-stone-200 dark:via-neutral-700 to-transparent" />
          </div>

          {/* Social Links */}
          <div className="flex flex-wrap justify-center items-center gap-3">
            <a
              href="mailto:grantm1999@hotmail.com"
              className="group flex items-center gap-2 text-neutral-500 dark:text-neutral-400 hover:text-violet-600 dark:hover:text-violet-400 transition-all duration-300 px-3 py-2 rounded-xl hover:bg-violet-50 dark:hover:bg-violet-900/20"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span className="text-sm font-medium">Email</span>
            </a>
            <a
              href="https://x.com/Tricroar"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-2 text-neutral-500 dark:text-neutral-400 hover:text-violet-600 dark:hover:text-violet-400 transition-all duration-300 px-3 py-2 rounded-xl hover:bg-violet-50 dark:hover:bg-violet-900/20"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              <span className="text-sm font-medium">@Tricroar</span>
            </a>
            <a
              href="https://discord.com/users/TricRoar"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-2 text-neutral-500 dark:text-neutral-400 hover:text-violet-600 dark:hover:text-violet-400 transition-all duration-300 px-3 py-2 rounded-xl hover:bg-violet-50 dark:hover:bg-violet-900/20"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
              </svg>
              <span className="text-sm font-medium">TricRoar</span>
            </a>
            <a
              href="https://twitch.tv/tricroar"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-2 text-neutral-500 dark:text-neutral-400 hover:text-violet-600 dark:hover:text-violet-400 transition-all duration-300 px-3 py-2 rounded-xl hover:bg-violet-50 dark:hover:bg-violet-900/20"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714z" />
              </svg>
              <span className="text-sm font-medium">TricRoar</span>
            </a>
          </div>

          {/* Copyright */}
          <p className="text-xs text-neutral-400 dark:text-neutral-500">
            {new Date().getFullYear()} tcgmasterguide.com
          </p>
        </div>
      </div>
    </footer>
  )
}
