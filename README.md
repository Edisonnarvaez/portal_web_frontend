# para iniciar el proyecto se debe instalar dependencia

npm install

# se corre el proyecto

npm run dev

src/
├── apps/ # Cada app de negocio tiene su módulo
│ ├── auth/ # Autenticación y control de acceso
│ │ ├── application/
│ │ ├── domain/
│ │ ├── infrastructure/
│ │ ├── presentation/
│ │ └── routes.tsx
│ ├── proveedores/ # Módulo gestión de proveedores
│ │ ├── application/
│ │ ├── domain/
│ │ ├── infrastructure/
│ │ ├── presentation/
│ │ └── routes.tsx
│ ├── indicadores/ # Módulo indicadores de gestión
│ ├── procesos/ # Módulo documental/procesos
│ └── auditorias/ # Auditorías internas y externas
│
├── core/ # Funciones y lógica compartida
│ ├── application/
│ ├── domain/
│ ├── infrastructure/
│ ├── presentation/
│ └── config/
│ ├── router.tsx
│ └── authGuard.tsx
│
├── shared/ # Tipos, helpers, constantes globales
│ ├── types/
│ ├── utils/
│ ├── constants/
│ └── hooks/
│
├── main.tsx # Entry point
└── App.tsx # Composición del layout

src/
├── apps/
│ └── auth/
│ ├── application/
│ │ └── services/
│ │ └── AuthService.ts
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
