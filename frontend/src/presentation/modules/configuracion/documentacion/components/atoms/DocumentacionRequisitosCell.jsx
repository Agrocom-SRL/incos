/**
 * Requisitos del documento en UNA celda de dos renglones (patrón
 * `DocenteCargaCell` / `cfg-academico-metricas-list`, vía `InfoLinesCell`):
 *   1. «Requerido» (tono error, clase `cfg-doc-requisito--requerido`) u
 *      «Opcional» (neutro, Text secondary por defecto).
 *   2. «Acepta fotocopia» / «Solo original».
 */
import {
  CopyOutlined,
  ExclamationCircleOutlined,
  FileProtectOutlined,
  MinusCircleOutlined,
} from '@ant-design/icons';
import { InfoLinesCell } from '@atoms';

const DocumentacionRequisitosCell = ({ requerido, aceptaFotocopia }) => (
  <InfoLinesCell
    lines={[
      {
        key: 'requerido',
        icon: requerido ? <ExclamationCircleOutlined /> : <MinusCircleOutlined />,
        label: requerido ? 'Requerido' : 'Opcional',
        className: requerido ? 'cfg-doc-requisito--requerido' : undefined,
      },
      {
        key: 'fotocopia',
        icon: aceptaFotocopia ? <CopyOutlined /> : <FileProtectOutlined />,
        label: aceptaFotocopia ? 'Acepta fotocopia' : 'Solo original',
      },
    ]}
  />
);

export default DocumentacionRequisitosCell;
