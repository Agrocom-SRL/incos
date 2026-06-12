-- ============================================
-- SEEDER permisos · módulo Matrícula (MAT)
-- Sin ids: id por AUTO_INCREMENT; tablas hijas referencian por CÓDIGO.
-- Orden: roles (55) → usuarios-admin (56) → permisos+acciones+roles por módulo (57-64).
-- ============================================

USE instituto_incos;

SET FOREIGN_KEY_CHECKS = 0;

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
('matricula.pago.aporte.ver', 'Aportes: listar, detalle, editar cuotas, anular, exportar recibo PDF y Excel estado por carrera', NULL, 'MATRICULA', 'MAT', 'mat_aportes', '/matricula/aportes/listar', 1, NOW(), NOW()),
('matricula.pasantia.ver', 'Pasantías estudiantiles: listar y ver', NULL, 'MATRICULA', 'MAT', 'mat_pasantias', '/pasantias/listar', 1, NOW(), NOW()),
('matricula.pasantia.solicitar', 'Pasantías estudiantiles: solicitar', NULL, 'MATRICULA', 'MAT', 'mat_pasantias', '/pasantias/listar', 1, NOW(), NOW()),
('matricula.pasantia.aprobar', 'Pasantías estudiantiles: aprobar', NULL, 'MATRICULA', 'MAT', 'mat_pasantias', '/pasantias/listar', 1, NOW(), NOW()),
('matricula.pasantia.evaluar', 'Pasantías estudiantiles: evaluación final', NULL, 'MATRICULA', 'MAT', 'mat_pasantias', '/pasantias/listar', 1, NOW(), NOW());

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
  UNION ALL SELECT 'matricula.pasantia.ver', 'LISTAR'
  UNION ALL SELECT 'matricula.pasantia.ver', 'DETALLE'
  UNION ALL SELECT 'matricula.pasantia.solicitar', 'CREAR'
  UNION ALL SELECT 'matricula.pasantia.aprobar', 'APROBAR'
  UNION ALL SELECT 'matricula.pasantia.evaluar', 'EDITAR'
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
  UNION ALL SELECT 'SEC_ACADEMICA', 'matricula.admision.ver', 'LISTAR'
  UNION ALL SELECT 'SEC_ACADEMICA', 'matricula.admision.ver', 'DETALLE'
  UNION ALL SELECT 'SEC_ACADEMICA', 'matricula.admision.ver', 'EXPORTAR'
  UNION ALL SELECT 'SEC_ADMIN', 'matricula.admision.ver', 'LISTAR'
  UNION ALL SELECT 'SEC_ADMIN', 'matricula.admision.ver', 'EXPORTAR'
  UNION ALL SELECT 'RECTOR', 'matricula.admision.crear', 'CREAR'
  UNION ALL SELECT 'DIR_ACADEMICO', 'matricula.admision.crear', 'CREAR'
  UNION ALL SELECT 'SEC_ACADEMICA', 'matricula.admision.crear', 'CREAR'
  UNION ALL SELECT 'RECTOR', 'matricula.admision.editar', 'EDITAR'
  UNION ALL SELECT 'RECTOR', 'matricula.admision.editar', 'ELIMINAR'
  UNION ALL SELECT 'RECTOR', 'matricula.admision.editar', 'ACTIVAR'
  UNION ALL SELECT 'DIR_ACADEMICO', 'matricula.admision.editar', 'EDITAR'
  UNION ALL SELECT 'SEC_ACADEMICA', 'matricula.admision.editar', 'EDITAR'
  UNION ALL SELECT 'RECTOR', 'matricula.inscribir', 'LISTAR'
  UNION ALL SELECT 'RECTOR', 'matricula.inscribir', 'DETALLE'
  UNION ALL SELECT 'RECTOR', 'matricula.inscribir', 'CREAR'
  UNION ALL SELECT 'RECTOR', 'matricula.inscribir', 'EXPORTAR'
  UNION ALL SELECT 'DIR_ACADEMICO', 'matricula.inscribir', 'LISTAR'
  UNION ALL SELECT 'DIR_ACADEMICO', 'matricula.inscribir', 'DETALLE'
  UNION ALL SELECT 'DIR_ACADEMICO', 'matricula.inscribir', 'CREAR'
  UNION ALL SELECT 'DIR_ACADEMICO', 'matricula.inscribir', 'EXPORTAR'
  UNION ALL SELECT 'SEC_ACADEMICA', 'matricula.inscribir', 'LISTAR'
  UNION ALL SELECT 'SEC_ACADEMICA', 'matricula.inscribir', 'DETALLE'
  UNION ALL SELECT 'SEC_ACADEMICA', 'matricula.inscribir', 'CREAR'
  UNION ALL SELECT 'SEC_ACADEMICA', 'matricula.inscribir', 'EXPORTAR'
  UNION ALL SELECT 'RECTOR', 'matricula.inscripcion.editar', 'EDITAR'
  UNION ALL SELECT 'RECTOR', 'matricula.inscripcion.editar', 'ELIMINAR'
  UNION ALL SELECT 'DIR_ACADEMICO', 'matricula.inscripcion.editar', 'EDITAR'
  UNION ALL SELECT 'SEC_ACADEMICA', 'matricula.inscripcion.editar', 'EDITAR'
  UNION ALL SELECT 'RECTOR', 'matricula.beca.ver', 'LISTAR'
  UNION ALL SELECT 'RECTOR', 'matricula.beca.ver', 'DETALLE'
  UNION ALL SELECT 'DIR_ACADEMICO', 'matricula.beca.ver', 'LISTAR'
  UNION ALL SELECT 'DIR_ACADEMICO', 'matricula.beca.ver', 'DETALLE'
  UNION ALL SELECT 'DIR_ADMIN', 'matricula.beca.ver', 'LISTAR'
  UNION ALL SELECT 'DIR_ADMIN', 'matricula.beca.ver', 'DETALLE'
  UNION ALL SELECT 'SEC_ACADEMICA', 'matricula.beca.ver', 'LISTAR'
  UNION ALL SELECT 'SEC_ACADEMICA', 'matricula.beca.ver', 'DETALLE'
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
  UNION ALL SELECT 'SEC_ACADEMICA', 'matricula.beca.asignar', 'CREAR'
  UNION ALL SELECT 'SEC_ACADEMICA', 'matricula.beca.asignar', 'EDITAR'
  UNION ALL SELECT 'RECTOR', 'matricula.beca.aprobar', 'APROBAR'
  UNION ALL SELECT 'DIR_ACADEMICO', 'matricula.beca.aprobar', 'APROBAR'
  UNION ALL SELECT 'DIR_ADMIN', 'matricula.beca.aprobar', 'APROBAR'
  UNION ALL SELECT 'RECTOR', 'matricula.documento.ver', 'LISTAR'
  UNION ALL SELECT 'RECTOR', 'matricula.documento.ver', 'GENERAR_PDF'
  UNION ALL SELECT 'DIR_ACADEMICO', 'matricula.documento.ver', 'LISTAR'
  UNION ALL SELECT 'DIR_ACADEMICO', 'matricula.documento.ver', 'GENERAR_PDF'
  UNION ALL SELECT 'SEC_ACADEMICA', 'matricula.documento.ver', 'LISTAR'
  UNION ALL SELECT 'SEC_ACADEMICA', 'matricula.documento.ver', 'GENERAR_PDF'
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
  UNION ALL SELECT 'SEC_ACADEMICA', 'matricula.pago.aporte.ver', 'LISTAR'
  UNION ALL SELECT 'SEC_ACADEMICA', 'matricula.pago.aporte.ver', 'EDITAR'
  UNION ALL SELECT 'SEC_ACADEMICA', 'matricula.pago.aporte.ver', 'EXPORTAR'
  UNION ALL SELECT 'SEC_ADMIN', 'matricula.pago.aporte.ver', 'LISTAR'
  UNION ALL SELECT 'SEC_ADMIN', 'matricula.pago.aporte.ver', 'DETALLE'
  UNION ALL SELECT 'SEC_ADMIN', 'matricula.pago.aporte.ver', 'EDITAR'
  UNION ALL SELECT 'SEC_ADMIN', 'matricula.pago.aporte.ver', 'EXPORTAR'
  UNION ALL SELECT 'ESTUDIANTE', 'matricula.pago.aporte.ver', 'LISTAR'
  UNION ALL SELECT 'RECTOR', 'matricula.pasantia.ver', 'LISTAR'
  UNION ALL SELECT 'RECTOR', 'matricula.pasantia.ver', 'DETALLE'
  UNION ALL SELECT 'DIR_ACADEMICO', 'matricula.pasantia.ver', 'LISTAR'
  UNION ALL SELECT 'DIR_ACADEMICO', 'matricula.pasantia.ver', 'DETALLE'
  UNION ALL SELECT 'DIR_ADMIN', 'matricula.pasantia.ver', 'LISTAR'
  UNION ALL SELECT 'DIR_ADMIN', 'matricula.pasantia.ver', 'DETALLE'
  UNION ALL SELECT 'SEC_ACADEMICA', 'matricula.pasantia.ver', 'LISTAR'
  UNION ALL SELECT 'SEC_ACADEMICA', 'matricula.pasantia.ver', 'DETALLE'
  UNION ALL SELECT 'ESTUDIANTE', 'matricula.pasantia.ver', 'LISTAR'
  UNION ALL SELECT 'ESTUDIANTE', 'matricula.pasantia.ver', 'DETALLE'
  UNION ALL SELECT 'RECTOR', 'matricula.pasantia.solicitar', 'CREAR'
  UNION ALL SELECT 'DIR_ACADEMICO', 'matricula.pasantia.solicitar', 'CREAR'
  UNION ALL SELECT 'ESTUDIANTE', 'matricula.pasantia.solicitar', 'CREAR'
  UNION ALL SELECT 'RECTOR', 'matricula.pasantia.aprobar', 'APROBAR'
  UNION ALL SELECT 'DIR_ACADEMICO', 'matricula.pasantia.aprobar', 'APROBAR'
  UNION ALL SELECT 'RECTOR', 'matricula.pasantia.evaluar', 'EDITAR'
  UNION ALL SELECT 'DIR_ACADEMICO', 'matricula.pasantia.evaluar', 'EDITAR'
) AS g
JOIN roles r ON r.codigo = g.rol
JOIN permisos p ON p.codigo = g.codigo;

SET FOREIGN_KEY_CHECKS = 1;
