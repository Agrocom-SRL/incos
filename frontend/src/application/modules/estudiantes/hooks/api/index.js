/**
 * API / Data Fetching - Hooks para llamadas a BD y obtención de datos
 * 
 * Application Layer: Hooks que orquestan Use Cases para obtener datos desde BD
 */

export { useEstudiantesApi } from './useEstudiantesApi';
export { useGetStudentById } from './useGetStudentById';
export { useStudentCatalogApi } from './useStudentCatalogApi';
export { useStudentGeographicApi } from './useStudentGeographicApi';
export { useStudentReferenceApi } from './useStudentReferenceApi';
export { useRegisterStudent } from './useRegisterStudent';
export { useUpdateStudent } from './useUpdateStudent';
export { useSearchStudent } from './useSearchStudent';
export { useBecasDescuentosApi } from './useBecasDescuentosApi';
export { useBecasAsignadasApi } from './useBecasAsignadasApi';
export { useCreateAsignarBeca } from './useCreateAsignarBeca';
export { useDeleteBecaAsignada } from './useDeleteBecaAsignada';
export { useGetStudentScholarships } from './useGetStudentScholarships';
export { useDeleteStudent } from './useDeleteStudent';

