# 🎓 Sistema de Gestión Académica - INCOS Santa Cruz

Sistema integral de gestión académica, administrativa y operativa para el **Instituto Comercial Superior de la Nación INCOS Santa Cruz**, desarrollado con arquitectura moderna y tecnologías de última generación.

---

## 📋 Información del Instituto

**Nombre Completo**: El Instituto Comercial Superior de la Nación INCOS Santa Cruz

**Historia**:
Fundado el **2 de agosto de 1985** mediante la **Resolución Ministerial 746/1985**. Actualmente cuenta con la **R.M. 0426/2016**, ofertando inicialmente las Carreras de **Contaduría General** y **Secretariado Ejecutivo**. Posteriormente, en el año **1988**, se ampliaron las carreras de **Administración de Empresas** e **Informática**.

**Ubicación**:
Calle Ñuflo de Chavez Nº 62, entre René Moreno y Calle Chuquisaca, dentro del centro histórico del municipio de **Santa Cruz de la Sierra**.

**Horarios de Atención**:

- **Turno Tarde**: Lunes a Viernes 14:00 - 16:30
- **Turno Noche**: Lunes a Viernes 18:45 - 22:30
- **Sábados**: 17:00 - 21:00

**Carreras Técnicas** (Nivel Técnico Superior):

1. **Sistemas Informáticos**
2. **Administración de Empresas**
3. **Contaduría General**

**Naturaleza Institucional**:
Institución de Educación Superior Estatal, abierta al conjunto de la sociedad, establecida con plenas facultades legales dentro del sistema Educativo Nacional.

---

## 🎯 Descripción del Sistema

Este sistema permite al Instituto INCOS Santa Cruz digitalizar, automatizar y optimizar todos sus procesos académicos, administrativos y operativos, proporcionando:

- ✅ **Eficiencia operativa** mediante la automatización de procesos manuales
- ✅ **Trazabilidad completa** de la información académica y administrativa
- ✅ **Acceso en tiempo real** a información crítica para la toma de decisiones
- ✅ **Cumplimiento normativo** con las regulaciones del Ministerio de Educación de Bolivia
- ✅ **Experiencia de usuario mejorada** para estudiantes, docentes y personal administrativo
- ✅ **Base sólida para crecimiento** que permita escalar a medida que el instituto crece

### Funcionalidades Principales

El sistema incluye **13 módulos funcionales**:

1. **Gestión de Estudiantes** - Registro completo con datos personales, académicos y documentales
2. **Gestión de Inscripciones** - Inscripción a gestiones y materias con validación de prerrequisitos
3. **Gestión de Calificaciones** - Sistema oficial INCOS con parciales, práctico y recuperatorios
4. **Gestión de Nivelaciones** - Control automático de materias reprobadas
5. **Gestión de Docentes** - Asignaciones y carga horaria
6. **Gestión de Pasantías Laborales** - Empresas colaboradoras y evaluaciones
7. **Supervisión Docente** - Fichas de observación y evaluación
8. **Gestión de Horarios** - Turnos, aulas y asignaciones
9. **Gestión de Aranceles y Pagos** - Control financiero completo
10. **Historial Académico Oficial** - Formato Libro/Folio con validación SHA256
11. **Boletines de Calificaciones** - Generación automática de documentos oficiales
12. **Reportes Académicos** - Estadísticas y análisis
13. **Gestión de Usuarios y Permisos** - Sistema RBAC con 11 roles y 70+ permisos

---

## 🏗️ Arquitectura Técnica

### Stack Tecnológico

**Backend:**

- Node.js 20 LTS
- Express.js 4.x
- Sequelize ORM
- MySQL 8.0
- JWT Authentication
- Clean Architecture

**Frontend:**

- React 19.x
- Vite 7.x
- Ant Design 6.x
- Zustand (State Management)
- TanStack React Query
- React Router DOM 7.x

**DevOps:**

- Docker + Docker Compose
- PM2 (Process Manager)
- Nginx (Web Server)
- Git + GitHub

### Arquitectura

- **Estilo**: Monolito Modular con Clean Architecture
- **Base de Datos**: MySQL 8.0 con normalización 3FN
- **Seguridad**: JWT + RBAC (11 roles, 70+ permisos granulares)
- **Auditoría**: Registro completo de operaciones críticas

---

## 📚 Documentación Técnica

La documentación completa del sistema se encuentra en el directorio [`docs/`](./docs/), organizada en **15 documentos técnicos**:

### 📖 Documentación de Proyecto y Requerimientos

1. **[Visión y Alcance del Proyecto](docs/01-vision-y-alcance.md)**
   - Contexto institucional, objetivos, alcance, stakeholders, beneficios esperados
   - ~30 páginas

2. **[Requerimientos Funcionales](docs/02-requerimientos-funcionales.md)**
   - 60 RFs organizados en 13 módulos con reglas de negocio detalladas
   - ~50 páginas

