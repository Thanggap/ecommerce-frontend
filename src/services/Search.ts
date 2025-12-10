import { BACKEND_URL } from "../constants";

/**
 * Elasticsearch search interface
 */
export interface ISearchFilters {
  q?: string; // Search query
  page?: number;
  limit?: number;
  product_type?: string;
  min_price?: number;
  max_price?: number;
  on_sale?: boolean;
  sort?: "relevance" | "price_asc" | "price_desc" | "newest";
}

export interface ISearchResult {
  items: any[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
  query?: string;
  took_ms: number;
}

export interface IAutocompleteResult {
  suggestions: Array<{
    name: string;
    type: string;
  }>;
}

/**
 * Search products using Elasticsearch
 * Falls back to regular API if ES is unavailable
 */
export const searchProducts = async (
  filters: ISearchFilters = {}
): Promise<ISearchResult | null> => {
  try {
    const params = new URLSearchParams();

    if (filters.q) params.append("q", filters.q);
    if (filters.page !== undefined) params.append("page", filters.page.toString());
    if (filters.limit !== undefined) params.append("limit", filters.limit.toString());
    if (filters.product_type) params.append("product_type", filters.product_type);
    if (filters.min_price !== undefined)
      params.append("min_price", filters.min_price.toString());
    if (filters.max_price !== undefined)
      params.append("max_price", filters.max_price.toString());
    if (filters.on_sale) params.append("on_sale", "true");
    if (filters.sort) params.append("sort", filters.sort);

    const response = await fetch(`${BACKEND_URL}/search/products?${params.toString()}`);

    if (response.ok) {
      return await response.json();
    } else {
      console.error("Search API failed:", response.status);
      return null;
    }
  } catch (err) {
    console.error("Error searching products:", err);
    return null;
  }
};

/**
 * Get autocomplete suggestions
 */
export const getAutocompleteSuggestions = async (
  query: string
): Promise<IAutocompleteResult | null> => {
  if (!query || query.length < 2) return null;

  try {
    const response = await fetch(
      `${BACKEND_URL}/search/autocomplete?q=${encodeURIComponent(query)}`
    );

    if (response.ok) {
      return await response.json();
    } else {
      return null;
    }
  } catch (err) {
    console.error("Error fetching autocomplete:", err);
    return null;
  }
};

/**
 * Get search aggregations (facets)
 */
export const getSearchAggregations = async (): Promise<any | null> => {
  try {
    const response = await fetch(`${BACKEND_URL}/search/aggregations`);

    if (response.ok) {
      return await response.json();
    } else {
      return null;
    }
  } catch (err) {
    console.error("Error fetching aggregations:", err);
    return null;
  }
};

/**
 * Check Elasticsearch health
 */
export const checkSearchHealth = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${BACKEND_URL}/search/health`);
    if (response.ok) {
      const data = await response.json();
      return data.status !== "unavailable";
    }
    return false;
  } catch (err) {
    return false;
  }
};
