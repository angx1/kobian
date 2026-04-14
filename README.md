```
 ██╗  ██╗ ██████╗ ██████╗ ██╗ █████╗ ███╗   ██╗
 ██║ ██╔╝██╔═══██╗██╔══██╗██║██╔══██╗████╗  ██║
 █████╔╝ ██║   ██║██████╔╝██║███████║██╔██╗ ██║
 ██╔═██╗ ██║   ██║██╔══██╗██║██╔══██║██║╚██╗██║
 ██║  ██╗╚██████╔╝██████╔╝██║██║  ██║██║ ╚████║
 ╚═╝  ╚═╝ ╚═════╝ ╚═════╝ ╚═╝╚═╝  ╚═╝╚═╝  ╚═══╝
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
