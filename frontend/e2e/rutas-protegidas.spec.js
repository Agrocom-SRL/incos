import { test, expect } from '@playwright/test';
import { mockApi, conSesion } from './support/mockApi.js';
import { ROLES } from './support/roles.js';

test.describe('rutas protegidas', () => {
  test('sin sesión redirige a /login', async ({ page }) => {
    await mockApi(page);
    await page.goto('/docentes/listar');

    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByRole('button', { name: /Ingresar/ })).toBeVisible();
  });

  test('con sesión, /login redirige al dashboard', async ({ page }) => {
    await mockApi(page, { rol: ROLES.ADMIN });
    await conSesion(page, ROLES.ADMIN);
    await page.goto('/login');

    await expect(page).toHaveURL(/\/dashboard$/);
  });

  test('sin permiso: notifica "Acceso denegado" y vuelve al dashboard', async ({ page }) => {
    await mockApi(page, { rol: ROLES.ESTUDIANTE });
    await conSesion(page, ROLES.ESTUDIANTE);
    await page.goto('/docentes/listar');

    await expect(page.getByText('Acceso denegado')).toBeVisible();
    await expect(page).toHaveURL(/\/dashboard$/);
  });

  test('permiso de otra acción no abre la ruta (docentes.crear exige CREAR)', async ({ page }) => {
    await mockApi(page, { rol: ROLES.SEC_ACADEMICA });
    await conSesion(page, ROLES.SEC_ACADEMICA);
    await page.goto('/docentes/registrar');

    await expect(page.getByText('Acceso denegado')).toBeVisible();
    await expect(page).toHaveURL(/\/dashboard$/);
  });

  test('token vencido (401 en /auth/me) devuelve al login', async ({ page }) => {
    await mockApi(page); // sin rol: /auth/me responde 401
    await page.addInitScript(() => window.localStorage.setItem('incos_token', 'vencido'));
    await page.goto('/docentes/listar');

    await expect(page).toHaveURL(/\/login$/);
  });

  test('ruta inexistente muestra el 404 del panel autenticado', async ({ page }) => {
    await mockApi(page, { rol: ROLES.ADMIN });
    await conSesion(page, ROLES.ADMIN);
    await page.goto('/no/existe');

    await expect(page.getByRole('menu').first()).toBeVisible();
    await expect(page).toHaveURL(/\/no\/existe$/);
  });
});
