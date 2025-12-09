-- ============================================
-- DATOS INICIALES: ROLES, PERMISOS Y USUARIOS
-- Instituto INCOS Santa Cruz
-- ============================================

USE instituto_incos;

-- ============================================
-- 1. INSERTAR ROLES
-- ============================================

INSERT INTO roles (codigo, nombre, descripcion, nivel_acceso) VALUES
-- ADMINISTRATIVOS
('RECTOR', 'Rector', 'Máxima autoridad del instituto. Acceso total al sistema.', 5),
('DIRECTOR_ACADEMICO', 'Director Académico', 'Gestión académica, docentes, calificaciones, supervisión docente.', 4),
('DIRECTOR_ADMINISTRATIVO', 'Director Administrativo', 'Gestión administrativa, finanzas, becas, pagos, personal.', 4),
('SECRETARIA', 'Secretaria', 'Inscripciones, documentos, atención al público, registros.', 3),
('PORTERIA', 'Portería', 'Control de acceso, consultas básicas.', 1),

-- DOCENTES (por carrera)
('DOCENTE_CONTADURIA', 'Docente de Contaduría General', 'Registro de notas y asistencia de sus materias asignadas.', 2),
('DOCENTE_SISTEMAS', 'Docente de Sistemas Informáticos', 'Registro de notas y asistencia de sus materias asignadas.', 2),
('DOCENTE_ADMINISTRACION', 'Docente de Administración de Empresas', 'Registro de notas y asistencia de sus materias asignadas.', 2),

-- ESTUDIANTES
('ESTUDIANTE', 'Estudiante', 'Consulta de información académica propia.', 1),

-- ROLES TÉCNICOS
('ADMINISTRADOR_SISTEMA', 'Administrador de Sistema', 'Configuración técnica, usuarios, permisos, backup.', 5),
('SOPORTE_TECNICO', 'Soporte Técnico', 'Ayuda a usuarios, reportes de errores, mantenimiento.', 2);

-- ============================================
-- 2. INSERTAR PERMISOS (140+)
-- ============================================

-- MÓDULO: ESTUDIANTES
INSERT INTO permisos (codigo, nombre, modulo, accion, descripcion) VALUES
('estudiantes.ver', 'Ver Estudiantes', 'ESTUDIANTES', 'VER', 'Ver listado y detalles de estudiantes'),
('estudiantes.crear', 'Crear Estudiante', 'ESTUDIANTES', 'CREAR', 'Registrar nuevos estudiantes'),
('estudiantes.editar', 'Editar Estudiante', 'ESTUDIANTES', 'EDITAR', 'Modificar datos de estudiantes'),
('estudiantes.eliminar', 'Eliminar Estudiante', 'ESTUDIANTES', 'ELIMINAR', 'Dar de baja estudiantes'),
('estudiantes.buscar', 'Buscar Estudiantes', 'ESTUDIANTES', 'VER', 'Búsqueda avanzada de estudiantes'),
('estudiantes.exportar', 'Exportar Estudiantes', 'ESTUDIANTES', 'EXPORTAR', 'Exportar datos a Excel/PDF'),
('estudiantes.foto', 'Subir Foto', 'ESTUDIANTES', 'EDITAR', 'Cargar fotografía del estudiante'),
('estudiantes.historial', 'Ver Historial Completo', 'ESTUDIANTES', 'VER', 'Acceso a historial académico completo'),

-- MÓDULO: INSCRIPCIONES
('inscripciones.ver', 'Ver Inscripciones', 'INSCRIPCIONES', 'VER', 'Ver inscripciones de estudiantes'),
('inscripciones.crear', 'Crear Inscripción', 'INSCRIPCIONES', 'CREAR', 'Registrar nueva inscripción'),
('inscripciones.editar', 'Editar Inscripción', 'INSCRIPCIONES', 'EDITAR', 'Modificar inscripción'),
('inscripciones.aprobar', 'Aprobar Inscripción', 'INSCRIPCIONES', 'APROBAR', 'Aprobar inscripción de estudiante'),
('inscripciones.anular', 'Anular Inscripción', 'INSCRIPCIONES', 'ELIMINAR', 'Anular una inscripción'),
('inscripciones.materias', 'Gestionar Materias', 'INSCRIPCIONES', 'EDITAR', 'Agregar/quitar materias'),

