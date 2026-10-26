import { Link } from 'react-router-dom'
import { buttonVariants } from '@/components/ui/button'

export default function StubPage({ title }: { title: string }) {
  return (
    <section className="mx-auto flex max-w-3xl flex-col items-center gap-4 px-4 py-24 text-center">
      <h1 className="font-heading text-3xl font-semibold">{title}</h1>
      <p className="text-muted-foreground">Раздел в разработке</p>
      <Link to="/" className={buttonVariants({ variant: 'outline' })}>
        Назад на главную
      </Link>
    </section>
  )
}
