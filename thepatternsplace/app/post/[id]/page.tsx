"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

interface Post {
  id: string;
  title: string;
  price: number;
  description: string;
  initial_difficulty: string;
  profile_id: string;
  profiles?: {
    username: string;
  };
  post_images?: {
    image_url: string;
  }[];
}

export default function PostDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const fetchPost = async () => {
      const { data: postData, error: postError } = await supabase
        .from("posts")
        .select("*, profiles(username), post_images(image_url)")
        .eq("id", params.id)
        .single();

      if (postError) {
        setError(postError.message);
      } else if (postData) {
        setPost(postData as Post);
      }

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        console.error("Error fetching user:", userError.message);
      } else {
        setCurrentUserId(user?.id || null);
      }

      setLoading(false);
    };

    fetchPost();
  }, [params.id, supabase]);

  const handleBackToHome = () => {
    router.push("/");
  };

  if (loading) return <p>Loading...</p>;
  if (error || !post) return <p>Post not found</p>;

  const imageUrl =
    post.post_images && post.post_images.length > 0
      ? post.post_images[0].image_url
      : null;

  const handleEdit = () => {
    router.push(`/post/${post.id}/edit`);
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <button
        onClick={handleBackToHome}
        className="mb-4 text-blue-500 underline"
      >
        ← Back to Home
      </button>

      <h1 className="text-3xl font-bold mb-4">{post.title}</h1>
      {imageUrl && (
        <img
          src={imageUrl}
          alt={post.title}
          className="w-full h-64 object-cover rounded mb-4"
        />
      )}
      <p className="text-gray-700 mb-2">Price: ${post.price}</p>
      <p className="text-gray-700 mb-2">
        Posted by: {post.profiles?.username || "Unknown"}
      </p>
      <p className="text-gray-700 mb-2">Description: {post.description}</p>
      <p className="text-gray-700 mb-2">
        Difficulty: {post.initial_difficulty}
      </p>
      {currentUserId === post.profile_id && (
        <button
          onClick={handleEdit}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Edit Post
        </button>
      )}
    </div>
  );
}
