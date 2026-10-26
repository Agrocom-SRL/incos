/**
 * Libros de registro (centralizador) contra la BD real efímera.
 *
 * Matriz (`academico.libro`): ADMIN/RECTOR/DIR_ACADEMICO tienen todo; SEC_ACADEMICA lista, ve el
 * detalle, crea, edita y exporta pero NO aprueba (anular folios); el resto de roles recibe 403.
 * `libros_registro` no tiene eliminación por API: la prueba de escritura abre un libro `ci-` y lo
 * borra por SQL en `finally` (BD efímera de CI) para dejar la tabla como estaba.
 */
import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { iniciarSistema, cerrarSistema, como, sequelize } from './helpers/sistema.js';
import {
  esperarValidacion,
  esperarNoEncontrado,
  esperarDenegado,
  enviarComo,
  conLimpieza,
} from './helpers/respuestas.js';

beforeAll(iniciarSistema);
afterAll(cerrarSistema);

const GESTOR = 'SEC_ACADEMICA';
const ID_INEXISTENTE = 999999;
const SIN_PERMISO = ['DIR_ADMIN', 'SEC_ADMIN', 'DOCENTE', 'ESTUDIANTE'];

describe('Libros · lectura', () => {
  it('listado devuelve { libros: [] } y acepta el filtro por gestión', async () => {
    const res = await como(GESTOR, 'get', '/libros');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.libros)).toBe(true);
    const filtrado = await como(GESTOR, 'get', '/libros?gestionId=1');
    expect(filtrado.status).toBe(200);
    for (const libro of filtrado.body.data.libros) expect(libro.gestionId).toBe(1);
  });

  it('listado rechaza gestionId inválido', async () => {
    esperarValidacion(await como(GESTOR, 'get', '/libros?gestionId=abc'), 'gestionId');
    esperarValidacion(await como(GESTOR, 'get', '/libros?gestionId=0'), 'gestionId');
  });

  it.each([
    ['ficha', '/libros/999999'],
    ['paralelos candidatos', '/libros/999999/paralelos'],
    ['folio', '/libros/999999/folios/1'],
    ['exportación Excel', '/libros/999999/export'],
  ])('%s de un libro inexistente responde 404', async (_nombre, ruta) => {
    esperarNoEncontrado(await como(GESTOR, 'get', ruta));
  });

  it('id de libro no numérico responde 400', async () => {
    esperarValidacion(await como(GESTOR, 'get', '/libros/abc'), 'id');
  });
});

describe('Libros · validaciones de escritura', () => {
  it.each([
    ['sin cuerpo', {}, 'gestionId'],
    ['sin número de libro', { gestionId: 1 }, 'numeroLibro'],
    ['número de libro 0', { gestionId: 1, numeroLibro: 0 }, 'numeroLibro'],
    ['fecha de apertura inválida', { gestionId: 1, numeroLibro: 1, fechaApertura: 'ayer' }, 'fechaApertura'],
    ['código de registro demasiado largo', { gestionId: 1, numeroLibro: 1, codigoRegistro: 'x'.repeat(30) }, 'codigoRegistro'],
  ])('abrir libro rechaza %s', async (_caso, cuerpo, campo) => {
    esperarValidacion(await enviarComo(GESTOR, 'post', '/libros', cuerpo), campo);
  });

  it('editar libro: estado inválido (400) e inexistente (404)', async () => {
    esperarValidacion(await enviarComo(GESTOR, 'patch', `/libros/${ID_INEXISTENTE}`, { estado: 'XX' }), 'estado');
    esperarNoEncontrado(await enviarComo(GESTOR, 'patch', `/libros/${ID_INEXISTENTE}`, { observaciones: 'ci-x' }));
  });

  it('generar folios: exige paralelo (400) y libro existente (404)', async () => {
    esperarValidacion(await enviarComo(GESTOR, 'post', `/libros/${ID_INEXISTENTE}/folios`, {}), 'paraleloGestionId');
    esperarNoEncontrado(
      await enviarComo(GESTOR, 'post', `/libros/${ID_INEXISTENTE}/folios`, { paraleloGestionId: 1 })
    );
  });

  it('anular folio: estado inválido (400) e inexistente (404) con APROBAR', async () => {
    esperarValidacion(
      await enviarComo('DIR_ACADEMICO', 'patch', `/libros/${ID_INEXISTENTE}/folios/1/estado`, { estado: 'XX' }),
      'estado'
    );
    esperarNoEncontrado(
      await enviarComo('DIR_ACADEMICO', 'patch', `/libros/${ID_INEXISTENTE}/folios/1/estado`, { estado: 'ANULADO' })
    );
  });

  it('editar la observación de una fila de folio inexistente responde 404', async () => {
    esperarNoEncontrado(
      await enviarComo(GESTOR, 'patch', `/libros/${ID_INEXISTENTE}/folios/1/estudiantes/1`, { observaciones: 'ci-obs' })
    );
  });
});

