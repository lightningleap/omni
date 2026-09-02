"use server"

import { createClient } from "@supabase/supabase-js"
import { requireAdmin } from "@/lib/auth"

/**
 * Admin asset uploads — hero posters, merchandising images, discovery tiles.
 *
 * These used to go to Vercel Blob, which tied the admin panel to one host: the
 * upload needed BLOB_READ_WRITE_TOKEN, that token was never in the environment
 * (or in .env.example), and on anything but Vercel there was nothing to issue
 * it. Supabase already backs auth and the database, so storage lives there too
 * and the panel works wherever the app is deployed.
 *
 * The write goes through the service-role key, which bypasses row-level
 * security — so this must stay server-side, and every path into it is gated by
 * requireAdmin() first.
 */

/** Bucket holding admin-uploaded imagery. Public-read; writes are admin-only.
 *  Not exported: a "use server" module may only export async functions. */
const MERCH_BUCKET = "merch"

/** Vercel's serverless request ceiling was 4.5MB; keep the same ceiling so the
 *  limit does not change meaning depending on where this is deployed. */
const MAX_BYTES = 4.5 * 1024 * 1024

const ALLOWED = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "video/mp4",
  "video/webm",
] as const

export type UploadResult =
  | { success: true; url: string; name: string }
  | { success: false; message: string }

export async function uploadMerchAsset(formData: FormData): Promise<UploadResult> {
  await requireAdmin()

  const file = formData.get("file")
  if (!(file instanceof File) || file.size === 0) {
    return { success: false, message: "No file was received." }
  }

  if (!ALLOWED.includes(file.type as (typeof ALLOWED)[number])) {
    return { success: false, message: `That file type is not allowed: ${file.type || "unknown"}.` }
  }

  if (file.size > MAX_BYTES) {
    const mb = (file.size / 1024 / 1024).toFixed(1)
    return { success: false, message: `That file is ${mb}MB. The limit is 4.5MB.` }
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceKey) {
    return { success: false, message: "Storage is not configured on this server." }
  }

  const supabase = createClient(url, serviceKey, { auth: { persistSession: false } })

  // Keep the original name readable in the URL, but make the path unique: two
  // admins uploading "banner.png" must not overwrite each other, and an image
  // already live on the storefront must never change under it.
  const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_").slice(-80)
  const path = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}-${safeName}`

  const { error } = await supabase.storage
    .from(MERCH_BUCKET)
    .upload(path, file, { contentType: file.type, cacheControl: "31536000", upsert: false })

  if (error) {
    console.error("[UPLOAD] Supabase Storage rejected the file:", error.message)
    return {
      success: false,
      message: error.message.toLowerCase().includes("bucket")
        ? `Storage bucket "${MERCH_BUCKET}" does not exist yet. Create it in Supabase → Storage.`
        : "The upload failed. Please try again.",
    }
  }

  const { data } = supabase.storage.from(MERCH_BUCKET).getPublicUrl(path)

  return { success: true, url: data.publicUrl, name: safeName }
}
