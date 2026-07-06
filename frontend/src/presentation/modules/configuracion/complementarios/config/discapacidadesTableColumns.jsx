/**
 * Columnas — listado de tipos de discapacidad (catálogo simple).
 * Usa el factory compartido `createSimpleCatalogTableColumns` (ver `incos-ui-system`).
 */
import { createSimpleCatalogTableColumns } from '@presentation/utils/tableColumns/createSimpleCatalogTableColumns';
import {
  discapacidadDetallePath,
  discapacidadEditarPath,
} from '@application-configuracion/complementarios/config/paths';

export const createDiscapacidadesTableColumns = ({ navigate, listNavState, refetch }) =>
  createSimpleCatalogTableColumns({
    navigate,
    listNavState,
    refetch,
    entidad: 'el tipo de discapacidad',
    permisoCodigo: 'configuracion.complementario.discapacidad',
    getDetallePath: (record) => discapacidadDetallePath(record.id),
    getEditarPath: (record) => discapacidadEditarPath(record.id),
    useCaseKey: 'eliminarDiscapacidad',
  });
