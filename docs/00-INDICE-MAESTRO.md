# DOCUMENTACIÓN TÉCNICA COMPLETA
## Sistema de Gestión Académica - Instituto INCOS Santa Cruz

**Versión:** 1.1  
**Fecha:** Enero 2025  
**Estado:** Documentación Base Consolidada

---

## 📚 ÍNDICE DE DOCUMENTOS

### 📋 DOCUMENTOS GENERADOS (15/15)

#### 1. Documentación de Proyecto y Requerimientos

| # | Documento | Descripción | Páginas | Estado |
|---|-----------|-------------|---------|--------|
| 01 | [Visión y Alcance del Proyecto](01-vision-y-alcance.md) | Contexto institucional, objetivos, alcance, stakeholders, beneficios esperados | ~30 | ✅ |
| 02 | [Requerimientos Funcionales](02-requerimientos-funcionales.md) | 60 RFs organizados en 13 módulos con reglas de negocio detalladas | ~50 | ✅ |
| 03 | [Requerimientos No Funcionales](03-requerimientos-no-funcionales.md) | 37 RNFs en 10 categorías (seguridad, rendimiento, disponibilidad, etc.) | ~40 | ✅ |

#### 2. Arquitectura y Diseño Técnico

| # | Documento | Descripción | Páginas | Estado |
|---|-----------|-------------|---------|--------|
| 04 | [Arquitectura del Sistema](04-arquitectura-sistema.md) | Monolito Modular, Clean Architecture, stack tecnológico completo | ~70 | ✅ |
| 05 | [Modelo de Datos](05-modelo-datos.md) | 58 tablas documentadas con DDL completo, relaciones, índices | ~110 | ✅ |
| 06 | [Diseño de API REST](06-diseno-api.md) | 80+ endpoints, contratos HTTP, validaciones, códigos de error | ~80 | ✅ |

#### 3. Casos de Uso y Reglas de Negocio

| # | Documento | Descripción | Páginas | Estado |
|---|-----------|-------------|---------|--------|
| 07 | [Casos de Uso Detallados](07-casos-de-uso.md) | Flujos de negocio por módulo con actores y precondiciones | ~60 | ✅ |
| 08 | [Reglas de Negocio](08-reglas-negocio.md) | 80+ reglas consolidadas por módulo con validaciones | ~65 | ✅ |

#### 4. Estándares y Configuración

| # | Documento | Descripción | Páginas | Estado |
|---|-----------|-------------|---------|--------|
| 09 | [Estándares de Código](09-estandares-codigo.md) | Convenciones, ESLint, Prettier, patrones, mejores prácticas | ~50 | ✅ |
| 11 | [Configuración de Entornos](11-configuracion-entornos.md) | Dev, Test, Prod: instalación, deployment, backups, troubleshooting | ~55 | ✅ |
| 12 | [Gestión de Errores y Logging](12-gestion-errores.md) | Jerarquía de errores, Winston, auditoría, códigos de error | ~45 | ✅ |

#### 5. Implementación Técnica

| # | Documento | Descripción | Páginas | Estado |
|---|-----------|-------------|---------|--------|
| 14 | [Frontend](14-frontend.md) | Arquitectura, tecnologías y estructura del frontend (React, Vite, Ant Design, Atomic Design) | ~60 | ✅ |
| 15 | [Backend](15-backend.md) | Arquitectura, tecnologías y estructura del backend (Node.js, Express, Sequelize, Clean Architecture) | ~65 | ✅ |

#### 6. Referencias

| # | Documento | Descripción | Páginas | Estado |
|---|-----------|-------------|---------|--------|
| 13 | [Glosario de Términos](13-glosario-terminos.md) | Definiciones técnicas, siglas, acrónimos, términos del dominio | ~35 | ✅ |

---

## 📊 ESTADÍSTICAS DE DOCUMENTACIÓN

### Resumen Cuantitativo

| Métrica | Cantidad |
|---------|----------|
| **Total de Documentos** | 15 |
| **Total de Páginas** | ~815 páginas |
| **Total de Líneas** | ~16,000 líneas |
| **Tamaño Total** | ~950 KB |
| **Requerimientos Funcionales** | 60 RFs |
| **Requerimientos No Funcionales** | 37 RNFs |
| **Reglas de Negocio** | 80+ RNs |
| **Endpoints API** | 80+ endpoints |
| **Tablas de Base de Datos** | 40+ tablas |
| **Casos de Uso** | 40+ casos de uso |
| **Códigos de Error** | 30+ códigos |

### Distribución por Categoría

```
Proyecto y Requerimientos:  120 páginas (15%)
Arquitectura y Diseño:      260 páginas (32%)
Casos de Uso y Reglas:      125 páginas (15%)
Estándares y Config:        150 páginas (18%)
Implementación Técnica:     125 páginas (15%)
Referencias:                 35 páginas (4%)
```

