const CLOUD = "dmyvc9kof";
const BASE = `https://res.cloudinary.com/${CLOUD}/image/upload`;

export function cdnUrl(path: string, transforms = "f_auto,q_auto") {
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  const publicId = path.replace(/^\//, "").replace(/\.[^.]+$/, "");
  return `${BASE}/${transforms}/${publicId}`;
}

const shimmerSvg = `<svg width="4" height="5" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%"   stop-color="#EDE5D8"/>
      <stop offset="50%"  stop-color="#DDD4C4"/>
      <stop offset="100%" stop-color="#EDE5D8"/>
      <animateTransform attributeName="gradientTransform" type="translate" from="-1 0" to="1 0" dur="1.2s" repeatCount="indefinite"/>
    </linearGradient>
  </defs>
  <rect width="4" height="5" fill="url(#g)"/>
</svg>`;

export const blurDataUrl = `data:image/svg+xml;base64,${Buffer.from(shimmerSvg).toString("base64")}`;
