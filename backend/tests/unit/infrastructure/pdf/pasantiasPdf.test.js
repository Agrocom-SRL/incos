import { describe, it, expect, jest } from '@jest/globals';
import { leerPdf, TEXTO_LARGO } from './pdfHelpers.js';
import { PasantiaInformePdfGenerator } from '../../../../src/infrastructure/external/pdf/pasantias/PasantiaInformePdfGenerator.js';
import { PasantiaSeguimientoPdfGenerator } from '../../../../src/infrastructure/external/pdf/pasantias/PasantiaSeguimientoPdfGenerator.js';
import { TIPOS_INFORME_PASANTIA, RESULTADOS_INFORME_PASANTIA, NIVELES_DESEMPENO_PASANTIA } from '../../../../src/domain/constants/pasantias.constants.js';

const pasantia = {
  docenteSupervisorNombre: 'Lic. Ñúñez', estudianteNombre: 'Ana Núñez Ñusta', estudianteCi: '123 SC', estudianteCelular: '70000000', carreraNombre: 'Sistemas',
  empresaNombre: 'Ñandú S.R.L.', empresaTipoSocietario: 'S.R.L.', empresaDireccion: 'Av. Cañoto 123', empresaNit: '1020304050', empresaSectorActividad: 'Servicios',
  empresaTelefono: '33300000', areaDepartamento: 'Sistemas', responsableEmpresa: 'Sr. Pérez', cargoPuesto: 'Soporte técnico', funciones: TEXTO_LARGO,
  tipoContrato: 'INDEFINIDO', fechaInicio: '2026-01-05', fechaFinalizacion: '2026-04-05', empresaEnFuncionamiento: true,
};

describe('PasantiaInformePdfGenerator', () => {
  it.each([
    ['verificación viable', TIPOS_INFORME_PASANTIA.VERIFICACION_EMPRESA, RESULTADOS_INFORME_PASANTIA.VIABLE],
    ['verificación no viable', TIPOS_INFORME_PASANTIA.VERIFICACION_EMPRESA, RESULTADOS_INFORME_PASANTIA.NO_VIABLE],
    ['convalidación viable', TIPOS_INFORME_PASANTIA.CONVALIDACION_TRABAJO, RESULTADOS_INFORME_PASANTIA.VIABLE],
    ['convalidación no viable', TIPOS_INFORME_PASANTIA.CONVALIDACION_TRABAJO, RESULTADOS_INFORME_PASANTIA.NO_VIABLE],
  ])('%s', async (_n, tipo, resultado) => {
    const logger = { info: jest.fn(), error: jest.fn() };
    const buf = await new PasantiaInformePdfGenerator({ logger }).generate({
      tipo, pasantia, docenteNombre: 'Lic. Ñúñez',
      informe: { fechaEmision: '2026-04-06', fechaVerificacion: '2026-03-01', numeroMemo: 'MEMO 12/2026', resultado, contenido: TEXTO_LARGO, evaluacionCualitativa: 'Buen desempeño' },
    });
    await leerPdf(buf);
    expect(logger.info).toHaveBeenCalledWith(expect.stringContaining('PDF generado'), expect.objectContaining({ tipo }));
  });

  it('sin opciones usa tipo genérico y espacios en blanco', async () => {
    await leerPdf(await new PasantiaInformePdfGenerator().generate());
  });

  it('empresa fuera de funcionamiento y datos mínimos de convalidación', async () => {
    await leerPdf(await new PasantiaInformePdfGenerator().generate({ tipo: TIPOS_INFORME_PASANTIA.VERIFICACION_EMPRESA, pasantia: { empresaEnFuncionamiento: false }, informe: { fechaEmision: 'texto' } }));
    await leerPdf(await new PasantiaInformePdfGenerator().generate({ tipo: TIPOS_INFORME_PASANTIA.CONVALIDACION_TRABAJO, pasantia: { cargoPuesto: 'X' } }));
  });

  it('registra el error y lo propaga', async () => {
    const logger = { info: jest.fn(), error: jest.fn() };
    const gen = new PasantiaInformePdfGenerator({ logger });
    gen._loadTemplate = jest.fn().mockRejectedValue(new Error('falla'));
    await expect(gen.generate({})).rejects.toThrow('falla');
    expect(logger.error).toHaveBeenCalled();
  });
});

describe('PasantiaSeguimientoPdfGenerator', () => {
  it.each(Object.values(NIVELES_DESEMPENO_PASANTIA))('nivel de desempeño %s', async (nivel) => {
    const buf = await new PasantiaSeguimientoPdfGenerator().generate({
      pasantia,
      seguimiento: { fecha: '2026-03-10', descripcionTrabajo: TEXTO_LARGO, principalesActividades: 'Soporte', nivelDesempeno: nivel, fortalezas: 'Puntual', areasMejorar: null, sugerencias: 'Ninguna' },
    });
    await leerPdf(buf);
  });

  it('sin datos usa los espacios en blanco y "A la fecha"', async () => {
    await leerPdf(await new PasantiaSeguimientoPdfGenerator().generate());
  });

  it('fecha no ISO se muestra tal cual', async () => {
    await leerPdf(await new PasantiaSeguimientoPdfGenerator().generate({ pasantia: { fechaInicio: 'enero' }, seguimiento: { fecha: 'hoy' } }));
  });

  it('propaga errores', async () => {
    const gen = new PasantiaSeguimientoPdfGenerator({ logger: { error: jest.fn(), info: jest.fn() } });
    gen._loadTemplate = jest.fn().mockRejectedValue(new Error('x'));
    await expect(gen.generate({})).rejects.toThrow('x');
  });
});
