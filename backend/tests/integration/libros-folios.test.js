/**
 * Libros de registro · generación de folios con datos propios de la prueba.
 *
 * Cada prueba inscribe al estudiante de prueba en el paralelo 1 de la gestión vigente (con su aporte), abre un
 * libro `ci-` en esa gestión y genera folios por la API. La limpieza borra por SQL folios, nómina y libro
 * (`libros_registro` no tiene eliminación por API) y anula la inscripción y la cuota por API.
 */
import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { iniciarSistema, cerrarSistema, como, descargarComo, sequelize } from './helpers/sistema.js';
import { esperarValidacion, esperarNoEncontrado, esperarDenegado, enviarComo, conLimpieza } from './helpers/respuestas.js';
import { inscribirEstudiantePrueba, PARALELO_GESTION_PRUEBA } from './helpers/escenarios.js';

beforeAll(iniciarSistema);
afterAll(cerrarSistema);

const GESTOR = 'SEC_ACADEMICA';
const APROBADOR = 'DIR_ACADEMICO';

/** Inscribe al estudiante y abre un libro ci- en la gestión vigente. Devuelve { libroId, gestionId }. */
async function prepararLibroConEstudiante(limpiar, etiqueta) {
  const { gestionId } = await inscribirEstudiantePrueba(limpiar, { etiqueta });
  const [{ n }] = await sequelize.query('SELECT COUNT(*) AS n FROM libros_registro WHERE gestion_id = :g', {
    replacements: { g: gestionId },
    type: sequelize.QueryTypes.SELECT,
  });
  // `libros_registro` es UNIQUE(gestion_id): la BD de pruebas parte sin libros; si hubiera uno ajeno no se toca.
  expect(Number(n)).toBe(0);
  const abre = await enviarComo(GESTOR, 'post', '/libros', {
    gestionId,
    numeroLibro: 1,
    codigoRegistro: `ci-${etiqueta}`.slice(0, 20),
  });
  expect([abre.status, abre.body.error?.message]).toEqual([201, undefined]);
  const libroId = abre.body.data.libro.id;
  limpiar.push(async () => {
    const r = { replacements: { id: libroId } };
    await sequelize.query('DELETE FROM folio_estudiantes WHERE folio_id IN (SELECT id FROM folios_libro WHERE libro_id = :id)', r);
    await sequelize.query('DELETE FROM folios_libro WHERE libro_id = :id', r);
    await sequelize.query('DELETE FROM libros_registro WHERE id = :id', r);
  });
  return { libroId, gestionId };
}

const generar = (libroId, paraleloGestionId = PARALELO_GESTION_PRUEBA) =>
  enviarComo(GESTOR, 'post', `/libros/${libroId}/folios`, { paraleloGestionId });

