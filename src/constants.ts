export const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const AWS_S3_BASE_URL = process.env.REACT_APP_AWS_S3_BASE_URL;

// Product Categories - Health Supplements
export const PRODUCT_CATEGORIES = [
  "Vitamins & Minerals",
  "Protein & Fitness",
  "Weight Management",
  "Beauty & Skin",
  "Digestive Health",
  "Brain & Focus",
  "Immune Support"
] as const;

export type ProductCategory = typeof PRODUCT_CATEGORIES[number];

// Category mapping for display and routing
export const CATEGORY_CONFIG = {
  "Vitamins & Minerals": {
    label: "Vitamins & Minerals",
    slug: "vitamins-minerals",
    description: "Essential vitamins and minerals for overall health"
  },
  "Protein & Fitness": {
    label: "Protein & Fitness",
    slug: "protein-fitness",
    description: "Build muscle and improve athletic performance"
  },
  "Weight Management": {
    label: "Weight Management",
    slug: "weight-management",
    description: "Support healthy weight loss and metabolism"
  },
  "Beauty & Skin": {
    label: "Beauty & Skin",
    slug: "beauty-skin",
    description: "Enhance skin, hair, and nail health"
  },
  "Digestive Health": {
    label: "Digestive Health",
    slug: "digestive-health",
    description: "Support gut health and digestion"
  },
  "Brain & Focus": {
    label: "Brain & Focus",
    slug: "brain-focus",
    description: "Boost cognitive function and mental clarity"
  },
  "Immune Support": {
    label: "Immune Support",
    slug: "immune-support",
    description: "Strengthen immune system and overall wellness"
  }
} as const;