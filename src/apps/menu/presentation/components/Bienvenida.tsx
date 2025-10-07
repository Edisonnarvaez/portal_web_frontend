import { HiUserCircle } from "react-icons/hi2";
import { useAuthContext } from "../../../auth/presentation/context/AuthContext";
import { getProfilePicUrl } from "../../../../shared/utils/profile";

export default function Bienvenida() {
  const { user } = useAuthContext();

  // Ajusta según la estructura real de tu objeto user.role
  const cargo =
    typeof user?.role === "string"
      ? user.role
      : user?.role?.name || user?.role?.name || "";

  return (
    <div className="w-full bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl shadow-lg p-6 lg:p-8 flex flex-col sm:flex-row items-center justify-between gap-4">
      <div className="flex-1 text-center sm:text-left">
        <h1 className="text-3xl font-bold text-white mb-1">
          ¡Bienvenido, {user?.first_name || user?.username || "Funcionario"}!
        </h1>
        {cargo && (
          <p className="text-blue-100 text-lg font-medium mb-2 capitalize">
            {cargo}
          </p>
        )}
        <p className="text-blue-100 text-base italic mb-2">
          “Juntos cuidamos vidas con calidad y humanidad.”
        </p>
        
      </div>
      <div className="flex flex-col items-center">
        {user?.profile_picture ? (
          <img
            src={getProfilePicUrl(user.profile_picture) ?? undefined}
            alt="avatar"
            className="w-20 h-20 rounded-full border-4 border-white/30 shadow-lg object-cover"
          />
        ) : (
          <HiUserCircle className="w-20 h-20 text-white/80" />
        )}
      </div>
    </div>
  );
}