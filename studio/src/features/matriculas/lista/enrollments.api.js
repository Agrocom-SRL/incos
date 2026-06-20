/**
 * Capa de datos del listado de inscripciones.
 *
 * HOY: devuelve el mock con latencia simulada. MAÑANA: este es el ÚNICO archivo que
 * cambia para conectar el backend real (return http.get('/v1/inscripciones', { params })).
 * Los consumidores (hook/adapter/page) no se enteran del cambio.
 */
import { enrollmentsMock } from '@mocks/enrollments.mock';

/** Simula la llamada GET /v1/inscripciones. @returns {Promise<{ data: object[] }>} */
export function fetchEnrollments() {
  return new Promise((resolve) => {
    setTimeout(() => resolve({ data: enrollmentsMock }), 600);
  });
}

export default fetchEnrollments;
