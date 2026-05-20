/**
 * Banner de impersonación — coordinación viendo el cuaderno de un docente.
 */

import { Alert, Button } from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { CALIFICACIONES_PATH } from '@application-academico/calificaciones/utils/calificacionesPaths.js';

const ImpersonacionBanner = ({ impersonacion, onSalir }) => {
  if (!impersonacion?.activa) return null;

  return (
    <Alert
      type="warning"
      showIcon
      icon={<EyeOutlined />}
      className="cal-impersonacion-banner"
      message={
        <>
          Estás viendo el cuaderno de <strong>{impersonacion.docenteNombre}</strong>
        </>
      }
      description={
        <>
          Sesión de coordinación como <strong>{impersonacion.adminNombre}</strong>. Los cambios
          quedan registrados a tu nombre, no al del docente.
        </>
      }
      action={
        <Link to={CALIFICACIONES_PATH} onClick={onSalir}>
          <Button size="small" type="link">
            Salir de vista docente
          </Button>
        </Link>
      }
    />
  );
};

export default ImpersonacionBanner;
