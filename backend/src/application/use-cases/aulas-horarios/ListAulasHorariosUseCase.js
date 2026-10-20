import { BaseListUseCase } from '../base/BaseListUseCase.js';
import { AulasHorariosMapper } from '../../mappers/aulas-horarios/AulasHorariosMapper.js';

const ALLOWED_DAYS = new Set(['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO', 'DOMINGO']);
const ALLOWED_SHIFTS = new Set(['TARDE', 'NOCHE']);

export class ListAulasHorariosUseCase extends BaseListUseCase {
  constructor({ aulasHorariosSemanaRepository, logger }) {
    super({
      repository: aulasHorariosSemanaRepository,
      logger,
      moduleName: 'Aulas horarios',
      resourceName: 'bloques de horarios en aulas',
      collectionFieldName: 'bloques',
      dataFieldName: 'bloques',
    });
  }

  getMapper() {
    return AulasHorariosMapper;
  }

  buildSpecificFilters(queryParams = {}, baseFilters = {}) {
    const out = { ...baseFilters };
    const day = String(queryParams.dia || '').trim().toUpperCase();
    const shift = String(queryParams.turno || '').trim().toUpperCase();
    const classroomId = Number(queryParams.aula_id);

    if (ALLOWED_DAYS.has(day)) out.day = day;
    if (ALLOWED_SHIFTS.has(shift)) out.shift = shift;
    if (Number.isFinite(classroomId) && classroomId > 0) out.classroomId = classroomId;
    return out;
  }
}
