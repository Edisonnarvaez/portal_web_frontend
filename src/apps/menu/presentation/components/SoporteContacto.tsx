import React, { useState } from "react";
import { HiEnvelope, HiChatBubbleLeftRight, HiSparkles, HiClock, HiCheckCircle, HiArrowTopRightOnSquare, HiLifebuoy } from "react-icons/hi2";

const SOPORTE = [
  {
    canal: "Correo electrónico",
    valor: "edisonnarvaez.esn@gmail.com",
    icono: <HiEnvelope className="w-5 h-5 sm:w-6 md:w-8 md:h-8 text-white" />,
    link: "mailto:edisonnarvaez.esn@gmail.com",
    color: "from-blue-400 to-blue-500",
    bgColor: "from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/25",
    textColor: "text-blue-600 dark:text-blue-300",
    description: "Envía un correo detallado y te responderemos en 24 horas",
    disponible: true,
    //tiempo: "24 horas",
    categoria: "Asíncrono"
  },
  {
    canal: "WhatsApp",
    valor: "+57 317 498 0971",
    icono: <HiChatBubbleLeftRight className="w-5 h-5 sm:w-6 md:w-8 md:h-8 text-white" />,
    link: "https://wa.me/573174980971",
    color: "from-green-400 to-green-500",
    bgColor: "from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/25",
    textColor: "text-green-600 dark:text-green-300",
    description: "Chat directo para consultas rápidas y soporte inmediato",
    disponible: true,
    //tiempo: "Inmediato",
    categoria: "Chat"
  }
];

