/**
 * Tablero de coordinación — control de bimestres de la gestión (mock en memoria).
 */

import { fakeDatabase } from '../fakeDatabase.js';

const COORDINADOR_MOCK = {
  id: 99,
  nombre: 'Coordinación Académica',
};

const syncCuadernosConBimestreVigente = (vigente) => {
  fakeDatabase.docenteActual.bimestreVigente = vigente;
  fakeDatabase.tablero.bimestreVigente = vigente;

  Object.values(fakeDatabase.cuadernos).forEach((cuaderno) => {
    cuaderno.bimestres = cuaderno.bimestres.map((b) => {
      if (b.numero < vigente) return { ...b, estado: 'cerrado' };
      if (b.numero === vigente) return { ...b, estado: 'vigente' };
      return { ...b, estado: 'bloqueado' };
    });
  });
};

const clonarTablero = () => ({
  gestion: { ...fakeDatabase.tablero.gestion },
  bimestreVigente: fakeDatabase.tablero.bimestreVigente,
  gestionIniciada: fakeDatabase.tablero.gestionIniciada,
  bimestres: fakeDatabase.tablero.bimestres.map((b) => ({ ...b })),
  metricas: { ...fakeDatabase.tablero.metricas },
});

export function obtenerTablero() {
  return clonarTablero();
}

export function validarCierreBimestre({ numero }) {
  const bim = fakeDatabase.tablero.bimestres.find((b) => b.numero === Number(numero));
  if (!bim) {
    const err = new Error('BIMESTRE_NOT_FOUND');
    err.code = 'BIMESTRE_NOT_FOUND';
    throw err;
  }

  const bloqueos = [];
  const advertencias = [];
  const { metricas } = fakeDatabase.tablero;

  if (bim.estado !== 'EN_CURSO') {
    bloqueos.push('Solo se puede cerrar el bimestre vigente en curso.');
  }

  if (metricas.planesSinDefinir > 0) {
    bloqueos.push(
      `${metricas.planesSinDefinir} curso${metricas.planesSinDefinir > 1 ? 's' : ''} sin evaluaciones definidas en el bimestre.`,
    );
  }

  if (metricas.notasFaltantes > 0) {
    advertencias.push(
      `${metricas.notasFaltantes} notas faltantes en toda la gestión (los docentes pueden seguir cargando hasta el cierre).`,
    );
  }

  if (metricas.cursosConPendientes > 0) {
    advertencias.push(
      `${metricas.cursosConPendientes} curso${metricas.cursosConPendientes > 1 ? 's' : ''} con cargas pendientes de revisión.`,
    );
  }

  return {
    numero: bim.numero,
    bloqueos,
    advertencias,
    puedeCerrar: bloqueos.length === 0,
  };
}

export function iniciarBimestre1() {
  const { tablero } = fakeDatabase;

  if (tablero.gestionIniciada) {
    const err = new Error('GESTION_YA_INICIADA');
    err.code = 'GESTION_YA_INICIADA';
    throw err;
  }

  const hoy = new Date().toISOString().slice(0, 10);
  const matriculas = 486;

  tablero.gestionIniciada = true;
  tablero.bimestreVigente = 1;
  tablero.bimestres = tablero.bimestres.map((b) => {
    if (b.numero === 1) {
      return {
        ...b,
        estado: 'EN_CURSO',
        fechaInicio: hoy,
        fechaCierre: null,
        matriculasTransicionadas: matriculas,
      };
    }
    return { ...b, estado: 'BLOQUEADO' };
  });

  tablero.metricas = {
    ...tablero.metricas,
    notasFaltantes: 0,
    planesSinDefinir: 0,
  };

  syncCuadernosConBimestreVigente(1);

  return {
    tablero: clonarTablero(),
    matriculasInscritoACursando: matriculas,
    ejecutadoPor: COORDINADOR_MOCK,
  };
}

export function cerrarBimestre({ numero }) {
  const num = Number(numero);
  const validacion = validarCierreBimestre({ numero: num });

  if (!validacion.puedeCerrar) {
    const err = new Error('CIERRE_BLOQUEADO');
    err.code = 'CIERRE_BLOQUEADO';
    err.validacion = validacion;
    throw err;
  }

  const { tablero } = fakeDatabase;
  const hoy = new Date().toISOString().slice(0, 10);
  const siguiente = num < 4 ? num + 1 : null;

  tablero.bimestres = tablero.bimestres.map((b) => {
    if (b.numero === num) {
      return { ...b, estado: 'CERRADO', fechaCierre: hoy };
    }
    if (siguiente && b.numero === siguiente) {
      return {
        ...b,
        estado: 'EN_CURSO',
        fechaInicio: hoy,
        fechaCierre: null,
      };
    }
    return b;
  });

  tablero.bimestreVigente = siguiente ?? num;
  tablero.metricas = {
    ...tablero.metricas,
    notasFaltantes: Math.max(0, tablero.metricas.notasFaltantes - 40),
    planesSinDefinir: Math.max(0, tablero.metricas.planesSinDefinir - 1),
    cursosCompletos: Math.min(
      tablero.metricas.cursosTotal,
      tablero.metricas.cursosCompletos + 2,
    ),
    cursosConPendientes: Math.max(0, tablero.metricas.cursosConPendientes - 2),
  };

  if (siguiente) {
    syncCuadernosConBimestreVigente(siguiente);
  }

  return {
    tablero: clonarTablero(),
    bimestreCerrado: num,
    bimestreSiguiente: siguiente,
    ejecutadoPor: COORDINADOR_MOCK,
  };
}
