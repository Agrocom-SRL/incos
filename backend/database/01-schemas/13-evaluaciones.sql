-- ============================================
-- MÓDULO DE EVALUACIONES (PARTE 2 de 5)
-- Sistema de Gestión Académica - Instituto INCOS
-- 5 Tablas: tipos_evaluacion, cuota_teorico_practico,
--           bimestres_matricula, evaluaciones, evaluaciones_finales
-- ============================================
--
-- Este archivo modela el SISTEMA DE NOTAS Y EVALUACIONES de la gestión vigente.
-- Las inscripciones y matrículas viven en 12-inscripciones.sql.
-- El historial previo y nivelaciones en 16-nivelaciones.sql.
--
-- JERARQUÍA DE EVALUACIÓN (modelo oficial del Registro Académico de Notas INCOS):
--
--   matriculas_materia
--      │
--      ├── bimestres_matricula (4 filas: bimestres 1, 2, 3, 4)
--      │      │
--      │      ├── nota_teorico (componente oficial, suma ≤ cuota teórica)
--      │      ├── nota_practico (componente oficial, suma ≤ cuota práctica)
--      │      ├── nota_bimestre = nota_teorico + nota_practico
--      │      ├── nota_habilitacion (si reprobó este bimestre)
--      │      │
--      │      └── evaluaciones (N por bimestre)
--      │             ├── componente: TEORICO o PRACTICO  ← mapeo al boletín oficial
--      │             ├── nota, peso, tipo_evaluacion_id
--      │             └── Las evaluaciones del mismo componente se promedian ponderado
--      │
--      └── evaluaciones_finales (proyectos/exámenes que cubren toda la materia)
--              ├── peso en la nota_final (junto con los 4 bimestres)
--              └── No pertenecen a ningún bimestre específico
--
-- CUOTA TEÓRICO / PRÁCTICO:
--   - Default institucional por gestión (típicamente 30/70) en cuota_teorico_practico
--   - Override por asignacion_docente si la materia lo justifica (campos agregados
--     a asignaciones_docentes (pendiente de ALTER en schema de asignaciones)
--   - Las evaluaciones componente=TEORICO se promedian ponderado y se reescalan a
--     la cuota_teorico; lo mismo para práctico
--   - nota_bimestre = nota_teorico + nota_practico (≤ 100)
--
-- HABILITACIÓN vs RECUPERATORIO:
--   - Habilitación bimestral: campo nota_habilitacion en bimestres_matricula.
--     Reemplaza la nota_bimestre original si el estudiante reprueba UN bimestre.
--   - Recuperatorio anual: tabla nivelaciones (16-nivelaciones.sql) vinculada
--     vía historial_matricula (17-historial-matricula.sql). Aplica a TODA la materia al cierre del año.
--   - Nivelación: tabla nivelaciones (16-nivelaciones.sql). Hasta 3 intentos en años siguientes.
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

DROP TABLE IF EXISTS evaluaciones_finales;
DROP TABLE IF EXISTS evaluaciones;
DROP TABLE IF EXISTS bimestres_matricula;
DROP TABLE IF EXISTS cuota_teorico_practico;
DROP TABLE IF EXISTS tipos_evaluacion;

-- ============================================
-- FASE 2: CREACIÓN DE TABLAS
-- ============================================

-- ============================================
-- TABLA: tipos_evaluacion
-- Catálogo de tipos de evaluación
-- ============================================
-- Catálogo que reemplaza al ENUM rígido anterior. Permite agregar tipos sin
-- alterar las tablas de evaluaciones y soporta atributos adicionales por tipo.
--
-- Tipos típicos según práctica docente en INCOS:
--   - EXAMEN_PARCIAL: examen escrito principal del bimestre
--   - PRACTICO: prácticos del bimestre
--   - PROYECTO: proyecto del bimestre
--   - EXPOSICION: exposición oral
--   - TALLER: talleres prácticos en aula
--   - ACTIVIDAD_EXTRACURRICULAR: ferias, concursos, eventos
--   - PROYECTO_FINAL_ANUAL: proyecto integrador que cubre toda la materia
--   - EXAMEN_FINAL_ANUAL: examen final que cubre toda la materia
--   - HABILITACION: examen de habilitación bimestral
--   - RECUPERATORIO_ANUAL: examen recuperatorio de fin de año
--   - PRUEBA_EXCEPCIONAL: tercer y último intento
--
-- ámbito identifica si la evaluación pertenece a un bimestre o cubre toda la materia.

CREATE TABLE tipos_evaluacion (
    id INT AUTO_INCREMENT PRIMARY KEY,

    -- Identificación
    codigo VARCHAR(40) NOT NULL COMMENT 'Código del tipo (ej: EXAMEN_PARCIAL, PROYECTO, PROYECTO_FINAL_ANUAL)',
    nombre VARCHAR(100) NOT NULL COMMENT 'Nombre descriptivo (ej: Examen Parcial, Proyecto Bimestral, Proyecto Final Anual)',
    descripcion TEXT COMMENT 'Descripción del tipo de evaluación y cuándo se aplica',

    -- Comportamiento del tipo
    ambito ENUM('BIMESTRE', 'MATERIA_COMPLETA') DEFAULT 'BIMESTRE' COMMENT 'Ámbito: BIMESTRE (vive dentro de un bimestre, va a tabla evaluaciones), MATERIA_COMPLETA (cubre toda la materia, va a tabla evaluaciones_finales)',
    es_recuperatorio BOOLEAN DEFAULT FALSE COMMENT 'TRUE si es evaluación de recuperación (reemplaza nota original). FALSE si se promedia normalmente.',
    permite_multiples_intentos BOOLEAN DEFAULT FALSE COMMENT 'TRUE si permite múltiples intentos (recuperatorios, habilitaciones). FALSE para evaluaciones regulares.',

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

    -- Índices para optimización
    INDEX idx_codigo (codigo) COMMENT 'Búsqueda por código',
    INDEX idx_ambito (ambito) COMMENT 'Filtrado por ámbito de aplicación',
    INDEX idx_es_recuperatorio (es_recuperatorio) COMMENT 'Filtrado por tipo recuperatorio',
    INDEX idx_activo (activo) COMMENT 'Filtrado por estado activo',
    INDEX idx_deleted_at (deleted_at) COMMENT 'Filtrado de soft delete'

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Catálogo de tipos de evaluación reutilizable entre gestiones. ámbito distingue evaluaciones de bimestre vs evaluaciones de materia completa.';

-- ============================================
-- TABLA: cuota_teorico_practico
-- Cuota institucional de componentes teórico y práctico por gestión
-- ============================================
-- Define la cuota institucional para los componentes oficiales del boletín:
-- TEÓRICO + PRÁCTICO = 100 puntos por bimestre. Típicamente 30/70 en INCOS.
--
-- Una sola configuración por gestión vale como DEFAULT para todas las carreras.
-- Si una materia específica necesita un split distinto (ej. taller 20/80), se
-- sobreescribe en asignaciones_docentes (campos cuota_teorico_override y
-- cuota_practico_override agregados vía ALTER en schema de asignaciones).
--
-- USO: Al cerrar un bimestre, las evaluaciones componente=TEORICO se promedian
-- ponderado y el resultado se reescala a la cuota_teorico (ej. si promedio 80
-- sobre 100, con cuota 30 → 80 * 30 / 100 = 24). Lo mismo para práctico.
-- nota_bimestre = nota_teorico + nota_practico.

CREATE TABLE cuota_teorico_practico (
    id INT AUTO_INCREMENT PRIMARY KEY,

    -- Alcance
    gestion_id INT NULL COMMENT 'Gestión a la que aplica esta configuración (referencia a gestiones)',

    -- Cuota institucional
    cuota_teorico DECIMAL(5,2) NOT NULL DEFAULT 30 COMMENT 'Cuota del componente teórico sobre 100 puntos (ej: 30). Suma con cuota_practico debe dar 100 (validación de aplicación).',
    cuota_practico DECIMAL(5,2) NOT NULL DEFAULT 70 COMMENT 'Cuota del componente práctico sobre 100 puntos (ej: 70). Suma con cuota_teorico debe dar 100 (validación de aplicación).',

    -- Observaciones
    descripcion TEXT COMMENT 'Descripción de la configuración o motivo de un cambio',

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

    -- Índices para optimización
    INDEX idx_gestion_id (gestion_id) COMMENT 'Búsqueda por gestión',
    INDEX idx_activo (activo) COMMENT 'Filtrado por estado activo',
    INDEX idx_deleted_at (deleted_at) COMMENT 'Filtrado de soft delete'

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Cuota institucional teórico/práctico por gestión (default 30/70). Aplica a todas las materias salvo override en asignaciones_docentes.';

-- ============================================
-- TABLA: bimestres_matricula
-- Bimestre de una matrícula a materia
-- ============================================
-- Representa cada uno de los 4 bimestres de una matrícula. Es el contenedor
-- padre de las evaluaciones del bimestre y refleja la estructura oficial
-- TEÓRICO + PRÁCTICO del Registro Académico de Notas de INCOS.
--
-- JERARQUÍA: matriculas_materia → bimestres_matricula (4 filas) → evaluaciones (N)
--
-- COMPONENTES OFICIALES:
--   - nota_teorico: nota del componente teórico (sobre cuota_teorico, ej. 30)
--   - nota_practico: nota del componente práctico (sobre cuota_practico, ej. 70)
--   - nota_bimestre: nota_teorico + nota_practico (≤ 100)
--
-- HABILITACIÓN BIMESTRAL:
--   - nota_habilitacion: si reprobó este bimestre, el estudiante puede rendir
--     una habilitación que reemplaza la nota_bimestre original
--   - Aplica solo al bimestre específico, no al año completo
--
-- ESTADO Y CIERRE: Los bimestres se cierran formalmente en el Consejo de
-- Docentes. Una vez cerrados (estado = CERRADO), las notas no se modifican.

CREATE TABLE bimestres_matricula (
    id INT AUTO_INCREMENT PRIMARY KEY,

    -- Relaciones principales
    matricula_materia_id INT NULL COMMENT 'Matrícula padre (referencia a matriculas_materia)',
    bimestre INT NULL COMMENT 'Número de bimestre (1, 2, 3, 4)',

    -- Componentes oficiales del boletín
    nota_teorico DECIMAL(5,2) NULL COMMENT 'Nota del componente teórico (sobre cuota_teorico, típicamente ≤30). Calculada como SUMA(nota * peso) de evaluaciones componente=TEORICO, reescalada a la cuota.',
    nota_practico DECIMAL(5,2) NULL COMMENT 'Nota del componente práctico (sobre cuota_practico, típicamente ≤70). Calculada como SUMA(nota * peso) de evaluaciones componente=PRACTICO, reescalada a la cuota.',
    nota_bimestre DECIMAL(5,2) NULL COMMENT 'Nota cerrada del bimestre (0-100). Suma de nota_teorico + nota_practico. Nota oficial del boletín.',
    peso_bimestre DECIMAL(5,2) NULL DEFAULT 1 COMMENT 'Peso del bimestre en la nota_final. Default 1 (los 4 bimestres pesan igual). Permite ponderación diferenciada.',

    -- Habilitación bimestral
    nota_habilitacion DECIMAL(5,2) NULL COMMENT 'Nota de la habilitación bimestral (0-100). Aplica solo si reprobó este bimestre. Si aprueba, reemplaza nota_bimestre.',
    fecha_habilitacion DATE NULL COMMENT 'Fecha en que se rindió la habilitación',

    -- Estado y cierre
    estado ENUM('PENDIENTE', 'EN_CURSO', 'CERRADO') DEFAULT 'PENDIENTE' COMMENT 'Estado: PENDIENTE (no iniciado), EN_CURSO (evaluaciones en proceso), CERRADO (firmado en Consejo de Docentes)',
    fecha_cierre DATE NULL COMMENT 'Fecha en que se cerró el bimestre',
    cerrado_por INT NULL COMMENT 'Usuario que cerró el bimestre',

    -- Observaciones
    observaciones TEXT COMMENT 'Observaciones del bimestre (asistencia, comportamiento, etc.)',

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
    INDEX idx_matricula_materia_id (matricula_materia_id) COMMENT 'Búsqueda por matrícula',
    INDEX idx_bimestre (bimestre) COMMENT 'Búsqueda por bimestre',
    INDEX idx_estado (estado) COMMENT 'Filtrado por estado',
    INDEX idx_activo (activo) COMMENT 'Filtrado por estado activo',
    INDEX idx_deleted_at (deleted_at) COMMENT 'Filtrado de soft delete',
    INDEX idx_matricula_bimestre (matricula_materia_id, bimestre, activo, deleted_at) COMMENT 'Búsqueda de bimestre específico de una matrícula'

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Bimestre de una matrícula a materia. Contiene los componentes oficiales TEORICO + PRACTICO del boletín y la habilitación bimestral.';

-- ============================================
-- TABLA: evaluaciones
-- Evaluaciones rendidas dentro de un bimestre
-- ============================================
-- Registra cada evaluación específica del estudiante dentro de un bimestre:
-- exámenes parciales, prácticos, proyectos, exposiciones, etc. Solo cubre
-- evaluaciones de ámbito BIMESTRE. Las de ámbito MATERIA_COMPLETA (proyecto
-- final anual, examen final, feria) van en evaluaciones_finales.
--
-- JERARQUÍA: pertenece a bimestres_matricula. El bimestre se hereda del padre,
-- eliminando duplicación.
--
-- COMPONENTE: campo crucial que indica si la evaluación contribuye al componente
-- TEORICO o PRACTICO del boletín oficial. Permite que el docente registre
-- múltiples evaluaciones libres y el sistema las agrupe automáticamente.
--
-- PESO: lo asigna el docente al crear la evaluación. Los pesos de cada componente
-- (TEORICO o PRACTICO) deben sumar 100 dentro del bimestre. Luego cada componente
-- se reescala a su cuota institucional (30/70 típico). Validación en aplicación.

CREATE TABLE evaluaciones (
    id INT AUTO_INCREMENT PRIMARY KEY,

    -- Relaciones principales
    bimestre_matricula_id INT NULL COMMENT 'Bimestre al que pertenece (referencia a bimestres_matricula)',
    tipo_evaluacion_id INT NULL COMMENT 'Tipo de evaluación (referencia a tipos_evaluacion). Debe tener ambito=BIMESTRE.',

    -- Mapeo al boletín oficial
    componente ENUM('TEORICO', 'PRACTICO') NOT NULL DEFAULT 'PRACTICO' COMMENT 'Componente del boletín al que contribuye: TEORICO (suma a nota_teorico) o PRACTICO (suma a nota_practico).',

    -- Identificación de la evaluación
    nombre_evaluacion VARCHAR(200) COMMENT 'Nombre descriptivo (ej: Examen Parcial Tema 3, Proyecto Calculadora Web, Práctico Lab 2)',
    descripcion TEXT COMMENT 'Descripción o consigna de la evaluación',

    -- Calificación y ponderación
    nota DECIMAL(5,2) NULL COMMENT 'Nota obtenida (0-100). Se interpreta sobre 100 y luego se reescala a la cuota del componente al cerrar el bimestre.',
    peso DECIMAL(5,2) NULL DEFAULT 1 COMMENT 'Peso dentro de su componente (TEORICO o PRACTICO) en el bimestre. Los pesos del mismo componente suman 100 (validación de aplicación).',
    fecha DATE NULL COMMENT 'Fecha en que se rindió',

    -- Control de intentos
    intento INT DEFAULT 1 COMMENT 'Número de intento (1 para regulares; >1 para retomas autorizadas)',

    -- Control de cierre
    notas_cerradas BOOLEAN DEFAULT FALSE COMMENT 'TRUE cuando la nota está cerrada y no se puede modificar',
    fecha_cierre_notas DATE NULL COMMENT 'Fecha en que se cerró la nota',
    cerradas_por INT NULL COMMENT 'Usuario que cerró la nota',

    -- Observaciones
    observaciones TEXT COMMENT 'Observaciones específicas',

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

    FOREIGN KEY (bimestre_matricula_id) REFERENCES bimestres_matricula(id) ON DELETE SET NULL,
    FOREIGN KEY (tipo_evaluacion_id) REFERENCES tipos_evaluacion(id) ON DELETE SET NULL,

    -- Índices para optimización
    INDEX idx_bimestre_matricula_id (bimestre_matricula_id) COMMENT 'Búsqueda por bimestre',
    INDEX idx_tipo_evaluacion_id (tipo_evaluacion_id) COMMENT 'Búsqueda por tipo de evaluación',
    INDEX idx_componente (componente) COMMENT 'Filtrado por componente (TEORICO/PRACTICO)',
    INDEX idx_activo (activo) COMMENT 'Filtrado por estado activo',
    INDEX idx_deleted_at (deleted_at) COMMENT 'Filtrado de soft delete',
    INDEX idx_bimestre_componente (bimestre_matricula_id, componente, activo, deleted_at) COMMENT 'Búsqueda de evaluaciones por bimestre y componente (cálculo de nota_teorico/practico)'

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Evaluaciones rendidas dentro de un bimestre. El campo componente (TEORICO/PRACTICO) las mapea a los dos componentes oficiales del boletín. Los pesos del mismo componente suman 100.';

-- ============================================
-- TABLA: evaluaciones_finales
-- Evaluaciones que cubren toda la materia (no un bimestre específico)
-- ============================================
-- Registra evaluaciones especiales que cubren TODA la materia: proyecto integrador
-- final, examen final anual, participación en feria productiva, etc. El docente
-- las define al inicio del año si planea aplicarlas.
--
-- DIFERENCIA CON evaluaciones (bimestrales):
--   - evaluaciones depende de bimestres_matricula (un bimestre específico)
--   - evaluaciones_finales depende directamente de matriculas_materia
--   - El peso aplica a la nota_final completa, no a un bimestre individual
--
-- CÁLCULO DE NOTA FINAL CON EVALUACIONES FINALES:
--   nota_final = SUMA(nota_bimestre * peso_bimestre) + SUMA(nota_final * peso)
--              ────────────────────────────────────────────────────────────────
--                         SUMA(peso_bimestre) + SUMA(peso)
--
-- EJEMPLO: docente decide que el año pesa así:
--   - Bimestres 1-4: peso 20 cada uno (total 80)
--   - Proyecto final anual: peso 20
--   - Total: 100, distribuido entre 5 elementos

CREATE TABLE evaluaciones_finales (
    id INT AUTO_INCREMENT PRIMARY KEY,

    -- Relaciones principales
    matricula_materia_id INT NULL COMMENT 'Matrícula padre (referencia a matriculas_materia). FK DIRECTA, no a bimestre, porque la evaluación cubre toda la materia.',
    tipo_evaluacion_id INT NULL COMMENT 'Tipo de evaluación (referencia a tipos_evaluacion). Debe tener ambito=MATERIA_COMPLETA.',

    -- Identificación de la evaluación
    nombre_evaluacion VARCHAR(200) COMMENT 'Nombre descriptivo (ej: Proyecto Integrador Web, Examen Final Anual, Feria de Innovación)',
    descripcion TEXT COMMENT 'Descripción o consigna detallada',

    -- Calificación y ponderación
    nota DECIMAL(5,2) NULL COMMENT 'Nota obtenida (0-100). Se pondera junto con los bimestres para nota_final.',
    peso DECIMAL(5,2) NULL DEFAULT 1 COMMENT 'Peso en el cálculo de nota_final, en escala comparable a peso_bimestre.',
    fecha DATE NULL COMMENT 'Fecha en que se rindió/entregó',

    -- Control de cierre
    notas_cerradas BOOLEAN DEFAULT FALSE COMMENT 'TRUE cuando la nota está cerrada y no se puede modificar',
    fecha_cierre_notas DATE NULL COMMENT 'Fecha en que se cerró la nota',
    cerradas_por INT NULL COMMENT 'Usuario que cerró la nota',

    -- Observaciones
    observaciones TEXT COMMENT 'Observaciones específicas',

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
    FOREIGN KEY (tipo_evaluacion_id) REFERENCES tipos_evaluacion(id) ON DELETE SET NULL,

    -- Índices para optimización
    INDEX idx_matricula_materia_id (matricula_materia_id) COMMENT 'Búsqueda por matrícula',
    INDEX idx_tipo_evaluacion_id (tipo_evaluacion_id) COMMENT 'Búsqueda por tipo de evaluación',
    INDEX idx_activo (activo) COMMENT 'Filtrado por estado activo',
    INDEX idx_deleted_at (deleted_at) COMMENT 'Filtrado de soft delete',
    INDEX idx_matricula_tipo (matricula_materia_id, tipo_evaluacion_id, activo, deleted_at) COMMENT 'Búsqueda de evaluaciones finales de un tipo específico'

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Evaluaciones que cubren toda la materia (proyecto integrador, examen final, feria). FK directa a matriculas_materia. Sus pesos se combinan con los pesos de los 4 bimestres para calcular nota_final.';

-- ============================================
-- FASE 3: REHABILITAR FOREIGN KEY CHECKS
-- ============================================

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- FIN DEL SCRIPT
-- ============================================
