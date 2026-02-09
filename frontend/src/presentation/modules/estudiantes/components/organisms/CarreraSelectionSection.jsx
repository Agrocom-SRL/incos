/**
 * CarreraSelectionSection - Organism para la sección de selección de carrera
 * 
 * Single Responsibility: Mostrar el formulario visual de selección de carrera con imágenes
 * 
 * Atomic Design: Organism
 * - Combina atoms (Card, Form, Radio) para selección de carrera
 * - Similar a PaymentMethodSelectionSection pero adaptado para carreras con imágenes
 * 
 * @param {Object} form - Instancia del formulario de Ant Design
 * @param {Array} carreras - Lista de carreras disponibles
 * @param {boolean} loading - Estado de carga
 * @param {string} error - Mensaje de error
 * @param {Function} onCarreraChange - Callback cuando cambia la carrera seleccionada
 * @param {boolean} embedded - Si true, no renderiza Card (para usar dentro de otro cuadro)
 * @param {boolean} compact - Si true, tarjetas de carrera con altura reducida
 */

import { Form, Alert, Radio, Spin, Empty, Typography } from 'antd';
import { Card } from '@atoms';

const { Text } = Typography;

const CARD_HEIGHT_DEFAULT = 260;
const CARD_HEIGHT_COMPACT = 220;