3. **[Requerimientos No Funcionales](docs/03-requerimientos-no-funcionales.md)**
   - 37 RNFs en 10 categorías (seguridad, rendimiento, disponibilidad, etc.)
   - ~40 páginas

### 🏛️ Arquitectura y Diseño Técnico

1. **[Arquitectura del Sistema](docs/04-arquitectura-sistema.md)**
   - Monolito Modular, Clean Architecture, stack tecnológico completo
   - ~70 páginas

2. **[Modelo de Datos](docs/05-modelo-datos.md)**
   - Tablas documentadas con relaciones, índices y características
   - ~110 páginas

3. **[Diseño de API REST](docs/06-diseno-api.md)**
   - 80+ endpoints, contratos HTTP, validaciones, códigos de error
   - ~80 páginas

### 📋 Casos de Uso y Reglas de Negocio

1. **[Casos de Uso Detallados](docs/07-casos-de-uso.md)**
   - Flujos de negocio por módulo con actores y precondiciones
   - ~60 páginas

2. **[Reglas de Negocio](docs/08-reglas-negocio.md)**
   - 80+ reglas consolidadas por módulo con validaciones
   - ~65 páginas

### ⚙️ Estándares y Configuración

1. **[Estándares de Código](docs/09-estandares-codigo.md)**
   - Convenciones, ESLint, Prettier, patrones, mejores prácticas
   - ~50 páginas

2. **[Configuración de Entornos](docs/11-configuracion-entornos.md)**
   - Dev, Test, Prod: instalación, deployment, backups, troubleshooting
   - ~55 páginas

3. **[Gestión de Errores y Logging](docs/12-gestion-errores.md)**
   - Jerarquía de errores, Winston, auditoría, códigos de error
   - ~45 páginas

### 💻 Implementación Técnica

1. **[Frontend](docs/14-frontend.md)**
   - Arquitectura, tecnologías y estructura del frontend
   - React 19, Vite 7, Ant Design 6, Atomic Design, Clean Architecture
   - Zustand, TanStack React Query, React Hook Form, Yup
   - ~60 páginas

2. **[Backend](docs/15-backend.md)**
   - Arquitectura, tecnologías y estructura del backend
   - Node.js 20, Express 4, Sequelize 6, Clean Architecture
   - JWT, RBAC, Middleware, Logging, Testing
   - ~65 páginas

### 📖 Referencias

1. **[Glosario de Términos](docs/13-glosario-terminos.md)**
   - Definiciones técnicas, siglas, acrónimos, términos del dominio
   - ~35 páginas

### 📑 Índice Maestro

1. **[Índice Maestro](docs/00-INDICE-MAESTRO.md)**
   - Guía completa de navegación por toda la documentación
   - ~30 páginas

---

## 📊 Estadísticas del Proyecto

| Métrica | Cantidad |
|---------|----------|
| **Total de Documentos Técnicos** | 15 |
| **Total de Páginas** | ~815 páginas |
| **Requerimientos Funcionales** | 60 RFs |
| **Requerimientos No Funcionales** | 37 RNFs |
| **Reglas de Negocio** | 80+ RNs |
| **Endpoints API** | 80+ endpoints |
| **Tablas de Base de Datos** | 40+ tablas |
| **Casos de Uso** | 40+ casos de uso |
| **Roles del Sistema** | 11 roles |
| **Permisos Granulares** | 70+ permisos |

---

## 🚀 Inicio Rápido

### Prerrequisitos

- Node.js >= 20.0.0 LTS
- npm >= 10.0.0
- MySQL >= 8.0
- Git

### Instalación

1. **Clonar el repositorio**

   ```bash
   git clone <repository-url>
   cd incos
   ```

