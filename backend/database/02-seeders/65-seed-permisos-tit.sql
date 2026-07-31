-- ============================================
-- SEEDER permisos · módulo Titulación (TIT)
-- Sin ids: id por AUTO_INCREMENT; tablas hijas referencian por CÓDIGO.
-- Orden: roles (55) → usuarios-admin (56) → permisos+acciones+roles por módulo (57-66).
-- Decisión de menú 2026-07-29 (docs/plan/titulacion-y-dominios-pendientes.md):
-- el dominio de menú TUT se etiqueta "Titulación"; el grupo de acompañamiento
-- pedagógico se muestra bajo ACADEMICO (menú y grilla de Seguridad) porque
-- opera sobre la vida académica regular, no sobre el camino al título.
-- Los CÓDIGOS tutorias.* y el modulo TUT no cambian (identificadores estables).
-- Fase 2 (2026-07-29): se agrega el grupo tut_pasantias (práctica laboral,
-- schema 24, R.M. 487/2023) con los permisos tutorias.pasantia / .empresa /
-- .informe / .seguimiento (rutas /api/v1/pasantias, ítem /tutorias/pasantias).
-- Roles con acceso: DIR_ACADEMICO y RECTOR (control total), SEC_ACADEMICA
-- (gestión administrativa de titulación y pasantías + lectura de alertas),
-- DOCENTE (tutor: bitácora; docente de materia: sesiones de refuerzo;
-- supervisor: informes y seguimientos de pasantía), ESTUDIANTE (su proyecto y
-- su pasantía: detalle vía guard de pertenencia en servidor). ADMIN_SISTEMA
-- hereda por vista, no se siembra.
--
-- NOTA (2026-07-31) — REVERSIÓN de la decisión "los CÓDIGOS tutorias.* y el
-- módulo TUT no cambian": el módulo pasa de TUT a TIT y los códigos pierden
-- el prefijo `tutorias.` (quedan `titulacion.*`), simétricos entre sí
-- (`titulacion.proyecto`, `titulacion.bitacora`, `titulacion.avance`,
-- `titulacion.pasantia`, `.empresa`, `.informe`, `.seguimiento`). El sub-grupo
-- Acompañamiento (`tutorias.acompanamiento.alerta/.sesion/.panel`) se retira
-- por completo de este archivo — se reclasifica a `academico.acompanamiento.*`
-- (dominio ACADEMICO, módulo ACA) en `59-seed-permisos-aca.sql`, con las
-- MISMAS acciones y roles que tenía aquí (ver ese archivo). No se borra el
-- historial de este comentario: la fecha 2026-07-29 documenta la decisión
-- original; esta nota documenta su reversión.
-- ============================================

USE instituto_incos;

SET FOREIGN_KEY_CHECKS = 0;

-- 0) Nombres amigables de los grupos de UI (grilla de Seguridad)
INSERT INTO grupos_ui (codigo, nombre, dominio, orden, activo, created_at, updated_at) VALUES
('tit_proyectos', 'Titulación (proyectos de grado)', 'TITULACION', 1, 1, NOW(), NOW()),
-- Pasantías / práctica laboral (Fase 2, schema 24): ítem de menú parent TIT
-- order 2, ruta /titulacion/pasantias.
('tit_pasantias', 'Pasantías (práctica laboral)', 'TITULACION', 2, 1, NOW(), NOW());

