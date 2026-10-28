"""MkDocs-хук: плашка статуса страницы и проверка источников.

Читает frontmatter страницы (status, verified, sources) и вставляет после
заголовка H1 плашку: насколько страница готова и чем проверена. ID источников
сверяются с реестром docs/sources/index.md (заголовки вида `### Название {#id}`);
неизвестный ID — предупреждение, а в strict-режиме — ошибка сборки.
"""

import logging
import posixpath
import re
from pathlib import Path

log = logging.getLogger("mkdocs.hooks.page_meta")

SOURCES_PAGE = "sources/index.md"
SOURCE_HEADING = re.compile(r"^#{2,4}\s+(.+?)\s*\{#([a-z0-9][a-z0-9-]*)\}\s*$", re.M)

STATUSES = {"stub", "draft", "review", "done"}
VERIFIED = {
    "none": ("warning", "Не сверено с первоисточниками",
             "Текст написан по памяти или по обсуждению и ещё не проверен по документации. "
             "Детали (биты, лимиты, тайминги) могут быть неточны."),
    "sources": ("info", "Сверено с источниками", ""),
    "emulator": ("success", "Проверено в эмуляторе", ""),
    "hardware": ("success", "Проверено на железе", ""),
}

_registry: dict[str, str] = {}


def on_config(config):
    _registry.clear()
    path = Path(config["docs_dir"]) / SOURCES_PAGE
    if path.exists():
        for title, sid in SOURCE_HEADING.findall(path.read_text(encoding="utf-8")):
            _registry[sid] = title
    return config


def _sources_line(page, ids):
    link = posixpath.relpath(SOURCES_PAGE, posixpath.dirname(page.file.src_uri) or ".")
    parts = []
    for sid in ids:
        if sid not in _registry:
            log.warning("%s: источник '%s' не найден в %s", page.file.src_uri, sid, SOURCES_PAGE)
            parts.append(f"`{sid}`")
        else:
            parts.append(f"[{_registry[sid]}]({link}#{sid})")
    return "**Источники:** " + ", ".join(parts)


def _admonition(kind, title, lines):
    body = "\n".join(f"    {line}" if line else "" for line in lines)
    return f'!!! {kind} "{title}"\n{body}\n' if body else f'!!! {kind} "{title}"\n'


def on_page_markdown(markdown, page, config, files):
    meta = page.meta
    src = page.file.src_uri
    if src == SOURCES_PAGE or "status" not in meta:
        return markdown

    status = meta.get("status")
    verified = meta.get("verified", "none")
    sources = meta.get("sources") or []

    if status not in STATUSES:
        log.warning("%s: неизвестный status '%s' (допустимо: %s)", src, status, ", ".join(sorted(STATUSES)))
    if verified not in VERIFIED:
        log.warning("%s: неизвестный verified '%s' (допустимо: %s)", src, verified, ", ".join(VERIFIED))
        verified = "none"
    if verified != "none" and not sources:
        log.warning("%s: verified=%s, но список sources пуст", src, verified)

    if status == "stub":
        banner = _admonition("note", "Заготовка", ["Страница ещё не написана. Ниже — план раздела."])
    else:
        kind, title, text = VERIFIED[verified]
        lines = [text] if text else []
        if sources:
            lines += ([""] if lines else []) + [_sources_line(page, sources)]
        banner = _admonition(kind, title, lines)

    # Вставляем после первого H1, чтобы заголовок оставался первым.
    match = re.search(r"^# .+$", markdown, re.M)
    if match:
        pos = match.end()
        return markdown[:pos] + "\n\n" + banner + markdown[pos:]
    return banner + "\n" + markdown
