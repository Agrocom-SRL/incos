-- ============================================
-- MÓDULO DE MODALIDADES DE GRADO
-- Sistema de Gestión Académica - Instituto INCOS
-- 2 Tablas: modalidades_grado, proyectos_grado
-- NOTA DOCUMENTAL (verificado contra FORMULARIO 01 DE MODALIDAD DE
-- GRADUACION y el "INFORME DE VERIFICACIÓN DE LA EMPRESA..." en
-- /Users/miguel/Documents/incos/pasantia/): la pasantía/práctica laboral
-- (Resolución Ministerial No. 487/2023, 300-360 horas) NO es una modalidad
-- de graduación: es un requisito paralelo, modelado en 24-pasantias.sql con
-- FK directa a estudiantes (desacoplado de proyectos_grado). El seeder
-- 57-seed-titulacion-modalidades.sql (PSP/PG/PE/TD) no contempla pasantía a
-- propósito. No añadir un código de modalidad para pasantía salvo que la
-- lista oficial del FMDG-1 lo exija.
-- ============================================

USE instituto_incos;

-- ============================================
-- FASE 1: ELIMINACIÓN DE TABLAS
-- Deshabilitamos foreign key checks para poder eliminar en cualquier orden
-- ============================================

SET FOREIGN_KEY_CHECKS = 0;

-- Eliminar todas las tablas (orden no importa con foreign key checks deshabilitado)
-- Hijas antes que la raíz: tribunal_acta_defensa → actas_defensa → proyectos_grado
DROP TABLE IF EXISTS tribunal_acta_defensa;
DROP TABLE IF EXISTS actas_defensa;
DROP TABLE IF EXISTS proyectos_grado;
DROP TABLE IF EXISTS modalidades_grado;

-- ============================================
-- FASE 2: CREACIÓN DE TABLAS
-- Las foreign key checks siguen deshabilitadas durante la creación
-- ============================================

-- ============================================
-- TABLA: modalidades_grado
-- ============================================

