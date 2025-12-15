import { BACKEND_URL } from "../constants";

export const getProductInfo = async (productSlug: string) => {
  try {
    const response = await fetch(`${BACKEND_URL}/products/${productSlug}`).then(
      (res) => {
        if (res.ok) {
          return res.json();
        } else {
          return null;
        }
      }
    );
    return response;
  } catch (err) {
    console.error("Error fetching product information");
  }
};

export interface IProductFilters {
  page?: number;
  limit?: number;
  category?: string;
  product_type?: string;
  min_price?: number;
  max_price?: number;
  search?: string;
  manufacturer?: string;
  certification?: string;
  on_sale?: boolean;
  sort_by?: string;
}

export const getProductList = async (filters: IProductFilters = {}) => {
  try {
    const params = new URLSearchParams();
    
    if (filters.page !== undefined) params.append("page", filters.page.toString());
    if (filters.limit !== undefined) params.append("limit", filters.limit.toString());
    if (filters.category) params.append("category", filters.category);
    if (filters.product_type) params.append("product_type", filters.product_type);
    if (filters.min_price !== undefined) params.append("min_price", filters.min_price.toString());
    if (filters.max_price !== undefined) params.append("max_price", filters.max_price.toString());
    if (filters.search) params.append("search", filters.search);
    if (filters.manufacturer) params.append("manufacturer", filters.manufacturer);
    if (filters.certification) params.append("certification", filters.certification);
    if (filters.on_sale) params.append("on_sale", "true");

    const url = `${BACKEND_URL}/products?${params.toString()}`;
    console.log('[Product Service] Fetching:', url);
    
    const response = await fetch(url);
    
    if (response.ok) {
      return await response.json();
    } else {
      return null;
    }
  } catch (err) {
    console.error("Error fetching product list:", err);
    return null;
  }
};

// Upload image to Cloudinary via backend
export const uploadProductImage = async (file: File) => {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`${BACKEND_URL}/upload-image`, {
      method: "POST",
      body: formData,
    });

    if (response.ok) {
      return await response.json();
    } else {
      throw new Error("Upload failed");
    }
  } catch (err) {
    console.error("Error uploading image:", err);
    return null;
  }
};

// Create new product
export interface ICreateProduct {
  slug: string;
  product_type: string;
  product_name: string;
  price: number;
  stock: number;
  blurb?: string;
  description?: string;
  image_url?: string;
  sale_price?: number;
  sizes?: Array<{
    size: string;
    stock_quantity: number;
  }>;
  colors?: Array<{
    color: string;
    image_url?: string;
  }>;
}

export const createProduct = async (product: ICreateProduct) => {
  try {
    const token = localStorage.getItem("access_token");
    const response = await fetch(`${BACKEND_URL}/products`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(product),
    });

    if (response.ok) {
      return await response.json();
    } else {
      throw new Error("Create product failed");
    }
  } catch (err) {
    console.error("Error creating product:", err);
    return null;
  }
};

// Update product
export interface IUpdateProduct {
  slug?: string;
  product_type?: string;
  product_name?: string;
  price?: number;
  blurb?: string;
  description?: string;
  image_url?: string;
  sale_price?: number;
}

export const updateProduct = async (productSlug: string, product: IUpdateProduct) => {
  try {
    const token = localStorage.getItem("access_token");
    const response = await fetch(`${BACKEND_URL}/products/${productSlug}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(product),
    });

    if (response.ok) {
      return await response.json();
    } else {
      const error = await response.json();
      throw new Error(error.detail || "Update product failed");
    }
  } catch (err) {
    console.error("Error updating product:", err);
    throw err;
  }
};

// Delete product
export const deleteProduct = async (productSlug: string) => {
  try {
    const token = localStorage.getItem("access_token");
    const response = await fetch(`${BACKEND_URL}/products/${productSlug}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });

    if (response.ok) {
      return await response.json();
    } else {
      const error = await response.json();
      throw new Error(error.detail || "Delete product failed");
    }
  } catch (err) {
    console.error("Error deleting product:", err);
    throw err;
  }
};
