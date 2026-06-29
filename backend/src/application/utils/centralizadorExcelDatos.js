/**
 * Helper compartido del Centralizador de Calificaciones (.xlsx).
 *
 * Arma el payload `datos` de UNA hoja (un paralelo, un bimestre) con EXACTAMENTE
 * la misma forma que consume `CentralizadorSheetBuilder.build`, a partir de:
 *  - `matriz`: salida de GetCentralizadorParaleloUseCase (pivote estudiantes ×
 *    asignaturas con las 4 notas de bimestre por celda).
 *  - `cabeceraRow`: fila de la vista 87 (carrera, periodo/curso, paralelo, turno,
 *    gestión) obtenida con ParallelRepository.obtenerCabeceraParaleloGestion.
 *
 * Lo usan ambos use cases de exportación (Fase 1 = un paralelo; Fase 2 = un libro
 * por carrera con una hoja por paralelo) para NO duplicar el armado de `datos`.
 */

export const BIMESTRE_ORDINAL = ['', 'PRIMER', 'SEGUNDO', 'TERCER', 'CUARTO'];

/** Sanea un fragmento para usarlo en el nombre de archivo de descarga. */
export const sanitizarFilePart = (value) =>
  String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\dA-Za-z._-]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 40) || 'export';

/**
 * Proyecta la matriz a la nota del bimestre N por asignatura y deriva
 * ESTADO/OBSERVACIONES de ese bimestre (paridad pantalla ↔ Excel).
 *
 * @param {Object} params
 * @param {Object} params.matriz - Salida de GetCentralizadorParaleloUseCase.
 * @param {Object|null} params.cabeceraRow - Fila de la vista 87 del paralelo.
 * @param {number} params.bimestre - Bimestre 1..4 a proyectar.
 * @returns {{
 *   datos: Object,
 *   carrera: string,
 *   periodo: string,
 *   paralelo: string,
 *   turno: string,
 *   gestionAnio: (number|string)
 * }}
 */
export function construirDatosCentralizadorParalelo({ matriz, cabeceraRow, bimestre }) {
  const bimestreNum = Number(bimestre);
  const notaMin = Number(matriz?.notaMinimaAprobacion);
  const bimKey = `bim${bimestreNum}`;
  const asignaturas = matriz?.asignaturas ?? [];

  const estudiantes = (matriz?.estudiantes ?? []).map((est, idx) => {
    const celdas = {};
    let reprobadas = 0;
    let conNota = 0;
    asignaturas.forEach((asig) => {
      const nota = est.notas?.[asig.ofertaCursoId]?.[bimKey] ?? null;
      const aprobado = nota != null && Number.isFinite(notaMin) && Number(nota) >= notaMin;
      if (nota != null) {
        conNota += 1;
        if (!aprobado) reprobadas += 1;
      }
      celdas[asig.ofertaCursoId] = { nota, aprobado };
    });

    // ESTADO/OBSERVACIONES del bimestre: CURSANDO mientras el bimestre esté
    // incompleto (faltan notas); cuando TODAS las materias tienen nota →
    // APROBADO (0 reprobadas) o REPROBADO (al menos una debajo de la mínima).
    const totalAsig = asignaturas.length;
    let estado = 'CURSANDO';
    let observacion = '';
    const obsDocente = String(est.observacionesBimestre?.[bimestreNum] ?? '').trim();
    if (totalAsig > 0 && conNota === totalAsig) {
      estado = reprobadas === 0 ? 'APROBADO' : 'REPROBADO';
    }
    if (obsDocente) {
      observacion = obsDocente;
    } else if (reprobadas > 0) {
      observacion = `${reprobadas} ${reprobadas === 1 ? 'materia' : 'materias'} por debajo de ${notaMin}`;
    }

    return {
      nro: idx + 1,
      codigoEstudiante: est.codigoEstudiante ?? '',
      ci: est.ci ?? '',
      nombreCompleto: est.nombreCompleto ?? '',
      estado,
      observacion,
      celdas
    };
  });

  const carrera = cabeceraRow?.carrera_nombre ?? '';
  const periodo = cabeceraRow?.periodo_nombre ?? '';
  const paralelo = cabeceraRow?.paralelo_nombre ?? '';
  const turno = cabeceraRow?.turno ?? '';
  const gestionAnio = matriz?.gestionAnio ?? '';

  const datos = {
    titulo: 'CENTRALIZADOR DE CALIFICACIONES',
    institucion: 'INSTITUTO TÉCNICO INCOS SANTA CRUZ',
    cabecera: {
      carrera,
      periodo,
      paralelo,
      turno,
      gestionAnio,
      gestionNombre: matriz?.gestionNombre ?? null,
      bimestre: bimestreNum,
      bimestreLabel: `${BIMESTRE_ORDINAL[bimestreNum] ?? ''} BIMESTRE`.trim()
    },
    notaMinimaAprobacion: matriz?.notaMinimaAprobacion,
    asignaturas,
    estudiantes
  };

  return { datos, carrera, periodo, paralelo, turno, gestionAnio };
}

export default construirDatosCentralizadorParalelo;
