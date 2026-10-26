import { describe, it, expect } from '@jest/globals';
import * as v from '../../../../src/presentation/validators/titulacion/index.js';
import {
  ESTADOS_PROYECTO_GRADO_VALUES,
  ROLES_INTEGRANTE_TUTORIA_VALUES,
  ESTADOS_INTEGRANTE_TUTORIA_VALUES,
  TIPOS_BITACORA_TUTORIA_VALUES,
  ESTADOS_BITACORA_TUTORIA_VALUES,
  ESTADOS_REVISION_AVANCE_VALUES,
  TRIBUNAL_ACTA_DEFENSA_MIEMBROS,
  RESULTADOS_DICTAMEN_TUTORIA,
} from '../../../../src/domain/constants/titulacion.constants.js';
import { camposInvalidos } from '../_helpers/controllerHarness.js';

const XSS = '<script>alert(document.cookie)</script>';
const SQLI = "1; DROP TABLE proyectos_grado;--";

describe('ids de ruta anidados', () => {
  it.each([
    ['integranteIdValidator', 'integranteId'],
    ['entradaIdValidator', 'entradaId'],
    ['avanceIdValidator', 'avanceId'],
    ['dictamenIdValidator', 'dictamenId'],
    ['actaIdValidator', 'actaId'],
  ])('%s', async (nombre, param) => {
    expect(await camposInvalidos(v[nombre], { params: { [param]: '12' } })).toEqual([]);
    for (const malo of [undefined, '0', '-1', 'x', SQLI, '2.5']) {
      expect(await camposInvalidos(v[nombre], { params: malo === undefined ? {} : { [param]: malo } })).toContain(param);
    }
  });
});

describe('consultas', () => {
  it('listProyectosGradoValidator', async () => {
    expect(await camposInvalidos(v.listProyectosGradoValidator, { query: {} })).toEqual([]);
    expect(
      await camposInvalidos(v.listProyectosGradoValidator, {
        query: { gestionId: '1', carreraId: '2', modalidadId: '3', tutorId: '4', estado: ESTADOS_PROYECTO_GRADO_VALUES[0] },
      }),
    ).toEqual([]);
    expect(
      await camposInvalidos(v.listProyectosGradoValidator, {
        query: { gestionId: '0', carreraId: 'a', modalidadId: '-1', tutorId: '0', estado: XSS },
      }),
    ).toEqual(expect.arrayContaining(['gestionId', 'carreraId', 'modalidadId', 'tutorId', 'estado']));
  });

  it('exportBitacoraMensualValidator: mes YYYY-MM obligatorio', async () => {
    expect(await camposInvalidos(v.exportBitacoraMensualValidator, { query: { mes: '2026-03', gestionId: '1', tutorId: '2' } })).toEqual([]);
    for (const mes of [undefined, '2026-3', '03-2026', '2026/03', '2026-03-01', SQLI]) {
      expect(await camposInvalidos(v.exportBitacoraMensualValidator, { query: mes === undefined ? {} : { mes } })).toContain('mes');
    }
    expect(await camposInvalidos(v.exportBitacoraMensualValidator, { query: { mes: '2026-03', gestionId: '0', tutorId: 'x' } })).toEqual(
      expect.arrayContaining(['gestionId', 'tutorId']),
    );
  });

  it('listEstudiantesElegiblesValidator', async () => {
    expect(await camposInvalidos(v.listEstudiantesElegiblesValidator, { query: { carreraId: '1', gestionId: '2', search: 'ana' } })).toEqual([]);
    expect(await camposInvalidos(v.listEstudiantesElegiblesValidator, { query: { carreraId: '0', gestionId: 'x', search: 'a' } })).toEqual(
      expect.arrayContaining(['carreraId', 'gestionId', 'search']),
    );
  });

  it('avanceTutoriaCarreraValidator', async () => {
    expect(await camposInvalidos(v.avanceTutoriaCarreraValidator, { query: { gestionId: '1', carreraId: '1' } })).toEqual([]);
    expect(await camposInvalidos(v.avanceTutoriaCarreraValidator, { query: { gestionId: '0', carreraId: 'z' } })).toEqual(
      expect.arrayContaining(['gestionId', 'carreraId']),
    );
  });

  it('seguimientoTutoriaDocentesValidator: límites de anio (2000..2100) y mes (1..12)', async () => {
    expect(await camposInvalidos(v.seguimientoTutoriaDocentesValidator, { query: {} })).toEqual([]);
    for (const q of [{ anio: '2000', mes: '1' }, { anio: '2100', mes: '12' }, { docenteId: '1', carreraId: '1' }]) {
      expect(await camposInvalidos(v.seguimientoTutoriaDocentesValidator, { query: q })).toEqual([]);
    }
    expect(
      await camposInvalidos(v.seguimientoTutoriaDocentesValidator, { query: { anio: '1999', mes: '0', docenteId: '0', carreraId: 'x' } }),
    ).toEqual(expect.arrayContaining(['anio', 'mes', 'docenteId', 'carreraId']));
    expect(await camposInvalidos(v.seguimientoTutoriaDocentesValidator, { query: { anio: '2101', mes: '13' } })).toEqual(['anio', 'mes']);
  });
});

