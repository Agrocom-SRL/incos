/**
 * Átomo: nota numérica con semántica de riesgo (módulo TUT · Acompañamiento).
 *
 * Pinta la nota en el ROJO SEMÁNTICO del theme (`Text type="danger"`, nunca
 * hex) cuando está por debajo del umbral de riesgo de la vista 156; guion
 * cuando no hay nota registrada. Compartido por las columnas de alertas, el
 * drawer de detalle por estudiante y los casos críticos del panel.
 */

import { Typography } from 'antd';

const { Text } = Typography;

const NotaRiesgoText = ({ nota, umbral = null, strong = false }) => {
  if (nota == null) {
    return <Text type="secondary">—</Text>;
  }
  const enRiesgo = umbral != null && Number(nota) < Number(umbral);
  return (
    <Text strong={strong || enRiesgo} type={enRiesgo ? 'danger' : undefined}>
      {nota}
    </Text>
  );
};

export default NotaRiesgoText;
