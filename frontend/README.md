# 🎓 SISTEMA INCOS SANTA CRUZ - DOMINIO DEL NEGOCIO

## 📋 Información del Instituto

**Nombre**: Instituto Comercial Superior de la Nación INCOS Santa Cruz  
**Fundación**: 2 de agosto de 1985  
**Resolución Ministerial**: 0426/2016  
**Ubicación**: Calle Ñuflo de Chávez Nº 62, Santa Cruz de la Sierra  

**Horarios de Atención**:

- Turno Tarde: Lunes a Viernes 14:00 - 16:30
- Turno Noche: Lunes a Viernes 18:45 - 22:30
- Sábados: 17:00 - 21:00

**Carreras Técnicas** (Nivel Técnico Superior):

1. Sistemas Informáticos
2. Administración de Empresas
3. Contaduría General

**Perfil de Estudiantes**:

- Provienen de zonas periurbanas
- Trabajan en instituciones privadas, empresas, fábricas o negocios informales
- Requieren horarios flexibles (tarde/noche)

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
  - semester (1-6)
  - credits
  - hours
  - description
  - isActive
}
```

### 5. Course (Curso)

```javascript
class Course {
  - id
  - subjectId (FK)
  - academicPeriodId (FK)
  - teacherId (FK)
  - shift: 'afternoon' | 'night' | 'saturday'
  - maxStudents
  - enrolledStudents
  - classroom
  - schedule: [{day, startTime, endTime}]
  - status: 'open' | 'closed' | 'in_progress' | 'finished'
}
```

### 6. Enrollment (Inscripción)

```javascript
class Enrollment {
  - id
  - studentId (FK)
  - courseId (FK)
  - academicPeriodId (FK)
  - enrollmentDate
  - status: 'pending' | 'confirmed' | 'cancelled'
  - paymentStatus: 'pending' | 'paid'
  - paymentAmount
  - paymentDate
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

```javascript
class AcademicPeriod {
  - id
  - year: 2025
  - semester: 'I' | 'II'
  - name: '2025-I'
  - startDate
  - endDate
  - enrollmentStartDate
  - enrollmentEndDate
  - isActive
}
```

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

1. Turno Tarde: 14:00 - 16:30
2. Turno Noche: 18:45 - 22:30
3. Sábados: 17:00 - 21:00
4. No puede haber solapamiento de horarios por aula
5. Docente no puede tener clases simultáneas

### Carreras y Materias

1. Sistemas Informáticos: 6 semestres
2. Administración de Empresas: 6 semestres
3. Contaduría General: 6 semestres
4. Prerequisitos deben ser validados antes de inscripción

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

Esta es la base del dominio del negocio para INCOS. ¿Comenzamos con la implementación completa del módulo de autenticación y estudiantes?
