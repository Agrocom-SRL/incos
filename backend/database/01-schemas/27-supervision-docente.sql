-- ============================================
-- MÓDULO DE SUPERVISIÓN DOCENTE (Dirección Académica)
-- Sistema de Gestión Académica - Instituto INCOS
-- 1 Tabla: fichas_seguimiento_clase
-- Base documental: "FICHA DE SEGUIMIENTO EN LA CLASE PRESENCIAL" (membrete
-- INCOS, sello y firma de la Dirección Académica; foto real revisada en
-- /Users/miguel/Documents/incos/pasantia/). La cabecera Docente / Asignatura
-- / Carrera / Curso-Paralelo se deriva de asignaciones_docentes.
-- Separado de 25-libros-registro.sql: es un dominio sin relación con
-- libros/folios de registro académico (distinto actor — Dirección Académica
-- vs. Rectorado/Jefatura de carrera — y distinto propósito).
-- La programación previa de supervisiones NO tiene documento de respaldo: se
-- modela solo la ficha ya realizada (agenda pendiente si el instituto la pide).
-- NORMALIZACIÓN: Estructura normalizada según 3FN
-- ============================================

USE instituto_incos;

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS fichas_seguimiento_clase;

-- ============================================
-- TABLA: fichas_seguimiento_clase
-- ============================================

CREATE TABLE fichas_seguimiento_clase (
    id INT AUTO_INCREMENT PRIMARY KEY,

    asignacion_docente_id INT NULL COMMENT 'Curso observado (referencia a asignaciones_docentes). De aquí derivan docente, asignatura, carrera, curso y paralelo de la cabecera de la ficha',
    supervisor_id INT NULL COMMENT 'Usuario de Dirección Académica que realiza el seguimiento (referencia a usuarios, sin FK por dependencia circular)',
    fecha_seguimiento DATE NOT NULL COMMENT 'Fecha de seguimiento (cabecera de la ficha)',
    clase_observada ENUM('PRESENCIAL') DEFAULT 'PRESENCIAL' COMMENT 'Marque la clase observada — el formulario 2026 solo contempla PRESENCIAL (ampliar ENUM si aparece formato virtual)',

    -- 1. DOCUMENTACIÓN LISTA DE ASISTENCIA (ítems SI/NO de la ficha)
    tiene_cronograma_bimestral BOOLEAN NULL COMMENT 'SI/NO: Cronograma bimestral de asignatura',
    tiene_plan_bimestral BOOLEAN NULL COMMENT 'SI/NO: Plan bimestral',
    tiene_registro_asistencia BOOLEAN NULL COMMENT 'SI/NO: Registro de asistencia',
    tiene_registro_pedagogico BOOLEAN NULL COMMENT 'SI/NO: Registro pedagógico y el consolidado',
    obs_documentacion TEXT NULL COMMENT 'Observaciones de la sección Documentación',

    -- 2. CANTIDAD DE ESTUDIANTES
    estudiantes_en_planilla SMALLINT UNSIGNED NULL COMMENT 'Cantidad de estudiantes en planilla',
    estudiantes_asistentes SMALLINT UNSIGNED NULL COMMENT 'Cantidad de estudiantes asistentes',

    -- 3-9. Secciones de observación libre de la ficha (registre todo lo observado)
    obs_avance_asignatura TEXT NULL COMMENT 'AVANCE DE LA ASIGNATURA: avance según cronograma, plan bimestral y temática actual',
    obs_presentacion_tema TEXT NULL COMMENT 'PRESENTACIÓN DEL TEMA O CONTINUIDAD DE AVANCE: título, competencia e indicadores; retroalimentación si es continuación',
    obs_recursos TEXT NULL COMMENT 'RECURSOS QUE UTILIZA: Power Point, PDF, Excel, Word, tablet gráfica u otro',
    obs_exposicion TEXT NULL COMMENT 'EXPOSICIÓN DEL DOCENTE: claridad, resúmenes, cuadros sinópticos, mapas, diagramas, casos, ejercicios',
    obs_participacion TEXT NULL COMMENT 'PARTICIPACIÓN DE ESTUDIANTES: participación activa en la clase',
    obs_actividades_practicas TEXT NULL COMMENT 'ACTIVIDADES PRÁCTICAS: espacio de preguntas y promoción de la participación',
    obs_actividades_evaluacion TEXT NULL COMMENT 'ACTIVIDADES DE EVALUACIÓN: evaluación de proceso o de resultado',
    otras_observaciones TEXT NULL COMMENT 'OTRAS OBSERVACIONES (cierre de la ficha)',

    activo BOOLEAN DEFAULT TRUE COMMENT 'Registro activo/inactivo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Fecha de modificación',
    deleted_at TIMESTAMP NULL DEFAULT NULL COMMENT 'Soft delete',
    created_by INT NULL COMMENT 'Usuario que creó',
    updated_by INT NULL COMMENT 'Usuario que modificó',
    deleted_by INT NULL COMMENT 'Usuario que eliminó',

    FOREIGN KEY (asignacion_docente_id) REFERENCES asignaciones_docentes(id) ON DELETE SET NULL,

    INDEX idx_asignacion_docente (asignacion_docente_id, fecha_seguimiento, activo, deleted_at) COMMENT 'Fichas de un curso por fecha',
    INDEX idx_fecha (fecha_seguimiento) COMMENT 'Fichas por fecha',
    INDEX idx_supervisor (supervisor_id) COMMENT 'Fichas realizadas por un supervisor',
    INDEX idx_activo (activo) COMMENT 'Filtrado por estado activo',
    INDEX idx_deleted_at (deleted_at) COMMENT 'Filtrado de soft delete'

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='FICHA DE SEGUIMIENTO EN LA CLASE PRESENCIAL de la Dirección Académica: réplica campo a campo del formulario físico.';

SET FOREIGN_KEY_CHECKS = 1;
