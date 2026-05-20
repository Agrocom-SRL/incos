/**
 * Cálculo en vivo de nota teórico / práctico / bimestre (vista previa, sin persistir).
 * Alineado al modelo: promedio ponderado 0–100 por componente, reescala a cuota.
 */

import { calcularSumaPesosComponente } from './pesoEvaluaciones.js';

const redondear = (n) => Math.round(n * 100) / 100;

export const validarPesosBimestre = (evaluaciones = []) => {
  const sumaTeorico = calcularSumaPesosComponente(evaluaciones, 'TEORICO', 0);
  const sumaPractico = calcularSumaPesosComponente(evaluaciones, 'PRACTICO', 0);
  const evTeorico = evaluaciones.filter((e) => e.componente === 'TEORICO');
  const evPractico = evaluaciones.filter((e) => e.componente === 'PRACTICO');

  const mensaje = (componente, suma, tieneEvals) => {
    if (!tieneEvals) return null;
    if (suma === 100) return null;
    if (suma > 100) {
      return `El componente ${componente} suma ${suma}% (supera 100%). Editá los pesos en las columnas del cuaderno.`;
    }
    return `El componente ${componente} suma ${suma}% de 100%. Agregá evaluaciones o ajustá pesos antes del cierre.`;
  };

  return {
    sumaTeorico,
    sumaPractico,
    teoricoCompleto: evTeorico.length === 0 || sumaTeorico === 100,
    practicoCompleto: evPractico.length === 0 || sumaPractico === 100,
    tieneTeorico: evTeorico.length > 0,
    tienePractico: evPractico.length > 0,
    alertas: [
      mensaje('Teórico', sumaTeorico, evTeorico.length > 0),
      mensaje('Práctico', sumaPractico, evPractico.length > 0),
    ].filter(Boolean),
    pesosListos:
      (evTeorico.length === 0 || sumaTeorico === 100) &&
      (evPractico.length === 0 || sumaPractico === 100),
  };
};

const promedioPonderadoComponente = (estudiante, evaluacionesComponente) => {
  if (evaluacionesComponente.length === 0) {
    return { promedio: null, incompleto: false, faltantes: 0 };
  }

  let faltantes = 0;
  let sumaPonderada = 0;

  for (const ev of evaluacionesComponente) {
    const raw = estudiante.notas?.[ev.id];
    if (raw == null || raw === '') {
      faltantes += 1;
      continue;
    }
    sumaPonderada += Number(raw) * Number(ev.peso || 0);
  }

  if (faltantes > 0) {
    return { promedio: null, incompleto: true, faltantes };
  }

  return { promedio: redondear(sumaPonderada / 100), incompleto: false, faltantes: 0 };
};

export const calcularFilaEstudiante = (estudiante, evaluaciones, cuota) => {
  const evTeorico = evaluaciones.filter((e) => e.componente === 'TEORICO');
  const evPractico = evaluaciones.filter((e) => e.componente === 'PRACTICO');

  const resTeorico = promedioPonderadoComponente(estudiante, evTeorico);
  const resPractico = promedioPonderadoComponente(estudiante, evPractico);

  const notaTeorico =
    resTeorico.promedio != null
      ? redondear((resTeorico.promedio * cuota.teorico) / 100)
      : null;
  const notaPractico =
    resPractico.promedio != null
      ? redondear((resPractico.promedio * cuota.practico) / 100)
      : null;

  const notaBimestre =
    notaTeorico != null && notaPractico != null
      ? redondear(notaTeorico + notaPractico)
      : null;

  return {
    estudianteId: estudiante.id,
    nombre: estudiante.nombre,
    notaTeorico,
    notaPractico,
    notaBimestre,
    incompletoTeorico: resTeorico.incompleto,
    incompletoPractico: resPractico.incompleto,
    faltantes: resTeorico.faltantes + resPractico.faltantes,
    incompleto: resTeorico.incompleto || resPractico.incompleto,
  };
};

export const calcularVistaPrevia = ({ estudiantes = [], evaluaciones = [], cuota }) => {
  const validacionPesos = validarPesosBimestre(evaluaciones);
  const filas = estudiantes.map((est) =>
    calcularFilaEstudiante(est, evaluaciones, cuota),
  );

  const conFaltantes = filas.filter((f) => f.incompleto).length;
  const calculables = filas.filter((f) => f.notaBimestre != null).length;

  return {
    filas,
    validacionPesos,
    cuota,
    resumen: {
      total: filas.length,
      calculables,
      conFaltantes,
    },
  };
};
