-- ============================================
-- VISTA BASE: vista_base_horarios_semana_activos
-- Horarios activos disponibles por día/turno
--
-- Propósito: pieza base reutilizable para vistas de planificación semanal.
-- Expone únicamente horarios vigentes con campos de orden y renderizado.
-- ============================================

USE instituto_incos;

DROP VIEW IF EXISTS vista_base_horarios_semana_activos;

CREATE VIEW vista_base_horarios_semana_activos AS
SELECT
  h.id AS horario_id,
  h.nombre AS horario_nombre,
  h.dia AS dia,
  h.hora_inicio AS hora_inicio,
  h.hora_fin AS hora_fin,
  h.turno AS turno,
  h.numero_bloque AS numero_bloque,
  h.tipo_horario AS tipo_horario
FROM horarios h
WHERE h.deleted_at IS NULL
  AND h.activo = TRUE;
