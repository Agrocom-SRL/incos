/**
 * Acceso al sistema: datos de usuario vinculado (tabla usuarios / docentes.usuario_id)
 * y acciones para crear o administrar la cuenta (dominio Seguridad).
 */

import { Tag } from 'antd';
import { IdcardOutlined, UserAddOutlined, SettingOutlined } from '@ant-design/icons';
import { useLocation, useNavigate } from 'react-router-dom';
import DetailInfoCard from '@docentes/components/molecules/DetailInfoCard';
import DetailField from '@docentes/components/atoms/DetailField';

const DocenteAccessSection = ({
  access,
  docenteId,
  docenteNombreCompleto,
  docenteCiCompleto,
  docenteEmailPersonal,
  puedeCrearUsuario,
  puedeEditarUsuario,
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleCrearUsuario = () => {
    if (access?.tieneAcceso && access?.usuarioId) {
      navigate(`/seguridad/usuarios/${access.usuarioId}`);
      return;
    }
    if (!docenteId) return;
    navigate('/seguridad/usuarios/nuevo', {
      state: {
        createInitialStep: 1, // abrir en paso 2 (datos del perfil) para confirmar vínculo docente
        forceCategoriaCreacion: 'ASIGNAR_DOCENTE',
        forceRoleCode: 'DOCENTE',
        returnToPath: location.pathname,
        prefillDocenteUsuario: {
          docenteId,
          nombreCompleto: docenteNombreCompleto || null,
          ciCompleto: docenteCiCompleto || null,
          emailPersonal: docenteEmailPersonal || null,
        },
      },
    });
  };

  const handleEditarUsuario = () => {
    if (!access?.usuarioId) return;
    navigate(`/seguridad/usuarios/${access.usuarioId}`);
  };

  const estado =
    access?.estadoCuenta == null || access?.estadoCuenta === ''
      ? 'Activo (sin restricción registrada)'
      : String(access.estadoCuenta);

  const extraAcciones = !access?.tieneAcceso ? (
    puedeCrearUsuario ? (
      <button type="button" className="sd-btn sd-btn--primary" onClick={handleCrearUsuario}>
        <UserAddOutlined /> Crear usuario de acceso
      </button>
    ) : null
  ) : puedeEditarUsuario ? (
    <button type="button" className="sd-btn sd-btn--outline" onClick={handleEditarUsuario}>
      <SettingOutlined /> Administrar usuario
    </button>
  ) : null;

  if (!access?.tieneAcceso) {
    return (
      <DetailInfoCard title="Acceso al sistema" icon={<IdcardOutlined />} cols={1} extra={extraAcciones}>
        <p style={{ color: 'var(--text-500)', margin: 0 }}>
          Este docente no tiene usuario vinculado para ingresar al sistema. Puede crear una cuenta con rol Docente
          desde Seguridad.
        </p>
      </DetailInfoCard>
    );
  }

  return (
    <DetailInfoCard title="Acceso al sistema" icon={<IdcardOutlined />} cols={2} extra={extraAcciones}>
      <DetailField label="Usuario">{access.usuario}</DetailField>
      <DetailField label="Rol">{access.rol || '—'}</DetailField>
      <DetailField label="Estado de cuenta" span={2}>
        <Tag color="blue">{estado}</Tag>
      </DetailField>
    </DetailInfoCard>
  );
};

export default DocenteAccessSection;
