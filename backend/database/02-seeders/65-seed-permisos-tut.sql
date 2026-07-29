-- ============================================
-- SEEDER permisos · módulo Titulación (TUT) + Acompañamiento pedagógico
-- Sin ids: id por AUTO_INCREMENT; tablas hijas referencian por CÓDIGO.
-- Orden: roles (55) → usuarios-admin (56) → permisos+acciones+roles por módulo (57-66).
-- Decisión de menú 2026-07-29 (docs/plan/titulacion-y-dominios-pendientes.md):
-- el dominio de menú TUT se etiqueta "Titulación"; el grupo de acompañamiento
-- pedagógico se muestra bajo ACADEMICO (menú y grilla de Seguridad) porque
-- opera sobre la vida académica regular, no sobre el camino al título.
-- Los CÓDIGOS tutorias.* y el modulo TUT no cambian (identificadores estables).
-- Roles con acceso: DIR_ACADEMICO y RECTOR (control total), SEC_ACADEMICA
-- (gestión administrativa de titulación + lectura de alertas), DOCENTE
-- (tutor: bitácora; docente de materia: sesiones de refuerzo),
-- ESTUDIANTE (su proyecto: detalle, bitácora y avances vía guard de
-- pertenencia en servidor). ADMIN_SISTEMA hereda por vista, no se siembra.
-- ============================================

USE instituto_incos;

SET FOREIGN_KEY_CHECKS = 0;

-- 0) Nombres amigables de los grupos de UI (grilla de Seguridad)
INSERT INTO grupos_ui (codigo, nombre, dominio, orden, activo, created_at, updated_at) VALUES
('tut_titulacion', 'Titulación (proyectos de grado)', 'TUTORIAS', 1, 1, NOW(), NOW()),
-- Acompañamiento vive en la pestaña Académico de la grilla; orden 30 para
-- colgar después de los grupos aca_* del seed 58.
('tut_acompanamiento', 'Acompañamiento pedagógico', 'ACADEMICO', 30, 1, NOW(), NOW());

-- 1) Permisos del módulo TUT
INSERT INTO permisos (codigo, nombre, descripcion, dominio, modulo, grupo_ui, ruta_sidebar, activo, created_at, updated_at) VALUES
('tutorias.titulacion.proyecto', 'Proyectos de grado: listar, ver detalle, crear, editar, eliminar, aprobar etapas/tutor y exportar reportes', NULL, 'TUTORIAS', 'TUT', 'tut_titulacion', '/tutorias/titulacion', 1, NOW(), NOW()),
('tutorias.titulacion.bitacora', 'Bitácora de tutoría: listar, crear y editar entradas', NULL, 'TUTORIAS', 'TUT', 'tut_titulacion', '/tutorias/titulacion', 1, NOW(), NOW()),
('tutorias.titulacion.avance', 'Avances del proyecto: listar, ver detalle/descargar y subir archivos', NULL, 'TUTORIAS', 'TUT', 'tut_titulacion', '/tutorias/titulacion', 1, NOW(), NOW()),
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
  -- ESTUDIANTE: su proyecto (guard de pertenencia en servidor, sin LISTAR
  -- de proyecto → no ve el menú Titulación; entra por /tutorias/mi-proyecto)
  UNION ALL SELECT 'ESTUDIANTE', 'tutorias.titulacion.proyecto', 'DETALLE'
  UNION ALL SELECT 'ESTUDIANTE', 'tutorias.titulacion.bitacora', 'LISTAR'
  UNION ALL SELECT 'ESTUDIANTE', 'tutorias.titulacion.avance', 'LISTAR'
  UNION ALL SELECT 'ESTUDIANTE', 'tutorias.titulacion.avance', 'DETALLE'
  UNION ALL SELECT 'ESTUDIANTE', 'tutorias.titulacion.avance', 'CREAR'
) AS g
JOIN roles r ON r.codigo = g.rol
JOIN permisos p ON p.codigo = g.codigo;

SET FOREIGN_KEY_CHECKS = 1;
