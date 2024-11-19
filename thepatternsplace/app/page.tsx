"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import PostCard from "@/components/post";

export default function PostsPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const supabase = createClient();
  const router = useRouter();
  const searchParams = useSearchParams();

  const POSTS_PER_PAGE = 12;

  useEffect(() => {
    const restoreScrollPosition = () => {
      const savedScrollPosition = localStorage.getItem("scrollPosition");
      if (savedScrollPosition) {
        window.scrollTo(0, parseInt(savedScrollPosition, 10));
        localStorage.removeItem("scrollPosition");
      }
    };

    const timer = setTimeout(restoreScrollPosition, 0);

    return () => clearTimeout(timer);
  }, [posts]);

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);

      const currentPage = parseInt(searchParams?.get("page") || "1", 10);
      setPage(currentPage);

      const start = (currentPage - 1) * POSTS_PER_PAGE;
      const end = start + POSTS_PER_PAGE - 1;

      const { data, error, count } = await supabase
        .from("posts")
        .select("*, profiles(username), post_images(image_url)", {
          count: "exact",
        })
        .range(start, end);

      if (error) {
        console.error("Error fetching posts:", error.message);
      } else {
        setPosts(data);
        setTotalPages(Math.ceil((count ?? 0) / POSTS_PER_PAGE));
      }

      setLoading(false);
    };

    fetchPosts();
  }, [searchParams, supabase]);

  const handlePageChange = (newPage: number) => {
    localStorage.setItem("currentPage", newPage.toString());
    localStorage.setItem("scrollPosition", "0");
    router.push(`/?page=${newPage}`);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

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
      <div className="flex justify-center mt-6 space-x-4">
        <button
          disabled={page === 1}
          onClick={() => handlePageChange(page - 1)}
          className={`px-4 py-2 rounded bg-gray-300 ${
            page === 1 ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-400"
          }`}
        >
          Previous
        </button>
        <button
          disabled={page === totalPages}
          onClick={() => handlePageChange(page + 1)}
          className={`px-4 py-2 rounded bg-gray-300 ${
            page === totalPages
              ? "opacity-50 cursor-not-allowed"
              : "hover:bg-gray-400"
          }`}
        >
          Next
        </button>
      </div>
    </div>
  );
}
