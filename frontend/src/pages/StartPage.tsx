import { CalendarPlus, Users } from 'lucide-react'
import { Link } from 'react-router-dom'
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

const choices = [
  {
    to: '/owner',
    title: 'Создать встречу',
    description: 'Настройте тип встречи: название, описание и длительность',
    Icon: CalendarPlus,
  },
  {
    to: '/book',
    title: 'Присоединиться ко встрече',
    description:
      'Выберите тип встречи и свободный слот на ближайшие 14 дней',
    Icon: Users,
  },
]

export default function StartPage() {
  return (
    <section className="mx-auto flex max-w-3xl flex-col gap-8 px-4 py-16">
      <h1 className="text-center font-heading text-3xl font-semibold">
        Что вы хотите сделать?
      </h1>
      <div className="grid gap-4 sm:grid-cols-2">
        {choices.map(({ to, title, description, Icon }) => (
          <Link
            key={to}
            to={to}
            className="rounded-xl outline-none focus-visible:ring-3 focus-visible:ring-ring"
          >
            <Card className="h-full transition-colors group-hover:bg-muted/50 hover:bg-muted/50">
              <CardHeader className="gap-3">
                <Icon className="size-6 text-primary" aria-hidden="true" />
                <CardTitle className="text-lg">{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  )
}
