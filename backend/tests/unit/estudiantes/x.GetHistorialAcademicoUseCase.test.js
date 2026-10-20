import { jest } from '@jest/globals';
import { GetHistorialAcademicoUseCase } from '../../../src/application/use-cases/estudiantes/GetHistorialAcademicoUseCase.js';
import { NotFoundError, ValidationError } from '../../../src/domain/errors/AppError.js';

describe('GetHistorialAcademicoUseCase', () => {
  const cabecera = { estudiante_id: 5, matricula: 'E-5', apellido_paterno: 'Lopez', nombres: 'Ana', gestion_ingreso_anio: '2024' };
  const filas = [
    { asignatura_sigla: 'A1', carga_horaria: 100, nota_final: 80, estado: 'APROBADO' },
    { asignatura_sigla: 'A2', carga_horaria: 50, nota_final: 61, estado: 'CONVALIDADO' },
    { asignatura_sigla: 'A3', carga_horaria: 70, nota_final: 20, estado: 'REPROBADO' },
  ];
  const crear = ({ cab = cabecera, rows = filas } = {}) => {
    const deps = {
      historialAcademicoRepository: {
        obtenerCabeceraEstudiante: jest.fn().mockResolvedValue(cab),
        listarFilasHistorialPorEstudiante: jest.fn().mockResolvedValue(rows),
      },
      logger: { info: jest.fn() },
    };
    return { deps, useCase: new GetHistorialAcademicoUseCase(deps) };
  };

  it('exige dependencias', () => {
    expect(() => new GetHistorialAcademicoUseCase({ logger: {} })).toThrow();
    expect(() => new GetHistorialAcademicoUseCase({ historialAcademicoRepository: {} })).toThrow();
  });

  it('devuelve cabecera, filas numeradas y resumen solo con aprobadas/convalidadas', async () => {
    const { useCase, deps } = crear();
    const res = await useCase.execute({ estudianteId: '5' });

    expect(deps.historialAcademicoRepository.obtenerCabeceraEstudiante).toHaveBeenCalledWith(5);
    expect(deps.historialAcademicoRepository.listarFilasHistorialPorEstudiante).toHaveBeenCalledWith(5);
    expect(res.estudiante).toEqual(expect.objectContaining({ estudianteId: 5, nombreCompleto: 'Lopez Ana', fechaAdmision: 2024 }));
    expect(res.filas.map((f) => f.nro)).toEqual([1, 2, 3]);
    expect(res.resumen).toEqual({
      totalCargaHoraria: 150,
      asignaturasAprobadas: 2,
      asignaturasTotal: 3,
      promedioGeneral: 71,
    });
  });

  it('sin filas aprobadas el promedio es null', async () => {
    const { useCase } = crear({ rows: [filas[2]] });
    const res = await useCase.execute({ estudianteId: 5 });
    expect(res.resumen).toEqual({ totalCargaHoraria: 0, asignaturasAprobadas: 0, asignaturasTotal: 1, promedioGeneral: null });
  });

  it('filas no-array se tratan como vacías', async () => {
    const { useCase } = crear({ rows: null });
    const res = await useCase.execute({ estudianteId: 5 });
    expect(res.filas).toEqual([]);
  });

  it.each([[NaN], ['abc'], [0], [-3], [undefined], [null]])(
    'estudianteId inválido (%p) lanza ValidationError sin consultar',
    async (valor) => {
      const { useCase, deps } = crear();
      await expect(useCase.execute({ estudianteId: valor })).rejects.toThrow(ValidationError);
      expect(deps.historialAcademicoRepository.obtenerCabeceraEstudiante).not.toHaveBeenCalled();
    }
  );

  it('lanza NotFoundError si no hay cabecera', async () => {
    const { useCase } = crear({ cab: null });
    await expect(useCase.execute({ estudianteId: 77 })).rejects.toThrow(NotFoundError);
  });
});
