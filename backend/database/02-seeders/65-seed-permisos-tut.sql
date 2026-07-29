-- ============================================
-- SEEDER permisos · módulo Titulación (TUT) + Acompañamiento pedagógico
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
-- ============================================

USE instituto_incos;

SET FOREIGN_KEY_CHECKS = 0;

-- 0) Nombres amigables de los grupos de UI (grilla de Seguridad)
INSERT INTO grupos_ui (codigo, nombre, dominio, orden, activo, created_at, updated_at) VALUES
('tut_titulacion', 'Titulación (proyectos de grado)', 'TUTORIAS', 1, 1, NOW(), NOW()),
-- Pasantías / práctica laboral (Fase 2, schema 24): ítem de menú parent TUT
-- order 2, ruta /tutorias/pasantias.
('tut_pasantias', 'Pasantías (práctica laboral)', 'TUTORIAS', 2, 1, NOW(), NOW()),
-- Acompañamiento vive en la pestaña Académico de la grilla; orden 30 para
-- colgar después de los grupos aca_* del seed 58.
('tut_acompanamiento', 'Acompañamiento pedagógico', 'ACADEMICO', 30, 1, NOW(), NOW());

-- 1) Permisos del módulo TUT
INSERT INTO permisos (codigo, nombre, descripcion, dominio, modulo, grupo_ui, ruta_sidebar, activo, created_at, updated_at) VALUES
('tutorias.titulacion.proyecto', 'Proyectos de grado: listar, ver detalle, crear, editar, eliminar, aprobar etapas/tutor y exportar reportes', NULL, 'TUTORIAS', 'TUT', 'tut_titulacion', '/tutorias/titulacion', 1, NOW(), NOW()),
('tutorias.titulacion.bitacora', 'Bitácora de tutoría: listar, crear y editar entradas', NULL, 'TUTORIAS', 'TUT', 'tut_titulacion', '/tutorias/titulacion', 1, NOW(), NOW()),
('tutorias.titulacion.avance', 'Avances del proyecto: listar, ver detalle/descargar y subir archivos', NULL, 'TUTORIAS', 'TUT', 'tut_titulacion', '/tutorias/titulacion', 1, NOW(), NOW()),
('tutorias.pasantia', 'Pasantías (práctica laboral): listar, ver detalle, registrar, editar, eliminar, transicionar estados y exportar PDF de informes', NULL, 'TUTORIAS', 'TUT', 'tut_pasantias', '/tutorias/pasantias', 1, NOW(), NOW()),
('tutorias.pasantia.empresa', 'Catálogo de empresas de pasantía: listar, crear, editar y activar/desactivar', NULL, 'TUTORIAS', 'TUT', 'tut_pasantias', '/tutorias/pasantias', 1, NOW(), NOW()),
('tutorias.pasantia.informe', 'Informes de pasantía (verificación/convalidación): listar, emitir y editar', NULL, 'TUTORIAS', 'TUT', 'tut_pasantias', '/tutorias/pasantias', 1, NOW(), NOW()),
('tutorias.pasantia.seguimiento', 'Seguimientos de pasantía: listar, registrar y editar', NULL, 'TUTORIAS', 'TUT', 'tut_pasantias', '/tutorias/pasantias', 1, NOW(), NOW()),
('tutorias.acompanamiento.alerta', 'Alertas de riesgo pedagógico: listar y ver detalle por estudiante', NULL, 'ACADEMICO', 'TUT', 'tut_acompanamiento', '/tutorias/acompanamiento/alertas', 1, NOW(), NOW()),
('tutorias.acompanamiento.sesion', 'Sesiones de refuerzo: listar, ver detalle, crear, editar y eliminar', NULL, 'ACADEMICO', 'TUT', 'tut_acompanamiento', '/tutorias/acompanamiento/sesiones', 1, NOW(), NOW()),
('tutorias.acompanamiento.panel', 'Panel de acompañamiento: ver indicadores y exportar PDF', NULL, 'ACADEMICO', 'TUT', 'tut_acompanamiento', '/tutorias/acompanamiento/panel', 1, NOW(), NOW());

