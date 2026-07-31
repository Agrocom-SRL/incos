-- ============================================
-- VISTA BASE: vista_base_tutoria_estudiante_tercer_anio
-- Roster de estudiantes de 3er año por gestión, con su proyecto de grado
-- vigente/histórico resuelto (módulo TIT · titulación).
--
-- Grano: una fila por estudiante de 3er año (periodo_numero = 3) en su
-- inscripción vigente. Vista final delgada: reutiliza la base 101
-- (vista_base_matricula_resumen_inscripcion) para "es de 3er año" (mismo
-- criterio que EnrollmentRepository.obtenerListadoMatriculas) y resuelve el
-- integrante_proyecto MÁS RELEVANTE del estudiante (ACTIVO si existe, si no
-- el más reciente) con la misma técnica SUBSTRING_INDEX(GROUP_CONCAT(...))
-- que ya usa la vista 160 — sin duplicar el JOIN completo de integrantes.
--
-- Modelo de negocio: "elegible para elegir modalidad de graduación" =
-- estudiante de 3er año SIN proyecto vigente (proyecto_grado_id IS NULL).
-- "Roster de la planilla de seguimiento" (Requisito 3) = estudiante de 3er
-- año CON proyecto (proyecto_grado_id IS NOT NULL), independientemente de si
-- ese proyecto sigue vigente o ya cerró (APROBADO/REPROBADO/CANCELADO).
--
-- Consumidores:
--   - TutoriaAvanceViewRepository (backend) →
--     GET /proyectos-grado/estudiantes-elegibles (Requisito 1, filtro
--     proyecto_grado_id IS NULL) y base de la vista 181 (Requisito 3, filtro
--     proyecto_grado_id IS NOT NULL).
--
-- Uso:
--   SELECT * FROM vista_base_tutoria_estudiante_tercer_anio
--   WHERE gestion_id = ? AND proyecto_grado_id IS NULL
--   ORDER BY apellido_paterno, apellido_materno, nombres;
-- ============================================

USE instituto_incos;

DROP VIEW IF EXISTS vista_base_tutoria_estudiante_tercer_anio;

CREATE VIEW vista_base_tutoria_estudiante_tercer_anio AS
SELECT
  m.estudiante_id                  AS estudiante_id,
  m.estudiante_ci                  AS ci,
  m.estudiante_expedicion          AS expedicion,
  est.celular                      AS celular,
  m.estudiante_nombres             AS nombres,
  m.estudiante_apellido_paterno    AS apellido_paterno,
  m.estudiante_apellido_materno    AS apellido_materno,
  m.estudiante_nombre_completo     AS estudiante_nombre_completo,
  m.carrera_id                     AS carrera_id,
  m.carrera_codigo                 AS carrera_codigo,
  m.carrera_nombre                 AS carrera_nombre,
  m.gestion_id                     AS gestion_id,
  m.periodo_numero                 AS periodo_numero,
  ip_sel.proyecto_grado_id         AS proyecto_grado_id,
  pg.estado                        AS proyecto_estado,
  ip_sel.integrante_estado         AS integrante_estado,
  mg.codigo                        AS modalidad_codigo,
  NULLIF(TRIM(CONCAT_WS(' ', doc.apellido_paterno, doc.apellido_materno, doc.nombres)), '') AS tutor_nombre
FROM vista_base_matricula_resumen_inscripcion m
LEFT JOIN estudiantes est
  ON est.id = m.estudiante_id
  AND est.deleted_at IS NULL
LEFT JOIN (
  -- Integrante más relevante por estudiante: ACTIVO si existe, si no el más
  -- reciente (RETIRADO). Mismo idioma que la 160 para "última fila" sin
  -- window functions.
  SELECT
    ip.estudiante_id AS estudiante_id,
    CAST(
      SUBSTRING_INDEX(GROUP_CONCAT(ip.proyecto_grado_id ORDER BY (ip.estado = 'ACTIVO') DESC, ip.id DESC), ',', 1)
      AS UNSIGNED
    ) AS proyecto_grado_id,
    SUBSTRING_INDEX(GROUP_CONCAT(ip.estado ORDER BY (ip.estado = 'ACTIVO') DESC, ip.id DESC), ',', 1) AS integrante_estado
  FROM integrantes_proyecto ip
  WHERE ip.activo = TRUE
    AND ip.deleted_at IS NULL
  GROUP BY ip.estudiante_id
) ip_sel ON ip_sel.estudiante_id = m.estudiante_id
LEFT JOIN proyectos_grado pg
  ON pg.id = ip_sel.proyecto_grado_id
  AND pg.activo = TRUE
  AND pg.deleted_at IS NULL
LEFT JOIN modalidades_grado mg
  ON mg.id = pg.modalidad_id
LEFT JOIN docentes doc
  ON doc.id = pg.tutor_id
  AND doc.deleted_at IS NULL
WHERE m.periodo_numero = 3
  AND m.activo = TRUE;
