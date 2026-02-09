-- ============================================
-- MÓDULO DE SUPERVISIÓN DOCENTE Y LIBROS DE REGISTRO
-- Sistema de Gestión Académica - Instituto INCOS
-- 4 Tablas: supervisiones_programadas, fichas_supervision,
--           libros_registro, folios_estudiantes
-- ============================================

USE instituto_incos;

-- ============================================
-- FASE 1: ELIMINACIÓN DE TABLAS
-- Deshabilitamos foreign key checks para poder eliminar en cualquier orden
-- ============================================

SET FOREIGN_KEY_CHECKS = 0;

-- Eliminar todas las tablas (orden no importa con foreign key checks deshabilitado)
DROP TABLE IF EXISTS folios_estudiantes;
DROP TABLE IF EXISTS libros_registro;
DROP TABLE IF EXISTS fichas_supervision;
DROP TABLE IF EXISTS supervisiones_programadas;

-- ============================================
-- FASE 2: CREACIÓN DE TABLAS
-- Las foreign key checks siguen deshabilitadas durante la creación
-- ============================================

-- ============================================
-- TABLA: supervisiones_programadas
-- Programación de supervisiones a docentes (formato INCOS)
-- ============================================

CREATE TABLE supervisiones_programadas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    
    -- Relaciones
    docente_id INT NULL COMMENT 'Docente a supervisar (referencia a docentes)',
    materia_id INT NULL COMMENT 'Materia (referencia a materias)',
    curso_id INT NULL COMMENT 'Curso específico (referencia a cursos)',
    supervisor_id INT NULL COMMENT 'Usuario que supervisará (referencia a usuarios)',
    
    -- Programación
    fecha_programada DATE NOT NULL COMMENT 'Fecha programada de supervisión',
    hora_inicio TIME COMMENT 'Hora de inicio',
    hora_fin TIME COMMENT 'Hora de fin',
    
    -- Tipo
    tipo ENUM('PRESENCIAL', 'VIRTUAL', 'HIBRIDA') DEFAULT 'PRESENCIAL' COMMENT 'Modalidad de la supervisión',
    
    -- Estado
    estado ENUM('PROGRAMADA', 'REALIZADA', 'CANCELADA', 'REPROGRAMADA') DEFAULT 'PROGRAMADA' COMMENT 'Estado de la supervisión',
    motivo_cancelacion TEXT COMMENT 'Motivo de cancelación (si estado = CANCELADA)',
    fecha_reprogramada DATE COMMENT 'Nueva fecha si se reprogramó',
    
    -- Observaciones
    observaciones TEXT COMMENT 'Observaciones sobre la programación',
    
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
    
    FOREIGN KEY (docente_id) REFERENCES docentes(id) ON DELETE SET NULL,
    FOREIGN KEY (materia_id) REFERENCES materias(id) ON DELETE SET NULL,
    FOREIGN KEY (curso_id) REFERENCES cursos(id) ON DELETE SET NULL,
    
    -- Índices para optimización
    INDEX idx_activo (activo) COMMENT 'Filtrado por estado activo',
    INDEX idx_deleted_at (deleted_at) COMMENT 'Filtrado de soft delete',
    INDEX idx_fecha_programada (fecha_programada) COMMENT 'Búsqueda por fecha programada',
    INDEX idx_estado (estado) COMMENT 'Filtrado por estado',
    INDEX idx_docente_id (docente_id) COMMENT 'Búsqueda por docente',
    INDEX idx_supervisor_id (supervisor_id) COMMENT 'Búsqueda por supervisor'
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Programación de supervisiones docentes';

-- ============================================
-- TABLA: fichas_supervision
-- Fichas detalladas de supervisión docente (formato oficial INCOS)
-- ============================================

