import { describe, it, expect } from '@jest/globals';
import { ListRequestDTO } from '../../../src/application/dtos/common/ListRequestDTO.js';
import { RegisterStudentRequestDTO } from '../../../src/application/dtos/estudiantes/request/RegisterStudentRequestDTO.js';

describe('ListRequestDTO.fromQuery', () => {
  it('aplica página 1 y límite 50 por defecto', () => {
    expect(ListRequestDTO.fromQuery({})).toEqual({ filters: {}, page: 1, limit: 50 });
  });

  it('normaliza página y límite (mínimo 1, máximo 10000, no numéricos a los valores por defecto)', () => {
    expect(ListRequestDTO.fromQuery({ page: '3', limit: '20' })).toMatchObject({ page: 3, limit: 20 });
    expect(ListRequestDTO.fromQuery({ page: '-4', limit: '-1' })).toMatchObject({ page: 1, limit: 1 });
    expect(ListRequestDTO.fromQuery({ page: 'x', limit: 'y' })).toMatchObject({ page: 1, limit: 50 });
    expect(ListRequestDTO.fromQuery({ limit: '999999' }).limit).toBe(10000);
  });

  it('recorta search y sort y descarta lo que no sea texto', () => {
    expect(ListRequestDTO.fromQuery({ search: '  ana ', sort: ' nombre:DESC ' }).filters).toEqual({ search: 'ana', sort: 'nombre:DESC' });
    expect(ListRequestDTO.fromQuery({ search: ['a'], sort: 5 }).filters).toEqual({});
    expect(ListRequestDTO.fromQuery({ search: '', sort: '' }).filters).toEqual({});
  });
});

