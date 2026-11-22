// Thin wrapper around Supabase Storage for the Admin Email composer.
//
// Images picked in the RichTextEditor are uploaded here, then the returned
// public URL is inserted into the editor as the `<img src>`. The bucket is
// public-read so the delivered email can load the image without auth; the
// write policies live in docs/ADD_EMAIL_ASSETS_BUCKET.sql.

import { supabase } from './supabase';

export const EMAIL_ASSETS_BUCKET = 'email-assets';
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;              // 5 MB
export const ALLOWED_IMAGE_MIME = new Set([
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
]);

function sanitizeFilename(name) {
  return String(name || 'image')
    .replace(/\s+/g, '-')
    .replace(/[^a-zA-Z0-9._-]/g, '')
    .replace(/-+/g, '-')
    .slice(-80) || 'image';
}

/**
 * Validate a file before upload. Throws a user-friendly Error on failure.
 */
export function validateImageFile(file) {
  if (!file) throw new Error('No file selected.');
  if (!ALLOWED_IMAGE_MIME.has(file.type)) {
    throw new Error('Only JPG, PNG, GIF, and WEBP images are allowed.');
  }
  if (file.size > MAX_IMAGE_BYTES) {
    const mb = (file.size / 1024 / 1024).toFixed(1);
    throw new Error(`Image is ${mb} MB — the max is 5 MB.`);
  }
}

/**
 * Upload one image to the email-assets bucket and return its public URL.
 *
 * @param {File} file   Browser File object from an <input type="file">.
 * @param {object} [opts]
 * @param {string} [opts.prefix]  Folder prefix, e.g. a broadcast or schedule
 *                                id. Defaults to 'inline' so stray uploads
 *                                remain grouped.
 * @returns {Promise<{ path: string, url: string }>}
 */
export async function uploadEmailImage(file, opts = {}) {
  validateImageFile(file);
  const prefix = (opts.prefix || 'inline').replace(/[^a-zA-Z0-9_-]/g, '-');
  const stamp = Date.now();
  const safeName = sanitizeFilename(file.name);
  const path = `${prefix}/${stamp}-${safeName}`;

  const { data, error } = await supabase.storage
    .from(EMAIL_ASSETS_BUCKET)
    .upload(path, file, {
      contentType: file.type,
      upsert: false,
      cacheControl: '31536000',
    });

  if (error) {
    // Supabase surfaces "Bucket not found" when the bucket hasn't been
    // created; translate that into a clear message so admins know to run
    // the SQL migration.
    if (/bucket not found/i.test(error.message)) {
      throw new Error(
        'Supabase bucket "email-assets" is missing. Run docs/ADD_EMAIL_ASSETS_BUCKET.sql in Supabase, then try again.'
      );
    }
    throw error;
  }

  const { data: publicData } = supabase.storage
    .from(EMAIL_ASSETS_BUCKET)
    .getPublicUrl(data.path);

  const url = publicData?.publicUrl;
  if (!url) throw new Error('Upload succeeded but no public URL was returned.');
  return { path: data.path, url };
}
