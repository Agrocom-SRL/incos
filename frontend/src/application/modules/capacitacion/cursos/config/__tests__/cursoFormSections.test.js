import { describe, it, expect } from 'vitest';
import { createCursoFormSections } from '../cursoFormSections';

const build = (flags) =>
  createCursoFormSections({ ...flags });

const campo = (secciones, name) =>
  Object.values(secciones)
    .flatMap((s) => s.fields)
    .find((f) => f.name === name);

describe('createCursoFormSections · costos condicionales', () => {
  it('interruptor apagado: monto deshabilitado y sin exigir', () => {
    const s = build({ tieneCosto: false, cobraMatricula: false });
    expect(campo(s, 'costo')).toMatchObject({ disabled: true, required: false, rules: [] });
    expect(campo(s, 'costoMatricula')).toMatchObject({ disabled: true, required: false });
  });

  it('interruptor activo: monto requerido y > 0', async () => {
    const s = build({ tieneCosto: true, cobraMatricula: true });
    const costo = campo(s, 'costo');
    expect(costo).toMatchObject({ disabled: false, required: true });
    const [rule] = costo.rules;
    await expect(rule.validator(null, 0)).rejects.toThrow(/mayor a 0/);
    await expect(rule.validator(null, 440)).resolves.toBeUndefined();
  });

  it('cada interruptor gobierna solo su monto', () => {
    const s = build({ tieneCosto: true, cobraMatricula: false });
    expect(campo(s, 'costo').required).toBe(true);
    expect(campo(s, 'costoMatricula').required).toBe(false);
  });

  it('fechaFin es opcional; el aula ya no es del curso (es de cada grupo)', () => {
    const s = build({ tieneCosto: false, cobraMatricula: false });
    expect(campo(s, 'fechaFin').required).toBeUndefined();
    expect(campo(s, 'horarioIds')).toBeUndefined();
    expect(campo(s, 'descripcionVirtual')).toBeUndefined();
    expect(campo(s, 'aulaId')).toBeUndefined();
  });
});