describe('Libros · generar folios por paralelo', () => {
  it('genera el folio con la nómina del paralelo, rechaza regenerar y paralelos sin estudiantes', async () => {
    await conLimpieza(async (limpiar) => {
      const { libroId } = await prepararLibroConEstudiante(limpiar, 'folios');

      const antes = await como(GESTOR, 'get', `/libros/${libroId}/paralelos`);
      const candidato = antes.body.data.paralelos.find((p) => p.paraleloGestionId === PARALELO_GESTION_PRUEBA);
      expect(candidato).toEqual(expect.objectContaining({ totalEstudiantes: 1, foliosVigentes: 0, generado: false }));

      const res = await generar(libroId);
      expect([res.status, res.body.error?.message]).toEqual([201, undefined]);
      const [folio] = res.body.data.folios;
      expect(res.body.data.folios).toHaveLength(1);
      expect(folio).toEqual(
        expect.objectContaining({
          libroId,
          numeroFolio: 1,
          paraleloGestionId: PARALELO_GESTION_PRUEBA,
          estado: 'BORRADOR',
          totalEstudiantes: 1,
          totalCursando: 1,
        })
      );

      // El libro refleja el folio y el paralelo queda como generado
      const libro = await como(GESTOR, 'get', `/libros/${libroId}`);
      expect(libro.body.data.libro).toEqual(
        expect.objectContaining({ totalFolios: 1, paralelosConFolio: 1, totalEstudiantes: 1 })
      );
      const despues = await como(GESTOR, 'get', `/libros/${libroId}/paralelos`);
      expect(despues.body.data.paralelos.find((p) => p.paraleloGestionId === PARALELO_GESTION_PRUEBA)).toEqual(
        expect.objectContaining({ generado: true, foliosVigentes: 1 })
      );

      // Regenerar el mismo paralelo con folios vigentes se rechaza; uno sin estudiantes también
      const repetido = await generar(libroId);
      esperarValidacion(repetido);
      expect(repetido.body.error.message).toContain('ya tiene folios');
      const sinNomina = await generar(libroId, 2);
      esperarValidacion(sinNomina);
      expect(sinNomina.body.error.message).toContain('estudiantes matriculados');
      // Un paralelo de otra gestión no pertenece a este libro
      const [ajeno] = await sequelize.query(
        `SELECT pg.id FROM paralelos_gestion pg JOIN gestiones_planes gp ON gp.id = pg.gestion_plan_id
          WHERE gp.gestion_id <> (SELECT gestion_id FROM libros_registro WHERE id = :id) LIMIT 1`,
        { replacements: { id: libroId }, type: sequelize.QueryTypes.SELECT }
      );
      if (ajeno) {
        const fueraDeGestion = await generar(libroId, ajeno.id);
        esperarValidacion(fueraDeGestion);
      }
    });
  });

  it('el folio se lee, su fila se anota, se anula con motivo (solo APROBAR) y luego se regenera con otro número', async () => {
    await conLimpieza(async (limpiar) => {
      const { libroId } = await prepararLibroConEstudiante(limpiar, 'anular');
      const generado = await generar(libroId);
      expect(generado.status).toBe(201);
      const folioId = generado.body.data.folios[0].id;
      const ruta = `/libros/${libroId}/folios/${folioId}`;

      const detalle = await como(GESTOR, 'get', ruta);
      expect(detalle.status).toBe(200);
      expect(JSON.stringify(detalle.body.data)).toContain('TEST-EST-001');
      const filaId = detalle.body.data.folio.estudiantes[0].id;

      // Anotar la fila
      const nota = await enviarComo(GESTOR, 'patch', `${ruta}/estudiantes/${filaId}`, { observaciones: 'ci-observacion' });
      expect([nota.status, nota.body.error?.message]).toEqual([200, undefined]);
      esperarValidacion(await enviarComo(GESTOR, 'patch', `${ruta}/estudiantes/${filaId}`, {}));
      esperarNoEncontrado(await enviarComo(GESTOR, 'patch', `${ruta}/estudiantes/999999`, { observaciones: 'ci-x' }));
      const releido = await como(GESTOR, 'get', ruta);
      expect(JSON.stringify(releido.body.data)).toContain('ci-observacion');

      // Anular exige APROBAR y motivo; ANULADO es terminal
      esperarDenegado(await enviarComo(GESTOR, 'patch', `${ruta}/estado`, { estado: 'ANULADO', motivo: 'ci' }), 'academico.libro', 'APROBAR');
      esperarValidacion(await enviarComo(APROBADOR, 'patch', `${ruta}/estado`, { estado: 'ANULADO' }));
      esperarValidacion(await enviarComo(APROBADOR, 'patch', `${ruta}/estado`, { estado: 'BORRADOR', motivo: 'ci-vuelta' }));
      const anula = await enviarComo(APROBADOR, 'patch', `${ruta}/estado`, { estado: 'ANULADO', motivo: 'ci-error de nómina' });
      expect([anula.status, anula.body.error?.message]).toEqual([200, undefined]);
      expect(anula.body.data.folio.estado).toBe('ANULADO');
      esperarValidacion(await enviarComo(APROBADOR, 'patch', `${ruta}/estado`, { estado: 'BORRADOR', motivo: 'ci-reabrir' }));
      // Un folio anulado no admite ediciones de sus filas
      esperarValidacion(await enviarComo(GESTOR, 'patch', `${ruta}/estudiantes/${filaId}`, { observaciones: 'ci-otra' }));

      // Con el folio anulado el paralelo se puede regenerar: la numeración no reutiliza el número anulado
      const regenerado = await generar(libroId);
      expect([regenerado.status, regenerado.body.error?.message]).toEqual([201, undefined]);
      const vigente = regenerado.body.data.folios.find((f) => f.estado === 'BORRADOR');
      expect(vigente.numeroFolio).toBe(2); // el número del folio anulado nunca se reutiliza
      const libro = await como(GESTOR, 'get', `/libros/${libroId}`);
      expect(libro.body.data.libro).toEqual(expect.objectContaining({ totalFolios: 1, foliosAnulados: 1 }));
    });
  });

  it('reajuste de la gestión: anula los folios vigentes y los recalcula', async () => {
    await conLimpieza(async (limpiar) => {
      const { libroId, gestionId } = await prepararLibroConEstudiante(limpiar, 'gestion');
      expect((await generar(libroId)).status).toBe(201);

      const reajuste = await enviarComo(GESTOR, 'post', `/libros/gestiones/${gestionId}/folios`, {});
      expect([reajuste.status, reajuste.body.error?.message]).toEqual([201, undefined]);
      expect(reajuste.body.data.resumenGeneracion).toEqual(
        expect.objectContaining({ paralelosGenerados: 1, foliosCreados: 1, foliosAnulados: 1 })
      );
      const libro = await como(GESTOR, 'get', `/libros/${libroId}`);
      expect(libro.body.data.libro).toEqual(expect.objectContaining({ totalFolios: 1, foliosAnulados: 1 }));

      // La gestión sin libro abierto no se puede reajustar (se valida primero la nómina de paralelos)
      esperarValidacion(await enviarComo(GESTOR, 'post', '/libros/gestiones/abc/folios', {}));
    });
  });

  it('un libro CERRADO no admite folios; cerrarlo con materias sin nota exige confirmar con motivo; se puede reabrir', async () => {
    await conLimpieza(async (limpiar) => {
      const { libroId } = await prepararLibroConEstudiante(limpiar, 'cierre');
      expect((await generar(libroId)).status).toBe(201);

      // El estudiante está CURSANDO (sin nota final): el cierre simple se bloquea
      const bloqueado = await enviarComo(GESTOR, 'patch', `/libros/${libroId}`, { estado: 'CERRADO' });
      expect(bloqueado.status).toBe(409);
      expect(bloqueado.body.error.message).toContain('No se puede cerrar el libro');
      // Forzar exige un motivo de al menos 10 caracteres
      esperarValidacion(await enviarComo(GESTOR, 'patch', `/libros/${libroId}`, { estado: 'CERRADO', forzarCierre: true }));
      esperarValidacion(await enviarComo(GESTOR, 'patch', `/libros/${libroId}`, { estado: 'CERRADO', forzarCierre: true, motivo: 'corto' }));

      const cierra = await enviarComo(GESTOR, 'patch', `/libros/${libroId}`, {
        estado: 'CERRADO',
        forzarCierre: true,
        motivo: 'ci-cierre de prueba automatizada',
      });
      expect([cierra.status, cierra.body.error?.message]).toEqual([200, undefined]);
      expect(cierra.body.data.libro.estado).toBe('CERRADO');
      expect(cierra.body.data.cierre).toEqual(expect.objectContaining({ forzado: true, pendientesAsentados: 1 }));

      const sinFolios = await generar(libroId, 2);
      esperarValidacion(sinFolios);
      expect(sinFolios.body.error.message).toContain('cerrado');

      const reabre = await enviarComo(GESTOR, 'patch', `/libros/${libroId}`, { estado: 'ABIERTO' });
      expect([reabre.status, reabre.body.error?.message]).toEqual([200, undefined]);
      expect(reabre.body.data.libro.estado).toBe('ABIERTO');
    });
  });

  it('el libro con folios se exporta como Excel real', async () => {
    await conLimpieza(async (limpiar) => {
      const { libroId } = await prepararLibroConEstudiante(limpiar, 'export');
      expect((await generar(libroId)).status).toBe(201);
      const res = await descargarComo(GESTOR, `/libros/${libroId}/export`);
      expect(res.status).toBe(200);
      expect(Buffer.isBuffer(res.body)).toBe(true);
      expect(res.body.subarray(0, 2).toString()).toBe('PK');
    });
  });
});
