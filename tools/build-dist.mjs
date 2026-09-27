import { cp, mkdir, rm } from "node:fs/promises";

const files = ["index.html", "style.css", "game.js", "favicon.svg"];
await rm("dist", { recursive: true, force: true });
await mkdir("dist/megusuri", { recursive: true });
await Promise.all(files.map(file => cp(file, `dist/megusuri/${file}`)));