-- MÓDULO: CALIFICACIONES
('calificaciones.ver', 'Ver Calificaciones', 'CALIFICACIONES', 'VER', 'Consultar notas de estudiantes'),
('calificaciones.ver_propias', 'Ver Calificaciones Propias', 'CALIFICACIONES', 'VER', 'Solo sus propias materias (docente)'),
('calificaciones.registrar', 'Registrar Notas', 'CALIFICACIONES', 'CREAR', 'Ingresar calificaciones'),
('calificaciones.editar', 'Editar Notas', 'CALIFICACIONES', 'EDITAR', 'Modificar calificaciones'),
('calificaciones.aprobar', 'Aprobar Notas', 'CALIFICACIONES', 'APROBAR', 'Aprobar actas de notas'),
('calificaciones.boletin', 'Generar Boletines', 'CALIFICACIONES', 'EXPORTAR', 'Crear boletines PDF'),

-- MÓDULO: NIVELACIÓN
('nivelacion.ver', 'Ver Nivelaciones', 'NIVELACION', 'VER', 'Consultar materias en nivelación'),
('nivelacion.registrar', 'Registrar Nivelación', 'NIVELACION', 'CREAR', 'Inscribir materia en nivelación'),
('nivelacion.calendario', 'Gestionar Calendario', 'NIVELACION', 'EDITAR', 'Programar fechas de nivelación'),
('nivelacion.resultados', 'Registrar Resultados', 'NIVELACION', 'EDITAR', 'Ingresar notas de nivelación'),

-- MÓDULO: BECAS
('becas.ver', 'Ver Becas', 'BECAS', 'VER', 'Consultar becas y beneficiarios'),
('becas.asignar', 'Asignar Beca', 'BECAS', 'CREAR', 'Otorgar beca a estudiante'),
('becas.editar', 'Editar Beca', 'BECAS', 'EDITAR', 'Modificar asignación de beca'),
('becas.suspender', 'Suspender Beca', 'BECAS', 'EDITAR', 'Suspender beca de estudiante'),
('becas.cupos', 'Gestionar Cupos', 'BECAS', 'EDITAR', 'Administrar cupos de becas'),

-- MÓDULO: DOCUMENTOS
('documentos.ver', 'Ver Documentos', 'DOCUMENTOS', 'VER', 'Consultar documentos de estudiantes'),
('documentos.subir', 'Subir Documentos', 'DOCUMENTOS', 'CREAR', 'Cargar documentos escaneados'),
('documentos.verificar', 'Verificar Documentos', 'DOCUMENTOS', 'EDITAR', 'Cambiar estado de documentos'),
('documentos.aprobar', 'Aprobar Documentos', 'DOCUMENTOS', 'APROBAR', 'Aprobar documentación completa'),
('documentos.rechazar', 'Rechazar Documentos', 'DOCUMENTOS', 'EDITAR', 'Rechazar documentos incorrectos'),

-- MÓDULO: PASANTÍAS
('pasantias.ver', 'Ver Pasantías', 'PASANTIAS', 'VER', 'Consultar pasantías laborales'),
('pasantias.crear', 'Crear Pasantía', 'PASANTIAS', 'CREAR', 'Asignar estudiante a pasantía'),
('pasantias.editar', 'Editar Pasantía', 'PASANTIAS', 'EDITAR', 'Modificar datos de pasantía'),
('pasantias.evaluar', 'Evaluar Pasantía', 'PASANTIAS', 'EDITAR', 'Registrar evaluación de desempeño'),
('pasantias.empresas', 'Gestionar Empresas', 'PASANTIAS', 'EDITAR', 'Administrar catálogo de empresas'),

-- MÓDULO: LICENCIAS
('licencias.ver', 'Ver Licencias', 'LICENCIAS', 'VER', 'Consultar solicitudes de licencias'),
('licencias.solicitar', 'Solicitar Licencia', 'LICENCIAS', 'CREAR', 'Crear solicitud de licencia'),
('licencias.aprobar', 'Aprobar Licencias', 'LICENCIAS', 'APROBAR', 'Aprobar/rechazar licencias'),
('licencias.historial', 'Ver Historial', 'LICENCIAS', 'VER', 'Consultar historial de licencias'),

