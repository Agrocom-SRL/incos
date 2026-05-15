-- ============================================
-- MÓDULO DE HISTORIAL Y NIVELACIONES (PARTE 3 de 4)
-- Sistema de Gestión Académica - Instituto INCOS
-- 2 Tablas: historial_previo, nivelaciones
-- 2 ALTERS: asignaciones_docentes (política asistencia + cuotas override),
--           historial_matricula (FK a nivelaciones)
-- ============================================
--
-- Este archivo cierra el módulo académico con tres componentes:
--
-- A) HISTORIAL PREVIO
--    historial_previo: materias aprobadas POR FUERA del flujo regular del
--    sistema. Sirve TRES casos diferenciados por institucion_origen_id:
--      1. ANTIGUO: cursó en INCOS pre-sistema (institucion_origen_id = NULL)
--      2. TRASPASO: materias aprobadas en otro ITT (institucion_origen_id = ITT)
--      3. TRANSITABILIDAD: convalidación en bloque del 1er año de INCOS por
--         Título Técnico Medio (institucion_origen_id = UETHP/CEA)
--
-- B) NIVELACIONES (intentos académicos de recuperación)
--    Tabla unificada para los 4 tipos de intentos académicos donde el
--    estudiante recupera una materia reprobada:
--      - RECUPERATORIO_ANUAL: examen al cierre de la misma gestión (último
--        intento antes de declarar la materia reprobada)
--      - NIVELACION_1RA: primer intento en gestiones posteriores
--      - NIVELACION_2DA: segundo intento si falló el primero
--      - PRUEBA_EXCEPCIONAL: tercer y último intento (Art. 18 del reglamento)
--    Después de PRUEBA_EXCEPCIONAL reprobada o vencimiento del plazo, el
--    derecho VENCE y el estudiante debe re-cursar como matrícula regular.
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
DROP TABLE IF EXISTS historial_previo;

-- ============================================
-- FASE 2: CREACIÓN DE TABLAS
-- ============================================

-- ============================================
-- TABLA: historial_previo
-- Materias aprobadas por fuera del flujo regular del sistema
-- ============================================
-- Registro de materias aprobadas que NO provienen del flujo regular de
-- matriculas_materia. Cubre tres casos diferenciados por institucion_origen_id:
--
--   1. ANTIGUO (institucion_origen_id = NULL):
--      Estudiantes que cursaron en INCOS antes de la implementación del sistema
--      (típicamente 2021-2025). Se carga manualmente desde certificados o
--      registros en papel al matricularlos en la gestión vigente.
--
--   2. TRASPASO (institucion_origen_id = ID del ITT origen):
--      Estudiantes que vienen de otro ITT con materias aprobadas. Se cargan
--      sus notas reales.
--
--   3. TRANSITABILIDAD (institucion_origen_id = ID de UETHP/CEA origen):
--      Estudiantes con Título Técnico Medio que ingresan directamente a 2do año.
--      Se cargan las materias del 1er año del plan INCOS como CONVALIDADAS con
--      nota genérica institucional.
--
-- DISEÑO COMO TABLA SEPARADA (no como matricula sintética con FKs en NULL):
-- El contexto pre-sistema / convalidación es estructuralmente distinto al
-- flujo regular: no hay asignacion_docente, no se conoce el paralelo, no hay
-- bimestres ni evaluaciones, no hay gestion_plan. Forzar el modelo regular
-- obligaría a dejar la mayoría de FKs en NULL permanentemente, violando 3FN.
--
-- ALCANCE: Solo se registran materias APROBADAS. Las reprobadas no se cargan
-- porque el estudiante debe re-cursarlas en la gestión vigente como matrícula
-- regular en su paralelo.

