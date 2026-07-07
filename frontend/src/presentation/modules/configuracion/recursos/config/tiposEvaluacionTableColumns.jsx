/**
 * Columnas — tab Tipos de evaluación (CFG Recursos académicos).
 * Usa el factory compartido `createSimpleCatalogTableColumns` (ver `incos-ui-system`):
 * # · Identidad (código+nombre) · Descripción · Recuperatorio · Acciones.
 *
 * El campo "componente" (teórico/práctico) NO vive en este catálogo — vive en
 * la tabla `evaluaciones`, no se agrega aquí.
 */
import StatusPill from '@atoms/StatusPill';
import { createSimpleCatalogTableColumns } from '@presentation/utils/tableColumns/createSimpleCatalogTableColumns';
import {
  tipoEvaluacionDetallePath,
  tipoEvaluacionEditarPath,
} from '@application-configuracion/recursos/config/paths';

const recuperatorioColumn = {
  title: 'Recuperatorio',
  dataIndex: 'esRecuperatorio',
  width: 150,
  align: 'center',
  render: (esRecuperatorio) =>
    esRecuperatorio ? (
      <StatusPill label="Recuperatorio" className="cfg-materia-pill cfg-materia-pill--info" />
    ) : (
      <StatusPill label="Regular" className="cfg-materia-pill cfg-materia-pill--default" />
    ),
  sorter: true,
  sortCompare: (a, b) => Number(!!a.esRecuperatorio) - Number(!!b.esRecuperatorio),
};

export const createTiposEvaluacionTableColumns = ({ navigate, listNavState, refetch }) =>
  createSimpleCatalogTableColumns({
    navigate,
    listNavState,
    refetch,
    entidad: 'el tipo de evaluación',
    permisoCodigo: 'configuracion.tipo-evaluacion',
    getDetallePath: (record) => tipoEvaluacionDetallePath(record.id),
    getEditarPath: (record) => tipoEvaluacionEditarPath(record.id),
    useCaseKey: 'eliminarTipoEvaluacion',
    codigoField: 'codigo',
    extraColumns: [recuperatorioColumn],
    itemDetailsExtra: (record) => [
      { label: 'Recuperatorio', value: record.esRecuperatorio ? 'Sí' : 'No' },
    ],
  });
