import { describe, it, expect } from 'vitest';
import dayjs from 'dayjs';
import {
  abreviarDia,
  buildHorarioEtiqueta,
  buildHorarioOptions,
  compararHorarios,
  horaADayjs,
  ordenDia,
  turnoDeHora,
  validarHorarioNuevo,
} from '../horarioCapacitacion';

describe('horarioCapacitacion', () => {
  it('arma la etiqueta «SAB 08:00-12:00» recortando segundos', () => {
    expect(buildHorarioEtiqueta('SABADO', '08:00:00', '12:00:00')).toBe('SAB 08:00-12:00');
  });

  it('abrevia días con tilde y ya abreviados', () => {
    expect(abreviarDia('Miércoles')).toBe('MIE');
    expect(abreviarDia('SAB')).toBe('SAB');
    expect(abreviarDia(null)).toBe('');
  });

  it('sin horas devuelve solo el día', () => {
    expect(buildHorarioEtiqueta('LUNES', null, null)).toBe('LUN');
  });

  it('ordena por semana y luego por hora de inicio', () => {
    const lista = [
      { dia: 'SABADO', horaInicio: '15:00' },
      { dia: 'LUNES', horaInicio: '19:00' },
      { dia: 'SABADO', horaInicio: '08:00' },
    ].sort(compararHorarios);
    expect(lista.map((h) => `${h.dia} ${h.horaInicio}`)).toEqual([
      'LUNES 19:00',
      'SABADO 08:00',
      'SABADO 15:00',
    ]);
    expect(ordenDia('desconocido')).toBe(99);
  });

  it('convierte HH:mm(:ss) a dayjs sin plugins y vacío a undefined', () => {
    expect(horaADayjs('08:30:00').format('HH:mm')).toBe('08:30');
    expect(horaADayjs(null)).toBeUndefined();
  });

  it('deriva el turno de la hora de inicio', () => {
    expect(turnoDeHora('08:00')).toBe('MAÑANA');
    expect(turnoDeHora('15:00:00')).toBe('TARDE');
    expect(turnoDeHora('19:00')).toBe('NOCHE');
    expect(turnoDeHora(null)).toBeNull();
  });

  describe('validarHorarioNuevo', () => {
    const t = (h, m = 0) => dayjs().hour(h).minute(m);
    it('exige día y horas', () => {
      expect(validarHorarioNuevo({})).toBe('Seleccione el día');
      expect(validarHorarioNuevo({ dia: 'SABADO' })).toMatch(/hora de inicio/);
    });
    it('rechaza fin <= inicio', () => {
      expect(validarHorarioNuevo({ dia: 'SABADO', horaInicio: t(12), horaFin: t(8) })).toMatch(
        /posterior/,
      );
      expect(validarHorarioNuevo({ dia: 'SABADO', horaInicio: '08:00', horaFin: '08:00' })).toMatch(
        /posterior/,
      );
    });
    it('acepta un rango válido', () => {
      expect(validarHorarioNuevo({ dia: 'SABADO', horaInicio: t(8), horaFin: t(12) })).toBeNull();
    });
  });

  describe('buildHorarioOptions', () => {
    it('une el catálogo con los horarios ya asignados que no estén en él', () => {
      const { options, turnoById } = buildHorarioOptions(
        [{ horarioId: 2, dia: 'SABADO', horaInicio: '15:00', etiqueta: 'SAB 15:00-19:00' }],
        [
          { horarioId: 2, dia: 'SABADO', horaInicio: '15:00', horaFin: '19:00' },
          { horarioId: 9, dia: 'LUNES', horaInicio: '08:00', horaFin: '09:00' },
        ],
      );
      expect(options).toEqual([
        { value: 9, label: 'LUN 08:00-09:00' },
        { value: 2, label: 'SAB 15:00-19:00' },
      ]);
      expect(turnoById).toEqual({ 9: 'MAÑANA', 2: 'TARDE' });
    });
  });
});
