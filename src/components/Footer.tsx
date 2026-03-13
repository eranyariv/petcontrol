import { APP_VERSION } from '@/lib/version'

export default function Footer() {
  return (
    <footer className="w-full py-2 text-center text-xs text-slate-400 space-y-0.5">
      <p>
        <a
          href="mailto:eran@yariv.org?subject=%D7%9E%D7%A9%D7%95%D7%91%20%D7%9C%D7%90%D7%AA%D7%A8%20%D7%9E%D7%97%D7%9E%D7%93"
          className="hover:text-indigo-500 transition-colors underline"
        >
          משוב
        </a>
      </p>
      <p>v{APP_VERSION}</p>
    </footer>
  )
}
