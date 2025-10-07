import React from 'react';
import { HiUsers, HiBuildingOffice2, HiDocumentText, HiChartBarSquare } from 'react-icons/hi2';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export default function ProveedoresPage() {
  const navigate = useNavigate();

  const modules = [
    {
      title: "Gestión de Terceros",
      description: "Administra la información de personas naturales y jurídicas",
      icon: <HiUsers className="w-8 h-8" />,
      path: "/terceros",
      color: "bg-blue-500",
      hoverColor: "hover:bg-blue-600"
    },
    {
      title: "Proveedores",
      description: "Gestión específica de proveedores y sus contratos",
      icon: <HiBuildingOffice2 className="w-8 h-8" />,
      path: "/proveedores",
      color: "bg-green-500",
      hoverColor: "hover:bg-green-600",
      disabled: true
    },
    {
      title: "Contratos",
      description: "Administración de contratos y acuerdos comerciales",
      icon: <HiDocumentText className="w-8 h-8" />,
      path: "/contratos",
      color: "bg-purple-500",
      hoverColor: "hover:bg-purple-600",
      disabled: true
    },
    {
      title: "Reportes",
      description: "Generación de reportes y análisis de proveedores",
      icon: <HiChartBarSquare className="w-8 h-8" />,
      path: "/reportes",
      color: "bg-orange-500",
      hoverColor: "hover:bg-orange-600",
      disabled: true
    }
  ];

  const handleModuleClick = (module: any) => {
    if (module.disabled) {
      // Mostrar mensaje de que está en desarrollo
      return;
    }
    navigate(module.path);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"
      >
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
            <HiBuildingOffice2 className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Módulo de Proveedores
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Gestión integral de terceros, proveedores y relaciones comerciales
            </p>
          </div>
        </div>
      </motion.div>

      {/* Módulos disponibles */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {modules.map((module, index) => (
          <motion.div
            key={module.title}
            variants={cardVariants}
            whileHover={{ scale: module.disabled ? 1 : 1.02 }}
            whileTap={{ scale: module.disabled ? 1 : 0.98 }}
            className={`
              bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 
              ${module.disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:shadow-md'} 
              transition-all duration-200
            `}
            onClick={() => handleModuleClick(module)}
          >
            <div className="p-6">
              <div className={`
                w-16 h-16 ${module.color} ${module.disabled ? '' : module.hoverColor} 
                rounded-lg flex items-center justify-center text-white mb-4 transition-colors
              `}>
                {module.icon}
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                {module.title}
                {module.disabled && (
                  <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 px-2 py-1 rounded-full">
                    Próximamente
                  </span>
                )}
              </h3>
              
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                {module.description}
              </p>

              {!module.disabled && (
                <div className="mt-4 flex items-center text-blue-600 dark:text-blue-400 text-sm font-medium">
                  Acceder
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Información adicional */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6"
      >
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-medium text-blue-900 dark:text-blue-100 mb-2">
              Estado del Módulo
            </h3>
            <div className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
              <p>✅ <strong>Gestión de Terceros:</strong> Completamente funcional</p>
              <p>🚧 <strong>Proveedores:</strong> En desarrollo</p>
              <p>🚧 <strong>Contratos:</strong> En desarrollo</p>
              <p>🚧 <strong>Reportes:</strong> En desarrollo</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}