CREATE TABLE fichas_supervision (
    id INT AUTO_INCREMENT PRIMARY KEY,
    
    -- Relación
    supervision_id INT NULL COMMENT 'Supervisión programada (referencia a supervisiones_programadas)',
    
    -- Fecha real
    fecha_supervision DATE NOT NULL COMMENT 'Fecha en que se realizó',
    
    -- 1. Lista de Asistencia
    control_asistencia BOOLEAN DEFAULT FALSE COMMENT 'Controla asistencia de estudiantes',
    metodo_control ENUM('LISTA_MANUAL', 'EXCEL', 'GOOGLE_MEET', 'OTRO') DEFAULT 'LISTA_MANUAL' COMMENT 'Método de control de asistencia',
    
    -- 2. Presentación del Tema
    presenta_titulo BOOLEAN DEFAULT FALSE COMMENT 'Presenta título del tema',
    presenta_competencias BOOLEAN DEFAULT FALSE COMMENT 'Presenta competencias a desarrollar',
    realiza_retroalimentacion BOOLEAN DEFAULT FALSE COMMENT 'Realiza retroalimentación',
    
    -- 3. Recursos Utilizados
    usa_powerpoint BOOLEAN DEFAULT FALSE COMMENT 'Utiliza PowerPoint',
    usa_pdf BOOLEAN DEFAULT FALSE COMMENT 'Utiliza PDF',
    usa_excel BOOLEAN DEFAULT FALSE COMMENT 'Utiliza Excel',
    usa_word BOOLEAN DEFAULT FALSE COMMENT 'Utiliza Word',
    usa_tablet_grafica BOOLEAN DEFAULT FALSE COMMENT 'Utiliza tablet gráfica',
    usa_pizarra BOOLEAN DEFAULT FALSE COMMENT 'Utiliza pizarra',
    usa_proyector BOOLEAN DEFAULT FALSE COMMENT 'Utiliza proyector',
    otros_recursos TEXT COMMENT 'Otros recursos utilizados',
    
    -- 4. Exposición del Docente
    exposicion_clara BOOLEAN DEFAULT FALSE COMMENT 'Exposición clara y ordenada',
    usa_resumenes BOOLEAN DEFAULT FALSE COMMENT 'Utiliza resúmenes',
    usa_cuadros_sinopticos BOOLEAN DEFAULT FALSE COMMENT 'Utiliza cuadros sinópticos',
    usa_mapas_conceptuales BOOLEAN DEFAULT FALSE COMMENT 'Utiliza mapas conceptuales',
    usa_analisis_criticos BOOLEAN DEFAULT FALSE COMMENT 'Utiliza análisis críticos',
    usa_estudios_caso BOOLEAN DEFAULT FALSE COMMENT 'Utiliza estudios de caso',
    
    -- 5. Participación de Estudiantes
    participacion_activa BOOLEAN DEFAULT FALSE COMMENT 'Estudiantes participan activamente',
    apertura_preguntas BOOLEAN DEFAULT FALSE COMMENT 'Apertura a preguntas',
    promueve_participacion BOOLEAN DEFAULT FALSE COMMENT 'Promueve la participación',
    estudiantes_comprenden BOOLEAN DEFAULT FALSE COMMENT 'Estudiantes comprenden el tema',
    
    -- 6. Actividades Prácticas
    realiza_practicas BOOLEAN DEFAULT FALSE COMMENT 'Realiza actividades prácticas',
    practicas_relacionadas BOOLEAN DEFAULT FALSE COMMENT 'Prácticas relacionadas con teoría',
    
    -- 7. Evaluación
    tipo_evaluacion ENUM('PROCESO', 'RESULTADO', 'AMBAS', 'NINGUNA') COMMENT 'Tipo de evaluación utilizada',
    instrumentos_evaluacion TEXT COMMENT 'Instrumentos de evaluación utilizados',
    
    -- 8. Retroalimentación General
    observaciones_generales TEXT COMMENT 'Observaciones generales de la clase',
    fortalezas TEXT COMMENT 'Fortalezas observadas',
    aspectos_mejorar TEXT COMMENT 'Aspectos a mejorar',
    recomendaciones TEXT COMMENT 'Recomendaciones al docente',
    
    -- 9. Calificación General
    calificacion_general ENUM('EXCELENTE', 'MUY_BUENO', 'BUENO', 'REGULAR', 'DEFICIENTE') COMMENT 'Calificación general de la supervisión',
    puntaje_numerico DECIMAL(5,2) COMMENT 'Puntaje numérico (0-100) opcional',
    
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

    FOREIGN KEY (supervision_id) REFERENCES supervisiones_programadas(id) ON DELETE SET NULL,
    
    -- Índices para optimización
    INDEX idx_activo (activo) COMMENT 'Filtrado por estado activo',
    INDEX idx_deleted_at (deleted_at) COMMENT 'Filtrado de soft delete',
    INDEX idx_supervision_id (supervision_id) COMMENT 'Búsqueda por supervisión',
    INDEX idx_calificacion_general (calificacion_general) COMMENT 'Filtrado por calificación',
    INDEX idx_fecha_supervision (fecha_supervision) COMMENT 'Búsqueda por fecha de supervisión'
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Fichas detalladas de supervisión docente (según formato INCOS)';

-- ============================================
-- TABLA: libros_registro
-- Libros físicos de registro académico oficial
-- ============================================

CREATE TABLE libros_registro (
    id INT AUTO_INCREMENT PRIMARY KEY,
    
    -- Datos del libro
    numero_libro INT NOT NULL COMMENT 'Número del libro físico',
    carrera_id INT NULL COMMENT 'Carrera a la que pertenece (referencia a carreras)',
    
    -- Gestiones que abarca
    gestion_inicio INT NOT NULL COMMENT 'Año de inicio (2025)',
    gestion_fin INT COMMENT 'Año de fin (si ya se cerró)',
    
    -- Control de folios
    folio_inicio INT NOT NULL DEFAULT 1 COMMENT 'Primer folio del libro',
    folio_actual INT NOT NULL DEFAULT 1 COMMENT 'Último folio usado',
    folio_fin INT COMMENT 'Último folio disponible en el libro',
    
    -- Estado
    libro_activo BOOLEAN DEFAULT TRUE COMMENT 'Libro activo para registro',
    fecha_apertura DATE COMMENT 'Fecha de apertura del libro',
    fecha_cierre DATE COMMENT 'Fecha de cierre del libro',
    
    -- Observaciones
    observaciones TEXT COMMENT 'Observaciones sobre el libro',
    
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
    
    FOREIGN KEY (carrera_id) REFERENCES carreras(id) ON DELETE SET NULL,
    
    -- Índices para optimización
    INDEX idx_activo (activo) COMMENT 'Filtrado por estado activo',
    INDEX idx_deleted_at (deleted_at) COMMENT 'Filtrado de soft delete',
    INDEX idx_libro_activo (libro_activo) COMMENT 'Filtrado por libro activo',
    INDEX idx_carrera_id (carrera_id) COMMENT 'Búsqueda por carrera'
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Libros físicos de registro académico oficial';

-- ============================================
-- TABLA: folios_estudiantes
-- Folios oficiales de estudiantes (uno por año académico por estudiante)
-- ============================================

CREATE TABLE folios_estudiantes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    
    -- Relaciones
    estudiante_id INT NULL COMMENT 'Estudiante (referencia a estudiantes)',
    libro_id INT NULL COMMENT 'Libro de registro (referencia a libros_registro)',
    periodo_id INT NULL COMMENT 'Periodo académico al que corresponde este folio (1er, 2do, 3er año). Permite múltiples folios por estudiante (uno por año). Según Historial Académico: cada estudiante tiene un folio diferente por cada año.',
    
    -- Datos del folio
    numero_folio INT NOT NULL COMMENT 'Número de folio en el libro',
    gestion_registro INT NOT NULL COMMENT 'Gestión de registro',
    fecha_registro DATE NOT NULL COMMENT 'Fecha de registro en el libro',
    
    -- Datos académicos resumen
    carga_horaria_total INT DEFAULT 0 COMMENT 'Carga horaria total cursada',
    promedio_general DECIMAL(5,2) COMMENT 'Promedio general',
    asignaturas_aprobadas INT DEFAULT 0,
    asignaturas_totales INT DEFAULT 0,
    
    -- Estado del folio
    estado ENUM('ACTIVO', 'EGRESADO', 'RETIRADO', 'ANULADO') DEFAULT 'ACTIVO',
    fecha_egreso DATE COMMENT 'Fecha de egreso',
    fecha_anulacion DATE COMMENT 'Fecha de anulación',
    motivo_anulacion TEXT,
    
    -- Hash de integridad
    hash_verificacion VARCHAR(255) COMMENT 'Hash SHA-256 para verificar integridad',
    
    -- Observaciones
    observaciones TEXT,
    
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
    FOREIGN KEY (libro_id) REFERENCES libros_registro(id) ON DELETE SET NULL,
    FOREIGN KEY (periodo_id) REFERENCES periodos(id) ON DELETE SET NULL,
    
    -- Índices para optimización
    INDEX idx_activo (activo) COMMENT 'Filtrado por estado activo',
    INDEX idx_deleted_at (deleted_at) COMMENT 'Filtrado de soft delete',
    INDEX idx_estudiante_id (estudiante_id) COMMENT 'Búsqueda por estudiante',
    INDEX idx_estado (estado) COMMENT 'Filtrado por estado',
    INDEX idx_numero_folio (numero_folio) COMMENT 'Búsqueda por número de folio',
    INDEX idx_periodo (periodo_id) COMMENT 'Búsqueda por periodo',
    INDEX idx_estudiante_periodo (estudiante_id, periodo_id, activo, deleted_at) COMMENT 'Búsqueda de folios por estudiante y periodo (permite múltiples folios por estudiante)'
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Folios oficiales de estudiantes en libros de registro. Cada estudiante puede tener múltiples folios (uno por año académico). Según Historial Académico: 1er año → Libro X, Folio Y; 2do año → Libro Z, Folio W; 3er año → Libro A, Folio B.';

-- ============================================
-- FASE 3: REHABILITAR FOREIGN KEY CHECKS (antes de triggers)
-- ============================================

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- TRIGGERS
-- ============================================

DELIMITER $$

-- Trigger para actualizar folio_actual del libro
DROP TRIGGER IF EXISTS trg_libro_actualizar_folio$$

CREATE TRIGGER trg_libro_actualizar_folio
AFTER INSERT ON folios_estudiantes
FOR EACH ROW
BEGIN
    UPDATE libros_registro
    SET folio_actual = GREATEST(folio_actual, NEW.numero_folio)
    WHERE id = NEW.libro_id;
END$$

-- Trigger para generar hash de verificación
DROP TRIGGER IF EXISTS trg_folio_generar_hash$$

CREATE TRIGGER trg_folio_generar_hash
BEFORE INSERT ON folios_estudiantes
FOR EACH ROW
BEGIN
    -- Generar hash simple con datos del folio
    SET NEW.hash_verificacion = SHA2(
        CONCAT(
            NEW.estudiante_id, '-',
            NEW.libro_id, '-',
            NEW.numero_folio, '-',
            NEW.gestion_registro, '-',
            UNIX_TIMESTAMP()
        ),
        256
    );
END$$

DELIMITER ;

-- ============================================
-- FASE 3: REHABILITAR FOREIGN KEY CHECKS
-- ============================================

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- VERIFICACIÓN
-- ============================================

SELECT 'Módulo de supervisión docente y libros de registro creado (4 tablas)' as mensaje;

SELECT 
    TABLE_NAME as tabla,
    TABLE_COMMENT as descripcion
FROM information_schema.TABLES
WHERE TABLE_SCHEMA = 'instituto_incos'
  AND TABLE_NAME IN (
    'supervisiones_programadas',
    'fichas_supervision',
    'libros_registro',
    'folios_estudiantes'
  )
ORDER BY TABLE_NAME;

-- ============================================
-- NOTAS IMPORTANTES
-- ============================================

/*
MÓDULO DE SUPERVISIÓN DOCENTE:

El formulario de supervisión está basado en el formato oficial
de INCOS que contiene:

1. Control de Asistencia
2. Presentación del Tema
3. Recursos Utilizados (PowerPoint, PDF, Excel, pizarra, etc.)
4. Exposición del Docente
5. Participación de Estudiantes
6. Actividades Prácticas
7. Tipo de Evaluación
8. Retroalimentación General
9. Calificación General (EXCELENTE, MUY_BUENO, BUENO, REGULAR, DEFICIENTE)

---

MÓDULO DE LIBROS Y FOLIOS:

- Los libros son físicos y cada uno tiene un rango de folios
- Cada estudiante tiene UN folio en UN libro específico
- El folio es su registro oficial permanente
- El hash_verificacion garantiza la integridad del registro
- Formato típico: Libro 1, Folio 25, Carrera Contaduría

Ejemplo:
- Libro 1 de Contaduría
- Folios 1-500
- Folio actual: 157
- Juan Pérez está en Libro 1, Folio 157
*/

-- ============================================
-- FIN DEL MÓDULO DE SUPERVISIÓN DOCENTE Y LIBROS DE REGISTRO
-- ============================================
