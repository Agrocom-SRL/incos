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

**Total de Tablas:** 40+ tablas organizadas en 10 categorías

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

## 3. CATÁLOGOS GEOGRÁFICOS

### 3.1 paises
**Descripción:** Catálogo de países (principalmente Bolivia).

**Campos Principales:**
- `nombre`, `codigo_iso2`, `codigo_iso3`, `codigo_numerico`
- Campos de auditoría estándar

**Relaciones:**
- Un país tiene muchos departamentos

---

### 3.2 departamentos
**Descripción:** Departamentos de Bolivia (9 departamentos: Santa Cruz, La Paz, Cochabamba, etc.).

**Campos Principales:**
- `pais_id` (FK), `nombre`, `codigo`

**Relaciones:**
- Pertenece a un país
- Tiene muchas provincias

---

### 3.3 provincias
**Descripción:** Provincias dentro de cada departamento.

**Campos Principales:**
- `departamento_id` (FK), `nombre`

**Relaciones:**
- Pertenece a un departamento
- Tiene muchos municipios

---

### 3.4 municipios
**Descripción:** Municipios dentro de cada provincia. Nivel geográfico más utilizado para registro de estudiantes.

**Campos Principales:**
- `provincia_id` (FK), `nombre`

**Relaciones:**
- Pertenece a una provincia
- Puede tener comunidades

---

## 4. CATÁLOGOS DE REFERENCIA

### 4.1 idiomas
**Descripción:** Idiomas hablados (Español, Quechua, Aymara, Guaraní, Inglés, etc.).

**Campos Principales:**
- `nombre`, `codigo_iso`

**Relaciones:**
- Referenciado por estudiantes (idioma natal)

---

### 4.2 estados_civiles
**Descripción:** Estados civiles (Soltero(a), Casado(a), Divorciado(a), Viudo(a), Conviviente).

**Campos Principales:**
- `nombre`, `abreviatura`

---

### 4.3 tipos_discapacidad
**Descripción:** Tipos de discapacidad (Visual, Auditiva, Motriz, Intelectual, Psicosocial, Múltiple, Otra).

**Campos Principales:**
- `nombre`, `descripcion`

**Relaciones:**
- Referenciado por estudiantes (opcional)

---

### 4.4 tipos_parentesco
**Descripción:** Tipos de parentesco para apoderados/tutores (Padre, Madre, Abuelo(a), Tío(a), Hermano(a), Tutor(a), etc.).

**Campos Principales:**
- `nombre`, `descripcion`

---

### 4.5 becas_descuentos
**Descripción:** Catálogo de becas y descuentos disponibles (0%, 25%, 50%, 75%, 100%). Incluye sistema de becas automáticas basado en promedio.

**Campos Principales:**
- `nombre`, `codigo`, `porcentaje`
- `es_automatica`, `tipo_automatica` (PROMEDIO_90, MANUAL)
- `promedio_minimo`, `requiere_documentacion`, `requiere_aprobacion_rector`

**Relaciones:**
- Referenciado por estudiantes_becas

---

### 4.6 turnos_horarios
**Descripción:** Turnos académicos (MAÑANA: 07:00-12:00, TARDE: 14:00-18:00, NOCHE: 19:00-22:00).

**Campos Principales:**
- `nombre`, `hora_inicio`, `hora_fin`

---

### 4.7 roles
**Descripción:** Roles de usuario del sistema (11 roles predefinidos: SUPER_ADMIN, RECTOR, DIRECTOR_ACADEMICO, etc.).

**Campos Principales:**
- `codigo`, `nombre`, `nivel_acceso`

**Relaciones:**
- Tiene muchos permisos (roles_permisos)
- Referenciado por usuarios

---

### 4.8 permisos
**Descripción:** Permisos granulares del sistema (70+ permisos organizados por módulo).

**Campos Principales:**
- `codigo` (ej: estudiantes.ver, calificaciones.registrar), `modulo`

**Relaciones:**
- Asignado a roles mediante roles_permisos

---

## 5. ESTRUCTURA ACADÉMICA

### 5.1 carreras
**Descripción:** Carreras ofrecidas por el instituto (Sistemas Informáticos, Administración de Empresas, Contaduría General).

