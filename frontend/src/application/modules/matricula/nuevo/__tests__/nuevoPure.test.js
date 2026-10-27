import { describe, it, expect } from 'vitest';
import { validateRegisterStudent, validateRegisterStudentMessage } from '../validators/RegisterStudentValidator';
import * as docs from '../hooks/helpers/documentacionHelpers';
import { estudianteFormMapper, mapEstudianteToForm } from '../mappers/estudianteFormMapper';

const valido = { ci: '123', nombres: 'Ana', fechaNacimiento: '2000-01-01', generoId: 1, celular: '70000000' };

describe('RegisterStudentValidator', () => {
  it('rechaza datos ausentes o no objeto', () => {
    expect(validateRegisterStudent(null).errors[0].field).toBe('general');
    expect(validateRegisterStudent('x').isValid).toBe(false);
  });
  it('exige los campos obligatorios', () => {
    const r = validateRegisterStudent({});
    expect(r.isValid).toBe(false);
    expect(r.errors.map((e) => e.field)).toEqual(['ci', 'nombres', 'fechaNacimiento', 'generoId', 'celular']);
  });
  it('acepta datos mínimos válidos', () => {
    expect(validateRegisterStudent(valido)).toEqual({ isValid: true, errors: undefined });
    expect(validateRegisterStudentMessage(valido)).toBeNull();
  });
  it('valida tipos y formato', () => {
    const r = validateRegisterStudent({ ...valido, ci: {}, celular: [], fechaNacimiento: 5, emailPersonal: 'mal' });
    expect(r.errors.map((e) => e.field)).toEqual(['ci', 'emailPersonal', 'celular', 'fechaNacimiento']);
    expect(validateRegisterStudent({ ...valido, emailPersonal: 7 }).errors[0].message).toMatch(/texto/);
    expect(validateRegisterStudent({ ...valido, emailPersonal: 'a@b.co', fechaNacimiento: new Date(), ci: 55 }).isValid).toBe(true);
  });
  it('valida contactos de emergencia y documentación', () => {
    expect(validateRegisterStudent({ ...valido, contactosEmergencia: 'x' }).errors[0].field).toBe('contactosEmergencia');
    const r = validateRegisterStudent({
      ...valido,
      contactosEmergencia: [{ celular1: '1', celular2: 'x'.repeat(21), nombres: 'A', apellidos: 'x'.repeat(151) }, {}],
    });
    expect(r.errors.map((e) => e.field)).toEqual([
      'contactosEmergencia[0].celular1',
      'contactosEmergencia[0].celular2',
      'contactosEmergencia[0].nombres',
      'contactosEmergencia[0].apellidos',
    ]);
    expect(validateRegisterStudent({ ...valido, documentacion: [] }).errors[0].field).toBe('documentacion');
    expect(validateRegisterStudent({ ...valido, documentacion: {} }).isValid).toBe(true);
    expect(validateRegisterStudentMessage({ ...valido, ci: '' })).toBe('CI es requerido');
    expect(validateRegisterStudentMessage({})).toContain('. ');
  });
});

