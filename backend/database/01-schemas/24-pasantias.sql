-- ============================================
-- MÓDULO DE PASANTÍAS (PRÁCTICA LABORAL)
-- Sistema de Gestión Académica - Instituto INCOS
-- 4 Tablas: pasantias_empresas, pasantias, pasantias_informes,
--           pasantias_seguimientos
-- Base documental (backend/database/../docs no versionados, ver
-- /Users/miguel/Documents/incos/pasantia/): "INFORME DE VERIFICACIÓN DE LA
-- EMPRESA Y DE SU ACTIVIDAD PARA REALIZAR LA PASANTÍA LABORAL",
-- "FORMATO DE CONVALIDACIÓN DE CERTIFICADO DE TRABAJO PARA PASANTÍAS" y
-- "FORMULARIO DE SEGUIMIENTO DE PASANTÍA".
-- Base normativa: Resolución Ministerial No. 487/2023 — la práctica laboral
-- exige entre 300 y 360 horas, bajo informes de supervisión de la Dirección
-- Académica.
-- Dos caminos: PASANTIA (nueva, con verificación previa de la empresa) y
-- CONVALIDACION (el estudiante ya trabaja y convalida su experiencia).
-- Desacoplado de proyectos_grado (22-modalidades-grado.sql): la práctica
-- laboral es un requisito paralelo a la modalidad de graduación elegida por
-- el estudiante, no una modalidad en sí (el seeder 67 de modalidades_grado
-- no contempla pasantía).
-- NORMALIZACIÓN: Estructura normalizada según 3FN
-- ============================================

USE instituto_incos;

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS pasantias_seguimientos;
DROP TABLE IF EXISTS pasantias_informes;
DROP TABLE IF EXISTS pasantias;
DROP TABLE IF EXISTS pasantias_evaluaciones;
DROP TABLE IF EXISTS pasantias_asignaciones;
DROP TABLE IF EXISTS pasantias_empresas;

-- ============================================
-- TABLA: pasantias_empresas
-- ============================================

