import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { setAppContainer } from '../../../../src/presentation/middleware/container-ref.js';
import { aporteSelfOnlyGuard } from '../../../../src/presentation/middleware/aporteSelfOnly.middleware.js';
import { becaSelfOnlyGuard } from '../../../../src/presentation/middleware/becaSelfOnly.middleware.js';
import { inscripcionSelfOnlyGuard } from '../../../../src/presentation/middleware/inscripcionSelfOnly.middleware.js';
import { estudianteSelfOnlyGuard } from '../../../../src/presentation/middleware/estudianteSelfOnly.middleware.js';
import { estudianteAlcanceDocenteGuard } from '../../../../src/presentation/middleware/estudianteAlcanceDocente.middleware.js';
import {
  docenteSelfOnlyGuard,
  buildDocenteSelfOnlyGuard,
} from '../../../../src/presentation/middleware/docenteSelfOnly.middleware.js';
import { proyectoGradoIntegranteGuard } from '../../../../src/presentation/middleware/proyectoGradoSelfOnly.middleware.js';
import { ForbiddenError } from '../../../../src/domain/errors/AppError.js';

/**
 * Guards anti-IDOR. Todos comparten el patrón: staff (sin vínculo de estudiante/docente) pasa;
 * quien tiene vínculo solo accede a lo suyo; recurso inexistente pasa (el controlador da 404).
 */

let repos;

const montarContenedor = () => {
  repos = {
    studentRepository: { findAll: jest.fn(), findById: jest.fn() },
    userRepository: { findById: jest.fn() },
    teacherRepository: { findAll: jest.fn(), findById: jest.fn() },
    contributionPaymentRepository: { findById: jest.fn() },
    studentScholarshipRepository: { findById: jest.fn() },
    enrollmentRepository: { findById: jest.fn() },
    studentAcademicDataRepository: { findById: jest.fn() },
    teacherAssignmentRepository: { docenteTieneEstudianteVigente: jest.fn() },
    proyectoGradoRepository: { findById: jest.fn() },
    integranteProyectoRepository: { findActivoByProyectoAndEstudiante: jest.fn() },
  };
  setAppContainer({ resolve: (token) => repos[token.replace('titulacion.', '')] });
};

/** El usuario es el estudiante 10 (vínculo por estudiantes.usuario_id). */
const comoEstudiante = (id = 10) => repos.studentRepository.findAll.mockResolvedValue({ students: [{ id }] });
/** El usuario no tiene vínculo de estudiante ni referencia polimórfica. */
const comoStaff = () => {
  repos.studentRepository.findAll.mockResolvedValue({ students: [] });
  repos.userRepository.findById.mockResolvedValue({ referenceType: null, referenceId: null });
  repos.teacherRepository.findAll.mockResolvedValue([]);
};

const ejecutar = async (guard, params = { id: '5' }) => {
  const next = jest.fn();
  await guard({ usuario: { id: 99 }, params }, {}, next);
  return next;
};

const pasa = (next) => {
  expect(next).toHaveBeenCalledTimes(1);
  expect(next).toHaveBeenCalledWith();
};
const prohibe = (next, mensaje) => {
  expect(next).toHaveBeenCalledTimes(1);
  const err = next.mock.calls[0][0];
  expect(err).toBeInstanceOf(ForbiddenError);
  if (mensaje) expect(err.message).toContain(mensaje);
};

beforeEach(montarContenedor);

describe('estudianteSelfOnlyGuard', () => {
  it('staff pasa sin restricción', async () => {
    comoStaff();
    pasa(await ejecutar(estudianteSelfOnlyGuard));
  });
  it('estudiante accede a su propia ficha', async () => {
    comoEstudiante(5);
    pasa(await ejecutar(estudianteSelfOnlyGuard, { id: '5' }));
  });
  it('estudiante no accede a la ficha de otro', async () => {
    comoEstudiante(10);
    prohibe(await ejecutar(estudianteSelfOnlyGuard, { id: '5' }), 'otro estudiante');
  });
  it('un error inesperado del repositorio llega a next', async () => {
    const boom = new Error('bd');
    repos.studentRepository.findAll.mockRejectedValue(boom);
    const next = await ejecutar(estudianteSelfOnlyGuard);
    expect(next).toHaveBeenCalledWith(boom);
  });
});

describe.each([
  ['aporteSelfOnlyGuard', aporteSelfOnlyGuard, 'contributionPaymentRepository', 'otro estudiante'],
  ['becaSelfOnlyGuard', becaSelfOnlyGuard, 'studentScholarshipRepository', 'otro estudiante'],
])('%s', (_n, guard, repoKey, msg) => {
  it('staff pasa sin consultar el recurso', async () => {
    comoStaff();
    pasa(await ejecutar(guard));
    expect(repos[repoKey].findById).not.toHaveBeenCalled();
  });
  it('recurso inexistente pasa (el controlador responderá 404)', async () => {
    comoEstudiante();
    repos[repoKey].findById.mockResolvedValue(null);
    pasa(await ejecutar(guard));
    expect(repos[repoKey].findById).toHaveBeenCalledWith(5);
  });
  it('el dueño accede (acepta studentId, estudianteId y estudiante_id, y toPlainObject)', async () => {
    comoEstudiante(10);
    for (const fila of [{ studentId: 10 }, { estudianteId: 10 }, { estudiante_id: 10 }, { toPlainObject: () => ({ studentId: 10 }) }]) {
      repos[repoKey].findById.mockResolvedValue(fila);
      pasa(await ejecutar(guard));
    }
  });
  it('otro estudiante recibe 403', async () => {
    comoEstudiante(10);
    repos[repoKey].findById.mockResolvedValue({ studentId: 11 });
    prohibe(await ejecutar(guard), msg);
  });
});

