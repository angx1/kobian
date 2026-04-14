import path from "path";

const home = process.env.HOME || "";

export const config = {
  koboMountPath: process.env.KOBO_MOUNT_PATH || "/Volumes/KOBOeReader",
  koboDatabasePath:
    process.env.KOBO_MOUNT_PATH
      ? `${process.env.KOBO_MOUNT_PATH}/.kobo/KoboReader.sqlite`
      : "/Volumes/KOBOeReader/.kobo/KoboReader.sqlite",
  vaultPath: process.env.OBSIDIAN_VAULT_PATH
    ? process.env.OBSIDIAN_VAULT_PATH.replace("~", home)
    : path.join(
        home,
        "Library/Mobile Documents/iCloud~md~obsidian/Documents/Vault"
      ),
  highlightsOutputDir: "references/books/raw-notes",
  insightsOutputDir: "references/books",
};
