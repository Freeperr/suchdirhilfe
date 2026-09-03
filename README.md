# The Button

Simple minimalist web game with a red button. Each press has a reset chance that
starts at 1% and increases by 1% per press (capped at 99%). On a reset the chance
goes back to 1%. Username, score and playtime are stored in Supabase.

## Project structure

```
The button/
├── index.html
├── css/style.css
├── js/
│   ├── config.js           <-- Supabase credentials go here
│   ├── app.js              game logic
│   ├── audio.js            sound effects (Web Audio API)
│   ├── scoreboard.js       Supabase scoreboard logic
│   ├── username-filter.js  multi-language bad-words filter
│   └── translations.js     DE/EN texts
└── supabase-setup.sql      run this in the Supabase SQL editor
```

## 1) Supabase setup (do this once)

1. Go to <https://supabase.com> and sign in to your existing project.
2. In the left sidebar open **SQL Editor** → **New query**.
3. Copy everything from `supabase-setup.sql` into the editor and press **Run**.
   This creates the `players` table (username / playtime / score) and enables
   Row Level Security so anonymous visitors can read, insert and update scores.
4. In the left sidebar open **Project Settings** → **API**.
5. Copy your **Project URL** (looks like `https://XXXXXXXX.supabase.co`).
6. Copy your **anon public** key (a long `eyJ...` string).

### 2) Enter the credentials

Open `js/config.js` and replace the two placeholders:

```js
const SUPABASE_URL = 'https://YOUR-PROJECT.supabase.co';
const SUPABASE_ANON_KEY = 'eyJ...your-anon-key...';
```

> The **anon public** key is safe to keep in this file — it is already public
> inside your website anyway. Real protection comes from RLS, not from hiding
> the anon key. Never put the `service_role` key in client code.

## 3) GitHub Pages

1. Create a repo on GitHub and push this folder.
2. Repo → **Settings** → **Pages** → under "Build and deployment" set Source
   to "Deploy from a branch", branch `main`, folder `/ (root)`. Save.
3. Wait a minute; your site is live at `https://<username>.github.io/<repo>/`.

If you host under a sub-path, add a base tag in `index.html`:
`<base href="/<repo>/">`.

## 4) Vercel

1. Sign in at <https://vercel.com> with GitHub.
2. **Add New Project** → import your repo.
3. Framework Preset: **Other**. Build Command / Output Directory: leave empty
   (it's a static site). Deploy.
4. It's live at `https://<projectname>.vercel.app`. Custom domain optional.

## Notes

- Usernames are unique across all players (enforced by the DB unique constraint
  and the `isTaken` check).
- The app falls back to localStorage if Supabase is not configured yet, so it
  still runs locally while you're setting things up.
- Playtime is synced to the DB every 5 seconds.