CREATE TABLE pasantias_empresas (
    id INT AUTO_INCREMENT PRIMARY KEY,

    -- Identificación legal (sección "verificación" del informe del docente)
    nombre VARCHAR(200) NOT NULL COMMENT 'Nombre de la empresa/institución (campo "nombre de la empresa" del informe de verificación)',
    tipo_societario ENUM('UNIPERSONAL', 'SRL', 'SA', 'PUBLICA', 'OTRO') NULL
        COMMENT 'Tipo societario: checkboxes Unipersonal / S.R.L. / S.A. del informe de verificación. PUBLICA/OTRO para instituciones no societarias',
    nit VARCHAR(20) NULL COMMENT 'NIT (campo NIT del informe de verificación)',
    en_funcionamiento BOOLEAN NULL COMMENT 'Empresa en funcionamiento al momento de la verificación (campo "está o no en funcionamiento" del informe)',

    -- Ubicación y contacto (informe de verificación + hoja de seguimiento)
    direccion VARCHAR(255) NULL COMMENT 'Dirección: calle/Av. y número (informe de verificación y hoja de seguimiento)',
    telefono VARCHAR(50) NULL COMMENT 'Teléfono o celular de la empresa (hoja de seguimiento de pasantía)',
    sector_actividad VARCHAR(150) NULL COMMENT 'Sector o actividad económica (campo del informe de verificación)',

    observaciones TEXT NULL COMMENT 'Observaciones generales',

    activo BOOLEAN DEFAULT TRUE COMMENT 'Registro activo/inactivo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Fecha de modificación',
    deleted_at TIMESTAMP NULL DEFAULT NULL COMMENT 'Soft delete',
    created_by INT NULL COMMENT 'Usuario que creó',
    updated_by INT NULL COMMENT 'Usuario que modificó',
    deleted_by INT NULL COMMENT 'Usuario que eliminó',

    INDEX idx_nombre (nombre) COMMENT 'Búsqueda por nombre de empresa',
    INDEX idx_nit (nit) COMMENT 'Búsqueda por NIT',
    INDEX idx_activo (activo) COMMENT 'Filtrado por estado activo',
    INDEX idx_deleted_at (deleted_at) COMMENT 'Filtrado de soft delete'

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Catálogo de empresas/instituciones para práctica laboral. Campos según el "INFORME DE VERIFICACIÓN DE LA EMPRESA Y DE SU ACTIVIDAD PARA REALIZAR LA PASANTÍA LABORAL".';

-- ============================================
-- TABLA: pasantias
-- ============================================

CREATE TABLE pasantias (
    id INT AUTO_INCREMENT PRIMARY KEY,

    -- Relaciones
    estudiante_id INT NULL COMMENT 'Estudiante pasante (referencia a estudiantes). Nombre, CI, celular y carrera salen de su ficha (datos del pasante en la hoja de seguimiento)',
    empresa_id INT NULL COMMENT 'Empresa/institución (referencia a pasantias_empresas)',
    carrera_id INT NULL COMMENT 'Carrera del estudiante (referencia a carreras). Los documentos exigen estudiante de 3er año de la carrera',
    gestion_id INT NULL COMMENT 'Gestión académica (referencia a gestiones)',
    docente_supervisor_id INT NULL COMMENT 'Docente responsable del seguimiento (referencia a docentes). Firma y sella la hoja de seguimiento y eleva los informes',

    -- Camino de cumplimiento
    tipo ENUM('PASANTIA', 'CONVALIDACION') DEFAULT 'PASANTIA'
        COMMENT 'PASANTIA: práctica nueva con verificación de empresa | CONVALIDACION: convalida experiencia laboral existente (FORMATO DE CONVALIDACIÓN DE CERTIFICADO DE TRABAJO)',

    -- Puesto (informe de verificación: "cargo o rol del estudiante"; hoja de
    -- seguimiento: "área o departamento asignado")
    area_departamento VARCHAR(150) NULL COMMENT 'Área o departamento asignado (hoja de seguimiento)',
    cargo_puesto VARCHAR(100) NULL COMMENT 'Cargo o rol del estudiante (informe de verificación / convalidación: cargo que desempeña)',
    funciones TEXT NULL COMMENT 'Funciones que realiza (campo del formato de convalidación; en pasantía nueva: actividades previstas)',

    -- Fechas y horas (R.M. 487/2023: 300 a 360 horas laborales)
    fecha_inicio DATE NULL COMMENT 'Fecha de inicio (hoja de seguimiento). En CONVALIDACION: fecha desde la cual trabaja en la empresa (ej: desde el 13/06/2022)',
    fecha_finalizacion DATE NULL COMMENT 'Fecha de finalización (hoja de seguimiento). NULL en convalidación vigente ("hasta la presente fecha")',
    horas_requeridas SMALLINT UNSIGNED DEFAULT 300 COMMENT 'Horas laborales requeridas: entre 300 y 360 según R.M. 487/2023 (validación de aplicación)',
    horas_cumplidas SMALLINT UNSIGNED DEFAULT 0 COMMENT 'Horas cumplidas a la fecha',

    -- Contrato (solo camino CONVALIDACION)
    tipo_contrato ENUM('PERMANENTE', 'OTRO') NULL COMMENT 'Tipo de contrato (formato de convalidación). NULL en pasantía nueva',
    tipo_contrato_detalle VARCHAR(100) NULL COMMENT 'Detalle si tipo_contrato = OTRO',

    -- Responsable en la empresa (hoja de seguimiento)
    responsable_empresa VARCHAR(150) NULL COMMENT 'Responsable a cargo del pasante en la empresa (hoja de seguimiento)',
    cargo_responsable VARCHAR(100) NULL COMMENT 'Cargo del responsable en la empresa',
    telefono_responsable VARCHAR(50) NULL COMMENT 'Teléfono del responsable en la empresa',

    -- Estado del trámite
    estado ENUM('SOLICITADA', 'EN_CURSO', 'FINALIZADA', 'CONVALIDADA', 'RECHAZADA', 'CANCELADA') DEFAULT 'SOLICITADA'
        COMMENT 'SOLICITADA: a la espera del informe de verificación/convalidación | EN_CURSO: pasantía autorizada y en ejecución | FINALIZADA: pasantía concluida con seguimiento | CONVALIDADA: experiencia laboral aceptada como práctica | RECHAZADA: informe no viable/no válido | CANCELADA: interrumpida',
    observaciones TEXT NULL COMMENT 'Observaciones generales del trámite',

    activo BOOLEAN DEFAULT TRUE COMMENT 'Registro activo/inactivo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Fecha de modificación',
    deleted_at TIMESTAMP NULL DEFAULT NULL COMMENT 'Soft delete',
    created_by INT NULL COMMENT 'Usuario que creó',
    updated_by INT NULL COMMENT 'Usuario que modificó',
    deleted_by INT NULL COMMENT 'Usuario que eliminó',

    FOREIGN KEY (estudiante_id) REFERENCES estudiantes(id) ON DELETE SET NULL,
    FOREIGN KEY (empresa_id) REFERENCES pasantias_empresas(id) ON DELETE SET NULL,
    FOREIGN KEY (carrera_id) REFERENCES carreras(id) ON DELETE SET NULL,
    FOREIGN KEY (gestion_id) REFERENCES gestiones(id) ON DELETE SET NULL,
    FOREIGN KEY (docente_supervisor_id) REFERENCES docentes(id) ON DELETE SET NULL,

    INDEX idx_estudiante_id (estudiante_id) COMMENT 'Pasantías de un estudiante',
    INDEX idx_empresa_id (empresa_id) COMMENT 'Pasantes de una empresa',
    INDEX idx_estado (estado) COMMENT 'Filtrado por estado del trámite',
    INDEX idx_tipo (tipo) COMMENT 'Filtrado por camino (pasantía/convalidación)',
    INDEX idx_gestion_estado (gestion_id, estado, activo, deleted_at) COMMENT 'Pasantías de la gestión por estado',
    INDEX idx_docente_supervisor (docente_supervisor_id, activo, deleted_at) COMMENT 'Pasantías supervisadas por un docente',
    INDEX idx_activo (activo) COMMENT 'Filtrado por estado activo',
    INDEX idx_deleted_at (deleted_at) COMMENT 'Filtrado de soft delete'

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Práctica laboral del estudiante (R.M. 487/2023, 300-360 horas): pasantía nueva o convalidación de certificado de trabajo. Requisito paralelo a la modalidad de graduación.';

-- ============================================
-- TABLA: pasantias_informes
-- ============================================

CREATE TABLE pasantias_informes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pasantia_id INT NULL COMMENT 'Trámite de pasantía (referencia a pasantias)',
    tipo ENUM('VERIFICACION_EMPRESA', 'CONVALIDACION_TRABAJO') NOT NULL
        COMMENT 'VERIFICACION_EMPRESA: informe del docente al Rector, vía Dirección Académica, previo a autorizar la pasantía | CONVALIDACION_TRABAJO: informe que convalida el certificado de trabajo como práctica laboral',
    docente_id INT NULL COMMENT 'Docente que eleva el informe (referencia a docentes)',
    numero_memo VARCHAR(50) NULL COMMENT 'Cite del memo de instrucción (ej: MEMO/INCOS/DA/N°.../2025)',
    fecha_verificacion DATE NULL COMMENT 'Fecha de la verificación en la empresa',
    fecha_emision DATE NULL COMMENT 'Fecha de emisión del informe',
    destinatario VARCHAR(150) NULL COMMENT 'Instancia destinataria (ej: Rectorado, vía Dirección Académica)',

    -- Conclusión (ambos tipos)
    area_relacionada VARCHAR(150) NULL COMMENT 'Área de trabajo relacionada con la carrera del estudiante (conclusión del informe)',
    evaluacion_cualitativa TEXT NULL COMMENT 'Evaluación cualitativa del docente en convalidación (alto rendimiento, responsable, puntual, eficiente, trabajo en equipo). NULL en verificación',
    resultado ENUM('VIABLE', 'NO_VIABLE') NULL COMMENT 'Viabilidad SI/NO (verificación) o validez de la convalidación',
    contenido TEXT NULL COMMENT 'Cuerpo/resumen del informe',

    -- Documento generado/escaneado
    nombre_archivo VARCHAR(255) NULL COMMENT 'Nombre del archivo PDF del informe',
    ruta_archivo VARCHAR(500) NULL COMMENT 'Ruta del archivo en el servidor',
    extension VARCHAR(10) NULL COMMENT 'Extensión (pdf)',
    tipo_mime VARCHAR(100) NULL COMMENT 'Tipo MIME',

    activo BOOLEAN DEFAULT TRUE COMMENT 'Registro activo/inactivo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Fecha de modificación',
    deleted_at TIMESTAMP NULL DEFAULT NULL COMMENT 'Soft delete',
    created_by INT NULL COMMENT 'Usuario que creó',
    updated_by INT NULL COMMENT 'Usuario que modificó',
    deleted_by INT NULL COMMENT 'Usuario que eliminó',

    FOREIGN KEY (pasantia_id) REFERENCES pasantias(id) ON DELETE SET NULL,
    FOREIGN KEY (docente_id) REFERENCES docentes(id) ON DELETE SET NULL,

    INDEX idx_pasantia_id (pasantia_id) COMMENT 'Informes de un trámite',
    INDEX idx_pasantia_tipo (pasantia_id, tipo, activo, deleted_at) COMMENT 'Informe vigente por trámite y tipo',
    INDEX idx_docente_id (docente_id) COMMENT 'Informes elevados por un docente',
    INDEX idx_activo (activo) COMMENT 'Filtrado por estado activo',
    INDEX idx_deleted_at (deleted_at) COMMENT 'Filtrado de soft delete'

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Informes formales del docente: "INFORME DE VERIFICACIÓN DE LA EMPRESA..." y "FORMATO DE CONVALIDACIÓN DE CERTIFICADO DE TRABAJO...". Patrón dictamenes_proyecto (22-tutorias-acompanamiento.sql).';

-- ============================================
-- TABLA: pasantias_seguimientos
-- ============================================

CREATE TABLE pasantias_seguimientos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pasantia_id INT NULL COMMENT 'Trámite de pasantía (referencia a pasantias)',
    fecha DATE NULL COMMENT 'Fecha del seguimiento',

    descripcion_trabajo TEXT NULL COMMENT 'Descripción del trabajo realizado (campo del formulario de seguimiento)',
    principales_actividades TEXT NULL COMMENT 'Principales actividades (campo del formulario de seguimiento)',
    nivel_desempeno ENUM('ALTO', 'MEDIO', 'BAJO') NULL COMMENT 'Nivel de desempeño — escala única del formulario de seguimiento (no hay sub-escalas)',
    fortalezas TEXT NULL COMMENT 'Fortalezas observadas (campo del formulario)',
    areas_mejorar TEXT NULL COMMENT 'Áreas en que debe mejorar (campo del formulario)',
    sugerencias TEXT NULL COMMENT 'Sugerencias para el proceso de pasantías (campo del formulario)',

    firmado_docente BOOLEAN DEFAULT FALSE COMMENT 'Formulario con sello y firma del docente de INCOS (equivalente digital)',
    firmado_empresa BOOLEAN DEFAULT FALSE COMMENT 'Formulario con sello y firma de la empresa (equivalente digital)',

    -- Escaneo del formulario firmado (la convalidación exige adjuntarlo)
    nombre_archivo VARCHAR(255) NULL COMMENT 'Nombre del archivo escaneado del formulario firmado y sellado',
    ruta_archivo VARCHAR(500) NULL COMMENT 'Ruta del archivo en el servidor',
    extension VARCHAR(10) NULL COMMENT 'Extensión (pdf, jpg)',
    tipo_mime VARCHAR(100) NULL COMMENT 'Tipo MIME',

    activo BOOLEAN DEFAULT TRUE COMMENT 'Registro activo/inactivo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Fecha de modificación',
    deleted_at TIMESTAMP NULL DEFAULT NULL COMMENT 'Soft delete',
    created_by INT NULL COMMENT 'Usuario que creó',
    updated_by INT NULL COMMENT 'Usuario que modificó',
    deleted_by INT NULL COMMENT 'Usuario que eliminó',

    FOREIGN KEY (pasantia_id) REFERENCES pasantias(id) ON DELETE SET NULL,

    INDEX idx_pasantia_id (pasantia_id) COMMENT 'Seguimientos de un trámite',
    INDEX idx_pasantia_fecha (pasantia_id, fecha, activo, deleted_at) COMMENT 'Seguimientos cronológicos del trámite',
    INDEX idx_nivel_desempeno (nivel_desempeno) COMMENT 'Filtrado por nivel de desempeño',
    INDEX idx_activo (activo) COMMENT 'Filtrado por estado activo',
    INDEX idx_deleted_at (deleted_at) COMMENT 'Filtrado de soft delete'

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='FORMULARIO DE SEGUIMIENTO DE PASANTÍA: evaluación del pasante con sello y firma del docente de INCOS y de la empresa.';

SET FOREIGN_KEY_CHECKS = 1;
