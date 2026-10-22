import { describe, it, expect, jest } from '@jest/globals';
import { FormularioInscripcionCapacitacionPdfGenerator } from '../../../../src/infrastructure/external/pdf/capacitacion/FormularioInscripcionCapacitacionPdfGenerator.js';
import { ReciboPagoCapacitacionPdfGenerator } from '../../../../src/infrastructure/external/pdf/capacitacion/ReciboPagoCapacitacionPdfGenerator.js';
import {
  construirDatosFormularioInscripcion,
  construirDatosReciboPago,
} from '../../../../src/application/use-cases/capacitacion/helpers/capacitacionPdfDatos.js';
import { crearFicha } from './fichaInscripcionFixture.js';

const logger = () => ({ info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() });
const esPdf = (buffer) => buffer.subarray(0, 4).toString() === '%PDF';

describe('Generadores PDF de Capacitación (humo)', () => {
  it('el formulario de inscripción produce un PDF válido', async () => {
    const generador = new FormularioInscripcionCapacitacionPdfGenerator({ logger: logger() });
    const buffer = await generador.generarFormularioInscripcion(
      construirDatosFormularioInscripcion(crearFicha())
    );
    expect(Buffer.isBuffer(buffer)).toBe(true);
    expect(esPdf(buffer)).toBe(true);
  });

  it('el formulario soporta una inscripción sin grupo, requisitos ni pagos', async () => {
    const generador = new FormularioInscripcionCapacitacionPdfGenerator({ logger: logger() });
    const ficha = crearFicha({
      grupoNombre: null,
      grupoHorariosEtiqueta: null,
      participanteEmail: null,
      requisitos: [],
      pagos: [],
      compromisoEstado: null,
    });
    const buffer = await generador.generarFormularioInscripcion(construirDatosFormularioInscripcion(ficha));
    expect(esPdf(buffer)).toBe(true);
  });

  it('el formulario pagina cuando hay muchos requisitos y pagos', async () => {
    const generador = new FormularioInscripcionCapacitacionPdfGenerator({ logger: logger() });
    const requisitos = Array.from({ length: 40 }, (_, i) => ({
      requisitoId: i, descripcion: `Requisito número ${i}`, obligatorio: true, entregado: i % 2 === 0, fechaEntrega: null,
    }));
    const buffer = await generador.generarFormularioInscripcion(
      construirDatosFormularioInscripcion(crearFicha({ requisitos }))
    );
    expect(esPdf(buffer)).toBe(true);
  });

  it.each([31, 32])('el recibo del pago %i produce un PDF válido', async (pagoId) => {
    const generador = new ReciboPagoCapacitacionPdfGenerator({ logger: logger() });
    const buffer = await generador.generarRecibo(construirDatosReciboPago(crearFicha(), pagoId));
    expect(Buffer.isBuffer(buffer)).toBe(true);
    expect(esPdf(buffer)).toBe(true);
  });

  it('el monto en letras usa centavos y centenas irregulares', () => {
    const generador = new ReciboPagoCapacitacionPdfGenerator({ logger: logger() });
    expect(generador._montoEnLetras(500)).toBe('Quinientos con 00/100 bolivianos');
    expect(generador._montoEnLetras(1250.5)).toBe('Mil doscientos cincuenta con 50/100 bolivianos');
  });

  it('el formulario y el recibo de un curso externo (leyenda del costo del curso) producen un PDF válido', async () => {
    const ficha = crearFicha({
      pagoCursoExterno: true,
      requisitoAcreditaPagoCurso: { requisitoId: 2, descripcion: 'Depósito', entregado: true },
      pagos: [
        { id: 30, monto: 150, concepto: 'MATRICULA', fechaPago: '2026-03-02', numeroRecibo: '000030', metodoPagoNombre: 'Efectivo' },
      ],
      saldo: 0,
    });
    const formulario = new FormularioInscripcionCapacitacionPdfGenerator({ logger: logger() });
    expect(esPdf(await formulario.generarFormularioInscripcion(construirDatosFormularioInscripcion(ficha)))).toBe(true);
    const recibo = new ReciboPagoCapacitacionPdfGenerator({ logger: logger() });
    expect(esPdf(await recibo.generarRecibo(construirDatosReciboPago(ficha, 30)))).toBe(true);
  });

});
