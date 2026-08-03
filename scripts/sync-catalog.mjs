#!/usr/bin/env node
/**
 * Synchronisiert Leistungen & Preise aus catalog.json in eine oder
 * mehrere Konfigurator-Seiten (index.html).
 *
 * Aufruf (aus dem VTM-Repo-Root):
 *   node scripts/sync-catalog.mjs [weitere Repo-/Seitenpfade …]
 *
 * Beispiel für VTM + Insurance Monday:
 *   node scripts/sync-catalog.mjs ../im-angebotsplattform
 *
 * Pro Seite wird ersetzt:
 *   1. der JS-Block zwischen CATALOG:BEGIN/END bzw. PRESETS:BEGIN/END
 *      (Reihenfolge gemäß data-catalog-order-Attribut am <body>,
 *       bestimmt auch die Reihenfolge in Zusammenfassung/Anfrage)
 *   2. die statisch vorgerenderten Karten in den
 *      <div class="config-grid" data-group="…">-Grids
 *   3. die statischen Preset-Karten im #preset-grid
 */

import { readFileSync, writeFileSync, existsSync } from "fs";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, "..");
const catalog = JSON.parse(readFileSync(join(ROOT, "catalog.json"), "utf8"));

const fmt = new Intl.NumberFormat("de-DE", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0
});
const nb = (s) => s.replace(/ /g, "&nbsp;");
const itemById = (id) => catalog.items.find((i) => i.id === id);
const tierDisc = (item, qty) => {
  if (!item.tiers) return 0;
  for (const t of item.tiers) if (qty >= t.min) return t.discount;
  return 0;
};
const itemTotal = (item, qty) => Math.round(item.unit * qty * (1 - tierDisc(item, qty)));

const CHECK_SVG =
  '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M2.5 8.5l3.5 3.5 7-8" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';

function cardHTML(item, indent) {
  const p = " ".repeat(indent);
  const l = [];
  l.push(`${p}<article class="offer-card${item.request ? " is-request" : ""}" data-id="${item.id}">`);
  l.push(`${p}  <div class="offer-top">`);
  l.push(`${p}    <div>`);
  l.push(`${p}      <div class="offer-format-row">`);
  l.push(`${p}        <p class="offer-format">${item.format}</p>`);
  if (item.badge) l.push(`${p}        <span class="offer-badge">${item.badge}</span>`);
  l.push(`${p}      </div>`);
  l.push(`${p}      <h4>${item.name}</h4>`);
  l.push(`${p}    </div>`);
  l.push(`${p}    <button type="button" class="offer-check" role="checkbox" aria-checked="false" aria-label="${item.name} auswählen">`);
  l.push(`${p}      <span class="box">${CHECK_SVG}</span>`);
  l.push(`${p}    </button>`);
  l.push(`${p}  </div>`);
  l.push(`${p}  <p class="offer-desc">${item.desc}</p>`);
  if (item.includes) {
    l.push(`${p}  <ul class="offer-includes">`);
    for (const x of item.includes) l.push(`${p}    <li>${x}</li>`);
    l.push(`${p}  </ul>`);
  }
  l.push(`${p}  <div class="offer-bottom">`);
  l.push(`${p}    <div class="offer-price">`);
  if (item.request) {
    l.push(`${p}      <strong class="price-request">Auf Anfrage</strong><span>individuell kalkuliert</span>`);
  } else {
    l.push(`${p}      <strong>${nb(fmt.format(item.unit))}</strong><span>${item.unitSuffix}</span>`);
  }
  l.push(`${p}    </div>`);
  if (item.request) {
    l.push(`${p}    <span class="tag tag-brass">Im Gespräch klären</span>`);
  } else {
    l.push(`${p}    <div class="stepper" aria-label="Menge wählen">`);
    l.push(`${p}      <button type="button" data-step="-1" aria-label="Weniger">−</button>`);
    l.push(`${p}      <output>1 ${item.qtyLabel || ""}</output>`);
    l.push(`${p}      <button type="button" data-step="1" aria-label="Mehr">+</button>`);
    l.push(`${p}    </div>`);
  }
  l.push(`${p}  </div>`);
  l.push(`${p}</article>`);
  return l.join("\n");
}

function presetHTML(preset, indent) {
  const p = " ".repeat(indent);
  const total = Object.entries(preset.items).reduce((s, [id, q]) => {
    const it = itemById(id);
    return s + (it && !it.request ? itemTotal(it, q) : 0);
  }, 0);
  const l = [];
  l.push(`${p}<article class="preset-card${preset.featured ? " is-featured" : ""}" data-preset="${preset.id}">`);
  l.push(`${p}  <span class="preset-badge">${preset.badge}</span>`);
  l.push(`${p}  <h4>${preset.name}</h4>`);
  l.push(`${p}  <p class="offer-desc"${preset.featured ? ' style="color: rgb(255 255 255 / 0.78);"' : ""}>${preset.tagline}</p>`);
  l.push(`${p}  <ul class="offer-includes">`);
  for (const [id, qty] of Object.entries(preset.items)) {
    const it = itemById(id);
    l.push(`${p}    <li>${it.name} · ${qty} ${it.qtyLabel || "×"}</li>`);
  }
  l.push(`${p}  </ul>`);
  l.push(`${p}  <p class="preset-price">${nb(fmt.format(total))}<span>gesamt netto</span></p>`);
  l.push(`${p}  <button type="button" class="button ${preset.featured ? "button-primary" : "button-secondary"}">Paket übernehmen</button>`);
  l.push(`${p}</article>`);
  return l.join("\n");
}

