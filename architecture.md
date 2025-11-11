# 🏗️ Arquitectura del Sistema - portal web para empresas que requieren un control detallado de sus operaciones comerciales y administrativas

## 📋 Índice
1. [Visión General](#-visión-general)
2. [Arquitectura de Alto Nivel](#-arquitectura-de-alto-nivel)
3. [Arquitectura Frontend](#-arquitectura-frontend)
4. [Arquitectura Backend](#-arquitectura-backend)
5. [Arquitectura de Datos](#-arquitectura-de-datos)
6. [Flujos de Datos](#-flujos-de-datos)
7. [Seguridad](#-seguridad)
8. [Despliegue](#-despliegue)
9. [Escalabilidad](#-escalabilidad)

---

## 🌟 Visión General

El portal web comercial está diseñado con **Clean Architecture** y **Domain-Driven Design (DDD)**, proporcionando una separación clara de responsabilidades y alta mantenibilidad. El sistema está organizado en módulos de dominio independientes que pueden evolucionar de forma autónoma. Este documento describe la arquitectura técnica y operativa pensada para una solución comercial enfocada en trazabilidad y control operativo.

## 📚 Documentación de la API

La API del backend está documentada utilizando OpenAPI/Swagger. Para la especificación completa (endpoints, esquemas y ejemplos) consulta `openapi_documentation.md` en la raíz del repositorio. Esta documentación cubre autenticación, usuarios, empresas, indicadores, facturación y otros recursos clave.

### Principios Arquitectónicos
- **Separation of Concerns**: Cada capa tiene responsabilidades específicas
- **Dependency Inversion**: Las dependencias apuntan hacia el dominio
- **Single Responsibility**: Cada módulo tiene una responsabilidad única
- **Open/Closed Principle**: Extensible sin modificar código existente
- **Interface Segregation**: Interfaces específicas y cohesivas

---

## 🏛️ Arquitectura de Alto Nivel

```mermaid
graph TB
    subgraph "Frontend - React SPA"
        A[Web Browser] --> B[React Application]
        B --> C[Redux Store]
        B --> D[React Router]
        B --> E[Component Library]
    end
    
    subgraph "API Gateway & Load Balancer"
        F[Nginx/Traefik] --> G[API Gateway]
        G --> H[Rate Limiting]
        G --> I[Authentication]
    end
    
    subgraph "Backend Services"
        J[Auth Service] --> K[JWT/2FA]
        L[Indicadores Service] --> M[KPI Engine]
        N[Procesos Service] --> O[Document Engine]
        R[Auditorias Service] --> S[Audit Engine]
    end
    
    subgraph "Data Layer"
        T[(PostgreSQL)]
        U[(Redis Cache)]
        V[File Storage S3]
        W[Elasticsearch]
    end
    
    subgraph "External Services"
        X[DIAN API]
        Y[Email Service]
        Z[SMS Service]
        AA[Document Scanner]
    end
    
    B --> F
    F --> J
    F --> L
    F --> N
    F --> P
    F --> R
    
    J --> T
    L --> T
    N --> T
    P --> T
    R --> T
    
    J --> U
    L --> U
    N --> U
    P --> U
    
    N --> V
    R --> W
    
    P --> X
    J --> Y
    J --> Z
    N --> AA
    
    style A fill:#e1f5fe
    style B fill:#f3e5f5
    style T fill:#e8f5e8
    style U fill:#fff3e0
    style V fill:#f1f8e9
```

---

## 🎨 Arquitectura Frontend

### Estructura de Capas Frontend

```mermaid
graph TB
    subgraph "Presentation Layer - React Components"
        A[Pages] --> B[Containers]
        B --> C[Components]
        C --> D[UI Components]
    end
    
    subgraph "Application Layer - Hooks & State"
        E[Custom Hooks] --> F[Redux Slices]
        F --> G[Async Thunks]
        G --> H[State Selectors]
    end
    
    subgraph "Infrastructure Layer - Services"
        I[HTTP Client] --> J[API Services]
        J --> K[Local Storage]
        K --> L[Session Management]
    end
    
    subgraph "Domain Layer - Types & Logic"
        M[Domain Entities] --> N[Business Logic]
        N --> O[Validation Rules]
        O --> P[Type Definitions]
    end
    
    A --> E
    E --> I
    I --> M
    
    style A fill:#e3f2fd
    style E fill:#f3e5f5
    style I fill:#e8f5e8
    style M fill:#fff8e1
```

### Módulos Frontend por Dominio

```mermaid
graph LR
    subgraph "Auth Module"
        A1[Login Page] --> A2[2FA Setup]
        A2 --> A3[Profile Management]
        A3 --> A4[Permission Guards]
    end
    
    subgraph "Menu Module"
        B1[Dashboard] --> B2[News & Events]
        B2 --> B3[Org Chart]
        B3 --> B4[Quick Access]
    end
    
    subgraph "Indicadores Module"
        C1[KPI Dashboard] --> C2[Indicator Forms]
        C2 --> C3[Results Entry]
        C3 --> C4[Charts & Reports]
    end
    
    subgraph "Procesos Module"
        D1[Document Viewer] --> D2[Process Management]
        D2 --> D3[File Upload]
        D3 --> D4[Version Control]
    end
    
    
    A4 --> B1
    A4 --> C1
    A4 --> D1
    A4 --> E1
    
    style A1 fill:#ffebee
    style B1 fill:#e8f5e8
    style C1 fill:#e3f2fd
    style D1 fill:#f3e5f5
    style E1 fill:#fff8e1
```

### Estado Global con Redux

```mermaid
graph TB
    subgraph "Redux Store Structure"
        A[Root State] --> B[Auth Slice]
        A --> C[UI Slice]
        A --> D[Indicadores Slice]
        A --> E[Procesos Slice]
        
        B --> B1[user: User | null]
        B --> B2[token: string | null]
        B --> B3[permissions: Permission[]]
        
        C --> C1[theme: 'light' | 'dark']
        C --> C2[sidebar: boolean]
        C --> C3[loading: LoadingState]
        
        D --> D1[indicators: Indicator[]]
        D --> D2[results: Result[]]
        D --> D3[filters: FilterState]
        
        E --> E1[documents: Document[]]
        E --> E2[processes: Process[]]
        E --> E3[uploadState: UploadState]
        
        F --> F1[suppliers: Supplier[]]
        F --> F2[invoices: Invoice[]]
        F --> F3[payments: Payment[]]
    end
    
    style A fill:#e1f5fe
    style B fill:#ffebee
    style C fill:#e8f5e8
    style D fill:#e3f2fd
    style E fill:#f3e5f5
    style F fill:#fff8e1
```

---

## ⚙️ Arquitectura Backend

### Estructura Clean Architecture

```mermaid
graph TB
    subgraph "Presentation Layer - API Controllers"
        A[REST Controllers] --> B[GraphQL Resolvers]
        B --> C[WebSocket Handlers]
        C --> D[Middleware]
    end
    
    subgraph "Application Layer - Use Cases"
        E[Command Handlers] --> F[Query Handlers]
        F --> G[Event Handlers]
        G --> H[Validation Services]
    end
    
    subgraph "Domain Layer - Business Logic"
        I[Entities] --> J[Value Objects]
        J --> K[Domain Services]
        K --> L[Repository Interfaces]
    end
    
    subgraph "Infrastructure Layer - External"
        M[Database Repositories] --> N[External APIs]
        N --> O[File Storage]
        O --> P[Message Queue]
    end
    
    A --> E
    E --> I
    I --> M
    
    style A fill:#e3f2fd
    style E fill:#f3e5f5
    style I fill:#fff8e1
    style M fill:#e8f5e8
```

### Microservicios por Dominio

```mermaid
graph TB
    subgraph "Authentication Service"
        A1[JWT Management] --> A2[2FA Service]
        A2 --> A3[User Management]
        A3 --> A4[Role & Permissions]
    end
    
    subgraph "Indicadores Service"
        B1[KPI Calculator] --> B2[Data Aggregator]
        B2 --> B3[Report Generator]
        B3 --> B4[Alert System]
    end
    
    subgraph "Procesos Service"
        C1[Document Manager] --> C2[Version Control]
        C2 --> C3[File Processor]
        C3 --> C4[Search Engine]
    end

    
    subgraph "Auditorias Service"
        E1[Audit Scheduler] --> E2[Finding Tracker]
        E2 --> E3[Compliance Monitor]
        E3 --> E4[Report Generator]
    end
    
    subgraph "Shared Services"
        F1[Email Service] --> F2[SMS Service]
        F2 --> F3[File Storage]
        F3 --> F4[Logging Service]
    end
    
    A4 --> B1
    A4 --> C1
    A4 --> E1
    
    B4 --> F1
    E4 --> F4
    
    style A1 fill:#ffebee
    style B1 fill:#e3f2fd
    style C1 fill:#f3e5f5
    style D1 fill:#fff8e1
    style E1 fill:#e8f5e8
    style F1 fill:#fce4ec
```

---

## 💾 Arquitectura de Datos

### Modelo de Datos Principal

```mermaid
erDiagram
    USER {
        int id PK
        string username UK
        string email UK
        string password_hash
        boolean is_2fa_enabled
        datetime created_at
        datetime updated_at
    }
    
    ROLE {
        int id PK
        string name
        string description
        int app_id FK
        datetime created_at
    }
    
    APP {
        int id PK
        string name UK
        string description
        boolean active
    }
    
    USER_ROLE {
        int user_id FK
        int role_id FK
        datetime assigned_at
    }
    
    INDICATOR {
        int id PK
        string name
        string code UK
        string calculation_method
        string measurement_frequency
        float target
        int process_id FK
        int created_by FK
        datetime created_at
    }
    
    RESULT {
        int id PK
        int indicator_id FK
        int headquarters_id FK
        float numerator
        float denominator
        float calculated_value
        int year
        int month
        int created_by FK
        datetime created_at
    }
    
    DOCUMENT {
        int id PK
        string title
        string file_path
        string file_type
        int version
        int document_parent_id FK
        int process_id FK
        int uploaded_by FK
        datetime created_at
    }
    
    PROCESS {
        int id PK
        string name
        string description
        int process_type_id FK
        boolean active
        int created_by FK
        datetime created_at
    }
    
    INVOICE {
        int id PK
        string invoice_number UK
        int supplier_id FK
        decimal amount
        date invoice_date
        int status_id FK
        int cost_center_id FK
        datetime created_at
    }
    
    SUPPLIER {
        int id PK
        string name
        string tax_id UK
        string email
        string phone
        string address
        boolean active
        datetime created_at
    }
    
    USER ||--o{ USER_ROLE : "has"
    ROLE ||--o{ USER_ROLE : "assigned_to"
    APP ||--o{ ROLE : "contains"
    
    USER ||--o{ INDICATOR : "creates"
    INDICATOR ||--o{ RESULT : "measured_by"
    USER ||--o{ RESULT : "enters"
    
    PROCESS ||--o{ DOCUMENT : "contains"
    DOCUMENT ||--o{ DOCUMENT : "parent_child"
    USER ||--o{ DOCUMENT : "uploads"
    
    SUPPLIER ||--o{ INVOICE : "issues"
    USER ||--o{ INVOICE : "processes"
```

### Estrategia de Caching

```mermaid
graph TB
    subgraph "Application Layer"
        A[API Request] --> B[Cache Check]
        B --> C{Cache Hit?}
        C -->|Yes| D[Return Cached Data]
        C -->|No| E[Query Database]
        E --> F[Store in Cache]
        F --> G[Return Data]
    end
    
    subgraph "Cache Strategy by Data Type"
        H[User Sessions] --> H1[Redis - TTL 24h]
        I[Static Data] --> I1[Redis - TTL 1h]
        J[Computed Results] --> J1[Redis - TTL 30min]
        K[File Metadata] --> K1[Redis - TTL 2h]
    end
    
    subgraph "Cache Invalidation"
        L[Data Update] --> M[Invalidate Related Cache]
        M --> N[Update Database]
        N --> O[Refresh Cache]
    end
    
    B --> H1
    B --> I1
    B --> J1
    B --> K1
    
    style A fill:#e3f2fd
    style H1 fill:#fff3e0
    style I1 fill:#fff3e0
    style J1 fill:#fff3e0
    style K1 fill:#fff3e0
```

---

## 🔄 Flujos de Datos

### Flujo de Autenticación

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant A as Auth Service
    participant D as Database
    participant R as Redis
    
    U->>F: Enter credentials
    F->>A: POST /auth/login
    A->>D: Validate user
    D-->>A: User data
    
    alt 2FA Enabled
        A-->>F: Require 2FA
        F-->>U: Show 2FA form
        U->>F: Enter 2FA code
        F->>A: POST /auth/verify-2fa
        A->>A: Validate TOTP
    end
    
    A->>R: Store session
    A-->>F: JWT tokens
    F->>F: Store tokens
    F-->>U: Redirect to dashboard
    
    Note over F,R: Subsequent requests include JWT
    F->>A: API request + JWT
    A->>R: Validate session
    R-->>A: Session valid
    A-->>F: Authorized response
```

### Flujo de Gestión de Indicadores

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant I as Indicadores Service
    participant D as Database
    participant C as Cache
    participant N as Notification Service
    
    U->>F: Create new indicator
    F->>I: POST /indicators
    I->>D: Save indicator
    D-->>I: Indicator saved
    I->>C: Cache indicator data
    I-->>F: Success response
    F-->>U: Show success message
    
    U->>F: Enter result data
    F->>I: POST /results
    I->>I: Calculate KPI value
    I->>D: Save result
    
    alt Target exceeded
        I->>N: Send alert
        N-->>U: Notification sent
    end
    
    I->>C: Update cached results
    I-->>F: Result saved
    F-->>U: Update dashboard
```

### Flujo de Gestión Documental

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant P as Procesos Service
    participant S as File Storage
    participant D as Database
    participant E as Search Engine
    
    U->>F: Upload document
    F->>P: POST /documents/upload
    P->>S: Store file
    S-->>P: File URL
    P->>D: Save metadata
    P->>E: Index document
    P-->>F: Upload complete
    F-->>U: Show success
    
    U->>F: Search documents
    F->>P: GET /documents/search
    P->>E: Query index
    E-->>P: Search results
    P->>D: Get metadata
    D-->>P: Document details
    P-->>F: Results with preview
    F-->>U: Display documents
```

---

## 🔐 Seguridad

### Arquitectura de Seguridad

```mermaid
graph TB
    subgraph "Security Layers"
        A[WAF - Web Application Firewall] --> B[Load Balancer SSL]
        B --> C[API Gateway Authentication]
        C --> D[Service-to-Service Auth]
        D --> E[Database Encryption]
    end
    
    subgraph "Authentication & Authorization"
        F[JWT Tokens] --> G[2FA/TOTP]
        G --> H[Role-Based Access]
        H --> I[Permission Matrix]
    end
    
    subgraph "Data Protection"
        J[Encryption at Rest] --> K[Encryption in Transit]
        K --> L[Data Masking]
        L --> M[Audit Logging]
    end
    
    subgraph "Monitoring & Compliance"
        N[Security Monitoring] --> O[Threat Detection]
        O --> P[Compliance Reporting]
        P --> Q[Incident Response]
    end
    
    A --> F
    F --> J
    J --> N
    
    style A fill:#ffebee
    style F fill:#e8f5e8
    style J fill:#e3f2fd
    style N fill:#fff8e1
```

### Matriz de Permisos por Rol

```mermaid
graph TB
    subgraph "Permission Matrix"
        A[Superadmin] --> A1[All Modules - Full Access]
        
        B[Admin] --> B1[User Management]
        B --> B2[System Configuration]
        B --> B3[All Reports - Read]
        
        C[Medical Director] --> C1[Indicators - Full Access]
        C --> C2[Audit - Full Access]
        C --> C3[Reports - Full Access]
        
        D[Process Manager] --> D1[Documents - Full Access]
        D --> D2[Processes - Full Access]
        D --> D3[Audit - Read/Write]
        
        E[Financial Manager] --> E1[Suppliers - Full Access]
        E --> E2[Invoices - Full Access]
        E --> E3[Financial Reports]
        
        F[Quality Coordinator] --> F1[Indicators - Read/Write]
        F --> F2[Audit - Read/Write]
        F --> F3[Quality Reports]
        
        G[Staff User] --> G1[Portal - Read]
        G --> G2[Own Profile - Edit]
        G --> G3[Assigned Tasks]
    end
    
    style A fill:#ffebee
    style B fill:#fff3e0
    style C fill:#e8f5e8
    style D fill:#e3f2fd
    style E fill:#f3e5f5
    style F fill:#fce4ec
    style G fill:#f1f8e9
```

---

## 🚀 Despliegue

### Arquitectura de Despliegue

```mermaid
graph TB
    subgraph "Production Environment"
        A[Load Balancer] --> B[Frontend Servers x2]
        A --> C[API Gateway x2]
        
        C --> D[Auth Service x2]
        C --> E[Business Services x3]
        
        D --> F[PostgreSQL Primary]
        E --> F
        F --> G[PostgreSQL Replica]
        
        D --> H[Redis Cluster]
        E --> H
        
        E --> I[File Storage S3]
        E --> J[Elasticsearch Cluster]
    end
    
    subgraph "Staging Environment"
        K[Single Load Balancer] --> L[Frontend Server]
        K --> M[API Gateway]
        M --> N[All Services]
        N --> O[PostgreSQL]
        N --> P[Redis Single]
    end
    
    subgraph "Development Environment"
        Q[Docker Compose] --> R[All Services Local]
        R --> S[Local Database]
        R --> T[Local Cache]
    end
    
    style A fill:#e8f5e8
    style K fill:#fff3e0
    style Q fill:#e3f2fd
```

### Pipeline CI/CD

```mermaid
graph LR
    subgraph "Development"
        A[Git Push] --> B[GitHub Actions]
        B --> C[Run Tests]
        C --> D[Build Docker Images]
    end
    
    subgraph "Testing"
        D --> E[Deploy to Staging]
        E --> F[Integration Tests]
        F --> G[Security Scan]
        G --> H[Performance Tests]
    end
    
    subgraph "Production"
        H --> I[Manual Approval]
        I --> J[Blue-Green Deploy]
        J --> K[Health Checks]
        K --> L[Monitoring Alerts]
    end
    
    subgraph "Rollback"
        L --> M{Issues Detected?}
        M -->|Yes| N[Automatic Rollback]
        M -->|No| O[Deploy Complete]
    end
    
    style A fill:#e3f2fd
    style E fill:#fff3e0
    style I fill:#e8f5e8
    style N fill:#ffebee
```

---

## 📈 Escalabilidad

### Estrategia de Escalado

```mermaid
graph TB
    subgraph "Horizontal Scaling"
        A[Load Balancer] --> B[Frontend Instances]
        A --> C[API Gateway Instances]
        C --> D[Service Instances]
        
        B --> B1[Instance 1]
        B --> B2[Instance 2]
        B --> B3[Instance N]
        
        D --> D1[Auth Service x2]
        D --> D2[Business Services x3]
        D --> D3[Worker Services x2]
    end
    
    subgraph "Database Scaling"
        E[Primary DB] --> F[Read Replicas]
        F --> F1[Replica 1]
        F --> F2[Replica 2]
        
        G[Redis Cluster] --> G1[Master Nodes]
        G --> G2[Slave Nodes]
    end
    
    subgraph "Caching Strategy"
        H[CDN] --> I[Static Assets]
        J[Redis] --> K[Session Data]
        L[Application Cache] --> M[Query Results]
    end
    
    D --> E
    D --> G
    B --> H
    D1 --> J
    D2 --> L
    
    style A fill:#e3f2fd
    style E fill:#e8f5e8
    style H fill:#fff3e0
```

### Métricas de Performance

```mermaid
graph TB
    subgraph "Frontend Metrics"
        A[First Contentful Paint] --> A1[< 1.5s]
        B[Largest Contentful Paint] --> B1[< 2.5s]
        C[Time to Interactive] --> C1[< 3s]
        D[Cumulative Layout Shift] --> D1[< 0.1]
    end
    
    subgraph "Backend Metrics"
        E[API Response Time] --> E1[< 200ms]
        F[Database Query Time] --> F1[< 100ms]
        G[Cache Hit Rate] --> G1[> 80%]
        H[Error Rate] --> H1[< 0.1%]
    end
    
    subgraph "Infrastructure Metrics"
        I[CPU Usage] --> I1[< 70%]
        J[Memory Usage] --> J1[< 80%]
        K[Disk I/O] --> K1[< 80%]
        L[Network Latency] --> L1[< 50ms]
    end
    
    subgraph "Business Metrics"
        M[User Sessions] --> M1[> 1000/day]
        N[Document Uploads] --> N1[> 100/day]
        O[System Uptime] --> O1[99.9%]
        P[User Satisfaction] --> P1[> 4.5/5]
    end
    
    style A1 fill:#e8f5e8
    style E1 fill:#e8f5e8
    style I1 fill:#e8f5e8
    style M1 fill:#e8f5e8
```

---

## 🛠️ Tecnologías y Stack Técnico

### Stack Completo

```mermaid
graph TB
    subgraph "Frontend Stack"
        A[React 18] --> B[TypeScript]
        B --> C[Tailwind CSS]
        C --> D[Redux Toolkit]
        D --> E[React Query]
        E --> F[Vite]
    end
    
    subgraph "Backend Stack"
        G[Node.js/Python] --> H[Express/FastAPI]
        H --> I[TypeScript/Python]
        I --> J[JWT Authentication]
        J --> K[Prisma/SQLAlchemy]
    end
    
    subgraph "Database Stack"
        L[PostgreSQL] --> M[Redis]
        M --> N[Elasticsearch]
        N --> O[AWS S3]
    end
    
    subgraph "DevOps Stack"
        P[Docker] --> Q[Kubernetes]
        Q --> R[GitHub Actions]
        R --> S[Monitoring Stack]
        S --> T[Grafana + Prometheus]
    end
    
    A --> G
    G --> L
    L --> P
    
    style A fill:#e3f2fd
    style G fill:#e8f5e8
    style L fill:#fff8e1
    style P fill:#f3e5f5
```

---

## 📊 Monitoreo y Observabilidad

### Arquitectura de Monitoreo

```mermaid
graph TB
    subgraph "Application Monitoring"
        A[Application Logs] --> B[Centralized Logging]
        B --> C[Log Analysis]
        C --> D[Alert Generation]
        
        E[Performance Metrics] --> F[APM Tools]
        F --> G[Performance Dashboards]
        G --> H[SLA Monitoring]
    end
    
    subgraph "Infrastructure Monitoring"
        I[Server Metrics] --> J[Container Metrics]
        J --> K[Database Metrics]
        K --> L[Network Metrics]
        
        M[Health Checks] --> N[Uptime Monitoring]
        N --> O[Availability Reports]
    end
    
    subgraph "Business Monitoring"
        P[User Analytics] --> Q[Feature Usage]
        Q --> R[Business KPIs]
        R --> S[Revenue Impact]
        
        T[Error Tracking] --> U[Bug Reports]
        U --> V[Quality Metrics]
    end
    
    D --> H
    H --> O
    O --> S
    S --> V
    
    style A fill:#e3f2fd
    style I fill:#e8f5e8
    style P fill:#fff8e1
```

---

**Documento creado**: Octubre 2025  
**Versión**: 1.0  
**Última actualización**: Octubre 2025

Este documento de arquitectura debe mantenerse actualizado conforme el sistema evoluciona y se implementan nuevas funcionalidades.