-- MÓDULO: SUPERVISIÓN DOCENTE
('supervision.ver', 'Ver Supervisiones', 'SUPERVISION', 'VER', 'Consultar supervisiones de clases'),
('supervision.programar', 'Programar Supervisión', 'SUPERVISION', 'CREAR', 'Agendar supervisión de clase'),
('supervision.realizar', 'Realizar Supervisión', 'SUPERVISION', 'EDITAR', 'Llenar ficha de observación'),
('supervision.reportes', 'Reportes de Calidad', 'SUPERVISION', 'VER', 'Ver reportes de supervisión'),

-- MÓDULO: HISTORIAL ACADÉMICO
('historial.ver', 'Ver Historial', 'HISTORIAL', 'VER', 'Consultar historial académico'),
('historial.generar', 'Generar Historial', 'HISTORIAL', 'CREAR', 'Crear historial oficial'),
('historial.libro', 'Gestionar Libros', 'HISTORIAL', 'EDITAR', 'Administrar libros de registro'),
('historial.pdf', 'Generar PDF Oficial', 'HISTORIAL', 'EXPORTAR', 'Crear PDF con firmas'),

-- MÓDULO: REPORTES
('reportes.dashboard', 'Ver Dashboard', 'REPORTES', 'VER', 'Acceso a dashboard ejecutivo'),
('reportes.estadisticas', 'Ver Estadísticas', 'REPORTES', 'VER', 'Consultar estadísticas generales'),
('reportes.exportar', 'Exportar Reportes', 'REPORTES', 'EXPORTAR', 'Descargar reportes en Excel/PDF'),
('reportes.personalizados', 'Reportes Personalizados', 'REPORTES', 'VER', 'Crear reportes personalizados'),

-- MÓDULO: PAGOS
('pagos.ver', 'Ver Pagos', 'PAGOS', 'VER', 'Consultar pagos de estudiantes'),
('pagos.registrar', 'Registrar Pago', 'PAGOS', 'CREAR', 'Ingresar pago de arancel'),
('pagos.anular', 'Anular Pago', 'PAGOS', 'ELIMINAR', 'Anular un pago registrado'),
('pagos.comprobantes', 'Generar Comprobantes', 'PAGOS', 'EXPORTAR', 'Imprimir recibos de pago'),

-- MÓDULO: USUARIOS
('usuarios.ver', 'Ver Usuarios', 'USUARIOS', 'VER', 'Consultar usuarios del sistema'),
('usuarios.crear', 'Crear Usuario', 'USUARIOS', 'CREAR', 'Registrar nuevo usuario'),
('usuarios.editar', 'Editar Usuario', 'USUARIOS', 'EDITAR', 'Modificar datos de usuario'),
('usuarios.eliminar', 'Eliminar Usuario', 'USUARIOS', 'ELIMINAR', 'Dar de baja usuarios'),
('usuarios.roles', 'Gestionar Roles', 'USUARIOS', 'EDITAR', 'Asignar/modificar roles'),
('usuarios.permisos', 'Gestionar Permisos', 'USUARIOS', 'EDITAR', 'Administrar permisos personalizados'),

-- MÓDULO: SISTEMA
('sistema.configuracion', 'Configurar Sistema', 'SISTEMA', 'EDITAR', 'Modificar parámetros del sistema'),
('sistema.auditoria', 'Ver Auditoría', 'SISTEMA', 'VER', 'Consultar logs de auditoría'),
('sistema.backup', 'Generar Backup', 'SISTEMA', 'CREAR', 'Crear respaldo de la base de datos'),
('sistema.sincronizacion', 'Gestionar Sync', 'SISTEMA', 'EDITAR', 'Administrar sincronización nacional');

-- ============================================
-- 3. ASIGNAR PERMISOS A ROLES
-- ============================================

-- ROL: RECTOR (TODOS los permisos)
INSERT INTO roles_permisos (rol_id, permiso_id)
SELECT 
    (SELECT id FROM roles WHERE codigo = 'RECTOR'),
    id 
FROM permisos;

-- ROL: DIRECTOR_ACADEMICO
INSERT INTO roles_permisos (rol_id, permiso_id)
SELECT 
    (SELECT id FROM roles WHERE codigo = 'DIRECTOR_ACADEMICO'),
    id
