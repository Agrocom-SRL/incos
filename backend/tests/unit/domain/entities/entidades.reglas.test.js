import { describe, it, expect, jest, beforeAll, afterAll } from '@jest/globals';
import {
  EXPEDICIONES_CI_VALUES,
  GENEROS_VALUES,
  TIPOS_SANGRE_VALUES,
  EDAD_MINIMA_ESTUDIANTE,
  ESTADOS_ACADEMICOS,
  ESTADOS_BECAS,
  ESTADOS_DOCUMENTO,
  ESTADOS_GESTION_PLAN,
  ESTADOS_LICENCIAS,
  ESTADOS_USUARIOS,
  ESTADOS_MATERIA_INSCRITA,
  TIPOS_DIRECTOR,
  TIPOS_SECRETARIA,
  TIPOS_INSCRIPCION,
  TIPOS_ESTADO_HISTORIAL_MATRICULA as H,
} from '../../../../src/domain/constants/index.js';
import { AcademicPeriod } from '../../../../src/domain/entities/AcademicPeriod.js';
import { AsignacionHorario } from '../../../../src/domain/entities/AsignacionHorario.js';
import { CalendarActivity } from '../../../../src/domain/entities/CalendarActivity.js';
import { Career } from '../../../../src/domain/entities/Career.js';
import { Classroom } from '../../../../src/domain/entities/Classroom.js';
import { ContributionConfiguration } from '../../../../src/domain/entities/ContributionConfiguration.js';
import { ContributionPayment } from '../../../../src/domain/entities/ContributionPayment.js';
import { Country } from '../../../../src/domain/entities/Country.js';
import { Director } from '../../../../src/domain/entities/Director.js';
import { Enrollment } from '../../../../src/domain/entities/Enrollment.js';
import { EvaluationType } from '../../../../src/domain/entities/EvaluationType.js';
import { Leveling } from '../../../../src/domain/entities/Leveling.js';
import { License } from '../../../../src/domain/entities/License.js';
import { Management } from '../../../../src/domain/entities/Management.js';
import { ManagementPlan } from '../../../../src/domain/entities/ManagementPlan.js';
import { Period } from '../../../../src/domain/entities/Period.js';
import { Permission } from '../../../../src/domain/entities/Permission.js';
import { PlanSubject } from '../../../../src/domain/entities/PlanSubject.js';
import { Prerequisite } from '../../../../src/domain/entities/Prerequisite.js';
import { PriorEnrollmentHistory } from '../../../../src/domain/entities/PriorEnrollmentHistory.js';
import { Rector } from '../../../../src/domain/entities/Rector.js';
import { Schedule } from '../../../../src/domain/entities/Schedule.js';
import { Scholarship } from '../../../../src/domain/entities/Scholarship.js';
import { Secretary } from '../../../../src/domain/entities/Secretary.js';
import { Session } from '../../../../src/domain/entities/Session.js';
import { Staff } from '../../../../src/domain/entities/Staff.js';
import { Student } from '../../../../src/domain/entities/Student.js';
import { StudentAcademicData } from '../../../../src/domain/entities/StudentAcademicData.js';
import { StudentDocument } from '../../../../src/domain/entities/StudentDocument.js';
import { StudentDocumentDelivery } from '../../../../src/domain/entities/StudentDocumentDelivery.js';
import { StudentGuardian } from '../../../../src/domain/entities/StudentGuardian.js';
import { StudentScholarship } from '../../../../src/domain/entities/StudentScholarship.js';
import { StudyPlan } from '../../../../src/domain/entities/StudyPlan.js';
import { SubjectEnrollment } from '../../../../src/domain/entities/SubjectEnrollment.js';
import { SubjectEnrollmentHistory } from '../../../../src/domain/entities/SubjectEnrollmentHistory.js';
import { Teacher } from '../../../../src/domain/entities/Teacher.js';
import { TeacherAssignment } from '../../../../src/domain/entities/TeacherAssignment.js';
import { User } from '../../../../src/domain/entities/User.js';

const HOY = new Date('2026-06-15T12:00:00Z');

beforeAll(() => {
  jest.useFakeTimers();
  jest.setSystemTime(HOY);
});
afterAll(() => jest.useRealTimers());