describe('Libros · permisos por rol (matriz)', () => {
  it('SEC_ACADEMICA no puede aprobar (anular folios)', async () => {
    esperarDenegado(
      await enviarComo(GESTOR, 'patch', `/libros/${ID_INEXISTENTE}/folios/1/estado`, { estado: 'ANULADO' }),
      'academico.libro',
      'APROBAR'
    );
  });

  it.each(SIN_PERMISO)('%s recibe 403 en listado, ficha y apertura', async (rol) => {
    esperarDenegado(await como(rol, 'get', '/libros'), 'academico.libro', 'LISTAR');
    esperarDenegado(await como(rol, 'get', '/libros/1'), 'academico.libro', 'DETALLE');
    esperarDenegado(
      await enviarComo(rol, 'post', '/libros', { gestionId: 1, numeroLibro: 1 }),
      'academico.libro',
      'CREAR'
    );
    esperarDenegado(await como(rol, 'get', '/libros/1/export'), 'academico.libro', 'EXPORTAR');
  });
});

describe('Libros · abrir, leer, editar y limpiar', () => {
  it('abre un libro ci-, lo lee por id y por listado, lo edita y lo borra al terminar', async () => {
    const [gestion] = await sequelize.query('SELECT id FROM gestiones ORDER BY id DESC LIMIT 1', {
      type: sequelize.QueryTypes.SELECT,
    });
    const [{ n }] = await sequelize.query('SELECT COUNT(*) AS n FROM libros_registro WHERE gestion_id = :g', {
      replacements: { g: gestion.id },
      type: sequelize.QueryTypes.SELECT,
    });
    // `libros_registro` es UNIQUE(gestion_id): si la BD ya trae un libro de esa gestión no se toca.
    if (Number(n) > 0) return;

    await conLimpieza(async (limpiar) => {
      const codigo = `ci-${String(Date.now()).slice(-9)}`;
      const abre = await enviarComo(GESTOR, 'post', '/libros', {
        gestionId: gestion.id,
        numeroLibro: 1,
        codigoRegistro: codigo,
        observaciones: 'ci-libro de prueba',
      });
      expect(abre.status).toBe(201);
      const libroId = abre.body.data.libro?.id ?? abre.body.data.id;
      expect(libroId).toBeGreaterThan(0);
      limpiar.push(async () => {
        await sequelize.query('DELETE FROM libros_registro WHERE id = :id', { replacements: { id: libroId } });
      });

      const ficha = await como(GESTOR, 'get', `/libros/${libroId}`);
      expect(ficha.status).toBe(200);
      expect(JSON.stringify(ficha.body.data)).toContain(codigo);

      const listado = await como(GESTOR, 'get', `/libros?gestionId=${gestion.id}`);
      expect(listado.body.data.libros.map((l) => l.id)).toContain(libroId);

      // Un segundo libro para la misma gestión se rechaza (unicidad por gestión)
      const duplicado = await enviarComo(GESTOR, 'post', '/libros', { gestionId: gestion.id, numeroLibro: 2 });
      expect(duplicado.status).toBeGreaterThanOrEqual(400);
      expect(duplicado.status).toBeLessThan(500);

      const edita = await enviarComo(GESTOR, 'patch', `/libros/${libroId}`, { observaciones: 'ci-libro editado' });
      expect(edita.status).toBe(200);
      const releido = await como(GESTOR, 'get', `/libros/${libroId}`);
      expect(JSON.stringify(releido.body.data)).toContain('ci-libro editado');

      const paralelos = await como(GESTOR, 'get', `/libros/${libroId}/paralelos`);
      expect(paralelos.status).toBe(200);
    });

    const despues = await como(GESTOR, 'get', `/libros?gestionId=${gestion.id}`);
    expect(JSON.stringify(despues.body.data.libros)).not.toContain('ci-');
  });
});
