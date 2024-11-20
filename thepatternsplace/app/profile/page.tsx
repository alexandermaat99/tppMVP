"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { signOutAction } from "@/app/actions";
import { Button } from "@/components/ui/button";

export default function ProfilePage() {
  const [username, setUsername] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  // Fetch the logged-in user's profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // Get the current logged-in user
        const { data: user, error: userError } = await supabase.auth.getUser();
        if (userError) throw new Error(userError.message);

        // Fetch the profile data
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("username, email, avatar_url")
          .eq("id", user?.user.id)
          .single();
        if (profileError) throw new Error(profileError.message);

        // Set the state with fetched data
        setUsername(profile.username);
        setEmail(profile.email);
        setAvatarUrl(profile.avatar_url);
      } catch (err: any) {
        console.error(err.message);
        setError("Failed to fetch profile data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // Handle form submission to update the user's profile
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Update the profile in the database
      const { data: user } = await supabase.auth.getUser();
      const { error } = await supabase
        .from("profiles")
        .update({ username, email, avatar_url: avatarUrl })
        .eq("id", user?.user?.id ?? "");
      if (error) throw new Error(error.message);

      alert("Profile updated successfully!");
    } catch (err: any) {
      console.error(err.message);
      setError("Failed to update profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle avatar upload
  const handleAvatarUpload = async (file: File) => {
    try {
      if (!file) return;
      const fileName = `${Date.now()}-${file.name}`;
      const { data, error } = await supabase.storage
        .from("avatars") // Ensure you have created the "avatars" storage bucket
        .upload(fileName, file);

      if (error) throw new Error(error.message);

      // Get the public URL of the uploaded avatar
      const { data: publicUrl } = supabase.storage
        .from("avatars")
        .getPublicUrl(fileName);

      setAvatarUrl(publicUrl.publicUrl);
    } catch (err: any) {
      console.error(err.message);
      setError("Failed to upload avatar. Please try again.");
    }
  };

  // Handle logout
  //   const handleLogout = async () => {
  //     try {
  //       await supabase.auth.signOut();
  //       router.push("/"); // Redirect to the homepage after logout
  //     } catch (err: any) {
  //       console.error("Error logging out:", err.message);
  //     }
  //   };

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="max-w-md mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-4">Your Profile</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="username" className="block text-sm font-medium">
            Username
          </label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-3 py-2 border rounded"
            required
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium">
            Email
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border rounded"
            required
          />
        </div>
        <div>
          <label htmlFor="avatar" className="block text-sm font-medium">
            Avatar
          </label>
          {avatarUrl && (
            <img
              src={avatarUrl}
              alt="Avatar"
              className="w-20 h-20 rounded-full mb-2"
            />
          )}
          <input
            type="file"
            id="avatar"
            accept="image/*"
            onChange={(e) =>
              e.target.files && handleAvatarUpload(e.target.files[0])
            }
            className="w-full px-3 py-2 border rounded"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
        >
          {loading ? "Saving..." : "Save Changes"}
        </button>
      </form>
      {/* <button
        // onClick={handleLogout}
        className="mt-4 w-full bg-red-500 text-white py-2 rounded hover:bg-red-600"
      >
        Logout
      </button> */}
      <form action={signOutAction}>
        <Button type="submit" variant={"outline"}>
          Sign out
        </Button>
      </form>
    </div>
  );
}