describe('documentacionHelpers', () => {
  it('filtra documentos del sistema y normaliza', () => {
    expect(docs.filterDocumentosSistema()).toEqual([]);
    expect(docs.filterDocumentosSistema([{ id: 1, esDocumentoSistema: true }, { id: 2 }])).toEqual([{ id: 2 }]);
    expect(docs.normalizeDocumentos(null)).toEqual([]);
    const [a, b] = docs.normalizeDocumentos([
      { id: 1, nombre: 'CI', descripcion: 'd', requerido: false, aceptaFotocopia: true, orden: 2, documentoPadreId: 9, tipoDocumento: 'X', esDocumentoSistema: true },
      { id: 2, name: 'N', description: 'D', required: false, acceptsPhotocopy: true, order: 4, documento_padre_id: 3 },
    ]);
    expect(a).toMatchObject({ name: 'CI', description: 'd', required: false, acceptsPhotocopy: true, orden: 2, documentoPadreId: 9, tipoDocumento: 'X', esDocumentoSistema: true });
    expect(b).toMatchObject({ name: 'N', required: false, acceptsPhotocopy: true, orden: 4, documentoPadreId: 3 });
    expect(docs.normalizeDocumentos([{ id: 3 }])[0]).toMatchObject({ required: true, acceptsPhotocopy: false, orden: 0, documentoPadreId: null });
  });

  it('separa padres e hijos', () => {
    expect(docs.separateDocumentosPadresHijos()).toEqual({ padres: [], hijos: [] });
    const r = docs.separateDocumentosPadresHijos([{ id: 1, documentoPadreId: null }, { id: 2, documentoPadreId: 1 }, { id: 3 }]);
    expect(r.padres.map((d) => d.id)).toEqual([1, 3]);
    expect(r.hijos.map((d) => d.id)).toEqual([2]);
  });

  it('agrega el estado de entrega desde el formulario', () => {
    expect(docs.addEstadoEntregado({ id: 1 })).toMatchObject({ entregado: true, en_tramite: false, observaciones: null });
    const f = { documentacion: { doc_1: { entregado: false, en_tramite: true, observaciones: 'o' } } };
    expect(docs.addEstadoEntregado({ id: 1 }, f)).toMatchObject({ entregado: false, en_tramite: true, observaciones: 'o' });
    expect(docs.addEstadoEntregadoMultiple()).toEqual([]);
    expect(docs.addEstadoEntregadoMultiple([{ id: 1 }, { id: 2 }], f).map((d) => d.entregado)).toEqual([false, true]);
  });

  it('hereda características y aplica la lógica padre-hijo', () => {
    expect(docs.heredarCaracteristicasPadre({ id: 2 }, { description: 'pd', required: false, acceptsPhotocopy: true, orden: 5 })).toMatchObject({ description: 'pd', required: false, acceptsPhotocopy: true, orden: 5 });
    expect(docs.heredarCaracteristicasPadre({ id: 2, required: true, acceptsPhotocopy: false, orden: 1 }, {})).toMatchObject({ required: true, acceptsPhotocopy: false, orden: 1, description: null });
    expect(docs.heredarCaracteristicasPadre({ id: 2 }, {})).toMatchObject({ required: true, acceptsPhotocopy: false, orden: 0 });
    expect(docs.applyLogicaPadreHijo()).toEqual([]);
    const padres = [{ id: 1, entregado: true }, { id: 2, entregado: false }, { id: 3, entregado: 0 }];
    const hijos = [{ id: 20, documento_padre_id: 2 }, { id: 30, documentoPadreId: 1 }];
    expect(docs.applyLogicaPadreHijo(padres, hijos).map((d) => d.id)).toEqual([1, 2, 20, 3]);
  });

  it('catálogo de edición y ocultar hijos con padre entregado', () => {
    expect(docs.getDocumentacionCatalogForEdit('ANTIGUO', [{ id: 1 }], [{ id: 9 }])).toEqual([{ id: 1 }]);
    expect(docs.getDocumentacionCatalogForEdit('traspaso', [{ id: 1 }], [{ id: 9 }])).toEqual([{ id: 9 }, { id: 1 }]);
    expect(docs.getDocumentacionCatalogForEdit()).toEqual([]);
    expect(docs.getDocumentacionCatalogForEdit('TRASPASO', null, null)).toEqual([]);
    expect(docs.filterDocumentacionOcultarHijosCuandoPadreEntregado(null)).toBeNull();
    const form = { doc_1: { entregado: true }, doc_6: { entregado: false }, doc_7: {}, doc_x: {}, otro: 1, doc_8: {} };
    expect(docs.filterDocumentacionOcultarHijosCuandoPadreEntregado(form, [])).toEqual(form);
    const out = docs.filterDocumentacionOcultarHijosCuandoPadreEntregado(form, [
      { id: 1 },
      { id: 6, documentoPadreId: 1 },
      { id: 7, documento_padre_id: 2 },
      { id: 8, documentoPadreId: 0 },
    ]);
    expect(out).not.toHaveProperty('doc_6');
    expect(out).toHaveProperty('doc_7');
    expect(out).toHaveProperty('doc_8');
  });

  it('ordena por orden manteniendo los indefinidos al final', () => {
    expect(docs.ordenarDocumentos()).toEqual([]);
    const r = docs.ordenarDocumentos([{ id: 'a' }, { id: 'b', orden: 2 }, { id: 'c', orden: 1 }, { id: 'd' }]);
    expect(r.map((d) => d.id)).toEqual(['c', 'b', 'a', 'd']);
  });
});

