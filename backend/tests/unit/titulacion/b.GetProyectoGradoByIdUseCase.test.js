import { describe, it, expect, jest } from '@jest/globals';
import { GetProyectoGradoByIdUseCase } from '../../../src/application/use-cases/titulacion/GetProyectoGradoByIdUseCase.js';
import { NotFoundError } from '../../../src/domain/errors/AppError.js';

describe('GetProyectoGradoByIdUseCase', () => {
  const entidad = {
    id: 10,
titulo: 'T',
estado: 'PERFIL',
descripcion: 'D',
gestionId: 2,
carreraId: 4,
    modalidadId: 6,
tutorId: 8,
notaFinal: 80,
activo: true,
  };
  const fila = {
    proyecto_grado_id: 10,
titulo: 'T vista',
proyecto_estado: 'DESARROLLO',
carrera_id: 44,
    modalidad_id: null,
tutor_id: 88,
  };

  const crear = ({ row = fila, entity = entidad, integrantes = [] } = {}) => {
    const deps = {
      proyectoGradoListadoViewRepository: {
        findListadoById: jest.fn().mockResolvedValue(row),
        findIntegrantesByProyectoId: jest.fn().mockResolvedValue(integrantes),
      },
      proyectoGradoRepository: { findById: jest.fn().mockResolvedValue(entity) },
      logger: { info: jest.fn() },
    };
    return { deps, useCase: new GetProyectoGradoByIdUseCase(deps) };
  };

  it('combina la fila de la vista, la entidad raíz y los integrantes', async () => {
    const { useCase, deps } = crear({
      integrantes: [{ integrante_proyecto_id: 1, proyecto_grado_id: 10, estudiante_id: 3, integrante_rol: 'TITULAR' }],
    });
    const r = await useCase.execute(10);

    expect(deps.proyectoGradoListadoViewRepository.findListadoById).toHaveBeenCalledWith(10);
    expect(deps.proyectoGradoRepository.findById).toHaveBeenCalledWith(10);
    expect(deps.proyectoGradoListadoViewRepository.findIntegrantesByProyectoId).toHaveBeenCalledWith(10);
    expect(r.titulo).toBe('T vista');
    expect(r.estado).toBe('DESARROLLO');
    expect(r.descripcion).toBe('D');
    expect(r.notaFinal).toBe(80);
    expect(r.carreraId).toBe(44); // la vista prevalece
    expect(r.modalidadId).toBe(6); // null en vista -> cae a la entidad
    expect(r.tutorId).toBe(88);
    expect(r.integrantes).toEqual([
      expect.objectContaining({ id: 1, estudianteId: 3, rol: 'TITULAR' }),
    ]);
  });

  it('si el proyecto no está en la vista degrada a la entidad raíz', async () => {
    const { useCase } = crear({ row: null });
    const r = await useCase.execute(10);
    expect(r).toEqual(expect.objectContaining({
      id: 10, titulo: 'T', estado: 'PERFIL', carreraId: 4, modalidadId: 6, tutorId: 8,
    }));
    expect(r.integrantes).toEqual([]);
  });

  it('proyecto inexistente -> NotFoundError y no consulta integrantes', async () => {
    const { useCase, deps } = crear({ entity: null });
    await expect(useCase.execute(99)).rejects.toThrow(NotFoundError);
    expect(deps.proyectoGradoListadoViewRepository.findIntegrantesByProyectoId).not.toHaveBeenCalled();
  });

  it('id no numérico (NaN) cuya entidad no existe -> NotFoundError', async () => {
    const { useCase, deps } = crear({ entity: null, row: null });
    await expect(useCase.execute(Number('abc'))).rejects.toThrow(NotFoundError);
    expect(deps.proyectoGradoRepository.findById).toHaveBeenCalledWith(NaN);
  });
});