describe('createProyectoGradoValidator', () => {
  const ok = { titulo: 'Sistema de gestión', modalidadId: 1, estudianteIds: [1, 2] };

  it('acepta mínimo y completo', async () => {
    expect(await camposInvalidos(v.createProyectoGradoValidator, { body: ok })).toEqual([]);
    expect(
      await camposInvalidos(v.createProyectoGradoValidator, {
        body: { ...ok, carreraId: 1, gestionId: 2, titularEstudianteId: 1, descripcion: 'd', objetivos: 'o', alcance: 'a', metodologia: 'm', fechaPresentacionPerfil: '2026-03-01' },
      }),
    ).toEqual([]);
  });

  it('exige titulo, modalidadId y estudianteIds', async () => {
    expect(await camposInvalidos(v.createProyectoGradoValidator, { body: {} })).toEqual(
      expect.arrayContaining(['titulo', 'modalidadId', 'estudianteIds']),
    );
  });

  it.each([
    ['titulo', 'abcd'],
    ['titulo', 'a'.repeat(501)],
    ['titulo', 12345],
    ['modalidadId', 0],
    ['carreraId', 0],
    ['gestionId', 'x'],
    ['estudianteIds', []],
    ['estudianteIds', 'uno'],
    ['titularEstudianteId', 0],
    ['descripcion', 5],
    ['fechaPresentacionPerfil', 'mañana'],
  ])('rechaza %s=%p', async (campo, valor) => {
    expect(await camposInvalidos(v.createProyectoGradoValidator, { body: { ...ok, [campo]: valor } })).toContain(campo);
  });

  it('rechaza elementos inválidos dentro de estudianteIds', async () => {
    expect(await camposInvalidos(v.createProyectoGradoValidator, { body: { ...ok, estudianteIds: [1, 0, 'x'] } })).toEqual(
      expect.arrayContaining(['estudianteIds[1]', 'estudianteIds[2]']),
    );
  });

  it('límites del título 5 y 500', async () => {
    for (const t of ['abcde', 'a'.repeat(500)]) {
      expect(await camposInvalidos(v.createProyectoGradoValidator, { body: { ...ok, titulo: t } })).toEqual([]);
    }
  });

  it('payloads maliciosos en campos tipados', async () => {
    const campos = await camposInvalidos(v.createProyectoGradoValidator, {
      body: { titulo: XSS.slice(0, 3), modalidadId: SQLI, estudianteIds: [SQLI], fechaPresentacionPerfil: XSS },
    });
    expect(campos).toEqual(expect.arrayContaining(['titulo', 'modalidadId', 'estudianteIds[0]', 'fechaPresentacionPerfil']));
  });
});

describe('registrarMiModalidadGradoValidator', () => {
  it('solo título, objetivos y modalidad', async () => {
    expect(await camposInvalidos(v.registrarMiModalidadGradoValidator, { body: { titulo: 'Mi proyecto', modalidadId: 2, objetivos: 'x' } })).toEqual([]);
    expect(await camposInvalidos(v.registrarMiModalidadGradoValidator, { body: {} })).toEqual(expect.arrayContaining(['titulo', 'modalidadId']));
    expect(await camposInvalidos(v.registrarMiModalidadGradoValidator, { body: { titulo: 'abc', modalidadId: 'x', objetivos: 4 } })).toEqual(
      expect.arrayContaining(['titulo', 'modalidadId', 'objetivos']),
    );
  });
});

