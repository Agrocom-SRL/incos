import { describe, it, expect } from '@jest/globals';
import { Teacher } from '../../../src/domain/entities/Teacher.js';

const completo = () => ({
  id: 1,
  active: true,
  userId: 9,
  ci: '1234567',
  expedition: 'LP',
  firstName: 'Ana',
  lastName: 'Paz',
  motherLastName: 'Ríos',
  birthDate: '1985-04-30',
  gender: 'FEMENINO',
  civilStatusId: 2,
  nationality: 'Peruana',
  phone: '2222222',
  mobilePhone: '70000000',
  personalEmail: 'ana@incos.edu.bo',
  address: 'Av. 6 de Agosto',
  residenceMunicipalityId: 3,
  zone: 'Sopocachi',
  professionalTitle: 'Ing.',
  specialty: 'Redes',
  academicLevel: 'MAESTRIA',
  graduationInstitution: 'UMSA',
  graduationYear: 2010,
  yearsOfExperience: 12,
  hireDate: '2020-01-15',
  retirementDate: null,
  contractType: 'PLANTA',
  laborState: 'ACTIVO',
  observations: 'ninguna',
  colorHex: '#E6194B',
  maxHorasSemana: 20,
  maxHorasMes: 80,
});

describe('Teacher: construcción', () => {
  it('sin datos aplica los valores por defecto del dominio', () => {
    const t = new Teacher();
    expect(t.nationality).toBe('Boliviana');
    expect(t.academicLevel).toBe('LICENCIATURA');
    expect(t.yearsOfExperience).toBe(0);
    expect(t.contractType).toBe('CONTRATO');
    expect(t.laborState).toBe('ACTIVO');
    expect(t.ci).toBeUndefined();
  });

  it('con atributos limitados (userId presente) NO inventa valores por defecto', () => {
    const t = new Teacher({ userId: 5, firstName: 'Luis' });
    expect(t.userId).toBe(5);
    expect(t.firstName).toBe('Luis');
    for (const campo of ['nationality', 'academicLevel', 'yearsOfExperience', 'contractType', 'laborState']) {
      expect(Object.prototype.hasOwnProperty.call(t, campo)).toBe(false);
    }
  });

  it('los valores explícitos ganan sobre los por defecto, incluso con falsy', () => {
    const t = new Teacher({ yearsOfExperience: 0, nationality: 'Argentina', academicLevel: 'DOCTORADO', contractType: 'HORARIO', laborState: 'LICENCIA' });
    expect(t).toMatchObject({ yearsOfExperience: 0, nationality: 'Argentina', academicLevel: 'DOCTORADO', contractType: 'HORARIO', laborState: 'LICENCIA' });
  });

  it('copia todos los campos proporcionados, incluidos los de BaseEntity', () => {
    const data = { ...completo(), createdAt: 'c', updatedAt: 'u', deletedAt: null, createdBy: 1, updatedBy: 2, deletedBy: null };
    const t = new Teacher(data);
    for (const [k, val] of Object.entries(data)) expect(t[k]).toEqual(val);
  });

  it('ignora campos desconocidos', () => {
    const t = new Teacher({ ci: '1234567', hack: 'x', __proto__: { polluted: true } });
    expect(t.hack).toBeUndefined();
    expect(t.polluted).toBeUndefined();
  });
});

describe('Teacher: getFullName', () => {
  it('une nombres y apellidos', () => {
    expect(new Teacher(completo()).getFullName()).toBe('Ana Paz Ríos');
  });
  it('omite el apellido materno ausente o vacío', () => {
    expect(new Teacher({ firstName: 'Ana', lastName: 'Paz' }).getFullName()).toBe('Ana Paz');
    expect(new Teacher({ firstName: 'Ana', lastName: 'Paz', motherLastName: '' }).getFullName()).toBe('Ana Paz');
  });
  it('tolera datos faltantes', () => {
    expect(new Teacher({ firstName: 'Ana' }).getFullName()).toBe('Ana');
    expect(new Teacher().getFullName()).toBe('');
  });
});

