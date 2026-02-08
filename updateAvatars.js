// updateAvatarsFinal.js
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// __dirname en ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SRC_DIR = path.join(__dirname, "src");

// Parcours récursif des fichiers JSX
function walk(dir) {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  for (const file of files) {
    const fullPath = path.join(dir, file.name);
    if (file.isDirectory()) walk(fullPath);
    else if (file.name.endsWith(".jsx")) processFile(fullPath);
  }
}

// Traitement d’un fichier JSX
function processFile(filePath) {
  let content = fs.readFileSync(filePath, "utf-8");
  const original = content;

  // 1️⃣ Supprimer MEDIA_BASE
  content = content.replace(/const\s+MEDIA_BASE\s*=\s*.*?;\s*\n?/g, "");

  // 2️⃣ Ajouter import media.js si absent
  if (!/mediaUrl/.test(content)) {
    const importLine = `import { mediaUrl, defaultAvatar } from "../utils/media";\n`;
    content = content.replace(/(import .* from .*;\n)(?!import)/, `$1${importLine}`);
  }

  // 3️⃣ Remplacer toutes les concaténations `${MEDIA_BASE}/...` ou MEDIA_BASE + ...
  content = content.replace(/\$\{MEDIA_BASE\}\/?([^\s'"}]+avatar[^\s'"}]*)/g, `mediaUrl("$1")`);
  content = content.replace(/MEDIA_BASE\s*\+\s*(['"`]\/uploads\/avatars\/[^\s'"`]+['"`])/g, `mediaUrl($1)`);

  // 4️⃣ Transformer les props React avatarUrl en mediaUrl(...) || defaultAvatar
  const avatarProps = [
    "post.user.avatarUrl",
    "comment.authorAvatarUrl",
    "otherUser.avatarUrl",
    "user.avatarUrl",
    "m.senderAvatarUrl",
  ];
  for (const prop of avatarProps) {
    const regex = new RegExp(`\\b${prop}\\b`, "g");
    content = content.replace(regex, `(${prop} ? mediaUrl(${prop}) : defaultAvatar)`);
  }

  // 5️⃣ Transformer tous les <img src={...} /> d’avatars en <Avatar>
  content = content.replace(
    /<img\s+src=\{([^\}]+)\}([^>]*)\/?>/g,
    (_, srcExpr, restAttrs) => {
      return `<Avatar className="w-16 h-16"><AvatarImage src={${srcExpr} || defaultAvatar} /><AvatarFallback>👤</AvatarFallback></Avatar>`;
    }
  );

  if (content !== original) {
    fs.writeFileSync(filePath, content, "utf-8");
    console.log("✅ Mis à jour :", filePath);
  }
}

// Lancement
walk(SRC_DIR);
console.log("✅ Tous les fichiers traités !");
