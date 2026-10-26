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
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Сервис для создания и бронирования встреч за минуту',
    )
    expect(
      screen.getByRole('link', { name: 'Начать работу' }),
    ).toBeInTheDocument()
  })

  it('клик «Начать работу» ведёт гостя к бронированию', () => {
    renderAt('/')
    fireEvent.click(screen.getByRole('link', { name: 'Начать работу' }))
    expect(
      screen.getByRole('heading', {
        level: 1,
        name: 'Присоединиться ко встрече',
      }),
    ).toBeInTheDocument()
  })

  it('ссылка владельца есть в футере', () => {
    renderAt('/')
    expect(screen.getByRole('link', { name: 'Владелец' })).toBeInTheDocument()
  })

  it('клик по ссылке «Владелец» ведёт в админскую часть', () => {
    renderAt('/')
    fireEvent.click(screen.getByRole('link', { name: 'Владелец' }))
    expect(
      screen.getByRole('heading', { level: 1, name: 'Создать встречу' }),
    ).toBeInTheDocument()
    expect(screen.getByText('Раздел в разработке')).toBeInTheDocument()
  })
})
