-- ============================================
-- MÓDULO DE EVALUACIONES (PARTE 2 de 5) — Refactor 3FN
-- Sistema de Gestión Académica - Instituto INCOS
-- 7 Tablas: tipos_evaluacion, configuracion_evaluacion,
--           bimestres_matricula,
--           evaluaciones, evaluaciones_notas,
--           evaluaciones_finales, evaluaciones_finales_notas
-- ============================================
--
-- Este archivo modela el SISTEMA DE NOTAS Y EVALUACIONES de la gestión vigente.
-- Inscripciones, historial_previo y matrículas en 12-inscripciones.sql.
-- historial_matricula y nivelaciones en 16-nivelaciones.sql.
--
-- REFACTOR 3FN (cambio respecto al schema anterior):
--   El esquema original mezclaba en `evaluaciones` dos entidades distintas: la
--   COLUMNA del cuaderno (nombre, peso, componente, tipo, fecha) y la NOTA
--   individual de cada estudiante. Esto generaba redundancia: 35 estudiantes
--   en un curso = 35 filas con metadatos duplicados de la misma evaluación.
--
--   El refactor separa cada entidad en su tabla:
--     evaluaciones        → columna del cuaderno (1 fila por evaluación lógica)
--     evaluaciones_notas  → celda estudiante × evaluación (carga perezosa)
--   La misma separación se aplica a evaluaciones_finales.
--
-- DECISIÓN DE VINCULACIÓN AL BIMESTRE:
--   `evaluaciones` se vincula al período académico (BIMESTRE) vía
--   `periodo_academico_id`, NO con un campo entero suelto. Esto permite que
--   de una sola FK derive la gestión (periodos_academicos.gestion_id) y el
--   número de bimestre (periodos_academicos.numero_orden). Sin redundancia,
--   coherente con el calendario académico.
--
--   Para recuperar las evaluaciones de un curso × bimestre × gestión:
--     SELECT e.* 
--     FROM evaluaciones e
--     JOIN periodos_academicos p ON p.id = e.periodo_academico_id
--     WHERE e.asignacion_docente_id = ?
--       AND p.gestion_id = ?
--       AND p.numero_orden = ?
--       AND p.division = 'BIMESTRE'
--       AND e.deleted_at IS NULL;
--
-- JERARQUÍA DE EVALUACIÓN (modelo oficial del Registro Académico de Notas INCOS):
--
--   matriculas_materia
--      │
--      ├── bimestres_matricula (4 filas: bimestres 1, 2, 3, 4)
--      │      │
--      │      ├── nota_teorico   (componente oficial, ≤ cuota teórica)
--      │      ├── nota_practico  (componente oficial, ≤ cuota práctica)
--      │      ├── nota_bimestre  = nota_teorico + nota_practico
--      │      ├── nota_habilitacion (si reprobó este bimestre)
--      │      │
--      │      └── evaluaciones_notas (N celdas, una por evaluación con nota cargada)
--      │             └── evaluacion_id → evaluaciones (columna del cuaderno)
--      │
--      └── evaluaciones_finales_notas
--             └── evaluacion_final_id → evaluaciones_finales (columna anual)
--
--   asignaciones_docentes
--      │
--      ├── evaluaciones (N columnas del cuaderno por curso × bimestre)
--      │      ├── periodo_academico_id → bimestre del calendario
--      │      ├── componente: TEORICO o PRACTICO
--      │      ├── nombre, peso, tipo, fecha (UNA fila, no N)
--      │      └── 1:N → evaluaciones_notas
--      │
--      └── evaluaciones_finales (N columnas anuales del curso)
--             ├── gestion_id → gestión a la que aplica
--             ├── nombre, peso, tipo, fecha
--             └── 1:N → evaluaciones_finales_notas
--
-- CARGA PEREZOSA DE CELDAS:
--   Al crear una columna nueva en el cuaderno NO se pre-crean filas en
--   evaluaciones_notas. La fila se inserta cuando el docente carga la primera
--   nota de ese estudiante en esa evaluación. El UI hace LEFT JOIN y muestra
--   celda vacía si no existe.
--
-- COHERENCIA BIMESTRE COLUMNA ↔ BIMESTRE CELDA (validación de aplicación):
--   Al insertar en evaluaciones_notas se valida que:
--     evaluaciones.periodo_academico.numero_orden == bimestres_matricula.bimestre
--   Sin esta validación, una nota podría apuntar a un bimestre "equivocado".
--
-- CONFIGURACIÓN TEÓRICO / PRÁCTICO:
--   - Default institucional por gestión en configuracion_evaluacion (típicamente 30/70)
--   - Override por asignacion_docente (teorico_override / practico_override)
--   - Las evaluaciones componente=TEORICO se promedian ponderado y se reescalan a
--     la cuota_teorico; lo mismo para práctico
--   - nota_bimestre = nota_teorico + nota_practico (≤ 100)
--
-- HABILITACIÓN vs RECUPERATORIO:
--   - Habilitación bimestral: campo nota_habilitacion en bimestres_matricula.
--   - Recuperatorio anual y nivelaciones: tabla nivelaciones (16-nivelaciones.sql).
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