FROM permisos
WHERE codigo IN (
    'estudiantes.ver', 'estudiantes.crear', 'estudiantes.editar', 'estudiantes.buscar',
    'estudiantes.exportar', 'estudiantes.historial',
    'inscripciones.ver', 'inscripciones.aprobar', 'inscripciones.materias',
    'calificaciones.ver', 'calificaciones.aprobar', 'calificaciones.boletin',
    'nivelacion.ver', 'nivelacion.calendario', 'nivelacion.resultados',
    'becas.ver', 'becas.asignar', 'becas.editar',
    'documentos.ver', 'documentos.verificar', 'documentos.aprobar',
    'pasantias.ver', 'pasantias.crear', 'pasantias.evaluar',
    'licencias.ver', 'licencias.aprobar',
    'supervision.ver', 'supervision.programar', 'supervision.realizar', 'supervision.reportes',
    'historial.ver', 'historial.generar', 'historial.pdf',
    'reportes.dashboard', 'reportes.estadisticas', 'reportes.exportar'
);

-- ROL: DIRECTOR_ADMINISTRATIVO
INSERT INTO roles_permisos (rol_id, permiso_id)
SELECT 
    (SELECT id FROM roles WHERE codigo = 'DIRECTOR_ADMINISTRATIVO'),
    id
FROM permisos
WHERE codigo IN (
    'estudiantes.ver', 'estudiantes.buscar', 'estudiantes.exportar',
    'inscripciones.ver',
    'becas.ver', 'becas.asignar', 'becas.editar', 'becas.suspender', 'becas.cupos',
    'documentos.ver', 'documentos.verificar', 'documentos.aprobar',
    'pagos.ver', 'pagos.registrar', 'pagos.anular', 'pagos.comprobantes',
    'reportes.dashboard', 'reportes.estadisticas', 'reportes.exportar',
    'usuarios.ver', 'usuarios.crear', 'usuarios.editar'
);

-- ROL: SECRETARIA
INSERT INTO roles_permisos (rol_id, permiso_id)
SELECT 
    (SELECT id FROM roles WHERE codigo = 'SECRETARIA'),
    id
FROM permisos
WHERE codigo IN (
    'estudiantes.ver', 'estudiantes.crear', 'estudiantes.editar', 'estudiantes.buscar', 'estudiantes.foto',
    'inscripciones.ver', 'inscripciones.crear', 'inscripciones.editar', 'inscripciones.materias',
    'calificaciones.ver', 'calificaciones.boletin',
    'becas.ver',
    'documentos.ver', 'documentos.subir', 'documentos.verificar',
    'licencias.ver',
    'pagos.ver', 'pagos.registrar', 'pagos.comprobantes'
);

-- ROL: PORTERIA
INSERT INTO roles_permisos (rol_id, permiso_id)
SELECT 
    (SELECT id FROM roles WHERE codigo = 'PORTERIA'),
    id
FROM permisos
WHERE codigo IN (
    'estudiantes.ver', 'estudiantes.buscar'
);

-- ROL: DOCENTES (todos los tipos)
INSERT INTO roles_permisos (rol_id, permiso_id)
SELECT 
    r.id,
    p.id
FROM roles r
CROSS JOIN permisos p
WHERE r.codigo IN ('DOCENTE_CONTADURIA', 'DOCENTE_SISTEMAS', 'DOCENTE_ADMINISTRACION')
  AND p.codigo IN (
    'estudiantes.ver',
    'estudiantes.historial',
    'calificaciones.ver_propias',
    'calificaciones.registrar',
    'calificaciones.editar',
    'pasantias.ver',
    'pasantias.evaluar'
);

-- ROL: ESTUDIANTE
INSERT INTO roles_permisos (rol_id, permiso_id)
SELECT 
    (SELECT id FROM roles WHERE codigo = 'ESTUDIANTE'),
    id
FROM permisos
WHERE codigo IN (
    'calificaciones.ver',
    'inscripciones.ver',
    'documentos.ver',
    'licencias.solicitar',
    'licencias.ver',
    'historial.ver'
);

-- ROL: ADMINISTRADOR_SISTEMA (TODOS los permisos)
INSERT INTO roles_permisos (rol_id, permiso_id)
SELECT 
    (SELECT id FROM roles WHERE codigo = 'ADMINISTRADOR_SISTEMA'),
    id 
