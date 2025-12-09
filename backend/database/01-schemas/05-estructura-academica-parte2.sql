-- ============================================
-- ESTRUCTURA ACADÉMICA - PARTE 2
-- Sistema de Gestión Académica - Instituto INCOS
-- 5 Tablas: prerrequisitos, cursos, docentes, asignaciones_docentes, turnos_cursos
-- ============================================

USE instituto_incos;

SET FOREIGN_KEY_CHECKS = 0;

-- ============================================
-- TABLA: prerrequisitos
-- ============================================

DROP TABLE IF EXISTS prerrequisitos;

CREATE TABLE prerrequisitos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    materia_id INT NOT NULL COMMENT 'Materia que tiene el prerrequisito',
    materia_prerrequisito_id INT NOT NULL COMMENT 'Materia que debe aprobarse antes',
    es_obligatorio BOOLEAN DEFAULT TRUE COMMENT 'Si es obligatorio o solo recomendado',
    descripcion TEXT COMMENT 'Descripción adicional del prerrequisito',
    
    -- Campos de auditoría y control (ESTÁNDAR)
    activo BOOLEAN DEFAULT TRUE COMMENT 'Registro activo/inactivo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Fecha de modificación',
    deleted_at TIMESTAMP NULL DEFAULT NULL COMMENT 'Soft delete',
    created_by INT COMMENT 'Usuario que creó',
    updated_by INT COMMENT 'Usuario que modificó',
    deleted_by INT COMMENT 'Usuario que eliminó',
    
    -- Foreign Keys
    FOREIGN KEY (materia_id) REFERENCES materias(id) ON DELETE CASCADE,
    FOREIGN KEY (materia_prerrequisito_id) REFERENCES materias(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCIAS usuarios(id) ON DELETE SET NULL,
    FOREIGN KEY (updated_by) REFERENCES usuarios(id) ON DELETE SET NULL,
    FOREIGN KEY (deleted_by) REFERENCES usuarios(id) ON DELETE SET NULL,
    
    -- Índices
    UNIQUE KEY unique_materia_prerrequisito (materia_id, materia_prerrequisito_id, deleted_at),
    INDEX idx_activo (activo),
    INDEX idx_deleted_at (deleted_at),
    INDEX idx_materia_id (materia_id),
    
    -- Constraints
    CHECK (materia_id != materia_prerrequisito_id)
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Prerrequisitos de materias';

-- ============================================
-- TABLA: cursos
-- ============================================

DROP TABLE IF EXISTS cursos;

CREATE TABLE cursos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    materia_id INT NOT NULL COMMENT 'Materia del curso',
    gestion_id INT NOT NULL COMMENT 'Gestión académica',
    nombre VARCHAR(50) NOT NULL COMMENT 'Grupo A, Grupo B, etc.',
    codigo VARCHAR(20) COMMENT 'Código identificador del curso',
    
    -- Cupos
    cupo_maximo INT NOT NULL DEFAULT 35 COMMENT 'Máximo de estudiantes permitidos',
    cupo_actual INT DEFAULT 0 COMMENT 'Estudiantes inscritos actualmente',
    cupo_minimo INT DEFAULT 10 COMMENT 'Mínimo de estudiantes para abrir el curso',
    
    -- Estado del curso
    estado ENUM('PLANIFICADO', 'ABIERTO', 'EN_CURSO', 'FINALIZADO', 'CANCELADO') DEFAULT 'PLANIFICADO',
    fecha_inicio DATE COMMENT 'Fecha de inicio del curso',
    fecha_fin DATE COMMENT 'Fecha de fin del curso',
    aula VARCHAR(50) COMMENT 'Aula asignada',
    
    -- Campos de auditoría y control (ESTÁNDAR)
    activo BOOLEAN DEFAULT TRUE COMMENT 'Registro activo/inactivo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Fecha de modificación',
    deleted_at TIMESTAMP NULL DEFAULT NULL COMMENT 'Soft delete',
    created_by INT COMMENT 'Usuario que creó',
    updated_by INT COMMENT 'Usuario que modificó',
    deleted_by INT COMMENT 'Usuario que eliminó',
    
    -- Foreign Keys
    FOREIGN KEY (materia_id) REFERENCES materias(id) ON DELETE RESTRICT,
    FOREIGN KEY (gestion_id) REFERENCES gestiones(id) ON DELETE RESTRICT,
    FOREIGN KEY (created_by) REFERENCES usuarios(id) ON DELETE SET NULL,
    FOREIGN KEY (updated_by) REFERENCES usuarios(id) ON DELETE SET NULL,
    FOREIGN KEY (deleted_by) REFERENCES usuarios(id) ON DELETE SET NULL,
    
    -- Índices
    INDEX idx_activo (activo),
    INDEX idx_deleted_at (deleted_at),
    INDEX idx_materia_gestion (materia_id, gestion_id),
    INDEX idx_estado (estado),
    
    -- Constraints
    CHECK (cupo_actual <= cupo_maximo),
    CHECK (cupo_maximo > 0),
    CHECK (cupo_minimo >= 0)
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Cursos (grupos) por materia y gestión';

-- ============================================
-- TABLA: docentes
-- ============================================

DROP TABLE IF EXISTS docentes;

CREATE TABLE docentes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL UNIQUE COMMENT 'Relación con usuario del sistema',
    
    -- Datos personales
    nombres VARCHAR(150) NOT NULL,
    apellido_paterno VARCHAR(100) NOT NULL,
    apellido_materno VARCHAR(100),
    ci VARCHAR(15) NOT NULL COMMENT 'Cédula de identidad',
    expedicion VARCHAR(5) NOT NULL COMMENT 'SC, LP, CB, OR, PT, TJ, CH, BE, PD',
    complemento VARCHAR(10) COMMENT 'Complemento del CI',
    fecha_nacimiento DATE NOT NULL,
    genero ENUM('M', 'F', 'OTRO') NOT NULL,
    estado_civil_id INT COMMENT 'Estado civil',
    nacionalidad VARCHAR(50) DEFAULT 'Boliviana',
    
    -- Contacto
    telefono VARCHAR(20),
    celular VARCHAR(20) NOT NULL,
    email VARCHAR(150) UNIQUE,
    email_secundario VARCHAR(150),
    direccion TEXT,
    localidad_id INT COMMENT 'Localidad de residencia',
    zona VARCHAR(100),
    
    -- Datos profesionales
    titulo_profesional VARCHAR(200) COMMENT 'Título universitario',
    especialidad VARCHAR(200),
    nivel_academico ENUM('TECNICO', 'LICENCIATURA', 'MAESTRIA', 'DOCTORADO') DEFAULT 'LICENCIATURA',
    universidad_egreso VARCHAR(200),
    anio_egreso INT,
    anios_experiencia INT DEFAULT 0 COMMENT 'Años de experiencia docente',
    
    -- Datos laborales
    fecha_contratacion DATE,
    fecha_retiro DATE,
    tipo_contrato ENUM('PLANTA', 'CONTRATO', 'HORARIO', 'CONSULTOR') DEFAULT 'CONTRATO',
    estado_laboral ENUM('ACTIVO', 'LICENCIA', 'RETIRADO', 'SUSPENDIDO') DEFAULT 'ACTIVO',
    carga_horaria_semanal INT DEFAULT 0 COMMENT 'Horas semanales de contrato',
    
    -- Datos bancarios (opcional)
    banco VARCHAR(100),
    numero_cuenta VARCHAR(50),
    
    -- Observaciones
    observaciones TEXT,
    
    -- Campos de auditoría y control (ESTÁNDAR)
    activo BOOLEAN DEFAULT TRUE COMMENT 'Registro activo/inactivo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Fecha de modificación',
    deleted_at TIMESTAMP NULL DEFAULT NULL COMMENT 'Soft delete',
    created_by INT COMMENT 'Usuario que creó',
    updated_by INT COMMENT 'Usuario que modificó',
    deleted_by INT COMMENT 'Usuario que eliminó',
    
    -- Foreign Keys
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE RESTRICT,
    FOREIGN KEY (estado_civil_id) REFERENCES estados_civiles(id) ON DELETE SET NULL,
    FOREIGN KEY (localidad_id) REFERENCES localidades(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES usuarios(id) ON DELETE SET NULL,
    FOREIGN KEY (updated_by) REFERENCES usuarios(id) ON DELETE SET NULL,
    FOREIGN KEY (deleted_by) REFERENCES usuarios(id) ON DELETE SET NULL,
    
    -- Índices
    UNIQUE KEY unique_ci_expedicion (ci, expedicion, deleted_at),
    INDEX idx_activo (activo),
    INDEX idx_deleted_at (deleted_at),
    INDEX idx_estado_laboral (estado_laboral),
    INDEX idx_usuario_id (usuario_id),
    INDEX idx_email (email)
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Docentes del instituto';

-- ============================================
-- TABLA: asignaciones_docentes
-- ============================================

DROP TABLE IF EXISTS asignaciones_docentes;

CREATE TABLE asignaciones_docentes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    docente_id INT NOT NULL COMMENT 'Docente asignado',
    curso_id INT NOT NULL COMMENT 'Curso al que se asigna',
    gestion_id INT NOT NULL COMMENT 'Gestión académica',
    
    -- Fechas de asignación
    fecha_asignacion DATE NOT NULL COMMENT 'Fecha de asignación',
    fecha_inicio DATE COMMENT 'Fecha de inicio de clases',
    fecha_fin DATE COMMENT 'Fecha de fin de clases',
    
    -- Carga horaria
    carga_horaria_semanal INT NOT NULL DEFAULT 0 COMMENT 'Horas semanales',
    
    -- Estado
    estado ENUM('ACTIVA', 'FINALIZADA', 'CANCELADA', 'SUSPENDIDA') DEFAULT 'ACTIVA',
    motivo_cancelacion TEXT COMMENT 'Motivo de cancelación/suspensión',
    
    -- Observaciones
    observaciones TEXT,
    
    -- Campos de auditoría y control (ESTÁNDAR)
    activo BOOLEAN DEFAULT TRUE COMMENT 'Registro activo/inactivo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Fecha de modificación',
    deleted_at TIMESTAMP NULL DEFAULT NULL COMMENT 'Soft delete',
    created_by INT COMMENT 'Usuario que creó',
    updated_by INT COMMENT 'Usuario que modificó',
    deleted_by INT COMMENT 'Usuario que eliminó',
    
    -- Foreign Keys
    FOREIGN KEY (docente_id) REFERENCES docentes(id) ON DELETE RESTRICT,
    FOREIGN KEY (curso_id) REFERENCES cursos(id) ON DELETE RESTRICT,
    FOREIGN KEY (gestion_id) REFERENCES gestiones(id) ON DELETE RESTRICT,
    FOREIGN KEY (created_by) REFERENCES usuarios(id) ON DELETE SET NULL,
    FOREIGN KEY (updated_by) REFERENCES usuarios(id) ON DELETE SET NULL,
    FOREIGN KEY (deleted_by) REFERENCES usuarios(id) ON DELETE SET NULL,
    
    -- Índices
    UNIQUE KEY unique_docente_curso_gestion (docente_id, curso_id, gestion_id, deleted_at),
    INDEX idx_activo (activo),
    INDEX idx_deleted_at (deleted_at),
    INDEX idx_estado (estado),
    INDEX idx_docente_id (docente_id),
    INDEX idx_curso_id (curso_id),
    INDEX idx_gestion_id (gestion_id)
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Asignación de docentes a cursos';

-- ============================================
-- TABLA: turnos_cursos
-- ============================================

DROP TABLE IF EXISTS turnos_cursos;

CREATE TABLE turnos_cursos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    curso_id INT NOT NULL COMMENT 'Curso',
    turno_id INT NOT NULL COMMENT 'Turno horario (Mañana, Tarde, Noche)',
    
    -- Horario específico
    dias_semana VARCHAR(50) COMMENT 'LUN,MIE,VIE o MAR,JUE o LUN,MAR,MIE,JUE,VIE',
    hora_inicio TIME COMMENT 'Hora específica de inicio',
    hora_fin TIME COMMENT 'Hora específica de fin',
    
    -- Aula
    aula VARCHAR(50) COMMENT 'Aula asignada',
    edificio VARCHAR(50) COMMENT 'Edificio',
    piso INT COMMENT 'Piso',
    capacidad_aula INT COMMENT 'Capacidad del aula',
    
    -- Campos de auditoría y control (ESTÁNDAR)
    activo BOOLEAN DEFAULT TRUE COMMENT 'Registro activo/inactivo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Fecha de modificación',
    deleted_at TIMESTAMP NULL DEFAULT NULL COMMENT 'Soft delete',
    created_by INT COMMENT 'Usuario que creó',
    updated_by INT COMMENT 'Usuario que modificó',
    deleted_by INT COMMENT 'Usuario que eliminó',
    
    -- Foreign Keys
    FOREIGN KEY (curso_id) REFERENCES cursos(id) ON DELETE CASCADE,
    FOREIGN KEY (turno_id) REFERENCES turnos_horarios(id) ON DELETE RESTRICT,
    FOREIGN KEY (created_by) REFERENCES usuarios(id) ON DELETE SET NULL,
    FOREIGN KEY (updated_by) REFERENCES usuarios(id) ON DELETE SET NULL,
    FOREIGN KEY (deleted_by) REFERENCES usuarios(id) ON DELETE SET NULL,
    
    -- Índices
    INDEX idx_activo (activo),
    INDEX idx_deleted_at (deleted_at),
    INDEX idx_curso_id (curso_id),
    INDEX idx_turno_id (turno_id),
    INDEX idx_aula (aula)
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Horarios de cursos';

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- TRIGGERS
-- ============================================

DELIMITER $$

-- Trigger para actualizar cupo_actual del curso al inscribir estudiante
DROP TRIGGER IF EXISTS trg_curso_actualizar_cupo$$

CREATE TRIGGER trg_curso_actualizar_cupo
AFTER INSERT ON inscripciones_materias
FOR EACH ROW
BEGIN
    UPDATE cursos c
    INNER JOIN inscripciones_materias im ON c.id = im.curso_id
    SET c.cupo_actual = (
        SELECT COUNT(*)
        FROM inscripciones_materias
        WHERE curso_id = c.id AND deleted_at IS NULL
    )
    WHERE c.id = NEW.curso_id;
END$$

DELIMITER ;

-- ============================================
-- VERIFICACIÓN
-- ============================================

SELECT 'Estructura académica - Parte 2/2 creada (5 tablas)' as mensaje;

SELECT 
    TABLE_NAME as tabla,
    TABLE_COMMENT as descripcion
FROM information_schema.TABLES
WHERE TABLE_SCHEMA = 'instituto_incos'
  AND TABLE_NAME IN (
    'prerrequisitos', 'cursos', 'docentes', 
    'asignaciones_docentes', 'turnos_cursos'
  )
ORDER BY TABLE_NAME;

-- ============================================
-- RESUMEN TOTAL ESTRUCTURA ACADÉMICA
-- ============================================

SELECT 'Total de tablas de estructura académica: 10' as mensaje;

SELECT 
    TABLE_NAME as tabla,
    TABLE_COMMENT as descripcion
FROM information_schema.TABLES
WHERE TABLE_SCHEMA = 'instituto_incos'
  AND TABLE_NAME IN (
    'carreras', 'gestiones', 'periodos', 'materias', 'plan_estudios',
    'prerrequisitos', 'cursos', 'docentes', 'asignaciones_docentes', 'turnos_cursos'
  )
ORDER BY TABLE_NAME;

-- ============================================
-- FIN DE LA PARTE 2
-- ============================================
