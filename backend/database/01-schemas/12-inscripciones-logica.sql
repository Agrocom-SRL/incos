-- ============================================
-- MÓDULO DE INSCRIPCIONES - LÓGICA DE NEGOCIO
-- Sistema de Gestión Académica - Instituto INCOS
-- Triggers, Stored Procedures y Vistas
-- ============================================
--
-- IMPORTANTE: Este archivo contiene la lógica de negocio automatizada:
-- - Triggers para automatizar procesos
-- - Stored Procedures para operaciones complejas
-- - Vistas para consultas frecuentes
--
-- Este archivo debe ejecutarse DESPUÉS de crear todas las tablas
-- (después de ejecutar parte1, parte2, parte3, parte4 y parte5)
--
-- ORDEN DE EJECUCIÓN:
-- 1. 07-inscripciones-parte1.sql (tabla inscripciones)
-- 2. 07-inscripciones-parte2.sql (tablas inscripciones_materias, historial_nivelaciones)
-- 3. 07-inscripciones-parte3.sql (tablas transferencias, transferencias_materias)
-- 4. 07-inscripciones-parte4.sql (tablas traspasos, traspasos_materias)
-- 5. 07-inscripciones-parte5.sql (tabla bloqueos_inscripcion)
-- 6. 07-inscripciones-logica.sql (este archivo - triggers, procedures, vistas)
-- ============================================

USE instituto_incos;

-- ============================================
-- TRIGGERS
-- ============================================

DELIMITER $$

-- ============================================
-- TRIGGER: trg_inscripcion_materia_actualizar_estado
-- ============================================
-- Actualiza automáticamente el estado de la materia según la nota definitiva.
-- Si nota_definitiva >= 60: estado = APROBADO
-- Si nota_definitiva < 60: estado = REPROBADO
-- Solo se ejecuta si las notas no están cerradas.
-- ============================================

DROP TRIGGER IF EXISTS trg_inscripcion_materia_actualizar_estado$$

CREATE TRIGGER trg_inscripcion_materia_actualizar_estado
BEFORE UPDATE ON inscripciones_materias
FOR EACH ROW
BEGIN
    IF NEW.notas_cerradas = FALSE THEN
        IF NEW.nota_definitiva IS NOT NULL THEN
            IF NEW.nota_definitiva >= 60 THEN
                SET NEW.estado = 'APROBADO';
            ELSE
                SET NEW.estado = 'REPROBADO';
            END IF;
        END IF;
    END IF;
END$$

-- ============================================
-- TRIGGER: trg_actualizar_asistencia_porcentaje
-- ============================================
-- Calcula automáticamente el porcentaje de asistencia
-- cuando se actualizan asistencias, faltas o total_clases.
-- ============================================

DROP TRIGGER IF EXISTS trg_actualizar_asistencia_porcentaje$$

CREATE TRIGGER trg_actualizar_asistencia_porcentaje
BEFORE UPDATE ON inscripciones_materias
FOR EACH ROW
BEGIN
    IF NEW.total_clases > 0 THEN
        SET NEW.asistencia_porcentaje = (NEW.asistencias / NEW.total_clases) * 100;
    END IF;
END$$

-- ============================================
-- TRIGGER: trg_incrementar_numero_intento
-- ============================================
-- Incrementa automáticamente el numero_intento cuando un estudiante
-- se inscribe nuevamente en una materia que ya reprobó.
-- Busca el máximo intento previo y le suma 1.
-- ============================================

DROP TRIGGER IF EXISTS trg_incrementar_numero_intento$$

CREATE TRIGGER trg_incrementar_numero_intento
BEFORE INSERT ON inscripciones_materias
FOR EACH ROW
BEGIN
    DECLARE v_max_intento INT DEFAULT 1;
    DECLARE v_estudiante_id INT;
    
    -- Obtener estudiante_id de la inscripción
    SELECT estudiante_id INTO v_estudiante_id
    FROM inscripciones
    WHERE id = NEW.inscripcion_id;
    
    -- Buscar el máximo intento previo de esta materia por este estudiante
    SELECT COALESCE(MAX(im.numero_intento), 0) INTO v_max_intento
    FROM inscripciones_materias im
    INNER JOIN inscripciones i ON im.inscripcion_id = i.id
    WHERE i.estudiante_id = v_estudiante_id
    AND im.materia_id = NEW.materia_id
    AND im.activo = TRUE
    AND im.deleted_at IS NULL;
    
    -- Si no se especificó numero_intento, usar el siguiente
    IF NEW.numero_intento IS NULL OR NEW.numero_intento = 1 THEN
        SET NEW.numero_intento = v_max_intento + 1;
    END IF;
