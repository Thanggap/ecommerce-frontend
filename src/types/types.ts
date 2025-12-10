export interface IProduct {
  id: number;
  product_id: string;  // Keep for backward compatibility, will be set from id
  product_type: string;
  product_name: string;
  price: number;
  sale_price: number;
  blurb: string;
  description?: string;
  stock: number;
  image_url: string;
  slug?: string;
  sizes?: Array<{
    size: string;
    stock_quantity: number;
    size_id: number;
  }>;
  colors?: Array<{
    id: number;
    color: string;
    image_url?: string;
  }>;
  // Supplement-specific fields
  serving_size?: string;
  servings_per_container?: number;
  ingredients?: string;
  allergen_info?: string;
  usage_instructions?: string;
  warnings?: string;
  expiry_date?: string;
  manufacturer?: string;
  country_of_origin?: string;
  certification?: string;
}

export class Product implements IProduct {
  id: number;
  product_id: string;
  product_type: string;
  product_name: string;
  sale_price: number;
  price: number;
  blurb: string;
  description?: string;
  stock: number;
  image_url: string;
  slug?: string;
  sizes?: Array<{
    size: string;
    stock_quantity: number;
    size_id: number;
  }>;
  colors?: Array<{
    id: number;
    color: string;
    image_url?: string;
  }>;
  // Supplement-specific fields
  serving_size?: string;
  servings_per_container?: number;
  ingredients?: string;
  allergen_info?: string;
  usage_instructions?: string;
  warnings?: string;
  expiry_date?: string;
  manufacturer?: string;
  country_of_origin?: string;
  certification?: string;

  constructor(product: any) {
    this.id = product.id;
    this.product_id = String(product.id);  // Use id as string for product_id
    this.product_type = product.product_type;
    this.product_name = product.product_name;
    this.price = product.price;
    this.sale_price = product.sale_price;
    this.blurb = product.blurb;
    this.description = product.description;
    this.stock = product.stock;
    this.image_url = product.image_url;
    this.slug = product.slug;
    this.sizes = product.sizes || [];
    this.colors = product.colors || [];
    // Supplement fields
    this.serving_size = product.serving_size;
    this.servings_per_container = product.servings_per_container;
    this.ingredients = product.ingredients;
    this.allergen_info = product.allergen_info;
    this.usage_instructions = product.usage_instructions;
    this.warnings = product.warnings;
    this.expiry_date = product.expiry_date;
    this.manufacturer = product.manufacturer;
    this.country_of_origin = product.country_of_origin;
    this.certification = product.certification;
  }
}

export interface IOrderItem {
  id: number;
  order_id: number;
  product_id: number;
  quantity: number;
}

export interface IOrder {
  id: number;
  user_id: number;
  created_at: Date;
  items: IOrderItem[];
}

export interface IReview {
  id: number;
  product_id: number;
  author_id: number;
  content: string;
  rating: number;
}

export interface IUser {
  id: number;
  username: string;
  email: string;
  is_active?: boolean; // Optional
}

export default {};
