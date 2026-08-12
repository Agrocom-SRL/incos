/**
 * GestionSelectionSection - Organism para selección de gestión (ingreso anterior)
 *
 * Single Responsibility: Mostrar una lista compacta de gestiones para elegir
 * (cuando tipo admisión es ANTIGUO/TRANSITABILIDAD/TRASPASO). Estilo lista de
 * opciones tokenizada (gestion-selection-list.css), con etiqueta vertical estándar.
 *
 * @param {Object} form - Instancia del formulario de Ant Design
 * @param {Array} gestiones - Lista de gestiones disponibles
 * @param {boolean} loading - Estado de carga
 * @param {string} error - Mensaje de error
 * @param {string} [tipoAdmision] - Tipo de admisión actual (NUEVO, ANTIGUO, TRANSITABILIDAD, TRASPASO)
 */

import { useEffect } from 'react';
import { Form, Alert, Radio, Spin, Empty } from 'antd';
import { CalendarOutlined } from '@ant-design/icons';

const GestionSelectionSection = ({
  form,
  gestiones = [],
  loading = false,
  error = null,
  tipoAdmision,
}) => {
  // useWatch hace que el componente se re-renderice cuando cambia el valor del form
  // (p. ej. al preseleccionar la gestión vigente en useEffect), así el item correcto se marca selected
  const selectedValue = Form.useWatch('gestionIngresoId', form) ?? null;

  // Preseleccionar la gestión vigente cuando corresponde y aún no hay selección
  useEffect(() => {
    if (!form || !gestiones?.length) return;

    const currentValue = form.getFieldValue('gestionIngresoId');
    if (currentValue != null) return;

    const requierePreseleccion =
      tipoAdmision === 'ANTIGUO' ||
      tipoAdmision === 'TRANSITABILIDAD' ||
      tipoAdmision === 'TRASPASO';

    if (requierePreseleccion) {
      const gestionVigente = gestiones.find(
        (g) => g?.vigente === true || g?.vigente === 1
      );
      if (gestionVigente?.id != null) {
        form.setFieldsValue({ gestionIngresoId: gestionVigente.id });
      }
    }
  }, [form, tipoAdmision, gestiones]);

  if (error) {
    return <Alert type="error" showIcon title="Error al cargar gestiones" description={error} />;
  }

  if (loading) {
    return (
      <Spin tip="Cargando gestiones…">
        <div style={{ minHeight: 120 }} aria-hidden />
      </Spin>
    );
  }

  if (!gestiones?.length) {
    return <Empty description="No hay gestiones disponibles" image={Empty.PRESENTED_IMAGE_SIMPLE} />;
  }

  return (
    /* Ya estamos dentro del Form del WizardForm; solo Form.Item para no anidar <form> */
    <Form.Item
      name="gestionIngresoId"
      label="Gestión de ingreso"
      rules={[{ required: true, message: 'Seleccione la gestión anterior' }]}
      className="form-field form-field--vertical"
    >
      <Radio.Group style={{ width: '100%', display: 'block' }}>
        <div className="gestion-selection-list">
          {gestiones.map((gestion) => {
            const isSelected = selectedValue === gestion.id;
            const nombre = gestion.nombre || gestion.name || `Gestión ${gestion.anio ?? gestion.id}`;
            const anio = gestion.anio ?? gestion.año ?? '';

            return (
              <label
                key={gestion.id}
                className={`gestion-selection-item ${isSelected ? 'gestion-selection-item-selected' : ''}`}
              >
                <Radio value={gestion.id} />
                <CalendarOutlined className="gestion-selection-item-icon" />
                <span className="gestion-selection-item-text">{nombre}</span>
                {anio ? <span className="gestion-selection-item-year">({anio})</span> : null}
              </label>
            );
          })}
        </div>
      </Radio.Group>
    </Form.Item>
  );
};

export default GestionSelectionSection;
