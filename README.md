# portal web para empresas que requieren un control detallado de sus procesos de habilitacion y documentacion asi como el monitoreo de sus indicadores de gestion

[![React](https://img.shields.io/badge/React-18.2.0-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.2.2-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.0.0-green.svg)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.3.5-38B2AC.svg)](https://tailwindcss.com/)

## 📋 Descripción del Proyecto

Esta solución es un portal web para empresas que requieren un control detallado de sus procesos de habilitacion y documentacion asi como el monitoreo de sus indicadores de gestion. Es una plataforma modular y escalable, pensada para organizaciones que necesitan trazabilidad, gobernanza y control sobre procesos, documentos e indicadores. Está diseñada para facilitar la adopción en empresas de distintos sectores que buscan centralizar la gestión de calidad y administrativa.

### ✅ Estado actual (2026-03-14)

- Módulo `habilitacion` con arquitectura por capas (domain/application/infrastructure/presentation).
- Integración activa con backend de normatividad (`/normativity/estandares` y `/normativity/criterios`).
- Nuevas páginas operativas para administración normativa:
  - `/habilitacion/normas`
  - `/habilitacion/estandares`
  - `/habilitacion/criterios`

### 🎯 Objetivos Principales

- **Gestión Documental**: Sistema completo para la administración de documentos y procesos organizacionales
- **Indicadores de Gestión**: Seguimiento y análisis de KPIs institucionales con dashboards interactivos
- **Control de Acceso**: Autenticación robusta con 2FA y sistema de permisos granular
- **Auditorías**: Seguimiento de auditorías internas y externas
- **Portal Interno**: Comunicaciones internas, eventos, reconocimientos y estructura organizacional

## 🏗️ Arquitectura del Sistema

El proyecto implementa **Clean Architecture** con **Domain-Driven Design (DDD)**, organizando el código en módulos independientes por dominio de negocio:

```
src/
├── apps/                    # Módulos de dominio de negocio
│   ├── auth/               # Autenticación y autorización
│   ├── menu/               # Portal interno y comunicaciones
│   ├── indicadores/        # Gestión de indicadores y KPIs
│   ├── procesos/           # Gestión documental y procesos
│   ├── habilitacion/       # Gestión de habilitación de servicios
│   ├── auditorias/         # Seguimiento de auditorías
│   └── administracion/     # Configuración del sistema
├── core/                   # Funcionalidades transversales
│   ├── config/            # Configuración de rutas y guards
│   ├── infrastructure/    # Servicios HTTP y comunicación
│   └── presentation/      # Layouts y páginas globales
├── shared/                 # Componentes y utilidades compartidas
│   ├── components/        # Componentes UI reutilizables
│   ├── hooks/            # Hooks personalizados
│   ├── utils/            # Funciones utilitarias
│   └── types/            # Tipos TypeScript globales
└── assets/               # Recursos estáticos
```

### 📐 Patrón de Arquitectura por Módulo

Cada módulo de negocio sigue la estructura de Clean Architecture:

```
apps/[modulo]/
├── application/
│   └── services/          # Servicios de aplicación y casos de uso
├── domain/
│   ├── entities/          # Entidades del dominio
│   ├── repositories/      # Interfaces de repositorios
│   └── types/            # Tipos específicos del dominio
├── infrastructure/
│   ├── repositories/      # Implementaciones de repositorios
│   └── services/         # Servicios de infraestructura
├── presentation/
│   ├── components/       # Componentes UI del módulo
│   ├── hooks/           # Hooks específicos del módulo
│   ├── pages/           # Páginas del módulo
│   └── utils/           # Utilidades de UI
└── routes.tsx           # Configuración de rutas del módulo
```

## 🚀 Tecnologías Utilizadas

### Frontend Core
- **React 18.2.0** - Biblioteca principal para la interfaz de usuario
- **TypeScript 5.2.2** - Tipado estático para mayor robustez
- **Vite 5.0.0** - Build tool moderno y rápido
- **React Router DOM 6.20.0** - Enrutamiento del lado del cliente

### Styling y UI
- **Tailwind CSS 3.3.5** - Framework CSS utilitario
- **Headless UI 2.2.4** - Componentes accesibles sin estilos
- **Framer Motion 12.23.3** - Animaciones fluidas
- **Lucide React 0.525.0** - Iconografía moderna
- **React Icons 4.12.0** - Biblioteca extensa de iconos

### Estado y Datos
- **Redux Toolkit 2.8.2** - Gestión de estado global
- **React Redux 9.2.0** - Integración React-Redux
- **Axios 1.6.2** - Cliente HTTP para APIs

### Visualización y Documentos
- **Recharts 3.1.0** - Gráficos y visualizaciones
- **React PDF Viewer 3.12.0** - Visualización de PDFs
- **jsPDF 3.0.1** - Generación de PDFs
- **XLSX 0.18.5** - Manejo de archivos Excel
- **QRCode React 4.2.0** - Generación de códigos QR

### Utilidades
- **React Toastify 11.0.5** - Notificaciones toast
- **React Organizational Chart 2.2.1** - Organigramas interactivos
- **PDF.js 3.3.122** - Renderizado de PDFs en el navegador

## 📦 Instalación y Configuración

### Prerrequisitos
- **Node.js** >= 18.0.0
- **npm** >= 9.0.0 o **yarn** >= 1.22.0
- **Git** para control de versiones

### Instalación

1. **Clonar el repositorio**
```bash
git clone https://github.com/Edisonnarvaez/portal_web_frontend.git
cd portal_web_frontend
```

2. **Instalar dependencias**
```bash
npm install
# o
yarn install
```

3. **Configurar variables de entorno**
```bash
cp .env.example .env
```

Configurar las siguientes variables en el archivo `.env`:
```env
VITE_API_BASE_URL=http://localhost:8000/api
VITE_APP_TITLE="portal web para empresas que requieren un control detallado de sus operaciones comerciales y administrativas"
VITE_JWT_SECRET=your-jwt-secret
VITE_2FA_ISSUER=YourCompany
```

4. **Ejecutar en modo desarrollo**
```bash
npm run dev
# o
yarn dev
```

5. **Acceder a la aplicación**
Abrir [http://localhost:5173](http://localhost:5173) en el navegador.

## 🔧 Scripts Disponibles

```json
{
  "dev": "vite",                    // Servidor de desarrollo
  "build": "tsc && vite build",     // Build de producción
  "preview": "vite preview"         // Preview del build
}
```

### Comandos Adicionales Recomendados
```bash
# Verificar tipos TypeScript
npx tsc --noEmit

# Linting (si se configura ESLint)
npm run lint

# Testing (si se configuran pruebas)
npm run test

# Análisis del bundle
npm run build && npx vite-bundle-analyzer
```

## 🔐 Sistema de Autenticación

### Características de Seguridad
- **JWT (JSON Web Tokens)** para autenticación stateless
- **Autenticación de Dos Factores (2FA)** con TOTP
- **Control de acceso basado en roles (RBAC)**
- **Gestión de sesiones** con refresh tokens
- **Protección de rutas** mediante guards

### Flujo de Autenticación
1. **Login** con credenciales (usuario/contraseña)
2. **Verificación 2FA** (si está habilitada)
3. **Generación de tokens** JWT
4. **Navegación protegida** con middleware de autenticación

### Roles y Permisos
```typescript
interface Role {
  id: number;
  name: string;
  app: { id: number; name: string };
}

// Roles principales del sistema
- admin: Administrador del sistema
- supervisor: Supervisor de área
- usuario: Usuario estándar
- auditor: Auditor interno/externo
- proveedor: Gestión de proveedores
```

## 📊 Módulos del Sistema

### 1. 🏠 Menu/Portal Interno
**Funcionalidades:**
- Dashboard de bienvenida personalizado
- Comunicados y noticias institucionales
- Calendario de eventos
- Reconocimientos y cumpleaños
- Estructura organizacional interactiva
- Accesos rápidos a módulos

**Componentes Clave:**
- `Bienvenida` - Saludo personalizado por rol
- `NoticiasComunicados` - Gestión de comunicaciones
- `CalendarioEventos` - Eventos institucionales
- `EstructuraOrganizacional` - Organigrama dinámico

### 2. 📈 Indicadores de Gestión
**Funcionalidades:**
- Creación y gestión de indicadores KPI
- Dashboard interactivo con gráficos
- Seguimiento de resultados por período
- Reportes automáticos
- Alertas por metas

**Entidades Principales:**
```typescript
interface Indicator {
  id: number;
  name: string;
  code: string;
  calculationMethod: 'percentage' | 'ratio' | 'count';
  measurementFrequency: 'monthly' | 'quarterly' | 'annual';
  target: number;
  process: number;
}
```

### 3. 📋 Procesos y Documentos
**Funcionalidades:**
- Gestión documental completa
- Versionado de documentos
- Visualización de PDFs, Word, Excel
- Control de permisos por documento
- Trazabilidad de cambios

**Características:**
- Soporte múltiples formatos
- Previsualización en línea
- Descargas controladas
- Auditoría de accesos

### 4. � Habilitación de Servicios
**Funcionalidades:**
- Gestión de prestadores de servicios (IPS, Profesionales, Personas Naturales/Jurídicas)
- Control de habilitación por estado (habilitada, en proceso, suspendida, no habilitada, cancelada)
- Registro y seguimiento de servicios autorizados por modalidad
- Gestión de pólizas y seguros de responsabilidad civil
- Autoevaluaciones anuales contra criterios de calidad
- Registro de cumplimiento de requisitos regulatorios
- Gestión de normatividad (normas, estándares y criterios) con formularios de creación/edición

**Entidades Principales:**
```typescript
interface DatosPrestador {
  id: number;
  codigo_reps: string;
  clase_prestador: 'IPS' | 'PROF' | 'PH' | 'PJ';
  estado_habilitacion: 'HABILITADA' | 'EN_PROCESO' | 'SUSPENDIDA' | 'NO_HABILITADA' | 'CANCELADA';
  fecha_vencimiento_habilitacion?: string;
  aseguradora_pep?: string;
  numero_poliza?: string;
}

interface ServicioSede {
  id: number;
  codigo_servicio: string;
  nombre_servicio: string;
  modalidad: 'INTRAMURAL' | 'AMBULATORIA' | 'TELEMEDICINA' | 'URGENCIAS' | 'AMBULANCIA';
  complejidad: 'BAJA' | 'MEDIA' | 'ALTA';
  estado_habilitacion: string;
}

interface Autoevaluacion {
  id: number;
  numero_autoevaluacion: string;
  periodo: number;
  estado: 'BORRADOR' | 'EN_CURSO' | 'COMPLETADA' | 'REVISADA' | 'VALIDADA';
  fecha_vencimiento: string;
}
```

**Dashboard de Habilitación:**
- KPI de prestadores por estado
- Alertas de vencimientos próximos
- Seguimiento de autoevaluaciones
- Mejoras vencidas pendientes de implementación
- Cumplimiento de criterios por periodo

**Rutas principales del módulo Habilitación:**
- `/habilitacion/` Gestión general
- `/habilitacion/dashboard` Dashboard
- `/habilitacion/cumplimientos` Cumplimientos
- `/habilitacion/hallazgos` Hallazgos
- `/habilitacion/planes-mejora` Planes de mejora
- `/habilitacion/reportes` Reportes
- `/habilitacion/comparativa` Comparativa
- `/habilitacion/alertas` Alertas
- `/habilitacion/normas` Normas
- `/habilitacion/estandares` Estándares
- `/habilitacion/criterios` Criterios

### 5. 🏢 Proveedores y Terceros
**Funcionalidades:**
- Registro y gestión de terceros
- Facturación electrónica
- Estados de facturas
- Centros de costos y operaciones
- Causales de devolución

**Flujo de Facturación:**
1. Registro de factura
2. Validación de datos
3. Aprobación por área
4. Procesamiento de pago
5. Archivo y seguimiento

### 6. 🔍 Auditorías
**Funcionalidades:**
- Programación de auditorías
- Seguimiento de hallazgos
- Planes de mejoramiento
- Reportes de cumplimiento

### 6. ⚙️ Administración
**Funcionalidades:**
- Gestión de usuarios y roles
- Configuración de procesos
- Tipos de proceso
- Parámetros del sistema

## 🎨 Sistema de Diseño

### Paleta de Colores
```css
/* Colores principales */
--primary: #2563eb;      /* Azul corporativo */
--secondary: #64748b;    /* Gris medio */
--accent: #0891b2;       /* Azul cyan */
--success: #059669;      /* Verde éxito */
--warning: #d97706;      /* Naranja advertencia */
--error: #dc2626;        /* Rojo error */

/* Modo oscuro */
--dark-bg: #1f2937;
--dark-surface: #374151;
--dark-text: #f3f4f6;
```

### Componentes Reutilizables
- **Button** - Botones consistentes con variantes
- **Input** - Campos de entrada estandarizados
- **ConfirmDialog** - Diálogos de confirmación
- **UserAvatar** - Avatar de usuario con foto de perfil
- **Sidebar** - Navegación lateral responsiva
- **Topbar** - Barra superior con perfil y notificaciones

### Responsive Design
- **Mobile First** - Diseño optimizado para móviles
- **Breakpoints Tailwind** - sm, md, lg, xl, 2xl
- **Componentes Adaptativos** - UI que se ajusta al tamaño de pantalla

## 🔧 Configuración del Proyecto

### Vite Configuration
```typescript
// vite.config.ts
export default defineConfig({
  plugins: [react()],
  css: {
    postcss: './postcss.config.cjs'
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
})
```

### TypeScript Configuration
- **Strict Mode** habilitado
- **Path Mapping** para imports absolutos
- **Type Checking** en build

### Tailwind CSS
```javascript
// tailwind.config.js
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {...},
        secondary: {...}
      }
    }
  }
}
```

## 📱 Funcionalidades Destacadas

### 🌙 Modo Oscuro
- Toggle manual en la interfaz
- Persistencia en localStorage
- Soporte completo en todos los componentes

### 📱 Progressive Web App (PWA)
- Instalable en dispositivos
- Funcionamiento offline básico
- Manifest configurado

### 🔔 Sistema de Notificaciones
```typescript
// Tipos de notificaciones
notify.success("Operación exitosa");
notify.error("Error en la operación");
notify.warning("Advertencia");
notify.info("Información");
```

### 📊 Visualización de Datos
- Gráficos interactivos con Recharts
- Dashboards responsivos
- Exportación a PDF/Excel

## 🔄 Estado de Desarrollo

### ✅ Completado
- [x] Arquitectura base del proyecto
- [x] Sistema de autenticación con 2FA
- [x] Módulo de indicadores básico
- [x] Gestión documental
- [x] Módulo de habilitación de servicios
- [x] Módulo de proveedores
- [x] Portal interno (menu)
- [x] Sistema de permisos por rol

### 🚧 En Desarrollo
- [ ] Dashboard de indicadores avanzado
- [ ] Módulo de auditorías completo
- [ ] Reportes automáticos
- [ ] Notificaciones push

### 📋 Pendiente
- [ ] Tests unitarios y de integración
- [ ] Documentación de API
- [ ] Optimización de performance
- [ ] Configuración CI/CD
- [ ] PWA completa

## 🤝 Contribución

### Flujo de Desarrollo
1. **Fork** del repositorio
2. **Crear rama** para feature/bugfix
3. **Desarrollar** siguiendo las convenciones
4. **Tests** y validación
5. **Pull Request** con descripción detallada

### Convenciones de Código
- **ESLint** + **Prettier** para formateo
- **Conventional Commits** para mensajes
- **TypeScript** estricto
- **Clean Architecture** en estructura

### Code Review Checklist
- [ ] Código TypeScript tipado correctamente
- [ ] Componentes siguen patrones establecidos
- [ ] Performance optimizada
- [ ] Accesibilidad considerada
- [ ] Tests incluidos

## 📄 Licencia

Este proyecto es propiedad de **Edison Stiven Narvaez Paz** y está protegido bajo licencia propietaria. El uso, distribución o modificación sin autorización expresa está prohibido.

## 👥 Equipo de Desarrollo

Este repositorio incluye perfiles y documentación pensada para coordinar un equipo formado por:

- Un Senior Backend Developer (experto en APIs y arquitectura)
- Un Senior Frontend/UX Developer (experto en React, UX y diseño de componentes)
- Un Project Manager con amplia experiencia (20+ años)

Detalles de responsabilidades, flujos y entregables están en `agents.md`.

---

## 📞 Soporte y Contacto

Para soporte técnico o consultas sobre el proyecto:

- **Email**: edisonnarvaez.esn@gmail.com
- **Teléfono**: +57 3174980971

---

**Última actualización**: Octubre 2025
**Versión**: 1.0.0
│ ├── domain/
│ │ └── entities/
│ │ └── User.ts
│ ├── infrastructure/
│ │ └── repositories/
│ │ └── AuthRepository.ts
│ └── presentation/
│ ├── pages/
│ │ └── LoginPage.tsx
│ └── hooks/
│ └── useAuth.ts
