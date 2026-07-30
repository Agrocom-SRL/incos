import { IRepository } from './IRepository.js';

/**
 * Interfaz de Repositorio CRUD: ILibroRegistroRepository
 *
 * Escritura del agregado Libros de registro (schema 25, módulo ACA):
 * libros_registro (raíz) + folios_libro + folio_estudiantes.
 *
 * Arquetipo A (CRUD): EXTIENDE IRepository. Las lecturas ricas de listado/ficha
 * viven en ILibroRegistroViewRepository (vistas 175/176/177).
 *
 * Métodos adicionales al contrato base:
 * - findByCarreraGestion(carreraId, gestionId): UNIQUE un libro por carrera+gestión.
 * - getMaxNumeroFolioByGestion(gestionId, options?): máximo numero_folio de la
 *   GESTIÓN completa cruzando todas las carreras (el contador de folios es
 *   compartido por gestión: 1..N de corrido entre libros).
 * - countFoliosVigentesByParalelo(libroId, paraleloGestionId): folios no ANULADOS
 *   de un paralelo (rechazo de doble generación).
 * - crearFoliosConEstudiantes({ libroId, gestionId, folioInicial, folios }, userId):
 *   TRANSACCIONAL — asigna numero_folio (MAX de la gestión + 1, FOR UPDATE),
 *   inserta folios_libro + folio_estudiantes y actualiza el informativo
 *   libros_registro.folio_actual en una sola transacción.
 * - findFolioById(folioId) / updateFolio(folioId, data, userId).
 * - listarEstudiantesFolio(folioId): nómina congelada con datos del estudiante.
 * - findFolioEstudianteById(filaId) / updateFolioEstudiante(filaId, data, userId).
 */
export class ILibroRegistroRepository extends IRepository {}

export default ILibroRegistroRepository;
