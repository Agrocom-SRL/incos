-- ============================================
-- MÓDULO DE INSCRIPCIONES (PARTE 1 de 5)
-- Sistema de Gestión Académica - Instituto INCOS
-- 2 Tablas: inscripciones, matriculas_materia
-- ============================================
--
-- Este archivo modela la MATRICULACIÓN del estudiante a una gestión y su matrícula
-- a cada materia. Las notas y evaluaciones viven en 13-evaluaciones.sql; el
-- historial previo y nivelaciones en 16-nivelaciones.sql; historial_matricula
-- en 17-historial-matricula.sql; asistencias y licencias en 18-asistencias-licencias.sql.
--
-- FLUJO DE NEGOCIO:
--   1. El estudiante se matricula a una gestión → inscripciones (tipo: NUEVO,
--      ANTIGUO, TRASPASO o TRANSITABILIDAD según el origen de la admisión)
--   2. Se le crean N matriculas_materia (una por cada materia que cursa).
--      Incluye materias del periodo regular y atrasadas (re-cursadas).
--   3. Durante la gestión, su estado evoluciona: INSCRITO → CURSANDO → APROBADO
--      o REPROBADO o ABANDONO o RETIRADO. Cada transición operativa fina
--      (NIVELACION_1RA, RECUPERATORIO_ANUAL, VENCIDA, CHOQUE_HORARIO, ARTICULO_18,
--      etc.) se registra en historial_matricula, permitiendo reconstruir el ciclo
--      de vida completo.
--   4. matriculas_materia.estado almacena el RESULTADO ACADÉMICO consolidado;
--      historial_matricula almacena la HISTORIA OPERATIVA detallada.
--
-- DECISIÓN DE DISEÑO (separación de responsabilidades, 3FN limpia):
-- - matriculas_materia: solo nota_final (caché del cálculo regular ponderado).
--   Sin campos excepcionales (recuperatorio, abandono, retiro) que estarían
--   NULL en 90%+ de los registros.
-- - historial_matricula: cronología de transiciones + 2 caminos según el caso:
--   a. Para INTENTOS ACADÉMICOS (RECUPERATORIO_ANUAL, NIVELACION_1RA/2DA,
--      PRUEBA_EXCEPCIONAL): FK nivelacion_id apunta a tabla nivelaciones
--      (16-nivelaciones.sql) donde vive la nota real del intento con su evaluador y fecha.
--   b. Para DECISIONES ADMINISTRATIVAS (ABANDONO, RETIRADO, ARTICULO_18):
--      nota_resultante + nota_forzada=TRUE guardan la nota fijada por decisión
--      directamente en esta tabla (no requiere intento académico).
-- - nivelaciones: intentos académicos con su nota real y datos del examen.
--
-- CÁLCULO DE NOTA EFECTIVA (lógica de aplicación):
--   1. ¿Existe historial_matricula vigente con nota_forzada=TRUE?
--      SÍ → nota_efectiva = nota_resultante (caso administrativo)
--   2. SINO ¿existe nivelacion aprobada vinculada vía historial_matricula.nivelacion_id?
--      SÍ → nota_efectiva = nivelaciones.nota_nivelacion (caso intento académico aprobado)
--   3. SINO → nota_efectiva = matriculas_materia.nota_final (cálculo regular)
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

DROP TABLE IF EXISTS matriculas_materia;
DROP TABLE IF EXISTS inscripciones;

-- ============================================
-- FASE 2: CREACIÓN DE TABLAS
-- ============================================

-- ============================================
-- TABLA: inscripciones
-- Matriculación del estudiante a una gestión académica
-- ============================================
-- Una inscripción representa la matrícula del estudiante en una gestión específica.
-- Vincula al estudiante (vía sus datos académicos) con la gestión académica.
-- De una inscripción dependen las matriculas_materia (qué materias cursa ese año).
--
-- El tipo_inscripcion refleja el ORIGEN DE LA ADMISIÓN (estable a futuro) y se
-- alinea con estudiantes_datos_academicos.tipo_admision:
--   - NUEVO: primera inscripción del estudiante en INCOS desde bachillerato regular.
--     Inscribe bloque completo del periodo 1 (todas las materias del primer año).
--   - ANTIGUO: ya cursó en INCOS antes (incluye reingreso tras abandono).
--     Puede inscribir paralelo del siguiente periodo más materias arrastradas.
--   - TRASPASO: viene de otro ITT con periodo completo aprobado en origen.
--     Sus materias aprobadas se cargan en historial_previo con tipo_aprobacion=CONVALIDACION.
--   - TRANSITABILIDAD: viene de UETHP/CEA con Título Técnico Medio. Ingresa
--     directamente a 2do año por convalidación legal. Las materias del 1er año
--     se cargan en historial_previo como CONVALIDACION con nota genérica.

