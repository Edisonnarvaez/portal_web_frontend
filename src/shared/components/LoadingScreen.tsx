import React from 'react';

interface LoadingScreenProps {
    message?: string;
    fullScreen?: boolean;
}

/**
 * LoadingScreen Premium - Diseño profesional con animaciones fluidas
 * Inspirado en estándares de enterprise: Figma, Linear, Notion
 */
const LoadingScreen: React.FC<LoadingScreenProps> = ({
    message = 'Cargando...',
    fullScreen = false
}) => {
    return (
        <div
            className={`flex items-center justify-center ${fullScreen
                    ? 'fixed inset-0 z-50'
                    : 'min-h-[400px]'
                } overflow-hidden`}
        >
            {/* Background Ultra Premium */}
            <div className="absolute inset-0">
                {/* Base gradient dinámico */}
                <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950"></div>

                {/* Animated gradient mesh */}
                <div className="absolute inset-0 opacity-40 dark:opacity-20 mix-blend-multiply dark:mix-blend-screen">
                    <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 dark:opacity-10 animate-[float_6s_ease-in-out_infinite]"></div>
                    <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 dark:opacity-10 animate-[float_8s_ease-in-out_infinite] -delay-2s" style={{ animationDelay: '-2s' }}></div>
                    <div className="absolute -bottom-8 left-1/2 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 dark:opacity-10 animate-[float_7s_ease-in-out_infinite] -delay-1s" style={{ animationDelay: '-1s' }}></div>
                </div>

                {/* Light rays (solo light mode) */}
                <div className="absolute inset-0 opacity-30 dark:opacity-0">
                    <div className="absolute top-0 left-1/2 w-1 h-full bg-gradient-to-b from-white via-blue-100 to-transparent"></div>
                    <div className="absolute top-0 left-1/3 w-1 h-full bg-gradient-to-b from-white via-indigo-100 to-transparent opacity-50"></div>
                </div>
            </div>

            {/* Content Container */}
            <div className="relative z-10 flex flex-col items-center justify-center">
                {/* Premium Glass Card */}
                <div className="backdrop-blur-3xl bg-white/50 dark:bg-slate-800/50 border border-white/70 dark:border-slate-700/70 rounded-2xl shadow-2xl shadow-blue-500/20 dark:shadow-blue-900/30 p-12 sm:p-16 max-w-md mx-4">
                    {/* Logo Section */}
                    <div className="relative mb-10 flex justify-center h-40">
                        {/* Dynamic aura layers */}
                        <div className="absolute inset-0 bg-gradient-to-t from-blue-600/20 via-indigo-600/10 to-transparent rounded-full blur-3xl dark:from-blue-500/10 dark:via-indigo-500/5"></div>

                        {/* Outer glow ring - animated */}
                        <div
                            className="absolute -inset-6 rounded-full border border-blue-400/30 dark:border-blue-500/20"
                            style={{
                                animation: 'pulse-ring 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                            }}
                        ></div>

                        {/* Inner glow ring */}
                        <div
                            className="absolute -inset-3 rounded-full border border-indigo-400/20 dark:border-indigo-500/15"
                            style={{
                                animation: 'pulse-ring 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                                animationDelay: '0.3s'
                            }}
                        ></div>

                        {/* Logo Image with premium shadow */}
                        <div className="relative z-10">
                            <img
                                src="/logo_pilot_1.png"
                                alt="PILOT Logo"
                                className="h-32 w-auto object-contain"
                                style={{
                                    animation: 'float-premium 4s cubic-bezier(0.45, 0, 0.55, 1) infinite',
                                    filter: 'drop-shadow(0 20px 40px rgba(59, 130, 246, 0.25)) drop-shadow(0 0 30px rgba(99, 102, 241, 0.15))'
                                }}
                            />
                        </div>
                    </div>

                    {/* Spinner Premium - SVG Based */}
                    <div className="relative h-24 flex items-center justify-center mb-8">
                        {/* Outer orbital spinner */}
                        <svg
                            className="absolute w-16 h-16"
                            viewBox="0 0 64 64"
                            style={{
                                animation: 'spin-smooth 3s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                            }}
                        >
                            <defs>
                                <linearGradient id="spinGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="rgb(59, 130, 246)" stopOpacity="1" />
                                    <stop offset="50%" stopColor="rgb(99, 102, 241)" stopOpacity="0.8" />
                                    <stop offset="100%" stopColor="rgb(59, 130, 246)" stopOpacity="0.3" />
                                </linearGradient>
                            </defs>
                            <circle
                                cx="32"
                                cy="32"
                                r="28"
                                fill="none"
                                stroke="url(#spinGrad1)"
                                strokeWidth="3.5"
                                strokeLinecap="round"
                                strokeDasharray="87.96 131.95"
                            />
                        </svg>

                        {/* Inner counter-spinner */}
                        <svg
                            className="absolute w-10 h-10"
                            viewBox="0 0 40 40"
                            style={{
                                animation: 'spin-smooth-reverse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                            }}
                        >
                            <defs>
                                <linearGradient id="spinGrad2" x1="100%" y1="0%" x2="0%" y2="100%">
                                    <stop offset="0%" stopColor="rgb(99, 102, 241)" stopOpacity="0.8" />
                                    <stop offset="100%" stopColor="rgb(59, 130, 246)" stopOpacity="0.3" />
                                </linearGradient>
                            </defs>
                            <circle
                                cx="20"
                                cy="20"
                                r="16"
                                fill="none"
                                stroke="url(#spinGrad2)"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeDasharray="50.27 75.40"
                            />
                        </svg>

                        {/* Center dot - pulsing */}
                        <div
                            className="absolute w-4 h-4 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/60 dark:shadow-blue-600/40"
                            style={{
                                animation: 'pulse-dot 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                            }}
                        ></div>
                    </div>

                    {/* Message Section */}
                    <div className="text-center space-y-4 mb-2">
                        {/* Primary message */}
                        <h3 className="text-lg font-bold bg-gradient-to-r from-slate-900 via-blue-800 to-indigo-900 dark:from-slate-50 dark:via-blue-200 dark:to-indigo-100 bg-clip-text text-transparent leading-tight">
                            {message}
                        </h3>

                        {/* Animated loading dots */}
                        <div className="flex items-center justify-center gap-2 h-6">
                            {[0, 1, 2].map((index) => (
                                <div
                                    key={index}
                                    className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 shadow-md shadow-blue-500/50"
                                    style={{
                                        animation: 'bounce-dots 1.6s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite',
                                        animationDelay: `${index * 0.2}s`
                                    }}
                                ></div>
                            ))}
                        </div>
                    </div>

                    {/* Status text */}
                    <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 tracking-widest">
                        PROCESANDO INFORMACIÓN
                    </p>
                </div>

                {/* Animated progress bar below */}
                <div className="mt-12 w-72 h-1.5 rounded-full bg-gradient-to-r from-slate-200 via-blue-200 to-slate-200 dark:from-slate-700 dark:via-blue-700 dark:to-slate-700 shadow-lg shadow-blue-500/20 dark:shadow-blue-900/20 overflow-hidden backdrop-blur-sm">
                    <div
                        className="h-full rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-blue-500"
                        style={{
                            animation: 'progress-shimmer 2.5s ease-in-out infinite',
                            backgroundSize: '200% 100%',
                            backgroundPosition: '-200% 0'
                        }}
                    ></div>
                </div>
            </div>

            {/* Advanced Animations */}
            <style>{`
        @keyframes float-premium {
          0%, 100% {
            transform: translateY(0) scale(1);
          }
          50% {
            transform: translateY(-16px) scale(1.02);
          }
        }

        @keyframes pulse-ring {
          0% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.5;
          }
          100% {
            opacity: 0;
            transform: scale(1.3);
          }
        }

        @keyframes pulse-dot {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7);
            transform: scale(1);
          }
          50% {
            box-shadow: 0 0 0 12px rgba(59, 130, 246, 0);
            transform: scale(1.05);
          }
        }

        @keyframes spin-smooth {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes spin-smooth-reverse {
          from {
            transform: rotate(360deg);
          }
          to {
            transform: rotate(0deg);
          }
        }

        @keyframes bounce-dots {
          0%, 100% {
            transform: translateY(0);
            opacity: 1;
          }
          50% {
            transform: translateY(-14px);
            opacity: 0.6;
          }
        }

        @keyframes progress-shimmer {
          0% {
            background-position: -200% 0;
          }
          50% {
            background-position: 100% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }

        /* Custom delay for animations */
        .-delay-1s {
          animation-delay: -1s;
        }

        .-delay-2s {
          animation-delay: -2s;
        }

        .-delay-3s {
          animation-delay: -3s;
        }
      `}</style>
        </div>
    );
};

export default LoadingScreen;
