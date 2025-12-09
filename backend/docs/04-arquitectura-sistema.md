# 04 - ARQUITECTURA DEL SISTEMA
## Sistema de Gestión Académica - Instituto INCOS Santa Cruz

**Versión:** 1.0  
**Fecha:** Diciembre 2025  
**Estado:** Documento Base Consolidado

---

## 1. INTRODUCCIÓN

### 1.1 Propósito del Documento

Este documento describe la **arquitectura técnica** del Sistema de Gestión Académica del Instituto INCOS Santa Cruz. Define la estructura del sistema, las tecnologías utilizadas, los patrones arquitectónicos aplicados y cómo los componentes interactúan entre sí.

### 1.2 Alcance

El documento cubre:
- Decisión arquitectónica: Monolito Modular vs Microservicios
- Stack tecnológico completo
- Arquitectura en capas (Clean Architecture)
- Estructura de directorios y módulos
- Patrones de diseño aplicados
- Estrategia de deployment

### 1.3 Audiencia

- Equipo de desarrollo
- Arquitectos de software
- DevOps engineers
- Futuros mantenedores del sistema

---

## 2. DECISIÓN ARQUITECTÓNICA: MONOLITO MODULAR

### 2.1 Contexto de la Decisión

**Pregunta Clave:** ¿Microservicios o Monolito?

**Factores Considerados:**
- Tamaño del equipo: 1-3 desarrolladores
- Complejidad del dominio: Media (13 módulos)
- Volumen de usuarios: 850-1500 usuarios (5 años)
- Presupuesto: Limitado
- Tiempo de desarrollo: 8 semanas
- Experiencia del equipo: Generalistas

### 2.2 Análisis Comparativo

| Criterio | Microservicios | Monolito Modular | Ganador |
|----------|----------------|------------------|---------|
| Velocidad de desarrollo inicial | ❌ Lenta | ✅ Rápida | Monolito |
| Complejidad operacional | ❌ Alta (orquestación, service mesh) | ✅ Baja (1 deployment) | Monolito |
| Requisitos de infraestructura | ❌ Múltiples contenedores, K8s | ✅ 1 servidor | Monolito |
| Escalabilidad | ✅ Independiente por servicio | ⚠️ Todo junto | Microservicios |
| Facilidad de debugging | ❌ Trazas distribuidas | ✅ Logs centralizados | Monolito |
| Costo de infraestructura | ❌ Alto | ✅ Bajo | Monolito |
| Requisitos de personal | ❌ Especialistas DevOps | ✅ Generalistas | Monolito |
| Time to market | ❌ Más lento | ✅ Más rápido | Monolito |

### 2.3 Decisión Final: MONOLITO MODULAR

**Justificación:**
1. **Velocidad:** 8 semanas de desarrollo requieren enfoque pragmático
2. **Equipo pequeño:** 1-3 desarrolladores no pueden manejar complejidad de microservicios
3. **Presupuesto limitado:** 1 servidor es más económico que infraestructura distribuida
4. **Volumen manejable:** 850-1500 usuarios NO justifican arquitectura distribuida
5. **Dominio cohesivo:** Los módulos están fuertemente relacionados (estudiantes → inscripciones → calificaciones)

**Estrategia de Evolución:**
- Implementar **Monolito Modular** con módulos bien definidos
- **Preparar para futura migración** a microservicios si se requiere
- Aplicar principios de **bajo acoplamiento** entre módulos
- Usar **eventos** para comunicación entre módulos (preparatorio para Event-Driven Architecture)

### 2.4 Características del Monolito Modular

**¿Qué es un Monolito Modular?**
- Una aplicación desplegada como una **unidad única**
- Organizada internamente en **módulos lógicamente independientes**
- Cada módulo tiene su **propia responsabilidad** (bounded context)
- Los módulos se comunican a través de **interfaces bien definidas**

**Ventajas para INCOS:**
- ✅ Deployment simple: `docker-compose up` o `pm2 start`
- ✅ Transacciones ACID fáciles (misma BD)
- ✅ Debugging simplificado (todo en un proceso)
- ✅ Menor overhead de red (llamadas locales, no HTTP)
- ✅ Compartir código común (utilidades, helpers)

**Preparación para Microservicios (futuro):**
- 📦 Módulos con **bajo acoplamiento**
- 🔌 Interfaces explícitas (no acceso directo a BD de otros módulos)
- 📨 Eventos para comunicación asíncrona
- 🗄️ Esquemas de BD lógicamente separados (aunque físicamente juntos)

---

## 3. STACK TECNOLÓGICO

### 3.1 Backend

#### 3.1.1 Lenguaje y Runtime
- **Node.js 20 LTS** (Long Term Support)
- **JavaScript** (ES2022+) con módulos ES6 (import/export)

**Justificación:**
- Ecosistema maduro con npm (millones de paquetes)
- Ideal para I/O intensivo (operaciones de BD)
- JavaScript full-stack (backend + frontend)
- Excelente soporte para JSON y APIs REST

