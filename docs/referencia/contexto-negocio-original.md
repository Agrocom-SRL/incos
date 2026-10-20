# Contexto de negocio original del sistema (histórico)

> **Estado:** conservado tal cual del README del frontend de la era Cursor (reemplazado el 2026-10-20). Describe el dominio, módulos y reglas **tal como se planearon**; no está verificado contra el código actual. Para el flujo vigente ver `flujo-operativo-gestion-academica.md`; para permisos, `matriz-permisos-sistema.md`. No se borra para no perder la lógica de negocio original.

# 🎓 SISTEMA INCOS SANTA CRUZ - DOMINIO DEL NEGOCIO

## 📋 Información del Instituto

**Nombre Completo**: El Instituto Comercial Superior de la Nación INCOS Santa Cruz

**Historia**:
El Instituto Comercial Superior de la Nación INCOS Santa Cruz fue fundado el **2 de agosto de 1985** mediante la **Resolución Ministerial 746/1985**. Actualmente cuenta con la **R.M. 0426/2016**, ofertando inicialmente las Carreras de **Contaduría General** y **Secretariado Ejecutivo**. Posteriormente, en el año **1988**, se ampliaron las carreras de **Administración de Empresas** e **Informática**.

**Ubicación**:
Calle Ñuflo de Chavez Nº 62, entre René Moreno y Calle Chuquisaca, dentro del centro histórico del municipio de **Santa Cruz de la Sierra**.

**Horarios de Atención**:

- **Turno Tarde**: Lunes a Viernes 14:00 - 16:30
- **Turno Noche**: Lunes a Viernes 18:45 - 22:30
- **Sábados**: 17:00 - 21:00

**Carreras Técnicas** (Nivel Técnico Superior):

Actualmente el instituto ofrece **tres carreras** al nivel de Técnico Superior:

1. **Sistemas Informáticos**
2. **Administración de Empresas**
3. **Contaduría General**

**Perfil de Estudiantes**:

- En su mayoría provienen de zonas periurbanas de la ciudad
- Trabajan en instituciones privadas, empresas, fábricas, industrias o en negocios informales
- Requieren horarios flexibles (tarde/noche/sábado)
- Necesitan accesibilidad móvil y consulta rápida de información académica

**Naturaleza Institucional**:

Somos una **Institución de Educación Superior Estatal**, abierta al conjunto de la sociedad, establecida con plenas facultades legales dentro del sistema Educativo Nacional.

---

## 👥 Equipo de Desarrollo

