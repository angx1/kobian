```
 888    d8P  .d88888b.  888888b.   8888888    d8888  888b    888
 888   d8P  d88P" "Y88b 888  "88b   888     d88888  8888b   888
 888  d8P   888     888 888  .88P   888    d88P888  88888b  888
 888d88K    888     888 8888888K.   888   d88P 888  888Y88b 888
 8888888b   888     888 888  "Y88b  888  d88P  888  888 Y88b888
 888  Y88b  888     888 888    888  888 d88P   888  888  Y88888
 888   Y88b Y88b. .d88P 888   d88P  888 d8888888888 888   Y8888
 888    Y88b  "Y88888P"  8888888P" 8888888P     888  888    Y888
```

export kobo highlights → obsidian notes + ai insights

---

## setup

```bash
npm install
```

create `.env.local`:

```env
OPENAI_API_KEY=your-key
OBSIDIAN_VAULT_PATH=~/Library/Mobile Documents/iCloud~md~obsidian/Documents/Vault
KOBO_MOUNT_PATH=/Volumes/KOBOeReader
```

```bash
npm run dev
```

open `localhost:3000`, connect your Kobo via USB.
