/**
 * Punto de entrada de la fake API de calificaciones.
 */

import { fakeRequest } from './fakeApiClient.js';
import { obtenerCalificacionesCursos } from './endpoints/cursos.endpoint.js';
import { obtenerCuaderno } from './endpoints/cuaderno.endpoint.js';
import {
  actualizarNota,
  crearEvaluacion,
  editarEvaluacion,
  eliminarEvaluacion,
} from './endpoints/evaluaciones.endpoint.js';
import { obtenerTiposEvaluacion } from './endpoints/tiposEvaluacion.endpoint.js';
import {
  obtenerAjustesCurso,
  guardarAjustesCurso,
} from './endpoints/ajustesCurso.endpoint.js';
import {
  obtenerTablero,
  validarCierreBimestre,
  iniciarBimestre1,
  cerrarBimestre,
} from './endpoints/tablero.endpoint.js';
import {
  listarDocentesVistaAdmin,
  activarImpersonacion,
  desactivarImpersonacion,
  obtenerCursosDocenteAdmin,
} from './endpoints/vistaAdmin.endpoint.js';
import {
  obtenerPoliticaInstitucional,
  guardarPoliticaInstitucional,
} from './endpoints/politicaInstitucional.endpoint.js';

export const calificacionesFakeApi = {
  obtenerCalificacionesCursos: () => fakeRequest(() => obtenerCalificacionesCursos()),
  obtenerCuaderno: (params) => fakeRequest(() => obtenerCuaderno(params)),
  actualizarNota: (params) => fakeRequest(() => actualizarNota(params)),
  obtenerTiposEvaluacion: (params) => fakeRequest(() => obtenerTiposEvaluacion(params)),
  crearEvaluacion: (params) => fakeRequest(() => crearEvaluacion(params)),
  editarEvaluacion: (params) => fakeRequest(() => editarEvaluacion(params)),
  eliminarEvaluacion: (params) => fakeRequest(() => eliminarEvaluacion(params)),
  obtenerAjustesCurso: (params) => fakeRequest(() => obtenerAjustesCurso(params)),
  guardarAjustesCurso: (params) => fakeRequest(() => guardarAjustesCurso(params)),
  obtenerTablero: () => fakeRequest(() => obtenerTablero()),
  validarCierreBimestre: (params) => fakeRequest(() => validarCierreBimestre(params)),
  iniciarBimestre1: () => fakeRequest(() => iniciarBimestre1()),
  cerrarBimestre: (params) => fakeRequest(() => cerrarBimestre(params)),
  listarDocentesVistaAdmin: () => fakeRequest(() => listarDocentesVistaAdmin()),
  activarImpersonacion: (params) => fakeRequest(() => activarImpersonacion(params)),
  desactivarImpersonacion: () => fakeRequest(() => desactivarImpersonacion()),
  obtenerCursosDocenteAdmin: (params) => fakeRequest(() => obtenerCursosDocenteAdmin(params)),
  obtenerPoliticaInstitucional: (params) =>
    fakeRequest(() => obtenerPoliticaInstitucional(params)),
  guardarPoliticaInstitucional: (params) =>
    fakeRequest(() => guardarPoliticaInstitucional(params)),
};

export { FAKE_NETWORK_ERROR } from './fakeApiClient.js';
