import { CalendarDays } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Header() {
  return (
    <header className="border-b bg-background">
      <div className="mx-auto flex h-16 max-w-5xl items-center px-4">
        <Link
          to="/"
          className="flex items-center gap-2 font-heading text-base font-medium outline-none focus-visible:ring-3 focus-visible:ring-ring"
        >
          <CalendarDays className="size-5 text-primary" />
          Календарь звонков
        </Link>
      </div>
    </header>
  )
}
