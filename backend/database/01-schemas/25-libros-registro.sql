-- ============================================
-- MÓDULO DE LIBROS DE REGISTRO ACADÉMICO (CENTRALIZADOR DE CALIFICACIONES)
-- Sistema de Gestión Académica - Instituto INCOS
-- 3 Tablas: libros_registro, folios_libro, folio_estudiantes
-- Base documental: "LIBRO LLENADO SISTEMAS 11 dic 2025" (libro físico real,
-- formato oficial del Ministerio de Educación), fotos del centralizador
-- impreso y el "HISTORIAL ACADÉMICO" de estudiantes (OtraDocumentacion
-- INCOS.pdf). Un LIBRO es por GESTIÓN, COMPARTIDO por las 3 carreras del
-- instituto (Contaduría General, Administración de Empresas, Sistemas
-- Informáticos): se abre un número de libro nuevo cada gestión (evidencia
-- cruzada: el historial de una estudiante de Sistemas muestra "1° AÑO N°
-- LIBRO 12" y "2° AÑO N° LIBRO 13"; un folio de muestra de TERCERO-PARALELO A
-- Sistemas gestión 2024 usa exactamente el LIBRO N° 13; y el libro 14
-- corresponde a gestión 2025 — la secuencia 12→13→14 avanza un número por
-- gestión, no por carrera). Los folios son CORRELATIVOS dentro del libro y
-- CRUZAN de una carrera a la siguiente en el orden canónico institucional
-- (Contaduría → Administración → Informática, `ordenCarreraLibro`): por eso
-- el libro 14/2025 arranca sus folios de Sistemas (última carrera del orden)
-- en el folio 56 — los folios 1-55 los consumieron Contaduría y
-- Administración en ESE MISMO libro físico, no en libros aparte. Corregido
-- 2026-08-03: el schema anterior modelaba una fila por carrera+gestión (3
-- filas fingiendo ser 1 libro); la numeración correlativa cruzada ya se
-- había parcheado a nivel de query (docs/plan/libros-registro-plan-desarrollo.md
-- §0.0) pero el libro seguía partido en 3 entidades sin una ficha única.
-- Un FOLIO = una página del CENTRALIZADOR DE CALIFICACIONES de un paralelo
-- (curso-paralelo-gestión) de CUALQUIERA de las 3 carreras, con hasta 10
-- estudiantes por página; la carrera del folio se deriva de su
-- `paralelo_gestion_id`, no del libro.
-- Las notas por materia NO se duplican aquí: las provee el dominio
-- calificaciones (vista 135, centralizador por paralelo, long-format) — el
-- folio solo congela ESTADO y OBSERVACIONES por estudiante, tal como en el
-- papel firmado. Firmas de docentes por materia derivan de
-- asignaciones_docentes; estadísticas del paralelo derivan del conteo de
-- estados. Firmas de autoridades (Jefe de Carrera, Director Académico,
-- Rector) son del documento impreso, no se modelan como tabla.
-- Dominio de supervisión pedagógica docente (ficha de seguimiento de clase)
-- separado en 27-supervision-docente.sql: no tiene relación con libros/folios.
-- NORMALIZACIÓN: Estructura normalizada según 3FN
-- ============================================

USE instituto_incos;

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS folio_estudiantes;
DROP TABLE IF EXISTS folios_libro;
DROP TABLE IF EXISTS folios_estudiantes;
DROP TABLE IF EXISTS fichas_supervision;
DROP TABLE IF EXISTS supervisiones_programadas;
DROP TABLE IF EXISTS libros_registro;

-- ============================================
-- TABLA: libros_registro
-- ============================================

