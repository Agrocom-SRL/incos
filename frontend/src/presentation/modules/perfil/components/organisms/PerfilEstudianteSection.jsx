/**
 * PerfilEstudianteSection — rama ESTUDIANTE de "Mi perfil".
 *
 * Atomic Design: ORGANISMO de página (cabecera compacta + tarjeta de cuenta +
 * grilla de accesos del portal). Recibe props ya mapeadas por `usePerfilPage`
 * y los accesos ya construidos (`config/perfilAccesos.jsx`); sin fetch.
 */

import { Tag } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { DetailInfoCard, RolPill } from '@molecules';
import { DetailField } from '@atoms';
import { DetailProfileCard } from '@organisms';
import { buildInitials } from '@application/utils/formatters';
import PerfilAccesosGrid from './PerfilAccesosGrid.jsx';

const PerfilEstudianteSection = ({ usuario, nombreMostrado, correo, accesos }) => {
  const rol = usuario?.rol;
  const rolPill = rol?.nombre ? <RolPill rol={rol} /> : null;

  return (
    <>
      <DetailProfileCard
        avatarInitials={buildInitials(nombreMostrado)}
        avatarClassName="sd-profile__avatar sd-profile__avatar--default"
        title={nombreMostrado}
        subtitle={correo}
        metaExtra={rolPill ?? <Tag color="green">Estudiante</Tag>}
      />

      <DetailInfoCard title="Cuenta" icon={<UserOutlined />} cols={2}>
        <DetailField label="Usuario">{usuario.username}</DetailField>
        <DetailField label="Correo">{usuario.email || '—'}</DetailField>
        <DetailField label="Rol">{rolPill ?? '—'}</DetailField>
      </DetailInfoCard>

      <PerfilAccesosGrid accesos={accesos} />
    </>
  );
};

export default PerfilEstudianteSection;
