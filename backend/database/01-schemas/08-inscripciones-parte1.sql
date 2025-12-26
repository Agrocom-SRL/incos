-- ============================================
-- MÓDULO DE INSCRIPCIONES - PARTE 1
-- Sistema de Gestión Académica - Instituto INCOS
-- 1 Tabla: inscripciones
-- ============================================
-- 
-- IMPORTANTE: Esta tabla registra la inscripción de un estudiante
-- a una gestión académica específica.
-- 
-- FLUJO COMPLETO (PASOS PREVIOS A LA INSCRIPCIÓN):
-- 1. REGISTRO DEL ESTUDIANTE: El estudiante nuevo se registra en el sistema
-- 2. DATOS PERSONALES: Rellena sus datos personales completos
-- 3. DOCUMENTACIÓN: Sube toda su documentación de registro (en documentos_estudiante)
-- 4. PAGO DE MATRÍCULA: Realiza el pago de la cuota anual (en pagos_aranceles)
-- 5. VALIDACIÓN: El sistema valida que documentos y pago estén completos
--
-- INSCRIPCIÓN DE MATERIAS (ESTE MÓDULO):
-- Una vez que el estudiante está registrado, con documentos y pago completos,
-- puede inscribirse a materias de la gestión en curso.
--
-- PROCESO DE INSCRIPCIÓN:
-- 
-- ESTUDIANTES NUEVOS (tipo_inscripcion = NUEVO):
-- - Se inscriben por BLOQUES: todas las materias del PRIMER PERIODO de su carrera
-- - No pueden elegir materias individuales (deben llevar todo el bloque)
-- - La carrera viene de estudiantes_datos_academicos (donde se registró inicialmente)
--
-- ESTUDIANTES CONTINUIDAD/REINGRESO:
-- - Pueden elegir materias individuales del plan de estudios de su carrera
-- - Cada materia tiene cursos disponibles (paralelos) con docente y horario
-- - El estudiante se inscribe a cursos específicos (paralelos) de las materias elegidas
-- - El sistema valida:
--    - Que no haya choques de horario entre los cursos elegidos
--    - Que no tenga nivelaciones pendientes (bloquea inscripción)
--    - Que cumpla prerrequisitos de las materias
-- 5. Si todo es válido, se registra la inscripción
-- 6. Si hay problemas (choques, nivelaciones, prerrequisitos), NO se registra
--
-- IMPORTANTE: No hay estados como BORRADOR, PENDIENTE, RECHAZADA, ANULADA.
-- Si el estudiante no puede inscribirse (choques, nivelaciones, etc.),
-- simplemente NO se registra la inscripción. Solo se registra si es válida.
--
-- ESTRUCTURA ACADÉMICA:
-- - Cada carrera tiene un plan de estudios dividido en 3 periodos por año
-- - Para terminar la carrera son 3 años (9 periodos totales)
-- - Cada materia en el plan de estudios pertenece a un periodo específico
-- - En cada gestión se ofertan cursos (paralelos) de las materias
-- - Cada curso tiene: materia, docente, horario (turno), cupos
--
-- TIPOS DE INSCRIPCIÓN:
-- - NUEVO: Estudiante nuevo (primera vez en el instituto)
-- - REINGRESO: Estudiante que regresa después de un periodo sin inscribirse
-- - CONTINUIDAD: Estudiante que continúa de la gestión anterior
-- - TRANSFERENCIA_ENTRADA: Estudiante que viene de otra institución (ver transferencias)
-- - TRASPASO_ENTRADA: Estudiante que viene de otra sede (ver traspasos)
-- 
-- RELACIÓN CON OTRAS TABLAS:
-- - inscripciones_materias: Materias específicas (cursos/paralelos) inscritas
-- - estudiantes: Estudiante que se inscribe (ya registrado con documentos y pago)
-- - estudiantes_datos_academicos: Contiene la carrera del estudiante (NO se repite aquí)
-- - gestiones: Gestión académica en curso
-- - plan_estudios: Define qué materias pertenecen a cada periodo de cada carrera
-- - asignaciones_docentes: Cursos disponibles (paralelos) ofertados en la gestión
-- - turnos_cursos: Horarios de los cursos (para validar choques)
-- - transferencias: Si es transferencia entrada, referencia a transferencias
-- - traspasos: Si es traspaso entrada, referencia a traspasos
-- ============================================

