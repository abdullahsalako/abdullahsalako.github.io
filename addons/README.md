# Portfolio add-ons

Small, optional effects that sit on top of your **existing** design. Nothing changes on a page until you opt in. They use your own fonts and variables (`--accent`, `--ink`, `--paper`).

**Try them:** open `/addons/demo.html` (after this branch is deployed, or locally).

## Install on any page
```html
<link rel="stylesheet" href="/addons/addons.css">
<script src="/addons/addons.js" defer></script>   <!-- before </body> -->
```
Turn features on/off in the `ON = {...}` block at the top of `addons.js`, or per page: `<script>window.AO = { cursor: false }</script>` before the script tag.

| Effect | How to use | Notes |
|---|---|---|
| **Cursor dot** | Automatic. Add `data-cursor-big` to anything that should make it swell (headings already do) | Hidden on touch devices |
| **Scroll progress line** | Automatic | 2px accent line at the top |
| **Fade-up on scroll** | `data-reveal` (or `data-reveal="2"`, `"3"` for a stagger) | |
| **Word-by-word fill** | `data-fill` on a heading or paragraph | Words go from soft grey to ink as you scroll |
| **Hero recede + curved panel** | `data-recede` on a `position: sticky; top: 0` hero, `class="ao-curve"` on the next section | |
| **Marquee ticker** | `<div class="ao-marquee"><div class="ao-marquee__track"><span>Editing</span>...</div></div>` | Pauses on hover |
| **Hover-shift rows** | `<ul class="ao-rows"><li><a href=...>...</a></li></ul>` | |
| **Page-transition curtain** | `window.AO = { curtain: true }` | Accent-coloured dome wipes between pages. Off by default |

All effects switch off (or show instantly) when the visitor has "reduce motion" enabled.

Colours: `--ao-ghost` (unread words) and `--ao-panel` (curved section) are at the top of `addons.css`.
