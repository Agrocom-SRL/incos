/**
 * CompromisoPagoModal - Confirmación del compromiso de pago antes de registrar la cuota.
 *
 * Single Responsibility: cuando la PRIMERA cuota deja saldo pendiente, pedir al operador
 * que confirme en cuántos días se compromete el estudiante a cancelar el resto, con una
 * lectura clara del saldo que queda y la fecha de vencimiento proyectada.
 *
 * Atomic Design: Organism (Modal AntD6 `open` + selección tipo tarjetas).
 *
 * Diseño: reemplaza al `Segmented` estirado a 5 opciones (que descuadraba el layout del
 * formulario) por tarjetas seleccionables en grilla responsive. Los colores salen del theme
 * de AntD (`theme.useToken`), no de hex sueltos.
 *
 * @param {boolean} open - Visibilidad del modal.
 * @param {number} saldoRestante - Saldo que quedará pendiente tras esta cuota (a comprometer).
 * @param {Array<{value:number,label:string,sub:string}>} opciones - Plazos permitidos.
 * @param {number} diasSeleccionados - Plazo elegido (controlado por el padre).
 * @param {Function} onChangeDias - Callback al elegir un plazo.
 * @param {string} fechaCompromiso - Fecha de vencimiento proyectada, ya formateada.
 * @param {boolean} confirmLoading - Registro en curso.
 * @param {Function} onConfirm - Confirmar y registrar el pago.
 * @param {Function} onCancel - Cerrar sin registrar.
 */

import { Modal, theme } from 'antd';
import { CalendarOutlined, ClockCircleOutlined, WalletOutlined } from '@ant-design/icons';
import { modalWidths } from '@theme/tokens/spacing';

const formatMonto = (monto) =>
  `Bs. ${Number(monto || 0).toLocaleString('es-BO', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const CompromisoPagoModal = ({
  open,
  saldoRestante = 0,
  opciones = [],
  diasSeleccionados,
  onChangeDias,
  fechaCompromiso,
  confirmLoading = false,
  onConfirm,
  onCancel,
}) => {
  const { token } = theme.useToken();

  return (
    <Modal
      open={open}
      title={
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
          <ClockCircleOutlined style={{ color: token.colorPrimary }} />
          Compromiso de pago
        </span>
      }
      okText="Confirmar y registrar"
      cancelText="Volver"
      onOk={onConfirm}
      onCancel={onCancel}
      confirmLoading={confirmLoading}
      maskClosable={!confirmLoading}
      width={modalWidths.modalWidthLG}
      destroyOnHidden
    >
      {/* Resumen del saldo que queda por cubrir */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '14px 16px',
          borderRadius: token.borderRadiusLG,
          background: token.colorFillQuaternary,
          border: `1px solid ${token.colorBorderSecondary}`,
          marginBottom: 20,
        }}
      >
        <WalletOutlined style={{ fontSize: 22, color: token.colorPrimary }} />
        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.35 }}>
          <span style={{ color: token.colorTextSecondary, fontSize: token.fontSizeSM }}>
            Con esta cuota quedará un saldo pendiente de
          </span>
          <strong style={{ fontSize: token.fontSizeHeading4, color: token.colorText }}>
            {formatMonto(saldoRestante)}
          </strong>
        </div>
      </div>

      <p style={{ margin: '0 0 12px', color: token.colorTextSecondary }}>
        Elige en cuánto tiempo se compromete el estudiante a cancelar el resto:
      </p>

      {/* Tarjetas de plazo (grilla responsive; sin estirar como el Segmented) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(96px, 1fr))',
          gap: 10,
          marginBottom: 20,
        }}
      >
        {opciones.map((opcion) => {
          const activo = opcion.value === diasSeleccionados;
          return (
            <button
              key={opcion.value}
              type="button"
              onClick={() => onChangeDias?.(opcion.value)}
              aria-pressed={activo}
              style={{
                cursor: 'pointer',
                textAlign: 'center',
                padding: '12px 8px',
                borderRadius: token.borderRadiusLG,
                border: `1.5px solid ${activo ? token.colorPrimary : token.colorBorder}`,
                background: activo ? token.colorPrimaryBg : token.colorBgContainer,
                color: activo ? token.colorPrimary : token.colorText,
                boxShadow: activo ? `0 0 0 3px ${token.colorPrimaryBg}` : 'none',
                transition: 'border-color .18s ease, background .18s ease, box-shadow .18s ease',
              }}
            >
              <div style={{ fontWeight: 600, fontSize: token.fontSizeLG }}>{opcion.label}</div>
              <div
                style={{
                  fontSize: token.fontSizeSM,
                  color: activo ? token.colorPrimary : token.colorTextTertiary,
                }}
              >
                {opcion.sub}
              </div>
            </button>
          );
        })}
      </div>

      {/* Vencimiento proyectado */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '12px 16px',
          borderRadius: token.borderRadiusLG,
          background: token.colorPrimaryBg,
          color: token.colorPrimaryText,
        }}
      >
        <CalendarOutlined style={{ fontSize: 18 }} />
        <span>
          El estudiante deberá cancelar el saldo hasta el{' '}
          <strong>{fechaCompromiso}</strong>.
        </span>
      </div>
    </Modal>
  );
};

export default CompromisoPagoModal;
