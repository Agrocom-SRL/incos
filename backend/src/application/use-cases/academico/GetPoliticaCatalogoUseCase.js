import { mapCatalogoPolitica } from '../../mappers/politicaInstitucionalMapper.js';
import { unwrapRepositoryList } from '../../utils/repositoryResultUtils.js';

/**
 * Catálogo para la pantalla de política institucional (carreras, periodos del plan).
 * Los tipos de evaluación final se listan en GET /calificaciones/tipos-evaluacion?ambito=MATERIA_COMPLETA
 */
export class GetPoliticaCatalogoUseCase {
  constructor({ careerRepository, periodRepository, logger }) {
    if (!careerRepository) throw new Error('careerRepository es requerido');
    if (!periodRepository) throw new Error('periodRepository es requerido');
    if (!logger) throw new Error('logger es requerido');
    this.careerRepository = careerRepository;
    this.periodRepository = periodRepository;
    this.logger = logger;
  }

  async execute() {
    const [carrerasResult, periodosResult] = await Promise.all([
      this.careerRepository.findAll({}),
      this.periodRepository.findAll({}),
    ]);

    const carreras = unwrapRepositoryList(carrerasResult, ['careers']);
    const periodos = unwrapRepositoryList(periodosResult, ['periods']);
    const periodosOrdenados = [...periodos].sort(
      (a, b) => (a.number ?? a.numero ?? 0) - (b.number ?? b.numero ?? 0),
    );

    const catalogo = mapCatalogoPolitica({
      tiposFinales: [],
      carreras,
      periodos: periodosOrdenados,
    });

    this.logger.info('[Calificaciones] Catálogo política obtenido', {
      carreras: catalogo.carreras?.length ?? 0,
      periodos: catalogo.periodosPlan?.length ?? 0,
    });

    return { catalogo };
  }
}
