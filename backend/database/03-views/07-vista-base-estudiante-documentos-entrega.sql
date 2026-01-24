-- ============================================
-- VISTA BASE: vista_base_estudiante_documentos_entrega
-- Relación entre estudiantes y documentos con información del catálogo
-- 
-- Propósito: Vista base que une estudiantes_documentos_entrega + documentacion (2 tablas)
-- Reutilizable para construir vistas más complejas o consultas directas
-- 
-- IMPORTANTE:
-- - Excluye campos de auditoría (activo, created_at, updated_at, deleted_at, created_by, updated_by, deleted_by)
-- - Valida soft delete en ambas tablas directamente en los JOINs (activo = TRUE, deleted_at IS NULL)
-- - Solo incluye registros que existen en estudiantes_documentos_entrega (INNER JOIN)
-- 
-- Relaciones según schemas:
-- - estudiantes_documentos_entrega.documentacion_id → documentacion.id (INNER JOIN)
-- ============================================

USE instituto_incos;

DROP VIEW IF EXISTS vista_base_estudiante_documentos_entrega;

CREATE VIEW vista_base_estudiante_documentos_entrega AS
SELECT 
  -- Campos de estudiantes_documentos_entrega (sin auditoría)
  ede.id AS entrega_id,
  ede.estudiante_id,
  ede.documentacion_id,
  ede.entregado,
  ede.en_tramite,
  ede.fecha_entrega,
  ede.observaciones AS observaciones_entrega,
  
  doc.nombre AS nombre_documento,
  doc.tipo_documento,
  doc.documento_padre_id,
  doc.es_documento_sistema

FROM estudiantes_documentos_entrega ede
INNER JOIN documentacion doc ON doc.id = ede.documentacion_id
  AND doc.activo = TRUE 
  AND doc.deleted_at IS NULL
WHERE ede.activo = TRUE 
  AND ede.deleted_at IS NULL;
