import { describe, it, expect } from 'vitest';
import dayjs from 'dayjs';
import {
  mapFormValuesToHorarioPayload,
  mapHorarioCapacitacion,
  mapHorarioToFormValues,
  mapHorariosCapacitacionList,
} from '../horarioCapacitacionMapper';

describe('horarioCapacitacionMapper', () => {
  it('mapea un horario con etiqueta y cursosEnUso', () => {
    expect(
      mapHorarioCapacitacion({
        horarioId: 3,
        dia: 'SABADO',
        horaInicio: '08:00:00',
        horaFin: '12:00:00',
        cursosEnUso: '2',
      }),
    ).toMatchObject({
      id: 3,
      horarioId: 3,
      etiqueta: 'SAB 08:00-12:00',
      cursosEnUso: 2,
      horaInicio: '08:00',
    });
  });

  it('acepta `id` en lugar de `horarioId` y descarta filas sin id', () => {
    expect(mapHorarioCapacitacion({ id: 9, dia: 'LUNES' }).horarioId).toBe(9);
    expect(mapHorarioCapacitacion({ dia: 'LUNES' })).toBeNull();
  });

  it('ordena la lista por semana y hora', () => {
    const lista = mapHorariosCapacitacionList([
      { horarioId: 2, dia: 'SABADO', horaInicio: '15:00', horaFin: '19:00' },
      { horarioId: 1, dia: 'SABADO', horaInicio: '08:00', horaFin: '12:00' },
      { horarioId: 3, dia: 'LUNES', horaInicio: '20:00', horaFin: '21:00' },
    ]);
    expect(lista.map((h) => h.horarioId)).toEqual([3, 1, 2]);
    expect(mapHorariosCapacitacionList(null)).toEqual([]);
  });

  it('valores del formulario ↔ payload HH:mm (sin nombre: el código lo genera el backend)', () => {
    const v = mapHorarioToFormValues({ dia: 'SABADO', horaInicio: '08:00', horaFin: '12:00' });
    expect(v.horaInicio.format('HH:mm')).toBe('08:00');
    expect(mapHorarioToFormValues(null).dia).toBeUndefined();
    expect(
      mapFormValuesToHorarioPayload({
        dia: 'SABADO',
        horaInicio: dayjs().hour(8).minute(0),
        horaFin: dayjs().hour(12).minute(30),
        nombre: '  ',
      }),
    ).toEqual({ dia: 'SABADO', horaInicio: '08:00', horaFin: '12:30' });
  });
});
