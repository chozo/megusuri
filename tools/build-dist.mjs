import { cp, mkdir, readdir, rm } from "node:fs/promises";

// 公開に必要なファイルを dist/megusuri/ にコピーする。public/ の中身（favicon・OGP画像）は直下に置く

const files = ["index.html", "style.css", "game.js"];
await rm("dist", { recursive: true, force: true });
await mkdir("dist/megusuri", { recursive: true });
await Promise.all(files.map(file => cp(file, `dist/megusuri/${file}`)));
await Promise.all((await readdir("public")).map(file => cp(`public/${file}`, `dist/megusuri/${file}`)));
