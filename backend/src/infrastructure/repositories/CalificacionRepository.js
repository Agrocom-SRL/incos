import { CalificacionContextoRepository } from './CalificacionContextoRepository.js';
import { CalificacionCoordinacionRepository } from './CalificacionCoordinacionRepository.js';

/**
 * Fachada de lectura del módulo Calificaciones (coordinación + contexto).
 * La gestión de bimestres vive en {@link GestionBimestresRepository}.
 *
 * @deprecated Preferir inyectar CalificacionContextoRepository y CalificacionCoordinacionRepository.
 */
export class CalificacionRepository {
  constructor() {
    this._contexto = new CalificacionContextoRepository();
    this._coordinacion = new CalificacionCoordinacionRepository();
  }

  obtenerContextoVigente() {
    return this._contexto.obtenerContextoVigente();
  }

  obtenerPeriodosBimestresGestion(gestionId) {
    return this._contexto.obtenerPeriodosBimestresGestion(gestionId);
  }

  obtenerGestionAnteriorPorAnio(gestionAnio) {
    return this._contexto.obtenerGestionAnteriorPorAnio(gestionAnio);
  }

  listarDocentesCoordinacion(options) {
    return this._coordinacion.listarDocentesCoordinacion(options);
  }

  obtenerDocenteCalificaciones(docenteId) {
    return this._coordinacion.obtenerDocenteCalificaciones(docenteId);
  }

  listarCursosPorDocente(docenteId) {
    return this._coordinacion.listarCursosPorDocente(docenteId);
  }

  listarResumenBimestresCursosPorDocente(docenteId, notaMinimaAprobacion) {
    return this._coordinacion.listarResumenBimestresCursosPorDocente(
      docenteId,
      notaMinimaAprobacion,
    );
  }

  obtenerCursoPorAsignacion(asignacionId) {
    return this._coordinacion.obtenerCursoPorAsignacion(asignacionId);
  }

  listarEstudiantesRegistroNotas(asignacionId) {
    return this._coordinacion.listarEstudiantesRegistroNotas(asignacionId);
  }
}