END$$

-- ============================================
-- TRIGGER: trg_nivelacion_actualizar_aprobado
-- ============================================
-- Actualiza automáticamente el campo aprobado y estado
-- cuando se registra una nota de nivelación.
-- Si nota_nivelacion >= 60: aprobado = TRUE, estado = APROBADA
-- Si nota_nivelacion < 60: aprobado = FALSE, estado = REPROBADA
-- ============================================

DROP TRIGGER IF EXISTS trg_nivelacion_actualizar_aprobado$$

CREATE TRIGGER trg_nivelacion_actualizar_aprobado
BEFORE UPDATE ON historial_nivelaciones
FOR EACH ROW
BEGIN
    IF NEW.nota_nivelacion IS NOT NULL THEN
        IF NEW.nota_nivelacion >= 60 THEN
            SET NEW.aprobado = TRUE;
            SET NEW.estado = 'APROBADA';
        ELSE
            SET NEW.aprobado = FALSE;
            SET NEW.estado = 'REPROBADA';
        END IF;
    END IF;
END$$

-- ============================================
-- TRIGGER: trg_inscripcion_materia_crear_nivelacion
-- ============================================
-- Crea automáticamente una nivelación cuando se registra un aplazo (REPROBADO)
-- y el estudiante ya tiene 2+ aplazos en esa materia.
-- También crea un bloqueo de inscripción automáticamente.
-- ============================================

DROP TRIGGER IF EXISTS trg_inscripcion_materia_crear_nivelacion$$

CREATE TRIGGER trg_inscripcion_materia_crear_nivelacion
AFTER UPDATE ON inscripciones_materias
FOR EACH ROW
BEGIN
    DECLARE v_gestion_id INT;
    
    -- Solo procesar si cambió a REPROBADO
    IF NEW.estado = 'REPROBADO' AND (OLD.estado IS NULL OR OLD.estado != 'REPROBADO') THEN
        -- Obtener gestión de la inscripción
        SELECT gestion_id INTO v_gestion_id
        FROM inscripciones
        WHERE id = NEW.inscripcion_id;
        
        -- Crear nivelación automática
        CALL sp_crear_nivelacion_automatica(
            (SELECT estudiante_id FROM inscripciones WHERE id = NEW.inscripcion_id),
            NEW.materia_id,
            NEW.id,
            v_gestion_id
        );
    END IF;
END$$

-- ============================================
-- TRIGGER: trg_nivelacion_desbloquear_inscripcion
-- ============================================
-- Desbloquea automáticamente al estudiante cuando aprueba todas sus nivelaciones.
-- Verifica si quedan nivelaciones pendientes y, si no hay más,
-- resuelve todos los bloqueos de nivelaciones pendientes.
-- ============================================

DROP TRIGGER IF EXISTS trg_nivelacion_desbloquear_inscripcion$$

CREATE TRIGGER trg_nivelacion_desbloquear_inscripcion
AFTER UPDATE ON historial_nivelaciones
FOR EACH ROW
BEGIN
    DECLARE v_nivelaciones_pendientes INT;
    
    -- Solo procesar si cambió a APROBADA
    IF NEW.estado = 'APROBADA' AND (OLD.estado IS NULL OR OLD.estado != 'APROBADA') THEN
        -- Verificar si quedan nivelaciones pendientes
        SELECT COUNT(*) INTO v_nivelaciones_pendientes
        FROM historial_nivelaciones
        WHERE estudiante_id = NEW.estudiante_id
        AND estado IN ('PROGRAMADA', 'EN_CURSO')
        AND activo = TRUE
        AND deleted_at IS NULL;
        
        -- Si no hay más pendientes, resolver bloqueos
        IF v_nivelaciones_pendientes = 0 THEN
            UPDATE bloqueos_inscripcion
            SET estado_bloqueo = 'RESUELTO',
                fecha_resolucion = CURRENT_TIMESTAMP,
                resuelto_por = NEW.created_by
            WHERE estudiante_id = NEW.estudiante_id
            AND motivo_bloqueo = 'NIVELACIONES_PENDIENTES'
            AND estado_bloqueo = 'ACTIVO'
            AND activo = TRUE
            AND deleted_at IS NULL;
        END IF;
    END IF;
