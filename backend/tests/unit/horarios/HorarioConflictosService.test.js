import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { HorarioConflictosService } from '../../../src/application/services/horarios/HorarioConflictosService.js';
import { GrillaHorarioPresentationMapper } from '../../../src/application/mappers/horarios/GrillaHorarioPresentationMapper.js';

const crear = () => {
  const deps = {
    grillaBloqueViewRepository: { findByAssignmentAndHorario: jest.fn().mockResolvedValue(null), findOtherAssignmentAtHorario: jest.fn().mockResolvedValue(null) },
    conflictoParaleloBloqueViewRepository: { findByParaleloGestionId: jest.fn().mockResolvedValue([]) },
    conflictoAulaBloqueViewRepository: { findByParaleloGestionId: jest.fn().mockResolvedValue([]) },
    conflictoDocenteBloqueViewRepository: { findByParaleloGestionId: jest.fn().mockResolvedValue([]) },
    teacherAssignmentRepository: { findEnrichedById: jest.fn().mockResolvedValue({ vigente: true, paralelo_gestion_id: 9 }) },
    parallelManagementRepository: { findById: jest.fn().mockResolvedValue({ id: 9, classroomId: 4 }) },
  };
  return { deps, service: new HorarioConflictosService(deps) };
};

describe('HorarioConflictosService.listarConflictosParaleloGestion', () => {
  it('consulta las tres vistas del paralelo y delega la presentación al mapper', async () => {
    const { deps, service } = crear();
    const paralelo = [{ horarioId: 1 }];
    deps.conflictoParaleloBloqueViewRepository.findByParaleloGestionId.mockResolvedValue(paralelo);
    const r = await service.listarConflictosParaleloGestion('9');
    for (const repo of [deps.conflictoParaleloBloqueViewRepository, deps.conflictoAulaBloqueViewRepository, deps.conflictoDocenteBloqueViewRepository]) {
      expect(repo.findByParaleloGestionId).toHaveBeenCalledWith(9);
    }
    expect(r).toEqual(
      GrillaHorarioPresentationMapper.toPresentation({
        paraleloGestionId: 9,
        turno: null,
        bloques: [],
        coberturaRows: [],
        conflictosParalelo: paralelo,
        conflictosAula: [],
        conflictosDocente: [],
      }).conflictos
    );
  });
});

