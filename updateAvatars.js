// updateAvatarsFinal.js
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SRC_DIR = path.join(__dirname, "src");

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (entry.name.endsWith(".jsx")) processFile(full);
  }
}

function processFile(filePath) {
  let content = fs.readFileSync(filePath, "utf-8");
  const original = content;

  // 1️⃣ Supprimer MEDIA_BASE
  content = content.replace(/const\s+MEDIA_BASE\s*=.*?;\s*/g, "");

  // 2️⃣ Ajouter import media si absent
  if (!content.includes("mediaUrl")) {
    content = content.replace(
      /(import .*;\n)/,
      `$1import { mediaUrl, defaultAvatar } from "../utils/media";\n`
    );
  }

  // 3️⃣ Normalisation des avatars (IDEMPOTENTE)
  const avatarProps = [
    "post.user.avatarUrl",
    "comment.authorAvatarUrl",
    "otherUser.avatarUrl",
    "user.avatarUrl",
    "m.senderAvatarUrl",
  ];

  for (const prop of avatarProps) {
    // remplace uniquement si mediaUrl n’est PAS déjà présent
    const regex = new RegExp(
      `\\b${prop}\\b(?!\\s*\\))`,
      "g"
    );

    content = content.replace(regex, (match, offset) => {
      const before = content.slice(Math.max(0, offset - 30), offset);
      if (before.includes("mediaUrl")) return match;

      return `${prop} ? mediaUrl(${prop}) : defaultAvatar`;
    });
  }

  // 4️⃣ Fix <img src={...}>
  content = content.replace(
    /<img\s+src=\{([^}]+)\}([^>]*)\/?>/g,
    (_, src, rest) => {
      if (src.includes("mediaUrl")) {
        return `<Avatar><AvatarImage src={${src}} /><AvatarFallback>👤</AvatarFallback></Avatar>`;
      }
      return `<Avatar><AvatarImage src={${src} || defaultAvatar} /><AvatarFallback>👤</AvatarFallback></Avatar>`;
    }
  );

  if (content !== original) {
    fs.writeFileSync(filePath, content, "utf-8");
    console.log("✅ Corrigé :", filePath);
  }
}

walk(SRC_DIR);
console.log("🎉 Avatars normalisés sans récursion !");
