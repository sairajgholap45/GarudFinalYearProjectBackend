import { promises as fs } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { companyProfile as defaultCompanyProfile, siteContent as defaultSiteContent } from '../data/siteContent.js'

const currentDir = path.dirname(fileURLToPath(import.meta.url))
const adminContentFilePath = path.resolve(currentDir, '../../data/admin-content.json')

const defaultAdminContent = {
  companyProfile: defaultCompanyProfile,
  siteContent: {
    ...defaultSiteContent,
    trustPoints: [
      'Premium, carefully sourced products',
      'Quality, transparency, and trust',
      'Reliable packaging and timely delivery',
    ],
    products: [
      {
        title: 'Fruits & Vegetables',
        description: 'Farm-fresh produce carefully sourced and packed to maintain natural freshness and quality.',
        image: '/images/hero-export.svg',
      },
      {
        title: 'Grocery Products',
        description: 'Essential Indian grocery items hygienically processed for consistent quality, safety, and shelf life.',
        image: '/images/product-placeholder.svg',
      },
      {
        title: 'Indian Spices',
        description: 'Authentic Indian spices offering rich aroma, natural color, and bold flavor profiles.',
        image: '/images/hero-export.svg',
      },
      {
        title: 'Dry Fruits & Nuts',
        description: 'Premium dry fruits and nuts selected for freshness, taste, nutrition, and purity.',
        image: '/images/dry-fruits-nuts.svg',
      },
      {
        title: 'Namkeen & Traditional Snacks',
        description: 'Traditional Indian snacks prepared hygienically to preserve authentic taste and crunch.',
        image: '/images/product-placeholder.svg',
      },
      {
        title: 'Handicrafts',
        description: "Authentic handcrafted products reflecting India's rich cultural heritage, made by skilled artisans using traditional techniques.",
        image: '/images/product-placeholder.svg',
      },
      {
        title: 'Imitation Jewellery',
        description: 'Stylish and elegant imitation jewellery designed to match global fashion trends while maintaining superior finish and durability.',
        image: '/images/product-placeholder.svg',
      },
      {
        title: 'Copper Articles',
        description: 'High-quality copper products crafted with precision, suitable for daily use, gifting, and decorative purposes.',
        image: '/images/copper-articles.svg',
      },
      {
        title: 'Furniture & Home Decor',
        description: 'Beautifully designed furniture and home decor items that combine craftsmanship, functionality, and timeless aesthetics.',
        image: '/images/product-placeholder.svg',
      },
    ],
    features: [
      {
        title: 'Uncompromising Quality Standards',
        description: 'Strict quality control at every stage from sourcing and handling to packaging and dispatch.',
      },
      {
        title: 'Premium & Verified Products',
        description: 'Carefully sourced food products and lifestyle goods from verified farmers, artisans, and manufacturers.',
      },
      {
        title: 'Reliable Global Supply Network',
        description: 'Consistent supply and timely delivery to international markets through dependable logistics.',
      },
      {
        title: 'Customer-Centric Approach',
        description: 'Clear communication and customized solutions tailored to buyer requirements.',
      },
      {
        title: 'Ethical & Responsible Trade',
        description: 'We value fair trade, responsible sourcing, and long-term business conduct.',
      },
      {
        title: 'Transparent Business Operations',
        description: 'Honest communication, clear documentation, and traceable processes for smooth trade.',
      },
      {
        title: 'Industry Experience & Commitment',
        description: 'Export knowledge and a commitment to excellence that support lasting partnerships.',
      },
    ],
  },
}

const isPlainObject = (value) =>
  value !== null && typeof value === 'object' && !Array.isArray(value)

const deepMerge = (base, patch) => {
  if (!isPlainObject(base) || !isPlainObject(patch)) {
    return patch === undefined ? base : patch
  }

  const result = { ...base }

  for (const [key, value] of Object.entries(patch)) {
    if (Array.isArray(value)) {
      result[key] = value
      continue
    }

    if (isPlainObject(value) && isPlainObject(base[key])) {
      result[key] = deepMerge(base[key], value)
      continue
    }

    result[key] = value
  }

  return result
}

const readJsonFile = async () => {
  try {
    const fileContents = await fs.readFile(adminContentFilePath, 'utf8')
    const parsed = JSON.parse(fileContents)

    return {
      ...defaultAdminContent,
      ...parsed,
      companyProfile: {
        ...defaultAdminContent.companyProfile,
        ...(parsed?.companyProfile || {}),
      },
      siteContent: {
        ...defaultAdminContent.siteContent,
        ...(parsed?.siteContent || {}),
      },
    }
  } catch (error) {
    if (error?.code === 'ENOENT') {
      return defaultAdminContent
    }

    throw error
  }
}

const writeJsonFile = async (content) => {
  await fs.mkdir(path.dirname(adminContentFilePath), { recursive: true })
  await fs.writeFile(adminContentFilePath, JSON.stringify(content, null, 2), 'utf8')
}

export const getAdminContent = async () => readJsonFile()

export const updateAdminContent = async (patch) => {
  const current = await readJsonFile()
  const next = deepMerge(current, patch)

  await writeJsonFile(next)
  return next
}

export const getCompanyProfileContent = async () => {
  const content = await readJsonFile()
  return content.companyProfile
}

export const updateCompanyProfileContent = async (patch) => {
  const current = await readJsonFile()
  const next = {
    ...current,
    companyProfile: deepMerge(current.companyProfile, patch),
  }

  await writeJsonFile(next)
  return next.companyProfile
}

export const getSiteContentContent = async () => {
  const content = await readJsonFile()
  return content.siteContent
}

export const updateSiteContentContent = async (patch) => {
  const current = await readJsonFile()
  const next = {
    ...current,
    siteContent: deepMerge(current.siteContent, patch),
  }

  await writeJsonFile(next)
  return next.siteContent
}
