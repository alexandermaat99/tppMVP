import Link from "next/link";
import { useRouter } from "next/navigation";

export default function PostCard({ post }: { post: any }) {
  const router = useRouter();

  // Check if post.post_images is defined and has at least one item
  const imageUrl =
    post.post_images && post.post_images.length > 0
      ? post.post_images[0].image_url
      : null;

  const handlePostClick = (e: React.MouseEvent) => {
    e.preventDefault();
    localStorage.setItem("scrollPosition", window.scrollY.toString());
    router.push(`/post/${post.id}`);
  };

  return (
    <Link href={`/post/${post.id}`} passHref onClick={handlePostClick}>
      <div className="border p-4 rounded shadow-sm cursor-pointer">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={post.title}
            className="w-full h-72 object-cover rounded mb-4"
          />
        ) : (
          <div className="w-full h-72 bg-gray-200 flex items-center justify-center rounded mb-4">
            <span>No Image Available</span>
          </div>
        )}
        <p className="text-gray-600">${post.price}</p>
        <p className="text-gray-600">{post.title}</p>
        <p className="text-gray-600">{post.profiles?.username || "Unknown"}</p>
      </div>
    </Link>
  );
}
