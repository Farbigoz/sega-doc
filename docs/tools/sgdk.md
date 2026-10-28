---
title: SGDK
tags: [инструменты, sgdk, c]
status: draft
verified: none
sources: []
---

# SGDK

SGDK — библиотека и тулчейн для разработки под Mega Drive на C. В комплекте — `rescomp`, который сам режет PNG на тайлы и строит карты и палитры, а также функции для работы с VDP, спрайтами, звуком и вводом.

> [!todo] Дописать
> Установка, структура проекта, сборка, версии SGDK и отличия API между ними — по [репозиторию SGDK](https://github.com/Stephane-D/SGDK) и его примерам.

## Что обсуждалось

### Ресурсы

Графика описывается в файле ресурсов, `rescomp` превращает её в данные и заголовок `resources.h`:

```
PALETTE  pal_hero   "hero.png"
SPRITE   spr_hero   "hero.png" 4 4 FAST 5    // спрайт 32×32 (4×4 тайла), анимация
IMAGE    img_bg     "bg.png" BEST            // фон: тайлы + карта
```

### Пример: фон, спрайт и параллакс

```c
#include <genesis.h>
#include "resources.h"

int main(bool hardReset)
{
    VDP_setScreenWidth320();
    PAL_setPalette(PAL0, img_bg.palette->data, DMA);
    PAL_setPalette(PAL1, pal_hero.data, DMA);

    // фон в Plane B
    VDP_drawImageEx(BG_B, &img_bg,
        TILE_ATTR_FULL(PAL0, FALSE, FALSE, FALSE, TILE_USER_INDEX),
        0, 0, FALSE, TRUE);

    SPR_init();
    Sprite* hero = SPR_addSprite(&spr_hero, 100, 120,
        TILE_ATTR(PAL1, TRUE, FALSE, FALSE));

    s16 camX = 0;
    while (TRUE)
    {
        camX++;
        VDP_setHorizontalScroll(BG_B, -camX / 2);   // параллакс
        SPR_setPosition(hero, 100, 120);
        SPR_update();                 // готовит таблицу спрайтов
        SYS_doVBlankProcess();        // ждёт VBlank и выполняет DMA
    }
    return 0;
}
```

`TILE_ATTR_FULL(pal, prio, vflip, hflip, index)` собирает [слово клетки](../hardware/vdp/planes.md#слово-клетки): палитру, приоритет, отражения и номер тайла.

> [!todo] Не проверено
> Код не собирался. Сигнатуры функций (`main`, `VDP_drawImageEx` и др.) — сверить с текущей версией SGDK.

## См. также

- [Буфер таблицы спрайтов в RAM](../cookbook/sprite-table-buffer.md) — что делают `SPR_update()` и `SYS_doVBlankProcess()` на уровне железа
- [Первый ROM на SGDK](../guides/first-rom-sgdk.md)
