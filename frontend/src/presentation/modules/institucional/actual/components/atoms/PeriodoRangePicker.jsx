/**
 * Átomo: selector de rango de fechas de un periodo/etapa. Wrapper de
 * DatePicker.RangePicker (antd v6) que trabaja con fechas ISO 'YYYY-MM-DD'
 * hacia afuera y dayjs por dentro.
 */

import { DatePicker } from 'antd';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;

const toDayjs = (iso) => (iso ? dayjs(String(iso).slice(0, 10)) : null);

const PeriodoRangePicker = ({ fechaInicio, fechaFin, onChange, disabled = false }) => {
  const value = [toDayjs(fechaInicio), toDayjs(fechaFin)];

  const handleChange = (dates) => {
    if (!onChange) return;
    const [ini, fin] = dates ?? [];
    onChange(ini ? ini.format('YYYY-MM-DD') : null, fin ? fin.format('YYYY-MM-DD') : null);
  };

  return (
    <RangePicker
      value={value}
      onChange={handleChange}
      disabled={disabled}
      allowClear={false}
      format="DD/MM/YYYY"
      placeholder={['Inicio', 'Fin']}
      style={{ width: '100%' }}
    />
  );
};

export default PeriodoRangePicker;
