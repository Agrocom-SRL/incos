-- ============================================
-- VISTA BASE: vista_base_libro_folio_fila
-- Folios del libro de registro (schema 25) — grano 1 fila por FOLIO.
--
-- Propósito:
-- - Tabla de folios en la ficha del libro (GET /api/v1/libros/:id) y cabecera
--   de impresión de cada folio (FOLIO N°, CURSO, PARALELO, TURNO, GESTIÓN).
--
-- Reutiliza la vista 127 (vista_base_paralelo_gestion_ficha) para el contexto
-- del paralelo en gestión — NO se repite a mano la cadena
-- paralelos_gestion → paralelos/carreras/periodos/gestiones_planes/gestiones.
--
-- Modelo de negocio:
-- Un FOLIO = una página del CENTRALIZADOR DE CALIFICACIONES de un paralelo
-- (curso-paralelo-gestión), hasta 10 estudiantes. numero_folio es correlativo
-- del libro y cruza paralelos y años/cursos de la misma gestión.
-- Estados: BORRADOR → ANULADO (exige motivo). El folio NO tiene un estado
-- "firmado"/"cerrado" propio: `libro_estado` (libros_registro.estado,
-- ABIERTO/CERRADO) es lo que gatea el bloque de firmas en el export/preview
-- (ver ExportLibroExcelUseCase) — de ahí que esta vista lo traiga también.
-- Estadísticas del paralelo (aprobados/reprobados/abandonos) derivan del conteo
-- de estados congelados en folio_estudiantes.
--
-- Limitación documentada (A5, notas por materia):
-- las NOTAS del folio NO viven aquí — se leen de la vista 135
-- (vista_base_calificacion_centralizador_paralelo_fila), que filtra la
-- asignación docente VIGENTE. El libro se genera al cierre de la gestión
-- mientras esta es vigente; el folio solo congela estado_academico y
-- observaciones. Reimpresión de gestiones pasadas = evolución futura
-- (parametrizar la gestión en la 135).
--
-- Consumidor:
-- - LibroRegistroViewRepository.listarFoliosPorLibro() / obtenerFolioPorId()
--   → GetLibroByIdUseCase, GetFolioByIdUseCase, GenerarFoliosParaleloUseCase,
--     ExportLibroExcelUseCase (GET /libros/:id, /libros/:id/folios/:folioId,
--     /libros/:id/export).
--
-- Uso:
--   SELECT * FROM vista_base_libro_folio_fila
--   WHERE libro_id = ? ORDER BY numero_folio;
-- ============================================

USE instituto_incos;

DROP VIEW IF EXISTS vista_base_libro_folio_fila;

CREATE VIEW vista_base_libro_folio_fila AS
SELECT
  fl.id                  AS id,
  fl.libro_id            AS libro_id,
  lr.numero_libro        AS numero_libro,
  lr.codigo_registro     AS codigo_registro,
  lr.estado              AS libro_estado,
  fl.numero_folio        AS numero_folio,
  fl.paralelo_gestion_id AS paralelo_gestion_id,
  fl.orden_en_paralelo   AS orden_en_paralelo,
  fl.estado              AS estado,
  fl.fecha_registro      AS fecha_registro,
  fl.observaciones       AS observaciones,
  fl.activo              AS activo,
  -- Contexto del paralelo en gestión (vista 127; alias a snake_case)
  v127.paraleloNombre    AS paralelo_nombre,
  v127.turno             AS turno,
  v127.periodoId         AS periodo_id,
  v127.periodoNumero     AS periodo_numero,
  v127.periodoNombre     AS periodo_nombre,
  v127.carreraId         AS carrera_id,
  v127.carreraNombre     AS carrera_nombre,
  v127.carreraCodigo     AS carrera_codigo,
  v127.carreraColorHex   AS carrera_color_hex,
  v127.gestionId         AS gestion_id,
  v127.gestionAnio       AS gestion_anio,
  v127.gestionNombre     AS gestion_nombre,
  -- Nómina asentada en la página (folio_estudiantes) + conteo por estado
  (
    SELECT COUNT(*)
    FROM folio_estudiantes fe
    WHERE fe.folio_id = fl.id
      AND fe.deleted_at IS NULL
      AND fe.activo = TRUE
  ) AS total_estudiantes,
  (
    SELECT COUNT(*)
    FROM folio_estudiantes fe
    WHERE fe.folio_id = fl.id
      AND fe.deleted_at IS NULL
      AND fe.activo = TRUE
      AND fe.estado_academico = 'APROBADO'
  ) AS total_aprobados,
  (
    SELECT COUNT(*)
    FROM folio_estudiantes fe
    WHERE fe.folio_id = fl.id
      AND fe.deleted_at IS NULL
      AND fe.activo = TRUE
      AND fe.estado_academico = 'REPROBADO'
  ) AS total_reprobados,
  (
    SELECT COUNT(*)
    FROM folio_estudiantes fe
    WHERE fe.folio_id = fl.id
      AND fe.deleted_at IS NULL
      AND fe.activo = TRUE
      AND fe.estado_academico = 'ABANDONO'
  ) AS total_abandonos
FROM folios_libro fl
INNER JOIN libros_registro lr
  ON lr.id = fl.libro_id
  AND lr.deleted_at IS NULL
LEFT JOIN vista_base_paralelo_gestion_ficha v127
  ON v127.id = fl.paralelo_gestion_id
WHERE fl.deleted_at IS NULL
  AND fl.activo = TRUE;
