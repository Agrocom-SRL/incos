-- ============================================
-- MÓDULO DE INSCRIPCIONES (PARTE 1 de 4)
-- Sistema de Gestión Académica - Instituto INCOS
-- 3 Tablas: inscripciones, matriculas_materia, historial_matricula
-- ============================================
--
-- Este archivo modela la MATRICULACIÓN del estudiante a una gestión y su matrícula
-- a cada materia. Las notas y evaluaciones viven en 18-evaluaciones.sql; el
-- historial previo y nivelaciones en 19-historial-y-nivelaciones.sql; las
-- asistencias y licencias en 20-asistencias-y-licencias.sql.
--
-- FLUJO DE NEGOCIO:
--   1. El estudiante se matricula a una gestión → inscripciones (tipo: NUEVO,
--      ANTIGUO, TRASPASO o TRANSITABILIDAD según el origen de la admisión)
--   2. Se le crean N matriculas_materia (una por cada materia que cursa).
--      Incluye materias del periodo regular y atrasadas (re-cursadas).
--   3. Durante la gestión, su estado evoluciona: INSCRITO → CURSANDO → APROBADO
--      o REPROBADO o ABANDONO o RETIRADO. Cada transición operativa fina
--      (NIVELACION_1RA, VENCIDA, CHOQUE_HORARIO, ARTICULO_18, etc.) se registra
--      en historial_matricula, permitiendo reconstruir el ciclo de vida completo.
--   4. matriculas_materia.estado almacena el RESULTADO ACADÉMICO consolidado;
--      historial_matricula almacena la HISTORIA OPERATIVA detallada.
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

DROP TABLE IF EXISTS historial_matricula;
DROP TABLE IF EXISTS matriculas_materia;
DROP TABLE IF EXISTS inscripciones;

-- ============================================
-- FASE 2: CREACIÓN DE TABLAS
-- ============================================
-- ============================================
-- TABLA: inscripciones
-- Matriculación anual del estudiante a una gestión académica
-- ============================================
-- Una inscripción representa la matrícula del estudiante en una gestión específica.
-- Vincula al estudiante, mediante estudiantes_datos_academicos, con una gestión académica.
-- De esta cabecera dependen las matriculas_materia, que representan las materias que cursa.
--
-- CAMBIO DE ENFOQUE:
-- tipo_inscripcion ya no diferencia CONTINUIDAD y REINGRESO.
-- Ambos casos se agrupan en ANTIGUO, porque el estudiante ya pertenece al instituto.
--
-- IMPORTANTE:
-- estudiantes_datos_academicos.tipo_admision almacena el ORIGEN de admisión del estudiante.
-- inscripciones.tipo_inscripcion almacena el tipo de inscripción para ESTA gestión.
--
-- Ejemplo:
-- - Primer año: TRASPASO o TRANSITABILIDAD
-- - Siguiente gestión: ANTIGUO
--
-- Los datos específicos de traspaso/transitabilidad se consultan desde sus propias tablas,
-- mediante estudiantes_datos_academicos.estudiante_id.
-- ============================================

