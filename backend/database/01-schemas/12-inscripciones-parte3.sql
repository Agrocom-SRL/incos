-- ============================================
-- MÓDULO DE INSCRIPCIONES - PARTE 3
-- Sistema de Gestión Académica - Instituto INCOS
-- 2 Tablas: transferencias, transferencias_materias
-- ============================================
--
-- Esta parte contiene las tablas relacionadas con TRANSFERENCIAS:
-- Proceso mediante el cual un estudiante se transfiere desde otra institución
-- educativa (diferente al Instituto INCOS) al Instituto INCOS, o viceversa.
--
-- DIFERENCIA ENTRE TRANSFERENCIA Y TRASPASO:
-- - TRANSFERENCIA: Entre instituciones DIFERENTES (ej: de otro instituto a INCOS, o de INCOS a otro instituto)
-- - TRASPASO: Dentro de la MISMA institución pero diferente sede/ciudad (ver parte 4)
--
-- FLUJO DE TRANSFERENCIA (ENTRADA - desde otra institución):
-- 1. Se crea una solicitud de transferencia (estado PENDIENTE)
-- 2. Se validan documentos (certificados, notas, etc.)
-- 3. Se convalidan las materias aprobadas (transferencias_materias)
-- 4. Se aprueba la transferencia (estado APROBADA)
-- 5. Se crea una inscripción normal para el estudiante
--
-- FLUJO DE TRANSFERENCIA (SALIDA - hacia otra institución):
-- 1. Se crea una solicitud de transferencia (estado PENDIENTE)
-- 2. Se generan documentos de transferencia (certificados, notas)
-- 3. Se aprueba la transferencia (estado APROBADA)
-- 4. El estudiante puede retirarse del instituto
--
-- RELACIÓN CON OTRAS TABLAS:
-- - estudiantes: Estudiante que se transfiere
-- - carreras: Carrera de origen/destino
-- - gestiones: Gestión en la que se realiza la transferencia
-- - materias: Materias convalidadas
-- - inscripciones: Inscripción creada después de aprobar transferencia (entrada)
-- - documentos_estudiante: Documentos de transferencia (tipo_referencia='TRANSFERENCIA')
-- ============================================

USE instituto_incos;

-- ============================================
-- FASE 1: ELIMINACIÓN DE TABLAS
-- Deshabilitamos foreign key checks para poder eliminar en cualquier orden
-- ============================================

SET FOREIGN_KEY_CHECKS = 0;

-- Eliminar todas las tablas (orden no importa con foreign key checks deshabilitado)
DROP TABLE IF EXISTS transferencias_materias;
DROP TABLE IF EXISTS transferencias;

-- ============================================
-- FASE 2: CREACIÓN DE TABLAS
-- Las foreign key checks siguen deshabilitadas durante la creación
-- ============================================

-- ============================================
-- TABLA: transferencias
-- ============================================
-- Registra las solicitudes de transferencia de estudiantes
-- entre el Instituto INCOS y otras instituciones educativas.
--
-- TIPOS DE TRANSFERENCIA:
-- - ENTRADA: Estudiante viene de otra institución al INCOS
-- - SALIDA: Estudiante se va del INCOS a otra institución
--
-- ESTADOS:
-- - PENDIENTE: Solicitud pendiente de revisión
-- - EN_REVISION: En proceso de revisión de documentos
-- - CONVALIDACION_PENDIENTE: Esperando convalidación de materias
-- - APROBADA: Transferencia aprobada
-- - RECHAZADA: Transferencia rechazada
-- - CANCELADA: Transferencia cancelada por el solicitante
--
-- CAMPOS IMPORTANTES:
-- - instituto_origen/destino: Nombre de la institución de origen/destino
-- - carrera_origen/destino: Carrera en la institución de origen/destino
-- - gestion_origen/destino: Gestión en la que estaba/estará el estudiante
-- - periodo_origen/destino: Periodo que cursaba/cursará
-- - fecha_solicitud: Fecha en que se solicitó la transferencia
-- - fecha_aprobacion: Fecha en que se aprobó la transferencia
-- - motivo: Motivo de la transferencia
--
-- VALIDACIONES:
-- - Si tipo = ENTRADA: instituto_origen, carrera_origen, gestion_origen, periodo_origen son obligatorios
-- - Si tipo = SALIDA: instituto_destino, carrera_destino, gestion_destino, periodo_destino son obligatorios
-- - Los documentos se validan en documentos_estudiante con tipo_referencia='TRANSFERENCIA'
-- ============================================

