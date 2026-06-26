/**
 * Helper compartido del Boletín de Calificaciones (.pdf).
 *
 * Arma el payload `datos` de UN estudiante con la forma que consume
 * `BoletinPdfGenerator.generarBoletinEstudiante`, a partir de:
 *  - `matriz`: salida de GetCentralizadorParaleloUseCase (misma fuente que la
 *    pantalla del centralizador), de la que se extrae el estudiante objetivo y sus
 *    notas por asignatura.
 *  - `cabeceraRow`: fila de la vista 87 (carrera, periodo/curso, paralelo) obtenida
 *    con ParallelRepository.obtenerCabeceraParaleloGestion.
 *
 * La fila de pie "Promedio Anual" usa el promedio de la clase por parcial (media de
 * todas las notas bimestrales de todos los estudiantes y asignaturas del paralelo).
 */

/**
 * @param {Object} params
 * @param {Object} params.matriz - Salida de GetCentralizadorParaleloUseCase.
 * @param {Object|null} params.cabeceraRow - Fila de la vista 87 del paralelo.
 * @param {number|string} params.estudianteId - Estudiante objetivo.
 * @returns {{ datos: Object, fileNameParts: Object } | null} `null` si el estudiante
 *   no pertenece al paralelo.
 */
export function construirDatosBoletinEstudiante({ matriz, cabeceraRow, estudianteId }) {
  const id = Number(estudianteId);
  const estudiantes = matriz?.estudiantes ?? [];
  const asignaturas = [...(matriz?.asignaturas ?? [])].sort(
    (a, b) => (a.orden ?? 0) - (b.orden ?? 0)
  );

  const est = estudiantes.find((e) => Number(e.estudianteId) === id);
  if (!est) return null;

  const filas = asignaturas.map((asig) => {
    const nota = est.notas?.[asig.ofertaCursoId] ?? {};
    return {
      codigo: asig.sigla ?? '',
      asignatura: asig.nombre ?? '',
      par1: nota.bim1 ?? null,
      par2: nota.bim2 ?? null,
      par3: nota.bim3 ?? null,
      par4: nota.bim4 ?? null,
      prom: nota.notaAnual != null ? Math.round(Number(nota.notaAnual)) : null,
      hab: null,
      final: nota.notaFinal != null ? Math.round(Number(nota.notaFinal)) : null,
      obs: ''
    };
  });

  // Promedio de clase por parcial: media (redondeada, ignorando null) de las notas
  // bimestrales de TODOS los estudiantes y TODAS las asignaturas del paralelo.
  const bimKeys = ['bim1', 'bim2', 'bim3', 'bim4'];
  const promedioClasePorParcial = {};
  bimKeys.forEach((bimKey, idx) => {
    let suma = 0;
    let cuenta = 0;
    estudiantes.forEach((e) => {
      asignaturas.forEach((asig) => {
        const valor = e.notas?.[asig.ofertaCursoId]?.[bimKey];
        if (valor != null && Number.isFinite(Number(valor))) {
          suma += Number(valor);
          cuenta += 1;
        }
      });
    });
    promedioClasePorParcial[`par${idx + 1}`] = cuenta > 0 ? Math.round(suma / cuenta) : null;
  });

  const cabecera = {
    estudiante: est.nombreCompleto ?? '',
    codigoEstudiante: est.codigoEstudiante ?? '',
    ci: est.ci ?? '',
    carrera: cabeceraRow?.carrera_nombre ?? '',
    nivel: 'TÉCNICO SUPERIOR',
    curso: cabeceraRow?.periodo_nombre ?? '',
    paralelo: cabeceraRow?.paralelo_nombre ?? '',
    regimen: 'ANUALIZADO',
    gestion: matriz?.gestionAnio ?? ''
  };

  const datos = {
    titulo: 'BOLETIN DE CALIFICACIONES',
    institucion: 'INSTITUTO TÉCNICO INCOS SANTA CRUZ',
    cabecera,
    notaMinimaAprobacion: matriz?.notaMinimaAprobacion,
    filas,
    promedioClasePorParcial
  };

  return {
    datos,
    fileNameParts: {
      carrera: cabecera.carrera,
      curso: cabecera.curso,
      paralelo: cabecera.paralelo,
      estudiante: cabecera.estudiante,
      gestion: cabecera.gestion
    }
  };
}

export default construirDatosBoletinEstudiante;
