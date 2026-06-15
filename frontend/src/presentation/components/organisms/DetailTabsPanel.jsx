/**
 * Organismo: pestañas de ficha (sd-tabs-shell + Ant Design Tabs).
 */

import { Tabs } from 'antd';

const DetailTabsPanel = ({
  items,
  defaultActiveKey,
  activeKey,
  onChange,
  className = 'sd-tabs',
}) => (
  <div className="sd-tabs-shell">
    <Tabs
      className={className}
      items={items}
      defaultActiveKey={defaultActiveKey}
      activeKey={activeKey}
      onChange={onChange}
    />
  </div>
);

export default DetailTabsPanel;
