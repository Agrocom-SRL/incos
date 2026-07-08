/**
 * Columnas — listado de estados civiles (catálogo simple).
 * Usa el factory compartido `createSimpleCatalogTableColumns` (ver `incos-ui-system`).
 *
 * Estados civiles no tiene `descripcion` (`descripcionField: null`); la
 * abreviatura actúa como código dentro de la celda de nombre vía `codigoField`
 * (`IdentidadCelda`). El factory ya incluye la fila "Código" en el diálogo de
 * borrado, sin `itemDetailsExtra`. Gemelo de `idiomasTableColumns.jsx`.
 */
import { createSimpleCatalogTableColumns } from '@presentation/utils/tableColumns/createSimpleCatalogTableColumns';
import {
  estadoCivilDetallePath,
  estadoCivilEditarPath,
} from '@application-configuracion/complementarios/config/paths';
import { usosColumn } from './usosColumn';

export const createEstadosCivilesTableColumns = ({ navigate, listNavState, refetch }) =>
  createSimpleCatalogTableColumns({
    navigate,
    listNavState,
    refetch,
    entidad: 'el estado civil',
    permisoCodigo: 'configuracion.complementario.estado-civil',
    getDetallePath: (record) => estadoCivilDetallePath(record.id),
    getEditarPath: (record) => estadoCivilEditarPath(record.id),
    useCaseKey: 'eliminarEstadoCivil',
    codigoField: 'abreviatura',
    descripcionField: null,
    extraColumns: [usosColumn],
  });
