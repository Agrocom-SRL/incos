-- ============================================
-- MÓDULO DE ASISTENCIAS Y LICENCIAS (PARTE 4 de 4)
-- Sistema de Gestión Académica - Instituto INCOS
-- 2 Tablas: licencias, asistencias
-- ============================================
--
-- Este archivo cierra el módulo académico modelando el dominio operativo de
-- presencia en clase: cuándo el estudiante asistió, cuándo no, y cuándo su
-- ausencia está justificada por una licencia formal.
--
-- DECISIÓN DE DISEÑO (asistencias y licencias en el MISMO archivo):
-- Estas dos tablas resuelven la misma pregunta operativa: "¿el estudiante
-- asistió a clase? Si no, ¿hay justificación válida?". Modelar la licencia
-- por separado del registro de asistencia genera workarounds y duplicación
-- de lógica. Al integrarlas en un dominio único:
--   - La aplicación tiene UNA fuente de verdad para "presencia/ausencia"
--   - El estado LICENCIA en asistencias se vincula directamente a la licencia
--   - La validación "si hay licencia activa → forzar LICENCIA" se hace en una
--     sola capa, sin riesgo de inconsistencia
--
-- REGLA DE NEGOCIO PRINCIPAL (validación de aplicación):
-- Al registrar una asistencia, el sistema verifica si existe una licencia
-- APROBADA y vigente para esa fecha y estudiante. Si existe:
--   1. El estado se FUERZA automáticamente a 'LICENCIA'
--   2. La FK licencia_id se asigna a esa licencia
--   3. El docente NO puede marcar AUSENTE/TARDANZA en su lugar
-- Esto garantiza que las ausencias justificadas por licencia formal nunca
-- entren al cómputo de asistencia que afecta la nota o causa reprobación.
--
-- INTEGRACIÓN CON POLÍTICAS DE ASISTENCIA (asignaciones_docentes):
-- El cálculo de "porcentaje de asistencia" o "días ausentes" considera:
--   - PRESENTE  → cuenta como asistencia completa
--   - TARDANZA  → cuenta según política del docente (típicamente como medio día)
--   - AUSENTE   → cuenta como ausencia (afecta política CAUSA_REPROBACION)
--   - LICENCIA  → NO cuenta como ausencia ni asistencia (neutral)
-- El detalle de cómo cada política computa esto vive en la lógica de aplicación.
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
-- Deshabilitamos foreign key checks para poder eliminar en cualquier orden
-- ============================================

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS asistencias;
DROP TABLE IF EXISTS licencias;

-- ============================================
-- FASE 2: CREACIÓN DE TABLAS
-- Las foreign key checks siguen deshabilitadas durante la creación
-- ============================================

-- ============================================
-- TABLA: licencias
-- Solicitudes de licencia del estudiante
-- ============================================
-- Basada en el formulario "SOLICITUD DE LICENCIA" de INCOS: el estudiante
-- solicita ausentarse por enfermedad, trabajo, asunto familiar u otro motivo,
-- durante un rango de fechas específico.
--
-- ESTADOS DE LA LICENCIA:
--   - SOLICITADA: recibida por dirección académica, pendiente de revisión
--   - APROBADA: revisada y autorizada (solo en este estado bloquea AUSENTE/TARDANZA)
--   - RECHAZADA: sin respaldo documental suficiente o motivo no válido
--   - CANCELADA: el estudiante la canceló antes de su vigencia
--
-- BLOQUEO AUTOMÁTICO DE ASISTENCIAS:
-- Solo las licencias en estado APROBADA bloquean el registro de AUSENTE/TARDANZA
-- durante su rango de fechas (fecha_inicio a fecha_fin). Las demás (SOLICITADA,
-- RECHAZADA, CANCELADA) son informativas pero no bloquean.
--
-- ALCANCE: Una licencia puede aplicar a una inscripción específica (todas las
-- materias de esa gestión) o a un periodo del estudiante en general. El campo
-- inscripcion_id NULL indica que aplica a cualquier inscripción activa del
-- estudiante en el rango de fechas.