describe('updateProyectoGradoValidator', () => {
  it('acepta vacío y parcial; las notas en 0..100', async () => {
    expect(await camposInvalidos(v.updateProyectoGradoValidator, { body: {} })).toEqual([]);
    expect(await camposInvalidos(v.updateProyectoGradoValidator, { body: { notaPerfil: 0, notaPredefensa: 100, notaDefensa: 55.5, notaFinal: '70' } })).toEqual([]);
  });

  it.each([
    ['titulo', 'abc'],
    ['modalidadId', 0],
    ['carreraId', 0],
    ['gestionId', 0],
    ['notaPerfil', -0.1],
    ['notaPredefensa', 100.1],
    ['notaDefensa', 'alta'],
    ['notaFinal', 101],
    ['descripcion', 1],
  ])('rechaza %s=%p', async (campo, valor) => {
    expect(await camposInvalidos(v.updateProyectoGradoValidator, { body: { [campo]: valor } })).toContain(campo);
  });
});

describe('asignarTutorValidator', () => {
  it('exige tutorId; valida opcionales', async () => {
    expect(await camposInvalidos(v.asignarTutorValidator, { body: { tutorId: 3 } })).toEqual([]);
    expect(await camposInvalidos(v.asignarTutorValidator, { body: { tutorId: 3, numeroInforme: 'I-1', fechaEmision: '2026-01-01', destinatario: 'Dir' } })).toEqual([]);
    expect(await camposInvalidos(v.asignarTutorValidator, { body: {} })).toContain('tutorId');
    expect(await camposInvalidos(v.asignarTutorValidator, { body: { tutorId: 0, numeroInforme: 'n'.repeat(51), fechaEmision: 'x', destinatario: 'd'.repeat(151) } })).toEqual(
      expect.arrayContaining(['tutorId', 'numeroInforme', 'fechaEmision', 'destinatario']),
    );
  });
});

describe('transicionProyectoValidator', () => {
  it.each(ESTADOS_PROYECTO_GRADO_VALUES)('acepta estado %s', async (estado) => {
    expect(await camposInvalidos(v.transicionProyectoValidator, { body: { estado } })).toEqual([]);
  });

  it('exige estado válido', async () => {
    expect(await camposInvalidos(v.transicionProyectoValidator, { body: {} })).toContain('estado');
    expect(await camposInvalidos(v.transicionProyectoValidator, { body: { estado: SQLI } })).toContain('estado');
  });

  it('valida campos opcionales y resultadoSuficiencia', async () => {
    const aprobado = RESULTADOS_DICTAMEN_TUTORIA.APROBADO;
    const estado = ESTADOS_PROYECTO_GRADO_VALUES[0];
    expect(
      await camposInvalidos(v.transicionProyectoValidator, {
        body: { estado, fecha: '2026-01-01', nota: 80, observaciones: 'o', numeroInforme: 'I', contenido: 'c', destinatario: 'd', aspectosFormato: 'a', contenidoProyecto: 'b', procesoTutoria: 'c', resultadoSuficiencia: aprobado },
      }),
    ).toEqual([]);
    expect(
      await camposInvalidos(v.transicionProyectoValidator, {
        body: { estado, fecha: 'x', nota: 101, observaciones: 1, numeroInforme: 'n'.repeat(51), destinatario: 'd'.repeat(151), aspectosFormato: 1, contenidoProyecto: 1, procesoTutoria: 1, resultadoSuficiencia: 'QUIZAS' },
      }),
    ).toEqual(
      expect.arrayContaining(['fecha', 'nota', 'observaciones', 'numeroInforme', 'destinatario', 'aspectosFormato', 'contenidoProyecto', 'procesoTutoria', 'resultadoSuficiencia']),
    );
  });
});

