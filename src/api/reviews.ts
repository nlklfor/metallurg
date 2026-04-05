import supabase from "@/lib/supabase";
import type { Review, ReviewFormData, ReviewWithOrderItems } from "@/interfaces/review";

export async function getAllReviews(): Promise<ReviewWithOrderItems[]> {
  const { data, error } = await supabase
    .from("reviews")
    .select("*, orders(items)")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  return (data ?? []).map((r: Record<string, unknown>) => {
    const order = r.orders as {
      items: { name: string; selectedSize: string | number; price: number }[];
    } | null;
    return {
      ...r,
      order_items: order?.items ?? [],
    } as ReviewWithOrderItems;
  });
}

export async function getReviewByOrder(orderId: string): Promise<Review | null> {
  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .eq("order_id", orderId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data;
}

export async function submitReview(review: ReviewFormData, images: File[]): Promise<Review> {
  const imageUrls: string[] = [];

  for (const file of images) {
    const ext = file.name.split(".").pop();
    const path = `${review.order_id}/${crypto.randomUUID()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("review-images")
      .upload(path, file, { contentType: file.type });

    if (uploadError) throw new Error(uploadError.message);

    const { data: urlData } = supabase.storage.from("review-images").getPublicUrl(path);

    imageUrls.push(urlData.publicUrl);
  }

  const { data, error } = await supabase
    .from("reviews")
    .insert({
      order_id: review.order_id,
      author_name: review.author_name,
      rating: review.rating,
      body: review.body || null,
      image_urls: imageUrls,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}
