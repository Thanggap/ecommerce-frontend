import { BACKEND_URL } from "../constants";

export interface IReviewAuthor {
  uuid: string;
  display_name?: string;
  email: string;
}

export interface IReview {
  id: number;
  product_id: number;
  content: string;
  rating: number;
  created_at: string;
  author: IReviewAuthor;
}

export interface IReviewListResponse {
  reviews: IReview[];
  average_rating: number;
  total_reviews: number;
}

export interface ICreateReview {
  content: string;
  rating: number;
}

export const getProductReviews = async (productSlug: string): Promise<IReviewListResponse | null> => {
  try {
    const response = await fetch(`${BACKEND_URL}/products/${productSlug}/reviews`);
    
    if (response.ok) {
      return await response.json();
    } else {
      return null;
    }
  } catch (err) {
    console.error("Error fetching reviews:", err);
    return null;
  }
};

export const createProductReview = async (
  productSlug: string,
  review: ICreateReview
): Promise<IReview | null> => {
  try {
    const token = localStorage.getItem("access_token");
    if (!token) {
      throw new Error("Not authenticated");
    }

    const response = await fetch(`${BACKEND_URL}/products/${productSlug}/reviews`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(review),
    });

    if (response.ok) {
      return await response.json();
    } else {
      const error = await response.json();
      throw new Error(error.detail || "Failed to create review");
    }
  } catch (err) {
    console.error("Error creating review:", err);
    throw err;
  }
};
