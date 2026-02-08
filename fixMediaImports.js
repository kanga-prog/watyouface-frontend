// fixMediaImports.js
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SRC_DIR = path.join(__dirname, "src");

// Calculer le chemin relatif correct
function relativeMediaPath(filePath) {
  const fileDir = path.dirname(filePath);
  const mediaPath = path.join(__dirname, "src", "utils", "media.js");
  let relPath = path.relative(fileDir, mediaPath);
  // Ajuster pour import JS (./ ou ../)
  if (!relPath.startsWith(".")) relPath = "./" + relPath;
  // enlever l’extension .js
  relPath = relPath.replace(/\.js$/, "");
  return relPath.split(path.sep).join("/"); // pour compatibilité Vite
}

// Parcours récursif des fichiers
function walk(dir) {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  for (const file of files) {
    const fullPath = path.join(dir, file.name);
    if (file.isDirectory()) walk(fullPath);
    else if (file.name.endsWith(".jsx")) processFile(fullPath);
  }
}

// Traiter un fichier JSX
function processFile(filePath) {
  let content = fs.readFileSync(filePath, "utf-8");
  const original = content;

  // Remplacer les imports media.js
  content = content.replace(
    /import\s+\{\s*mediaUrl\s*,\s*defaultAvatar\s*\}\s+from\s+['"].*media['"]/g,
    `import { mediaUrl, defaultAvatar } from "${relativeMediaPath(filePath)}"`
  );

  if (content !== original) {
    fs.writeFileSync(filePath, content, "utf-8");
    console.log("✅ Mis à jour :", filePath);
  }
}

// Lancer le script
walk(SRC_DIR);
console.log("✅ Tous les imports media.js sont corrigés !");
