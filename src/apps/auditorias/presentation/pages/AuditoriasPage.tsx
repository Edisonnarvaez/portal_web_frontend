import { HiOutlineCog, HiOutlineExclamation } from "react-icons/hi";
export default function AuditoriasPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <div className="flex items-center mb-4">
            <HiOutlineCog className="w-16 h-16 text-blue-500 animate-spin-slow" />
            <HiOutlineExclamation className="w-10 h-10 text-yellow-400 ml-[-20px]" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            ¡En construcción!
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-lg text-center max-w-md mb-4">
            Estamos trabajando para traerte esta funcionalidad muy pronto.<br />
            ¡Gracias por tu paciencia!
          </p>
          <span className="text-xs text-gray-400 dark:text-gray-500">PILOT</span>
          <style>
            {`
              .animate-spin-slow {
                animation: spin 2.5s linear infinite;
              }
              @keyframes spin {
                0% { transform: rotate(0deg);}
                100% { transform: rotate(360deg);}
              }
            `}
          </style>
        </div>
  );
}