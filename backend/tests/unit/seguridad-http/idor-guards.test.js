/**
 * Guards anti-IDOR (estudiante / docente / alcance del docente sobre estudiantes), sin BD:
 * el contenedor DI se sustituye por uno falso con repositorios simulados.
 */
import { describe, it, expect, jest } from '@jest/globals';
import { setAppContainer } from '../../../src/presentation/middleware/container-ref.js';
import { REPOSITORIOS_TOKENS } from '../../../src/infrastructure/container/tokens/index.js';
import { estudianteSelfOnlyGuard } from '../../../src/presentation/middleware/estudianteSelfOnly.middleware.js';
import {
  docenteSelfOnlyGuard,
  buildDocenteSelfOnlyGuard,
} from '../../../src/presentation/middleware/docenteSelfOnly.middleware.js';
import { estudianteAlcanceDocenteGuard } from '../../../src/presentation/middleware/estudianteAlcanceDocente.middleware.js';
import { ForbiddenError } from '../../../src/domain/errors/AppError.js';

/** Contenedor falso: `estudianteId` / `docenteId` definen quién es el usuario autenticado (o null = staff). */
function instalarContenedor({ estudianteId = null, docenteId = null, estudiantesDelDocente = [] } = {}) {
  const repos = {
    [REPOSITORIOS_TOKENS.studentRepository]: {
      findAll: jest.fn(async () => (estudianteId ? [{ id: estudianteId }] : [])),
      findById: jest.fn(async () => null),
    },
    [REPOSITORIOS_TOKENS.teacherRepository]: {
      findAll: jest.fn(async () => (docenteId ? [{ id: docenteId }] : [])),
      findById: jest.fn(async () => null),
      update: jest.fn(),
    },
    [REPOSITORIOS_TOKENS.userRepository]: { findById: jest.fn(async () => null) },
    [REPOSITORIOS_TOKENS.teacherAssignmentRepository]: {
      docenteTieneEstudianteVigente: jest.fn(async (_d, estId) => estudiantesDelDocente.includes(estId)),
    },
  };
  setAppContainer({ resolve: (token) => repos[token] });
  return repos;
}

/** Ejecuta el guard y devuelve el argumento con el que se llamó `next`. */
async function correr(guard, params) {
  const next = jest.fn();
  await guard({ usuario: { id: 50 }, params }, {}, next);
  expect(next).toHaveBeenCalledTimes(1);
  return next.mock.calls[0][0];
}

describe('estudianteSelfOnlyGuard (GET /estudiantes/:id)', () => {
  it('un estudiante puede ver su propia ficha', async () => {
    instalarContenedor({ estudianteId: 5 });
    expect(await correr(estudianteSelfOnlyGuard, { id: '5' })).toBeUndefined();
  });

  it.each(['6', '1', '0', '-5', '05x'])('un estudiante NO puede ver al estudiante %s', async (id) => {
    instalarContenedor({ estudianteId: 5 });
    expect(await correr(estudianteSelfOnlyGuard, { id })).toBeInstanceOf(ForbiddenError);
  });

  it('el staff sin vínculo de estudiante pasa sin restricción', async () => {
    instalarContenedor({ estudianteId: null });
    expect(await correr(estudianteSelfOnlyGuard, { id: '99' })).toBeUndefined();
  });

  it('un error de infraestructura no abre el acceso (se propaga, no hace next() limpio)', async () => {
    const repos = instalarContenedor({ estudianteId: 5 });
    repos[REPOSITORIOS_TOKENS.studentRepository].findAll.mockRejectedValue(new Error('BD caída'));
    const err = await correr(estudianteSelfOnlyGuard, { id: '6' });
    expect(err).toBeInstanceOf(Error);
  });
});

describe('docenteSelfOnlyGuard (GET /docentes/:id y /horarios/docentes/:docenteId)', () => {
  it('un docente puede ver su propio id', async () => {
    instalarContenedor({ docenteId: 3 });
    expect(await correr(docenteSelfOnlyGuard, { id: '3' })).toBeUndefined();
  });

  it('un docente NO puede ver a otro docente', async () => {
    instalarContenedor({ docenteId: 3 });
    expect(await correr(docenteSelfOnlyGuard, { id: '4' })).toBeInstanceOf(ForbiddenError);
  });

  it('la variante con parámetro docenteId también protege la grilla de otro docente', async () => {
    instalarContenedor({ docenteId: 3 });
    const guard = buildDocenteSelfOnlyGuard('docenteId');
    expect(await correr(guard, { docenteId: '3' })).toBeUndefined();
    expect(await correr(guard, { docenteId: '8' })).toBeInstanceOf(ForbiddenError);
  });

  it('el staff sin vínculo docente pasa sin restricción', async () => {
    instalarContenedor({ docenteId: null });
    expect(await correr(docenteSelfOnlyGuard, { id: '77' })).toBeUndefined();
  });
});

describe('estudianteAlcanceDocenteGuard (docente solo ve estudiantes de sus cursos)', () => {
  it('permite al docente ver un estudiante de sus cursos vigentes', async () => {
    instalarContenedor({ docenteId: 3, estudiantesDelDocente: [10] });
    expect(await correr(estudianteAlcanceDocenteGuard, { id: '10' })).toBeUndefined();
  });

  it('niega al docente ver un estudiante ajeno a sus cursos', async () => {
    const repos = instalarContenedor({ docenteId: 3, estudiantesDelDocente: [10] });
    expect(await correr(estudianteAlcanceDocenteGuard, { id: '11' })).toBeInstanceOf(ForbiddenError);
    expect(repos[REPOSITORIOS_TOKENS.teacherAssignmentRepository].docenteTieneEstudianteVigente).toHaveBeenCalledWith(
      3,
      11
    );
  });

  it('el staff sin vínculo docente pasa', async () => {
    instalarContenedor({ docenteId: null });
    expect(await correr(estudianteAlcanceDocenteGuard, { id: '11' })).toBeUndefined();
  });
});
