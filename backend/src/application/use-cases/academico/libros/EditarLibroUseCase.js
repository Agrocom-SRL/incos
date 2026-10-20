import { ValidationError, NotFoundError, ConflictError } from '../../../../domain/errors/AppError.js';
import {
  ESTADOS_LIBRO,
  ESTADOS_LIBRO_VALUES,
  OBSERVACION_CIERRE_SIN_NOTAS,
  MOTIVO_CIERRE_FORZADO_MIN_LENGTH,
} from '../../../../domain/constants/libros.constants.js';
import { toLibroDTO } from '../../../mappers/academico/LibroRegistroPresentationMapper.js';
import { cargarCuotasPoliticaGestion } from '../../../utils/obtenerCuotasDesdePolitica.js';
import {
  agruparFoliosConCursandoPorParalelo,
  clasificarFilasCursandoParalelo,
  toParaleloPendientesDTO,
  construirAsientosCierre,
} from './helpers/cierreLibroPendientesHelper.js';

/**
 * Edita la cabecera del libro (PATCH /libros/:id), incluido el cierre
 * (estado CERRADO + fecha_cierre) y la reapertura administrativa.
 * Permiso: academico.libro · EDITAR.
 *
 * numero_libro / gestión NO se editan: identifican el libro físico
 * (UNIQUE gestión); un error de identidad se resuelve anulando folios
 * y abriendo el libro correcto.
 *
 * Cierre (estado: CERRADO) — el cierre es el momento en que el snapshot
 * `folio_estudiantes.estado_academico` queda definitivamente congelado:
 * 1. Analiza las filas que siguen CURSANDO contra las notas VIVAS (vista 135,
 *    `cierreLibroPendientesHelper`): PENDIENTES (aún sin nota) vs
 *    DESACTUALIZADAS (notas cargadas después de generar el folio).
 * 2. Con pendientes y sin `forzarCierre` → 409 CONFLICT con el resumen en
 *    `details.pendientes` (por paralelo → folios con rango de apellidos
 *    inicial–final). El frontend alimenta su modal directo de esa respuesta,
 *    sin endpoint ni consulta extra.
 * 3. Con `forzarCierre: true` + `motivo` (obligatorio): los pendientes se
 *    asientan como ABANDONO con observación `OBSERVACION_CIERRE_SIN_NOTAS`
 *    (convención del libro físico: todo NP + ABANDONO), el libro pasa a
 *    CERRADO y queda auditoría (motivo, usuario y fecha) en
 *    `libros_registro.observaciones`. Todo en UNA transacción.
 * 4. Las filas desactualizadas se sincronizan SIEMPRE al cerrar (forzado o
 *    no) con el estado re-derivado (misma regla que la generación) — sin
 *    esto el cierre forzado marcaría ABANDONO a estudiantes que sí tienen
 *    notas, y el export mostraría notas con ESTADO "CURSANDO".
 * El export no cambia: celda sin nota → NP (`notaCeldaFolio`), ESTADO desde
 * el snapshot, estadísticas (vista 176) cuentan los ABANDONO. Reabrir y
 * "Generar todos los folios" re-deriva todo desde la 135 (no hay lógica inversa).
 */
export class EditarLibroUseCase {
  constructor({
    libroRegistroRepository,
    libroRegistroViewRepository,
    calificacionCentralizadorRepository,
    calificacionContextoRepository,
    evaluationConfigurationRepository,
    logger,
  }) {
    this.libroRegistroRepository = libroRegistroRepository;
    this.libroRegistroViewRepository = libroRegistroViewRepository;
    this.calificacionCentralizadorRepository = calificacionCentralizadorRepository;
    this.calificacionContextoRepository = calificacionContextoRepository;
    this.evaluationConfigurationRepository = evaluationConfigurationRepository;
    this.logger = logger;
  }

