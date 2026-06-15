/**
 * Organismo: acciones estándar de cabecera en fichas (volver).
 */

import { ArrowLeftOutlined } from '@ant-design/icons';

const DetailPageHeaderActions = ({ onVolver, label = 'Volver' }) => (
  <button type="button" className="sd-btn sd-btn--outline" onClick={onVolver}>
    <ArrowLeftOutlined /> {label}
  </button>
);

export default DetailPageHeaderActions;
