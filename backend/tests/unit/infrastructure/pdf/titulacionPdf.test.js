import { describe, it, expect, jest } from '@jest/globals';
import { leerPdf, TEXTO_LARGO, loggerFalso } from './pdfHelpers.js';
import { FichaSeguimientoClasePdfGenerator } from '../../../../src/infrastructure/external/pdf/docentes/FichaSeguimientoClasePdfGenerator.js';
import { PanelAcompanamientoPdfGenerator } from '../../../../src/infrastructure/external/pdf/academico/PanelAcompanamientoPdfGenerator.js';
import { AvanceTutoriaCarreraPdfGenerator } from '../../../../src/infrastructure/external/pdf/titulacion/AvanceTutoriaCarreraPdfGenerator.js';
import { DesignacionTutorPdfGenerator } from '../../../../src/infrastructure/external/pdf/titulacion/DesignacionTutorPdfGenerator.js';
import { BitacoraMensualTutorPdfGenerator } from '../../../../src/infrastructure/external/pdf/titulacion/BitacoraMensualTutorPdfGenerator.js';
import { ViabilidadProyectoPdfGenerator } from '../../../../src/infrastructure/external/pdf/titulacion/ViabilidadProyectoPdfGenerator.js';
import { FormularioModalidadGradoPdfGenerator } from '../../../../src/infrastructure/external/pdf/titulacion/FormularioModalidadGradoPdfGenerator.js';

const proyecto = { titulo: 'Sistema de gestión académica ñandú', modalidadNombre: 'Proyecto de grado', carreraNombre: 'Sistemas Informáticos', gestionAnio: 2026 };
const integrantes = [
  { estudianteNombre: 'Núñez Ñusta Ana', codigoEstudiante: 'E-1', rol: 'TITULAR' },
  { estudianteNombre: null, rol: 'INTEGRANTE' },
];

describe('FichaSeguimientoClasePdfGenerator', () => {
  it('genera la ficha con todas las observaciones', async () => {
    const logger = { info: jest.fn(), error: jest.fn() };
    const buf = await new FichaSeguimientoClasePdfGenerator({ logger }).generate({
      ficha: {
        id: 7, fechaSeguimiento: '2026-03-05', claseObservada: 'PRESENCIAL', tieneCronogramaBimestral: true, tienePlanBimestral: false,
        tieneRegistroAsistencia: true, tieneRegistroPedagogico: null, estudiantesEnPlanilla: 30, estudiantesAsistentes: 28,
        obsDocumentacion: TEXTO_LARGO, obsAvanceAsignatura: 'Avance 40%', otrasObservaciones: TEXTO_LARGO,
      },
      contexto: { docenteNombre: 'Díaz Ñ.', asignaturaNombre: 'Programación', carreraNombre: 'Sistemas', paraleloPeriodoNombre: '1er año', paraleloNombre: 'A', evaluadorNombre: 'Lic. Pérez' },
    });
    const { paginas } = await leerPdf(buf);
    expect(paginas).toBeGreaterThanOrEqual(1);
    expect(logger.info).toHaveBeenCalledWith(expect.stringContaining('PDF generado'), expect.objectContaining({ fichaId: 7 }));
  });

  it('con opciones vacías usa guiones', async () => {
    await leerPdf(await new FichaSeguimientoClasePdfGenerator().generate());
  });

  it('registra y propaga el error si falla', async () => {
    const logger = { info: jest.fn(), error: jest.fn() };
    const gen = new FichaSeguimientoClasePdfGenerator({ logger });
    gen._loadTemplate = jest.fn().mockRejectedValue(new Error('sin plantilla'));
    await expect(gen.generate({})).rejects.toThrow('sin plantilla');
    expect(logger.error).toHaveBeenCalled();
  });
});

describe('PanelAcompanamientoPdfGenerator', () => {
  it('genera riesgo por carrera, materias críticas y sesiones', async () => {
    const buf = await new PanelAcompanamientoPdfGenerator({ logger: loggerFalso() }).generate({
      gestionAnio: 2026,
      riesgoPorCarrera: [{ carreraNombre: 'Contaduría', totalEstudiantes: 100, estudiantesEnRiesgo: 12, pctEstudiantesRiesgo: 12 }, { carreraNombre: null }],
      materiasCriticas: [{ asignaturaSigla: 'MAT-1', asignaturaNombre: 'Matemática', docenteNombre: 'Ñ', matriculados: 30, enRiesgo: 9, pctRiesgo: 30 }, {}],
      sesionesResumen: [{ mes: '2026-03', carreraNombre: 'Contaduría', sesionesProgramadas: 4, sesionesRealizadas: 3, pctAsistencia: 80 }, {}],
    });
    await leerPdf(buf);
  });

  it('sin datos muestra el aviso', async () => {
    await leerPdf(await new PanelAcompanamientoPdfGenerator().generate());
  });

  it('propaga errores', async () => {
    const gen = new PanelAcompanamientoPdfGenerator({ logger: { error: jest.fn(), info: jest.fn() } });
    gen._loadTemplate = jest.fn().mockRejectedValue(new Error('x'));
    await expect(gen.generate({})).rejects.toThrow('x');
  });
});