-- 1) Permisos del módulo TIT
INSERT INTO permisos (codigo, nombre, descripcion, dominio, modulo, grupo_ui, ruta_sidebar, activo, created_at, updated_at) VALUES
('titulacion.proyecto', 'Proyectos de grado: listar, ver detalle, crear, editar, eliminar, aprobar etapas/tutor y exportar reportes', NULL, 'TITULACION', 'TIT', 'tit_proyectos', '/titulacion/proyectos-grado', 1, NOW(), NOW()),
('titulacion.bitacora', 'Bitácora de tutoría: listar, crear y editar entradas', NULL, 'TITULACION', 'TIT', 'tit_proyectos', '/titulacion/proyectos-grado', 1, NOW(), NOW()),
('titulacion.avance', 'Avances del proyecto: listar, ver detalle/descargar y subir archivos', NULL, 'TITULACION', 'TIT', 'tit_proyectos', '/titulacion/proyectos-grado', 1, NOW(), NOW()),
('titulacion.pasantia', 'Pasantías (práctica laboral): listar, ver detalle, registrar, editar, eliminar, transicionar estados y exportar PDF de informes', NULL, 'TITULACION', 'TIT', 'tit_pasantias', '/titulacion/pasantias', 1, NOW(), NOW()),
('titulacion.pasantia.empresa', 'Catálogo de empresas de pasantía: listar, crear, editar y activar/desactivar', NULL, 'TITULACION', 'TIT', 'tit_pasantias', '/titulacion/pasantias', 1, NOW(), NOW()),
('titulacion.pasantia.informe', 'Informes de pasantía (verificación/convalidación): listar, emitir y editar', NULL, 'TITULACION', 'TIT', 'tit_pasantias', '/titulacion/pasantias', 1, NOW(), NOW()),
('titulacion.pasantia.seguimiento', 'Seguimientos de pasantía: listar, registrar y editar', NULL, 'TITULACION', 'TIT', 'tit_pasantias', '/titulacion/pasantias', 1, NOW(), NOW());

-- 2) Acciones de los permisos del módulo TIT
INSERT INTO permiso_acciones (permiso_id, accion, activo, created_at, updated_at)
SELECT p.id, x.accion, 1, NOW(), NOW()
FROM permisos p
JOIN (
  SELECT 'titulacion.proyecto' AS codigo, 'LISTAR' AS accion
  UNION ALL SELECT 'titulacion.proyecto', 'DETALLE'
  UNION ALL SELECT 'titulacion.proyecto', 'CREAR'
  UNION ALL SELECT 'titulacion.proyecto', 'EDITAR'
  UNION ALL SELECT 'titulacion.proyecto', 'ELIMINAR'
  -- APROBAR: asignar tutor (POST /:id/tutor) y transiciones de etapa (POST /:id/transiciones)
  UNION ALL SELECT 'titulacion.proyecto', 'APROBAR'
  -- EXPORTAR: bitácora mensual del tutor (PDF) y descarga de dictámenes (PDF)
  UNION ALL SELECT 'titulacion.proyecto', 'EXPORTAR'
  UNION ALL SELECT 'titulacion.bitacora', 'LISTAR'
  UNION ALL SELECT 'titulacion.bitacora', 'CREAR'
  UNION ALL SELECT 'titulacion.bitacora', 'EDITAR'
  UNION ALL SELECT 'titulacion.avance', 'LISTAR'
  UNION ALL SELECT 'titulacion.avance', 'DETALLE'
  UNION ALL SELECT 'titulacion.avance', 'CREAR'
  UNION ALL SELECT 'titulacion.pasantia', 'LISTAR'
  UNION ALL SELECT 'titulacion.pasantia', 'DETALLE'
  UNION ALL SELECT 'titulacion.pasantia', 'CREAR'
  UNION ALL SELECT 'titulacion.pasantia', 'EDITAR'
  UNION ALL SELECT 'titulacion.pasantia', 'ELIMINAR'
  -- APROBAR: transiciones de estado del trámite (POST /pasantias/:id/transiciones)
  UNION ALL SELECT 'titulacion.pasantia', 'APROBAR'
  -- EXPORTAR: descarga del PDF de informes (GET /pasantias/:id/informes/:informeId/pdf)
  UNION ALL SELECT 'titulacion.pasantia', 'EXPORTAR'
  UNION ALL SELECT 'titulacion.pasantia.empresa', 'LISTAR'
  UNION ALL SELECT 'titulacion.pasantia.empresa', 'CREAR'
  UNION ALL SELECT 'titulacion.pasantia.empresa', 'EDITAR'
  -- ACTIVAR: toggle activo del catálogo (PATCH /pasantias/empresas/:empresaId/estado)
  UNION ALL SELECT 'titulacion.pasantia.empresa', 'ACTIVAR'
  UNION ALL SELECT 'titulacion.pasantia.informe', 'LISTAR'
  UNION ALL SELECT 'titulacion.pasantia.informe', 'CREAR'
  UNION ALL SELECT 'titulacion.pasantia.informe', 'EDITAR'
  UNION ALL SELECT 'titulacion.pasantia.seguimiento', 'LISTAR'
  UNION ALL SELECT 'titulacion.pasantia.seguimiento', 'CREAR'
  UNION ALL SELECT 'titulacion.pasantia.seguimiento', 'EDITAR'
) AS x ON x.codigo = p.codigo;

