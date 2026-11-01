# 5. Один Docker-образ на всё приложение, порт из PORT

- Статус: принято (01.11.2026)
- Тикеты: #19, #20; полный текст: `docs/decisions.md` («Docker и деплой…»)

## Контекст
Автопроверка курса и хостинги (Render/Railway) запускают один контейнер по `Dockerfile` из корня и ждут приложение на порту из переменной `PORT`.

## Решение
Мультитейдж `Dockerfile`: node собирает фронтенд (Vite, `dist/`), Maven упаковывает бэкенд, кладя `dist/` в `classpath:/static`; runtime-слой — только JRE 21, `ENTRYPOINT java -jar`, `server.port=${PORT:8080}`. Spring отдаёт SPA со SPA-fallback (не-`api` маршруты → `index.html`); API и UI на одном порту/origin — прокси и CORS не нужны. Деплой через Render MCP-конфигурацию (`opencode.json`, ключ из `{env:RENDER_API_KEY}`, секреты вне git); агент создаёт сервис по Dockerfile (runtime docker), публичная ссылка в README.

## Последствия
- Различие «локально/CI/облако» сведено к одному образу.
- Free-план Render засыпает без запросов; данные сбрасываются при рестарте (ADR-4).
