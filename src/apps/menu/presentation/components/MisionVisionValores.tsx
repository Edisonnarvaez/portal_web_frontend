import React, { useState } from "react";
import { HiLightBulb, HiEye } from "react-icons/hi2";
import { HiHeart, HiCheckCircle } from "react-icons/hi";
// O si prefieres handshake real:
import { FaHandshake } from "react-icons/fa";

const MISION = "Somos una institución nariñense que presta servicios de salud primarios y complementarios, articulados en una red integrada de prestadores, con un modelo de atención integral con enfoque de riesgo centrado en el usuario y su familia. Contamos con un equipo humano competente y en constante aprendizaje, comprometido con la calidad, seguridad y humanización de la atención; con procesos, tecnología y sistemas de información basados en las mejores prácticas del mercado y acorde a las necesidades de sus grupos de interés. Promovemos el cuidado del medio ambiente, contribuimos al mantenimiento de la salud de nuestros usuarios y al equilibrio financiero institucional y del sistema.";
const VISION = "Para el año 2027, Red Medicron IPS será reconocida como una red de servicios de salud líder en Nariño, destacándose por su atención integral centrada en el usuario y su familia, comprometida con la sostenibilidad ambiental y financiera, la gestión del riesgo y un servicio humanizado que transforme la experiencia de salud en la región.";
const VALORES = [
  {
    nombre: "HUMANIDAD",
    descripcion: "Servimos con amabilidad, dignidad, seguridad y empatía, respondiendo a las necesidades de las personas.",
    icono: <HiHeart className="w-8 h-8 text-pink-500" />,
    color: "from-pink-100 to-pink-50 dark:from-pink-900 dark:to-pink-800"
  },
  {
    nombre: "RESPONSABILIDAD",
    descripcion: "Cumplimos nuestros compromisos.",
    icono: <HiCheckCircle className="w-8 h-8 text-green-500" />,
    color: "from-green-100 to-green-50 dark:from-green-900 dark:to-green-800"
  },
  {
    nombre: "INTEGRIDAD",
    descripcion: "Actuamos y servimos de una manera respetuosa y honesta, generando relaciones de confianza con todos los grupos de interés.",
    icono: <FaHandshake className="w-8 h-8 text-blue-500" />, // O HiOutlineHandRaised
    color: "from-blue-100 to-blue-50 dark:from-blue-900 dark:to-blue-800"
  },
];

const tabs = [
  {
    label: "Misión",
    icon: <HiLightBulb className="w-6 h-6 mr-2 text-blue-600 dark:text-blue-300" />,
    content: <p>{MISION}</p>
  },
  {
    label: "Visión",
    icon: <HiEye className="w-6 h-6 mr-2 text-blue-600 dark:text-blue-300" />,
    content: <p>{VISION}</p>
  },
  {
    label: "Valores",
    icon: <HiHeart className="w-6 h-6 mr-2 text-blue-600 dark:text-blue-300" />,
    content: (
      <ul className="space-y-4">
        {VALORES.map((valor) => (
          <li key={valor.nombre} className="flex items-start gap-3">
            <span className="text-2xl mt-1">{valor.icono}</span>
            <div>
              <span className="font-bold text-blue-700 dark:text-blue-300">{valor.nombre}</span>
              <p className="text-gray-700 dark:text-gray-200">{valor.descripcion}</p>
            </div>
          </li>
        ))}
      </ul>
    )
  }
];

export default function MisionVisionValores() {
  const [active, setActive] = useState(0);

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6">
      <div className="flex gap-4 border-b border-gray-200 dark:border-gray-700 mb-4">
        {tabs.map((tab, idx) => (
          <button
            key={tab.label}
            onClick={() => setActive(idx)}
            className={`flex items-center pb-2 px-3 font-semibold text-blue-700 dark:text-blue-300 border-b-2 transition-all
              ${active === idx ? "border-blue-700 dark:border-blue-300 bg-blue-50 dark:bg-blue-950 rounded-t-md" : "border-transparent"}
              hover:bg-blue-100 dark:hover:bg-blue-900`}
            style={{ outline: "none" }}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>
      <div className="text-gray-700 dark:text-gray-200 text-base max-h-56 overflow-y-auto transition-all duration-300">
        {tabs[active].content}
      </div>
    </div>
  );
}

export function ValoresCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {VALORES.map((valor) => (
        <div
          key={valor.nombre}
          className={`rounded-xl shadow-md p-6 bg-gradient-to-br ${valor.color} transition-transform hover:scale-105 hover:shadow-lg flex flex-col items-center text-center`}
        >
          <div className="mb-2">{valor.icono}</div>
          <div className="font-bold text-lg text-gray-900 dark:text-gray-100 mb-1">{valor.nombre}</div>
          <div className="text-gray-700 dark:text-gray-200 text-sm">{valor.descripcion}</div>
        </div>
      ))}
    </div>
  );
}

export function MisionVisionCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Misión */}
      <div className="rounded-xl shadow-md p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800 transition-transform hover:scale-105 hover:shadow-lg">
        <div className="flex items-center mb-3">
          <HiLightBulb className="w-8 h-8 text-blue-600 dark:text-blue-300 mr-2" />
          <h2 className="text-xl font-bold text-blue-700 dark:text-blue-200">Misión</h2>
        </div>
        <p className="text-gray-700 dark:text-gray-200 text-base">{MISION}</p>
      </div>
      {/* Visión */}
      <div className="rounded-xl shadow-md p-6 bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900 dark:to-indigo-800 transition-transform hover:scale-105 hover:shadow-lg">
        <div className="flex items-center mb-3">
          <HiEye className="w-8 h-8 text-indigo-600 dark:text-indigo-300 mr-2" />
          <h2 className="text-xl font-bold text-indigo-700 dark:text-indigo-200">Visión</h2>
        </div>
        <p className="text-gray-700 dark:text-gray-200 text-base">{VISION}</p>
      </div>
    </div>
  );
}