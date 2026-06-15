export type ImageAsset = {
  file: string
  path: `/images/${string}`
  category: 'logo' | 'photo' | 'stock' | 'icon' | 'document' | 'other'
}

const imageFiles = [
  '20240630_185048.jpg',
  '20240630_185048_edited.jpg',
  '20240630_185048_magic_edited.jpg',
  '20240630_185048_magic_edited_edited.jpg',
  'AdobeStock_1033082784.jpeg',
  'AdobeStock_1041045833.jpeg',
  'AdobeStock_1068440550.svg',
  'AdobeStock_134033196.jpeg',
  'AdobeStock_169931205.jpeg',
  'AdobeStock_177024688.jpeg',
  'AdobeStock_182683273.jpeg',
  'AdobeStock_219127096.jpeg',
  'AdobeStock_229573892.jpeg',
  'AdobeStock_256823010.jpeg',
  'AdobeStock_270148767.jpeg',
  'AdobeStock_272104875.jpeg',
  'AdobeStock_301487843.jpeg',
  'AdobeStock_301487846.jpeg',
  'AdobeStock_301885844.jpeg',
  'AdobeStock_306159378.jpeg',
  'AdobeStock_315113823.jpeg',
  'AdobeStock_315113823_edited.jpg',
  'AdobeStock_315955202.jpeg',
  'AdobeStock_330864786.jpeg',
  'AdobeStock_359004942.jpeg',
  'AdobeStock_364584967.jpeg',
  'AdobeStock_378719182.jpeg',
  'AdobeStock_379413154.jpeg',
  'AdobeStock_39979035.jpeg',
  'AdobeStock_400955937.jpeg',
  'AdobeStock_409862704.jpeg',
  'AdobeStock_422031915.jpeg',
  'AdobeStock_451659984.jpeg',
  'AdobeStock_486112793.jpeg',
  'AdobeStock_495222202.jpeg',
  'AdobeStock_510004966.jpeg',
  'AdobeStock_539528847.svg',
  'AdobeStock_551970129.svg',
  'AdobeStock_556397567.jpeg',
  'AdobeStock_591886345.jpeg',
  'AdobeStock_616182100.svg',
  'AdobeStock_703635266.svg',
  'AdobeStock_855132235.jpeg',
  'AdobeStock_857751603.svg',
  'Assessment speech service.png',
  'Assessment speech service_edited.jpg',
  'Assessment speech service_edited.png',
  'Assessment speech service_edited_edited.jpg',
  'Assessment speech service_edited_edited.png',
  'Capture.PNG',
  'Click_Reader.jpg',
  'Click_Reader_HowUse22.jpg',
  'Copy of AdobeStock_301487846_edited.jpg',
  'favicon.png',
  'image.png',
  'image_edited.jpg',
  'iView Notes_edited.jpg',
  'Owner profile Photo - The therapy path.jpg',
  'Picture1.png',
  'Picture1_edited.jpg',
  'Picture2.png',
  'Picture2_edited.png',
  'sample_assess2.pdf',
  'The Therapy logo2_edited.png',
] as const

function categorize(file: string): ImageAsset['category'] {
  const lower = file.toLowerCase()
  if (lower.includes('logo') || lower === 'favicon.png') return 'logo'
  if (lower.endsWith('.pdf')) return 'document'
  if (lower.includes('adobestock') || lower.endsWith('.svg')) return 'stock'
  if (
    lower.includes('profile') ||
    lower.includes('owner') ||
    lower.startsWith('2024')
  ) {
    return 'photo'
  }
  return 'other'
}

export const images: ImageAsset[] = imageFiles.map((file) => ({
  file,
  path: `/images/${file}` as `/images/${string}`,
  category: categorize(file),
}))

export const imageByFile = Object.fromEntries(
  images.map((image) => [image.file, image]),
) as Record<(typeof imageFiles)[number], ImageAsset>

/** Commonly used assets identified from the Wix home page backup. */
export const featuredImages = {
  logo: imageByFile['The Therapy logo2_edited.png'],
  favicon: imageByFile['favicon.png'],
  ownerPhoto: imageByFile['Owner profile Photo - The therapy path.jpg'],
  assessmentService: imageByFile['Assessment speech service_edited.png'],
} as const

export function imagePath(file: string): string {
  return `/images/${file}`
}