**Campos Principales:**
- `codigo`, `nombre`, `descripcion`
- `duracion_anios`, `titulo_otorgado`, `resolucion_ministerial`
- `carga_horaria_total`, `color_hex` (para UI)

**Relaciones:**
- Tiene muchos periodos
- Referenciada por estudiantes, inscripciones, plan_estudios

---

### 5.2 gestiones
**Descripción:** Gestiones académicas (años académicos completos, ej: 2025-1, 2025-2). Representa un año lectivo completo.

**Campos Principales:**
- `codigo` (ej: 2025-1), `anio`
- `imagen_promocion_url`
- `fecha_inicio_administrativa`, `fecha_fin_administrativa`

**Nota:** Las fechas específicas de etapas (pre-inscripción, inscripciones, clases, exámenes) están en la tabla `etapas_gestion`.

**Relaciones:**
- Tiene muchas etapas_gestion
- Referenciada por inscripciones, cursos, estudiantes (gestión de ingreso)

---

### 5.3 etapas_gestion
**Descripción:** Etapas/fases temporales dentro de una gestión académica (Pre-inscripción, Inscripciones, Clases, Exámenes, Entrega de Notas, Cierre Administrativo).

**Campos Principales:**
- `gestion_id` (FK), `nombre`, `tipo`
- `fecha_inicio`, `fecha_fin`
- `vigente` (pueden haber múltiples etapas vigentes simultáneamente)

**Tipos:** PRE_INSCRIPCION, INSCRIPCIONES, CLASES, EVALUACIONES, EXAMENES, ENTREGA_NOTAS, CIERRE_ADMINISTRATIVO

---

### 5.4 periodos
**Descripción:** Periodos académicos de la carrera (semestres: 1º, 2º, 3º, 4º). NO confundir con etapas temporales de gestión.

**Campos Principales:**
- `carrera_id` (FK), `nombre` (ej: "1º Semestre"), `numero`, `orden_visualizacion`

**Relaciones:**
- Pertenece a una carrera
- Usado en plan_estudios para definir qué materias se cursan en cada periodo

---

### 5.5 materias
**Descripción:** Materias/asignaturas del instituto.

**Campos Principales:**
- `codigo`, `nombre`, `nombre_corto`, `descripcion`
- `carga_horaria_teorica`, `carga_horaria_practica`
- `carga_horaria_total` (GENERATED: suma de teórica + práctica)
- `creditos`, `tipo` (TEORICA, PRACTICA, TEORICA_PRACTICA)
- `area_conocimiento`

**Relaciones:**
- Tiene prerrequisitos
- Incluida en plan_estudios

---

### 5.6 plan_estudios
**Descripción:** Relación entre carrera × periodo × materia. Define qué materias se cursan en cada periodo de cada carrera (malla curricular).

**Campos Principales:**
- `carrera_id` (FK), `periodo_id` (FK), `materia_id` (FK)
- `orden_visualizacion`

**Relaciones:**
- Relación many-to-many entre carreras, periodos y materias

---

### 5.7 prerrequisitos
**Descripción:** Prerrequisitos de materias. Define qué materias deben aprobarse antes de inscribirse a otra. Si es prerrequisito, es obligatorio por definición.

**Campos Principales:**
- `materia_id` (FK), `materia_prerrequisito_id` (FK)
- `descripcion`

**Relaciones:**
- Relación entre materias (una materia requiere otra)

---

### 5.8 cursos
**Descripción:** Grupos/secciones de una materia para una gestión específica (Grupo A, B, C, etc.).

**Campos Principales:**
- `materia_id` (FK), `periodo_id` (FK), `paralelo` (A, B, C...)
- `cupo_maximo`, `horario`, `aula`
- `turno` (MAÑANA, TARDE, NOCHE), `docente_id` (FK)
- `estado` (PLANIFICADO, EN_CURSO, FINALIZADO, CANCELADO)

**Relaciones:**
- Pertenece a una materia y periodo
- Tiene un docente asignado
- Referenciado por inscripciones_materias

---

### 5.9 docentes
**Descripción:** Información de los docentes del instituto.

**Campos Principales:**
- `usuario_id` (FK, opcional - si tiene acceso al sistema)
- Datos personales: `nombres`, `apellido_paterno`, `apellido_materno`, `ci`, `expedicion`
- Datos profesionales: `titulo_profesional`, `especialidad`, `anios_experiencia`
- `estado_laboral` (ACTIVO, INACTIVO, LICENCIA, RETIRADO)

