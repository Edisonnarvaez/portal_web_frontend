import React, { useState } from "react";
import { HiEnvelope, HiChatBubbleLeftRight, HiSparkles, HiClock, HiCheckCircle, HiArrowTopRightOnSquare, HiLifebuoy } from "react-icons/hi2";

const SOPORTE = [
  {
    canal: "Correo electrónico",
    valor: "tic@redmedicronips.com.co",
    icono: <HiEnvelope className="w-8 h-8 text-white" />,
    link: "mailto:tic@redmedicronips.com.co",
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
    icono: <HiChatBubbleLeftRight className="w-8 h-8 text-white" />,
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
      await navigator.clipboard.writeText("tic@redmedicronips.com.co");
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
      
      <div className="relative bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-8">
        {/* Header suave */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="relative">
              <div className="p-4 bg-gradient-to-br from-slate-500 to-slate-600 rounded-2xl shadow-lg">
                <HiLifebuoy className="w-10 h-10 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-400 rounded-full flex items-center justify-center shadow-lg">
                <HiCheckCircle className="w-4 h-4 text-white" />
              </div>
            </div>
            <div className="relative">
              <HiSparkles className="w-8 h-8 text-yellow-400 animate-pulse" />
            </div>
          </div>
          
          <h2 className="text-4xl font-bold bg-gradient-to-r from-slate-700 via-gray-700 to-slate-600 dark:from-slate-200 dark:via-gray-200 dark:to-slate-300 bg-clip-text text-transparent mb-4">
            Soporte y Contacto
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-lg font-medium max-w-2xl mx-auto leading-relaxed">
            ¿Tienes dudas o necesitas ayuda? Nuestro equipo de soporte está disponible para asistirte
          </p>
          
          {/* Horarios de atención */}
          <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 rounded-full border border-green-200 dark:border-green-700">
            <HiClock className="w-5 h-5 text-green-500 dark:text-green-400" />
            <span className="text-green-600 dark:text-green-300 font-semibold">
              Lunes a Viernes: 7:00 AM - 3:30 PM
            </span>
          </div>
        </div>

        {/* Grid de opciones de contacto - Ajustado para 2 columnas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 max-w-4xl mx-auto">
          {SOPORTE.map((item, index) => (
            <div
              key={item.canal}
              className={`
                group relative overflow-hidden rounded-2xl transition-all duration-300 hover:shadow-xl hover:scale-[1.02] cursor-pointer
                bg-gradient-to-br ${item.bgColor} border border-gray-200 dark:border-gray-600 shadow-md
              `}
            >
              {/* Efecto de partículas más suave */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className="absolute top-4 right-4 w-2 h-2 bg-yellow-300 rounded-full animate-ping"></div>
                <div className="absolute bottom-6 left-6 w-1 h-1 bg-blue-300 rounded-full animate-bounce" style={{ animationDelay: '0.5s' }}></div>
              </div>
              
              {/* Badge de disponibilidad */}
              {item.disponible && (
                <div className="absolute top-4 right-4 z-10">
                  <div className="flex items-center gap-1 px-2 py-1 bg-green-400 text-white text-xs font-semibold rounded-full shadow-sm">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    En línea
                  </div>
                </div>
              )}

              {/* Línea de acento superior más suave */}
              <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${item.color} opacity-70`}></div>

              <div className="relative p-6">
                {/* Icono principal */}
                <div className="flex justify-center mb-4">
                  <div className={`p-4 rounded-2xl shadow-lg bg-gradient-to-br ${item.color} transition-transform duration-300 group-hover:scale-105`}>
                    {item.icono}
                  </div>
                </div>

                {/* Información del canal */}
                <div className="text-center space-y-3">
                  <div className="flex items-center justify-center gap-2 flex-wrap">
                    <h3 className={`text-xl font-bold ${item.textColor}`}>
                      {item.canal}
                    </h3>
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full bg-gradient-to-r ${item.color} text-white`}>
                      {item.categoria}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                    {item.description}
                  </p>
                  
                  <div className={`font-mono text-lg font-semibold ${item.textColor} bg-white/90 dark:bg-gray-800/90 rounded-xl px-4 py-2 border border-gray-200 dark:border-gray-600`}>
                    {item.valor}
                  </div>
                  
                  
                </div>

                {/* Botón de acción */}
                <div className="mt-6 flex gap-2">
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`
                      group/btn flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 shadow-md hover:shadow-lg
                      bg-gradient-to-r ${item.color} text-white border border-transparent hover:border-white/20
                    `}
                  >
                    <span>Contactar</span>
                    <HiArrowTopRightOnSquare className="w-4 h-4 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform duration-300" />
                  </a>
                  
                  {item.canal === "Correo electrónico" && (
                    <button
                      onClick={copyEmail}
                      className={`
                        flex items-center justify-center p-3 rounded-xl font-medium transition-all duration-300 hover:scale-105 shadow-md hover:shadow-lg
                        ${copiedEmail 
                          ? 'bg-green-400 text-white' 
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }
                      `}
                      title="Copiar correo"
                    >
                      {copiedEmail ? <HiCheckCircle className="w-4 h-4" /> : <HiEnvelope className="w-4 h-4" />}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Información adicional - Ajustada para 2 medios */}
        <div className="grid grid-cols-1 md:grid-cols-1 gap-6 max-w-4xl mx-auto">
          {/* Consejos de contacto */}
          <div className="bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/15 dark:to-amber-900/15 rounded-2xl p-6 border border-yellow-200/50 dark:border-yellow-700/50">
            <h3 className="text-lg font-bold text-yellow-700 dark:text-yellow-300 mb-3 flex items-center gap-2">
              <HiSparkles className="w-5 h-5" />
              Consejos para un soporte eficiente
            </h3>
            <ul className="space-y-2 text-sm text-yellow-600 dark:text-yellow-400">
              <li className="flex items-start gap-2">
                <HiCheckCircle className="w-4 h-4 mt-0.5 text-yellow-500" />
                <span>Describe claramente el problema o consulta</span>
              </li>
              <li className="flex items-start gap-2">
                <HiCheckCircle className="w-4 h-4 mt-0.5 text-yellow-500" />
                <span>Incluye capturas de pantalla si es necesario</span>
              </li>
              <li className="flex items-start gap-2">
                <HiCheckCircle className="w-4 h-4 mt-0.5 text-yellow-500" />
                <span>Proporciona tu información de contacto</span>
              </li>
            </ul>
          </div>

          
        </div>
      </div>
    </div>
  );
}