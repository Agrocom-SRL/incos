/**
 * PaymentFormFields - Molecule para los campos del formulario de pago
 * 
 * Single Responsibility: Renderizar campos del formulario según el método de pago
 * 
 * Atomic Design: Molecule
 * - Combina atoms (Form.Item, Input, DatePicker, Select, Upload) para crear campos de formulario
 * 
 * @param {Object} form - Instancia del formulario de Ant Design
 * @param {Object} cuentasPagoData - Datos de cuentas de pago
 * @param {boolean} requiereFechaPago - Si requiere fecha de pago
 * @param {boolean} requiereCuenta - Si requiere cuenta de pago
 * @param {boolean} requiereNumeroTransaccion - Si requiere número de transacción
 * @param {boolean} requiereCodigoComprobante - Si requiere código de comprobante
 * @param {boolean} requiereDocumentoRespaldo - Si requiere documento de respaldo
 * @param {boolean} esQR - Si es método QR
 */

import { Row, Col, Form, Input, DatePicker, Select, Upload } from 'antd';
import { 
  CalendarOutlined,
  FileTextOutlined,
  BankOutlined,
  UploadOutlined,
  QrcodeOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { Button } from '@atoms';

const { TextArea } = Input;

const PaymentFormFields = ({
  form,
  cuentasPagoData,
  requiereFechaPago = false,
  requiereCuenta = false,
  requiereNumeroTransaccion = false,
  requiereCodigoComprobante = false,
  requiereDocumentoRespaldo = false,
  esQR = false
}) => {
  return (
    <Row gutter={[16, 16]}>
      {/* Fecha de Pago - Solo para métodos que no sean EFECTIVO */}
      {requiereFechaPago && (
        <Col xs={24} sm={12}>
          <Form.Item
            name="fechaPago"
            label={
              <span style={{ fontWeight: 500, fontSize: '14px' }}>
                <CalendarOutlined style={{ marginRight: '6px', color: '#1890ff' }} />
                Fecha de Pago
              </span>
            }
            rules={[
              { required: requiereFechaPago, message: 'Por favor seleccione la fecha de pago' }
            ]}
          >
            <DatePicker
              style={{ 
                width: '100%',
                borderRadius: '8px',
                height: '42px',
              }}
              format="DD/MM/YYYY"
              placeholder="Seleccione la fecha"
              disabledDate={(current) => current && current > dayjs().endOf('day')}
              size="large"
            />
          </Form.Item>
        </Col>
      )}

      {/* Cuenta de Pago - Solo si requiere cuenta */}
      {requiereCuenta && (
        <Col xs={24} sm={12}>
          <Form.Item
            name="cuentaPagoId"
            label={
              <span style={{ fontWeight: 500, fontSize: '14px' }}>
                <BankOutlined style={{ marginRight: '6px', color: '#1890ff' }} />
                Cuenta de Pago
              </span>
            }
            rules={[
              { required: requiereCuenta, message: 'Por favor seleccione una cuenta de pago' }
            ]}
          >
            <Select
              placeholder="Seleccione una cuenta de pago"
              loading={cuentasPagoData?.loading}
              size="large"
              style={{
                borderRadius: '8px',
              }}
              options={
                (cuentasPagoData?.cuentasPago || []).map(cuenta => ({
                  label: `${cuenta.nombre}${cuenta.numeroCuenta ? ` - ${cuenta.numeroCuenta}` : ''}`,
                  value: cuenta.id,
                }))
              }
            />
          </Form.Item>
        </Col>
      )}

      {/* Número de Transacción - Solo para TRANSFERENCIA */}
      {requiereNumeroTransaccion && (
        <Col xs={24} sm={12}>
          <Form.Item
            name="numeroTransaccion"
            label={
              <span style={{ fontWeight: 500, fontSize: '14px' }}>
                <FileTextOutlined style={{ marginRight: '6px', color: '#1890ff' }} />
                Número de Transacción/Código
              </span>
            }
            tooltip="Ingrese el número de transacción o código de transferencia bancaria"
            rules={[
              { required: requiereNumeroTransaccion, message: 'Por favor ingrese el número de transacción' }
            ]}
          >
            <Input
              placeholder="Número de transacción o código"
              prefix={<FileTextOutlined style={{ color: '#8c8c8c' }} />}
              size="large"
              style={{ borderRadius: '8px' }}
            />
          </Form.Item>
        </Col>
      )}
      
      {/* Código del Comprobante - Para QR y TRANSFERENCIA */}
      {requiereCodigoComprobante && (
        <Col xs={24} sm={12}>
          <Form.Item
            name="codigoComprobante"
            label={
              <span style={{ fontWeight: 500, fontSize: '14px' }}>
                <QrcodeOutlined style={{ marginRight: '6px', color: '#1890ff' }} />
                Código del Comprobante
              </span>
            }
            tooltip={esQR ? "Ingrese el código del comprobante QR" : "Ingrese el código del comprobante de transferencia"}
            rules={[
              { required: requiereCodigoComprobante, message: 'Por favor ingrese el código del comprobante' }
            ]}
          >
            <Input
              placeholder={esQR ? "Código del comprobante QR" : "Código del comprobante"}
              prefix={<QrcodeOutlined style={{ color: '#8c8c8c' }} />}
              size="large"
              style={{ borderRadius: '8px' }}
            />
          </Form.Item>
        </Col>
      )}
      
      {/* Documento de Respaldo - Para todos los métodos excepto EFECTIVO */}
      {requiereDocumentoRespaldo && (
        <Col xs={24} sm={12}>
          <Form.Item
            name="documentoRespaldo"
            valuePropName="fileList"
            getValueFromEvent={(e) => {
              if (Array.isArray(e)) {
                return e;
              }
              return e?.fileList;
            }}
            label={
              <span style={{ fontWeight: 500, fontSize: '14px' }}>
                <UploadOutlined style={{ marginRight: '6px', color: '#1890ff' }} />
                Documento de Respaldo
              </span>
            }
            tooltip="Suba un archivo como comprobante del pago (imagen, PDF, etc.)"
            rules={[
              { required: requiereDocumentoRespaldo, message: 'Por favor suba un documento de respaldo' }
            ]}
          >
            <Upload
              maxCount={1}
              beforeUpload={() => false} // Prevenir subida automática
              accept="image/*,.pdf,.doc,.docx"
            >
              <Button
                icon={<UploadOutlined />}
                size="large"
                style={{ borderRadius: '8px', width: '100%' }}
              >
                Seleccionar Archivo
              </Button>
            </Upload>
          </Form.Item>
        </Col>
      )}

      {/* Concepto */}
      <Col xs={24}>
        <Form.Item
          name="concepto"
          label={
            <span style={{ fontWeight: 500, fontSize: '14px' }}>
              Concepto
            </span>
          }
          tooltip="Descripción del concepto del pago"
          rules={[
            { required: true, message: 'Por favor ingrese el concepto del pago' }
          ]}
        >
          <TextArea
            rows={3}
            placeholder="Ej: Pago de aporte académico gestión 2025..."
            maxLength={500}
            showCount
            style={{ 
              borderRadius: '8px',
              fontSize: '14px'
            }}
          />
        </Form.Item>
      </Col>
    </Row>
  );
};

export default PaymentFormFields;
