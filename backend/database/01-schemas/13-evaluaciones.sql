-- ============================================
-- MÓDULO DE EVALUACIONES (PARTE 2 de 5) — Refactor 3FN
-- Sistema de Gestión Académica - Instituto INCOS
-- 5 Tablas: tipos_evaluacion, configuracion_evaluacion,
--           bimestres_matricula,
--           evaluaciones, evaluaciones_notas
-- ============================================
--
-- Este archivo modela el SISTEMA DE NOTAS Y EVALUACIONES de la gestión vigente.
-- Inscripciones, historial_previo y matrículas en 12-inscripciones.sql.
-- historial_matricula y nivelaciones en 16-nivelaciones.sql.
--
-- REFACTOR 3FN (cambio respecto al schema anterior):
--   El esquema original mezclaba en `evaluaciones` dos entidades distintas: la
--   COLUMNA del cuaderno (nombre, puntos, componente, tipo, fecha) y la NOTA
--   individual de cada estudiante. Esto generaba redundancia: 35 estudiantes
--   en un curso = 35 filas con metadatos duplicados de la misma evaluación.
--
--   El refactor separa cada entidad en su tabla:
--     evaluaciones        → columna del cuaderno (1 fila por evaluación lógica)
--     evaluaciones_notas  → celda estudiante × evaluación (carga perezosa)
--
-- NOTA FINAL DE LA MATERIA:
--   Solo suma ponderada de los 4 bimestres (pesos en POLITICA_INSTITUCIONAL).
--   No hay examen único, proyecto final ni evaluación anual que se sume al promedio.
--   Los casos excepcionales (recuperatorio, nivelación) viven en 16-nivelaciones.sql.
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
--      └── nota_final (caché) = Σ nota_bimestre × peso_bimestre / Σ peso
--
--   asignaciones_docentes
--      │
--      └── evaluaciones (N columnas del cuaderno por curso × bimestre)
--             ├── periodo_academico_id → bimestre del calendario
--             ├── componente: TEORICO o PRACTICO
--             ├── nombre, puntos, tipo, fecha (UNA fila, no N)
--             └── 1:N → evaluaciones_notas
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
-- CONFIGURACIÓN TEÓRICO / PRÁCTICO Y NOTA ANUAL:
--   - Política institucional por gestión en configuracion_evaluacion (POLITICA_INSTITUCIONAL):
--     cuotas teórico/práctico, pesos de bimestres, nota mínima, asistencia default.
--   - Solo administración define y modifica esa política (POLITICA_INSTITUCIONAL).
--   - Los docentes no parametrizan cuotas, pesos ni asistencia por curso.
--   - Cada actividad (evaluaciones) tiene puntos fijos (puntos) que suman a la cuota
--     del componente (teórico 30, práctico 70 por defecto en POLITICA_INSTITUCIONAL)
--   - Cada celda (evaluaciones_notas.nota) guarda puntos obtenidos (entero 0..puntos)
--   - nota_teorico / nota_practico = SUMA de puntos obtenidos por actividad del componente
--   - nota_bimestre = nota_teorico + nota_practico (≤ 100 puntos)
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
-- Catálogo de tipos de evaluación (bimestrales)
-- ============================================
-- Catálogo reutilizable entre gestiones. Todos los tipos aplican dentro de un
-- bimestre y se usan en la tabla `evaluaciones`.
--
-- Tipos típicos (catálogo en 58-seed-tipos-evaluacion.sql), p. ej.:
--   Práctico: PRACTICA, EJERCICIO, EVALUACION_APLICACION, TALLER, LABORATORIO…
--   Teórico: CUESTIONARIO, CONCEPTUAL, CONTROL_LECTURA, PRUEBA_OBJETIVA…
--   Recuperación: HABILITACION (es_recuperatorio=TRUE)
-- El componente TEORICO|PRACTICO de cada columna se define en evaluaciones, no aquí.