END$$

DELIMITER ;

-- ============================================
-- STORED PROCEDURES
-- ============================================

DELIMITER $$

-- ============================================
-- PROCEDURE: sp_verificar_inscripcion
-- ============================================
-- Verifica si un estudiante puede inscribirse en una gestión.
-- Retorna TRUE si puede inscribirse, FALSE si hay bloqueos.
-- También retorna un mensaje explicando el motivo si no puede.
--
-- PARÁMETROS:
-- - p_estudiante_id: ID del estudiante
-- - p_gestion_id: ID de la gestión
-- - p_puede_inscribirse: OUT - TRUE si puede, FALSE si no puede
-- - p_mensaje: OUT - Mensaje explicativo
--
-- VERIFICA:
-- - Nivelaciones pendientes (bloquea TODAS las inscripciones)
-- - Bloqueos activos
-- - Documentos incompletos
-- - Pagos pendientes
-- ============================================

DROP PROCEDURE IF EXISTS sp_verificar_inscripcion$$

CREATE PROCEDURE sp_verificar_inscripcion(
    IN p_estudiante_id INT,
    IN p_gestion_id INT,
    OUT p_puede_inscribirse BOOLEAN,
    OUT p_mensaje TEXT
)
BEGIN
    DECLARE v_nivelaciones_pendientes INT;
    DECLARE v_bloqueos_activos INT;
    DECLARE v_documentos_incompletos INT;
    DECLARE v_pagos_pendientes INT;
    DECLARE v_mensaje_bloqueos TEXT;
    
    -- Verificar nivelaciones pendientes
    -- Si tiene nivelaciones pendientes, NO puede inscribirse en NINGUNA materia
    SELECT COUNT(*) INTO v_nivelaciones_pendientes
    FROM historial_nivelaciones
    WHERE estudiante_id = p_estudiante_id
    AND estado IN ('PROGRAMADA', 'EN_CURSO')
    AND activo = TRUE
    AND deleted_at IS NULL;
    
    -- Verificar bloqueos activos
    SELECT COUNT(*), GROUP_CONCAT(motivo_bloqueo SEPARATOR ', ') INTO v_bloqueos_activos, v_mensaje_bloqueos
    FROM bloqueos_inscripcion
    WHERE estudiante_id = p_estudiante_id
    AND gestion_id = p_gestion_id
    AND estado_bloqueo = 'ACTIVO'
    AND activo = TRUE
    AND deleted_at IS NULL;
    
    -- Verificar documentos incompletos (opcional, depende de tu lógica)
    SELECT COUNT(*) INTO v_documentos_incompletos
    FROM documentos_estudiante
    WHERE estudiante_id = p_estudiante_id
    AND tipo_referencia = 'inscripciones'
    AND estado IN ('PENDIENTE', 'RECHAZADO')
    AND activo = TRUE
    AND deleted_at IS NULL;
    
    -- Verificar pagos pendientes (opcional, depende de tu lógica)
    SELECT COUNT(*) INTO v_pagos_pendientes
    FROM pagos_aranceles
    WHERE estudiante_id = p_estudiante_id
    AND gestion_id = p_gestion_id
    AND estado IN ('PENDIENTE', 'VENCIDO')
    AND activo = TRUE
    AND deleted_at IS NULL;
    
    -- Evaluar
    IF v_nivelaciones_pendientes > 0 THEN
        SET p_puede_inscribirse = FALSE;
        SET p_mensaje = CONCAT('El estudiante tiene ', v_nivelaciones_pendientes, ' nivelación(es) pendiente(s). Debe aprobarlas antes de inscribirse.');
    ELSEIF v_bloqueos_activos > 0 THEN
        SET p_puede_inscribirse = FALSE;
        SET p_mensaje = CONCAT('El estudiante tiene bloqueos activos: ', v_mensaje_bloqueos);
    ELSEIF v_documentos_incompletos > 0 THEN
        SET p_puede_inscribirse = FALSE;
        SET p_mensaje = CONCAT('El estudiante tiene ', v_documentos_incompletos, ' documento(s) incompleto(s) o rechazado(s).');
    ELSEIF v_pagos_pendientes > 0 THEN
        SET p_puede_inscribirse = FALSE;
        SET p_mensaje = CONCAT('El estudiante tiene ', v_pagos_pendientes, ' pago(s) pendiente(s) o vencido(s).');
    ELSE
        SET p_puede_inscribirse = TRUE;
        SET p_mensaje = 'El estudiante puede inscribirse. Todos los requisitos están cumplidos.';
    END IF;
