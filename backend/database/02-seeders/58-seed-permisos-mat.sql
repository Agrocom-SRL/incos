-- ============================================
-- SEEDER permisos · módulo Matrícula (MAT)
-- Sin ids: id por AUTO_INCREMENT; tablas hijas referencian por CÓDIGO.
-- Orden: roles (55) → usuarios-admin (56) → permisos+acciones+roles por módulo (57-64).
-- ============================================

USE instituto_incos;

SET FOREIGN_KEY_CHECKS = 0;

-- 0) Nombres amigables de los grupos de UI (grilla de Seguridad)
INSERT INTO grupos_ui (codigo, nombre, dominio, orden, activo, created_at, updated_at) VALUES
('mat_admision', 'Admisión', 'MATRICULA', 1, 1, NOW(), NOW()),
('mat_inscripcion', 'Matrículas', 'MATRICULA', 2, 1, NOW(), NOW()),
('mat_aportes', 'Aportes', 'MATRICULA', 3, 1, NOW(), NOW()),
('mat_becas', 'Becas', 'MATRICULA', 4, 1, NOW(), NOW()),
('mat_documentos', 'Documentos', 'MATRICULA', 5, 1, NOW(), NOW());
-- Pasantías estudiantiles: retiradas de MAT 2026-07-29. El dominio pasa al
-- módulo Titulación (TIT) con códigos titulacion.pasantia.* sobre el schema 24
-- (ver docs/plan/titulacion-y-dominios-pendientes.md, Fase 2; rename TUT→TIT
-- el 2026-07-31, ver 65-seed-permisos-tit.sql).

-- 1) Permisos del módulo MAT
INSERT INTO permisos (codigo, nombre, descripcion, dominio, modulo, grupo_ui, ruta_sidebar, activo, created_at, updated_at) VALUES
('matricula.admision.ver', 'Admisión: listar, ver ficha; exportar Excel estadística de inscritos', NULL, 'MATRICULA', 'MAT', 'mat_admision', '/estudiantes/listar', 1, NOW(), NOW()),
('matricula.admision.crear', 'Admisión: registrar nuevo estudiante', NULL, 'MATRICULA', 'MAT', 'mat_admision', '/estudiantes/listar', 1, NOW(), NOW()),
('matricula.admision.editar', 'Admisión: editar datos, eliminar y activar', NULL, 'MATRICULA', 'MAT', 'mat_admision', '/estudiantes/listar', 1, NOW(), NOW()),
('matricula.inscribir', 'Matrículas: listar, ver y crear inscripción; exportar Excel lista por carrera', NULL, 'MATRICULA', 'MAT', 'mat_inscripcion', '/matricula/listar', 1, NOW(), NOW()),
('matricula.inscripcion.editar', 'Matrículas: editar y eliminar inscripción', NULL, 'MATRICULA', 'MAT', 'mat_inscripcion', '/matricula/listar', 1, NOW(), NOW()),
('matricula.beca.ver', 'Becas: listar asignaciones, ver detalle de asignación y ficha desde contexto', NULL, 'MATRICULA', 'MAT', 'mat_becas', '/estudiantes/becas/listar', 1, NOW(), NOW()),
('matricula.beca.asignar', 'Becas: asignar, ajustar o quitar', NULL, 'MATRICULA', 'MAT', 'mat_becas', '/estudiantes/becas/listar', 1, NOW(), NOW()),
('matricula.beca.aprobar', 'Becas: aprobar solicitudes', NULL, 'MATRICULA', 'MAT', 'mat_becas', '/estudiantes/becas/listar', 1, NOW(), NOW()),
('matricula.documento.ver', 'Documentos: ver y generar PDFs (acta, declaración, formulario)', NULL, 'MATRICULA', 'MAT', 'mat_documentos', '/estudiantes/documentos', 1, NOW(), NOW()),
('matricula.pago.aporte.ver', 'Aportes: listar, detalle, editar cuotas, anular, exportar recibo PDF y Excel estado por carrera', NULL, 'MATRICULA', 'MAT', 'mat_aportes', '/matricula/aportes/listar', 1, NOW(), NOW());

