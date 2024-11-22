"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export default function EditPostPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const supabase = createClient();

  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "",
    price: "",
    description: "",
    initial_difficulty: "",
  });

  // Fetch the post data to prefill the form
  useEffect(() => {
    const fetchPost = async () => {
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .eq("id", params.id)
        .single();

      if (error) {
        setError(error.message);
      } else if (data) {
        setPost(data);
        setForm({
          title: data.title,
          price: data.price,
          description: data.description,
          initial_difficulty: data.initial_difficulty,
        });
      }
      setLoading(false);
    };

    fetchPost();
  }, [params.id, supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { error } = await supabase
      .from("posts")
      .update({
        title: form.title,
        price: form.price,
        description: form.description,
        initial_difficulty: form.initial_difficulty,
      })
      .eq("id", params.id);

    if (error) {
      console.error("Error updating post:", error.message);
      alert("Failed to update the post.");
    } else {
      alert("Post updated successfully!");
      router.push(`/post/${params.id}`); // Redirect back to the post details page
    }
  };

  const handleBackToHome = () => {
    router.push("/");
  };

  const handleDelete = async () => {
    const confirmDelete = confirm(
      "Are you sure you want to delete this post? This action cannot be undone."
    );

    if (confirmDelete) {
      try {
        // Delete associated post_images
        const { error: deleteImagesError } = await supabase
          .from("post_images")
          .delete()
          .eq("post_id", params.id);

        if (deleteImagesError) {
          console.error(
            "Error deleting post images:",
            deleteImagesError.message
          );
          alert("Failed to delete the associated images.");
          return;
        }

        // Delete the post
        const { error: deletePostError } = await supabase
          .from("posts")
          .delete()
          .eq("id", params.id);

        if (deletePostError) {
          console.error("Error deleting post:", deletePostError.message);
          alert("Failed to delete the post.");
          return;
        }

        alert("Post deleted successfully!");
        router.push("/"); // Redirect to the homepage after deletion
      } catch (error) {
        console.error("Unexpected error:", error);
        alert("An unexpected error occurred.");
      }
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="max-w-2xl mx-auto p-4">
      <button
        onClick={handleBackToHome}
        className="mb-4 text-blue-500 underline"
      >
        ← Back to Home
      </button>
      <h1 className="text-2xl font-bold mb-4">Edit Post</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium">
            Title
          </label>
          <input
            type="text"
            id="title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full px-3 py-2 border rounded"
            required
          />
        </div>

        <div>
          <label htmlFor="price" className="block text-sm font-medium">
            Price
          </label>
          <input
            type="number"
            id="price"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
            className="w-full px-3 py-2 border rounded"
            required
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium">
            Description
          </label>
          <textarea
            id="description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full px-3 py-2 border rounded"
            rows={4}
            required
          ></textarea>
        </div>

        <div>
          <label htmlFor="difficulty" className="block text-sm font-medium">
            Difficulty
          </label>
          <select
            id="difficulty"
            value={form.initial_difficulty}
            onChange={(e) =>
              setForm({ ...form, initial_difficulty: e.target.value })
            }
            className="w-full px-3 py-2 border rounded"
            required
          >
            <option value="" disabled>
              Select Difficulty
            </option>
            <option value="1">Beginner</option>
            <option value="2">Intermediate</option>
            <option value="3">Advanced</option>
            <option value="4">Expert</option>
          </select>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
        >
          Update Post
        </button>

        <button
          onClick={handleDelete}
          className="w-full bg-red-500 text-white py-2 rounded mt-4 hover:bg-red-600"
        >
          Delete Post
        </button>
      </form>
    </div>
  );
}
