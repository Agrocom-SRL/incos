-- ============================================
-- MÓDULO DE INSCRIPCIONES - PARTE 4
-- Sistema de Gestión Académica - Instituto INCOS
-- 2 Tablas: traspasos, traspasos_materias
-- ============================================
--
-- Esta parte contiene las tablas relacionadas con TRASPASOS:
-- Proceso mediante el cual un estudiante se traslada de una sede/ciudad
-- a otra dentro de la MISMA institución (Instituto INCOS).
--
-- DIFERENCIA ENTRE TRASPASO Y TRANSFERENCIA:
-- - TRASPASO: Dentro de la MISMA institución pero diferente sede/ciudad
-- - TRANSFERENCIA: Entre instituciones DIFERENTES (ver parte 3)
--
-- FLUJO DE TRASPASO (ENTRADA - desde otra sede):
-- 1. Se crea una solicitud de traspaso (estado PENDIENTE)
-- 2. Se validan documentos (certificados, notas, etc.)
-- 3. Se convalidan las materias aprobadas (traspasos_materias)
-- 4. Se aprueba el traspaso (estado APROBADA)
-- 5. Se crea una inscripción normal para el estudiante en la nueva sede
--
-- FLUJO DE TRASPASO (SALIDA - hacia otra sede):
-- 1. Se crea una solicitud de traspaso (estado PENDIENTE)
-- 2. Se generan documentos de traspaso (certificados, notas)
-- 3. Se aprueba el traspaso (estado APROBADA)
-- 4. El estudiante puede trasladarse a la nueva sede
--
-- RELACIÓN CON OTRAS TABLAS:
-- - estudiantes: Estudiante que se traspasa
-- - carreras: Carrera (generalmente la misma, pero puede cambiar)
-- - gestiones: Gestión en la que se realiza el traspaso
-- - materias: Materias convalidadas
-- - inscripciones: Inscripción creada después de aprobar traspaso (entrada)
-- - documentos_estudiante: Documentos de traspaso (tipo_referencia='TRASPASO')
-- - municipios: Sede de origen/destino (ciudad)
-- ============================================

USE instituto_incos;

-- ============================================
-- FASE 1: ELIMINACIÓN DE TABLAS
-- Deshabilitamos foreign key checks para poder eliminar en cualquier orden
-- ============================================

SET FOREIGN_KEY_CHECKS = 0;

-- Eliminar todas las tablas (orden no importa con foreign key checks deshabilitado)
DROP TABLE IF EXISTS traspasos_materias;
DROP TABLE IF EXISTS traspasos;

-- ============================================
-- FASE 2: CREACIÓN DE TABLAS
-- Las foreign key checks siguen deshabilitadas durante la creación
-- ============================================

-- ============================================
-- TABLA: traspasos
-- ============================================
-- Registra las solicitudes de traspaso de estudiantes
-- entre diferentes sedes/ciudades del Instituto INCOS.
--
-- TIPOS DE TRASPASO:
-- - ENTRADA: Estudiante viene de otra sede al INCOS (sede actual)
-- - SALIDA: Estudiante se va de la sede actual a otra sede
--
-- ESTADOS:
-- - PENDIENTE: Solicitud pendiente de revisión
-- - EN_REVISION: En proceso de revisión de documentos
-- - CONVALIDACION_PENDIENTE: Esperando convalidación de materias
-- - APROBADA: Traspaso aprobado
-- - RECHAZADA: Traspaso rechazado
-- - CANCELADA: Traspaso cancelado por el solicitante
--
-- CAMPOS IMPORTANTES:
-- - sede_origen/destino: Sede/ciudad de origen/destino (municipio)
-- - carrera_origen/destino: Carrera en la sede de origen/destino (puede ser la misma)
-- - gestion_origen/destino: Gestión en la que estaba/estará el estudiante
-- - periodo_origen/destino: Periodo que cursaba/cursará
-- - fecha_solicitud: Fecha en que se solicitó el traspaso
-- - fecha_aprobacion: Fecha en que se aprobó el traspaso
-- - motivo: Motivo del traspaso
--
-- VALIDACIONES:
-- - Si tipo = ENTRADA: sede_origen, carrera_origen, gestion_origen, periodo_origen son obligatorios
-- - Si tipo = SALIDA: sede_destino, carrera_destino, gestion_destino, periodo_destino son obligatorios
-- - Los documentos se validan en documentos_estudiante con tipo_referencia='TRASPASO'
-- - La sede_origen y sede_destino deben ser diferentes
-- ============================================