#### 3.1.2 Framework Web
- **Express.js 4.x**

**Justificación:**
- Framework minimalista y flexible
- Gran ecosistema de middleware
- Rendimiento probado en producción
- Documentación extensa

#### 3.1.3 ORM (Object-Relational Mapping)
- **Sequelize 6.x**

**Justificación:**
- ORM maduro para Node.js
- Soporte para MySQL (nuestra BD)
- Migraciones de esquema integradas
- Validaciones a nivel de modelo
- Relaciones y asociaciones fáciles de definir

#### 3.1.4 Autenticación y Seguridad
- **jsonwebtoken (JWT)** - Tokens de autenticación
- **bcryptjs** - Hash de contraseñas
- **express-rate-limit** - Rate limiting anti-brute force
- **helmet** - Headers de seguridad HTTP
- **cors** - Control de CORS

#### 3.1.5 Validación
- **express-validator** - Validación de inputs
- **joi** - Validación de schemas complejos

#### 3.1.6 Logging
- **winston** - Logger estructurado
- **morgan** - HTTP request logger

#### 3.1.7 Utilidades
- **dotenv** - Variables de entorno
- **moment** / **date-fns** - Manejo de fechas
- **uuid** - Generación de IDs únicos

### 3.2 Base de Datos

#### 3.2.1 SGBD Relacional
- **MySQL 8.0**

**Justificación:**
- Base de datos relacional madura y estable
- Excelente para datos estructurados (estudiantes, inscripciones, calificaciones)
- Soporte robusto de transacciones ACID
- Licencia open source (GPL)
- Buena integración con Sequelize
- Familiaridad del equipo

**Alternativas Consideradas:**
- PostgreSQL: ✅ Excelente, pero MySQL es suficiente para nuestras necesidades
- MongoDB: ❌ NoSQL no ideal para datos altamente relacionales

#### 3.2.2 Características Utilizadas
- **Transacciones ACID** para operaciones críticas
- **Foreign Keys** para integridad referencial
- **Índices** para optimización de búsquedas
- **Stored Procedures** (solo si estrictamente necesario)

### 3.3 Caché (Opcional - Fase 2)

- **Redis 7.x** (si se requiere optimización adicional)

**Uso Potencial:**
- Caché de sesiones (alternativa a JWT en cookies)
- Caché de consultas frecuentes (catálogos, configuraciones)
- Rate limiting distribuido

### 3.4 Frontend

#### 3.4.1 Framework
- **React 18.x** con **Vite**

**Justificación:**
- Framework moderno y popular
- Component-based architecture
- Virtual DOM para rendimiento
- Gran ecosistema de librerías
- Vite: build tool rápido

#### 3.4.2 Estado Global (si se requiere)
- **Context API** (integrado en React) para estado ligero
- **Redux Toolkit** (si se requiere estado complejo - Fase 2)

#### 3.4.3 Routing
- **React Router 6.x**

#### 3.4.4 Librería de UI/CSS
- **Tailwind CSS** - Utility-first CSS framework

**Alternativas:**
- Bootstrap 5: ✅ Buena opción, pero Tailwind es más flexible
- Material UI: ✅ Completo, pero más pesado

#### 3.4.5 Manejo de Formularios
- **React Hook Form** - Validación y manejo eficiente de formularios

#### 3.4.6 HTTP Client
- **Axios** - Cliente HTTP con interceptors

#### 3.4.7 Notificaciones
- **react-toastify** - Toast notifications

#### 3.4.8 Tablas de Datos
- **TanStack Table (React Table)** - Tablas con sorting, filtering, pagination

#### 3.4.9 Generación de PDFs
- **jsPDF** o **pdfmake** - Generación de PDFs en cliente
- **Puppeteer** (backend) - Generación de PDFs complejos

### 3.5 DevOps y Deployment

#### 3.5.1 Containerización
- **Docker** - Containerización de aplicación
- **Docker Compose** - Orquestación de servicios (app + MySQL)

#### 3.5.2 Control de Versiones
- **Git** - Control de versiones
- **GitHub** - Repositorio remoto

#### 3.5.3 Process Manager (Producción)
- **PM2** - Process manager para Node.js

**Características:**
- Auto-restart en caso de crash
- Clustering (múltiples instancias de Node.js)
- Logs management
- Monitoreo de recursos

#### 3.5.4 Reverse Proxy / Web Server
- **Nginx** - Reverse proxy y servir archivos estáticos

**Responsabilidades:**
- Proxy inverso hacia aplicación Node.js
- Servir archivos estáticos de frontend
- SSL/TLS termination (HTTPS)
- Load balancing (si múltiples instancias)

#### 3.5.5 CI/CD (Fase 2 - Opcional)
- **GitHub Actions** - Integración continua

