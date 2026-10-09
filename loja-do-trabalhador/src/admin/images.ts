// Compressão no navegador: converte para WebP (máx. 1600 px, qualidade 0,82) e gera miniatura de 480 px.
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from './firebase';

async function toWebp(file: Blob, max: number, quality: number): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, w, h);
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close?.();
  const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, 'image/webp', quality));
  if (!blob) throw new Error('Não foi possível converter a imagem.');
  return blob;
}

export interface UploadedImage {
  url: string;
  thumb?: string;
  path: string;
}

export async function uploadImage(file: File, folder: string, withThumb = true): Promise<UploadedImage> {
  if (!file.type.startsWith('image/')) throw new Error('Escolha um arquivo de imagem.');
  if (file.size > 25 * 1024 * 1024) throw new Error('Imagem muito grande (máx. 25 MB antes da compressão).');
  const big = await toWebp(file, 1600, 0.82);
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const path = `${folder}/${id}.webp`;
  await uploadBytes(ref(storage, path), big, { contentType: 'image/webp', cacheControl: 'public, max-age=31536000' });
  const url = await getDownloadURL(ref(storage, path));
  let thumb: string | undefined;
  if (withThumb) {
    const small = await toWebp(file, 480, 0.8);
    const tpath = `${folder}/${id}-480.webp`;
    await uploadBytes(ref(storage, tpath), small, { contentType: 'image/webp', cacheControl: 'public, max-age=31536000' });
    thumb = await getDownloadURL(ref(storage, tpath));
  }
  return { url, thumb, path };
}

export async function removeImage(path?: string) {
  if (!path) return;
  for (const p of [path, path.replace(/\.webp$/, '-480.webp')]) {
    try {
      await deleteObject(ref(storage, p));
    } catch {
      /* já não existe */
    }
  }
}
