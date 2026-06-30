/**
 * Tarjeta de una opción dentro del grupo de radios de cargo institucional (icono centrado + textos).
 * El tamaño lo fija el CSS en rejilla (.seg-cargo-radio-group); aquí solo contenido y estado seleccionado.
 */
import { Radio, Typography } from 'antd';
import { TIPO_CONFIG } from '@modules/seguridad/constants/rolTipoConfig.js';
import { getInstitutionalCargoVisual } from '@modules/seguridad/usuarios/constants/usuarioCargoInstitucionalVisual.jsx';

const { Text } = Typography;

/**
 * @param {Object} props
 * @param {{ id: number, nombre: string, codigo: string, tipo?: string }} props.role
 * @param {boolean} props.selected
 */
export default function InstitutionalRoleRadioOption({ role, selected }) {
  const visual = getInstitutionalCargoVisual(role.codigo);
  const { Icon } = visual;

  return (
    <Radio value={role.id}>
      <div
        className="seg-cargo-radio__card"
        style={{
          borderColor: selected ? visual.color : undefined,
          background: selected ? visual.tint : undefined,
        }}
      >
        <div
          className="seg-cargo-radio__icon-wrap"
          style={{ background: visual.tint, color: visual.color }}
        >
          <Icon style={{ fontSize: 22 }} />
        </div>
        <div className="seg-cargo-radio__body">
          <Text strong className="seg-cargo-radio__title">
            {role.nombre}
          </Text>
          <Text type="secondary" className="seg-cargo-radio__tipo">
            {TIPO_CONFIG[role.tipo]?.label ?? role.tipo ?? '—'}
          </Text>
        </div>
      </div>
    </Radio>
  );
}
