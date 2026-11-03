import { describe, it, expect } from 'vitest';
import { estudianteDetailMapper, mapEstudianteDetail } from '../mappers/estudianteDetailMapper';
import { estudianteListMapper, mapEstudiantesList } from '../mappers/estudianteListMapper';
import { estudianteBusquedaInscripcionMapper, mapEstudiantesBusquedaInscripcion } from '../mappers/estudianteBusquedaInscripcionMapper';
import { becaDescuentoListMapper, mapBecasDescuentosList } from '../../becas/mappers/becaDescuentoListMapper';

describe('estudianteDetailMapper', () => {
  it('devuelve null sin datos o sin estudiante', () => {
    expect(mapEstudianteDetail(null)).toBeNull();
    expect(estudianteDetailMapper({})).toBeNull();
    expect(estudianteDetailMapper({ data: {} })).toBeNull();
  });

  it('valores por defecto cuando solo viene el estudiante', () => {
    const m = estudianteDetailMapper({ student: { id: 1, firstName: 'Ana' } });
    expect(m.student).toMatchObject({ id: 1, trabaja: false, empresaInstitucion: '', cargo: '', residenceAddressComplete: null, tipoAdmision: null });
    expect(m).toMatchObject({ guardians: [], disabilities: [], origins: [], scholarships: [], tieneDocumentosFaltantes: false, actaCompromiso: null, inscripcion: null, access: { tieneAcceso: false }, catalogs: {} });
  });

  it('arma nombre, dirección de residencia y orígenes enriquecidos', () => {
    const m = mapEstudianteDetail({
      data: {
        student: {
          id: 2, ci: '123', expedition: 'LP', firstName: 'Ana', lastName: 'Pérez', motherLastName: 'Rojas',
          residenceMunicipalityName: 'La Paz', residenceDepartmentName: 'La Paz', studentCode: 'E2', works: true,
        },
        origins: [{ birthCity: 'Sucre', birthDepartmentName: 'Chuquisaca' }, {}],
        tieneDocumentosFaltantes: true,
        academicData: { tipoAdmision: 'NUEVO' },
        guardians: [{ id: 1 }],
        disabilities: [{ id: 2 }],
        documentDeliveries: [{ id: 3 }],
      },
    });
    expect(m.student).toMatchObject({ codigoEstudiante: 'E2', residenceAddressComplete: 'La Paz, La Paz', tipoAdmision: 'NUEVO', trabaja: true });
    expect(m.student.nombreCompleto).toContain('Pérez');
    expect(m.origins.map((o) => o.originAddressComplete)).toEqual(['Sucre, Chuquisaca', null]);
    expect(m).toMatchObject({ tieneDocumentosFaltantes: true, guardians: [{ id: 1 }], disabilities: [{ id: 2 }], documentDeliveries: [{ id: 3 }] });
  });

  it('normaliza la inscripción con nombres en español o inglés', () => {
    const es = estudianteDetailMapper({
      student: { id: 1 },
      inscripcion: {
        enrollment: { id: 4, gestionId: 9, tipoInscripcion: 'ANTIGUO' },
        management: { nombre: 'G', anio: 2026 },
        career: { codigo: 'SIS', nombre: 'Sistemas' },
        studentAcademicData: { estadoRegistro: 'ACTIVO', carreraId: 3 },
      },
    }).inscripcion;
    expect(es.enrollment).toMatchObject({ managementId: 9, enrollmentType: 'ANTIGUO' });
    expect(es.management).toMatchObject({ name: 'G', year: 2026 });
    expect(es.career).toMatchObject({ code: 'SIS', name: 'Sistemas' });
    expect(es.studentAcademicData).toMatchObject({ registrationStatus: 'ACTIVO', careerId: 3 });
    const en = estudianteDetailMapper({
      student: { id: 1 },
      inscripcion: {
        enrollment: { id: 4, managementId: 1, enrollmentType: 'NUEVO' },
        management: { name: 'N', year: 2025 },
        career: { code: 'C', name: 'D' },
        studentAcademicData: { registrationStatus: 'X', careerId: 1 },
      },
    }).inscripcion;
    expect(en.enrollment.enrollmentType).toBe('NUEVO');
    expect(en.management.year).toBe(2025);
    const vacia = estudianteDetailMapper({ student: { id: 1 }, inscripcion: {} }).inscripcion;
    expect(vacia).toMatchObject({ enrollment: null, management: null, career: null, studentAcademicData: null });
  });

  it('enriquece las becas con los catálogos', () => {
    const m = estudianteDetailMapper({
      student: { id: 1 },
      catalogs: { scholarships: { 5: { name: 'Excelencia', code: 'EXC', percentage: 50 } }, managements: { 7: { code: 'G26', year: 2026 } } },
      scholarships: [{ id: 1, scholarshipId: 5, managementId: 7 }, { id: 2 }],
    });
    expect(m.scholarships[0]).toMatchObject({ scholarshipName: 'Excelencia', scholarshipCode: 'EXC', scholarshipPercentage: 50, managementCode: 'G26', managementYear: 2026 });
    expect(m.scholarships[1]).toMatchObject({ scholarshipName: null, managementCode: null });
  });
});

describe('mapeos de lista', () => {
  it('estudiante de la lista: trabajo resumido y nulos', () => {
    expect(estudianteListMapper(null)).toBeNull();
    const base = { id: 1, ci: '1', nombres: 'Ana', apellidoPaterno: 'Pérez' };
    expect(estudianteListMapper(base)).toMatchObject({ id: 1, datosTrabajo: '—', carreraNombre: null, promedioHistorial: null });
    expect(estudianteListMapper({ ...base, trabaja: true }).datosTrabajo).toBe('Sí');
    expect(estudianteListMapper({ ...base, trabaja: true, empresaInstitucion: 'ACME', cargo: 'Jefe' }).datosTrabajo).toBe('ACME · Jefe');
    expect(mapEstudiantesList('x')).toEqual([]);
    expect(mapEstudiantesList([base, null])).toHaveLength(1);
  });

  it('búsqueda para inscripción', () => {
    expect(estudianteBusquedaInscripcionMapper(null)).toBeNull();
    const m = estudianteBusquedaInscripcionMapper({ id: 1, nombres: 'Ana', apellidoPaterno: 'Pérez', yaMatriculadoGestionActual: 1, esNuevoSistema: 0, totalInscripciones: 0 });
    expect(m).toMatchObject({ id: 1, yaMatriculadoGestionActual: true, esNuevoSistema: false, totalInscripciones: 0, carreraId: null });
    expect(estudianteBusquedaInscripcionMapper({ id: 2, nombreCompleto: 'X Y' }).nombreCompleto).toBeTruthy();
    expect(estudianteBusquedaInscripcionMapper({ id: 3 }).esNuevoSistema).toBeNull();
    expect(mapEstudiantesBusquedaInscripcion(undefined)).toEqual([]);
    expect(mapEstudiantesBusquedaInscripcion([{ id: 1 }, null])).toHaveLength(1);
  });

  it('becas y descuentos', () => {
    expect(becaDescuentoListMapper(null)).toBeNull();
    expect(becaDescuentoListMapper({ id: 1, nombre: 'B', porcentaje: 30 })).toMatchObject({ id: 1, nombre: 'B', porcentaje: 30 });
    expect(mapBecasDescuentosList(null)).toEqual([]);
    expect(mapBecasDescuentosList([{ id: 1 }, null])).toHaveLength(1);
  });
});
