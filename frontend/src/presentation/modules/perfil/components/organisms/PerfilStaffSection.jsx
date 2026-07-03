/**
 * PerfilStaffSection — rama staff/admin de "Mi perfil".
 *
 * Atomic Design: ORGANISMO de página (cabecera de cuenta/rol + card de cuenta +
 * card persona/ficha + grilla de accesos troncales del rol). Recibe props ya
 * mapeadas por `usePerfilPage` y los accesos ya construidos (fail-closed por
 * permiso en `PerfilAccesosGrid`); sin fetch.
 */

import { Tag } from 'antd';
import { IdcardOutlined, UserOutlined } from '@ant-design/icons';
import { DetailInfoCard, RolPill } from '@molecules';
import { DetailField } from '@atoms';
import { DetailProfileCard } from '@organisms';
import { buildInitials } from '@application/utils/formatters';
import PerfilAccesosGrid from './PerfilAccesosGrid.jsx';

const PerfilStaffSection = ({ usuario, tipoRol, vinculoPerfil, accesos }) => {
  const rol = usuario?.rol;
  const rolPill = rol?.nombre ? <RolPill rol={rol} /> : null;

  return (
    <>
      <DetailProfileCard
        avatarInitials={buildInitials(usuario.username)}
        title={usuario.username}
        subtitle={usuario.email || 'Sin correo'}
        metaExtra={rolPill}
        stats={[
          { label: 'Rol', value: rol?.nombre || '—', primary: true },
          { label: 'Tipo de rol', value: tipoRol },
        ]}
      />

      <DetailInfoCard title="Cuenta y rol" icon={<UserOutlined />} cols={2}>
        <DetailField label="Usuario">{usuario.username}</DetailField>
        <DetailField label="Correo">{usuario.email || '—'}</DetailField>
        <DetailField label="Rol">{rolPill ?? '—'}</DetailField>
        <DetailField label="Tipo de rol">{tipoRol}</DetailField>
      </DetailInfoCard>

      {vinculoPerfil ? (
        <DetailInfoCard title="Persona / ficha" icon={<IdcardOutlined />} cols={2}>
          <DetailField label="Vinculación">
            <Tag color="blue">{vinculoPerfil.tipo_etiqueta}</Tag>
            <strong style={{ marginLeft: 8 }}>{vinculoPerfil.nombre_completo}</strong>
          </DetailField>
          {(vinculoPerfil.lineas || []).map((ln, idx) => (
            <DetailField key={`${ln.etiqueta}-${idx}`} label={ln.etiqueta}>
              {ln.valor || '—'}
            </DetailField>
          ))}
        </DetailInfoCard>
      ) : null}

      <PerfilAccesosGrid accesos={accesos} />
    </>
  );
};

export default PerfilStaffSection;
