import React, { useState } from "react";
import { HiDocumentText, HiOutlineDocumentText, HiOutlineClipboard, HiCalendarDays, HiSparkles, HiFolder, HiEye, HiArrowTopRightOnSquare } from "react-icons/hi2";
import { HiDownload, HiExternalLink } from "react-icons/hi";

const DOCUMENTOS = [
  {
    id: 1,
    nombre: "Reglamento Interno de Trabajo",
    url: "https://drive.google.com/file/d/1cQNXCgqIVhfINusXTFOAlRnSSEZPwY23/view?usp=sharing",
    tipo: "reglamento",
    descripcion: "Normas y políticas internas de la institución para el correcto funcionamiento laboral.",
    actualizado: "2025-05-29",
    tamano: "752 KB",
    popular: false,
    categoria: "Legal"
  },
  {
    id: 2,
    nombre: "FR-DIR-002",
    url: "https://docs.google.com/document/d/1kJRzSf_MpBlPYoc4qiRA3eAPPilQuKvB/edit?usp=sharing&ouid=118103443850975241050&rtpof=true&sd=true",
    tipo: "formato",
    descripcion: "Acta de reunión",
    actualizado: "2025-01-30",
    tamano: "133 KB",
    popular: false,
    categoria: "Calidad"
  },
  {
    id: 3,
    nombre: "FR-GDC-003",
    url: "https://docs.google.com/spreadsheets/d/14fHbHb1sEFDzg4yCZkGl0V8CfMf35Pdo/edit?usp=sharing&ouid=118103443850975241050&rtpof=true&sd=true",
    tipo: "formato",
    descripcion: "Acciones  de mejoramiento",
    actualizado: "2025-02-06",
    tamano: "70 KB",
    popular: false,
    categoria: "Calidad"
  },
  {
    id: 4,
    nombre: "FR-GFR-001",
    url: "https://docs.google.com/spreadsheets/d/17MliM0wD4LsxKM-pgq3hRKnIXe_VezmS/edit?usp=sharing&ouid=118103443850975241050&rtpof=true&sd=true",
    tipo: "formato",
    descripcion: "Solicitud de viáticos individuales  y/o gastos aprobados a contratistas",
    actualizado: "2025-03-05",
    tamano: "149 KB",
    popular: false,
    categoria: "Financiera"
  },
  {
    id: 5,
    nombre: "FR-GFR-002",
    url: "https://docs.google.com/spreadsheets/d/1bNQxt3kIv9ZlEOCrdbMpknr-jNLznp0Y/edit?usp=sharing&ouid=118103443850975241050&rtpof=true&sd=true",
    tipo: "formato",
    descripcion: "Legalización de viáticos y/o gastos aprobados a contratistas",
    actualizado: "2025-03-06",
    tamano: "64 KB",
    popular: false,
    categoria: "Financiera"
  },
  {
    id: 6,
    nombre: "FR-GTH-002",
    url: "https://docs.google.com/document/d/1gjGvnGs31KB7DLoA6mcf6f6hDn-rIXUl/edit?usp=sharing&ouid=118103443850975241050&rtpof=true&sd=true",
    tipo: "formato",
    descripcion: "Lista de asistencia",
    actualizado: "2025-01-30",
    tamano: "137 KB",
    popular: false,
    categoria: "Gestión Humana"
  },
  {
    id: 7,
    nombre: "Pié de página por proceso",
    url: "https://docs.google.com/document/d/1D0OsBAhLiDTkTY6uLZl01mzY3kPFnN7Z/edit?usp=sharing&ouid=118103443850975241050&rtpof=true&sd=true",
    tipo: "plantilla",
    descripcion: "Pié de página por cada proceso",
    actualizado: "2025-04-29",
    tamano: "431 KB",
    popular: false,
    categoria: "Calidad"
  },
  {
    id: 8,
    nombre: "Plantilla presentación",
    url: "https://docs.google.com/presentation/d/1304BmzHLidi5mLEoYtw_x0zlTga6L2nL/edit?usp=sharing&ouid=118103443850975241050&rtpof=true&sd=true",
    tipo: "plantilla",
    descripcion: "Plantilla presentación edición editable",
    actualizado: "2025-04-29",
    tamano: "2.03 MB",
    popular: false,
    categoria: "Calidad"
  }
];