USE instituto_incos;

-- ============================================
-- FASE 1: ELIMINACIÓN DE TABLAS
-- Deshabilitamos foreign key checks para poder eliminar en cualquier orden
-- ============================================

SET FOREIGN_KEY_CHECKS = 0;

-- Eliminar todas las tablas (orden no importa con foreign key checks deshabilitado)
DROP TABLE IF EXISTS inscripciones;

-- ============================================
-- FASE 2: CREACIÓN DE TABLAS
-- Las foreign key checks siguen deshabilitadas durante la creación
-- ============================================

-- ============================================
-- TABLA: inscripciones
-- ============================================
-- Registra la inscripción de un estudiante a una gestión académica.
-- El estudiante ya debe estar registrado, con documentos y pago completos.
--
-- IMPORTANTE: Esta tabla NO tiene estados como BORRADOR, PENDIENTE, RECHAZADA, ANULADA.
-- Si el estudiante no puede inscribirse (choques de horario, nivelaciones pendientes,
-- prerrequisitos no cumplidos), simplemente NO se registra la inscripción.
-- Solo se registra si es válida y puede cursar las materias.
--
-- VALIDACIONES IMPORTANTES:
-- - Un estudiante puede tener múltiples inscripciones en diferentes gestiones
-- - Un estudiante puede tener solo UNA inscripción por gestión
-- - El estudiante debe estar registrado, con documentos y pago completos
-- - La carrera del estudiante viene de estudiantes_datos_academicos (NO se repite aquí)
-- - REGLA CRÍTICA: Si tiene nivelaciones pendientes, NO puede inscribirse
--   hasta que apruebe todas sus nivelaciones (ver bloqueos_inscripcion)
-- - Los choques de horario se validan antes de registrar (si hay choque, no se registra)
-- - Los prerrequisitos se validan antes de registrar (si no cumple, no se registra)
--
-- NOTA: El periodo NO se elige directamente. El periodo viene del plan de estudios
-- de la materia. Cada materia en inscripciones_materias pertenece a un periodo
-- según el plan de estudios de la carrera del estudiante (en estudiantes_datos_academicos).
-- ============================================

