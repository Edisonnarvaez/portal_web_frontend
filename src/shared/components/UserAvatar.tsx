import { getProfilePicUrl } from "../utils/profile";

export default function UserAvatar({
  src,
  name,
  size = 48,
  className = "",
}: {
  src?: string | null;
  name: string;
  size?: number;
  className?: string;
}) {
  const url =
    src && src.startsWith("blob:")
      ? src
      : getProfilePicUrl(src ?? "") ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=1e40af&color=fff&size=${size * 4}`;
  return (
    <img
      src={url}
      alt="avatar"
      className={`rounded-full border-4 border-blue-100 object-cover ${className}`}
      style={{ width: size, height: size }}
    />
  );
}