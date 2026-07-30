-- ============================================
-- VISTA: vista_asistencia_consolidado_bimestre_fila
-- Consolidado % de asistencia por estudiante × curso × bimestre (ítem ACA-ASI,
-- página "Consolidado %" — reemplaza al retirado `reportes.asistencia` del
-- módulo REP disuelto, 2026-07-29).
--
-- Grano: una fila por (estudiante × asignación docente × bimestre) con el
-- agregado de sesiones computadas y faltas no neutralizadas.
--
-- Vista final delgada (patrón 87): AGREGA (GROUP BY) la vista 133 y solo une
-- bases ya consolidadas, sin reescribir la cadena de asistencia:
--   - 133 vista_base_asistencia_planilla_celda      → celdas roster × sesión
--     (marca AUSENTE/TARDANZA sparse + licencia APROBADA cruzada).
--   - 130 vista_base_asignacion_docente_detalle     → paralelo/gestión/oferta/
--     materia/docente del curso (filtro vigente+activa, mismo criterio que 135).
--   - 134 vista_base_asistencia_registro_estado_bimestre → registro ABIERTO/CERRADO.
--   - 129 vista_base_cronograma_gestion             → exclusión de feriados/recesos
--     (suspende_clases), solo en el NOT EXISTS del WHERE.
--
-- Reglas de negocio (MISMAS que AsistenciaPlanillaViewRepository.
-- listarAsistenciaBimestreCurso, para que el % coincida con la nota de la
-- actividad ASISTENCIA del cuaderno):
--   - Denominador (sesiones_computadas): solo sesiones CERRADAS, excluyendo
--     días con suspende_clases del cronograma y clases no dictadas.
--   - Faltas: AUSENTE = 1, TARDANZA = 0.5; una licencia APROBADA vigente en la
--     fecha neutraliza la falta (tiene_licencia de la 133).
--   - pct_asistencia = 100 × (computadas − faltas) / computadas.
--
-- Consumidor: AsistenciaConsolidadoViewRepository → GetConsolidadoAsistenciaUseCase
-- (GET /asistencia/consolidado, permiso academico.asistencia.consolidado.ver)
-- y ExportConsolidadoAsistenciaExcelUseCase (export Excel).
--
-- Orden de despliegue: después de 129, 130, 133 y 134.
--
-- Uso:
--   SELECT * FROM vista_asistencia_consolidado_bimestre_fila
--   WHERE paralelo_gestion_id = ? [AND bimestre = ?]
--   ORDER BY estudiante_nombre, asignatura_orden;
-- ============================================

USE instituto_incos;

DROP VIEW IF EXISTS vista_asistencia_consolidado_bimestre_fila;

CREATE VIEW vista_asistencia_consolidado_bimestre_fila AS
SELECT
  add_.paralelo_gestion_id                 AS paralelo_gestion_id,
  add_.gestion_id                          AS gestion_id,
  g.anio                                   AS gestion_anio,
  add_.oferta_curso_id                     AS oferta_curso_id,
  c.asignacion_docente_id                  AS asignacion_docente_id,
  c.periodo_academico_id                   AS periodo_academico_id,
  pa.numero_orden                          AS bimestre,
  add_.materia_sigla                       AS asignatura_sigla,
  add_.materia_nombre                      AS asignatura_nombre,
  add_.orden_visualizacion                 AS asignatura_orden,
  NULLIF(TRIM(CONCAT_WS(' ', add_.docente_apellido_paterno, add_.docente_apellido_materno, add_.docente_nombres)), '') AS docente_nombre,
  c.matricula_materia_id                   AS matricula_materia_id,
  c.estudiante_id                          AS estudiante_id,
  c.estudiante_codigo                      AS estudiante_codigo,
  c.estudiante_nombre                      AS estudiante_nombre,
  MAX(re.registro_estado)                  AS registro_estado,
  COUNT(*)                                 AS sesiones_computadas,
  SUM(CASE WHEN c.estado = 'AUSENTE' THEN 1 ELSE 0 END)  AS ausencias,
  SUM(CASE WHEN c.estado = 'TARDANZA' THEN 1 ELSE 0 END) AS tardanzas,
  SUM(CASE WHEN c.estado IN ('AUSENTE', 'TARDANZA') AND c.tiene_licencia = 1 THEN 1 ELSE 0 END) AS neutralizadas_licencia,
  SUM(CASE
        WHEN c.tiene_licencia = 0 AND c.estado = 'AUSENTE'  THEN 1
        WHEN c.tiene_licencia = 0 AND c.estado = 'TARDANZA' THEN 0.5
        ELSE 0
      END)                                 AS faltas_no_neutralizadas,
  ROUND(
    100 * (COUNT(*) - SUM(CASE
        WHEN c.tiene_licencia = 0 AND c.estado = 'AUSENTE'  THEN 1
        WHEN c.tiene_licencia = 0 AND c.estado = 'TARDANZA' THEN 0.5
        ELSE 0
      END)) / COUNT(*),
    2
  )                                        AS pct_asistencia
FROM vista_base_asistencia_planilla_celda c
INNER JOIN vista_base_asignacion_docente_detalle add_
  ON add_.id = c.asignacion_docente_id
  AND add_.activo = TRUE
  AND add_.vigente = TRUE
INNER JOIN periodos_academicos pa
  ON pa.id = c.periodo_academico_id
  AND pa.deleted_at IS NULL
LEFT JOIN gestiones g
  ON g.id = add_.gestion_id
  AND g.deleted_at IS NULL
LEFT JOIN vista_base_asistencia_registro_estado_bimestre re
  ON re.asignacion_docente_id = c.asignacion_docente_id
  AND re.periodo_academico_id = c.periodo_academico_id
WHERE c.sesion_estado = 'CERRADA'
  AND NOT EXISTS (
    SELECT 1
    FROM clases_no_dictadas cnd
    WHERE cnd.asignacion_docente_id = c.asignacion_docente_id
      AND cnd.fecha_clase = c.fecha_clase
      AND cnd.activo = TRUE
      AND cnd.deleted_at IS NULL
  )
  AND NOT EXISTS (
    SELECT 1
    FROM vista_base_cronograma_gestion cg
    WHERE cg.gestion_id = add_.gestion_id
      AND cg.suspende_clases = TRUE
      AND c.fecha_clase BETWEEN cg.fecha_inicio AND COALESCE(cg.fecha_fin, cg.fecha_inicio)
  )
GROUP BY
  add_.paralelo_gestion_id, add_.gestion_id, g.anio, add_.oferta_curso_id,
  c.asignacion_docente_id, c.periodo_academico_id, pa.numero_orden,
  add_.materia_sigla, add_.materia_nombre, add_.orden_visualizacion,
  add_.docente_apellido_paterno, add_.docente_apellido_materno, add_.docente_nombres,
  c.matricula_materia_id, c.estudiante_id, c.estudiante_codigo, c.estudiante_nombre;
