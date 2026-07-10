/**
 * Átomo: Tag de estado de usuario — ENUM NULL(=Activo)|BLOQUEADO|SUSPENDIDO|RETIRADO.
 * Fuente única de verdad visual: reemplaza los `estadoTag()` locales que estaban
 * duplicados en UsuarioDetailPage, RolUsuariosSection y usuariosTableColumns.
 */
import { Tag } from 'antd';

const ESTADO_CONFIG = {
  BLOQUEADO: { color: 'error', text: 'BLOQUEADO' },
  SUSPENDIDO: { color: 'warning', text: 'SUSPENDIDO' },
  RETIRADO: { color: undefined, text: 'RETIRADO' },
};

const UsuarioEstadoTag = ({ estado }) => {
  if (!estado) return <Tag color="success">Activo</Tag>;
  const cfg = ESTADO_CONFIG[estado] ?? { color: undefined, text: String(estado) };
  return <Tag color={cfg.color}>{cfg.text}</Tag>;
};

export default UsuarioEstadoTag;