describe('RegisterStudentRequestDTO.fromRequest', () => {
  const base = {
    ci: '1234567',
    expedicionId: 'LP',
    nombres: 'Ana',
    apellidoPaterno: 'Paz',
    apellidoMaterno: 'Ríos',
    fechaNacimiento: '2000-01-01',
    generoId: 'F',
    estadoCivilId: 2,
    emailPersonal: 'a@b.co',
    celular: '7000',
    direccion: 'Calle 1',
    municipioResidenciaId: 9,
  };

  it('traduce los nombres del formulario a los del caso de uso', () => {
    const r = RegisterStudentRequestDTO.fromRequest({ ...base, tipoAdmision: 'NUEVO' });
    expect(r.student).toMatchObject({
      ci: '1234567',
      expedition: 'LP',
      firstName: 'Ana',
      lastName: 'Paz',
      motherLastName: 'Ríos',
      birthDate: '2000-01-01',
      gender: 'F',
      civilStatusId: 2,
      bloodType: null,
      personalEmail: 'a@b.co',
      mobilePhone: '7000',
      residenceMunicipalityId: 9,
      works: false,
      employerInstitution: null,
      position: null,
    });
    expect(r).toMatchObject({ guardians: [], disabilities: [], origins: [], documentation: {}, transitability: null, transfer: null, tipoAdmision: 'NUEVO' });
  });

  it('antiguo: conserva gestión de ingreso y carrera', () => {
    const r = RegisterStudentRequestDTO.fromRequest({ ...base, tipoAdmision: 'ANTIGUO', gestionIngresoId: 3, carreraId: 4 });
    expect(r).toMatchObject({ gestionIngresoId: 3, carreraId: 4 });
  });

  it('discapacidad solo si la tiene y se indica el tipo', () => {
    const con = RegisterStudentRequestDTO.fromRequest({ ...base, tieneDiscapacidad: true, tipoDiscapacidadId: 2, descripcion: 'd', gradoDiscapacidad: 'GRAVE' });
    expect(con.disabilities).toEqual([{ disabilityTypeId: 2, description: 'd', disabilityDegree: 'GRAVE', cause: null }]);
    expect(RegisterStudentRequestDTO.fromRequest({ ...base, tieneDiscapacidad: true }).disabilities).toEqual([]);
    expect(RegisterStudentRequestDTO.fromRequest({ ...base, tipoDiscapacidadId: 2 }).disabilities).toEqual([]);
  });

  describe('orígenes', () => {
    it('tipoOrigen 0 (falsy) también cuenta y se normaliza a BOLIVIANA con municipio y localidad', () => {
      const { origins } = RegisterStudentRequestDTO.fromRequest({ ...base, tipoOrigen: 0, municipioId: 5, localidadComunidad: 'Comunidad', paisId: 1, idiomaMaternoId: 2 });
      expect(origins).toEqual([
        { countryId: null, birthMunicipalityId: 5, birthCity: 'Comunidad', motherTongueId: 2, secondaryLanguageId: null, originType: 'BOLIVIANA', isPrincipal: true },
      ]);
    });

    it('EXTRANJERA usa país y ciudad de nacimiento', () => {
      const { origins } = RegisterStudentRequestDTO.fromRequest({ ...base, tipoOrigen: '1', paisId: 7, ciudadNacimiento: 'Lima', municipioId: 5 });
      expect(origins[0]).toMatchObject({ countryId: 7, birthMunicipalityId: null, birthCity: 'Lima', originType: 'EXTRANJERA' });
    });

    it('doble nacionalidad con primera boliviana: segunda extranjera, idiomas solo en la principal', () => {
      const { origins } = RegisterStudentRequestDTO.fromRequest({
        ...base,
        tipoOrigen: 2,
        primeraNacionalidad: 'BOLIVIANA',
        municipioId: 5,
        localidadComunidad: 'Loc',
        idiomaMaternoId: 1,
        idiomaSecundarioId: 2,
        segundaPaisId: 8,
        segundaCiudadNacimiento: 'Quito',
      });
      expect(origins).toEqual([
        { countryId: null, birthMunicipalityId: 5, birthCity: 'Loc', motherTongueId: 1, secondaryLanguageId: 2, originType: 'BOLIVIANA', isPrincipal: true },
        { countryId: 8, birthMunicipalityId: null, birthCity: 'Quito', motherTongueId: null, secondaryLanguageId: null, originType: 'EXTRANJERA', isPrincipal: false },
      ]);
    });

    it('doble nacionalidad con primera extranjera: segunda boliviana', () => {
      const { origins } = RegisterStudentRequestDTO.fromRequest({
        ...base,
        tipoOrigen: 'DOBLE_NACIONALIDAD',
        primeraNacionalidad: 'EXTRANJERA',
        paisId: 7,
        ciudadNacimiento: 'Lima',
        segundaMunicipioId: 6,
        segundaLocalidadComunidad: 'Loc2',
      });
      expect(origins[0]).toMatchObject({ countryId: 7, birthCity: 'Lima', originType: 'EXTRANJERA', isPrincipal: true });
      expect(origins[1]).toMatchObject({ countryId: null, birthMunicipalityId: 6, birthCity: 'Loc2', originType: 'BOLIVIANA', isPrincipal: false });
    });

    it('doble nacionalidad sin primera nacionalidad cae al origen simple', () => {
      const { origins } = RegisterStudentRequestDTO.fromRequest({ ...base, tipoOrigen: 2, paisId: 7 });
      expect(origins).toHaveLength(1);
      expect(origins[0].originType).toBe('DOBLE_NACIONALIDAD');
    });
  });

  it('contactos de emergencia se traducen; no arreglo da []', () => {
    const { guardians } = RegisterStudentRequestDTO.fromRequest({
      ...base,
      contactosEmergencia: [{ tipoParentescoId: 1, nombres: 'Luis', apellidos: 'Gil', celular1: '7', celular2: '8' }],
    });
    expect(guardians).toEqual([
      { relationshipTypeId: 1, firstName: 'Luis', lastName: 'Gil', cellphone1: '7', cellphone2: '8', livesWithStudent: false },
    ]);
    expect(RegisterStudentRequestDTO.fromRequest({ ...base, contactosEmergencia: 'x' }).guardians).toEqual([]);
  });

  it('documentación conserva las claves doc_N y traduce en_tramite', () => {
    const { documentation } = RegisterStudentRequestDTO.fromRequest({
      ...base,
      documentacion: { doc_1: { entregado: true, en_tramite: true, fechaEntrega: '2026-01-01', observaciones: 'ok' }, doc_2: {} },
    });
    expect(documentation).toEqual({
      doc_1: { entregado: true, enTramite: true, fechaEntrega: '2026-01-01', observaciones: 'ok' },
      doc_2: { entregado: false, enTramite: false, fechaEntrega: null, observaciones: null },
    });
  });

  it('transitabilidad: arma el bloque con estado SOLICITADO por defecto y departamento numérico', () => {
    const { transitability, transfer } = RegisterStudentRequestDTO.fromRequest({
      ...base,
      tipoAdmision: 'TRANSITABILIDAD',
      transitabilidad_institucion_nombre: 'Colegio',
      transitabilidad_tipo: 'UETHP',
      transitabilidad_departamento_id: '3',
    });
    expect(transfer).toBeNull();
    expect(transitability).toMatchObject({ institucionNombre: 'Colegio', tipoInstitucion: 'UETHP', departamentoId: 3, estado: 'SOLICITADO', codigoSie: null });
    expect(
      RegisterStudentRequestDTO.fromRequest({ ...base, tipoAdmision: 'TRANSITABILIDAD', transitabilidad_departamento_id: '' }).transitability.departamentoId
    ).toBeNull();
    expect(
      RegisterStudentRequestDTO.fromRequest({ ...base, tipoAdmision: 'TRANSITABILIDAD', transitabilidad_departamento_id: 'xx' }).transitability.departamentoId
    ).toBeNull();
  });

  it('traspaso: arma el bloque propio y respeta el estado enviado', () => {
    const { transfer, transitability } = RegisterStudentRequestDTO.fromRequest({
      ...base,
      tipoAdmision: 'TRASPASO',
      traspaso_institucion_origen_nombre: 'Otro instituto',
      traspaso_anio_cursado: 'SEGUNDO',
      traspaso_departamento_id: 5,
      traspaso_estado: 'APROBADO',
    });
    expect(transitability).toBeNull();
    expect(transfer).toMatchObject({ institucionNombre: 'Otro instituto', anioCursado: 'SEGUNDO', departamentoId: 5, estado: 'APROBADO' });
  });
});
