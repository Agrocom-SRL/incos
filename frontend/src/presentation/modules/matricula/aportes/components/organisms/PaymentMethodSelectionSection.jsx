/**
 * PaymentMethodSelectionSection - Organism para la sección de selección de método de pago
 *
 * Single Responsibility: Mostrar el formulario de selección de método de pago
 *
 * Atomic Design: Organism
 * - Combina atoms (Card, Form, Alert, Radio) para selección de método de pago
 * - Con `bare` se renderiza como sección PLANA (sin `Card` propia) para vivir
 *   dentro de un `CfgFormWorkspace` (PagosRegistrar); sin `bare` conserva la
 *   tarjeta con título (PagosEditarCuota, aún con el shell anterior).
 * - Neutros (bordes, fondos, textos) desde el theme de AntD (`theme.useToken`);
 *   los colores por método son acentos categóricos propios de cada medio de pago.
 *
 * @param {Object} metodosPagoData - Datos de métodos de pago
 * @param {Array} metodosPagoData.metodosPago - Lista de métodos de pago
 * @param {boolean} metodosPagoData.loading - Estado de carga
 * @param {string} metodosPagoData.error - Mensaje de error
 * @param {Object} metodosPagoData.selectedMetodoPago - Método de pago seleccionado
 * @param {Function} onSelectMetodoPago - Callback cuando se selecciona un método de pago
 * @param {Object} form - Instancia del formulario de Ant Design
 * @param {Function} onFinish - Callback cuando se envía el formulario
 * @param {boolean} bare - Renderizar sin Card (sección plana dentro del workspace)
 */

import { useEffect } from 'react';
import { Form, Alert, Flex, Radio, Spin, Empty, Typography, theme } from 'antd';
import { Card } from '@atoms';
import {
  CreditCardOutlined,
  DollarOutlined,
  QrcodeOutlined,
  BankOutlined,
  MobileOutlined
} from '@ant-design/icons';

const { Text } = Typography;