---

## 🎯 INFORMACIÓN DEL PROYECTO

### Contexto

**Institución:** El Instituto Comercial Superior de la Nación INCOS Santa Cruz  
**Fundación:** 2 de agosto de 1985 (R.M. 746/1985)  
**Resolución Ministerial Actual:** R.M. 0426/2016  
**Ubicación:** Calle Ñuflo de Chavez Nº 62, entre René Moreno y Calle Chuquisaca, Santa Cruz de la Sierra  

### Datos Institucionales

| Aspecto | Detalle |
|---------|---------|
| **Carreras Activas** | 3 (Contaduría, Administración, Sistemas) |
| **Total Estudiantes** | ~850 (Año 1) → 1500 (Año 5) |
| **Personal Docente** | 25 docentes |
| **Personal Administrativo** | 6 personas |
| **Duración Carreras** | 4 semestres (2 años) |
| **Título Otorgado** | Técnico Superior |

### Estructura del Sistema

**Módulos:** 13 módulos principales
1. Gestión de Estudiantes
2. Gestión de Inscripciones
3. Gestión de Calificaciones
4. Gestión de Nivelaciones
5. Gestión de Docentes
6. Gestión de Pasantías Laborales
7. Supervisión Docente
8. Gestión de Horarios
9. Gestión de Aranceles y Pagos
10. Historial Académico Oficial
11. Boletines de Calificaciones
12. Reportes Académicos
13. Gestión de Usuarios y Permisos

---

## 🏗️ ARQUITECTURA TÉCNICA

### Stack Tecnológico

#### Backend
- **Runtime:** Node.js 20 LTS
- **Framework:** Express.js 4.x
- **ORM:** Sequelize 6.x
- **Base de Datos:** MySQL 8.0
- **Autenticación:** JWT (jsonwebtoken)
- **Validación:** express-validator, Joi
- **Logging:** Winston
- **Testing:** Jest

#### Frontend
- **Framework:** React 19.x
- **Build Tool:** Vite 7.x
- **UI Framework:** Ant Design 6.x
- **State Management:** Zustand (global) + TanStack React Query (server state)
- **Routing:** React Router DOM 7.x
- **HTTP Client:** Axios
- **Forms:** React Hook Form + Yup
- **Arquitectura:** Clean Architecture + Atomic Design

#### DevOps
- **Containerización:** Docker + Docker Compose
- **Process Manager:** PM2
- **Web Server:** Nginx
- **Control de Versiones:** Git + GitHub

### Arquitectura

**Estilo:** Monolito Modular con Clean Architecture

**Capas:**
1. **Presentation Layer** - Controllers, Routes, Middleware
2. **Application Layer** - Use Cases, DTOs
3. **Domain Layer** - Entities, Business Rules, Value Objects
4. **Infrastructure Layer** - Repositories, Database, External Services

---

## 📐 MODELO DE DATOS

### Distribución de Tablas

| Categoría | Cantidad |
|-----------|----------|
| Catálogos Geográficos | 6 tablas |
| Catálogos de Referencia | 8 tablas |
| Estructura Académica | 10 tablas |
| Gestión de Estudiantes | 6 tablas |
| Inscripciones y Calificaciones | 3 tablas |
| Pasantías | 3 tablas |
| Supervisión Docente | 2 tablas |
| Historial Oficial | 2 tablas |
| Pagos | 2 tablas |
| Sistema y Auditoría | 6 tablas |
| **TOTAL** | **58 tablas** |

### Características Técnicas

- **Motor:** InnoDB (transacciones ACID)
- **Charset:** utf8mb4 (Unicode completo)
- **Collation:** utf8mb4_unicode_ci
- **Claves Foráneas:** ~80+ relaciones
- **Índices:** ~120+ índices
- **Soft Deletes:** En tablas críticas
- **Auditoría:** Tabla de auditoría centralizada

---

## 🔐 SEGURIDAD

### Mecanismos Implementados

- **Autenticación:** JWT con duración 8 horas
- **Autorización:** RBAC con 11 roles y 70+ permisos granulares
- **Encriptación:** Bcrypt (10 salt rounds) para contraseñas
- **Rate Limiting:** 5 intentos de login / 15 minutos
- **OWASP Top 10:** Protección contra SQL Injection, XSS, CSRF
- **Headers de Seguridad:** Helmet.js
- **SSL/TLS:** HTTPS obligatorio en producción
- **Auditoría:** Registro completo de operaciones críticas

### Roles del Sistema

