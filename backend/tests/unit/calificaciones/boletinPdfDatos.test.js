import { describe, it, expect } from '@jest/globals';
import construir, { construirDatosBoletinEstudiante } from '../../../src/application/utils/boletinPdfDatos.js';

const matriz = () => ({
  gestionAnio: 2026,
  notaMinimaAprobacion: '61',
  asignaturas: [
    { ofertaCursoId: 20, sigla: 'MAT-2', nombre: 'Matemática II', orden: 2 },
    { ofertaCursoId: 10, sigla: 'MAT-1', nombre: 'Matemática I', orden: 1 },
  ],
  estudiantes: [
    {
      estudianteId: 1,
      nombreCompleto: 'Ana Paz',
      codigoEstudiante: 'E-1',
      ci: '123',
      observacionesBimestre: { 1: ' Buen inicio ', 2: '', 3: null },
      notas: {
        10: { bim1: 80, bim2: 70, bim3: 60, bim4: 90, notaAnual: 75.4, notaFinal: 76.5, observacion: 'APROBADO' },
        20: { bim1: 50, bim2: null, bim3: 40, bim4: 30, notaAnual: null, notaFinal: null, observacion: 'ABANDONO' },
      },
    },
    {
      estudianteId: 2,
      nombreCompleto: 'Beto Gil',
      notas: { 10: { bim1: 60 } },
    },
  ],
});

const cabeceraRow = { carrera_nombre: 'Sistemas', periodo_nombre: 'Primero', paralelo_nombre: 'A' };

describe('construirDatosBoletinEstudiante: boletín anual', () => {
  it('devuelve null si el estudiante no pertenece al paralelo', () => {
    expect(construir({ matriz: matriz(), cabeceraRow, estudianteId: 99 })).toBeNull();
    expect(construir({ matriz: null, cabeceraRow, estudianteId: 1 })).toBeNull();
  });

  it('arma cabecera, filas ordenadas por orden de asignatura y pie con promedios de clase', () => {
    const { datos, fileNameParts } = construirDatosBoletinEstudiante({ matriz: matriz(), cabeceraRow, estudianteId: '1' });
    expect(datos.titulo).toBe('BOLETIN DE CALIFICACIONES');
    expect(datos.cabecera).toMatchObject({
      estudiante: 'Ana Paz',
      codigoEstudiante: 'E-1',
      ci: '123',
      carrera: 'Sistemas',
      curso: 'Primero',
      paralelo: 'A',
      gestion: 2026,
    });
    expect(datos.cabecera.bimestre).toBeUndefined();
    expect(datos.filas.map((f) => f.codigo)).toEqual(['MAT-1', 'MAT-2']);
    expect(datos.filas[0]).toEqual({
      codigo: 'MAT-1',
      asignatura: 'Matemática I',
      par1: 80,
      par2: 70,
      par3: 60,
      par4: 90,
      prom: 75,
      hab: null,
      final: 77,
      obs: 'APROBADO',
    });
    expect(datos.filas[1]).toMatchObject({ prom: null, final: null, obs: 'ABANDONO' });
    // bim1: (80 + 50 + 60) / 3 = 63.33 -> 63 ; bim2: (70) -> 70
    expect(datos.promedioClasePorParcial).toEqual({ par1: 63, par2: 70, par3: 50, par4: 60 });
    expect(datos.observaciones).toEqual(['1º BIMESTRE: Buen inicio']);
    expect(datos.bimestre).toBeUndefined();
    expect(fileNameParts).toEqual({ carrera: 'Sistemas', curso: 'Primero', paralelo: 'A', estudiante: 'Ana Paz', gestion: 2026, bimestre: null });
  });

  it('sin cabecera de paralelo deja los textos vacíos y no falla', () => {
    const { datos } = construir({ matriz: matriz(), cabeceraRow: null, estudianteId: 2 });
    expect(datos.cabecera).toMatchObject({ carrera: '', curso: '', paralelo: '', ci: '', codigoEstudiante: '' });
    expect(datos.observaciones).toEqual([]);
    expect(datos.filas[1]).toMatchObject({ par1: null, obs: '' });
  });
});

describe('construirDatosBoletinEstudiante: boletín bimestral', () => {
  const desglose = [
    { oferta_curso_id: 10, tiene_registro: 1, nota_teorico: 30, nota_practico: 40, nota_efectiva: 70, estado_bimestre: 'CERRADO' },
    { oferta_curso_id: 20, tiene_registro: 0, estado_bimestre: 'EN_CURSO' },
  ];

  it('usa el bimestre pedido: columnas teo/pra/total, estado según escala y pie del bimestre', () => {
    const { datos, fileNameParts } = construir({ matriz: matriz(), cabeceraRow, estudianteId: 1, bimestre: 1, desgloseBimestre: desglose });
    expect(datos.bimestre).toBe(1);
    expect(datos.footerRowLabel).toBe('PROMEDIO 1º BIMESTRE');
    expect(datos.cabecera.bimestre).toBe('1º BIMESTRE');
    expect(datos.filas[0]).toEqual({ codigo: 'MAT-1', asignatura: 'Matemática I', teo: 30, pra: 40, total: 70, estado: 'APROBADO' });
    // MAT-2 sin registro: sin notas y, al ser ABANDONO en la matriz, el estado lo refleja
    expect(datos.filas[1]).toEqual({ codigo: 'MAT-2', asignatura: 'Matemática II', teo: null, pra: null, total: null, estado: 'ABANDONO' });
    expect(datos.promedioClasePorParcial).toEqual({ total: 63 });
    expect(datos.observaciones).toEqual(['1º BIMESTRE: Buen inicio']);
    expect(fileNameParts.bimestre).toBe(1);
  });

  it('reprueba por debajo de la nota mínima y no emite estado con el bimestre abierto', () => {
    const d = [
      { oferta_curso_id: 10, tiene_registro: 1, nota_teorico: 20, nota_practico: 20, nota_efectiva: 40, estado_bimestre: 'CERRADO' },
      { oferta_curso_id: 20, tiene_registro: 1, cuaderno_teorico: 10, cuaderno_practico: 15, nota_efectiva: 25, estado_bimestre: 'ABIERTO' },
    ];
    const { datos } = construir({ matriz: matriz(), cabeceraRow, estudianteId: 1, bimestre: '1', desgloseBimestre: d });
    expect(datos.filas[0].estado).toBe('REPROBADO');
    // Bimestre abierto: nota del cuaderno como efectiva y sin estado
    expect(datos.filas[1]).toMatchObject({ teo: 10, pra: 15, total: 25, estado: '' });
  });

  it('sin desglose todas las notas del bimestre son null', () => {
    const { datos } = construir({ matriz: matriz(), cabeceraRow, estudianteId: 2, bimestre: 3 });
    expect(datos.filas.every((f) => f.teo === null && f.total === null)).toBe(true);
  });

  it('un bimestre fuera de 1..4 cae al boletín anual', () => {
    for (const bimestre of [0, 5, 'x', 1.5]) {
      const { datos } = construir({ matriz: matriz(), cabeceraRow, estudianteId: 1, bimestre });
      expect(datos.bimestre).toBeUndefined();
      expect(datos.filas[0]).toHaveProperty('par1');
    }
  });

  it('sin nota mínima configurada no emite aprobado/reprobado', () => {
    const m = matriz();
    delete m.notaMinimaAprobacion;
    const { datos } = construir({ matriz: m, cabeceraRow, estudianteId: 1, bimestre: 1, desgloseBimestre: desglose });
    expect(datos.filas[0].estado).toBe('');
  });
});
