import { StudentMapper } from '../../../src/infrastructure/mappers/StudentMapper.js';
import { Student } from '../../../src/domain/entities/Student.js';

describe('StudentMapper (infraestructura)', () => {
  const modelo = {
    id: 5,
    activo: true,
    usuarioId: 9,
    codigoEstudiante: '20260001',
    ci: '123456',
    expedicion: 'LP',
    nombres: 'Ana',
    apellidoPaterno: 'Perez',
    apellidoMaterno: 'Gomez',
    fechaNacimiento: '2000-05-10',
    genero: 'F',
    estadoCivilId: 1,
    tipoSangre: 'O+',
    tieneDiscapacidad: 1,
    emailPersonal: 'ana@mail.com',
    celular: '70000000',
    telefonoFijo: '2222222',
    direccion: 'Calle 1',
    municipioResidenciaId: 3,
    zona: 'Centro',
    trabaja: 0,
    empresaInstitucion: 'ACME',
    cargo: 'Jefe',
    observaciones: 'obs',
  };

  describe('toEntity', () => {
    it('devuelve null si no hay modelo', () => {
      expect(StudentMapper.toEntity(null)).toBeNull();
    });

    it('convierte columnas en español a campos de dominio', () => {
      const entity = StudentMapper.toEntity(modelo);
      expect(entity).toBeInstanceOf(Student);
      expect(entity).toMatchObject({
        id: 5,
        userId: 9,
        studentCode: '20260001',
        ci: '123456',
        expedition: 'LP',
        firstName: 'Ana',
        lastName: 'Perez',
        motherLastName: 'Gomez',
        birthDate: '2000-05-10',
        gender: 'F',
        civilStatusId: 1,
        bloodType: 'O+',
        personalEmail: 'ana@mail.com',
        mobilePhone: '70000000',
        landlinePhone: '2222222',
        address: 'Calle 1',
        residenceMunicipalityId: 3,
        zone: 'Centro',
        employerInstitution: 'ACME',
        position: 'Jefe',
        observations: 'obs',
      });
    });

    it('normaliza los booleanos de la BD (1/0/true)', () => {
      const entity = StudentMapper.toEntity(modelo);
      expect(entity.hasDisability).toBe(true);
      expect(entity.works).toBe(false);
      expect(StudentMapper.toEntity({ ...modelo, trabaja: true }).works).toBe(true);
    });

    it('lee dataValues de un modelo Sequelize', () => {
      const entity = StudentMapper.toEntity({ dataValues: modelo });
      expect(entity.firstName).toBe('Ana');
    });

    it('soporta attributes limitados sin inventar campos', () => {
      const entity = StudentMapper.toEntity({ id: 1, nombres: 'Solo' });
      expect(entity.firstName).toBe('Solo');
      expect(entity).not.toHaveProperty('ci');
    });
  });

  describe('toModel', () => {
    const dominio = {
      userId: 9,
      studentCode: '20260001',
      ci: '123456',
      expedition: 'lp',
      firstName: 'Ana',
      lastName: 'Perez',
      birthDate: '2000-05-10',
      gender: 'F',
      personalEmail: 'ANA@Mail.com',
      mobilePhone: '70000000',
    };

    it('convierte campos de dominio a columnas, normalizando mayúsculas y nulos', () => {
      expect(StudentMapper.toModel(dominio)).toEqual({
        usuarioId: 9,
        codigoEstudiante: '20260001',
        ci: '123456',
        expedicion: 'LP',
        nombres: 'Ana',
        apellidoPaterno: 'Perez',
        apellidoMaterno: null,
        fechaNacimiento: '2000-05-10',
        genero: 'F',
        estadoCivilId: null,
        tipoSangre: null,
        tieneDiscapacidad: false,
        emailPersonal: 'ana@mail.com',
        celular: '70000000',
        telefonoFijo: null,
        direccion: null,
        municipioResidenciaId: null,
        zona: null,
        trabaja: false,
        empresaInstitucion: null,
        cargo: null,
        observaciones: null,
      });
    });

    it('expedición vacía se guarda como null', () => {
      expect(StudentMapper.toModel({ ...dominio, expedition: '' }).expedicion).toBeNull();
      expect(StudentMapper.toModel({ ...dominio, expedition: undefined }).expedicion).toBeNull();
    });

    it('respeta hasDisability y works explícitos', () => {
      const m = StudentMapper.toModel({ ...dominio, hasDisability: true, works: true });
      expect(m).toMatchObject({ tieneDiscapacidad: true, trabaja: true });
    });

    it('ida y vuelta conserva los datos de dominio', () => {
      const entity = StudentMapper.toEntity(modelo);
      const vuelta = StudentMapper.toModel(entity);
      expect(vuelta).toMatchObject({
        codigoEstudiante: '20260001',
ci: '123456',
expedicion: 'LP',
nombres: 'Ana',
        tieneDiscapacidad: true,
trabaja: false,
      });
    });
  });

  describe('toModelForUpdate', () => {
    it('incluye solo los campos presentes', () => {
      expect(StudentMapper.toModelForUpdate({ firstName: 'Luis', expedition: 'cb' }))
        .toEqual({ nombres: 'Luis', expedicion: 'CB' });
    });

    it('conserva false en booleanos y convierte vacíos a null', () => {
      expect(StudentMapper.toModelForUpdate({ hasDisability: false, works: false, address: '', bloodType: '' }))
        .toEqual({ tieneDiscapacidad: false, trabaja: false, direccion: null, tipoSangre: null });
    });

    it('mapea activo/active al campo activo', () => {
      expect(StudentMapper.toModelForUpdate({ active: false })).toEqual({ activo: false });
      expect(StudentMapper.toModelForUpdate({ activo: true })).toEqual({ activo: true });
    });

    it('un objeto vacío no produce cambios', () => {
      expect(StudentMapper.toModelForUpdate({})).toEqual({});
    });
  });

  describe('toEntityList', () => {
    it('mapea arrays y tolera entradas inválidas', () => {
      expect(StudentMapper.toEntityList([modelo, null, { id: 2, nombres: 'B' }])).toHaveLength(2);
      expect(StudentMapper.toEntityList(null)).toEqual([]);
      expect(StudentMapper.toEntityList('x')).toEqual([]);
    });
  });
});