  /**
   * @param {Object} params
   * @param {number} params.usuarioId
   * @param {string|null} [params.usuarioNombre] - Username para la auditoría del cierre.
   * @param {number} params.id
   * @param {Object} params.body - { codigoRegistro?, folioFinal?, fechaApertura?,
   *   observaciones?, estado?, forzarCierre?, motivo? }
   * @returns {Promise<{libro: Object, cierre?: Object}>} `cierre` solo cuando el
   *   libro pasó a CERRADO: { forzado, pendientesAsentados, filasSincronizadas }.
   */
  async execute({ usuarioId, usuarioNombre = null, id, body = {} }) {
    const libroId = Number(id);
    const libro = await this.libroRegistroRepository.findById(libroId);
    if (!libro) {
      throw new NotFoundError('Libro de registro');
    }

    const cambios = {};

    if (body.codigoRegistro !== undefined) {
      const codigo = String(body.codigoRegistro ?? '').trim();
      if (!codigo) {
        throw new ValidationError('El código de registro no puede quedar vacío');
      }
      cambios.codigoRegistro = codigo;
    }

    if (body.folioFinal !== undefined) {
      const folioFinal = body.folioFinal != null ? Number(body.folioFinal) : null;
      if (folioFinal != null && folioFinal < (libro.folioInicial ?? 1)) {
        throw new ValidationError('El folio final no puede ser menor al folio inicial');
      }
      cambios.folioFinal = folioFinal;
    }

    if (body.fechaApertura !== undefined) {
      cambios.fechaApertura = body.fechaApertura ?? null;
    }

    if (body.observaciones !== undefined) {
      cambios.observaciones =
        body.observaciones != null ? String(body.observaciones).trim() : null;
    }

    let cierre = null;

    if (body.estado !== undefined) {
      const { estado } = body;
      if (!ESTADOS_LIBRO_VALUES.includes(estado)) {
        throw new ValidationError('Estado de libro inválido (ABIERTO o CERRADO)');
      }
      if (estado !== libro.estado) {
        if (estado === ESTADOS_LIBRO.CERRADO) {
          cierre = await this._prepararCierre(libro, body);
        }
        cambios.estado = estado;
        // Cierre del libro (la gestión terminó y el libro se completó);
        // reabrir limpia la fecha de cierre.
        cambios.fechaCierre =
          estado === ESTADOS_LIBRO.CERRADO ? new Date().toISOString().slice(0, 10) : null;
      }
    }

    if (Object.keys(cambios).length === 0) {
      throw new ValidationError('No hay cambios para aplicar');
    }

    let resumenCierre;

    if (cierre && cierre.asientos.length > 0) {
      const observacionesBase =
        cambios.observaciones !== undefined ? cambios.observaciones : libro.observaciones;
      const sello = this._selloCierre(cierre, cambios.fechaCierre, usuarioId, usuarioNombre);
      cambios.observaciones = [observacionesBase, sello]
        .filter((texto) => texto != null && String(texto).trim() !== '')
        .join('\n');

      const { filasAsentadas } = await this.libroRegistroRepository.cerrarLibro(
        { libroId, cambios, asientos: cierre.asientos },
        usuarioId,
      );

      resumenCierre = {
        forzado: cierre.forzado,
        pendientesAsentados: cierre.pendientes.total,
        filasSincronizadas: cierre.desactualizadas.total,
      };

      this.logger?.[cierre.forzado ? 'warn' : 'info'](
        cierre.forzado ? '[Libros] Libro cerrado con pendientes' : '[Libros] Libro cerrado',
        {
          id: libroId,
          usuarioId,
          usuarioNombre,
          filasAsentadas,
          ...resumenCierre,
          paralelosConPendientes: cierre.pendientes.totalParalelos,
          motivo: cierre.motivo,
        },
      );
    } else {
      await this.libroRegistroRepository.update(libroId, cambios, usuarioId);
      if (cierre) {
        resumenCierre = { forzado: false, pendientesAsentados: 0, filasSincronizadas: 0 };
      }
    }

    this.logger?.info('[Libros] Libro editado', { id: libroId, cambios: Object.keys(cambios) });

    const row = await this.libroRegistroViewRepository.obtenerLibroPorId(libroId);
    const libroDTO = toLibroDTO(row);
    return resumenCierre ? { libro: libroDTO, cierre: resumenCierre } : { libro: libroDTO };
  }

  /**
   * Compuerta de cierre: analiza pendientes/desactualizadas y decide si el
   * cierre procede (sin pendientes, o forzado con motivo) o se rechaza con
   * 409 + desglose.
   * @param {Object} libro - Entidad del libro.
   * @param {Object} body - { forzarCierre?, motivo? }
   * @returns {Promise<{ forzado:boolean, motivo:string|null, pendientes:Object,
   *   desactualizadas:{ total:number }, asientos:Array<Object> }>}
   */
  async _prepararCierre(libro, body) {
    const analisis = await this._analizarCierre(libro);
    const forzado = body.forzarCierre === true || body.forzarCierre === 'true';

    if (analisis.pendientes.total > 0 && !forzado) {
      const { total, totalParalelos, paralelos } = analisis.pendientes;
      throw new ConflictError(
        `No se puede cerrar el libro: ${total} estudiante(s) en ${totalParalelos} paralelo(s) ` +
          'todavía tienen materias sin nota final cargada. Revise el detalle y reclame las ' +
          'notas a los docentes, o cierre de todos modos indicando el motivo (los pendientes ' +
          'quedarán asentados como ABANDONO).',
        {
          // Solo el resumen por paralelo/folio viaja al cliente (sin `filas`).
          pendientes: { total, totalParalelos, paralelos },
          desactualizadas: { total: analisis.desactualizadas.total },
        },
      );
    }

    let motivo = null;
    if (analisis.pendientes.total > 0) {
      motivo = String(body.motivo ?? '').trim();
      if (motivo.length < MOTIVO_CIERRE_FORZADO_MIN_LENGTH) {
        throw new ValidationError(
          `Indique el motivo del cierre con notas pendientes (mínimo ${MOTIVO_CIERRE_FORZADO_MIN_LENGTH} caracteres)`,
        );
      }
    }

    const asientos = construirAsientosCierre({
      pendientes: analisis.pendientes.filas,
      desactualizadas: analisis.desactualizadas.filas,
      observacionAbandono: OBSERVACION_CIERRE_SIN_NOTAS,
    });

    return {
      forzado: analisis.pendientes.total > 0,
      motivo,
      pendientes: analisis.pendientes,
      desactualizadas: { total: analisis.desactualizadas.total },
      asientos,
    };
  }

