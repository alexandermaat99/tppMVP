import { createClient } from "@/utils/supabase/server"; // Replace with your Supabase client path
import { notFound } from "next/navigation";

export default async function PostDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();

  // Fetch post details using the post ID from the URL
  const { data: post, error } = await supabase
    .from("posts")
    .select("*, profiles(username)") // Fetch post and related profile username
    .eq("id", params.id)
    .single();

  if (!post || error) {
    return notFound(); // Show 404 page if no post is found
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">{post.title}</h1>
      <p className="text-gray-700 mb-2">Price: ${post.price}</p>
      <p className="text-gray-700 mb-2">
        Posted by: {post.profiles?.username || "Unknown"}
      </p>
      <p className="text-gray-700 mb-2">Description: {post.description}</p>
      <p className="text-gray-700 mb-2">
        Difficulty: {post.initial_difficulty}
      </p>
      {/* Add more post fields as needed */}
    </div>
  );
}
