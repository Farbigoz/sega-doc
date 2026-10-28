# Sega Genesis / Mega Drive — справочник разработчика

Справочник по разработке под Sega Genesis / Mega Drive на русском языке: устройство железа, примеры кода, инструменты, отладка, интерактивные модели. Каждый факт — со ссылкой на первоисточник и видимым статусом проверки.

Один набор Markdown-файлов работает в двух видах:

- **сайт** на [MkDocs Material](https://squidfunk.github.io/mkdocs-material/), публикуется на GitHub Pages;
- **хранилище [Obsidian](https://obsidian.md/)** — папка `docs/`.

## Быстрый старт

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
mkdocs serve
```

Сайт — на <http://127.0.0.1:8000>. Проверочная сборка (её же запускает CI):

```bash
mkdocs build --strict
```

Obsidian: *Open folder as vault* → папка `docs/`.

## Структура

```
docs/            страницы справочника (= хранилище Obsidian)
examples/        полные примеры кода (SGDK и ассемблер)
sources/         локальный архив источников (только с разрешённой лицензией)
hooks/           хук MkDocs: плашки статуса, проверка источников
tools/           служебные скрипты
AGENTS.md        инструкции для ИИ-агентов
CLAUDE.md        то же для Claude Code (подключает AGENTS.md)
```

## Как писать

- [Как вести справочник](docs/about/contributing.md) — запуск, Obsidian, работа с агентами
- [Правила оформления](docs/about/conventions.md) — язык, структура, frontmatter, источники
- [Гайд для агентов](AGENTS.md)
- [План развития](docs/about/roadmap.md)

## Публикация

После отправки в GitHub: *Settings → Pages → Source:* **GitHub Actions**. Каждый push в `main` пересобирает и публикует сайт (`.github/workflows/docs.yml`). Не забудьте вписать `site_url` и `repo_url` в `mkdocs.yml`.
