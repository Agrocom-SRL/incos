-- ============================================
-- VISTA BASE: vista_base_libro_paralelo_estudiante
-- Nómina para folios del libro — grano 1 fila por ESTUDIANTE × PARALELO_GESTION.
--
-- Propósito:
-- - Nómina del paralelo desde la que el generador de folios corta páginas de
--   10 estudiantes (columna N° del centralizador impreso), en orden
--   institucional APELLIDO_PATERNO APELLIDO_MATERNO NOMBRES.
--
-- Reutiliza bases de inscripciones (no repite la cadena a mano):
-- - 04 vista_base_asignaciones_inscripciones → matriculas_materia activas
--   (curso_id = alias de oferta_cursos.id) + inscripcion_id.
-- - 03 vista_base_inscripciones_estudiantes → datos del estudiante (CI,
--   expedición, apellidos, nombres) vía inscripción.
-- - oferta_cursos aporta el grano paralelo_gestion_id (única tabla que lo liga).
--
-- Modelo de negocio:
-- paralelos_gestion → oferta_cursos → matriculas_materia (ancla estable de la
-- matrícula). Un estudiante entra a la nómina del paralelo si tiene al menos
-- una matrícula de materia activa en su oferta — SIN filtrar estado de la
-- matrícula: el libro físico también asienta ABANDONO/RETIRADO (fila con NP).
-- Desempate: si un estudiante tuviera más de una inscripción ligada al mismo
-- paralelo, gana la más reciente = MAX(inscripcion_id) (regla de la vista 136).
--
-- Consumidor:
-- - LibroRegistroViewRepository.listarNominaPorParaleloGestion()
--   → GenerarFoliosParaleloUseCase (POST /api/v1/libros/:id/folios) y
--     ListParalelosLibroUseCase (conteo de estudiantes por paralelo).
--
-- Uso:
--   SELECT * FROM vista_base_libro_paralelo_estudiante
--   WHERE paralelo_gestion_id = ?
--   ORDER BY apellido_paterno, apellido_materno, nombres;
-- ============================================

USE instituto_incos;

DROP VIEW IF EXISTS vista_base_libro_paralelo_estudiante;

CREATE VIEW vista_base_libro_paralelo_estudiante AS
SELECT
  oc.paralelo_gestion_id      AS paralelo_gestion_id,
  vie.estudiante_id           AS estudiante_id,
  MAX(vai.inscripcion_id)     AS inscripcion_id,
  vie.codigo_estudiante       AS codigo_estudiante,
  vie.ci                      AS ci,
  vie.expedicion              AS expedicion,
  vie.apellido_paterno        AS apellido_paterno,
  vie.apellido_materno        AS apellido_materno,
  vie.nombres                 AS nombres,
  TRIM(
    CONCAT_WS(
      ' ',
      COALESCE(vie.apellido_paterno, ''),
      COALESCE(vie.apellido_materno, ''),
      COALESCE(vie.nombres, '')
    )
  ) AS nombre_completo
FROM vista_base_asignaciones_inscripciones vai
INNER JOIN oferta_cursos oc
  ON oc.id = vai.curso_id
  AND oc.deleted_at IS NULL
  AND oc.activo = TRUE
INNER JOIN vista_base_inscripciones_estudiantes vie
  ON vie.inscripcion_id = vai.inscripcion_id
GROUP BY
  oc.paralelo_gestion_id,
  vie.estudiante_id,
  vie.codigo_estudiante,
  vie.ci,
  vie.expedicion,
  vie.apellido_paterno,
  vie.apellido_materno,
  vie.nombres;
