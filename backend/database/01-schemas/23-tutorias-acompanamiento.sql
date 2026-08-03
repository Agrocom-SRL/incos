-- ============================================
-- MÓDULO DE TUTORÍAS Y ACOMPAÑAMIENTO ACADÉMICO
-- Sistema de Gestión Académica - Instituto INCOS
-- 6 Tablas: integrantes_proyecto, avances_proyecto, bitacora_proyecto,
--           dictamenes_proyecto, sesiones_refuerzo,
--           sesion_refuerzo_estudiantes
-- Raíz del sub-módulo de titulación: proyectos_grado (22-modalidades-grado.sql).
-- No se duplica el proyecto: estas tablas son satélites con sufijo _proyecto.
-- Sub-módulo de acompañamiento: ancla en asignaciones_docentes (curso) y
-- matriculas_materia (estudiante en la materia). El riesgo pedagógico NO es
-- tabla: es vista calculada (156) con umbral en configuracion_evaluacion
-- (clave ACOMPANAMIENTO_PEDAGOGICO, seeder 54).
-- NORMALIZACIÓN: Estructura normalizada según 3FN
-- ============================================

USE instituto_incos;

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS sesion_refuerzo_estudiantes;
DROP TABLE IF EXISTS sesiones_refuerzo;
DROP TABLE IF EXISTS dictamenes_proyecto;
DROP TABLE IF EXISTS bitacora_proyecto;
DROP TABLE IF EXISTS avances_proyecto;
DROP TABLE IF EXISTS integrantes_proyecto;

