import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="border-t">
      <div className="mx-auto flex h-12 max-w-5xl items-center justify-end px-4">
        <Link
          to="/owner"
          className="text-xs text-muted-foreground/60 outline-none hover:text-muted-foreground focus-visible:ring-3 focus-visible:ring-ring"
        >
          Владелец
        </Link>
      </div>
    </footer>
  )
}
