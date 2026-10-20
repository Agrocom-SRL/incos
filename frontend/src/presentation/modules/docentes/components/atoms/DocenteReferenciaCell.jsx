/**
 * Datos de referencia del docente (género, teléfono, correo) — visibles en listado y búsqueda.
 */

import { MailOutlined, PhoneOutlined } from '@ant-design/icons';
import { Typography } from 'antd';

import { getGeneroMeta } from '@docentes/utils/generoMeta';

const { Text } = Typography;

const Linea = ({ icon, children }) => (
  <li className="cfg-academico-metricas-list__item">
    <span className="cfg-academico-metricas-list__icon" aria-hidden>
      {icon}
    </span>
    <Text type="secondary" className="cfg-academico-metricas-list__label">
      {children}
    </Text>
  </li>
);

const DocenteReferenciaCell = ({ genero, celular, telefono, emailPersonal }) => {
  const generoMeta = getGeneroMeta(genero);
  const GeneroIcon = generoMeta?.icon;
  const movil = celular?.trim() || null;
  const fijo = telefono?.trim() || null;
  const telefonoRef = movil || fijo;
  const email = emailPersonal?.trim() || null;
  const hasAny = generoMeta || telefonoRef || email;

  if (!hasAny) {
    return <Text type="secondary" className="cfg-academico-metricas-list__label">—</Text>;
  }

  return (
    <ul className="cfg-academico-metricas-list">
      {generoMeta && GeneroIcon ? (
        <li className={`cfg-academico-metricas-list__item ${generoMeta.toneClass}`}>
          <span className="cfg-academico-metricas-list__icon doc-docente-genero-icon" aria-hidden>
            <GeneroIcon />
          </span>
          <span className="doc-docente-genero-label">{generoMeta.label}</span>
        </li>
      ) : null}
      {telefonoRef ? (
        <Linea icon={<PhoneOutlined />}>{telefonoRef}</Linea>
      ) : null}
      {email ? (
        <Linea icon={<MailOutlined />}>{email}</Linea>
      ) : null}
    </ul>
  );
};

export default DocenteReferenciaCell;
