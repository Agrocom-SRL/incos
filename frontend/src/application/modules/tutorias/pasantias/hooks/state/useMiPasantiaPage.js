/**
 * Hook de pantalla: "Mi pasantía" — portal del estudiante (TUT).
 *
 * Rama estudiante (patrón `useMiProyectoGradoPage`): SIN provider admin —
 * consume P19 (objeto compuesto `{ pasantia, informes, seguimientos }`; el
 * backend resuelve el estudiante por token). Pantalla de SOLO LECTURA: el
 * rol ESTUDIANTE tiene únicamente pasantia·DETALLE, por lo que informes y
 * seguimientos se muestran sin acciones.
 */

import { useMemo } from 'react';
import { useGetMiPasantia } from '@application-tutorias/pasantias/hooks/api/useGetMiPasantia';

export const useMiPasantiaPage = () => {
  const { pasantia, informes, seguimientos, sinPasantia, loading, error, refetch } =
    useGetMiPasantia();

  const breadcrumbItems = useMemo(
    () => [{ title: 'Inicio', href: '/' }, { title: 'Titulación' }, { title: 'Mi pasantía' }],
    [],
  );

  return {
    pasantia,
    informes,
    seguimientos,
    sinPasantia,
    loading,
    error,
    refetch,
    breadcrumbItems,
  };
};
