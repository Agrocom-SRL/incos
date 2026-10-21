import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { iniciarSistema, cerrarSistema } from './helpers/sistema.js';
import { sequelize } from '../../src/infrastructure/database/sequelize.js';

describe('Collation única del sistema (utf8mb4_unicode_ci)', () => {
  beforeAll(iniciarSistema);
  afterAll(cerrarSistema);

  it('la conexión de la app usa utf8mb4_unicode_ci', async () => {
    const [[fila]] = await sequelize.query(
      'SELECT @@character_set_connection AS charset, @@collation_connection AS collation'
    );
    expect(fila.charset).toBe('utf8mb4');
    expect(fila.collation).toBe('utf8mb4_unicode_ci');
  });

  it('todas las tablas de la BD usan utf8mb4_unicode_ci', async () => {
    const [filas] = await sequelize.query(
      `SELECT table_name AS tabla, table_collation AS collation
         FROM information_schema.tables
        WHERE table_schema = DATABASE() AND table_type = 'BASE TABLE'
          AND table_collation <> 'utf8mb4_unicode_ci'`
    );
    expect(filas).toEqual([]);
  });

  it('un parámetro de texto se puede comparar con una vista sin "Illegal mix of collations"', async () => {
    await expect(
      sequelize.query('SELECT item_id FROM vista_catalogos_finanzas_usos WHERE catalogo = :c', {
        replacements: { c: 'BECA_DESCUENTO' },
      })
    ).resolves.toBeDefined();
  });
});
