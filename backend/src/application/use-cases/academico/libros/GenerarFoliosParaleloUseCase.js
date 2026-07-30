import { ValidationError, NotFoundError } from '../../../../domain/errors/AppError.js';
import {
  ESTADOS_LIBRO,
  ESTADOS_FOLIO,
  ESTUDIANTES_POR_FOLIO,
} from '../../../../domain/constants/libros.constants.js';
import { toFolioDTO } from '../../../mappers/academico/LibroRegistroPresentationMapper.js';
import {
  agruparFilas135PorEstudiante,
  derivarEstadoAcademico,
} from './helpers/folioCeldasHelper.js';

/**
 * Genera los folios (páginas del centralizador) de UN paralelo del libro
 * (POST /libros/:id/folios). Permiso: academico.libro · CREAR.
 *
 * Algoritmo (réplica del libro físico):
 * 1. Nómina del paralelo (vista 177) en orden APELLIDO_PATERNO APELLIDO_MATERNO
 *    NOMBRES → páginas de 10 estudiantes (ESTUDIANTES_POR_FOLIO).
 * 2. numero_folio es correlativo POR GESTIÓN cruzando TODAS las carreras (los
 *    folios de SIS-INF/ADM-EMP/CON-GEN comparten el contador 1..N de la
 *    gestión). El número lo asigna el repositorio DENTRO de la transacción
 *    (MAX de la gestión + 1, lectura FOR UPDATE); si la gestión no tiene
 *    folios, arranca en folio_inicial (el libro 14 real arranca en 56).
 * 3. numero_orden continuo del estudiante en el paralelo (1-10, 11-20, ...);
 *    orden_en_paralelo = 1ra, 2da... página del paralelo.
 * 4. estado_academico SUGERIDO desde las filas de la vista 135 (caché
 *    matriculas_materia.estado): alguna REPROBADO → REPROBADO; todas
 *    ABANDONO/RETIRADO/NP → ABANDONO; si no → APROBADO. Editable después
 *    (EDITAR) mientras el folio no esté FIRMADO.
 * 5. Persistencia TRANSACCIONAL (numeración + folios + filas + folio_actual
 *    informativo del libro).
 *
 * Rechazos: libro CERRADO, paralelo de otra carrera/gestión, paralelo sin
 * estudiantes y paralelo con folios vigentes (se anulan antes de regenerar).
 */
export class GenerarFoliosParaleloUseCase {
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
   * @param {Object} params
   * @param {number} params.usuarioId
   * @param {number} params.id - Libro.
   * @param {Object} params.body - { paraleloGestionId, fechaRegistro? }
   * @returns {Promise<{folios: Object[]}>} Folios creados (vista 176).
   */
  async execute({ usuarioId, id, body = {} }) {
    const libroId = Number(id);
    const paraleloGestionId = Number(body.paraleloGestionId);
    if (!Number.isFinite(paraleloGestionId) || paraleloGestionId < 1) {
      throw new ValidationError('El paralelo es obligatorio');
    }

    const libro = await this.libroRegistroRepository.findById(libroId);
    if (!libro) {
      throw new NotFoundError('Libro de registro');
    }
    if (libro.estado !== ESTADOS_LIBRO.ABIERTO) {
      throw new ValidationError('El libro está cerrado: no admite nuevos folios');
    }

    // El paralelo debe pertenecer a la carrera+gestión del libro.
    const paralelos = await this.libroRegistroViewRepository.listarParalelosParaLibro({
      carreraId: libro.carreraId,
      gestionId: libro.gestionId,
      libroId,
    });
    const paralelo = paralelos.find(
      (p) => Number(p.paralelo_gestion_id) === paraleloGestionId,
    );
    if (!paralelo) {
      throw new ValidationError(
        'El paralelo no pertenece a la carrera y gestión de este libro',
      );
    }

    const foliosVigentes = await this.libroRegistroRepository.countFoliosVigentesByParalelo(
      libroId,
      paraleloGestionId,
    );
    if (foliosVigentes > 0) {
      throw new ValidationError(
        'El paralelo ya tiene folios en este libro: anule los folios existentes antes de regenerar',
      );
    }

    // 1) Nómina ordenada por apellido (vista 177).
    const nomina =
      await this.libroRegistroViewRepository.listarNominaPorParaleloGestion(paraleloGestionId);
    if (nomina.length === 0) {
      throw new ValidationError('El paralelo no tiene estudiantes matriculados');
    }

    // 2) Estado académico sugerido desde la vista 135 (por estudiante).
    const filas135 =
      await this.calificacionCentralizadorRepository.listarFilasCentralizadorPorParaleloGestion(
        paraleloGestionId,
      );
    const filasPorEstudiante = agruparFilas135PorEstudiante(filas135);

    // 3) Corte en páginas de 10 con orden continuo. El numero_folio NO se
    //    calcula aquí: lo asigna el repositorio dentro de la transacción
    //    (contador compartido de la gestión, cross-carrera).
    const fechaRegistro = body.fechaRegistro ?? new Date().toISOString().slice(0, 10);

    const folios = [];
    for (let inicio = 0; inicio < nomina.length; inicio += ESTUDIANTES_POR_FOLIO) {
      const pagina = nomina.slice(inicio, inicio + ESTUDIANTES_POR_FOLIO);
      folios.push({
        paraleloGestionId,
        ordenEnParalelo: folios.length + 1,
        estado: ESTADOS_FOLIO.BORRADOR,
        fechaRegistro,
        estudiantes: pagina.map((est, idx) => ({
          numeroOrden: inicio + idx + 1,
          estudianteId: est.estudiante_id,
          inscripcionId: est.inscripcion_id,
          estadoAcademico: derivarEstadoAcademico(
            filasPorEstudiante.get(est.estudiante_id),
          ),
          observaciones: null,
        })),
      });
    }

    // 4) Persistencia transaccional (numeración + folios + filas, todo o nada).
    const creados = await this.libroRegistroRepository.crearFoliosConEstudiantes(
      {
        libroId,
        gestionId: libro.gestionId,
        folioInicial: libro.folioInicial,
        folios,
      },
      usuarioId,
    );

    const numeros = creados.map((f) => Number(f.numeroFolio));
    this.logger?.info('[Libros] Folios generados', {
      libroId,
      paraleloGestionId,
      folios: creados.length,
      estudiantes: nomina.length,
      rango: numeros.length > 0 ? `${Math.min(...numeros)}-${Math.max(...numeros)}` : '',
    });

    // 5) Respuesta con el contexto completo (vista 176).
    const rows = await this.libroRegistroViewRepository.listarFoliosPorLibro(libroId, {
      paraleloGestionId,
    });
    return { folios: rows.map(toFolioDTO) };
  }
}

export default GenerarFoliosParaleloUseCase;