**Pipeline Básico:**
```yaml
Test → Lint → Build → Deploy
```

### 3.6 Herramientas de Desarrollo

#### 3.6.1 IDE Recomendado
- **Visual Studio Code** con extensiones:
  - ESLint
  - Prettier
  - GitLens
  - Thunder Client (API testing)

#### 3.6.2 Linting y Formatting
- **ESLint** - Análisis estático de código
- **Prettier** - Formateo automático de código

#### 3.6.3 Testing (Fase 2)
- **Jest** - Framework de testing
- **Supertest** - Testing de APIs
- **React Testing Library** - Testing de componentes

#### 3.6.4 API Documentation
- **Swagger / OpenAPI** - Documentación de API REST

#### 3.6.5 Database Management
- **MySQL Workbench** / **DBeaver** - GUI para gestión de BD

---

## 4. ARQUITECTURA EN CAPAS (CLEAN ARCHITECTURE)

### 4.1 Principios de Clean Architecture

**Objetivo:** Separar responsabilidades para facilitar mantenibilidad, testabilidad y escalabilidad.

**Principios Fundamentales:**
1. **Independencia de frameworks:** La lógica de negocio NO depende de Express, Sequelize, etc.
2. **Testeable:** La lógica de negocio se puede testear sin UI, BD, o servicios externos
3. **Independencia de UI:** La UI puede cambiar sin afectar lógica de negocio
4. **Independencia de BD:** Podemos cambiar MySQL por PostgreSQL sin afectar lógica de negocio
5. **Independencia de agentes externos:** La lógica de negocio no sabe sobre servicios externos

### 4.2 Capas del Sistema

```
┌─────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                        │
│              (Controllers, Routes, Middleware)               │
│  • Recibe requests HTTP                                      │
│  • Valida inputs                                             │
│  • Llama a Use Cases                                         │
│  • Retorna responses HTTP                                    │
└─────────────────────────────────────────────────────────────┘
                            ↓ ↑
┌─────────────────────────────────────────────────────────────┐
│                    APPLICATION LAYER                         │
│                      (Use Cases)                             │
│  • Orquesta la lógica de negocio                            │
│  • Implementa casos de uso (inscribir estudiante, etc.)     │
│  • NO depende de detalles de BD o frameworks                │
└─────────────────────────────────────────────────────────────┘
                            ↓ ↑
┌─────────────────────────────────────────────────────────────┐
│                     DOMAIN LAYER                             │
│                  (Entities, Business Rules)                  │
│  • Entidades del dominio (Estudiante, Inscripcion, etc.)   │
│  • Reglas de negocio puras                                   │
│  • Totalmente independiente de infraestructura               │
└─────────────────────────────────────────────────────────────┘
                            ↓ ↑
┌─────────────────────────────────────────────────────────────┐
│                  INFRASTRUCTURE LAYER                        │
│         (Repositories, Database, External Services)          │
│  • Implementación de persistencia (Sequelize models)        │
│  • Comunicación con servicios externos                       │
│  • Detalles de implementación                                │
└─────────────────────────────────────────────────────────────┘
```

### 4.3 Descripción de Capas

#### 4.3.1 Infrastructure Layer (Capa de Infraestructura)

**Responsabilidad:** Detalles de implementación (BD, servicios externos, file system)

**Componentes:**
- **Models (Sequelize):** Definición de esquemas de BD
- **Repositories:** Interfaz para acceso a datos
- **External Services:** Integración con servicios externos (email, SMS, etc.)
- **File Storage:** Manejo de archivos subidos

**Ejemplo:**
```javascript
// infrastructure/repositories/EstudianteRepository.js
class EstudianteRepository {
  async findById(id) {
    return await EstudianteModel.findByPk(id);
  }
  
  async save(estudiante) {
    return await EstudianteModel.create(estudiante);
  }
  
  async update(id, data) {
    return await EstudianteModel.update(data, { where: { id } });
  }
}
```

#### 4.3.2 Domain Layer (Capa de Dominio)

**Responsabilidad:** Lógica de negocio pura, reglas del dominio

**Componentes:**
- **Entities:** Objetos de negocio (Estudiante, Inscripcion, Calificacion)
- **Value Objects:** Objetos inmutables (CI, Email, Nota)
- **Domain Services:** Lógica de negocio que no pertenece a una entidad específica
- **Business Rules:** Validaciones y reglas del dominio

**Ejemplo:**
```javascript
// domain/entities/Estudiante.js
class Estudiante {
  constructor(data) {
    this.id = data.id;
    this.nombres = data.nombres;
    this.apellidoPaterno = data.apellidoPaterno;
    this.ci = data.ci;
    this.estadoAcademico = data.estadoAcademico;
  }
  
  // Regla de negocio: Un estudiante puede inscribirse solo si está REGULAR o NIVELACION
  puedeInscribirse() {
    return ['REGULAR', 'NIVELACION'].includes(this.estadoAcademico);
  }
  
  // Regla de negocio: Cambiar a estado EGRESADO requiere validaciones
  cambiarAEgresado(todasMateriasAprobadas, sinDeudas) {
    if (!todasMateriasAprobadas) {
      throw new Error('No puede egresar sin aprobar todas las materias');
    }
    if (!sinDeudas) {
      throw new Error('No puede egresar con deudas pendientes');
    }
    this.estadoAcademico = 'EGRESADO';
  }
}
```

