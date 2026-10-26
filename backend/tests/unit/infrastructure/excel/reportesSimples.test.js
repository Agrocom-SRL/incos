import { describe, it, expect } from '@jest/globals';
import { leerXlsx, textosDe, nombresHojas, contiene } from './xlsxHelpers.js';
import { AsistenciaConsolidadoExcelBuilder } from '../../../../src/infrastructure/external/excel/asistencia-consolidado/AsistenciaConsolidadoExcelBuilder.js';
import { AvanceAcademicoExcelBuilder } from '../../../../src/infrastructure/external/excel/avance-academico/AvanceAcademicoExcelBuilder.js';
import { ListadoInscritosCapacitacionExcelBuilder } from '../../../../src/infrastructure/external/excel/capacitacion/ListadoInscritosCapacitacionExcelBuilder.js';
import { DesercionExcelBuilder } from '../../../../src/infrastructure/external/excel/desercion/DesercionExcelBuilder.js';
import { BecasReporteExcelBuilder } from '../../../../src/infrastructure/external/excel/finanzas-reportes/BecasReporteExcelBuilder.js';
import { CuentasPorCobrarExcelBuilder } from '../../../../src/infrastructure/external/excel/finanzas-reportes/CuentasPorCobrarExcelBuilder.js';
import { HistorialAcademicoExcelBuilder } from '../../../../src/infrastructure/external/excel/historial-academico/HistorialAcademicoExcelBuilder.js';

const LARGO = 'Ñandú '.repeat(80); // texto largo con acentos

describe('AsistenciaConsolidadoExcelBuilder', () => {
  const datos = {
    titulo: 'CONSOLIDADO DE ASISTENCIA (%) — 1er BIMESTRE',
    cabecera: { carrera: 'Contaduría General', gestionAnio: 2026, periodo: 'Primer año', paralelo: 'A: Mañana/1?', turno: 'MAÑANA', bimestreLabel: '1er bimestre' },
    asignaturas: [
      { ofertaCursoId: 10, sigla: 'CON-101', docenteNombre: 'Pérez Ñ.' },
      { ofertaCursoId: 11, sigla: 'MAT-102', docenteNombre: null },
    ],
    estudiantes: [
      { nro: 1, nombreCompleto: 'álvarez núñez josé', codigo: 'E-1', celdas: { 10: { pctAsistencia: 95.5 }, 11: { pctAsistencia: null } }, promedioPct: 87.25 },
      { nombreCompleto: null, codigo: null, celdas: undefined, promedioPct: undefined },
    ],
  };

  it('genera un xlsx con cabeceras, filas y porcentajes formateados', async () => {
    const buf = await new AsistenciaConsolidadoExcelBuilder().generarConsolidadoAsistencia(datos);
    const wb = await leerXlsx(buf);
    // El nombre de hoja se sanea: ':' y '/' y '?' no se permiten.
    expect(nombresHojas(wb)).toEqual(['A Mañana 1']);
    const ws = wb.worksheets[0];
    const t = textosDe(ws);
    expect(t).toEqual(expect.arrayContaining(['NÓMINA DE ESTUDIANTES', 'CON-101', 'MAT-102', 'PROMEDIO %', 'ÁLVAREZ NÚÑEZ JOSÉ', '(Pérez Ñ.)']));
    expect(contiene(ws, 'Contaduría General')).toBe(true);
    expect(t.some((x) => /95,5\s?%|95\.5\s?%/.test(x))).toBe(true);
    expect(t).toContain('—');
  });

  it('sin estudiantes ni asignaturas deja el aviso de vacío', async () => {
    const buf = await new AsistenciaConsolidadoExcelBuilder().generarConsolidadoAsistencia({});
    const wb = await leerXlsx(buf);
    expect(nombresHojas(wb)).toEqual(['Consolidado']);
    expect(contiene(wb.worksheets[0], 'Sin registros de asistencia')).toBe(true);
  });

  it('trunca el nombre de hoja a 31 caracteres', async () => {
    const buf = await new AsistenciaConsolidadoExcelBuilder().generarConsolidadoAsistencia({ cabecera: { paralelo: LARGO } });
    const wb = await leerXlsx(buf);
    expect(wb.worksheets[0].name.length).toBeLessThanOrEqual(31);
  });
});

