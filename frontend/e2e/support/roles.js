// Sesiones simuladas por rol. La forma replica `POST /auth/login` y `GET /auth/me`:
// permisos = [{ codigo, acciones: [...] }].

const permiso = (codigo, ...acciones) => ({ codigo, acciones });

export const ROLES = {
  ADMIN: {
    username: 'test.admin',
    usuario: { id: 1, username: 'test.admin', rol: { codigo: 'ADMIN', nombre: 'Administrador' } },
    permisos: [
      permiso('docentes.ver', 'LISTAR', 'DETALLE'),
      permiso('docentes.crear', 'CREAR'),
      permiso('seguridad.usuario.administrar', 'LISTAR'),
      permiso('seguridad.rol.gestionar', 'LISTAR'),
    ],
    // Etiquetas de menú que debe ver / no ver.
    menuVisible: ['Dashboard', 'Docentes', 'Seguridad'],
    menuOculto: [],
  },
  SEC_ACADEMICA: {
    username: 'test.sec_academica',
    usuario: {
      id: 2,
      username: 'test.sec_academica',
      rol: { codigo: 'SEC_ACADEMICA', nombre: 'Secretaría académica' },
    },
    permisos: [permiso('docentes.ver', 'LISTAR', 'DETALLE')],
    menuVisible: ['Dashboard', 'Docentes'],
    menuOculto: ['Seguridad'],
  },
  ESTUDIANTE: {
    username: 'test.estudiante',
    usuario: {
      id: 3,
      username: 'test.estudiante',
      rol: { codigo: 'ESTUDIANTE', nombre: 'Estudiante' },
    },
    permisos: [],
    menuVisible: ['Dashboard'],
    menuOculto: ['Docentes', 'Seguridad'],
  },
};

export const PASSWORD = 'Test-Incos-2026';
