-- ============================================
-- MÓDULO DE ESTUDIANTES - PARTE 2
-- Sistema de Gestión Académica - Instituto INCOS
-- 4 Tablas: becas_descuentos, estudiantes_becas, licencias_solicitudes, estudiantes_apoderados
-- ============================================

USE instituto_incos;

SET FOREIGN_KEY_CHECKS = 0;

-- ============================================
-- TABLA: becas_descuentos
-- ============================================

DROP TABLE IF EXISTS becas_descuentos;

CREATE TABLE becas_descuentos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL COMMENT 'Beca 0%, Beca 25%, Beca 50%, Beca 75%, Beca 100%',
    codigo VARCHAR(20) COMMENT 'BECA_0, BECA_25, BECA_50, BECA_75, BECA_100',
    porcentaje DECIMAL(5,2) NOT NULL COMMENT 'Porcentaje de descuento (0.00 a 100.00)',
    descripcion TEXT,
    requiere_documentacion BOOLEAN DEFAULT TRUE COMMENT 'Requiere documentos de respaldo',
    requiere_aprobacion_rector BOOLEAN DEFAULT FALSE COMMENT 'Requiere aprobación del Rector (ej: Beca 100%)',
    
    -- Sistema de becas automáticas
    es_automatica BOOLEAN DEFAULT FALSE COMMENT 'Si la beca se asigna automáticamente',
    tipo_automatica ENUM('PROMEDIO_90', 'MANUAL') DEFAULT 'MANUAL' COMMENT 'Tipo de asignación automática: PROMEDIO_90 (si promedio >= 90), MANUAL',
    promedio_minimo DECIMAL(5,2) COMMENT 'Promedio mínimo requerido (ej: 90 para beca 100%)',
    
    -- Campos de auditoría y control (ESTÁNDAR)
    activo BOOLEAN DEFAULT TRUE COMMENT 'Registro activo/inactivo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Fecha de modificación',
    deleted_at TIMESTAMP NULL DEFAULT NULL COMMENT 'Soft delete',
    created_by INT COMMENT 'Usuario que creó',
    updated_by INT COMMENT 'Usuario que modificó',
    deleted_by INT COMMENT 'Usuario que eliminó',
    
    -- Índices esenciales
    INDEX idx_porcentaje (porcentaje) COMMENT 'Búsqueda por porcentaje',
    INDEX idx_activo (activo) COMMENT 'Filtrado por estado activo',
    INDEX idx_deleted_at (deleted_at) COMMENT 'Filtrado de soft delete',
    INDEX idx_es_automatica (es_automatica) COMMENT 'Filtrado de becas automáticas',
    
    -- Constraints
    CHECK (porcentaje >= 0 AND porcentaje <= 100)
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Catálogo de becas y descuentos sobre el aporte anual de matrícula (400 bs). Permite registrar cualquier tipo de descuento. Escasos recursos es un tipo de descuento más, no un atributo del sistema.';

-- ============================================
-- TABLA: estudiantes_becas
-- ============================================

DROP TABLE IF EXISTS estudiantes_becas;