describe('AvanceAcademicoExcelBuilder', () => {
  it('escribe una fila por estudiante con % de avance', async () => {
    const buf = await new AvanceAcademicoExcelBuilder().generarAvanceAcademico({
      carreraFiltro: 'Informática',
      fechaEmision: '2026-10-26',
      filas: [
        { nombreCompleto: 'gómez peña', codigo: 'E-9', carreraNombre: 'Informática', planNombre: 'Plan 2020', materiasAprobadas: 10, materiasConvalidadas: 2, totalAsignaturasPlan: 30, pctAvance: 40, promedioHistorial: 72.5, ultimaGestionAnio: 2025 },
        { nombreCompleto: LARGO, pctAvance: 'x' },
      ],
    });
    const wb = await leerXlsx(buf);
    expect(nombresHojas(wb)).toEqual(['Avance académico']);
    const ws = wb.worksheets[0];
    expect(contiene(ws, 'AVANCE ACADÉMICO POR ESTUDIANTE')).toBe(true);
    expect(contiene(ws, 'GÓMEZ PEÑA')).toBe(true);
    expect(contiene(ws, 'Plan 2020')).toBe(true);
    expect(textosDe(ws).some((x) => /40,0\s?%|40\.0\s?%/.test(x))).toBe(true);
    // pctAvance no numérico se muestra como guion
    expect(textosDe(ws)).toContain('—');
  });

  it('sin filas muestra el mensaje y "TODAS" como carrera', async () => {
    const wb = await leerXlsx(await new AvanceAcademicoExcelBuilder().generarAvanceAcademico({}));
    const ws = wb.worksheets[0];
    expect(contiene(ws, 'Sin registros académicos')).toBe(true);
    expect(contiene(ws, 'TODAS')).toBe(true);
  });
});

describe('ListadoInscritosCapacitacionExcelBuilder', () => {
  const datos = {
    curso: { titulo: 'Excel avanzado ñ', costo: 350, costoMatricula: 50, horariosDetalle: 'Lun 18:00', fechaInicio: '2026-03-02', fechaFin: '2026-04-30', modalidad: 'Presencial' },
    fechaEmision: '2026-10-26',
    participantes: [
      { ciCompleto: '123 SC', nombreCompleto: 'maría núñez', correo: 'm@x.bo', grupo: 'G1', saldo: 100, estadoPagoMatricula: 'PAGADO', estadoPagoCurso: 'PARCIAL', requisitosPendientes: 2, fechaInscripcion: '2026-02-10T10:00:00Z' },
      { nombreCompleto: null, saldo: 'abc' },
    ],
  };

  it('lista participantes, formatea fechas y totaliza saldo', async () => {
    const wb = await leerXlsx(await new ListadoInscritosCapacitacionExcelBuilder().generarListadoInscritos(datos));
    const ws = wb.worksheets[0];
    expect(nombresHojas(wb)).toEqual(['INSCRITOS']);
    expect(contiene(ws, 'LISTADO DE INSCRITOS — EXCEL AVANZADO Ñ')).toBe(true);
    expect(contiene(ws, 'MARÍA NÚÑEZ')).toBe(true);
    expect(contiene(ws, '10/02/2026')).toBe(true);
    expect(contiene(ws, '02/03/2026 – 30/04/2026')).toBe(true);
    expect(contiene(ws, 'TOTAL INSCRITOS: 2')).toBe(true);
    expect(contiene(ws, 'SALDO PENDIENTE TOTAL')).toBe(true);
  });

  it('sin datos usa valores por defecto', async () => {
    const wb = await leerXlsx(await new ListadoInscritosCapacitacionExcelBuilder().generarListadoInscritos(undefined));
    const ws = wb.worksheets[0];
    expect(contiene(ws, 'CURSO DE CAPACITACIÓN')).toBe(true);
    expect(contiene(ws, 'Sin participantes inscritos vigentes.')).toBe(true);
    expect(contiene(ws, 'TOTAL INSCRITOS: 0')).toBe(true);
  });
});

