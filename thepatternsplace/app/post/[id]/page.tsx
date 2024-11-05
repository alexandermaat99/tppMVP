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
  profiles?: {
    username: string;
  };
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
  const supabase = createClient();

  useEffect(() => {
    const fetchPost = async () => {
      const { data, error } = await supabase
        .from("posts")
        .select("*, profiles(username)")
        .eq("id", params.id)
        .single();

      if (error) {
        setError(error.message);
      } else if (data) {
        setPost(data as Post); // Type assertion to Post
      }
      setLoading(false);
    };

    fetchPost();
  }, [params.id, supabase]);

  if (loading) return <p>Loading...</p>;
  if (error || !post) return <p>Post not found</p>;

  return (
    <div className="max-w-2xl mx-auto p-4">
      <button
        onClick={() => router.back()}
        className="mb-4 text-blue-500 underline"
      >
        ← Back
      </button>
      <h1 className="text-3xl font-bold mb-4">{post.title}</h1>
      <p className="text-gray-700 mb-2">Price: ${post.price}</p>
      <p className="text-gray-700 mb-2">
        Posted by: {post.profiles?.username || "Unknown"}
      </p>
      <p className="text-gray-700 mb-2">Description: {post.description}</p>
      <p className="text-gray-700 mb-2">
        Difficulty: {post.initial_difficulty}
      </p>
    </div>
  );
}
