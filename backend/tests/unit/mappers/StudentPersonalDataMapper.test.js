import { describe, it, expect } from '@jest/globals';
import {
  entityToPresentation,
  StudentPersonalDataMapper,
} from '../../../src/application/mappers/estudiantes/StudentPersonalDataMapper.js';

describe('StudentPersonalDataMapper', () => {
  it('sin fila devuelve estructura vacía sin acceso', () => {
    expect(entityToPresentation(null)).toEqual({
      student: null,
      guardians: [],
      disabilities: [],
      origins: [],
      access: { tieneAcceso: false },
    });
  });

  it('mapea solo los campos presentes del estudiante a camelCase', () => {
    const { student } = entityToPresentation({
      id: 1,
      codigo_estudiante: '20260001',
      nombres: 'Ana',
      apellido_paterno: 'Paz',
      residencia_departamento_nombre: 'La Paz',
    });
    expect(student).toEqual({
      id: 1,
      studentCode: '20260001',
      firstName: 'Ana',
      lastName: 'Paz',
      residenceDepartmentName: 'La Paz',
    });
  });

  it('parsea apoderados y discapacidades desde JSON o arreglo', () => {
    const r = entityToPresentation({
      id: 7,
      apoderados: JSON.stringify([{ apoderado_id: 3, tipo_parentesco_id: 2, apoderado_nombres: 'Luis', celular_1: '7' }]),
      discapacidades: [{ discapacidad_id: 4, tipo_discapacidad_nombre: 'Visual', grado_discapacidad: 'LEVE' }],
    });
    expect(r.guardians).toEqual([{ id: 3, studentId: 7, relationshipTypeId: 2, firstName: 'Luis', cellphone1: '7' }]);
    expect(r.disabilities).toEqual([{ id: 4, studentId: 7, disabilityTypeName: 'Visual', disabilityDegree: 'LEVE' }]);
  });

  it('orígenes: acepta claves snake_case y camelCase', () => {
    const r = entityToPresentation({
      id: 1,
      origenes: [
        { origen_id: 9, pais_id: 1, pais_id_efectivo: 5, nacimiento_municipio_id: 30, es_principal: '1', tipo_origen: 'BOLIVIANA', ciudad: 'LP', ciudad_nacimiento_raw: 'Centro' },
        { id: 10, paisId: 2, municipio_nacimiento_id: 44, isPrincipal: false },
        { id: 11 },
      ],
    });
    expect(r.origins[0]).toMatchObject({
      id: 9, paisId: 1, countryId: 5, birthMunicipalityId: 30, isPrincipal: true, esPrincipal: '1',
      originType: 'BOLIVIANA', birthCity: 'LP', birthCityRaw: 'Centro', ciudadNacimiento: 'Centro',
    });
    expect(r.origins[1]).toMatchObject({ id: 10, paisId: 2, countryId: 2, birthMunicipalityId: 44, isPrincipal: false });
    expect(r.origins[2]).toEqual({ id: 11 });
  });

  it('es_principal verdadero en true/1 y falso en otros valores', () => {
    const origen = (v) => entityToPresentation({ origenes: [{ es_principal: v }] }).origins[0].isPrincipal;
    expect(origen(true)).toBe(true);
    expect(origen(1)).toBe(true);
    expect(origen(0)).toBe(false);
  });

  it('cuenta de acceso: con usuario, con valores por defecto y sin usuario', () => {
    expect(entityToPresentation({ usuario_username: 'ana', usuario_id: '5', usuario_estado: 'Bloqueado', rol_nombre: 'Estudiante' }).access).toEqual({
      tieneAcceso: true, usuarioId: 5, usuario: 'ana', estadoCuenta: 'Bloqueado', rol: 'Estudiante',
    });
    expect(entityToPresentation({ usuario_username: 'b', usuario_id: 'x', rol_codigo: 'EST' }).access).toEqual({
      tieneAcceso: true, usuarioId: null, usuario: 'b', estadoCuenta: 'Activo', rol: 'EST',
    });
    expect(entityToPresentation({ usuario_username: 'c', usuario_id: '' }).access.rol).toBeNull();
    expect(entityToPresentation({ id: 1 }).access).toEqual({ tieneAcceso: false });
  });

  it('la clase estática delega en la función', () => {
    expect(StudentPersonalDataMapper.entityToPresentation({ id: 2 }).student).toEqual({ id: 2 });
  });
});
