-- ============================================
-- VISTA: vista_dashboard_docentes_conflictos_detalle
-- Detalle legible de conflictos docentes para el tablero de horarios.
-- Unifica los tres tipos de conflicto en una sola tabla de filas
-- (docente_id, docente_nombre, detalle_linea).
--
-- Propósito: Alimentar ParallelRepository.obtenerDocentesConflictosDetalleDashboard()
--
-- Depende de (ejecutar antes):
--   93-vista-base-dashboard-detalle-conflicto-docente-horario.sql
--   95-vista-base-dashboard-detalle-conflicto-docente-aula.sql
--   94-vista-base-dashboard-detalle-conflicto-docente-duplicado.sql
--
-- Uso:
--   SELECT docente_id, docente_nombre, detalle_linea,
--          paralelo_gestion_id, oferta_curso_id, tipo_conflicto
--   FROM vista_dashboard_docentes_conflictos_detalle
--   ORDER BY docente_nombre ASC, detalle_linea ASC;
--
-- IMPORTANTE (no volver al patrón anterior):
--   Las tres vistas base exponen EXACTAMENTE las mismas 6 columnas, en el mismo
--   orden y misma collation (utf8mb4_unicode_ci, normalizada en cada base). Por eso
--   este UNION usa `SELECT *` (mismo patrón que la vista 49). NO reintroducir
--   `COLLATE` inline por columna aquí: al materializar la vista, MariaDB/MySQL deriva
--   el nombre de columna de la expresión completa y, sin alias explícito en cada
--   miembro del UNION, corrompe la definición almacenada (aliases tipo
--   `docente_nombre COLLATE utf8mb4_unicode_ci` y desalineación de columnas → error
--   #1222 al re-importar el dump). Si alguna vez reaparece "Illegal mix of collations",
--   se corrige normalizando la collation EN LAS VISTAS BASE (93/94/95), no aquí.
-- ============================================

USE instituto_incos;

DROP VIEW IF EXISTS vista_dashboard_docentes_conflictos_detalle;

CREATE VIEW vista_dashboard_docentes_conflictos_detalle AS
SELECT * FROM vista_base_dashboard_detalle_conflicto_docente_horario
UNION ALL
SELECT * FROM vista_base_dashboard_detalle_conflicto_docente_aula
UNION ALL
SELECT * FROM vista_base_dashboard_detalle_conflicto_docente_duplicado;