END$$

-- ============================================
-- PROCEDURE: sp_crear_nivelacion_automatica
-- ============================================
-- Crea automáticamente una nivelación cuando un estudiante tiene 2+ aplazos
-- en una materia. También crea un bloqueo de inscripción.
--
-- PARÁMETROS:
-- - p_estudiante_id: ID del estudiante
-- - p_materia_id: ID de la materia
-- - p_inscripcion_materia_id: ID de la inscripción materia que causó el aplazo
-- - p_gestion_actual_id: ID de la gestión actual
--
-- LÓGICA:
-- 1. Cuenta todos los aplazos (estado = REPROBADO) de esta materia
-- 2. Si hay 2+ aplazos, crea nivelación en la siguiente gestión
-- 3. Crea bloqueo de inscripción automáticamente
-- 4. Determina el número de intento (1, 2 o 3) según cantidad de aplazos
-- ============================================

DROP PROCEDURE IF EXISTS sp_crear_nivelacion_automatica$$

CREATE PROCEDURE sp_crear_nivelacion_automatica(
    IN p_estudiante_id INT,
    IN p_materia_id INT,
    IN p_inscripcion_materia_id INT,
    IN p_gestion_actual_id INT
)
BEGIN
    DECLARE v_numero_aplazos INT;
    DECLARE v_gestion_siguiente_id INT;
    DECLARE v_nivelacion_id INT;
    DECLARE v_numero_intento INT;
    
    -- Contar aplazos (materias reprobadas) - cuenta todos los intentos donde reprobó
    -- Esto incluye todas las gestiones donde el estudiante reprobó esta materia
    SELECT COUNT(*) INTO v_numero_aplazos
    FROM inscripciones_materias im
    INNER JOIN inscripciones i ON im.inscripcion_id = i.id
    WHERE i.estudiante_id = p_estudiante_id
    AND im.materia_id = p_materia_id
    AND im.estado = 'REPROBADO'
    AND im.activo = TRUE
    AND im.deleted_at IS NULL
    AND i.activo = TRUE
    AND i.deleted_at IS NULL;
    
    -- Si tiene 2 o más aplazos, crear nivelación
    IF v_numero_aplazos >= 2 THEN
        -- Obtener siguiente gestión (gestión actual + 1 año, simplificado)
        -- En producción, deberías tener una lógica más robusta
        SELECT id INTO v_gestion_siguiente_id
        FROM gestiones
        WHERE anio = (SELECT anio + 1 FROM gestiones WHERE id = p_gestion_actual_id)
        AND activo = TRUE
        AND deleted_at IS NULL
        LIMIT 1;
        
        -- Si no existe la siguiente gestión, usar la actual
        IF v_gestion_siguiente_id IS NULL THEN
            SET v_gestion_siguiente_id = p_gestion_actual_id;
        END IF;
        
        -- Determinar número de intento basado en aplazos
        IF v_numero_aplazos = 2 THEN
            SET v_numero_intento = 1;
        ELSEIF v_numero_aplazos = 3 THEN
            SET v_numero_intento = 2;
        ELSE
            SET v_numero_intento = 3;
        END IF;
        
        -- Crear nivelación
        INSERT INTO historial_nivelaciones (
            estudiante_id,
            inscripcion_materia_id,
            materia_id,
            gestion_nivelacion_id,
            numero_intento,
            fecha_inicio,
            estado,
            observaciones
        ) VALUES (
            p_estudiante_id,
            p_inscripcion_materia_id,
            p_materia_id,
            v_gestion_siguiente_id,
            v_numero_intento,
            CURDATE(),
            'PROGRAMADA',
            CONCAT('Nivelación automática por ', v_numero_aplazos, ' aplazo(s)')
        );
        
        SET v_nivelacion_id = LAST_INSERT_ID();
        
        -- Crear bloqueo de inscripción
        INSERT INTO bloqueos_inscripcion (
            estudiante_id,
            gestion_id,
            motivo_bloqueo,
            descripcion,
            nivelacion_id,
            created_by
        ) VALUES (
            p_estudiante_id,
            v_gestion_siguiente_id,
            'NIVELACIONES_PENDIENTES',
            CONCAT('Debe nivelar materia por ', v_numero_aplazos, ' aplazo(s). Nivelación #', v_nivelacion_id),
            v_nivelacion_id,
            (SELECT id FROM usuarios WHERE email LIKE '%sistema%' LIMIT 1)
        );
    END IF;
