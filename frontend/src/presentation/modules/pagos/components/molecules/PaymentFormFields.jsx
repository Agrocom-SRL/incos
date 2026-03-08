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
 * @param {Object} bancosAutorizadosData - Datos de bancos autorizados (opcional)
 * @param {boolean} requiereFechaPago - Si requiere fecha de pago
 * @param {boolean} requiereCuenta - Si requiere cuenta de pago
 * @param {boolean} requiereNumeroTransaccion - Si requiere número de transacción
 * @param {boolean} requiereCodigoComprobante - Si requiere código de comprobante
 * @param {boolean} requiereDocumentoRespaldo - Si requiere documento de respaldo
 * @param {boolean} esQR - Si es método QR
 */

import { useMemo } from 'react';
import { Row, Col, Form, Input, DatePicker, Select, Upload } from 'antd';

const { Dragger } = Upload;
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
  bancosAutorizadosData,
  requiereFechaPago = false,
  requiereCuenta = false,
  requiereNumeroTransaccion = false,
  requiereCodigoComprobante = false,
  requiereDocumentoRespaldo = false,
  esQR = false
}) => {
  // Crear mapa de bancos por ID para búsqueda rápida
  const bancosMap = useMemo(() => {
    if (!bancosAutorizadosData?.bancosAutorizados || !Array.isArray(bancosAutorizadosData.bancosAutorizados)) {
      return {};
    }
    return bancosAutorizadosData.bancosAutorizados.reduce((map, banco) => {
      map[banco.id] = banco;
      return map;
    }, {});
  }, [bancosAutorizadosData?.bancosAutorizados]);

  // Helper para obtener nombre del banco
  const obtenerNombreBanco = (cuenta) => {
    // Primero verificar si la cuenta tiene información del banco directamente
    if (cuenta.banco?.nombre) return cuenta.banco.nombre;
    if (cuenta.bancoNombre) return cuenta.bancoNombre;
    
    // Si no, buscar en el mapa de bancos usando bancoId
    if (cuenta.bancoId && bancosMap[cuenta.bancoId]) {
      return bancosMap[cuenta.bancoId].nombre;
    }
    
    return null;
  };

  // Helper para obtener código del banco
  const obtenerCodigoBanco = (cuenta) => {
    if (cuenta.banco?.codigo) return cuenta.banco.codigo;
    if (cuenta.bancoCodigo) return cuenta.bancoCodigo;
    
    if (cuenta.bancoId && bancosMap[cuenta.bancoId]) {
      return bancosMap[cuenta.bancoId].codigo;
    }
    
    return null;
  };
  return (
    <Row gutter={[16, 16]}>
      {/* 1. Fecha de Pago - SIEMPRE obligatoria para todos los métodos (excepto pagos gratuitos) */}
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

      {/* 2. Cuenta de Pago - Obligatoria para TRANSFERENCIA o DEPOSITO */}
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
                (cuentasPagoData?.cuentasPago || []).map(cuenta => {
                  const nombreCuenta = cuenta.accountHolderName || cuenta.nombreTitular || cuenta.nombre || '';
                  const numeroCuenta = cuenta.accountNumber || cuenta.numeroCuenta || '';
                  const bancoNombre = obtenerNombreBanco(cuenta);
                  const bancoCodigo = obtenerCodigoBanco(cuenta);
                  
                  // Construir label con información del banco si está disponible
                  let label = nombreCuenta;
                  if (numeroCuenta) {
                    label += ` - ${numeroCuenta}`;
                  }
                  if (bancoNombre) {
                    const bancoInfo = bancoCodigo ? `${bancoNombre} (${bancoCodigo})` : bancoNombre;
                    label += ` - ${bancoInfo}`;
                  }
                  
                  return {
                    label,
                    value: cuenta.id,
                  };
                })
              }
            />
          </Form.Item>
        </Col>
      )}

      {/* 3. Código del Comprobante - Obligatorio para QR, TRANSFERENCIA o DEPOSITO */}
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
            tooltip={esQR ? "Ingrese el código del comprobante QR" : "Ingrese el código del comprobante de transferencia o depósito"}
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

      {/* 4. Número de Transacción - Opcional */}
      {requiereNumeroTransaccion && (
        <Col xs={24} sm={12}>
          <Form.Item
            name="numeroTransaccion"
            label={
              <span style={{ fontWeight: 500, fontSize: '14px' }}>
                <FileTextOutlined style={{ marginRight: '6px', color: '#1890ff' }} />
                Número de Transacción
              </span>
            }
            tooltip="Ingrese el número de transacción bancaria (opcional)"
            required={false}
            rules={[]}
          >
            <Input
              placeholder="Número de transacción bancaria"
              prefix={<FileTextOutlined style={{ color: '#8c8c8c' }} />}
              size="large"
              style={{ borderRadius: '8px' }}
            />
          </Form.Item>
        </Col>
      )}

      {/* 5. Documento de Respaldo - Opcional */}
      {requiereDocumentoRespaldo && (
        <Col xs={24} sm={12}>
          <Form.Item
            name="documentoRespaldo"
            valuePropName="fileList"
            required={false}
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
            tooltip="Arrastre y suelte un archivo o haga clic para seleccionar (imagen, PDF, etc.) - Opcional"
            rules={[]}
          >
            <Dragger
              maxCount={1}
              beforeUpload={() => false} // Prevenir subida automática
              accept="image/*,.pdf,.doc,.docx"
              style={{
                borderRadius: '8px',
                padding: '20px',
                backgroundColor: '#fafafa',
                border: '2px dashed #d9d9d9',
                transition: 'all 0.3s ease',
              }}
            >
              <p style={{ margin: 0, fontSize: '16px', color: '#595959' }}>
                <UploadOutlined style={{ fontSize: '48px', color: '#1890ff', display: 'block', marginBottom: '8px' }} />
              </p>
              <p style={{ margin: '8px 0 4px 0', fontSize: '14px', color: '#262626', fontWeight: 500 }}>
                Arrastre y suelte el archivo aquí
              </p>
              <p style={{ margin: 0, fontSize: '12px', color: '#8c8c8c' }}>
                o <span style={{ color: '#1890ff', cursor: 'pointer' }}>haga clic para seleccionar</span>
              </p>
              <p style={{ margin: '8px 0 0 0', fontSize: '12px', color: '#8c8c8c' }}>
                Formatos: JPG, PNG, PDF, DOC, DOCX
              </p>
            </Dragger>
          </Form.Item>
        </Col>
      )}

      {/* 6. Observación - Opcional */}
      <Col xs={12}>
        <Form.Item
          name="descripcion"
          label={
            <span style={{ fontWeight: 500, fontSize: '14px' }}>
              Observación
            </span>
          }
          tooltip="Observación del pago: plazo, datos adicionales (opcional)"
          required={false}
          rules={[
            // Validar longitud solo si se proporciona un valor
            {
              validator: (_, value) => {
                if (!value || value.trim().length === 0) {
                  return Promise.resolve(); // Permitir vacío
                }
                if (value.trim().length > 500) {
                  return Promise.reject('La observación no puede exceder 500 caracteres');
                }
                return Promise.resolve();
              }
            }
          ]}
        >
          <TextArea
            rows={4}
            placeholder="Ej: Plazo de entrega, datos adicionales..."
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
