/**
 * Columnas — listado de tipos de discapacidad (catálogo simple).
 * Usa el factory compartido `createSimpleCatalogTableColumns` (ver `incos-ui-system`).
 */
import { createSimpleCatalogTableColumns } from '@presentation/utils/tableColumns/createSimpleCatalogTableColumns';
import {
  discapacidadDetallePath,
  discapacidadEditarPath,
} from '@application-configuracion/complementarios/config/paths';
import { usosColumn } from './usosColumn';

export const createDiscapacidadesTableColumns = ({
  navigate,
  listNavState,
  refetch,
  toggleEstado,
}) =>
  createSimpleCatalogTableColumns({
    navigate,
    listNavState,
    refetch,
    entidad: 'el tipo de discapacidad',
    permisoCodigo: 'configuracion.complementario.discapacidad',
    getDetallePath: (record) => discapacidadDetallePath(record.id),
    getEditarPath: (record) => discapacidadEditarPath(record.id),
    useCaseKey: 'eliminarDiscapacidad',
    extraColumns: [usosColumn],
    // Columna "Estado" con toggle rápido (permiso ACTIVAR de permisoCodigo)
    estadoToggle: toggleEstado ? { onToggle: toggleEstado } : null,
  });
