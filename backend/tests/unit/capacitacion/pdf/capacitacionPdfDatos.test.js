import { describe, it, expect } from '@jest/globals';
import {
  aFechaIso,
  formatearFecha,
  codigoInscripcion,
  construirDatosFormularioInscripcion,
  construirDatosReciboPago,
  nombreArchivoFormulario,
  nombreArchivoRecibo,
} from '../../../../src/application/use-cases/capacitacion/helpers/capacitacionPdfDatos.js';
import { crearFicha } from './fichaInscripcionFixture.js';

describe('capacitacionPdfDatos', () => {
  describe('fechas y código', () => {
    it('normaliza strings y Date a ISO y DD/MM/YYYY', () => {
      expect(aFechaIso('2026-03-02T00:00:00.000Z')).toBe('2026-03-02');
      // 04:00 UTC = medianoche en La Paz (-04:00)
      expect(aFechaIso(new Date('2026-03-02T04:00:00.000Z'))).toBe('2026-03-02');
      expect(formatearFecha('2026-03-02')).toBe('02/03/2026');
      expect(formatearFecha(null)).toBe('');
      expect(formatearFecha('basura')).toBe('');
    });

    it('formatea el código de inscripción con ceros', () => {
      expect(codigoInscripcion(12)).toBe('CAP-00012');
    });
  });

  describe('construirDatosFormularioInscripcion', () => {
    const datos = construirDatosFormularioInscripcion(crearFicha(), { fechaEmision: '2026-05-01' });

    it('arma participante, curso y grupo con etiquetas legibles', () => {
      expect(datos).toMatchObject({
        codigoInscripcion: 'CAP-00012',
        gestion: '2026',
        fechaInscripcion: '02/03/2026',
        fechaEmision: '01/05/2026',
        estado: 'Pendiente de pago',
        participante: { nombreCompleto: 'PÉREZ GÓMEZ JUAN CARLOS', ci: '1234567 SC', celular: '70012345' },
        curso: {
          titulo: 'Word avanzado',
          modalidad: 'Presencial',
          entidadCertificadora: 'IPELC',
          fechaInicio: '01/04/2026',
          fechaFin: '',
          grupo: 'Grupo 1 – Mañana',
          horarios: 'SAB 08:00-12:00',
        },
      });
    });

    it('incluye requisitos, compromiso vigente, pagos y resumen', () => {
      expect(datos.requisitos).toEqual([
        { descripcion: 'Fotocopia de cédula', obligatorio: true, entregado: true, fechaEntrega: '02/03/2026' },
        { descripcion: 'Depósito', obligatorio: false, entregado: false, fechaEntrega: '' },
      ]);
      expect(datos.compromiso).toEqual({ fechaLimite: '15/04/2026' });
      expect(datos.pagos).toHaveLength(3);
      expect(datos.pagos[1]).toEqual({
        fechaPago: '05/03/2026', numeroRecibo: '000031', concepto: 'COSTO DEL CURSO', metodoPago: 'Transferencia', monto: 200,
      });
      expect(datos.resumenPagos).toEqual({ costoCurso: 500, costoMatricula: 150, totalPagado: 350, saldo: 300 });
    });

    it('omite el compromiso si no está vigente y tolera listas ausentes', () => {
      const sinCompromiso = construirDatosFormularioInscripcion(
        crearFicha({ compromisoEstado: 'CUMPLIDO', requisitos: undefined, pagos: undefined })
      );
      expect(sinCompromiso.compromiso).toBeNull();
      expect(sinCompromiso.requisitos).toEqual([]);
      expect(sinCompromiso.pagos).toEqual([]);
    });
  });

  describe('construirDatosReciboPago', () => {
    it('calcula el saldo del concepto y el total en el momento del pago (CURSO)', () => {
      const datos = construirDatosReciboPago(crearFicha(), 31);
      expect(datos).toMatchObject({
        codigoRecibo: 'CAP-2026',
        numeroRecibo: '000031',
        fechaPago: '05/03/2026',
        concepto: 'CURSO',
        conceptoEtiqueta: 'COSTO DEL CURSO',
        metodoPago: 'Transferencia',
        cuenta: 'IPELC · 1001',
        montoPago: 200,
        totalConcepto: 500,
        pagadoAntes: 0,
        saldoConcepto: 300,
        // matrícula pagada hasta ese momento: 100 de 150 → falta 50; 300 + 50
        saldoTotal: 350,
        observacion: 'Primera cuota',
        codigoInscripcion: 'CAP-00012',
      });
    });

    it('descuenta pagos previos del mismo concepto (MATRICULA)', () => {
      const datos = construirDatosReciboPago(crearFicha(), 32);
      expect(datos).toMatchObject({
        concepto: 'MATRICULA',
        totalConcepto: 150,
        pagadoAntes: 100,
        montoPago: 50,
        saldoConcepto: 0,
        saldoTotal: 300,
        cuenta: '',
      });
    });

    it('devuelve null si el pago no pertenece a la ficha', () => {
      expect(construirDatosReciboPago(crearFicha(), 999)).toBeNull();
      expect(construirDatosReciboPago(crearFicha({ pagos: undefined }), 31)).toBeNull();
    });
  });

  it('sanitiza los nombres de archivo', () => {
    const formulario = construirDatosFormularioInscripcion(crearFicha());
    expect(nombreArchivoFormulario(formulario)).toBe('Formulario_Inscripcion_PEREZ_GOMEZ_JUAN_CARLOS_Word_avanzado.pdf');
    expect(nombreArchivoRecibo(construirDatosReciboPago(crearFicha(), 31))).toBe(
      'Recibo_000031_PEREZ_GOMEZ_JUAN_CARLOS.pdf'
    );
  });
});
