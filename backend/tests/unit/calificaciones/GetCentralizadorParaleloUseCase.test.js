import { jest } from '@jest/globals';
import { GetCentralizadorParaleloUseCase } from '../../../src/application/use-cases/academico/GetCentralizadorParaleloUseCase.js';

const fila = (over = {}) => ({
  gestion_id: 1,
  gestion_anio: 2026,
  gestion_nombre: 'Gestión 2026',
  oferta_curso_id: 10,
  asignatura_sigla: 'MAT',
  asignatura_nombre: 'Matemática',
  asignatura_orden: 1,
  docente_nombre: 'Doc Uno',
  estudiante_id: 100,
  codigo_estudiante: 'E100',
  ci: '123',
  nombre_completo: 'Zeta Ana',
  bim1: 70,
  bim2: 70,
  bim3: 70,
  bim4: 70,
  promedio_anual: 70,
  nota_final: 70,
  estado: 'CURSANDO',
  ...over,
});

describe('GetCentralizadorParaleloUseCase', () => {
  const crear = (rows, extra = {}) => {
    const deps = {
      calificacionCentralizadorRepository: {
        listarFilasCentralizadorPorParaleloGestion: jest.fn().mockResolvedValue(rows),
      },
      calificacionContextoRepository: { obtenerContextoVigente: jest.fn() },
      evaluationConfigurationRepository: {
        findActiveRowByGestionId: jest.fn().mockResolvedValue(null),
      },
      logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
      ...extra,
    };
    return { deps, useCase: new GetCentralizadorParaleloUseCase(deps) };
  };

  it('exige el repositorio del centralizador y el logger', () => {
    expect(() => new GetCentralizadorParaleloUseCase({ logger: {} })).toThrow(
      'calificacionCentralizadorRepository es requerido'
    );
    expect(
      () => new GetCentralizadorParaleloUseCase({ calificacionCentralizadorRepository: {} })
    ).toThrow('logger es requerido');
  });

  it('sin filas devuelve estructura vacía con nota mínima por defecto', async () => {
    const { useCase, deps } = crear([]);
    const r = await useCase.execute({ paraleloGestionId: '5' });

    expect(
      deps.calificacionCentralizadorRepository.listarFilasCentralizadorPorParaleloGestion
    ).toHaveBeenCalledWith(5);
    expect(r).toEqual({
      paraleloGestionId: 5,
      gestionId: null,
      gestionAnio: null,
      gestionNombre: null,
      notaMinimaAprobacion: 61,
      libro: null,
      asignaturas: [],
      estudiantes: [],
    });
  });

  it('tolera que el repositorio devuelva algo que no es arreglo', async () => {
    const { useCase } = crear(null);
    const r = await useCase.execute({ paraleloGestionId: 5 });
    expect(r.estudiantes).toEqual([]);
  });

  it('pivota filas a matriz ordenando asignaturas por orden y estudiantes por nombre', async () => {
    const rows = [
      fila({ oferta_curso_id: 20, asignatura_orden: 2, asignatura_sigla: 'LEN' }),
      fila({ oferta_curso_id: 10, asignatura_orden: 1 }),
      fila({ estudiante_id: 101, nombre_completo: 'Alfa Beto' }),
    ];
    const { useCase, deps } = crear(rows);
    const r = await useCase.execute({ paraleloGestionId: 5 });

    expect(deps.evaluationConfigurationRepository.findActiveRowByGestionId).toHaveBeenCalledWith(1);
    expect(r.gestionId).toBe(1);
    expect(r.gestionAnio).toBe(2026);
    expect(r.gestionNombre).toBe('Gestión 2026');
    expect(r.asignaturas.map((a) => a.ofertaCursoId)).toEqual([10, 20]);
    expect(r.estudiantes.map((e) => e.nombreCompleto)).toEqual(['Alfa Beto', 'Zeta Ana']);
    expect(Object.keys(r.estudiantes[1].notas).map(Number).sort()).toEqual([10, 20]);
    expect(r.libro).toBeNull();
  });

  it('con 4 bimestres y nota >= mínima: gestión completa, notaAnual y APROBADO', async () => {
    const { useCase } = crear([fila()]);
    const r = await useCase.execute({ paraleloGestionId: 5 });
    const celda = r.estudiantes[0].notas[10];

    expect(celda).toMatchObject({
      bim1: 70,
      promedioAnual: 70,
      notaFinal: 70,
      notaAnual: 70,
      gestionCompleta: true,
      observacion: 'APROBADO',
      estado: 'CURSANDO',
    });
  });

  it('nota bajo el mínimo con gestión completa: REPROBADO', async () => {
    const { useCase } = crear([fila({ nota_final: 50 })]);
    const r = await useCase.execute({ paraleloGestionId: 5 });
    expect(r.estudiantes[0].notas[10].observacion).toBe('REPROBADO');
  });

  it('usa la nota mínima de la política de la gestión', async () => {
    const { useCase, deps } = crear([fila({ nota_final: 70 })]);
    deps.evaluationConfigurationRepository.findActiveRowByGestionId.mockResolvedValue({
      id: 1,
      valor: JSON.stringify({ notaMinimaAprobacion: 80 }),
    });
    const r = await useCase.execute({ paraleloGestionId: 5 });
    expect(r.notaMinimaAprobacion).toBe(80);
    expect(r.estudiantes[0].notas[10].observacion).toBe('REPROBADO');
  });

  it('gestión incompleta: notaAnual y observacion quedan null', async () => {
    const { useCase } = crear([fila({ bim4: null })]);
    const r = await useCase.execute({ paraleloGestionId: 5 });
    const celda = r.estudiantes[0].notas[10];
    expect(celda.gestionCompleta).toBe(false);
    expect(celda.notaAnual).toBeNull();
    expect(celda.observacion).toBeNull();
    expect(celda.bim4).toBeNull();
  });

  it('materia sin nota_final no emite veredicto aunque tenga 4 bimestres', async () => {
    const { useCase } = crear([fila({ nota_final: null })]);
    const r = await useCase.execute({ paraleloGestionId: 5 });
    expect(r.estudiantes[0].notas[10].observacion).toBeNull();
  });

  it('ABANDONO se expone aunque la gestión esté incompleta', async () => {
    const { useCase } = crear([
      fila({ estado: 'ABANDONO', bim2: null, bim3: null, bim4: null, nota_final: null }),
    ]);
    const r = await useCase.execute({ paraleloGestionId: 5 });
    expect(r.estudiantes[0].notas[10].observacion).toBe('ABANDONO');
  });

  it('agrega observacionesBimestre por estudiante si hay repositorio de bimestres', async () => {
    const subjectEnrollmentBimesterRepository = {
      listarObservacionesBimestrePorParaleloGestion: jest.fn().mockResolvedValue([
        { estudiante_id: 100, bimestre: 1, observacion: ' APROBADO/A ' },
        { estudiante_id: 100, bimestre: 3, observacion: '   ' },
        { estudiante_id: 100, bimestre: 'x', observacion: 'ignorada' },
      ]),
    };
    const { useCase } = crear(
      [fila(), fila({ estudiante_id: 101, nombre_completo: 'Otro' })],
      { subjectEnrollmentBimesterRepository }
    );
    const r = await useCase.execute({ paraleloGestionId: 5 });

    expect(
      subjectEnrollmentBimesterRepository.listarObservacionesBimestrePorParaleloGestion
    ).toHaveBeenCalledWith(5);
    const e100 = r.estudiantes.find((e) => e.estudianteId === 100);
    const e101 = r.estudiantes.find((e) => e.estudianteId === 101);
    expect(e100.observacionesBimestre).toEqual({ 1: 'APROBADO/A', 2: null, 3: null, 4: null });
    expect(e101.observacionesBimestre).toEqual({ 1: null, 2: null, 3: null, 4: null });
  });

  it('sin repositorio de bimestres no agrega observacionesBimestre', async () => {
    const { useCase } = crear([fila()]);
    const r = await useCase.execute({ paraleloGestionId: 5 });
    expect(r.estudiantes[0].observacionesBimestre).toBeUndefined();
  });

  it('con folios generados agrega libro y ubicación por estudiante', async () => {
    const libroRegistroViewRepository = {
      listarFoliosPorParaleloGestion: jest.fn().mockResolvedValue([
        { numero_folio: 3, numero_libro: 'L-1', codigo_registro: 'REG', libro_estado: 'ABIERTO' },
        { numero_folio: 7 },
      ]),
      listarUbicacionEstudiantesPorParaleloGestion: jest
        .fn()
        .mockResolvedValue([{ estudiante_id: 100, numero_folio: 3, numero_orden: 2 }]),
    };
    const { useCase } = crear([fila()], { libroRegistroViewRepository });
    const r = await useCase.execute({ paraleloGestionId: 5 });

    expect(libroRegistroViewRepository.listarFoliosPorParaleloGestion).toHaveBeenCalledWith(5);
    expect(libroRegistroViewRepository.listarUbicacionEstudiantesPorParaleloGestion)
      .toHaveBeenCalledWith(5);
    expect(r.libro).toEqual({
      numeroLibro: 'L-1',
      codigoRegistro: 'REG',
      folioDesde: 3,
      folioHasta: 7,
      estadoLibro: 'ABIERTO',
    });
    expect(r.estudiantes[0]).toMatchObject({ folioNumero: 3, numeroOrdenFolio: 2 });
  });

  it('paralelo sin folios: libro null y no consulta ubicaciones', async () => {
    const libroRegistroViewRepository = {
      listarFoliosPorParaleloGestion: jest.fn().mockResolvedValue([]),
      listarUbicacionEstudiantesPorParaleloGestion: jest.fn(),
    };
    const { useCase } = crear([fila()], { libroRegistroViewRepository });
    const r = await useCase.execute({ paraleloGestionId: 5 });
    expect(r.libro).toBeNull();
    expect(libroRegistroViewRepository.listarUbicacionEstudiantesPorParaleloGestion)
      .not.toHaveBeenCalled();
    expect(r.estudiantes[0].folioNumero).toBeNull();
  });
});
