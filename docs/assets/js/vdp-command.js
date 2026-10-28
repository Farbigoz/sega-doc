// Калькулятор команд VDP: адрес ↔ 32-битная команда для порта управления.
// Формат команды и коды операций — docs/hardware/vdp/ports-and-commands.md.
(function () {
  "use strict";

  // Коды операций CD5..CD0 (без бита DMA).
  var TARGETS = {
    vram:  { name: "VRAM",  size: 0x10000, write: 0x01, read: 0x00 },
    cram:  { name: "CRAM",  size: 0x80,    write: 0x03, read: 0x08 },
    vsram: { name: "VSRAM", size: 0x50,    write: 0x05, read: 0x04 }
  };
  var DMA_BIT = 0x20;

  function hex(value, digits) {
    return value.toString(16).toUpperCase().padStart(digits, "0");
  }

  function parseHex(text) {
    var clean = text.trim().replace(/^\$|^0x/i, "");
    if (!/^[0-9a-f]+$/i.test(clean)) return null;
    return { value: parseInt(clean, 16), digits: clean.length };
  }

  function encode(addr, cd) {
    var hi = ((cd & 0x03) << 14) | (addr & 0x3FFF);
    var lo = ((cd >> 2) << 4) | ((addr >> 14) & 0x03);
    return { hi: hi, lo: lo, full: ((hi << 16) | lo) >>> 0 };
  }

  function decode(cmd) {
    var hi = (cmd >>> 16) & 0xFFFF;
    var lo = cmd & 0xFFFF;
    return {
      hi: hi,
      lo: lo,
      cd: ((hi >> 14) & 0x03) | (((lo >> 4) & 0x0F) << 2),
      addr: (hi & 0x3FFF) | ((lo & 0x03) << 14),
      junk: lo & 0xFF0C
    };
  }

  function describe(cd) {
    var base = cd & ~DMA_BIT;
    for (var key in TARGETS) {
      var t = TARGETS[key];
      if (base === t.write) return { target: t, op: "запись", dma: !!(cd & DMA_BIT) };
      if (base === t.read) return { target: t, op: "чтение", dma: !!(cd & DMA_BIT) };
    }
    return null;
  }

  // Подписи битов: [первое слово, второе слово], от бита 15 к биту 0.
  var LABELS = [
    ["CD1", "CD0", "A13", "A12", "A11", "A10", "A9", "A8", "A7", "A6", "A5", "A4", "A3", "A2", "A1", "A0"],
    ["0", "0", "0", "0", "0", "0", "0", "0", "CD5", "CD4", "CD3", "CD2", "0", "0", "A15", "A14"]
  ];

  function renderBits(container, hi, lo) {
    container.innerHTML = "";
    [hi, lo].forEach(function (word, w) {
      var row = document.createElement("div");
      row.className = "vdp-bits";
      var caption = document.createElement("span");
      caption.className = "vdp-bits__caption";
      caption.textContent = w === 0 ? "Первое слово" : "Второе слово";
      row.appendChild(caption);
      for (var bit = 15; bit >= 0; bit--) {
        var label = LABELS[w][15 - bit];
        var cell = document.createElement("span");
        cell.className = "vdp-bit " + (label[0] === "C" ? "vdp-bit--cd" : label[0] === "A" ? "vdp-bit--addr" : "vdp-bit--zero");
        cell.innerHTML = "<small>" + label + "</small>" + ((word >> bit) & 1);
        row.appendChild(cell);
      }
      container.appendChild(row);
    });
  }

  function el(tag, attrs, html) {
    var node = document.createElement(tag);
    for (var key in attrs || {}) node.setAttribute(key, attrs[key]);
    if (html) node.innerHTML = html;
    return node;
  }

  function buildEncoder(root) {
    var form = el("div", { class: "vdp-form" });
    var target = el("select", { "aria-label": "Память" },
      '<option value="vram">VRAM</option><option value="cram">CRAM</option><option value="vsram">VSRAM</option>');
    var op = el("select", { "aria-label": "Операция" },
      '<option value="write">запись</option><option value="read">чтение</option>');
    var addr = el("input", { type: "text", value: "$C18A", spellcheck: "false", "aria-label": "Адрес" });
    var dmaBox = el("input", { type: "checkbox" });
    var dmaLabel = el("label", {}, "");
    dmaLabel.appendChild(dmaBox);
    dmaLabel.appendChild(document.createTextNode(" через DMA"));

    form.appendChild(el("label", {}, "Память ")).appendChild(target);
    form.appendChild(el("label", {}, "Операция ")).appendChild(op);
    form.appendChild(el("label", {}, "Адрес ")).appendChild(addr);
    form.appendChild(dmaLabel);

    var out = el("div", { class: "vdp-out" });
    var bits = el("div", { class: "vdp-bits-wrap" });
    root.appendChild(form);
    root.appendChild(out);
    root.appendChild(bits);

    function update() {
      var t = TARGETS[target.value];
      var parsed = parseHex(addr.value);
      dmaBox.disabled = op.value === "read";
      if (dmaBox.disabled) dmaBox.checked = false;

      if (!parsed) {
        out.innerHTML = '<p class="vdp-error">Адрес — шестнадцатеричное число: $C18A, 0xC18A или C18A.</p>';
        bits.innerHTML = "";
        return;
      }
      var a = parsed.value;
      var notes = [];
      if (a >= t.size) notes.push(t.name + " — " + t.size + " байт, адрес должен быть меньше $" + hex(t.size, 4) + ".");
      if (a & 1) notes.push("Адрес нечётный: доступ к памяти VDP идёт словами.");

      var cd = (op.value === "write" ? t.write : t.read) | (dmaBox.checked ? DMA_BIT : 0);
      var c = encode(a, cd);
      var full = "$" + hex(c.full, 8);

      out.innerHTML =
        '<p class="vdp-result">' + full + "</p>" +
        "<p>Первое слово <code>$" + hex(c.hi, 4) + "</code>, второе слово <code>$" + hex(c.lo, 4) + "</code></p>" +
        "<pre><code>move.l  #" + full + ", (VDP_CTRL).l    ; " + t.name + ", " + op.options[op.selectedIndex].text +
        (dmaBox.checked ? " через DMA" : "") + ", адрес $" + hex(a, 4) + "\n" +
        "*(volatile u32*)0xC00004 = 0x" + hex(c.full, 8) + ";</code></pre>" +
        notes.map(function (n) { return '<p class="vdp-error">' + n + "</p>"; }).join("");
      renderBits(bits, c.hi, c.lo);
    }

    [target, op, addr, dmaBox].forEach(function (node) {
      node.addEventListener("input", update);
      node.addEventListener("change", update);
    });
    update();
  }

  function buildDecoder(root) {
    var form = el("div", { class: "vdp-form" });
    var input = el("input", { type: "text", value: "$40000010", spellcheck: "false", "aria-label": "Команда" });
    form.appendChild(el("label", {}, "Слово или команда ")).appendChild(input);
    var out = el("div", { class: "vdp-out" });
    var bits = el("div", { class: "vdp-bits-wrap" });
    root.appendChild(form);
    root.appendChild(out);
    root.appendChild(bits);

    function update() {
      var parsed = parseHex(input.value);
      bits.innerHTML = "";
      if (!parsed || parsed.digits > 8) {
        out.innerHTML = '<p class="vdp-error">Введите 16-битное слово ($8174) или 32-битную команду ($418A0003).</p>';
        return;
      }
      var v = parsed.value >>> 0;
      var first = parsed.digits <= 4 ? v : (v >>> 16);

      if ((first >> 14) === 2) {
        out.innerHTML = '<p class="vdp-result">Запись в регистр $' + hex((first >> 8) & 0x1F, 2) +
          " = $" + hex(first & 0xFF, 2) + "</p>" +
          (parsed.digits > 4 ? "<p>Второе слово для записи регистра не нужно.</p>" : "");
        return;
      }
      if (parsed.digits <= 4) {
        out.innerHTML = "<p>Это первое слово команды адреса. Для разбора введите команду целиком, 8 цифр.</p>";
        return;
      }

      var d = decode(v);
      var info = describe(d.cd);
      var html = info
        ? '<p class="vdp-result">' + info.target.name + ", " + info.op + (info.dma ? " через DMA" : "") +
          ", адрес $" + hex(d.addr, 4) + "</p>"
        : '<p class="vdp-error">Неизвестный код операции CD = %' + d.cd.toString(2).padStart(6, "0") + "</p>";
      if (d.junk) html += '<p class="vdp-error">Во втором слове установлены биты, которые должны быть 0.</p>';
      out.innerHTML = html;
      renderBits(bits, d.hi, d.lo);
    }

    input.addEventListener("input", update);
    update();
  }

  function init() {
    var enc = document.getElementById("vdp-command-encoder");
    var dec = document.getElementById("vdp-command-decoder");
    if (enc && !enc.dataset.ready) { enc.dataset.ready = "1"; buildEncoder(enc); }
    if (dec && !dec.dataset.ready) { dec.dataset.ready = "1"; buildDecoder(dec); }
  }

  // Material с мгновенной навигацией сообщает о смене страницы через document$.
  if (typeof document$ !== "undefined") {
    document$.subscribe(init);
  } else if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
