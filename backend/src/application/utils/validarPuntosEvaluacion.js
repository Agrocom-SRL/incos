import { ValidationError } from '../../domain/errors/AppError.js';

export const cuotaPuntosComponente = (componente, cuotas) =>
  componente === 'TEORICO' ? Number(cuotas.cuotaTeorico) : Number(cuotas.cuotaPractico);

export const sumaPuntosActividadesComponente = (
  evaluaciones,
  componente,
  puntosExtra = 0,
  evaluacionIdExcluir = null,
) => {
  const sumaExistente = (evaluaciones ?? [])
    .filter((e) => e.componente === componente && Number(e.id) !== Number(evaluacionIdExcluir))
    .reduce((acc, e) => acc + Math.round(Number(e.puntos ?? 0)), 0);

  return sumaExistente + Math.round(Number(puntosExtra) || 0);
};

/**
 * @param {number} puntos
 * @returns {number} entero validado
 */
export const normalizarPuntosActividad = (puntos) => {
  const n = Number(puntos);
  if (!Number.isFinite(n) || !Number.isInteger(n) || n < 1) {
    throw new ValidationError('Los puntos deben ser un entero mayor o igual a 1');
  }
  return n;
};

/**
 * @param {{ evaluaciones: Array, componente: string, puntos: number, evaluacionIdExcluir?: number|null, cuotas: { cuotaTeorico: number, cuotaPractico: number } }}
 */
export const validarPuntosActividadEnCuota = ({
  evaluaciones,
  componente,
  puntos,
  evaluacionIdExcluir = null,
  cuotas,
}) => {
  const puntosInt = normalizarPuntosActividad(puntos);
  const cuota = cuotaPuntosComponente(componente, cuotas);
  if (!Number.isFinite(cuota) || cuota < 1) {
    throw new ValidationError('Cuota del componente no configurada en la política institucional');
  }

  const suma = sumaPuntosActividadesComponente(
    evaluaciones,
    componente,
    puntosInt,
    evaluacionIdExcluir,
  );

  if (suma > cuota) {
    const etiqueta = componente === 'TEORICO' ? 'teórico' : 'práctico';
    throw new ValidationError(
      `La suma de puntos del componente ${etiqueta} (${suma}) supera la cuota de ${cuota} puntos del bimestre`,
    );
  }

  return puntosInt;
};
