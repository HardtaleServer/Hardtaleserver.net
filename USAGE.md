# Usage

## Linking notes
- For linking mock/live setup, rollout, and rollback checklist, use: `LINKING_LAUNCH_NOTES.md`

## Run the app
1. `cd D:\hytale-server-app`
2. `npm install`
3. `npm start`
4. Open `http://localhost:3000`

## Admin login
Admin access is granted to the Clerk account with email:
- `chashsmurfis@gmail.com`

Admin can:
- Post news
- Delete news
- See notifications badge

## Store + Checkout
- Click **Store** in the navbar to open the store page.
- Click **Add to cart** on any item.
- Click the **cart** icon to open the checkout popup.

## Settings popup
- Click the **gear** icon.
- Set navbar placement (left or center).
- Set theme (system, light, dark) or use the quick toggle.

## System notifications
The notifications popup uses a placeholder list defined in:
- `public/app.js`

Look for:
```
const SYSTEM_NOTIFICATIONS = [
  { id: "sys-001", title: "...", message: "...", author: "System" }
];
```

To add a new system notification:
1. Open `public/app.js`.
2. Append a new object to `SYSTEM_NOTIFICATIONS`.
3. Reload the page.

If you want admin-posted notifications without editing code, ask me to wire a
notifications API (similar to the news posts) and add a simple admin UI.
