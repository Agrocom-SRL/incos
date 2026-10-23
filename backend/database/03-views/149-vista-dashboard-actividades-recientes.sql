-- ============================================
-- VISTA: vista_dashboard_actividades_recientes
-- Unión de las vistas base de actividad del dashboard (reemplaza al archivo 49;
-- misma vista lógica, ahora con 12 bases y columnas de alcance por actor).
--
-- CONTRATO (10 columnas, mismo orden en TODAS las bases — requisito del UNION):
--   artefacto_tipo   VARCHAR  tipo de actividad (ver catálogo abajo)
--   artefacto_id     INT      id del artefacto fuente
--   link_path        VARCHAR  ruta del frontend para abrir el artefacto
--   titulo           VARCHAR  título legible (persona o curso)
--   detalle          VARCHAR  descripción corta de la actividad
--   avatar_seed      VARCHAR  clave del avatar ilustrado (TIPO-id)
--   ocurrido_en      DATETIME momento de la actividad (orden del feed)
--   estudiante_id    INT|NULL alcance estudiante (feed del portal estudiante)
--   docente_id       INT|NULL alcance docente (feed del portal docente)
--   usuario_id       INT|NULL usuario que originó la actividad (created_by)
--
-- Catálogo de artefacto_tipo por base:
--   ESTUDIANTE         (41)  alta de estudiante
--   INSCRIPCION        (42)  nueva matrícula
--   PAGO_CUOTA         (43)  pago de aporte
--   DOCENTE            (44)  alta de docente
--   BECA_ASIGNADA      (47)  beca asignada
--   NOTA_REGISTRADA    (144) nota cargada en el cuaderno
--   ASISTENCIA_TOMADA  (145) sesión de asistencia registrada
--   LICENCIA           (146) licencia estudiantil
--   CLASE_NO_DICTADA   (147) cancelación puntual del dictado
--   ASIGNACION_DOCENTE (148) asignación vigente docente ↔ curso
--   PARTICIPANTE       (191) alta de participante de capacitación
--   INSCRIPCION_CAPACITACION (192) inscripción a un curso de capacitación
--
-- Feeds derivados (filtros del consumidor, DashboardRepository):
--   - Global (panel admin):      sin filtro, ORDER BY ocurrido_en DESC.
--   - Portal del estudiante:     WHERE estudiante_id = ? (tipos PAGO_CUOTA,
--     INSCRIPCION, BECA_ASIGNADA, NOTA_REGISTRADA, LICENCIA).
--   - Portal del docente:        WHERE docente_id = ? (tipos ASISTENCIA_TOMADA,
--     CLASE_NO_DICTADA, ASIGNACION_DOCENTE, NOTA_REGISTRADA, DOCENTE).
--
-- Dependencias (bases 41, 42, 43, 44, 47, 144, 145, 146, 147, 148, 191, 192).
-- En un servidor existente crear primero 191 y 192 y luego recrear esta vista.
--
-- Uso:
-- SELECT * FROM vista_dashboard_actividades_recientes ORDER BY ocurrido_en DESC;
-- ============================================

USE instituto_incos;

DROP VIEW IF EXISTS vista_dashboard_actividades_recientes;

CREATE VIEW vista_dashboard_actividades_recientes AS
SELECT * FROM vista_base_dashboard_actividad_estudiante

UNION ALL

SELECT * FROM vista_base_dashboard_actividad_inscripcion

UNION ALL

SELECT * FROM vista_base_dashboard_actividad_pago_cuota

UNION ALL

SELECT * FROM vista_base_dashboard_actividad_docente

UNION ALL

SELECT * FROM vista_base_dashboard_actividad_beca

UNION ALL

SELECT * FROM vista_base_dashboard_actividad_nota_registrada

UNION ALL

SELECT * FROM vista_base_dashboard_actividad_asistencia_tomada

UNION ALL

SELECT * FROM vista_base_dashboard_actividad_licencia

UNION ALL

SELECT * FROM vista_base_dashboard_actividad_clase_no_dictada

UNION ALL

SELECT * FROM vista_base_dashboard_actividad_asignacion_docente

UNION ALL

SELECT * FROM vista_base_dashboard_actividad_participante

UNION ALL

SELECT * FROM vista_base_dashboard_actividad_inscripcion_capacitacion;
