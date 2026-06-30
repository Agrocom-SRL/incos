/**
 * Acceso al sistema (estudiante): usuario vinculado (estudiantes.usuario_id → usuarios)
 * y acción para crear la cuenta (dominio Seguridad). Gemelo de DocenteAccessSection.
 * Si no tiene cuenta, "Crear usuario de acceso" abre el alta directo en el paso 3
 * (Credenciales) con la categoría ASIGNAR_ESTUDIANTE y el vínculo ya resuelto.
 */

import { Tag } from 'antd';
import { IdcardOutlined, UserAddOutlined, SettingOutlined } from '@ant-design/icons';
import { useLocation, useNavigate } from 'react-router-dom';

const EstudianteAccessSection = ({
  access,
  estudianteId,
  estudianteNombreCompleto,
  estudianteCiCompleto,
  estudianteCodigo,
  estudianteEmailPersonal,
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
    if (!estudianteId) return;
    navigate('/seguridad/usuarios/nuevo', {
      state: {
        createInitialStep: 2, // ir directo al paso 3 (Credenciales): vínculo y rol ya vienen resueltos
        forceCategoriaCreacion: 'ASIGNAR_ESTUDIANTE',
        forceRoleCode: 'ESTUDIANTE',
        returnToPath: location.pathname,
        prefillEstudianteUsuario: {
          estudianteId,
          nombreCompleto: estudianteNombreCompleto || null,
          ciCompleto: estudianteCiCompleto || null,
          codigo: estudianteCodigo || null,
          emailPersonal: estudianteEmailPersonal || null,
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

  const extra = !access?.tieneAcceso
    ? puedeCrearUsuario
      ? (
        <button type="button" className="sd-btn sd-btn--primary" onClick={handleCrearUsuario}>
          <UserAddOutlined /> Crear usuario de acceso
        </button>
      )
      : null
    : puedeEditarUsuario
      ? (
        <button type="button" className="sd-btn sd-btn--outline" onClick={handleEditarUsuario}>
          <SettingOutlined /> Administrar usuario
        </button>
      )
      : null;

  return (
    <div className="sd-card">
      <div className="sd-card__head">
        <span className="sd-card__title">
          <span className="sd-card__title-icon"><IdcardOutlined /></span>
          Acceso al sistema
        </span>
        {extra ? <div className="sd-card__extra">{extra}</div> : null}
      </div>
      <div className={`sd-card__body sd-card__body--cols-${access?.tieneAcceso ? 2 : 1}`}>
        {!access?.tieneAcceso ? (
          <div className="sd-field sd-field--span-1">
            <span className="sd-field__value">
              Este estudiante no tiene usuario vinculado para ingresar al sistema. Puede crear una cuenta
              con rol Estudiante desde Seguridad.
            </span>
          </div>
        ) : (
          <>
            <div className="sd-field sd-field--span-1">
              <span className="sd-field__label">Usuario</span>
              <span className="sd-field__value">{access.usuario || '—'}</span>
            </div>
            <div className="sd-field sd-field--span-1">
              <span className="sd-field__label">Rol</span>
              <span className="sd-field__value">{access.rol || '—'}</span>
            </div>
            <div className="sd-field sd-field--span-2">
              <span className="sd-field__label">Estado de cuenta</span>
              <span className="sd-field__value"><Tag color="blue">{estado}</Tag></span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default EstudianteAccessSection;