**Relaciones:**
- Puede tener usuario del sistema
- Asignado a cursos mediante asignaciones_docentes

---

### 5.10 aulas
**Descripción:** Aulas físicas del instituto.

**Campos Principales:**
- `nombre`, `capacidad`, `tipo`, `ubicacion`

---

### 5.11 turnos_cursos
**Descripción:** Asignación de turnos y horarios a cursos.

**Campos Principales:**
- `curso_id` (FK), `turno_horario_id` (FK)
- `dias_semana`, `aula`

**Relaciones:**
- Relaciona cursos con turnos horarios

---

## 6. GESTIÓN DE ESTUDIANTES

### 6.1 estudiantes
**Descripción:** Tabla principal de estudiantes del instituto.

**Campos Principales:**
- `usuario_id` (FK, opcional - si tiene acceso al sistema)
- `codigo_estudiante` (único: EST-YYYY-NNNN)
- Datos personales: `ci`, `expedicion`, `nombres`, `apellidos`, `fecha_nacimiento`, `genero`
- Referencias: `estado_civil_id`, `idioma_natal_id`, `tipo_discapacidad_id`, `municipio_nacimiento_id`, `municipio_residencia_id`
- Contacto: `celular`, `telefono_fijo`, `email_personal`, `direccion`
- Tipo de sangre (ENUM)

**Relaciones:**
- Puede tener usuario del sistema
- Referencias a catálogos (estado civil, idioma, discapacidad, municipios)
- Datos académicos en estudiantes_datos_academicos
- Datos económicos en estudiantes_datos_economicos

---

### 6.2 estudiantes_datos_academicos
**Descripción:** Datos académicos detallados del estudiante (relación 1:1 con estudiantes).

**Campos Principales:**
- `estudiante_id` (FK), `carrera_id` (FK), `gestion_ingreso_id` (FK)
- `estado_academico` (REGULAR, NIVELACION, RETIRADO, EGRESADO, ABANDONO)
- `unidad_educativa_procedencia`, `anio_egreso_secundaria`
- `promedio_anual` (usado para cálculo de descuentos en becas)
- `foto_url`

**Relaciones:**
- Relación 1:1 con estudiantes
- Referencia a carrera y gestión de ingreso

---

### 6.3 estudiantes_datos_economicos
**Descripción:** Datos económicos y de contacto de emergencia del estudiante.

**Campos Principales:**
- `estudiante_id` (FK)
- Información de apoderados/tutores con referencias polimórficas
- Contactos de emergencia
- Información económica

---

### 6.4 estudiantes_becas
**Descripción:** Becas y descuentos asignados a estudiantes sobre el aporte anual de matrícula (400 bs).

**Campos Principales:**
- `estudiante_id` (FK), `beca_descuento_id` (FK), `gestion_id` (FK)
- `fecha_solicitud`, `estado` (PENDIENTE, ACTIVA, FINALIZADA, RECHAZADA)
- `documentos_completos`, fechas de entrega de documentos
- `observaciones`

**Reglas:**
- Beca 100% si promedio >= 90 en año anterior
- 25% descuento si escasos recursos

---

### 6.5 documentos_estudiante
**Descripción:** Documentos digitalizados de estudiantes (inscripción, licencias, pasantías, descuentos, pagos).

**Campos Principales:**
- `estudiante_id` (FK)
- `tipo_documento` (INSCRIPCION, LICENCIA, PASANTIA, DESCUENTO, PAGO_INSCRIPCION, etc.)
- `tipo_referencia` y `referencia_id` (referencia polimórfica)
- `nombre_archivo`, `ruta_archivo`, `extension`, `tamano_kb`
- `verificado`, `verificado_por`, `estado` (PENDIENTE, APROBADO, RECHAZADO, REQUERIDO)

**Relaciones:**
- Referencia polimórfica a múltiples tablas mediante tipo_referencia y referencia_id

---

### 6.6 licencias_solicitudes
**Descripción:** Solicitudes de licencia estudiantil (ausencias justificadas).