-- 3) Roles-permisos del módulo TIT
-- DIR_ACADEMICO y RECTOR: control total (todas las acciones sembradas arriba).
-- NOTA Fase 2: este bloque corre DESPUÉS de los INSERTs de permisos/acciones
-- y selecciona por p.modulo = 'TIT', por lo que TAMBIÉN cubre los permisos de
-- pasantías (titulacion.pasantia*) — no se duplica un bloque propio.
INSERT INTO roles_permisos (rol_id, permiso_id, accion, activo, created_at, updated_at)
SELECT r.id, pa.permiso_id, pa.accion, 1, NOW(), NOW()
FROM roles r
JOIN permisos p ON p.modulo = 'TIT'
JOIN permiso_acciones pa ON pa.permiso_id = p.id
WHERE r.codigo IN ('DIR_ACADEMICO', 'RECTOR');

-- SEC_ACADEMICA, DOCENTE y ESTUDIANTE: subconjuntos por rol.
INSERT INTO roles_permisos (rol_id, permiso_id, accion, activo, created_at, updated_at)
SELECT r.id, p.id, g.accion, 1, NOW(), NOW()
FROM (
  -- SEC_ACADEMICA: gestión administrativa de titulación
  SELECT 'SEC_ACADEMICA' AS rol, 'titulacion.proyecto' AS codigo, 'LISTAR' AS accion
  UNION ALL SELECT 'SEC_ACADEMICA', 'titulacion.proyecto', 'DETALLE'
  UNION ALL SELECT 'SEC_ACADEMICA', 'titulacion.proyecto', 'CREAR'
  UNION ALL SELECT 'SEC_ACADEMICA', 'titulacion.proyecto', 'EDITAR'
  UNION ALL SELECT 'SEC_ACADEMICA', 'titulacion.proyecto', 'EXPORTAR'
  UNION ALL SELECT 'SEC_ACADEMICA', 'titulacion.bitacora', 'LISTAR'
  UNION ALL SELECT 'SEC_ACADEMICA', 'titulacion.avance', 'LISTAR'
  UNION ALL SELECT 'SEC_ACADEMICA', 'titulacion.avance', 'DETALLE'
  -- SEC_ACADEMICA · pasantías: gestión administrativa del trámite y del
  -- catálogo de empresas + lectura de informes/seguimientos (no emite:
  -- las transiciones/APROBAR quedan en DIR_ACADEMICO/RECTOR).
  UNION ALL SELECT 'SEC_ACADEMICA', 'titulacion.pasantia', 'LISTAR'
  UNION ALL SELECT 'SEC_ACADEMICA', 'titulacion.pasantia', 'DETALLE'
  UNION ALL SELECT 'SEC_ACADEMICA', 'titulacion.pasantia', 'CREAR'
  UNION ALL SELECT 'SEC_ACADEMICA', 'titulacion.pasantia', 'EDITAR'
  UNION ALL SELECT 'SEC_ACADEMICA', 'titulacion.pasantia', 'EXPORTAR'
  UNION ALL SELECT 'SEC_ACADEMICA', 'titulacion.pasantia.empresa', 'LISTAR'
  UNION ALL SELECT 'SEC_ACADEMICA', 'titulacion.pasantia.empresa', 'CREAR'
  UNION ALL SELECT 'SEC_ACADEMICA', 'titulacion.pasantia.empresa', 'EDITAR'
  UNION ALL SELECT 'SEC_ACADEMICA', 'titulacion.pasantia.empresa', 'ACTIVAR'
  UNION ALL SELECT 'SEC_ACADEMICA', 'titulacion.pasantia.informe', 'LISTAR'
  UNION ALL SELECT 'SEC_ACADEMICA', 'titulacion.pasantia.seguimiento', 'LISTAR'
  -- DOCENTE: tutor (bitácora)
  UNION ALL SELECT 'DOCENTE', 'titulacion.proyecto', 'LISTAR'
  UNION ALL SELECT 'DOCENTE', 'titulacion.proyecto', 'DETALLE'
  UNION ALL SELECT 'DOCENTE', 'titulacion.bitacora', 'LISTAR'
  UNION ALL SELECT 'DOCENTE', 'titulacion.bitacora', 'CREAR'
  UNION ALL SELECT 'DOCENTE', 'titulacion.bitacora', 'EDITAR'
  UNION ALL SELECT 'DOCENTE', 'titulacion.avance', 'LISTAR'
  UNION ALL SELECT 'DOCENTE', 'titulacion.avance', 'DETALLE'
  -- DOCENTE · pasantías: supervisor (LISTAR habilita el wrapper "Mis
  -- pasantías supervisadas" vía /pasantias/mis-pasantias, resuelto en
  -- servidor) + emisión/edición de informes y seguimientos + descarga PDF.
  UNION ALL SELECT 'DOCENTE', 'titulacion.pasantia', 'LISTAR'
  UNION ALL SELECT 'DOCENTE', 'titulacion.pasantia', 'DETALLE'
  UNION ALL SELECT 'DOCENTE', 'titulacion.pasantia', 'EXPORTAR'
  UNION ALL SELECT 'DOCENTE', 'titulacion.pasantia.informe', 'LISTAR'
  UNION ALL SELECT 'DOCENTE', 'titulacion.pasantia.informe', 'CREAR'
  UNION ALL SELECT 'DOCENTE', 'titulacion.pasantia.informe', 'EDITAR'
  UNION ALL SELECT 'DOCENTE', 'titulacion.pasantia.seguimiento', 'LISTAR'
  UNION ALL SELECT 'DOCENTE', 'titulacion.pasantia.seguimiento', 'CREAR'
  UNION ALL SELECT 'DOCENTE', 'titulacion.pasantia.seguimiento', 'EDITAR'
  -- ESTUDIANTE: su proyecto (guard de pertenencia en servidor, sin LISTAR
  -- de proyecto → no ve el menú Titulación; entra por /tutorias/mi-proyecto)
  UNION ALL SELECT 'ESTUDIANTE', 'titulacion.proyecto', 'DETALLE'
  UNION ALL SELECT 'ESTUDIANTE', 'titulacion.bitacora', 'LISTAR'
  UNION ALL SELECT 'ESTUDIANTE', 'titulacion.avance', 'LISTAR'
  UNION ALL SELECT 'ESTUDIANTE', 'titulacion.avance', 'DETALLE'
  UNION ALL SELECT 'ESTUDIANTE', 'titulacion.avance', 'CREAR'
  -- ESTUDIANTE · pasantías: solo su trámite vía /pasantias/mi-pasantia
  -- (DETALLE + resolveEstudianteIdForUsuario en servidor; el compuesto ya
  -- incluye informes y seguimientos, sin permisos de satélite).
  UNION ALL SELECT 'ESTUDIANTE', 'titulacion.pasantia', 'DETALLE'
) AS g
JOIN roles r ON r.codigo = g.rol
JOIN permisos p ON p.codigo = g.codigo;

SET FOREIGN_KEY_CHECKS = 1;
