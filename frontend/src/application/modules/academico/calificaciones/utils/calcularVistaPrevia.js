/**
 * Cálculo en vivo de nota teórico / práctico / bimestre (vista previa, sin persistir).
 * Modelo por puntos: suma directa de puntos obtenidos por actividad.
 */

import { calcularSumaPuntosComponente } from './puntosEvaluaciones.js';

const redondear = (n) => Math.round(n * 100) / 100;

export const validarPuntosBimestre = (evaluaciones = [], cuota = { teorico: 30, practico: 70 }) => {
  const cuotaTeorico = Number(cuota.teorico) || 30;
  const cuotaPractico = Number(cuota.practico) || 70;

  const sumaTeorico = calcularSumaPuntosComponente(evaluaciones, 'TEORICO', 0);
  const sumaPractico = calcularSumaPuntosComponente(evaluaciones, 'PRACTICO', 0);
  const evTeorico = evaluaciones.filter((e) => e.componente === 'TEORICO');
  const evPractico = evaluaciones.filter((e) => e.componente === 'PRACTICO');

  const mensaje = (componente, suma, cuotaMax, tieneEvals) => {
    if (!tieneEvals) return null;
    if (suma === cuotaMax) return null;
    if (suma > cuotaMax) {
      return `El componente ${componente} suma ${suma} pts (supera ${cuotaMax} pts). Ajustá los puntos de las actividades.`;
    }
    return `El componente ${componente} suma ${suma} de ${cuotaMax} pts. Agregá actividades o completá la distribución antes del cierre.`;
  };

  return {
    sumaTeorico,
    sumaPractico,
    teoricoCompleto: evTeorico.length === 0 || sumaTeorico === cuotaTeorico,
    practicoCompleto: evPractico.length === 0 || sumaPractico === cuotaPractico,
    tieneTeorico: evTeorico.length > 0,
    tienePractico: evPractico.length > 0,
    alertas: [
      mensaje('Teórico', sumaTeorico, cuotaTeorico, evTeorico.length > 0),
      mensaje('Práctico', sumaPractico, cuotaPractico, evPractico.length > 0),
    ].filter(Boolean),
    puntosListos:
      (evTeorico.length === 0 || sumaTeorico === cuotaTeorico) &&
      (evPractico.length === 0 || sumaPractico === cuotaPractico),
  };
};

const sumaPuntosComponente = (estudiante, evaluacionesComponente) => {
  if (evaluacionesComponente.length === 0) {
    return { puntos: null, incompleto: false, faltantes: 0 };
  }

  let faltantes = 0;
  let suma = 0;

  for (const ev of evaluacionesComponente) {
    const raw = estudiante.notas?.[ev.id];
    if (raw == null || raw === '') {
      faltantes += 1;
      continue;
    }
    suma += Math.round(Number(raw));
  }

  if (faltantes > 0) {
    return { puntos: null, incompleto: true, faltantes };
  }

  return { puntos: suma, incompleto: false, faltantes: 0 };
};

export const calcularFilaEstudiante = (estudiante, evaluaciones) => {
  const evTeorico = evaluaciones.filter((e) => e.componente === 'TEORICO');
  const evPractico = evaluaciones.filter((e) => e.componente === 'PRACTICO');

  const resTeorico = sumaPuntosComponente(estudiante, evTeorico);
  const resPractico = sumaPuntosComponente(estudiante, evPractico);

  const notaTeorico = resTeorico.puntos;
  const notaPractico = resPractico.puntos;

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
  const validacionPuntos = validarPuntosBimestre(evaluaciones, cuota);
  const filas = estudiantes.map((est) => calcularFilaEstudiante(est, evaluaciones));

  const conFaltantes = filas.filter((f) => f.incompleto).length;
  const calculables = filas.filter((f) => f.notaBimestre != null).length;

  return {
    filas,
    validacionPuntos,
    cuota,
    resumen: {
      total: filas.length,
      calculables,
      conFaltantes,
    },
  };
};
