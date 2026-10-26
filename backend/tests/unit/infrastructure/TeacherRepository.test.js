import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { Teacher } from '../../../src/domain/entities/Teacher.js';

const mockQuery = jest.fn();
const mockModel = { findByPk: jest.fn(), findAll: jest.fn(), create: jest.fn(), update: jest.fn() };

jest.unstable_mockModule('../../../src/infrastructure/database/sequelize.js', () => ({
  sequelize: { query: mockQuery },
}));
jest.unstable_mockModule('../../../src/infrastructure/database/models/docente.js', () => ({
  Docente: mockModel,
}));

const { TeacherRepository } = await import('../../../src/infrastructure/repositories/TeacherRepository.js');

const sqlDe = (llamada) => llamada[0];
const optsDe = (llamada) => llamada[1];

describe('TeacherRepository', () => {
  let repo;

  beforeEach(() => {
    repo = new TeacherRepository();
    mockQuery.mockReset();
    Object.values(mockModel).forEach((fn) => fn.mockReset());
  });

  describe('configuración del repositorio', () => {
    it('expone el modelo, la colección, el orden y los campos de búsqueda', () => {
      expect(repo.getModel()).toBe(mockModel);
      expect(repo.getCollectionName()).toBe('teachers');
      expect(repo.getDefaultSort()).toEqual([]);
      const campos = repo.getSearchFields();
      expect(campos).toEqual(expect.arrayContaining(['nombres', 'apellidoPaterno', 'apellidoMaterno', 'ci', 'emailPersonal']));
      expect(new Set(campos).size).toBe(campos.length);
    });

    it('toEntity delega en el mapper y devuelve una entidad Teacher', () => {
      const entidad = repo.toEntity({
        id: 3,
        usuarioId: 9,
        ci: '1234567',
        expedicion: 'LP',
        nombres: 'Ana',
        apellidoPaterno: 'Paz',
        toJSON() {
          return this;
        },
      });
      expect(entidad).toBeInstanceOf(Teacher);
      expect(entidad.id).toBe(3);
      expect(entidad.firstName).toBe('Ana');
    });

    it('toEntity de null devuelve null', () => {
      expect(repo.toEntity(null)).toBeNull();
    });

    it('mapDataToModel / mapDataToUpdate traducen dominio a columnas', () => {
      const model = repo.mapDataToModel({ ci: '1234567', firstName: 'Ana', lastName: 'Paz' }, 5);
      expect(model).toMatchObject({ ci: '1234567', nombres: 'Ana', apellidoPaterno: 'Paz' });
      const upd = repo.mapDataToUpdate({ firstName: 'Luz' }, 5);
      expect(upd).toMatchObject({ nombres: 'Luz' });
      expect(upd.apellidoPaterno).toBeUndefined();
    });
  });

  describe('buildWhereClause', () => {
    it('sin filtros devuelve un where vacío', () => {
      expect(repo.buildWhereClause({})).toEqual({});
    });

    it('mapea dominio (inglés) a columnas (español)', () => {
      const where = repo.buildWhereClause({
        userId: 1,
        ci: '1234567',
        firstName: 'Ana',
        lastName: 'Paz',
        motherLastName: 'Ríos',
        birthDate: '1985-04-30',
        gender: 'FEMENINO',
        civilStatusId: 2,
        nationality: 'Boliviana',
        phone: '222',
        mobilePhone: '700',
        address: 'calle',
        residenceMunicipalityId: 4,
        zone: 'z',
        professionalTitle: 'Ing.',
        specialty: 'Redes',
        academicLevel: 'MAESTRIA',
        graduationInstitution: 'UMSA',
        graduationYear: 2010,
        yearsOfExperience: 3,
        hireDate: '2020-01-01',
        retirementDate: '2030-01-01',
        contractType: 'PLANTA',
        laborState: 'ACTIVO',
        observations: 'obs',
      });
      expect(where).toEqual({
        usuarioId: 1,
        ci: '1234567',
        nombres: 'Ana',
        apellidoPaterno: 'Paz',
        apellidoMaterno: 'Ríos',
        fechaNacimiento: '1985-04-30',
        genero: 'FEMENINO',
        estadoCivilId: 2,
        nacionalidad: 'Boliviana',
        telefono: '222',
        celular: '700',
        direccion: 'calle',
        municipioResidenciaId: 4,
        zona: 'z',
        tituloProfesional: 'Ing.',
        especialidad: 'Redes',
        nivelAcademico: 'MAESTRIA',
        institucionEgreso: 'UMSA',
        anioEgreso: 2010,
        aniosExperiencia: 3,
        fechaContratacion: '2020-01-01',
        fechaRetiro: '2030-01-01',
        tipoContrato: 'PLANTA',
        estadoLaboral: 'ACTIVO',
        observaciones: 'obs',
      });
    });

    it('normaliza expedición a mayúsculas y email a minúsculas', () => {
      expect(repo.buildWhereClause({ expedition: 'lp', personalEmail: 'ANA@Incos.EDU.bo' })).toEqual({
        expedicion: 'LP',
        emailPersonal: 'ana@incos.edu.bo',
      });
    });

    it('ignora filtros falsy en los campos que exigen valor, pero respeta cadenas vacías/0 en los que usan undefined', () => {
      const where = repo.buildWhereClause({ userId: 0, ci: '', gender: null, laborState: undefined, yearsOfExperience: 0, zone: '' });
      expect(where).toEqual({ aniosExperiencia: 0, zona: '' });
    });

    it('ignora filtros desconocidos (no permite columnas arbitrarias)', () => {
      expect(repo.buildWhereClause({ 'deleted_at; DROP TABLE docentes': 1, password: 'x', id: 4 })).toEqual({});
    });
  });

  describe('findDetailBundleByTeacherId', () => {
    it.each([[0], [-1], ['abc'], [NaN], [undefined]])('id inválido (%p): no consulta la BD', async (id) => {
      await expect(repo.findDetailBundleByTeacherId(id)).resolves.toEqual({ teacher: null, assignments: [], schedules: [] });
      expect(mockQuery).not.toHaveBeenCalled();
    });

    it('docente inexistente: devuelve vacío tras una sola consulta', async () => {
      mockQuery.mockResolvedValueOnce([]);
      await expect(repo.findDetailBundleByTeacherId(5)).resolves.toEqual({ teacher: null, assignments: [], schedules: [] });
      expect(mockQuery).toHaveBeenCalledTimes(1);
      expect(sqlDe(mockQuery.mock.calls[0])).toContain('FROM vista_base_docente_ficha');
      expect(sqlDe(mockQuery.mock.calls[0])).toContain('LIMIT :limit');
      expect(optsDe(mockQuery.mock.calls[0]).replacements).toEqual({ id: 5, limit: 1 });
    });

    it('arma ficha, asignaciones con banderas de conflicto y horarios', async () => {
      mockQuery
        .mockResolvedValueOnce([{ docente_id: 5, nombres: 'Ana' }])
        .mockResolvedValueOnce([{ asignacion_docente_id: 10 }, { asignacion_docente_id: 11 }, { asignacion_docente_id: null }])
        .mockResolvedValueOnce([
          { asignacion_docente_id: 10, conflicto_curso: 1, conflicto_horario: 0, conflicto_aula: '1' },
          { asignacion_docente_id: 'x', conflicto_curso: 1 },
        ])
        .mockResolvedValueOnce([{ bloque: 1 }]);

      const out = await repo.findDetailBundleByTeacherId('5');

      expect(out.teacher).toEqual({ docente_id: 5, nombres: 'Ana' });
      expect(out.assignments).toEqual([
        { asignacion_docente_id: 10, conflict_curso: true, conflict_horario: false, conflict_aula: true },
        { asignacion_docente_id: 11, conflict_curso: false, conflict_horario: false, conflict_aula: false },
        { asignacion_docente_id: null, conflict_curso: false, conflict_horario: false, conflict_aula: false },
      ]);
      expect(out.schedules).toEqual([{ bloque: 1 }]);
      const sqls = mockQuery.mock.calls.map(sqlDe);
      expect(sqls[1]).toContain('FROM vista_base_docente_asignaciones_curso WHERE docente_id = :id ORDER BY vigente DESC');
      expect(sqls[2]).toContain('FROM vista_base_docente_asignacion_conflictos');
      expect(sqls[3]).toContain('FROM vista_base_docente_curso_bloques_horario');
    });

    it('usa reemplazos parametrizados (el id nunca se concatena al SQL)', async () => {
      mockQuery.mockResolvedValueOnce([]);
      await repo.findDetailBundleByTeacherId(7);
      expect(sqlDe(mockQuery.mock.calls[0])).not.toMatch(/\b7\b/);
    });

    it('tolera que la BD devuelva algo que no es arreglo', async () => {
      mockQuery.mockResolvedValueOnce(undefined);
      await expect(repo.findDetailBundleByTeacherId(5)).resolves.toMatchObject({ teacher: null });
    });
  });

  describe('findGrillaConflictosByDocenteAndGestion', () => {
    it.each([
      [0, 1],
      [1, 0],
      ['x', 1],
      [1, 'y'],
      [null, null],
    ])('ids inválidos (%p, %p): no consulta', async (d, g) => {
      await expect(repo.findGrillaConflictosByDocenteAndGestion(d, g)).resolves.toEqual({ teacher: null, scheduleRows: [], paresConflicto: [] });
      expect(mockQuery).not.toHaveBeenCalled();
    });

    it('docente inexistente', async () => {
      mockQuery.mockResolvedValueOnce([]);
      await expect(repo.findGrillaConflictosByDocenteAndGestion(1, 2)).resolves.toEqual({ teacher: null, scheduleRows: [], paresConflicto: [] });
    });

    it('devuelve bloques, pares normalizados y solape de paralelos', async () => {
      const solape = [{ paralelo_gestion_id: 3, horario_id: 9 }];
      mockQuery
        .mockResolvedValueOnce([{ docente_id: 1 }])
        .mockResolvedValueOnce([{ bloque: 1 }])
        .mockResolvedValueOnce([
          {
            bloque_a_id: '1',
            bloque_b_id: 2,
            horario_id: 9,
            dia: 'lunes',
            hora_inicio: '08:00:00',
            hora_fin: '09:30:00',
            sigla_a: 'MAT',
            sigla_b: 'FIS',
            paralelo_a: 'A',
            paralelo_b: 'B',
            paralelo_gestion_id_a: '4',
            paralelo_gestion_id_b: 5,
          },
          {},
        ])
        .mockResolvedValueOnce(solape);

      const out = await repo.findGrillaConflictosByDocenteAndGestion('1', '2');

      expect(out.teacher).toEqual({ docente_id: 1 });
      expect(out.scheduleRows).toEqual([{ bloque: 1 }]);
      expect(out.solapeParaleloHorario).toBe(solape);
      expect(out.paresConflicto[0]).toEqual({
        bloqueAId: 1,
        bloqueBId: 2,
        horarioId: 9,
        dia: 'LUNES',
        horaInicio: '08:00',
        horaFin: '09:30',
        siglaA: 'MAT',
        siglaB: 'FIS',
        paraleloA: 'A',
        paraleloB: 'B',
        paraleloGestionIdA: 4,
        paraleloGestionIdB: 5,
        descripcion: 'MAT (A) ↔ FIS (B) · LUNES 08:00-09:30',
      });
      // fila vacía: usa guiones y nulos
      expect(out.paresConflicto[1]).toMatchObject({
        bloqueAId: null,
        bloqueBId: null,
        horarioId: null,
        dia: '',
        horaInicio: '',
        horaFin: '',
        siglaA: '—',
        siglaB: '—',
        paraleloA: null,
        paraleloB: null,
        paraleloGestionIdA: null,
        paraleloGestionIdB: null,
        descripcion: '— (—) ↔ — (—) ·  -',
      });
      expect(optsDe(mockQuery.mock.calls[1]).replacements).toEqual({ docenteId: 1, gestionId: 2 });
      expect(optsDe(mockQuery.mock.calls[3]).replacements).toEqual({ gestionId: 2 });
    });
  });

  describe('getDocentesConChoqueBloques', () => {
    it.each([[0], [-2], ['x'], [undefined]])('curso inválido %p: devuelve []', async (id) => {
      await expect(repo.getDocentesConChoqueBloques(id)).resolves.toEqual([]);
      expect(mockQuery).not.toHaveBeenCalled();
    });

    it('devuelve los ids de docentes ocupados, aceptando snake y camel case', async () => {
      mockQuery.mockResolvedValueOnce([{ docente_id: '4' }, { docenteId: 8 }]);
      await expect(repo.getDocentesConChoqueBloques('3')).resolves.toEqual([4, 8]);
      expect(sqlDe(mockQuery.mock.calls[0])).toContain('FROM vista_base_curso_docentes_ocupados_franja WHERE curso_id = :cursoId');
      expect(optsDe(mockQuery.mock.calls[0]).replacements).toEqual({ cursoId: 3 });
    });
  });

  describe('getTeachingLoadAndConflictStats', () => {
    it.each([[undefined], [[]], [null], [['a', 0, -1]]])('sin ids válidos (%p): {} sin consultar', async (ids) => {
      await expect(repo.getTeachingLoadAndConflictStats(ids)).resolves.toEqual({});
      expect(mockQuery).not.toHaveBeenCalled();
    });

    it('inicializa en cero a los docentes sin fila y suma conflictos', async () => {
      mockQuery.mockResolvedValueOnce([
        { docente_id: 1, total_asignaciones: '3', total_materias: 2, total_paralelos: 1, conflicto_curso: 1, conflicto_horario: '2', conflicto_aula: 0 },
        { docente_id: 99, total_asignaciones: 5 },
        { docente_id: 3, total_asignaciones: null, total_materias: 'x' },
      ]);

      const out = await repo.getTeachingLoadAndConflictStats(['1', 2, 3, 'x']);

      expect(Object.keys(out)).toEqual(['1', '2', '3']);
      expect(out[1]).toEqual({
        totalAsignaciones: 3,
        totalMaterias: 2,
        totalParalelos: 1,
        hasAsignaciones: true,
        conflictos: { curso: 1, horario: 2, aula: 0, total: 3, hasConflictos: true },
      });
      expect(out[2]).toEqual({
        totalAsignaciones: 0,
        totalMaterias: 0,
        totalParalelos: 0,
        hasAsignaciones: false,
        conflictos: { curso: 0, horario: 0, aula: 0, total: 0, hasConflictos: false },
      });
      expect(out[3].hasAsignaciones).toBe(false);
      expect(out[99]).toBeUndefined();
      expect(optsDe(mockQuery.mock.calls[0]).replacements).toEqual({ teacherIds: [1, 2, 3] });
    });
  });

  describe('findCargaLimitesById', () => {
    it.each([[0], ['x'], [-5], [undefined]])('id inválido %p: null sin consultar', async (id) => {
      await expect(repo.findCargaLimitesById(id)).resolves.toBeNull();
      expect(mockQuery).not.toHaveBeenCalled();
    });

    it('docente inactivo/inexistente: null', async () => {
      mockQuery.mockResolvedValueOnce([]);
      await expect(repo.findCargaLimitesById(4)).resolves.toBeNull();
    });

    it('devuelve los límites y pasa los valores por defecto como reemplazos', async () => {
      mockQuery.mockResolvedValueOnce([{ id: '4', max_horas_semana: '18', max_horas_mes: 70 }]);
      await expect(repo.findCargaLimitesById('4')).resolves.toEqual({ id: 4, maxHorasSemana: 18, maxHorasMes: 70 });
      expect(optsDe(mockQuery.mock.calls[0]).replacements).toEqual({ teacherId: 4, defaultSemana: 20, defaultMes: 80 });
    });

    it('si el valor no es numérico o es 0 cae a los valores por defecto', async () => {
      mockQuery.mockResolvedValueOnce([{ id: 4, max_horas_semana: 0, max_horas_mes: 'n/a' }]);
      await expect(repo.findCargaLimitesById(4)).resolves.toEqual({ id: 4, maxHorasSemana: 20, maxHorasMes: 80 });
    });
  });

  describe('findActiveColorAssignments', () => {
    it('normaliza color, nombre y descarta filas sin color', async () => {
      mockQuery.mockResolvedValueOnce([
        { docenteId: '1', colorHex: '#e6194b', docenteNombre: 'Ing.   Ana   Paz ' },
        { docenteId: 2, colorHex: '', docenteNombre: 'Sin color' },
        { docenteId: 3, colorHex: '#3cb44b', docenteNombre: '   ' },
        { docenteId: 4, colorHex: null, docenteNombre: null },
      ]);
      await expect(repo.findActiveColorAssignments()).resolves.toEqual([
        { docenteId: 1, colorHex: '#E6194B', docenteNombre: 'Ing. Ana Paz' },
        { docenteId: 3, colorHex: '#3CB44B', docenteNombre: null },
      ]);
    });

    it('lista vacía cuando no hay colores', async () => {
      mockQuery.mockResolvedValueOnce([]);
      await expect(repo.findActiveColorAssignments()).resolves.toEqual([]);
    });
  });

  describe('findActiveByColorHex', () => {
    it.each([[''], [null], [undefined], ['   ']])('color vacío %p: null sin consultar', async (color) => {
      await expect(repo.findActiveByColorHex(color)).resolves.toBeNull();
      expect(mockQuery).not.toHaveBeenCalled();
    });

    it('sin coincidencia devuelve null', async () => {
      mockQuery.mockResolvedValueOnce([]);
      await expect(repo.findActiveByColorHex('#abcdef')).resolves.toBeNull();
      expect(optsDe(mockQuery.mock.calls[0]).replacements).toEqual({ colorHex: '#ABCDEF' });
      expect(sqlDe(mockQuery.mock.calls[0])).not.toContain('id <>');
    });

    it('con coincidencia carga la entidad por id y excluye al docente indicado', async () => {
      mockQuery.mockResolvedValueOnce([{ id: '12' }]);
      const entidad = new Teacher({ id: 12 });
      const spy = jest.spyOn(repo, 'findById').mockResolvedValue(entidad);
      await expect(repo.findActiveByColorHex(' #abcdef ', '5')).resolves.toBe(entidad);
      expect(spy).toHaveBeenCalledWith(12);
      expect(sqlDe(mockQuery.mock.calls[0])).toContain('AND id <> :excludeTeacherId');
      expect(optsDe(mockQuery.mock.calls[0]).replacements).toEqual({ colorHex: '#ABCDEF', excludeTeacherId: 5 });
    });

    it('un excludeTeacherId no numérico se ignora', async () => {
      mockQuery.mockResolvedValueOnce([]);
      await repo.findActiveByColorHex('#abcdef', 'no-numero');
      expect(sqlDe(mockQuery.mock.calls[0])).not.toContain('id <>');
    });

    it('el color malicioso viaja como reemplazo, no dentro del SQL', async () => {
      mockQuery.mockResolvedValueOnce([]);
      await repo.findActiveByColorHex("'; DROP TABLE docentes;--");
      expect(sqlDe(mockQuery.mock.calls[0])).not.toContain('DROP');
      expect(optsDe(mockQuery.mock.calls[0]).replacements.colorHex).toContain('DROP');
    });
  });

  describe('_selectFromView', () => {
    it('compone WHERE, ORDER BY y LIMIT sólo cuando se piden', async () => {
      mockQuery.mockResolvedValue([{ a: 1 }]);
      await repo._selectFromView('vista_x');
      expect(sqlDe(mockQuery.mock.calls[0])).toBe('SELECT * FROM vista_x');

      await repo._selectFromView('vista_x', { where: ['a = :a', 'b = :b'], replacements: { a: 1, b: 2 }, orderBy: 'a DESC', limit: '3' });
      expect(sqlDe(mockQuery.mock.calls[1])).toBe('SELECT * FROM vista_x WHERE a = :a AND b = :b ORDER BY a DESC LIMIT :limit');
      expect(optsDe(mockQuery.mock.calls[1]).replacements).toEqual({ a: 1, b: 2, limit: 3 });
    });

    it('ignora un límite no numérico', async () => {
      mockQuery.mockResolvedValue([]);
      await repo._selectFromView('vista_x', { limit: 'abc' });
      expect(sqlDe(mockQuery.mock.calls[0])).not.toContain('LIMIT');
    });
  });
});