CREATE TABLE estudiantes_becas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    estudiante_id INT NOT NULL COMMENT 'Estudiante beneficiario',
    beca_descuento_id INT NOT NULL COMMENT 'Tipo de beca/descuento sobre el aporte anual de matrícula (400 bs)',
    gestion_id INT NOT NULL COMMENT 'Gestión',
    fecha_solicitud DATE NOT NULL COMMENT 'Fecha en que se solicitó el descuento',
    estado ENUM('PENDIENTE', 'ACTIVA', 'FINALIZADA', 'RECHAZADA') DEFAULT 'PENDIENTE' COMMENT 'Estado de la beca',
    documentos_completos BOOLEAN DEFAULT FALSE COMMENT 'Documentación completa',
    fecha_inicio_entrega_documentos DATE COMMENT 'Fecha de inicio de entrega de documentos',
    fecha_fin_entrega_documentos DATE COMMENT 'Fecha de fin de entrega de documentos (puede haber múltiples documentos requeridos)',
    observaciones TEXT COMMENT 'Observaciones',
    
    -- Campos de auditoría y control (ESTÁNDAR)
    activo BOOLEAN DEFAULT TRUE COMMENT 'Registro activo/inactivo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Fecha de modificación',
    deleted_at TIMESTAMP NULL DEFAULT NULL COMMENT 'Soft delete',
    created_by INT COMMENT 'Usuario que creó',
    updated_by INT COMMENT 'Usuario que modificó',
    deleted_by INT COMMENT 'Usuario que eliminó',
    
    FOREIGN KEY (estudiante_id) REFERENCES estudiantes(id) ON DELETE SET NULL,
    FOREIGN KEY (beca_descuento_id) REFERENCES becas_descuentos(id) ON DELETE SET NULL,
    FOREIGN KEY (gestion_id) REFERENCES gestiones(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES usuarios(id) ON DELETE SET NULL,
    FOREIGN KEY (updated_by) REFERENCES usuarios(id) ON DELETE SET NULL,
    FOREIGN KEY (deleted_by) REFERENCES usuarios(id) ON DELETE SET NULL,
    
    INDEX idx_estudiante_id (estudiante_id) COMMENT 'Búsqueda por estudiante',
    INDEX idx_estado (estado) COMMENT 'Filtrado por estado',
    INDEX idx_gestion_id (gestion_id) COMMENT 'Búsqueda por gestión',
    INDEX idx_activo (activo) COMMENT 'Filtrado por estado activo',
    INDEX idx_deleted_at (deleted_at) COMMENT 'Filtrado de soft delete',
    INDEX idx_estudiante_estado (estudiante_id, estado, activo, deleted_at) COMMENT 'Búsqueda de becas por estudiante y estado',
    INDEX idx_gestion_estado (gestion_id, estado, activo, deleted_at) COMMENT 'Búsqueda de becas por gestión y estado',
    INDEX idx_beca_descuento (beca_descuento_id, estado, activo) COMMENT 'Búsqueda por tipo de beca y estado',
    INDEX idx_fecha_solicitud (fecha_solicitud) COMMENT 'Búsqueda por fecha de solicitud',
    INDEX idx_fechas_entrega (fecha_inicio_entrega_documentos, fecha_fin_entrega_documentos) COMMENT 'Búsqueda por rango de fechas de entrega de documentos',
    INDEX idx_estado_activa (estado, activo, deleted_at) COMMENT 'Búsqueda de becas activas'
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Becas y descuentos sobre el aporte anual de matrícula de 400 bs. Reglas: 100% descuento si promedio >= 90 en año anterior, 25% descuento si escasos recursos. Tabla de referencia que el estudiante no interactúa directamente.';

-- ============================================
-- TABLA: licencias_solicitudes
-- ============================================

DROP TABLE IF EXISTS licencias_solicitudes;

CREATE TABLE licencias_solicitudes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    estudiante_id INT NOT NULL COMMENT 'Estudiante solicitante',
    carrera_id INT NOT NULL COMMENT 'Carrera',
    gestion_id INT NOT NULL COMMENT 'Gestión',
    turno_curso_id INT COMMENT 'Turno/curso paralelo donde está matriculado (para verificar si la licencia aplica para ese curso en esa gestión)',
    fecha_solicitud DATE NOT NULL DEFAULT (CURDATE()) COMMENT 'Fecha de solicitud',
    fecha_desde DATE NOT NULL COMMENT 'Inicio de la licencia (Desde)',
    fecha_hasta DATE NOT NULL COMMENT 'Fin de la licencia (Hasta)',
    total_dias INT NOT NULL COMMENT 'Total de días',
    motivo ENUM('ENFERMEDAD', 'TRABAJO', 'FAMILIAR', 'VIAJE', 'ACADEMICO', 'DEPORTIVO', 'PERSONAL', 'OTRO') NOT NULL COMMENT 'Motivo de la licencia: ENFERMEDAD (enfermedad propia), TRABAJO (trabajo/empleo), FAMILIAR (asuntos familiares), VIAJE (viaje necesario), ACADEMICO (actividad académica externa), DEPORTIVO (competencias deportivas), PERSONAL (asuntos personales), OTRO',
    detalle_motivo TEXT NOT NULL COMMENT 'Detalle del motivo (observaciones)',
    estado ENUM('PENDIENTE', 'APROBADA', 'RECHAZADA', 'CANCELADA') DEFAULT 'PENDIENTE' COMMENT 'Estado de la solicitud',
    fecha_decision DATE COMMENT 'Fecha de decisión',
    decidido_por INT COMMENT 'Usuario que decidió (Director Académico)',
    motivo_rechazo TEXT COMMENT 'Motivo de rechazo',
    documentos_completos BOOLEAN DEFAULT FALSE COMMENT 'Documentación completa',
    fecha_inicio_entrega_documentos DATE COMMENT 'Fecha de inicio de entrega de documentos',
    fecha_fin_entrega_documentos DATE COMMENT 'Fecha de fin de entrega de documentos (puede haber múltiples documentos requeridos)',
    observaciones TEXT COMMENT 'Observaciones',
    observaciones_decision TEXT COMMENT 'Observaciones del decisor',
    
    -- Campos de auditoría y control (ESTÁNDAR)
    activo BOOLEAN DEFAULT TRUE COMMENT 'Registro activo/inactivo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Fecha de modificación',
    deleted_at TIMESTAMP NULL DEFAULT NULL COMMENT 'Soft delete',
    created_by INT COMMENT 'Usuario que creó',
    updated_by INT COMMENT 'Usuario que modificó',
    deleted_by INT COMMENT 'Usuario que eliminó',
    
    FOREIGN KEY (estudiante_id) REFERENCES estudiantes(id) ON DELETE SET NULL,
    FOREIGN KEY (carrera_id) REFERENCES carreras(id) ON DELETE SET NULL,
    FOREIGN KEY (gestion_id) REFERENCES gestiones(id) ON DELETE SET NULL,
    FOREIGN KEY (turno_curso_id) REFERENCES turnos_cursos(id) ON DELETE SET NULL,
    FOREIGN KEY (decidido_por) REFERENCES usuarios(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES usuarios(id) ON DELETE SET NULL,
    FOREIGN KEY (updated_by) REFERENCES usuarios(id) ON DELETE SET NULL,
    FOREIGN KEY (deleted_by) REFERENCES usuarios(id) ON DELETE SET NULL,
    
    INDEX idx_estudiante_id (estudiante_id) COMMENT 'Búsqueda por estudiante',
    INDEX idx_estado (estado) COMMENT 'Filtrado por estado',
    INDEX idx_fecha_solicitud (fecha_solicitud) COMMENT 'Búsqueda por fecha',
    INDEX idx_gestion_id (gestion_id) COMMENT 'Búsqueda por gestión',
    INDEX idx_activo (activo) COMMENT 'Filtrado por estado activo',
    INDEX idx_deleted_at (deleted_at) COMMENT 'Filtrado de soft delete',
    INDEX idx_estudiante_estado (estudiante_id, estado, activo, deleted_at) COMMENT 'Búsqueda de licencias por estudiante y estado',
    INDEX idx_gestion_estado (gestion_id, estado, activo, deleted_at) COMMENT 'Búsqueda de licencias por gestión y estado',
    INDEX idx_carrera_gestion (carrera_id, gestion_id, estado, activo) COMMENT 'Búsqueda por carrera y gestión',
    INDEX idx_turno_curso_id (turno_curso_id) COMMENT 'Búsqueda por turno/curso',
    INDEX idx_motivo (motivo, estado, activo) COMMENT 'Búsqueda por motivo y estado',
    INDEX idx_fechas (fecha_desde, fecha_hasta) COMMENT 'Búsqueda por rango de fechas',
    INDEX idx_fecha_decision (fecha_decision, estado) COMMENT 'Búsqueda por fecha de decisión',
    INDEX idx_fechas_entrega (fecha_inicio_entrega_documentos, fecha_fin_entrega_documentos) COMMENT 'Búsqueda por rango de fechas de entrega de documentos',
    
    CHECK (fecha_hasta >= fecha_desde),
    CHECK (total_dias > 0 AND total_dias <= 15)
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Solicitudes de licencias estudiantiles (máx 15 días/gestión). Requiere documentación de respaldo según motivo (enfermedad, trabajo, familiar, etc.). Los documentos se gestionan en documentos_estudiante con tipo_referencia=licencias_solicitudes. Los motivos indican permiso para modificación de horarios de clases por choque con actividades.';

-- ============================================
-- TABLA: estudiantes_apoderados
-- ============================================

DROP TABLE IF EXISTS estudiantes_apoderados;

CREATE TABLE estudiantes_apoderados (
    id INT AUTO_INCREMENT PRIMARY KEY,
    estudiante_id INT NOT NULL COMMENT 'Estudiante',
    tipo_parentesco_id INT NOT NULL COMMENT 'Tipo de parentesco (padre, madre, abuelo, tío, tutor, apoderado, orfanato, etc.)',
    
    -- Datos personales básicos
    nombres VARCHAR(150) NOT NULL COMMENT 'Nombres completos del apoderado/tutor',
    apellidos VARCHAR(150) COMMENT 'Apellidos del apoderado/tutor',
    ci VARCHAR(20) COMMENT 'Cédula de identidad',
    
    -- Datos laborales
    ocupacion VARCHAR(100) COMMENT 'Ocupación',
    lugar_trabajo VARCHAR(200) COMMENT 'Lugar de trabajo',
    
    -- Datos de contacto
    direccion TEXT COMMENT 'Dirección de domicilio',
    telefono VARCHAR(20) COMMENT 'Teléfono',
    celular VARCHAR(20) COMMENT 'Celular',
    email VARCHAR(150) COMMENT 'Email',
    
    -- Relación con el estudiante
    es_contacto_emergencia BOOLEAN DEFAULT TRUE COMMENT 'Es contacto de emergencia',
    es_apoderado_legal BOOLEAN DEFAULT FALSE COMMENT 'Es apoderado legal del estudiante',
    vive_con_estudiante BOOLEAN DEFAULT FALSE COMMENT 'Vive con el estudiante',
    
    -- Observaciones
    observaciones TEXT COMMENT 'Observaciones',
    
    -- Campos de auditoría y control (ESTÁNDAR)
    activo BOOLEAN DEFAULT TRUE COMMENT 'Registro activo/inactivo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Fecha de modificación',
    deleted_at TIMESTAMP NULL DEFAULT NULL COMMENT 'Soft delete',
    created_by INT COMMENT 'Usuario que creó',
    updated_by INT COMMENT 'Usuario que modificó',
    deleted_by INT COMMENT 'Usuario que eliminó',
    
    FOREIGN KEY (estudiante_id) REFERENCES estudiantes(id) ON DELETE SET NULL,
    FOREIGN KEY (tipo_parentesco_id) REFERENCES tipos_parentesco(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES usuarios(id) ON DELETE SET NULL,
    FOREIGN KEY (updated_by) REFERENCES usuarios(id) ON DELETE SET NULL,
    FOREIGN KEY (deleted_by) REFERENCES usuarios(id) ON DELETE SET NULL,
    
    INDEX idx_estudiante_id (estudiante_id) COMMENT 'Búsqueda por estudiante',
    INDEX idx_tipo_parentesco_id (tipo_parentesco_id) COMMENT 'Búsqueda por tipo de parentesco',
    INDEX idx_activo (activo) COMMENT 'Filtrado por estado activo',
    INDEX idx_deleted_at (deleted_at) COMMENT 'Filtrado de soft delete',
    INDEX idx_contacto_emergencia (es_contacto_emergencia, activo) COMMENT 'Búsqueda de contactos de emergencia',
    INDEX idx_apoderado_legal (es_apoderado_legal, activo) COMMENT 'Búsqueda de apoderados legales',
    INDEX idx_vive_con (vive_con_estudiante, activo) COMMENT 'Búsqueda por quienes viven con el estudiante'
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Apoderados, tutores y referencias familiares de estudiantes. Relación 1 a muchos (un estudiante puede tener múltiples apoderados/tutores). Contempla casos de huérfanos, orfanatos, tíos, abuelos, hermanos mayores, etc.';

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- FIN DEL SCRIPT
-- ============================================