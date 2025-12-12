-- ============================================
-- ESTRUCTURA ACADÉMICA - PARTE 2
-- Sistema de Gestión Académica - Instituto INCOS
-- 5 Tablas: cursos, docentes, asignaciones_docentes, turnos_cursos, turnos
-- ============================================

USE instituto_incos;

-- ============================================
-- FASE 1: ELIMINACIÓN DE TABLAS
-- Deshabilitamos foreign key checks para poder eliminar en cualquier orden
-- ============================================

SET FOREIGN_KEY_CHECKS = 0;

-- Eliminar todas las tablas (orden no importa con foreign key checks deshabilitado)
DROP TABLE IF EXISTS turnos_cursos;
DROP TABLE IF EXISTS asignaciones_docentes;
DROP TABLE IF EXISTS turnos;
DROP TABLE IF EXISTS docentes;
DROP TABLE IF EXISTS cursos;

-- ============================================
-- FASE 2: CREACIÓN DE TABLAS
-- Las foreign key checks siguen deshabilitadas durante la creación
-- ============================================

-- ============================================
-- TABLA: cursos
-- ============================================

CREATE TABLE cursos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    materia_id INT NULL COMMENT 'Materia del curso (NULL permite flexibilidad en migraciones)',
    nombre VARCHAR(50) NOT NULL COMMENT 'Nombre del paralelo/grupo (ej: Grupo A, Sección 1)',
    codigo VARCHAR(20) COMMENT 'Código identificador del curso',
    cupo_maximo INT NOT NULL DEFAULT 35 COMMENT 'Máximo de estudiantes permitidos',
    cupo_minimo INT DEFAULT 10 COMMENT 'Mínimo de estudiantes para abrir el curso',
    estado ENUM('PROPUESTO', 'APROBADO', 'CANCELADO') DEFAULT 'PROPUESTO' COMMENT 'Estado del curso (borrador/propuesta)',
    descripcion TEXT COMMENT 'Descripción del curso',
    
    -- Campos de auditoría y control (ESTÁNDAR)
    activo BOOLEAN DEFAULT TRUE COMMENT 'Registro activo/inactivo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Fecha de modificación',
    deleted_at TIMESTAMP NULL DEFAULT NULL COMMENT 'Soft delete',
    created_by INT COMMENT 'Usuario que creó',
    updated_by INT COMMENT 'Usuario que modificó',
    deleted_by INT COMMENT 'Usuario que eliminó',
    
    FOREIGN KEY (materia_id) REFERENCES materias(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES usuarios(id) ON DELETE SET NULL,
    FOREIGN KEY (updated_by) REFERENCES usuarios(id) ON DELETE SET NULL,
    FOREIGN KEY (deleted_by) REFERENCES usuarios(id) ON DELETE SET NULL,
    
    INDEX idx_materia_id (materia_id) COMMENT 'Búsqueda por materia',
    INDEX idx_estado (estado) COMMENT 'Filtrado por estado',
    INDEX idx_activo (activo) COMMENT 'Filtrado por estado activo',
    INDEX idx_deleted_at (deleted_at) COMMENT 'Filtrado de soft delete',
    INDEX idx_materia_estado (materia_id, estado, activo, deleted_at) COMMENT 'Búsqueda por materia y estado',
    INDEX idx_cupo (cupo_maximo, cupo_minimo) COMMENT 'Búsqueda por cupos',
    
    CHECK (cupo_maximo > 0),
    CHECK (cupo_minimo >= 0)
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Cursos (paralelos/grupos) - Plantillas de cursos por materia. Se ofertan en gestiones mediante asignaciones_docentes. Los horarios se definen en turnos_cursos.';

-- ============================================
-- TABLA: docentes
-- ============================================

CREATE TABLE docentes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT COMMENT 'Relación con usuario del sistema',
    
    -- Datos personales básicos
    ci VARCHAR(25) NOT NULL COMMENT 'Cédula de identidad',
    expedicion VARCHAR(5) NOT NULL COMMENT 'Expedición del CI',
    nombres VARCHAR(150) NOT NULL COMMENT 'Nombres completos',
    apellido_paterno VARCHAR(100) NOT NULL COMMENT 'Apellido paterno',
    apellido_materno VARCHAR(100) COMMENT 'Apellido materno',
    fecha_nacimiento DATE NOT NULL COMMENT 'Fecha de nacimiento',
    genero ENUM('MASCULINO', 'FEMENINO', 'OTRO') NOT NULL COMMENT 'Género',
    estado_civil_id INT COMMENT 'Estado civil',
    nacionalidad VARCHAR(50) DEFAULT 'Boliviana' COMMENT 'Nacionalidad',
    
    -- Contacto
    telefono VARCHAR(20) COMMENT 'Teléfono fijo',
    celular VARCHAR(20) NOT NULL COMMENT 'Teléfono celular',
    email_personal VARCHAR(150) COMMENT 'Email personal (para emergencias, el email institucional está en usuarios)',
    direccion TEXT COMMENT 'Dirección completa',
    municipio_residencia_id INT COMMENT 'Municipio de residencia',
    zona VARCHAR(100) COMMENT 'Zona/barrio',
    
    -- Datos académicos/profesionales
    titulo_profesional VARCHAR(200) COMMENT 'Título profesional',
    especialidad VARCHAR(200) COMMENT 'Especialidad',
    nivel_academico ENUM('TECNICO', 'LICENCIATURA', 'MAESTRIA', 'DOCTORADO') DEFAULT 'LICENCIATURA' COMMENT 'Nivel académico',
    institucion_egreso VARCHAR(200) COMMENT 'Institución de egreso',
    anio_egreso INT COMMENT 'Año de egreso',
    anios_experiencia INT DEFAULT 0 COMMENT 'Años de experiencia docente',
    
    -- Datos laborales
    fecha_contratacion DATE COMMENT 'Fecha de contratación',
    fecha_retiro DATE COMMENT 'Fecha de retiro',
    tipo_contrato ENUM('PLANTA', 'CONTRATO', 'HORARIO', 'CONSULTOR') DEFAULT 'CONTRATO' COMMENT 'Tipo de contrato',
    estado_laboral ENUM('ACTIVO', 'LICENCIA', 'RETIRADO', 'SUSPENDIDO') DEFAULT 'ACTIVO' COMMENT 'Estado laboral',
    carga_horaria_semanal INT DEFAULT 0 COMMENT 'Horas semanales de contrato',
    
    -- Datos financieros
    banco VARCHAR(100) COMMENT 'Banco',
    numero_cuenta VARCHAR(50) COMMENT 'Número de cuenta',
    
    -- Observaciones
    observaciones TEXT COMMENT 'Observaciones adicionales',
    
    -- Campos de auditoría y control (ESTÁNDAR)
    activo BOOLEAN DEFAULT TRUE COMMENT 'Registro activo/inactivo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Fecha de modificación',
    deleted_at TIMESTAMP NULL DEFAULT NULL COMMENT 'Soft delete',
    created_by INT COMMENT 'Usuario que creó',
    updated_by INT COMMENT 'Usuario que modificó',
    deleted_by INT COMMENT 'Usuario que eliminó',
    
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL,
    FOREIGN KEY (estado_civil_id) REFERENCES estados_civiles(id) ON DELETE SET NULL,
    FOREIGN KEY (municipio_residencia_id) REFERENCES municipios(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES usuarios(id) ON DELETE SET NULL,
    FOREIGN KEY (updated_by) REFERENCES usuarios(id) ON DELETE SET NULL,
    FOREIGN KEY (deleted_by) REFERENCES usuarios(id) ON DELETE SET NULL,
    
    INDEX idx_ci_expedicion (ci, expedicion) COMMENT 'Búsqueda por CI y expedición',
    INDEX idx_usuario_id (usuario_id) COMMENT 'Búsqueda por usuario',
    INDEX idx_email_personal (email_personal) COMMENT 'Búsqueda por email personal',
    INDEX idx_estado_laboral (estado_laboral) COMMENT 'Filtrado por estado laboral',
    INDEX idx_activo (activo) COMMENT 'Filtrado por estado activo',
    INDEX idx_deleted_at (deleted_at) COMMENT 'Filtrado de soft delete',
    INDEX idx_apellidos (apellido_paterno, apellido_materno) COMMENT 'Búsqueda por apellidos',
    INDEX idx_estado_activo (estado_laboral, activo, deleted_at) COMMENT 'Búsqueda por estado laboral y activo',
    INDEX idx_tipo_contrato (tipo_contrato, estado_laboral, activo) COMMENT 'Búsqueda por tipo de contrato y estado',
    INDEX idx_municipio (municipio_residencia_id) COMMENT 'Búsqueda por municipio'
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Docentes del instituto';

-- ============================================
-- TABLA: asignaciones_docentes
-- ============================================

CREATE TABLE asignaciones_docentes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    curso_id INT NULL COMMENT 'Curso (paralelo/grupo) que se oferta (NULL permite flexibilidad en migraciones)',
    gestion_id INT NULL COMMENT 'Gestión académica en la que se oferta (NULL permite flexibilidad en migraciones)',
    docente_id INT COMMENT 'Docente asignado (NULL si aún no se asigna o es docente suplente)',
    carga_horaria_semanal INT NOT NULL DEFAULT 0 COMMENT 'Horas semanales',
    estado ENUM('PROPUESTA', 'APROBADA', 'ABIERTA', 'CERRADA', 'CANCELADA') DEFAULT 'PROPUESTA' COMMENT 'Estado de la oferta (CERRADA = no se llenó cupo mínimo)',
    motivo_cancelacion TEXT COMMENT 'Motivo de cancelación/cierre',
    observaciones TEXT COMMENT 'Observaciones',
    
    -- Campos de auditoría y control (ESTÁNDAR)
    activo BOOLEAN DEFAULT TRUE COMMENT 'Registro activo/inactivo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Fecha de modificación',
    deleted_at TIMESTAMP NULL DEFAULT NULL COMMENT 'Soft delete',
    created_by INT COMMENT 'Usuario que creó',
    updated_by INT COMMENT 'Usuario que modificó',
    deleted_by INT COMMENT 'Usuario que eliminó',
    
    FOREIGN KEY (docente_id) REFERENCES docentes(id) ON DELETE SET NULL,
    FOREIGN KEY (curso_id) REFERENCES cursos(id) ON DELETE SET NULL,
    FOREIGN KEY (gestion_id) REFERENCES gestiones(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES usuarios(id) ON DELETE SET NULL,
    FOREIGN KEY (updated_by) REFERENCES usuarios(id) ON DELETE SET NULL,
    FOREIGN KEY (deleted_by) REFERENCES usuarios(id) ON DELETE SET NULL,
    
    INDEX idx_docente_id (docente_id) COMMENT 'Búsqueda por docente',
    INDEX idx_curso_id (curso_id) COMMENT 'Búsqueda por curso',
    INDEX idx_gestion_id (gestion_id) COMMENT 'Búsqueda por gestión',
    INDEX idx_estado (estado) COMMENT 'Filtrado por estado',
    INDEX idx_activo (activo) COMMENT 'Filtrado por estado activo',
    INDEX idx_deleted_at (deleted_at) COMMENT 'Filtrado de soft delete',
    INDEX idx_curso_gestion (curso_id, gestion_id, estado, activo, deleted_at) COMMENT 'Búsqueda de ofertas por curso y gestión',
    INDEX idx_gestion_estado (gestion_id, estado, activo, deleted_at) COMMENT 'Búsqueda de ofertas por gestión y estado',
    INDEX idx_docente_gestion (docente_id, gestion_id, estado, activo, deleted_at) COMMENT 'Búsqueda de ofertas por docente y gestión'
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Oferta de cursos en gestiones. Vincula curso (paralelo) + gestión. El docente puede ser NULL (aún no asignado o suplente). El estado CERRADA indica que no se llenó el cupo mínimo. Las fechas de inicio/fin de clases están en etapas_gestion (tipo CLASES).';

-- ============================================
-- TABLA: turnos
-- ============================================
-- IMPORTANTE: Se crea antes de turnos_cursos porque turnos_cursos tiene foreign key a turnos

CREATE TABLE turnos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(20) NOT NULL COMMENT 'MAÑANA, TARDE, NOCHE',
    hora_inicio TIME NOT NULL COMMENT '07:00, 14:00, 19:00',
    hora_fin TIME NOT NULL COMMENT '12:00, 18:00, 22:00',
    descripcion VARCHAR(100),
    color_hex VARCHAR(7) COMMENT 'Color para UI (#FF5733)',
    
    -- Campos de auditoría y control (ESTÁNDAR)
    activo BOOLEAN DEFAULT TRUE COMMENT 'Registro activo/inactivo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Fecha de modificación',
    deleted_at TIMESTAMP NULL DEFAULT NULL COMMENT 'Soft delete',
    created_by INT COMMENT 'Usuario que creó',
    updated_by INT COMMENT 'Usuario que modificó',
    deleted_by INT COMMENT 'Usuario que eliminó',
    
    -- Índices esenciales
    INDEX idx_nombre (nombre) COMMENT 'Búsqueda por nombre',
    INDEX idx_activo (activo) COMMENT 'Filtrado por estado activo',
    INDEX idx_deleted_at (deleted_at) COMMENT 'Filtrado de soft delete'
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Turnos horarios (mañana, tarde, noche)';

-- ============================================
-- TABLA: turnos_cursos
-- ============================================

CREATE TABLE turnos_cursos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    asignacion_id INT NULL COMMENT 'Oferta del curso en la gestión (asignaciones_docentes) (NULL permite flexibilidad en migraciones)',
    turno_id INT NULL COMMENT 'Turno horario (Mañana/Tarde/Noche) (NULL permite flexibilidad en migraciones)',
    dia_semana ENUM('LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO', 'DOMINGO') NOT NULL COMMENT 'Día de la semana',
    hora_inicio TIME NOT NULL COMMENT 'Hora de inicio',
    hora_fin TIME NOT NULL COMMENT 'Hora de fin',
    aula VARCHAR(50) NOT NULL COMMENT 'Aula asignada para este día',
    
    -- Campos de auditoría y control (ESTÁNDAR)
    activo BOOLEAN DEFAULT TRUE COMMENT 'Registro activo/inactivo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Fecha de modificación',
    deleted_at TIMESTAMP NULL DEFAULT NULL COMMENT 'Soft delete',
    created_by INT COMMENT 'Usuario que creó',
    updated_by INT COMMENT 'Usuario que modificó',
    deleted_by INT COMMENT 'Usuario que eliminó',
    
    FOREIGN KEY (asignacion_id) REFERENCES asignaciones_docentes(id) ON DELETE SET NULL,
    FOREIGN KEY (turno_id) REFERENCES turnos(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES usuarios(id) ON DELETE SET NULL,
    FOREIGN KEY (updated_by) REFERENCES usuarios(id) ON DELETE SET NULL,
    FOREIGN KEY (deleted_by) REFERENCES usuarios(id) ON DELETE SET NULL,
    
    INDEX idx_asignacion_id (asignacion_id) COMMENT 'Búsqueda por oferta',
    INDEX idx_turno_id (turno_id) COMMENT 'Búsqueda por turno',
    INDEX idx_dia_semana (dia_semana) COMMENT 'Búsqueda por día de la semana',
    INDEX idx_aula (aula) COMMENT 'Búsqueda por aula',
    INDEX idx_activo (activo) COMMENT 'Filtrado por estado activo',
    INDEX idx_deleted_at (deleted_at) COMMENT 'Filtrado de soft delete',
    INDEX idx_asignacion_dia (asignacion_id, dia_semana, activo, deleted_at) COMMENT 'Búsqueda por oferta y día',
    INDEX idx_asignacion_turno (asignacion_id, turno_id, activo, deleted_at) COMMENT 'Búsqueda por oferta y turno',
    INDEX idx_aula_dia (aula, dia_semana, hora_inicio, hora_fin, activo, deleted_at) COMMENT 'Búsqueda de disponibilidad de aula por día y horario',
    INDEX idx_dia_hora (dia_semana, hora_inicio, hora_fin) COMMENT 'Búsqueda por día y horario',
    INDEX idx_turno_activo (turno_id, activo, deleted_at) COMMENT 'Búsqueda de turnos activos por tipo'
    
    -- NOTA: La validación de que hora_fin > hora_inicio debe hacerse a nivel de aplicación
    -- MySQL puede tener problemas con CHECK constraints en ciertas versiones
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Horarios de ofertas de cursos (un registro por día). Cada día puede tener su propio horario y aula. Permite que el mismo curso tenga diferentes aulas en diferentes días, incluso con el mismo horario.';

-- ============================================
-- FASE 3: REHABILITAR FOREIGN KEY CHECKS
-- ============================================

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- FIN DEL SCRIPT
-- ============================================

