import React, { useState } from "react";
import { HiOutlinePhoto, HiMagnifyingGlassPlus, HiMagnifyingGlassMinus, HiChevronLeft, HiChevronRight } from "react-icons/hi2";

// Configuración de las imágenes del organigrama
const organigramaData = [
  {
    id: 'general',
    name: 'Estructura General',
    description: 'Organigrama institucional completo de la institución',
    image: '/institucion/Organigrama.png',
    area: 'Institucional'
  },
  {
    id: 'sistemas',
    name: 'Estructura de Sistemas',
    description: 'Organigrama de la Coordinación de Sistemas',
    image: '/institucion/coordinacionsistemas.png',
    area: 'Sistemas'
  },
  {
    id: 'administrativa',
    name: 'Estructura Administrativa',
    description: 'Organigrama de la Coordinación Administrativa',
    image: '/institucion/administrativa.png',
    area: 'Administrativa'
  }
];

export default function EstructuraOrganizacional() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);

  const currentOrganigrama = organigramaData[currentIndex];

  const handleImageLoad = () => {
    setIsImageLoaded(true);
    setImageError(false);
  };

  const handleImageError = () => {
    setImageError(true);
    setIsImageLoaded(false);
  };

  const toggleZoom = () => {
    setIsZoomed(!isZoomed);
  };

  const goToPrevious = () => {
    setCurrentIndex(prev => prev === 0 ? organigramaData.length - 1 : prev - 1);
    setIsImageLoaded(false);
    setImageError(false);
    setIsZoomed(false);
  };

  const goToNext = () => {
    setCurrentIndex(prev => prev === organigramaData.length - 1 ? 0 : prev + 1);
    setIsImageLoaded(false);
    setImageError(false);
    setIsZoomed(false);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setIsImageLoaded(false);
    setImageError(false);
    setIsZoomed(false);
  };

  // ✅ Sistema de colores mejorado y compatible con modo oscuro
  const getAreaStyles = (area: string) => {
    const styles = {
      'Institucional': {
        headerBg: 'bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900',
        iconBg: 'bg-blue-100 dark:bg-blue-800',
        iconColor: 'text-blue-600 dark:text-blue-300',
        badge: 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-200',
        activeButton: 'bg-blue-600 hover:bg-blue-700 text-white',
        spinner: 'border-blue-200 border-t-blue-600 dark:border-blue-700 dark:border-t-blue-400',
        footer: 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-700',
        footerText: 'text-blue-900 dark:text-blue-100',
        footerSubtext: 'text-blue-700 dark:text-blue-300',
        retryButton: 'bg-blue-600 hover:bg-blue-700'
      },
      'Sistemas': {
        headerBg: 'bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900',
        iconBg: 'bg-purple-100 dark:bg-purple-800',
        iconColor: 'text-purple-600 dark:text-purple-300',
        badge: 'bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-200',
        activeButton: 'bg-purple-600 hover:bg-purple-700 text-white',
        spinner: 'border-purple-200 border-t-purple-600 dark:border-purple-700 dark:border-t-purple-400',
        footer: 'bg-purple-50 dark:bg-purple-900/30 border-purple-200 dark:border-purple-700',
        footerText: 'text-purple-900 dark:text-purple-100',
        footerSubtext: 'text-purple-700 dark:text-purple-300',
        retryButton: 'bg-purple-600 hover:bg-purple-700'
      },
      'Calidad': {
        headerBg: 'bg-gradient-to-r from-emerald-50 to-emerald-100 dark:from-emerald-950 dark:to-emerald-900',
        iconBg: 'bg-emerald-100 dark:bg-emerald-800',
        iconColor: 'text-emerald-600 dark:text-emerald-300',
        badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-800 dark:text-emerald-200',
        activeButton: 'bg-emerald-600 hover:bg-emerald-700 text-white',
        spinner: 'border-emerald-200 border-t-emerald-600 dark:border-emerald-700 dark:border-t-emerald-400',
        footer: 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-700',
        footerText: 'text-emerald-900 dark:text-emerald-100',
        footerSubtext: 'text-emerald-700 dark:text-emerald-300',
        retryButton: 'bg-emerald-600 hover:bg-emerald-700'
      },
      'Administrativa': {
        headerBg: 'bg-gradient-to-r from-rose-50 to-rose-100 dark:from-rose-950 dark:to-rose-900',
        iconBg: 'bg-rose-100 dark:bg-rose-800',
        iconColor: 'text-rose-600 dark:text-rose-300',
        badge: 'bg-rose-100 text-rose-800 dark:bg-rose-800 dark:text-rose-200',
        activeButton: 'bg-rose-600 hover:bg-rose-700 text-white',
        spinner: 'border-rose-200 border-t-rose-600 dark:border-rose-700 dark:border-t-rose-400',
        footer: 'bg-rose-50 dark:bg-rose-900/30 border-rose-200 dark:border-rose-700',
        footerText: 'text-rose-900 dark:text-rose-100',
        footerSubtext: 'text-rose-700 dark:text-rose-300',
        retryButton: 'bg-rose-600 hover:bg-rose-700'
      },
      'Financiera': {
        headerBg: 'bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-950 dark:to-amber-900',
        iconBg: 'bg-amber-100 dark:bg-amber-800',
        iconColor: 'text-amber-600 dark:text-amber-300',
        badge: 'bg-amber-100 text-amber-800 dark:bg-amber-800 dark:text-amber-200',
        activeButton: 'bg-amber-600 hover:bg-amber-700 text-white',
        spinner: 'border-amber-200 border-t-amber-600 dark:border-amber-700 dark:border-t-amber-400',
        footer: 'bg-amber-50 dark:bg-amber-900/30 border-amber-200 dark:border-amber-700',
        footerText: 'text-amber-900 dark:text-amber-100',
        footerSubtext: 'text-amber-700 dark:text-amber-300',
        retryButton: 'bg-amber-600 hover:bg-amber-700'
      },
      'Talento Humano': {
        headerBg: 'bg-gradient-to-r from-indigo-50 to-indigo-100 dark:from-indigo-950 dark:to-indigo-900',
        iconBg: 'bg-indigo-100 dark:bg-indigo-800',
        iconColor: 'text-indigo-600 dark:text-indigo-300',
        badge: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-800 dark:text-indigo-200',
        activeButton: 'bg-indigo-600 hover:bg-indigo-700 text-white',
        spinner: 'border-indigo-200 border-t-indigo-600 dark:border-indigo-700 dark:border-t-indigo-400',
        footer: 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-200 dark:border-indigo-700',
        footerText: 'text-indigo-900 dark:text-indigo-100',
        footerSubtext: 'text-indigo-700 dark:text-indigo-300',
        retryButton: 'bg-indigo-600 hover:bg-indigo-700'
      },
      'Servicios de Salud': {
        headerBg: 'bg-gradient-to-r from-pink-50 to-pink-100 dark:from-pink-950 dark:to-pink-900',
        iconBg: 'bg-pink-100 dark:bg-pink-800',
        iconColor: 'text-pink-600 dark:text-pink-300',
        badge: 'bg-pink-100 text-pink-800 dark:bg-pink-800 dark:text-pink-200',
        activeButton: 'bg-pink-600 hover:bg-pink-700 text-white',
        spinner: 'border-pink-200 border-t-pink-600 dark:border-pink-700 dark:border-t-pink-400',
        footer: 'bg-pink-50 dark:bg-pink-900/30 border-pink-200 dark:border-pink-700',
        footerText: 'text-pink-900 dark:text-pink-100',
        footerSubtext: 'text-pink-700 dark:text-pink-300',
        retryButton: 'bg-pink-600 hover:bg-pink-700'
      }
    };
    
    return styles[area as keyof typeof styles] || styles['Institucional'];
  };

  const areaStyles = getAreaStyles(currentOrganigrama.area);

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-8 border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div className={`${areaStyles.headerBg} px-6 py-4 border-b border-gray-200 dark:border-gray-600`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 ${areaStyles.iconBg} rounded-lg`}>
              <HiOutlinePhoto className={`w-6 h-6 ${areaStyles.iconColor}`} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
                {currentOrganigrama.name}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {currentOrganigrama.description}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <span className={`px-2 py-1 text-xs font-medium ${areaStyles.badge} rounded-full`}>
                  {currentOrganigrama.area}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {currentIndex + 1} de {organigramaData.length}
                </span>
              </div>
            </div>
          </div>
          
          {/* Controles de navegación y zoom */}
          <div className="flex items-center gap-2">
            {/* Controles de navegación */}
            <div className="flex items-center gap-1 mr-3">
              <button
                onClick={goToPrevious}
                className="p-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm"
                title="Anterior"
              >
                <HiChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={goToNext}
                className="p-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm"
                title="Siguiente"
              >
                <HiChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Control de zoom */}
            {isImageLoaded && !imageError && (
              <button
                onClick={toggleZoom}
                className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm"
                title={isZoomed ? "Zoom normal" : "Ampliar imagen"}
              >
                {isZoomed ? (
                  <>
                    <HiMagnifyingGlassMinus className="w-4 h-4" />
                    <span className="text-sm font-medium hidden sm:inline">Reducir</span>
                  </>
                ) : (
                  <>
                    <HiMagnifyingGlassPlus className="w-4 h-4" />
                    <span className="text-sm font-medium hidden sm:inline">Ampliar</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Navegador de miniaturas */}
        <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
          {organigramaData.map((item, index) => {
            const itemStyles = getAreaStyles(item.area);
            return (
              <button
                key={item.id}
                onClick={() => goToSlide(index)}
                className={`
                  flex-shrink-0 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200
                  ${index === currentIndex
                    ? `${itemStyles.activeButton} shadow-md`
                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600'
                  }
                `}
                title={item.description}
              >
                <div className="text-center">
                  <div className="font-medium">{item.name}</div>
                  <div className="text-xs opacity-75">{item.area}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Contenido */}
      <div className="p-6">
        {/* Loading state */}
        {!isImageLoaded && !imageError && (
          <div className="flex flex-col items-center justify-center py-16 space-y-4">
            <div className={`animate-spin w-8 h-8 border-4 ${areaStyles.spinner} rounded-full`}></div>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Cargando {currentOrganigrama.name.toLowerCase()}...
            </p>
          </div>
        )}

        {/* Error state */}
        {imageError && (
          <div className="flex flex-col items-center justify-center py-16 space-y-4">
            <div className="p-4 bg-red-100 dark:bg-red-900/50 rounded-full">
              <HiOutlinePhoto className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                No se pudo cargar {currentOrganigrama.name}
              </h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                La imagen no está disponible en este momento.
              </p>
              <button
                onClick={() => {
                  setImageError(false);
                  setIsImageLoaded(false);
                }}
                className={`mt-3 px-4 py-2 ${areaStyles.retryButton} text-white rounded-lg transition-colors text-sm`}
              >
                Intentar de nuevo
              </button>
            </div>
          </div>
        )}

        {/* Image container */}
        {!imageError && (
          <div className={`
            relative overflow-hidden rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 transition-all duration-300
            ${isZoomed ? 'cursor-zoom-out' : 'cursor-zoom-in'}
          `}>
            <div className={`
              transition-transform duration-500 ease-in-out overflow-auto
              ${isZoomed ? 'transform scale-150' : 'transform scale-100'}
            `}>
              <img
                src={currentOrganigrama.image}
                alt={`Organigrama ${currentOrganigrama.name}`}
                className={`
                  w-full h-auto max-w-none transition-opacity duration-300
                  ${isImageLoaded ? 'opacity-100' : 'opacity-0'}
                `}
                onLoad={handleImageLoad}
                onError={handleImageError}
                onClick={toggleZoom}
                style={{ 
                  maxHeight: isZoomed ? 'none' : '70vh',
                  objectFit: 'contain'
                }}
              />
            </div>
            
            {/* Overlay para modo zoom */}
            {isZoomed && (
              <div className="absolute top-4 right-4 bg-black/70 text-white px-3 py-1 rounded-lg text-sm backdrop-blur-sm">
                Click para reducir
              </div>
            )}
          </div>
        )}

        {/* Footer con información adicional */}
        {isImageLoaded && !imageError && (
          <div className={`mt-6 p-4 ${areaStyles.footer} rounded-lg border`}>
            <div className="flex items-start gap-3">
              <div className={`p-1 ${areaStyles.iconBg} rounded`}>
                <HiOutlinePhoto className={`w-4 h-4 ${areaStyles.iconColor}`} />
              </div>
              <div className="flex-1">
                <h4 className={`text-sm font-medium ${areaStyles.footerText} mb-1`}>
                  {currentOrganigrama.name} - {currentOrganigrama.area}
                </h4>
                <p className={`text-xs ${areaStyles.footerSubtext} leading-relaxed`}>
                  {currentOrganigrama.description}. Esta estructura muestra la organización específica 
                  del área {currentOrganigrama.area} dentro de la institucion, 
                  detallando las líneas de reporte y responsabilidades correspondientes.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}