-- 2) Acciones de los permisos del módulo MAT
INSERT INTO permiso_acciones (permiso_id, accion, activo, created_at, updated_at)
SELECT p.id, x.accion, 1, NOW(), NOW()
FROM permisos p
JOIN (
  SELECT 'matricula.admision.ver' AS codigo, 'LISTAR' AS accion
  UNION ALL SELECT 'matricula.admision.ver', 'DETALLE'
  UNION ALL SELECT 'matricula.admision.ver', 'EXPORTAR'
  UNION ALL SELECT 'matricula.admision.crear', 'CREAR'
  UNION ALL SELECT 'matricula.admision.editar', 'EDITAR'
  UNION ALL SELECT 'matricula.admision.editar', 'ELIMINAR'
  UNION ALL SELECT 'matricula.admision.editar', 'ACTIVAR'
  UNION ALL SELECT 'matricula.inscribir', 'LISTAR'
  UNION ALL SELECT 'matricula.inscribir', 'DETALLE'
  UNION ALL SELECT 'matricula.inscribir', 'CREAR'
  UNION ALL SELECT 'matricula.inscribir', 'EXPORTAR'
  UNION ALL SELECT 'matricula.inscripcion.editar', 'EDITAR'
  UNION ALL SELECT 'matricula.inscripcion.editar', 'ELIMINAR'
  UNION ALL SELECT 'matricula.beca.ver', 'LISTAR'
  UNION ALL SELECT 'matricula.beca.ver', 'DETALLE'
  UNION ALL SELECT 'matricula.beca.asignar', 'CREAR'
  UNION ALL SELECT 'matricula.beca.asignar', 'EDITAR'
  UNION ALL SELECT 'matricula.beca.asignar', 'ELIMINAR'
  UNION ALL SELECT 'matricula.beca.aprobar', 'APROBAR'
  UNION ALL SELECT 'matricula.documento.ver', 'LISTAR'
  UNION ALL SELECT 'matricula.documento.ver', 'GENERAR_PDF'
  UNION ALL SELECT 'matricula.pago.aporte.ver', 'LISTAR'
  UNION ALL SELECT 'matricula.pago.aporte.ver', 'DETALLE'
  UNION ALL SELECT 'matricula.pago.aporte.ver', 'EDITAR'
  UNION ALL SELECT 'matricula.pago.aporte.ver', 'ELIMINAR'
  UNION ALL SELECT 'matricula.pago.aporte.ver', 'EXPORTAR'
) AS x ON x.codigo = p.codigo;

