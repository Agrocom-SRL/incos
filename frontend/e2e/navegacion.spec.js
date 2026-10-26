import { test, expect } from '@playwright/test';
import { mockApi, conSesion } from './support/mockApi.js';
import { ROLES } from './support/roles.js';

test.describe('menú lateral por rol', () => {
  for (const [codigo, rol] of Object.entries(ROLES)) {
    test(`${codigo} ve solo los módulos permitidos`, async ({ page }) => {
      await mockApi(page, { rol });
      await conSesion(page, rol);
      await page.goto('/dashboard');

      const menu = page.getByRole('menu').first();
      for (const etiqueta of rol.menuVisible) {
        await expect(menu.getByText(etiqueta, { exact: true })).toBeVisible();
      }
      for (const etiqueta of rol.menuOculto) {
        await expect(menu.getByText(etiqueta, { exact: true })).toHaveCount(0);
      }
    });
  }

  test('ADMIN navega del menú al listado de docentes', async ({ page }) => {
    await mockApi(page, { rol: ROLES.ADMIN });
    await conSesion(page, ROLES.ADMIN);
    await page.goto('/dashboard');

    const menu = page.getByRole('menu').first();
    await menu.getByText('Docentes', { exact: true }).click();
    await menu.getByText('Plantel docente', { exact: true }).click();

    await expect(page).toHaveURL(/\/docentes\/listar$/);
    await expect(page.getByText('Listado de docentes')).toBeVisible();
  });
});