interface DocumentoProps {
  tipo: string;
  popular?: boolean;
}

function getIcon(tipo: string, popular: boolean = false) {
  const iconClass = `w-6 h-6 transition-transform duration-300 group-hover:scale-110 ${popular ? 'animate-pulse' : ''}`;
  
  switch (tipo) {
    case "reglamento":
      return <HiOutlineClipboard className={`${iconClass} text-white`} />;
    case "plantilla":
      return <HiOutlineDocumentText className={`${iconClass} text-white`} />;
    case "formato":
      return <HiDocumentText className={`${iconClass} text-white`} />;
    case "protocolo":
      return <HiFolder className={`${iconClass} text-white`} />;
    case "codigo":
      return <HiOutlineClipboard className={`${iconClass} text-white`} />;
    default:
      return <HiDocumentText className={`${iconClass} text-white`} />;
  }
}

function getTipoColor(tipo: string) {
  switch (tipo) {
    case "reglamento":
      return "from-blue-400 to-blue-500";
    case "plantilla":
      return "from-green-400 to-green-500";
    case "formato":
      return "from-amber-400 to-amber-500";
    case "protocolo":
      return "from-purple-400 to-purple-500";
    case "codigo":
      return "from-rose-400 to-rose-500";
    default:
      return "from-gray-400 to-gray-500";
  }
}

function getTipoBgColor(tipo: string) {
  switch (tipo) {
    case "reglamento":
      return "from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/25 border-blue-200 dark:border-blue-700";
    case "plantilla":
      return "from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/25 border-green-200 dark:border-green-700";
    case "formato":
      return "from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/25 border-amber-200 dark:border-amber-700";
    case "protocolo":
      return "from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/25 border-purple-200 dark:border-purple-700";
    case "codigo":
      return "from-rose-50 to-rose-100 dark:from-rose-900/20 dark:to-rose-800/25 border-rose-200 dark:border-rose-700";
    default:
      return "from-gray-50 to-gray-100 dark:from-gray-900/20 dark:to-gray-800/25 border-gray-200 dark:border-gray-700";
  }
}

function getTipoTextColor(tipo: string) {
  switch (tipo) {
    case "reglamento":
      return "text-blue-700 dark:text-blue-300";
    case "plantilla":
      return "text-green-700 dark:text-green-300";
    case "formato":
      return "text-amber-700 dark:text-amber-300";
    case "protocolo":
      return "text-purple-700 dark:text-purple-300";
    case "codigo":
      return "text-rose-700 dark:text-rose-300";
    default:
      return "text-gray-700 dark:text-gray-300";
  }
}

function formatDisplayDate(dateString: string, options?: Intl.DateTimeFormatOptions) {
  return new Date(dateString).toLocaleDateString("es-CO", {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    ...options,
  });
}

