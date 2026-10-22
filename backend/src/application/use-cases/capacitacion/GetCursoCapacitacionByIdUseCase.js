import { CursoCapacitacionMapper } from '../../mappers/capacitacion/index.js';

/**
 * Use Case: GetCursoCapacitacionByIdUseCase
 * Módulo: Capacitación (CAP)
 *
 * Ficha de un curso de capacitación: datos + agregados de la vista 155, sus
 * grupos (con `inscritosCount` y sus horarios de la vista 154, con etiqueta y
 * orden por día/hora) y los requisitos de inscripción del curso.
 */
export class GetCursoCapacitacionByIdUseCase {
  /**
   * @param {Object} params - Dependencias inyectadas
   * @param {Object} params.cursoCapacitacionFichaViewRepository - Repo de lectura (vistas 154/155)
   * @param {Object} params.capacitacionRequisitoRepository - Requisitos de inscripción del curso
   * @param {Object} params.grupoCapacitacionRepository - Grupos del curso con inscritos
   * @param {ILogger} params.logger
   */
  constructor({
    cursoCapacitacionFichaViewRepository,
    capacitacionRequisitoRepository,
    grupoCapacitacionRepository,
    logger,
  }) {
    this.capacitacionRequisitoRepository = capacitacionRequisitoRepository;
    this.grupoCapacitacionRepository = grupoCapacitacionRepository;
    this.cursoCapacitacionFichaViewRepository = cursoCapacitacionFichaViewRepository;
    this.logger = logger;
  }

  /**
   * @param {number} id - ID del curso
   * @returns {Promise<Object|null>} Ficha en formato de presentación o null
   */
  async execute(id) {
    const row = await this.cursoCapacitacionFichaViewRepository.findListadoById(id);
    if (!row) return null;

    const presentation = CursoCapacitacionMapper.viewRowToPresentation(row);

    const horarioRows =
      await this.cursoCapacitacionFichaViewRepository.findHorariosByCapacitacionId(id);
    const horarios = CursoCapacitacionMapper.horarioRowsToPresentation(horarioRows);
    const grupos = await this.grupoCapacitacionRepository.findConInscritosByCapacitacionId(id);
    presentation.grupos = CursoCapacitacionMapper.gruposToPresentation(grupos, horarios);
    // Bloques sin grupo (comunes a todos los grupos)
    presentation.horariosComunes = horarios.filter((bloque) => bloque.grupoId === null);

    const requisitos = await this.capacitacionRequisitoRepository.findByCapacitacionId(id);
    presentation.requisitos = CursoCapacitacionMapper.requisitosToPresentation(requisitos);
    presentation.requisitoAcreditaPagoCurso = CursoCapacitacionMapper.requisitoAcreditaPagoCurso(
      presentation.requisitos
    );

    this.logger.info('[Capacitación] Ficha de curso de capacitación obtenida', {
      id,
      grupos: presentation.grupos.length,
      horarios: horarios.length,
    });

    return presentation;
  }
}
