/* Title Share Card */

/**
 * The 1200 × 630 image a shared film or series link shows: the whole poster
 * (never cropped), on its darkened backdrop, with the title, its type and
 * year, and the logo. Link previews are wide and posters are tall, so the
 * poster alone would lose its top and bottom (often the title).
 *
 * satori lays the card out as SVG, resvg (WebAssembly) draws it, and it
 * goes out as a JPEG: WhatsApp drops preview images over about 300 KB, and
 * a photo card as PNG is around 800 KB.
 * Assets come in through `load(path)`, so the same code runs in the Netlify
 * Function (fetching /share/…) and in a local check (reading public/share/…).
 */
import satori from "satori";
import { initWasm, Resvg } from "@resvg/resvg-wasm";
import jpeg from "jpeg-js";

export const WIDTH = 1200;
export const HEIGHT = 630;
const BRAND = "#f67d12";

let ready = null; // { fonts, logo }

async function setup(load) {
  if (ready) return ready;
  const [wasm, regular, bold, logo] = await Promise.all([
    load("/share/resvg.wasm"),
    load("/share/fonts/Quicksand-500.ttf"),
    load("/share/fonts/Quicksand-700.ttf"),
    load("/brand/logo/png/artistry360-logo-horizontal-on-dark-200px.png"),
  ]);
  await initWasm(wasm);
  ready = {
    fonts: [
      { name: "Quicksand", data: regular, weight: 500, style: "normal" },
      { name: "Quicksand", data: bold, weight: 700, style: "normal" },
    ],
    logo: dataUrl(logo, "image/png"),
  };
  return ready;
}

function dataUrl(buffer, type) {
  const bytes = new Uint8Array(buffer);
  let s = "";
  for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return `data:${type};base64,${btoa(s)}`;
}

/** A remote image as a data URL, sized and as JPEG (Unsplash crops on request); null if it can't be had. */
async function photo(src, w, h) {
  if (!src) return null;
  try {
    const u = new URL(src);
    if (u.hostname === "images.unsplash.com") for (const [k, v] of Object.entries({ w, h, fit: "crop", fm: "jpg", q: "80" })) u.searchParams.set(k, String(v));
    const res = await fetch(u, { headers: { accept: "image/jpeg,image/png" } });
    const type = res.headers.get("content-type") ?? "";
    if (!res.ok || !/image\/(jpeg|png)/.test(type)) return null;
    return dataUrl(await res.arrayBuffer(), type.split(";")[0]);
  } catch {
    return null;
  }
}

// satori takes plain { type, props } nodes; h() keeps them readable.
const h = (type, style, ...children) => ({ type, props: { style, children: children.length > 1 ? children : children[0] } });
const img = (src, style) => ({ type: "img", props: { src, style } });

/** JPEG bytes for one title: { title, kind ("Series · 2026"), poster, backdrop }. */
export async function renderTitleCard(t, load) {
  const { fonts, logo } = await setup(load);
  const [poster, backdrop] = await Promise.all([photo(t.poster || t.backdrop, 690, 1035), photo(t.backdrop || t.poster, WIDTH, HEIGHT)]);
  const titleSize = t.title.length > 48 ? 52 : t.title.length > 28 ? 62 : 74;

  const card = h(
    "div",
    { width: WIDTH, height: HEIGHT, display: "flex", position: "relative", background: "#000", fontFamily: "Quicksand", color: "#faf7f2" },
    backdrop ? img(backdrop, { position: "absolute", top: 0, left: 0, width: WIDTH, height: HEIGHT, objectFit: "cover", opacity: 0.55 }) : h("div", { display: "flex" }),
    h("div", { position: "absolute", top: 0, left: 0, width: WIDTH, height: HEIGHT, display: "flex", backgroundImage: "linear-gradient(90deg, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.78) 45%, rgba(0,0,0,0.35) 100%)" }),
    h(
      "div",
      { position: "relative", display: "flex", alignItems: "center", width: WIDTH, height: HEIGHT, padding: "0 64px", gap: 56 },
      poster
        ? img(poster, { width: 345, height: 518, objectFit: "cover", borderRadius: 18, border: "2px solid rgba(255,255,255,0.15)", boxShadow: "0 30px 60px rgba(0,0,0,0.6)" })
        : h("div", { width: 345, height: 518, borderRadius: 18, background: "#1a1a1a", display: "flex" }),
      h(
        "div",
        { display: "flex", flexDirection: "column", justifyContent: "center", flex: 1, height: 518 },
        t.kind ? h("div", { display: "flex", fontSize: 26, fontWeight: 700, color: BRAND, letterSpacing: 4, textTransform: "uppercase", marginBottom: 20 }, t.kind) : h("div", { display: "flex" }),
        h("div", { display: "flex", fontSize: titleSize, fontWeight: 700, lineHeight: 1.08, letterSpacing: -1 }, t.title),
        h("div", { display: "flex", fontSize: 26, fontWeight: 500, color: "rgba(250,247,242,0.7)", marginTop: 24 }, "Watch on The Artistry360 Stream"),
        h("div", { display: "flex", flex: 1 }),
        img(logo, { width: 229, height: 50 }),
      ),
    ),
  );

  const svg = await satori(card, { width: WIDTH, height: HEIGHT, fonts });
  const image = new Resvg(svg, { fitTo: { mode: "width", value: WIDTH } }).render();
  return jpeg.encode({ data: image.pixels, width: image.width, height: image.height }, 82).data;
}
