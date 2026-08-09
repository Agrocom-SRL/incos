/**
 * Helper compartido del Boletín de Calificaciones (.pdf).
 *
 * Arma el payload `datos` de UN estudiante con la forma que consume
 * `BoletinPdfGenerator.generarBoletinEstudiante`, a partir de:
 *  - `matriz`: salida de GetCentralizadorParaleloUseCase (misma fuente que la
 *    pantalla del centralizador), de la que se extrae el estudiante objetivo y sus
 *    notas por asignatura (incluye estado APROBADO/REPROBADO según la escala
 *    vigente y las observaciones del bimestre a nivel estudiante).
 *  - `cabeceraRow`: fila de la vista 87 (carrera, periodo/curso, paralelo) obtenida
 *    con ParallelRepository.obtenerCabeceraParaleloGestion.
 *  - `desgloseBimestre` (solo boletín BIMESTRAL): filas de la vista 119 (unida a
 *    la 135 por matricula_materia_id) con el desglose TEÓRICO/PRÁCTICO del
 *    bimestre pedido — regla institucional: nota_bimestre = teórico + práctico.
 *
 * Dos tipos de boletín:
 *  - ANUAL (sin `bimestre`): tabla con los 4 parciales + PROM/HAB/FINAL, columna
 *    OBSERVACIONES con el estado por asignatura y fila de pie "Promedio Anual"
 *    con el promedio de la clase por parcial (media de todas las notas
 *    bimestrales de todos los estudiantes y asignaturas del paralelo).
 *  - BIMESTRAL (`bimestre` 1..4): tabla con TEÓRICA + PRÁCTICA = TOTAL y ESTADO
 *    del bimestre por asignatura; el pie lleva el promedio de clase del bimestre.
 */

const toNumberOrNull = (value) => {
  if (value == null || value === '') return null;
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
};

/**
 * Líneas "Nº BIMESTRE: texto" con las observaciones del estudiante
 * (bimestres_matricula.observaciones, una por bimestre). Solo las presentes.
 * @param {Object|null} obsMap - est.observacionesBimestre ({1..4: texto|null}).
 * @param {number[]} bimestres - Bimestres a incluir.
 * @returns {string[]}
 */
const construirLineasObservaciones = (obsMap, bimestres) => {
  if (!obsMap) return [];
  return bimestres
    .map((n) => {
      const texto = obsMap[n] ?? obsMap[String(n)] ?? null;
      const limpio = texto != null ? String(texto).trim() : '';
      return limpio ? `${n}º BIMESTRE: ${limpio}` : null;
    })
    .filter(Boolean);
};

/**
 * @param {Object} params
 * @param {Object} params.matriz - Salida de GetCentralizadorParaleloUseCase.
 * @param {Object|null} params.cabeceraRow - Fila de la vista 87 del paralelo.
 * @param {number|string} params.estudianteId - Estudiante objetivo.
 * @param {number|null} [params.bimestre] - Bimestre (1..4) para el boletín
 *   BIMESTRAL; sin él, boletín ANUAL.
 * @param {Array<Object>|null} [params.desgloseBimestre] - Filas del desglose
 *   teórico/práctico del bimestre (CalificacionCentralizadorRepository
 *   .listarDesgloseBimestrePorEstudiante), requeridas para el boletín bimestral.
 * @returns {{ datos: Object, fileNameParts: Object } | null} `null` si el estudiante
 *   no pertenece al paralelo.
 */