FROM permisos;

-- ============================================
-- 4. INSERTAR USUARIOS INICIALES
-- ============================================

-- PERSONAL ADMINISTRATIVO
INSERT INTO usuarios (nombre, apellido_paterno, apellido_materno, email, password_hash, rol_id, tipo_usuario, activo)
VALUES
-- Rector
('Victor Hugo', 'Bejarano', 'Rendón', 'rector@incos-santacruz.edu.bo', 
 '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TbGDGqrBnv6JqUkqFh7hZ2qBqRUi', -- password: Rector2025!
 (SELECT id FROM roles WHERE codigo = 'RECTOR'), 'ADMINISTRATIVO', TRUE),

-- Directora Académica
('Lidia', 'Ordoñez', 'Cuenca', 'academica@incos-santacruz.edu.bo',
 '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TbGDGqrBnv6JqUkqFh7hZ2qBqRUi', -- password: Academica2025!
 (SELECT id FROM roles WHERE codigo = 'DIRECTOR_ACADEMICO'), 'ADMINISTRATIVO', TRUE),

-- Directora Administrativa
('Mirian', 'Fernández', 'Colque', 'administrativa@incos-santacruz.edu.bo',
 '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TbGDGqrBnv6JqUkqFh7hZ2qBqRUi', -- password: Admin2025!
 (SELECT id FROM roles WHERE codigo = 'DIRECTOR_ADMINISTRATIVO'), 'ADMINISTRATIVO', TRUE),

-- Secretarias
('Mirna', 'Guerrero', 'Garnica', 'secretaria1@incos-santacruz.edu.bo',
 '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TbGDGqrBnv6JqUkqFh7hZ2qBqRUi', -- password: Secret2025!
 (SELECT id FROM roles WHERE codigo = 'SECRETARIA'), 'ADMINISTRATIVO', TRUE),

('Claudia Ivonne', 'Poquiviqui', 'Bruno', 'secretaria2@incos-santacruz.edu.bo',
 '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TbGDGqrBnv6JqUkqFh7hZ2qBqRUi', -- password: Secret2025!
 (SELECT id FROM roles WHERE codigo = 'SECRETARIA'), 'ADMINISTRATIVO', TRUE),

-- Portera
('Maria', 'Garcia', 'Pocoena', 'porteria@incos-santacruz.edu.bo',
 '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TbGDGqrBnv6JqUkqFh7hZ2qBqRUi', -- password: Porteria2025!
 (SELECT id FROM roles WHERE codigo = 'PORTERIA'), 'ADMINISTRATIVO', TRUE);

-- DOCENTES - CONTADURÍA GENERAL
INSERT INTO usuarios (nombre, apellido_paterno, apellido_materno, email, password_hash, rol_id, tipo_usuario, activo)
VALUES
('Hilda', 'Barriga', 'Salguero', 'hbarriga@incos-santacruz.edu.bo',
 '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TbGDGqrBnv6JqUkqFh7hZ2qBqRUi', -- password: Docente2025!
 (SELECT id FROM roles WHERE codigo = 'DOCENTE_CONTADURIA'), 'DOCENTE', TRUE),

('Wilma', 'Fernandez', 'Vaca', 'wfernandez@incos-santacruz.edu.bo',
 '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TbGDGqrBnv6JqUkqFh7hZ2qBqRUi',
 (SELECT id FROM roles WHERE codigo = 'DOCENTE_CONTADURIA'), 'DOCENTE', TRUE),

('Aurelio', 'Hurtado', 'Daza', 'ahurtado@incos-santacruz.edu.bo',
 '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TbGDGqrBnv6JqUkqFh7hZ2qBqRUi',
 (SELECT id FROM roles WHERE codigo = 'DOCENTE_CONTADURIA'), 'DOCENTE', TRUE),

('Gonzalo', 'Icuña', 'Soto', 'gicuna@incos-santacruz.edu.bo',
 '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TbGDGqrBnv6JqUkqFh7hZ2qBqRUi',
 (SELECT id FROM roles WHERE codigo = 'DOCENTE_CONTADURIA'), 'DOCENTE', TRUE),

