-- ============================================
-- MÓDULO DE HISTORIAL DE MATRÍCULA Y NIVELACIONES (PARTE 3 de 5)
-- Sistema de Gestión Académica - Instituto INCOS
-- 2 Tablas: historial_matricula, nivelaciones
-- ============================================
--
-- Requiere ejecutarse DESPUÉS de:
--   05-estructura-academica-parte1.sql (asignaturas_plan — ancla alternativa)
--   13-inscripciones.sql      (inscripciones, historial_previo, matriculas_materia)
--   15-evaluaciones.sql       (orden lógico del módulo académico)
--
-- historial_previo vive en 13-inscripciones.sql (anclado a inscripcion_id).
--
-- ORDEN DE EJECUCIÓN (ecosistema): 05/06 → 07 → 08 → 13 → 15 → 16 → 18
--
-- Dentro de este script: historial_matricula → nivelaciones
-- (nivelaciones.historial_matricula_id referencia historial_matricula)
--
-- SEPARACIÓN DE RESPONSABILIDADES:
--   historial_matricula → QUÉ proceso es (tipo_estado: RECUPERATORIO_ANUAL,
--     NIVELACION_1RA, NIVELACION_2DA, PRUEBA_EXCEPCIONAL, VENCIDA, etc.)
--   nivelaciones → CÓMO fue el examen (fecha, nota, evaluador, aprobado).
--     Sin tipo_intento ni matricula_materia_id: derivables vía historial_matricula.
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

DROP TABLE IF EXISTS nivelaciones;
DROP TABLE IF EXISTS historial_matricula;

-- ============================================
-- FASE 2: CREACIÓN DE TABLAS
-- ============================================

-- ============================================
-- TABLA: historial_matricula
-- Ciclo de vida operativo de cada matrícula. Bitácora de transiciones.
-- ============================================
-- Registra cada transición de estado operativo de una matrícula, permitiendo
-- reconstruir la historia completa. Es el ANCLA de los eventos del ciclo de
-- vida; los intentos académicos (nivelaciones) apuntan AQUÍ, no al revés.
--
-- TRES MODALIDADES SEGÚN tipo_estado:
--
-- 1. INTENTOS ACADÉMICOS
--    tipo_estado en: RECUPERATORIO_ANUAL, NIVELACION_1RA, NIVELACION_2DA,
--                    PRUEBA_EXCEPCIONAL, ARTICULO_18
--    (ARTICULO_18 reclasificado 2026-07-28: los libros reales de nivelación
--    registran «NIVELA ART. 18» como EXAMEN de nivelación, no como decisión
--    administrativa con nota forzada.)
--    NO hay FK a nivelaciones. El vínculo es INVERSO:
--    nivelaciones.historial_matricula_id apunta a esta fila.
--    nota_resultante y nota_forzada quedan NULL.
--
-- 2. DECISIONES ADMINISTRATIVAS (ABANDONO, RETIRADO)
--    nota_resultante + nota_forzada=TRUE. Sin fila en nivelaciones.
--
-- 3. TRANSICIONES SIN NOTA (VENCIDA, CHOQUE_HORARIO, PRE_REQUISITO,
--    NO_LLEVA_POR_VOLUNTAD, HOMOLOGACION, REINCORPORACION, etc.)
--    Solo cronología.
--
-- ANCLAJE DEL EVENTO (convención 2026-07-28, evidencia: libros reales de
-- nivelación con materias que el estudiante NO cursa):
--   - Evento sobre una materia CURSADA → matricula_materia_id.
--   - Evento sobre una materia NO cursada (VENCIDA, CHOQUE_HORARIO,
--     PRE_REQUISITO, NO_LLEVA_POR_VOLUNTAD, HOMOLOGACION, REINCORPORACION)
--     → matricula_materia_id NULL + ancla alternativa
--     inscripcion_id (estudiante-gestión) + asignatura_plan_id (materia del plan).
--   La exclusión mutua se valida en aplicación (sin CHECK, por diseño).
--
-- CÁLCULO DE NOTA EFECTIVA (lógica de aplicación):
--   1. ¿historial_matricula vigente con nota_forzada=TRUE? → nota_resultante
--   2. SINO ¿nivelacion APROBADA con historial_matricula_id → historial vigente
--      de esta matrícula? → nivelaciones.nota_nivelacion
--   3. SINO → matriculas_materia.nota_final