#### 4.3.3 Application Layer (Capa de Aplicación)

**Responsabilidad:** Orquestar casos de uso, coordinar entre capas

**Componentes:**
- **Use Cases:** Implementación de casos de uso específicos
- **DTOs (Data Transfer Objects):** Objetos para transferir datos entre capas
- **Interfaces de Repositories:** Contratos que la capa de infraestructura debe cumplir

**Ejemplo:**
```javascript
// application/use-cases/estudiantes/CrearEstudianteUseCase.js
class CrearEstudianteUseCase {
  constructor(estudianteRepository, becaRepository) {
    this.estudianteRepository = estudianteRepository;
    this.becaRepository = becaRepository;
  }
  
  async execute(data) {
    // 1. Validar que el CI no esté duplicado
    const existente = await this.estudianteRepository.findByCI(data.ci);
    if (existente) {
      throw new Error('Ya existe un estudiante con este CI');
    }
    
    // 2. Crear entidad de dominio
    const estudiante = new Estudiante(data);
    
    // 3. Persistir
    const estudianteCreado = await this.estudianteRepository.save(estudiante);
    
    // 4. Si tiene beca, asignarla
    if (data.becaPorcentaje > 0) {
      await this.becaRepository.asignarBeca(estudianteCreado.id, {
        porcentaje: data.becaPorcentaje,
        motivo: data.becaMotivo
      });
    }
    
    return estudianteCreado;
  }
}
```

#### 4.3.4 Presentation Layer (Capa de Presentación)

**Responsabilidad:** Manejar HTTP requests/responses, validación de inputs

**Componentes:**
- **Controllers:** Manejan requests HTTP, llaman a Use Cases
- **Routes:** Definen endpoints de la API
- **Middleware:** Autenticación, autorización, validación, logging
- **DTOs/Validators:** Validación de requests

**Ejemplo:**
```javascript
// presentation/controllers/EstudianteController.js
class EstudianteController {
  constructor(crearEstudianteUseCase) {
    this.crearEstudianteUseCase = crearEstudianteUseCase;
  }
  
  async crear(req, res, next) {
    try {
      // Validación de inputs (ya hecha por middleware)
      const data = req.body;
      
      // Ejecutar caso de uso
      const estudiante = await this.crearEstudianteUseCase.execute(data);
      
      // Retornar response
      res.status(201).json({
        success: true,
        data: estudiante,
        message: 'Estudiante creado correctamente'
      });
    } catch (error) {
      next(error); // Error handling middleware
    }
  }
}

// presentation/routes/estudiantes.routes.js
router.post(
  '/estudiantes',
  authMiddleware,
  authorize('estudiantes.crear'),
  validateEstudianteInput,
  estudianteController.crear.bind(estudianteController)
);
```

### 4.4 Flujo de una Request

```
1. HTTP Request
     ↓
2. Middleware de autenticación (verifica JWT)
     ↓
3. Middleware de autorización (verifica permisos)
     ↓
4. Middleware de validación (valida inputs)
     ↓
5. Controller (recibe request, extrae data)
     ↓
6. Use Case (orquesta la lógica)
     ↓
7. Domain Entities (aplica reglas de negocio)
     ↓
8. Repository (accede a BD via Sequelize)
     ↓
9. Database (MySQL)
     ↓
10. Response hacia arriba por las mismas capas
     ↓
11. HTTP Response (JSON)
```

---

## 5. ESTRUCTURA DE DIRECTORIOS

### 5.1 Estructura General del Proyecto