CREATE TABLE libros_registro (
    id INT AUTO_INCREMENT PRIMARY KEY,

    numero_libro INT NOT NULL COMMENT 'Número del libro físico (cabecera LIBRO N° del centralizador). Correlativo institucional: avanza un número cada gestión (ej: Libro 12→gestión 2023, 13→2024, 14→2025)',
    gestion_id INT NULL COMMENT 'Gestión académica del libro (referencia a gestiones). Un libro nuevo se abre cada gestión, compartido por las 3 carreras del instituto',
    codigo_registro VARCHAR(20) NULL COMMENT 'Código de Registro institucional impreso en cada página (ej: 81981609)',

    folio_inicial INT NOT NULL DEFAULT 1 COMMENT 'Primer folio del libro. No siempre es 1: puede continuar la numeración de turnos/lotes previos de la misma gestión (ej: libro 14/2025 arranca en folio 56 para los paralelos revisados)',
    folio_actual INT NOT NULL DEFAULT 0 COMMENT 'Último folio registrado en el libro',
    folio_final INT NULL COMMENT 'Último folio disponible del libro físico (si se conoce)',

    estado ENUM('ABIERTO', 'CERRADO') DEFAULT 'ABIERTO' COMMENT 'ABIERTO: admite nuevos folios de la gestión en curso | CERRADO: libro completado, la gestión cerró y se abrió un libro nuevo',
    fecha_apertura DATE NULL COMMENT 'Fecha de apertura del libro físico',
    fecha_cierre DATE NULL COMMENT 'Fecha de cierre del libro físico',
    observaciones TEXT NULL COMMENT 'Observaciones sobre el libro',

    activo BOOLEAN DEFAULT TRUE COMMENT 'Registro activo/inactivo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Fecha de modificación',
    deleted_at TIMESTAMP NULL DEFAULT NULL COMMENT 'Soft delete',
    created_by INT NULL COMMENT 'Usuario que creó',
    updated_by INT NULL COMMENT 'Usuario que modificó',
    deleted_by INT NULL COMMENT 'Usuario que eliminó',

    FOREIGN KEY (gestion_id) REFERENCES gestiones(id) ON DELETE SET NULL,

    UNIQUE INDEX uk_numero_libro (numero_libro) COMMENT 'Un número de libro físico no se repite en el instituto',
    UNIQUE INDEX uk_gestion (gestion_id) COMMENT 'Un solo libro por gestión, compartido por las 3 carreras',
    INDEX idx_estado (estado) COMMENT 'Filtrado por libros abiertos',
    INDEX idx_activo (activo) COMMENT 'Filtrado por estado activo',
    INDEX idx_deleted_at (deleted_at) COMMENT 'Filtrado de soft delete'

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Libros físicos del centralizador de calificaciones: uno por gestión, compartido por las 3 carreras del instituto (cabecera real: LIBRO N° 14, gestión 2025, Código de Registro 81981609; secuencia 12→13→14 confirmada contra el historial académico de estudiantes).';

-- ============================================
-- TABLA: folios_libro
-- ============================================

CREATE TABLE folios_libro (
    id INT AUTO_INCREMENT PRIMARY KEY,

    libro_id INT NULL COMMENT 'Libro al que pertenece el folio (referencia a libros_registro)',
    numero_folio INT NOT NULL COMMENT 'Número de folio correlativo del libro (cabecera FOLIO N°, ej: 56). La correlatividad cruza paralelos y años/cursos dentro de la misma gestión del libro',
    paralelo_gestion_id INT NULL COMMENT 'Paralelo en gestión del centralizador (referencia a paralelos_gestion). De aquí derivan carrera, gestión, turno, curso y paralelo de la cabecera del folio',
    orden_en_paralelo TINYINT UNSIGNED NULL COMMENT 'Orden de la página dentro del paralelo (1ra, 2da... página de hasta 10 estudiantes)',

    estado ENUM('BORRADOR', 'ANULADO') DEFAULT 'BORRADOR'
        COMMENT 'BORRADOR: vigente | ANULADO: página invalidada (exige motivo). Sin IMPRESO/FIRMADO: el sistema no verifica impresión/firma física; el cierre oficial del documento (bloque de firmas en el export) lo controla libros_registro.estado (CERRADO)',
    fecha_registro DATE NULL COMMENT 'Fecha de registro del folio (se fija al generarlo)',
    observaciones TEXT NULL COMMENT 'Observaciones del folio (ej: motivo de anulación)',

    activo BOOLEAN DEFAULT TRUE COMMENT 'Registro activo/inactivo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Fecha de modificación',
    deleted_at TIMESTAMP NULL DEFAULT NULL COMMENT 'Soft delete',
    created_by INT NULL COMMENT 'Usuario que creó',
    updated_by INT NULL COMMENT 'Usuario que modificó',
    deleted_by INT NULL COMMENT 'Usuario que eliminó',

    FOREIGN KEY (libro_id) REFERENCES libros_registro(id) ON DELETE SET NULL,
    FOREIGN KEY (paralelo_gestion_id) REFERENCES paralelos_gestion(id) ON DELETE SET NULL,

    UNIQUE INDEX uk_libro_folio (libro_id, numero_folio) COMMENT 'Número de folio único dentro del libro',
    INDEX idx_paralelo_gestion (paralelo_gestion_id, activo, deleted_at) COMMENT 'Folios del centralizador de un paralelo-gestión',
    INDEX idx_estado (estado) COMMENT 'Filtrado por estado del folio',
    INDEX idx_activo (activo) COMMENT 'Filtrado por estado activo',
    INDEX idx_deleted_at (deleted_at) COMMENT 'Filtrado de soft delete'

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Folio = página del centralizador de calificaciones de un paralelo (hasta 10 estudiantes por página, formato real del libro).';

-- ============================================
-- TABLA: folio_estudiantes
-- ============================================

CREATE TABLE folio_estudiantes (
    id INT AUTO_INCREMENT PRIMARY KEY,

    folio_id INT NULL COMMENT 'Folio/página del centralizador (referencia a folios_libro)',
    numero_orden TINYINT UNSIGNED NULL COMMENT 'Columna N° de la nómina: correlativo del estudiante en el paralelo (continúa entre folios: 1-10, 11-20, ...)',
    estudiante_id INT NULL COMMENT 'Estudiante de la fila (referencia a estudiantes). Nombre y CI+expedido salen de su ficha',
    inscripcion_id INT NULL COMMENT 'Inscripción que liga estudiante y paralelo_gestion en la gestión del folio (referencia a inscripciones)',

    estado_academico ENUM('APROBADO', 'REPROBADO', 'ABANDONO') NULL
        COMMENT 'Columna ESTADO del centralizador, congelada al firmar el folio (snapshot del resultado de la gestión). Las notas por materia se leen de la vista 135 (centralizador), no se copian aquí',
    observaciones VARCHAR(255) NULL COMMENT 'Columna OBSERVACIONES del centralizador (ej: REPROBADO 2DA VEZ-ARTICULO 18, NO LLEVA LAS ASIG. POR CHOQUE DE HORARIO, HOMOLOGACIÓN GESTIÓN 2025)',

    activo BOOLEAN DEFAULT TRUE COMMENT 'Registro activo/inactivo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Fecha de modificación',
    deleted_at TIMESTAMP NULL DEFAULT NULL COMMENT 'Soft delete',
    created_by INT NULL COMMENT 'Usuario que creó',
    updated_by INT NULL COMMENT 'Usuario que modificó',
    deleted_by INT NULL COMMENT 'Usuario que eliminó',

    FOREIGN KEY (folio_id) REFERENCES folios_libro(id) ON DELETE SET NULL,
    FOREIGN KEY (estudiante_id) REFERENCES estudiantes(id) ON DELETE SET NULL,
    FOREIGN KEY (inscripcion_id) REFERENCES inscripciones(id) ON DELETE SET NULL,

    UNIQUE INDEX uk_folio_orden (folio_id, numero_orden) COMMENT 'Una fila por número de orden dentro del folio',
    INDEX idx_estudiante_id (estudiante_id, activo, deleted_at) COMMENT 'Historial libro/folio de un estudiante (certificaciones)',
    INDEX idx_inscripcion_id (inscripcion_id) COMMENT 'Fila de folio de una inscripción',
    INDEX idx_activo (activo) COMMENT 'Filtrado por estado activo',
    INDEX idx_deleted_at (deleted_at) COMMENT 'Filtrado de soft delete'

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Fila de estudiante dentro de un folio del centralizador (N°, ESTADO, OBSERVACIONES). Las notas por materia y la leyenda NP/AP/PRE las provee el dominio calificaciones (vista 135), no se copian.';

SET FOREIGN_KEY_CHECKS = 1;