CREATE TABLE historial_matricula (
    id INT AUTO_INCREMENT PRIMARY KEY,

    matricula_materia_id INT NULL COMMENT 'Matrícula a la que pertenece este evento (referencia a matriculas_materia). Estudiante y gestión derivables vía matricula → inscripcion. NULL cuando el evento describe una materia NO cursada: en ese caso el ancla es inscripcion_id + asignatura_plan_id.',

    -- Ancla alternativa para eventos SIN matrícula (materia no cursada):
    inscripcion_id INT NULL COMMENT 'Inscripción del estudiante en la gestión (referencia a inscripciones). Se usa junto a asignatura_plan_id cuando el evento describe una materia que el estudiante NO cursa (VENCIDA, CHOQUE_HORARIO, PRE_REQUISITO, NO_LLEVA_POR_VOLUNTAD, HOMOLOGACION, REINCORPORACION) y no existe matricula_materia_id.',
    asignatura_plan_id INT NULL COMMENT 'Materia del plan a la que se refiere el evento sin matrícula (referencia a asignaturas_plan). Junto a inscripcion_id identifica estudiante-gestión-materia cuando matricula_materia_id es NULL.',

    -- NOTA DE DISEÑO: NO existe nivelacion_id. El vínculo es INVERSO:
    -- nivelaciones.historial_matricula_id apunta a esta tabla.

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
        'REINCORPORACION',
        'LLEVA_EN_GESTION',
        'ARTICULO_18',
        'ABANDONO',
        'RETIRADO',
        'OTRO'
    ) NOT NULL COMMENT 'Naturaleza del proceso según reglamento INCOS. Para intentos académicos distingue RECUPERATORIO_ANUAL (preventivo, misma gestión) de NIVELACION_1RA/2DA/PRUEBA_EXCEPCIONAL/ARTICULO_18 (recuperación posterior; ARTICULO_18 es examen, libros reales «NIVELA ART. 18»). REINCORPORACION: retorno del estudiante, aparece junto a HOMOLOGACION en los libros reales. La nota del examen vive en nivelaciones.',

    nota_resultante DECIMAL(5,2) NULL
        COMMENT 'Nota fijada por decisión administrativa (0-100). Solo ABANDONO o RETIRADO.',

    nota_forzada BOOLEAN DEFAULT FALSE
        COMMENT 'TRUE si nota_resultante sobrescribe matriculas_materia.nota_final.',

    fecha_transicion DATE NULL COMMENT 'Fecha en que ocurrió la transición a este estado',
    observaciones TEXT COMMENT 'Observaciones adicionales',

    vigente BOOLEAN DEFAULT TRUE COMMENT 'Indica si este estado está vigente o ya fue reemplazado por uno posterior',

    activo BOOLEAN DEFAULT TRUE COMMENT 'Registro activo/inactivo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Fecha de modificación',
    deleted_at TIMESTAMP NULL DEFAULT NULL COMMENT 'Soft delete',
    created_by INT NULL COMMENT 'Usuario que creó',
    updated_by INT NULL COMMENT 'Usuario que modificó',
    deleted_by INT NULL COMMENT 'Usuario que eliminó',

    FOREIGN KEY (matricula_materia_id) REFERENCES matriculas_materia(id) ON DELETE SET NULL,
    FOREIGN KEY (inscripcion_id) REFERENCES inscripciones(id) ON DELETE SET NULL,
    FOREIGN KEY (asignatura_plan_id) REFERENCES asignaturas_plan(id) ON DELETE SET NULL,

    INDEX idx_matricula_materia_id (matricula_materia_id) COMMENT 'Búsqueda por matrícula',
    INDEX idx_inscripcion_id (inscripcion_id) COMMENT 'Eventos sin matrícula de una inscripción',
    INDEX idx_asignatura_plan_id (asignatura_plan_id) COMMENT 'Eventos sin matrícula de una materia del plan',
    INDEX idx_inscripcion_asignatura (inscripcion_id, asignatura_plan_id, vigente, activo, deleted_at) COMMENT 'Evento vigente de una materia no cursada del estudiante',
    INDEX idx_tipo_estado (tipo_estado) COMMENT 'Filtrado por tipo de estado',
    INDEX idx_vigente (vigente) COMMENT 'Filtrado por estados vigentes',
    INDEX idx_nota_forzada (nota_forzada) COMMENT 'Búsqueda de transiciones con nota forzada',
    INDEX idx_activo (activo) COMMENT 'Filtrado por estado activo',
    INDEX idx_deleted_at (deleted_at) COMMENT 'Filtrado de soft delete',
    INDEX idx_matricula_vigente (matricula_materia_id, vigente, activo, deleted_at) COMMENT 'Estado vigente de una matrícula',
    INDEX idx_matricula_tipo (matricula_materia_id, tipo_estado, activo, deleted_at) COMMENT 'Historia de un tipo de estado específico',
    INDEX idx_matricula_forzada (matricula_materia_id, nota_forzada, vigente, activo, deleted_at) COMMENT 'Nota forzada vigente para cálculo de nota efectiva'

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Bitácora operativa de matrículas. Intentos académicos (incluye ARTICULO_18): tipo_estado aquí, hecho del examen en nivelaciones vía historial_matricula_id. Administrativos (ABANDONO/RETIRADO): nota_resultante + nota_forzada. Eventos de materia NO cursada: ancla inscripcion_id + asignatura_plan_id con matricula_materia_id NULL.';

