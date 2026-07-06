/**
 * Columnas — listado de documentación (catálogo simple con 2 extras:
 * requerido / acepta fotocopia). Usa el factory compartido
 * `createSimpleCatalogTableColumns` (ver `incos-ui-system`).
 */
import StatusPill from '@atoms/StatusPill';
import { createSimpleCatalogTableColumns } from '@presentation/utils/tableColumns/createSimpleCatalogTableColumns';
import {
  documentacionDetallePath,
  documentacionEditarPath,
} from '@application-configuracion/documentacion/config/paths';

const requeridoColumn = {
  title: 'Requerido',
  dataIndex: 'requerido',
  width: 120,
  align: 'center',
  render: (requerido) => (
    <StatusPill
      label={requerido ? 'Requerido' : 'Opcional'}
      className={
        requerido ? 'cfg-materia-pill cfg-materia-pill--activa' : 'cfg-materia-pill cfg-materia-pill--default'
      }
    />
  ),
};

const aceptaFotocopiaColumn = {
  title: 'Fotocopia',
  dataIndex: 'aceptaFotocopia',
  width: 120,
  align: 'center',
  render: (aceptaFotocopia) => (
    <StatusPill
      label={aceptaFotocopia ? 'Acepta' : 'No acepta'}
      className={
        aceptaFotocopia
          ? 'cfg-materia-pill cfg-materia-pill--activa'
          : 'cfg-materia-pill cfg-materia-pill--inactiva'
      }
    />
  ),
};

export const createDocumentacionTableColumns = ({ navigate, listNavState, refetch, tipoKey, entidad }) =>
  createSimpleCatalogTableColumns({
    navigate,
    listNavState,
    refetch,
    entidad,
    permisoCodigo: `configuracion.documentacion.${tipoKey}`,
    getDetallePath: (record) => documentacionDetallePath(tipoKey, record.id),
    getEditarPath: (record) => documentacionEditarPath(tipoKey, record.id),
    useCaseKey: 'eliminarDocumentacion',
    extraColumns: [requeridoColumn, aceptaFotocopiaColumn],
    itemDetailsExtra: (record) => [
      { label: 'Requerido', value: record.requerido ? 'Sí' : 'No' },
      { label: 'Acepta fotocopia', value: record.aceptaFotocopia ? 'Sí' : 'No' },
    ],
  });
