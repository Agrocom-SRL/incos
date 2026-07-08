/**
 * Columnas — tab Tipos de evaluación (CFG Recursos académicos).
 * Usa el factory compartido `createSimpleCatalogTableColumns` (ver `incos-ui-system`):
 * # · Identidad (código+nombre) · Descripción (pill recuperatorio + texto) · Estado · Acciones.
 *
 * La modalidad (Recuperatorio/Regular) va fusionada con la descripción en el
 * átomo `TipoEvaluacionRecuperatorioCell` (gemelo de la columna "Periodo" de
 * paralelos), no como columna separada.
 *
 * El campo "componente" (teórico/práctico) NO vive en este catálogo — vive en
 * la tabla `evaluaciones`, no se agrega aquí.
 */
import { createSimpleCatalogTableColumns } from '@presentation/utils/tableColumns/createSimpleCatalogTableColumns';
import {
  tipoEvaluacionDetallePath,
  tipoEvaluacionEditarPath,
} from '@application-configuracion/recursos/config/paths';
import TipoEvaluacionRecuperatorioCell from '@configuracion/recursos/components/atoms/TipoEvaluacionRecuperatorioCell';

// Descripción + modalidad fusionadas (reemplaza a la columna "Descripción" del factory)
const descripcionRecuperatorioColumn = {
  title: 'Descripción',
  key: 'descripcion',
  width: 420,
  ellipsis: false,
  render: (_, record) => <TipoEvaluacionRecuperatorioCell record={record} />,
  sorter: true,
  sortCompare: (a, b) => Number(!!a.esRecuperatorio) - Number(!!b.esRecuperatorio),
};

export const createTiposEvaluacionTableColumns = ({
  navigate,
  listNavState,
  refetch,
  toggleEstado,
}) =>
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
    descripcionField: null,
    extraColumns: [descripcionRecuperatorioColumn],
    // Columna "Estado" con toggle rápido (permiso ACTIVAR de configuracion.tipo-evaluacion)
    estadoToggle: toggleEstado ? { onToggle: toggleEstado } : null,
    itemDetailsExtra: (record) => [
      { label: 'Descripción', value: record.descripcion },
      { label: 'Recuperatorio', value: record.esRecuperatorio ? 'Sí' : 'No' },
    ],
  });