END$$

-- ============================================
-- TRIGGER: trg_licencia_calcular_total_dias
-- ============================================
-- Calcula automáticamente el total_dias cuando se crea o actualiza una licencia.
-- ============================================

DROP TRIGGER IF EXISTS trg_licencia_calcular_total_dias$$

CREATE TRIGGER trg_licencia_calcular_total_dias
BEFORE INSERT ON licencias_solicitudes
FOR EACH ROW
BEGIN
    IF NEW.fecha_desde IS NOT NULL AND NEW.fecha_hasta IS NOT NULL THEN
        SET NEW.total_dias = DATEDIFF(NEW.fecha_hasta, NEW.fecha_desde) + 1;
    END IF;
END$$

CREATE TRIGGER trg_licencia_calcular_total_dias_update
BEFORE UPDATE ON licencias_solicitudes
FOR EACH ROW
BEGIN
    IF (NEW.fecha_desde IS NOT NULL AND NEW.fecha_hasta IS NOT NULL) AND 
       (NEW.fecha_desde != OLD.fecha_desde OR NEW.fecha_hasta != OLD.fecha_hasta) THEN
        SET NEW.total_dias = DATEDIFF(NEW.fecha_hasta, NEW.fecha_desde) + 1;
    END IF;
END$$

DELIMITER ;

-- ============================================
-- VISTAS ÚTILES
-- ============================================

-- ============================================
-- VISTA: v_estudiantes_con_nivelaciones_pendientes
-- ============================================
-- Lista todos los estudiantes que tienen nivelaciones pendientes
-- con información de las materias que deben nivelar.
-- Útil para reportes y seguimiento de nivelaciones.
-- ============================================

CREATE OR REPLACE VIEW v_estudiantes_con_nivelaciones_pendientes AS
SELECT 
    e.id AS estudiante_id,
    e.codigo_estudiante,
    e.ci,
    CONCAT(e.nombres, ' ', e.apellido_paterno, ' ', IFNULL(e.apellido_materno, '')) AS nombre_completo,
    c.nombre AS carrera,
    COUNT(hn.id) AS total_nivelaciones_pendientes,
    GROUP_CONCAT(m.nombre SEPARATOR ' | ') AS materias_pendientes,
    GROUP_CONCAT(hn.numero_intento SEPARATOR ', ') AS intentos,
    MIN(hn.fecha_inicio) AS fecha_nivelacion_mas_antigua
FROM estudiantes e
INNER JOIN estudiantes_datos_academicos eda ON e.id = eda.estudiante_id
INNER JOIN carreras c ON eda.carrera_id = c.id
INNER JOIN historial_nivelaciones hn ON e.id = hn.estudiante_id
INNER JOIN materias m ON hn.materia_id = m.id
WHERE hn.estado IN ('PROGRAMADA', 'EN_CURSO')
AND hn.activo = TRUE
AND hn.deleted_at IS NULL
AND e.activo = TRUE
AND e.deleted_at IS NULL
GROUP BY e.id, e.codigo_estudiante, e.ci, nombre_completo, c.nombre;

-- ============================================
-- VISTA: v_estudiantes_bloqueados
-- ============================================
-- Lista todos los estudiantes bloqueados para inscripción
-- con información del motivo del bloqueo.
-- Útil para identificar estudiantes que no pueden inscribirse.
-- ============================================

CREATE OR REPLACE VIEW v_estudiantes_bloqueados AS
SELECT 
    e.id AS estudiante_id,
    e.codigo_estudiante,
    e.ci,
    CONCAT(e.nombres, ' ', e.apellido_paterno, ' ', IFNULL(e.apellido_materno, '')) AS nombre_completo,
    g.codigo AS gestion,
    g.anio AS anio_gestion,
    b.motivo_bloqueo,
    b.descripcion,
    b.fecha_bloqueo,
    b.fecha_resolucion,
    u.nombre AS resuelto_por_nombre