1. SUPER_ADMIN - Control total
2. RECTOR - Máxima autoridad
3. DIRECTOR_ACADEMICO - Gestión académica
4. DIRECTOR_ADMINISTRATIVO - Gestión administrativa
5. SECRETARIA_ACADEMICA - Inscripciones y calificaciones
6. SECRETARIA_ADMINISTRATIVA - Pagos y documentación
7. CONTADOR - Gestión financiera
8. DOCENTE - Calificaciones y asistencias
9. ESTUDIANTE - Consultas académicas
10. DOCENTE_TUTOR - Supervisión de pasantías
11. SUPERVISOR - Supervisión del desempeño docente

---

## 📋 REQUERIMIENTOS CLAVE

### Funcionales (Destacados)

- **RF-EST-001:** Registro completo de estudiantes con validaciones
- **RF-INS-002:** Inscripción a materias con validación de prerrequisitos
- **RF-CAL-001:** Sistema de calificaciones oficial INCOS (1º, 2º, SUMA, 3º, PRÁCT, etc.)
- **RF-NIV-001:** Gestión automática de nivelaciones (máx 3 intentos)
- **RF-PAS-003:** Evaluación de pasantías (ALTO/MEDIO/BAJO)
- **RF-HIS-001:** Historial académico oficial con formato Libro/Folio

### No Funcionales (Destacados)

- **RNF-PER-001:** Tiempo de respuesta < 2s (P95) para operaciones comunes
- **RNF-SEC-001:** Autenticación JWT + RBAC + rate limiting
- **RNF-DIS-001:** Disponibilidad 99.5% en horario laboral
- **RNF-DIS-003:** Backups automáticos diarios
- **RNF-USA-001:** Curva de aprendizaje: tareas básicas en 2 horas
- **RNF-CON-001:** Integridad ACID en operaciones críticas

### Reglas de Negocio (Destacadas)

- **RN-EST-005:** Solo UNA beca activa por gestión
- **RN-EST-006:** Becas 100% requieren aprobación del Rector
- **RN-INS-003:** Pago mínimo 50% al momento de inscripción
- **RN-CAL-002:** Nota mínima de aprobación: 60/100
- **RN-NIV-002:** Máximo 3 intentos de nivelación
- **RN-DOC-005:** Carga máxima docente: 40 horas/semana
- **RN-PAS-002:** Pasantía mínimo 240 horas

---

## 📈 PLAN DE DESARROLLO

### Cronograma (8 Semanas)

| Semana | Módulo(s) | Funcionalidades |
|--------|-----------|-----------------|
| 1 | Sistema Base + Usuarios | Autenticación, RBAC, auditoría |
| 2 | Estudiantes | CRUD, becas, licencias, documentos |
| 3 | Inscripciones | Inscripción a gestión y materias |
| 4 | Calificaciones | Sistema oficial INCOS, recuperatorios |
| 5 | Nivelaciones + Docentes | Gestión automática + asignaciones |
| 6 | Pasantías + Supervisión | Empresas, evaluaciones, fichas |
| 7 | Horarios + Pagos | Turnos, aranceles, reportes financieros |
| 8 | Historial + Reportes | Libro/Folio, boletines, reportes |

### Estrategia de Desarrollo

- **Metodología:** Incremental modular
- **Entregables:** 1 módulo por semana
- **Testing:** Integrado desde Semana 1
- **Deployment:** Continuo con PM2 + Docker

---

## 🚀 DEPLOYMENT

### Entornos

| Entorno | URL | Base de Datos | Propósito |
|---------|-----|---------------|-----------|
| Development | localhost:3000 | instituto_incos_dev | Desarrollo local |
| Testing | localhost:3001 | instituto_incos_test | Tests automatizados |
| Production | https://instituto.incos.edu.bo | instituto_incos | Producción |

### Infraestructura (Producción Año 1)

- **CPU:** 4 cores
- **RAM:** 8 GB
- **Disco:** 50 GB SSD
- **Ancho de banda:** 100 Mbps
- **OS:** Ubuntu 24 LTS
- **Deployment:** Docker Compose o PM2 + Nginx
- **SSL:** Let's Encrypt
- **Backups:** Diarios automáticos (2 AM)

---

## 📖 CÓMO USAR ESTA DOCUMENTACIÓN

### Para Desarrolladores Frontend

1. **Comenzar con:** `01-vision-y-alcance.md` (contexto general)
2. **Arquitectura Frontend:** `14-frontend.md` (React, Vite, Ant Design, Atomic Design)
3. **Arquitectura General:** `04-arquitectura-sistema.md`
4. **Base de Datos:** `05-modelo-datos.md` (para entender entidades)
5. **API:** `06-diseno-api.md` (contratos de endpoints)
6. **Estándares:** `09-estandares-codigo.md`

### Para Desarrolladores Backend

