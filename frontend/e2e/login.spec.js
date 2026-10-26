import { test, expect } from '@playwright/test';
import { mockApi } from './support/mockApi.js';
import { ROLES, PASSWORD } from './support/roles.js';

async function iniciarSesion(page, username, password = PASSWORD) {
  await page.goto('/login');
  await page.getByPlaceholder('Usuario o correo de su ficha').fill(username);
  await page.getByPlaceholder('Ingrese su contraseña').fill(password);
  await page.getByRole('button', { name: /Ingresar/ }).click();
}

test.describe('login por rol', () => {
  for (const [codigo, rol] of Object.entries(ROLES)) {
    test(`${codigo} entra al dashboard y ve su identidad`, async ({ page }) => {
      await mockApi(page, { rol });
      await iniciarSesion(page, rol.username);

      await expect(page).toHaveURL(/\/dashboard$/);
      await expect(page.getByRole('button', { name: 'Ir a mi perfil' })).toContainText(rol.username);
    });
  }

  test('credenciales inválidas muestran el error y no navegan', async ({ page }) => {
    await mockApi(page, { rol: ROLES.ADMIN });
    await iniciarSesion(page, 'otro.usuario');

    await expect(page.getByRole('alert')).toBeVisible();
    await expect(page).toHaveURL(/\/login$/);
  });

  test('contraseña corta se rechaza en el cliente sin llamar a la API', async ({ page }) => {
    const { llamadas } = await mockApi(page, { rol: ROLES.ADMIN });
    await iniciarSesion(page, ROLES.ADMIN.username, 'corta');

    await expect(page.getByText(/al menos 8 caracteres/).first()).toBeVisible();
    expect(llamadas.some((l) => l.startsWith('POST /auth/login'))).toBe(false);
  });

  test('campos vacíos muestran la validación del formulario', async ({ page }) => {
    await mockApi(page);
    await page.goto('/login');
    await page.getByRole('button', { name: /Ingresar/ }).click();

    await expect(page.getByText('Por favor ingrese su usuario o correo')).toBeVisible();
    await expect(page.getByText('Por favor ingrese su contraseña')).toBeVisible();
  });
});
