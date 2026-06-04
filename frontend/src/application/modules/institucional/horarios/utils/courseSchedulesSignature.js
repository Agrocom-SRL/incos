/**
 * Firma liviana para detectar cambios en courseSchedules sin JSON.stringify (evita bloquear el hilo UI).
 * @param {Array<{ cursoId?: number, bloques?: object[] }>|null|undefined} schedules
 */
export function courseSchedulesSignature(schedules) {
  if (!Array.isArray(schedules) || !schedules.length) return '0';
  return schedules
    .map((c) => {
      const id = Number(c?.cursoId) || 0;
      const bloques = c?.bloques ?? [];
      let blockSig = '';
      for (let i = 0; i < bloques.length; i += 1) {
        const b = bloques[i];
        blockSig += `${b?.dia ?? ''}:${b?.horaInicio ?? ''}:${b?.cursoHorarioId ?? i};`;
      }
      return `${id}[${bloques.length}]${blockSig}`;
    })
    .join('|');
}
