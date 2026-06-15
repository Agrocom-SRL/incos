/**
 * Molécula: etiqueta de tab con icono (sd-tab-label).
 */

import { Space } from 'antd';

const DetailTabLabel = ({ icon, children }) => (
  <Space size={7} className="sd-tab-label" align="center">
    {icon}
    <span>{children}</span>
  </Space>
);

export default DetailTabLabel;