**Campos Principales:**
- `estudiante_id` (FK)
- `tipo_licencia` (ENFERMEDAD, TRABAJO, FAMILIAR, OTRO)
- `motivo`, `fecha_inicio`, `fecha_fin`
- `dias_totales` (GENERATED)
- `estado` (PENDIENTE, APROBADA, RECHAZADA, VENCIDA)
- `revisado_por` (FK a usuarios)

**Relaciones:**
- Puede tener documentos adjuntos (licencias_documentos)

---

## 7. INSCRIPCIONES Y CALIFICACIONES

### 7.1 inscripciones
**Descripción:** Inscripción de estudiantes a gestiones académicas (año lectivo). Es prerrequisito para inscribirse a materias.

**Campos Principales:**
- `estudiante_id` (FK), `gestion_id` (FK), `carrera_id` (FK), `periodo_id` (FK)
- `fecha_inscripcion`, `fecha_aprobacion`
- `turno` (MAÑANA, TARDE, NOCHE)
- `estado` (BORRADOR, PENDIENTE, APROBADA, RECHAZADA, ANULADA)
- `aprobada_por` (FK), `numero_materias`, `carga_horaria_total`

**Relaciones:**
- Un estudiante se inscribe a una gestión específica
- Puede tener múltiples inscripciones_materias

---

### 7.2 inscripciones_materias
**Descripción:** Inscripción de estudiantes a materias específicas + sistema completo de calificaciones y asistencias.

**Sistema de Calificaciones Flexible:**
El sistema permite hasta 4 parciales más práctico, pero solo suma los que existen (flexible según la materia).

**Campos Principales:**
- `inscripcion_id` (FK), `materia_id` (FK), `curso_id` (FK), `docente_id` (FK)
- Calificaciones: `nota_1er_parcial`, `nota_2do_parcial`, `nota_3er_parcial`, `nota_4to_parcial`, `nota_practico`
- Campos calculados: `suma_total` (suma de todos los parciales/práctico existentes), `componentes_evaluados`, `nota_final` (promedio)
- Recuperatorio: `nota_recuperatorio`, `intento_recuperatorio`, `tipo_recuperatorio`
- `nota_definitiva` (considera recuperatorio: si >= 60 entonces 60, sino nota_final)
- Asistencia: `asistencias`, `faltas`, `total_clases`, `asistencia_porcentaje` (GENERATED)
- Estado ampliado: múltiples estados incluyendo NIVELACION, VENCIDA_GESTION_ANTERIOR, etc.
- Control: `notas_cerradas`, `fecha_cierre_notas`, `cerradas_por`

**Lógica de Cálculo:**
```
suma_total = suma de todos los parciales/práctico que existen (NULL = 0)
componentes_evaluados = cantidad de componentes con nota
nota_final = suma_total / componentes_evaluados (si componentes > 0)

Nota Definitiva:
  IF nota_recuperatorio >= 60 THEN 60.00
  ELSE nota_final
```

---

### 7.3 historial_nivelaciones
**Descripción:** Registro de materias en proceso de nivelación.

**Campos Principales:**
- `estudiante_id` (FK), `inscripcion_materia_id` (FK)
- `fecha_inicio`, `intentos_realizados`
- `estado` (PENDIENTE, CURSANDO, APROBADO, ABANDONO)

**Reglas:**
- Máximo 3 intentos para aprobar una materia en nivelación

---

## 8. PASANTÍAS LABORALES

### 8.1 pasantias_empresas
**Descripción:** Catálogo de empresas colaboradoras para pasantías laborales (240 horas requeridas).

**Campos Principales:**
- Datos de empresa: `nombre_empresa`, `razon_social`, `nit`
- `sector` (PUBLICO, PRIVADO, ONG, COOPERATIVA, OTRO), `rubro`, `tamano_empresa`
- Contacto institucional: `contacto_nombre`, `contacto_cargo`, `contacto_telefono`, `contacto_email`
- Convenio: `activa_convenio`, `fecha_inicio_convenio`, `fecha_fin_convenio`
- `capacidad_pasantes` (capacidad simultánea)

**Relaciones:**
- Referenciada por pasantias_asignaciones

---

### 8.2 pasantias_asignaciones
**Descripción:** Asignación de estudiantes a pasantías en empresas.