CREATE TABLE inscripciones (
    id INT AUTO_INCREMENT PRIMARY KEY,

    -- Relaciones principales
    datos_academicos_id INT NULL COMMENT 'Datos académicos del estudiante. Permite llegar al estudiante, carrera, gestión de ingreso y tipo de admisión.',
    gestion_id INT NULL COMMENT 'Gestión académica anual en la que se inscribe',

    -- Tipo de inscripción de esta gestión
    tipo_inscripcion ENUM(
        'NUEVO',
        'ANTIGUO',
        'TRASPASO',
        'TRANSITABILIDAD'
    ) DEFAULT 'ANTIGUO'
        COMMENT 'Tipo de inscripción para esta gestión. NUEVO/TRASPASO/TRANSITABILIDAD aplican normalmente a la primera gestión; en gestiones posteriores corresponde ANTIGUO.',

    -- Datos del proceso
    fecha_inscripcion DATE NULL COMMENT 'Fecha en que se realizó la inscripción',
    observaciones TEXT COMMENT 'Observaciones generales sobre la inscripción',

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

    FOREIGN KEY (datos_academicos_id) REFERENCES estudiantes_datos_academicos(id) ON DELETE SET NULL,
    FOREIGN KEY (gestion_id) REFERENCES gestiones(id) ON DELETE SET NULL,

    -- Índices para optimización
    INDEX idx_datos_academicos_id (datos_academicos_id) COMMENT 'Búsqueda por datos académicos del estudiante',
    INDEX idx_gestion_id (gestion_id) COMMENT 'Búsqueda por gestión',
    INDEX idx_tipo_inscripcion (tipo_inscripcion) COMMENT 'Filtrado por tipo de inscripción en la gestión',
    INDEX idx_activo (activo) COMMENT 'Filtrado por estado activo',
    INDEX idx_deleted_at (deleted_at) COMMENT 'Filtrado de soft delete',
    INDEX idx_estudiante_gestion (datos_academicos_id, gestion_id, activo, deleted_at) COMMENT 'Búsqueda de inscripciones por estudiante y gestión',
    INDEX idx_gestion_activo (gestion_id, activo, deleted_at) COMMENT 'Búsqueda de inscripciones por gestión'

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Matriculación anual del estudiante a una gestión. No duplica traspaso_id/transitabilidad_id; esos procesos se consultan desde sus propias tablas mediante el estudiante.';

-- ============================================
-- TABLA: matriculas_materia
-- Matrícula del estudiante a cada materia de la gestión
-- ============================================
-- Una inscripción se descompone en N matriculas_materia (una por cada materia
-- que el estudiante cursa en esa gestión). Incluye tanto las materias del
-- periodo regular como las atrasadas (re-cursadas): todas son matrículas normales.
--
-- asignacion_docente_id apunta al curso específico (paralelo + materia + docente)
-- al que se matricula. asignatura_plan_id es redundancia controlada para preservar
-- el vínculo con la materia/plan si la asignación docente se elimina.
-- Esta tabla guarda el estado actual consolidado de la materia.
-- No se inserta una nueva fila por cada cambio de estado.
--
-- No guarda recuperatorio anual ni nota forzada. Esos casos viven en
-- historial_matricula con tipo_estado, nota_resultante y nota_forzada.
--
-- CÁLCULO CONSOLIDADO EN APLICACIÓN:
--   1. Si existe historial_matricula vigente con nota_forzada=TRUE:
--        nota_final = historial_matricula.nota_resultante
--   2. Sino, si existe RECUPERATORIO_ANUAL vigente con nota_resultante >= 61:
--        nota_final = historial_matricula.nota_resultante
--   3. Sino:
--        nota_final = SUMA_PONDERADA(4 bimestres + evaluaciones finales)
-- ============================================

CREATE TABLE matriculas_materia (
    id INT AUTO_INCREMENT PRIMARY KEY,

    -- Relaciones principales
    inscripcion_id INT NULL COMMENT 'Inscripción anual del estudiante en una gestión',
    asignacion_docente_id INT NULL COMMENT 'Asignación docente específica: curso + docente + gestion_plan',
    asignatura_plan_id INT NULL COMMENT 'Asignatura del plan. Redundancia controlada para preservar la materia original aunque cambie o se elimine la asignación docente.',

    -- Resultado consolidado/cacheado
    nota_final DECIMAL(5,2) NULL COMMENT 'Nota final consolidada/cacheada (0-100). Se calcula desde evaluaciones y/o historial_matricula según reglas de aplicación.',

    -- Estado actual consolidado de la materia
    estado ENUM(
        'INSCRITO',
        'CURSANDO',
        'APROBADO',
        'REPROBADO',
        'ABANDONO',
        'RETIRADO'
    ) DEFAULT 'INSCRITO'
        COMMENT 'Estado actual consolidado de la materia dentro de la gestión',

    -- Historial simple de fechas de estados normales
    historial_estados JSON NULL COMMENT 'Historial simple de fechas por estado normal. Ejemplo: {"INSCRITO":"2026-02-01","CURSANDO":"2026-02-10","APROBADO":"2026-11-30"}. No reemplaza a historial_matricula, que registra sucesos especiales.',
    observaciones TEXT COMMENT 'Observaciones académicas o administrativas de la matrícula de materia',

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

    FOREIGN KEY (inscripcion_id) REFERENCES inscripciones(id) ON DELETE SET NULL,
    FOREIGN KEY (asignacion_docente_id) REFERENCES asignaciones_docentes(id) ON DELETE SET NULL,
    FOREIGN KEY (asignatura_plan_id) REFERENCES asignaturas_plan(id) ON DELETE SET NULL,

    -- Índices para optimización
    INDEX idx_inscripcion_id (inscripcion_id) COMMENT 'Búsqueda por inscripción',
    INDEX idx_asignacion_docente_id (asignacion_docente_id) COMMENT 'Búsqueda por asignación docente',
    INDEX idx_asignatura_plan_id (asignatura_plan_id) COMMENT 'Búsqueda por asignatura del plan',
    INDEX idx_estado (estado) COMMENT 'Filtrado por estado actual',
    INDEX idx_nota_final (nota_final) COMMENT 'Búsqueda por nota final consolidada',
    INDEX idx_activo (activo) COMMENT 'Filtrado por estado activo',
    INDEX idx_deleted_at (deleted_at) COMMENT 'Filtrado de soft delete',
    INDEX idx_inscripcion_estado (inscripcion_id, estado, activo, deleted_at) COMMENT 'Materias de una inscripción por estado',
    INDEX idx_asignatura_estado (asignatura_plan_id, estado, activo, deleted_at) COMMENT 'Búsqueda de aprobados/reprobados por asignatura'

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Detalle de materias matriculadas por inscripción anual. Guarda una fila por materia cursada en la gestión; los recuperatorios, notas forzadas y sucesos especiales viven en historial_matricula.';

-- ============================================
-- TABLA: historial_matricula
-- Ciclo de vida operativo de cada matrícula
-- ============================================
-- Registra cada transición de estado operativo de una matrícula, permitiendo
-- reconstruir la historia completa: cuándo el estudiante fue declarado
-- NIVELACION_1RA, cuándo PROCEDIÓ a 2DA INSTANCIA, cuándo VENCIÓ su derecho a
-- nivelar, cuándo se le aprobó HOMOLOGACION o ARTICULO_18, etc.
--
-- TIPOS DE ESTADO (basados en centralizadores reales de nivelación):
--   - NIVELACION_1RA / NIVELACION_2DA: tiene derecho a nivelar (1ra o 2da vez)
--   - PRUEBA_EXCEPCIONAL: tercer y último intento (Art. 18 reglamento)
--   - VENCIDA: caducó el derecho a nivelar (debe re-cursar como materia normal)
--   - CHOQUE_HORARIO: no puede matricularse por conflicto de horarios
--   - PRE_REQUISITO: bloqueado por prerrequisito no aprobado
--   - NO_LLEVA_POR_VOLUNTAD: el estudiante decidió no cursar
--   - HOMOLOGACION: convalidación de otra institución o reincorporación
--   - LLEVA_EN_GESTION: cursa la materia en una gestión específica (re-cursado)
--   - ARTICULO_18: caso especial del reglamento (excepción legal)
--   - ABANDONO: el estudiante abandonó la materia
--   - RETIRADO: retiro formal (con o sin licencia)
--
-- Esta tabla NO registra el ciclo normal:
-- (INSCRITO/CURSANDO/APROBADO/REPROBADO/ABANDONO/RETIRADO)
-- ============================================

CREATE TABLE historial_matricula (
    id INT AUTO_INCREMENT PRIMARY KEY,

    -- Relación principal
    matricula_materia_id INT NULL COMMENT 'Matrícula de materia a la que pertenece este suceso especial',

    -- Tipo de suceso especial
    tipo_estado ENUM(
        'NIVELACION_1RA',
        'NIVELACION_2DA',
        'RECUPERATORIO_ANUAL',
        'PRUEBA_EXCEPCIONAL',
        'VENCIDA',
        'CHOQUE_HORARIO',
        'PRE_REQUISITO',
        'NO_LLEVA_POR_VOLUNTAD',
        'HOMOLOGACION',
        'LLEVA_EN_GESTION',
        'ARTICULO_18',
        'ABANDONO',
        'RETIRADO',
        'OTRO'
    ) NOT NULL COMMENT 'Tipo de suceso especial u operativo según reglamento académico INCOS',

    -- Fecha y resultado del suceso
    fecha_transicion DATE NULL COMMENT 'Fecha en que ocurrió o se registró el suceso especial',
    nota_resultante DECIMAL(5,2) NULL COMMENT 'Nota asociada al suceso especial, si aplica. Ej: recuperatorio anual, prueba excepcional, abandono o retiro con nota administrativa.',
    nota_forzada BOOLEAN DEFAULT FALSE COMMENT 'TRUE si nota_resultante debe sobrescribir el cálculo normal de nota_final de la matrícula.',

    -- Detalle del suceso
    observaciones TEXT COMMENT 'Detalle u observación del suceso especial',

    -- Vigencia operativa del suceso
    vigente BOOLEAN DEFAULT TRUE COMMENT 'Indica si este suceso especial sigue vigente o ya fue superado',

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

    -- Índices para optimización
    INDEX idx_matricula_materia_id (matricula_materia_id) COMMENT 'Búsqueda por matrícula de materia',
    INDEX idx_tipo_estado (tipo_estado) COMMENT 'Filtrado por tipo de suceso especial',
    INDEX idx_fecha_transicion (fecha_transicion) COMMENT 'Búsqueda por fecha del suceso',
    INDEX idx_nota_resultante (nota_resultante) COMMENT 'Búsqueda por nota asociada al suceso',
    INDEX idx_nota_forzada (nota_forzada) COMMENT 'Filtrado por notas que sobrescriben el cálculo normal',
    INDEX idx_vigente (vigente) COMMENT 'Filtrado por sucesos vigentes',
    INDEX idx_activo (activo) COMMENT 'Filtrado por estado activo',
    INDEX idx_deleted_at (deleted_at) COMMENT 'Filtrado de soft delete',
    INDEX idx_matricula_tipo (matricula_materia_id, tipo_estado, activo, deleted_at) COMMENT 'Historial por tipo de suceso',
    INDEX idx_matricula_vigente (matricula_materia_id, vigente, activo, deleted_at) COMMENT 'Sucesos vigentes por matrícula',
    INDEX idx_matricula_nota_forzada (matricula_materia_id, nota_forzada, vigente, activo, deleted_at) COMMENT 'Búsqueda de nota forzada vigente por matrícula'

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Historial de sucesos especiales de una matrícula de materia. Incluye recuperatorio anual y notas forzadas mediante nota_resultante/nota_forzada.';

-- ============================================
-- FASE 3: REHABILITAR FOREIGN KEY CHECKS
-- ============================================

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- FIN DEL SCRIPT
-- ============================================