CREATE TABLE licencias (
    id INT AUTO_INCREMENT PRIMARY KEY,

    -- Relaciones principales
    estudiante_id INT NULL COMMENT 'Estudiante que solicita la licencia (referencia a estudiantes)',
    inscripcion_id INT NULL COMMENT 'Inscripción a la que aplica (referencia a inscripciones). NULL = aplica a todas las materias activas del estudiante en el rango de fechas.',

    -- Datos del periodo de licencia
    fecha_solicitud DATE NULL COMMENT 'Fecha en que se presentó la solicitud',
    fecha_inicio DATE NOT NULL COMMENT 'Fecha de inicio del periodo de licencia',
    fecha_fin DATE NOT NULL COMMENT 'Fecha de fin del periodo de licencia',
    total_dias INT NULL COMMENT 'Total de días de licencia (calculado o ingresado manualmente)',

    -- Motivo de la licencia
    motivo ENUM('ENFERMEDAD', 'TRABAJO', 'FAMILIAR', 'VIAJE', 'OTRO') NOT NULL DEFAULT 'OTRO' COMMENT 'Motivo según las categorías del formulario INCOS',
    descripcion_motivo TEXT COMMENT 'Descripción detallada (especialmente si motivo = OTRO)',

    -- Estado de aprobación
    estado ENUM('SOLICITADA', 'APROBADA', 'RECHAZADA', 'CANCELADA') DEFAULT 'SOLICITADA' COMMENT 'Estado: SOLICITADA (recibida), APROBADA (autorizada por dirección académica, bloquea AUSENTE/TARDANZA en asistencias), RECHAZADA (sin respaldo), CANCELADA (cancelada por el estudiante)',
    aprobada_por INT NULL COMMENT 'Usuario (dirección académica) que aprobó la licencia',
    fecha_aprobacion DATE NULL COMMENT 'Fecha en que se aprobó',
    motivo_rechazo TEXT COMMENT 'Motivo del rechazo si fue rechazada',

    -- Respaldo documental
    documento_respaldo_id INT NULL COMMENT 'Documento que respalda la licencia (referencia a documentos_estudiante: certificado médico, carta laboral, etc.)',

    -- Observaciones
    observaciones TEXT COMMENT 'Observaciones adicionales',

    -- Campos de auditoría y control (ESTÁNDAR)
    activo BOOLEAN DEFAULT TRUE COMMENT 'Registro activo/inactivo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Fecha de modificación',
    deleted_at TIMESTAMP NULL DEFAULT NULL COMMENT 'Soft delete',
    created_by INT NULL COMMENT 'Usuario que creó',
    updated_by INT NULL COMMENT 'Usuario que modificó',
    deleted_by INT NULL COMMENT 'Usuario que eliminó',

    -- NOTA: Las Foreign Keys a usuarios se omiten para evitar dependencias circulares
    -- Los campos created_by, updated_by, deleted_by se mantienen para auditoría

    FOREIGN KEY (estudiante_id) REFERENCES estudiantes(id) ON DELETE SET NULL,
    FOREIGN KEY (inscripcion_id) REFERENCES inscripciones(id) ON DELETE SET NULL,
    FOREIGN KEY (documento_respaldo_id) REFERENCES documentos_estudiante(id) ON DELETE SET NULL,

    -- Índices para optimización
    INDEX idx_estudiante_id (estudiante_id) COMMENT 'Búsqueda por estudiante',
    INDEX idx_inscripcion_id (inscripcion_id) COMMENT 'Búsqueda por inscripción',
    INDEX idx_estado (estado) COMMENT 'Filtrado por estado',
    INDEX idx_motivo (motivo) COMMENT 'Filtrado por motivo',
    INDEX idx_activo (activo) COMMENT 'Filtrado por estado activo',
    INDEX idx_deleted_at (deleted_at) COMMENT 'Filtrado de soft delete',
    INDEX idx_estudiante_fechas (estudiante_id, fecha_inicio, fecha_fin, estado, activo, deleted_at) COMMENT 'Búsqueda de licencias activas para validar al registrar asistencia',
    INDEX idx_estudiante_estado (estudiante_id, estado, activo, deleted_at) COMMENT 'Licencias por estudiante y estado'

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Solicitudes de licencia del estudiante. Solo las APROBADAS bloquean el registro de AUSENTE/TARDANZA en asistencias durante su rango de fechas (validación de aplicación).';

-- ============================================
-- TABLA: asistencias
-- Registro de asistencia del estudiante a clases
-- ============================================
-- Refactorización del modelo anterior. Cambios principales:
--
-- 1. Estado simplificado a 4 valores únicos:
--    - PRESENTE: el estudiante asistió a la clase
--    - AUSENTE:  el estudiante no asistió, sin justificación válida
--    - TARDANZA: el estudiante llegó tarde
--    - LICENCIA: ausencia cubierta por licencia formal aprobada
--
-- 2. Eliminados los campos motivo_justificacion y documento_justificacion_id:
--    la justificación ahora vive exclusivamente en la tabla licencias
--    (única fuente de verdad). Si la ausencia está justificada por licencia,
--    estado = 'LICENCIA' y licencia_id apunta a la licencia. Si no hay
--    licencia, la ausencia es simplemente AUSENTE.
--
-- 3. Agregada FK directa a licencia_id: vínculo formal con la licencia que
--    justifica esta ausencia. NULL para PRESENTE, AUSENTE y TARDANZA.
--    Obligatorio (en lógica de aplicación) cuando estado = LICENCIA.
--
-- 4. FK renombrada: inscripcion_materia_id → matricula_materia_id, alineado
--    con el nuevo nombre de la tabla en archivo 17.
--
-- REGLA AUTOMÁTICA (validación de aplicación):
-- Al insertar/actualizar una asistencia, el sistema:
--   1. Consulta si existe una licencia APROBADA y vigente para esa fecha y
--      estudiante (via matricula_materia → inscripcion → estudiante)
--   2. Si existe: fuerza estado = 'LICENCIA' y asigna licencia_id
--   3. Si no existe: respeta lo que el docente marcó (PRESENTE/AUSENTE/TARDANZA)
-- Esto garantiza que las ausencias con licencia formal nunca cuenten como
-- AUSENTE en el cómputo de asistencia que afecta nota o causa reprobación.

CREATE TABLE asistencias (
    id INT AUTO_INCREMENT PRIMARY KEY,

    -- Relaciones principales
    matricula_materia_id INT NULL COMMENT 'Matrícula a la materia a la que pertenece esta asistencia (referencia a matriculas_materia). Permite obtener el estudiante y la materia.',
    licencia_id INT NULL COMMENT 'Licencia que justifica la ausencia (referencia a licencias). Obligatorio si estado = LICENCIA. NULL para PRESENTE, AUSENTE o TARDANZA.',

    -- Fecha y hora de la clase
    fecha_clase DATE NOT NULL COMMENT 'Fecha de la clase a la que corresponde esta asistencia',
    hora_clase TIME NULL COMMENT 'Hora de la clase (opcional, para clases con horarios específicos del día)',

    -- Estado de asistencia (modelo simple)
    estado ENUM('PRESENTE', 'AUSENTE', 'TARDANZA', 'LICENCIA') NOT NULL DEFAULT 'AUSENTE'
        COMMENT 'Estado: PRESENTE (asistió), AUSENTE (no asistió sin justificación), TARDANZA (llegó tarde), LICENCIA (ausencia justificada por licencia formal, fuerza vínculo con licencia_id)',

    -- Observaciones
    observaciones TEXT NULL COMMENT 'Observaciones adicionales del docente sobre la asistencia (ej: motivo de tardanza, comportamiento)',

    -- Registrado por
    registrado_por INT NULL COMMENT 'Usuario que registró la asistencia (típicamente el docente)',
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha y hora exacta en que se registró la asistencia',

    -- Campos de auditoría y control (ESTÁNDAR)
    activo BOOLEAN DEFAULT TRUE COMMENT 'Registro activo/inactivo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Fecha de modificación',
    deleted_at TIMESTAMP NULL DEFAULT NULL COMMENT 'Soft delete',
    created_by INT NULL COMMENT 'Usuario que creó',
    updated_by INT NULL COMMENT 'Usuario que modificó',
    deleted_by INT NULL COMMENT 'Usuario que eliminó',

    -- NOTA: Las Foreign Keys a usuarios se omiten para evitar dependencias circulares
    -- Los campos created_by, updated_by, deleted_by se mantienen para auditoría

    FOREIGN KEY (matricula_materia_id) REFERENCES matriculas_materia(id) ON DELETE SET NULL,
    FOREIGN KEY (licencia_id) REFERENCES licencias(id) ON DELETE SET NULL,

    -- Índices para optimización
    INDEX idx_matricula_materia_id (matricula_materia_id) COMMENT 'Búsqueda por matrícula',
    INDEX idx_licencia_id (licencia_id) COMMENT 'Búsqueda de asistencias vinculadas a una licencia',
    INDEX idx_fecha_clase (fecha_clase) COMMENT 'Búsqueda por fecha de clase',
    INDEX idx_estado (estado) COMMENT 'Filtrado por estado de asistencia',
    INDEX idx_activo (activo) COMMENT 'Filtrado por estado activo',
    INDEX idx_deleted_at (deleted_at) COMMENT 'Filtrado de soft delete',
    INDEX idx_matricula_fecha (matricula_materia_id, fecha_clase, activo, deleted_at) COMMENT 'Búsqueda de asistencia por matrícula y fecha (evita duplicados)',
    INDEX idx_fecha_estado (fecha_clase, estado, activo, deleted_at) COMMENT 'Búsqueda de asistencias por fecha y estado (reportes diarios)',
    INDEX idx_matricula_estado (matricula_materia_id, estado, activo, deleted_at) COMMENT 'Cálculo de porcentaje de asistencia por matrícula (política CAUSA_REPROBACION)',
    INDEX idx_registrado_por (registrado_por) COMMENT 'Búsqueda por usuario que registró'

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Registro de asistencia por clase. Estado simple (PRESENTE/AUSENTE/TARDANZA/LICENCIA). Si hay licencia APROBADA vigente para la fecha, el sistema fuerza estado=LICENCIA y vincula licencia_id (validación de aplicación).';

-- ============================================
-- FASE 3: REHABILITAR FOREIGN KEY CHECKS
-- ============================================

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- FIN DEL SCRIPT
-- ============================================
