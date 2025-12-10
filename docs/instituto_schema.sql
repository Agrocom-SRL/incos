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
-- NOTA: Estas tablas ya están normalizadas en los scripts actuales:
-- - paises, departamentos, provincias, municipios → 02-catalogos-geograficos.sql
-- - idiomas, estados_civiles, tipos_discapacidad → 03-catalogos-referencia.sql
-- - tipos_sangre → Eliminada (ahora es ENUM en estudiantes)
-- - comunidades, localidades → Eliminadas (simplificación geográfica)

-- ============================================
-- TABLAS DE ESTRUCTURA ACADÉMICA
-- ============================================
-- NOTA: Estas tablas ya están normalizadas en los scripts actuales:
-- - carreras, gestiones, periodos, materias, plan_estudios, prerrequisitos → 05-estructura-academica-parte1.sql
-- - cursos → 05-estructura-academica-parte2.sql (concepto cambiado: ahora son plantillas)
-- IMPORTANTE: periodos cambió conceptualmente (ahora son semestres de carrera, no periodos temporales)

-- ============================================
-- TABLAS DE ESTUDIANTES Y PERSONAS
-- ============================================
-- NOTA: La tabla estudiantes ya está normalizada en:
-- - estudiantes → 06-estudiantes-parte1.sql (simplificada)
-- - estudiantes_datos_academicos → 06-estudiantes-parte1.sql (nueva tabla)
-- - documentos_estudiante → 06-estudiantes-parte1.sql (nueva tabla)

/*
-- ⚠️ TABLA ELIMINADA: estudiantes (definición antigua)
-- Usar la versión normalizada en 06-estudiantes-parte1.sql
-- La definición antigua tenía:
-- - Estructura más compleja con más niveles geográficos
-- - Sin campos de auditoría estándar
-- - Sin soft delete
-- - Estructura diferente de CI y documentos

CREATE TABLE estudiantes_OLD (
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
-- NOTA: Estas tablas ya están normalizadas en los scripts actuales:
-- - roles, permisos, usuarios, roles_permisos → 04-sistema-seguridad.sql
-- - sesiones → 04-sistema-seguridad.sql (nueva tabla)
-- - personal, rectores, directores, secretarias → 04-sistema-seguridad.sql (nuevas tablas)

-- ============================================
-- TABLAS DE AUDITORÍA Y LOGS
-- ============================================

-- Tabla de Logs de Auditoría
-- ⚠️ PENDIENTE DE NORMALIZAR
-- Esta tabla aún NO está normalizada en los scripts actuales
-- Falta agregar: activo, deleted_at, updated_at, updated_by, deleted_by
-- Falta: Foreign keys con ON DELETE SET NULL
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
-- NOTA: Los datos iniciales deben crearse en scripts separados
-- según correspondan a las tablas normalizadas en los scripts actuales

-- ============================================
-- VISTAS ÚTILES
-- ============================================

-- ============================================
-- VISTAS ÚTILES
-- ============================================
-- NOTA: Estas vistas deben recrearse en scripts separados después de normalizar
-- ya que dependen de tablas que han cambiado su estructura

-- ============================================
-- ÍNDICES ADICIONALES PARA RENDIMIENTO
-- ============================================
-- NOTA: Los índices están incluidos en las definiciones de tablas normalizadas
-- Ver scripts: 12-indices.sql y 13-indices-optimizacion.sql para índices adicionales

-- ============================================
-- TRIGGERS PARA AUDITORÍA
-- ============================================
-- NOTA: Los triggers están incluidos en los scripts normalizados donde corresponden
-- Ver: 07-inscripciones-parte2.sql (triggers de inscripciones_materias)
-- Ver: 10-pagos.sql (triggers de pagos)
-- Ver: 11-modulos-operativos-parte2.sql (triggers de libros/folios)

-- ============================================
-- FIN DEL SCHEMA
-- ============================================
