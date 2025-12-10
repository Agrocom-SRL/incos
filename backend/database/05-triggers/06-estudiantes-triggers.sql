-- ============================================
-- TRIGGERS - MÓDULO DE ESTUDIANTES
-- Sistema de Gestión Académica - Instituto INCOS
-- ============================================

USE instituto_incos;

DELIMITER $$

-- ============================================
-- TRIGGER: trg_licencia_calcular_dias
-- Descripción: Calcula automáticamente el total de días de licencia
-- ============================================

DROP TRIGGER IF EXISTS trg_licencia_calcular_dias$$

CREATE TRIGGER trg_licencia_calcular_dias
BEFORE INSERT ON licencias_solicitudes
FOR EACH ROW
BEGIN
    SET NEW.total_dias = DATEDIFF(NEW.fecha_hasta, NEW.fecha_desde) + 1;
END$$

-- ============================================
-- TRIGGER: trg_licencia_actualizar_dias
-- Descripción: Actualiza total_dias si cambian las fechas
-- ============================================

DROP TRIGGER IF EXISTS trg_licencia_actualizar_dias$$

CREATE TRIGGER trg_licencia_actualizar_dias
BEFORE UPDATE ON licencias_solicitudes
FOR EACH ROW
BEGIN
    IF NEW.fecha_desde != OLD.fecha_desde OR NEW.fecha_hasta != OLD.fecha_hasta THEN
        SET NEW.total_dias = DATEDIFF(NEW.fecha_hasta, NEW.fecha_desde) + 1;
    END IF;
END$$

-- ============================================
-- TRIGGER: trg_beca_validar_unica_activa
-- Descripción: Valida que solo haya UNA beca activa por estudiante
-- ============================================

DROP TRIGGER IF EXISTS trg_beca_validar_unica_activa$$

CREATE TRIGGER trg_beca_validar_unica_activa
BEFORE INSERT ON estudiantes_becas
FOR EACH ROW
BEGIN
    DECLARE beca_activa_count INT;
    
    IF NEW.estado = 'ACTIVA' THEN
        SELECT COUNT(*) INTO beca_activa_count
        FROM estudiantes_becas
        WHERE estudiante_id = NEW.estudiante_id
          AND estado = 'ACTIVA'
          AND deleted_at IS NULL;
        
        IF beca_activa_count > 0 THEN
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'El estudiante ya tiene una beca activa. Debe finalizar la beca actual antes de asignar una nueva.';
        END IF;
    END IF;
END$$

-- ============================================
-- TRIGGER: trg_estudiante_generar_codigo
-- Descripción: Genera código de estudiante automáticamente cuando se insertan datos académicos
-- ============================================

DROP TRIGGER IF EXISTS trg_estudiante_generar_codigo$$

CREATE TRIGGER trg_estudiante_generar_codigo
AFTER INSERT ON estudiantes_datos_academicos
FOR EACH ROW
BEGIN
    DECLARE anio INT;
    DECLARE ultimo_numero INT;
    DECLARE nuevo_codigo VARCHAR(20);
    DECLARE codigo_actual VARCHAR(20);
    
    -- Obtener el código actual del estudiante
    SELECT codigo_estudiante INTO codigo_actual
    FROM estudiantes
    WHERE id = NEW.estudiante_id;
    
    -- Solo generar código si no existe o está vacío
    IF codigo_actual IS NULL OR codigo_actual = '' THEN
        -- Obtener el año de la gestión de ingreso
        SELECT anio INTO anio
        FROM gestiones
        WHERE id = NEW.gestion_ingreso_id;
        
        -- Obtener el último número de código para ese año
        SELECT COALESCE(MAX(CAST(SUBSTRING(codigo_estudiante, -4) AS UNSIGNED)), 0) INTO ultimo_numero
        FROM estudiantes
        WHERE codigo_estudiante LIKE CONCAT('EST-', anio, '-%')
          AND deleted_at IS NULL;
        
        -- Generar nuevo código
        SET nuevo_codigo = CONCAT('EST-', anio, '-', LPAD(ultimo_numero + 1, 4, '0'));
        
        -- Actualizar el código en la tabla estudiantes
        UPDATE estudiantes
        SET codigo_estudiante = nuevo_codigo
        WHERE id = NEW.estudiante_id;
    END IF;
END$$

DELIMITER ;
