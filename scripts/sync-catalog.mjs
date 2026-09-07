#!/usr/bin/env node
/**
 * Synchronisiert Leistungen, Preise und Detailtexte aus catalog.json
 * (Version 2.0) in eine oder mehrere Konfigurator-Seiten (index.html).
 *
 * Aufruf (aus dem VTM-Repo-Root):
 *   node scripts/sync-catalog.mjs [weitere Repo-/Seitenpfade …]
 *
 * Beispiel für VTM + Insurance Monday:
 *   node scripts/sync-catalog.mjs ../inmo-angebotsplattform
 *
 * Pro Seite wird ersetzt:
 *   1. der JS-Block zwischen CATALOG:BEGIN/END
 *      (Reihenfolge der Gruppen gemäß data-catalog-order am <body>,
 *       bestimmt auch die Reihenfolge in Zusammenfassung/Anfrage)
 *   2. die statisch vorgerenderten Karten in den
 *      <div class="config-grid" data-group="…">-Grids
 *      (jede Gruppe aus data-catalog-order muss ein Grid besitzen)
 *   3. optional: Detailblöcke <div class="leistung-details" data-details="…">
 *      und Grundsätze <div class="principles" data-principles>
 *
 * Alte Preset-Marker (PRESETS:BEGIN) gelten als Fehler: Presets gibt es
 * seit Version 2.0 nicht mehr.
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
const esc = (s) =>
  String(s).replace(/&(?!(amp|nbsp|lt|gt|quot);)/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/* Preisformel: unit × Produkt aller Dimensionen (bzw. × qty) */
export function itemTotal(item, val) {
  if (item.dims) {
    return item.dims.reduce((sum, d) => sum * (val && val[d.key] ? val[d.key] : d.default), item.unit);
  }
  return item.unit * (typeof val === "number" ? val : 1);
}

const CHECK_SVG =
  '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M2.5 8.5l3.5 3.5 7-8" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';

function stepperHTML(p, dim) {
  const attrs = dim ? ` data-dim="${dim.key}"` : "";
  const label = dim ? `${dim.plural} wählen` : "Menge wählen";
  const initial = dim ? `${dim.default} ${dim.default === 1 ? dim.singular : dim.plural}` : "";
  const l = [];
  l.push(`${p}<div class="stepper"${attrs} aria-label="${label}">`);
  l.push(`${p}  <button type="button" data-step="-1" aria-label="Weniger">−</button>`);
  l.push(`${p}  <output>${initial}</output>`);
  l.push(`${p}  <button type="button" data-step="1" aria-label="Mehr">+</button>`);
  l.push(`${p}</div>`);
  return l.join("\n");
}

function cardHTML(item, indent) {
  const p = " ".repeat(indent);
  const l = [];
  l.push(`${p}<article class="offer-card" data-id="${item.id}">`);
  l.push(`${p}  <div class="offer-top">`);
  l.push(`${p}    <div>`);
  l.push(`${p}      <div class="offer-format-row">`);
  l.push(`${p}        <p class="offer-format">${esc(item.format)}</p>`);
  if (item.badge) l.push(`${p}        <span class="offer-badge">${esc(item.badge)}</span>`);
  l.push(`${p}      </div>`);
  l.push(`${p}      <h4>${esc(item.name)}</h4>`);
  l.push(`${p}    </div>`);
  l.push(`${p}    <button type="button" class="offer-check" role="checkbox" aria-checked="false" aria-label="${esc(item.name)} auswählen">`);
  l.push(`${p}      <span class="box">${CHECK_SVG}</span>`);
  l.push(`${p}    </button>`);
  l.push(`${p}  </div>`);
  l.push(`${p}  <p class="offer-desc">${esc(item.desc)}</p>`);
  if (item.includes) {
    l.push(`${p}  <ul class="offer-includes">`);
    for (const x of item.includes) l.push(`${p}    <li>${esc(x)}</li>`);
    l.push(`${p}  </ul>`);
  }
  l.push(`${p}  <div class="offer-bottom">`);
  l.push(`${p}    <div class="offer-price">`);
  l.push(`${p}      <strong>${nb(fmt.format(item.unit))}</strong><span>${esc(item.unitSuffix)}</span>`);
  if (item.priceMeta) l.push(`${p}      <small class="offer-meta">${esc(item.priceMeta)}</small>`);
  l.push(`${p}    </div>`);
  if (item.dims) {
    l.push(`${p}    <div class="stepper-group">`);
    for (const d of item.dims) l.push(stepperHTML(p + "      ", d));
    l.push(`${p}    </div>`);
  } else {
    /* Ein-Dimensions-Stepper: Ausgabe „1 Kampagne(n)“ wird vom JS gesetzt,
       statisch steht die Einheit mit Menge 1 */
    l.push(
      stepperHTML(p + "    ", null).replace("<output></output>", `<output>1 ${esc(item.qtyLabel || "")}</output>`)
    );
  }
  l.push(`${p}  </div>`);
  l.push(`${p}</article>`);
  return l.join("\n");
}

