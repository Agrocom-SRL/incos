-- ============================================
-- SCHEMA ACTUALIZADO - INSTITUTO INCOS SANTA CRUZ
-- Versión 2.0 - Basado en análisis de datos reales
-- Ajustes basados en archivos Excel actuales del instituto
-- ============================================

USE instituto_incos;

-- ============================================
-- AJUSTES A TABLAS EXISTENTES
-- ============================================

-- Ajustar tabla de estudiantes con campos adicionales
ALTER TABLE estudiantes 
ADD COLUMN expedido_departamento VARCHAR(10) AFTER complemento,
ADD COLUMN correo_institucional VARCHAR(150) UNIQUE AFTER correo_electronico,
ADD COLUMN clave_acceso VARCHAR(100) AFTER correo_institucional,
ADD COLUMN turno_preferencia ENUM('MAÑANA', 'TARDE', 'NOCHE') DEFAULT 'TARDE',
MODIFY COLUMN expedido VARCHAR(20); -- Permitir extensiones como "SC", "LP", "3498977 LP"

-- Ajustar tabla de cursos
ALTER TABLE cursos 
ADD COLUMN turno ENUM('MAÑANA', 'TARDE', 'NOCHE') NOT NULL AFTER paralelo,
ADD COLUMN cupo_minimo INT DEFAULT 15 AFTER cupo_maximo;

-- Ajustar tabla de inscripciones_materias para incluir sistema de nivelación
ALTER TABLE inscripciones_materias 
ADD COLUMN estado_nivelacion ENUM(
    'REGULAR',
    'NIVELACION_1RA',
    'NIVELACION_2DA',
    'VENCIDA',
    'HOMOLOGACION',
    'CHOQUE_HORARIO',
    'PRE_REQUISITO',
    'NO_LLEVA_VOLUNTAD'
) DEFAULT 'REGULAR' AFTER estado,
ADD COLUMN gestion_aprobacion INT AFTER estado_nivelacion,
ADD COLUMN observaciones_nivelacion TEXT AFTER gestion_aprobacion;

-- ============================================
-- NUEVAS TABLAS
-- ============================================
-- NOTA: Estas tablas ya están normalizadas en los scripts actuales:
-- - becas_descuentos, estudiantes_becas → 06-estudiantes-parte2.sql
-- - documentos_estudiante → 06-estudiantes-parte1.sql
-- - historial_nivelaciones → 07-inscripciones-parte2.sql
-- - turnos_horarios → Convertido en "turnos" → 05-estructura-academica-parte2.sql

-- Tabla de Historial de Nivelaciones
CREATE TABLE IF NOT EXISTS historial_nivelaciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    estudiante_id INT NOT NULL,
    materia_id INT NOT NULL,
    inscripcion_materia_id INT, -- Referencia a la inscripción original
    gestion_original INT NOT NULL, -- Gestión en que cursó originalmente
    gestion_nivelacion INT NOT NULL, -- Gestión en que nivelará o niveló
    instancia ENUM('PRIMERA', 'SEGUNDA', 'TERCERA') DEFAULT 'PRIMERA',
    tipo_nivelacion ENUM('REGULAR', 'ARTICULO_18', 'EXTRAORDINARIA') DEFAULT 'REGULAR',
    resultado ENUM('PENDIENTE', 'APROBADO', 'REPROBADO', 'NO_PRESENTADO') DEFAULT 'PENDIENTE',
    nota_nivelacion DECIMAL(5,2),
    motivo TEXT, -- "VENCIDA EN LA GESTION 2024", "CHOQUE DE HORARIO", etc.
    fecha_programada DATE,
    fecha_realizada DATE,
    docente_evaluador INT,
    observaciones TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (estudiante_id) REFERENCES estudiantes(id),
    FOREIGN KEY (materia_id) REFERENCES materias(id),
    FOREIGN KEY (inscripcion_materia_id) REFERENCES inscripciones_materias(id),
    INDEX idx_estudiante_gestion (estudiante_id, gestion_nivelacion),
    INDEX idx_resultado (resultado),
    INDEX idx_programada (fecha_programada)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de Estados Especiales de Estudiantes