CREATE TABLE inscripciones (
    id INT AUTO_INCREMENT PRIMARY KEY,

    -- Relaciones principales
    gestion_id INT NULL COMMENT 'Gestión académica (año lectivo) en la que se inscribe (referencia a gestiones)',
    datos_academicos_id INT NULL COMMENT 'Datos académicos del estudiante (referencia a estudiantes_datos_academicos). Contiene la carrera y gestión de ingreso.',

    -- Tipo de inscripción y vínculos con admisiones especiales
    tipo_inscripcion ENUM('NUEVO', 'ANTIGUO', 'TRASPASO', 'TRANSITABILIDAD') DEFAULT 'ANTIGUO'
        COMMENT 'Tipo de inscripción alineado con estudiantes_datos_academicos.tipo_admision',

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

    FOREIGN KEY (gestion_id) REFERENCES gestiones(id) ON DELETE SET NULL,
    FOREIGN KEY (datos_academicos_id) REFERENCES estudiantes_datos_academicos(id) ON DELETE SET NULL,

    -- Índices para optimización
    INDEX idx_datos_academicos_id (datos_academicos_id) COMMENT 'Búsqueda por datos académicos del estudiante',
    INDEX idx_gestion_id (gestion_id) COMMENT 'Búsqueda por gestión',
    INDEX idx_tipo_inscripcion (tipo_inscripcion) COMMENT 'Filtrado por tipo de inscripción en la gestión',
    INDEX idx_activo (activo) COMMENT 'Filtrado por estado activo',
    INDEX idx_deleted_at (deleted_at) COMMENT 'Filtrado de soft delete',
    INDEX idx_estudiante_gestion (datos_academicos_id, gestion_id, activo, deleted_at) COMMENT 'Búsqueda de inscripciones por estudiante y gestión',
    INDEX idx_gestion_activo (gestion_id, activo, deleted_at) COMMENT 'Búsqueda de inscripciones por gestión'

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Matriculación del estudiante a una gestión. traspaso_id/transitabilidad_id vinculan con sus módulos. El tipo_inscripcion describe el origen de la admisión.';

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
--
-- SIMPLIFICACIÓN DE NOTAS (refactor por 3FN):
-- Esta tabla guarda SOLO nota_final como caché del cálculo regular ponderado
-- (4 bimestres + N evaluaciones_finales). Los casos excepcionales viven en
-- historial_matricula con dos modalidades:
--   - Casos administrativos (ABANDONO/RETIRADO/ARTICULO_18) → nota directamente
--     en historial_matricula.nota_resultante con nota_forzada=TRUE
--   - Intentos académicos (RECUPERATORIO_ANUAL, NIVELACION, PRUEBA_EXCEPCIONAL)
--     → historial_matricula.nivelacion_id apunta a tabla nivelaciones donde
--     vive la nota real del examen

CREATE TABLE matriculas_materia (
    id INT AUTO_INCREMENT PRIMARY KEY,

    -- Relaciones principales
    inscripcion_id INT NULL COMMENT 'Inscripción a la gestión (referencia a inscripciones)',
    asignacion_docente_id INT NULL COMMENT 'Asignación docente (curso + docente + gestion_plan) a la que se matricula',
    asignatura_plan_id INT NULL COMMENT 'Asignatura del plan (redundancia controlada). Preserva el vínculo con la materia/plan original aunque la asignación docente cambie o se elimine.',

    -- Resumen académico (caché del cálculo regular)
    nota_final DECIMAL(5,2) NULL COMMENT 'Nota final calculada (0-100). Caché del cálculo regular: SUMA_PONDERADA(4 bimestres + N evaluaciones finales) / SUMA(pesos). Nota mínima para aprobar: 61. Los casos excepcionales viven en historial_matricula (con nota_resultante para casos administrativos o nivelacion_id para intentos académicos).',

    -- Estado de la materia (resultado consolidado)
    estado ENUM(
        'INSCRITO',
        'CURSANDO',
        'APROBADO',
        'REPROBADO',
        'ABANDONO',
        'RETIRADO'
    ) DEFAULT 'INSCRITO' COMMENT 'Estado consolidado: INSCRITO (sin iniciar), CURSANDO (en curso), APROBADO (nota efectiva >= 61), REPROBADO (nota efectiva < 61), ABANDONO (dejó de asistir), RETIRADO (retiro formal). El ciclo de vida operativo detallado vive en historial_matricula.',

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
    INDEX idx_estado (estado) COMMENT 'Filtrado por estado',
    INDEX idx_activo (activo) COMMENT 'Filtrado por estado activo',
    INDEX idx_deleted_at (deleted_at) COMMENT 'Filtrado de soft delete',
    INDEX idx_inscripcion_estado (inscripcion_id, estado, activo, deleted_at) COMMENT 'Materias de una inscripción por estado',
    INDEX idx_asignatura_estado (asignatura_plan_id, estado, activo, deleted_at) COMMENT 'Búsqueda de aprobados/reprobados por asignatura'

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Matrícula del estudiante a cada materia de la gestión. nota_final es caché del cálculo regular ponderado. Los casos excepcionales viven en historial_matricula (nota_resultante para administrativos, nivelacion_id para intentos académicos).';

-- ============================================
-- FASE 3: REHABILITAR FOREIGN KEY CHECKS
-- ============================================

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- FIN DEL SCRIPT
-- ============================================