CREATE TABLE integrantes_proyecto (
    id INT AUTO_INCREMENT PRIMARY KEY,
    proyecto_grado_id INT NULL COMMENT 'Proyecto de grado (referencia a proyectos_grado)',
    estudiante_id INT NULL COMMENT 'Estudiante integrante (referencia a estudiantes)',
    rol ENUM('TITULAR', 'INTEGRANTE') DEFAULT 'INTEGRANTE'
        COMMENT 'TITULAR: responsable/contacto del proyecto | INTEGRANTE: miembro del grupo',
    estado ENUM('ACTIVO', 'RETIRADO') DEFAULT 'ACTIVO'
        COMMENT 'ACTIVO en el proyecto o RETIRADO (abandonó el grupo)',
    fecha_incorporacion DATE NULL COMMENT 'Fecha en que se incorporó al proyecto',
    observaciones TEXT NULL COMMENT 'Observaciones del integrante',

    activo BOOLEAN DEFAULT TRUE COMMENT 'Registro activo/inactivo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Fecha de modificación',
    deleted_at TIMESTAMP NULL DEFAULT NULL COMMENT 'Soft delete',
    created_by INT NULL COMMENT 'Usuario que creó',
    updated_by INT NULL COMMENT 'Usuario que modificó',
    deleted_by INT NULL COMMENT 'Usuario que eliminó',

    FOREIGN KEY (proyecto_grado_id) REFERENCES proyectos_grado(id) ON DELETE SET NULL,
    FOREIGN KEY (estudiante_id) REFERENCES estudiantes(id) ON DELETE SET NULL,

    INDEX idx_proyecto_grado_id (proyecto_grado_id) COMMENT 'Integrantes de un proyecto',
    INDEX idx_estudiante_id (estudiante_id) COMMENT 'Proyecto(s) de un estudiante',
    INDEX idx_estudiante_estado (estudiante_id, estado, activo, deleted_at) COMMENT 'Proyecto vigente del estudiante',
    INDEX idx_activo (activo) COMMENT 'Filtrado por estado activo',
    INDEX idx_deleted_at (deleted_at) COMMENT 'Filtrado de soft delete'

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Integrantes (1..N estudiantes) de un proyecto de grado. Habilita proyectos comunitarios grupales sobre proyectos_grado.';

CREATE TABLE avances_proyecto (
    id INT AUTO_INCREMENT PRIMARY KEY,
    proyecto_grado_id INT NULL COMMENT 'Proyecto de grado al que pertenece el avance',
    subido_por_estudiante_id INT NULL COMMENT 'Estudiante que subió el archivo (debe ser integrante del proyecto — validación de aplicación)',
    numero_avance INT NULL COMMENT 'Número correlativo del avance dentro del proyecto (1, 2, 3...)',
    titulo VARCHAR(255) NULL COMMENT 'Título o etiqueta del avance (ej: Capítulo 2 - Marco teórico)',
    descripcion TEXT NULL COMMENT 'Descripción del contenido entregado',

    nombre_archivo VARCHAR(255) NOT NULL COMMENT 'Nombre del archivo digital',
    ruta_archivo VARCHAR(500) NOT NULL COMMENT 'Ruta del archivo en el servidor',
    extension VARCHAR(10) NULL COMMENT 'Extensión del archivo (pdf, doc, docx). Solo PDF/Word — validación de aplicación',
    tipo_mime VARCHAR(100) NULL COMMENT 'Tipo MIME del archivo',
    tamano_bytes BIGINT UNSIGNED NULL COMMENT 'Tamaño del archivo en bytes',

    estado_revision ENUM('PENDIENTE_REVISION', 'OBSERVADO', 'SUBSANADO', 'APROBADO') DEFAULT 'PENDIENTE_REVISION'
        COMMENT 'PENDIENTE_REVISION: subido, sin revisar | OBSERVADO: el tutor dejó observaciones | SUBSANADO: observaciones atendidas | APROBADO: avance aceptado',
    fecha_revision DATE NULL COMMENT 'Fecha de la última revisión del tutor',

    activo BOOLEAN DEFAULT TRUE COMMENT 'Registro activo/inactivo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación (fecha de subida)',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Fecha de modificación',
    deleted_at TIMESTAMP NULL DEFAULT NULL COMMENT 'Soft delete',
    created_by INT NULL COMMENT 'Usuario que creó',
    updated_by INT NULL COMMENT 'Usuario que modificó',
    deleted_by INT NULL COMMENT 'Usuario que eliminó',

    FOREIGN KEY (proyecto_grado_id) REFERENCES proyectos_grado(id) ON DELETE SET NULL,
    FOREIGN KEY (subido_por_estudiante_id) REFERENCES estudiantes(id) ON DELETE SET NULL,

    INDEX idx_proyecto_grado_id (proyecto_grado_id) COMMENT 'Avances de un proyecto',
    INDEX idx_subido_por (subido_por_estudiante_id) COMMENT 'Avances subidos por un estudiante',
    INDEX idx_estado_revision (estado_revision) COMMENT 'Filtrado por estado de revisión',
    INDEX idx_proyecto_estado (proyecto_grado_id, estado_revision, activo, deleted_at) COMMENT 'Avances pendientes de un proyecto',
    INDEX idx_activo (activo) COMMENT 'Filtrado por estado activo',
    INDEX idx_deleted_at (deleted_at) COMMENT 'Filtrado de soft delete'

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Archivos de avance del proyecto de grado subidos por estudiantes. Historial de observaciones en bitacora_proyecto.';

CREATE TABLE bitacora_proyecto (
    id INT AUTO_INCREMENT PRIMARY KEY,
    proyecto_grado_id INT NULL COMMENT 'Proyecto de grado (referencia a proyectos_grado)',
    avance_proyecto_id INT NULL COMMENT 'Avance revisado en esta entrada (referencia a avances_proyecto). NULL si es reunión sin archivo',
    tipo ENUM('REUNION', 'REVISION_AVANCE') DEFAULT 'REUNION'
        COMMENT 'REUNION: sesión de tutoría | REVISION_AVANCE: observación sobre un archivo de avance',
    fecha DATE NULL COMMENT 'Fecha de la reunión/revisión (columna FECHA de la planilla)',
    actividad TEXT NULL COMMENT 'Avance revisado en relación al Cronograma de Tutoría (columna ACTIVIDAD de la planilla)',
    observaciones TEXT NULL COMMENT 'Observaciones del tutor (columna OBSERVACIONES de la planilla)',
    porcentaje_avance TINYINT UNSIGNED NULL COMMENT 'Porcentaje de avance del proyecto a la fecha (0-100, planilla de seguimiento DDE)',
    estado ENUM('PENDIENTE', 'SUBSANADO') DEFAULT 'PENDIENTE'
        COMMENT 'PENDIENTE: la observación sigue abierta | SUBSANADO: el estudiante atendió la observación',
    confirmado_estudiante BOOLEAN DEFAULT FALSE COMMENT 'Equivalente digital de FIRMA DEL ESTUDIANTE en la planilla',
    fecha_confirmacion DATE NULL COMMENT 'Fecha en que el estudiante confirmó la entrada',

    activo BOOLEAN DEFAULT TRUE COMMENT 'Registro activo/inactivo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Fecha de modificación',
    deleted_at TIMESTAMP NULL DEFAULT NULL COMMENT 'Soft delete',
    created_by INT NULL COMMENT 'Usuario que creó',
    updated_by INT NULL COMMENT 'Usuario que modificó',
    deleted_by INT NULL COMMENT 'Usuario que eliminó',

    FOREIGN KEY (proyecto_grado_id) REFERENCES proyectos_grado(id) ON DELETE SET NULL,
    FOREIGN KEY (avance_proyecto_id) REFERENCES avances_proyecto(id) ON DELETE SET NULL,

    INDEX idx_proyecto_grado_id (proyecto_grado_id) COMMENT 'Bitácora de un proyecto',
    INDEX idx_avance_proyecto_id (avance_proyecto_id) COMMENT 'Historial de observaciones de un avance',
    INDEX idx_fecha (fecha) COMMENT 'Búsqueda por fecha (reporte mensual)',
    INDEX idx_proyecto_fecha (proyecto_grado_id, fecha, activo, deleted_at) COMMENT 'Bitácora cronológica del proyecto',
    INDEX idx_estado (estado) COMMENT 'Observaciones pendientes/subsanadas',
    INDEX idx_activo (activo) COMMENT 'Filtrado por estado activo',
    INDEX idx_deleted_at (deleted_at) COMMENT 'Filtrado de soft delete'

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Bitácora de reuniones y revisiones de tutoría de titulación. Fuente de la planilla de seguimiento y del reporte mensual a la Dirección Académica.';

CREATE TABLE dictamenes_proyecto (
    id INT AUTO_INCREMENT PRIMARY KEY,
    proyecto_grado_id INT NULL COMMENT 'Proyecto de grado (referencia a proyectos_grado)',
    tipo ENUM('VIABILIDAD_TECNICA', 'DESIGNACION_OFICIAL') NOT NULL
        COMMENT 'VIABILIDAD_TECNICA: informe de aprobación final del tutor | DESIGNACION_OFICIAL: informe de designación de tutor para la DDE',
    numero_informe VARCHAR(50) NULL COMMENT 'Número/cite del informe (ej: INF-DA-015/2026)',
    resultado ENUM('APROBADO', 'OBSERVADO', 'RECHAZADO') NULL
        COMMENT 'Resultado del dictamen (aplica a VIABILIDAD_TECNICA; NULL en DESIGNACION_OFICIAL)',
    fecha_emision DATE NULL COMMENT 'Fecha de emisión del informe',
    destinatario VARCHAR(150) NULL COMMENT 'Instancia destinataria (ej: DDE, Dirección Académica)',
    contenido TEXT NULL COMMENT 'Cuerpo/resumen del informe',

    nombre_archivo VARCHAR(255) NULL COMMENT 'Nombre del archivo PDF generado',
    ruta_archivo VARCHAR(500) NULL COMMENT 'Ruta del PDF en el servidor',
    extension VARCHAR(10) NULL COMMENT 'Extensión (pdf)',
    tipo_mime VARCHAR(100) NULL COMMENT 'Tipo MIME',

    activo BOOLEAN DEFAULT TRUE COMMENT 'Registro activo/inactivo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Fecha de modificación',
    deleted_at TIMESTAMP NULL DEFAULT NULL COMMENT 'Soft delete',
    created_by INT NULL COMMENT 'Usuario que creó',
    updated_by INT NULL COMMENT 'Usuario que modificó',
    deleted_by INT NULL COMMENT 'Usuario que eliminó',

    FOREIGN KEY (proyecto_grado_id) REFERENCES proyectos_grado(id) ON DELETE SET NULL,

    INDEX idx_proyecto_grado_id (proyecto_grado_id) COMMENT 'Dictámenes de un proyecto',
    INDEX idx_tipo (tipo) COMMENT 'Filtrado por tipo de informe',
    INDEX idx_proyecto_tipo (proyecto_grado_id, tipo, activo, deleted_at) COMMENT 'Dictamen vigente por proyecto y tipo',
    INDEX idx_activo (activo) COMMENT 'Filtrado por estado activo',
    INDEX idx_deleted_at (deleted_at) COMMENT 'Filtrado de soft delete'

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Informes formales de tutoría: Viabilidad Técnica (aprobación final) y Designación Oficial de tutor (PDF para la DDE).';

CREATE TABLE sesiones_refuerzo (
    id INT AUTO_INCREMENT PRIMARY KEY,
    asignacion_docente_id INT NULL COMMENT 'Curso que refuerza (referencia a asignaciones_docentes). De aquí derivan docente, materia, paralelo y gestión',
    fecha DATE NULL COMMENT 'Fecha de la sesión',
    hora_inicio TIME NULL COMMENT 'Hora de inicio',
    hora_fin TIME NULL COMMENT 'Hora de fin',
    modalidad ENUM('PRESENCIAL', 'VIRTUAL') DEFAULT 'PRESENCIAL'
        COMMENT 'PRESENCIAL: en aula física (aula_id) | VIRTUAL: por enlace (enlace_virtual)',
    aula_id INT NULL COMMENT 'Aula física (referencia a aulas). NULL si es virtual',
    enlace_virtual VARCHAR(500) NULL COMMENT 'Enlace de la sesión virtual (Meet, Zoom, etc.). NULL si es presencial',
    tema VARCHAR(255) NULL COMMENT 'Tema o contenido a reforzar',
    estado ENUM('PROGRAMADA', 'REALIZADA', 'CANCELADA') DEFAULT 'PROGRAMADA'
        COMMENT 'PROGRAMADA: agendada | REALIZADA: ejecutada | CANCELADA: no se realizó',
    observaciones TEXT NULL COMMENT 'Observaciones generales de la sesión',

    activo BOOLEAN DEFAULT TRUE COMMENT 'Registro activo/inactivo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Fecha de modificación',
    deleted_at TIMESTAMP NULL DEFAULT NULL COMMENT 'Soft delete',
    created_by INT NULL COMMENT 'Usuario que creó',
    updated_by INT NULL COMMENT 'Usuario que modificó',
    deleted_by INT NULL COMMENT 'Usuario que eliminó',

    FOREIGN KEY (asignacion_docente_id) REFERENCES asignaciones_docentes(id) ON DELETE SET NULL,
    FOREIGN KEY (aula_id) REFERENCES aulas(id) ON DELETE SET NULL,

    INDEX idx_asignacion_docente_id (asignacion_docente_id) COMMENT 'Sesiones de un curso',
    INDEX idx_fecha (fecha) COMMENT 'Búsqueda por fecha',
    INDEX idx_estado (estado) COMMENT 'Filtrado por estado',
    INDEX idx_aula_fecha (aula_id, fecha, activo, deleted_at) COMMENT 'Ocupación de aula por fecha',
    INDEX idx_asignacion_fecha (asignacion_docente_id, fecha, activo, deleted_at) COMMENT 'Agenda del curso',
    INDEX idx_activo (activo) COMMENT 'Filtrado por estado activo',
    INDEX idx_deleted_at (deleted_at) COMMENT 'Filtrado de soft delete'

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Sesiones de refuerzo pedagógico agendadas por el docente de la asignatura.';

CREATE TABLE sesion_refuerzo_estudiantes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sesion_refuerzo_id INT NULL COMMENT 'Sesión (referencia a sesiones_refuerzo)',
    matricula_materia_id INT NULL COMMENT 'Matrícula del estudiante en la materia reforzada (referencia a matriculas_materia)',
    origen ENUM('RIESGO', 'DOCENTE', 'VOLUNTARIO') DEFAULT 'RIESGO'
        COMMENT 'RIESGO: convocado por alerta de riesgo pedagógico | DOCENTE: invitado por el docente | VOLUNTARIO: asistencia voluntaria',
    asistio BOOLEAN NULL COMMENT 'NULL: sin registrar | TRUE: asistió | FALSE: faltó',
    progreso ENUM('SIN_EVALUAR', 'EN_PROGRESO', 'MEJORADO', 'SIN_MEJORA') DEFAULT 'SIN_EVALUAR'
        COMMENT 'Valoración del docente sobre el progreso del estudiante tras la sesión',
    observaciones TEXT NULL COMMENT 'Observaciones del docente sobre el estudiante',

    activo BOOLEAN DEFAULT TRUE COMMENT 'Registro activo/inactivo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Fecha de modificación',
    deleted_at TIMESTAMP NULL DEFAULT NULL COMMENT 'Soft delete',
    created_by INT NULL COMMENT 'Usuario que creó',
    updated_by INT NULL COMMENT 'Usuario que modificó',
    deleted_by INT NULL COMMENT 'Usuario que eliminó',

    FOREIGN KEY (sesion_refuerzo_id) REFERENCES sesiones_refuerzo(id) ON DELETE SET NULL,
    FOREIGN KEY (matricula_materia_id) REFERENCES matriculas_materia(id) ON DELETE SET NULL,

    INDEX idx_sesion_id (sesion_refuerzo_id) COMMENT 'Estudiantes de una sesión',
    INDEX idx_matricula_materia_id (matricula_materia_id) COMMENT 'Sesiones de un estudiante-materia',
    INDEX idx_sesion_matricula (sesion_refuerzo_id, matricula_materia_id, activo, deleted_at) COMMENT 'Acceso directo al estudiante de la sesión',
    INDEX idx_asistio (asistio) COMMENT 'Filtrado por asistencia',
    INDEX idx_activo (activo) COMMENT 'Filtrado por estado activo',
    INDEX idx_deleted_at (deleted_at) COMMENT 'Filtrado de soft delete'

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Estudiantes (por matrícula) de sesiones de refuerzo con asistencia y valoración de progreso.';

SET FOREIGN_KEY_CHECKS = 1;