```
instituto-incos/
├── backend/
│   ├── src/
│   │   ├── config/              # Configuraciones (DB, JWT, etc.)
│   │   ├── domain/              # Capa de Dominio
│   │   │   ├── entities/        # Entidades de negocio
│   │   │   ├── value-objects/   # Value objects
│   │   │   └── services/        # Domain services
│   │   ├── application/         # Capa de Aplicación
│   │   │   ├── use-cases/       # Casos de uso
│   │   │   └── dtos/            # Data Transfer Objects
│   │   ├── infrastructure/      # Capa de Infraestructura
│   │   │   ├── database/
│   │   │   │   ├── models/      # Sequelize models
│   │   │   │   ├── migrations/  # Migraciones de BD
│   │   │   │   └── seeders/     # Datos iniciales
│   │   │   ├── repositories/    # Implementación de repositories
│   │   │   └── external/        # Servicios externos
│   │   ├── presentation/        # Capa de Presentación
│   │   │   ├── controllers/     # Controladores
│   │   │   ├── routes/          # Rutas de la API
│   │   │   ├── middleware/      # Middleware (auth, validation, etc.)
│   │   │   └── validators/      # Validadores de inputs
│   │   ├── shared/              # Código compartido
│   │   │   ├── utils/           # Utilidades
│   │   │   ├── constants/       # Constantes
│   │   │   └── errors/          # Manejo de errores
│   │   └── app.js               # Configuración de Express
│   ├── tests/                   # Tests (unitarios, integración)
│   ├── .env.example             # Variables de entorno de ejemplo
│   ├── .eslintrc.json           # Configuración de ESLint
│   ├── .prettierrc              # Configuración de Prettier
│   ├── package.json             # Dependencias de Node.js
│   └── server.js                # Entry point
│
├── frontend/
│   ├── src/
│   │   ├── assets/              # Imágenes, fonts, etc.
│   │   ├── components/          # Componentes React
│   │   │   ├── common/          # Componentes reutilizables
│   │   │   ├── estudiantes/     # Componentes de estudiantes
│   │   │   ├── inscripciones/   # Componentes de inscripciones
│   │   │   └── calificaciones/  # Componentes de calificaciones
│   │   ├── pages/               # Páginas/Vistas
│   │   ├── services/            # Servicios (API calls)
│   │   ├── hooks/               # Custom React hooks
│   │   ├── context/             # Context API
│   │   ├── utils/               # Utilidades
│   │   ├── App.jsx              # Componente principal
│   │   └── main.jsx             # Entry point
│   ├── public/                  # Archivos públicos
│   ├── .eslintrc.json
│   ├── package.json
│   └── vite.config.js           # Configuración de Vite
│
├── database/
│   ├── schemas/                 # Schemas SQL
│   └── backups/                 # Backups de BD
│
├── docs/                        # Documentación (estos documentos)
│
├── docker-compose.yml           # Orquestación de servicios
├── Dockerfile                   # Dockerfile para app
├── .gitignore
└── README.md
```

### 5.2 Estructura Detallada del Backend

```
backend/src/
├── config/
│   ├── database.js              # Configuración de Sequelize
│   ├── jwt.js                   # Configuración de JWT
│   └── logger.js                # Configuración de Winston
│
├── domain/
│   ├── entities/
│   │   ├── Estudiante.js
│   │   ├── Inscripcion.js
│   │   ├── Calificacion.js
│   │   └── ...
│   ├── value-objects/
│   │   ├── CI.js                # Value object para CI
│   │   ├── Email.js
│   │   └── Nota.js              # Value object para notas (0-100)
│   └── services/
│       ├── CalculadoraNotasService.js
│       └── ValidadorPrerrequisitosService.js
│
├── application/
│   ├── use-cases/
│   │   ├── estudiantes/
│   │   │   ├── CrearEstudianteUseCase.js
│   │   │   ├── ActualizarEstudianteUseCase.js
│   │   │   ├── BuscarEstudianteUseCase.js
│   │   │   └── CambiarEstadoAcademicoUseCase.js
│   │   ├── inscripciones/
│   │   │   ├── InscribirAGestionUseCase.js
│   │   │   ├── InscribirAMateriasUseCase.js
│   │   │   └── AnularInscripcionUseCase.js
│   │   ├── calificaciones/
│   │   │   ├── RegistrarCalificacionesUseCase.js
│   │   │   ├── ModificarCalificacionUseCase.js
│   │   │   └── CerrarPeriodoUseCase.js
│   │   └── ...
│   └── dtos/
│       ├── EstudianteDTO.js
│       ├── InscripcionDTO.js
│       └── ...
│
├── infrastructure/
│   ├── database/
│   │   ├── models/
│   │   │   ├── index.js         # Inicialización de Sequelize
│   │   │   ├── Estudiante.js    # Modelo Sequelize
│   │   │   ├── Inscripcion.js
│   │   │   ├── Calificacion.js
│   │   │   └── ...
│   │   ├── migrations/
│   │   │   └── 20250101_create_tables.js
│   │   └── seeders/
│   │       └── 20250101_usuarios_iniciales.js
│   ├── repositories/
│   │   ├── EstudianteRepository.js
│   │   ├── InscripcionRepository.js
│   │   ├── CalificacionRepository.js
│   │   └── ...
│   └── external/
│       └── EmailService.js      # Servicio de envío de emails
│
├── presentation/
│   ├── controllers/
│   │   ├── EstudianteController.js
│   │   ├── InscripcionController.js
│   │   ├── CalificacionController.js
│   │   ├── AuthController.js
│   │   └── ...
│   ├── routes/
│   │   ├── index.js             # Router principal
│   │   ├── estudiantes.routes.js
│   │   ├── inscripciones.routes.js
│   │   ├── calificaciones.routes.js
│   │   ├── auth.routes.js
│   │   └── ...
│   ├── middleware/
│   │   ├── auth.middleware.js   # Verificación de JWT
│   │   ├── authorization.middleware.js  # RBAC
│   │   ├── validation.middleware.js
│   │   ├── errorHandler.middleware.js
│   │   └── logger.middleware.js
│   └── validators/
│       ├── estudiante.validator.js
│       ├── inscripcion.validator.js
│       └── ...
│
├── shared/
│   ├── utils/
│   │   ├── encryption.js
│   │   ├── dateHelpers.js
│   │   └── pdfGenerator.js
│   ├── constants/
│   │   ├── estadosAcademicos.js
│   │   ├── roles.js
│   │   └── permisos.js
│   └── errors/
│       ├── AppError.js          # Clase base de errores
│       ├── ValidationError.js
│       ├── NotFoundError.js
│       └── UnauthorizedError.js
│
├── app.js                       # Configuración de Express
└── server.js                    # Entry point
```

