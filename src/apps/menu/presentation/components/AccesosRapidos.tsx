import { HiGlobeAlt, HiUserGroup, HiBriefcase, HiDocumentText } from "react-icons/hi2";
import { FiExternalLink } from "react-icons/fi";

const ACCESOS = [
	{
		nombre: "Página Web Institucional",
		url: "https://redmedicronips.com.co",
		icono: <HiGlobeAlt className="w-10 h-10 text-blue-600 group-hover:scale-110 transition-transform" />,
		color: "bg-gradient-to-br from-blue-100/80 to-blue-200/60 dark:from-blue-900/60 dark:to-blue-800/40",
	},
	{
		nombre: "Facebook",
		url: "https://facebook.com/redmedicronips",
		icono: <HiUserGroup className="w-10 h-10 text-blue-700 group-hover:scale-110 transition-transform" />,
		color: "bg-gradient-to-br from-blue-200/80 to-blue-100/60 dark:from-blue-800/60 dark:to-blue-700/40",
	},
	{
		nombre: "Salud IPS (Historia Clínica)",
		url: "http://186.115.218.10/SaludIPS/",
		icono: <HiDocumentText className="w-10 h-10 text-green-600 group-hover:scale-110 transition-transform" />,
		color: "bg-gradient-to-br from-green-100/80 to-green-200/60 dark:from-green-900/60 dark:to-green-800/40",
	},
	{
		nombre: "Nómina Web",
		url: "https://nomina.redmedicronips.com.co",
		icono: <HiBriefcase className="w-10 h-10 text-yellow-600 group-hover:scale-110 transition-transform" />,
		color: "bg-gradient-to-br from-yellow-100/80 to-yellow-200/60 dark:from-yellow-900/60 dark:to-yellow-800/40",
	},
	{
		nombre: "Gestión Humana",
		url: "http://192.168.59.207:8080/gestionhumana2/",
		icono: <HiUserGroup className="w-10 h-10 text-pink-600 group-hover:scale-110 transition-transform" />,
		color: "bg-gradient-to-br from-pink-100/80 to-pink-200/60 dark:from-pink-900/60 dark:to-pink-800/40",
	},
	// Agrega más accesos aquí según se integren nuevas apps
];

export default function AccesosRapidos() {
	return (
		<div className="bg-white/80 dark:bg-gray-900/80 rounded-2xl shadow-lg p-8 backdrop-blur-md">
			<h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6 text-center tracking-tight">
				Accesos Rápidos
			</h2>
			<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-5 gap-8">
				{ACCESOS.map((acceso) => (
					<a
						key={acceso.nombre}
						href={acceso.url}
						target="_blank"
						rel="noopener noreferrer"
						className={`group flex flex-col items-center justify-center rounded-xl shadow-xl ${acceso.color} transition-transform hover:scale-105 hover:shadow-2xl focus:outline-none focus:ring-2 focus:ring-blue-400/60 border border-white/30 dark:border-gray-800/40 p-6 cursor-pointer`}
						style={{
							minHeight: 180,
							boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.10)",
							backdropFilter: "blur(6px)",
						}}
					>
						<div className="mb-3">{acceso.icono}</div>
						<div className="font-semibold text-lg text-gray-900 dark:text-gray-100 mb-2 text-center">
							{acceso.nombre}
						</div>
						<span className="inline-flex items-center gap-1 px-3 py-1 bg-white/60 dark:bg-gray-800/60 rounded-full text-blue-700 dark:text-blue-300 text-xs font-medium shadow group-hover:bg-blue-100/80 group-hover:text-blue-900 transition">
							Ir <FiExternalLink className="w-4 h-4" />
						</span>
					</a>
				))}
			</div>
		</div>
	);
}