**Jefe del Proyecto**: Carlos Ferrufino  
🔗 GitHub: [@agrocom-developer](https://github.com/agrocom-developer)

**Desarrollador Frontend**: Nelson Farel  
🔗 GitHub: [@hfarel](https://github.com/hfarel)

**Desarrollador Backend**: Miguel Escobar  
🔗 GitHub: [@Angello-27](https://github.com/Angello-27)

---

## 🎯 Módulos del Sistema

### 1. MÓDULO DE AUTENTICACIÓN Y USUARIOS

**Prioridad**: Alta (Base del sistema)

**Roles del Sistema**:

- **Administrador**: Acceso total al sistema
- **Director/Coordinador**: Gestión académica y administrativa
- **Docente**: Gestión de cursos, notas, asistencias
- **Estudiante**: Consulta de información académica
- **Secretaría**: Gestión de inscripciones, documentos

**Funcionalidades**:

- Login/Logout
- Registro de usuarios
- Recuperación de contraseña
- Gestión de perfiles
- Cambio de contraseña
- Auditoría de accesos

---

### 2. MÓDULO DE ESTUDIANTES

**Prioridad**: Alta

**Entidades**:

- **Estudiante**: Datos personales, académicos, laborales
- **Inscripción**: Registro por gestión y carrera
- **HistorialAcademico**: Seguimiento del progreso

**Funcionalidades**:

- Registro de estudiantes
- Gestión de datos personales
- Inscripción a carreras
- Consulta de estado académico
- Generación de certificados
- Historial académico

---

### 3. MÓDULO DE CARRERAS Y MATERIAS

**Prioridad**: Alta

**Entidades**:

- **Carrera**: Sistemas Informáticos, Administración, Contaduría
- **Materia**: Asignaturas de cada carrera
- **PlanEstudios**: Malla curricular por carrera
- **Prerequisito**: Relación entre materias

**Funcionalidades**:

- Gestión de carreras
- Gestión de materias
- Configuración de malla curricular
- Gestión de prerequisitos
- Consulta de plan de estudios

---

### 4. MÓDULO DE DOCENTES

**Prioridad**: Media

**Entidades**:

- **Docente**: Datos personales y profesionales
- **Asignacion**: Relación docente-materia-curso
- **HorarioDocente**: Disponibilidad y carga horaria

**Funcionalidades**:

- Registro de docentes
- Gestión de información profesional
- Asignación de materias
- Gestión de horarios
- Carga académica

---

### 5. MÓDULO DE CURSOS Y HORARIOS

**Prioridad**: Alta

**Entidades**:

- **Curso**: Grupo de estudiantes en una materia
- **Horario**: Días, horas, aulas
- **Turno**: Tarde, Noche, Sábado
- **Aula**: Espacios físicos del instituto

**Funcionalidades**:

- Creación de cursos por gestión
- Asignación de horarios
- Gestión de turnos
- Gestión de aulas
- Consulta de horarios

---

### 6. MÓDULO DE INSCRIPCIONES

**Prioridad**: Alta

**Entidades**:

- **Inscripcion**: Registro del estudiante a materias
- **Gestion**: Periodo académico (2025-I, 2025-II)
- **Pago**: Registro de pagos de inscripción

**Funcionalidades**:

- Proceso de inscripción
- Validación de prerequisitos
- Inscripción a materias
- Registro de pagos
- Generación de comprobantes
- Consulta de inscripciones

---

### 7. MÓDULO DE NOTAS Y EVALUACIONES

**Prioridad**: Media

**Entidades**:

- **Nota**: Calificaciones de estudiantes
- **Evaluacion**: Tipos (parcial, final, práctica)
- **BoletaNotas**: Reporte de calificaciones

**Funcionalidades**:

- Registro de notas
- Cálculo de promedios
- Generación de boletas
- Consulta de notas
- Reportes académicos

---

### 8. MÓDULO DE ASISTENCIAS

**Prioridad**: Media

**Entidades**:

- **Asistencia**: Registro diario
- **Justificacion**: Faltas justificadas

**Funcionalidades**:

- Registro de asistencias
- Justificación de faltas
- Reportes de asistencia
- Control de porcentaje mínimo

---

### 9. MÓDULO DE REPORTES Y ESTADÍSTICAS

**Prioridad**: Baja

**Funcionalidades**:

- Dashboard administrativo
- Reportes de inscripciones
- Estadísticas académicas
- Reportes por carrera
- Análisis de rendimiento

---

### 10. MÓDULO DE DOCUMENTOS

**Prioridad**: Baja

**Funcionalidades**:

- Generación de certificados
- Títulos y diplomas
- Constancias de estudio
- Boletas de notas
- Comprobantes de pago

---

## 🏗️ ESTRUCTURA DE DOMAIN LAYER PARA INCOS

```text
src/core/
├── entities/
│   ├── auth/
│   │   ├── User.js
│   │   └── Session.js
│   │
│   ├── students/
│   │   ├── Student.js
│   │   ├── Enrollment.js
│   │   └── AcademicHistory.js
│   │
│   ├── academic/
│   │   ├── Career.js
│   │   ├── Subject.js
│   │   ├── Course.js
│   │   ├── Curriculum.js
│   │   └── Prerequisite.js
│   │
│   ├── teachers/
│   │   ├── Teacher.js
│   │   ├── Assignment.js
│   │   └── Schedule.js
│   │
│   ├── evaluations/
│   │   ├── Grade.js
│   │   ├── Evaluation.js
│   │   └── ReportCard.js
│   │
│   ├── attendance/
│   │   ├── Attendance.js
│   │   └── Justification.js
│   │
│   └── administration/
│       ├── AcademicPeriod.js
│       ├── Classroom.js
│       ├── Payment.js
│       └── Shift.js
│
├── repositories/
│   ├── IAuthRepository.js
│   ├── IStudentRepository.js
│   ├── ICareerRepository.js
│   ├── ITeacherRepository.js
│   ├── ICourseRepository.js
│   ├── IEnrollmentRepository.js
│   ├── IGradeRepository.js
│   └── IAttendanceRepository.js
│
├── useCases/
│   ├── auth/
│   │   ├── LoginUseCase.js
│   │   ├── LogoutUseCase.js
│   │   └── RegisterUseCase.js
│   │
│   ├── students/
│   │   ├── RegisterStudentUseCase.js
│   │   ├── EnrollStudentUseCase.js
│   │   └── GetStudentHistoryUseCase.js
│   │
│   ├── enrollment/
│   │   ├── CreateEnrollmentUseCase.js
│   │   ├── ValidatePrerequisitesUseCase.js
│   │   └── ProcessPaymentUseCase.js
│   │
│   ├── academic/
│   │   ├── CreateCourseUseCase.js
│   │   ├── AssignTeacherUseCase.js
│   │   └── GenerateScheduleUseCase.js
│   │
│   └── grades/
│       ├── RegisterGradeUseCase.js
│       ├── CalculateAverageUseCase.js
│       └── GenerateReportCardUseCase.js
│
├── services/
│   ├── GradeCalculator.js         # Cálculo de promedios
│   ├── EnrollmentValidator.js     # Validación de inscripciones
│   ├── ScheduleManager.js         # Gestión de horarios
│   └── PrerequisiteChecker.js     # Verificación de prerequisitos
│
└── errors/
    ├── AuthErrors.js
    ├── StudentErrors.js
    ├── EnrollmentErrors.js
    └── AcademicErrors.js
```

---

## 📊 ENTIDADES PRINCIPALES DEL DOMINIO

### 1. User (Autenticación)

```javascript
class User {
  - id
  - email
  - password (hash)
  - role: 'admin' | 'director' | 'teacher' | 'student' | 'secretary'
  - isActive
  - createdAt
}
```

### 2. Student (Estudiante)

```javascript
class Student {
  - id
  - userId (FK to User)
  - ci (Carnet de Identidad)
  - firstName
  - lastName
  - birthDate
  - gender
  - address
  - phone
  - email
  - workPlace (lugar de trabajo)
  - workAddress
  - emergencyContact
  - photo
  - status: 'active' | 'inactive' | 'graduated' | 'retired'
}
```

### 3. Career (Carrera)

```javascript
class Career {
  - id
  - code: 'SI' | 'AE' | 'CG'
  - name: 'Sistemas Informáticos' | 'Administración de Empresas' | 'Contaduría General'
  - description
  - duration (semestres)
  - isActive
  - createdAt
}
```

### 4. Subject (Materia)

```javascript
class Subject {
  - id
  - careerId (FK)
  - code
  - name
  - nombreCorto
  - cargaHorariaTeorica
  - cargaHorariaPractica
  - cargaHorariaTotal (generated)
  - credits
  - tipo: 'TEORICA' | 'PRACTICA' | 'TEORICA_PRACTICA'
  - areaConocimiento
  - description
  - isActive
}
```

### 5. Course (Curso)

```javascript
class Course {
  - id
  - materiaId (FK)
  - periodoId (FK) // Periodo de la gestión académica
  - paralelo: 'A' | 'B' | 'C' | ...
  - turno: 'MAÑANA' | 'TARDE' | 'NOCHE'
  - docenteId (FK)
  - cupoMaximo
  - horario: string // JSON o texto con el horario
  - aula: string
  - estado: 'PLANIFICADO' | 'EN_CURSO' | 'FINALIZADO' | 'CANCELADO'
  - created_at
  - updated_at
}
```

### 6. Enrollment (Inscripción)

**Inscripción Principal** (por gestión):

```javascript
class Inscripcion {
  - id
  - estudianteId (FK)
  - gestionId (FK) // Año académico (2025-I, 2025-II)
  - carreraId (FK)
  - periodoId (FK) // Semestre de la carrera (1º, 2º, 3º, 4º)
  - fechaInscripcion
  - fechaAprobacion
  - turno: 'MAÑANA' | 'TARDE' | 'NOCHE'
  - estado: 'BORRADOR' | 'PENDIENTE' | 'APROBADA' | 'RECHAZADA' | 'ANULADA'
  - motivoRechazo
  - motivoAnulacion
  - aprobadaPor (FK)
  - numeroMaterias
  - cargaHorariaTotal
  - observaciones
}
```

**Inscripción a Materias** (dentro de una inscripción):

```javascript
class InscripcionMateria {
  - id
  - inscripcionId (FK)
  - cursoId (FK)
  - fechaInscripcion
  - estado: 'INSCRITO' | 'APROBADO' | 'REPROBADO' | 'RETIRADO' | 'ABANDONO'
  - notaFinal
  - asistenciaPorcentaje
  // Sistema de calificaciones complejo
  - nota1erParcial
  - nota2doParcial
  - sumaParciales
  - nota3erParcial
  - notaPractico
  - sumaTotal
  - notaRecuperatorio
  - observaciones
}
```

### 7. Grade (Nota)

```javascript
class Grade {
  - id
  - enrollmentId (FK)
  - evaluationType: 'parcial1' | 'parcial2' | 'final' | 'practica'
  - score (0-100)
  - date
  - observations
}
```

### 8. Attendance (Asistencia)

```javascript
class Attendance {
  - id
  - enrollmentId (FK)
  - courseId (FK)
  - date
  - status: 'present' | 'absent' | 'late' | 'justified'
  - justificationId (FK, nullable)
  - observations
}
```

### 9. AcademicPeriod (Gestión Académica)

**Gestión** (Año académico completo):

```javascript
class Gestion {
  - id
  - codigo: '2025-1' | '2025-2'
  - anio: 2025
  - imagenPromocionUrl
  - fechaInicioAdministrativa
  - fechaFinAdministrativa
  - activo
}
```

**Etapa de Gestión** (Fases dentro de una gestión):

```javascript
class EtapaGestion {
  - id
  - gestionId (FK)
  - nombre: 'Pre-inscripción' | 'Inscripciones' | 'Clases' | 'Exámenes'
  - tipo: 'PRE_INSCRIPCION' | 'INSCRIPCIONES' | 'CLASES' | 'EVALUACIONES' | 'EXAMENES' | 'ENTREGA_NOTAS' | 'CIERRE_ADMINISTRATIVO'
  - fechaInicio
  - fechaFin
  - vigente: boolean
  - descripcion
}
```

**Periodo** (Semestre de la carrera: 1º, 2º, 3º, 4º):

```javascript
class Periodo {
  - id
  - carreraId (FK)
  - nombre: '1º Semestre' | '2º Semestre' | ...
  - numero: 1 | 2 | 3 | 4
  - ordenVisualizacion
  - descripcion
}
```

---

## 🗄️ ESTRUCTURA DE BASE DE DATOS

El sistema utiliza una base de datos MySQL con arquitectura modular y normalizada. Los scripts SQL están organizados en el directorio `backend/database/01-schemas/`:

### Scripts de Schema (Orden de Ejecución)

1. **`01-base.sql`** - Configuración inicial y estándares
2. **`02-catalogos-geograficos.sql`** - Catálogos geográficos (países, departamentos, provincias, municipios)
3. **`03-catalogos-referencia.sql`** - Catálogos de referencia (estados civiles, idiomas, tipos de discapacidad, etc.)
4. **`04-sistema-seguridad.sql`** - Sistema de autenticación y autorización (usuarios, roles, permisos)
5. **`05-estructura-academica-parte1.sql`** - Carreras, gestiones, periodos, materias, plan de estudios, prerrequisitos
6. **`05-estructura-academica-parte2.sql`** - Docentes, asignaciones, horarios, aulas, turnos
7. **`06-estudiantes-parte1.sql`** - Estudiantes, datos académicos, documentos
8. **`06-estudiantes-parte2.sql`** - Datos económicos, becas, descuentos, contactos de emergencia
9. **`09-inscripciones-parte1.sql`** - Inscripciones principales por gestión
10. **`09-inscripciones-parte2.sql`** - Inscripciones a materias, calificaciones, asistencias
11. **`10-pagos-academicos.sql`** - Sistema de pagos (aranceles, detalle de pagos)
12. **`12-traspasos.sql`** - Traspasos de estudiantes de otros institutos (instituciones, traspasos, traspasos_materias)
13. **`12-bloqueos-inscripcion.sql`** - Bloqueos de inscripción (nivelaciones pendientes, documentos, mora, etc.)
14. **`12-transitabilidades.sql`** - Transitabilidades (Técnico Medio a Técnico Superior)
15. **`14-pasantias.sql`** - Pasantías (empresas, asignaciones, evaluaciones)
16. **`14-supervision-libros.sql`** - Supervisión docente y libros de registro oficial (supervisiones, fichas, libros, folios)
14. **`12-indices.sql`** - Índices de optimización
15. **`12-sincronizacion.sql`** - Sistema de sincronización con sistema nacional
16. **`13-indices-optimizacion.sql`** - Índices adicionales de optimización

### Características de la Base de Datos

✅ **Normalización 3FN**: Todas las tablas siguen tercera forma normal  
✅ **Soft Delete**: Todas las tablas tienen `deleted_at` para eliminación lógica  
✅ **Auditoría Completa**: Campos estándar `created_at`, `updated_at`, `created_by`, `updated_by`, `deleted_by`  
✅ **ON DELETE SET NULL**: Todas las foreign keys usan `ON DELETE SET NULL`  
✅ **Sin UNIQUE**: Se eliminaron restricciones UNIQUE para permitir flexibilidad  
✅ **Campos Generados**: Uso de `GENERATED ALWAYS AS` para campos calculados  
✅ **Índices Optimizados**: Índices compuestos para consultas frecuentes  

### Estándares de Tablas

Todas las tablas incluyen:

- `id INT AUTO_INCREMENT PRIMARY KEY`
- `activo BOOLEAN DEFAULT TRUE`
- `created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`
- `updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`
- `deleted_at TIMESTAMP NULL DEFAULT NULL`
- `created_by INT` (FK a usuarios)
- `updated_by INT` (FK a usuarios)
- `deleted_by INT` (FK a usuarios)

---

## 🎨 SISTEMA DE TEMAS Y DISEÑO

El sistema utiliza un tema personalizado basado en los colores institucionales del logo de INCOS, organizado siguiendo principios SOLID.

### Estructura Modular del Tema

El tema está dividido en módulos especializados ubicados en `src/shared/config/theme/`:

- **`colors.js`** - Colores principales y semánticos (verde, rojo, dorado, azul)
- **`accentColors.js`** - Colores de acento complementarios (rosa, naranja, teal, lima, púrpura)
- **`componentColors.js`** - Colores específicos para sidebar, header y content
- **`gradients.js`** - Gradientes metálicos inspirados en el logo
- **`shadows.js`** - Sistema de sombras y profundidad (elevación 1-4)
- **`typography.js`** - Configuración de tipografía (Poppins)
- **`spacing.js`** - Espaciado, border radius, control heights
- **`components.js`** - Configuración de componentes Ant Design

### Paleta de Colores

**Colores Principales** (del logo):

- **Verde**: `#196b45` → Sidebar activo, Header, CTAs principales
- **Rojo**: `#e41c24` → Errores, alertas críticas
- **Dorado**: `#f59e0b` → Advertencias, elementos premium
- **Azul Cielo**: `#7d9bdc` → Información, estados neutros

**Colores de Acento** (complementarios del verde):

- Rosa-Magenta, Naranja, Azul-Verde, Verde-Lima, Púrpura

### Uso del Tema

```jsx
import { useToken } from 'antd';

const { token } = useToken();

// Usar colores del tema
<div style={{ color: token.colorAccentPurple }}>Elemento premium</div>

// Usar gradientes
<Button style={{ background: token.gradientPrimary }}>
  Botón con efecto metálico
</Button>

// Usar sombras de elevación
<div style={{ boxShadow: token.shadowElevation2 }}>Card elevada</div>
```

### Componentes del Layout

- **Sidebar**: Fondo blanco, items activos en verde (#196b45)
- **Header**: Fondo verde (#196b45), texto blanco
- **Content**: Fondo gris claro (#fafafa), cards blancas

---

## 🎨 REGLAS DE NEGOCIO PRINCIPALES

### Inscripciones

1. Estudiante debe tener prerequisitos aprobados
2. Curso debe tener cupos disponibles
3. Estudiante no puede inscribirse en materias con horario conflictivo
4. Inscripción requiere pago confirmado
5. Inscripción solo durante periodo habilitado

### Evaluaciones

1. Nota final = (Parcial1 *30% + Parcial2* 30% + Final * 40%)
2. Nota mínima de aprobación: 51/100
3. Estudiante debe tener mínimo 75% de asistencia para aprobar

### Horarios

1. **Turno Tarde**: Lunes a Viernes 14:00 - 16:30
2. **Turno Noche**: Lunes a Viernes 18:45 - 22:30
3. **Sábados**: 17:00 - 21:00
4. No puede haber solapamiento de horarios por aula
5. Docente no puede tener clases simultáneas
6. Los turnos están definidos en el enum `'MAÑANA' | 'TARDE' | 'NOCHE'` en la base de datos

### Carreras y Materias

1. **Sistemas Informáticos**: Nivel Técnico Superior (estructura de periodos definida en `plan_estudios`)
2. **Administración de Empresas**: Nivel Técnico Superior (estructura de periodos definida en `plan_estudios`)
3. **Contaduría General**: Nivel Técnico Superior (estructura de periodos definida en `plan_estudios`)
4. Las carreras tienen duración variable (definida en campo `duracion_anios` de la tabla `carreras`)
5. El plan de estudios está normalizado en la tabla `plan_estudios` (carrera × periodo × materia)
6. Los **prerrequisitos** están normalizados en la tabla `prerrequisitos` y deben ser validados antes de inscripción
7. Las materias tienen carga horaria teórica y práctica separadas, con total generado automáticamente

---

## 🚀 PRIORIZACIÓN PARA DESARROLLO

### FASE 1 (MVP) - 4 semanas

- ✅ Autenticación y Usuarios
- ✅ Gestión de Estudiantes
- ✅ Carreras y Materias (catálogo básico)
- ✅ Inscripciones básicas

### FASE 2 - 3 semanas

- Gestión de Docentes
- Creación de Cursos
- Horarios y Turnos
- Asignación Docente-Materia

### FASE 3 - 3 semanas

- Registro de Notas
- Cálculo de promedios
- Generación de boletas
- Registro de Asistencias

### FASE 4 - 2 semanas

- Dashboard administrativo
- Reportes y estadísticas
- Generación de documentos
- Optimización general

---

## 💡 CONSIDERACIONES ESPECIALES

### Perfil de Estudiantes

- Interfaz simple y clara (muchos trabajan)
- Acceso móvil prioritario
- Notificaciones importantes vía SMS/WhatsApp
- Consulta rápida de horarios y notas

### Horarios Flexibles

- Sistema debe manejar 3 turnos diferentes
- Validación de solapamiento de horarios
- Gestión de aulas por turno

### Zona Periurbana

- Considerar conectividad variable
- Sistema debe funcionar offline cuando sea posible
- Sincronización inteligente de datos

---

## 📝 CAMBIOS RECIENTES

### Reorganización de Hooks y Componentes (Enero 2025)

**Reorganización de Hooks del Módulo Estudiantes:**
- ✅ Separación de hooks de API (`useEstudiantesApi`) y hooks de Feature (`useEstudiantesList`)
- ✅ Eliminación de hooks deprecated (`useStudentsList`, `useEstudiantesTable`)
- ✅ Estructura escalable: cada feature tiene su propio hook
- ✅ Documentación actualizada en `docs/14-frontend.md`

**Co-localización de Hooks con Componentes:**
- ✅ `useTableData` movido a `DataTable/hooks/` (co-localizado con el componente)
- ✅ `useSidebarState` exportado desde `Sidebar/index.js` (patrón consistente)
- ✅ Patrón establecido: hooks genéricos co-localizados con sus componentes

**Componentes y Estructura:**
- ✅ Nuevos componentes atómicos: `SearchBar`, `Spinner`
- ✅ Componente genérico `DataTable` (molecule) para tablas reutilizables
- ✅ Organismo genérico `TableListView` para vistas de lista con tabla
- ✅ Configuración de columnas separada en `config/tableColumns.jsx`

**Arquitectura:**
- ✅ Clean Architecture aplicada: separación clara entre API, Feature y Generic hooks
- ✅ Atomic Design: componentes organizados en atoms, molecules, organisms
- ✅ Principio YAGNI: solo se crea lo necesario, sin código anticipado

**Documentación:**
- ✅ Información de hooks integrada en `docs/14-frontend.md`
- ✅ Convenciones de nombres actualizadas en `docs/09-estandares-codigo.md`
- ✅ Estructura y patrones documentados para futuras features

---

Esta es la base del dominio del negocio para INCOS. ¿Comenzamos con la implementación completa del módulo de autenticación y estudiantes?
