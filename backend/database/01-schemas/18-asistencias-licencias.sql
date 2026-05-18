-- ============================================
-- MÓDULO DE ASISTENCIAS Y LICENCIAS (PARTE 5 de 5)
-- Sistema de Gestión Académica - Instituto INCOS
-- 3 Tablas: licencias, clases_no_dictadas, asistencias
-- ============================================
--
-- Este archivo cierra el módulo académico modelando el dominio operativo de
-- presencia en clase: cuándo el estudiante asistió, cuándo no, y cuándo la
-- clase misma no se dictó (licencia del docente, suspensión institucional, etc.).
--
-- DECISIÓN DE DISEÑO (tres tablas integradas en un mismo dominio):
-- Las tres responden al mismo conjunto de preguntas operativas:
--   - ¿Hubo clase ese día de esa materia? (clases_no_dictadas + actividades_calendario)
--   - Si hubo clase, ¿el estudiante asistió? (asistencias)
--   - Si no asistió, ¿tiene licencia formal que justifique? (licencias)
-- Integradas como un solo dominio, la aplicación tiene UNA fuente de verdad para
-- cada pregunta y validaciones consistentes.
--
-- JERARQUÍA DE VALIDACIÓN al calcular asistencia de un estudiante a una materia:
--   1. ¿Tocaba clase ese día según horario? (cursos_horarios)
--      NO → el día no se considera para nada
--      SÍ → continuar
--   2. ¿La clase se dictó? Cruce de dos fuentes:
--      a. ¿Hay actividad institucional ese día? (actividades_calendario:
--         FERIADO o RECESO) → no hubo clase, día neutro
--      b. ¿Hay registro en clases_no_dictadas para ese curso+fecha? → no hubo
--         clase, día neutro
--      Si ambos NO → continuar
--   3. ¿Cuál es la asistencia del estudiante? (asistencias)
--      PRESENTE / AUSENTE / TARDANZA / LICENCIA según corresponda
--
-- ESTRATEGIA "FORMA B" PARA CLASES NO DICTADAS (sin duplicación):
-- actividades_calendario gestiona eventos institucionales globales (feriados,
-- recesos). clases_no_dictadas registra SOLO cancelaciones específicas NO
-- cubiertas por el calendario: licencia del docente, suspensión puntual, otros.
-- Los feriados no se replican aquí, viven solo en su fuente original. La
-- aplicación, al calcular % de asistencia, hace UNION lógico entre ambas fuentes.
--
-- REGLA DE NEGOCIO PRINCIPAL para LICENCIA del estudiante:
-- Al registrar una asistencia, si existe una licencia APROBADA y vigente para
-- esa fecha y estudiante, el sistema FUERZA estado='LICENCIA' y vincula licencia_id.
-- Esto garantiza que las ausencias justificadas por licencia formal nunca cuenten
-- como AUSENTE en el cómputo que afecta la nota o causa reprobación.
--
-- INTEGRACIÓN CON POLÍTICAS DE ASISTENCIA (asignaciones_docentes):
-- El cálculo de "porcentaje de asistencia" o "días ausentes" considera:
--   - PRESENTE  → cuenta como asistencia completa
--   - TARDANZA  → cuenta según política del docente (típicamente medio día)
--   - AUSENTE   → cuenta como ausencia (afecta política CAUSA_REPROBACION)
--   - LICENCIA  → NO cuenta como ausencia ni asistencia (neutral)
--   - Día sin clase (clases_no_dictadas ∪ actividades_calendario) → NO cuenta
--
-- LICENCIAS DEL DOCENTE (fuera de alcance por ahora):
-- Cuando un docente falta, esa ausencia se refleja indirectamente en
-- clases_no_dictadas con motivo='LICENCIA_DOCENTE'. La gestión administrativa
-- de la licencia del docente (solicitud, aprobación, respaldo, días totales)
-- se modela aparte en un módulo de Recursos Humanos futuro.
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