-- 3) Roles-permisos del módulo MAT (roles 2-8; ADMIN_SISTEMA hereda por vista)
INSERT INTO roles_permisos (rol_id, permiso_id, accion, activo, created_at, updated_at)
SELECT r.id, p.id, g.accion, 1, NOW(), NOW()
FROM (
  SELECT 'RECTOR' AS rol, 'matricula.admision.ver' AS codigo, 'LISTAR' AS accion
  UNION ALL SELECT 'RECTOR', 'matricula.admision.ver', 'DETALLE'
  UNION ALL SELECT 'RECTOR', 'matricula.admision.ver', 'EXPORTAR'
  UNION ALL SELECT 'DIR_ACADEMICO', 'matricula.admision.ver', 'LISTAR'
  UNION ALL SELECT 'DIR_ACADEMICO', 'matricula.admision.ver', 'DETALLE'
  UNION ALL SELECT 'DIR_ACADEMICO', 'matricula.admision.ver', 'EXPORTAR'
  UNION ALL SELECT 'DIR_ADMIN', 'matricula.admision.ver', 'LISTAR'
  UNION ALL SELECT 'DIR_ADMIN', 'matricula.admision.ver', 'DETALLE'
  UNION ALL SELECT 'DIR_ADMIN', 'matricula.admision.ver', 'EXPORTAR'
  UNION ALL SELECT 'SEC_ADMIN', 'matricula.admision.ver', 'LISTAR'
  UNION ALL SELECT 'SEC_ADMIN', 'matricula.admision.ver', 'EXPORTAR'
  -- ESTUDIANTE: el ítem "Admisión" → SU propio detalle (EstudiantesDetail, solo lectura).
  -- DETALLE permite GET /estudiantes/:id, blindado en backend a su propio id (anti-IDOR).
  UNION ALL SELECT 'ESTUDIANTE', 'matricula.admision.ver', 'LISTAR'
  UNION ALL SELECT 'ESTUDIANTE', 'matricula.admision.ver', 'DETALLE'
  -- DOCENTE (2026-07-03): ficha SOLO de estudiantes de SUS cursos vigentes
  -- (desde "Mis estudiantes" del portal docente) — guard de alcance en servidor
  -- (estudianteAlcanceDocenteGuard sobre GET /estudiantes/:id). Sin LISTAR:
  -- el docente NO ve el listado general de admisión.
  UNION ALL SELECT 'DOCENTE', 'matricula.admision.ver', 'DETALLE'
  UNION ALL SELECT 'RECTOR', 'matricula.admision.crear', 'CREAR'
  UNION ALL SELECT 'DIR_ACADEMICO', 'matricula.admision.crear', 'CREAR'
  UNION ALL SELECT 'RECTOR', 'matricula.admision.editar', 'EDITAR'
  UNION ALL SELECT 'RECTOR', 'matricula.admision.editar', 'ELIMINAR'
  UNION ALL SELECT 'RECTOR', 'matricula.admision.editar', 'ACTIVAR'
  UNION ALL SELECT 'DIR_ACADEMICO', 'matricula.admision.editar', 'EDITAR'
  UNION ALL SELECT 'RECTOR', 'matricula.inscribir', 'LISTAR'
  UNION ALL SELECT 'RECTOR', 'matricula.inscribir', 'DETALLE'
  UNION ALL SELECT 'RECTOR', 'matricula.inscribir', 'CREAR'
  UNION ALL SELECT 'RECTOR', 'matricula.inscribir', 'EXPORTAR'
  UNION ALL SELECT 'DIR_ACADEMICO', 'matricula.inscribir', 'LISTAR'
  UNION ALL SELECT 'DIR_ACADEMICO', 'matricula.inscribir', 'DETALLE'
  UNION ALL SELECT 'DIR_ACADEMICO', 'matricula.inscribir', 'CREAR'
  UNION ALL SELECT 'DIR_ACADEMICO', 'matricula.inscribir', 'EXPORTAR'
  -- ESTUDIANTE: el ítem "Matrículas" → su propia inscripción (InscripcionesDetail, /inscripciones/:id,
  -- con materias + horario semanal, solo lectura). DETALLE blindado a su propia inscripción (anti-IDOR).
  UNION ALL SELECT 'ESTUDIANTE', 'matricula.inscribir', 'LISTAR'
  UNION ALL SELECT 'ESTUDIANTE', 'matricula.inscribir', 'DETALLE'
  UNION ALL SELECT 'RECTOR', 'matricula.inscripcion.editar', 'EDITAR'
  UNION ALL SELECT 'RECTOR', 'matricula.inscripcion.editar', 'ELIMINAR'
  UNION ALL SELECT 'DIR_ACADEMICO', 'matricula.inscripcion.editar', 'EDITAR'
  UNION ALL SELECT 'RECTOR', 'matricula.beca.ver', 'LISTAR'
  UNION ALL SELECT 'RECTOR', 'matricula.beca.ver', 'DETALLE'
  UNION ALL SELECT 'DIR_ACADEMICO', 'matricula.beca.ver', 'LISTAR'
  UNION ALL SELECT 'DIR_ACADEMICO', 'matricula.beca.ver', 'DETALLE'
  UNION ALL SELECT 'DIR_ADMIN', 'matricula.beca.ver', 'LISTAR'
  UNION ALL SELECT 'DIR_ADMIN', 'matricula.beca.ver', 'DETALLE'
  -- ESTUDIANTE (2026-08-02): ve SU propia beca ("Mi beca", misma opción de menú
  -- reutilizada vía labelByRole). Auto-filtrado server-side por estudianteId de la
  -- sesión (ListStudentScholarshipsController ignora cualquier studentId de query) +
  -- guards anti-IDOR (becaSelfOnlyGuard en /becas/:id, estudianteSelfOnlyGuard en
  -- /:id/scholarships). Sin CREAR/EDITAR/ELIMINAR/APROBAR: eso sigue siendo staff-only.
  UNION ALL SELECT 'ESTUDIANTE', 'matricula.beca.ver', 'LISTAR'
  UNION ALL SELECT 'ESTUDIANTE', 'matricula.beca.ver', 'DETALLE'
  UNION ALL SELECT 'RECTOR', 'matricula.beca.asignar', 'CREAR'
  UNION ALL SELECT 'RECTOR', 'matricula.beca.asignar', 'EDITAR'
  UNION ALL SELECT 'RECTOR', 'matricula.beca.asignar', 'ELIMINAR'
  UNION ALL SELECT 'DIR_ACADEMICO', 'matricula.beca.asignar', 'CREAR'
  UNION ALL SELECT 'DIR_ACADEMICO', 'matricula.beca.asignar', 'EDITAR'
  UNION ALL SELECT 'DIR_ACADEMICO', 'matricula.beca.asignar', 'ELIMINAR'
  UNION ALL SELECT 'DIR_ADMIN', 'matricula.beca.asignar', 'CREAR'
  UNION ALL SELECT 'DIR_ADMIN', 'matricula.beca.asignar', 'EDITAR'
  UNION ALL SELECT 'DIR_ADMIN', 'matricula.beca.asignar', 'ELIMINAR'
  UNION ALL SELECT 'RECTOR', 'matricula.beca.aprobar', 'APROBAR'
  UNION ALL SELECT 'DIR_ACADEMICO', 'matricula.beca.aprobar', 'APROBAR'
  UNION ALL SELECT 'DIR_ADMIN', 'matricula.beca.aprobar', 'APROBAR'
  UNION ALL SELECT 'RECTOR', 'matricula.documento.ver', 'LISTAR'
  UNION ALL SELECT 'RECTOR', 'matricula.documento.ver', 'GENERAR_PDF'
  UNION ALL SELECT 'DIR_ACADEMICO', 'matricula.documento.ver', 'LISTAR'
  UNION ALL SELECT 'DIR_ACADEMICO', 'matricula.documento.ver', 'GENERAR_PDF'
  UNION ALL SELECT 'RECTOR', 'matricula.pago.aporte.ver', 'LISTAR'
  UNION ALL SELECT 'RECTOR', 'matricula.pago.aporte.ver', 'DETALLE'
  UNION ALL SELECT 'RECTOR', 'matricula.pago.aporte.ver', 'EDITAR'
  UNION ALL SELECT 'RECTOR', 'matricula.pago.aporte.ver', 'ELIMINAR'
  UNION ALL SELECT 'RECTOR', 'matricula.pago.aporte.ver', 'EXPORTAR'
  UNION ALL SELECT 'DIR_ACADEMICO', 'matricula.pago.aporte.ver', 'LISTAR'
  UNION ALL SELECT 'DIR_ACADEMICO', 'matricula.pago.aporte.ver', 'EDITAR'
  UNION ALL SELECT 'DIR_ACADEMICO', 'matricula.pago.aporte.ver', 'EXPORTAR'
  UNION ALL SELECT 'DIR_ADMIN', 'matricula.pago.aporte.ver', 'LISTAR'
  UNION ALL SELECT 'DIR_ADMIN', 'matricula.pago.aporte.ver', 'DETALLE'
  UNION ALL SELECT 'DIR_ADMIN', 'matricula.pago.aporte.ver', 'EDITAR'
  UNION ALL SELECT 'DIR_ADMIN', 'matricula.pago.aporte.ver', 'ELIMINAR'
  UNION ALL SELECT 'DIR_ADMIN', 'matricula.pago.aporte.ver', 'EXPORTAR'
  UNION ALL SELECT 'SEC_ADMIN', 'matricula.pago.aporte.ver', 'LISTAR'
  UNION ALL SELECT 'SEC_ADMIN', 'matricula.pago.aporte.ver', 'DETALLE'
  UNION ALL SELECT 'SEC_ADMIN', 'matricula.pago.aporte.ver', 'EDITAR'
  UNION ALL SELECT 'SEC_ADMIN', 'matricula.pago.aporte.ver', 'EXPORTAR'
  -- ESTUDIANTE: ve SUS aportes (la misma opción de menú "Aportes"). Al entrar se redirige al
  -- detalle de su aporte (PagosDetail, /pagos/:id), blindado a su propia cabecera en backend.
  UNION ALL SELECT 'ESTUDIANTE', 'matricula.pago.aporte.ver', 'LISTAR'
  UNION ALL SELECT 'ESTUDIANTE', 'matricula.pago.aporte.ver', 'DETALLE'
) AS g
JOIN roles r ON r.codigo = g.rol
JOIN permisos p ON p.codigo = g.codigo;

-- 3b) SEC_ACADEMICA · matriculación completa (todas las acciones de cada permiso)
--     Solo los grupos de matriculación: admisión, matrículas, aportes
--     (registrar/editar/anular) y becas (asignar/aprobar). NO incluye Documentos.
--     Se genera desde permiso_acciones para no perder acciones nuevas que se
--     agreguen a estos grupos.
INSERT INTO roles_permisos (rol_id, permiso_id, accion, activo, created_at, updated_at)
SELECT r.id, pa.permiso_id, pa.accion, 1, NOW(), NOW()
FROM roles r
JOIN permisos p           ON p.grupo_ui IN ('mat_admision', 'mat_inscripcion', 'mat_aportes', 'mat_becas')
JOIN permiso_acciones pa  ON pa.permiso_id = p.id
WHERE r.codigo = 'SEC_ACADEMICA';

-- (2026-07-29) Se eliminó el bloque de deshabilitación temporal de Pasantías
-- estudiantiles: los códigos matricula.pasantia.* ya no se siembran (dominio
-- movido a Titulación/TUT, schema 24).

SET FOREIGN_KEY_CHECKS = 1;