function detailsHTML(id, indent) {
  const d = catalog.details[id];
  const p = " ".repeat(indent);
  const l = [];
  l.push(`${p}<p class="detail-priceline">${esc(d.priceLine)}</p>`);
  l.push(`${p}<div class="detail-grid">`);
  l.push(`${p}  <dl class="detail-blocks">`);
  for (const b of d.blocks) {
    l.push(`${p}    <div class="detail-block">`);
    l.push(`${p}      <dt>${esc(b.title)}</dt>`);
    l.push(`${p}      <dd>${esc(b.text)}</dd>`);
    l.push(`${p}    </div>`);
  }
  l.push(`${p}  </dl>`);
  l.push(`${p}  <aside class="detail-benefits" aria-label="Nutzen">`);
  for (const b of d.benefits) {
    l.push(`${p}    <div class="benefit">`);
    l.push(`${p}      <p class="benefit-for">${esc(b.for)}</p>`);
    l.push(`${p}      <p>${esc(b.text)}</p>`);
    l.push(`${p}    </div>`);
  }
  l.push(`${p}  </aside>`);
  l.push(`${p}</div>`);
  return l.join("\n");
}

function principlesHTML(indent) {
  const p = " ".repeat(indent);
  const l = [];
  for (const pr of catalog.principles) {
    l.push(`${p}<div class="principle">`);
    l.push(`${p}  <p class="principle-label">${esc(pr.label)}</p>`);
    l.push(`${p}  <h3>${esc(pr.title)}</h3>`);
    l.push(`${p}  <p>${esc(pr.text)}</p>`);
    l.push(`${p}</div>`);
  }
  return l.join("\n");
}

function jsLiteral(value) {
  /* JSON ist gültiges JS – mit Einrückung passend zum Skriptblock */
  return JSON.stringify(value, null, 2).replace(/\n/g, "\n    ");
}

/* Container-Inhalt per <div>-Klammerzählung ersetzen (Karten enthalten
   verschachtelte divs – Regex bis zum ersten </div> würde zu früh enden) */
function replaceContainer(file, source, openTag, newInner, required = true) {
  const start = source.indexOf(openTag);
  if (start < 0) {
    if (required) throw new Error(file + ": Container fehlt: " + openTag);
    return { src: source, done: false };
  }
  let depth = 1;
  const re = /<div\b|<\/div>/g;
  re.lastIndex = start + openTag.length;
  let m;
  while ((m = re.exec(source))) {
    depth += m[0] === "</div>" ? -1 : 1;
    if (depth === 0) break;
  }
  if (depth !== 0) throw new Error(file + ": Container nicht geschlossen: " + openTag);
  return {
    src:
      source.slice(0, start + openTag.length) +
      "\n" + newInner + "\n              " +
      source.slice(m.index),
    done: true
  };
}

function syncFile(file) {
  let src = readFileSync(file, "utf8");

  if (/PRESETS:BEGIN/.test(src) || /id="preset-grid"/.test(src)) {
    throw new Error(file + ": enthält noch Preset-Reste (PRESETS:BEGIN oder preset-grid-ID), Version 2.0 kennt keine Presets");
  }
  if (!/\/\* CATALOG:BEGIN[\s\S]*?CATALOG:END \*\//.test(src)) {
    throw new Error(file + ": CATALOG:BEGIN/END-Marker fehlen");
  }
  const orderMatch = src.match(/data-catalog-order="([^"]+)"/);
  if (!orderMatch) throw new Error(file + ": data-catalog-order-Attribut am <body> fehlt");
  const order = orderMatch[1].split(",").map((s) => s.trim());
  const known = catalog.groups.map((g) => g.id);
  for (const g of order) if (!known.includes(g)) throw new Error(file + ": unbekannte Gruppe in data-catalog-order: " + g);
  for (const g of known) if (!order.includes(g)) throw new Error(file + ": Gruppe fehlt in data-catalog-order: " + g);

  const sorted = [...catalog.items].sort((a, b) => order.indexOf(a.group) - order.indexOf(b.group));

  /* 1. JS-Block */
  src = src.replace(
    /\/\* CATALOG:BEGIN[\s\S]*?CATALOG:END \*\//,
    "/* CATALOG:BEGIN (generiert aus catalog.json – nicht von Hand ändern) */\n    const CATALOG = " +
      jsLiteral(sorted) + ";\n    /* CATALOG:END */"
  );

  /* 2. Karten-Grids */
  for (const group of order) {
    const items = sorted.filter((i) => i.group === group);
    src = replaceContainer(file, src, '<div class="config-grid" data-group="' + group + '">',
      items.map((i) => cardHTML(i, 16)).join("\n")).src;
  }

  /* 3. Detailblöcke + Grundsätze (optional je Seite) */
  let details = 0;
  for (const id of Object.keys(catalog.details)) {
    const r = replaceContainer(file, src, '<div class="leistung-details" data-details="' + id + '">', detailsHTML(id, 16), false);
    src = r.src; if (r.done) details++;
  }
  const pr = replaceContainer(file, src, '<div class="principles" data-principles>', principlesHTML(14), false);
  src = pr.src;

  writeFileSync(file, src);
  console.log("✓", file, "— Reihenfolge:", order.join(" → "), "· Karten:", sorted.length,
    "· Detailblöcke:", details, "· Grundsätze:", pr.done ? "ja" : "nein");
}

/* Nur bei direktem Aufruf synchronisieren (Import für Tests möglich) */
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const targets = [join(ROOT, "index.html")];
  for (const arg of process.argv.slice(2)) {
    const p = resolve(arg.endsWith(".html") ? arg : join(arg, "index.html"));
    if (!existsSync(p)) throw new Error("Ziel nicht gefunden: " + p);
    targets.push(p);
  }
  targets.forEach(syncFile);
  console.log("Fertig:", targets.length, "Seite(n) synchronisiert.");
}