describe('fechas y vigencias (reloj fijo 2026-06-15)', () => {
  it('AcademicPeriod.isCurrentlyActive requiere ambas fechas y que hoy esté dentro', () => {
    expect(new AcademicPeriod({}).isCurrentlyActive()).toBe(false);
    expect(new AcademicPeriod({ startDate: '2026-06-01' }).isCurrentlyActive()).toBe(false);
    expect(new AcademicPeriod({ startDate: '2026-06-01', endDate: '2026-06-30' }).isCurrentlyActive()).toBe(true);
    expect(new AcademicPeriod({ startDate: '2026-01-01', endDate: '2026-02-01' }).isCurrentlyActive()).toBe(false);
  });

  it('Management: vigencia, código AAAA-XXX y año del código', () => {
    expect(new Management({ startDate: '2026-01-01', endDate: '2026-12-31' }).isCurrentlyActive()).toBe(true);
    expect(new Management({}).isCurrentlyActive()).toBe(false);
    expect(new Management({ vigente: true }).isVigente()).toBe(true);
    expect(new Management({ vigente: 1 }).isVigente()).toBe(false);
    expect(new Management({ code: '2026-ANUAL' }).isValidCode()).toBe(true);
    expect(new Management({ code: '26-A' }).isValidCode()).toBe(false);
    expect(new Management({}).isValidCode()).toBe(false);
    expect(new Management({ code: '2026-ANUAL' }).getYearFromCode()).toBe(2026);
    expect(new Management({ code: 'ANUAL' }).getYearFromCode()).toBeNull();
    expect(new Management({}).getYearFromCode()).toBeNull();
  });

  it('CalendarActivity: fechas coherentes, vigencia, nombre y alcance por carrera', () => {
    expect(new CalendarActivity({}).isValidDates()).toBe(false);
    expect(new CalendarActivity({ startDate: '2026-06-02' }).isValidDates()).toBe(true);
    expect(new CalendarActivity({ startDate: '2026-06-10', endDate: '2026-06-01' }).isValidDates()).toBe(false);
    expect(new CalendarActivity({ startDate: '2026-06-01', endDate: '2026-06-02' }).isValidDates()).toBe(true);

    expect(new CalendarActivity({}).isCurrentlyActive()).toBe(false);
    expect(new CalendarActivity({ startDate: '2026-07-01' }).isCurrentlyActive()).toBe(false);
    expect(new CalendarActivity({ startDate: '2026-06-01' }).isCurrentlyActive()).toBe(true);
    expect(new CalendarActivity({ startDate: '2026-06-01', endDate: '2026-06-10' }).isCurrentlyActive()).toBe(false);
    expect(new CalendarActivity({ startDate: '2026-06-01', endDate: '2026-06-20' }).isCurrentlyActive()).toBe(true);

    expect(new CalendarActivity({ customName: 'Feriado' }).getDisplayName('Otro')).toBe('Feriado');
    expect(new CalendarActivity({}).getDisplayName('Otro')).toBe('Otro');
    expect(new CalendarActivity({}).getDisplayName()).toBe('Actividad sin nombre');

    expect(new CalendarActivity({ careerIds: null }).appliesToCareer(3)).toBe(true);
    expect(new CalendarActivity({ careerIds: [1, 3] }).appliesToCareer(3)).toBe(true);
    expect(new CalendarActivity({ careerIds: [1] }).appliesToCareer(3)).toBe(false);
    expect(new CalendarActivity({ careerIds: '[3]' }).appliesToCareer(3)).toBe(true);
    expect(new CalendarActivity({ careerIds: 'no-json' }).appliesToCareer(3)).toBe(false);
    expect(new CalendarActivity({ careerIds: 7 }).appliesToCareer(7)).toBe(false);
  });

  it('ContributionConfiguration.isActiveOnDate respeta bandera y ventana de fechas', () => {
    const base = { contributionActive: true, startDate: '2026-06-01', endDate: '2026-06-30' };
    expect(new ContributionConfiguration(base).isActiveOnDate()).toBe(true);
    expect(new ContributionConfiguration(base).isActiveOnDate('2026-07-15')).toBe(false);
    expect(new ContributionConfiguration(base).isActiveOnDate(new Date('2026-05-01'))).toBe(false);
    expect(new ContributionConfiguration({ ...base, contributionActive: false }).isActiveOnDate()).toBe(false);
    expect(new ContributionConfiguration({ contributionActive: true }).isActiveOnDate()).toBe(true);
  });

  it('Rector.isInActiveMandate: sin inicio no hay mandato; sin fin es indefinido', () => {
    expect(new Rector({}).isInActiveMandate()).toBe(false);
    expect(new Rector({ mandateStartDate: '2027-01-01' }).isInActiveMandate()).toBe(false);
    expect(new Rector({ mandateStartDate: '2020-01-01' }).isInActiveMandate()).toBe(true);
    expect(new Rector({ mandateStartDate: '2020-01-01', mandateEndDate: '2025-01-01' }).isInActiveMandate()).toBe(false);
    expect(new Rector({ mandateStartDate: '2020-01-01', mandateEndDate: '2030-01-01' }).isInActiveMandate()).toBe(true);
  });

  it('Session.isExpired', () => {
    expect(new Session({}).isExpired()).toBe(false);
    expect(new Session({ expirationDate: '2026-06-01' }).isExpired()).toBe(true);
    expect(new Session({ expirationDate: '2026-07-01' }).isExpired()).toBe(false);
  });

  it('License: rango de fechas, días totales inclusivos y aprobación', () => {
    expect(new License({}).isValidDateRange()).toBe(false);
    expect(new License({ startDate: '2026-06-01', endDate: '2026-05-01' }).isValidDateRange()).toBe(false);
    expect(new License({ startDate: '2026-06-01', endDate: '2026-06-01' }).isValidDateRange()).toBe(true);
    expect(new License({}).calculateTotalDays()).toBe(0);
    expect(new License({ startDate: '2026-06-01', endDate: '2026-06-01' }).calculateTotalDays()).toBe(1);
    expect(new License({ startDate: '2026-06-01', endDate: '2026-06-05' }).calculateTotalDays()).toBe(5);
    expect(new License({}).state).toBe(ESTADOS_LICENCIAS.PENDIENTE);
    expect(new License({ state: ESTADOS_LICENCIAS.APROBADA }).isApproved()).toBe(true);
    expect(new License({ state: ESTADOS_LICENCIAS.PENDIENTE }).isApproved()).toBe(false);
  });
});