-- ============================================
-- TABLA: nivelaciones
-- Hecho concreto de un examen extraordinario
-- ============================================
-- Registro neutro del examen: cuándo, qué nota, quién evaluó, si aprobó.
-- El significado del proceso (recuperatorio vs 1ra/2da nivelación vs Art. 18)
-- NO vive aquí: se lee de historial_matricula.tipo_estado del evento vinculado.
--
-- NORMALIZACIÓN (3FN):
--   - SE ELIMINÓ estudiante_id, asignatura_plan_id: derivables vía
--     historial_matricula → matricula_materia → inscripcion (y asignacion).
--   - SE ELIMINÓ matricula_materia_id: transitivo vía historial_matricula.
--   - SE ELIMINÓ tipo_intento y numero_intento: duplican tipo_estado del historial.
--   - historial_matricula_id: ancla del evento que habilitó el examen.
--   - gestion_id SE MANTIENE: el examen puede ser en la gestión de la matrícula
--     o en una posterior; no es derivable solo de la matrícula.
--
-- Cubre los procesos de examen con el mismo esquema:
--   - Preventivo: RECUPERATORIO_ANUAL al cierre de la misma gestión
--   - Recuperación: NIVELACION_1RA/2DA, PRUEBA_EXCEPCIONAL en gestiones posteriores
--   - Art. 18: ARTICULO_18, examen de nivelación del reglamento
--     (libros reales «NIVELA ART. 18»; reclasificado 2026-07-28)

CREATE TABLE nivelaciones (
    id INT AUTO_INCREMENT PRIMARY KEY,

    historial_matricula_id INT NULL COMMENT 'Evento de historial que habilitó y contextualiza este examen (referencia a historial_matricula). El tipo_estado del historial distingue RECUPERATORIO_ANUAL, NIVELACION_1RA, etc.',
    gestion_id INT NULL COMMENT 'Gestión en la que se rinde el examen (referencia a gestiones). Puede ser la de la matrícula original o una posterior.',
    docente_evaluador_id INT NULL COMMENT 'Docente que evaluó el intento (referencia a docentes)',

    fecha_examen DATE NULL COMMENT 'Fecha del examen',

    nota_nivelacion DECIMAL(5,2) NULL COMMENT 'Nota obtenida (0-100). Mínima de aprobación: 61.',
    estado ENUM('PROGRAMADA', 'EN_CURSO', 'APROBADA', 'REPROBADA', 'CANCELADA') DEFAULT 'PROGRAMADA' COMMENT 'Estado del proceso del examen',
    aprobado BOOLEAN NULL COMMENT 'TRUE si aprobó (nota_nivelacion >= 61), FALSE si reprobó',

    observaciones TEXT COMMENT 'Observaciones del proceso',

    activo BOOLEAN DEFAULT TRUE COMMENT 'Registro activo/inactivo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Fecha de modificación',
    deleted_at TIMESTAMP NULL DEFAULT NULL COMMENT 'Soft delete',
    created_by INT NULL COMMENT 'Usuario que creó',
    updated_by INT NULL COMMENT 'Usuario que modificó',
    deleted_by INT NULL COMMENT 'Usuario que eliminó',

    FOREIGN KEY (historial_matricula_id) REFERENCES historial_matricula(id) ON DELETE SET NULL,
    FOREIGN KEY (gestion_id) REFERENCES gestiones(id) ON DELETE SET NULL,
    FOREIGN KEY (docente_evaluador_id) REFERENCES docentes(id) ON DELETE SET NULL,

    INDEX idx_historial_matricula_id (historial_matricula_id) COMMENT 'Búsqueda por evento de historial',
    INDEX idx_gestion_id (gestion_id) COMMENT 'Búsqueda por gestión del examen',
    INDEX idx_docente_evaluador_id (docente_evaluador_id) COMMENT 'Búsqueda por evaluador',
    INDEX idx_estado (estado) COMMENT 'Filtrado por estado del proceso',
    INDEX idx_aprobado (aprobado) COMMENT 'Filtrado por intentos aprobados/reprobados',
    INDEX idx_activo (activo) COMMENT 'Filtrado por estado activo',
    INDEX idx_deleted_at (deleted_at) COMMENT 'Filtrado de soft delete',
    INDEX idx_historial_estado (historial_matricula_id, estado, activo, deleted_at) COMMENT 'Exámenes por evento de historial',
    INDEX idx_historial_aprobado (historial_matricula_id, aprobado, activo, deleted_at) COMMENT 'Intento aprobado para cálculo de nota efectiva',
    INDEX idx_gestion_aprobado (gestion_id, aprobado, activo, deleted_at) COMMENT 'Resultados por gestión'

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Hecho del examen extraordinario. Ancla a historial_matricula_id; tipo de proceso en historial_matricula.tipo_estado. Sin matricula_materia_id, tipo_intento ni numero_intento.';

-- ============================================
-- FASE 3: REHABILITAR FOREIGN KEY CHECKS
-- ============================================

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- FIN DEL SCRIPT
-- ============================================
