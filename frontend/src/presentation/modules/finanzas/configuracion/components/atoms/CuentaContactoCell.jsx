/**
 * Átomo: complemento de contacto de una cuenta de pago (Config. de pagos ·
 * Finanzas): número de celular (línea `InfoLinesCell` con icono) y badge
 * «QR disponible» (`StatusPill` success) cuando la cuenta tiene QR cargado,
 * apilados. Sin celular ni QR → guion (lo resuelve `InfoLinesCell`).
 */

import { Flex } from 'antd';
import { PhoneOutlined } from '@ant-design/icons';
import { InfoLinesCell, StatusPill } from '@atoms';

const CuentaContactoCell = ({ numeroCelular, tieneQr }) => {
  if (!numeroCelular && !tieneQr) {
    return <InfoLinesCell lines={[]} />;
  }

  return (
    <Flex vertical align="flex-start" gap="small">
      {numeroCelular ? (
        <InfoLinesCell lines={[{ key: 'celular', icon: <PhoneOutlined />, label: numeroCelular }]} />
      ) : null}
      {tieneQr ? (
        <StatusPill label="QR disponible" className="cfg-materia-pill cfg-materia-pill--success" />
      ) : null}
    </Flex>
  );
};

export default CuentaContactoCell;
