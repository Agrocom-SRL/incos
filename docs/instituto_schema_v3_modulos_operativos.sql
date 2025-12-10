-- ============================================
-- SCHEMA COMPLEMENTARIO V3 - MÓDULOS OPERATIVOS
-- Instituto INCOS Santa Cruz
-- Basado en análisis del PDF de documentación operativa
-- ============================================

USE instituto_incos;

-- ============================================
-- AJUSTES A TABLA DE CALIFICACIONES
-- ============================================

-- Modificar inscripciones_materias para el sistema de calificaciones complejo
ALTER TABLE inscripciones_materias 
ADD COLUMN nota_1er_parcial DECIMAL(5,2) AFTER asistencia_porcentaje,
ADD COLUMN nota_2do_parcial DECIMAL(5,2) AFTER nota_1er_parcial,
ADD COLUMN suma_parciales DECIMAL(5,2) AFTER nota_2do_parcial,
ADD COLUMN nota_3er_parcial DECIMAL(5,2) AFTER suma_parciales,
ADD COLUMN nota_practico DECIMAL(5,2) AFTER nota_3er_parcial,
ADD COLUMN suma_total DECIMAL(5,2) AFTER nota_practico,
ADD COLUMN nota_recuperatorio DECIMAL(5,2) AFTER nota_final;

-- ============================================
-- MÓDULO DE PASANTÍAS LABORALES
-- ============================================

-- Tabla de Empresas para Pasantías
CREATE TABLE IF NOT EXISTS pasantias_empresas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre_empresa VARCHAR(200) NOT NULL,
    razon_social VARCHAR(200),
    nit VARCHAR(20),
    direccion TEXT,
    telefono VARCHAR(50),
    celular VARCHAR(50),
    email VARCHAR(150),
    sector ENUM('PUBLICO', 'PRIVADO', 'ONG', 'OTRO') DEFAULT 'PRIVADO',
    rubro VARCHAR(100),
    contacto_nombre VARCHAR(150),
    contacto_cargo VARCHAR(100),
    activa BOOLEAN DEFAULT TRUE,
    observaciones TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_activa (activa),
    INDEX idx_sector (sector)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de Asignaciones de Pasantías
