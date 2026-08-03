/**
 * Molécula: resumen de una generación masiva de folios (paralelos generados,
 * folios creados, rango de folio y omitidos con motivo).
 *
 * Compartida por `GenerarFoliosGestionModal` (listado — P1) y `GenerarFoliosModal`
 * (ficha — P2), que disparan el mismo `POST /libros/gestiones/:gestionId/folios`
 * desde dos pantallas distintas.
 *
 * @param {Object} props
 * @param {{paralelosGenerados:number, foliosCreados:number, folioDesde?:number,
 *   folioHasta?:number, omitidos?:Array<{paraleloGestionId:number, motivo:string}>}} props.resumen
 */

import { Descriptions, Flex, Space, Typography } from 'antd';
import { allSpacing } from '@theme/tokens';

const { Paragraph, Text } = Typography;

const GenerarFoliosResumen = ({ resumen }) => {
  if (!resumen) return null;

  const rangoFolio =
    resumen.folioDesde != null && resumen.folioHasta != null
      ? `FOLIO N° ${resumen.folioDesde} — ${resumen.folioHasta}`
      : 'Sin folios nuevos';

  return (
    <Space orientation="vertical" size={allSpacing.marginMD} style={{ width: '100%' }}>
      <Paragraph>
        Se generaron los folios correlativos de la gestión, en el orden canónico de carrera
        (Contaduría → Administración → Informática).
      </Paragraph>
      <Descriptions column={1} size="small" bordered>
        <Descriptions.Item label="Paralelos generados">{resumen.paralelosGenerados}</Descriptions.Item>
        <Descriptions.Item label="Folios creados">{resumen.foliosCreados}</Descriptions.Item>
        <Descriptions.Item label="Rango de folios">{rangoFolio}</Descriptions.Item>
      </Descriptions>
      {resumen.omitidos?.length > 0 ? (
        <Flex vertical gap={allSpacing.marginXS}>
          <Text strong>Paralelos omitidos ({resumen.omitidos.length})</Text>
          {resumen.omitidos.map((item) => (
            <Text key={item.paraleloGestionId} type="secondary">
              Paralelo en gestión N° {item.paraleloGestionId}: {item.motivo}
            </Text>
          ))}
        </Flex>
      ) : null}
    </Space>
  );
};

export default GenerarFoliosResumen;
