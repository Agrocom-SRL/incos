import { jest } from '@jest/globals';
import { ListCoordinacionCalificacionesDocentesUseCase } from '../../../src/application/use-cases/academico/ListCoordinacionCalificacionesDocentesUseCase.js';

describe('ListCoordinacionCalificacionesDocentesUseCase', () => {
  const filas = [
    {
      docente_id: 1,
      docente_nombre: 'Ana Pérez',
      docente_especialidad: 'Redes',
      cantidad_cursos: '3',
      cantidad_materias: '2',
      cantidad_estudiantes: '40',
      carreras_detalle: 'Sistemas:::#112233|||Contaduría:::|||  :::#fff',
    },
    { docente_id: 2, carreras_detalle: null },
  ];

  const crear = (ctx = { gestion_nombre: '2026' }) => {
    const deps = {
      calificacionContextoRepository: {
        obtenerContextoVigente: jest.fn().mockResolvedValue(ctx),
      },
      calificacionCoordinacionRepository: {
        listarDocentesCoordinacion: jest.fn().mockResolvedValue(filas),
      },
      logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
    };
    return { deps, useCase: new ListCoordinacionCalificacionesDocentesUseCase(deps) };
  };

  it('mapea docentes, números y carreras con color', async () => {
    const { useCase } = crear();
    const result = await useCase.execute({ q: 'ana' });

    expect(result.gestionVigente).toBe('2026');
    expect(result.docentes[0]).toEqual({
      id: 1,
      nombre: 'Ana Pérez',
      especialidad: 'Redes',
      cantidadCursos: 3,
      cantidadMaterias: 2,
      cantidadEstudiantes: 40,
      carreras: [
        { nombre: 'Sistemas', colorHex: '#112233' },
        { nombre: 'Contaduría', colorHex: null },
      ],
    });
    expect(result.docentes[1]).toEqual({
      id: 2,
      nombre: '',
      especialidad: null,
      cantidadCursos: 0,
      cantidadMaterias: 0,
      cantidadEstudiantes: 0,
      carreras: [],
    });
  });

  it('busca con el término recortado cuando tiene al menos 2 caracteres', async () => {
    const { useCase, deps } = crear();
    await useCase.execute({ q: '  ana ', limit: 10 });
    expect(deps.calificacionCoordinacionRepository.listarDocentesCoordinacion)
      .toHaveBeenCalledWith({ q: 'ana', limit: 10 });
  });

  it.each([[undefined], [''], ['a'], [' b ']])(
    'usa el listado preliminar si la búsqueda es corta (%j)',
    async (q) => {
      const { useCase, deps } = crear();
      await useCase.execute({ q });
      expect(deps.calificacionCoordinacionRepository.listarDocentesCoordinacion)
        .toHaveBeenCalledWith({ preliminar: true, limit: 50 });
    },
  );

  it('con preliminar=true ignora q', async () => {
    const { useCase, deps } = crear();
    await useCase.execute({ q: 'ana', preliminar: true, limit: 5 });
    expect(deps.calificacionCoordinacionRepository.listarDocentesCoordinacion)
      .toHaveBeenCalledWith({ preliminar: true, limit: 5 });
  });

  it('usa el año de la gestión si no hay nombre, y null sin contexto', async () => {
    const a = crear({ gestion_anio: 2025 });
    expect((await a.useCase.execute({})).gestionVigente).toBe('2025');
    const b = crear(null);
    expect((await b.useCase.execute({})).gestionVigente).toBeNull();
  });

  it('exige sus dependencias en el constructor', () => {
    const base = crear().deps;
    expect(() => new ListCoordinacionCalificacionesDocentesUseCase({ ...base, calificacionContextoRepository: null })).toThrow();
    expect(() => new ListCoordinacionCalificacionesDocentesUseCase({ ...base, calificacionCoordinacionRepository: null })).toThrow();
    expect(() => new ListCoordinacionCalificacionesDocentesUseCase({ ...base, logger: null })).toThrow();
  });
});