CREATE TABLE transferencias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    estudiante_id INT NOT NULL COMMENT 'Estudiante que solicita la transferencia (referencia a estudiantes)',
    tipo ENUM('ENTRADA', 'SALIDA') NOT NULL COMMENT 'Tipo de transferencia: ENTRADA (viene de otra institución), SALIDA (va a otra institución)',
    estado ENUM('PENDIENTE', 'EN_REVISION', 'CONVALIDACION_PENDIENTE', 'APROBADA', 'RECHAZADA', 'CANCELADA') DEFAULT 'PENDIENTE' COMMENT 'Estado de la transferencia',
    
    -- Información de la institución de origen (para ENTRADA)
    instituto_origen VARCHAR(200) COMMENT 'Nombre de la institución de origen (si tipo = ENTRADA)',
    carrera_origen_id INT COMMENT 'Carrera en la institución de origen (si tipo = ENTRADA, referencia a carreras)',
    gestion_origen_id INT COMMENT 'Gestión en la que estaba en la institución de origen (si tipo = ENTRADA, referencia a gestiones)',
    periodo_origen_id INT COMMENT 'Periodo que cursaba en la institución de origen (si tipo = ENTRADA, referencia a periodos)',
    
    -- Información de la institución de destino (para SALIDA)
    instituto_destino VARCHAR(200) COMMENT 'Nombre de la institución de destino (si tipo = SALIDA)',
    carrera_destino_id INT COMMENT 'Carrera en la institución de destino (si tipo = SALIDA, referencia a carreras)',
    gestion_destino_id INT COMMENT 'Gestión en la que estará en la institución de destino (si tipo = SALIDA, referencia a gestiones)',
    periodo_destino_id INT COMMENT 'Periodo que cursará en la institución de destino (si tipo = SALIDA, referencia a periodos)',
    
    -- Información de la institución INCOS (según el tipo)
    carrera_incos_id INT COMMENT 'Carrera en el INCOS (referencia a carreras)',
    gestion_incos_id INT COMMENT 'Gestión en el INCOS (referencia a gestiones)',
    periodo_incos_id INT COMMENT 'Periodo en el INCOS (referencia a periodos)',
    
    -- Fechas y aprobación
    fecha_solicitud DATE NOT NULL DEFAULT (CURDATE()) COMMENT 'Fecha de solicitud de transferencia',
    fecha_aprobacion DATE COMMENT 'Fecha de aprobación de la transferencia',
    aprobada_por INT COMMENT 'Usuario que aprobó la transferencia (referencia a usuarios)',
    motivo TEXT NOT NULL COMMENT 'Motivo de la transferencia',
    motivo_rechazo TEXT COMMENT 'Motivo de rechazo (si estado = RECHAZADA)',
    
    -- Información adicional
    observaciones TEXT COMMENT 'Observaciones generales',
    observaciones_convalidacion TEXT COMMENT 'Observaciones sobre la convalidación de materias',
    
    -- Relación con inscripción (si es ENTRADA y se aprueba, se crea una inscripción)
    inscripcion_id INT COMMENT 'Inscripción creada después de aprobar la transferencia (si tipo = ENTRADA, referencia a inscripciones)',
    
    -- Campos de auditoría y control (ESTÁNDAR)
    activo BOOLEAN DEFAULT TRUE COMMENT 'Registro activo/inactivo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Fecha de modificación',
    deleted_at TIMESTAMP NULL DEFAULT NULL COMMENT 'Soft delete',
    created_by INT COMMENT 'Usuario que creó',
    updated_by INT COMMENT 'Usuario que modificó',
    deleted_by INT COMMENT 'Usuario que eliminó',
    
    FOREIGN KEY (estudiante_id) REFERENCES estudiantes(id) ON DELETE SET NULL,
    FOREIGN KEY (carrera_origen_id) REFERENCES carreras(id) ON DELETE SET NULL,
    FOREIGN KEY (gestion_origen_id) REFERENCES gestiones(id) ON DELETE SET NULL,
    FOREIGN KEY (periodo_origen_id) REFERENCES periodos(id) ON DELETE SET NULL,
    FOREIGN KEY (carrera_destino_id) REFERENCES carreras(id) ON DELETE SET NULL,
    FOREIGN KEY (gestion_destino_id) REFERENCES gestiones(id) ON DELETE SET NULL,
    FOREIGN KEY (periodo_destino_id) REFERENCES periodos(id) ON DELETE SET NULL,
    FOREIGN KEY (carrera_incos_id) REFERENCES carreras(id) ON DELETE SET NULL,
    FOREIGN KEY (gestion_incos_id) REFERENCES gestiones(id) ON DELETE SET NULL,
    FOREIGN KEY (periodo_incos_id) REFERENCES periodos(id) ON DELETE SET NULL,
    FOREIGN KEY (inscripcion_id) REFERENCES inscripciones(id) ON DELETE SET NULL,
    
    INDEX idx_estudiante_id (estudiante_id) COMMENT 'Búsqueda por estudiante',
    INDEX idx_tipo (tipo) COMMENT 'Filtrado por tipo',
    INDEX idx_estado (estado) COMMENT 'Filtrado por estado',
    INDEX idx_fecha_solicitud (fecha_solicitud) COMMENT 'Búsqueda por fecha de solicitud',
    INDEX idx_gestion_incos_id (gestion_incos_id) COMMENT 'Búsqueda por gestión INCOS',
    INDEX idx_activo (activo) COMMENT 'Filtrado por estado activo',
    INDEX idx_deleted_at (deleted_at) COMMENT 'Filtrado de soft delete',
    INDEX idx_estudiante_tipo (estudiante_id, tipo, activo, deleted_at) COMMENT 'Búsqueda por estudiante y tipo',
    INDEX idx_estado_tipo (estado, tipo, activo, deleted_at) COMMENT 'Búsqueda por estado y tipo',
    INDEX idx_gestion_estado (gestion_incos_id, estado, activo, deleted_at) COMMENT 'Búsqueda por gestión y estado',
    INDEX idx_inscripcion_id (inscripcion_id) COMMENT 'Búsqueda por inscripción relacionada'
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Solicitudes de transferencia de estudiantes entre el Instituto INCOS y otras instituciones educativas. ENTRADA: estudiante viene de otra institución. SALIDA: estudiante va a otra institución.';