describe('Student / Teacher / Staff', () => {
  const expedicion = EXPEDICIONES_CI_VALUES[0];
  const genero = GENEROS_VALUES[0];

  it('getFullName omite apellido materno vacío', () => {
    expect(new Student({ firstName: 'Ana', lastName: 'Paz', motherLastName: 'Ríos' }).getFullName()).toBe('Ana Paz Ríos');
    expect(new Student({ firstName: 'Ana', lastName: 'Paz' }).getFullName()).toBe('Ana Paz');
    expect(new Teacher({ firstName: 'Luis', lastName: 'Gil', motherLastName: 'Sosa' }).getFullName()).toBe('Luis Gil Sosa');
    expect(new Staff({ firstName: 'Eva', lastName: 'Cruz' }).getFullName()).toBe('Eva Cruz');
    expect(new StudentGuardian({ firstName: 'Tutor', lastName: 'X', motherLastName: 'Y' }).getFullName()).toBe('Tutor X');
  });

  it('Student.getAge respeta mes y día de cumpleaños', () => {
    expect(new Student({}).getAge()).toBeNull();
    expect(new Student({ birthDate: '2000-06-15' }).getAge()).toBe(26);
    expect(new Student({ birthDate: '2000-06-16' }).getAge()).toBe(25);
    expect(new Student({ birthDate: '2000-07-01' }).getAge()).toBe(25);
    expect(new Student({ birthDate: '2000-05-01' }).getAge()).toBe(26);
  });

  it('Student.hasMinimumAge usa la edad mínima institucional', () => {
    const nacido = (anios) => `${2026 - anios}-01-01`;
    expect(new Student({ birthDate: nacido(EDAD_MINIMA_ESTUDIANTE) }).hasMinimumAge()).toBe(true);
    expect(new Student({ birthDate: nacido(EDAD_MINIMA_ESTUDIANTE - 1) }).hasMinimumAge()).toBe(false);
    expect(new Student({}).hasMinimumAge()).toBe(false);
  });

  it.each([
    ['Student', Student],
    ['Teacher', Teacher],
    ['Staff', Staff],
  ])('%s valida CI de 7 a 9 dígitos', (_n, Clase) => {
    expect(new Clase({ ci: '1234567' }).isValidCI()).toBe(true);
    expect(new Clase({ ci: '123456789' }).isValidCI()).toBe(true);
    expect(new Clase({ ci: '123456' }).isValidCI()).toBe(false);
    expect(new Clase({ ci: '1234567890' }).isValidCI()).toBe(false);
    expect(new Clase({ ci: '12345A7' }).isValidCI()).toBe(false);
    expect(new Clase({}).isValidCI()).toBe(false);
  });

  it('expedición y género: obligatorios en Student/Teacher, opcionales en Staff', () => {
    expect(new Student({ expedition: expedicion }).isValidExpedition()).toBe(true);
    expect(new Student({}).isValidExpedition()).toBe(false);
    expect(new Student({ expedition: 'ZZ' }).isValidExpedition()).toBe(false);
    expect(new Student({ gender: genero }).isValidGender()).toBe(true);
    expect(new Student({}).isValidGender()).toBe(false);
    expect(new Teacher({ expedition: expedicion }).isValidExpedition()).toBe(true);
    expect(new Teacher({ gender: genero }).isValidGender()).toBe(true);
    expect(new Teacher({}).isValidGender()).toBe(false);
    expect(new Staff({}).isValidExpedition()).toBe(true);
    expect(new Staff({ expedition: '  ' }).isValidExpedition()).toBe(true);
    expect(new Staff({ expedition: 'ZZ' }).isValidExpedition()).toBe(false);
    expect(new Staff({}).isValidGender()).toBe(true);
    expect(new Staff({ gender: 'Q' }).isValidGender()).toBe(false);
  });

  it('Student: sangre y correo opcionales; isValid exige todas las reglas', () => {
    expect(new Student({}).isValidBloodType()).toBe(true);
    expect(new Student({ bloodType: TIPOS_SANGRE_VALUES[0] }).isValidBloodType()).toBe(true);
    expect(new Student({ bloodType: 'Z+' }).isValidBloodType()).toBe(false);
    expect(new Student({}).isValidEmail()).toBe(true);
    expect(new Student({ personalEmail: 'a@b.co' }).isValidEmail()).toBe(true);
    expect(new Student({ personalEmail: 'a@b' }).isValidEmail()).toBe(false);
    const completo = { ci: '1234567', expedition: expedicion, gender: genero, birthDate: '2000-01-01' };
    expect(new Student(completo).isValid()).toBe(true);
    expect(new Student({ ...completo, birthDate: '2020-01-01' }).isValid()).toBe(false);
    expect(new Student({ ...completo, personalEmail: 'mal' }).isValid()).toBe(false);
  });

  it('Teacher: color hexadecimal opcional y catálogos obligatorios', () => {
    expect(new Teacher({}).isValidColorHex()).toBe(true);
    expect(new Teacher({ colorHex: '' }).isValidColorHex()).toBe(true);
    expect(new Teacher({ colorHex: '#A1B2C3' }).isValidColorHex()).toBe(true);
    expect(new Teacher({ colorHex: 'rojo' }).isValidColorHex()).toBe(false);
    // Sin datos, la entidad asume los valores por defecto del negocio (todos válidos).
    expect(new Teacher({}).isValidAcademicLevel()).toBe(true);
    expect(new Teacher({}).isValidContractType()).toBe(true);
    expect(new Teacher({}).isValidLaborState()).toBe(true);
    expect(new Teacher({ academicLevel: 'XX', contractType: 'XX', laborState: 'XX' }).isValidAcademicLevel()).toBe(false);
    expect(new Teacher({ contractType: 'XX' }).isValidContractType()).toBe(false);
    expect(new Teacher({ laborState: 'XX' }).isValidLaborState()).toBe(false);
  });
});