DROP TABLE IF EXISTS asistencias;
DROP TABLE IF EXISTS clases_no_dictadas;
DROP TABLE IF EXISTS licencias;

-- ============================================
-- FASE 2: CREACIÓN DE TABLAS
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
-- durante su rango de fechas. Las demás (SOLICITADA, RECHAZADA, CANCELADA) son
-- informativas pero no bloquean.

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

    -- Relaciones principales
    asignacion_docente_id INT NULL COMMENT 'Asignación docente del curso afectado (referencia a asignaciones_docentes). Identifica la materia, paralelo y docente.',
    docente_ausente_id INT NULL COMMENT 'Docente que faltó (referencia a docentes). Solo se llena si motivo = LICENCIA_DOCENTE. Útil para reportes de inasistencia docente.',
    actividad_calendario_id INT NULL COMMENT 'Referencia opcional a una actividad institucional (referencia a actividades_calendario). Por Forma B generalmente NULL: los feriados y recesos no se replican aquí. Se usa solo si una SUSPENSION_INSTITUCIONAL también se modeló como actividad.',

    -- Fecha y hora afectada
    fecha_clase DATE NOT NULL COMMENT 'Fecha de la clase que no se dictó',
    hora_clase TIME NULL COMMENT 'Hora específica del bloque afectado (opcional, si la cancelación afecta solo un bloque del día)',

    -- Motivo de la no clase (3 motivos: Forma B sin duplicar calendario)
    motivo ENUM(
        'LICENCIA_DOCENTE',
        'SUSPENSION_INSTITUCIONAL',
        'OTRO'
    ) NOT NULL COMMENT 'Motivo: LICENCIA_DOCENTE (el docente faltó); SUSPENSION_INSTITUCIONAL (paro, emergencia, evento puntual); OTRO (corte de luz, problema de infraestructura, etc.). Los feriados y recesos viven en actividades_calendario, NO se replican aquí (Forma B).',
    descripcion_motivo TEXT COMMENT 'Descripción detallada (obligatorio si motivo = OTRO; opcional para los demás)',

    -- Recuperación de la clase (opcional)
    se_recupera BOOLEAN DEFAULT FALSE COMMENT 'Indica si la clase se va a recuperar en otra fecha (decisión del docente o dirección)',
    fecha_recuperacion DATE NULL COMMENT 'Fecha programada para recuperar la clase, si aplica',
    observaciones TEXT COMMENT 'Observaciones adicionales sobre la cancelación o recuperación',

    -- Registrado por
    registrado_por INT NULL COMMENT 'Usuario que registró la no clase (docente, coordinador, dirección académica)',
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha y hora en que se registró',

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

    FOREIGN KEY (asignacion_docente_id) REFERENCES asignaciones_docentes(id) ON DELETE SET NULL,
    FOREIGN KEY (docente_ausente_id) REFERENCES docentes(id) ON DELETE SET NULL,
    FOREIGN KEY (actividad_calendario_id) REFERENCES actividades_calendario(id) ON DELETE SET NULL,

    -- Índices para optimización
    INDEX idx_asignacion_docente_id (asignacion_docente_id) COMMENT 'Búsqueda por curso afectado',
    INDEX idx_docente_ausente_id (docente_ausente_id) COMMENT 'Búsqueda por docente que faltó (reportes)',
    INDEX idx_actividad_calendario_id (actividad_calendario_id) COMMENT 'Búsqueda por actividad de calendario',
    INDEX idx_fecha_clase (fecha_clase) COMMENT 'Búsqueda por fecha',
    INDEX idx_motivo (motivo) COMMENT 'Filtrado por motivo',
    INDEX idx_activo (activo) COMMENT 'Filtrado por estado activo',
    INDEX idx_deleted_at (deleted_at) COMMENT 'Filtrado de soft delete',
    INDEX idx_asignacion_fecha (asignacion_docente_id, fecha_clase, activo, deleted_at) COMMENT 'Verificación rápida: ¿este curso tuvo clase este día?',
    INDEX idx_fecha_motivo (fecha_clase, motivo, activo, deleted_at) COMMENT 'Reportes por día y tipo de cancelación'

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Cancelaciones específicas del dictado NO cubiertas por actividades_calendario (Forma B). 3 motivos: LICENCIA_DOCENTE, SUSPENSION_INSTITUCIONAL, OTRO. Feriados y recesos viven en actividades_calendario y se cruzan dinámicamente al calcular asistencia.';