CREATE TABLE traspasos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    estudiante_id INT NOT NULL COMMENT 'Estudiante que solicita el traspaso (referencia a estudiantes)',
    tipo ENUM('ENTRADA', 'SALIDA') NOT NULL COMMENT 'Tipo de traspaso: ENTRADA (viene de otra sede), SALIDA (va a otra sede)',
    estado ENUM('PENDIENTE', 'EN_REVISION', 'CONVALIDACION_PENDIENTE', 'APROBADA', 'RECHAZADA', 'CANCELADA') DEFAULT 'PENDIENTE' COMMENT 'Estado del traspaso',
    
    -- Información de la sede de origen (para ENTRADA)
    sede_origen_id INT COMMENT 'Sede/ciudad de origen (si tipo = ENTRADA, referencia a municipios)',
    carrera_origen_id INT COMMENT 'Carrera en la sede de origen (si tipo = ENTRADA, referencia a carreras)',
    gestion_origen_id INT COMMENT 'Gestión en la que estaba en la sede de origen (si tipo = ENTRADA, referencia a gestiones)',
    periodo_origen_id INT COMMENT 'Periodo que cursaba en la sede de origen (si tipo = ENTRADA, referencia a periodos)',
    
    -- Información de la sede de destino (para SALIDA)
    sede_destino_id INT COMMENT 'Sede/ciudad de destino (si tipo = SALIDA, referencia a municipios)',
    carrera_destino_id INT COMMENT 'Carrera en la sede de destino (si tipo = SALIDA, referencia a carreras)',
    gestion_destino_id INT COMMENT 'Gestión en la que estará en la sede de destino (si tipo = SALIDA, referencia a gestiones)',
    periodo_destino_id INT COMMENT 'Periodo que cursará en la sede de destino (si tipo = SALIDA, referencia a periodos)',
    
    -- Información de la sede actual (según el tipo)
    sede_actual_id INT COMMENT 'Sede actual del estudiante (referencia a municipios)',
    carrera_actual_id INT COMMENT 'Carrera en la sede actual (referencia a carreras)',
    gestion_actual_id INT COMMENT 'Gestión en la sede actual (referencia a gestiones)',
    periodo_actual_id INT COMMENT 'Periodo en la sede actual (referencia a periodos)',
    
    -- Fechas y aprobación
    fecha_solicitud DATE NOT NULL DEFAULT (CURDATE()) COMMENT 'Fecha de solicitud de traspaso',
    fecha_aprobacion DATE COMMENT 'Fecha de aprobación del traspaso',
    aprobada_por INT COMMENT 'Usuario que aprobó el traspaso (referencia a usuarios)',
    motivo TEXT NOT NULL COMMENT 'Motivo del traspaso',
    motivo_rechazo TEXT COMMENT 'Motivo de rechazo (si estado = RECHAZADA)',
    
    -- Información adicional
    observaciones TEXT COMMENT 'Observaciones generales',
    observaciones_convalidacion TEXT COMMENT 'Observaciones sobre la convalidación de materias',
    
    -- Relación con inscripción (si es ENTRADA y se aprueba, se crea una inscripción)
    inscripcion_id INT COMMENT 'Inscripción creada después de aprobar el traspaso (si tipo = ENTRADA, referencia a inscripciones)',
    
    -- Campos de auditoría y control (ESTÁNDAR)
    activo BOOLEAN DEFAULT TRUE COMMENT 'Registro activo/inactivo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Fecha de modificación',
    deleted_at TIMESTAMP NULL DEFAULT NULL COMMENT 'Soft delete',
    created_by INT COMMENT 'Usuario que creó',
    updated_by INT COMMENT 'Usuario que modificó',
    deleted_by INT COMMENT 'Usuario que eliminó',
    
    FOREIGN KEY (estudiante_id) REFERENCES estudiantes(id) ON DELETE SET NULL,
    FOREIGN KEY (sede_origen_id) REFERENCES municipios(id) ON DELETE SET NULL,
    FOREIGN KEY (carrera_origen_id) REFERENCES carreras(id) ON DELETE SET NULL,
    FOREIGN KEY (gestion_origen_id) REFERENCES gestiones(id) ON DELETE SET NULL,
    FOREIGN KEY (periodo_origen_id) REFERENCES periodos(id) ON DELETE SET NULL,
    FOREIGN KEY (sede_destino_id) REFERENCES municipios(id) ON DELETE SET NULL,
    FOREIGN KEY (carrera_destino_id) REFERENCES carreras(id) ON DELETE SET NULL,
    FOREIGN KEY (gestion_destino_id) REFERENCES gestiones(id) ON DELETE SET NULL,
    FOREIGN KEY (periodo_destino_id) REFERENCES periodos(id) ON DELETE SET NULL,
    FOREIGN KEY (sede_actual_id) REFERENCES municipios(id) ON DELETE SET NULL,
    FOREIGN KEY (carrera_actual_id) REFERENCES carreras(id) ON DELETE SET NULL,
    FOREIGN KEY (gestion_actual_id) REFERENCES gestiones(id) ON DELETE SET NULL,
    FOREIGN KEY (periodo_actual_id) REFERENCES periodos(id) ON DELETE SET NULL,
    FOREIGN KEY (inscripcion_id) REFERENCES inscripciones(id) ON DELETE SET NULL,
    FOREIGN KEY (aprobada_por) REFERENCES usuarios(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES usuarios(id) ON DELETE SET NULL,
    FOREIGN KEY (updated_by) REFERENCES usuarios(id) ON DELETE SET NULL,
    FOREIGN KEY (deleted_by) REFERENCES usuarios(id) ON DELETE SET NULL,
    
    INDEX idx_estudiante_id (estudiante_id) COMMENT 'Búsqueda por estudiante',
    INDEX idx_tipo (tipo) COMMENT 'Filtrado por tipo',
    INDEX idx_estado (estado) COMMENT 'Filtrado por estado',
    INDEX idx_fecha_solicitud (fecha_solicitud) COMMENT 'Búsqueda por fecha de solicitud',
    INDEX idx_sede_origen_id (sede_origen_id) COMMENT 'Búsqueda por sede de origen',
    INDEX idx_sede_destino_id (sede_destino_id) COMMENT 'Búsqueda por sede de destino',
    INDEX idx_sede_actual_id (sede_actual_id) COMMENT 'Búsqueda por sede actual',
    INDEX idx_gestion_actual_id (gestion_actual_id) COMMENT 'Búsqueda por gestión actual',
    INDEX idx_activo (activo) COMMENT 'Filtrado por estado activo',
    INDEX idx_deleted_at (deleted_at) COMMENT 'Filtrado de soft delete',
    INDEX idx_estudiante_tipo (estudiante_id, tipo, activo, deleted_at) COMMENT 'Búsqueda por estudiante y tipo',
    INDEX idx_estado_tipo (estado, tipo, activo, deleted_at) COMMENT 'Búsqueda por estado y tipo',
    INDEX idx_gestion_estado (gestion_actual_id, estado, activo, deleted_at) COMMENT 'Búsqueda por gestión y estado',
    INDEX idx_sede_origen_destino (sede_origen_id, sede_destino_id, activo, deleted_at) COMMENT 'Búsqueda por sedes',
    INDEX idx_inscripcion_id (inscripcion_id) COMMENT 'Búsqueda por inscripción relacionada'
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Solicitudes de traspaso de estudiantes entre diferentes sedes/ciudades del Instituto INCOS. ENTRADA: estudiante viene de otra sede. SALIDA: estudiante va a otra sede.';

-- ============================================
-- TABLA: traspasos_materias
-- ============================================
-- Registra las materias convalidadas en un traspaso.
-- Se usa para mapear las materias aprobadas en la sede de origen
-- con las materias equivalentes en la sede de destino.
--
-- FLUJO DE CONVALIDACIÓN:
-- 1. Se revisan las materias aprobadas en la sede de origen
-- 2. Se identifican las materias equivalentes en la sede de destino
-- 3. Se crean registros en traspasos_materias
-- 4. Se aprueban las convalidaciones
-- 5. Las materias aprobadas se registran como aprobadas en el historial del estudiante
--
-- ESTADOS:
-- - PENDIENTE: Materia pendiente de convalidación
-- - APROBADA: Convalidación aprobada
-- - RECHAZADA: Convalidación rechazada (no hay equivalencia)
-- - PARCIAL: Convalidación parcial (solo algunos contenidos son equivalentes)
--
-- CAMPOS IMPORTANTES:
-- - materia_origen: Nombre de la materia en la sede de origen
-- - materia_destino_id: Materia equivalente en la sede de destino
-- - nota_origen: Nota obtenida en la sede de origen
-- - nota_convalidada: Nota convalidada en la sede de destino (puede ser diferente)
-- - observaciones: Observaciones sobre la convalidación
--
-- VALIDACIONES:
-- - Si traspaso.tipo = ENTRADA: materia_origen y nota_origen son obligatorios
-- - Si traspaso.tipo = SALIDA: materia_destino_id y nota_destino son obligatorios
-- - La nota debe estar entre 0 y 100
-- - Generalmente las materias son las mismas (mismo plan de estudios), pero puede haber variaciones
-- ============================================

CREATE TABLE traspasos_materias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    traspaso_id INT NOT NULL COMMENT 'Traspaso al que pertenece (referencia a traspasos)',
    estado ENUM('PENDIENTE', 'APROBADA', 'RECHAZADA', 'PARCIAL') DEFAULT 'PENDIENTE' COMMENT 'Estado de la convalidación',
    
    -- Información de la materia de origen (para ENTRADA)
    materia_origen VARCHAR(200) COMMENT 'Nombre de la materia en la sede de origen',
    nota_origen DECIMAL(5,2) COMMENT 'Nota obtenida en la sede de origen (0-100)',
    carga_horaria_origen INT COMMENT 'Carga horaria de la materia en la sede de origen',
    
    -- Información de la materia en sede de destino
    materia_destino_id INT COMMENT 'Materia equivalente en la sede de destino (referencia a materias)',
    nota_convalidada DECIMAL(5,2) COMMENT 'Nota convalidada en la sede de destino (0-100, puede ser diferente a nota_origen)',
    carga_horaria_destino INT COMMENT 'Carga horaria de la materia en la sede de destino',
    
    -- Información de convalidación
    fecha_convalidacion DATE COMMENT 'Fecha de convalidación',
    convalidada_por INT COMMENT 'Usuario que convalidó (referencia a usuarios)',
    observaciones TEXT COMMENT 'Observaciones sobre la convalidación',
    motivo_rechazo TEXT COMMENT 'Motivo de rechazo (si estado = RECHAZADA)',
    
    -- Relación con inscripción_materia (si se aprueba y es ENTRADA, se crea un registro en inscripciones_materias)
    inscripcion_materia_id INT COMMENT 'Registro en inscripciones_materias creado después de aprobar (si tipo = ENTRADA, referencia a inscripciones_materias)',
    
    -- Campos de auditoría y control (ESTÁNDAR)
    activo BOOLEAN DEFAULT TRUE COMMENT 'Registro activo/inactivo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Fecha de modificación',
    deleted_at TIMESTAMP NULL DEFAULT NULL COMMENT 'Soft delete',
    created_by INT COMMENT 'Usuario que creó',
    updated_by INT COMMENT 'Usuario que modificó',
    deleted_by INT COMMENT 'Usuario que eliminó',
    
    FOREIGN KEY (traspaso_id) REFERENCES traspasos(id) ON DELETE SET NULL,
    FOREIGN KEY (materia_destino_id) REFERENCES materias(id) ON DELETE SET NULL,
    FOREIGN KEY (convalidada_por) REFERENCES usuarios(id) ON DELETE SET NULL,
    FOREIGN KEY (inscripcion_materia_id) REFERENCES inscripciones_materias(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES usuarios(id) ON DELETE SET NULL,
    FOREIGN KEY (updated_by) REFERENCES usuarios(id) ON DELETE SET NULL,
    FOREIGN KEY (deleted_by) REFERENCES usuarios(id) ON DELETE SET NULL,
    
    INDEX idx_traspaso_id (traspaso_id) COMMENT 'Búsqueda por traspaso',
    INDEX idx_materia_destino_id (materia_destino_id) COMMENT 'Búsqueda por materia destino',
    INDEX idx_estado (estado) COMMENT 'Filtrado por estado',
    INDEX idx_activo (activo) COMMENT 'Filtrado por estado activo',
    INDEX idx_deleted_at (deleted_at) COMMENT 'Filtrado de soft delete',
    INDEX idx_traspaso_estado (traspaso_id, estado, activo, deleted_at) COMMENT 'Búsqueda por traspaso y estado',
    INDEX idx_inscripcion_materia_id (inscripcion_materia_id) COMMENT 'Búsqueda por inscripción materia relacionada',
    
    CHECK (nota_origen IS NULL OR (nota_origen >= 0 AND nota_origen <= 100)),
    CHECK (nota_convalidada IS NULL OR (nota_convalidada >= 0 AND nota_convalidada <= 100))
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Materias convalidadas en traspasos. Mapea materias aprobadas en la sede de origen con materias equivalentes en la sede de destino.';

-- ============================================
-- FASE 3: REHABILITAR FOREIGN KEY CHECKS
-- ============================================

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- FIN DEL SCRIPT
-- ============================================