describe('estados y reglas simples', () => {
  it('colores hex opcionales en AcademicPeriod y Career', () => {
    for (const Clase of [AcademicPeriod, Career]) {
      expect(new Clase({}).isValidColorHex()).toBe(true);
      expect(new Clase({ colorHex: '#FFaa00' }).isValidColorHex()).toBe(true);
      expect(new Clase({ colorHex: '#FFF' }).isValidColorHex()).toBe(false);
    }
  });

  it('validaciones numéricas y de orden', () => {
    expect(new AsignacionHorario({ sequenceOrder: 1 }).isValidSequenceOrder()).toBe(true);
    expect(new AsignacionHorario({ sequenceOrder: 0 }).isValidSequenceOrder()).toBe(false);
    expect(new Classroom({ capacity: 30 }).isValidCapacity()).toBe(true);
    expect(new Classroom({ capacity: 0 }).isValidCapacity()).toBe(false);
    expect(new Period({ number: 2 }).isValidNumber()).toBe(true);
    expect(new Period({ number: 0 }).isValidNumber()).toBe(false);
    const ps = new PlanSubject({ weeklyHours: 4, displayOrder: 1 });
    expect(ps.isValidWeeklyHours()).toBe(true);
    expect(ps.isValidDisplayOrder()).toBe(true);
    expect(new PlanSubject({ weeklyHours: 0, displayOrder: 0 }).isValidWeeklyHours()).toBe(false);
    expect(new PlanSubject({ weeklyHours: 0, displayOrder: 0 }).isValidDisplayOrder()).toBe(false);
    expect(new StudyPlan({ durationYears: 3 }).isValidDuration()).toBe(true);
    expect(new StudyPlan({ durationYears: 0 }).isValidDuration()).toBe(false);
    expect(new StudyPlan({ totalHours: 1, hoursPerWeek: 1, hoursPerMonth: 1, hoursPerYear: 1 }).isValidHours()).toBe(true);
    expect(new StudyPlan({ totalHours: 1, hoursPerWeek: 0, hoursPerMonth: 1, hoursPerYear: 1 }).isValidHours()).toBe(false);
  });

  it('Country.isValidIsoCode exige tres letras mayúsculas', () => {
    expect(new Country({ isoCode: 'BOL' }).isValidIsoCode()).toBe(true);
    expect(new Country({ isoCode: 'bol' }).isValidIsoCode()).toBe(false);
    expect(new Country({ isoCode: 'BO' }).isValidIsoCode()).toBe(false);
    expect(new Country({}).isValidIsoCode()).toBe(false);
  });

  it('Prerequisite no admite sí misma ni ids ausentes', () => {
    expect(new Prerequisite({ subjectId: 1, prerequisiteId: 2 }).isValid()).toBe(true);
    expect(new Prerequisite({ subjectId: 1, prerequisiteId: 1 }).isValid()).toBe(false);
    expect(new Prerequisite({ subjectId: 1 }).isValid()).toBe(false);
  });

  it('Scholarship: porcentaje 0..100, beca completa', () => {
    expect(new Scholarship({ percentage: 0 }).isValidPercentage()).toBe(true);
    expect(new Scholarship({ percentage: 100 }).isValidPercentage()).toBe(true);
    expect(new Scholarship({ percentage: 101 }).isValidPercentage()).toBe(false);
    expect(new Scholarship({ percentage: -1 }).isValidPercentage()).toBe(false);
    expect(new Scholarship({ percentage: null }).isValidPercentage()).toBe(false);
    expect(new Scholarship({ percentage: 100 }).isFullScholarship()).toBe(true);
    expect(new Scholarship({ percentage: 50 }).isFullScholarship()).toBe(false);
  });

  it('Schedule acepta día y turno nulos; tipo obligatorio', () => {
    expect(new Schedule({ day: null }).isValidDay()).toBe(true);
    expect(new Schedule({ day: 'XXX' }).isValidDay()).toBe(false);
    expect(new Schedule({ shift: null }).isValidShift()).toBe(true);
    expect(new Schedule({ shift: 'XXX' }).isValidShift()).toBe(false);
    expect(new Schedule({}).isValidScheduleType()).toBe(true);
    expect(new Schedule({ scheduleType: 'XX' }).isValidScheduleType()).toBe(false);
  });

  it('Director y Secretary: tipo académico y nivel opcional', () => {
    expect(new Director({ type: TIPOS_DIRECTOR.ACADEMICO }).isAcademic()).toBe(true);
    expect(new Director({ type: TIPOS_DIRECTOR.ADMINISTRATIVO }).isAcademic()).toBe(false);
    expect(new Director({}).isValidType()).toBe(false);
    expect(new Director({}).isValidAcademicLevel()).toBe(true);
    expect(new Director({ academicLevel: 'XX' }).isValidAcademicLevel()).toBe(false);
    expect(new Secretary({ type: TIPOS_SECRETARIA.ACADEMICA }).isAcademic()).toBe(true);
    expect(new Secretary({ type: TIPOS_SECRETARIA.ADMINISTRATIVA }).isAcademic()).toBe(false);
    expect(new Secretary({}).isValidAcademicLevel()).toBe(true);
    expect(new Secretary({ academicLevel: 'XX' }).isValidAcademicLevel()).toBe(false);
    expect(new Secretary({}).isValidContractType()).toBe(true);
    expect(new Secretary({ contractType: 'XX' }).isValidContractType()).toBe(false);
  });

  it('estados de entidades de matrícula, beca, documento y plan', () => {
    expect(new StudentScholarship({ state: ESTADOS_BECAS.ACTIVA }).isActive()).toBe(true);
    expect(new StudentScholarship({ state: ESTADOS_BECAS.PENDIENTE }).isActive()).toBe(false);
    expect(new StudentDocument({ state: ESTADOS_DOCUMENTO.APROBADO }).isApproved()).toBe(true);
    expect(new StudentDocument({ state: ESTADOS_DOCUMENTO.PENDIENTE }).isApproved()).toBe(false);
    expect(new ManagementPlan({ state: ESTADOS_GESTION_PLAN.VIGENTE }).isActive()).toBe(true);
    expect(new ManagementPlan({ state: ESTADOS_GESTION_PLAN.CERRADO }).isActive()).toBe(false);
    expect(new StudentDocumentDelivery({ entregado: true }).isDelivered()).toBe(true);
    expect(new StudentDocumentDelivery({ entregado: 1 }).isDelivered()).toBe(false);
    expect(new StudentDocumentDelivery({ enTramite: true }).isInProcess()).toBe(true);
    expect(new TeacherAssignment({ active: true }).isActive()).toBe(true);
    expect(new TeacherAssignment({ active: false }).isActive()).toBe(false);
  });

  it('StudentAcademicData: estados y promedio anual', () => {
    expect(new StudentAcademicData({ academicState: ESTADOS_ACADEMICOS.REGULAR }).isRegular()).toBe(true);
    expect(new StudentAcademicData({ academicState: ESTADOS_ACADEMICOS.RETIRADO }).isWithdrawn()).toBe(true);
    expect(new StudentAcademicData({ academicState: ESTADOS_ACADEMICOS.ABANDONO }).isWithdrawn()).toBe(true);
    expect(new StudentAcademicData({ academicState: ESTADOS_ACADEMICOS.REGULAR }).isWithdrawn()).toBe(false);
    expect(new StudentAcademicData({}).isValidAnnualAverage()).toBe(true);
    expect(new StudentAcademicData({ annualAverage: 61 }).isValidAnnualAverage()).toBe(true);
    expect(new StudentAcademicData({ annualAverage: 101 }).isValidAnnualAverage()).toBe(false);
  });

  it('User: activo solo sin estado; bloqueado/suspendido; tipos opcionales', () => {
    expect(new User({ active: true, state: null }).isActive()).toBe(true);
    expect(new User({ active: true, state: ESTADOS_USUARIOS.BLOQUEADO }).isActive()).toBe(false);
    expect(new User({ active: false, state: null }).isActive()).toBe(false);
    expect(new User({ state: ESTADOS_USUARIOS.BLOQUEADO }).isBlocked()).toBe(true);
    expect(new User({ state: ESTADOS_USUARIOS.SUSPENDIDO }).isSuspended()).toBe(true);
    expect(new User({ state: ESTADOS_USUARIOS.SUSPENDIDO }).isBlocked()).toBe(false);
    expect(new User({}).isValidState()).toBe(true);
    expect(new User({ state: 'XX' }).isValidState()).toBe(false);
    expect(new User({}).isValidReferenceType()).toBe(true);
    expect(new User({ referenceType: 'XX' }).isValidReferenceType()).toBe(false);
  });

  it('Permission.hasCode ignora espacios', () => {
    expect(new Permission({ code: 'a.b' }).hasCode()).toBe(true);
    expect(new Permission({ code: '  ' }).hasCode()).toBe(false);
    expect(new Permission({}).hasCode()).toBe(false);
  });

  it('ContributionPayment: monto a pagar, cancelación y estados', () => {
    const p = new ContributionPayment({ baseAmount: 500, scholarshipDiscount: 100, mandatoryAmount: 400, state: 'PENDIENTE' });
    expect(p.getAmountToPay()).toBe(400);
    expect(p.isCanceled(399)).toBe(false);
    expect(p.isCanceled(400)).toBe(true);
    expect(p.isCanceled()).toBe(false);
    expect(p.isPending()).toBe(true);
    expect(p.isStateCanceled()).toBe(false);
    expect(new ContributionPayment({}).getAmountToPay()).toBe(0);
    expect(new ContributionPayment({ state: 'CANCELADO' }).isStateCanceled()).toBe(true);
  });

  it('EvaluationType.allowsMultipleAttempts solo en recuperatorios', () => {
    expect(new EvaluationType({ isRecovery: true }).allowsMultipleAttempts()).toBe(true);
    expect(new EvaluationType({}).allowsMultipleAttempts()).toBe(false);
  });
});

