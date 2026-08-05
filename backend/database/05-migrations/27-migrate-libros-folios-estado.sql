-- ============================================
-- MIGRACIÓN DDL: folios_libro.estado — quitar IMPRESO y FIRMADO
-- Sistema de Gestión Académica - Instituto INCOS
-- Fecha de redacción: 2026-08-05
--
-- Contexto (decisión de negocio, no técnica):
-- El sistema NO tiene forma de verificar que una página se imprimió o firmó
-- físicamente — eran solo botones sin respaldo real. El folio queda con un
-- único estado "vivo" (BORRADOR) + ANULADO (terminal, exige motivo). El
-- "cierre" oficial del documento (bloque de firmas en el export Excel) pasa
-- a controlarse por libros_registro.estado (CERRADO), no por folio — ver
-- ExportLibroExcelUseCase.
--
-- Fuente de verdad (schema ya corregido en el repo):
--   01-schemas/25-libros-registro.sql (folios_libro.estado)
--
-- folios_libro YA TIENE DATOS reales en el servidor (módulo desplegado y en
-- uso activo) — no se puede recrear con DROP/CREATE. Este script aplica el
-- DELTA vía ALTER TABLE, preservando los folios existentes.
--
-- ORDEN DE APLICACIÓN EN EL SERVIDOR:
--   0. Backup previo: mysqldump instituto_incos folios_libro > backup-pre-27.sql
--   1. ESTE script.
--   2. Recrear las vistas 03-views/175-vista-libros-registro-listado.sql y
--      03-views/176-vista-base-libro-folio-fila.sql (columna folios_firmados
--      se quita de la 175; libro_estado se agrega a la 176).
--
-- NOTAS TÉCNICAS:
--   - Paso 1 (UPDATE) es la salvaguarda: si algún folio real quedó en
--     IMPRESO o FIRMADO antes de este cambio, se degrada a BORRADOR (el
--     único estado vigente que le corresponde) ANTES de estrechar el ENUM —
--     si se hiciera al revés, el ALTER truncaría esos valores a '' y MySQL
--     los rechazaría (o los vaciaría, según sql_mode).
--   - Paso 2 (ALTER) reconstruye el ENUM de la columna: ALGORITHM=COPY,
--     remapea por VALOR no por índice, los datos (ya sin IMPRESO/FIRMADO)
--     quedan intactos. Tabla de folios acotada (páginas de 10 estudiantes),
--     impacto de bloqueo mínimo.
--   - Script IDEMPOTENTE: puede re-ejecutarse completo sin error.
-- ============================================

USE instituto_incos;

-- ============================================
-- 1) Salvaguarda: degradar folios IMPRESO/FIRMADO existentes a BORRADOR
--    ANTES de estrechar el ENUM (ver nota técnica arriba).
-- ============================================

UPDATE folios_libro
SET estado = 'BORRADOR'
WHERE estado IN ('IMPRESO', 'FIRMADO');

-- ============================================
-- 2) folios_libro.estado — ENUM('BORRADOR', 'ANULADO') únicamente.
--    IDEMPOTENTE: solo corre si el ENUM todavía incluye IMPRESO o FIRMADO.
-- ============================================

SET @estado_col_type := (
    SELECT column_type
    FROM information_schema.columns
    WHERE table_schema = 'instituto_incos'
      AND table_name = 'folios_libro'
      AND column_name = 'estado'
);

SET @fl_ddl := IF(@estado_col_type LIKE '%IMPRESO%' OR @estado_col_type LIKE '%FIRMADO%',
"ALTER TABLE instituto_incos.folios_libro
    MODIFY COLUMN estado ENUM('BORRADOR', 'ANULADO') DEFAULT 'BORRADOR'
        COMMENT 'BORRADOR: vigente | ANULADO: página invalidada (exige motivo). Sin IMPRESO/FIRMADO: el sistema no verifica impresión/firma física; el cierre oficial del documento (bloque de firmas en el export) lo controla libros_registro.estado (CERRADO)'",
"SELECT '2) folios_libro.estado: ya estaba aplicado, sin cambios' AS aviso");

PREPARE fl_stmt FROM @fl_ddl;
EXECUTE fl_stmt;
DEALLOCATE PREPARE fl_stmt;

-- ============================================
-- VERIFICACIÓN (solo lectura, ejecutar tras aplicar)
-- ============================================

-- a) ENUM sin IMPRESO/FIRMADO (espera 1 fila: "enum('BORRADOR','ANULADO')")
SELECT column_type
FROM information_schema.columns
WHERE table_schema = 'instituto_incos'
  AND table_name = 'folios_libro'
  AND column_name = 'estado';

-- b) Ningún folio quedó en un estado inexistente (espera 0 filas)
SELECT id, libro_id, numero_folio, estado
FROM instituto_incos.folios_libro
WHERE estado NOT IN ('BORRADOR', 'ANULADO');

-- c) Conteo de datos preservados (comparar con el conteo previo al ALTER)
SELECT COUNT(*) AS total_folios FROM instituto_incos.folios_libro;
