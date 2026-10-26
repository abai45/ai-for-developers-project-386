# AGENTS.md

Учебный проект «Календарь звонков»: сервис бронирования встреч (клон Cal.com без авторизации).
Владелец заводит типы встреч, гость без регистрации записывается на свободный слот.

## Устройство проекта

- `backend/` — Spring Boot 4.1, Java 21, Maven; дымовой эндпоинт `GET /api/health`
- `frontend/` — React 19 + Vite + TypeScript + Tailwind CSS 4 + shadcn/ui; проксирует `/api` на бекенд
- `docs/decisions.md` — архитектурные решения: параметры расписания, модель данных, эндпоинты, стек
- Хранилище — in-memory (в памяти процесса; PostgreSQL запланирован отдельным шагом)

## Команды

- `mise run setup` — установить зависимости бекенда и фронтенда
- `mise run check` — все проверки: тесты, линт, типы, сборка (та же команда в CI)
- `mise run backend` — бекенд на :8080
- `mise run frontend` — фронтенд на :5173
- `mise run backend-test` / `mise run frontend-test` — тесты по частям
- `mise start` / `mise stop` — бекенд и фронтенд фоном (daemons)

## Правила

- Коммиты строго по Conventional Commits: `feat:`, `fix:`, `docs:`, `chore:`, `test:`, `refactor:`, `ci:`.
- Архитектурные решения фиксируются в `docs/decisions.md` до реализации.
- `mise run check` должен быть зелёным до каждого push; проверки не редактируются под задачу.