function jsLiteral(value) {
  /* JSON ist gültiges JS – mit Einrückung passend zum Skriptblock */
  return JSON.stringify(value, null, 2).replace(/\n/g, "\n    ");
}

function syncFile(file) {
  let src = readFileSync(file, "utf8");

  /* Reihenfolge aus dem body-Attribut der Zielseite */
  const orderMatch = src.match(/data-catalog-order="([^"]+)"/);
  const order = orderMatch
    ? orderMatch[1].split(",").map((s) => s.trim())
    : ["reichweite", "content", "podcast", "anfrage"];
  const sorted = [...catalog.items].sort(
    (a, b) => order.indexOf(a.group) - order.indexOf(b.group)
  );

  /* 1. JS-Blöcke zwischen den Markern ersetzen (fehlen die Marker,
     ist die Seite nicht sync-fähig → hart abbrechen statt still
     veraltete Preise stehen zu lassen) */
  if (!/\/\* CATALOG:BEGIN[\s\S]*?CATALOG:END \*\//.test(src)) {
    throw new Error(file + ": CATALOG:BEGIN/END-Marker fehlen");
  }
  if (!/\/\* PRESETS:BEGIN[\s\S]*?PRESETS:END \*\//.test(src)) {
    throw new Error(file + ": PRESETS:BEGIN/END-Marker fehlen");
  }
  if (!orderMatch) {
    throw new Error(file + ': data-catalog-order-Attribut am <body> fehlt');
  }
  src = src.replace(
    /\/\* CATALOG:BEGIN[\s\S]*?CATALOG:END \*\//,
    "/* CATALOG:BEGIN (generiert aus catalog.json – nicht von Hand ändern) */\n    const CATALOG = " +
      jsLiteral(sorted) + ";\n    /* CATALOG:END */"
  );
  src = src.replace(
    /\/\* PRESETS:BEGIN[\s\S]*?PRESETS:END \*\//,
    "/* PRESETS:BEGIN (generiert aus catalog.json – nicht von Hand ändern) */\n    const PRESETS = " +
      jsLiteral(catalog.presets) + ";\n    /* PRESETS:END */"
  );

  /* Container-Inhalt per <div>-Klammerzählung ersetzen (Karten
     enthalten verschachtelte divs – Regex bis zum ersten </div>
     würde zu früh enden) */
  function replaceContainer(source, openTag, newInner) {
    const start = source.indexOf(openTag);
    if (start < 0) throw new Error(file + ": Container fehlt: " + openTag);
    let pos = start + openTag.length;
    let depth = 1;
    const re = /<div\b|<\/div>/g;
    re.lastIndex = pos;
    let m;
    while ((m = re.exec(source))) {
      depth += m[0] === "</div>" ? -1 : 1;
      if (depth === 0) break;
    }
    if (depth !== 0) throw new Error(file + ": Container nicht geschlossen: " + openTag);
    const closeStart = m.index;
    return (
      source.slice(0, start + openTag.length) +
      "\n" + newInner + "\n              " +
      source.slice(closeStart)
    );
  }

  /* 2. Statische Karten-Grids neu befüllen */
  for (const group of ["reichweite", "content", "podcast", "anfrage"]) {
    const items = sorted.filter((i) => i.group === group);
    src = replaceContainer(
      src,
      '<div class="config-grid" data-group="' + group + '">',
      items.map((i) => cardHTML(i, 16)).join("\n")
    );
  }

  /* 3. Statische Preset-Karten neu befüllen */
  src = replaceContainer(
    src,
    '<div class="preset-grid" id="preset-grid">',
    catalog.presets.map((p) => presetHTML(p, 16)).join("\n")
  );

  writeFileSync(file, src);
  console.log("✓", file, "— Reihenfolge:", order.join(" → "));
}

/* Eigene Seite immer, weitere Ziele per Argument */
const targets = [join(ROOT, "index.html")];
for (const arg of process.argv.slice(2)) {
  const p = resolve(arg.endsWith(".html") ? arg : join(arg, "index.html"));
  if (!existsSync(p)) throw new Error("Ziel nicht gefunden: " + p);
  targets.push(p);
}
targets.forEach(syncFile);
console.log("Fertig:", targets.length, "Seite(n) synchronisiert.");
