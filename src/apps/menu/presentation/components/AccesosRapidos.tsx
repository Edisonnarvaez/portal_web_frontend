import { HiGlobeAlt, HiUserGroup, HiBriefcase, HiDocumentText } from "react-icons/hi2";
import { FiExternalLink } from "react-icons/fi";

const ACCESOS = [
	{
		nombre: "Página Web Institucional",
		url: "https://portafolio-tau-flax.vercel.app/",
		icono: <HiGlobeAlt className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 text-blue-600 group-hover:scale-110 transition-transform" />,
		color: "bg-gradient-to-br from-blue-100/80 to-blue-200/60 dark:from-blue-900/60 dark:to-blue-800/40",
	},
	{
		nombre: "Facebook",
		url: "https://web.facebook.com/edisonstiven.narvaezpaz",
		icono: <HiUserGroup className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 text-blue-700 group-hover:scale-110 transition-transform" />,
		color: "bg-gradient-to-br from-blue-200/80 to-blue-100/60 dark:from-blue-800/60 dark:to-blue-700/40",
	},
	{
		nombre: "Historia Clínica",
		url: "http://localhost/HC/",
		icono: <HiDocumentText className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 text-green-600 group-hover:scale-110 transition-transform" />,
		color: "bg-gradient-to-br from-green-100/80 to-green-200/60 dark:from-green-900/60 dark:to-green-800/40",
	},
	{
		nombre: "Nómina Web",
		url: "https://nomina.pilot.com.co",
		icono: <HiBriefcase className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 text-yellow-600 group-hover:scale-110 transition-transform" />,
		color: "bg-gradient-to-br from-yellow-100/80 to-yellow-200/60 dark:from-yellow-900/60 dark:to-yellow-800/40",
	},
	{
		nombre: "Gestión Humana",
		url: "http://localhost/gestionhumana/",
		icono: <HiUserGroup className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 text-pink-600 group-hover:scale-110 transition-transform" />,
		color: "bg-gradient-to-br from-pink-100/80 to-pink-200/60 dark:from-pink-900/60 dark:to-pink-800/40",
	},
	// Agrega más accesos aquí según se integren nuevas apps
];

export default function AccesosRapidos() {
	return (
		<div className="bg-white/80 dark:bg-gray-900/80 rounded-2xl shadow-lg p-4 sm:p-6 md:p-8 backdrop-blur-md">
			<h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3 sm:mb-4 md:mb-6 text-center tracking-tight">
				Accesos Rápidos
			</h2>
			<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 2xl:grid-cols-5 gap-2 sm:gap-3 md:gap-4 lg:gap-6">
				{ACCESOS.map((acceso) => (
					<a
						key={acceso.nombre}
						href={acceso.url}
						target="_blank"
						rel="noopener noreferrer"
					className={`group flex flex-col items-center justify-center rounded-lg sm:rounded-xl shadow-md sm:shadow-xl ${acceso.color} transition-transform hover:scale-105 hover:shadow-xl sm:hover:shadow-2xl focus:outline-none focus:ring-2 focus:ring-blue-400/60 border border-white/30 dark:border-gray-800/40 p-2 sm:p-3 md:p-4 lg:p-5 md:p-6 cursor-pointer`}
					style={{
						minHeight: "auto",
						boxShadow: "0 4px 16px 0 rgba(31, 38, 135, 0.08)",
						backdropFilter: "blur(6px)",
					}}
					>
						<div className="mb-1 sm:mb-2 md:mb-3">{acceso.icono}</div>
					<div className="font-semibold text-xs sm:text-sm md:text-base lg:text-lg text-gray-900 dark:text-gray-100 mb-1 sm:mb-2 text-center line-clamp-2">
							{acceso.nombre}
						</div>
						<span className="hidden sm:inline-flex items-center gap-1 px-2 sm:px-3 py-0.5 sm:py-1 bg-white/60 dark:bg-gray-800/60 rounded-full text-blue-700 dark:text-blue-300 text-xs font-medium shadow group-hover:bg-blue-100/80 group-hover:text-blue-900 transition">
							Ir <FiExternalLink className="w-3 h-3 sm:w-4 sm:h-4" />
						</span>
					</a>
				))}
			</div>
		</div>
	);
}