-- ============================================
-- MÓDULO DE INSCRIPCIONES (PARTE 4 de 5)
-- Sistema de Gestión Académica - Instituto INCOS
-- 1 Tabla: historial_matricula
-- ============================================
--
-- Requiere ejecutarse DESPUÉS de:
--   12-inscripciones.sql      (matriculas_materia)
--   16-nivelaciones.sql       (nivelaciones)
--
-- Este script cierra el vínculo entre matrícula y intentos académicos:
-- historial_matricula referencia nivelaciones, por lo que no puede crearse
-- en 12-inscripciones.sql sin romper el orden de FKs.
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

-- ============================================
-- FASE 2: CREACIÓN DE TABLAS
-- ============================================

-- ============================================
-- TABLA: historial_matricula
-- Ciclo de vida operativo de cada matrícula con dos caminos para notas excepcionales
-- ============================================
-- Registra cada transición de estado operativo de una matrícula, permitiendo
-- reconstruir la historia completa.
--
-- DOS CAMINOS PARA NOTAS EXCEPCIONALES:
--
-- 1. INTENTOS ACADÉMICOS:
--    Para tipo_estado en:
--    - RECUPERATORIO_ANUAL
--    - NIVELACION_1RA
--    - NIVELACION_2DA
--    - PRUEBA_EXCEPCIONAL
--
--    El campo nivelacion_id apunta a la tabla nivelaciones.
--    Allí viven la nota, fecha de examen, docente evaluador y estado del intento.
--    En este caso nota_resultante y nota_forzada quedan NULL.
--
-- 2. DECISIONES ADMINISTRATIVAS:
--    Para tipo_estado en:
--    - ABANDONO
--    - RETIRADO
--    - ARTICULO_18
--
--    No hay intento académico. La nota vive directamente aquí usando:
--    - nota_resultante
--    - nota_forzada
--
--    En este caso nivelacion_id queda NULL.
--
-- 3. TRANSICIONES SIN NOTA:
--    Para estados como VENCIDA, CHOQUE_HORARIO, PRE_REQUISITO,
--    HOMOLOGACION, LLEVA_EN_GESTION u OTRO, solo se registra la cronología.
-- ============================================

CREATE TABLE historial_matricula (
    id INT AUTO_INCREMENT PRIMARY KEY,

    -- Relaciones principales
    matricula_materia_id INT NULL COMMENT 'Matrícula a la que pertenece este estado (referencia a matriculas_materia)',
    nivelacion_id INT NULL COMMENT 'Si el tipo_estado es un intento académico, apunta a nivelaciones. NULL para decisiones administrativas o transiciones sin nota.',

    -- Tipo de estado operativo
    tipo_estado ENUM(
        'NIVELACION_1RA',
        'NIVELACION_2DA',
        'PRUEBA_EXCEPCIONAL',
        'RECUPERATORIO_ANUAL',
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
    ) NOT NULL COMMENT 'Tipo de estado operativo según reglamento INCOS. Cubre nivelaciones, recuperatorio anual, vencidas, choques de horario, prerequisitos, abandonos, retiros y otros casos.',

    -- Notas administrativas
    nota_resultante DECIMAL(5,2) NULL
        COMMENT 'Nota fijada por decisión administrativa (0-100). Aplica solo para ABANDONO, RETIRADO o ARTICULO_18. NULL para intentos académicos y transiciones sin nota.',

    nota_forzada BOOLEAN DEFAULT FALSE
        COMMENT 'TRUE si nota_resultante sobrescribe el cálculo regular de matriculas_materia.nota_final.',

    -- Detalle de la transición
    fecha_transicion DATE NULL COMMENT 'Fecha en que ocurrió la transición a este estado',
    observaciones TEXT COMMENT 'Observaciones adicionales',

    -- Vigencia del estado
    vigente BOOLEAN DEFAULT TRUE COMMENT 'Indica si este estado está vigente o ya fue reemplazado por uno posterior',
    
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
    FOREIGN KEY (nivelacion_id) REFERENCES nivelaciones(id) ON DELETE SET NULL,

    -- Índices para optimización
    INDEX idx_matricula_materia_id (matricula_materia_id) COMMENT 'Búsqueda por matrícula',
    INDEX idx_nivelacion_id (nivelacion_id) COMMENT 'Búsqueda del intento académico vinculado',
    INDEX idx_tipo_estado (tipo_estado) COMMENT 'Filtrado por tipo de estado',
    INDEX idx_vigente (vigente) COMMENT 'Filtrado por estados vigentes',
    INDEX idx_nota_forzada (nota_forzada) COMMENT 'Búsqueda de transiciones con nota forzada',
    INDEX idx_activo (activo) COMMENT 'Filtrado por estado activo',
    INDEX idx_deleted_at (deleted_at) COMMENT 'Filtrado de soft delete',
    INDEX idx_matricula_vigente (matricula_materia_id, vigente, activo, deleted_at) COMMENT 'Búsqueda del estado vigente de una matrícula',
    INDEX idx_matricula_tipo (matricula_materia_id, tipo_estado, activo, deleted_at) COMMENT 'Historia de un tipo de estado específico',
    INDEX idx_matricula_forzada (matricula_materia_id, nota_forzada, vigente, activo, deleted_at) COMMENT 'Búsqueda rápida de nota forzada vigente para cálculo de nota efectiva'

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Bitácora del ciclo de vida operativo de matrículas. Para intentos académicos usa FK nivelacion_id. Para decisiones administrativas usa nota_resultante + nota_forzada directamente.';

-- ============================================
-- FASE 3: REHABILITAR FOREIGN KEY CHECKS
-- ============================================

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- FIN DEL SCRIPT
-- ============================================