describe('DesercionExcelBuilder', () => {
  it('genera resumen por carrera/gestión, total y detalle de desertores', async () => {
    const buf = await new DesercionExcelBuilder().generarReporteDesercion({
      gestionFiltro: '2026',
      fechaEmision: '2026-10-26',
      carreras: [{ gestionAnio: 2026, carreraNombre: 'Contaduría', totalEstudiantes: 100, estudiantesDesercion: 7, pctEstudiantesDesercion: 7, matriculasAbandono: 5, matriculasRetiro: 2, totalMatriculasMateria: 400 }],
      resumen: { totalEstudiantes: 100, estudiantesDesercion: 7, pctEstudiantesDesercion: 7, matriculasAbandono: 5, matriculasRetiro: 2, totalMatriculasMateria: 400 },
      desertores: [
        { gestionAnio: 2026, nombreCompleto: 'rojas ñusta', codigo: 'E-5', carreraNombre: 'Contaduría', asignaturaSigla: 'CON-1', asignaturaNombre: 'Contabilidad', periodoNombre: '1er año', estado: 'ABANDONO' },
        { periodoNumero: 2, estado: 'RETIRADO' },
      ],
    });
    const wb = await leerXlsx(buf);
    const ws = wb.worksheets[0];
    expect(nombresHojas(wb)).toEqual(['Deserción']);
    expect(contiene(ws, 'RESUMEN POR CARRERA Y GESTIÓN')).toBe(true);
    expect(contiene(ws, 'DETALLE DE DESERTORES')).toBe(true);
    expect(contiene(ws, 'ROJAS ÑUSTA')).toBe(true);
    expect(contiene(ws, 'CON-1 Contabilidad')).toBe(true);
    expect(contiene(ws, 'TOTAL')).toBe(true);
    expect(textosDe(ws).some((x) => /7,00\s?%|7\.00\s?%/.test(x))).toBe(true);
  });

  it('sin carreras ni desertores deja los avisos', async () => {
    const wb = await leerXlsx(await new DesercionExcelBuilder().generarReporteDesercion({}));
    const ws = wb.worksheets[0];
    expect(contiene(ws, 'Sin datos de deserción')).toBe(true);
    expect(contiene(ws, 'Sin desertores registrados')).toBe(true);
    expect(contiene(ws, 'TODAS')).toBe(true);
  });
});

describe('BecasReporteExcelBuilder', () => {
  const datos = {
    gestion: { nombre: 'Gestión 2026' },
    fechaEmision: '2026-10-26',
    catalogo: [{ porcentaje: 50 }, { porcentaje: 25 }, { porcentaje: 50 }],
    distribucion: [{ etiqueta: 'Beca 50%', porcentaje: 50, beneficiados: 3, porcentajeDelTotalConBeca: 60 }, { porcentaje: 25, beneficiados: 2 }],
    resumen: { totalMatriculados: 50, totalConBeca: 5, porcentajeConBeca: 10, porcentajeSinBeca: 90 },
    filas: [
      {
        carreraNombre: 'Informática', totalMatriculados: 30, totalConBeca: 3, porcentajeCobertura: 10, becasPorPorcentaje: { 50: 2, 25: 1 },
        children: [
          { children: [
            { paraleloNombre: 'A', paraleloTurno: 'NOCHE', totalMatriculados: 15, totalConBeca: 2, porcentajeCobertura: 13.3, estudiantes: [
              { apellidoPaterno: 'Ñato', apellidoMaterno: 'Díaz', nombres: 'Ana', ci: '111', becaNombre: 'Excelencia', becaPorcentaje: 50, montoDescuento: 100, montoBase: 400 },
              { ci: null, becaPorcentaje: 25, montoDescuento: 'x', montoBase: 400 },
            ] },
            { paraleloNombre: 'B', estudiantes: [] },
          ] },
          { children: null },
        ],
      },
      { carreraNombre: 'Sin becados', children: [] },
    ],
  };

  it('arma tramos por porcentaje único, detalle por paralelo y resúmenes', async () => {
    const wb = await leerXlsx(await new BecasReporteExcelBuilder().generarPlanillaBecasPorCarrera(datos));
    const ws = wb.worksheets[0];
    expect(nombresHojas(wb)).toEqual(['BECAS POR CARRERA']);
    const t = textosDe(ws);
    expect(t).toEqual(expect.arrayContaining(['25%', '50%', 'APORTE BASE (Bs)', 'ÑATO DÍAZ ANA', 'SIN NOMBRE', 'TOTALES GENERALES', 'TOTAL GENERAL']));
    expect(contiene(ws, 'Paralelo A · NOCHE')).toBe(true);
    expect(contiene(ws, 'Total de estudiantes con beca')).toBe(true);
    // la carrera sin paralelos becados no aparece
    expect(contiene(ws, 'SIN BECADOS')).toBe(false);
    expect(contiene(ws, 'Paralelo B')).toBe(false);
  });

  it('sin datos genera solo estructura y totales en cero', async () => {
    const wb = await leerXlsx(await new BecasReporteExcelBuilder().generarPlanillaBecasPorCarrera(undefined));
    const ws = wb.worksheets[0];
    expect(contiene(ws, 'PLANILLA DE CONTROL DE BECAS POR CARRERA')).toBe(true);
    expect(contiene(ws, 'TOTALES GENERALES')).toBe(true);
  });
});

