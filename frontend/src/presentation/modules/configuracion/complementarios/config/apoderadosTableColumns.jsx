/**
 * Columnas — listado de apoderados / tipos de parentesco (catálogo simple).
 * Usa el factory compartido `createSimpleCatalogTableColumns` (ver `incos-ui-system`).
 */
import { createSimpleCatalogTableColumns } from '@presentation/utils/tableColumns/createSimpleCatalogTableColumns';
import {
  apoderadoDetallePath,
  apoderadoEditarPath,
} from '@application-configuracion/complementarios/config/paths';

export const createApoderadosTableColumns = ({ navigate, listNavState, refetch }) =>
  createSimpleCatalogTableColumns({
    navigate,
    listNavState,
    refetch,
    entidad: 'el apoderado',
    permisoCodigo: 'configuracion.complementario.apoderados',
    getDetallePath: (record) => apoderadoDetallePath(record.id),
    getEditarPath: (record) => apoderadoEditarPath(record.id),
    useCaseKey: 'eliminarTipoParentesco',
  });
