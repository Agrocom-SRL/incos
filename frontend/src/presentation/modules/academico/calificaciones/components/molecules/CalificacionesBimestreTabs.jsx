/**
 * Selector de bimestre con estilo de tabs institucional (.sd-tabs).
 */

import { Tabs } from 'antd';
import { CalendarOutlined } from '@ant-design/icons';

const CalificacionesBimestreTabs = ({ bimestres = [], value, onChange }) => (
  <div className="sd-tabs-shell cal-bimestre-shell">
    <Tabs
      className="sd-tabs"
      activeKey={String(value)}
      onChange={(k) => onChange(Number(k))}
      items={bimestres.map((b) => ({
        key: String(b),
        label: (
          <span className="sd-tab-label">
            <CalendarOutlined />
            Bimestre {b}
          </span>
        ),
      }))}
    />
  </div>
);

export default CalificacionesBimestreTabs;
