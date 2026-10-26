import { Link } from 'react-router-dom'
import { buttonVariants } from '@/components/ui/button'

export default function LandingPage() {
  return (
    <section className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center gap-8 px-4 text-center">
      <h1 className="max-w-2xl font-heading text-3xl leading-snug font-semibold sm:text-4xl">
        Сервис для создания и бронирования встреч за минуту: Указывайте тип
        события, время и продолжительность.
      </h1>
      <Link
        to="/start"
        className={buttonVariants({ size: 'lg', className: 'px-6 text-base' })}
      >
        Начать работу
      </Link>
    </section>
  )
}