CREATE TABLE modalidades_grado (
    id INT AUTO_INCREMENT PRIMARY KEY,
    
    -- Datos de la modalidad
    codigo VARCHAR(20) NOT NULL COMMENT 'Código único de la modalidad (ej: PROY-GRADO, TRAB-DIR, TESIS, EXAM-GRADO)',
    nombre VARCHAR(200) NOT NULL COMMENT 'Nombre completo de la modalidad',
    descripcion TEXT NULL COMMENT 'Descripción detallada de la modalidad',
    
    -- Características
    requiere_tutor BOOLEAN DEFAULT FALSE COMMENT 'Si esta modalidad requiere tutor asignado',
    requiere_proyecto BOOLEAN DEFAULT FALSE COMMENT 'Si esta modalidad requiere desarrollo de proyecto',
    requiere_defensa BOOLEAN DEFAULT FALSE COMMENT 'Si esta modalidad requiere defensa final',
    requiere_examen BOOLEAN DEFAULT FALSE COMMENT 'Si esta modalidad requiere examen de grado',
    
    -- Duración estimada
    duracion_meses INT NULL COMMENT 'Duración estimada en meses',
    carga_horaria_estimada INT NULL COMMENT 'Carga horaria estimada',
    
    -- Observaciones
    observaciones TEXT NULL COMMENT 'Observaciones adicionales',
    
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
    INDEX idx_activo (activo) COMMENT 'Filtrado por estado activo',
    INDEX idx_deleted_at (deleted_at) COMMENT 'Filtrado de soft delete',
    INDEX idx_requiere_tutor (requiere_tutor) COMMENT 'Filtrado por modalidades que requieren tutor',
    INDEX idx_requiere_proyecto (requiere_proyecto) COMMENT 'Filtrado por modalidades que requieren proyecto'
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Catálogo de modalidades de grado disponibles para estudiantes de tercer año.';

-- ============================================
-- TABLA: proyectos_grado
-- ============================================

CREATE TABLE proyectos_grado (
    id INT AUTO_INCREMENT PRIMARY KEY,
    
    -- Relaciones
    estudiante_id INT NULL COMMENT 'Estudiante que realiza el proyecto (referencia a estudiantes)',
    modalidad_id INT NULL COMMENT 'Modalidad de grado elegida (referencia a modalidades_grado)',
    tutor_id INT NULL COMMENT 'Tutor asignado (referencia a docentes, si la modalidad requiere tutor)',
    carrera_id INT NULL COMMENT 'Carrera del estudiante (referencia a carreras)',
    gestion_id INT NULL COMMENT 'Gestión académica (referencia a gestiones)',
    
    -- Datos del proyecto
    titulo VARCHAR(500) NOT NULL COMMENT 'Título del proyecto/trabajo/tesis',
    descripcion TEXT NULL COMMENT 'Descripción del proyecto',
    objetivos TEXT NULL COMMENT 'Objetivos del proyecto',
    alcance TEXT NULL COMMENT 'Alcance del proyecto',
    metodologia TEXT NULL COMMENT 'Metodología a utilizar',
    
    -- Estado del proyecto
    -- SUFICIENCIA agregada 2026-08-17 (informe de suficiencia del tutor,
    -- previo a la predefensa): ver 05-migrations/28-migrate-titulacion-suficiencia.sql
    -- para el ALTER de una BD ya desplegada.
    estado ENUM(
        'PERFIL',
        'APROBADO_PERFIL',
        'DESARROLLO',
        'SUFICIENCIA',
        'PREDEFENSA',
        'APROBADO_PREDEFENSA',
        'DEFENSA',
        'APROBADO',
        'REPROBADO',
        'CANCELADO'
    ) DEFAULT 'PERFIL' COMMENT 'Estado actual del proyecto',

    -- Fechas importantes
    fecha_presentacion_perfil DATE NULL COMMENT 'Fecha en que se presentó el perfil',
    fecha_aprobacion_perfil DATE NULL COMMENT 'Fecha en que se aprobó el perfil',
    fecha_inicio_desarrollo DATE NULL COMMENT 'Fecha de inicio del desarrollo',
    fecha_informe_suficiencia DATE NULL COMMENT 'Fecha en que se registró el informe de suficiencia del tutor',
    fecha_presentacion_predefensa DATE NULL COMMENT 'Fecha en que se presentó para predefensa',
    fecha_aprobacion_predefensa DATE NULL COMMENT 'Fecha en que se aprobó la predefensa',
    fecha_defensa DATE NULL COMMENT 'Fecha de la defensa final',
    fecha_aprobacion DATE NULL COMMENT 'Fecha de aprobación final',
    
    -- Evaluación
    nota_perfil DECIMAL(5,2) NULL COMMENT 'Nota del perfil (0-100)',
    nota_predefensa DECIMAL(5,2) NULL COMMENT 'Nota de la predefensa (0-100)',
    nota_defensa DECIMAL(5,2) NULL COMMENT 'Nota de la defensa final (0-100)',
    nota_final DECIMAL(5,2) NULL COMMENT 'Nota final del proyecto (0-100)',
    
    -- Documentos
    documento_perfil_id INT NULL COMMENT 'Documento del perfil (referencia a documentos_estudiante)',
    documento_proyecto_id INT NULL COMMENT 'Documento del proyecto completo (referencia a documentos_estudiante)',
    documento_predefensa_id INT NULL COMMENT 'Documento de predefensa (referencia a documentos_estudiante)',
    documento_defensa_id INT NULL COMMENT 'Documento de defensa (referencia a documentos_estudiante)',
    
    -- Observaciones
    observaciones TEXT NULL COMMENT 'Observaciones generales',
    observaciones_tutor TEXT NULL COMMENT 'Observaciones del tutor',
    observaciones_comite TEXT NULL COMMENT 'Observaciones del comité evaluador',
    
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
    FOREIGN KEY (modalidad_id) REFERENCES modalidades_grado(id) ON DELETE SET NULL,
    FOREIGN KEY (tutor_id) REFERENCES docentes(id) ON DELETE SET NULL,
    FOREIGN KEY (carrera_id) REFERENCES carreras(id) ON DELETE SET NULL,
    FOREIGN KEY (gestion_id) REFERENCES gestiones(id) ON DELETE SET NULL,
    FOREIGN KEY (documento_perfil_id) REFERENCES documentos_estudiante(id) ON DELETE SET NULL,
    FOREIGN KEY (documento_proyecto_id) REFERENCES documentos_estudiante(id) ON DELETE SET NULL,
    FOREIGN KEY (documento_predefensa_id) REFERENCES documentos_estudiante(id) ON DELETE SET NULL,
    FOREIGN KEY (documento_defensa_id) REFERENCES documentos_estudiante(id) ON DELETE SET NULL,
    
    -- Índices para optimización
    INDEX idx_estudiante_id (estudiante_id) COMMENT 'Búsqueda por estudiante',
    INDEX idx_modalidad_id (modalidad_id) COMMENT 'Búsqueda por modalidad',
    INDEX idx_tutor_id (tutor_id) COMMENT 'Búsqueda por tutor',
    INDEX idx_estado (estado) COMMENT 'Filtrado por estado',
    INDEX idx_gestion_id (gestion_id) COMMENT 'Búsqueda por gestión',
    INDEX idx_activo (activo) COMMENT 'Filtrado por estado activo',
    INDEX idx_deleted_at (deleted_at) COMMENT 'Filtrado de soft delete',
    INDEX idx_estudiante_estado (estudiante_id, estado, activo, deleted_at) COMMENT 'Búsqueda de proyectos por estudiante y estado',
    INDEX idx_tutor_estado (tutor_id, estado, activo, deleted_at) COMMENT 'Búsqueda de proyectos por tutor y estado',
    INDEX idx_gestion_estado (gestion_id, estado, activo, deleted_at) COMMENT 'Búsqueda de proyectos por gestión y estado'
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Proyectos/trabajos/tesis de estudiantes de tercer año. Maneja todas las modalidades que requieren desarrollo de proyecto (PROYECTO_GRADO, TRABAJO_DIRIGIDO, TESIS).';

-- ============================================
-- TABLA: actas_defensa
-- Acta de defensa de grado (modalidad de graduación). UNA por estudiante
-- integrante: en PSP grupal hay N actas del mismo proyecto. El resumen
-- académico (fecha_defensa, nota_defensa, nota_final, estado) sigue viviendo
-- en proyectos_grado y lo sincroniza el use case vía la transición T11
-- (AprobarEtapaProyectoUseCase). Ver plan de desarrollo:
-- docs/plan/acta-defensa-grado-plan-desarrollo.md (Bloque A, P1-P8 resueltas).
-- ============================================

CREATE TABLE actas_defensa (
    id INT AUTO_INCREMENT PRIMARY KEY,

    -- Relaciones
    proyecto_grado_id INT NULL COMMENT 'Proyecto de grado defendido (referencia a proyectos_grado)',
    estudiante_id INT NULL COMMENT 'Estudiante que defiende — integrante ACTIVO del proyecto (referencia a estudiantes)',
    gestion_id INT NULL COMMENT 'Gestión del acta, copiada del proyecto al registrar (ancla de la serie correlativa)',

    -- Identidad del acta
    numero_acta INT NOT NULL COMMENT 'Número correlativo del acta dentro de la gestión (foliado rojo del talonario, ej: 12 → se imprime 012). Autoasignado MAX+1, con override manual para empatar el libro físico',

    -- Acto de defensa
    fecha_defensa DATE NOT NULL COMMENT 'Fecha del acto de defensa',
    hora_inicio TIME NOT NULL COMMENT 'Hora de instalación del acto (cabecera "a horas HH:MM")',
    hora_conclusion TIME NULL COMMENT 'Hora de conclusión del acto ("concluyó a horas HH:MM")',

    -- Resolución del tribunal
    calificacion_final DECIMAL(5,2) NOT NULL COMMENT 'Calificación final en puntos (0-100); el PDF la imprime en número y letras',
    resultado ENUM('APRUEBA', 'REPRUEBA') NOT NULL COMMENT 'Resultado del acta; derivado de la calificación contra la nota mínima de configuracion_evaluacion (seed 54, misma fuente que usa el boletín/centralizador) y validado en servidor — sin constante nueva',
    observaciones TEXT NULL COMMENT 'Observaciones del acto (no se imprimen en el acta estándar)',

    -- Ciclo de vida del acta
    estado ENUM('EMITIDA', 'ANULADA') DEFAULT 'EMITIDA' COMMENT 'EMITIDA: acta vigente | ANULADA: dejada sin efecto (conserva su número; la sustituta toma número nuevo)',

    -- Campos de auditoría y control (ESTÁNDAR)
    activo BOOLEAN DEFAULT TRUE COMMENT 'Registro activo/inactivo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Fecha de modificación',
    deleted_at TIMESTAMP NULL DEFAULT NULL COMMENT 'Soft delete',
    created_by INT NULL COMMENT 'Usuario que creó',
    updated_by INT NULL COMMENT 'Usuario que modificó',
    deleted_by INT NULL COMMENT 'Usuario que eliminó',

    FOREIGN KEY (proyecto_grado_id) REFERENCES proyectos_grado(id) ON DELETE SET NULL,
    FOREIGN KEY (estudiante_id) REFERENCES estudiantes(id) ON DELETE SET NULL,
    FOREIGN KEY (gestion_id) REFERENCES gestiones(id) ON DELETE SET NULL,

    UNIQUE INDEX uk_gestion_numero (gestion_id, numero_acta) COMMENT 'Serie correlativa única por gestión (alcance provisional, P1: podría recalcularse si la confirmación institucional final cambia el criterio)',
    INDEX idx_proyecto_grado_id (proyecto_grado_id) COMMENT 'Actas de un proyecto',
    INDEX idx_estudiante_id (estudiante_id) COMMENT 'Acta(s) de un estudiante',
    INDEX idx_proyecto_estudiante (proyecto_grado_id, estudiante_id, estado, activo, deleted_at) COMMENT 'Acta EMITIDA vigente por proyecto+estudiante (unicidad validada en use case, no en BD, por convivir con ANULADA)',
    INDEX idx_activo (activo) COMMENT 'Filtrado por estado activo',
    INDEX idx_deleted_at (deleted_at) COMMENT 'Filtrado de soft delete'

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Acta de defensa de grado por estudiante (modalidad de graduación): tribunal, horas del acto, calificación final en puntos y resultado. Espejo del acta física foliada del instituto.';

-- ============================================
-- TABLA: tribunal_acta_defensa
-- Los 3 miembros del Tribunal Evaluador de UN acta. Siempre docentes del
-- instituto (P5: sin profesionales externos) — exigido en el use case/
-- validador (CREAR/EDITAR), NO como NOT NULL de BD: docente_id es NULLable
-- con ON DELETE SET NULL, igual que el resto de FKs de este repo (100% de
-- las FKs en 01-schemas usan SET NULL; RESTRICT está prohibido). nombre_completo
-- queda como snapshot para fidelidad con el documento firmado, sobrevive
-- aunque el docente_id se anule por baja física.
-- ============================================

CREATE TABLE tribunal_acta_defensa (
    id INT AUTO_INCREMENT PRIMARY KEY,

    acta_defensa_id INT NULL COMMENT 'Acta a la que pertenece el miembro (referencia a actas_defensa)',
    orden TINYINT NOT NULL COMMENT 'Posición 1..3 en la lista y en las firmas',
    docente_id INT NULL COMMENT 'Docente del instituto (referencia a docentes). P5: siempre debe venir poblado — exigido por el validador/use case en CREAR, no por NOT NULL (se deja NULLable solo para sobrevivir a ON DELETE SET NULL, patrón único de FKs en este repo)',
    nombre_completo VARCHAR(200) NOT NULL COMMENT 'Nombre como se imprime en el acta (snapshot del docente al momento de registrar, con grado académico: "Lic. …")',
    cargo VARCHAR(80) NULL DEFAULT 'TRIBUNAL EVALUADOR' COMMENT 'Rótulo impreso entre paréntesis (el acta real usa "Tribunal Evaluador" para los 3)',

    -- Campos de auditoría y control (ESTÁNDAR)
    activo BOOLEAN DEFAULT TRUE COMMENT 'Registro activo/inactivo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Fecha de modificación',
    deleted_at TIMESTAMP NULL DEFAULT NULL COMMENT 'Soft delete',
    created_by INT NULL COMMENT 'Usuario que creó',
    updated_by INT NULL COMMENT 'Usuario que modificó',
    deleted_by INT NULL COMMENT 'Usuario que eliminó',

    FOREIGN KEY (acta_defensa_id) REFERENCES actas_defensa(id) ON DELETE SET NULL,
    FOREIGN KEY (docente_id) REFERENCES docentes(id) ON DELETE SET NULL,

    UNIQUE INDEX uk_acta_orden (acta_defensa_id, orden) COMMENT 'Una posición por acta',
    INDEX idx_acta_defensa_id (acta_defensa_id) COMMENT 'Tribunal de un acta',
    INDEX idx_docente_id (docente_id) COMMENT 'Actas donde participó un docente',
    INDEX idx_activo (activo) COMMENT 'Filtrado por estado activo',
    INDEX idx_deleted_at (deleted_at) COMMENT 'Filtrado de soft delete'

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Miembros (3) del Tribunal Evaluador de un acta de defensa. Snapshot de nombres para fidelidad con el documento firmado.';

-- ============================================
-- FASE 3: REHABILITAR FOREIGN KEY CHECKS
-- ============================================

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- FIN DEL SCRIPT
-- ============================================
