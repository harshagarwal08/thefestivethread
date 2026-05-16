import { v2 as cloudinary } from "cloudinary";
import { readdirSync, statSync } from "fs";
import { join, relative } from "path";

cloudinary.config({
  cloud_name: "dmyvc9kof",
  api_key: "215235441327378",
  api_secret: "udnmKV6_mS6_es86xuc4zzrEytU",
});

const PUBLIC_DIR = new URL("../public", import.meta.url).pathname;
const DIRS = ["images", "rakhis2026"];

function walk(dir) {
  const files = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      files.push(...walk(full));
    } else if (/\.(png|jpe?g|webp|avif)$/i.test(entry)) {
      files.push(full);
    }
  }
  return files;
}

let uploaded = 0;
let skipped = 0;

for (const dir of DIRS) {
  const files = walk(join(PUBLIC_DIR, dir));
  for (const file of files) {
    const rel = relative(PUBLIC_DIR, file); // e.g. rakhis2026/rakhis/R01.png
    const publicId = rel.replace(/\.[^.]+$/, ""); // strip extension

    try {
      await cloudinary.uploader.upload(file, {
        public_id: publicId,
        use_filename: false,
        overwrite: false,
        folder: undefined,
      });
      console.log(`✓ ${publicId}`);
      uploaded++;
    } catch (err) {
      if (err?.error?.http_code === 400 && err?.error?.message?.includes("already exists")) {
        console.log(`— ${publicId} (already exists)`);
        skipped++;
      } else {
        console.error(`✗ ${publicId}`, err?.error?.message ?? err);
      }
    }
  }
}

console.log(`\nDone. Uploaded: ${uploaded}, Skipped: ${skipped}`);