  /**
   * Desglose de las filas CURSANDO del libro contra las notas vivas. Sin SQL
   * nuevo: vista 176 (folios con `total_cursando`), nómina congelada por folio
   * y vista 135 por paralelo (¿queda alguna materia sin `nota_final`?).
   * `paralelos` es el resumen que viaja al cliente (por folio: rango de
   * apellidos); `filas` son las filas crudas (con `folioEstudianteId`) para
   * los asientos del cierre.
   * @param {Object} libro
   * @returns {Promise<{ pendientes:{ total:number, totalParalelos:number,
   *   paralelos:Array<Object>, filas:Array<Object> },
   *   desactualizadas:{ total:number, filas:Array<Object> } }>}
   */
  async _analizarCierre(libro) {
    const folios = await this.libroRegistroViewRepository.listarFoliosPorLibro(libro.id);
    const grupos = agruparFoliosConCursandoPorParalelo(folios);

    const vacio = {
      pendientes: { total: 0, totalParalelos: 0, paralelos: [], filas: [] },
      desactualizadas: { total: 0, filas: [] },
    };
    if (grupos.length === 0) return vacio;

    // Nota mínima institucional (política vigente de la gestión del libro),
    // una sola vez para todo el análisis — misma fuente que la generación.
    const { notaMinimaAprobacion } = await cargarCuotasPoliticaGestion({
      calificacionContextoRepository: this.calificacionContextoRepository,
      evaluationConfigurationRepository: this.evaluationConfigurationRepository,
      gestionId: libro.gestionId,
    });

    const paralelos = [];
    const pendientes = [];
    const desactualizadas = [];

    for (const grupo of grupos) {
      // Secuencial por paralelo a propósito (volumen acotado: paralelos de una
      // gestión); dentro del paralelo, nóminas y 135 en paralelo.
      // eslint-disable-next-line no-await-in-loop
      const [filas135, ...nominas] = await Promise.all([
        this.calificacionCentralizadorRepository.listarFilasCentralizadorPorParaleloGestion(
          grupo.paraleloGestionId,
        ),
        ...grupo.folios.map((folio) =>
          this.libroRegistroRepository.listarEstudiantesFolio(folio.id),
        ),
      ]);
      const nominasPorFolio = new Map(grupo.folios.map((folio, i) => [folio.id, nominas[i]]));

      const clasificacion = clasificarFilasCursandoParalelo({
        folios: grupo.folios,
        nominasPorFolio,
        filas135,
        notaMinimaAprobacion,
      });

      const dto = toParaleloPendientesDTO(grupo, clasificacion.pendientes);
      if (dto) paralelos.push(dto);
      pendientes.push(...clasificacion.pendientes);
      desactualizadas.push(...clasificacion.desactualizadas);
    }

    return {
      pendientes: {
        total: pendientes.length,
        totalParalelos: paralelos.length,
        paralelos,
        filas: pendientes,
      },
      desactualizadas: { total: desactualizadas.length, filas: desactualizadas },
    };
  }

  /**
   * Línea de auditoría que se anexa a `libros_registro.observaciones` al cerrar
   * con asientos (pendientes forzados y/o filas sincronizadas).
   * @param {Object} cierre - Salida de `_prepararCierre`.
   * @param {string} fechaCierre - YYYY-MM-DD
   * @param {number|null} usuarioId
   * @param {string|null} usuarioNombre
   * @returns {string}
   */
  _selloCierre(cierre, fechaCierre, usuarioId, usuarioNombre) {
    const usuario = usuarioNombre || (usuarioId != null ? `#${usuarioId}` : 'sistema');
    const partes = [];

    if (cierre.forzado) {
      partes.push(
        `Cerrado con ${cierre.pendientes.total} estudiante(s) sin notas asentado(s) como ABANDONO ` +
          `en ${cierre.pendientes.totalParalelos} paralelo(s)`,
      );
    }
    if (cierre.desactualizadas.total > 0) {
      partes.push(
        `${cierre.desactualizadas.total} fila(s) de folio actualizada(s) con las notas cargadas ` +
          'tras generar el folio',
      );
    }
    if (cierre.motivo) {
      partes.push(`Motivo: ${cierre.motivo}`);
    }

    return `[Cierre ${fechaCierre}] ${partes.join('. ')}. Usuario: ${usuario}.`;
  }
}

export default EditarLibroUseCase;