export function construirDatosBoletinEstudiante({
  matriz,
  cabeceraRow,
  estudianteId,
  bimestre,
  desgloseBimestre
}) {
  const id = Number(estudianteId);
  const bim = bimestre != null ? Number(bimestre) : null;
  const esBimestral = Number.isInteger(bim) && bim >= 1 && bim <= 4;
  const estudiantes = matriz?.estudiantes ?? [];
  const asignaturas = [...(matriz?.asignaturas ?? [])].sort(
    (a, b) => (a.orden ?? 0) - (b.orden ?? 0)
  );

  const est = estudiantes.find((e) => Number(e.estudianteId) === id);
  if (!est) return null;

  const notaMinimaAprobacion = toNumberOrNull(matriz?.notaMinimaAprobacion);

  let filas;
  if (esBimestral) {
    // Boletín BIMESTRAL: desglose teórico/práctico por asignatura (vista 119).
    // Efectivo = nota consolidada o, si el bimestre sigue abierto, la suma del
    // cuaderno (misma regla que `nota_efectiva` de la vista). El ESTADO solo se
    // emite con el bimestre CERRADO (nota definitiva) según la escala vigente.
    const desgloseMap = new Map(
      (Array.isArray(desgloseBimestre) ? desgloseBimestre : []).map((row) => [
        Number(row.oferta_curso_id),
        row
      ])
    );
    filas = asignaturas.map((asig) => {
      const d = desgloseMap.get(Number(asig.ofertaCursoId)) ?? {};
      const tieneRegistro = Number(d.tiene_registro) === 1;
      const teo =
        toNumberOrNull(d.nota_teorico) ??
        (tieneRegistro ? toNumberOrNull(d.cuaderno_teorico) : null);
      const pra =
        toNumberOrNull(d.nota_practico) ??
        (tieneRegistro ? toNumberOrNull(d.cuaderno_practico) : null);
      const total = tieneRegistro ? toNumberOrNull(d.nota_efectiva) : null;
      let estado = '';
      if (d.estado_bimestre === 'CERRADO' && total != null && notaMinimaAprobacion != null) {
        estado = total >= notaMinimaAprobacion ? 'APROBADO' : 'REPROBADO';
      } else if (!tieneRegistro && est.notas?.[asig.ofertaCursoId]?.observacion === 'ABANDONO') {
        // Bimestre sin nota real (el retiro ocurrió antes de que el docente
        // cargara este bimestre): mostrar el veredicto de la matrícula en vez
        // de dejarlo en blanco. Un bimestre con nota real ya cargada antes
        // del retiro no entra aquí (tieneRegistro=true) y conserva su nota.
        estado = 'ABANDONO';
      }
      return {
        codigo: asig.sigla ?? '',
        asignatura: asig.nombre ?? '',
        teo,
        pra,
        total,
        estado
      };
    });
  } else {
    // Boletín ANUAL: 4 parciales + resumen. OBSERVACIONES lleva el estado por
    // asignatura (APROBADO/REPROBADO según la escala vigente, solo con la
    // gestión completa — `observacion` de la matriz del centralizador).
    filas = asignaturas.map((asig) => {
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
        obs: nota.observacion ?? ''
      };
    });
  }

  // Promedio de clase por parcial: media (redondeada, ignorando null) de las notas
  // bimestrales de TODOS los estudiantes y TODAS las asignaturas del paralelo.
  const promedioClasePorBim = (bimKey) => {
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
    return cuenta > 0 ? Math.round(suma / cuenta) : null;
  };

  // Pie de tabla: en el ANUAL una celda por parcial; en el BIMESTRAL el promedio
  // de clase del bimestre bajo la columna TOTAL. Las claves calzan con las
  // columnas de la tabla (el generador pinta solo las presentes).
  const promedioClasePorParcial = esBimestral
    ? { total: promedioClasePorBim(`bim${bim}`) }
    : {
        par1: promedioClasePorBim('bim1'),
        par2: promedioClasePorBim('bim2'),
        par3: promedioClasePorBim('bim3'),
        par4: promedioClasePorBim('bim4')
      };

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

  // Boletín BIMESTRAL: la cabecera indica el bimestre y el generador usa el set
  // de columnas bimestral (`datos.bimestre`) y la etiqueta de pie (`footerRowLabel`).
  if (esBimestral) {
    cabecera.bimestre = `${bim}º BIMESTRE`;
  }

  // Observaciones del estudiante (una por bimestre, a nivel estudiante): en el
  // anual se listan todas las presentes; en el bimestral solo la del bimestre.
  const observaciones = construirLineasObservaciones(
    est.observacionesBimestre ?? null,
    esBimestral ? [bim] : [1, 2, 3, 4]
  );

  const datos = {
    titulo: 'BOLETIN DE CALIFICACIONES',
    institucion: 'INSTITUTO TÉCNICO INCOS SANTA CRUZ',
    cabecera,
    notaMinimaAprobacion: matriz?.notaMinimaAprobacion,
    filas,
    promedioClasePorParcial,
    observaciones,
    ...(esBimestral
      ? { bimestre: bim, footerRowLabel: `PROMEDIO ${bim}º BIMESTRE` }
      : {})
  };

  return {
    datos,
    fileNameParts: {
      carrera: cabecera.carrera,
      curso: cabecera.curso,
      paralelo: cabecera.paralelo,
      estudiante: cabecera.estudiante,
      gestion: cabecera.gestion,
      bimestre: esBimestral ? bim : null
    }
  };
}

export default construirDatosBoletinEstudiante;