CREATE TABLE inscripciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    estudiante_id INT NOT NULL COMMENT 'Estudiante inscrito (referencia a estudiantes). Debe estar registrado con documentos y pago completos. La carrera viene de estudiantes_datos_academicos.',
    gestion_id INT NOT NULL COMMENT 'Gestión académica (año lectivo) en la que se inscribe (referencia a gestiones)',
    tipo_inscripcion ENUM('NUEVO', 'REINGRESO', 'CONTINUIDAD', 'TRANSFERENCIA_ENTRADA', 'TRASPASO_ENTRADA') DEFAULT 'CONTINUIDAD' COMMENT 'Tipo de inscripción: NUEVO (primera vez, se inscribe por bloques - todas las materias del periodo 1), REINGRESO (regresa después de ausencia), CONTINUIDAD (continúa de gestión anterior, puede elegir materias individuales), TRANSFERENCIA_ENTRADA (viene de otra institución), TRASPASO_ENTRADA (viene de otra sede)',
    fecha_inscripcion DATE NOT NULL DEFAULT (CURDATE()) COMMENT 'Fecha en que se realizó la inscripción',
    
    -- Relaciones con transferencias y traspasos
    transferencia_id INT COMMENT 'Si tipo_inscripcion = TRANSFERENCIA_ENTRADA, referencia a transferencias',
    traspaso_id INT COMMENT 'Si tipo_inscripcion = TRASPASO_ENTRADA, referencia a traspasos',
    
    -- Resumen de la inscripción (se actualiza automáticamente)
    numero_materias INT DEFAULT 0 COMMENT 'Cantidad de materias inscritas (se actualiza automáticamente al agregar/eliminar materias en inscripciones_materias)',
    carga_horaria_total INT DEFAULT 0 COMMENT 'Carga horaria total de todas las materias inscritas (se actualiza automáticamente)',
    
    observaciones TEXT COMMENT 'Observaciones generales sobre la inscripción',
    
    -- Campos de auditoría y control (ESTÁNDAR)
    activo BOOLEAN DEFAULT TRUE COMMENT 'Registro activo/inactivo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Fecha de modificación',
    deleted_at TIMESTAMP NULL DEFAULT NULL COMMENT 'Soft delete',
    created_by INT COMMENT 'Usuario que creó',
    updated_by INT COMMENT 'Usuario que modificó',
    deleted_by INT COMMENT 'Usuario que eliminó',
    
    FOREIGN KEY (estudiante_id) REFERENCES estudiantes(id) ON DELETE SET NULL,
    FOREIGN KEY (gestion_id) REFERENCES gestiones(id) ON DELETE SET NULL,
    -- NOTA: La carrera NO está aquí porque viene de estudiantes_datos_academicos
    -- NOTA: transferencia_id y traspaso_id NO tienen foreign key porque las tablas se crean después (parte3 y parte4)
    -- La validación de integridad se hace a nivel de aplicación
    FOREIGN KEY (created_by) REFERENCES usuarios(id) ON DELETE SET NULL,
    FOREIGN KEY (updated_by) REFERENCES usuarios(id) ON DELETE SET NULL,
    FOREIGN KEY (deleted_by) REFERENCES usuarios(id) ON DELETE SET NULL,
    
    INDEX idx_estudiante_id (estudiante_id) COMMENT 'Búsqueda por estudiante',
    INDEX idx_gestion_id (gestion_id) COMMENT 'Búsqueda por gestión',
    INDEX idx_tipo_inscripcion (tipo_inscripcion) COMMENT 'Filtrado por tipo de inscripción',
    INDEX idx_fecha_inscripcion (fecha_inscripcion) COMMENT 'Búsqueda por fecha',
    INDEX idx_activo (activo) COMMENT 'Filtrado por estado activo',
    INDEX idx_deleted_at (deleted_at) COMMENT 'Filtrado de soft delete',
    INDEX idx_estudiante_gestion (estudiante_id, gestion_id, activo, deleted_at) COMMENT 'Búsqueda de inscripciones por estudiante y gestión (único por gestión)',
    INDEX idx_gestion_activo (gestion_id, activo, deleted_at) COMMENT 'Búsqueda de inscripciones por gestión',
    INDEX idx_tipo_activo (tipo_inscripcion, activo, deleted_at) COMMENT 'Búsqueda por tipo de inscripción',
    INDEX idx_transferencia_id (transferencia_id) COMMENT 'Búsqueda por transferencia',
    INDEX idx_traspaso_id (traspaso_id) COMMENT 'Búsqueda por traspaso',
    
    -- Constraint: Un estudiante solo puede tener UNA inscripción activa por gestión
    UNIQUE KEY unique_estudiante_gestion_activo (estudiante_id, gestion_id, activo, deleted_at)
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Inscripciones de estudiantes a una gestión académica. El estudiante ya debe estar registrado con documentos y pago completos. La carrera viene de estudiantes_datos_academicos (NO se repite aquí). Registra qué materias (cursos/paralelos) va a cursar en la gestión. Los estudiantes NUEVOS se inscriben por bloques (todas las materias del periodo 1). Los estudiantes CONTINUIDAD/REINGRESO pueden elegir materias individuales. El periodo de cada materia viene del plan de estudios, no se elige directamente. Si hay choques de horario, nivelaciones pendientes o prerrequisitos no cumplidos, NO se registra la inscripción.';

-- ============================================
-- FASE 3: REHABILITAR FOREIGN KEY CHECKS
-- ============================================

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- FIN DEL SCRIPT
-- ============================================