describe('Teacher: validaciones de formato', () => {
  it.each([
    ['isValidGender', 'gender', 'MASCULINO', true],
    ['isValidGender', 'gender', 'FEMENINO', true],
    ['isValidGender', 'gender', 'OTRO', true],
    ['isValidGender', 'gender', 'ROBOT', false],
    ['isValidGender', 'gender', '', false],
    ['isValidGender', 'gender', undefined, false],
    ['isValidCI', 'ci', '1234567', true],
    ['isValidCI', 'ci', '123456789', true],
    ['isValidCI', 'ci', '123456', false],
    ['isValidCI', 'ci', '1234567890', false],
    ['isValidCI', 'ci', '12345a7', false],
    ['isValidCI', 'ci', "1234567'; DROP", false],
    ['isValidCI', 'ci', '', false],
    ['isValidExpedition', 'expedition', 'LP', true],
    ['isValidExpedition', 'expedition', 'SC', true],
    ['isValidExpedition', 'expedition', 'XX', false],
    ['isValidExpedition', 'expedition', 'lp', false],
    ['isValidExpedition', 'expedition', null, false],
    ['isValidAcademicLevel', 'academicLevel', 'LICENCIATURA', true],
    ['isValidAcademicLevel', 'academicLevel', 'DOCTORADO', true],
    ['isValidAcademicLevel', 'academicLevel', 'ESTUDIANTE', false],
    ['isValidAcademicLevel', 'academicLevel', 'POSDOC', false],
    ['isValidContractType', 'contractType', 'PLANTA', true],
    ['isValidContractType', 'contractType', 'CONSULTOR', true],
    ['isValidContractType', 'contractType', 'EVENTUAL', false],
    ['isValidContractType', 'contractType', undefined, false],
    ['isValidLaborState', 'laborState', 'ACTIVO', true],
    ['isValidLaborState', 'laborState', 'SUSPENDIDO', true],
    ['isValidLaborState', 'laborState', 'JUBILADO', false],
    ['isValidLaborState', 'laborState', '', false],
  ])('%s con %s=%p -> %p', (metodo, campo, valor, esperado) => {
    expect(new Teacher({ [campo]: valor })[metodo]()).toBe(esperado);
  });

  it('con atributos limitados y el campo ausente los validadores devuelven false', () => {
    const t = new Teacher({ userId: 1 });
    expect(t.isValidContractType()).toBe(false);
    expect(t.isValidLaborState()).toBe(false);
    expect(t.isValidAcademicLevel()).toBe(false);
  });

  it.each([
    [undefined, true],
    [null, true],
    ['', true],
    ['#E6194B', true],
    ['#e6194b', true],
    ['  #AABBCC  ', true],
    ['#FFF', false],
    ['E6194B', false],
    ['#GGGGGG', false],
    ['#12345678', false],
    ['rojo', false],
    ['<script>', false],
  ])('isValidColorHex(%p) -> %p', (color, esperado) => {
    const t = new Teacher(color === undefined ? {} : { colorHex: color });
    expect(t.isValidColorHex()).toBe(esperado);
  });
});

describe('Teacher: serialización', () => {
  it('toPlainObject incluye todos los campos inicializados', () => {
    const data = completo();
    expect(new Teacher(data).toPlainObject()).toEqual(data);
  });

  it('toPlainObject incluye los valores por defecto cuando no hay atributos limitados', () => {
    expect(new Teacher({ ci: '1234567' }).toPlainObject()).toEqual({
      ci: '1234567',
      nationality: 'Boliviana',
      academicLevel: 'LICENCIATURA',
      yearsOfExperience: 0,
      contractType: 'CONTRATO',
      laborState: 'ACTIVO',
    });
  });

  it('toPlainObject con atributos limitados devuelve solo lo pedido', () => {
    expect(new Teacher({ id: 1, userId: 2, firstName: 'Ana' }).toPlainObject()).toEqual({ id: 1, userId: 2, firstName: 'Ana' });
  });

  it('toPlainObject es una copia: mutarla no altera la entidad', () => {
    const t = new Teacher({ ci: '1234567' });
    const plano = t.toPlainObject();
    plano.ci = 'otro';
    expect(t.ci).toBe('1234567');
  });

  it('toJSON/JSON.stringify usan toPlainObject', () => {
    const t = new Teacher({ id: 1, userId: 2, firstName: 'Ana' });
    expect(t.toJSON()).toEqual(t.toPlainObject());
    expect(JSON.parse(JSON.stringify(t))).toEqual({ id: 1, userId: 2, firstName: 'Ana' });
  });
});

describe('Teacher: comportamiento heredado de BaseEntity', () => {
  it('isActive, deactivate y activate', () => {
    const t = new Teacher({ active: true });
    expect(t.isActive()).toBe(true);
    t.deactivate();
    expect(t.isActive()).toBe(false);
    expect(t.updatedAt).toBeInstanceOf(Date);
    t.activate();
    expect(t.isActive()).toBe(true);
  });

  it('softDelete y restore', () => {
    const t = new Teacher({ active: true, deletedAt: null });
    t.softDelete(7);
    expect(t).toMatchObject({ active: false, deletedBy: 7 });
    expect(t.deletedAt).toBeInstanceOf(Date);
    expect(t.isDeleted()).toBe(true);
    t.restore();
    expect(t).toMatchObject({ active: true, deletedAt: null, deletedBy: null });
    expect(t.isDeleted()).toBe(false);
  });
});
