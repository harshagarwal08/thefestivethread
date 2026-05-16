const CLOUD = "dmyvc9kof";
const BASE = `https://res.cloudinary.com/${CLOUD}/image/upload`;

export function cdnUrl(path: string, transforms = "f_auto,q_auto") {
  // path is like /rakhis2026/rakhis/R01.png or /images/box1.jpg
  const publicId = path.replace(/^\//, "").replace(/\.[^.]+$/, "");
  return `${BASE}/${transforms}/${publicId}`;
}
