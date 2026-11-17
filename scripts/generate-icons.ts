import sharp from "sharp"

const source = "public/icon.svg"

/** The icon's background, used to pad the maskable icon. */
const background = "#23201d"

/** Raster sizes derived from the master SVG. */
const icons = [
  { path: "public/apple-touch-icon.png", size: 180 },
  { path: "public/pwa-192x192.png", size: 192 },
  { path: "public/pwa-512x512.png", size: 512 },
]

for (const icon of icons)
  await sharp(source, { density: 300 }).resize(icon.size, icon.size).png().toFile(icon.path)

/**
 * The artwork runs nearly edge to edge, so the maskable icon shrinks it to fit Android's circular
 * safe zone (the central 80%) and fills the margin with the background.
 */
const maskableSize = 512
const artworkSize = Math.round(maskableSize * 0.64)
const artwork = await sharp(source, { density: 300 })
  .resize(artworkSize, artworkSize)
  .png()
  .toBuffer()
await sharp({
  create: { width: maskableSize, height: maskableSize, channels: 4, background },
})
  .composite([{ input: artwork, gravity: "center" }])
  .png()
  .toFile("public/pwa-maskable-512x512.png")
