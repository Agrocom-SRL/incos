import { describe, it, expect } from 'vitest';
import dayjs from 'dayjs';
import {
  buildInscripcionUpdatePayload,
  buildPagoUpdatePayload,
  mapInscripcionToEditFormValues,
  mapPagoToEditFormValues,
  normalizarMotivoAnulacion,
  validarMotivoAnulacion,
} from '../inscripcionEdicionMapper';

const inscripcion = {
  participanteCi: '8159625',
  participanteExpedicion: 'LP',
  participanteNombres: 'JUAN',
  participanteApellidoPaterno: 'PEREZ',
  participanteApellidoMaterno: null,
  participanteCelular: '71234567',
  participanteEmail: null,
  capacitacionGrupoId: 5,
};

const valoresIguales = () => mapInscripcionToEditFormValues(inscripcion);

describe('mapInscripcionToEditFormValues', () => {
  it('precarga participante y grupo actual', () => {
    expect(valoresIguales()).toMatchObject({
      ci: '8159625',
      expedicion: 'LP',
      nombres: 'JUAN',
      apellidoMaterno: '',
      capacitacionGrupoId: 5,
    });
  });
});

describe('buildInscripcionUpdatePayload', () => {
  it('sin cambios devuelve {}', () => {
    expect(buildInscripcionUpdatePayload(valoresIguales(), inscripcion)).toEqual({});
  });

  it('solo envía los campos del participante que cambiaron (normalizados)', () => {
    const payload = buildInscripcionUpdatePayload(
      { ...valoresIguales(), celular: ' 70000000 ', apellidoMaterno: 'mamani', email: '' },
      inscripcion,
    );
    expect(payload).toEqual({
      participante: { celular: '70000000', apellidoMaterno: 'MAMANI' },
    });
  });

  it('limpiar la expedición envía null', () => {
    const payload = buildInscripcionUpdatePayload(
      { ...valoresIguales(), expedicion: undefined },
      inscripcion,
    );
    expect(payload).toEqual({ participante: { expedicion: null } });
  });

  it('cambiar de grupo envía capacitacionGrupoId; el mismo grupo es no-op', () => {
    expect(
      buildInscripcionUpdatePayload({ ...valoresIguales(), capacitacionGrupoId: 7 }, inscripcion),
    ).toEqual({ capacitacionGrupoId: 7 });
    expect(
      buildInscripcionUpdatePayload({ ...valoresIguales(), capacitacionGrupoId: 5 }, inscripcion),
    ).toEqual({});
  });

  it('no envía el grupo si no es editable', () => {
    expect(
      buildInscripcionUpdatePayload({ ...valoresIguales(), capacitacionGrupoId: 7 }, inscripcion, {
        incluirGrupo: false,
      }),
    ).toEqual({});
  });
});

const pago = {
  concepto: 'MATRICULA',
  monto: 150,
  fechaPago: '2026-10-20',
  metodoPagoId: 1,
  cuentaPagoId: null,
  observaciones: null,
};

describe('buildPagoUpdatePayload', () => {
  const iguales = () => mapPagoToEditFormValues(pago);

  it('sin cambios devuelve {}', () => {
    expect(buildPagoUpdatePayload({ ...iguales(), observaciones: '' }, pago)).toEqual({});
  });

  it('solo envía lo que cambió', () => {
    const payload = buildPagoUpdatePayload(
      {
        ...iguales(),
        monto: 120.5,
        fechaPago: dayjs('2026-10-21'),
        cuentaPagoId: 4,
        observaciones: ' corregido ',
      },
      pago,
    );
    expect(payload).toEqual({
      monto: 120.5,
      fechaPago: '2026-10-21',
      cuentaPagoId: 4,
      observaciones: 'corregido',
    });
  });

  it('quitar la cuenta envía null y cambiar de concepto/método los incluye', () => {
    const payload = buildPagoUpdatePayload(
      { ...iguales(), concepto: 'CURSO', metodoPagoId: '2', cuentaPagoId: undefined },
      { ...pago, cuentaPagoId: 3 },
    );
    expect(payload).toEqual({ concepto: 'CURSO', metodoPagoId: 2, cuentaPagoId: null });
  });
});

describe('motivo de anulación', () => {
  it('normaliza y valida 3 a 500 caracteres', () => {
    expect(normalizarMotivoAnulacion('  error de monto  ')).toBe('error de monto');
    expect(validarMotivoAnulacion('  ab ')).toMatch(/mínimo 3/);
    expect(validarMotivoAnulacion('')).toMatch(/mínimo 3/);
    expect(validarMotivoAnulacion('abc')).toBeNull();
    expect(validarMotivoAnulacion('x'.repeat(501))).toMatch(/500/);
  });
});
