-- ============================================
-- MÓDULO DE HISTORIAL Y NIVELACIONES (PARTE 3 de 4)
-- Sistema de Gestión Académica - Instituto INCOS
-- 2 Tablas: historial_previo, nivelaciones
-- 1 ALTER: asignaciones_docentes (política asistencia + cuotas override)
-- ============================================
--
-- Este archivo cierra el módulo académico con dos componentes:
--
-- A) HISTORIAL PREVIO Y NIVELACIONES
--    - historial_previo: materias aprobadas POR FUERA del flujo regular del
--      sistema. Sirve TRES casos:
--        1. ANTIGUO: cursó en INCOS pre-sistema (institucion_origen_id = NULL)
--        2. TRASPASO: materias aprobadas en otro ITT (institucion_origen_id = ITT)
--        3. TRANSITABILIDAD: convalidación en bloque del 1er año de INCOS por
--           Título Técnico Medio (institucion_origen_id = UETHP/CEA)
--    - nivelaciones: hasta 3 intentos de examen de nivelación para materias
--      reprobadas que el estudiante arrastra a gestiones posteriores.
--
-- B) ALTER A asignaciones_docentes
--    Cada docente decide al inicio del año:
--      - Política de asistencia (NO_AFECTA, COMPUTA_NOTA, CAUSA_REPROBACION)
--      - Parámetros asociados a esa política
--      - Override opcional de la cuota teórico/práctico institucional
--
-- NOTA: El ALTER a asistencias (FK a licencias) ya no vive aquí; ahora ambas
-- tablas se modelan integradas en 20-asistencias-y-licencias.sql.
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
--      sus notas reales con tipo_aprobacion = CONVALIDACION.
--
--   3. TRANSITABILIDAD (institucion_origen_id = ID de UETHP/CEA origen):
--      Estudiantes con Título Técnico Medio que ingresan directamente a 2do año.
--      Se cargan las materias del 1er año del plan INCOS como CONVALIDADAS con
--      nota genérica institucional, tipo_aprobacion = CONVALIDACION.
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
--
-- VINCULACIÓN: Se vincula directamente a estudiante_id porque el historial
-- es del estudiante como persona, no de una matrícula específica.
--
-- USO: Para validar prerrequisitos al matricular materias y para emitir
-- certificados. La aplicación consulta esta tabla en paralelo con
-- matriculas_materia (estado=APROBADO) cuando necesita el historial completo.

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
    tipo_aprobacion ENUM('REGULAR', 'NIVELACION', 'RECUPERATORIO', 'CONVALIDACION') DEFAULT 'REGULAR' COMMENT 'Cómo se aprobó: REGULAR (cursando normal en INCOS pre-sistema), NIVELACION (examen de nivelación), RECUPERATORIO (recuperatorio anual), CONVALIDACION (de otra institución, incluye TRASPASO y TRANSITABILIDAD).',

    -- Respaldo documental
    respaldo_documento TEXT COMMENT 'Descripción del documento de respaldo (ej: Certificado de Calificaciones N° 123, Boletín Original Gestión 2023, Título de Técnico Medio UETHP)',
    fecha_carga DATE NULL COMMENT 'Fecha en que se cargó este registro al sistema',

    -- Observaciones
    observaciones TEXT COMMENT 'Observaciones de la carga (ej: documento parcialmente legible, nota estimada, convalidación por transitabilidad con nota genérica)',

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
    INDEX idx_tipo_aprobacion (tipo_aprobacion) COMMENT 'Filtrado por tipo de aprobación',
    INDEX idx_activo (activo) COMMENT 'Filtrado por estado activo',
    INDEX idx_deleted_at (deleted_at) COMMENT 'Filtrado de soft delete',
    INDEX idx_estudiante_asignatura (estudiante_id, asignatura_plan_id, activo, deleted_at) COMMENT 'Validación de prerrequisitos: ¿aprobó esta asignatura?',
    INDEX idx_estudiante_gestion (estudiante_id, gestion_id, activo, deleted_at) COMMENT 'Historial de un estudiante en una gestión específica'

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Materias aprobadas por fuera del flujo regular: ANTIGUO (INCOS pre-sistema, institucion_origen_id NULL), TRASPASO (otro ITT) y TRANSITABILIDAD (UETHP/CEA, convalidación legal de 1er año).';

-- ============================================
-- TABLA: nivelaciones
-- Exámenes de nivelación para materias reprobadas
-- ============================================
-- Cuando un estudiante reprueba una materia y queda con derecho a nivelación,
-- rinde un examen único de recuperación en gestiones posteriores. Tiene hasta
-- 3 intentos antes de perder el derecho:
--   - Intento 1 (NIVELACION_1RA): primera vez en la siguiente gestión
--   - Intento 2 (NIVELACION_2DA): segunda nivelación si falló la primera
--   - Intento 3 (PRUEBA_EXCEPCIONAL): tercer y último intento, Art. 18 reglamento
--
-- Si falla los 3 intentos o vence el plazo, el derecho VENCE y el estudiante
-- debe re-cursar la materia como matrícula regular (matriculas_materia).
--
-- El estado paralelo en historial_matricula registra estas transiciones:
-- NIVELACION_1RA, NIVELACION_2DA, PRUEBA_EXCEPCIONAL, VENCIDA.