2. **Backend**

   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Editar .env con tus credenciales
   npm run dev
   ```

3. **Frontend**

   ```bash
   cd frontend
   npm install
   cp .env.example .env
   # Configurar variables de entorno
   npm run dev
   ```

4. **Base de Datos**

   ```bash
   # Ejecutar scripts SQL en orden (ver backend/database/01-schemas/)
   mysql -u root -p < backend/database/01-schemas/01-base.sql
   # ... continuar con los demás scripts
   ```

Para más detalles, consulta:

- **[Backend README](backend/README.md)** - Configuración completa del backend
- **[Frontend README](frontend/README.md)** - Configuración completa del frontend

---

## 👥 Equipo de Desarrollo

**Jefe del Proyecto**: Carlos Ferrufino  
🔗 GitHub: [@agrocom-developer](https://github.com/agrocom-developer)

**Desarrollador Frontend**: Nelson Farel  
🔗 GitHub: [@hfarel](https://github.com/hfarel)

**Desarrollador Backend**: Miguel Escobar  
🔗 GitHub: [@Angello-27](https://github.com/Angello-27)

---

## 📁 Estructura del Proyecto

```text
incos/
├── backend/                 # API REST - Node.js + Express
│   ├── src/                # Código fuente (Clean Architecture)
│   ├── database/           # Scripts SQL, migraciones, seeders
│   └── tests/              # Tests unitarios e integración
│
├── frontend/               # Aplicación Web - React + Vite
│   ├── src/               # Código fuente (Atomic Design)
│   │   ├── core/         # Domain Layer
│   │   ├── infrastructure/ # Infrastructure Layer
│   │   └── presentation/  # Presentation Layer
│   └── public/            # Assets estáticos
│
├── docs/                   # Documentación técnica completa
│   ├── 00-INDICE-MAESTRO.md
│   ├── 01-vision-y-alcance.md
│   ├── 02-requerimientos-funcionales.md
│   └── ... (13 documentos totales)
│
└── README.md              # Este archivo
```

---

## 🔐 Seguridad

El sistema implementa múltiples capas de seguridad:

- ✅ Autenticación con JWT (8 horas de validez)
- ✅ RBAC con 11 roles y 70+ permisos granulares
- ✅ Bcrypt para hash de contraseñas (10 salt rounds)
- ✅ Rate limiting (protección contra fuerza bruta)
- ✅ Helmet para headers de seguridad
- ✅ CORS configurado
- ✅ Validación de inputs con express-validator y Joi
- ✅ SQL Injection protection (ORM Sequelize)
- ✅ XSS protection

---

## 🗄️ Base de Datos

### Características

- **Motor**: MySQL 8.0 con InnoDB
- **Normalización**: 3FN (Tercera Forma Normal)
- **Caracteres**: utf8mb4 (soporte completo Unicode)
- **Auditoría**: Soft deletes y campos de auditoría estándar
- **Índices**: Optimizados para consultas frecuentes

### Scripts SQL

Los scripts de schema están organizados en `backend/database/01-schemas/` y deben ejecutarse en orden:

1. `01-base.sql` - Configuración inicial
2. `02-catalogos-geograficos.sql` - Catálogos geográficos
3. `03-catalogos-referencia.sql` - Catálogos de referencia
4. `04-sistema-seguridad.sql` - Usuarios, roles y permisos
5. `05-estructura-academica-parte1.sql` - Carreras, materias, plan de estudios
6. `05-estructura-academica-parte2.sql` - Docentes y asignaciones
7. `06-estudiantes-parte1.sql` - Estudiantes y datos académicos
8. `06-estudiantes-parte2.sql` - Becas y licencias
9. `07-inscripciones-parte1.sql` - Inscripciones principales
10. `07-inscripciones-parte2.sql` - Calificaciones y asistencias
11. `10-pagos.sql` - Sistema de pagos
12. `11-modulos-operativos-parte1.sql` - Pasantías y supervisión
13. `11-modulos-operativos-parte2.sql` - Historial oficial
14. `12-indices.sql` - Índices de optimización
15. `12-sincronizacion.sql` - Sistema de sincronización
16. `13-indices-optimizacion.sql` - Índices adicionales

Ver **[Modelo de Datos](docs/05-modelo-datos.md)** para documentación completa.

---

## 🧪 Testing

```bash
# Backend
cd backend
npm test              # Ejecutar todos los tests
npm run test:unit     # Tests unitarios
npm run test:integration  # Tests de integración

# Frontend
cd frontend
npm test              # Ejecutar todos los tests
```

---

## 📈 Plan de Desarrollo

### Fases

**Fase 1 (MVP)** - 4 semanas

- ✅ Autenticación y Usuarios
- ✅ Gestión de Estudiantes
- ✅ Carreras y Materias
- ✅ Inscripciones básicas

**Fase 2** - 3 semanas

- Gestión de Docentes
- Creación de Cursos
- Horarios y Turnos

**Fase 3** - 3 semanas

- Registro de Notas
- Cálculo de promedios
- Registro de Asistencias

**Fase 4** - 2 semanas

- Dashboard administrativo
- Reportes y estadísticas
- Generación de documentos

---

## 🐳 Docker (Opcional)

```bash
# Backend
cd backend
docker build -t incos-backend .
docker-compose up -d

# Frontend
cd frontend
docker build -t incos-frontend .
```

---

## 🤝 Contribución

1. Crear una rama desde `development`
2. Hacer cambios siguiendo los estándares establecidos
3. Ejecutar `npm run lint` y `npm run format` antes de commitear
4. Crear un Pull Request a `development`

Ver **[Estándares de Código](docs/09-estandares-codigo.md)** para más detalles.

---

## 📄 Licencia

Uso privado - Instituto INCOS © 2025

---

## 📞 Soporte

Para soporte técnico, contactar a: [sistema@incos.edu.bo](mailto:sistema@incos.edu.bo)

---

## 🔗 Enlaces Útiles

- **[Documentación Completa](docs/00-INDICE-MAESTRO.md)** - Índice maestro de documentación
- **[Backend README](backend/README.md)** - Documentación técnica del backend
- **[Frontend README](frontend/README.md)** - Documentación técnica del frontend

---

**Versión**: 1.0  
**Última actualización**: Enero 2025