**Campos Principales:**
- `estudiante_id` (FK), `empresa_id` (FK), `carrera_id` (FK), `gestion_id` (FK)
- `area_departamento`, `cargo_puesto`, `descripcion_actividades`
- `fecha_inicio`, `fecha_finalizacion`, `duracion_dias`
- `responsable_empresa`, `docente_supervisor_id` (FK)
- `estado` (PROGRAMADA, EN_CURSO, FINALIZADA, CANCELADA)

**Relaciones:**
- Tiene una evaluación (pasantias_evaluaciones)

---

### 8.3 pasantias_evaluaciones
**Descripción:** Evaluación de desempeño del estudiante en pasantía.

**Campos Principales:**
- `asignacion_id` (FK)
- `descripcion_trabajo`, `principales_actividades`
- `nivel_desempeno` (ALTO, MEDIO, BAJO)
- `fortalezas`, `areas_mejorar`, `sugerencias`
- `firma_docente`, `firma_empresa` (rutas a imágenes de firmas)

---

## 9. SUPERVISIÓN DOCENTE

### 9.1 supervisiones_programadas
**Descripción:** Programación de supervisiones docentes.

**Campos Principales:**
- `docente_id` (FK), `materia_id` (FK), `curso_id` (FK), `supervisor_id` (FK)
- `fecha_programada`, `hora_inicio`, `hora_fin`
- `tipo` (PRESENCIAL, VIRTUAL, HIBRIDA)
- `estado` (PROGRAMADA, REALIZADA, CANCELADA, REPROGRAMADA)

**Relaciones:**
- Tiene una ficha de supervisión (fichas_supervision)

---

### 9.2 fichas_supervision
**Descripción:** Ficha de observación de clase - evaluación completa del desempeño docente.

**Campos Principales:**
- `supervision_id` (FK), `fecha_supervision`
- Control de asistencia: `control_asistencia`, `metodo_control`
- Presentación del tema: campos booleanos y observaciones
- Recursos utilizados: múltiples campos booleanos (PowerPoint, PDF, Excel, Word, Tablet, etc.)
- Exposición docente: campos booleanos sobre metodología
- Participación de estudiantes: `participacion_activa`
- Actividades prácticas: campos booleanos
- Evaluación: `tipo_evaluacion`, `calificacion_general`
- Observaciones: `observaciones_generales`, `fortalezas`, `aspectos_mejorar`, `recomendaciones`

**Calificaciones:** EXCELENTE, MUY_BUENO, BUENO, REGULAR, DEFICIENTE

---

## 10. HISTORIAL ACADÉMICO OFICIAL

### 10.1 libros_registro
**Descripción:** Libros de registro oficial (ej: Libro 12, Libro 13). Control de numeración secuencial.

**Campos Principales:**
- `numero_libro` (único), `carrera_id` (FK)
- `gestion_inicio`, `gestion_fin`
- `folio_inicio`, `folio_actual`, `folio_fin`
- `activo`

**Relaciones:**
- Tiene muchos folios (folios_estudiantes)

---

### 10.2 folios_estudiantes
**Descripción:** Registro de estudiantes en libros/folios (Historial Académico Oficial). Formato: "LIBRO 12, FOLIO 58".

**Campos Principales:**
- `estudiante_id` (FK), `libro_id` (FK)
- `numero_folio` (único dentro del libro)
- `gestion_registro`, `fecha_registro`
- `carga_horaria_total`, `promedio_general`
- `asignaturas_aprobadas`, `asignaturas_totales`
- `estado_final` (EN_CURSO, EGRESADO, ABANDONO, RETIRADO)
- `pdf_generado`, `ruta_pdf`, `hash_validacion` (SHA256 para validación)

**Formato de Referencia:**
- "1º AÑO – LIBRO 12, FOLIO 58"
- "2º AÑO – LIBRO 13, FOLIO 68"

---

## 11. PAGOS

### 11.1 pagos_aranceles
**Descripción:** Registro de pagos de aranceles y otros conceptos.

**Campos Principales:**
- `pago_id` (referencia polimórfica), `estudiante_id` (FK)
- `monto`, `metodo_pago` (EFECTIVO, TRANSFERENCIA, CHEQUE, TARJETA, OTRO)
- `numero_recibo`, `fecha_pago`
- `registrado_por` (FK a usuarios)

**Relaciones:**
- Tiene detalles (detalle_pagos)

---

### 11.2 detalle_pagos
**Descripción:** Detalle de conceptos incluidos en cada pago.

