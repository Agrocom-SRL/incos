-- ============================================
-- SEEDER permisos · módulo Reportes (REP) — RETIRADO (tombstone)
-- ============================================
-- DISOLUCIÓN DEL MÓDULO REP (2026-07-29, decisión de usuario registrada en
-- docs/plan/reportes-rep-diagnostico.md): los reportes viven con su módulo
-- DUEÑO (precedente del repo: finanzas/reportes, centralizador en
-- Calificaciones, historial en Estudiantes, inscritos en Capacitación).
-- Un dominio REP paralelo duplicaba permisos EXPORTAR, generadores y menú.
--
-- Los 7 códigos de este seed estaban deshabilitados desde 2026-06-24
-- (activo=0, deleted_at) y NUNCA tuvieron backend. Este archivo queda como
-- TOMBSTONE: ya no siembra nada; solo limpia sus filas residuales si la BD
-- las tuviera (re-sembrable sin error en BD nueva o existente).
--
-- Reemplazo de cada código retirado (tabla §3 del diagnóstico):
--
-- | Código REP retirado             | Reemplazo (módulo dueño)                                   |
-- |---------------------------------|------------------------------------------------------------|
-- | reportes.avance_academico       | ACA `academico.avance` (rehabilitado en seed 59; página    |
-- |                                 | /academico/avance, vistas 170/171, GET /avance-academico)  |
-- | reportes.asistencia             | ACA `academico.asistencia.consolidado.ver` (ya activo en   |
-- |                                 | seed 59; vista 169, GET /asistencia/consolidado)           |
-- | reportes.desercion              | ACA `academico.desercion` (NUEVO en seed 59; vistas        |
-- |                                 | 172/173, GET /desercion; grano ANUAL por estados           |
-- |                                 | ABANDONO/RETIRADO de matriculas_materia)                   |
-- | reportes.solicitudes.general    | Retirado sin reemplazo: bandeja transversal prematura —    |
-- |                                 | re-evaluar cuando existan traspasos y pasantías completos  |
-- | reportes.solicitudes.becas      | Cubierto por FIN `finanzas.beca.reporte` (FIN→Reportes     |
-- |                                 | Becas) + `matricula.becas.*` (BecasList, vista 137)        |
-- | reportes.solicitudes.traspaso   | Nacerá con el ítem ACA Traspasos                           |
-- |                                 | (`academico.trazabilidad.traspaso.*`, bloque off seed 59)  |
-- | reportes.solicitudes.pasantia   | Dueño: módulo Titulación (`titulacion.pasantia.*`, seed 65)|
--
-- Deuda anotada (NO se toca aquí; ver diagnóstico §2): EXPORTAR huérfanos sin
-- endpoint en `docentes.ver`, `docentes.supervision.reporte` y
-- `capacitacion.pago`.
--
-- Frontend: el esqueleto `modules/reportes/` (rutas UnderConstruction, iconos
-- REP-*) se borra en la iteración frontend de la disolución.
-- ============================================

USE instituto_incos;

SET FOREIGN_KEY_CHECKS = 0;

-- Limpieza definitiva de las filas del módulo REP (si existieran).
-- Orden: hijas (roles_permisos, permiso_acciones) → permisos → grupos_ui.

DELETE rp FROM roles_permisos rp
JOIN permisos p ON p.id = rp.permiso_id
WHERE p.codigo IN (
  'reportes.avance_academico',
  'reportes.asistencia',
  'reportes.desercion',
  'reportes.solicitudes.general',
  'reportes.solicitudes.becas',
  'reportes.solicitudes.traspaso',
  'reportes.solicitudes.pasantia'
);

DELETE pa FROM permiso_acciones pa
JOIN permisos p ON p.id = pa.permiso_id
WHERE p.codigo IN (
  'reportes.avance_academico',
  'reportes.asistencia',
  'reportes.desercion',
  'reportes.solicitudes.general',
  'reportes.solicitudes.becas',
  'reportes.solicitudes.traspaso',
  'reportes.solicitudes.pasantia'
);

DELETE FROM permisos
WHERE codigo IN (
  'reportes.avance_academico',
  'reportes.asistencia',
  'reportes.desercion',
  'reportes.solicitudes.general',
  'reportes.solicitudes.becas',
  'reportes.solicitudes.traspaso',
  'reportes.solicitudes.pasantia'
);

DELETE FROM grupos_ui
WHERE codigo IN (
  'rep_avance',
  'rep_asistencia',
  'rep_desercion',
  'rep_solicitudes'
);

SET FOREIGN_KEY_CHECKS = 1;