1. **Comenzar con:** `01-vision-y-alcance.md` (contexto general)
2. **Arquitectura Backend:** `15-backend.md` (Node.js, Express, Clean Architecture)
3. **Arquitectura General:** `04-arquitectura-sistema.md`
4. **Base de Datos:** `05-modelo-datos.md` (estructura completa)
5. **API:** `06-diseno-api.md` (endpoints a implementar)
6. **Reglas de Negocio:** `08-reglas-negocio.md`
7. **Estándares:** `09-estandares-codigo.md`
8. **Configuración:** `11-configuracion-entornos.md`
9. **Errores:** `12-gestion-errores.md`

### Para Analistas de Negocio

1. `01-vision-y-alcance.md` - Contexto y objetivos
2. `02-requerimientos-funcionales.md` - Funcionalidades completas
3. `07-casos-de-uso.md` - Flujos de negocio
4. `08-reglas-negocio.md` - Restricciones y validaciones

### Para Arquitectos

1. `04-arquitectura-sistema.md` - Decisiones arquitectónicas generales
2. `14-frontend.md` - Arquitectura y diseño del frontend
3. `15-backend.md` - Arquitectura y diseño del backend
4. `05-modelo-datos.md` - Diseño de BD
5. `03-requerimientos-no-funcionales.md` - Requisitos de calidad
6. `06-diseno-api.md` - Contratos de integración

### Para DevOps

1. `11-configuracion-entornos.md` - Setup completo
2. `04-arquitectura-sistema.md` - Stack y dependencias
3. `12-gestion-errores.md` - Monitoreo y logging

### Para Product Owners

1. `01-vision-y-alcance.md` - Visión del producto
2. `02-requerimientos-funcionales.md` - Features prioritizadas
3. `03-requerimientos-no-funcionales.md` - Criterios de calidad

---

## 🔍 TÉRMINOS CLAVE

Para consultar definiciones técnicas, ver: **[13-glosario-terminos.md](13-glosario-terminos.md)**

**Términos más consultados:**
- Gestión Académica
- Inscripción
- Calificación (Sistema INCOS)
- Nivelación
- Pasantía
- Historial Oficial (Libro/Folio)
- RBAC (Roles y Permisos)
- JWT (Autenticación)

---

## 📞 CONTACTO Y SOPORTE

**Equipo de Desarrollo:**  
Sistema de Gestión Académica - Instituto INCOS

**Documentación:**  
Versión 1.1 - Enero 2025

**Repositorio:**  
GitHub: `instituto-incos/sistema-gestion-academica`

---

## 📄 LICENCIA Y COPYRIGHT

**Propiedad Intelectual:** Instituto Comercial Superior (INCOS)  
**Año:** 2025  
**Uso:** Interno - Gestión Académica INCOS Santa Cruz

---

## ✅ CHECKLIST DE REVISIÓN

### Antes de Comenzar el Desarrollo

- [ ] Leer 01-vision-y-alcance.md
- [ ] Revisar 02-requerimientos-funcionales.md
- [ ] Revisar 03-requerimientos-no-funcionales.md
- [ ] Entender 04-arquitectura-sistema.md
- [ ] Estudiar 05-modelo-datos.md
- [ ] Configurar entorno según 11-configuracion-entornos.md
- [ ] Configurar ESLint/Prettier según 09-estandares-codigo.md

### Durante el Desarrollo

- [ ] Seguir estándares de 09-estandares-codigo.md
- [ ] Implementar endpoints según 06-diseno-api.md
- [ ] Validar reglas de negocio de 08-reglas-negocio.md
- [ ] Documentar código con JSDoc
- [ ] Escribir tests unitarios
- [ ] Manejar errores según 12-gestion-errores.md

### Antes del Deployment

- [ ] Todos los tests pasan
- [ ] ESLint sin errores
- [ ] Variables de entorno configuradas
- [ ] Migraciones de BD ejecutadas
- [ ] Backup de producción realizado
- [ ] SSL configurado
- [ ] Nginx configurado
- [ ] PM2 configurado
- [ ] Health endpoint funcionando

---

## 🎉 ESTADO FINAL

✅ **DOCUMENTACIÓN COMPLETA - 15/15 DOCUMENTOS**

**Total generado:** ~16,000 líneas de documentación técnica profesional

**Cobertura:**
- ✅ Visión y Alcance
- ✅ Requerimientos (Funcionales + No Funcionales)
- ✅ Arquitectura Completa
- ✅ Modelo de Datos (40+ tablas)
- ✅ Diseño de API (80+ endpoints)
- ✅ Casos de Uso y Reglas de Negocio
- ✅ Estándares de Código
- ✅ Configuración de Entornos
- ✅ Gestión de Errores
- ✅ **Frontend** (React, Vite, Ant Design, Atomic Design)
- ✅ **Backend** (Node.js, Express, Sequelize, Clean Architecture)
- ✅ Glosario Completo

**Listo para:** Comenzar desarrollo ✨

---

**FIN DEL ÍNDICE MAESTRO**