const PaymentMethodSelectionSection = ({
  metodosPagoData,
  onSelectMetodoPago,
  form,
  onFinish,
  bare = false
}) => {
  const { token } = theme.useToken();

  // Handler para cuando cambia la selección del radio
  const handleRadioChange = (e) => {
    const metodoPagoId = e.target.value;
    const metodoPago = metodosPagoData.metodosPago?.find(mp => mp.id === metodoPagoId);

    // Determinar si el nuevo método requiere cuenta
    const codigoMetodo = metodoPago?.codigo?.toUpperCase() || '';
    const requiereCuenta = codigoMetodo && ['TRANSFERENCIA', 'DEPOSITO', 'QR', 'TIGO_MONEY'].includes(codigoMetodo);

    // Actualizar el formulario
    if (form) {
      form.setFieldsValue({ metodoPagoId });

      // Si el método no requiere cuenta (ej: EFECTIVO), limpiar campos relacionados
      if (!requiereCuenta) {
        form.setFieldsValue({
          cuentaPagoId: undefined,
          numeroTransaccion: undefined
        });
      }
    }

    // Llamar al callback de selección
    if (metodoPago && onSelectMetodoPago) {
      onSelectMetodoPago(metodoPago);
    }
  };

  // Obtener el ID del método seleccionado para el Radio.Group (solo del contexto)
  const selectedValue = metodosPagoData.selectedMetodoPago?.id;

  // Sincronizar el valor del formulario con la selección actual del contexto
  useEffect(() => {
    if (form && metodosPagoData.selectedMetodoPago) {
      // Establecer el valor en el formulario cuando cambie la selección del contexto
      form.setFieldsValue({ metodoPagoId: metodosPagoData.selectedMetodoPago.id });
    }
  }, [form, metodosPagoData.selectedMetodoPago?.id]);

  // Acentos categóricos por método de pago (identidad de cada medio, no estados del sistema)
  const getMethodConfig = (codigo) => {
    const code = codigo?.toUpperCase() || '';
    switch (code) {
      case 'EFECTIVO':
        return { icon: DollarOutlined, color: token.colorSuccess, bgColor: token.colorSuccessBg };
      case 'TRANSFERENCIA':
        return { icon: BankOutlined, color: token.colorInfo, bgColor: token.colorInfoBg };
      case 'DEPOSITO':
        return { icon: BankOutlined, color: token.purple, bgColor: token['purple-1'] };
      case 'QR':
        return { icon: QrcodeOutlined, color: token.magenta, bgColor: token['magenta-1'] };
      case 'TIGO_MONEY':
        return { icon: MobileOutlined, color: token.orange, bgColor: token['orange-1'] };
      default:
        return { icon: CreditCardOutlined, color: token.colorInfo, bgColor: token.colorInfoBg };
    }
  };

  // Ordenar métodos de pago: EFECTIVO primero, luego los demás en su orden original
  const sortedMetodosPago = metodosPagoData.metodosPago ? [...metodosPagoData.metodosPago].sort((a, b) => {
    const codigoA = a.codigo?.toUpperCase() || '';
    const codigoB = b.codigo?.toUpperCase() || '';

    // EFECTIVO siempre va primero
    if (codigoA === 'EFECTIVO') return -1;
    if (codigoB === 'EFECTIVO') return 1;

    // Mantener el orden original para los demás
    return 0;
  }) : [];

  const content = (
    <>
      {metodosPagoData.error && (
        <Alert
          title="Error al cargar métodos de pago"
          description={metodosPagoData.error}
          type="error"
          showIcon
          style={{ marginBottom: token.marginLG }}
        />
      )}

      {metodosPagoData.loading ? (
        <Flex align="center" gap="small">
          <Spin size="small" />
          <Text type="secondary">Cargando métodos de pago…</Text>
        </Flex>
      ) : !metodosPagoData.metodosPago || metodosPagoData.metodosPago.length === 0 ? (
        <Empty
          description="No hay métodos de pago disponibles"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      ) : (
        /* No usar Form aquí: ya estamos dentro del Form del padre; solo Form.Item para no anidar <form> */
        <Form.Item
          name="metodoPagoId"
          rules={[
            { required: true, message: 'Por favor seleccione un método de pago' }
          ]}
        >
          <Radio.Group
            value={selectedValue}
            onChange={handleRadioChange}
            className="pago-metodo-grid"
          >
            {sortedMetodosPago.map((metodoPago) => {
              const isSelected = selectedValue === metodoPago.id;
              const { icon: IconComponent, color, bgColor } = getMethodConfig(metodoPago.codigo);

              return (
                <Radio.Button
                  key={metodoPago.id}
                  value={metodoPago.id}
                  className="pago-metodo-card"
                  // Acento categórico del medio de pago (tokens del theme) → CSS vars;
                  // el relieve/hover/selección viven en pagos-registrar.css
                  style={{ '--metodo-accent': color, '--metodo-accent-bg': bgColor }}
                >
                  <span className="pago-metodo-card__body">
                    <span className="pago-metodo-card__icon">
                      <IconComponent />
                    </span>
                    <span className="pago-metodo-card__text">
                      <span className="pago-metodo-card__nombre">{metodoPago.nombre}</span>
                      {metodoPago.codigo && (
                        <span className="pago-metodo-card__codigo">{metodoPago.codigo}</span>
                      )}
                    </span>
                    {isSelected && (
                      <span className="pago-metodo-card__check" aria-hidden>
                        ✓
                      </span>
                    )}
                  </span>
                </Radio.Button>
              );
            })}
          </Radio.Group>
        </Form.Item>
      )}
    </>
  );

  // Sección plana (workspace) o tarjeta propia (shell anterior)
  if (bare) {
    return content;
  }

  return (
    <Card
      title="Seleccionar método de pago"
      style={{ marginTop: token.marginLG, marginBottom: token.marginLG }}
      headerColor="primary"
    >
      {content}
    </Card>
  );
};

export default PaymentMethodSelectionSection;