CREATE TABLE historial_previo (
    id INT AUTO_INCREMENT PRIMARY KEY,

    -- Relaciones principales
    estudiante_id INT NULL COMMENT 'Estudiante propietario del historial (referencia a estudiantes)',
    asignatura_plan_id INT NULL COMMENT 'Asignatura del plan que aprobó (referencia a asignaturas_plan)',
    gestion_id INT NULL COMMENT 'Gestión en que cursó la materia (referencia a gestiones). Para ANTIGUO típicamente 2021-2025; para TRASPASO/TRANSITABILIDAD: gestión de admisión o NULL.',

    -- Origen de la aprobación (diferencia ANTIGUO de TRASPASO / TRANSITABILIDAD)
    institucion_origen_id INT NULL COMMENT 'Institución donde se aprobó la materia (referencia a instituciones). NULL = INCOS pre-sistema (caso ANTIGUO). Con valor = TRASPASO (ITT) o TRANSITABILIDAD (UETHP/CEA).',

    -- Resultado académico
    nota_final DECIMAL(5,2) NULL COMMENT 'Nota final obtenida (0-100). Nota mínima para aprobar: 61. Para TRANSITABILIDAD puede ser nota genérica institucional (ej. 70) ya que la convalidación es legal en bloque.',
    estado ENUM('APROBADO', 'CONVALIDADO') DEFAULT 'APROBADO' COMMENT 'Estado: APROBADO (cursó y aprobó), CONVALIDADO (por convalidación de otra institución o transitabilidad legal). Solo se registran resultados positivos.',
    
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
    FOREIGN KEY (asignatura_plan_id) REFERENCES asignaturas_plan(id) ON DELETE SET NULL,
    FOREIGN KEY (gestion_id) REFERENCES gestiones(id) ON DELETE SET NULL,
    FOREIGN KEY (institucion_origen_id) REFERENCES instituciones(id) ON DELETE SET NULL,

    -- Índices para optimización
    INDEX idx_estudiante_id (estudiante_id) COMMENT 'Búsqueda por estudiante',
    INDEX idx_asignatura_plan_id (asignatura_plan_id) COMMENT 'Búsqueda por asignatura del plan',
    INDEX idx_gestion_id (gestion_id) COMMENT 'Búsqueda por gestión',
    INDEX idx_institucion_origen_id (institucion_origen_id) COMMENT 'Búsqueda por institución de origen',
    INDEX idx_estado (estado) COMMENT 'Filtrado por estado',
    INDEX idx_activo (activo) COMMENT 'Filtrado por estado activo',
    INDEX idx_deleted_at (deleted_at) COMMENT 'Filtrado de soft delete',
    INDEX idx_estudiante_asignatura (estudiante_id, asignatura_plan_id, activo, deleted_at) COMMENT 'Validación de prerrequisitos: ¿aprobó esta asignatura?',
    INDEX idx_estudiante_gestion (estudiante_id, gestion_id, activo, deleted_at) COMMENT 'Historial de un estudiante en una gestión específica'

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Materias aprobadas por fuera del flujo regular: ANTIGUO (INCOS pre-sistema, institucion_origen_id NULL), TRASPASO (otro ITT) y TRANSITABILIDAD (UETHP/CEA, convalidación legal de 1er año).';

-- ============================================
-- TABLA: nivelaciones
-- Intentos académicos de recuperación de materia reprobada
-- ============================================
-- Tabla unificada para los 4 tipos de intentos académicos donde el estudiante
-- recupera una materia reprobada. Cada fila representa UN intento con su nota,
-- fecha, evaluador y resultado.
--
-- TIPOS DE INTENTO (campo tipo_intento):
--   - RECUPERATORIO_ANUAL: examen al cierre de la MISMA gestión. Último
--     intento antes de declarar la materia reprobada. Lo evalúa típicamente
--     el mismo docente de la materia.
--   - NIVELACION_1RA: primer intento en gestiones POSTERIORES. Si reprobó la
--     materia en gestión X, puede rendir nivelación en X+1.
--   - NIVELACION_2DA: segundo intento si falló la primera nivelación.
--   - PRUEBA_EXCEPCIONAL: tercer y último intento, conforme Art. 18 del
--     reglamento. Después de fallar este, el derecho VENCE y debe re-cursar.
--
-- RELACIÓN CON historial_matricula:
-- Cada fila aquí se vincula con UNA fila en historial_matricula cuyo
-- tipo_estado coincide (RECUPERATORIO_ANUAL, NIVELACION_1RA, NIVELACION_2DA,
-- PRUEBA_EXCEPCIONAL). El vínculo se mantiene mediante la FK
-- historial_matricula.nivelacion_id (agregada vía ALTER en este archivo).
-- historial_matricula registra "qué pasó y cuándo"; nivelaciones registra
-- "los datos académicos del intento".
--
-- CONTROL DE INTENTOS:
-- numero_intento se incrementa secuencialmente: 0 para RECUPERATORIO_ANUAL
-- (intento 0 = recuperación en la misma gestión), 1 para NIVELACION_1RA,
-- 2 para NIVELACION_2DA, 3 para PRUEBA_EXCEPCIONAL. La validación de no
-- exceder 3 intentos (sin contar el recuperatorio anual) vive en la aplicación.

CREATE TABLE nivelaciones (
    id INT AUTO_INCREMENT PRIMARY KEY,

    -- Relaciones principales
    estudiante_id INT NULL COMMENT 'Estudiante que rinde el intento (referencia a estudiantes)',
    matricula_materia_id INT NULL COMMENT 'Materia reprobada original que genera el derecho a recuperar (referencia a matriculas_materia)',
    asignatura_plan_id INT NULL COMMENT 'Asignatura del plan a recuperar (referencia a asignaturas_plan). Puede ser la misma que la reprobada o una equivalente.',
    gestion_id INT NULL COMMENT 'Gestión en la que se rinde el intento (referencia a gestiones). Para RECUPERATORIO_ANUAL es la misma gestión de la matrícula; para NIVELACION/PRUEBA_EXCEPCIONAL es una posterior.',
    docente_evaluador_id INT NULL COMMENT 'Docente que evaluó el intento (referencia a docentes)',

    -- Tipo y control de intento
    tipo_intento ENUM(
        'RECUPERATORIO_ANUAL',
        'NIVELACION_1RA',
        'NIVELACION_2DA',
        'PRUEBA_EXCEPCIONAL'
    ) NOT NULL DEFAULT 'NIVELACION_1RA' COMMENT 'Tipo de intento académico: RECUPERATORIO_ANUAL (al cierre de la misma gestión, intento 0), NIVELACION_1RA (intento 1, gestión siguiente), NIVELACION_2DA (intento 2), PRUEBA_EXCEPCIONAL (intento 3, último según Art. 18).',
    
    -- Datos del intento
    fecha_examen DATE NULL COMMENT 'Fecha del examen',
    numero_intento INT NULL DEFAULT 1 COMMENT 'Número secuencial de intento: 0 = RECUPERATORIO_ANUAL, 1 = NIVELACION_1RA, 2 = NIVELACION_2DA, 3 = PRUEBA_EXCEPCIONAL. Los intentos académicos posteriores al recuperatorio anual no deben exceder 3 (validación de aplicación).',

    -- Resultado
    nota_nivelacion DECIMAL(5,2) NULL COMMENT 'Nota obtenida (0-100). Mínima de aprobación: 61.',
    estado ENUM('PROGRAMADA', 'EN_CURSO', 'APROBADA', 'REPROBADA', 'CANCELADA') DEFAULT 'PROGRAMADA' COMMENT 'Estado del proceso',
    aprobado BOOLEAN NULL COMMENT 'TRUE si aprobó (nota_nivelacion >= 61), FALSE si reprobó',

    -- Observaciones
    observaciones TEXT COMMENT 'Observaciones del proceso',

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
    FOREIGN KEY (matricula_materia_id) REFERENCES matriculas_materia(id) ON DELETE SET NULL,
    FOREIGN KEY (asignatura_plan_id) REFERENCES asignaturas_plan(id) ON DELETE SET NULL,
    FOREIGN KEY (gestion_id) REFERENCES gestiones(id) ON DELETE SET NULL,
    FOREIGN KEY (docente_evaluador_id) REFERENCES docentes(id) ON DELETE SET NULL,

    -- Índices para optimización
    INDEX idx_estudiante_id (estudiante_id) COMMENT 'Búsqueda por estudiante',
    INDEX idx_matricula_materia_id (matricula_materia_id) COMMENT 'Búsqueda por materia reprobada original',
    INDEX idx_asignatura_plan_id (asignatura_plan_id) COMMENT 'Búsqueda por asignatura del plan',
    INDEX idx_gestion_id (gestion_id) COMMENT 'Búsqueda por gestión',
    INDEX idx_tipo_intento (tipo_intento) COMMENT 'Filtrado por tipo de intento',
    INDEX idx_estado (estado) COMMENT 'Filtrado por estado',
    INDEX idx_aprobado (aprobado) COMMENT 'Filtrado por intentos aprobados/reprobados',
    INDEX idx_activo (activo) COMMENT 'Filtrado por estado activo',
    INDEX idx_deleted_at (deleted_at) COMMENT 'Filtrado de soft delete',
    INDEX idx_estudiante_asignatura_tipo (estudiante_id, asignatura_plan_id, tipo_intento, activo, deleted_at) COMMENT 'Control de intentos por estudiante, asignatura y tipo',
    INDEX idx_matricula_tipo (matricula_materia_id, tipo_intento, activo, deleted_at) COMMENT 'Intentos asociados a una matrícula específica'

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Intentos académicos de recuperación de materia reprobada. 4 tipos: RECUPERATORIO_ANUAL (misma gestión), NIVELACION_1RA/2DA (gestiones posteriores), PRUEBA_EXCEPCIONAL (último intento Art. 18). Vinculado con historial_matricula vía nivelacion_id.';

-- ============================================
-- FASE 3: REHABILITAR FOREIGN KEY CHECKS
-- ============================================

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- FIN DEL SCRIPT
-- ============================================