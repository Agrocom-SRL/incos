/**
 * API / Data Fetching - Hooks para llamadas a BD y obtención de datos
 * 
 * Application Layer: Hooks que orquestan Use Cases para obtener datos desde BD
 */

export { useEstudiantesApi } from './useEstudiantesApi';
export { useGetStudentById } from './useGetStudentById';
export { useStudentCatalogApi } from './useStudentCatalogApi';
export { useStudentGeographicApi } from './useStudentGeographicApi';
export { useSearchStudent } from './useSearchStudent';
export { useSearchStudentsForInscripcion } from './useSearchStudentsForInscripcion';
// useDeleteBecaAsignada y useGetStudentScholarships se quedan aquí: compartidos
// con la ficha de admisión (EstudiantesDetail.jsx) y con `pagos/`, respectivamente
// (no exclusivos de matricula/becas).
export { useDeleteBecaAsignada } from './useDeleteBecaAsignada';
export { useGetStudentScholarships } from './useGetStudentScholarships';
export { useDeleteStudent } from './useDeleteStudent';