describe('HorarioConflictosService.validarPropuesta', () => {
  let deps;
  let service;
  beforeEach(() => {
    ({ deps, service } = crear());
  });

  const validacion = (mensaje) => ({ valido: false, conflictos: [{ tipo: 'VALIDACION', mensaje }] });

  it('rechaza una asignación docente inexistente o no vigente', async () => {
    deps.teacherAssignmentRepository.findEnrichedById.mockResolvedValue(null);
    expect(await service.validarPropuesta({ asignacionDocenteId: 1, horarioId: 2 })).toEqual(validacion('Asignación docente no vigente'));
    deps.teacherAssignmentRepository.findEnrichedById.mockResolvedValue({ vigente: false });
    expect(await service.validarPropuesta({ asignacionDocenteId: 1, horarioId: 2 })).toEqual(validacion('Asignación docente no vigente'));
  });

  it('rechaza un paralelo en gestión inexistente', async () => {
    deps.parallelManagementRepository.findById.mockResolvedValue(null);
    expect(await service.validarPropuesta({ asignacionDocenteId: 1, horarioId: 2 })).toEqual(validacion('Paralelo en gestión no encontrado'));
    expect(deps.parallelManagementRepository.findById).toHaveBeenCalledWith(9);
  });

  it('rechaza un horario_id inválido sin consultar la grilla', async () => {
    for (const horarioId of [0, -1, 'x', null]) {
      expect(await service.validarPropuesta({ asignacionDocenteId: 1, horarioId })).toEqual(validacion('horario_id inválido'));
    }
    expect(deps.grillaBloqueViewRepository.findByAssignmentAndHorario).not.toHaveBeenCalled();
  });

  it('sin conflictos devuelve válido y excluye los bloques indicados (sin duplicados ni inválidos)', async () => {
    const r = await service.validarPropuesta({
      asignacionDocenteId: 1,
      horarioId: 2,
      excludeAsignacionHorarioId: 5,
      excludeAsignacionHorarioIds: [5, 6, 0, 'x', -3],
    });
    expect(r).toEqual({ valido: true, conflictos: [] });
    expect(deps.grillaBloqueViewRepository.findByAssignmentAndHorario).toHaveBeenCalledWith({
      asignacionDocenteId: 1,
      horarioId: 2,
      excludeAsignacionHorarioIds: [5, 6],
    });
    expect(deps.grillaBloqueViewRepository.findOtherAssignmentAtHorario).toHaveBeenCalledWith({
      paraleloGestionId: 9,
      horarioId: 2,
      asignacionDocenteId: 1,
      excludeAsignacionHorarioIds: [5, 6],
    });
  });

  it('detecta bloque duplicado de la misma asignación', async () => {
    deps.grillaBloqueViewRepository.findByAssignmentAndHorario.mockResolvedValue({ id: 1 });
    const r = await service.validarPropuesta({ asignacionDocenteId: 1, horarioId: 2 });
    expect(r.valido).toBe(false);
    expect(r.conflictos).toEqual([
      { tipo: 'VALIDACION', horario_id: 2, asignaciones_involucradas: [1], mensaje: 'La asignación ya tiene un bloque en ese horario' },
    ]);
  });

  it('detecta otra materia del paralelo en el mismo bloque', async () => {
    deps.grillaBloqueViewRepository.findOtherAssignmentAtHorario.mockResolvedValue(77);
    const r = await service.validarPropuesta({ asignacionDocenteId: 1, horarioId: 2 });
    expect(r.conflictos).toEqual([
      expect.objectContaining({ tipo: 'PARALELO', asignaciones_involucradas: [1, 77] }),
    ]);
  });

  it('detecta conflicto de aula solo si coincide horario y aula efectiva y hay otras asignaciones', async () => {
    deps.conflictoAulaBloqueViewRepository.findByParaleloGestionId.mockResolvedValue([
      { horarioId: 3, aulaId: 4, asignacionIds: '1,8' },
      { horarioId: 2, aulaId: 99, asignacionIds: '1,8' },
      { horarioId: 2, aulaId: 4, asignacionIds: '1' },
      { horarioId: 2, aulaId: 4, asignacionIds: '1, 8,x,9' },
    ]);
    const r = await service.validarPropuesta({ asignacionDocenteId: 1, horarioId: 2 });
    expect(r.conflictos).toEqual([
      expect.objectContaining({ tipo: 'AULA', aula_id: 4, asignaciones_involucradas: [1, 8, 9] }),
    ]);
  });

  it('usa aulaId si el paralelo no tiene classroomId y omite el control si no hay aula', async () => {
    deps.parallelManagementRepository.findById.mockResolvedValue({ id: 9, aulaId: 6 });
    deps.conflictoAulaBloqueViewRepository.findByParaleloGestionId.mockResolvedValue([{ horarioId: 2, aulaId: 6, asignacionIds: '1,2' }]);
    expect((await service.validarPropuesta({ asignacionDocenteId: 1, horarioId: 2 })).conflictos[0].aula_id).toBe(6);

    deps.parallelManagementRepository.findById.mockResolvedValue({ id: 9 });
    deps.conflictoAulaBloqueViewRepository.findByParaleloGestionId.mockClear();
    const r = await service.validarPropuesta({ asignacionDocenteId: 1, horarioId: 2 });
    expect(deps.conflictoAulaBloqueViewRepository.findByParaleloGestionId).not.toHaveBeenCalled();
    expect(r.valido).toBe(true);
  });

  it('detecta docente con dos materias en el mismo bloque, en cualquiera de los dos lados del par', async () => {
    deps.conflictoDocenteBloqueViewRepository.findByParaleloGestionId.mockResolvedValue([
      { horarioId: 9, asignacionId1: 1, asignacionId2: 5, docenteNombre: 'Otro' },
      { horarioId: 2, asignacionId1: 7, asignacionId2: 8, docenteNombre: 'Ajeno' },
      { horarioId: 2, asignacionId1: 5, asignacionId2: 1, docenteNombre: ' Ana Paz ' },
    ]);
    const r = await service.validarPropuesta({ asignacionDocenteId: 1, horarioId: 2 });
    expect(r.conflictos).toEqual([
      { tipo: 'DOCENTE', horario_id: 2, asignaciones_involucradas: [1, 5], mensaje: 'Ana Paz tiene dos materias en el mismo bloque horario' },
    ]);
    deps.conflictoDocenteBloqueViewRepository.findByParaleloGestionId.mockResolvedValue([{ horarioId: 2, asignacionId1: 1, asignacionId2: 6 }]);
    expect((await service.validarPropuesta({ asignacionDocenteId: 1, horarioId: 2 })).conflictos[0].mensaje).toMatch(/^Docente tiene/);
  });

  it('acumula varios tipos de conflicto', async () => {
    deps.grillaBloqueViewRepository.findByAssignmentAndHorario.mockResolvedValue({ id: 1 });
    deps.grillaBloqueViewRepository.findOtherAssignmentAtHorario.mockResolvedValue(3);
    const r = await service.validarPropuesta({ asignacionDocenteId: 1, horarioId: 2 });
    expect(r.conflictos.map((c) => c.tipo)).toEqual(['VALIDACION', 'PARALELO']);
    expect(r.valido).toBe(false);
  });
});