describe('Enrollment', () => {
  it('tipo ANTIGUO por defecto y clasificación', () => {
    expect(new Enrollment({}).enrollmentType).toBe(TIPOS_INSCRIPCION.ANTIGUO);
    expect(new Enrollment({ enrollmentType: TIPOS_INSCRIPCION.NUEVO }).isNewStudent()).toBe(true);
    const antiguo = new Enrollment({});
    expect(antiguo.isOldStudent()).toBe(true);
    expect(antiguo.isContinuity()).toBe(true);
    expect(antiguo.isReentry()).toBe(true);
    expect(new Enrollment({ enrollmentType: TIPOS_INSCRIPCION.TRASPASO }).isTransfer()).toBe(true);
    expect(new Enrollment({ enrollmentType: TIPOS_INSCRIPCION.TRANSITABILIDAD }).isTransitability()).toBe(true);
    expect(new Enrollment({ enrollmentType: 'XX' }).isValidEnrollmentType()).toBe(false);
    expect(antiguo.isValidEnrollmentType()).toBe(true);
  });
});

describe('notas 0..100 en Leveling y PriorEnrollmentHistory', () => {
  it.each([
    ['Leveling', Leveling, 'levelingGrade'],
    ['PriorEnrollmentHistory', PriorEnrollmentHistory, 'finalGrade'],
  ])('%s', (_n, Clase, campo) => {
    const metodo = campo === 'levelingGrade' ? 'isValidLevelingGrade' : 'isValidFinalGrade';
    expect(new Clase({})[metodo]()).toBe(true);
    expect(new Clase({ [campo]: null })[metodo]()).toBe(true);
    expect(new Clase({ [campo]: 0 })[metodo]()).toBe(true);
    expect(new Clase({ [campo]: '100' })[metodo]()).toBe(true);
    expect(new Clase({ [campo]: 101 })[metodo]()).toBe(false);
    expect(new Clase({ [campo]: -1 })[metodo]()).toBe(false);
    expect(new Clase({ [campo]: 'abc' })[metodo]()).toBe(false);
  });
});