-- 2) Acciones de los permisos del módulo TUT
INSERT INTO permiso_acciones (permiso_id, accion, activo, created_at, updated_at)
SELECT p.id, x.accion, 1, NOW(), NOW()
FROM permisos p
JOIN (
  SELECT 'tutorias.titulacion.proyecto' AS codigo, 'LISTAR' AS accion
  UNION ALL SELECT 'tutorias.titulacion.proyecto', 'DETALLE'
  UNION ALL SELECT 'tutorias.titulacion.proyecto', 'CREAR'
  UNION ALL SELECT 'tutorias.titulacion.proyecto', 'EDITAR'
  UNION ALL SELECT 'tutorias.titulacion.proyecto', 'ELIMINAR'
  -- APROBAR: asignar tutor (POST /:id/tutor) y transiciones de etapa (POST /:id/transiciones)
  UNION ALL SELECT 'tutorias.titulacion.proyecto', 'APROBAR'
  -- EXPORTAR: bitácora mensual del tutor (PDF) y descarga de dictámenes (PDF)
  UNION ALL SELECT 'tutorias.titulacion.proyecto', 'EXPORTAR'
  UNION ALL SELECT 'tutorias.titulacion.bitacora', 'LISTAR'
  UNION ALL SELECT 'tutorias.titulacion.bitacora', 'CREAR'
  UNION ALL SELECT 'tutorias.titulacion.bitacora', 'EDITAR'
  UNION ALL SELECT 'tutorias.titulacion.avance', 'LISTAR'
  UNION ALL SELECT 'tutorias.titulacion.avance', 'DETALLE'
  UNION ALL SELECT 'tutorias.titulacion.avance', 'CREAR'
  UNION ALL SELECT 'tutorias.pasantia', 'LISTAR'
  UNION ALL SELECT 'tutorias.pasantia', 'DETALLE'
  UNION ALL SELECT 'tutorias.pasantia', 'CREAR'
  UNION ALL SELECT 'tutorias.pasantia', 'EDITAR'
  UNION ALL SELECT 'tutorias.pasantia', 'ELIMINAR'
  -- APROBAR: transiciones de estado del trámite (POST /pasantias/:id/transiciones)
  UNION ALL SELECT 'tutorias.pasantia', 'APROBAR'
  -- EXPORTAR: descarga del PDF de informes (GET /pasantias/:id/informes/:informeId/pdf)
  UNION ALL SELECT 'tutorias.pasantia', 'EXPORTAR'
  UNION ALL SELECT 'tutorias.pasantia.empresa', 'LISTAR'
  UNION ALL SELECT 'tutorias.pasantia.empresa', 'CREAR'
  UNION ALL SELECT 'tutorias.pasantia.empresa', 'EDITAR'
  -- ACTIVAR: toggle activo del catálogo (PATCH /pasantias/empresas/:empresaId/estado)
  UNION ALL SELECT 'tutorias.pasantia.empresa', 'ACTIVAR'
  UNION ALL SELECT 'tutorias.pasantia.informe', 'LISTAR'
  UNION ALL SELECT 'tutorias.pasantia.informe', 'CREAR'
  UNION ALL SELECT 'tutorias.pasantia.informe', 'EDITAR'
  UNION ALL SELECT 'tutorias.pasantia.seguimiento', 'LISTAR'
  UNION ALL SELECT 'tutorias.pasantia.seguimiento', 'CREAR'
  UNION ALL SELECT 'tutorias.pasantia.seguimiento', 'EDITAR'
  UNION ALL SELECT 'tutorias.acompanamiento.alerta', 'LISTAR'
  UNION ALL SELECT 'tutorias.acompanamiento.alerta', 'DETALLE'
  UNION ALL SELECT 'tutorias.acompanamiento.sesion', 'LISTAR'
  UNION ALL SELECT 'tutorias.acompanamiento.sesion', 'DETALLE'
  UNION ALL SELECT 'tutorias.acompanamiento.sesion', 'CREAR'
  UNION ALL SELECT 'tutorias.acompanamiento.sesion', 'EDITAR'
  UNION ALL SELECT 'tutorias.acompanamiento.sesion', 'ELIMINAR'
  UNION ALL SELECT 'tutorias.acompanamiento.panel', 'LISTAR'
  UNION ALL SELECT 'tutorias.acompanamiento.panel', 'EXPORTAR'
) AS x ON x.codigo = p.codigo;

