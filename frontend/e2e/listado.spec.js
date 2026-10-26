import { test, expect } from '@playwright/test';
import { mockApi, conSesion } from './support/mockApi.js';
import { ROLES } from './support/roles.js';

test.describe('listado de docentes (estados)', () => {
  test('con datos: muestra filas y la acción de registrar según permiso', async ({ page }) => {
    await mockApi(page, { rol: ROLES.ADMIN, docentes: 'datos' });
    await conSesion(page, ROLES.ADMIN);
    await page.goto('/docentes/listar');

    await expect(page.getByRole('row', { name: /1234567/ })).toBeVisible();
    await expect(page.getByRole('row', { name: /7654321/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /Registrar docente/ })).toBeVisible();
  });

  test('sin permiso CREAR el botón de registrar no existe', async ({ page }) => {
    await mockApi(page, { rol: ROLES.SEC_ACADEMICA, docentes: 'datos' });
    await conSesion(page, ROLES.SEC_ACADEMICA);
    await page.goto('/docentes/listar');

    await expect(page.getByRole('row', { name: /1234567/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /Registrar docente/ })).toHaveCount(0);
  });

  test('vacío: muestra el estado sin datos', async ({ page }) => {
    await mockApi(page, { rol: ROLES.ADMIN, docentes: 'vacio' });
    await conSesion(page, ROLES.ADMIN);
    await page.goto('/docentes/listar');

    await expect(page.locator('.ant-empty')).toBeVisible();
    await expect(page.getByRole('row', { name: /1234567/ })).toHaveCount(0);
  });

  test('error 500: muestra la alerta de error', async ({ page }) => {
    await mockApi(page, { rol: ROLES.ADMIN, docentes: 'error' });
    await conSesion(page, ROLES.ADMIN);
    await page.goto('/docentes/listar');

    await expect(page.getByRole('alert').filter({ hasText: /Error/ }).first()).toBeVisible();
  });
});
