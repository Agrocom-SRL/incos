-- ============================================
-- MÓDULO DE ASISTENCIAS Y LICENCIAS (PARTE 5 de 5)
-- Sistema de Gestión Académica - Instituto INCOS
-- 3 Tablas: licencias, clases_no_dictadas, asistencias
-- ============================================
--
-- Dominio operativo de presencia en clase. Requiere 12-inscripciones.sql.
--
-- JERARQUÍA DE VALIDACIÓN al calcular asistencia:
--   1. ¿Tocaba clase ese día según horario? (cursos_horarios)
--      NO → no se considera
--   2. ¿La clase se dictó? Cruce dinámico:
--      a. actividades_calendario (FERIADO/RECESO) → día neutro
--      b. clases_no_dictadas para asignacion_docente_id + fecha → día neutro
--   3. ¿Cuál es la asistencia? (asistencias: PRESENTE / AUSENTE / TARDANZA)
--   4. ¿Hay licencia APROBADA vigente? Cruce dinámico por inscripcion + fecha
--      (licencias cubre TODAS las materias del rango; no se almacena en asistencias)
--
-- LICENCIAS: ancladas a inscripcion_id (cadena canónica del ecosistema).
-- Estudiante derivable: inscripcion → datos_academicos → estudiante.
-- Cubren todas las materias de la inscripción en el rango de fechas.
--
-- ASISTENCIAS: solo 3 estados registrados. La licencia no es un estado persistido;
-- la aplicación cruza licencias APROBADAS al calcular % y trata esos días como neutros.
-- La marca cuelga de la SESIÓN (sesion_clase_id): fecha, hora, curso y bimestre se
-- derivan de sesiones_clase, NO se repiten en cada fila (un solo lugar de verdad).
--
-- ANCLA DE LA SESIÓN (sesiones_clase) — equivalencia con Calificaciones:
--   La sesión se ata a asignacion_docente_id (el curso: docente + oferta) y a
--   periodo_academico_id (el bimestre, periodos_academicos.division=BIMESTRE).
--   El bimestre se referencia DIRECTO al periodo académico del calendario, NO a
--   través de bimestres_matricula: mismo patrón que evaluaciones.periodo_academico_id
--   en Calificaciones, que mantiene coherentes las dos planillas hermanas
--   (notas y asistencia) del mismo docente/curso/bimestre. La gestión y el
--   numero_orden del bimestre se derivan del periodo, no se duplican.
--
-- CLASES NO DICTADAS (Forma B): sin docente_ausente_id ni actividad_calendario_id.
-- Docente derivable por asignacion_docente. Feriados solo en actividades_calendario.
--
-- RESTRICCIONES DE DISEÑO:
--   - Todas las FKs permiten NULL
--   - Todas las FKs usan ON DELETE SET NULL
--   - Ninguna restricción UNIQUE
--   - Ninguna validación CHECK dentro del schema (validación en aplicación)
--   - Auditoría estándar idéntica en todas las tablas
--   - Índices solo en propiedades clave de búsqueda y FKs
-- ============================================

USE instituto_incos;

-- ============================================
-- FASE 1: ELIMINACIÓN DE TABLAS
-- ============================================

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS sesiones_clase;
DROP TABLE IF EXISTS asistencias;
DROP TABLE IF EXISTS clases_no_dictadas;
DROP TABLE IF EXISTS licencias;

-- ============================================
-- FASE 2: CREACIÓN DE TABLAS
-- ============================================

-- ============================================
-- TABLA: licencias
-- Solicitudes de licencia del estudiante por inscripción
-- ============================================
-- Formulario "SOLICITUD DE LICENCIA" INCOS. Máx. 15 días por gestión (validación app).
-- Una licencia aplica a todas las materias de la inscripción en el rango de fechas.
-- Documentos en documentos_estudiante con tipo_referencia=licencias.

