"use client";

import { createClient } from "@/utils/supabase/client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function MakePostPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [initial_difficulty, setInitialDifficulty] = useState("");
  const [file, setFile] = useState<File | null>(null); // New state for image file
  const [pattern, setPattern] = useState<File | null>(null); // New state for pattern file
  const [uploading, setUploading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true); // Start uploading state

    // Get the current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error("User not authenticated:", userError);
      setUploading(false);
      return;
    }

    try {
      // 1. Insert post with profile_id
      const { data: postData, error: postError } = await supabase
        .from("posts")
        .insert([
          {
            title,
            description,
            price,
            initial_difficulty,
            profile_id: user.id, // Link post to the user's profile
          },
        ])
        .select("id")
        .single(); // We need to get the post ID

      if (postError) {
        throw new Error(`Error creating post: ${postError.message}`);
      }

      const postID = postData.id; // Get the newly created post ID

      // 2. Upload image to Supabase storage bucket (if a file was selected)
      if (file) {
        // Get file extension
        const fileExtension = file.name.split(".").pop();
        // Create a unique filename with a timestamp
        const newFileName = `${Date.now()}.${fileExtension}`;
        const filePath = `public/${newFileName}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("images") // Assuming your bucket is named 'images'
          .upload(filePath, file);

        if (uploadError) {
          throw new Error(`Image upload failed: ${uploadError.message}`);
        }

        // 3. Get the public URL of the uploaded image
        const { data: publicUrlData } = supabase.storage
          .from("images")
          .getPublicUrl(filePath);

        const publicURL = publicUrlData.publicUrl;

        // 4. Insert the image URL and post ID into the post_images table
        const { error: insertError } = await supabase
          .from("post_images")
          .insert([
            {
              post_id: postID, // Link the image to the post using postID
              image_url: publicURL, // Store the image URL
            },
          ]);

        if (insertError) {
          throw new Error(`Error storing image URL: ${insertError.message}`);
        }

        console.log("Post created and image uploaded successfully!");
      }
      if (pattern) {
        // Extract file extension
        const fileExtension = pattern.name.split(".").pop();
        // Create a unique file name
        const newFileName = `pattern_${Date.now()}.${fileExtension}`;
        // Specify the file path in the storage bucket
        const filePath = `patterns/${newFileName}`;

        // Upload the file to Supabase storage bucket
        const { data: patternUploadData, error: patternUploadError } =
          await supabase.storage
            .from("patterns") // Assuming your bucket is named 'patterns'
            .upload(filePath, pattern);

        if (patternUploadError) {
          throw new Error(
            `Pattern upload failed: ${patternUploadError.message}`
          );
        }

        //get the puiblic url of the uploaded pattern
        const { data: publicUrlData } = supabase.storage
          .from("patterns")
          .getPublicUrl(filePath);

        const publicURL = publicUrlData.publicUrl;

        const { error: insertError } = await supabase
          .from("posts")
          .update({ file_download: publicURL }) // Store the pattern URL
          .eq("id", postID); // Link the pattern to the post using postID

        if (insertError) {
          throw new Error(`Error storing pattern URL: ${insertError.message}`);
        }

        console.log("Pattern uploaded successfully!");
      }

      // 5. Redirect after successful post creation
      router.push("/"); // Redirect to home page or post list
    } catch (error: any) {
      console.error(error.message);
      alert(error.message);
    } finally {
      setUploading(false); // Stop uploading state
    }
  };

  const handlePriceInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    // Regular expression to allow only up to 6 digits and one decimal point
    const regex = /^\d{0,6}(\.\d{0,2})?$/;

    // If the value matches the regex, update the state
    if (regex.test(value) || value === "") {
      setPrice(value);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-5">Make a Post</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* image for the post  */}
        <label htmlFor="image" className="block mb-1">
          Upload an Image
        </label>
        <input
          type="file"
          id="image"
          onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
        />

        <label htmlFor="pattern" className="block mb-1">
          Upload your Pattern PDF
        </label>
        <input
          type="file"
          id="pattern"
          onChange={(e) =>
            setPattern(e.target.files ? e.target.files[0] : null)
          }
        />

        <div>
          {/* title for the post  */}
          <label htmlFor="title" className="block mb-1">
            Title
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
            required
          />
        </div>

        {/* price for the post  */}
        <div className="relative">
          <label htmlFor="price" className="block mb-1">
            Price
          </label>

          {/* Dollar sign positioned in front of the input */}
          <span className="absolute inset-y-0 left-0 flex items-center pointer-events-none">
            $
          </span>

          <input
            type="text"
            id="price"
            value={price}
            onChange={(e) => handlePriceInput(e)}
            className="w-full pl-8 pr-3 py-2 border rounded-md"
            placeholder="00.00"
            maxLength={8} // To account for 6 digits, 1 decimal, and 1 character for the dollar sign
            required
          />
        </div>

        {/* initial_difficulty for the post  */}
        <div>
          <label htmlFor="difficulty" className="block mb-1">
            Difficulty Level
          </label>
          <select
            id="difficulty"
            value={initial_difficulty}
            onChange={(e) => setInitialDifficulty(e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
            required
          >
            <option value="" disabled>
              Select difficulty level
            </option>
            <option value="1">Beginner</option>
            <option value="2">Intermediate</option>
            <option value="3">Advanced</option>
            <option value="4">Expert</option>
          </select>
        </div>

        {/* description for the post */}
        <div>
          <label htmlFor="description" className="block mb-1">
            Content
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
            rows={4}
            required
          ></textarea>
        </div>

        <button
          type="submit"
          className={`w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 ${
            uploading ? "opacity-50 cursor-not-allowed" : ""
          }`}
          disabled={uploading}
        >
          {uploading ? "Submitting..." : "Submit Post"}
        </button>
      </form>
    </div>
  );
}
