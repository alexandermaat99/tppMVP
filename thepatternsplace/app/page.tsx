"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client"; // Replace with your Supabase client path
import PostCard from "@/components/post"; // Replace with your PostCard component path

export default function PostsPage() {
  const [posts, setPosts] = useState<any[]>([]); // To store posts data
  const [loading, setLoading] = useState(true); // To show a loading state
  const supabase = createClient(); // Initialize Supabase client

  // Fetch posts with related profiles and images from the database
  useEffect(() => {
    const fetchPosts = async () => {
      // Join posts with profiles to get the username and images
      const { data, error } = await supabase
        .from("posts")
        .select("*, profiles(username), post_images(image_url)"); // Adjusted to fetch image URL

      if (error) {
        console.error("Error fetching posts:", error.message);
      } else {
        setPosts(data); // Store posts data in state
      }

      setLoading(false); // Turn off loading state
    };

    fetchPosts();
  }, [supabase]);

  // If data is still loading, show a loading state
  if (loading) {
    return <div>Loading...</div>;
  }

  // If no posts are found, display a message
  if (posts.length === 0) {
    return <div>No posts found.</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">All Posts</h1>
      <div className="grid grid-cols-4 gap-10">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
}