describe('integrantes', () => {
  const rol = ROLES_INTEGRANTE_TUTORIA_VALUES[0];
  it('addIntegranteValidator', async () => {
    expect(await camposInvalidos(v.addIntegranteValidator, { body: { estudianteId: 1 } })).toEqual([]);
    expect(await camposInvalidos(v.addIntegranteValidator, { body: { estudianteId: 1, rol, fechaIncorporacion: '2026-01-01', observaciones: 'o' } })).toEqual([]);
    expect(await camposInvalidos(v.addIntegranteValidator, { body: {} })).toContain('estudianteId');
    expect(await camposInvalidos(v.addIntegranteValidator, { body: { estudianteId: 0, rol: 'JEFE', fechaIncorporacion: 'x', observaciones: 3 } })).toEqual(
      expect.arrayContaining(['estudianteId', 'rol', 'fechaIncorporacion', 'observaciones']),
    );
  });

  it('updateIntegranteValidator', async () => {
    expect(await camposInvalidos(v.updateIntegranteValidator, { body: {} })).toEqual([]);
    expect(await camposInvalidos(v.updateIntegranteValidator, { body: { rol, estado: ESTADOS_INTEGRANTE_TUTORIA_VALUES[0], fechaIncorporacion: '2026-02-02' } })).toEqual([]);
    expect(await camposInvalidos(v.updateIntegranteValidator, { body: { rol: 'X', estado: 'Y', fechaIncorporacion: 'z', observaciones: 1 } })).toEqual(
      expect.arrayContaining(['rol', 'estado', 'fechaIncorporacion', 'observaciones']),
    );
  });
});

describe('bitácora', () => {
  it('createBitacoraEntradaValidator', async () => {
    expect(await camposInvalidos(v.createBitacoraEntradaValidator, { body: {} })).toEqual([]);
    expect(
      await camposInvalidos(v.createBitacoraEntradaValidator, {
        body: {
          tipo: TIPOS_BITACORA_TUTORIA_VALUES[0],
          fecha: '2026-03-03',
          actividad: 'rev',
          observaciones: 'ok',
          porcentajeAvance: 100,
          avanceProyectoId: 2,
          estado: ESTADOS_BITACORA_TUTORIA_VALUES[0],
          estadoRevisionAvance: ESTADOS_REVISION_AVANCE_VALUES[0],
        },
      }),
    ).toEqual([]);
    expect(
      await camposInvalidos(v.createBitacoraEntradaValidator, {
        body: { tipo: 'X', fecha: 'x', actividad: 1, observaciones: 2, porcentajeAvance: 101, avanceProyectoId: 0, estado: 'X', estadoRevisionAvance: 'X' },
      }),
    ).toEqual(expect.arrayContaining(['tipo', 'fecha', 'actividad', 'observaciones', 'porcentajeAvance', 'avanceProyectoId', 'estado', 'estadoRevisionAvance']));
  });

  it('porcentajeAvance acepta 0 y 100, rechaza -1, 100.5 y decimales', async () => {
    for (const p of [0, 100]) {
      expect(await camposInvalidos(v.createBitacoraEntradaValidator, { body: { porcentajeAvance: p } })).toEqual([]);
      expect(await camposInvalidos(v.updateBitacoraEntradaValidator, { body: { porcentajeAvance: p } })).toEqual([]);
    }
    for (const p of [-1, 100.5, 'cien']) {
      expect(await camposInvalidos(v.createBitacoraEntradaValidator, { body: { porcentajeAvance: p } })).toContain('porcentajeAvance');
      expect(await camposInvalidos(v.updateBitacoraEntradaValidator, { body: { porcentajeAvance: p } })).toContain('porcentajeAvance');
    }
  });

  it('updateBitacoraEntradaValidator', async () => {
    expect(await camposInvalidos(v.updateBitacoraEntradaValidator, { body: {} })).toEqual([]);
    expect(await camposInvalidos(v.updateBitacoraEntradaValidator, { body: { fecha: 'x', actividad: 1, observaciones: 1, estado: 'X' } })).toEqual(
      expect.arrayContaining(['fecha', 'actividad', 'observaciones', 'estado']),
    );
  });
});

describe('createAvanceValidator', () => {
  it('titulo opcional hasta 255', async () => {
    expect(await camposInvalidos(v.createAvanceValidator, { body: {} })).toEqual([]);
    expect(await camposInvalidos(v.createAvanceValidator, { body: { titulo: 't'.repeat(255), descripcion: 'd' } })).toEqual([]);
    expect(await camposInvalidos(v.createAvanceValidator, { body: { titulo: 't'.repeat(256), descripcion: 5 } })).toEqual(
      expect.arrayContaining(['titulo', 'descripcion']),
    );
  });
});

