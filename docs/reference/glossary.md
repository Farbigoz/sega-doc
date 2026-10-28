---
title: Глоссарий
tags: [справка]
status: draft
verified: none
sources: []
---

# Глоссарий

Термины справочника с английскими оригиналами — по ним удобно искать в англоязычных источниках. Новый термин сначала добавляется сюда, потом используется в тексте.

| Термин | English | Значение | Подробнее |
|---|---|---|---|
| VDP | Video Display Processor | видеочип Mega Drive (Yamaha YM7101) | [VDP](../hardware/vdp/index.md) |
| VRAM | Video RAM | 64 КБ видеопамяти: тайлы и таблицы | [Раскладка VRAM](../hardware/vdp/vram-layout.md) |
| CRAM | Color RAM | память палитр: 64 цвета | [Палитры](../hardware/vdp/palettes.md) |
| VSRAM | Vertical Scroll RAM | память значений вертикального скролла | [Скроллинг](../hardware/vdp/scrolling.md) |
| Тайл | tile, pattern | блок 8×8 пикселей, 4 бита на пиксель, 32 байта | [Тайлы](../hardware/vdp/tiles.md) |
| Клетка | cell | ячейка 8×8 пикселей на плане или экране | [Планы](../hardware/vdp/planes.md) |
| План | plane, layer | фоновый слой из тайлов: Plane A, Plane B | [Планы](../hardware/vdp/planes.md) |
| Таблица имён | nametable, tilemap | таблица плана: слово на клетку с номером тайла и атрибутами | [Планы](../hardware/vdp/planes.md#таблица-имён) |
| Window | window plane | неподвижный слой, заменяющий Plane A в части экрана | [Window](../hardware/vdp/window.md) |
| Спрайт | sprite | подвижный объект из 1×1…4×4 тайлов | [Спрайты](../hardware/vdp/sprites.md) |
| Таблица спрайтов | SAT, Sprite Attribute Table | таблица записей спрайтов в VRAM | [Спрайты](../hardware/vdp/sprites.md#запись-спрайта) |
| Связь | link | поле записи спрайта: номер следующего спрайта в списке | [Спрайты](../hardware/vdp/sprites.md#связный-список) |
| Приоритет | priority | бит P: выше или ниже слои с нулевым приоритетом | [Приоритеты](../hardware/vdp/priority.md) |
| Палитра | palette | 16 цветов CRAM; всего 4 палитры | [Палитры](../hardware/vdp/palettes.md) |
| Цвет фона | backdrop, background color | цвет там, где все слои прозрачны | [Палитры](../hardware/vdp/palettes.md#цвет-фона-backdrop) |
| Отражение | flip (H/V) | зеркальное отражение тайла или спрайта | [Планы](../hardware/vdp/planes.md#слово-клетки) |
| Скролл | scroll (HScroll, VScroll) | сдвиг видимой части плана | [Скроллинг](../hardware/vdp/scrolling.md) |
| Параллакс | parallax | слои движутся с разной скоростью для ощущения глубины | [Рецепт](../cookbook/parallax.md) |
| Порт данных | data port | `$C00000`: данные для памяти VDP | [Порты](../hardware/vdp/ports-and-commands.md) |
| Порт управления | control port | `$C00004`: регистры, адреса, статус | [Порты](../hardware/vdp/ports-and-commands.md) |
| HV-счётчик | HV counter | текущая позиция луча | [Порты](../hardware/vdp/ports-and-commands.md) |
| Автоинкремент | auto-increment | что VDP прибавляет к адресу после каждого доступа | [Порты](../hardware/vdp/ports-and-commands.md#автоинкремент) |
| DMA | Direct Memory Access | быстрая передача данных в память VDP | [DMA](../hardware/vdp/dma.md) |
| VBlank | vertical blank | пауза между кадрами, пока луч идёт наверх | [Кадр](../hardware/vdp/timing.md) |
| HBlank | horizontal blank | пауза в конце каждой строки | [Кадр](../hardware/vdp/timing.md) |
| VInt | vertical interrupt | прерывание в начале VBlank, уровень 6 | [Кадр](../hardware/vdp/timing.md#прерывания) |
| HInt | horizontal interrupt | прерывание каждые N+1 строк, уровень 4 | [Кадр](../hardware/vdp/timing.md#hint-горизонтальное) |
| H40 / H32 | | ширина экрана 320 / 256 пикселей | [VDP](../hardware/vdp/index.md#разрешение-экрана) |
| V28 / V30 | | высота экрана 224 / 240 строк | [VDP](../hardware/vdp/index.md#разрешение-экрана) |
| Режим 5 | Mode 5 | режим VDP Mega Drive (в отличие от режимов Master System) | [Регистры](../hardware/vdp/registers.md) |
| Shadow/Highlight | shadow/highlight mode | режим затемнения и подсветки | [Shadow/Highlight](../hardware/vdp/shadow-highlight.md) |
| TMSS | Trademark Security System | защита: ROM должен «представиться» при старте | [TMSS](../hardware/tmss.md) |
| SGDK | Sega Genesis Development Kit | библиотека и тулчейн на C | [SGDK](../tools/sgdk.md) |
| rescomp | resource compiler | конвертер ресурсов SGDK | [SGDK](../tools/sgdk.md) |
