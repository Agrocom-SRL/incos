import { createApiHook } from '@application/utils';

export const useGestionesCatalogApi = createApiHook({
  name: 'useGestionesCatalogApi',
  useCase: 'obtenerTodasGestiones',
  dataType: 'array',
  initialLoading: false,
  autoFetch: true,
  autoFetchArgs: [{ params: { vigente: 1 } }],
  dataKey: 'gestiones',
  errorMessage: 'Error al cargar el catalogo de gestiones',
});