-- ============================================
-- TABLA: asistencias
-- Registro de asistencia del estudiante a clases
-- ============================================
-- Estado simplificado a 4 valores:
--   - PRESENTE: el estudiante asistió a la clase
--   - AUSENTE:  el estudiante no asistió, sin justificación válida
--   - TARDANZA: el estudiante llegó tarde
--   - LICENCIA: ausencia cubierta por licencia formal aprobada
--
-- La justificación vive exclusivamente en la tabla licencias (única fuente de
-- verdad). Si la ausencia está justificada, estado='LICENCIA' y licencia_id
-- apunta a la licencia. Si no hay licencia, la ausencia es AUSENTE.
--
-- REGLA AUTOMÁTICA (validación de aplicación):
-- Al insertar/actualizar una asistencia, el sistema:
--   1. Verifica que NO sea día de feriado/receso (actividades_calendario) ni
--      día con cancelación específica (clases_no_dictadas).
--      Si existe → bloquea, no se registra asistencia ese día.
--   2. Consulta si existe una licencia APROBADA y vigente para esa fecha y
--      estudiante (via matricula_materia → inscripcion → estudiante).
--   3. Si existe licencia: fuerza estado='LICENCIA' y asigna licencia_id.
--   4. Si no existe licencia: respeta lo que el docente marcó.

CREATE TABLE asistencias (
    id INT AUTO_INCREMENT PRIMARY KEY,

    -- Relaciones principales
    matricula_materia_id INT NULL COMMENT 'Matrícula a la materia (referencia a matriculas_materia). Permite obtener el estudiante y la materia.',
    licencia_id INT NULL COMMENT 'Licencia que justifica la ausencia (referencia a licencias). Obligatorio si estado = LICENCIA. NULL para PRESENTE, AUSENTE o TARDANZA.',

    -- Fecha y hora de la clase
    fecha_clase DATE NOT NULL COMMENT 'Fecha de la clase a la que corresponde esta asistencia',
    hora_clase TIME NULL COMMENT 'Hora de la clase (opcional, para clases con horarios específicos del día)',

    -- Estado de asistencia (modelo simple)
    estado ENUM('PRESENTE', 'AUSENTE', 'TARDANZA', 'LICENCIA') NOT NULL DEFAULT 'AUSENTE'
        COMMENT 'Estado: PRESENTE (asistió), AUSENTE (no asistió sin justificación), TARDANZA (llegó tarde), LICENCIA (ausencia justificada por licencia formal, fuerza vínculo con licencia_id)',

    -- Observaciones
    observaciones TEXT NULL COMMENT 'Observaciones adicionales del docente sobre la asistencia',

    -- Registrado por
    registrado_por INT NULL COMMENT 'Usuario que registró la asistencia (típicamente el docente)',
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha y hora exacta en que se registró',

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
COMMENT='Registro de asistencia por clase. Estado simple (PRESENTE/AUSENTE/TARDANZA/LICENCIA). Si hay licencia APROBADA vigente, sistema fuerza estado=LICENCIA. No se registra asistencia en días sin clase (cruce con actividades_calendario y clases_no_dictadas).';

-- ============================================
-- FASE 3: REHABILITAR FOREIGN KEY CHECKS
-- ============================================

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- FIN DEL SCRIPT
-- ============================================