---

## 6. PATRONES DE DISEÑO APLICADOS

### 6.1 Repository Pattern

**Objetivo:** Abstraer el acceso a datos, permitir cambiar la BD sin afectar la lógica de negocio.

**Implementación:**
```javascript
// Interfaz (contrato)
class IEstudianteRepository {
  findById(id) { throw new Error('Not implemented'); }
  save(estudiante) { throw new Error('Not implemented'); }
  findByCI(ci) { throw new Error('Not implemented'); }
}

// Implementación con Sequelize
class EstudianteRepository extends IEstudianteRepository {
  async findById(id) {
    return await EstudianteModel.findByPk(id);
  }
  
  async save(estudiante) {
    return await EstudianteModel.create(estudiante);
  }
  
  async findByCI(ci) {
    return await EstudianteModel.findOne({ where: { ci } });
  }
}
```

### 6.2 Dependency Injection (DI)

**Objetivo:** Invertir dependencias, facilitar testing y desacoplamiento.

**Implementación:**
```javascript
// container.js - Contenedor de DI
class Container {
  constructor() {
    this.dependencies = {};
  }
  
  register(name, dependency) {
    this.dependencies[name] = dependency;
  }
  
  resolve(name) {
    return this.dependencies[name];
  }
}

// Registro de dependencias
const container = new Container();
container.register('estudianteRepository', new EstudianteRepository());
container.register('crearEstudianteUseCase', new CrearEstudianteUseCase(
  container.resolve('estudianteRepository')
));
container.register('estudianteController', new EstudianteController(
  container.resolve('crearEstudianteUseCase')
));
```

### 6.3 Factory Pattern

**Objetivo:** Crear objetos de forma centralizada.

**Implementación:**
```javascript
class EstudianteFactory {
  static create(data) {
    return new Estudiante({
      nombres: data.nombres,
      apellidoPaterno: data.apellidoPaterno,
      ci: new CI(data.ci, data.expedicion),
      estadoAcademico: 'REGULAR'
    });
  }
}
```

### 6.4 Middleware Pattern

**Objetivo:** Procesar requests en cadena (autenticación, validación, logging).

**Implementación:**
```javascript
// Middleware de autenticación
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Token no proporcionado' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido' });
  }
};

// Uso
router.get('/estudiantes', authMiddleware, authorize('estudiantes.ver'), estudianteController.listar);
```

### 6.5 Strategy Pattern

**Objetivo:** Encapsular algoritmos intercambiables.

**Implementación:**
```javascript
// Estrategias de cálculo de descuentos
class CalculadoraDescuentoStrategy {
  calcular(arancel, porcentaje) {
    throw new Error('Not implemented');
  }
}

class DescuentoPorcentajeStrategy extends CalculadoraDescuentoStrategy {
  calcular(arancel, porcentaje) {
    return arancel * (porcentaje / 100);
  }
}

class DescuentoMontoFijoStrategy extends CalculadoraDescuentoStrategy {
  calcular(arancel, monto) {
    return monto;
  }
}
```

---

## 7. SEGURIDAD

### 7.1 Autenticación

**Mecanismo:** JWT (JSON Web Tokens)

**Flujo:**
1. Usuario envía credenciales (username + password)
2. Backend valida credenciales contra BD (hash bcrypt)
3. Si válido, genera JWT con payload:
   ```json
   {
     "userId": 123,
     "username": "jperez",
     "roleId": 8,
     "roleName": "DOCENTE",
     "iat": 1234567890,
     "exp": 1234596690
   }
   ```
4. Cliente almacena JWT (httpOnly cookie o localStorage)
5. Cliente envía JWT en header `Authorization: Bearer <token>` en cada request
6. Middleware valida JWT en cada request protegida

### 7.2 Autorización (RBAC)

**Mecanismo:** Role-Based Access Control