-- ⚠️ PENDIENTE DE NORMALIZAR
-- Esta tabla aún NO está normalizada en los scripts actuales
-- Falta agregar: deleted_at, created_by, updated_by, deleted_by
-- Falta: Foreign keys con ON DELETE SET NULL
CREATE TABLE IF NOT EXISTS estados_especiales_estudiante (
    id INT AUTO_INCREMENT PRIMARY KEY,
    estudiante_id INT NOT NULL,
    tipo_estado ENUM(
        'REPITENTE',
        'TRANSITABILIDAD',
        'HOMOLOGACION',
        'REINCORPORACION',
        'COMPROMISO_PAGO',
        'CASO_ESPECIAL',
        'SUSPENSION_TEMPORAL',
        'OTRO'
    ) NOT NULL,
    gestion_id INT NOT NULL,
    descripcion TEXT,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE,
    documento_respaldo VARCHAR(255),
    activo BOOLEAN DEFAULT TRUE,
    resuelto BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (estudiante_id) REFERENCES estudiantes(id),
    FOREIGN KEY (gestion_id) REFERENCES gestiones(id),
    INDEX idx_estudiante_activo (estudiante_id, activo),
    INDEX idx_tipo (tipo_estado)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de Pagos y Aranceles
CREATE TABLE IF NOT EXISTS pagos_aranceles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    estudiante_id INT NOT NULL,
    inscripcion_id INT,
    tipo_pago ENUM(
        'MATRICULA',
        'MENSUALIDAD',
        'EXAMEN',
        'CERTIFICADO',
        'DIPLOMA',
        'NIVELACION',
        'OTRO'
    ) NOT NULL,
    concepto VARCHAR(200) NOT NULL,
    monto_original DECIMAL(10,2) NOT NULL,
    descuento DECIMAL(10,2) DEFAULT 0,
    monto_final DECIMAL(10,2) NOT NULL,
    estado ENUM('PENDIENTE', 'PARCIAL', 'PAGADO', 'ANULADO') DEFAULT 'PENDIENTE',
    metodo_pago ENUM('EFECTIVO', 'TRANSFERENCIA', 'DEPOSITO', 'TARJETA', 'OTRO'),
    numero_comprobante VARCHAR(100),
    fecha_emision DATE NOT NULL,
    fecha_vencimiento DATE,
    fecha_pago DATE,
    observaciones TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (estudiante_id) REFERENCES estudiantes(id),
    FOREIGN KEY (inscripcion_id) REFERENCES inscripciones(id),
    INDEX idx_estudiante (estudiante_id),
    INDEX idx_estado (estado),
    INDEX idx_vencimiento (fecha_vencimiento)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de Detalle de Pagos
CREATE TABLE IF NOT EXISTS detalle_pagos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pago_id INT NOT NULL,
    monto_parcial DECIMAL(10,2) NOT NULL,
    metodo_pago ENUM('EFECTIVO', 'TRANSFERENCIA', 'DEPOSITO', 'TARJETA', 'OTRO') NOT NULL,
    numero_comprobante VARCHAR(100),
    fecha_pago DATE NOT NULL,
    recibido_por INT, -- usuario_id
    observaciones TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (pago_id) REFERENCES pagos_aranceles(id),
    INDEX idx_pago (pago_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- DATOS INICIALES
-- ============================================

-- Insertar Becas
INSERT INTO becas_descuentos (codigo, nombre, tipo, porcentaje_descuento, descripcion, activo) VALUES
('BECA-100', 'BECA 100%', 'BECA_COMPLETA', 100.00, 'Beca completa del instituto', TRUE),
('BECA-50', 'BECA 50%', 'BECA_PARCIAL', 50.00, 'Beca parcial del 50%', TRUE),
('BECA-25', 'BECA 25%', 'BECA_PARCIAL', 25.00, 'Beca parcial del 25%', TRUE),
('BECA-CM', 'BECA CONCEJO MUNICIPAL', 'BECA_COMPLETA', 100.00, 'Beca otorgada por el Concejo Municipal', TRUE),
('BECA-SOC', 'BECA SOCIAL DE 20 CUPOS', 'ESPECIAL', 100.00, 'Beca social con cupo limitado a 20 estudiantes', TRUE)
ON DUPLICATE KEY UPDATE nombre=VALUES(nombre);

-- Actualizar cantidad de cupos para beca social
UPDATE becas_descuentos 
SET cantidad_cupos = 20, cupos_disponibles = 20 
WHERE codigo = 'BECA-SOC';

-- Insertar Turnos
INSERT INTO turnos_horarios (codigo, nombre, hora_inicio, hora_fin, activo) VALUES
('TRN-MAÑ', 'MAÑANA', '08:00:00', '12:00:00', TRUE),
('TRN-TAR', 'TARDE', '14:00:00', '18:30:00', TRUE),
('TRN-NOC', 'NOCHE', '19:00:00', '22:30:00', TRUE)
ON DUPLICATE KEY UPDATE nombre=VALUES(nombre);

-- ============================================
-- INSERTAR MATERIAS REALES POR CARRERA
-- ============================================

-- CONTADURÍA GENERAL - Primer Año
INSERT INTO materias (codigo, nombre, creditos, horas_teoricas, horas_practicas) VALUES
('CON-101', 'CONTABILIDAD I', 6, 4, 2),
('MAF-101', 'MATEMÁTICA FINANCIERA', 4, 3, 1),
('IFC-101', 'INFORMÁTICA CONTABLE', 4, 2, 2),
('ADM-101', 'ADMINISTRACIÓN GENERAL', 4, 3, 1),
('LLS-101', 'LEGISLACIÓN LABORAL Y SEGURIDAD SOCIAL APLICADA', 4, 3, 1),
('EGA-101', 'ECONOMÍA GENERAL APLICADA', 4, 3, 1),
('DCM-101', 'DOCUMENTOS COMERCIALES Y MERCANTILES', 4, 2, 2),
('ESA-101', 'ESTADÍSTICA APLICADA', 4, 3, 1),
('INT-101', 'INGLÉS TÉCNICO', 4, 2, 2)
ON DUPLICATE KEY UPDATE nombre=VALUES(nombre);

-- CONTADURÍA GENERAL - Segundo Año
INSERT INTO materias (codigo, nombre, creditos, horas_teoricas, horas_practicas) VALUES
('CON-201', 'CONTABILIDAD II', 6, 4, 2),
('COC-201', 'CONTABILIDAD DE COSTOS I', 6, 4, 2),
('COS-201', 'CONTABILIDAD DE SOCIEDADES', 6, 4, 2),
('CSE-201', 'CONTABILIDAD DE SEGUROS', 4, 3, 1),
('CBC-201', 'CONTABILIDAD BANCARIA Y COOPERATIVAS', 6, 4, 2),
('EMP-201', 'EMPRENDIMIENTO PRODUCTIVO', 4, 2, 2),
('SIT-201', 'SISTEMA TRIBUTARIO', 6, 4, 2)
ON DUPLICATE KEY UPDATE nombre=VALUES(nombre);

-- CONTADURÍA GENERAL - Tercer Año
INSERT INTO materias (codigo, nombre, creditos, horas_teoricas, horas_practicas) VALUES
('CAG-301', 'CONTABILIDAD AGROPECUARIA', 6, 4, 2),
('COC-302', 'CONTABILIDAD DE COSTOS II', 6, 4, 2),
('CGU-301', 'CONTABILIDAD GUBERNAMENTAL', 6, 4, 2),
('CEX-301', 'CONTABILIDAD EXTRACTIVA (MINERA, PETROLERA Y FORESTAL)', 6, 4, 2),
('CSR-301', 'CONTABILIDAD DE SERVICIOS (CONSTRUCCIÓN, HOTELERÍA Y TRANSPORTE)', 6, 4, 2),
('GCI-301', 'GABINETE CONTABLE INFORMÁTICO', 6, 2, 4),
('AIE-301', 'ANÁLISIS E INTERPRETACIONES DE ESTADOS FINANCIEROS', 6, 4, 2),
('TMG-301', 'TALLER DE MODALIDAD DE GRADUACIÓN', 4, 2, 2)
ON DUPLICATE KEY UPDATE nombre=VALUES(nombre);

-- ADMINISTRACIÓN DE EMPRESAS - Primer Año
INSERT INTO materias (codigo, nombre, creditos, horas_teoricas, horas_practicas) VALUES
('FUA-101', 'FUNDAMENTOS DE ADMINISTRACIÓN', 6, 4, 2),
('CGA-101', 'CONTABILIDAD GENERAL PARA ADMINISTRADORES', 6, 4, 2),
('MAF-103', 'MATEMÁTICA FINANCIERA', 4, 3, 1),
('ESN-104', 'ESTADÍSTICA PARA LOS NEGOCIOS', 4, 3, 1),
('PLT-105', 'PRÁCTICA LABORAL Y TRIBUTARIA', 4, 2, 2),
('IFE-106', 'INFORMÁTICA EMPRESARIAL', 4, 2, 2),
('INT-107', 'INGLÉS TÉCNICO', 4, 2, 2)
ON DUPLICATE KEY UPDATE nombre=VALUES(nombre);

-- ADMINISTRACIÓN DE EMPRESAS - Segundo Año
INSERT INTO materias (codigo, nombre, creditos, horas_teoricas, horas_practicas) VALUES
('OAD-201', 'ORGANIZACIÓN DE LA ADMINISTRACIÓN', 6, 4, 2),
('IEM-201', 'INVESTIGACION Y ESTRATEGIAS DE MERCADOTECNIA', 6, 4, 2),
('ADO-201', 'ADMINISTRACIÓN DE OPERACIONES', 6, 4, 2),
('GTH-201', 'GESTIÓN DEL TALENTO HUMANO', 6, 4, 2),
('AFI-201', 'ADMINISTRACIÓN FINANCIERA I', 6, 4, 2),
('PEP-201', 'PREPARACION Y EVALUACION DE PROYECTOS', 6, 4, 2),
('ACP-201', 'ADMINISTRACIÓN DE COSTOS Y PRESUPUESTO', 6, 4, 2),
('ECE-201', 'ECONOMÍA DE LA EMPRESA', 4, 3, 1)
ON DUPLICATE KEY UPDATE nombre=VALUES(nombre);

-- ADMINISTRACIÓN DE EMPRESAS - Tercer Año
INSERT INTO materias (codigo, nombre, creditos, horas_teoricas, horas_practicas) VALUES
('MPM-301', 'ADMINISTRACIÓN DE LA MICRO, PEQUEÑA Y MEDIANA EMPRESA', 6, 4, 2),
('IMN-301', 'INCUBACIÓN Y MODELOS DE NEGOCIOS', 6, 4, 2),
('AFI-302', 'ADMINISTRACIÓN FINANCIERA II', 6, 4, 2),
('TMG-302', 'TALLER DE MODALIDAD DE GRADUACIÓN', 4, 2, 2),
('EMP-302', 'EMPRENDIMIENTO PRODUCTIVO', 4, 2, 2),
('CIN-301', 'COMERCIO INTERNACIONAL', 6, 4, 2),
('GES-301', 'GESTIÓN ESTRATÉGICA', 6, 4, 2)
ON DUPLICATE KEY UPDATE nombre=VALUES(nombre);

-- SISTEMAS INFORMÁTICOS - Primer Año
INSERT INTO materias (codigo, nombre, creditos, horas_teoricas, horas_practicas) VALUES
('MPI-101', 'MATEMATICA PARA LA INFORMATICA', 6, 4, 2),
('PRG-102', 'PROGRAMACIÓN I', 8, 4, 4),
('INT-103', 'INGLÉS TÉCNICO', 4, 2, 2),
('HDC-104', 'HARDWARE DE COMPUTADORAS', 6, 3, 3),
('TSO-105', 'TALLER DE SISTEMAS OPERATIVOS', 6, 3, 3),
('OTM-106', 'OFIMATICA Y TECNOLOGIA MULTIMEDIA', 6, 3, 3),
('DPW-107', 'DISEÑO Y PROGRAMACIÓN WEB I', 6, 3, 3)
ON DUPLICATE KEY UPDATE nombre=VALUES(nombre);

-- SISTEMAS INFORMÁTICOS - Segundo Año
INSERT INTO materias (codigo, nombre, creditos, horas_teoricas, horas_practicas) VALUES
('EST-201', 'ESTADÍSTICA', 4, 3, 1),
('PRG-202', 'PROGRAMACIÓN II', 8, 4, 4),
('EDD-203', 'ESTRUCTURA DE DATOS', 6, 3, 3),
('RCD-204', 'REDES DE COMPUTADORAS I', 6, 3, 3),
('PDM-205', 'PROGRAMACIÓN PARA DISPOSITIVOS MÓVILES I', 6, 3, 3),
('ADS-206', 'ANÁLISIS Y DISEÑO DE SISTEMAS I', 6, 3, 3),
('DPW-207', 'DISEÑO Y PROGRAMACIÓN WEB II', 6, 3, 3),
('BDD-208', 'BASE DE DATOS I', 6, 3, 3)
ON DUPLICATE KEY UPDATE nombre=VALUES(nombre);

-- SISTEMAS INFORMÁTICOS - Tercer Año
INSERT INTO materias (codigo, nombre, creditos, horas_teoricas, horas_practicas) VALUES
('EMP-301-SI', 'EMPRENDIMIENTO PRODUCTIVO', 4, 2, 2),
('PRG-303', 'PROGRAMACIÓN III', 8, 4, 4),
('GSO-301', 'GESTIÓN Y MEJORAMIENTO DE LA CALIDAD DE SOFTWARE', 6, 3, 3),
('RCD-304', 'REDES DE COMPUTADORAS II', 6, 3, 3),
('TMG-303', 'TALLER DE MODALIDAD DE GRADUACIÓN', 4, 2, 2),
('ADS-306', 'ANÁLISIS Y DISEÑO DE SISTEMAS II', 6, 3, 3),
('DPW-307', 'DISEÑO Y PROGRAMACIÓN WEB III', 6, 3, 3),
('PDM-305', 'PROGRAMACIÓN PARA DISPOSITIVOS MÓVILES II', 6, 3, 3),
('BDD-308', 'BASE DE DATOS II', 6, 3, 3)
ON DUPLICATE KEY UPDATE nombre=VALUES(nombre);

-- ============================================
-- ASIGNACION DE MATERIAS A CARRERAS (PLAN DE ESTUDIOS)
-- ============================================

-- Contaduría General - Primer Año
INSERT INTO plan_estudios (carrera_id, materia_id, semestre, es_obligatoria)
SELECT c.id, m.id, 1, TRUE
FROM carreras c
CROSS JOIN materias m
WHERE c.codigo = 'ADM-EMP-TS' AND c.nombre LIKE '%CONTADURIA%'
AND m.codigo IN ('CON-101', 'MAF-101', 'IFC-101', 'ADM-101', 'LLS-101', 'EGA-101', 'DCM-101', 'ESA-101', 'INT-101')
ON DUPLICATE KEY UPDATE semestre=VALUES(semestre);

-- (Continuar con las demás materias y carreras...)

-- ============================================
-- VISTAS ACTUALIZADAS
-- ============================================

-- Vista de estudiantes con becas activas
CREATE OR REPLACE VIEW vista_estudiantes_becas AS
SELECT 
    e.id as estudiante_id,
    e.codigo_estudiante,
    CONCAT(e.nombres, ' ', e.apellido_paterno, ' ', IFNULL(e.apellido_materno, '')) as nombre_completo,
    e.cedula_identidad,
    bd.nombre as beca,
    bd.porcentaje_descuento,
    eb.estado as estado_beca,
    eb.fecha_vigencia_desde,
    eb.fecha_vigencia_hasta,
    g.nombre as gestion
FROM estudiantes e
INNER JOIN estudiantes_becas eb ON e.id = eb.estudiante_id
INNER JOIN becas_descuentos bd ON eb.beca_id = bd.id
INNER JOIN gestiones g ON eb.gestion_id = g.id
WHERE eb.estado = 'ACTIVA';

-- Vista de documentos pendientes por estudiante
CREATE OR REPLACE VIEW vista_documentos_pendientes AS
SELECT 
    e.id as estudiante_id,
    e.codigo_estudiante,
    CONCAT(e.nombres, ' ', e.apellido_paterno, ' ', IFNULL(e.apellido_materno, '')) as nombre_completo,
    de.tipo_documento,
    de.estado,
    de.observaciones,
    DATEDIFF(CURDATE(), e.created_at) as dias_desde_registro
FROM estudiantes e
INNER JOIN documentos_estudiante de ON e.id = de.estudiante_id
WHERE de.estado IN ('PENDIENTE', 'FALTA', 'RECHAZADO')
AND de.es_obligatorio = TRUE
ORDER BY dias_desde_registro DESC;

-- Vista de estudiantes en nivelación
CREATE OR REPLACE VIEW vista_nivelaciones_activas AS
SELECT 
    e.id as estudiante_id,
    e.codigo_estudiante,
    CONCAT(e.nombres, ' ', e.apellido_paterno, ' ', IFNULL(e.apellido_materno, '')) as nombre_completo,
    m.codigo as codigo_materia,
    m.nombre as materia,
    hn.gestion_original,
    hn.gestion_nivelacion,
    hn.instancia,
    hn.resultado,
    hn.fecha_programada,
    hn.motivo
FROM estudiantes e
INNER JOIN historial_nivelaciones hn ON e.id = hn.estudiante_id
INNER JOIN materias m ON hn.materia_id = m.id
WHERE hn.resultado = 'PENDIENTE'
ORDER BY hn.fecha_programada;

-- ============================================
-- TRIGGERS ADICIONALES
-- ============================================

DELIMITER $$

-- Trigger para actualizar cupos de becas
CREATE TRIGGER after_estudiante_beca_insert
AFTER INSERT ON estudiantes_becas
FOR EACH ROW
BEGIN
    IF NEW.estado = 'ACTIVA' THEN
        UPDATE becas_descuentos 
        SET cupos_usados = cupos_usados + 1,
            cupos_disponibles = GREATEST(0, cupos_disponibles - 1)
        WHERE id = NEW.beca_id AND cantidad_cupos IS NOT NULL;
    END IF;
END$$

CREATE TRIGGER after_estudiante_beca_update
AFTER UPDATE ON estudiantes_becas
FOR EACH ROW
BEGIN
    IF OLD.estado = 'ACTIVA' AND NEW.estado != 'ACTIVA' THEN
        -- Liberar cupo
        UPDATE becas_descuentos 
        SET cupos_usados = GREATEST(0, cupos_usados - 1),
            cupos_disponibles = cupos_disponibles + 1
        WHERE id = NEW.beca_id AND cantidad_cupos IS NOT NULL;
    ELSEIF OLD.estado != 'ACTIVA' AND NEW.estado = 'ACTIVA' THEN
        -- Ocupar cupo
        UPDATE becas_descuentos 
        SET cupos_usados = cupos_usados + 1,
            cupos_disponibles = GREATEST(0, cupos_disponibles - 1)
        WHERE id = NEW.beca_id AND cantidad_cupos IS NOT NULL;
    END IF;
END$$

-- Trigger para generar credenciales institucionales
CREATE TRIGGER before_estudiante_insert_credentials
BEFORE INSERT ON estudiantes
FOR EACH ROW
BEGIN
    DECLARE anio_actual INT;
    DECLARE nombre_limpio VARCHAR(100);
    DECLARE correo_base VARCHAR(100);
    
    SET anio_actual = YEAR(CURDATE());
    SET nombre_limpio = LOWER(REPLACE(REPLACE(NEW.nombres, ' ', ''), '.', ''));
    
    -- Generar correo institucional si no existe
    IF NEW.correo_institucional IS NULL OR NEW.correo_institucional = '' THEN
        SET correo_base = CONCAT(SUBSTRING(nombre_limpio, 1, 15), anio_actual);
        SET NEW.correo_institucional = CONCAT(correo_base, '@incos-santacruz.edu.bo');
    END IF;
    
    -- Generar clave de acceso si no existe
    IF NEW.clave_acceso IS NULL OR NEW.clave_acceso = '' THEN
        SET NEW.clave_acceso = CONCAT(SUBSTRING(nombre_limpio, 1, 10), 'incos', anio_actual);
    END IF;
END$$

DELIMITER ;

-- ============================================
-- FIN DE AJUSTES
-- ============================================

-- Mensaje de confirmación
SELECT 'Schema actualizado exitosamente con datos reales del instituto' as mensaje;
SELECT COUNT(*) as total_materias FROM materias;
SELECT COUNT(*) as total_becas FROM becas_descuentos;