FROM estudiantes e
INNER JOIN bloqueos_inscripcion b ON e.id = b.estudiante_id
INNER JOIN gestiones g ON b.gestion_id = g.id
LEFT JOIN usuarios u ON b.resuelto_por = u.id
WHERE b.estado_bloqueo = 'ACTIVO'
AND b.activo = TRUE
AND b.deleted_at IS NULL
AND e.activo = TRUE
AND e.deleted_at IS NULL
ORDER BY b.fecha_bloqueo DESC;

-- ============================================
-- VISTA: v_conteo_aplazos_por_materia
-- ============================================
-- Cuenta cuántas veces ha reprobado cada estudiante en cada materia.
-- Muestra solo estudiantes con 2+ aplazos (que requieren nivelación).
-- Útil para identificar estudiantes que necesitan nivelación.
-- ============================================

CREATE OR REPLACE VIEW v_conteo_aplazos_por_materia AS
SELECT 
    e.id AS estudiante_id,
    e.codigo_estudiante,
    e.ci,
    CONCAT(e.nombres, ' ', e.apellido_paterno, ' ', IFNULL(e.apellido_materno, '')) AS nombre_completo,
    m.id AS materia_id,
    m.codigo AS codigo_materia,
    m.nombre AS nombre_materia,
    COUNT(*) AS numero_aplazos,
    MAX(im.updated_at) AS ultimo_aplazo,
    MAX(im.numero_intento) AS max_intento,
    GROUP_CONCAT(DISTINCT g.codigo ORDER BY g.anio DESC SEPARATOR ', ') AS gestiones_reprobadas
FROM estudiantes e
INNER JOIN inscripciones i ON e.id = i.estudiante_id
INNER JOIN inscripciones_materias im ON i.id = im.inscripcion_id
INNER JOIN materias m ON im.materia_id = m.id
INNER JOIN gestiones g ON i.gestion_id = g.id
WHERE im.estado = 'REPROBADO'
AND im.activo = TRUE
AND im.deleted_at IS NULL
AND e.activo = TRUE
AND e.deleted_at IS NULL
GROUP BY e.id, e.codigo_estudiante, e.ci, nombre_completo, m.id, m.codigo, m.nombre
HAVING numero_aplazos >= 2
ORDER BY numero_aplazos DESC, nombre_completo;

-- ============================================
-- VISTA: v_historial_notas_completo
-- ============================================
-- Historial completo de notas de un estudiante.
-- Equivalente a la tabla HISTORIAL_NOTAS del modelo de referencia.
-- Muestra todos los intentos de cursar cada materia con sus notas.
-- Útil para reportes de historial académico.
-- ============================================

CREATE OR REPLACE VIEW v_historial_notas_completo AS
SELECT 
    e.id AS estudiante_id,
    e.codigo_estudiante,
    e.ci,
    CONCAT(e.nombres, ' ', e.apellido_paterno, ' ', IFNULL(e.apellido_materno, '')) AS nombre_completo,
    m.id AS materia_id,
    m.codigo AS codigo_materia,
    m.nombre AS nombre_materia,
    g.id AS gestion_id,
    g.codigo AS gestion_codigo,
    g.anio AS anio_gestion,
    im.numero_intento,
    im.nota_final,
    im.nota_definitiva,
    im.estado AS estado_materia,
    im.asistencia_porcentaje,
    im.asistencias,
    im.faltas,
    im.fecha_1er_parcial,
    im.fecha_2do_parcial,
    im.fecha_3er_parcial,
    im.fecha_4to_parcial,
    im.fecha_practico,
    im.fecha_recuperatorio,
    im.observaciones,
    im.created_at AS fecha_registro
FROM estudiantes e
INNER JOIN inscripciones i ON e.id = i.estudiante_id
INNER JOIN inscripciones_materias im ON i.id = im.inscripcion_id
INNER JOIN materias m ON im.materia_id = m.id
INNER JOIN gestiones g ON i.gestion_id = g.id
WHERE im.activo = TRUE
AND im.deleted_at IS NULL
AND e.activo = TRUE
AND e.deleted_at IS NULL
ORDER BY e.id, m.id, im.numero_intento, g.anio DESC;

-- ============================================
-- FIN DEL SCRIPT
-- ============================================