export default function DocumentosRecursosRapidos() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todos");

  const categorias = ["Todos", ...new Set(DOCUMENTOS.map(doc => doc.categoria))];
  
  const filteredDocuments = DOCUMENTOS.filter(doc => {
    const matchesSearch = doc.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.descripcion.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "Todos" || doc.categoria === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-8 border border-gray-200 dark:border-gray-700 relative overflow-hidden">
      {/* Fondo decorativo suave */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 rounded-3xl"></div>
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-300/5 to-purple-300/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-purple-300/5 to-blue-300/5 rounded-full blur-3xl"></div>
      
      <div className="relative bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-8">
        {/* Header suave */}
        
        <div className="text-center mb-8">
          
          <h2 className="text-3xl font-bold bg-gradient-to-r from-slate-700 via-gray-700 to-slate-600 dark:from-slate-200 dark:via-gray-200 dark:to-slate-300 bg-clip-text text-transparent mb-2">
            Documentos y Recursos Rapidos
          </h2>
          
        </div>

        {/* Barra de búsqueda y filtros */}
        <div className="mb-8 space-y-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <HiDocumentText className="h-5 w-5 text-gray-400 dark:text-gray-500" />
            </div>
            <input
              type="text"
              placeholder="Buscar documentos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-500 focus:border-slate-400 dark:focus:border-slate-500 transition-all duration-300 shadow-sm"
            />
          </div>

          {/* Filtros por categoría */}
          <div className="flex flex-wrap gap-2">
            {categorias.map(categoria => (
              <button
                key={categoria}
                onClick={() => setSelectedCategory(categoria)}
                className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                  selectedCategory === categoria
                    ? 'bg-gradient-to-r from-slate-500 to-slate-600 text-white shadow-md hover:shadow-lg'
                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                {categoria}
              </button>
            ))}
          </div>
        </div>

        {/* Grid de documentos mejorado */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4  gap-4">
          {filteredDocuments.map((doc) => (
            <div
              key={doc.id}
              className={`
                group relative overflow-hidden rounded-xl border transition-all duration-300 hover:shadow-lg hover:scale-[1.01] cursor-pointer
                bg-gradient-to-br ${getTipoBgColor(doc.tipo)} shadow
                min-h-[180px] max-h-[220px] flex flex-col
              `}
            >
              {/* Badge de popular */}
              {doc.popular && (
                <div className="absolute top-2 right-2 z-10">
                  <div className="flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-xs font-semibold rounded-full shadow-sm animate-pulse">
                    <HiSparkles className="w-3 h-3" />
                    Popular
                  </div>
                </div>
              )}

              {/* Línea de acento superior */}
              <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${getTipoColor(doc.tipo)} opacity-80`}></div>

              <div className="relative p-4 flex-1 flex flex-col">
                {/* Icono y categoría */}
                <div className="flex items-center gap-2 mb-2">
                  <div className={`p-2 rounded-lg shadow bg-gradient-to-br ${getTipoColor(doc.tipo)}`}>
                    {getIcon(doc.tipo, doc.popular)}
                  </div>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full bg-gradient-to-r ${getTipoColor(doc.tipo)} text-white shadow-sm`}>
                    {doc.categoria}
                  </span>
                </div>

                {/* Título */}
                <h3 className={`text-base font-bold mb-1 group-hover:text-slate-600 dark:group-hover:text-slate-400 transition-colors duration-300 line-clamp-1 ${getTipoTextColor(doc.tipo)}`}>
                  {doc.nombre}
                </h3>

                {/* Descripción */}
                <p className="text-gray-600 dark:text-gray-400 text-xs mb-2 line-clamp-2 leading-snug">
                  {doc.descripcion}
                </p>

                {/* Información adicional */}
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-2">
                  <span><HiCalendarDays className="inline w-4 h-4 mr-1" />{formatDisplayDate(doc.actualizado)}</span>
                  <span><HiDocumentText className="inline w-4 h-4 mr-1" />{doc.tamano}</span>
                </div>

                {/* Botón de acción */}
                <div className="flex gap-2 mt-auto">
                  <a
                    href={doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`
                      flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-lg font-semibold transition-all duration-300 hover:scale-105 shadow hover:shadow-md
                      bg-gradient-to-r ${getTipoColor(doc.tipo)} text-white hover:opacity-90 text-xs
                    `}
                  >
                    <HiEye className="w-4 h-4" />
                    Ver
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Mensaje cuando no hay resultados */}
        {filteredDocuments.length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full mx-auto mb-4 flex items-center justify-center">
              <HiDocumentText className="w-12 h-12 text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
              No se encontraron documentos
            </h3>
            <p className="text-gray-500 dark:text-gray-400 font-medium">
              Intenta ajustar los filtros de búsqueda o la categoría seleccionada
            </p>
          </div>
        )}

      </div>
    </div>
  );
}