-- 3) Roles-permisos del módulo TUT
-- DIR_ACADEMICO y RECTOR: control total (todas las acciones sembradas arriba).
-- NOTA Fase 2: este bloque corre DESPUÉS de los INSERTs de permisos/acciones
-- y selecciona por p.modulo = 'TUT', por lo que TAMBIÉN cubre los permisos de
-- pasantías (tutorias.pasantia*) — no se duplica un bloque propio.
INSERT INTO roles_permisos (rol_id, permiso_id, accion, activo, created_at, updated_at)
SELECT r.id, pa.permiso_id, pa.accion, 1, NOW(), NOW()
FROM roles r
JOIN permisos p ON p.modulo = 'TUT'
JOIN permiso_acciones pa ON pa.permiso_id = p.id
WHERE r.codigo IN ('DIR_ACADEMICO', 'RECTOR');

-- SEC_ACADEMICA, DOCENTE y ESTUDIANTE: subconjuntos por rol.
INSERT INTO roles_permisos (rol_id, permiso_id, accion, activo, created_at, updated_at)
SELECT r.id, p.id, g.accion, 1, NOW(), NOW()
FROM (
  -- SEC_ACADEMICA: gestión administrativa de titulación + lectura de alertas
  SELECT 'SEC_ACADEMICA' AS rol, 'tutorias.titulacion.proyecto' AS codigo, 'LISTAR' AS accion
  UNION ALL SELECT 'SEC_ACADEMICA', 'tutorias.titulacion.proyecto', 'DETALLE'
  UNION ALL SELECT 'SEC_ACADEMICA', 'tutorias.titulacion.proyecto', 'CREAR'
  UNION ALL SELECT 'SEC_ACADEMICA', 'tutorias.titulacion.proyecto', 'EDITAR'
  UNION ALL SELECT 'SEC_ACADEMICA', 'tutorias.titulacion.proyecto', 'EXPORTAR'
  UNION ALL SELECT 'SEC_ACADEMICA', 'tutorias.titulacion.bitacora', 'LISTAR'
  UNION ALL SELECT 'SEC_ACADEMICA', 'tutorias.titulacion.avance', 'LISTAR'
  UNION ALL SELECT 'SEC_ACADEMICA', 'tutorias.titulacion.avance', 'DETALLE'
  UNION ALL SELECT 'SEC_ACADEMICA', 'tutorias.acompanamiento.alerta', 'LISTAR'
  UNION ALL SELECT 'SEC_ACADEMICA', 'tutorias.acompanamiento.alerta', 'DETALLE'
  -- SEC_ACADEMICA · pasantías: gestión administrativa del trámite y del
  -- catálogo de empresas + lectura de informes/seguimientos (no emite:
  -- las transiciones/APROBAR quedan en DIR_ACADEMICO/RECTOR).
  UNION ALL SELECT 'SEC_ACADEMICA', 'tutorias.pasantia', 'LISTAR'
  UNION ALL SELECT 'SEC_ACADEMICA', 'tutorias.pasantia', 'DETALLE'
  UNION ALL SELECT 'SEC_ACADEMICA', 'tutorias.pasantia', 'CREAR'
  UNION ALL SELECT 'SEC_ACADEMICA', 'tutorias.pasantia', 'EDITAR'
  UNION ALL SELECT 'SEC_ACADEMICA', 'tutorias.pasantia', 'EXPORTAR'
  UNION ALL SELECT 'SEC_ACADEMICA', 'tutorias.pasantia.empresa', 'LISTAR'
  UNION ALL SELECT 'SEC_ACADEMICA', 'tutorias.pasantia.empresa', 'CREAR'
  UNION ALL SELECT 'SEC_ACADEMICA', 'tutorias.pasantia.empresa', 'EDITAR'
  UNION ALL SELECT 'SEC_ACADEMICA', 'tutorias.pasantia.empresa', 'ACTIVAR'
  UNION ALL SELECT 'SEC_ACADEMICA', 'tutorias.pasantia.informe', 'LISTAR'
  UNION ALL SELECT 'SEC_ACADEMICA', 'tutorias.pasantia.seguimiento', 'LISTAR'
  -- DOCENTE: tutor (bitácora) + docente de materia (alertas y sesiones)
  UNION ALL SELECT 'DOCENTE', 'tutorias.titulacion.proyecto', 'LISTAR'
  UNION ALL SELECT 'DOCENTE', 'tutorias.titulacion.proyecto', 'DETALLE'
  UNION ALL SELECT 'DOCENTE', 'tutorias.titulacion.bitacora', 'LISTAR'
  UNION ALL SELECT 'DOCENTE', 'tutorias.titulacion.bitacora', 'CREAR'
  UNION ALL SELECT 'DOCENTE', 'tutorias.titulacion.bitacora', 'EDITAR'
  UNION ALL SELECT 'DOCENTE', 'tutorias.titulacion.avance', 'LISTAR'
  UNION ALL SELECT 'DOCENTE', 'tutorias.titulacion.avance', 'DETALLE'
  UNION ALL SELECT 'DOCENTE', 'tutorias.acompanamiento.alerta', 'LISTAR'
  UNION ALL SELECT 'DOCENTE', 'tutorias.acompanamiento.alerta', 'DETALLE'
  UNION ALL SELECT 'DOCENTE', 'tutorias.acompanamiento.sesion', 'LISTAR'
  UNION ALL SELECT 'DOCENTE', 'tutorias.acompanamiento.sesion', 'DETALLE'
  UNION ALL SELECT 'DOCENTE', 'tutorias.acompanamiento.sesion', 'CREAR'
  UNION ALL SELECT 'DOCENTE', 'tutorias.acompanamiento.sesion', 'EDITAR'
  -- DOCENTE · pasantías: supervisor (LISTAR habilita el wrapper "Mis
  -- pasantías supervisadas" vía /pasantias/mis-pasantias, resuelto en
  -- servidor) + emisión/edición de informes y seguimientos + descarga PDF.
  UNION ALL SELECT 'DOCENTE', 'tutorias.pasantia', 'LISTAR'
  UNION ALL SELECT 'DOCENTE', 'tutorias.pasantia', 'DETALLE'
  UNION ALL SELECT 'DOCENTE', 'tutorias.pasantia', 'EXPORTAR'
  UNION ALL SELECT 'DOCENTE', 'tutorias.pasantia.informe', 'LISTAR'
  UNION ALL SELECT 'DOCENTE', 'tutorias.pasantia.informe', 'CREAR'
  UNION ALL SELECT 'DOCENTE', 'tutorias.pasantia.informe', 'EDITAR'
  UNION ALL SELECT 'DOCENTE', 'tutorias.pasantia.seguimiento', 'LISTAR'
  UNION ALL SELECT 'DOCENTE', 'tutorias.pasantia.seguimiento', 'CREAR'
  UNION ALL SELECT 'DOCENTE', 'tutorias.pasantia.seguimiento', 'EDITAR'
  -- ESTUDIANTE: su proyecto (guard de pertenencia en servidor, sin LISTAR
  -- de proyecto → no ve el menú Titulación; entra por /tutorias/mi-proyecto)
  UNION ALL SELECT 'ESTUDIANTE', 'tutorias.titulacion.proyecto', 'DETALLE'
  UNION ALL SELECT 'ESTUDIANTE', 'tutorias.titulacion.bitacora', 'LISTAR'
  UNION ALL SELECT 'ESTUDIANTE', 'tutorias.titulacion.avance', 'LISTAR'
  UNION ALL SELECT 'ESTUDIANTE', 'tutorias.titulacion.avance', 'DETALLE'
  UNION ALL SELECT 'ESTUDIANTE', 'tutorias.titulacion.avance', 'CREAR'
  -- ESTUDIANTE · pasantías: solo su trámite vía /pasantias/mi-pasantia
  -- (DETALLE + resolveEstudianteIdForUsuario en servidor; el compuesto ya
  -- incluye informes y seguimientos, sin permisos de satélite).
  UNION ALL SELECT 'ESTUDIANTE', 'tutorias.pasantia', 'DETALLE'
) AS g
JOIN roles r ON r.codigo = g.rol
JOIN permisos p ON p.codigo = g.codigo;

SET FOREIGN_KEY_CHECKS = 1;