const CarreraSelectionSection = ({
  form,
  carreras = [],
  loading = false,
  error = null,
  onCarreraChange,
  embedded = false,
  compact = false,
}) => {
  const cardHeight = compact ? CARD_HEIGHT_COMPACT : CARD_HEIGHT_DEFAULT;
  // Handler para cuando cambia la selección del radio
  const handleRadioChange = (e) => {
    const carreraId = e.target.value;
    
    // Actualizar el formulario
    if (form) {
      form.setFieldsValue({ carreraId });
    }
    
    // Llamar al callback de cambio
    if (onCarreraChange) {
      const carrera = carreras.find(c => c.id === carreraId);
      onCarreraChange(carrera);
    }
  };

  // Obtener el valor seleccionado del formulario
  const selectedValue = form?.getFieldValue('carreraId') || null;

  // Función para obtener la URL completa de la imagen (mismo criterio que Dashboard)
  const getImageUrl = (imagenRuta) => {
    if (!imagenRuta) return null;
    if (imagenRuta.startsWith('http://') || imagenRuta.startsWith('https://')) {
      return imagenRuta;
    }
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '';
    const serverBaseUrl = apiBaseUrl.replace(/\/api\/?$/, '');
    return `${serverBaseUrl}${imagenRuta.startsWith('/') ? imagenRuta : '/' + imagenRuta}`;
  };

  const content = (
    <>
      {error && (
        <Alert
          title="Error al cargar carreras"
          description={error}
          type="error"
          showIcon
          style={{ marginBottom: '24px', borderRadius: '8px' }}
        />
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: compact ? '24px 16px' : '60px 40px' }}>
          <Spin size="large">
            <div style={{ minHeight: compact ? 60 : 100 }}>
              <p style={{ marginTop: '16px', color: '#8c8c8c' }}>Cargando carreras...</p>
            </div>
          </Spin>
        </div>
      ) : !carreras || carreras.length === 0 ? (
        <Empty
          description="No hay carreras disponibles"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          style={{ padding: '40px 0' }}
        />
      ) : (
        /* No usar Form aquí: ya estamos dentro del Form del WizardForm; solo Form.Item para no anidar <form> */
        <Form.Item
          name="carreraId"
          rules={[
            { required: true, message: 'Por favor seleccione una carrera' }
          ]}
        >
          <Radio.Group
              onChange={handleRadioChange}
              style={{ width: '100%' }}
            >
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: compact ? 'repeat(auto-fit, minmax(200px, 1fr))' : 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: compact ? 12 : 20
              }}>
                {carreras.map((carrera) => {
                  const isSelected = selectedValue === carrera.id;
                  const imagenUrl = getImageUrl(carrera.imagenRuta || carrera.imagen_ruta || carrera.image);
                  const colorHex = carrera.colorHex || carrera.color_hex || '#1890ff';
                  const hasImage = Boolean(imagenUrl);
                  const nombre = carrera.nombre || carrera.name || carrera.label;

                  return (
                    <Radio.Button
                      key={carrera.id}
                      value={carrera.id}
                      style={{
                        width: '100%',
                        height: 'auto',
                        padding: 0,
                        margin: 0,
                        border: isSelected 
                          ? `3px solid ${colorHex}` 
                          : '2px solid #e8e8e8',
                        borderRadius: '12px',
                        backgroundColor: hasImage ? '#f5f5f5' : (isSelected ? `${colorHex}08` : '#ffffff'),
                        transition: 'all 0.3s ease',
                        overflow: 'hidden',
                        cursor: 'pointer',
                        boxShadow: isSelected 
                          ? `0 4px 16px ${colorHex}40` 
                          : '0 2px 4px rgba(0,0,0,0.04)',
                      }}
                      className="carrera-card"
                    >
                      <div
                        style={{
                          position: 'relative',
                          width: '100%',
                          height: cardHeight,
                          borderRadius: '12px',
                          overflow: 'hidden',
                          backgroundColor: hasImage ? '#f5f5f5' : `${colorHex}25`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {hasImage ? (
                          <>
                            <img
                              src={imagenUrl}
                              alt={nombre || 'Carrera'}
                              style={{
                                position: 'absolute',
                                inset: 0,
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                              }}
                              onError={(e) => {
                                e.target.style.display = 'none';
                                if (e.target.parentElement) {
                                  e.target.parentElement.style.backgroundColor = `${colorHex}25`;
                                }
                              }}
                            />
                            <div
                              style={{
                                position: 'absolute',
                                inset: 0,
                                background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.3) 40%, transparent 70%)',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'flex-end',
                                padding: '20px',
                              }}
                            >
                              {nombre && (
                                <Text
                                  style={{
                                    color: '#fff',
                                    fontSize: '16px',
                                    fontWeight: 600,
                                    textShadow: '0 1px 3px rgba(0,0,0,0.8)',
                                    margin: 0,
                                    lineHeight: 1.3,
                                  }}
                                >
                                  {nombre}
                                </Text>
                              )}
                              {carrera.codigo && (
                                <Text
                                  style={{
                                    color: 'rgba(255,255,255,0.9)',
                                    fontSize: '12px',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px',
                                    textShadow: '0 1px 2px rgba(0,0,0,0.8)',
                                    marginTop: '2px',
                                  }}
                                >
                                  {carrera.codigo}
                                </Text>
                              )}
                            </div>
                          </>
                        ) : (
                          <div
                            style={{
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              gap: '8px',
                              padding: '16px',
                            }}
                          >
                            <span
                              style={{
                                fontSize: '56px',
                                fontWeight: 'bold',
                                color: colorHex,
                              }}
                            >
                              {carrera.codigo?.charAt(0) || '?'}
                            </span>
                            {nombre && (
                              <Text
                                style={{
                                  color: '#262626',
                                  fontSize: '15px',
                                  fontWeight: 600,
                                  textAlign: 'center',
                                  lineHeight: 1.3,
                                }}
                              >
                                {nombre}
                              </Text>
                            )}
                            {carrera.codigo && (
                              <Text
                                type="secondary"
                                style={{ fontSize: '12px', textTransform: 'uppercase' }}
                              >
                                {carrera.codigo}
                              </Text>
                            )}
                          </div>
                        )}

                        {/* Indicador de selección (esquina superior derecha) */}
                        {isSelected && (
                          <div
                            style={{
                              position: 'absolute',
                              top: '12px',
                              right: '12px',
                              width: '28px',
                              height: '28px',
                              borderRadius: '50%',
                              backgroundColor: colorHex,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                            }}
                          >
                            <span style={{ color: '#fff', fontSize: '16px', fontWeight: 'bold' }}>✓</span>
                          </div>
                        )}
                      </div>
                    </Radio.Button>
                  );
                })}
              </div>
            </Radio.Group>
        </Form.Item>
      )}
      
      <style>{`
        .carrera-card:hover:not(.ant-radio-button-wrapper-disabled) {
          transform: translateY(-4px);
          box-shadow: 0 6px 20px rgba(0,0,0,0.15) !important;
        }
        .carrera-card .ant-radio-button-wrapper {
          border: none !important;
          box-shadow: none !important;
        }
        .carrera-card .ant-radio-button-wrapper-checked {
          border: none !important;
          box-shadow: none !important;
        }
      `}</style>
    </>
  );

  if (embedded) {
    return content;
  }

  return (
    <Card
      title={
        <span style={{ fontSize: '18px', fontWeight: 600 }}>
          Seleccione la Carrera
        </span>
      }
      style={{ 
        marginTop: '24px', 
        marginBottom: '24px',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
      }}
      headerColor="primary"
    >
      {content}
    </Card>
  );
};

export default CarreraSelectionSection;
