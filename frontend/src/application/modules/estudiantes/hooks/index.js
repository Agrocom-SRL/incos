// Hook para consumir el contexto
export { useStudentContext } from './useStudentContext';

// Hooks de API (llamadas al backend)
export { useEstudiantesApi } from './useEstudiantesApi';

// Hooks de Feature (lógica de UI por feature)
export { useEstudiantesList } from './useEstudiantesList';

// Hooks para registro de estudiantes
export { useStudentFormData } from './useStudentFormData';
export { useStudentGeographicData } from './useStudentGeographicData';
export { useStudentReferenceData } from './useStudentReferenceData';

// Hook para crear estudiante (aún no se usa, se implementará cuando se necesite)
// export { useCreateStudent } from './useCreateStudent';

// Futuras features:
// export { useEstudiantesBecas } from './useEstudiantesBecas';
// export { useEstudiantesLicencias } from './useEstudiantesLicencias';
// export { useEstudiantesDocumentos } from './useEstudiantesDocumentos';
