import Link from "next/link";

export default function PostCard({ post }: { post: any }) {
  return (
    <Link href={`/post/${post.id}`} passHref>
      <div className="border p-4 rounded shadow-sm cursor-pointer">
        <p className="text-gray-600 mt-2">${post.price}</p>
        <p className="text-gray-600">{post.title}</p>
        <p className="text-gray-600">{post.profiles?.username || "Unknown"}</p>
      </div>
    </Link>
  );
}
