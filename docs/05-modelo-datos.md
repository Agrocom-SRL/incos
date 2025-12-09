# 05 - MODELO DE DATOS
## Sistema de Gestión Académica - Instituto INCOS Santa Cruz

**Versión:** 1.0  
**Fecha:** Diciembre 2025  
**Estado:** Documento Base Consolidado

---

## 1. INTRODUCCIÓN

### 1.1 Propósito del Documento

Este documento describe el **modelo de datos** completo del Sistema de Gestión Académica del Instituto INCOS Santa Cruz. Define todas las tablas, relaciones, restricciones y reglas de integridad de la base de datos.

### 1.2 Alcance

**Total de Tablas:** 58 tablas organizadas en 10 categorías

**Base de Datos:** MySQL 8.0

**Motor de Almacenamiento:** InnoDB (transacciones ACID, claves foráneas)

**Charset:** utf8mb4 (soporte completo de Unicode, incluyendo emojis)

**Collation:** utf8mb4_unicode_ci (comparaciones case-insensitive)

### 1.3 Convenciones de Nomenclatura

**Tablas:**
- Nombres en **plural** (estudiantes, inscripciones, materias)
- Snake_case (palabras_separadas_por_guion_bajo)
- Sin prefijos (evitar tbl_, sys_, etc.)

**Columnas:**
- Snake_case
- Claves primarias: `id` (INT AUTO_INCREMENT)
- Claves foráneas: `nombre_tabla_id` (ej: estudiante_id, carrera_id)
- Timestamps: `created_at`, `updated_at`, `deleted_at`
- Soft deletes: `deleted_at` (NULL = activo, timestamp = eliminado)

**Índices:**
- Primarios: PRIMARY KEY
- Foráneos: FK_tabla_referencia
- Únicos: UQ_tabla_campo
- Compuestos: IDX_tabla_campo1_campo2

---

## 2. DIAGRAMA ENTIDAD-RELACIÓN GENERAL