CREATE TABLE nivelaciones (
    id INT AUTO_INCREMENT PRIMARY KEY,

    -- Relaciones principales
    estudiante_id INT NULL COMMENT 'Estudiante en nivelación (referencia a estudiantes)',
    matricula_materia_id INT NULL COMMENT 'Materia reprobada original que genera el derecho a nivelación (referencia a matriculas_materia)',
    asignatura_plan_id INT NULL COMMENT 'Asignatura del plan a nivelar (referencia a asignaturas_plan). Puede ser la misma que la reprobada o una equivalente.',
    gestion_nivelacion_id INT NULL COMMENT 'Gestión en la que se rinde la nivelación (referencia a gestiones)',
    docente_evaluador_id INT NULL COMMENT 'Docente que evaluó la nivelación (referencia a docentes)',

    -- Datos del intento
    numero_intento INT NULL DEFAULT 1 COMMENT 'Número de intento (1, 2 o 3 según normativa)',
    fecha_inicio DATE NULL COMMENT 'Fecha de inicio del proceso',
    fecha_examen DATE NULL COMMENT 'Fecha del examen de nivelación',

    -- Resultado
    nota_nivelacion DECIMAL(5,2) NULL COMMENT 'Nota obtenida (0-100). Mínima de aprobación: 61.',
    estado ENUM('PROGRAMADA', 'EN_CURSO', 'APROBADA', 'REPROBADA', 'CANCELADA') DEFAULT 'PROGRAMADA' COMMENT 'Estado del proceso',
    aprobado BOOLEAN NULL COMMENT 'TRUE si aprobó la nivelación, FALSE si reprobó',

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
    FOREIGN KEY (gestion_nivelacion_id) REFERENCES gestiones(id) ON DELETE SET NULL,
    FOREIGN KEY (docente_evaluador_id) REFERENCES docentes(id) ON DELETE SET NULL,

    -- Índices para optimización
    INDEX idx_estudiante_id (estudiante_id) COMMENT 'Búsqueda por estudiante',
    INDEX idx_matricula_materia_id (matricula_materia_id) COMMENT 'Búsqueda por materia reprobada original',
    INDEX idx_asignatura_plan_id (asignatura_plan_id) COMMENT 'Búsqueda por asignatura del plan',
    INDEX idx_gestion_nivelacion_id (gestion_nivelacion_id) COMMENT 'Búsqueda por gestión',
    INDEX idx_estado (estado) COMMENT 'Filtrado por estado',
    INDEX idx_activo (activo) COMMENT 'Filtrado por estado activo',
    INDEX idx_deleted_at (deleted_at) COMMENT 'Filtrado de soft delete',
    INDEX idx_estudiante_asignatura_intento (estudiante_id, asignatura_plan_id, numero_intento, activo, deleted_at) COMMENT 'Control de intentos por estudiante y asignatura'

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Exámenes de nivelación (máximo 3 intentos por materia). Si el estudiante reprueba los 3, pierde el derecho (VENCIDA en historial_matricula) y debe re-cursar.';

-- ============================================
-- FASE 3: REHABILITAR FOREIGN KEY CHECKS
-- ============================================

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- FASE 4: ALTER A asignaciones_docentes
-- Política de asistencia + override de cuota teórico/práctico
-- ============================================
-- Cada docente, al inicio del año, decide la política de asistencia de su curso:
--   - NO_AFECTA: la asistencia no influye en la nota
--   - COMPUTA_NOTA: la asistencia es un componente más, con un peso en la nota
--   - CAUSA_REPROBACION: no entra en la nota pero si baja del mínimo se reprueba
--
-- Adicionalmente, si la materia justifica un split distinto al institucional
-- (ej. taller con 20/80 en lugar del 30/70 estándar), se sobreescribe aquí.
-- Si los campos override son NULL, se usa la cuota institucional de
-- cuota_teorico_practico para la gestión correspondiente.

ALTER TABLE asignaciones_docentes
    ADD COLUMN politica_asistencia ENUM('NO_AFECTA', 'COMPUTA_NOTA', 'CAUSA_REPROBACION') DEFAULT 'NO_AFECTA'
        COMMENT 'Política del docente sobre asistencia: NO_AFECTA (no influye en la nota), COMPUTA_NOTA (es componente de la nota), CAUSA_REPROBACION (si baja del mínimo, reprueba sin importar las notas)',
    ADD COLUMN peso_asistencia DECIMAL(5,2) NULL
        COMMENT 'Peso de la asistencia en la nota_final (0-100). Solo aplica si politica_asistencia = COMPUTA_NOTA.',
    ADD COLUMN porcentaje_minimo_asistencia DECIMAL(5,2) NULL
        COMMENT 'Porcentaje mínimo de asistencia exigido (0-100). Solo aplica si politica_asistencia = CAUSA_REPROBACION. Si el estudiante baja de este porcentaje, se aplica nota_si_reprueba_por_asistencia.',
    ADD COLUMN nota_si_reprueba_por_asistencia DECIMAL(5,2) NULL
        COMMENT 'Nota final asignada al estudiante si reprueba por asistencia (ej: 0 o 50). Solo aplica si politica_asistencia = CAUSA_REPROBACION.',
    ADD COLUMN cuota_teorico_override DECIMAL(5,2) NULL
        COMMENT 'Override de la cuota teórica institucional (cuota_teorico_practico). NULL = usar la cuota institucional de la gestión.',
    ADD COLUMN cuota_practico_override DECIMAL(5,2) NULL
        COMMENT 'Override de la cuota práctica institucional (cuota_teorico_practico). NULL = usar la cuota institucional de la gestión.';

ALTER TABLE asignaciones_docentes
    ADD INDEX idx_politica_asistencia (politica_asistencia) COMMENT 'Filtrado por política de asistencia';

-- ============================================
-- FIN DEL SCRIPT
-- ============================================