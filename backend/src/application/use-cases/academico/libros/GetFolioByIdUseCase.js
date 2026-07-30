import { NotFoundError } from '../../../../domain/errors/AppError.js';
import {
  toFolioDTO,
  toFolioEstudianteDTO,
} from '../../../mappers/academico/LibroRegistroPresentationMapper.js';
import {
  construirAsignaturasDesdeFilas135,
  agruparFilas135PorEstudiante,
  construirCeldasEstudiante,
} from './helpers/folioCeldasHelper.js';

/**
 * Detalle de un folio (GET /libros/:id/folios/:folioId): cabecera de impresión
 * (vista 176) + nómina congelada (folio_estudiantes) + celdas de nota final por
 * materia derivadas de la vista 135 (NULL/ABANDONO → 'NP').
 * Permiso: academico.libro · DETALLE.
 *
 * Limitación documentada (A5): la 135 filtra la asignación vigente — las celdas
 * reflejan la gestión vigente; ESTADO y OBSERVACIONES son el snapshot congelado.
 */
export class GetFolioByIdUseCase {
  constructor({
    libroRegistroRepository,
    libroRegistroViewRepository,
    calificacionCentralizadorRepository,
    logger,
  }) {
    this.libroRegistroRepository = libroRegistroRepository;
    this.libroRegistroViewRepository = libroRegistroViewRepository;
    this.calificacionCentralizadorRepository = calificacionCentralizadorRepository;
    this.logger = logger;
  }

  /**
   * @param {Object} params - { id (libro), folioId }
   * @returns {Promise<{folio: Object}>} folio = cabecera + asignaturas[] +
   *   estudiantes[] (cada uno con celdas { [ofertaCursoId]: nota|'NP' }).
   */
  async execute({ id, folioId }) {
    const libroId = Number(id);
    const row = await this.libroRegistroViewRepository.obtenerFolioPorId(Number(folioId));
    if (!row || Number(row.libro_id) !== libroId) {
      throw new NotFoundError('Folio');
    }

    const [estudiantesRows, filas135] = await Promise.all([
      this.libroRegistroRepository.listarEstudiantesFolio(row.id),
      this.calificacionCentralizadorRepository.listarFilasCentralizadorPorParaleloGestion(
        row.paralelo_gestion_id,
      ),
    ]);

    const asignaturas = construirAsignaturasDesdeFilas135(filas135);
    const filasPorEstudiante = agruparFilas135PorEstudiante(filas135);

    const folio = {
      ...toFolioDTO(row),
      asignaturas,
      estudiantes: estudiantesRows.map((fila) => ({
        ...toFolioEstudianteDTO(fila),
        celdas: construirCeldasEstudiante(filasPorEstudiante.get(fila.estudiante_id)),
      })),
    };

    this.logger?.info('[Libros] Detalle de folio', {
      libroId,
      folioId: row.id,
      estudiantes: folio.estudiantes.length,
      asignaturas: asignaturas.length,
    });
    return { folio };
  }
}

export default GetFolioByIdUseCase;
