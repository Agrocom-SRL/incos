-- ============================================
-- VISTA: vista_calificacion_resumen_bimestre_docente_fila
-- Fila por matrícula × bimestre para el KPI "Mis cursos" del docente
-- (conteo de matriculados, con/sin registro, cerrados, evaluaciones).
--
-- Reutiliza:
--   - vista_base_calificacion_resumen_curso_bimestre_fila (119)
--   - vista_base_calificacion_evaluaciones_curso_bimestre (107)
--
-- Excluye ABANDONO/RETIRADO: un estudiante retirado no debe contarse en el
-- tablero del docente, aunque la 119 sí lo incluya para Consolidado/Boletín
-- (Fase C, docs/plan/calificaciones-centralizador-nivelacion-rediseno.md).
--
-- El umbral de nota mínima de aprobación (política institucional,
-- configuracion_evaluacion, documento JSON) NO se resuelve aquí a propósito:
-- llega por parámetro desde `cargarCuotasPoliticaGestion` (misma fuente que
-- usan Centralizador y Consolidado) para no duplicar el parseo del JSON de
-- política en SQL. El repositorio agrega aprobados/reprobados contra ese
-- umbral: WHERE docente_id = ? GROUP BY asignacion_docente_id, bimestre.
--
-- Consumidor:
-- - CalificacionCoordinacionRepository.listarResumenBimestresCursosPorDocente()
--
-- Orden de despliegue: 107, 119; luego 189.
-- ============================================

USE instituto_incos;

DROP VIEW IF EXISTS vista_calificacion_resumen_bimestre_docente_fila;

CREATE VIEW vista_calificacion_resumen_bimestre_docente_fila AS
SELECT
  f.docente_id,
  f.asignacion_docente_id,
  f.gestion_id,
  f.bimestre,
  f.matricula_materia_id,
  f.tiene_registro,
  f.nota_efectiva,
  f.estado_bimestre,
  COALESCE(ev.cantidad_evaluaciones, 0) AS cantidad_evaluaciones
FROM vista_base_calificacion_resumen_curso_bimestre_fila f
LEFT JOIN vista_base_calificacion_evaluaciones_curso_bimestre ev
  ON ev.asignacion_docente_id = f.asignacion_docente_id
  AND ev.gestion_id = f.gestion_id
  AND ev.bimestre = f.bimestre
WHERE f.estado_matricula NOT IN ('ABANDONO', 'RETIRADO');