DROP TABLE IF EXISTS evaluaciones_finales_notas;
DROP TABLE IF EXISTS evaluaciones_finales;
DROP TABLE IF EXISTS evaluaciones_notas;
DROP TABLE IF EXISTS evaluaciones;
DROP TABLE IF EXISTS bimestres_matricula;
DROP TABLE IF EXISTS configuracion_evaluacion;
DROP TABLE IF EXISTS tipos_evaluacion;

-- ============================================
-- FASE 2: CREACIÓN DE TABLAS
-- ============================================

-- ============================================
-- TABLA: tipos_evaluacion
-- Catálogo de tipos de evaluación
-- ============================================
-- Catálogo reutilizable entre gestiones. ambito distingue evaluaciones de
-- bimestre (van a `evaluaciones`) vs evaluaciones de materia completa (van
-- a `evaluaciones_finales`).
--
-- Tipos típicos según práctica docente en INCOS:
--   BIMESTRE:        EXAMEN_PARCIAL, PRACTICO, PROYECTO, EXPOSICION, TALLER,
--                    ACTIVIDAD_EXTRACURRICULAR, HABILITACION
--   MATERIA_COMPLETA: PROYECTO_FINAL_ANUAL, EXAMEN_FINAL_ANUAL,
--                     RECUPERATORIO_ANUAL, PRUEBA_EXCEPCIONAL

