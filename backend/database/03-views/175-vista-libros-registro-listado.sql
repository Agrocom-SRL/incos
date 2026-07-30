-- ============================================
-- VISTA: vista_libros_registro_listado
-- Libros de registro del centralizador (schema 25) — grano 1 fila por LIBRO.
--
-- Propósito:
-- - Listado P1 de Libros de registro (ACA · /academico/libros) y cabecera de la
--   ficha del libro: identidad (LIBRO N°, carrera, gestión, Código de Registro)
--   + agregados de avance de folios.
--
-- Modelo de negocio:
-- Un LIBRO es por CARRERA y por GESTIÓN (UNIQUE carrera+gestión; secuencia real
-- 12→2023, 13→2024, 14→2025). Cada libro agrupa TODOS los años/paralelos de la
-- carrera en esa gestión; un FOLIO = una página del centralizador de un
-- paralelo (hasta 10 estudiantes). El folio inicial puede no ser 1 (el libro
-- 14 arranca en 56: otros lotes de la misma gestión ocupan folios previos).
--
-- Agregados (subqueries correlacionadas, patrón de la vista 127 — mantienen el
-- grano sin GROUP BY): folios totales/firmados/anulados, MAX(numero_folio),
-- paralelos con folio y estudiantes asentados (via folio_estudiantes).
--
-- Consumidor:
-- - LibroRegistroViewRepository.listarLibros() / obtenerLibroPorId()
--   → ListLibrosUseCase / GetLibroByIdUseCase (GET /api/v1/libros[/:id]).
--
-- Uso:
--   SELECT * FROM vista_libros_registro_listado ORDER BY gestion_anio DESC, carrera_nombre;
-- ============================================

USE instituto_incos;

DROP VIEW IF EXISTS vista_libros_registro_listado;

CREATE VIEW vista_libros_registro_listado AS
SELECT
  lr.id                 AS id,
  lr.numero_libro       AS numero_libro,
  lr.carrera_id         AS carrera_id,
  c.nombre              AS carrera_nombre,
  c.codigo              AS carrera_codigo,
  c.color_hex           AS carrera_color_hex,
  lr.gestion_id         AS gestion_id,
  g.anio                AS gestion_anio,
  g.nombre              AS gestion_nombre,
  g.vigente             AS gestion_vigente,
  lr.codigo_registro    AS codigo_registro,
  lr.folio_inicial      AS folio_inicial,
  lr.folio_actual       AS folio_actual,
  lr.folio_final        AS folio_final,
  lr.estado             AS estado,
  lr.fecha_apertura     AS fecha_apertura,
  lr.fecha_cierre       AS fecha_cierre,
  lr.observaciones      AS observaciones,
  lr.activo             AS activo,
  -- Folios del libro (páginas del centralizador). ANULADO cuenta aparte: la
  -- página existe en el libro físico pero no suma al avance útil.
  (
    SELECT COUNT(*)
    FROM folios_libro fl
    WHERE fl.libro_id = lr.id
      AND fl.deleted_at IS NULL
      AND fl.activo = TRUE
      AND fl.estado <> 'ANULADO'
  ) AS total_folios,
  (
    SELECT COUNT(*)
    FROM folios_libro fl
    WHERE fl.libro_id = lr.id
      AND fl.deleted_at IS NULL
      AND fl.activo = TRUE
      AND fl.estado = 'FIRMADO'
  ) AS folios_firmados,
  (
    SELECT COUNT(*)
    FROM folios_libro fl
    WHERE fl.libro_id = lr.id
      AND fl.deleted_at IS NULL
      AND fl.activo = TRUE
      AND fl.estado = 'ANULADO'
  ) AS folios_anulados,
  (
    SELECT MAX(fl.numero_folio)
    FROM folios_libro fl
    WHERE fl.libro_id = lr.id
      AND fl.deleted_at IS NULL
      AND fl.activo = TRUE
  ) AS max_numero_folio,
  (
    SELECT COUNT(DISTINCT fl.paralelo_gestion_id)
    FROM folios_libro fl
    WHERE fl.libro_id = lr.id
      AND fl.deleted_at IS NULL
      AND fl.activo = TRUE
      AND fl.estado <> 'ANULADO'
  ) AS paralelos_con_folio,
  (
    SELECT COUNT(*)
    FROM folio_estudiantes fe
    INNER JOIN folios_libro fl
      ON fl.id = fe.folio_id
      AND fl.deleted_at IS NULL
      AND fl.activo = TRUE
      AND fl.estado <> 'ANULADO'
    WHERE fl.libro_id = lr.id
      AND fe.deleted_at IS NULL
      AND fe.activo = TRUE
  ) AS total_estudiantes
FROM libros_registro lr
LEFT JOIN carreras c
  ON c.id = lr.carrera_id
  AND c.deleted_at IS NULL
LEFT JOIN gestiones g
  ON g.id = lr.gestion_id
  AND g.deleted_at IS NULL
WHERE lr.deleted_at IS NULL
  AND lr.activo = TRUE;
