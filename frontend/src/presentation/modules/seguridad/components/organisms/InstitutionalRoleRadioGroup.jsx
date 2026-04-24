/**
 * Agrupa las opciones de rol institucional: es el control que envuelve Form.Item (value/onChange de Ant Design).
 * Cada opción la renderiza `InstitutionalRoleRadioOption`; el aspecto en rejilla está en `seguridad.css`.
 */
import { Radio } from 'antd';
import InstitutionalRoleRadioOption from './InstitutionalRoleRadioOption.jsx';

/**
 * @param {Object} props
 * @param {number|undefined} props.value
 * @param {(e: { target: { value: number } }) => void} props.onChange
 * @param {Array<{ id: number, nombre: string, codigo: string, tipo?: string }>} props.roles - ya ordenados
 */
export default function InstitutionalRoleRadioGroup({ value, onChange, roles = [] }) {
  return (
    <Radio.Group className="seg-cargo-radio-group" value={value} onChange={onChange}>
      {roles.map((role) => (
        <InstitutionalRoleRadioOption key={role.id} role={role} selected={value === role.id} />
      ))}
    </Radio.Group>
  );
}
