import { ValidationError } from '../../../domain/errors/AppError.js';
import { CursoCapacitacionMapper } from '../../mappers/capacitacion/index.js';
import { parseFiltroId } from '../../utils/validacionEntrada.js';

/** Campos por los que se puede ordenar el catálogo de horarios. */
const CAMPOS_ORDEN = ['dia', 'hora', 'nombre'];
const LONGITUD_MAXIMA_BUSQUEDA = 100;

/** Interpreta `sort` ("dia", "hora:desc", "nombre:asc"); sin valor usa día y hora ascendente. */
function parseOrden(sort) {
  if (sort === undefined || sort === null || sort === '') return null;
  const partes = String(sort).trim().toLowerCase().split(':');
  const [campo, direccion = 'asc'] = partes;
  if (partes.length > 2 || !CAMPOS_ORDEN.includes(campo) || !['asc', 'desc'].includes(direccion)) {
    throw new ValidationError(`sort debe ser uno de: ${CAMPOS_ORDEN.join(', ')} (opcional :asc|:desc)`);
  }
  return { campo, direccion: direccion.toUpperCase() };
}

/**
 * Use Case: ListHorariosCapacitacionUseCase
 * Módulo: Capacitación (CAP)
 *
 * Catálogo de horarios propios de capacitación (`tipo_horario='CAPACITACION'`)
 * con `cursosEnUso` (conteo de cursos vigentes que lo usan). Admite búsqueda
 * (nombre o día) y orden por día, hora o nombre. Con `aulaId` marca `ocupado`;
 * sin aula `ocupado` es siempre false, porque el aula es opcional y no debe
 * condicionar el selector de horarios.
 */
export class ListHorariosCapacitacionUseCase {
  /**
   * @param {Object} params - Dependencias inyectadas
   * @param {Object} params.cursoCapacitacionRepository
   * @param {ILogger} params.logger
   */
  constructor({ cursoCapacitacionRepository, logger }) {
    this.cursoCapacitacionRepository = cursoCapacitacionRepository;
    this.logger = logger;
  }

  /**
   * @param {Object} [params]
   * @param {number|string} [params.aulaId] - Aula a consultar (opcional)
   * @param {number|string} [params.excludeCursoId] - Curso a excluir (modo edición)
   * @param {string} [params.search] - Texto en nombre o día
   * @param {string} [params.sort] - dia | hora | nombre, con :asc|:desc opcional
   * @returns {Promise<{horarios: Array<Object>}>}
   */
  async execute({ aulaId, excludeCursoId, search, sort } = {}) {
    const texto = typeof search === 'string' ? search.trim() : '';
    if (texto.length > LONGITUD_MAXIMA_BUSQUEDA) {
      throw new ValidationError(`search no debe superar los ${LONGITUD_MAXIMA_BUSQUEDA} caracteres`);
    }
    const filtros = {
      aulaId: parseFiltroId(aulaId, 'aulaId') ?? null,
      excludeCursoId: parseFiltroId(excludeCursoId, 'excludeCursoId') ?? null,
      search: texto || null,
      orden: parseOrden(sort),
    };

    const rows = await this.cursoCapacitacionRepository.listHorariosCapacitacion(filtros);

    this.logger.info('[Capacitación] Catálogo de horarios de capacitación consultado', {
      ...filtros,
      total: rows.length,
    });

    return { horarios: rows.map(CursoCapacitacionMapper.horarioCatalogoToPresentation) };
  }
}
