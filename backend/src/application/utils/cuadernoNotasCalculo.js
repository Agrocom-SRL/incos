/**
 * Cálculo de nota_teorico / nota_practico / nota_final desde evaluaciones_notas.
 */

const redondear = (v) => (v == null ? null : Math.round(Number(v) * 100) / 100);

/**
 * @param {Array<{ componente: string, peso: number, nota: number }>} filas
 * @param {'TEORICO'|'PRACTICO'} componente
 * @param {number} cuota
 */
export const calcularNotaComponente = (filas, componente, cuota) => {
  const delComponente = (filas ?? []).filter(
    (f) => f.componente === componente && f.nota != null && Number.isFinite(Number(f.nota)),
  );
  if (delComponente.length === 0) return null;

  const sumaPeso = delComponente.reduce((acc, f) => acc + Number(f.peso || 0), 0);
  if (sumaPeso <= 0) return null;

  const ponderada =
    delComponente.reduce((acc, f) => acc + Number(f.nota) * Number(f.peso || 0), 0) / sumaPeso;

  return redondear((ponderada * Number(cuota)) / 100);
};

/**
 * Promedio ponderado del componente sobre 100 (sin aplicar cuota teórica/práctica).
 */
export const calcularPromedioComponenteSinCuota = (filas, componente) => {
  const delComponente = (filas ?? []).filter(
    (f) => f.componente === componente && f.nota != null && Number.isFinite(Number(f.nota)),
  );
  if (delComponente.length === 0) return null;

  const sumaPeso = delComponente.reduce((acc, f) => acc + Number(f.peso || 0), 0);
  if (sumaPeso <= 0) return null;

  const ponderada =
    delComponente.reduce((acc, f) => acc + Number(f.nota) * Number(f.peso || 0), 0) / sumaPeso;

  return redondear(ponderada);
};

/**
 * Convierte nota en cuota (ej. 25 sobre cuota 30) a promedio sobre 100 para el registro.
 */
export const notaCuotaAPromedio100 = (notaCuota, cuota) => {
  if (notaCuota == null || cuota == null || Number(cuota) <= 0) return null;
  return redondear((Number(notaCuota) / Number(cuota)) * 100);
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
 * @param {Array<{ bimestreMatriculaId: number, componente: string, peso: number, nota: number }>} filas
 * @param {{ cuotaTeorico: number, cuotaPractico: number }} cuotas
 * @returns {Map<number, { teorico: number|null, practico: number|null, bimestre: number|null }>}
 */
export const agruparYCalcularPorBimestreMatricula = (filas, cuotas) => {
  const porBm = new Map();
  for (const row of filas ?? []) {
    const id = Number(row.bimestreMatriculaId);
    if (!Number.isFinite(id)) continue;
    if (!porBm.has(id)) porBm.set(id, []);
    porBm.get(id).push(row);
  }

  const resultado = new Map();
  for (const [bmId, grupo] of porBm.entries()) {
    const teorico = calcularNotaComponente(grupo, 'TEORICO', cuotas.cuotaTeorico);
    const practico = calcularNotaComponente(grupo, 'PRACTICO', cuotas.cuotaPractico);
    resultado.set(bmId, {
      teorico,
      practico,
      bimestre: calcularNotaBimestre(teorico, practico),
    });
  }
  return resultado;
};

/**
 * Nota efectiva de un bimestre (habilitación reemplaza bimestre si existe).
 */
export const notaEfectivaBimestre = (row) => {
  const hab = row?.notaHabilitacion ?? row?.nota_habilitacion;
  if (hab != null) return redondear(hab);
  const bim = row?.notaBimestre ?? row?.nota_bimestre;
  return bim != null ? redondear(bim) : null;
};

/**
 * nota_final = Σ(nota_bimestre × peso_bimestre) / Σ(peso) — solo los 4 bimestres.
 *
 * @param {Array<{ numero: number, nota: number|null }>} bimestres
 * @param {number[]} pesosBimestres — 4 ponderaciones institucionales
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
