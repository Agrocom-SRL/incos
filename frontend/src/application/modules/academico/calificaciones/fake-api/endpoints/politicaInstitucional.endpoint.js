/**
 * Política institucional de evaluación por gestión (Nivel 1).
 */

import { fakeDatabase } from '../fakeDatabase.js';

const COORDINADOR = { id: 99, nombre: 'Coordinación Académica' };

const clonarPolitica = () => {
  const c = fakeDatabase.configuracionInstitucional;
  return {
    gestionId: c.gestionId,
    gestionNombre: c.gestionNombre,
    cuotaTeorico: c.cuotaTeorico,
    cuotaPractico: c.cuotaPractico,
    pesosBimestres: [...c.pesosBimestres],
    evaluacionesFinalesDisponibles: c.evaluacionesFinalesDisponibles.map((t) => ({ ...t })),
    politicaAsistenciaDefault: { ...c.politicaAsistenciaDefault },
    ultimaModificacion: c.ultimaModificacion ? { ...c.ultimaModificacion } : null,
  };
};

export function obtenerPoliticaInstitucional({ gestionId }) {
  const id = Number(gestionId ?? fakeDatabase.configuracionInstitucional.gestionId);
  const c = fakeDatabase.configuracionInstitucional;

  if (c.gestionId !== id) {
    const err = new Error('GESTION_NOT_FOUND');
    err.code = 'GESTION_NOT_FOUND';
    throw err;
  }

  return clonarPolitica();
}

export function guardarPoliticaInstitucional({ gestionId, cambios }) {
  const id = Number(gestionId);
  const c = fakeDatabase.configuracionInstitucional;

  if (c.gestionId !== id) {
    const err = new Error('GESTION_NOT_FOUND');
    err.code = 'GESTION_NOT_FOUND';
    throw err;
  }

  const entrada = {
    updatedAt: new Date().toISOString(),
    updatedBy: COORDINADOR.id,
    updatedByNombre: COORDINADOR.nombre,
    resumen: 'Política institucional actualizada',
  };

  c.cuotaTeorico = cambios.cuotaTeorico;
  c.cuotaPractico = cambios.cuotaPractico;
  c.pesosBimestres = [...cambios.pesosBimestres];
  c.evaluacionesFinalesDisponibles = cambios.evaluacionesFinalesDisponibles.map((t) => ({
    ...t,
  }));
  c.politicaAsistenciaDefault = { ...cambios.politicaAsistenciaDefault };
  c.ultimaModificacion = entrada;
  c.historial = [entrada, ...(c.historial ?? [])].slice(0, 10);

  return clonarPolitica();
}