describe('CuentasPorCobrarExcelBuilder', () => {
  const datos = {
    gestion: { anio: 2026 },
    fechaEmision: '2026-10-26',
    montoMaximoPorEstudiante: 2400,
    resumen: { totalPendientePorCobrar: 700 },
    carreras: [
      {
        carreraNombre: 'Administración', totalMatriculados: 40, montoMaximoTotal: 96000, totalCancelado: 90000, totalPendiente: 6000, porcentajePendiente: 6.25,
        paralelos: [
          { paralelo: 'A', turno: 'MAÑANA', estudiantes: [
            { carnet: '12', nombreCompleto: 'peña ñ', montoTotal: 2400, totalPagado: 1700, saldoPendiente: 700, porcentajeSaldo: 29.1, fechaCompromiso: '2026-11-05', diasAtraso: 3, estado: 'VENCIDA', observacion: 'Llamar' },
            { nombreCompleto: 'al día', saldoPendiente: 0, estado: 'AL_DIA' },
            { nombreCompleto: 'sin compromiso', saldoPendiente: 10, estado: 'RARO', diasAtraso: 0 },
          ] },
          { paralelo: 'B', estudiantes: [{ saldoPendiente: 0 }] },
        ],
      },
      { carreraNombre: 'Sin deudores', paralelos: [{ estudiantes: [] }] },
    ],
  };

  it('lista solo deudores, con alerta, resumen por carrera y leyenda', async () => {
    const wb = await leerXlsx(await new CuentasPorCobrarExcelBuilder().generarPlanillaCuentasPorCobrar(datos));
    const ws = wb.worksheets[0];
    expect(nombresHojas(wb)).toEqual(['CUENTAS POR COBRAR']);
    const t = textosDe(ws);
    expect(t).toEqual(expect.arrayContaining(['PEÑA Ñ', 'Vencida', 'Sin compromiso', 'LEYENDA DE ALERTAS', 'RESUMEN TOTAL POR CARRERA', 'MONTO TOTAL PENDIENTE POR COBRAR (Bs)']));
    expect(t).not.toContain('AL DÍA');
    expect(contiene(ws, '05/11/2026')).toBe(true);
    expect(contiene(ws, 'Paralelo A · MAÑANA')).toBe(true);
    expect(contiene(ws, 'Paralelo B')).toBe(false);
    // la carrera sin deudores se filtra de todo el reporte
    expect(contiene(ws, 'SIN DEUDORES')).toBe(false);
  });

  it('sin datos genera la estructura vacía', async () => {
    const wb = await leerXlsx(await new CuentasPorCobrarExcelBuilder().generarPlanillaCuentasPorCobrar(null));
    expect(contiene(wb.worksheets[0], 'TOTALES GENERALES')).toBe(true);
  });
});

describe('HistorialAcademicoExcelBuilder', () => {
  const estudiante = { nombreCompleto: 'Núñez Ñusta', matricula: 'M-1', ci: '555', expedicion: 'SC', carreraNombre: 'Informática', carreraCodigo: 'INF', cargaHorariaTotalPlan: 4000, duracionAnios: 3 };
  const filas = [
    { nro: 1, gestionAnio: 2024, cargaHoraria: 80, periodoNombre: '1er año', asignaturaSigla: 'INF-101', asignaturaNombre: 'Programación', prerrequisitoSigla: null, notaFinal: 80, notaRecuperacion: null, estado: 'APROBADO', origen: 'REGULAR' },
    { asignaturaSigla: 'INF-102', asignaturaNombre: LARGO, notaFinal: 'x', estado: 'REPROBADO' },
    { estado: 'ABANDONO', notaFinal: undefined },
  ];

  it('incluye datos del estudiante, filas y resumen', async () => {
    const wb = await leerXlsx(await new HistorialAcademicoExcelBuilder().generarHistorialAcademico({
      estudiante, filas, resumen: { totalCargaHoraria: 160, asignaturasAprobadas: 1, asignaturasTotal: 3, promedioGeneral: 70.5 },
    }));
    const ws = wb.worksheets[0];
    expect(nombresHojas(wb)).toEqual(['Historial académico']);
    const t = textosDe(ws);
    expect(t).toEqual(expect.arrayContaining(['HISTORIAL ACADÉMICO DEL ESTUDIANTE', 'Núñez Ñusta', 'INF-101', 'Programación', 'RESUMEN', '1/3', '555 SC', 'Informática (INF)']));
    expect(t).toContain('—');
  });

  it('sin filas muestra el mensaje y tolera argumentos ausentes', async () => {
    const wb = await leerXlsx(await new HistorialAcademicoExcelBuilder().generarHistorialAcademico());
    expect(contiene(wb.worksheets[0], 'no tiene asignaturas registradas')).toBe(true);
  });
});