describe('inscripcionSelfOnlyGuard', () => {
  it('staff pasa', async () => {
    comoStaff();
    pasa(await ejecutar(inscripcionSelfOnlyGuard));
  });
  it('inscripción inexistente pasa', async () => {
    comoEstudiante();
    repos.enrollmentRepository.findById.mockResolvedValue(null);
    pasa(await ejecutar(inscripcionSelfOnlyGuard));
    expect(repos.enrollmentRepository.findById).toHaveBeenCalledWith(5, { attributes: ['id', 'datosAcademicosId'] });
  });
  it('resuelve al dueño por datos académicos y lo deja pasar', async () => {
    comoEstudiante(10);
    repos.enrollmentRepository.findById.mockResolvedValue({ datosAcademicosId: 77 });
    repos.studentAcademicDataRepository.findById.mockResolvedValue({ estudianteId: 10 });
    pasa(await ejecutar(inscripcionSelfOnlyGuard));
    expect(repos.studentAcademicDataRepository.findById).toHaveBeenCalledWith(77, { attributes: ['id', 'estudianteId'] });
  });
  it('otro dueño, datos académicos inexistentes o id inválido: 403', async () => {
    comoEstudiante(10);
    repos.enrollmentRepository.findById.mockResolvedValue({ academicDataId: 77 });
    repos.studentAcademicDataRepository.findById.mockResolvedValue({ studentId: 11 });
    prohibe(await ejecutar(inscripcionSelfOnlyGuard), 'otro estudiante');
    repos.studentAcademicDataRepository.findById.mockResolvedValue(null);
    prohibe(await ejecutar(inscripcionSelfOnlyGuard));
    repos.enrollmentRepository.findById.mockResolvedValue({ toPlainObject: () => ({ datos_academicos_id: 0 }) });
    prohibe(await ejecutar(inscripcionSelfOnlyGuard));
  });
});

describe('docenteSelfOnlyGuard', () => {
  const comoDocente = (id = 3) => {
    repos.teacherRepository.findAll.mockResolvedValue([{ id }]);
  };
  it('el docente accede a su propio id y a ningún otro', async () => {
    comoDocente(3);
    pasa(await ejecutar(docenteSelfOnlyGuard, { id: '3' }));
    prohibe(await ejecutar(docenteSelfOnlyGuard, { id: '4' }), 'otro docente');
  });
  it('usa el nombre de parámetro configurado', async () => {
    comoDocente(3);
    const guard = buildDocenteSelfOnlyGuard('docenteId');
    pasa(await ejecutar(guard, { docenteId: '3' }));
    prohibe(await ejecutar(guard, { docenteId: '9' }));
  });
  it('quien no es docente pasa', async () => {
    comoStaff();
    pasa(await ejecutar(docenteSelfOnlyGuard, { id: '4' }));
  });
});

describe('estudianteAlcanceDocenteGuard', () => {
  it('quien no es docente pasa', async () => {
    comoStaff();
    pasa(await ejecutar(estudianteAlcanceDocenteGuard));
    expect(repos.teacherAssignmentRepository.docenteTieneEstudianteVigente).not.toHaveBeenCalled();
  });
  it('docente con el estudiante en un curso vigente pasa', async () => {
    repos.teacherRepository.findAll.mockResolvedValue([{ id: 3 }]);
    repos.teacherAssignmentRepository.docenteTieneEstudianteVigente.mockResolvedValue(true);
    pasa(await ejecutar(estudianteAlcanceDocenteGuard, { id: '8' }));
    expect(repos.teacherAssignmentRepository.docenteTieneEstudianteVigente).toHaveBeenCalledWith(3, 8);
  });
  it('docente con estudiante ajeno a sus cursos: 403', async () => {
    repos.teacherRepository.findAll.mockResolvedValue([{ id: 3 }]);
    repos.teacherAssignmentRepository.docenteTieneEstudianteVigente.mockResolvedValue(false);
    prohibe(await ejecutar(estudianteAlcanceDocenteGuard, { id: '8' }), 'sus cursos');
  });
});

describe('proyectoGradoIntegranteGuard', () => {
  it('staff pasa', async () => {
    comoStaff();
    pasa(await ejecutar(proyectoGradoIntegranteGuard));
  });
  it('proyecto inexistente pasa', async () => {
    comoEstudiante();
    repos.proyectoGradoRepository.findById.mockResolvedValue(null);
    pasa(await ejecutar(proyectoGradoIntegranteGuard));
  });
  it('integrante activo pasa; no integrante recibe 403', async () => {
    comoEstudiante(10);
    repos.proyectoGradoRepository.findById.mockResolvedValue({ id: 5 });
    repos.integranteProyectoRepository.findActivoByProyectoAndEstudiante.mockResolvedValue({ id: 1 });
    pasa(await ejecutar(proyectoGradoIntegranteGuard));
    expect(repos.integranteProyectoRepository.findActivoByProyectoAndEstudiante).toHaveBeenCalledWith(5, 10);
    repos.integranteProyectoRepository.findActivoByProyectoAndEstudiante.mockResolvedValue(null);
    prohibe(await ejecutar(proyectoGradoIntegranteGuard), 'integrante activo');
  });
});
