/**
 * Columnas — listado de idiomas (catálogo simple).
 * Usa el factory compartido `createSimpleCatalogTableColumns` (ver `incos-ui-system`).
 *
 * Idiomas no tiene `descripcion` (`descripcionField: null`); el código ISO se
 * muestra dentro de la celda de nombre vía `codigoField` (`IdentidadCelda`,
 * mismo look que la columna Carrera del tab Académico). El factory ya incluye
 * la fila "Código" en el diálogo de borrado, sin `itemDetailsExtra`.
 */
import { createSimpleCatalogTableColumns } from '@presentation/utils/tableColumns/createSimpleCatalogTableColumns';
import {
  idiomaDetallePath,
  idiomaEditarPath,
} from '@application-configuracion/complementarios/config/paths';
import { usosColumn } from './usosColumn';

export const createIdiomasTableColumns = ({ navigate, listNavState, refetch }) =>
  createSimpleCatalogTableColumns({
    navigate,
    listNavState,
    refetch,
    entidad: 'el idioma',
    permisoCodigo: 'configuracion.complementario.idiomas',
    getDetallePath: (record) => idiomaDetallePath(record.id),
    getEditarPath: (record) => idiomaEditarPath(record.id),
    useCaseKey: 'eliminarIdioma',
    codigoField: 'codigoIso',
    descripcionField: null,
    extraColumns: [usosColumn],
  });