('Georgina', 'Moron', 'Farel', 'gmoron@incos-santacruz.edu.bo',
 '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TbGDGqrBnv6JqUkqFh7hZ2qBqRUi',
 (SELECT id FROM roles WHERE codigo = 'DOCENTE_CONTADURIA'), 'DOCENTE', TRUE),

('Teodora', 'Paraguayo', 'Colque', 'tparaguayo@incos-santacruz.edu.bo',
 '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TbGDGqrBnv6JqUkqFh7hZ2qBqRUi',
 (SELECT id FROM roles WHERE codigo = 'DOCENTE_CONTADURIA'), 'DOCENTE', TRUE),

('Dory Olga', 'Robles', NULL, 'drobles@incos-santacruz.edu.bo',
 '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TbGDGqrBnv6JqUkqFh7hZ2qBqRUi',
 (SELECT id FROM roles WHERE codigo = 'DOCENTE_CONTADURIA'), 'DOCENTE', TRUE),

('Patricia', 'Rodriguez', 'Cuellar', 'prodriguez@incos-santacruz.edu.bo',
 '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TbGDGqrBnv6JqUkqFh7hZ2qBqRUi',
 (SELECT id FROM roles WHERE codigo = 'DOCENTE_CONTADURIA'), 'DOCENTE', TRUE),

('Elias', 'Sarzuri', 'Poma', 'esarzuri@incos-santacruz.edu.bo',
 '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TbGDGqrBnv6JqUkqFh7hZ2qBqRUi',
 (SELECT id FROM roles WHERE codigo = 'DOCENTE_CONTADURIA'), 'DOCENTE', TRUE),

('Sebastian', 'Vargas', 'Morales', 'svargas@incos-santacruz.edu.bo',
 '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TbGDGqrBnv6JqUkqFh7hZ2qBqRUi',
 (SELECT id FROM roles WHERE codigo = 'DOCENTE_CONTADURIA'), 'DOCENTE', TRUE),

('Jose', 'Vara', 'Coronado', 'jvara@incos-santacruz.edu.bo',
 '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TbGDGqrBnv6JqUkqFh7hZ2qBqRUi',
 (SELECT id FROM roles WHERE codigo = 'DOCENTE_CONTADURIA'), 'DOCENTE', TRUE);

-- DOCENTES - SISTEMAS INFORMÁTICOS
INSERT INTO usuarios (nombre, apellido_paterno, apellido_materno, email, password_hash, rol_id, tipo_usuario, activo)
VALUES
('Waly Yuryi', 'Vargas', 'Rosas', 'wvargas@incos-santacruz.edu.bo',
 '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TbGDGqrBnv6JqUkqFh7hZ2qBqRUi',
 (SELECT id FROM roles WHERE codigo = 'DOCENTE_SISTEMAS'), 'DOCENTE', TRUE),

('Lily', 'Arenas', 'Jerez', 'larenas@incos-santacruz.edu.bo',
 '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TbGDGqrBnv6JqUkqFh7hZ2qBqRUi',
 (SELECT id FROM roles WHERE codigo = 'DOCENTE_SISTEMAS'), 'DOCENTE', TRUE),

('Giovanna', 'Fernandez', 'Hinojosa', 'gfernandez@incos-santacruz.edu.bo',
 '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TbGDGqrBnv6JqUkqFh7hZ2qBqRUi',
 (SELECT id FROM roles WHERE codigo = 'DOCENTE_SISTEMAS'), 'DOCENTE', TRUE),

('Ybeth Maura', 'Camacho', 'Robles', 'ycamacho@incos-santacruz.edu.bo',
 '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TbGDGqrBnv6JqUkqFh7hZ2qBqRUi',
 (SELECT id FROM roles WHERE codigo = 'DOCENTE_SISTEMAS'), 'DOCENTE', TRUE),

('Magali', 'Ticlla', 'Choque', 'mticlla@incos-santacruz.edu.bo',
 '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TbGDGqrBnv6JqUkqFh7hZ2qBqRUi',
 (SELECT id FROM roles WHERE codigo = 'DOCENTE_SISTEMAS'), 'DOCENTE', TRUE),