describe('AvanceTutoriaCarreraPdfGenerator', () => {
  it('genera resumen y detalle paginado con muchas filas', async () => {
    const detalle = Array.from({ length: 80 }, (_, i) => ({ titulo: `Proyecto ${i} ${TEXTO_LARGO.slice(0, 80)}`, carreraNombre: 'Sistemas', tutorNombre: i % 2 ? 'Tutor Ñ' : null, porcentajeAvance: i, ultimaObservacion: i % 3 ? 'Revisar capítulo 2' : null }));
    const buf = await new AvanceTutoriaCarreraPdfGenerator().generate({
      gestionAnio: 2026,
      resumenPorCarrera: [{ carreraNombre: 'Sistemas', totalProyectos: 80, promedioAvance: 41, proyectosConObservacionesPendientes: 5 }, {}],
      detalle,
    });
    const { paginas } = await leerPdf(buf);
    expect(paginas).toBeGreaterThan(1);
  });

  it('sin datos', async () => {
    await leerPdf(await new AvanceTutoriaCarreraPdfGenerator().generate());
  });
});

describe('DesignacionTutorPdfGenerator', () => {
  it('genera el informe con integrantes', async () => {
    await leerPdf(await new DesignacionTutorPdfGenerator().generate({
      numeroInforme: 'INF-001/2026', fechaEmision: '2026-03-01', destinatario: 'DDE', proyecto, integrantes, tutorNombre: 'Dr. Ñúñez',
    }));
  });

  it('sin opciones usa valores por defecto', async () => {
    await leerPdf(await new DesignacionTutorPdfGenerator().generate());
  });
});

describe('BitacoraMensualTutorPdfGenerator', () => {
  it('lista tutorías por tutor', async () => {
    await leerPdf(await new BitacoraMensualTutorPdfGenerator().generate({
      mes: '2026-03', gestionAnio: 2026,
      filas: [{ tutorNombre: 'Ñ', carreraNombre: 'Sistemas', tutoriasRegistradas: 5, tutoriasConfirmadas: 4, proyectosAtendidos: 2 }, {}],
    }));
  });

  it('sin filas muestra aviso', async () => {
    await leerPdf(await new BitacoraMensualTutorPdfGenerator().generate());
  });
});

describe('ViabilidadProyectoPdfGenerator', () => {
  it('genera el dictamen con contenido largo', async () => {
    await leerPdf(await new ViabilidadProyectoPdfGenerator().generate({
      numeroInforme: '1', fechaEmision: '2026-03-01', proyecto, integrantes, tutorNombre: 'Dr. Ñ', resultado: 'VIABLE', contenido: TEXTO_LARGO,
    }));
  });

  it('sin opciones', async () => {
    await leerPdf(await new ViabilidadProyectoPdfGenerator().generate());
  });
});

describe('FormularioModalidadGradoPdfGenerator', () => {
  it('genera el formulario oficial con objetivos en varios párrafos', async () => {
    const gen = new FormularioModalidadGradoPdfGenerator();
    const buf = await gen.generate({
      estudiante: { nombres: 'Ana', apellidoPaterno: 'Núñez', apellidoMaterno: 'Ñusta', ci: '1234567', expedicion: 'SC', celular: '70000000' },
      proyecto: { ...proyecto, objetivos: `Objetivo general\n\n  \nObjetivos específicos ${TEXTO_LARGO}` },
    });
    await leerPdf(buf);
  });

  it('sin datos', async () => {
    await leerPdf(await new FormularioModalidadGradoPdfGenerator().generate());
  });

  it('_flattenObjetivos normaliza saltos y vacíos', () => {
    const gen = new FormularioModalidadGradoPdfGenerator();
    expect(gen._flattenObjetivos(null)).toBe('');
    expect(gen._flattenObjetivos('  ')).toBe('');
    expect(gen._flattenObjetivos('a\n\n\n\nb\n  \n c ')).toBe('a\n\nb\n\nc');
  });

  it('_formatLugarFecha usa Santa Cruz y el mes en español', () => {
    jest.useFakeTimers().setSystemTime(new Date(2026, 9, 26));
    try {
      expect(new FormularioModalidadGradoPdfGenerator()._formatLugarFecha()).toBe('Santa Cruz, 26 de octubre de 2026');
    } finally {
      jest.useRealTimers();
    }
  });
});
