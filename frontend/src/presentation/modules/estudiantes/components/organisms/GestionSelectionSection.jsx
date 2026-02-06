/**
 * GestionSelectionSection - Organism para selección de gestión (ingreso anterior)
 *
 * Single Responsibility: Mostrar una lista compacta de gestiones para elegir
 * (cuando tipo admisión es ANTIGUO). No usa cards ni select; estilo lista de opciones.
 *
 * Atomic Design: Organism
 * - Lista vertical con Radio: nombre + año, compacta y clara
 *
 * @param {Object} form - Instancia del formulario de Ant Design
 * @param {Array} gestiones - Lista de gestiones disponibles
 * @param {boolean} loading - Estado de carga
 * @param {string} error - Mensaje de error
 */

import { Form, Alert, Radio, Spin, Empty } from 'antd';
import { CalendarOutlined } from '@ant-design/icons';
import './GestionSelectionSection.css';

const GestionSelectionSection = ({
  form,
  gestiones = [],
  loading = false,
  error = null,
}) => {
  const handleRadioChange = (e) => {
    const gestionIngresoId = e.target.value;
    if (form) {
      form.setFieldsValue({ gestionIngresoId });
    }
  };

  const selectedValue = form?.getFieldValue('gestionIngresoId') ?? null;

  return (
    <div style={{ marginBottom: 24 }}>
      <div
        style={{
          fontSize: '16px',
          fontWeight: 600,
          color: 'rgba(0,0,0,0.88)',
          marginBottom: 12,
        }}
      >
        Gestión de ingreso del estudiante
      </div>

      {error && (
        <Alert
          title="Error al cargar gestiones"
          description={error}
          type="error"
          showIcon
          style={{ marginBottom: 16, borderRadius: 8 }}
        />
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '32px 16px' }}>
          <Spin size="large">
            <div style={{ minHeight: 60 }}>
              <p style={{ marginTop: 12, color: '#8c8c8c', fontSize: 14 }}>
                Cargando gestiones...
              </p>
            </div>
          </Spin>
        </div>
      ) : !gestiones?.length ? (
        <Empty
          description="No hay gestiones disponibles"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          style={{ padding: '24px 0' }}
        />
      ) : (
        /* No usar Form aquí: ya estamos dentro del Form del WizardForm; solo Form.Item para no anidar <form> */
        <Form.Item
          name="gestionIngresoId"
          rules={[{ required: true, message: 'Seleccione la gestión anterior' }]}
          style={{ marginBottom: 0 }}
        >
          <Radio.Group
              value={selectedValue}
              onChange={handleRadioChange}
              style={{ width: '100%', display: 'block' }}
            >
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
                      <CalendarOutlined className="gestion-selection-item-icon" style={{ fontSize: 16 }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <span className="gestion-selection-item-text" style={{ fontSize: 14, fontWeight: isSelected ? 600 : 400 }}>
                          {nombre}
                        </span>
                        {anio && (
                          <span className="gestion-selection-item-year" style={{ marginLeft: 8, fontSize: 13, opacity: 0.85 }}>
                            ({anio})
                          </span>
                        )}
                      </div>
                    </label>
                  );
                })}
              </div>
            </Radio.Group>
        </Form.Item>
      )}
    </div>
  );
};

export default GestionSelectionSection;
