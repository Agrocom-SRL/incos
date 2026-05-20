-- ============================================
-- MIGRACIÓN: rutas ACA + grupos UI horarios (sin re-seed completo)
-- Ejecutar en BD existente tras actualizar 54-seed-permisos.sql
-- ============================================

USE instituto_incos;

-- Dominio ACADÉMICO: rutas bajo /academico/*
UPDATE permisos SET ruta_sidebar = '/academico/calificaciones' WHERE id IN (15, 16, 17, 18, 19, 20);
UPDATE permisos SET ruta_sidebar = '/academico/nivelaciones/listar' WHERE id IN (21, 22, 23);
UPDATE permisos SET ruta_sidebar = '/academico/traspasos/listar' WHERE id IN (24, 25, 26, 27, 28);
UPDATE permisos SET ruta_sidebar = '/academico/transitabilidad/listar' WHERE id IN (29, 30, 31, 32, 33);
UPDATE permisos SET ruta_sidebar = '/academico/historial/academico' WHERE id IN (34, 35, 36);
UPDATE permisos SET ruta_sidebar = '/academico/licencias/listar' WHERE id IN (38, 39, 40);

-- Horarios: una fila de grilla por etapa (evita choques de URL en RolPermisosPage)
UPDATE permisos SET grupo_ui = 'inst_horarios_plantilla', ruta_sidebar = '/institucional/horarios/plantilla' WHERE id = 97;
UPDATE permisos SET grupo_ui = 'inst_horarios_armado', ruta_sidebar = '/institucional/horarios/armado' WHERE id IN (98, 99);
UPDATE permisos SET grupo_ui = 'inst_horarios_publicacion', ruta_sidebar = '/institucional/horarios/publicacion' WHERE id = 100;

-- Catálogos de referencia: no comparten pantalla con Config. académica (permiso transversal API)
UPDATE permisos SET
  grupo_ui = 'cfg_catalogos',
  ruta_sidebar = '(sin menú) API /api/v1: paises, provincias, municipios, idiomas, documentacion, metodos-pago, bancos, dashboard'
WHERE id = 101;

UPDATE permisos SET ruta_sidebar = '/configuracion/datos-complementarios' WHERE id IN (78, 79, 80);