```
┌──────────────────────────────────────────────────────────────────────────┐
│                       CATÁLOGOS GEOGRÁFICOS                              │
├──────────────────────────────────────────────────────────────────────────┤
│ paises → departamentos → provincias → municipios → comunidades           │
│          ↓                                      ↓                         │
│       localidades (alternativo)                                          │
└──────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────┐
│                    ESTRUCTURA ACADÉMICA                                   │
├──────────────────────────────────────────────────────────────────────────┤
│ carreras → plan_estudios → materias → prerrequisitos                    │
│    ↓           ↓                ↓                                        │
│ gestiones → periodos         cursos ← asignaciones_docentes ← docentes  │
│                               ↓                                          │
│                        turnos_cursos ← turnos_horarios                  │
└──────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────┐
│                    GESTIÓN DE ESTUDIANTES                                 │
├──────────────────────────────────────────────────────────────────────────┤
│ estudiantes → estudiantes_becas (becas_descuentos)                      │
│     ↓         documentos_estudiante                                      │
│     ↓         estados_especiales_estudiante                              │
│     ↓         licencias_solicitudes → licencias_documentos              │
│     ↓                                                                     │
│ inscripciones (gestión) → inscripciones_materias (calificaciones)       │
│                                   ↓                                       │
│                          historial_nivelaciones                          │
└──────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────┐
│                    MÓDULOS OPERATIVOS                                     │
├──────────────────────────────────────────────────────────────────────────┤
│ PASANTÍAS:                                                                │
│   pasantias_empresas → pasantias_asignaciones → pasantias_evaluaciones  │
│                                                                           │
│ SUPERVISIÓN DOCENTE:                                                     │
│   supervisiones_programadas → fichas_supervision                         │
│                                                                           │
│ HISTORIAL OFICIAL:                                                       │
│   libros_registro → folios_estudiantes (Libro/Folio)                    │
│                                                                           │
│ PAGOS:                                                                    │
│   aranceles → pagos_aranceles → detalle_pagos                           │
└──────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────┐
│                    SISTEMA Y SEGURIDAD                                    │
├──────────────────────────────────────────────────────────────────────────┤
│ usuarios ← roles ← roles_permisos → permisos                            │
│    ↓                                                                      │
│ auditoria, sincronizacion_logs                                           │
│ configuracion_sistema, parametros_generales                              │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 3. CATÁLOGOS GEOGRÁFICOS (6 TABLAS)

### 3.1 paises

**Descripción:** Catálogo de países (principalmente Bolivia).

```sql
CREATE TABLE paises (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR(100) NOT NULL UNIQUE,
  codigo_iso2 CHAR(2) NOT NULL UNIQUE COMMENT 'Código ISO 3166-1 alpha-2',
  codigo_iso3 CHAR(3) NOT NULL UNIQUE COMMENT 'Código ISO 3166-1 alpha-3',
  codigo_numerico SMALLINT UNSIGNED COMMENT 'Código ISO 3166-1 numérico',
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Datos Iniciales:**
```sql
INSERT INTO paises (nombre, codigo_iso2, codigo_iso3, codigo_numerico) VALUES
('Bolivia', 'BO', 'BOL', 68);
```

---

### 3.2 departamentos

**Descripción:** Departamentos de Bolivia (9 departamentos).

```sql
CREATE TABLE departamentos (
  id INT PRIMARY KEY AUTO_INCREMENT,
  pais_id INT NOT NULL,
  nombre VARCHAR(100) NOT NULL,
  codigo VARCHAR(10) COMMENT 'Código del departamento',
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (pais_id) REFERENCES paises(id) ON DELETE RESTRICT,
  UNIQUE KEY UQ_departamento_pais (pais_id, nombre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Datos Iniciales (Bolivia):**
```sql
INSERT INTO departamentos (pais_id, nombre, codigo) VALUES
(1, 'Santa Cruz', 'SC'),
(1, 'La Paz', 'LP'),
(1, 'Cochabamba', 'CB'),
(1, 'Tarija', 'TJ'),
(1, 'Beni', 'BN'),
(1, 'Pando', 'PD'),
(1, 'Oruro', 'OR'),
(1, 'Potosí', 'PT'),
(1, 'Chuquisaca', 'CH');
```

---

### 3.3 provincias

**Descripción:** Provincias dentro de cada departamento.

```sql
CREATE TABLE provincias (
  id INT PRIMARY KEY AUTO_INCREMENT,
  departamento_id INT NOT NULL,
  nombre VARCHAR(100) NOT NULL,
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (departamento_id) REFERENCES departamentos(id) ON DELETE RESTRICT,
  UNIQUE KEY UQ_provincia_departamento (departamento_id, nombre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

### 3.4 municipios

**Descripción:** Municipios dentro de cada provincia.

```sql
CREATE TABLE municipios (
  id INT PRIMARY KEY AUTO_INCREMENT,
  provincia_id INT NOT NULL,
  nombre VARCHAR(100) NOT NULL,
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (provincia_id) REFERENCES provincias(id) ON DELETE RESTRICT,
  UNIQUE KEY UQ_municipio_provincia (provincia_id, nombre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

### 3.5 comunidades

**Descripción:** Comunidades dentro de cada municipio (nivel más granular).

```sql
CREATE TABLE comunidades (
  id INT PRIMARY KEY AUTO_INCREMENT,
  municipio_id INT NOT NULL,
  nombre VARCHAR(100) NOT NULL,
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (municipio_id) REFERENCES municipios(id) ON DELETE RESTRICT,
  UNIQUE KEY UQ_comunidad_municipio (municipio_id, nombre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

### 3.6 localidades

**Descripción:** Alternativa simplificada para localidades (barrios, zonas) sin jerarquía completa.

```sql
CREATE TABLE localidades (
  id INT PRIMARY KEY AUTO_INCREMENT,
  departamento_id INT NOT NULL,
  nombre VARCHAR(150) NOT NULL,
  tipo ENUM('ZONA', 'BARRIO', 'UV', 'OTRO') DEFAULT 'ZONA',
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (departamento_id) REFERENCES departamentos(id) ON DELETE RESTRICT,
  INDEX IDX_localidad_departamento (departamento_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

## 4. CATÁLOGOS DE REFERENCIA (8 TABLAS)

### 4.1 tipos_sangre

**Descripción:** Tipos de sangre (A+, A-, B+, B-, AB+, AB-, O+, O-).

```sql
CREATE TABLE tipos_sangre (
  id INT PRIMARY KEY AUTO_INCREMENT,
  tipo VARCHAR(5) NOT NULL UNIQUE COMMENT 'Ej: A+, O-, AB+',
  descripcion VARCHAR(100),
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Datos Iniciales:**
```sql
INSERT INTO tipos_sangre (tipo, descripcion) VALUES
('A+', 'A positivo'),
('A-', 'A negativo'),
('B+', 'B positivo'),
('B-', 'B negativo'),
('AB+', 'AB positivo'),
('AB-', 'AB negativo'),
('O+', 'O positivo'),
('O-', 'O negativo');
```

---

### 4.2 idiomas

**Descripción:** Idiomas hablados (Español, Quechua, Aymara, Guaraní, etc.).

```sql
CREATE TABLE idiomas (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR(50) NOT NULL UNIQUE,
  codigo_iso VARCHAR(3) COMMENT 'Código ISO 639-2/3',
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Datos Iniciales:**
```sql
INSERT INTO idiomas (nombre, codigo_iso) VALUES
('Español', 'spa'),
('Quechua', 'que'),
('Aymara', 'aym'),
('Guaraní', 'grn'),
('Inglés', 'eng');
```

---

### 4.3 estados_civiles

**Descripción:** Estados civiles (Soltero, Casado, Divorciado, Viudo, Conviviente).

```sql
CREATE TABLE estados_civiles (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR(50) NOT NULL UNIQUE,
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Datos Iniciales:**
```sql
INSERT INTO estados_civiles (nombre) VALUES
('Soltero(a)'),
('Casado(a)'),
('Divorciado(a)'),
('Viudo(a)'),
('Conviviente');
```

---

### 4.4 tipos_discapacidad

**Descripción:** Tipos de discapacidad (Visual, Auditiva, Motriz, Intelectual, etc.).

```sql
CREATE TABLE tipos_discapacidad (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR(100) NOT NULL UNIQUE,
  descripcion TEXT,
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Datos Iniciales:**
```sql
INSERT INTO tipos_discapacidad (nombre, descripcion) VALUES
('Visual', 'Discapacidad relacionada con la vista'),
('Auditiva', 'Discapacidad relacionada con la audición'),
('Motriz', 'Discapacidad relacionada con el movimiento'),
('Intelectual', 'Discapacidad intelectual o cognitiva'),
('Psicosocial', 'Discapacidad psicosocial o mental'),
('Múltiple', 'Dos o más discapacidades'),
('Otra', 'Otro tipo de discapacidad');
```

---

### 4.5 becas_descuentos

**Descripción:** Tipos de becas y descuentos disponibles (0%, 25%, 50%, 75%, 100%).

```sql
CREATE TABLE becas_descuentos (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR(100) NOT NULL UNIQUE COMMENT 'Ej: Beca 100%, Descuento 25%',
  porcentaje DECIMAL(5,2) NOT NULL CHECK (porcentaje >= 0 AND porcentaje <= 100),
  descripcion TEXT,
  requiere_documentacion BOOLEAN DEFAULT FALSE COMMENT 'Si requiere documentos de respaldo',
  requiere_aprobacion_rector BOOLEAN DEFAULT FALSE COMMENT 'Si requiere aprobación del Rector',
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Datos Iniciales:**
```sql
INSERT INTO becas_descuentos (nombre, porcentaje, requiere_documentacion, requiere_aprobacion_rector) VALUES
('Sin Beca', 0.00, FALSE, FALSE),
('Beca 25%', 25.00, FALSE, FALSE),
('Beca 50%', 50.00, TRUE, FALSE),
('Beca 75%', 75.00, TRUE, FALSE),
('Beca 100%', 100.00, TRUE, TRUE);
```

---

### 4.6 turnos_horarios

**Descripción:** Turnos académicos (Mañana, Tarde, Noche).

```sql
CREATE TABLE turnos_horarios (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR(50) NOT NULL UNIQUE COMMENT 'Ej: MAÑANA, TARDE, NOCHE',
  hora_inicio TIME NOT NULL,
  hora_fin TIME NOT NULL,
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CHECK (hora_fin > hora_inicio)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Datos Iniciales:**
```sql
INSERT INTO turnos_horarios (nombre, hora_inicio, hora_fin) VALUES
('MAÑANA', '07:00:00', '12:00:00'),
('TARDE', '14:00:00', '18:00:00'),
('NOCHE', '19:00:00', '22:00:00');
```

---

### 4.7 roles

**Descripción:** Roles de usuario del sistema (11 roles predefinidos).

```sql
CREATE TABLE roles (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR(50) NOT NULL UNIQUE COMMENT 'Nombre técnico del rol',
  nombre_display VARCHAR(100) NOT NULL COMMENT 'Nombre para mostrar en UI',
  descripcion TEXT,
  nivel_jerarquico TINYINT UNSIGNED DEFAULT 0 COMMENT 'Nivel jerárquico (0=más bajo)',
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Datos Iniciales:**
```sql
INSERT INTO roles (nombre, nombre_display, descripcion, nivel_jerarquico) VALUES
('SUPER_ADMIN', 'Super Administrador', 'Control total del sistema', 10),
('RECTOR', 'Rector', 'Máxima autoridad del instituto', 9),
('DIRECTOR_ACADEMICO', 'Director Académico', 'Gestión académica', 8),
('DIRECTOR_ADMINISTRATIVO', 'Director Administrativo', 'Gestión administrativa y financiera', 8),
('SECRETARIA_ACADEMICA', 'Secretaria Académica', 'Inscripciones y calificaciones', 5),
('SECRETARIA_ADMINISTRATIVA', 'Secretaria Administrativa', 'Pagos y documentación', 5),
('CONTADOR', 'Contador', 'Gestión financiera', 6),
('DOCENTE', 'Docente', 'Registro de calificaciones y asistencias', 4),
('ESTUDIANTE', 'Estudiante', 'Consulta de información académica', 1),
('DOCENTE_TUTOR', 'Docente Tutor', 'Docente + supervisión de pasantías', 5),
('SUPERVISOR', 'Supervisor', 'Supervisión del desempeño docente', 6);
```

---

### 4.8 permisos

**Descripción:** Permisos granulares del sistema (70+ permisos).

```sql
CREATE TABLE permisos (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR(100) NOT NULL UNIQUE COMMENT 'Nombre técnico del permiso',
  nombre_display VARCHAR(150) NOT NULL COMMENT 'Nombre para mostrar en UI',
  modulo VARCHAR(50) NOT NULL COMMENT 'Módulo al que pertenece',
  descripcion TEXT,
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX IDX_permiso_modulo (modulo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Ejemplos de Permisos:**
```sql
INSERT INTO permisos (nombre, nombre_display, modulo) VALUES
-- Estudiantes
('estudiantes.ver', 'Ver estudiantes', 'estudiantes'),
('estudiantes.crear', 'Crear estudiantes', 'estudiantes'),
('estudiantes.editar', 'Editar estudiantes', 'estudiantes'),
('estudiantes.eliminar', 'Eliminar estudiantes', 'estudiantes'),
('estudiantes.becas.gestionar', 'Gestionar becas de estudiantes', 'estudiantes'),

-- Inscripciones
('inscripciones.crear', 'Crear inscripciones', 'inscripciones'),
('inscripciones.anular', 'Anular inscripciones', 'inscripciones'),
('inscripciones_materias.gestionar', 'Gestionar inscripciones a materias', 'inscripciones'),

-- Calificaciones
('calificaciones.registrar', 'Registrar calificaciones', 'calificaciones'),
('calificaciones.editar', 'Editar calificaciones', 'calificaciones'),
('calificaciones.publicar', 'Publicar calificaciones', 'calificaciones'),
('calificaciones.cerrar_periodo', 'Cerrar periodo académico', 'calificaciones'),

-- Reportes
('reportes.academicos', 'Ver reportes académicos', 'reportes'),
('reportes.financieros', 'Ver reportes financieros', 'reportes'),

-- Sistema
('usuarios.gestionar', 'Gestionar usuarios', 'sistema'),
('roles.gestionar', 'Gestionar roles', 'sistema'),
('auditoria.ver', 'Ver auditoría del sistema', 'sistema'),
('configuracion.editar', 'Editar configuración', 'sistema');
```

---

## 5. ESTRUCTURA ACADÉMICA (10 TABLAS)

### 5.1 carreras

**Descripción:** Carreras ofrecidas por el instituto (Contaduría, Administración, Sistemas).

```sql
CREATE TABLE carreras (
  id INT PRIMARY KEY AUTO_INCREMENT,
  codigo VARCHAR(20) NOT NULL UNIQUE COMMENT 'Código único de la carrera',
  nombre VARCHAR(150) NOT NULL UNIQUE,
  titulo_otorgado VARCHAR(150) COMMENT 'Ej: Técnico Superior en Contaduría General',
  duracion_semestres TINYINT UNSIGNED NOT NULL COMMENT 'Duración en semestres',
  resolucion_ministerial VARCHAR(50) COMMENT 'Número de RM que aprueba la carrera',
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Datos Iniciales:**
```sql
INSERT INTO carreras (codigo, nombre, titulo_otorgado, duracion_semestres, resolucion_ministerial) VALUES
('CONT', 'Contaduría General', 'Técnico Superior en Contaduría General', 4, 'R.M. 0426/2016'),
('ADM', 'Administración de Empresas', 'Técnico Superior en Administración de Empresas', 4, 'R.M. 0426/2016'),
('SIS', 'Sistemas Informáticos', 'Técnico Superior en Sistemas Informáticos', 4, 'R.M. 0426/2016');
```

---

### 5.2 gestiones

**Descripción:** Gestiones académicas (años lectivos, ej: 2025-1, 2025-2).

```sql
CREATE TABLE gestiones (
  id INT PRIMARY KEY AUTO_INCREMENT,
  codigo VARCHAR(20) NOT NULL UNIQUE COMMENT 'Ej: 2025-1, 2025-2',
  anio SMALLINT UNSIGNED NOT NULL,
  periodo TINYINT UNSIGNED NOT NULL COMMENT '1=Primer semestre, 2=Segundo semestre',
  fecha_inicio DATE NOT NULL,
  fecha_fin DATE NOT NULL,
  estado ENUM('PLANIFICACION', 'INSCRIPCION_ABIERTA', 'EN_CURSO', 'FINALIZADA', 'CERRADA') DEFAULT 'PLANIFICACION',
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY UQ_gestion_anio_periodo (anio, periodo),
  CHECK (fecha_fin > fecha_inicio),
  CHECK (periodo IN (1, 2))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Ejemplo:**
```sql
INSERT INTO gestiones (codigo, anio, periodo, fecha_inicio, fecha_fin, estado) VALUES
('2025-1', 2025, 1, '2025-02-01', '2025-06-30', 'INSCRIPCION_ABIERTA'),
('2025-2', 2025, 2, '2025-08-01', '2025-12-15', 'PLANIFICACION');
```

---

### 5.3 periodos

**Descripción:** Periodos académicos dentro de cada carrera (1º, 2º, 3º, 4º semestre).

```sql
CREATE TABLE periodos (
  id INT PRIMARY KEY AUTO_INCREMENT,
  carrera_id INT NOT NULL,
  numero_periodo TINYINT UNSIGNED NOT NULL COMMENT '1, 2, 3, 4',
  nombre VARCHAR(50) NOT NULL COMMENT 'Ej: 1º Semestre, 2º Semestre',
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (carrera_id) REFERENCES carreras(id) ON DELETE RESTRICT,
  UNIQUE KEY UQ_periodo_carrera (carrera_id, numero_periodo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Ejemplo:**
```sql
-- Para cada carrera (3 carreras × 4 semestres = 12 registros)
INSERT INTO periodos (carrera_id, numero_periodo, nombre) VALUES
(1, 1, '1º Semestre'),
(1, 2, '2º Semestre'),
(1, 3, '3º Semestre'),
(1, 4, '4º Semestre');
-- Repetir para carrera_id 2 y 3
```

---

### 5.4 materias

**Descripción:** Materias del plan de estudios.

```sql
CREATE TABLE materias (
  id INT PRIMARY KEY AUTO_INCREMENT,
  codigo VARCHAR(20) NOT NULL UNIQUE COMMENT 'Código único de la materia',
  nombre VARCHAR(150) NOT NULL,
  descripcion TEXT,
  carga_horaria_teorica INT UNSIGNED DEFAULT 0 COMMENT 'Horas teóricas',
  carga_horaria_practica INT UNSIGNED DEFAULT 0 COMMENT 'Horas prácticas',
  carga_horaria_total INT UNSIGNED GENERATED ALWAYS AS (carga_horaria_teorica + carga_horaria_practica) STORED,
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Ejemplo:**
```sql
INSERT INTO materias (codigo, nombre, carga_horaria_teorica, carga_horaria_practica) VALUES
('CONT-101', 'Introducción a la Contabilidad', 40, 20),
('CONT-201', 'Contabilidad Intermedia', 40, 20),
('MAT-101', 'Matemática Básica', 50, 10),
('ADM-101', 'Fundamentos de Administración', 40, 20);
```

---

### 5.5 plan_estudios

**Descripción:** Relación entre carreras, periodos y materias (qué materias se dictan en cada periodo).

```sql
CREATE TABLE plan_estudios (
  id INT PRIMARY KEY AUTO_INCREMENT,
  carrera_id INT NOT NULL,
  periodo_id INT NOT NULL,
  materia_id INT NOT NULL,
  es_obligatoria BOOLEAN DEFAULT TRUE COMMENT 'TRUE=Obligatoria, FALSE=Electiva',
  orden_visualizacion TINYINT UNSIGNED DEFAULT 0 COMMENT 'Orden de visualización',
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (carrera_id) REFERENCES carreras(id) ON DELETE RESTRICT,
  FOREIGN KEY (periodo_id) REFERENCES periodos(id) ON DELETE RESTRICT,
  FOREIGN KEY (materia_id) REFERENCES materias(id) ON DELETE RESTRICT,
  UNIQUE KEY UQ_plan_estudios (carrera_id, periodo_id, materia_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Ejemplo:**
```sql
-- Contaduría General, 1º Semestre
INSERT INTO plan_estudios (carrera_id, periodo_id, materia_id, es_obligatoria, orden_visualizacion) VALUES
(1, 1, 1, TRUE, 1),  -- Introducción a la Contabilidad
(1, 1, 3, TRUE, 2);  -- Matemática Básica
```

---

### 5.6 prerrequisitos

**Descripción:** Materias prerrequisito (qué materias deben aprobarse antes de inscribirse a otra).

```sql
CREATE TABLE prerrequisitos (
  id INT PRIMARY KEY AUTO_INCREMENT,
  materia_id INT NOT NULL COMMENT 'Materia que requiere el prerrequisito',
  materia_prerrequisito_id INT NOT NULL COMMENT 'Materia que debe aprobarse primero',
  es_obligatorio BOOLEAN DEFAULT TRUE COMMENT 'Si el prerrequisito es obligatorio',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (materia_id) REFERENCES materias(id) ON DELETE CASCADE,
  FOREIGN KEY (materia_prerrequisito_id) REFERENCES materias(id) ON DELETE CASCADE,
  UNIQUE KEY UQ_prerrequisito (materia_id, materia_prerrequisito_id),
  CHECK (materia_id != materia_prerrequisito_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Ejemplo:**
```sql
-- Contabilidad Intermedia requiere Introducción a la Contabilidad
INSERT INTO prerrequisitos (materia_id, materia_prerrequisito_id) VALUES
(2, 1);  -- CONT-201 requiere CONT-101
```

---

### 5.7 cursos

**Descripción:** Grupos/secciones de una materia (Grupo A, B, C).

```sql
CREATE TABLE cursos (
  id INT PRIMARY KEY AUTO_INCREMENT,
  materia_id INT NOT NULL,
  gestion_id INT NOT NULL,
  nombre VARCHAR(50) NOT NULL COMMENT 'Ej: Grupo A, Grupo B, Sección 1',
  cupo_maximo INT UNSIGNED DEFAULT 35 COMMENT 'Cupo máximo de estudiantes',
  cupo_actual INT UNSIGNED DEFAULT 0 COMMENT 'Estudiantes inscritos actualmente',
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (materia_id) REFERENCES materias(id) ON DELETE RESTRICT,
  FOREIGN KEY (gestion_id) REFERENCES gestiones(id) ON DELETE RESTRICT,
  UNIQUE KEY UQ_curso_materia_gestion (materia_id, gestion_id, nombre),
  CHECK (cupo_actual <= cupo_maximo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

### 5.8 docentes

**Descripción:** Información de los docentes del instituto.

```sql
CREATE TABLE docentes (
  id INT PRIMARY KEY AUTO_INCREMENT,
  usuario_id INT UNIQUE COMMENT 'Referencia a tabla usuarios (si tiene acceso al sistema)',
  nombres VARCHAR(100) NOT NULL,
  apellido_paterno VARCHAR(100) NOT NULL,
  apellido_materno VARCHAR(100),
  ci VARCHAR(20) NOT NULL,
  expedicion VARCHAR(5) NOT NULL COMMENT 'SC, LP, CB, etc.',
  complemento VARCHAR(5) COMMENT 'Complemento del CI',
  fecha_nacimiento DATE,
  genero ENUM('M', 'F', 'OTRO') NOT NULL,
  telefono VARCHAR(20),
  celular VARCHAR(20),
  email VARCHAR(150) UNIQUE,
  direccion TEXT,
  
  -- Datos profesionales
  titulo_profesional VARCHAR(150),
  especialidad VARCHAR(200),
  anios_experiencia TINYINT UNSIGNED,
  fecha_contratacion DATE,
  estado_laboral ENUM('ACTIVO', 'INACTIVO', 'LICENCIA', 'RETIRADO') DEFAULT 'ACTIVO',
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL COMMENT 'Soft delete',
  
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL,
  UNIQUE KEY UQ_docente_ci (ci, expedicion),
  INDEX IDX_docente_apellidos (apellido_paterno, apellido_materno),
  INDEX IDX_docente_estado (estado_laboral)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

### 5.9 asignaciones_docentes

**Descripción:** Asignación de docentes a cursos (qué docente dicta qué materia en qué grupo).

```sql
CREATE TABLE asignaciones_docentes (
  id INT PRIMARY KEY AUTO_INCREMENT,
  docente_id INT NOT NULL,
  curso_id INT NOT NULL,
  gestion_id INT NOT NULL,
  fecha_asignacion DATE NOT NULL,
  fecha_finalizacion DATE COMMENT 'Si el docente dejó de dictar el curso antes de tiempo',
  carga_horaria_semanal TINYINT UNSIGNED COMMENT 'Horas por semana',
  estado ENUM('ACTIVA', 'FINALIZADA', 'CANCELADA') DEFAULT 'ACTIVA',
  observaciones TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (docente_id) REFERENCES docentes(id) ON DELETE RESTRICT,
  FOREIGN KEY (curso_id) REFERENCES cursos(id) ON DELETE RESTRICT,
  FOREIGN KEY (gestion_id) REFERENCES gestiones(id) ON DELETE RESTRICT,
  UNIQUE KEY UQ_asignacion_docente_curso (docente_id, curso_id, gestion_id),
  INDEX IDX_asignacion_docente (docente_id),
  INDEX IDX_asignacion_gestion (gestion_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

### 5.10 turnos_cursos

**Descripción:** Asignación de turnos a cursos (qué días y horarios tiene cada curso).

```sql
CREATE TABLE turnos_cursos (
  id INT PRIMARY KEY AUTO_INCREMENT,
  curso_id INT NOT NULL,
  turno_horario_id INT NOT NULL,
  dias_semana VARCHAR(50) NOT NULL COMMENT 'Días de clase: LUN,MIE,VIE o MAR,JUE',
  aula VARCHAR(50) COMMENT 'Aula asignada',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (curso_id) REFERENCES cursos(id) ON DELETE CASCADE,
  FOREIGN KEY (turno_horario_id) REFERENCES turnos_horarios(id) ON DELETE RESTRICT,
  UNIQUE KEY UQ_turno_curso (curso_id, turno_horario_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

## 6. GESTIÓN DE ESTUDIANTES (5 TABLAS)

### 6.1 estudiantes

**Descripción:** Tabla principal de estudiantes.

```sql
CREATE TABLE estudiantes (
  id INT PRIMARY KEY AUTO_INCREMENT,
  usuario_id INT UNIQUE COMMENT 'Referencia a tabla usuarios (si tiene acceso al sistema)',
  codigo_estudiante VARCHAR(20) NOT NULL UNIQUE COMMENT 'Código único: EST-YYYY-NNNN',
  
  -- Datos personales
  nombres VARCHAR(100) NOT NULL,
  apellido_paterno VARCHAR(100) NOT NULL,
  apellido_materno VARCHAR(100),
  ci VARCHAR(20) NOT NULL,
  expedicion VARCHAR(5) NOT NULL COMMENT 'SC, LP, CB, etc.',
  complemento VARCHAR(5) COMMENT 'Complemento del CI',
  fecha_nacimiento DATE NOT NULL,
  lugar_nacimiento VARCHAR(150),
  genero ENUM('M', 'F', 'OTRO') NOT NULL,
  estado_civil_id INT,
  tipo_sangre_id INT,
  idioma_id INT,
  tipo_discapacidad_id INT COMMENT 'NULL si no tiene discapacidad',
  
  -- Datos de contacto
  telefono_casa VARCHAR(20),
  celular VARCHAR(20),
  email VARCHAR(150),
  localidad_id INT COMMENT 'Zona/Barrio donde vive',
  direccion_calle VARCHAR(150),
  direccion_numero VARCHAR(20),
  direccion_referencia TEXT,
  
  -- Contacto de emergencia
  emergencia_nombre VARCHAR(200),
  emergencia_parentesco VARCHAR(50),
  emergencia_telefono VARCHAR(20),
  
  -- Datos académicos
  carrera_id INT NOT NULL,
  turno_preferencia ENUM('MAÑANA', 'TARDE', 'NOCHE'),
  colegio_procedencia VARCHAR(200) COMMENT 'Unidad Educativa de procedencia',
  anio_egreso_secundaria SMALLINT UNSIGNED,
  gestion_ingreso_id INT NOT NULL COMMENT 'Gestión en que ingresó al instituto',
  estado_academico ENUM('REGULAR', 'NIVELACION', 'RETIRADO', 'EGRESADO', 'ABANDONO') DEFAULT 'REGULAR',
  fecha_cambio_estado DATE COMMENT 'Fecha del último cambio de estado',
  motivo_cambio_estado TEXT,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL COMMENT 'Soft delete',
  
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL,
  FOREIGN KEY (carrera_id) REFERENCES carreras(id) ON DELETE RESTRICT,
  FOREIGN KEY (gestion_ingreso_id) REFERENCES gestiones(id) ON DELETE RESTRICT,
  FOREIGN KEY (estado_civil_id) REFERENCES estados_civiles(id) ON DELETE SET NULL,
  FOREIGN KEY (tipo_sangre_id) REFERENCES tipos_sangre(id) ON DELETE SET NULL,
  FOREIGN KEY (idioma_id) REFERENCES idiomas(id) ON DELETE SET NULL,
  FOREIGN KEY (tipo_discapacidad_id) REFERENCES tipos_discapacidad(id) ON DELETE SET NULL,
  FOREIGN KEY (localidad_id) REFERENCES localidades(id) ON DELETE SET NULL,
  
  UNIQUE KEY UQ_estudiante_ci (ci, expedicion),
  INDEX IDX_estudiante_apellidos (apellido_paterno, apellido_materno),
  INDEX IDX_estudiante_carrera (carrera_id),
  INDEX IDX_estudiante_estado (estado_academico),
  INDEX IDX_estudiante_codigo (codigo_estudiante)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

### 6.2 estudiantes_becas

**Descripción:** Becas asignadas a estudiantes (histórico y activas).

```sql
CREATE TABLE estudiantes_becas (
  id INT PRIMARY KEY AUTO_INCREMENT,
  estudiante_id INT NOT NULL,
  beca_descuento_id INT NOT NULL,
  gestion_id INT COMMENT 'Gestión en que aplica (NULL = permanente)',
  motivo TEXT NOT NULL COMMENT 'Motivo de la beca',
  fecha_inicio DATE NOT NULL,
  fecha_fin DATE COMMENT 'Fecha de fin (NULL = indefinida)',
  estado ENUM('ACTIVA', 'SUSPENDIDA', 'REVOCADA', 'FINALIZADA') DEFAULT 'ACTIVA',
  documentos_respaldo TEXT COMMENT 'Descripción o URLs de documentos',
  aprobado_por INT COMMENT 'Usuario que aprobó la beca',
  fecha_aprobacion DATE,
  observaciones TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (estudiante_id) REFERENCES estudiantes(id) ON DELETE CASCADE,
  FOREIGN KEY (beca_descuento_id) REFERENCES becas_descuentos(id) ON DELETE RESTRICT,
  FOREIGN KEY (gestion_id) REFERENCES gestiones(id) ON DELETE SET NULL,
  FOREIGN KEY (aprobado_por) REFERENCES usuarios(id) ON DELETE SET NULL,
  INDEX IDX_beca_estudiante (estudiante_id),
  INDEX IDX_beca_estado (estado)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

### 6.3 documentos_estudiante

**Descripción:** Documentos digitales adjuntos del estudiante.

```sql
CREATE TABLE documentos_estudiante (
  id INT PRIMARY KEY AUTO_INCREMENT,
  estudiante_id INT NOT NULL,
  tipo_documento ENUM('CI_FRENTE', 'CI_REVERSO', 'CERTIFICADO_NACIMIENTO', 'DIPLOMA_BACHILLER', 'FOTO_4X4', 'CERTIFICADO_MEDICO', 'OTRO') NOT NULL,
  nombre_archivo VARCHAR(255) NOT NULL,
  url_archivo VARCHAR(500) NOT NULL COMMENT 'Ruta o URL del archivo',
  tipo_mime VARCHAR(100),
  tamano_bytes INT UNSIGNED,
  descripcion TEXT,
  subido_por INT,
  fecha_subida TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL COMMENT 'Soft delete',
  FOREIGN KEY (estudiante_id) REFERENCES estudiantes(id) ON DELETE CASCADE,
  FOREIGN KEY (subido_por) REFERENCES usuarios(id) ON DELETE SET NULL,
  INDEX IDX_documento_estudiante (estudiante_id),
  INDEX IDX_documento_tipo (tipo_documento)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

### 6.4 estados_especiales_estudiante

**Descripción:** Registro de cambios de estado académico del estudiante (auditoría).

```sql
CREATE TABLE estados_especiales_estudiante (
  id INT PRIMARY KEY AUTO_INCREMENT,
  estudiante_id INT NOT NULL,
  estado_anterior ENUM('REGULAR', 'NIVELACION', 'RETIRADO', 'EGRESADO', 'ABANDONO'),
  estado_nuevo ENUM('REGULAR', 'NIVELACION', 'RETIRADO', 'EGRESADO', 'ABANDONO') NOT NULL,
  motivo TEXT NOT NULL,
  observaciones TEXT,
  fecha_cambio DATE NOT NULL,
  cambiado_por INT NOT NULL COMMENT 'Usuario que realizó el cambio',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (estudiante_id) REFERENCES estudiantes(id) ON DELETE CASCADE,
  FOREIGN KEY (cambiado_por) REFERENCES usuarios(id) ON DELETE RESTRICT,
  INDEX IDX_estado_estudiante (estudiante_id),
  INDEX IDX_estado_fecha (fecha_cambio)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

### 6.5 licencias_solicitudes

**Descripción:** Solicitudes de licencia estudiantil (ausencias justificadas).

```sql
CREATE TABLE licencias_solicitudes (
  id INT PRIMARY KEY AUTO_INCREMENT,
  estudiante_id INT NOT NULL,
  tipo_licencia ENUM('ENFERMEDAD', 'TRABAJO', 'FAMILIAR', 'OTRO') NOT NULL,
  motivo TEXT NOT NULL,
  fecha_inicio DATE NOT NULL,
  fecha_fin DATE NOT NULL,
  dias_totales TINYINT UNSIGNED GENERATED ALWAYS AS (DATEDIFF(fecha_fin, fecha_inicio) + 1) STORED,
  estado ENUM('PENDIENTE', 'APROBADA', 'RECHAZADA', 'VENCIDA') DEFAULT 'PENDIENTE',
  revisado_por INT COMMENT 'Director Académico que revisó',
  fecha_revision DATE,
  motivo_rechazo TEXT,
  observaciones TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (estudiante_id) REFERENCES estudiantes(id) ON DELETE CASCADE,
  FOREIGN KEY (revisado_por) REFERENCES usuarios(id) ON DELETE SET NULL,
  INDEX IDX_licencia_estudiante (estudiante_id),
  INDEX IDX_licencia_estado (estado),
  CHECK (fecha_fin >= fecha_inicio)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Tabla Relacionada: licencias_documentos**
```sql
CREATE TABLE licencias_documentos (
  id INT PRIMARY KEY AUTO_INCREMENT,
  licencia_id INT NOT NULL,
  nombre_archivo VARCHAR(255) NOT NULL,
  url_archivo VARCHAR(500) NOT NULL,
  tipo_mime VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (licencia_id) REFERENCES licencias_solicitudes(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

## 7. INSCRIPCIONES Y CALIFICACIONES (3 TABLAS)

### 7.1 inscripciones

**Descripción:** Inscripción de estudiantes a gestiones académicas.

```sql
CREATE TABLE inscripciones (
  id INT PRIMARY KEY AUTO_INCREMENT,
  estudiante_id INT NOT NULL,
  gestion_id INT NOT NULL,
  carrera_id INT NOT NULL,
  periodo_id INT NOT NULL COMMENT 'Periodo que cursa (1º, 2º, 3º, 4º)',
  turno ENUM('MAÑANA', 'TARDE', 'NOCHE') NOT NULL,
  fecha_inscripcion DATE NOT NULL,
  
  -- Aranceles
  arancel_base DECIMAL(10,2) NOT NULL,
  descuento_porcentaje DECIMAL(5,2) DEFAULT 0.00,
  descuento_monto DECIMAL(10,2) DEFAULT 0.00,
  arancel_neto DECIMAL(10,2) NOT NULL,
  
  estado ENUM('ACTIVA', 'ANULADA', 'FINALIZADA') DEFAULT 'ACTIVA',
  motivo_anulacion TEXT,
  fecha_anulacion DATE,
  anulada_por INT,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (estudiante_id) REFERENCES estudiantes(id) ON DELETE RESTRICT,
  FOREIGN KEY (gestion_id) REFERENCES gestiones(id) ON DELETE RESTRICT,
  FOREIGN KEY (carrera_id) REFERENCES carreras(id) ON DELETE RESTRICT,
  FOREIGN KEY (periodo_id) REFERENCES periodos(id) ON DELETE RESTRICT,
  FOREIGN KEY (anulada_por) REFERENCES usuarios(id) ON DELETE SET NULL,
  
  UNIQUE KEY UQ_inscripcion_estudiante_gestion (estudiante_id, gestion_id),
  INDEX IDX_inscripcion_gestion (gestion_id),
  INDEX IDX_inscripcion_estado (estado)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

### 7.2 inscripciones_materias

**Descripción:** Inscripción de estudiantes a materias específicas + calificaciones.

**⭐ ESTRUCTURA REAL DE CALIFICACIONES INCOS:**

```sql
CREATE TABLE inscripciones_materias (
  id INT PRIMARY KEY AUTO_INCREMENT,
  inscripcion_id INT NOT NULL COMMENT 'Inscripción a la gestión',
  materia_id INT NOT NULL,
  curso_id INT NOT NULL,
  docente_id INT NOT NULL,
  
  -- CALIFICACIONES (Sistema INCOS Real)
  nota_1er_parcial DECIMAL(5,2) COMMENT 'Primera nota parcial (0-100)',
  nota_2do_parcial DECIMAL(5,2) COMMENT 'Segunda nota parcial (0-100)',
  suma_parciales DECIMAL(6,2) GENERATED ALWAYS AS (COALESCE(nota_1er_parcial, 0) + COALESCE(nota_2do_parcial, 0)) STORED,
  nota_3er_parcial DECIMAL(5,2) COMMENT 'Tercera nota parcial (0-100)',
  nota_practico DECIMAL(5,2) COMMENT 'Nota de práctico (0-100)',
  suma_total DECIMAL(6,2) GENERATED ALWAYS AS (COALESCE(suma_parciales, 0) + COALESCE(nota_3er_parcial, 0) + COALESCE(nota_practico, 0)) STORED,
  nota_final DECIMAL(5,2) GENERATED ALWAYS AS (COALESCE(suma_total, 0) / 4) STORED,
  nota_recuperatorio DECIMAL(5,2) COMMENT 'Nota de recuperatorio (0-100)',
  
  -- Estado
  estado ENUM('CURSANDO', 'APROBADO', 'REPROBADO', 'NIVELACION', 'ANULADA') DEFAULT 'CURSANDO',
  fecha_ultima_modificacion_notas TIMESTAMP NULL,
  modificado_por INT COMMENT 'Usuario que modificó las notas',
  motivo_modificacion TEXT COMMENT 'Motivo de modificación de notas (si aplica)',
  
  -- Control de asistencia
  asistencias INT UNSIGNED DEFAULT 0,
  faltas INT UNSIGNED DEFAULT 0,
  porcentaje_asistencia DECIMAL(5,2) GENERATED ALWAYS AS (
    CASE 
      WHEN (asistencias + faltas) > 0 THEN (asistencias * 100.0) / (asistencias + faltas)
      ELSE 0
    END
  ) STORED,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (inscripcion_id) REFERENCES inscripciones(id) ON DELETE CASCADE,
  FOREIGN KEY (materia_id) REFERENCES materias(id) ON DELETE RESTRICT,
  FOREIGN KEY (curso_id) REFERENCES cursos(id) ON DELETE RESTRICT,
  FOREIGN KEY (docente_id) REFERENCES docentes(id) ON DELETE RESTRICT,
  FOREIGN KEY (modificado_por) REFERENCES usuarios(id) ON DELETE SET NULL,
  
  UNIQUE KEY UQ_inscripcion_materia (inscripcion_id, materia_id),
  INDEX IDX_inscripcion_materia_curso (curso_id),
  INDEX IDX_inscripcion_materia_docente (docente_id),
  INDEX IDX_inscripcion_materia_estado (estado),
  
  CHECK (nota_1er_parcial IS NULL OR (nota_1er_parcial >= 0 AND nota_1er_parcial <= 100)),
  CHECK (nota_2do_parcial IS NULL OR (nota_2do_parcial >= 0 AND nota_2do_parcial <= 100)),
  CHECK (nota_3er_parcial IS NULL OR (nota_3er_parcial >= 0 AND nota_3er_parcial <= 100)),
  CHECK (nota_practico IS NULL OR (nota_practico >= 0 AND nota_practico <= 100)),
  CHECK (nota_recuperatorio IS NULL OR (nota_recuperatorio >= 0 AND nota_recuperatorio <= 100))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Lógica de Cálculo (explicada):**
```
suma_parciales = nota_1er_parcial + nota_2do_parcial
suma_total = suma_parciales + nota_3er_parcial + nota_practico
nota_final = suma_total / 4

Aprobación:
  IF nota_final >= 60 THEN estado = 'APROBADO'
  ELSE IF nota_recuperatorio >= 60 THEN estado = 'APROBADO', nota_final = 60
  ELSE estado = 'REPROBADO' → pasa a NIVELACION
```

---

### 7.3 historial_nivelaciones

**Descripción:** Registro de materias en nivelación.

```sql
CREATE TABLE historial_nivelaciones (
  id INT PRIMARY KEY AUTO_INCREMENT,
  estudiante_id INT NOT NULL,
  inscripcion_materia_id INT NOT NULL COMMENT 'Materia reprobada',
  fecha_inicio DATE NOT NULL,
  intentos_realizados TINYINT UNSIGNED DEFAULT 1,
  estado ENUM('PENDIENTE', 'CURSANDO', 'APROBADO', 'ABANDONO') DEFAULT 'PENDIENTE',
  observaciones TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (estudiante_id) REFERENCES estudiantes(id) ON DELETE CASCADE,
  FOREIGN KEY (inscripcion_materia_id) REFERENCES inscripciones_materias(id) ON DELETE CASCADE,
  INDEX IDX_nivelacion_estudiante (estudiante_id),
  INDEX IDX_nivelacion_estado (estado)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

## 8. PASANTÍAS (3 TABLAS)

### 8.1 pasantias_empresas

**Descripción:** Empresas colaboradoras para pasantías.

```sql
CREATE TABLE pasantias_empresas (
  id INT PRIMARY KEY AUTO_INCREMENT,
  razon_social VARCHAR(200) NOT NULL,
  nit VARCHAR(20) UNIQUE,
  rubro VARCHAR(100) COMMENT 'Sector/industria',
  direccion TEXT,
  telefono VARCHAR(20),
  email VARCHAR(150),
  persona_contacto VARCHAR(200),
  cargo_contacto VARCHAR(100),
  telefono_contacto VARCHAR(20),
  email_contacto VARCHAR(150),
  estado ENUM('ACTIVA', 'INACTIVA', 'SUSPENDIDA') DEFAULT 'ACTIVA',
  observaciones TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX IDX_empresa_estado (estado)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

### 8.2 pasantias_asignaciones

**Descripción:** Asignación de estudiantes a pasantías.

```sql
CREATE TABLE pasantias_asignaciones (
  id INT PRIMARY KEY AUTO_INCREMENT,
  estudiante_id INT NOT NULL,
  empresa_id INT NOT NULL,
  docente_supervisor_id INT NOT NULL COMMENT 'Docente que supervisa la pasantía',
  puesto_area VARCHAR(200) NOT NULL COMMENT 'Puesto o área donde realiza la pasantía',
  fecha_inicio DATE NOT NULL,
  fecha_fin DATE NOT NULL,
  horas_totales_requeridas INT UNSIGNED DEFAULT 240 COMMENT 'Horas mínimas requeridas',
  horas_cumplidas INT UNSIGNED DEFAULT 0,
  estado ENUM('PROGRAMADA', 'EN_CURSO', 'FINALIZADA', 'CANCELADA') DEFAULT 'PROGRAMADA',
  motivo_cancelacion TEXT,
  observaciones TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (estudiante_id) REFERENCES estudiantes(id) ON DELETE RESTRICT,
  FOREIGN KEY (empresa_id) REFERENCES pasantias_empresas(id) ON DELETE RESTRICT,
  FOREIGN KEY (docente_supervisor_id) REFERENCES docentes(id) ON DELETE RESTRICT,
  INDEX IDX_pasantia_estudiante (estudiante_id),
  INDEX IDX_pasantia_empresa (empresa_id),
  INDEX IDX_pasantia_estado (estado),
  CHECK (fecha_fin >= fecha_inicio)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

### 8.3 pasantias_evaluaciones

**Descripción:** Evaluación de desempeño en pasantía.

```sql
CREATE TABLE pasantias_evaluaciones (
  id INT PRIMARY KEY AUTO_INCREMENT,
  pasantia_asignacion_id INT NOT NULL,
  descripcion_trabajo TEXT NOT NULL COMMENT 'Descripción del trabajo realizado',
  principales_actividades TEXT NOT NULL,
  nivel_desempeno ENUM('ALTO', 'MEDIO', 'BAJO') NOT NULL,
  fortalezas TEXT,
  areas_mejora TEXT,
  sugerencias TEXT,
  firma_docente TEXT COMMENT 'Firma digital o referencia de firma',
  firma_empresa TEXT COMMENT 'Firma digital o referencia de firma',
  fecha_evaluacion DATE NOT NULL,
  evaluado_por INT COMMENT 'Usuario que registró la evaluación',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (pasantia_asignacion_id) REFERENCES pasantias_asignaciones(id) ON DELETE CASCADE,
  FOREIGN KEY (evaluado_por) REFERENCES usuarios(id) ON DELETE SET NULL,
  UNIQUE KEY UQ_evaluacion_pasantia (pasantia_asignacion_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

## 9. SUPERVISIÓN DOCENTE (2 TABLAS)

### 9.1 supervisiones_programadas

**Descripción:** Programación de supervisiones docentes.

```sql
CREATE TABLE supervisiones_programadas (
  id INT PRIMARY KEY AUTO_INCREMENT,
  docente_id INT NOT NULL COMMENT 'Docente a supervisar',
  materia_id INT NOT NULL,
  curso_id INT NOT NULL,
  supervisor_id INT NOT NULL COMMENT 'Usuario que supervisa (Director Académico o Supervisor)',
  fecha_programada DATE NOT NULL,
  hora_programada TIME NOT NULL,
  estado ENUM('PROGRAMADA', 'REALIZADA', 'CANCELADA', 'REPROGRAMADA') DEFAULT 'PROGRAMADA',
  motivo_cancelacion TEXT,
  observaciones TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (docente_id) REFERENCES docentes(id) ON DELETE CASCADE,
  FOREIGN KEY (materia_id) REFERENCES materias(id) ON DELETE RESTRICT,
  FOREIGN KEY (curso_id) REFERENCES cursos(id) ON DELETE RESTRICT,
  FOREIGN KEY (supervisor_id) REFERENCES usuarios(id) ON DELETE RESTRICT,
  INDEX IDX_supervision_docente (docente_id),
  INDEX IDX_supervision_fecha (fecha_programada)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

### 9.2 fichas_supervision

**Descripción:** Ficha de observación de clase (evaluación del desempeño docente).

```sql
CREATE TABLE fichas_supervision (
  id INT PRIMARY KEY AUTO_INCREMENT,
  supervision_id INT NOT NULL,
  
  -- 1. Control de Asistencia
  control_asistencia BOOLEAN,
  metodo_control ENUM('LISTA_MANUAL', 'EXCEL', 'GOOGLE_MEET', 'OTRO'),
  metodo_control_otro VARCHAR(100),
  
  -- 2. Presentación del Tema
  presentacion_tema ENUM('EXCELENTE', 'BUENO', 'REGULAR', 'DEFICIENTE'),
  presentacion_observaciones TEXT,
  
  -- 3. Recursos Didácticos
  recursos_utilizados VARCHAR(200) COMMENT 'PowerPoint,PDF,Excel,Word,Tablet,Pizarra',
  recursos_evaluacion ENUM('EXCELENTE', 'BUENO', 'REGULAR', 'DEFICIENTE'),
  recursos_observaciones TEXT,
  
  -- 4. Exposición Docente
  exposicion_evaluacion ENUM('EXCELENTE', 'BUENO', 'REGULAR', 'DEFICIENTE'),
  exposicion_observaciones TEXT,
  
  -- 5. Participación de Estudiantes
  participacion_evaluacion ENUM('EXCELENTE', 'BUENO', 'REGULAR', 'DEFICIENTE'),
  participacion_observaciones TEXT,
  
  -- 6. Actividades Prácticas
  actividades_practicas ENUM('EXCELENTE', 'BUENO', 'REGULAR', 'DEFICIENTE'),
  actividades_observaciones TEXT,
  
  -- 7. Evaluación
  tipo_evaluacion ENUM('PROCESO', 'RESULTADO', 'AMBAS'),
  evaluacion_calificacion ENUM('EXCELENTE', 'BUENO', 'REGULAR', 'DEFICIENTE'),
  evaluacion_observaciones TEXT,
  
  -- Observaciones Generales
  observaciones_generales TEXT,
  fortalezas TEXT,
  aspectos_mejorar TEXT,
  recomendaciones TEXT,
  
  -- Firmas (digitales o referencias)
  firma_supervisor TEXT,
  firma_docente TEXT COMMENT 'Firma del docente en señal de conocimiento',
  fecha_supervision DATE NOT NULL,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (supervision_id) REFERENCES supervisiones_programadas(id) ON DELETE CASCADE,
  UNIQUE KEY UQ_ficha_supervision (supervision_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

## 10. HISTORIAL ACADÉMICO OFICIAL (2 TABLAS)

### 10.1 libros_registro

**Descripción:** Libros de registro oficial (Libro 12, Libro 13, etc.).

```sql
CREATE TABLE libros_registro (
  id INT PRIMARY KEY AUTO_INCREMENT,
  numero_libro INT UNSIGNED NOT NULL UNIQUE COMMENT 'Número secuencial de libro',
  gestion_id INT NOT NULL,
  fecha_apertura DATE NOT NULL,
  fecha_cierre DATE COMMENT 'Cuando se cierra el libro',
  folios_totales INT UNSIGNED COMMENT 'Cantidad de folios utilizados',
  estado ENUM('ABIERTO', 'CERRADO') DEFAULT 'ABIERTO',
  observaciones TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (gestion_id) REFERENCES gestiones(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

### 10.2 folios_estudiantes

**Descripción:** Registro de estudiantes en libros/folios (Historial Académico Oficial).

```sql
CREATE TABLE folios_estudiantes (
  id INT PRIMARY KEY AUTO_INCREMENT,
  libro_id INT NOT NULL,
  numero_folio INT UNSIGNED NOT NULL COMMENT 'Número de folio dentro del libro',
  estudiante_id INT NOT NULL,
  gestion_id INT NOT NULL,
  periodo_anio TINYINT UNSIGNED NOT NULL COMMENT '1=1º Año, 2=2º Año, etc.',
  
  -- Datos del historial
  carga_horaria_total INT UNSIGNED COMMENT 'Suma de horas de todas las materias',
  promedio_general DECIMAL(5,2) COMMENT 'Promedio de todas las materias',
  materias_aprobadas INT UNSIGNED,
  materias_totales INT UNSIGNED,
  
  -- Generación del documento
  hash_documento VARCHAR(64) COMMENT 'SHA256 del PDF generado para validación',
  url_pdf VARCHAR(500) COMMENT 'URL del PDF generado',
  fecha_generacion TIMESTAMP,
  generado_por INT,
  
  estado ENUM('EN_CURSO', 'EGRESADO', 'ABANDONO', 'RETIRADO') DEFAULT 'EN_CURSO',
  fecha_egreso DATE COMMENT 'Fecha de egreso (si aplica)',
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (libro_id) REFERENCES libros_registro(id) ON DELETE RESTRICT,
  FOREIGN KEY (estudiante_id) REFERENCES estudiantes(id) ON DELETE RESTRICT,
  FOREIGN KEY (gestion_id) REFERENCES gestiones(id) ON DELETE RESTRICT,
  FOREIGN KEY (generado_por) REFERENCES usuarios(id) ON DELETE SET NULL,
  
  UNIQUE KEY UQ_folio_libro (libro_id, numero_folio),
  INDEX IDX_folio_estudiante (estudiante_id),
  INDEX IDX_folio_hash (hash_documento)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Formato de Referencia en Historial:**
```
"1º AÑO – LIBRO 12, FOLIO 58"
"2º AÑO – LIBRO 13, FOLIO 68"
```

---

## 11. PAGOS (2 TABLAS)

### 11.1 pagos_aranceles

**Descripción:** Registro de pagos de aranceles.

```sql
CREATE TABLE pagos_aranceles (
  id INT PRIMARY KEY AUTO_INCREMENT,
  inscripcion_id INT NOT NULL,
  estudiante_id INT NOT NULL,
  monto DECIMAL(10,2) NOT NULL,
  metodo_pago ENUM('EFECTIVO', 'TRANSFERENCIA', 'CHEQUE', 'TARJETA', 'OTRO') NOT NULL,
  numero_comprobante VARCHAR(50) COMMENT 'Número de recibo o transacción',
  numero_transaccion VARCHAR(100) COMMENT 'Número de transacción bancaria (si aplica)',
  fecha_pago DATE NOT NULL,
  registrado_por INT NOT NULL COMMENT 'Usuario que registró el pago',
  observaciones TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (inscripcion_id) REFERENCES inscripciones(id) ON DELETE RESTRICT,
  FOREIGN KEY (estudiante_id) REFERENCES estudiantes(id) ON DELETE RESTRICT,
  FOREIGN KEY (registrado_por) REFERENCES usuarios(id) ON DELETE RESTRICT,
  INDEX IDX_pago_inscripcion (inscripcion_id),
  INDEX IDX_pago_estudiante (estudiante_id),
  INDEX IDX_pago_fecha (fecha_pago)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

### 11.2 detalle_pagos

**Descripción:** Detalle de conceptos incluidos en cada pago.

```sql
CREATE TABLE detalle_pagos (
  id INT PRIMARY KEY AUTO_INCREMENT,
  pago_id INT NOT NULL,
  concepto VARCHAR(200) NOT NULL COMMENT 'Ej: Arancel 1º Semestre, Inscripción',
  monto DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (pago_id) REFERENCES pagos_aranceles(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

## 12. SISTEMA Y AUDITORÍA (6 TABLAS)

### 12.1 usuarios

**Descripción:** Usuarios del sistema.

```sql
CREATE TABLE usuarios (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL COMMENT 'Hash bcrypt',
  rol_id INT NOT NULL,
  
  -- Datos personales básicos
  nombres VARCHAR(100),
  apellidos VARCHAR(100),
  
  -- Control de sesión
  ultimo_login TIMESTAMP NULL,
  intentos_fallidos TINYINT UNSIGNED DEFAULT 0,
  bloqueado_hasta TIMESTAMP NULL,
  
  estado ENUM('ACTIVO', 'INACTIVO', 'BLOQUEADO') DEFAULT 'ACTIVO',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL COMMENT 'Soft delete',
  
  FOREIGN KEY (rol_id) REFERENCES roles(id) ON DELETE RESTRICT,
  INDEX IDX_usuario_estado (estado),
  INDEX IDX_usuario_rol (rol_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

### 12.2 roles_permisos

**Descripción:** Tabla pivote que relaciona roles con permisos.

```sql
CREATE TABLE roles_permisos (
  id INT PRIMARY KEY AUTO_INCREMENT,
  rol_id INT NOT NULL,
  permiso_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (rol_id) REFERENCES roles(id) ON DELETE CASCADE,
  FOREIGN KEY (permiso_id) REFERENCES permisos(id) ON DELETE CASCADE,
  UNIQUE KEY UQ_rol_permiso (rol_id, permiso_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

### 12.3 auditoria

**Descripción:** Registro de auditoría de operaciones críticas.

```sql
CREATE TABLE auditoria (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  usuario_id INT COMMENT 'Usuario que realizó la acción',
  accion ENUM('CREATE', 'READ', 'UPDATE', 'DELETE') NOT NULL,
  tabla VARCHAR(100) NOT NULL COMMENT 'Tabla afectada',
  registro_id INT COMMENT 'ID del registro afectado',
  valores_anteriores JSON COMMENT 'Valores anteriores (JSON)',
  valores_nuevos JSON COMMENT 'Valores nuevos (JSON)',
  ip_cliente VARCHAR(45) COMMENT 'IP del cliente (IPv4 o IPv6)',
  user_agent TEXT COMMENT 'User agent del navegador',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL,
  INDEX IDX_auditoria_usuario (usuario_id),
  INDEX IDX_auditoria_tabla (tabla),
  INDEX IDX_auditoria_fecha (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

### 12.4 sincronizacion_logs

**Descripción:** Logs de sincronización (si se implementa sincronización con sistemas externos).

```sql
CREATE TABLE sincronizacion_logs (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  tipo_sincronizacion VARCHAR(100) NOT NULL COMMENT 'Ej: ESTUDIANTES, CALIFICACIONES',
  estado ENUM('EN_PROGRESO', 'EXITOSA', 'FALLIDA') NOT NULL,
  registros_procesados INT UNSIGNED DEFAULT 0,
  registros_exitosos INT UNSIGNED DEFAULT 0,
  registros_fallidos INT UNSIGNED DEFAULT 0,
  mensaje_error TEXT,
  fecha_inicio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_fin TIMESTAMP NULL,
  INDEX IDX_sync_tipo (tipo_sincronizacion),
  INDEX IDX_sync_estado (estado),
  INDEX IDX_sync_fecha (fecha_inicio)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

### 12.5 configuracion_sistema

**Descripción:** Configuraciones globales del sistema.

```sql
CREATE TABLE configuracion_sistema (
  id INT PRIMARY KEY AUTO_INCREMENT,
  clave VARCHAR(100) NOT NULL UNIQUE COMMENT 'Clave de configuración',
  valor TEXT NOT NULL COMMENT 'Valor de configuración',
  tipo_dato ENUM('STRING', 'INTEGER', 'BOOLEAN', 'JSON') DEFAULT 'STRING',
  descripcion TEXT,
  modificado_por INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (modificado_por) REFERENCES usuarios(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Ejemplos de Configuraciones:**
```sql
INSERT INTO configuracion_sistema (clave, valor, tipo_dato, descripcion) VALUES
('NOMBRE_INSTITUTO', 'Instituto INCOS Santa Cruz', 'STRING', 'Nombre oficial del instituto'),
('NOTA_MINIMA_APROBACION', '60', 'INTEGER', 'Nota mínima para aprobar (sobre 100)'),
('ASISTENCIA_MINIMA_PORCENTAJE', '75', 'INTEGER', 'Porcentaje mínimo de asistencia requerido'),
('CUPO_MAXIMO_DEFECTO', '35', 'INTEGER', 'Cupo máximo por defecto para cursos'),
('EMAIL_NOTIFICACIONES', 'sistema@incos.edu.bo', 'STRING', 'Email para notificaciones del sistema'),
('LOGO_INSTITUTO_URL', '/assets/logo-incos.png', 'STRING', 'URL del logo del instituto');
```

---

### 12.6 parametros_generales

**Descripción:** Parámetros académicos generales (aranceles, fechas importantes).

```sql
CREATE TABLE parametros_generales (
  id INT PRIMARY KEY AUTO_INCREMENT,
  gestion_id INT NOT NULL,
  carrera_id INT,
  periodo_id INT,
  
  -- Aranceles
  arancel_inscripcion DECIMAL(10,2) COMMENT 'Arancel de inscripción',
  arancel_mensualidad DECIMAL(10,2) COMMENT 'Arancel mensual',
  
  -- Fechas importantes
  fecha_inicio_inscripciones DATE,
  fecha_fin_inscripciones DATE,
  fecha_inicio_clases DATE,
  fecha_fin_clases DATE,
  
  -- Otros parámetros
  parametros_json JSON COMMENT 'Otros parámetros en formato JSON',
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (gestion_id) REFERENCES gestiones(id) ON DELETE CASCADE,
  FOREIGN KEY (carrera_id) REFERENCES carreras(id) ON DELETE CASCADE,
  FOREIGN KEY (periodo_id) REFERENCES periodos(id) ON DELETE CASCADE,
  
  UNIQUE KEY UQ_parametros_gestion_carrera_periodo (gestion_id, carrera_id, periodo_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

## RESUMEN DEL MODELO

### Distribución de Tablas por Categoría

| Categoría | Cantidad de Tablas |
|-----------|-------------------|
| Catálogos Geográficos | 6 |
| Catálogos de Referencia | 8 |
| Estructura Académica | 10 |
| Gestión de Estudiantes | 5 (+1 licencias_documentos) |
| Inscripciones y Calificaciones | 3 |
| Pasantías | 3 |
| Supervisión Docente | 2 |
| Historial Oficial | 2 |
| Pagos | 2 |
| Sistema y Auditoría | 6 |
| **TOTAL** | **58 tablas** |

### Relaciones Principales

**Total de Foreign Keys:** ~80+ relaciones

**Claves Primarias:** Todas las tablas usan `id INT AUTO_INCREMENT`

**Índices:** ~120+ índices (PRIMARY, FOREIGN, UNIQUE, INDEX)

### Tamaño Estimado

**Año 1:** ~500 MB
**Año 3:** ~1.5 GB
**Año 5:** ~3 GB

---

## CONTROL DE VERSIONES

| Versión | Fecha | Autor | Descripción de Cambios |
|---------|-------|-------|------------------------|
| 1.0 | 2025-12-08 | Equipo de Desarrollo | Versión inicial consolidada - 58 tablas documentadas |

---

## REFERENCIAS

- instituto_schema.sql: Schema base (40+ tablas)
- instituto_schema_ajustes_v2.sql: Becas, documentos, nivelaciones
- instituto_schema_v3_modulos_operativos.sql: Pasantías, supervisión, libros/folios
- OtraDocumentacion_INCOS.pdf: Formularios operativos reales

---

**FIN DEL DOCUMENTO - 05 MODELO DE DATOS**