**Middleware:**
```javascript
const authorize = (permission) => {
  return async (req, res, next) => {
    const user = req.user; // Del middleware de autenticación
    
    // Obtener permisos del rol del usuario
    const permisos = await getPermisosDeRol(user.roleId);
    
    if (!permisos.includes(permission)) {
      return res.status(403).json({ error: 'No tienes permiso para esta acción' });
    }
    
    next();
  };
};

// Uso
router.post('/estudiantes', authMiddleware, authorize('estudiantes.crear'), estudianteController.crear);
```

### 7.3 Protección contra OWASP Top 10

**1. SQL Injection:**
- Uso de ORM (Sequelize) con prepared statements
- NO concatenación de strings en queries

**2. XSS (Cross-Site Scripting):**
- Sanitización de inputs con express-validator
- Escapado automático en frontend (React)
- Content Security Policy headers

**3. CSRF:**
- Tokens CSRF en formularios críticos
- SameSite cookies

**4. Rate Limiting:**
```javascript
const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // 5 intentos
  message: 'Demasiados intentos de login. Intenta de nuevo en 15 minutos.'
});

router.post('/auth/login', loginLimiter, authController.login);
```

**5. Helmet (Headers de Seguridad):**
```javascript
const helmet = require('helmet');
app.use(helmet());
```

---

## 8. DEPLOYMENT

### 8.1 Estrategia de Deployment

**Opción 1: Docker Compose (Recomendada para Desarrollo y Producción Inicial)**

```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build: ./backend
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DB_HOST=db
      - DB_PORT=3306
      - DB_NAME=instituto_incos
      - DB_USER=incos_user
      - DB_PASSWORD=secure_password
    depends_on:
      - db
    restart: always

  db:
    image: mysql:8.0
    environment:
      - MYSQL_ROOT_PASSWORD=root_password
      - MYSQL_DATABASE=instituto_incos
      - MYSQL_USER=incos_user
      - MYSQL_PASSWORD=secure_password
    volumes:
      - db_data:/var/lib/mysql
      - ./database/schemas:/docker-entrypoint-initdb.d
    ports:
      - "3306:3306"
    restart: always

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./frontend/dist:/usr/share/nginx/html
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - app
    restart: always

volumes:
  db_data:
```

**Comandos:**
```bash
# Levantar servicios
docker-compose up -d

# Ver logs
docker-compose logs -f app

# Parar servicios
docker-compose down

# Backup de BD
docker-compose exec db mysqldump -u root -p instituto_incos > backup.sql
```

**Opción 2: PM2 (Sin Docker)**

```bash
# Instalar PM2
npm install -g pm2

# Iniciar aplicación
pm2 start server.js --name "instituto-incos"

# Otras operaciones
pm2 list              # Listar procesos
pm2 logs              # Ver logs
pm2 restart instituto-incos
pm2 stop instituto-incos
pm2 delete instituto-incos

# Auto-start en reboot
pm2 startup
pm2 save
```

### 8.2 Variables de Entorno

```bash
# .env (ejemplo)
NODE_ENV=production
PORT=3000

# Base de datos
DB_HOST=localhost
DB_PORT=3306
DB_NAME=instituto_incos
DB_USER=incos_user
DB_PASSWORD=secure_password

# JWT
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRES_IN=8h

# Email (opcional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=sistema@incos.edu.bo
SMTP_PASSWORD=email_password

# Upload
UPLOAD_DIR=/var/uploads
MAX_FILE_SIZE=5242880  # 5MB en bytes
```

### 8.3 Nginx Configuration

```nginx
# nginx.conf
upstream backend {
  server app:3000;
}

server {
  listen 80;
  server_name instituto.incos.edu.bo;

  # Redirect HTTP to HTTPS
  return 301 https://$server_name$request_uri;
}

server {
  listen 443 ssl http2;
  server_name instituto.incos.edu.bo;

  ssl_certificate /etc/nginx/ssl/cert.pem;
  ssl_certificate_key /etc/nginx/ssl/key.pem;

  # Frontend (React)
  location / {
    root /usr/share/nginx/html;
    try_files $uri $uri/ /index.html;
  }

  # Backend API
  location /api {
    proxy_pass http://backend;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }

  # Uploads
  location /uploads {
    alias /var/uploads;
    expires 30d;
  }
}
```

### 8.4 CI/CD Pipeline (GitHub Actions - Opcional)

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Run tests
      run: |
        cd backend
        npm install
        npm test
    
    - name: Build frontend
      run: |
        cd frontend
        npm install
        npm run build
    
    - name: Deploy via SSH
      uses: appleboy/ssh-action@master
      with:
        host: ${{ secrets.SERVER_HOST }}
        username: ${{ secrets.SERVER_USER }}
        key: ${{ secrets.SSH_KEY }}
        script: |
          cd /var/www/instituto-incos
          git pull
          docker-compose down
          docker-compose up -d --build