describe('estudianteFormMapper', () => {
  it('devuelve null sin detalle', () => {
    expect(estudianteFormMapper(null)).toBeNull();
    expect(estudianteFormMapper({})).toBeNull();
    expect(mapEstudianteToForm(null)).toBeNull();
  });

  it('no falla si el detalle no trae orígenes (asume boliviana)', () => {
    const f = mapEstudianteToForm({ student: { ci: '1', nombres: 'Ana' } });
    expect(f).toMatchObject({ ci: '1', tipoOrigen: 'BOLIVIANA', tipoAdmision: 'NUEVO', contactosEmergencia: [], documentacion: {} });
  });

  it('datos personales, tipo de admisión inferido y discapacidad', () => {
    const f = estudianteFormMapper({
      student: { ci: '1', trabaja: true, municipioResidenciaId: '4', residenceProvinceId: 3, departamentoResidenciaId: '2' },
      academicData: { gestionIngresoId: 5, carreraId: 2 },
      disabilities: [{ disabilityTypeId: 1, disabilityDegree: 'ALTO', description: 'd', cause: 'c' }],
      catalogs: { residenceMunicipality: { id: 44 }, residenceProvince: { provinciaId: 1, id: 0 }, residenceDepartment: { id: 22 } },
    });
    expect(f).toMatchObject({ tipoAdmision: 'ANTIGUO', gestionIngresoId: 5, trabaja: true, municipioResidenciaId: 44, provinciaResidenciaId: 3, departamentoResidenciaId: 22 });
    expect(f).toMatchObject({ tipoDiscapacidadId: 1, gradoDiscapacidad: 'ALTO', descripcion: 'd', causa: 'c' });
    expect(estudianteFormMapper({ student: {}, academicData: { admissionType: 'TRASPASO' } }).tipoAdmision).toBe('TRASPASO');
  });

  it('origen único boliviano con fallback de catálogos', () => {
    const f = estudianteFormMapper({
      student: {},
      origins: [{ originType: 'BOLIVIANA', birthMunicipalityId: 10, birthCityRaw: 'Loc', motherTongueId: 1, secondaryLanguageId: 2 }],
      catalogs: { originMunicipalities: { 10: { provinciaId: 5 } }, originProvinces: { 5: { departamentoId: 3 } } },
    });
    expect(f).toMatchObject({ municipioId: 10, localidadComunidad: 'Loc', provinciaId: 5, departamentoId: 3, idiomaMaternoId: 1, idiomaSecundarioId: 2, tipoOrigen: 'BOLIVIANA' });
    const directo = estudianteFormMapper({ student: {}, origins: [{ municipioNacimientoId: 1, birthProvinceId: 2, birthDepartmentId: 3 }] });
    expect(directo).toMatchObject({ provinciaId: 2, departamentoId: 3 });
  });

  it('origen único extranjero', () => {
    const f = estudianteFormMapper({ student: {}, origins: [{ originType: 'EXTRANJERA', countryId: '9', birthCity: 'Lima' }] });
    expect(f).toMatchObject({ tipoOrigen: 'EXTRANJERA', paisId: 9, ciudadNacimiento: 'Lima' });
  });

  it('doble nacionalidad: primera extranjera y segunda boliviana', () => {
    const f = estudianteFormMapper({
      student: {},
      origins: [
        { esPrincipal: 0, municipioNacimientoId: 7, birthProvinceId: '8', birthDepartmentId: '9', ciudadNacimiento: 'Seg' },
        { isPrincipal: true, paisId: 4, ciudadNacimiento: 'Bogotá' },
      ],
    });
    expect(f).toMatchObject({ tipoOrigen: 'DOBLE_NACIONALIDAD', primeraNacionalidad: 'EXTRANJERA', paisId: 4, ciudadNacimiento: 'Bogotá', segundaMunicipioId: 7, segundaProvinciaId: 8, segundaDepartamentoId: 9, segundaLocalidadComunidad: 'Seg' });
  });

  it('doble nacionalidad: primera boliviana y segunda extranjera; segunda boliviana con catálogos', () => {
    const f = estudianteFormMapper({
      student: {},
      origins: [{ esPrincipal: '1', birthMunicipalityId: 1 }, { esPrincipal: '0', paisId: '5', birthCityRaw: 'Ciudad' }],
    });
    expect(f).toMatchObject({ primeraNacionalidad: 'BOLIVIANA', segundaPaisId: 5, segundaCiudadNacimiento: 'Ciudad' });
    const g = estudianteFormMapper({
      student: {},
      origins: [{ esPrincipal: 1, paisId: 2 }, { esPrincipal: 0, birthMunicipalityId: '3' }],
      catalogs: { originMunicipalities: { 3: { provinciaId: 6 } }, originProvinces: { 6: { departamentoId: 7 } } },
    });
    expect(g).toMatchObject({ segundaMunicipioId: 3, segundaProvinciaId: 6, segundaDepartamentoId: 7 });
  });

  it('contactos, documentación entregada, transitabilidad y traspaso', () => {
    const f = estudianteFormMapper({
      student: {},
      guardians: [{ id: 1, relationshipTypeId: 2, firstName: 'P', lastName: 'Q', cellphone1: '1', cellphone2: '2', livesWithStudent: true }, {}],
      documentDeliveries: [
        { id: 1, documentacionId: 5, entregado: false },
        { id: 2, documentacionId: 5, entregado: true, enTramite: true, fechaEntrega: '2026-01-01', observaciones: 'x' },
        { id: 3 },
      ],
      transitability: { institucionNombre: 'I', departamentoId: '3', anioConclusion: 2020 },
      transfer: { institucionNombre: 'T', departamentoId: '4', anioCursado: 'PRIMERO' },
    });
    expect(f.contactosEmergencia).toEqual([
      { id: 1, tipoParentescoId: 2, nombres: 'P', apellidos: 'Q', celular1: '1', celular2: '2', viveConEstudiante: true },
      { id: null, tipoParentescoId: null, nombres: '', apellidos: '', celular1: '', celular2: '', viveConEstudiante: false },
    ]);
    expect(f.documentacion).toEqual({ doc_5: { entregado: true, en_tramite: true, fechaEntrega: '2026-01-01', observaciones: 'x' } });
    expect(f).toMatchObject({ transitabilidad_institucion_nombre: 'I', transitabilidad_departamento_id: 3, transitabilidad_anio_conclusion: 2020 });
    expect(f).toMatchObject({ traspaso_institucion_origen_nombre: 'T', traspaso_departamento_id: 4, traspaso_anio_cursado: 'PRIMERO' });
  });
});