**Campos Principales:**
- `pago_id` (FK), `concepto`, `monto`

---

## 12. SISTEMA Y AUDITORÍA

### 12.1 usuarios
**Descripción:** Usuarios del sistema con autenticación y autorización.

**Campos Principales:**
- `username` (único), `email` (único), `password_hash` (bcrypt)
- `rol_id` (FK), `foto_url`
- Referencia polimórfica: `referencia_id`, `tipo_referencia` (ESTUDIANTE, DOCENTE, RECTOR, DIRECTOR, SECRETARIA)
- Control de sesión: `ultimo_login`, `intentos_fallidos`, `bloqueado_hasta`
- `estado` (NULL = activo, o BLOQUEADO, SUSPENDIDO, RETIRADO)

**Relaciones:**
- Tiene un rol
- Puede referenciar a estudiantes, docentes, personal mediante referencia polimórfica

---

### 12.2 roles_permisos
**Descripción:** Tabla pivote que relaciona roles con permisos (RBAC).

**Campos Principales:**
- `rol_id` (FK), `permiso_id` (FK)
- `accion` (VER, CREAR, EDITAR, ELIMINAR, APROBAR, EXPORTAR)

**Relaciones:**
- Relación many-to-many entre roles y permisos con acción específica

---

### 12.3 sesiones
**Descripción:** Sesiones activas de usuarios (para control de sesiones concurrentes).

**Campos Principales:**
- `usuario_id` (FK), `token`, `ip_cliente`, `user_agent`
- `fecha_expiracion`, `activa`

---

### 12.4 auditoria
**Descripción:** Registro de auditoría de operaciones críticas del sistema.

**Campos Principales:**
- `usuario_id` (FK), `accion` (CREATE, READ, UPDATE, DELETE)
- `tabla`, `registro_id`
- `valores_anteriores` (JSON), `valores_nuevos` (JSON)
- `ip_cliente`, `user_agent`

**Relaciones:**
- Registra todas las operaciones críticas (modificaciones de notas, cambios de estado, etc.)

---

### 12.5 sincronizacion_logs
**Descripción:** Logs de sincronización con sistemas externos (sistema nacional del Ministerio de Educación).

**Campos Principales:**
- `tipo_sincronizacion`, `estado` (EN_PROGRESO, EXITOSA, FALLIDA)
- `registros_procesados`, `registros_exitosos`, `registros_fallidos`
- `mensaje_error`, `fecha_inicio`, `fecha_fin`

---

## RESUMEN DEL MODELO

### Distribución de Tablas por Categoría

| Categoría | Tablas Principales |
|-----------|-------------------|
| Catálogos Geográficos | paises, departamentos, provincias, municipios |
| Catálogos de Referencia | idiomas, estados_civiles, tipos_discapacidad, tipos_parentesco, becas_descuentos, turnos_horarios, roles, permisos |
| Estructura Académica | carreras, gestiones, etapas_gestion, periodos, materias, plan_estudios, prerrequisitos, cursos, docentes, aulas, turnos_cursos |
| Gestión de Estudiantes | estudiantes, estudiantes_datos_academicos, estudiantes_datos_economicos, estudiantes_becas, documentos_estudiante, licencias_solicitudes |
| Inscripciones y Calificaciones | inscripciones, inscripciones_materias, historial_nivelaciones |
| Pasantías | pasantias_empresas, pasantias_asignaciones, pasantias_evaluaciones |
| Supervisión Docente | supervisiones_programadas, fichas_supervision |
| Historial Oficial | libros_registro, folios_estudiantes |
| Pagos | pagos_aranceles, detalle_pagos |
| Sistema y Auditoría | usuarios, roles_permisos, sesiones, auditoria, sincronizacion_logs |
| **TOTAL** | **40+ tablas** |

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
| 1.0 | 2025-12-08 | Equipo de Desarrollo | Versión inicial consolidada |
| 1.1 | 2025-01-XX | Equipo de Desarrollo | Actualización según schemas normalizados - Versión simplificada sin DDL completo |

---

## REFERENCIAS

- Scripts SQL en `backend/database/01-schemas/`: Definiciones completas de todas las tablas
- OtraDocumentacion_INCOS.pdf: Formularios operativos reales

---

**FIN DEL DOCUMENTO - 05 MODELO DE DATOS**