CREATE TABLE licencias (
    id INT AUTO_INCREMENT PRIMARY KEY,

    -- Relación principal (ancla canónica del ecosistema académico)
    inscripcion_id INT NULL COMMENT 'Inscripción a la que aplica (referencia a inscripciones). Estudiante y gestión derivables vía inscripcion.',

    -- Datos del periodo de licencia
    fecha_solicitud DATE NOT NULL COMMENT 'Fecha en que se presentó la solicitud',
    fecha_inicio DATE NOT NULL COMMENT 'Fecha de inicio del periodo de licencia',
    fecha_fin DATE NOT NULL COMMENT 'Fecha de fin del periodo de licencia',
    total_dias INT NULL COMMENT 'Total de días de licencia (calculado o ingresado)',

    -- Motivo
    motivo ENUM(
        'ENFERMEDAD',
        'TRABAJO',
        'FAMILIAR',
        'VIAJE',
        'ACADEMICO',
        'DEPORTIVO',
        'PERSONAL',
        'OTRO'
    ) NOT NULL DEFAULT 'OTRO' COMMENT 'Motivo según formulario INCOS',
    detalle_motivo TEXT NOT NULL COMMENT 'Detalle del motivo (observaciones)',

    -- Estado de aprobación
    estado ENUM('PENDIENTE', 'APROBADA', 'RECHAZADA', 'CANCELADA') DEFAULT 'PENDIENTE'
        COMMENT 'PENDIENTE (recibida), APROBADA (autorizada, neutraliza ausencias en el rango), RECHAZADA, CANCELADA',
    observaciones_decision TEXT NULL COMMENT 'Observación única de la decisión (motivo de aprobación/rechazo/cancelación)',

    -- Campos de auditoría y control (ESTÁNDAR)
    activo BOOLEAN DEFAULT TRUE COMMENT 'Registro activo/inactivo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Fecha de modificación',
    deleted_at TIMESTAMP NULL DEFAULT NULL COMMENT 'Soft delete',
    created_by INT NULL COMMENT 'Usuario que creó',
    updated_by INT NULL COMMENT 'Usuario que modificó',
    deleted_by INT NULL COMMENT 'Usuario que eliminó',

    FOREIGN KEY (inscripcion_id) REFERENCES inscripciones(id) ON DELETE SET NULL,

    INDEX idx_inscripcion_id (inscripcion_id) COMMENT 'Búsqueda por inscripción',
    INDEX idx_estado (estado) COMMENT 'Filtrado por estado',
    INDEX idx_motivo (motivo) COMMENT 'Filtrado por motivo',
    INDEX idx_activo (activo) COMMENT 'Filtrado por estado activo',
    INDEX idx_deleted_at (deleted_at) COMMENT 'Filtrado de soft delete',
    INDEX idx_inscripcion_fechas (inscripcion_id, fecha_inicio, fecha_fin, estado, activo, deleted_at) COMMENT 'Licencias vigentes para cruce dinámico con asistencias',
    INDEX idx_inscripcion_estado (inscripcion_id, estado, activo, deleted_at) COMMENT 'Licencias por inscripción y estado'

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Licencias estudiantiles por inscripción y rango de fechas. Solo APROBADAS neutralizan ausencias (cruce dinámico, sin FK en asistencias). Máx. 15 días/gestión.';

-- ============================================
-- TABLA: clases_no_dictadas
-- Cancelaciones específicas del dictado (Forma B: sin duplicar calendario)
-- ============================================
-- Registra cancelaciones específicas del dictado normal, NO cubiertas por
-- actividades_calendario. La presencia de un registro aquí indica que ese día
-- no debe contar para el cálculo de asistencia del estudiante (neutralidad total).
--
-- ESTRATEGIA FORMA B (sin duplicación con actividades_calendario):
-- Los feriados y recesos académicos NO se duplican en esta tabla: viven
-- únicamente en actividades_calendario (su fuente original). La aplicación,
-- al calcular % de asistencia, hace UNION lógico entre ambas:
--   días_sin_clase_curso_X =
--       feriados/recesos de actividades_calendario que caen en día de clase de X
--     ∪ filas en clases_no_dictadas para asignacion_docente_id = X
--
-- Esta tabla SOLO guarda cancelaciones específicas no globales:
--   - LICENCIA_DOCENTE: el docente faltó (licencia médica, laboral, etc.).
--     El detalle administrativo de la licencia del docente se modela en otro
--     módulo a futuro (Recursos Humanos).
--   - SUSPENSION_INSTITUCIONAL: paro, emergencia, evento institucional puntual
--     que impide el dictado de uno o varios cursos específicos.
--   - OTRO: cualquier otro motivo, especificado en descripcion_motivo
--     (ej: corte de luz, problema de infraestructura en aula específica).
--
-- GRANULARIDAD (1 fila = 1 día de 1 curso):
-- El docente o administrativo registra una fila por cada curso afectado en cada
-- día sin clase. Esto NO se hace por estudiante (sería 35 inserts por día), sino
-- por asignacion_docente_id (todos los estudiantes de ese curso se ven afectados
-- automáticamente al calcular asistencia).

CREATE TABLE clases_no_dictadas (
    id INT AUTO_INCREMENT PRIMARY KEY,

    -- Relación principal
    asignacion_docente_id INT NULL COMMENT 'Asignación docente del curso afectado (referencia a asignaciones_docentes). Docente derivable por asignacion.',

    -- Fecha y hora afectada
    fecha_clase DATE NOT NULL COMMENT 'Fecha de la clase que no se dictó',

    -- Motivo libre (ej: licencia docente, suspensión, corte de luz)
    motivo VARCHAR(255) NOT NULL COMMENT 'Motivo de la cancelación (texto libre)',
    descripcion_motivo TEXT NULL COMMENT 'Descripción detallada',
    -- Campos de auditoría y control (ESTÁNDAR)
    activo BOOLEAN DEFAULT TRUE COMMENT 'Registro activo/inactivo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Fecha de modificación',
    deleted_at TIMESTAMP NULL DEFAULT NULL COMMENT 'Soft delete',
    created_by INT NULL COMMENT 'Usuario que creó',
    updated_by INT NULL COMMENT 'Usuario que modificó',
    deleted_by INT NULL COMMENT 'Usuario que eliminó',

    FOREIGN KEY (asignacion_docente_id) REFERENCES asignaciones_docentes(id) ON DELETE SET NULL,

    INDEX idx_asignacion_docente_id (asignacion_docente_id) COMMENT 'Búsqueda por curso afectado',
    INDEX idx_fecha_clase (fecha_clase) COMMENT 'Búsqueda por fecha',
    INDEX idx_activo (activo) COMMENT 'Filtrado por estado activo',
    INDEX idx_deleted_at (deleted_at) COMMENT 'Filtrado de soft delete',
    INDEX idx_asignacion_fecha (asignacion_docente_id, fecha_clase, activo, deleted_at) COMMENT '¿Este curso tuvo clase este día?'

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Cancelaciones específicas no cubiertas por actividades_calendario (Forma B). 1 fila = 1 día de 1 asignación docente.';

-- ============================================
-- TABLA: sesiones_clase
-- Sesión de clase en que el docente tomó asistencia. 1 fila = 1 curso × 1 fecha.
-- ============================================
-- Su EXISTENCIA = "ese día se registró asistencia" → da el dot del calendario y el
-- DENOMINADOR del % (no se infiere de contar faltas). Unifica el día regular del horario
-- y la sesión especial fuera de horario (taller/recuperación) vía es_especial.
-- El cierre/reapertura vive aquí (estado ABIERTA/CERRADA): cerrar el registro del bimestre
-- = cerrar en lote sus sesiones; reabrir para corregir = volver una sesión a ABIERTA.
-- El bimestre se referencia por FK a periodos_academicos (division=BIMESTRE), NO por un
-- entero suelto (mismo patrón que evaluaciones.periodo_academico_id).

CREATE TABLE sesiones_clase (
    id INT AUTO_INCREMENT PRIMARY KEY,

    -- Relaciones principales
    asignacion_docente_id INT NULL COMMENT 'Curso (docente + oferta). Referencia a asignaciones_docentes.',
    periodo_academico_id INT NULL COMMENT 'Bimestre del calendario (periodos_academicos, division=BIMESTRE). De aquí derivan gestión y numero_orden.',

    -- Fecha y hora de la sesión
    fecha DATE NOT NULL COMMENT 'Fecha de la sesión',
    hora_inicio TIME NULL COMMENT 'Hora de inicio (opcional; derivable del horario en sesiones regulares)',
    hora_fin TIME NULL COMMENT 'Hora de fin (opcional)',

    -- Tipo y motivo
    es_especial BOOLEAN DEFAULT FALSE COMMENT 'FALSE = sesión del horario regular; TRUE = sesión fuera de horario (taller/recuperación)',
    motivo VARCHAR(255) NULL COMMENT 'Motivo cuando es_especial = TRUE',

    -- Cierre del registro (por sesión; el estado por bimestre se deriva por agregación)
    estado ENUM('ABIERTA', 'CERRADA') NOT NULL DEFAULT 'ABIERTA'
        COMMENT 'ABIERTA: el docente marca/edita. CERRADA: registro firmado; reabrir = volver a ABIERTA.',

    -- Campos de auditoría y control (ESTÁNDAR)
    activo BOOLEAN DEFAULT TRUE COMMENT 'Registro activo/inactivo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Fecha de modificación',
    deleted_at TIMESTAMP NULL DEFAULT NULL COMMENT 'Soft delete',
    created_by INT NULL COMMENT 'Usuario que creó',
    updated_by INT NULL COMMENT 'Usuario que modificó',
    deleted_by INT NULL COMMENT 'Usuario que eliminó',

    FOREIGN KEY (asignacion_docente_id) REFERENCES asignaciones_docentes(id) ON DELETE SET NULL,
    FOREIGN KEY (periodo_academico_id) REFERENCES periodos_academicos(id) ON DELETE SET NULL,

    UNIQUE KEY uq_asignacion_fecha (asignacion_docente_id, fecha, deleted_at),
    INDEX idx_asignacion_docente_id (asignacion_docente_id) COMMENT 'Búsqueda por curso',
    INDEX idx_periodo_academico_id (periodo_academico_id) COMMENT 'Búsqueda por bimestre',
    INDEX idx_fecha (fecha) COMMENT 'Búsqueda por fecha',
    INDEX idx_estado (estado) COMMENT 'Filtrado por estado de cierre',
    INDEX idx_activo (activo) COMMENT 'Filtrado por estado activo',
    INDEX idx_deleted_at (deleted_at) COMMENT 'Filtrado de soft delete',
    INDEX idx_asignacion_fecha (asignacion_docente_id, fecha, activo, deleted_at) COMMENT '¿Se tomó asistencia este curso este día? (dot + denominador %)',
    INDEX idx_asignacion_periodo (asignacion_docente_id, periodo_academico_id, estado, activo, deleted_at) COMMENT 'Sesiones de un curso por bimestre (cierre en lote y estado derivado)'

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Sesión de clase en que se tomó asistencia. 1 fila = 1 curso × 1 fecha. Unifica día regular y sesión especial; su existencia marca el día tomado y su estado gobierna el cierre/reapertura.';

-- ============================================
-- TABLA: asistencias
-- Registro de asistencia del estudiante a clases
-- ============================================
-- Solo 3 estados persistidos: PRESENTE, AUSENTE, TARDANZA.
-- Licencias APROBADAS se cruzan dinámicamente por matricula → inscripcion + fecha;
-- no se almacena licencia_id ni estado LICENCIA en esta tabla.
--
-- GRANO Y CLAVES (1 fila = 1 estudiante · 1 sesión):
--   - matricula_materia_id → estudiante + materia (roster del curso).
--   - sesion_clase_id       → la sesión tomada (sesiones_clase). ÚNICA fuente del
--     día y la hora: la FECHA y la HORA de la clase NO se almacenan aquí, se derivan
--     de sesiones_clase.fecha / sesiones_clase.hora_inicio (un solo lugar de verdad).
--     El curso (asignacion_docente) y el bimestre (periodo_academico) también
--     derivan de la sesión, no se repiten en cada marca.
--   - Modelo SPARSE: PRESENTE es implícito (no se persiste); solo se guardan filas
--     AUSENTE/TARDANZA. La existencia de la SESIÓN (no de las marcas) prueba el día
--     tomado y da el denominador del %.
--
-- Por qué NO hay fecha_clase/hora_clase: serían redundancia derivable de la sesión.
-- La planilla de lectura (vista 133) ya proyecta sesiones_clase.fecha AS fecha_clase;
-- duplicarlas en cada marca abre la puerta a inconsistencias (marca con fecha ≠ sesión).
--
-- Al calcular % de asistencia:
--   - PRESENTE → asistencia completa
--   - TARDANZA → según política del docente
--   - AUSENTE → ausencia (salvo día con licencia APROBADA → neutro)
--   - Día sin clase (calendario ∪ clases_no_dictadas) → neutro
--   - Día con licencia APROBADA vigente → neutro

CREATE TABLE asistencias (
    id INT AUTO_INCREMENT PRIMARY KEY,

    -- Relación principal (el día/hora/curso/bimestre derivan de la sesión, no se repiten)
    matricula_materia_id INT NULL COMMENT 'Matrícula a la materia (referencia a matriculas_materia)',
    sesion_clase_id INT NULL COMMENT 'Sesión de clase a la que pertenece la marca (sesiones_clase). Fecha, hora, curso y bimestre derivan de aquí.',

    -- Estado de asistencia (3 valores)
    estado ENUM('PRESENTE', 'AUSENTE', 'TARDANZA') NOT NULL DEFAULT 'AUSENTE'
        COMMENT 'PRESENTE (asistió), AUSENTE (no asistió), TARDANZA (llegó tarde). Licencias se cruzan dinámicamente, no se persisten aquí.',

    observaciones TEXT NULL COMMENT 'Observaciones del docente',

    registrado_por INT NULL COMMENT 'Usuario que registró (típicamente el docente)',
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha y hora del registro',

    -- Campos de auditoría y control (ESTÁNDAR)
    activo BOOLEAN DEFAULT TRUE COMMENT 'Registro activo/inactivo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Fecha de modificación',
    deleted_at TIMESTAMP NULL DEFAULT NULL COMMENT 'Soft delete',
    created_by INT NULL COMMENT 'Usuario que creó',
    updated_by INT NULL COMMENT 'Usuario que modificó',
    deleted_by INT NULL COMMENT 'Usuario que eliminó',

    FOREIGN KEY (matricula_materia_id) REFERENCES matriculas_materia(id) ON DELETE SET NULL,
    FOREIGN KEY (sesion_clase_id) REFERENCES sesiones_clase(id) ON DELETE SET NULL,

    INDEX idx_matricula_materia_id (matricula_materia_id) COMMENT 'Búsqueda por matrícula',
    INDEX idx_sesion_clase_id (sesion_clase_id) COMMENT 'Marcas de una sesión',
    INDEX idx_estado (estado) COMMENT 'Filtrado por estado',
    INDEX idx_activo (activo) COMMENT 'Filtrado por estado activo',
    INDEX idx_deleted_at (deleted_at) COMMENT 'Filtrado de soft delete',
    INDEX idx_sesion_matricula (sesion_clase_id, matricula_materia_id, deleted_at) COMMENT 'Upsert SPARSE: marca de un estudiante en una sesión',
    INDEX idx_matricula_estado (matricula_materia_id, estado, activo, deleted_at) COMMENT 'Cálculo de % de asistencia'

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Asistencia por sesión (SPARSE: solo AUSENTE/TARDANZA; PRESENTE implícito). Fecha/hora/curso/bimestre derivan de sesiones_clase. Licencias APROBADAS se cruzan dinámicamente vía inscripcion, sin FK en esta tabla.';


-- ============================================
-- FASE 3: REHABILITAR FOREIGN KEY CHECKS
-- ============================================

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- FIN DEL SCRIPT
-- ============================================
