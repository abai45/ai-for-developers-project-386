import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it } from 'vitest'
import App from './App'

afterEach(cleanup)

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  )
}

describe('главный экран', () => {
  it('лендинг: заголовок и кнопка «Начать работу»', () => {
    renderAt('/')
    expect(
      screen.getByRole('heading', { level: 1 }),
    ).toHaveTextContent('Сервис для создания и бронирования встреч за минуту')
    expect(screen.getByRole('link', { name: 'Начать работу' })).toBeInTheDocument()
  })

  it('клик «Начать работу» ведёт на экран выбора', () => {
    renderAt('/')
    fireEvent.click(screen.getByRole('link', { name: 'Начать работу' }))
    expect(
      screen.getByRole('heading', { level: 1, name: 'Что вы хотите сделать?' }),
    ).toBeInTheDocument()
  })

  it('экран выбора содержит две карточки', () => {
    renderAt('/start')
    expect(
      screen.getByRole('link', { name: /Создать встречу/ }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: /Присоединиться ко встрече/ }),
    ).toBeInTheDocument()
  })

  it('клик по карточке ведёт на её маршрут', () => {
    renderAt('/start')
    fireEvent.click(screen.getByRole('link', { name: /Присоединиться ко встрече/ }))
    expect(
      screen.getByRole('heading', { level: 1, name: 'Присоединиться ко встрече' }),
    ).toBeInTheDocument()
    expect(screen.getByText('Раздел в разработке')).toBeInTheDocument()
  })
})
