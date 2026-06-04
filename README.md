# ⚡ QuickLaunch — Your Personal Web Hub

A fast, searchable, categorized browser homepage for all your favorite sites.
Built with pure HTML/CSS/JS — no build tools, no dependencies, deploy anywhere.

## 🚀 Deploy to GitHub Pages (Free)

1. Create a new GitHub repository (e.g. `quicklaunch`)
2. Upload all files: `index.html`, `style.css`, `app.js`, `sites.json`
3. Go to **Settings → Pages**
4. Set Source to `Deploy from branch` → `main` → `/ (root)`
5. Your site will be live at `https://yourusername.github.io/quicklaunch/`

## ➕ Adding / Removing Sites

All site data lives in **`sites.json`** — no code changes needed.

### Add a site
```json
{
  "name": "My Site",
  "url": "https://example.com",
  "description": "What this site does.",
  "category": "tools",
  "tags": ["free", "utilities"],
  "pricing": "free",
  "icon": "🛠️"
}
```

### Pricing options
| Value | Badge shown |
|-------|------------|
| `"free"` | ✓ Free (green) |
| `"paid"` | $ Paid (red) |
| `"freemium"` | ◑ Free/Paid (yellow) |

### Add a new category
In the `"categories"` array:
```json
{
  "id": "my-category",
  "label": "🔖 My Category",
  "color": "#ff6b6b"
}
```
Then use `"category": "my-category"` on any site.

### Mark as 18+
Add `"adult": true` to a site — it gets a 🔞 tag.

## 🗂️ File Structure
```
quicklaunch/
├── index.html   — Page structure
├── style.css    — All styles & animations
├── app.js       — Logic (filtering, search, rendering)
└── sites.json   — ← Edit this to manage your sites
```

## ⌨️ Keyboard Shortcut
- `Ctrl+K` / `Cmd+K` — Focus search bar
- `Esc` — Clear search
