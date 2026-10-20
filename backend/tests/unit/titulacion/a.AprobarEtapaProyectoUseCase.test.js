import { describe, it, expect, jest } from '@jest/globals';
import { AprobarEtapaProyectoUseCase } from '../../../src/application/use-cases/titulacion/AprobarEtapaProyectoUseCase.js';
import {
  ConflictError,
  NotFoundError,
  ValidationError,
} from '../../../src/domain/errors/AppError.js';

describe('AprobarEtapaProyectoUseCase', () => {
  const crear = (proyecto = { id: 5, estado: 'PERFIL', titulo: 'T', gestionId: 2 }) => {
    const deps = {
      proyectoGradoRepository: {
        findById: jest.fn().mockResolvedValue(proyecto),
        update: jest.fn().mockImplementation(async (id, data) => ({ ...proyecto, ...data })),
      },
      proyectoGradoListadoViewRepository: {
        findListadoById: jest.fn().mockResolvedValue({ modalidad_nombre: 'Tesis' }),
        findIntegrantesByProyectoId: jest.fn().mockResolvedValue([
          { integrante_proyecto_id: 1, integrante_rol: 'TITULAR', estudiante_id: 9, estudiante_nombre: 'Luis' },
        ]),
      },
      dictamenProyectoRepository: { create: jest.fn().mockResolvedValue({ id: 1 }) },
      bitacoraProyectoRepository: { create: jest.fn().mockResolvedValue({ id: 2 }) },
      managementRepository: { findById: jest.fn().mockResolvedValue({ year: 2026 }) },
      studentRepository: {
        findById: jest.fn().mockResolvedValue({ firstName: 'Luis', lastName: 'Paz', ci: '1' }),
      },
      viabilidadProyectoPdfGenerator: { generate: jest.fn().mockResolvedValue(Buffer.from('v')) },
      informeSuficienciaPdfGenerator: { generate: jest.fn().mockResolvedValue(Buffer.from('s')) },
      uploadsStorage: {
        saveToUploads: jest.fn().mockReturnValue({ fileName: 'f.pdf', absolutePath: '/u/f.pdf' }),
      },
      logger: { info: jest.fn() },
    };
    return { deps, useCase: new AprobarEtapaProyectoUseCase(deps) };
  };

  const informe = {
    aspectosFormato: 'a',
    contenidoProyecto: 'b',
    procesoTutoria: 'c',
    resultadoSuficiencia: 'APROBADO',
  };

  it('transiciona PERFIL a APROBADO_PERFIL con fecha, nota y bitácora automática', async () => {
    const { deps, useCase } = crear();
    const result = await useCase.execute(
      5,
      { estado: 'APROBADO_PERFIL', fecha: '2026-09-01', nota: '75', observaciones: 'bien' },
      3
    );

    expect(deps.proyectoGradoRepository.update).toHaveBeenCalledWith(
      5,
      {
        estado: 'APROBADO_PERFIL',
        fechaAprobacionPerfil: '2026-09-01',
        notaPerfil: 75,
        observacionesComite: 'bien',
      },
      3
    );
    expect(result.proyectoGrado.estado).toBe('APROBADO_PERFIL');
    expect(deps.bitacoraProyectoRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        proyectoGradoId: 5,
        actividad: 'Transición de etapa: PERFIL → APROBADO_PERFIL',
        estado: 'SUBSANADO',
        confirmadoEstudiante: true,
        fechaConfirmacion: '2026-09-01',
      }),
      3
    );
    expect(deps.dictamenProyectoRepository.create).not.toHaveBeenCalled();
    expect(deps.viabilidadProyectoPdfGenerator.generate).not.toHaveBeenCalled();
    expect(deps.logger.info).toHaveBeenCalled();
  });

  it('no incluye nota ni observaciones si no llegan', async () => {
    const { deps, useCase } = crear();
    await useCase.execute(5, { estado: 'APROBADO_PERFIL', fecha: '2026-09-01' });
    expect(deps.proyectoGradoRepository.update).toHaveBeenCalledWith(
      5,
      { estado: 'APROBADO_PERFIL', fechaAprobacionPerfil: '2026-09-01' },
      null
    );
  });

  it('permite CANCELAR sin campo de fecha ni nota', async () => {
    const { deps, useCase } = crear();
    await useCase.execute(5, { estado: 'CANCELADO', nota: 10, fecha: '2026-09-01' });
    expect(deps.proyectoGradoRepository.update).toHaveBeenCalledWith(
      5,
      { estado: 'CANCELADO' },
      null
    );
  });

  it('DEFENSA a APROBADO guarda nota final y emite informe de viabilidad con PDF', async () => {
    const { deps, useCase } = crear({ id: 5, estado: 'DEFENSA', titulo: 'T', gestionId: 2 });
    await useCase.execute(5, { estado: 'APROBADO', nota: 88, fecha: '2026-10-01', numeroInforme: 'V-1' }, 3);

    expect(deps.proyectoGradoRepository.update).toHaveBeenCalledWith(
      5,
      expect.objectContaining({
        estado: 'APROBADO', fechaAprobacion: '2026-10-01', notaDefensa: 88, notaFinal: 88,
      }),
      3
    );
    expect(deps.viabilidadProyectoPdfGenerator.generate).toHaveBeenCalledWith(
      expect.objectContaining({
        resultado: 'APROBADO',
        numeroInforme: 'V-1',
        fechaEmision: '2026-10-01',
        destinatario: 'Dirección Académica',
      })
    );
    expect(deps.dictamenProyectoRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        proyectoGradoId: 5, tipo: 'VIABILIDAD_TECNICA', resultado: null, rutaArchivo: '/u/f.pdf',
      }),
      3,
      {}
    );
  });

  it('REPROBADO guarda nota de defensa sin nota final ni informe de viabilidad', async () => {
    const { deps, useCase } = crear({ id: 5, estado: 'DEFENSA', titulo: 'T' });
    await useCase.execute(5, { estado: 'REPROBADO', nota: 40, fecha: '2026-10-01' });
    const data = deps.proyectoGradoRepository.update.mock.calls[0][1];
    expect(data.notaDefensa).toBe(40);
    expect(data).not.toHaveProperty('notaFinal');
    expect(deps.viabilidadProyectoPdfGenerator.generate).not.toHaveBeenCalled();
  });

  it('exención de defensa: nota final = nota de predefensa (> 90)', async () => {
    const { deps, useCase } = crear({
      id: 5, estado: 'APROBADO_PREDEFENSA', notaPredefensa: '95', titulo: 'T',
    });
    await useCase.execute(5, { estado: 'APROBADO', fecha: '2026-10-01' });
    expect(deps.proyectoGradoRepository.update).toHaveBeenCalledWith(
      5,
      expect.objectContaining({ estado: 'APROBADO', notaFinal: 95 }),
      null
    );
  });

  it.each([[90], [60], [null], [undefined]])(
    'rechaza la exención de defensa con nota de predefensa %p',
    async (notaPredefensa) => {
      const { deps, useCase } = crear({ id: 5, estado: 'APROBADO_PREDEFENSA', notaPredefensa });
      await expect(useCase.execute(5, { estado: 'APROBADO' })).rejects
        .toBeInstanceOf(ConflictError);
      expect(deps.proyectoGradoRepository.update).not.toHaveBeenCalled();
    }
  );

  it('DESARROLLO a SUFICIENCIA emite el informe de suficiencia del tutor', async () => {
    const { deps, useCase } = crear({ id: 5, estado: 'DESARROLLO', titulo: 'T', gestionId: 2 });
    await useCase.execute(5, { estado: 'SUFICIENCIA', fecha: '2026-10-01', ...informe }, 3);

    expect(deps.informeSuficienciaPdfGenerator.generate).toHaveBeenCalledWith(
      expect.objectContaining({
        aspectosFormato: 'a',
        resultadoSuficiencia: 'APROBADO',
        estudiante: expect.objectContaining({ nombres: 'Luis', ci: '1' }),
      })
    );
    expect(deps.studentRepository.findById).toHaveBeenCalledWith(9);
    expect(deps.dictamenProyectoRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ tipo: 'INFORME_SUFICIENCIA', resultado: 'APROBADO' }),
      3,
      {}
    );
  });

  it.each([['aspectosFormato'], ['contenidoProyecto'], ['procesoTutoria'], ['resultadoSuficiencia']])(
    'SUFICIENCIA exige %s',
    async (campo) => {
      const { deps, useCase } = crear({ id: 5, estado: 'DESARROLLO' });
      await expect(
        useCase.execute(5, { estado: 'SUFICIENCIA', ...informe, [campo]: '  ' })
      ).rejects.toBeInstanceOf(ValidationError);
      expect(deps.proyectoGradoRepository.update).not.toHaveBeenCalled();
    }
  );

  it('SUFICIENCIA rechaza un resultado fuera de APROBADO/NO_APROBADO', async () => {
    const { useCase } = crear({ id: 5, estado: 'DESARROLLO' });
    await expect(
      useCase.execute(5, { estado: 'SUFICIENCIA', ...informe, resultadoSuficiencia: 'TAL_VEZ' })
    ).rejects.toBeInstanceOf(ValidationError);
  });

  it.each([[undefined], [null], ['']])('rechaza estado destino %p', async (estado) => {
    const { deps, useCase } = crear();
    await expect(useCase.execute(5, { estado })).rejects.toBeInstanceOf(ValidationError);
    expect(deps.proyectoGradoRepository.findById).not.toHaveBeenCalled();
  });

  it('rechaza body ausente', async () => {
    const { useCase } = crear();
    await expect(useCase.execute(5)).rejects.toBeInstanceOf(ValidationError);
  });

  it('lanza NotFoundError si el proyecto no existe', async () => {
    const { useCase } = crear(null);
    await expect(useCase.execute(5, { estado: 'APROBADO_PERFIL' })).rejects
      .toBeInstanceOf(NotFoundError);
  });

  it('rechaza transiciones fuera de la máquina de estados', async () => {
    const { deps, useCase } = crear();
    await expect(useCase.execute(5, { estado: 'DEFENSA' })).rejects.toBeInstanceOf(ConflictError);
    expect(deps.proyectoGradoRepository.update).not.toHaveBeenCalled();
    expect(deps.bitacoraProyectoRepository.create).not.toHaveBeenCalled();
  });

  it.each([['APROBADO'], ['REPROBADO'], ['CANCELADO']])(
    'no permite salir del estado final %s',
    async (estado) => {
      const { useCase } = crear({ id: 5, estado });
      await expect(useCase.execute(5, { estado: 'PERFIL' })).rejects.toBeInstanceOf(ConflictError);
    }
  );

  it('rechaza un estado destino desconocido', async () => {
    const { useCase } = crear();
    await expect(useCase.execute(5, { estado: 'INVENTADO' })).rejects.toBeInstanceOf(ConflictError);
  });
});