export default function SoporteContacto() {
  const [copiedEmail, setCopiedEmail] = useState(false);

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText("edisonnarvaez.esn@gmail.com");
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
    } catch (err) {
      console.error('Error al copiar:', err);
    }
  };

  return (
    <div className="relative overflow-hidden">
      {/* Fondo decorativo suave */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 rounded-3xl"></div>
      <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-br from-blue-300/5 to-green-300/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-56 h-56 bg-gradient-to-tr from-green-300/5 to-blue-300/5 rounded-full blur-3xl"></div>
      
      <div className="relative bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-4 sm:p-6 md:p-8">
        {/* Header suave */}
        <div className="text-center mb-6 sm:mb-8 md:mb-10">
          <div className="flex items-center justify-center gap-2 sm:gap-3 mb-3 sm:mb-4 md:mb-6">
            <div className="relative">
              <div className="p-2 sm:p-3 md:p-4 bg-gradient-to-br from-slate-500 to-slate-600 rounded-lg sm:rounded-2xl shadow-md sm:shadow-lg">
                <HiLifebuoy className="w-5 h-5 sm:w-8 md:w-10 md:h-10 text-white" />
              </div>
              <div className="absolute -top-1.5 -right-1.5 sm:-top-2 sm:-right-2 w-4 h-4 sm:w-5 md:w-6 md:h-6 bg-green-400 rounded-full flex items-center justify-center shadow-md sm:shadow-lg">
                <HiCheckCircle className="w-2.5 h-2.5 sm:w-3 md:w-4 md:h-4 text-white" />
              </div>
            </div>
            <div className="relative">
              <HiSparkles className="w-4 h-4 sm:w-6 md:w-8 md:h-8 text-yellow-400 animate-pulse" />
            </div>
          </div>
          
          <h2 className="text-xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-700 via-gray-700 to-slate-600 dark:from-slate-200 dark:via-gray-200 dark:to-slate-300 bg-clip-text text-transparent mb-2 sm:mb-3 md:mb-4">
            Soporte y Contacto
          </h2>
          <p className="text-xs sm:text-base md:text-lg text-gray-600 dark:text-gray-400 font-medium max-w-2xl mx-auto leading-relaxed px-2">
            ¿Tienes dudas o necesitas ayuda? Nuestro equipo de soporte está disponible para asistirte
          </p>
          
          {/* Horarios de atención */}
          <div className="mt-4 sm:mt-5 md:mt-6 inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 rounded-full border border-green-200 dark:border-green-700 text-xs sm:text-sm md:text-base">
            <HiClock className="w-3.5 h-3.5 sm:w-4 md:w-5 md:h-5 text-green-500 dark:text-green-400 flex-shrink-0" />
            <span className="text-green-600 dark:text-green-300 font-semibold">
              Lunes a Viernes: 7:00 AM - 3:30 PM
            </span>
          </div>
        </div>

        {/* Grid de opciones de contacto - Ajustado para 2 columnas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-6 lg:gap-8 mb-6 sm:mb-8 max-w-4xl mx-auto">
          {SOPORTE.map((item, index) => (
            <div
              key={item.canal}
              className={`
                group relative overflow-hidden rounded-lg sm:rounded-2xl transition-all duration-300 hover:shadow-lg sm:hover:shadow-xl hover:scale-[1.01] sm:hover:scale-[1.02] cursor-pointer
                bg-gradient-to-br ${item.bgColor} border border-gray-200 dark:border-gray-600 shadow-sm sm:shadow-md
              `}
            >
              {/* Efecto de partículas más suave */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className="absolute top-3 right-3 sm:top-4 sm:right-4 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-yellow-300 rounded-full animate-ping"></div>
                <div className="absolute bottom-5 left-5 sm:bottom-6 sm:left-6 w-0.5 h-0.5 sm:w-1 sm:h-1 bg-blue-300 rounded-full animate-bounce" style={{ animationDelay: '0.5s' }}></div>
              </div>
              
              {/* Badge de disponibilidad */}
              {item.disponible && (
                <div className="absolute top-2 right-2 sm:top-3 sm:right-3 md:top-4 md:right-4 z-10">
                  <div className="flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 bg-green-400 text-white text-xs font-semibold rounded-full shadow-sm">
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full animate-pulse"></div>
                    <span className="hidden sm:inline">En línea</span>
                  </div>
                </div>
              )}

              {/* Línea de acento superior más suave */}
              <div className={`absolute top-0 left-0 right-0 h-0.5 sm:h-1 bg-gradient-to-r ${item.color} opacity-70`}></div>

              <div className="relative p-3 sm:p-4 md:p-6">
                {/* Icono principal */}
                <div className="flex justify-center mb-2 sm:mb-3 md:mb-4">
                  <div className={`p-2 sm:p-3 md:p-4 rounded-lg sm:rounded-2xl shadow-md sm:shadow-lg bg-gradient-to-br ${item.color} transition-transform duration-300 group-hover:scale-105`}>
                    <div className="w-4 h-4 sm:w-6 md:w-8 md:h-8 text-white">
                      {item.icono}
                    </div>
                  </div>
                </div>

                {/* Información del canal */}
                <div className="text-center space-y-2 sm:space-y-3">
                  <div className="flex items-center justify-center gap-1 sm:gap-2 flex-wrap">
                    <h3 className={`text-base sm:text-lg md:text-xl font-bold ${item.textColor}`}>
                      {item.canal}
                    </h3>
                    <span className={`text-xs font-semibold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full bg-gradient-to-r ${item.color} text-white`}>
                      {item.categoria}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm leading-relaxed">
                    {item.description}
                  </p>
                  
                  <div className={`font-mono text-sm sm:text-base md:text-lg font-semibold ${item.textColor} bg-white/90 dark:bg-gray-800/90 rounded-lg sm:rounded-xl px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 border border-gray-200 dark:border-gray-600`}>
                    {item.valor}
                  </div>
                </div>

                {/* Botón de acción */}
                <div className="mt-3 sm:mt-4 md:mt-6 flex gap-1.5 sm:gap-2">
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`
                      group/btn flex-1 flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl font-semibold text-xs sm:text-sm md:text-base transition-all duration-300 hover:scale-[1.02] sm:hover:scale-105 shadow-sm sm:shadow-md hover:shadow-md sm:hover:shadow-lg
                      bg-gradient-to-r ${item.color} text-white border border-transparent hover:border-white/20
                    `}
                  >
                    <span className="hidden sm:inline">Contactar</span>
                    <span className="sm:hidden">Ir</span>
                    <HiArrowTopRightOnSquare className="w-3 h-3 sm:w-4 sm:h-4 group-hover/btn:translate-x-0.5 sm:group-hover/btn:translate-x-1 group-hover/btn:-translate-y-0.5 sm:group-hover/btn:-translate-y-1 transition-transform duration-300" />
                  </a>
                  
                  {item.canal === "Correo electrónico" && (
                    <button
                      onClick={copyEmail}
                      className={`
                        flex items-center justify-center p-2 sm:p-3 rounded-lg sm:rounded-xl font-medium transition-all duration-300 hover:scale-[1.02] sm:hover:scale-105 shadow-sm sm:shadow-md hover:shadow-md sm:hover:shadow-lg
                        ${copiedEmail 
                          ? 'bg-green-400 text-white' 
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }
                      `}
                      title="Copiar correo"
                    >
                      {copiedEmail ? <HiCheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <HiEnvelope className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Información adicional - Ajustada para 2 medios */}
        <div className="grid grid-cols-1 gap-4 sm:gap-6 max-w-4xl mx-auto">
          {/* Consejos de contacto */}
          <div className="bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/15 dark:to-amber-900/15 rounded-lg sm:rounded-2xl p-3 sm:p-4 md:p-6 border border-yellow-200/50 dark:border-yellow-700/50">
            <h3 className="text-sm sm:text-base md:text-lg font-bold text-yellow-700 dark:text-yellow-300 mb-2 sm:mb-3 flex items-center gap-2">
              <HiSparkles className="w-4 h-4 sm:w-5 md:w-5 md:h-5" />
              Consejos para un soporte eficiente
            </h3>
            <ul className="space-y-1 sm:space-y-2 text-xs sm:text-sm text-yellow-600 dark:text-yellow-400">
              <li className="flex items-start gap-2">
                <HiCheckCircle className="w-3 h-3 sm:w-4 sm:h-4 mt-0.5 text-yellow-500 flex-shrink-0" />
                <span>Describe claramente el problema o consulta</span>
              </li>
              <li className="flex items-start gap-2">
                <HiCheckCircle className="w-3 h-3 sm:w-4 sm:h-4 mt-0.5 text-yellow-500 flex-shrink-0" />
                <span>Incluye capturas de pantalla si es necesario</span>
              </li>
              <li className="flex items-start gap-2">
                <HiCheckCircle className="w-3 h-3 sm:w-4 sm:h-4 mt-0.5 text-yellow-500 flex-shrink-0" />
                <span>Proporciona tu información de contacto</span>
              </li>
            </ul>
          </div>

          
        </div>
      </div>
    </div>
  );
}