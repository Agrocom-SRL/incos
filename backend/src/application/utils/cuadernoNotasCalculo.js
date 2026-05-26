/**
 * Cálculo de nota_teorico / nota_practico / nota_final desde evaluaciones_notas.
 * Modelo por puntos: cada celda aporta puntos enteros; el componente es la suma.
 */

const redondear = (v) => (v == null ? null : Math.round(Number(v) * 100) / 100);

/**
 * Suma de puntos obtenidos en actividades de un componente (0..cuota).
 *
 * @param {Array<{ componente: string, nota: number }>} filas
 * @param {'TEORICO'|'PRACTICO'} componente
 */
export const calcularNotaComponente = (filas, componente) => {
  const delComponente = (filas ?? []).filter(
    (f) => f.componente === componente && f.nota != null && Number.isFinite(Number(f.nota)),
  );
  if (delComponente.length === 0) return null;

  const suma = delComponente.reduce((acc, f) => acc + Math.round(Number(f.nota)), 0);
  return suma;
};

/**
 * @param {Array<{ bimestreMatriculaId: number, componente: string, nota: number }>} filas
 * @returns {Map<number, { teorico: number|null, practico: number|null, bimestre: number|null }>}
 */
export const agruparYCalcularPorBimestreMatricula = (filas) => {
  const porBm = new Map();
  for (const row of filas ?? []) {
    const id = Number(row.bimestreMatriculaId);
    if (!Number.isFinite(id)) continue;
    if (!porBm.has(id)) porBm.set(id, []);
    porBm.get(id).push(row);
  }

  const resultado = new Map();
  for (const [bmId, grupo] of porBm.entries()) {
    const teorico = calcularNotaComponente(grupo, 'TEORICO');
    const practico = calcularNotaComponente(grupo, 'PRACTICO');
    resultado.set(bmId, {
      teorico,
      practico,
      bimestre: calcularNotaBimestre(teorico, practico),
    });
  }
  return resultado;
};

/**
 * @param {number|null} teorico
 * @param {number|null} practico
 */
export const calcularNotaBimestre = (teorico, practico) => {
  if (teorico == null && practico == null) return null;
  return redondear((Number(teorico) || 0) + (Number(practico) || 0));
};

/**
 * Componente efectivo: habilitación del sector reemplaza la nota del componente.
 */
export const componenteEfectivo = (habilitacion, notaComponente) => {
  if (habilitacion != null) return redondear(habilitacion);
  if (notaComponente != null) return redondear(notaComponente);
  return null;
};

/**
 * Nota efectiva del bimestre: nota_bimestre cerrada, o suma de componentes efectivos.
 */
export const notaEfectivaBimestre = (row) => {
  const bim = row?.notaBimestre ?? row?.nota_bimestre;
  if (bim != null) return redondear(bim);

  const teo = componenteEfectivo(
    row?.habilitacionTeorico ?? row?.habilitacion_teorico,
    row?.notaTeorico ?? row?.nota_teorico,
  );
  const pra = componenteEfectivo(
    row?.habilitacionPractico ?? row?.habilitacion_practico,
    row?.notaPractico ?? row?.nota_practico,
  );
  return calcularNotaBimestre(teo, pra);
};

/**
 * nota_final = Σ(nota_bimestre × peso_bimestre) / Σ(peso) — solo los 4 bimestres.
 *
 * @param {Array<{ numero: number, nota: number|null }>} bimestres
 * @param {number[]} pesosBimestres — 4 ponderaciones institucionales (% del año)
 */
export const calcularNotaFinalPonderada = (bimestres, pesosBimestres) => {
  let suma = 0;
  let pesoTotal = 0;

  const pesos = Array.isArray(pesosBimestres) ? pesosBimestres : [];
  for (let i = 0; i < 4; i++) {
    const numero = i + 1;
    const peso = Number(pesos[i]) || 0;
    const fila = (bimestres ?? []).find((b) => Number(b.numero) === numero);
    const nota = fila?.nota != null ? Number(fila.nota) : null;
    if (nota != null && peso > 0) {
      suma += nota * peso;
      pesoTotal += peso;
    }
  }

  if (pesoTotal <= 0) return null;
  return redondear(suma / pesoTotal);
};

/**
 * Nota anual para registro académico: Σ(nota × peso) / Σ(pesos institucionales de los 4 bimestres).
 * Bimestres sin nota no aportan al numerador; el divisor es siempre el 100 % del año.
 */
export const calcularNotaFinalGestion = (bimestres, pesosBimestres) => {
  const pesos = Array.isArray(pesosBimestres) ? pesosBimestres : [];
  let sumaPonderada = 0;
  let pesoDivisor = 0;
  let tieneAlgunaNota = false;

  for (let i = 0; i < 4; i++) {
    const numero = i + 1;
    const peso = Number(pesos[i]) || 0;
    pesoDivisor += peso;
    const fila = (bimestres ?? []).find((b) => Number(b.numero) === numero);
    const nota = fila?.nota != null && fila?.nota !== '' ? Number(fila.nota) : null;
    if (nota != null && Number.isFinite(nota)) {
      tieneAlgunaNota = true;
      sumaPonderada += nota * peso;
    }
  }

  if (!tieneAlgunaNota || pesoDivisor <= 0) {
    return { notaFinal: null, gestionCompleta: false };
  }

  const gestionCompleta = (bimestres ?? []).every((b) => {
    const n = Number(b.numero);
    if (!Number.isFinite(n) || n < 1 || n > 4) return true;
    return b.nota != null && b.nota !== '';
  });

  return {
    notaFinal: redondear(sumaPonderada / pesoDivisor),
    gestionCompleta,
  };
};
