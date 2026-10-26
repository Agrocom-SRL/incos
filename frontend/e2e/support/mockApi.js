// API simulada con page.route: sin backend real. Todo lo no registrado responde
// `{ success: true, data: [] }` para que las pantallas no dependan de la red.

const json = (route, status, body) =>
  route.fulfill({
    status,
    contentType: 'application/json',
    body: JSON.stringify(body),
  });

/** Docentes de ejemplo con la forma del API (`GET /v1/docentes`). */
export const DOCENTES = [
  { id: 1, firstName: 'Ana', lastName: 'Pérez', motherLastName: 'Soto', ci: '1234567', expedition: 'SC' },
  { id: 2, firstName: 'Luis', lastName: 'Rojas', motherLastName: 'Vaca', ci: '7654321', expedition: 'SC' },
];

/**
 * @param {import('@playwright/test').Page} page
 * @param {object} opts
 * @param {object} [opts.rol] - entrada de ROLES (habilita login y /auth/me)
 * @param {'datos'|'vacio'|'error'} [opts.docentes='datos'] - respuesta de GET /v1/docentes
 * @returns {Promise<{ llamadas: string[] }>} llamadas de API recibidas (para aserciones)
 */
export async function mockApi(page, { rol, docentes = 'datos' } = {}) {
  const llamadas = [];

  await page.route('**/api/v1/**', async (route) => {
    const req = route.request();
    const { pathname } = new URL(req.url());
    const ruta = pathname.replace(/^.*\/api\/v1/, '');
    llamadas.push(`${req.method()} ${ruta}`);

    if (ruta === '/auth/login' && req.method() === 'POST') {
      const { username } = req.postDataJSON() ?? {};
      if (!rol || username !== rol.username) {
        return json(route, 401, {
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Credenciales inválidas' },
        });
      }
      return json(route, 200, {
        success: true,
        data: { token: `token-${rol.usuario.rol.codigo}`, usuario: rol.usuario, permisos: rol.permisos },
      });
    }

    if (ruta === '/auth/me') {
      if (!rol) return json(route, 401, { success: false, error: 'No autenticado' });
      return json(route, 200, { success: true, data: { usuario: rol.usuario, permisos: rol.permisos } });
    }

    if (ruta === '/auth/logout') return json(route, 200, { success: true });

    if (ruta === '/docentes' && req.method() === 'GET') {
      if (docentes === 'error') {
        return json(route, 500, {
          success: false,
          error: { code: 'INTERNAL_ERROR', message: 'Error interno simulado' },
        });
      }
      const filas = docentes === 'vacio' ? [] : DOCENTES;
      return json(route, 200, {
        success: true,
        data: filas,
        pagination: { page: 1, limit: 10, total: filas.length, totalPages: 1 },
      });
    }

    return json(route, 200, { success: true, data: [] });
  });

  return { llamadas };
}

/** Inyecta una sesión previa (token) para saltar el login: `/auth/me` hidrata el usuario. */
export async function conSesion(page, rol) {
  await page.addInitScript((token) => {
    window.localStorage.setItem('incos_token', token);
  }, `token-${rol.usuario.rol.codigo}`);
}