CREATE TABLE IF NOT EXISTS pasantias_asignaciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    estudiante_id INT NOT NULL,
    empresa_id INT NOT NULL,
    carrera_id INT NOT NULL,
    gestion_id INT NOT NULL,
    area_departamento VARCHAR(150),
    fecha_inicio DATE NOT NULL,
    fecha_finalizacion DATE,
    duracion_dias INT,
    responsable_empresa VARCHAR(150),
    cargo_responsable VARCHAR(100),
    docente_supervisor_id INT,
    estado ENUM('PROGRAMADA', 'EN_CURSO', 'FINALIZADA', 'CANCELADA') DEFAULT 'PROGRAMADA',
    observaciones TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (estudiante_id) REFERENCES estudiantes(id),
    FOREIGN KEY (empresa_id) REFERENCES pasantias_empresas(id),
    FOREIGN KEY (carrera_id) REFERENCES carreras(id),
    FOREIGN KEY (gestion_id) REFERENCES gestiones(id),
    FOREIGN KEY (docente_supervisor_id) REFERENCES usuarios(id),
    INDEX idx_estudiante (estudiante_id),
    INDEX idx_estado (estado),
    INDEX idx_gestion (gestion_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de Evaluaciones de Pasantías
CREATE TABLE IF NOT EXISTS pasantias_evaluaciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    asignacion_id INT NOT NULL,
    fecha_evaluacion DATE NOT NULL,
    descripcion_trabajo TEXT,
    principales_actividades TEXT,
    nivel_desempeno ENUM('ALTO', 'MEDIO', 'BAJO') NOT NULL,
    fortalezas TEXT,
    areas_mejorar TEXT,
    sugerencias TEXT,
    evaluado_por VARCHAR(150),
    cargo_evaluador VARCHAR(100),
    firma_docente VARCHAR(255), -- Ruta a imagen de firma
    firma_empresa VARCHAR(255), -- Ruta a imagen de firma
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (asignacion_id) REFERENCES pasantias_asignaciones(id),
    INDEX idx_asignacion (asignacion_id),
    INDEX idx_nivel (nivel_desempeno)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- MÓDULO DE SUPERVISIÓN DOCENTE
-- ============================================

-- Tabla de Programación de Supervisiones
CREATE TABLE IF NOT EXISTS supervisiones_programadas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    docente_id INT NOT NULL,
    materia_id INT NOT NULL,
    curso_id INT NOT NULL,
    supervisor_id INT NOT NULL,
    fecha_programada DATE NOT NULL,
    hora_inicio TIME,
    hora_fin TIME,
    tipo ENUM('PRESENCIAL', 'VIRTUAL') DEFAULT 'PRESENCIAL',
    estado ENUM('PROGRAMADA', 'REALIZADA', 'CANCELADA', 'REPROGRAMADA') DEFAULT 'PROGRAMADA',
    observaciones TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (docente_id) REFERENCES usuarios(id),
    FOREIGN KEY (materia_id) REFERENCES materias(id),
    FOREIGN KEY (curso_id) REFERENCES cursos(id),
    FOREIGN KEY (supervisor_id) REFERENCES usuarios(id),
    INDEX idx_fecha (fecha_programada),
    INDEX idx_estado (estado),
    INDEX idx_docente (docente_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de Fichas de Supervisión
CREATE TABLE IF NOT EXISTS fichas_supervision (
    id INT AUTO_INCREMENT PRIMARY KEY,
    supervision_id INT NOT NULL,
    fecha_supervision DATE NOT NULL,
    -- Lista de Asistencia
    control_asistencia BOOLEAN DEFAULT FALSE,
    metodo_control ENUM('LISTA_MANUAL', 'EXCEL', 'GOOGLE_MEET') DEFAULT 'LISTA_MANUAL',
    -- Presentación del Tema
    presenta_titulo BOOLEAN DEFAULT FALSE,
    presenta_competencias BOOLEAN DEFAULT FALSE,
    realiza_retroalimentacion BOOLEAN DEFAULT FALSE,
    -- Recursos Utilizados
    usa_powerpoint BOOLEAN DEFAULT FALSE,
    usa_pdf BOOLEAN DEFAULT FALSE,
    usa_excel BOOLEAN DEFAULT FALSE,
    usa_word BOOLEAN DEFAULT FALSE,
    usa_tablet_grafica BOOLEAN DEFAULT FALSE,
    otros_recursos TEXT,
    -- Exposición del Docente
    exposicion_clara BOOLEAN DEFAULT FALSE,
    usa_resumenes BOOLEAN DEFAULT FALSE,
    usa_cuadros_sinopticos BOOLEAN DEFAULT FALSE,
    usa_mapas_conceptuales BOOLEAN DEFAULT FALSE,
    usa_analisis_criticos BOOLEAN DEFAULT FALSE,
    usa_estudios_caso BOOLEAN DEFAULT FALSE,
    -- Participación Estudiantes
    participacion_activa BOOLEAN DEFAULT FALSE,
    -- Actividades Prácticas
    apertura_preguntas BOOLEAN DEFAULT FALSE,
    promueve_participacion BOOLEAN DEFAULT FALSE,
    -- Evaluación
    tipo_evaluacion ENUM('PROCESO', 'RESULTADO', 'AMBAS', 'NINGUNA'),
    observaciones_generales TEXT,
    fortalezas TEXT,
    aspectos_mejorar TEXT,
    recomendaciones TEXT,
    calificacion_general ENUM('EXCELENTE', 'MUY_BUENO', 'BUENO', 'REGULAR', 'DEFICIENTE'),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (supervision_id) REFERENCES supervisiones_programadas(id),
    INDEX idx_supervision (supervision_id),
    INDEX idx_calificacion (calificacion_general)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- MÓDULO DE LICENCIAS ESTUDIANTILES
-- ============================================
-- NOTA: Ya está normalizado en → 06-estudiantes-parte2.sql
-- - licencias_solicitudes (estructura mejorada)
-- - licencias_documentos → Eliminada (integrada en documentos_estudiante con sistema polimórfico)

-- ============================================
-- MÓDULO DE HISTORIAL ACADÉMICO OFICIAL
-- ============================================

-- Tabla de Libros de Registro
CREATE TABLE IF NOT EXISTS libros_registro (
    id INT AUTO_INCREMENT PRIMARY KEY,
    numero_libro INT NOT NULL UNIQUE,
    carrera_id INT NOT NULL,
    gestion_inicio INT NOT NULL,
    gestion_fin INT,
    folio_inicio INT NOT NULL DEFAULT 1,
    folio_actual INT NOT NULL DEFAULT 1,
    folio_fin INT,
    activo BOOLEAN DEFAULT TRUE,
    observaciones TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (carrera_id) REFERENCES carreras(id),
    UNIQUE KEY unique_libro_carrera (numero_libro, carrera_id),
    INDEX idx_activo (activo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de Folios de Estudiantes (Registro Oficial)
CREATE TABLE IF NOT EXISTS folios_estudiantes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    estudiante_id INT NOT NULL,
    libro_id INT NOT NULL,
    numero_folio INT NOT NULL,
    gestion_registro INT NOT NULL,
    fecha_registro DATE NOT NULL,
    carga_horaria_total INT DEFAULT 0,
    promedio_general DECIMAL(5,2),
    asignaturas_aprobadas INT DEFAULT 0,
    asignaturas_totales INT DEFAULT 0,
    estado_final ENUM('EN_CURSO', 'EGRESADO', 'ABANDONO', 'RETIRADO') DEFAULT 'EN_CURSO',
    fecha_egreso DATE,
    observaciones TEXT,
    pdf_generado BOOLEAN DEFAULT FALSE,
    ruta_pdf VARCHAR(255),
    hash_validacion VARCHAR(64), -- SHA256 del PDF para validación
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (estudiante_id) REFERENCES estudiantes(id),
    FOREIGN KEY (libro_id) REFERENCES libros_registro(id),
    UNIQUE KEY unique_estudiante_libro (estudiante_id, libro_id),
    INDEX idx_numero_folio (numero_folio),
    INDEX idx_estado (estado_final)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- VISTAS ADICIONALES
-- ============================================

-- Vista de Pasantías Activas
CREATE OR REPLACE VIEW vista_pasantias_activas AS
SELECT 
    pa.id as asignacion_id,
    e.id as estudiante_id,
    e.codigo_estudiante,
    CONCAT(e.nombres, ' ', e.apellido_paterno, ' ', IFNULL(e.apellido_materno, '')) as nombre_estudiante,
    c.nombre as carrera,
    pe.nombre_empresa,
    pa.area_departamento,
    pa.fecha_inicio,
    pa.fecha_finalizacion,
    pa.responsable_empresa,
    u.nombre as docente_supervisor,
    pa.estado
FROM pasantias_asignaciones pa
INNER JOIN estudiantes e ON pa.estudiante_id = e.id
INNER JOIN carreras c ON pa.carrera_id = c.id
INNER JOIN pasantias_empresas pe ON pa.empresa_id = pe.id
LEFT JOIN usuarios u ON pa.docente_supervisor_id = u.id
WHERE pa.estado IN ('PROGRAMADA', 'EN_CURSO')
ORDER BY pa.fecha_inicio DESC;

-- Vista de Licencias Pendientes de Aprobación
CREATE OR REPLACE VIEW vista_licencias_pendientes AS
SELECT 
    ls.id as licencia_id,
    e.codigo_estudiante,
    CONCAT(e.nombres, ' ', e.apellido_paterno, ' ', IFNULL(e.apellido_materno, '')) as nombre_estudiante,
    c.nombre as carrera,
    ls.fecha_solicitud,
    ls.fecha_desde,
    ls.fecha_hasta,
    ls.total_dias,
    ls.motivo,
    ls.detalle_motivo,
    DATEDIFF(CURDATE(), ls.fecha_solicitud) as dias_pendiente
FROM licencias_solicitudes ls
INNER JOIN estudiantes e ON ls.estudiante_id = e.id
INNER JOIN carreras c ON ls.carrera_id = c.id
WHERE ls.estado = 'PENDIENTE'
ORDER BY ls.fecha_solicitud ASC;

-- Vista de Supervisiones del Mes
CREATE OR REPLACE VIEW vista_supervisiones_mes AS
SELECT 
    sp.id as supervision_id,
    u1.nombre as docente,
    m.nombre as materia,
    c.codigo as curso,
    sp.fecha_programada,
    sp.hora_inicio,
    sp.tipo,
    sp.estado,
    u2.nombre as supervisor,
    fs.calificacion_general
FROM supervisiones_programadas sp
INNER JOIN usuarios u1 ON sp.docente_id = u1.id
INNER JOIN materias m ON sp.materia_id = m.id
INNER JOIN cursos c ON sp.curso_id = c.id
INNER JOIN usuarios u2 ON sp.supervisor_id = u2.id
LEFT JOIN fichas_supervision fs ON sp.id = fs.supervision_id
WHERE sp.fecha_programada >= DATE_FORMAT(CURDATE(), '%Y-%m-01')
  AND sp.fecha_programada < DATE_FORMAT(DATE_ADD(CURDATE(), INTERVAL 1 MONTH), '%Y-%m-01')
ORDER BY sp.fecha_programada DESC;

-- Vista de Historial Académico por Libro
CREATE OR REPLACE VIEW vista_historial_por_libro AS
SELECT 
    lb.numero_libro,
    c.nombre as carrera,
    fe.numero_folio,
    e.codigo_estudiante,
    CONCAT(e.nombres, ' ', e.apellido_paterno, ' ', IFNULL(e.apellido_materno, '')) as nombre_estudiante,
    fe.gestion_registro,
    fe.carga_horaria_total,
    fe.promedio_general,
    fe.asignaturas_aprobadas,
    fe.asignaturas_totales,
    fe.estado_final,
    fe.fecha_egreso
FROM folios_estudiantes fe
INNER JOIN libros_registro lb ON fe.libro_id = lb.id
INNER JOIN estudiantes e ON fe.estudiante_id = e.id
INNER JOIN carreras c ON lb.carrera_id = c.id
ORDER BY lb.numero_libro, fe.numero_folio;

-- ============================================
-- TRIGGERS ADICIONALES
-- ============================================

DELIMITER $$

-- Trigger para asignar folio automático
CREATE TRIGGER before_folio_insert
BEFORE INSERT ON folios_estudiantes
FOR EACH ROW
BEGIN
    DECLARE siguiente_folio INT;
    
    -- Obtener el siguiente folio disponible del libro
    SELECT folio_actual + 1 INTO siguiente_folio
    FROM libros_registro
    WHERE id = NEW.libro_id;
    
    -- Asignar el folio
    SET NEW.numero_folio = siguiente_folio;
    
    -- Actualizar el folio actual del libro
    UPDATE libros_registro
    SET folio_actual = siguiente_folio
    WHERE id = NEW.libro_id;
END$$

-- Trigger para calcular total de días de licencia
CREATE TRIGGER before_licencia_insert
BEFORE INSERT ON licencias_solicitudes
FOR EACH ROW
BEGIN
    SET NEW.total_dias = DATEDIFF(NEW.fecha_hasta, NEW.fecha_desde) + 1;
END$$

DELIMITER ;

-- ============================================
-- DATOS INICIALES
-- ============================================

-- Insertar libro de registro inicial para cada carrera
INSERT INTO libros_registro (numero_libro, carrera_id, gestion_inicio, folio_inicio, folio_actual)
SELECT 
    ROW_NUMBER() OVER (ORDER BY c.id) as numero_libro,
    c.id as carrera_id,
    YEAR(CURDATE()) as gestion_inicio,
    1 as folio_inicio,
    1 as folio_actual
FROM carreras c
WHERE NOT EXISTS (SELECT 1 FROM libros_registro WHERE carrera_id = c.id);

-- ============================================
-- ÍNDICES ADICIONALES PARA PERFORMANCE
-- ============================================

-- Índices para búsquedas frecuentes
CREATE INDEX idx_pasantias_fecha ON pasantias_asignaciones(fecha_inicio, fecha_finalizacion);
CREATE INDEX idx_licencias_fechas ON licencias_solicitudes(fecha_desde, fecha_hasta);
CREATE INDEX idx_supervision_docente_fecha ON supervisiones_programadas(docente_id, fecha_programada);

-- ============================================
-- COMENTARIOS EN TABLAS
-- ============================================

ALTER TABLE pasantias_empresas COMMENT = 'Catálogo de empresas para pasantías laborales';
ALTER TABLE pasantias_asignaciones COMMENT = 'Asignaciones de estudiantes a pasantías';
ALTER TABLE pasantias_evaluaciones COMMENT = 'Evaluaciones de desempeño en pasantías';
ALTER TABLE supervisiones_programadas COMMENT = 'Programación de supervisiones docentes';
ALTER TABLE fichas_supervision COMMENT = 'Fichas detalladas de supervisión de clases';
ALTER TABLE licencias_solicitudes COMMENT = 'Solicitudes de licencias estudiantiles';
ALTER TABLE libros_registro COMMENT = 'Libros físicos de registro académico';
ALTER TABLE folios_estudiantes COMMENT = 'Folios oficiales de historial académico';

-- ============================================
-- FIN DEL SCHEMA COMPLEMENTARIO V3
-- ============================================

SELECT 'Schema complementario V3 aplicado exitosamente' as mensaje;
SELECT COUNT(*) as nuevas_tablas 
FROM information_schema.tables 
WHERE table_schema = 'instituto_incos' 
AND table_name IN (
    'pasantias_empresas',
    'pasantias_asignaciones',
    'pasantias_evaluaciones',
    'supervisiones_programadas',
    'fichas_supervision',
    'licencias_solicitudes',
    'licencias_documentos',
    'libros_registro',
    'folios_estudiantes'
);