('Silvia Roxana', 'Justiniano', 'Siles', 'sjustiniano@incos-santacruz.edu.bo',
 '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TbGDGqrBnv6JqUkqFh7hZ2qBqRUi',
 (SELECT id FROM roles WHERE codigo = 'DOCENTE_SISTEMAS'), 'DOCENTE', TRUE),

('Yesmani', 'Fernandez', 'Arambulo', 'yfernandez@incos-santacruz.edu.bo',
 '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TbGDGqrBnv6JqUkqFh7hZ2qBqRUi',
 (SELECT id FROM roles WHERE codigo = 'DOCENTE_SISTEMAS'), 'DOCENTE', TRUE);

-- DOCENTES - ADMINISTRACIÓN DE EMPRESAS
INSERT INTO usuarios (nombre, apellido_paterno, apellido_materno, email, password_hash, rol_id, tipo_usuario, activo)
VALUES
('Sonia Sara', 'Carrizales', 'Castellon', 'scarrizales@incos-santacruz.edu.bo',
 '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TbGDGqrBnv6JqUkqFh7hZ2qBqRUi',
 (SELECT id FROM roles WHERE codigo = 'DOCENTE_ADMINISTRACION'), 'DOCENTE', TRUE),

('Vladimir', 'Marca', 'Arroyo', 'vmarca@incos-santacruz.edu.bo',
 '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TbGDGqrBnv6JqUkqFh7hZ2qBqRUi',
 (SELECT id FROM roles WHERE codigo = 'DOCENTE_ADMINISTRACION'), 'DOCENTE', TRUE),

('Claudia Paola', 'Mariaca', 'Hurtado', 'cmariaca@incos-santacruz.edu.bo',
 '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TbGDGqrBnv6JqUkqFh7hZ2qBqRUi',
 (SELECT id FROM roles WHERE codigo = 'DOCENTE_ADMINISTRACION'), 'DOCENTE', TRUE),

('Jose Luis', 'Montenegro', 'Oyola', 'jmontenegro@incos-santacruz.edu.bo',
 '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TbGDGqrBnv6JqUkqFh7hZ2qBqRUi',
 (SELECT id FROM roles WHERE codigo = 'DOCENTE_ADMINISTRACION'), 'DOCENTE', TRUE),

('Rafael', 'Montero', 'Aguilar', 'rmontero@incos-santacruz.edu.bo',
 '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TbGDGqrBnv6JqUkqFh7hZ2qBqRUi',
 (SELECT id FROM roles WHERE codigo = 'DOCENTE_ADMINISTRACION'), 'DOCENTE', TRUE),

('Rene Benjamin', 'Roca', 'Rios', 'rroca@incos-santacruz.edu.bo',
 '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TbGDGqrBnv6JqUkqFh7hZ2qBqRUi',
 (SELECT id FROM roles WHERE codigo = 'DOCENTE_ADMINISTRACION'), 'DOCENTE', TRUE),

('Jose Luiz', 'Uribe', 'Mejia', 'juribe@incos-santacruz.edu.bo',
 '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TbGDGqrBnv6JqUkqFh7hZ2qBqRUi',
 (SELECT id FROM roles WHERE codigo = 'DOCENTE_ADMINISTRACION'), 'DOCENTE', TRUE);

-- ============================================
-- 5. VERIFICACIÓN
-- ============================================

-- Ver resumen de usuarios por rol
SELECT 
    r.nombre as rol,
    COUNT(u.id) as cantidad_usuarios
FROM roles r
LEFT JOIN usuarios u ON r.id = u.rol_id
GROUP BY r.id, r.nombre
ORDER BY r.nivel_acceso DESC;

-- Ver total de permisos por rol
SELECT 
    r.nombre as rol,
    COUNT(rp.permiso_id) as cantidad_permisos
FROM roles r
LEFT JOIN roles_permisos rp ON r.id = rp.rol_id
GROUP BY r.id, r.nombre
ORDER BY r.nivel_acceso DESC;

-- ============================================
-- FIN DEL SCRIPT
-- ============================================

SELECT '✅ Usuarios, roles y permisos creados exitosamente' as mensaje;
SELECT CONCAT('Total usuarios: ', COUNT(*), ' (6 administrativos + ', 
              (SELECT COUNT(*) FROM usuarios WHERE tipo_usuario = 'DOCENTE'), 
              ' docentes)') as resumen
FROM usuarios;