-- ============================================
-- TABLA: transferencias_materias
-- ============================================
-- Registra las materias convalidadas en una transferencia.
-- Se usa para mapear las materias aprobadas en la institución de origen
-- con las materias equivalentes en el INCOS (o viceversa).
--
-- FLUJO DE CONVALIDACIÓN:
-- 1. Se revisan las materias aprobadas en la institución de origen
-- 2. Se identifican las materias equivalentes en el INCOS
-- 3. Se crean registros en transferencias_materias
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
-- - materia_origen: Nombre de la materia en la institución de origen
-- - materia_incos_id: Materia equivalente en el INCOS
-- - nota_origen: Nota obtenida en la institución de origen
-- - nota_convalidada: Nota convalidada en el INCOS (puede ser diferente)
-- - observaciones: Observaciones sobre la convalidación
--
-- VALIDACIONES:
-- - Si transferencia.tipo = ENTRADA: materia_origen y nota_origen son obligatorios
-- - Si transferencia.tipo = SALIDA: materia_incos_id y nota_incos son obligatorios
-- - La nota debe estar entre 0 y 100
-- ============================================

CREATE TABLE transferencias_materias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    transferencia_id INT NOT NULL COMMENT 'Transferencia a la que pertenece (referencia a transferencias)',
    estado ENUM('PENDIENTE', 'APROBADA', 'RECHAZADA', 'PARCIAL') DEFAULT 'PENDIENTE' COMMENT 'Estado de la convalidación',
    
    -- Información de la materia de origen (para ENTRADA)
    materia_origen VARCHAR(200) COMMENT 'Nombre de la materia en la institución de origen',
    nota_origen DECIMAL(5,2) COMMENT 'Nota obtenida en la institución de origen (0-100)',
    carga_horaria_origen INT COMMENT 'Carga horaria de la materia en la institución de origen',
    
    -- Información de la materia en INCOS
    materia_incos_id INT COMMENT 'Materia equivalente en el INCOS (referencia a materias)',
    nota_convalidada DECIMAL(5,2) COMMENT 'Nota convalidada en el INCOS (0-100, puede ser diferente a nota_origen)',
    carga_horaria_incos INT COMMENT 'Carga horaria de la materia en el INCOS',
    
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
    
    FOREIGN KEY (transferencia_id) REFERENCES transferencias(id) ON DELETE SET NULL,
    FOREIGN KEY (materia_incos_id) REFERENCES materias(id) ON DELETE SET NULL,
    FOREIGN KEY (inscripcion_materia_id) REFERENCES inscripciones_materias(id) ON DELETE SET NULL,
    
    INDEX idx_transferencia_id (transferencia_id) COMMENT 'Búsqueda por transferencia',
    INDEX idx_materia_incos_id (materia_incos_id) COMMENT 'Búsqueda por materia INCOS',
    INDEX idx_estado (estado) COMMENT 'Filtrado por estado',
    INDEX idx_activo (activo) COMMENT 'Filtrado por estado activo',
    INDEX idx_deleted_at (deleted_at) COMMENT 'Filtrado de soft delete',
    INDEX idx_transferencia_estado (transferencia_id, estado, activo, deleted_at) COMMENT 'Búsqueda por transferencia y estado',
    INDEX idx_inscripcion_materia_id (inscripcion_materia_id) COMMENT 'Búsqueda por inscripción materia relacionada',
    
    CHECK (nota_origen IS NULL OR (nota_origen >= 0 AND nota_origen <= 100)),
    CHECK (nota_convalidada IS NULL OR (nota_convalidada >= 0 AND nota_convalidada <= 100))
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Materias convalidadas en transferencias. Mapea materias aprobadas en la institución de origen con materias equivalentes en el INCOS.';

-- ============================================
-- FASE 3: REHABILITAR FOREIGN KEY CHECKS
-- ============================================

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- FIN DEL SCRIPT
-- ============================================