describe('acta de defensa', () => {
  const tribunal = Array.from({ length: TRIBUNAL_ACTA_DEFENSA_MIEMBROS }, (_, i) => ({ docenteId: i + 1, cargo: 'Presidente' }));
  const ok = {
    fechaDefensa: '2026-07-01',
    horaInicio: '09:00',
    tribunal,
    calificaciones: [{ estudianteId: 1, calificacionFinal: 85 }],
  };

  it('acepta un acta válida y completa', async () => {
    expect(await camposInvalidos(v.registrarActaDefensaValidator, { body: ok })).toEqual([]);
    expect(await camposInvalidos(v.registrarActaDefensaValidator, { body: { ...ok, horaConclusion: '10:30:00', numeroActa: 5, observaciones: 'ok' } })).toEqual([]);
  });

  it('exige fecha, hora, tribunal y calificaciones', async () => {
    expect(await camposInvalidos(v.registrarActaDefensaValidator, { body: {} })).toEqual(
      expect.arrayContaining(['fechaDefensa', 'horaInicio', 'tribunal', 'calificaciones']),
    );
  });

  it('el tribunal debe tener exactamente los miembros definidos', async () => {
    expect(await camposInvalidos(v.registrarActaDefensaValidator, { body: { ...ok, tribunal: tribunal.slice(1) } })).toContain('tribunal');
    expect(await camposInvalidos(v.registrarActaDefensaValidator, { body: { ...ok, tribunal: [...tribunal, { docenteId: 9 }] } })).toContain('tribunal');
  });

  it.each([
    ['fechaDefensa', '01-07-2026'],
    ['horaInicio', '25:00'],
    ['horaInicio', '9:00'],
    ['horaConclusion', '12:99'],
    ['numeroActa', 0],
    ['observaciones', 7],
    ['calificaciones', []],
  ])('rechaza %s=%p', async (campo, valor) => {
    expect(await camposInvalidos(v.registrarActaDefensaValidator, { body: { ...ok, [campo]: valor } })).toContain(campo);
  });

  it('valida los elementos del tribunal y las calificaciones', async () => {
    const malTribunal = tribunal.map((t, i) => (i === 0 ? { docenteId: 0, cargo: 'c'.repeat(81) } : i === 1 ? {} : t));
    expect(await camposInvalidos(v.registrarActaDefensaValidator, { body: { ...ok, tribunal: malTribunal } })).toEqual(
      expect.arrayContaining(['tribunal[0].docenteId', 'tribunal[0].cargo', 'tribunal[1].docenteId']),
    );
    expect(
      await camposInvalidos(v.registrarActaDefensaValidator, { body: { ...ok, calificaciones: [{ estudianteId: 0, calificacionFinal: 101 }, {}] } }),
    ).toEqual(
      expect.arrayContaining(['calificaciones[0].estudianteId', 'calificaciones[0].calificacionFinal', 'calificaciones[1].estudianteId', 'calificaciones[1].calificacionFinal']),
    );
  });

  it('calificacionFinal acepta 0 y 100', async () => {
    for (const n of [0, 100, '59.5']) {
      expect(await camposInvalidos(v.registrarActaDefensaValidator, { body: { ...ok, calificaciones: [{ estudianteId: 1, calificacionFinal: n }] } })).toEqual([]);
    }
  });

  it('anularActaDefensaValidator: motivo 3..500', async () => {
    expect(await camposInvalidos(v.anularActaDefensaValidator, { body: {} })).toContain('motivo');
    expect(await camposInvalidos(v.anularActaDefensaValidator, { body: { motivo: 'no' } })).toContain('motivo');
    expect(await camposInvalidos(v.anularActaDefensaValidator, { body: { motivo: 'm'.repeat(501) } })).toContain('motivo');
    expect(await camposInvalidos(v.anularActaDefensaValidator, { body: { motivo: 'm'.repeat(500) } })).toEqual([]);
    expect(await camposInvalidos(v.anularActaDefensaValidator, { body: { motivo: ['a', 'b', 'c'] } })).toContain('motivo');
  });
});
