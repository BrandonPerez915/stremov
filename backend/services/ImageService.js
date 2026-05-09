import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

const AVATARS_DIR = path.join(__dirname, '../public/avatars');

if (!fs.existsSync(AVATARS_DIR)) {
  fs.mkdirSync(AVATARS_DIR, { recursive: true });
}

/**
 * Guarda una imagen base64 en disco y devuelve la ruta pública.
 * @param {string} base64String - La imagen en formato data:image/xxx;base64,...
 * @param {string} userId - ID del usuario se usa como nombre de archivo
 * @returns {string} Ruta pública accesible desde frontend 
 */
function saveBase64Image(base64String, userId) {
  const matches = base64String.match(/^data:image\/(\w+);base64,(.+)$/);

  if (!matches) {
    throw new Error('Formato de imagen inválido');
  }

  const extension = matches[1] === 'jpeg' ? 'jpg' : matches[1];
  const base64Data = matches[2];
  const buffer = Buffer.from(base64Data, 'base64');

  if (buffer.length > 2 * 1024 * 1024) {
    throw new Error('La imagen no puede superar los 2MB');
  }

  const allowedExtensions = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
  if (!allowedExtensions.includes(extension)) {
    throw new Error('Formato de imagen no soportado. Usa JPG, PNG, WEBP o GIF');
  }

  const filename = `${userId}.${extension}`;
  const filepath = path.join(AVATARS_DIR, filename);

  //Borrar avatar anterior si tenía diferente extensión
  const existing = fs.readdirSync(AVATARS_DIR).find(f =>
    f.startsWith(`${userId}.`) && f !== filename
  );
  if (existing) fs.unlinkSync(path.join(AVATARS_DIR, existing));

  fs.writeFileSync(filepath, buffer);

  return `/avatars/${filename}`;
}

/**
 * Elimina el avatar de un usuario del disco.
 */
function deleteUserAvatar(userId) {
  try {
    const existing = fs.readdirSync(AVATARS_DIR).find(f => f.startsWith(`${userId}.`));
    if (existing) fs.unlinkSync(path.join(AVATARS_DIR, existing));
  } catch {
    //Si no existe no hay problema
  }
}

export { saveBase64Image, deleteUserAvatar };