CREATE TABLE tipos_evaluacion (
    id INT AUTO_INCREMENT PRIMARY KEY,

    -- Identificación
    codigo VARCHAR(40) NOT NULL COMMENT 'Código del tipo (ej: EXAMEN_PARCIAL, PROYECTO_FINAL_ANUAL)',
    nombre VARCHAR(100) NOT NULL COMMENT 'Nombre descriptivo (ej: Examen Parcial, Proyecto Final Anual)',
    descripcion TEXT COMMENT 'Descripción del tipo y cuándo se aplica',

    -- Comportamiento del tipo
    ambito ENUM('BIMESTRE', 'MATERIA_COMPLETA') DEFAULT 'BIMESTRE' 
        COMMENT 'BIMESTRE (vive dentro de un bimestre, va a evaluaciones); MATERIA_COMPLETA (cubre toda la materia, va a evaluaciones_finales)',
    es_recuperatorio BOOLEAN DEFAULT FALSE 
        COMMENT 'TRUE si es evaluación de recuperación (reemplaza nota original). FALSE si se promedia normalmente',

    -- Campos de auditoría y control (ESTÁNDAR)
    activo BOOLEAN DEFAULT TRUE COMMENT 'Registro activo/inactivo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Fecha de modificación',
    deleted_at TIMESTAMP NULL DEFAULT NULL COMMENT 'Soft delete',
    created_by INT NULL COMMENT 'Usuario que creó',
    updated_by INT NULL COMMENT 'Usuario que modificó',
    deleted_by INT NULL COMMENT 'Usuario que eliminó',

    -- NOTA: Las Foreign Keys a usuarios se omiten para evitar dependencias circulares

    -- Índices
    INDEX idx_codigo (codigo) COMMENT 'Búsqueda por código',
    INDEX idx_ambito (ambito) COMMENT 'Filtrado por ámbito de aplicación',
    INDEX idx_es_recuperatorio (es_recuperatorio) COMMENT 'Filtrado por tipo recuperatorio',
    INDEX idx_activo (activo) COMMENT 'Filtrado por estado activo',
    INDEX idx_deleted_at (deleted_at) COMMENT 'Filtrado de soft delete'

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Catálogo de tipos de evaluación reutilizable entre gestiones. ambito distingue evaluaciones de bimestre vs evaluaciones de materia completa.';

-- ============================================
-- TABLA: configuracion_evaluacion
-- Configuración de evaluación y notas por gestión (patrón clave-valor)
-- ============================================
-- Par con tipos_evaluacion: el catálogo dice QUÉ tipos existen, esta tabla
-- almacena la política institucional y parámetros por gestión.
--
-- Clave principal: POLITICA_INSTITUCIONAL — documento JSON con ponderación
-- teórico/práctico, pesos de bimestres, reglas de evaluaciones finales,
-- política de asistencia, nota mínima de aprobación, etc.
--
-- Override por curso (cuotas, asistencia, banderas locales del docente) en
-- asignaciones_docentes y/o en filas adicionales de esta tabla con clave
-- AJUSTES_CURSO_{asignacionId}.

CREATE TABLE configuracion_evaluacion (
    id INT AUTO_INCREMENT PRIMARY KEY,

    -- Relación principal
    gestion_id INT NULL COMMENT 'Gestión a la que aplica (referencia a gestiones)',

    -- Identificación y valor
    clave VARCHAR(100) NOT NULL COMMENT 'Identificador (ej: POLITICA_INSTITUCIONAL, AJUSTES_CURSO_42)',
    valor TEXT NOT NULL COMMENT 'Valor serializado (JSON para política institucional)',
    tipo ENUM('STRING','NUMBER','BOOLEAN','JSON','DATE') DEFAULT 'JSON' 
        COMMENT 'Tipo para deserialización',

    -- Estado
    vigente BOOLEAN DEFAULT FALSE 
        COMMENT 'TRUE = configuración activa para esta gestión y clave (solo una vigente)',
    descripcion TEXT NULL COMMENT 'Descripción legible',

    -- Campos de auditoría y control (ESTÁNDAR)
    activo BOOLEAN DEFAULT TRUE COMMENT 'Registro activo/inactivo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Fecha de modificación',
    deleted_at TIMESTAMP NULL DEFAULT NULL COMMENT 'Soft delete',
    created_by INT NULL COMMENT 'Usuario que creó',
    updated_by INT NULL COMMENT 'Usuario que modificó',
    deleted_by INT NULL COMMENT 'Usuario que eliminó',

    -- Foreign Keys
    FOREIGN KEY (gestion_id) REFERENCES gestiones(id) ON DELETE SET NULL,

    -- Índices
    INDEX idx_gestion_id (gestion_id),
    INDEX idx_clave (clave),
    INDEX idx_gestion_clave_vigente (gestion_id, clave, vigente, activo, deleted_at) 
        COMMENT 'Búsqueda de configuración vigente por gestión y clave',
    INDEX idx_activo (activo),
    INDEX idx_deleted_at (deleted_at)

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Configuración de evaluación por gestión (clave-valor). Política institucional en POLITICA_INSTITUCIONAL; overrides por curso en AJUSTES_CURSO_{asignacionId}.';

-- ============================================
-- TABLA: bimestres_matricula
-- Bimestre operativo de una matrícula a materia
-- ============================================
-- Representa cada uno de los 4 bimestres operativos de una matrícula. Es el
-- contenedor padre de las CELDAS del estudiante en ese bimestre (evaluaciones_notas)
-- y refleja la estructura oficial TEÓRICO + PRÁCTICO del Registro Académico INCOS.
--
-- JERARQUÍA:
--   matriculas_materia → bimestres_matricula (4 filas) → evaluaciones_notas (celdas)
--
-- DIFERENCIA con periodos_academicos:
--   periodos_academicos: el bimestre como PERÍODO del calendario de la gestión
--   bimestres_matricula: el bimestre OPERATIVO del estudiante en una materia
--                        (sus notas, su estado de cierre, su habilitación)
--   Las evaluaciones (columnas) se vinculan al período del calendario.
--   Las notas (celdas) se vinculan al bimestre operativo del estudiante.
--
-- COMPONENTES OFICIALES:
--   - nota_teorico: componente teórico (sobre cuota_teorico, ej. 30)
--   - nota_practico: componente práctico (sobre cuota_practico, ej. 70)
--   - nota_bimestre: nota_teorico + nota_practico (≤ 100)
--
-- HABILITACIÓN BIMESTRAL:
--   Si el estudiante reprueba este bimestre, puede rendir una habilitación
--   cuya nota reemplaza la nota_bimestre original. Aplica solo a este bimestre,
--   no al año completo (eso es recuperatorio/nivelación en 16-nivelaciones.sql).
--
-- ESTADO Y CIERRE:
--   Los bimestres se cierran formalmente en el Consejo de Docentes. Una vez
--   cerrados (estado = CERRADO), las notas no se modifican.

CREATE TABLE bimestres_matricula (
    id INT AUTO_INCREMENT PRIMARY KEY,

    -- Relaciones principales
    matricula_materia_id INT NULL 
        COMMENT 'Matrícula padre (referencia a matriculas_materia)',
    bimestre INT NULL 
        COMMENT 'Número de bimestre operativo (1, 2, 3, 4). Debe coincidir con periodos_academicos.numero_orden del calendario',

    -- Componentes oficiales del boletín
    nota_teorico DECIMAL(5,2) NULL 
        COMMENT 'Nota del componente teórico (sobre cuota_teorico, típicamente ≤30). Calculada como SUMA(nota×peso) de evaluaciones_notas con componente=TEORICO, reescalada a la cuota',
    nota_practico DECIMAL(5,2) NULL 
        COMMENT 'Nota del componente práctico (sobre cuota_practico, típicamente ≤70). Mismo cálculo que teórico',
    nota_bimestre DECIMAL(5,2) NULL 
        COMMENT 'Nota cerrada del bimestre (0-100). Suma de nota_teorico + nota_practico',

    -- Habilitación bimestral
    nota_habilitacion DECIMAL(5,2) NULL 
        COMMENT 'Nota de la habilitación bimestral (0-100). Aplica solo si reprobó este bimestre. Si aprueba, reemplaza nota_bimestre',
    fecha_habilitacion DATE NULL 
        COMMENT 'Fecha en que se rindió la habilitación',

    -- Estado y cierre
    estado ENUM('PENDIENTE', 'EN_CURSO', 'CERRADO') DEFAULT 'PENDIENTE' 
        COMMENT 'PENDIENTE (no iniciado), EN_CURSO (evaluaciones en proceso), CERRADO (firmado en Consejo de Docentes)',

    -- Campos de auditoría y control (ESTÁNDAR)
    activo BOOLEAN DEFAULT TRUE COMMENT 'Registro activo/inactivo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Fecha de modificación',
    deleted_at TIMESTAMP NULL DEFAULT NULL COMMENT 'Soft delete',
    created_by INT NULL COMMENT 'Usuario que creó',
    updated_by INT NULL COMMENT 'Usuario que modificó',
    deleted_by INT NULL COMMENT 'Usuario que eliminó',

    -- Foreign Keys
    FOREIGN KEY (matricula_materia_id) REFERENCES matriculas_materia(id) ON DELETE SET NULL,

    -- Índices
    INDEX idx_matricula_materia_id (matricula_materia_id),
    INDEX idx_bimestre (bimestre),
    INDEX idx_estado (estado),
    INDEX idx_activo (activo),
    INDEX idx_deleted_at (deleted_at),
    INDEX idx_matricula_bimestre (matricula_materia_id, bimestre, activo, deleted_at) 
        COMMENT 'Búsqueda del bimestre operativo específico de una matrícula'

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Bimestre operativo de una matrícula. Contiene los componentes oficiales TEORICO + PRACTICO del boletín y la habilitación bimestral. Padre de evaluaciones_notas del estudiante en ese bimestre.';

-- ============================================
-- TABLA: evaluaciones
-- Columna del cuaderno docente (entidad lógica)
-- ============================================
-- Representa UNA columna del cuaderno: una evaluación que el docente arma
-- para todos los estudiantes de su curso en un bimestre dado.
-- Ejemplos: "Exposición Lesson 1", "Examen Parcial Tema 3", "Práctico Lab 2".
--
-- UNA FILA por evaluación lógica, sin importar cuántos estudiantes tenga el
-- curso. Las notas individuales de cada estudiante viven en evaluaciones_notas.
--
-- VINCULACIÓN AL CURSO Y AL BIMESTRE:
--   - asignacion_docente_id: el curso (docente + materia + paralelo + gestión)
--   - periodo_academico_id: el bimestre del calendario académico
--     De esta FK se derivan: gestión (periodos_academicos.gestion_id) y
--     número de bimestre (periodos_academicos.numero_orden 1..4).
--   No se agregan campos sueltos de gestión o bimestre: todo deriva de aquí.
--
-- VALIDACIÓN DE APLICACIÓN al crear/leer:
--   - periodos_academicos.division debe ser 'BIMESTRE'
--   - periodos_academicos.gestion_id debe coincidir con la gestión del curso
--     (asignaciones_docentes → gestion_plan → gestion)
--   - tipos_evaluacion.ambito debe ser 'BIMESTRE'
--
-- COMPONENTE Y PESO:
--   componente indica si la columna contribuye a nota_teorico o nota_practico
--   del boletín oficial. peso es relativo dentro del componente (los pesos
--   del mismo componente se proporcionan al cerrar el bimestre).
--
-- RECUPERACIÓN: columnas del cuaderno de un curso × bimestre × gestión:
--   SELECT e.*
--   FROM evaluaciones e
--   JOIN periodos_academicos p ON p.id = e.periodo_academico_id
--   WHERE e.asignacion_docente_id = ?
--     AND p.gestion_id = ?
--     AND p.numero_orden = ?
--     AND p.division = 'BIMESTRE'
--     AND e.deleted_at IS NULL;

CREATE TABLE evaluaciones (
    id INT AUTO_INCREMENT PRIMARY KEY,

    -- Relaciones principales
    asignacion_docente_id INT NULL 
        COMMENT 'Curso al que pertenece esta columna (referencia a asignaciones_docentes). De aquí derivan docente, materia, paralelo y gestión',
    periodo_academico_id INT NULL 
        COMMENT 'Bimestre del calendario académico (referencia a periodos_academicos con division=BIMESTRE). De aquí derivan gestión y número de bimestre',
    tipo_evaluacion_id INT NULL 
        COMMENT 'Tipo de evaluación (referencia a tipos_evaluacion). Debe tener ambito=BIMESTRE',

    -- Mapeo al boletín oficial
    componente ENUM('TEORICO', 'PRACTICO') NOT NULL DEFAULT 'PRACTICO' 
        COMMENT 'Componente del boletín al que contribuye: TEORICO suma a nota_teorico, PRACTICO suma a nota_practico',

    -- Identificación de la evaluación
    nombre_evaluacion VARCHAR(255) 
        COMMENT 'Nombre descriptivo (ej: Exposición Lesson 1, Examen Parcial Tema 3, Práctico Lab 2)',
    descripcion TEXT 
        COMMENT 'Descripción o consigna de la evaluación',

    -- Ponderación
    peso DECIMAL(5,2) NULL DEFAULT 1 
        COMMENT 'Peso relativo dentro de su componente (TEORICO o PRACTICO). Los pesos del mismo componente se proporcionan al cerrar el bimestre',
    fecha DATE NULL 
        COMMENT 'Fecha en que se rindió la evaluación',

    -- Control de cierre (a nivel columna)
    notas_cerradas BOOLEAN DEFAULT FALSE 
        COMMENT 'TRUE cuando las notas de esta columna están cerradas y no se pueden modificar',

    -- Campos de auditoría y control (ESTÁNDAR)
    activo BOOLEAN DEFAULT TRUE COMMENT 'Registro activo/inactivo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Fecha de modificación',
    deleted_at TIMESTAMP NULL DEFAULT NULL COMMENT 'Soft delete',
    created_by INT NULL COMMENT 'Usuario que creó',
    updated_by INT NULL COMMENT 'Usuario que modificó',
    deleted_by INT NULL COMMENT 'Usuario que eliminó',

    -- Foreign Keys
    FOREIGN KEY (asignacion_docente_id) REFERENCES asignaciones_docentes(id) ON DELETE SET NULL,
    FOREIGN KEY (periodo_academico_id) REFERENCES periodos_academicos(id) ON DELETE SET NULL,
    FOREIGN KEY (tipo_evaluacion_id) REFERENCES tipos_evaluacion(id) ON DELETE SET NULL,

    -- Índices
    INDEX idx_asignacion_docente_id (asignacion_docente_id),
    INDEX idx_periodo_academico_id (periodo_academico_id),
    INDEX idx_tipo_evaluacion_id (tipo_evaluacion_id),
    INDEX idx_componente (componente),
    INDEX idx_activo (activo),
    INDEX idx_deleted_at (deleted_at),
    INDEX idx_asignacion_periodo (asignacion_docente_id, periodo_academico_id, activo, deleted_at) 
        COMMENT 'Columnas del cuaderno de un curso × bimestre (consulta principal del cuaderno)',
    INDEX idx_asignacion_periodo_componente (asignacion_docente_id, periodo_academico_id, componente, activo, deleted_at) 
        COMMENT 'Columnas por componente para cálculo de nota_teorico/practico'

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Columna del cuaderno docente (entidad lógica). Una fila por evaluación, pertenece al curso (asignacion_docente_id) y al bimestre del calendario (periodo_academico_id). Las notas individuales por estudiante viven en evaluaciones_notas.';

-- ============================================
-- TABLA: evaluaciones_notas
-- Celda del cuaderno: nota de un estudiante en una evaluación
-- ============================================
-- Cada fila es UNA CELDA de la grilla: la nota de un estudiante en una
-- evaluación específica. Es el producto cartesiano evaluación × estudiante
-- con la nota como atributo, almacenado solo cuando hay valor real.
--
-- CARGA PEREZOSA:
--   Al crear una columna en evaluaciones NO se pre-crean filas acá.
--   La fila se inserta cuando el docente carga la primera nota de ese
--   estudiante en esa evaluación. El UI hace LEFT JOIN y muestra celda
--   vacía si no existe.
--
-- COHERENCIA BIMESTRE COLUMNA ↔ BIMESTRE CELDA (validación de aplicación):
--   Al insertar/actualizar se debe validar:
--     evaluaciones.periodo_academico.numero_orden == bimestres_matricula.bimestre
--   Si no coincide, la celda apunta a un bimestre operativo equivocado.
--   Validación 100% en aplicación (sin CHECK en schema).
--
-- ACCESO TÍPICO:
--   - Grilla completa del cuaderno: LEFT JOIN bimestres_matricula × evaluaciones
--   - Cálculo de nota_teorico/practico del estudiante en su bimestre:
--     SELECT en.nota, e.peso
--     FROM evaluaciones_notas en
--     JOIN evaluaciones e ON e.id = en.evaluacion_id
--     WHERE en.bimestre_matricula_id = ?
--       AND e.componente = ?
--       AND en.nota IS NOT NULL
--       AND en.deleted_at IS NULL AND e.deleted_at IS NULL;

CREATE TABLE evaluaciones_notas (
    id INT AUTO_INCREMENT PRIMARY KEY,

    -- Relaciones principales (la celda es la intersección de estas dos)
    evaluacion_id INT NULL 
        COMMENT 'Columna del cuaderno (referencia a evaluaciones). Eje horizontal de la grilla',
    bimestre_matricula_id INT NULL 
        COMMENT 'Estudiante en su bimestre operativo (referencia a bimestres_matricula). Eje vertical de la grilla',

    -- Calificación
    nota DECIMAL(5,2) NULL 
        COMMENT 'Nota obtenida (0-100). Se interpreta sobre 100 y luego se reescala a la cuota del componente al cerrar el bimestre',
    intento INT DEFAULT 1 
        COMMENT 'Número de intento (1 regular; >1 para retomas autorizadas si tipo permite múltiples intentos)',

    -- Campos de auditoría y control (ESTÁNDAR)
    activo BOOLEAN DEFAULT TRUE COMMENT 'Registro activo/inactivo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Fecha de modificación',
    deleted_at TIMESTAMP NULL DEFAULT NULL COMMENT 'Soft delete',
    created_by INT NULL COMMENT 'Usuario que creó',
    updated_by INT NULL COMMENT 'Usuario que modificó',
    deleted_by INT NULL COMMENT 'Usuario que eliminó',

    -- Foreign Keys
    FOREIGN KEY (evaluacion_id) REFERENCES evaluaciones(id) ON DELETE SET NULL,
    FOREIGN KEY (bimestre_matricula_id) REFERENCES bimestres_matricula(id) ON DELETE SET NULL,

    -- Índices
    INDEX idx_evaluacion_id (evaluacion_id),
    INDEX idx_bimestre_matricula_id (bimestre_matricula_id),
    INDEX idx_activo (activo),
    INDEX idx_deleted_at (deleted_at),
    INDEX idx_evaluacion_matricula (evaluacion_id, bimestre_matricula_id, activo, deleted_at) 
        COMMENT 'Acceso directo a la celda (intersección columna × estudiante)',
    INDEX idx_matricula_activo (bimestre_matricula_id, activo, deleted_at) 
        COMMENT 'Todas las notas de un estudiante en su bimestre (cálculo de nota_teorico/practico)'

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Celda del cuaderno: nota de un estudiante en una evaluación específica. Carga perezosa: se inserta al cargar primera nota.';

-- ============================================
-- TABLA: evaluaciones_finales
-- Columna de evaluación final del curso (entidad lógica)
-- ============================================
-- Representa UNA evaluación que cubre toda la materia (no un bimestre):
-- proyecto integrador anual, examen final anual, participación en feria,
-- recuperatorio anual, prueba excepcional.
--
-- DIFERENCIA con evaluaciones (bimestrales):
--   evaluaciones      → pertenece a un bimestre (periodo_academico_id)
--   evaluaciones_finales → pertenece a toda la gestión (gestion_id)
--   El peso de finales aplica a la nota_final completa, no a un bimestre.
--
-- VINCULACIÓN AL CURSO Y A LA GESTIÓN:
--   - asignacion_docente_id: el curso
--   - gestion_id: la gestión a la que aplica
--   Esta gestión debe coincidir con la del curso (asignaciones_docentes →
--   gestion_plan → gestion), validación de aplicación.
--
-- VALIDACIÓN DE APLICACIÓN:
--   - tipos_evaluacion.ambito debe ser 'MATERIA_COMPLETA'
--   - gestion_id == gestión del asignacion_docente_id
--
-- CÁLCULO DE NOTA FINAL:
--   nota_final = (Σ nota_bimestre × peso_bimestre + Σ nota_final × peso_eval_final)
--              ────────────────────────────────────────────────────────────────────
--                        Σ peso_bimestre + Σ peso_eval_final
--
-- EJEMPLO:
--   Bimestres 1-4: peso 20 cada uno (total 80)
--   Proyecto final anual: peso 20
--   Total ponderado: 100, distribuido entre 5 elementos

CREATE TABLE evaluaciones_finales (
    id INT AUTO_INCREMENT PRIMARY KEY,

    -- Relaciones principales
    asignacion_docente_id INT NULL 
        COMMENT 'Curso al que pertenece esta evaluación final (referencia a asignaciones_docentes)',
    tipo_evaluacion_id INT NULL 
        COMMENT 'Tipo de evaluación (referencia a tipos_evaluacion). Debe tener ambito=MATERIA_COMPLETA',

    -- Identificación
    nombre_evaluacion VARCHAR(200) 
        COMMENT 'Nombre descriptivo (ej: Proyecto Integrador Web, Examen Final Anual, Feria de Innovación)',
    descripcion TEXT 
        COMMENT 'Descripción o consigna detallada',

    -- Ponderación
    peso DECIMAL(5,2) NULL DEFAULT 1 
        COMMENT 'Peso en el cálculo de nota_final, en escala comparable a peso_bimestre',
    fecha DATE NULL 
        COMMENT 'Fecha en que se rinde/entrega',

    -- Control de cierre
    notas_cerradas BOOLEAN DEFAULT FALSE 
        COMMENT 'TRUE cuando las notas de esta evaluación final están cerradas',

    -- Campos de auditoría y control (ESTÁNDAR)
    activo BOOLEAN DEFAULT TRUE COMMENT 'Registro activo/inactivo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Fecha de modificación',
    deleted_at TIMESTAMP NULL DEFAULT NULL COMMENT 'Soft delete',
    created_by INT NULL COMMENT 'Usuario que creó',
    updated_by INT NULL COMMENT 'Usuario que modificó',
    deleted_by INT NULL COMMENT 'Usuario que eliminó',

    -- Foreign Keys
    FOREIGN KEY (asignacion_docente_id) REFERENCES asignaciones_docentes(id) ON DELETE SET NULL,
    FOREIGN KEY (tipo_evaluacion_id) REFERENCES tipos_evaluacion(id) ON DELETE SET NULL,

    -- Índices
    INDEX idx_asignacion_docente_id (asignacion_docente_id),
    INDEX idx_tipo_evaluacion_id (tipo_evaluacion_id),
    INDEX idx_activo (activo),
    INDEX idx_deleted_at (deleted_at),
    INDEX idx_asignacion_gestion (asignacion_docente_id, activo, deleted_at) 
        COMMENT 'Evaluaciones finales de un curso en una gestión',
    INDEX idx_asignacion_tipo (asignacion_docente_id, tipo_evaluacion_id, activo, deleted_at) 
        COMMENT 'Evaluaciones finales de un tipo específico'

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Columna de evaluación final del curso (entidad lógica). Cubre toda la materia. Una fila por evaluación, pertenece al curso y a la gestión. Las notas por estudiante viven en evaluaciones_finales_notas.';

-- ============================================
-- TABLA: evaluaciones_finales_notas
-- Celda de evaluación final: nota de un estudiante en una evaluación anual
-- ============================================
-- Cada fila es la nota de un estudiante en una evaluación final del curso.
-- Carga perezosa: se inserta cuando el docente carga la primera nota.
--
-- COHERENCIA CURSO COLUMNA ↔ CURSO MATRÍCULA (validación de aplicación):
--   evaluaciones_finales.asignacion_docente_id == matriculas_materia.asignacion_docente_id
--   Sin esta validación, una nota podría apuntar a un curso equivocado.
--
-- ACCESO TÍPICO (cálculo de nota final del estudiante):
--   SELECT efn.nota, ef.peso
--   FROM evaluaciones_finales ef
--   LEFT JOIN evaluaciones_finales_notas efn 
--     ON efn.evaluacion_final_id = ef.id 
--     AND efn.matricula_materia_id = ?
--   WHERE ef.asignacion_docente_id = ?
--     AND ef.activo = TRUE AND ef.deleted_at IS NULL;

CREATE TABLE evaluaciones_finales_notas (
    id INT AUTO_INCREMENT PRIMARY KEY,

    -- Relaciones principales
    evaluacion_final_id INT NULL 
        COMMENT 'Evaluación final del curso (referencia a evaluaciones_finales). Eje horizontal',
    matricula_materia_id INT NULL 
        COMMENT 'Matrícula del estudiante a la materia (referencia a matriculas_materia). Eje vertical. NO va a bimestre_matricula porque la nota es anual, no de un bimestre',

    -- Calificación
    nota DECIMAL(5,2) NULL 
        COMMENT 'Nota obtenida (0-100). Se pondera junto con los bimestres para la nota_final',
    intento INT DEFAULT 1 
        COMMENT 'Número de intento (1 regular; >1 para retomas si tipo permite múltiples intentos)',

    -- Campos de auditoría y control (ESTÁNDAR)
    activo BOOLEAN DEFAULT TRUE COMMENT 'Registro activo/inactivo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Fecha de modificación',
    deleted_at TIMESTAMP NULL DEFAULT NULL COMMENT 'Soft delete',
    created_by INT NULL COMMENT 'Usuario que creó',
    updated_by INT NULL COMMENT 'Usuario que modificó',
    deleted_by INT NULL COMMENT 'Usuario que eliminó',

    -- Foreign Keys
    FOREIGN KEY (evaluacion_final_id) REFERENCES evaluaciones_finales(id) ON DELETE SET NULL,
    FOREIGN KEY (matricula_materia_id) REFERENCES matriculas_materia(id) ON DELETE SET NULL,

    -- Índices
    INDEX idx_evaluacion_final_id (evaluacion_final_id),
    INDEX idx_matricula_materia_id (matricula_materia_id),
    INDEX idx_activo (activo),
    INDEX idx_deleted_at (deleted_at),
    INDEX idx_evaluacion_matricula (evaluacion_final_id, matricula_materia_id, activo, deleted_at) 
        COMMENT 'Acceso directo a la celda (evaluación final × estudiante)',
    INDEX idx_matricula_activo (matricula_materia_id, activo, deleted_at) 
        COMMENT 'Todas las notas finales de un estudiante en una materia (para cálculo de nota_final)'

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Celda de evaluación final: nota de un estudiante en una evaluación que cubre toda la materia. FK a matricula_materia (no a bimestre) porque la nota es anual. Carga perezosa.';

-- ============================================
-- FASE 3: REHABILITAR FOREIGN KEY CHECKS
-- ============================================

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- FIN DEL SCRIPT
-- ============================================