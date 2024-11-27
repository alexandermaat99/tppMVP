//The logic is to pull data
// populate fields with the data
// update the fields
// update the database

"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { signOutAction } from "@/app/actions";
import { Button } from "@/components/ui/button";

//step 1 start with export default function
//step 2 add the form and fields
//step 3 add bring in the field data from the database
//step 4 add the logic to update the database, handleSubmit

export default function ProfilePage() {
  const [username, setUsername] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();
  const [patternPoints, setPatternPoints] = useState();

  //runs once when the component mounts
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data: user, error: userError } = await supabase.auth.getUser();
        if (userError) throw new Error(userError.message);

        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("username, email, pattern_points")
          .eq("id", user?.user.id)
          .single();
        if (profileError) throw new Error(profileError.message);

        setUsername(profile.username);
        setEmail(profile.email);
        setPatternPoints(profile.pattern_points);
      } catch (error: any) {
        console.error(error.message);
        setError("Failed to fetch profile data. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    //fetch profile end at this bracket
    fetchProfile();
  }, []);
  //brackets tells react to run this function only once

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    //e.preventDefault() prevents the form from submitting and refreshing the page
    setLoading(true);
    //while this code is running, the loading state is set to true

    try {
      // check if the username has spaces
      if (/\s/.test(username)) {
        alert("Username cannot contain spaces. Please enter a valid username.");
        return; // Stop further execution
      }
      // Check if the username is empty
      if (!username.trim()) {
        alert("Username cannot be empty. Please enter a valid username.");
        return; // Stop further execution
      }

      // Fetch the current user
      const { data: user } = await supabase.auth.getUser();

      // Check if the username is already taken
      const { data: existingUser, error: fetchError } = await supabase
        .from("profiles")
        .select("id")
        .eq("username", username)
        .neq("id", user?.user?.id) // Ensure it’s not the current user’s username
        .single();

      if (fetchError && fetchError.code !== "PGRST116") {
        // Ignore "No rows found" errors
        throw new Error(fetchError.message);
      }

      if (existingUser) {
        alert("This username is already taken. Please choose another one.");
        return; // Stop further execution
      }

      // Update the profile in the database
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ username, email })
        .eq("id", user?.user?.id ?? "");

      if (updateError) throw new Error(updateError.message);

      alert("Profile updated successfully");
    } catch (err: any) {
      console.error(err.message);
      setError("Failed to update profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="max-w-md mx-auto mt-10">
      <form onSubmit={handleSubmit}>
        <label htmlFor="username">Username</label>
        <input
          type="text"
          id="username"
          value={username}
          onChange={(e) =>
            setUsername(e.target.value.replace(/\s/g, "").toLowerCase())
          }
          // e.target.value is the value of the input field

          className="w-full px-3 py-2 border rounded"
        />
        <label htmlFor="email">Email</label>
        <input
          type="email"
          id="username"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          // e.target.value is the value of the input field
          className="w-full px-3 py-2 border rounded"
        />

        <label htmlFor="patternPoints">Pattern Points</label>
        <p>{patternPoints}</p>

        {/* link for changing password */}
        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
        >
          {loading ? "Saving..." : "Save Changes"}
          {/* if loading is true, the button will say "Saving..." */}
        </button>
      </form>
      <form action={signOutAction}>
        <Button type="submit" variant={"outline"}>
          Sign out
        </Button>
      </form>
    </div>
  );
}
// {
//   error && <p className="text-red-500">{error}</p>;
// }
// {
//   loading ? (
//     <p>Loading...</p>
//   ) : (
//     <>
//       <label htmlFor="email">Email</label>
//       <label htmlFor="email">Email</label>
//       <input
//         type="email"
//         id="email"
//         value={email}
//         className="w-full px-3 py-2 border rounded"
//       />
//     </>
//   );
// }
