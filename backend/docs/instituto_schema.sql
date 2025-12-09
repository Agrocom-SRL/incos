-- ============================================
-- SCHEMA BASE DE DATOS INSTITUTO INCOS SANTA CRUZ
-- Sistema de Matriculación de Estudiantes
-- ============================================

-- Crear base de datos
CREATE DATABASE IF NOT EXISTS instituto_incos CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE instituto_incos;

-- ============================================
-- TABLAS DE CATÁLOGOS Y REFERENCIAS
-- ============================================

-- Tabla de Países
CREATE TABLE paises (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    codigo_iso CHAR(2) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de Departamentos
CREATE TABLE departamentos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pais_id INT NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    codigo VARCHAR(10),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (pais_id) REFERENCES paises(id),
    UNIQUE KEY unique_depto_pais (nombre, pais_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de Provincias
CREATE TABLE provincias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    departamento_id INT NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    codigo VARCHAR(10),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (departamento_id) REFERENCES departamentos(id),
    UNIQUE KEY unique_prov_depto (nombre, departamento_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de Municipios
CREATE TABLE municipios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    provincia_id INT NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    codigo VARCHAR(10),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (provincia_id) REFERENCES provincias(id),
    UNIQUE KEY unique_muni_prov (nombre, provincia_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de Comunidades
CREATE TABLE comunidades (
    id INT AUTO_INCREMENT PRIMARY KEY,
    municipio_id INT NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (municipio_id) REFERENCES municipios(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de Localidades
CREATE TABLE localidades (
    id INT AUTO_INCREMENT PRIMARY KEY,
    comunidad_id INT NOT NULL,
    nombre VARCHAR(150) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (comunidad_id) REFERENCES comunidades(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de Tipos de Sangre
CREATE TABLE tipos_sangre (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tipo VARCHAR(10) NOT NULL UNIQUE,
    descripcion VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de Idiomas
CREATE TABLE idiomas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    codigo_iso CHAR(3),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de Estados Civiles
CREATE TABLE estados_civiles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(20) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de Tipos de Discapacidad
CREATE TABLE tipos_discapacidad (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLAS DE ESTRUCTURA ACADÉMICA
-- ============================================

-- Tabla de Carreras/Programas
CREATE TABLE carreras (
    id INT AUTO_INCREMENT PRIMARY KEY,
    codigo VARCHAR(20) NOT NULL UNIQUE,
    nombre VARCHAR(200) NOT NULL,
    nivel VARCHAR(50) NOT NULL, -- 'TECNICO SUPERIOR', 'TECNICO MEDIO', etc.
    duracion_semestres INT NOT NULL,
    plan_estudio_codigo VARCHAR(50), -- Ej: '0637/2019'
    plan_estudio_anio INT,
    resolucion_aprobacion VARCHAR(100), -- Resolución del plan de estudio
    estado ENUM('ACTIVO', 'INACTIVO', 'SUSPENDIDO') DEFAULT 'ACTIVO',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de Gestiones Académicas
CREATE TABLE gestiones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    anio INT NOT NULL,
    nombre VARCHAR(50) NOT NULL, -- Ej: '2025', 'Gestión 2025'
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    estado ENUM('PLANIFICADA', 'EN_CURSO', 'FINALIZADA') DEFAULT 'PLANIFICADA',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_anio (anio)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de Períodos (Semestres/Trimestres)
CREATE TABLE periodos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    gestion_id INT NOT NULL,
    nombre VARCHAR(50) NOT NULL, -- 'Primer Semestre', 'Segundo Semestre', etc.
    numero INT NOT NULL, -- 1, 2
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    fecha_inicio_inscripciones DATE,
    fecha_fin_inscripciones DATE,
    estado ENUM('PLANIFICADO', 'INSCRIPCIONES', 'EN_CURSO', 'FINALIZADO') DEFAULT 'PLANIFICADO',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (gestion_id) REFERENCES gestiones(id),
    UNIQUE KEY unique_periodo_gestion (gestion_id, numero)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de Materias
CREATE TABLE materias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    codigo VARCHAR(20) NOT NULL UNIQUE,
    nombre VARCHAR(200) NOT NULL,
    creditos INT NOT NULL DEFAULT 0,
    horas_teoricas INT DEFAULT 0,
    horas_practicas INT DEFAULT 0,
    descripcion TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de Plan de Estudios - Materias por Carrera y Semestre
CREATE TABLE plan_estudios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    carrera_id INT NOT NULL,
    materia_id INT NOT NULL,
    semestre INT NOT NULL,
    es_obligatoria BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (carrera_id) REFERENCES carreras(id),
    FOREIGN KEY (materia_id) REFERENCES materias(id),
    UNIQUE KEY unique_carrera_materia (carrera_id, materia_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de Prerrequisitos
CREATE TABLE prerrequisitos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    materia_id INT NOT NULL,
    materia_prerequisito_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (materia_id) REFERENCES materias(id),
    FOREIGN KEY (materia_prerequisito_id) REFERENCES materias(id),
    UNIQUE KEY unique_prerequisito (materia_id, materia_prerequisito_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLAS DE ESTUDIANTES Y PERSONAS
-- ============================================

-- Tabla Principal de Estudiantes
CREATE TABLE estudiantes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    
    -- Identificación
    cedula_identidad VARCHAR(20) NOT NULL,
    complemento VARCHAR(5), -- Complemento CI (1A, 2B, etc.)
    tipo_documento ENUM('NACIONAL', 'EXTRANJERO') DEFAULT 'NACIONAL',
    expedido VARCHAR(10), -- Lugar de expedición (LP, SC, CB, etc.)
    libreta_militar VARCHAR(50),
    
    -- Datos Personales
    nombres VARCHAR(100) NOT NULL,
    apellido_paterno VARCHAR(100) NOT NULL,
    apellido_materno VARCHAR(100),
    sexo ENUM('MASCULINO', 'FEMENINO') NOT NULL,
    fecha_nacimiento DATE NOT NULL,
    
    -- Lugar de Nacimiento
    pais_nacimiento_id INT NOT NULL,
    departamento_nacimiento_id INT,
    provincia_nacimiento_id INT,
    municipio_nacimiento_id INT,
    comunidad_nacimiento_id INT,
    localidad_nacimiento_id INT,
    
    -- Información Adicional
    idioma_natal_id INT,
    estado_civil_id INT,
    tipo_sangre_id INT,
    
    -- Discapacidad
    tiene_discapacidad BOOLEAN DEFAULT FALSE,
    tipo_discapacidad_id INT,
    grado_discapacidad VARCHAR(50),
    carnet_discapacidad VARCHAR(50),
    
    -- Nacionalidad
    tiene_doble_nacionalidad BOOLEAN DEFAULT FALSE,
    pais_segunda_nacionalidad_id INT,
    
    -- Contacto
    correo_electronico VARCHAR(150) UNIQUE,
    telefono_celular VARCHAR(20),
    telefono_fijo VARCHAR(20),
    
    -- Dirección Actual
    direccion_actual TEXT,
    zona_barrio VARCHAR(100),
    ciudad_residencia VARCHAR(100),
    
    -- Datos del Sistema
    codigo_estudiante VARCHAR(20) UNIQUE, -- Código único del estudiante en el instituto
    foto_url VARCHAR(255), -- URL de la foto del estudiante
    estado ENUM('ACTIVO', 'INACTIVO', 'EGRESADO', 'RETIRADO', 'SUSPENDIDO') DEFAULT 'ACTIVO',
    
    -- Integración con Sistema Nacional
    codigo_rude VARCHAR(50), -- Código RUDE si aplica
    sincronizado_sistema_nacional BOOLEAN DEFAULT FALSE,
    ultima_sincronizacion TIMESTAMP NULL,
    
    -- Auditoría
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by INT,
    updated_by INT,
    
    -- Índices y Restricciones
    FOREIGN KEY (pais_nacimiento_id) REFERENCES paises(id),
    FOREIGN KEY (departamento_nacimiento_id) REFERENCES departamentos(id),
    FOREIGN KEY (provincia_nacimiento_id) REFERENCES provincias(id),
    FOREIGN KEY (municipio_nacimiento_id) REFERENCES municipios(id),
    FOREIGN KEY (comunidad_nacimiento_id) REFERENCES comunidades(id),
    FOREIGN KEY (localidad_nacimiento_id) REFERENCES localidades(id),
    FOREIGN KEY (idioma_natal_id) REFERENCES idiomas(id),
    FOREIGN KEY (estado_civil_id) REFERENCES estados_civiles(id),
    FOREIGN KEY (tipo_sangre_id) REFERENCES tipos_sangre(id),
    FOREIGN KEY (tipo_discapacidad_id) REFERENCES tipos_discapacidad(id),
    FOREIGN KEY (pais_segunda_nacionalidad_id) REFERENCES paises(id),
    
    INDEX idx_cedula (cedula_identidad),
    INDEX idx_nombres (nombres, apellido_paterno),
    INDEX idx_correo (correo_electronico),
    INDEX idx_estado (estado)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLAS DE INSCRIPCIONES Y MATRICULACIÓN
-- ============================================

-- Tabla de Inscripciones (Matrícula por Gestión)
CREATE TABLE inscripciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    estudiante_id INT NOT NULL,
    carrera_id INT NOT NULL,
    gestion_id INT NOT NULL,
    periodo_id INT NOT NULL,
    
    -- Datos de la Inscripción
    fecha_inscripcion DATE NOT NULL,
    numero_inscripcion VARCHAR(50) UNIQUE, -- 81981609 como en la imagen
    tipo_inscripcion ENUM('NUEVA', 'RENOVACION', 'REINCORPORACION') DEFAULT 'NUEVA',
    semestre_cursando INT NOT NULL, -- Qué semestre está cursando
    
    -- Estado
    estado ENUM('REGISTRADA', 'APROBADA', 'RECHAZADA', 'ANULADA') DEFAULT 'REGISTRADA',
    estado_academico ENUM('REGULAR', 'IRREGULAR', 'CONGELADO', 'RETIRADO') DEFAULT 'REGULAR',
    
    -- Pagos
    monto_matricula DECIMAL(10,2),
    pagado BOOLEAN DEFAULT FALSE,
    fecha_pago DATE,
    numero_recibo VARCHAR(50),
    
    -- Observaciones
    observaciones TEXT,
    
    -- Integración Sistema Nacional
    sincronizado BOOLEAN DEFAULT FALSE,
    fecha_sincronizacion TIMESTAMP NULL,
    
    -- Auditoría
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by INT,
    updated_by INT,
    
    FOREIGN KEY (estudiante_id) REFERENCES estudiantes(id),
    FOREIGN KEY (carrera_id) REFERENCES carreras(id),
    FOREIGN KEY (gestion_id) REFERENCES gestiones(id),
    FOREIGN KEY (periodo_id) REFERENCES periodos(id),
    
    UNIQUE KEY unique_inscripcion (estudiante_id, carrera_id, gestion_id, periodo_id),
    INDEX idx_estudiante (estudiante_id),
    INDEX idx_gestion (gestion_id),
    INDEX idx_estado (estado)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de Cursos (Instancias de materias en un período específico)
CREATE TABLE cursos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    materia_id INT NOT NULL,
    periodo_id INT NOT NULL,
    paralelo VARCHAR(5) NOT NULL, -- A, B, C, etc.
    cupo_maximo INT DEFAULT 30,
    horario TEXT, -- JSON o texto con el horario
    aula VARCHAR(50),
    docente_id INT, -- Referencia a tabla de docentes (a crear)
    estado ENUM('PLANIFICADO', 'EN_CURSO', 'FINALIZADO', 'CANCELADO') DEFAULT 'PLANIFICADO',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (materia_id) REFERENCES materias(id),
    FOREIGN KEY (periodo_id) REFERENCES periodos(id),
    UNIQUE KEY unique_curso (materia_id, periodo_id, paralelo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de Inscripciones a Materias
CREATE TABLE inscripciones_materias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    inscripcion_id INT NOT NULL,
    curso_id INT NOT NULL,
    fecha_inscripcion DATE NOT NULL,
    estado ENUM('INSCRITO', 'APROBADO', 'REPROBADO', 'RETIRADO', 'ABANDONO') DEFAULT 'INSCRITO',
    nota_final DECIMAL(5,2),
    asistencia_porcentaje DECIMAL(5,2),
    observaciones TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (inscripcion_id) REFERENCES inscripciones(id),
    FOREIGN KEY (curso_id) REFERENCES cursos(id),
    UNIQUE KEY unique_inscripcion_materia (inscripcion_id, curso_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLAS DE USUARIOS Y SEGURIDAD
-- ============================================

-- Tabla de Roles
CREATE TABLE roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    descripcion TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de Usuarios del Sistema
CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(150) UNIQUE,
    rol_id INT NOT NULL,
    
    -- Relación con Persona (puede ser estudiante, docente, administrativo)
    estudiante_id INT NULL,
    
    estado ENUM('ACTIVO', 'INACTIVO', 'BLOQUEADO') DEFAULT 'ACTIVO',
    ultimo_acceso TIMESTAMP NULL,
    intentos_fallidos INT DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (rol_id) REFERENCES roles(id),
    FOREIGN KEY (estudiante_id) REFERENCES estudiantes(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de Permisos
CREATE TABLE permisos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    modulo VARCHAR(50) NOT NULL,
    descripcion TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de Roles-Permisos
CREATE TABLE roles_permisos (
    rol_id INT NOT NULL,
    permiso_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (rol_id, permiso_id),
    FOREIGN KEY (rol_id) REFERENCES roles(id),
    FOREIGN KEY (permiso_id) REFERENCES permisos(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLAS DE AUDITORÍA Y LOGS
-- ============================================

-- Tabla de Logs de Auditoría
CREATE TABLE auditoria (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    tabla VARCHAR(50) NOT NULL,
    registro_id INT NOT NULL,
    accion ENUM('INSERT', 'UPDATE', 'DELETE') NOT NULL,
    usuario_id INT,
    datos_anteriores JSON,
    datos_nuevos JSON,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    INDEX idx_tabla_registro (tabla, registro_id),
    INDEX idx_fecha (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de Sincronización con Sistema Nacional
CREATE TABLE sincronizacion_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    entidad VARCHAR(50) NOT NULL, -- 'estudiante', 'inscripcion', etc.
    registro_id INT NOT NULL,
    tipo_operacion ENUM('CREATE', 'UPDATE', 'DELETE') NOT NULL,
    estado ENUM('PENDIENTE', 'EXITOSO', 'ERROR') DEFAULT 'PENDIENTE',
    mensaje_respuesta TEXT,
    intentos INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_estado (estado),
    INDEX idx_entidad (entidad, registro_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- DATOS INICIALES
-- ============================================

-- Insertar Bolivia
INSERT INTO paises (nombre, codigo_iso) VALUES ('Bolivia', 'BO');

-- Insertar Departamentos de Bolivia
INSERT INTO departamentos (pais_id, nombre, codigo) VALUES
(1, 'La Paz', 'LP'),
(1, 'Cochabamba', 'CB'),
(1, 'Santa Cruz', 'SC'),
(1, 'Oruro', 'OR'),
(1, 'Potosí', 'PT'),
(1, 'Chuquisaca', 'CH'),
(1, 'Tarija', 'TJ'),
(1, 'Beni', 'BN'),
(1, 'Pando', 'PD');

-- Insertar Estados Civiles
INSERT INTO estados_civiles (nombre) VALUES
('SOLTERO/A'),
('CASADO/A'),
('DIVORCIADO/A'),
('VIUDO/A'),
('CONCUBINO/A');

-- Insertar Tipos de Sangre
INSERT INTO tipos_sangre (tipo, descripcion) VALUES
('A+', 'A Positivo'),
('A-', 'A Negativo'),
('B+', 'B Positivo'),
('B-', 'B Negativo'),
('AB+', 'AB Positivo'),
('AB-', 'AB Negativo'),
('O+', 'O Positivo'),
('O-', 'O Negativo'),
('NINGUNO', 'Desconocido');

-- Insertar Idiomas
INSERT INTO idiomas (nombre, codigo_iso) VALUES
('CASTELLANO', 'SPA'),
('QUECHUA', 'QUE'),
('AYMARA', 'AYM'),
('GUARANÍ', 'GRN'),
('INGLÉS', 'ENG');

-- Insertar Roles del Sistema
INSERT INTO roles (nombre, descripcion) VALUES
('ADMINISTRADOR', 'Administrador del sistema con acceso total'),
('SECRETARIA', 'Personal de secretaría académica'),
('DOCENTE', 'Docente del instituto'),
('ESTUDIANTE', 'Estudiante registrado'),
('DIRECTOR', 'Director académico');

-- Insertar la carrera de ejemplo
INSERT INTO carreras (codigo, nombre, nivel, duracion_semestres, plan_estudio_codigo, plan_estudio_anio) VALUES
('ADM-EMP-TS', 'ADMINISTRACIÓN DE EMPRESAS', 'TECNICO SUPERIOR', 6, '0637/2019', 2019);

-- Crear gestión actual
INSERT INTO gestiones (anio, nombre, fecha_inicio, fecha_fin, estado) VALUES
(2025, 'Gestión 2025', '2025-01-01', '2025-12-31', 'EN_CURSO');

-- ============================================
-- VISTAS ÚTILES
-- ============================================

-- Vista de estudiantes con datos completos
CREATE VIEW vista_estudiantes_completa AS
SELECT 
    e.id,
    e.codigo_estudiante,
    e.cedula_identidad,
    e.complemento,
    CONCAT(e.nombres, ' ', e.apellido_paterno, ' ', IFNULL(e.apellido_materno, '')) as nombre_completo,
    e.sexo,
    e.fecha_nacimiento,
    TIMESTAMPDIFF(YEAR, e.fecha_nacimiento, CURDATE()) as edad,
    e.correo_electronico,
    e.telefono_celular,
    p.nombre as pais_nacimiento,
    d.nombre as departamento_nacimiento,
    i.nombre as idioma_natal,
    ec.nombre as estado_civil,
    ts.tipo as tipo_sangre,
    e.estado,
    e.created_at as fecha_registro
FROM estudiantes e
LEFT JOIN paises p ON e.pais_nacimiento_id = p.id
LEFT JOIN departamentos d ON e.departamento_nacimiento_id = d.id
LEFT JOIN idiomas i ON e.idioma_natal_id = i.id
LEFT JOIN estados_civiles ec ON e.estado_civil_id = ec.id
LEFT JOIN tipos_sangre ts ON e.tipo_sangre_id = ts.id;

-- Vista de inscripciones activas
CREATE VIEW vista_inscripciones_activas AS
SELECT 
    i.id,
    i.numero_inscripcion,
    e.codigo_estudiante,
    CONCAT(e.nombres, ' ', e.apellido_paterno, ' ', IFNULL(e.apellido_materno, '')) as estudiante,
    c.nombre as carrera,
    c.nivel,
    g.nombre as gestion,
    p.nombre as periodo,
    i.semestre_cursando,
    i.tipo_inscripcion,
    i.estado,
    i.estado_academico,
    i.fecha_inscripcion
FROM inscripciones i
INNER JOIN estudiantes e ON i.estudiante_id = e.id
INNER JOIN carreras c ON i.carrera_id = c.id
INNER JOIN gestiones g ON i.gestion_id = g.id
INNER JOIN periodos p ON i.periodo_id = p.id
WHERE i.estado = 'APROBADA';

-- ============================================
-- ÍNDICES ADICIONALES PARA RENDIMIENTO
-- ============================================

CREATE INDEX idx_estudiante_estado ON estudiantes(estado, created_at);
CREATE INDEX idx_inscripcion_fecha ON inscripciones(fecha_inscripcion);
CREATE INDEX idx_periodo_gestion ON periodos(gestion_id, estado);

-- ============================================
-- TRIGGERS PARA AUDITORÍA
-- ============================================

DELIMITER $$

CREATE TRIGGER auditoria_estudiantes_update
AFTER UPDATE ON estudiantes
FOR EACH ROW
BEGIN
    INSERT INTO auditoria (tabla, registro_id, accion, datos_anteriores, datos_nuevos)
    VALUES (
        'estudiantes',
        NEW.id,
        'UPDATE',
        JSON_OBJECT(
            'nombres', OLD.nombres,
            'apellido_paterno', OLD.apellido_paterno,
            'correo_electronico', OLD.correo_electronico,
            'estado', OLD.estado
        ),
        JSON_OBJECT(
            'nombres', NEW.nombres,
            'apellido_paterno', NEW.apellido_paterno,
            'correo_electronico', NEW.correo_electronico,
            'estado', NEW.estado
        )
    );
END$$

CREATE TRIGGER auditoria_inscripciones_insert
AFTER INSERT ON inscripciones
FOR EACH ROW
BEGIN
    INSERT INTO auditoria (tabla, registro_id, accion, datos_nuevos)
    VALUES (
        'inscripciones',
        NEW.id,
        'INSERT',
        JSON_OBJECT(
            'estudiante_id', NEW.estudiante_id,
            'carrera_id', NEW.carrera_id,
            'gestion_id', NEW.gestion_id,
            'numero_inscripcion', NEW.numero_inscripcion
        )
    );
END$$

DELIMITER ;

-- ============================================
-- FIN DEL SCHEMA
-- ============================================