describe('SubjectEnrollment', () => {
  it('estado INSCRITO por defecto y predicados por estado', () => {
    const m = new SubjectEnrollment({});
    expect(m.status).toBe(ESTADOS_MATERIA_INSCRITA.INSCRITO);
    expect(m.isEnrolled()).toBe(true);
    for (const [estado, metodo] of [
      ['CURSANDO', 'isInProgress'],
      ['APROBADO', 'isApproved'],
      ['REPROBADO', 'isFailed'],
      ['ABANDONO', 'isAbandoned'],
      ['RETIRADO', 'isWithdrawn'],
    ]) {
      expect(new SubjectEnrollment({ status: estado })[metodo]()).toBe(true);
      expect(new SubjectEnrollment({ status: 'INSCRITO' })[metodo]()).toBe(false);
    }
  });

  it('isValidFinalGrade e isApprovedByGrade (mínimo configurable, 61 por defecto)', () => {
    expect(new SubjectEnrollment({}).isValidFinalGrade()).toBe(true);
    expect(new SubjectEnrollment({ finalGrade: 101 }).isValidFinalGrade()).toBe(false);
    expect(new SubjectEnrollment({}).isApprovedByGrade()).toBe(false);
    expect(new SubjectEnrollment({ finalGrade: 61 }).isApprovedByGrade()).toBe(true);
    expect(new SubjectEnrollment({ finalGrade: 60 }).isApprovedByGrade()).toBe(false);
    expect(new SubjectEnrollment({ finalGrade: 60 }).isApprovedByGrade(60)).toBe(true);
    expect(new SubjectEnrollment({ finalGrade: 'x' }).isApprovedByGrade()).toBe(false);
  });

  it('addStatusToHistory acumula fechas por estado, cambia el estado y rechaza estados inválidos', () => {
    const m = new SubjectEnrollment({ statusHistory: { INSCRITO: '2026-03-01' } });
    m.addStatusToHistory('CURSANDO', new Date('2026-04-02T10:00:00Z'));
    expect(m.status).toBe('CURSANDO');
    expect(m.statusHistory).toEqual({ INSCRITO: '2026-03-01', CURSANDO: '2026-04-02' });
    m.addStatusToHistory('APROBADO', '2026-06-30');
    expect(m.statusHistory.APROBADO).toBe('2026-06-30');
    expect(() => m.addStatusToHistory('XX')).toThrow('Invalid enrollment subject status');
    expect(new SubjectEnrollment({}).addStatusToHistory('CURSANDO')).toBeUndefined();
  });
});

