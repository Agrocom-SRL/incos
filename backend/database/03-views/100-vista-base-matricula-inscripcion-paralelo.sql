-- ============================================
-- VISTA BASE: vista_base_matricula_inscripcion_paralelo
-- Paralelo y periodo representativos por inscripción (una fila).
--
-- Reutiliza: vista_base_inscripciones_paralelos (17)
-- Regla de desempate (misma que reportes Excel): mayor periodo_numero;
-- empate → mayor paralelo_id.
--
-- Consumida por: vista_base_matricula_resumen_inscripcion
-- ============================================

USE instituto_incos;

DROP VIEW IF EXISTS vista_base_matricula_inscripcion_paralelo;

CREATE VIEW vista_base_matricula_inscripcion_paralelo AS
SELECT
  vip.inscripcion_id,
  vip.paralelo_id,
  vip.paralelo_nombre,
  vip.paralelo_turno,
  vip.paralelo_descripcion,
  vip.periodo_id,
  vip.periodo_numero,
  vip.periodo_nombre
FROM vista_base_inscripciones_paralelos vip
WHERE NOT EXISTS (
  SELECT 1
  FROM vista_base_inscripciones_paralelos vip_sup
  WHERE vip_sup.inscripcion_id = vip.inscripcion_id
    AND (
      COALESCE(vip_sup.periodo_numero, -1) > COALESCE(vip.periodo_numero, -1)
      OR (
        COALESCE(vip_sup.periodo_numero, -1) = COALESCE(vip.periodo_numero, -1)
        AND COALESCE(vip_sup.paralelo_id, 0) > COALESCE(vip.paralelo_id, 0)
      )
    )
);
