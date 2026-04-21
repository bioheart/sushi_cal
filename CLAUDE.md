# Sushi Plate Counter

A mobile-friendly web app for sushi conveyor belt (kaiten-zushi) restaurants to count plates and calculate the total bill in Thai Baht (THB).

## Project Structure

```
sushi_cal/
├── index.html        # HTML markup — no inline JS or CSS
├── app.js            # All JavaScript logic
├── styles.scss       # SCSS source (edit this)
├── styles.css        # Compiled CSS output (do not edit directly)
├── plates.json       # Plate definitions (color, price, name)
├── version.json      # App version metadata
├── server.js         # Lightweight static file server (Node built-ins only)
├── package.json      # npm scripts + nodemon config
└── .claude/
    └── launch.json   # Dev server configurations
```

## Dev Server

```bash
npm run dev
```

Starts nodemon on **http://localhost:3000** and auto-restarts on changes to any `.html`, `.js`, `.css`, or `.json` file. Stop with `Ctrl + C`.

To kill the port manually:
```bash
kill $(lsof -ti :3000)
```

## Compile SCSS

```bash
npx sass styles.scss styles.css --style=expanded --no-source-map
```

Always edit `styles.scss` — never edit `styles.css` directly.

## Plate Data (`plates.json`)

Plates are loaded at runtime via `fetch('plates.json')`. Each plate object:

```json
{
  "id": "white",
  "name": "White",
  "price": 30,
  "color": "#f5f5f0",
  "borderColor": "#cccccc",
  "editable": false
}
```

| Field         | Type    | Description                                  |
|---------------|---------|----------------------------------------------|
| `id`          | string  | Unique identifier                            |
| `name`        | string  | Display name                                 |
| `price`       | number  | Price in THB                                 |
| `color`       | string  | CSS color or gradient for the dot            |
| `borderColor` | string  | Border color of the dot                      |
| `editable`    | boolean | `false` = preset plate, `true` = custom plate |

To add or change a preset plate, edit `plates.json` — no code changes needed.

## Preset Plates

| Name   | Price (฿) | Color                        |
|--------|-----------|------------------------------|
| White  | 30        | `#f5f5f0`                    |
| Red    | 40        | `#e74c3c`                    |
| Silver | 60        | gradient `#bdc3c7 → #95a5a6` |
| Gold   | 80        | gradient `#f7c948 → #d4a017` |
| Black  | 100       | `#2c2520`                    |

## Features

- **Tap a plate card** to increment its count by 1
- **− button** (shown when count > 0) to decrement by 1
- **Undo** — reverts the last action; keeps up to 10 history snapshots
- **Reset** — zeros all preset plate counts and removes all custom plates
- **Custom plates** — add via the "＋ Add Custom Plate" button with a name and price; start with count 1; price is editable; deletable via the 🗑 button
- **Total** — live THB total shown in the sticky footer

## Architecture Notes

- No build tools or bundlers — pure vanilla HTML/JS/CSS
- `app.js` wires all DOM events in a single `DOMContentLoaded` listener — zero inline `onclick` attributes in HTML
- Dot colors are applied as inline styles from `plates.json`, so no CSS changes are needed to add new plate colours
- `server.js` uses Node built-ins only (`http`, `fs`, `path`) — no `npm install` required