describe('SubjectEnrollmentHistory: reglas de negocio', () => {
  it('acepta alias en español y expone enrollmentSubjectId', () => {
    const h = new SubjectEnrollmentHistory({
      matriculaMateriaId: 4,
      inscripcionId: 5,
      asignaturaPlanId: 6,
      tipoEstado: H.ABANDONO,
      fechaTransicion: '2026-05-01',
      notaResultante: 30,
      notaForzada: true,
      observaciones: 'x',
      vigente: false,
    });
    expect(h.subjectEnrollmentId).toBe(4);
    expect(h.enrollmentSubjectId).toBe(4);
    h.enrollmentSubjectId = 9;
    expect(h.subjectEnrollmentId).toBe(9);
    expect(h).toMatchObject({ enrollmentId: 5, planSubjectId: 6, stateType: H.ABANDONO, resultingGrade: 30, forcedGrade: true, current: false });
  });

  it('por defecto forcedGrade=false y current=true', () => {
    const h = new SubjectEnrollmentHistory({});
    expect(h.forcedGrade).toBe(false);
    expect(h.current).toBe(true);
    expect(h.isCurrent()).toBe(true);
    expect(h.isForcedGrade()).toBe(false);
  });

  it('clasifica los tipos de estado', () => {
    const t = (stateType) => new SubjectEnrollmentHistory({ stateType });
    for (const e of [H.NIVELACION_1RA, H.NIVELACION_2DA, H.PRUEBA_EXCEPCIONAL]) expect(t(e).isLeveling()).toBe(true);
    for (const e of [H.VENCIDA, H.CHOQUE_HORARIO, H.PRE_REQUISITO, H.NO_LLEVA_POR_VOLUNTAD]) expect(t(e).isAcademicBlock()).toBe(true);
    expect(t(H.RECUPERATORIO_ANUAL).isAnnualRecovery()).toBe(true);
    expect(t(H.HOMOLOGACION).isHomologation()).toBe(true);
    expect(t(H.REINCORPORACION).isReincorporation()).toBe(true);
    expect(t(H.ARTICULO_18).isArticle18()).toBe(true);
    expect(t(H.ABANDONO).isAbandonment()).toBe(true);
    expect(t(H.RETIRADO).isWithdrawn()).toBe(true);
    expect(t(H.ABANDONO).isAdministrativeGradeState()).toBe(true);
    expect(t(H.RETIRADO).canUseDirectResultingGrade()).toBe(true);
    expect(t(H.VENCIDA).canUseDirectResultingGrade()).toBe(false);
    for (const e of [H.NIVELACION_1RA, H.RECUPERATORIO_ANUAL, H.ARTICULO_18]) expect(t(e).isAcademicAttempt()).toBe(true);
    expect(t(H.HOMOLOGACION).isAcademicAttempt()).toBe(false);
    expect(t(H.ABANDONO).isValidStateType()).toBe(true);
    expect(t('XX').isValidStateType()).toBe(false);
    expect(t(undefined).isValidStateType()).toBe(false);
  });

  it('getBusinessRuleErrors detecta combinaciones inválidas de nota resultante y forzada', () => {
    const ok = new SubjectEnrollmentHistory({ stateType: H.ABANDONO, resultingGrade: 30, forcedGrade: true });
    expect(ok.getBusinessRuleErrors()).toEqual([]);
    expect(ok.isBusinessValid()).toBe(true);

    const tipoInvalido = new SubjectEnrollmentHistory({ stateType: 'XX' });
    expect(tipoInvalido.getBusinessRuleErrors()).toEqual(['El tipo de estado del historial de matrícula no es válido.']);

    const fueraDeRango = new SubjectEnrollmentHistory({ stateType: H.ABANDONO, resultingGrade: 120 });
    expect(fueraDeRango.getBusinessRuleErrors()).toEqual(['La nota resultante debe estar entre 0 y 100.']);

    const notaEnEstadoAcademico = new SubjectEnrollmentHistory({ stateType: H.NIVELACION_1RA, resultingGrade: 50 });
    expect(notaEnEstadoAcademico.getBusinessRuleErrors()).toEqual(['notaResultante solo debe usarse para ABANDONO o RETIRADO.']);

    const forzadaSinNota = new SubjectEnrollmentHistory({ stateType: H.RETIRADO, forcedGrade: true });
    expect(forzadaSinNota.getBusinessRuleErrors()).toEqual(['Si forcedGrade es TRUE, debe existir resultingGrade.']);

    const forzadaEnAcademico = new SubjectEnrollmentHistory({ stateType: H.NIVELACION_1RA, forcedGrade: true, resultingGrade: 10 });
    expect(forzadaEnAcademico.getBusinessRuleErrors()).toHaveLength(2);
    expect(forzadaEnAcademico.isBusinessValid()).toBe(false);
  });
});
