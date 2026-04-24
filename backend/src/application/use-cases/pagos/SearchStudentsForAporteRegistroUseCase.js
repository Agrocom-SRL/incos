/**
 * Búsqueda de estudiantes para registrar aporte (texto libre + estado de cabeceras de aporte).
 */

export class SearchStudentsForAporteRegistroUseCase {
  /**
   * @param {Object} params
   * @param {Object} params.studentRepository - StudentRepository
   * @param {Object} params.logger
   */
  constructor({ studentRepository, logger }) {
    if (!studentRepository) throw new Error('studentRepository es requerido');
    if (!logger) throw new Error('logger es requerido');
    this.studentRepository = studentRepository;
    this.logger = logger;
  }

  /**
   * @param {{ q?: string, limit?: number, preliminar?: boolean }} input
   * @returns {Promise<Array<Object>>}
   */
  async execute({ q, limit = 50, preliminar = false }) {
    let rows;
    if (preliminar) {
      rows = await this.studentRepository.buscarParaRegistroAporte({ preliminar: true, limit });
    } else {
      const term = String(q ?? '').trim();
      if (term.length < 2) {
        return [];
      }
      rows = await this.studentRepository.buscarParaRegistroAporte({ q: term, limit });
    }

    return rows.map((row) => this.mapRowToDto(row));
  }

  mapRowToDto(row) {
    const nombres = row.nombres ?? '';
    const ap1 = row.apellido_paterno ?? '';
    const ap2 = row.apellido_materno ?? '';
    const nombreCompleto = [nombres, ap1, ap2].filter((x) => String(x).trim()).join(' ').trim() || row.codigo_estudiante;
    const cabTotal = Number(row.cabeceras_total ?? 0);
    const cabSaldo = Number(row.cabeceras_con_saldo ?? 0);
    const saldoPendienteTotal = Number(row.saldo_pendiente_total ?? 0);
    const tieneCabeceraAporte = cabTotal > 0;
    const tieneSaldoPendiente = cabSaldo > 0;
    const aporteTotalmenteCubierto = tieneCabeceraAporte && !tieneSaldoPendiente;

    return {
      id: row.id,
      codigoEstudiante: row.codigo_estudiante,
      nombres: row.nombres,
      apellidoPaterno: row.apellido_paterno,
      apellidoMaterno: row.apellido_materno,
      nombreCompleto,
      emailPersonal: row.email_personal ?? null,
      celular: row.celular ?? null,
      telefonoFijo: row.telefono_fijo ?? null,
      ci: row.ci ?? null,
      expedicion: row.expedicion ?? null,
      carreraNombre: row.carrera_nombre ?? null,
      createdAt: row.created_at ?? null,
      aporteRegistro: {
        tieneCabeceraAporte,
        tieneSaldoPendiente,
        aporteTotalmenteCubierto,
        saldoPendienteTotal,
      },
    };
  }
}
