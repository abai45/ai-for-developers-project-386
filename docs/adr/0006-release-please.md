# 6. Автоматические релизы через release-please

- Статус: принято (01.11.2026)
- Тикет: #9; полный текст: `docs/decisions.md` («Релизный процесс…»)

## Контекст
Релизы должны готовиться из истории коммитов без ручных тегов и changelog'ов.

## Решение
`googleapis/release-please-action@v4` в GitHub Actions на push в `main`: по Conventional Commits (`feat` → minor, `fix/docs/...` → patch, `!`/BREAKING → major) создаёт/обновляет release-PR («chore: release X.Y.Z» с bump `version.txt` + `CHANGELOG.md`); мержится обычным PR, публикует GitHub Release. Ручные теги запрещены; процесс документирован в README/AGENTS.md.

## Последствия
- История коммитов обязана оставаться conventional (ревью).
- Первый релиз проекта: v1.0.0 (01.11.2026).