```

---

## 9. ESCALABILIDAD FUTURA

### 9.1 Fase 1: Monolito Modular (Actual)

```
┌──────────────────────────────────────────┐
│           Nginx (Reverse Proxy)          │
└──────────────────┬───────────────────────┘
                   │
┌──────────────────┴───────────────────────┐
│         Node.js App (1 instancia)        │
│  ┌────────────────────────────────────┐  │
│  │  Módulo Estudiantes                │  │
│  │  Módulo Inscripciones              │  │
│  │  Módulo Calificaciones             │  │
│  │  ...                               │  │
│  └────────────────────────────────────┘  │
└──────────────────┬───────────────────────┘
                   │
           ┌───────┴────────┐
           │  MySQL Server   │
           └─────────────────┘
```

### 9.2 Fase 2: Escalamiento Vertical + Caché

```
┌──────────────────────────────────────────┐
│           Nginx (Reverse Proxy)          │
└──────────┬───────────────┬───────────────┘
           │               │
           │        ┌──────┴────────┐
           │        │ Redis (Caché) │
           │        └───────────────┘
┌──────────┴───────────────────────────────┐
│  Node.js App (servidor más potente)     │
│  4 CPU cores, 8 GB RAM                   │
└──────────────────┬───────────────────────┘
                   │
           ┌───────┴────────┐
           │  MySQL Server   │
           │  (más recursos) │
           └─────────────────┘
```

### 9.3 Fase 3: Escalamiento Horizontal

```
┌────────────────────────────────────────────┐
│     Nginx Load Balancer                    │
└───┬──────────┬──────────┬──────────────────┘
    │          │          │
┌───┴────┐ ┌──┴─────┐ ┌──┴─────┐
│ Node 1 │ │ Node 2 │ │ Node 3 │  (3+ instancias)
└───┬────┘ └───┬────┘ └───┬────┘
    │          │          │
    └──────────┴──────────┴─────┐
                                 │
                         ┌───────┴────────┐
                         │  MySQL Cluster │
                         │  (Master-Slave) │
                         └─────────────────┘
```

### 9.4 Fase 4: Microservicios (Si se Requiere)

```
┌────────────────────────────────────────────┐
│          API Gateway (Kong/Express)        │
└───┬───────┬───────┬───────┬────────────────┘
    │       │       │       │
┌───┴───┐ ┌─┴──┐ ┌──┴──┐ ┌──┴────┐
│ Auth  │ │Est.│ │Insc.│ │Calif. │  (Microservicios)
│Service│ │Svc │ │ Svc │ │  Svc  │
└───┬───┘ └─┬──┘ └──┬──┘ └──┬────┘
    │       │       │       │
┌───┴───────┴───────┴───────┴────────┐
│      Message Queue (RabbitMQ)       │
└─────────────────────────────────────┘
    │       │       │       │
┌───┴──┐ ┌──┴──┐ ┌──┴──┐ ┌──┴───┐
│ DB1  │ │ DB2 │ │ DB3 │ │ DB4  │
└──────┘ └─────┘ └─────┘ └──────┘
```

---

## 10. MONITOREO Y OBSERVABILIDAD

### 10.1 Logs

**Herramienta:** Winston

**Niveles:**
- ERROR: Errores críticos
- WARN: Advertencias
- INFO: Información operacional
- DEBUG: Debugging (solo dev)

**Formato:**
```json
{
  "timestamp": "2025-12-08T14:30:00.000Z",
  "level": "error",
  "message": "Error al crear estudiante",
  "userId": 123,
  "requestId": "abc-123-def",
  "error": {
    "stack": "..."
  }
}
```

### 10.2 Métricas

**Herramientas Potenciales (Fase 2):**
- **PM2 Monitor:** Métricas básicas (CPU, RAM, requests/min)
- **Prometheus + Grafana:** Métricas avanzadas

**Métricas Clave:**
- Requests por segundo
- Tiempo de respuesta promedio
- Tasa de errores
- Uso de CPU/RAM
- Conexiones activas a BD
- Tamaño de BD

### 10.3 Alertas

**Configuración:**
- Sistema caído → Email + SMS inmediato
- CPU > 80% → Email
- Errores > 10/min → Email
- BD > 90% capacidad → Email

---

## CONTROL DE VERSIONES

| Versión | Fecha | Autor | Descripción de Cambios |
|---------|-------|-------|------------------------|
| 1.0 | 2025-12-08 | Equipo de Desarrollo | Versión inicial consolidada - Monolito Modular + Clean Architecture |

---

## REFERENCIAS

- 01-vision-y-alcance.md: Contexto del proyecto
- 02-requerimientos-funcionales.md: Funcionalidades del sistema
- 03-requerimientos-no-funcionales.md: Requisitos de calidad
- Clean Architecture (Robert C. Martin)
- Node.js Best Practices (goldbergyoni/nodebestpractices)

---

**FIN DEL DOCUMENTO - 04 ARQUITECTURA DEL SISTEMA**