CREATE TABLE tipos_evaluacion (
    id INT AUTO_INCREMENT PRIMARY KEY,

    -- Identificación
    codigo VARCHAR(40) NOT NULL COMMENT 'Código del tipo (ej: EXAMEN_PARCIAL, PROYECTO)',
    nombre VARCHAR(100) NOT NULL COMMENT 'Nombre descriptivo (ej: Examen Parcial, Proyecto)',
    descripcion TEXT COMMENT 'Descripción del tipo y cuándo se aplica',

    -- Comportamiento del tipo
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
    INDEX idx_es_recuperatorio (es_recuperatorio) COMMENT 'Filtrado por tipo recuperatorio',
    INDEX idx_activo (activo) COMMENT 'Filtrado por estado activo',
    INDEX idx_deleted_at (deleted_at) COMMENT 'Filtrado de soft delete'

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Catálogo de tipos de evaluación bimestrales reutilizable entre gestiones.';

-- ============================================
-- TABLA: configuracion_evaluacion
-- Configuración de evaluación y notas por gestión (patrón clave-valor)
-- ============================================
-- Par con tipos_evaluacion: el catálogo dice QUÉ tipos existen, esta tabla
-- almacena la política institucional y parámetros por gestión.
--
-- Clave principal: POLITICA_INSTITUCIONAL — documento JSON con ponderación
-- teórico/práctico, pesos de bimestres, política de asistencia, nota mínima
-- de aprobación, etc. Solo administración crea y modifica estas filas.
--
-- Solo la clave POLITICA_INSTITUCIONAL por gestión; sin overrides por curso/docente.

CREATE TABLE configuracion_evaluacion (
    id INT AUTO_INCREMENT PRIMARY KEY,

    -- Relación principal
    gestion_id INT NULL COMMENT 'Gestión a la que aplica (referencia a gestiones)',

    -- Identificación y valor
    clave VARCHAR(100) NOT NULL COMMENT 'Identificador (ej: POLITICA_INSTITUCIONAL)',
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
COMMENT='Configuración global de evaluación por gestión (clave-valor). Política de notas en POLITICA_INSTITUCIONAL.';

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
-- COMPONENTES OFICIALES (puntos del bimestre, 0-100 total):
--   - nota_teorico: suma de puntos obtenidos en actividades TEORICO (máx. cuota_teorico, ej. 30)
--   - nota_practico: suma de puntos obtenidos en actividades PRACTICO (máx. cuota_practico, ej. 70)
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
        COMMENT 'Puntos obtenidos en el componente teórico (0..cuota_teorico, ej. ≤30). SUMA de evaluaciones_notas.nota en actividades TEORICO',
    nota_practico DECIMAL(5,2) NULL 
        COMMENT 'Puntos obtenidos en el componente práctico (0..cuota_practico, ej. ≤70). SUMA de evaluaciones_notas.nota en actividades PRACTICO',
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
--
-- COMPONENTE Y PUNTOS:
--   componente indica si la actividad suma a nota_teorico o nota_practico.
--   puntos es el máximo de puntos que aporta la actividad al bimestre (entero).
--   La suma de puntos de actividades del mismo componente no debe superar la cuota
--   institucional (cuota_teorico / cuota_practico en POLITICA_INSTITUCIONAL).
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
        COMMENT 'Tipo de evaluación (referencia a tipos_evaluacion)',

    -- Mapeo al boletín oficial
    componente ENUM('TEORICO', 'PRACTICO') NOT NULL DEFAULT 'PRACTICO' 
        COMMENT 'Componente del boletín al que contribuye: TEORICO suma a nota_teorico, PRACTICO suma a nota_practico',

    -- Identificación de la evaluación
    nombre_evaluacion VARCHAR(255) 
        COMMENT 'Nombre descriptivo (ej: Exposición Lesson 1, Examen Parcial Tema 3, Práctico Lab 2)',
    descripcion TEXT 
        COMMENT 'Descripción o consigna de la evaluación',

    -- Puntos de la actividad (máximo alcanzable en esta columna)
    puntos SMALLINT UNSIGNED NULL DEFAULT 1 
        COMMENT 'Puntos que aporta esta actividad al bimestre (entero). La celda admite 0..puntos. La suma por componente no debe superar cuota_teorico o cuota_practico',
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
--     SELECT en.nota, e.puntos
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
    nota SMALLINT UNSIGNED NULL 
        COMMENT 'Puntos obtenidos en esta actividad (entero 0..evaluaciones.puntos). Suma directa al componente del bimestre',
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
-- FASE 3: REHABILITAR FOREIGN KEY CHECKS
-- ============================================

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- FIN DEL SCRIPT
-- ============================================
