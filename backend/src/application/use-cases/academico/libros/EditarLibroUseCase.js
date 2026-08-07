import { ValidationError, NotFoundError, ConflictError } from '../../../../domain/errors/AppError.js';
import {
  ESTADOS_LIBRO,
  ESTADOS_LIBRO_VALUES,
  ESTADOS_FOLIO,
} from '../../../../domain/constants/libros.constants.js';
import { toLibroDTO } from '../../../mappers/academico/LibroRegistroPresentationMapper.js';

/**
 * Edita la cabecera del libro (PATCH /libros/:id), incluido el cierre
 * (estado CERRADO + fecha_cierre) y la reapertura administrativa.
 * Permiso: academico.libro · EDITAR.
 *
 * numero_libro / gestión NO se editan: identifican el libro físico
 * (UNIQUE gestión); un error de identidad se resuelve anulando folios
 * y abriendo el libro correcto.
 */
export class EditarLibroUseCase {
  constructor({ libroRegistroRepository, libroRegistroViewRepository, logger }) {
    this.libroRegistroRepository = libroRegistroRepository;
    this.libroRegistroViewRepository = libroRegistroViewRepository;
    this.logger = logger;
  }

  /**
   * @param {Object} params
   * @param {number} params.usuarioId
   * @param {number} params.id
   * @param {Object} params.body - { codigoRegistro?, folioFinal?, fechaApertura?,
   *   observaciones?, estado? }
   * @returns {Promise<{libro: Object}>}
   */
  async execute({ usuarioId, id, body = {} }) {
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

    if (body.estado !== undefined) {
      const { estado } = body;
      if (!ESTADOS_LIBRO_VALUES.includes(estado)) {
        throw new ValidationError('Estado de libro inválido (ABIERTO o CERRADO)');
      }
      if (estado !== libro.estado) {
        if (estado === ESTADOS_LIBRO.CERRADO) {
          await this._asegurarSinPendientes(libroId);
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

    await this.libroRegistroRepository.update(libroId, cambios, usuarioId);

    this.logger?.info('[Libros] Libro editado', { id: libroId, cambios: Object.keys(cambios) });

    const row = await this.libroRegistroViewRepository.obtenerLibroPorId(libroId);
    return { libro: toLibroDTO(row) };
  }

  /**
   * Guardia de cierre (Fase C2, 2026-08-06): bloquea `estado: CERRADO` si algún
   * folio vigente (no ANULADO) del libro todavía tiene estudiantes con
   * materias sin nota_final (`estado_academico = 'CURSANDO'`, vista 176,
   * columna `total_cursando`). Sin esto se podía cerrar oficialmente el libro
   * con notas faltantes sin ningún aviso.
   * @param {number} libroId
   */
  async _asegurarSinPendientes(libroId) {
    const folios = await this.libroRegistroViewRepository.listarFoliosPorLibro(libroId);
    const pendientes = (folios ?? [])
      .filter((folio) => folio.estado !== ESTADOS_FOLIO.ANULADO)
      .reduce((acumulado, folio) => acumulado + Number(folio.total_cursando ?? 0), 0);

    if (pendientes > 0) {
      throw new ConflictError(
        `No se puede cerrar el libro: ${pendientes} estudiante(s) todavía tienen materias ` +
          'sin nota final cargada. Verifique que todos los docentes hayan completado sus ' +
          'notas antes de cerrar.',
      );
    }
  }
}

export default EditarLibroUseCase;
