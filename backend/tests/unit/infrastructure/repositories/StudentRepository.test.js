import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { Op } from 'sequelize';
import { StudentRepository } from '../../../../src/infrastructure/repositories/StudentRepository.js';
import { sequelize } from '../../../../src/infrastructure/database/sequelize.js';

describe('StudentRepository', () => {
  let repo;
  let query;
  beforeEach(() => {
    repo = new StudentRepository();
    query = jest.spyOn(sequelize, 'query').mockResolvedValue([]);
  });
  afterEach(() => query.mockRestore());

  describe('buildWhereClause', () => {
    it('traduce filtros de dominio a columnas', () => {
      expect(
        repo.buildWhereClause({
          ci: '123',
          expedicion: ' lp ',
          studentCode: 'E-1',
          personalEmail: 'A@B.COM',
          userId: 4,
          gender: 'F',
          hasDisability: false,
        })
      ).toEqual({
        ci: '123',
        expedicion: 'LP',
        codigoEstudiante: 'E-1',
        emailPersonal: 'a@b.com',
        usuarioId: 4,
        genero: 'F',
        tieneDiscapacidad: false,
      });
    });

    it('excludeId produce Op.ne y se ignora si no es numérico', () => {
      expect(repo.buildWhereClause({ excludeId: '8' }).id).toEqual({ [Op.ne]: 8 });
      expect(repo.buildWhereClause({ excludeId: 'x' })).toEqual({});
    });

    it('expedicion nula o vacía se conserva tal cual', () => {
      expect(repo.buildWhereClause({ expedicion: null }).expedicion).toBeNull();
      expect(repo.buildWhereClause({ expedicion: '  ' }).expedicion).toBe('  ');
    });
  });

  describe('vistas de lectura', () => {
    it('obtenerDatosPersonales arma WHERE con replacements en orden', async () => {
      await repo.obtenerDatosPersonales({ id: 1, codigo_estudiante: 'E', ci: '9' });
      const [sql, opts] = query.mock.calls[0];
      expect(sql).toContain('WHERE id = ? AND codigo_estudiante = ? AND ci = ?');
      expect(opts.replacements).toEqual([1, 'E', '9']);
      await repo.obtenerDatosPersonales();
      expect(query.mock.calls[1][0]).not.toContain('WHERE');
    });

    it('listFromView pagina, busca y solo ordena por columnas permitidas', async () => {
      query.mockResolvedValueOnce([{ total: '7' }]).mockResolvedValueOnce([{ id: 1 }]);
      const r = await repo.listFromView({ search: ' ana ', sort: 'nombres:desc' }, 2, 5);
      expect(r).toEqual({ students: [{ id: 1 }], total: 7, page: 2, limit: 5 });
      expect(query.mock.calls[0][1].replacements).toEqual(Array(5).fill('%ana%'));
      expect(query.mock.calls[1][0]).toContain('ORDER BY nombres DESC');
      expect(query.mock.calls[1][1].replacements.slice(-2)).toEqual([5, 5]);

      query.mockResolvedValue([{ total: 0 }]);
      await repo.listFromView({ sort: 'password:ASC' });
      expect(query.mock.calls[3][0]).toContain('ORDER BY created_at DESC');
    });

    describe.each([
      ['buscarParaRegistroAporte', 'vista_estudiante_busqueda_registro_aporte'],
      ['buscarParaAsignacionBeca', 'vista_estudiante_busqueda_asignacion_beca'],
      ['buscarParaInscripcion', 'vista_estudiante_busqueda_inscripcion'],
    ])('%s', (metodo, vista) => {
      it('preliminar consulta la vista con el límite acotado a 1..100', async () => {
        await repo[metodo]({ preliminar: true, limit: 500 });
        expect(query.mock.calls[0][0]).toContain(vista);
        expect(query.mock.calls[0][1].replacements).toEqual([100]);
        await repo[metodo]({ preliminar: true, limit: 'x' });
        expect(query.mock.calls[1][1].replacements).toEqual([50]);
      });

      it('texto menor a 2 caracteres devuelve vacío sin consultar', async () => {
        expect(await repo[metodo]({ q: ' a ' })).toEqual([]);
        expect(await repo[metodo]({})).toEqual([]);
        expect(query).not.toHaveBeenCalled();
      });

      it('quita comodines, tokeniza (máx. 6) y reparte los replacements', async () => {
        await repo[metodo]({ q: 'ju%a_n pe 1 uno dos tres cuatro cinco seis', limit: 10 });
        const [sql, opts] = query.mock.calls[0];
        expect(sql).toContain(vista);
        const r = opts.replacements;
        expect(r.slice(0, 12).every((x) => x === '%juan pe 1 uno dos tres cuatro cinco seis%')).toBe(true);
        expect(r[12]).toBe('%juan%');
        expect(r).toHaveLength(12 + 6 * 9 + 1);
        expect(r.at(-1)).toBe(10);
      });
    });

    it('buscarParaInscripcion con soloNuevos delega en la búsqueda de nuevos', async () => {
      const espia = jest.spyOn(repo, '_buscarSoloNuevosParaInscripcion').mockResolvedValue(['n']);
      expect(await repo.buscarParaInscripcion({ soloNuevos: true, q: 'ab', limit: 3 })).toEqual(['n']);
      expect(espia).toHaveBeenCalledWith({ q: 'ab', lim: 3 });
    });
  });
});
