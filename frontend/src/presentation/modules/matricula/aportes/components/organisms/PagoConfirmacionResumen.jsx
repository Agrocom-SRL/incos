/**
 * PagoConfirmacionResumen - Organism del paso "Confirmación" de registrar pago
 *
 * Single Responsibility: Mostrar el resumen final de lo que se va a registrar
 * (estudiante | pago en paneles gemelos), el compromiso de pago cuando aplica
 * (plazo elegible inline, sin modal sorpresa) y la observación opcional.
 *
 * Atomic Design: Organism
 * - Sección PLANA dentro del workspace del wizard (`FormWorkspaceSection`).
 * - Mismo lenguaje visual que AsignacionBecaResumen (paneles .resumen-panel*).
 * - Los datos del comprobante se leen del Form (persisten aunque el paso
 *   "Datos del pago" esté desmontado: preserve por defecto de AntD).
 *
 * @param {Object} student - { codigoEstudiante, nombreCompleto, ciCompleto }
 * @param {Object} becaActiva - Beca vigente del estudiante (opcional)
 * @param {number} porcentajeBeca - Porcentaje de la beca vigente
 * @param {number} descuentoBeca - Monto que se descuenta por la beca
 * @param {boolean} esPrimeraCuota - Primera cuota del aporte (pill informativa)
 * @param {Object} estadoActualAporte - Estado actual del aporte (para el concepto)
 * @param {Object} configuracionAporte - Configuración de aporte activa (para el concepto)
 * @param {boolean} esPagoGratuito - Aporte cubierto por beca/condonación (monto 0)
 * @param {number|string|null} montoCuota - Monto de esta cuota
 * @param {Object} selectedMetodoPago - Método de pago elegido
 * @param {Object} cuentasPago - Grupo de cuentas de pago del contexto
 * @param {number} saldoRestante - Saldo que quedará pendiente tras esta cuota
 * @param {boolean} mostrarSelectorCompromiso - Si aplica el compromiso (1ra cuota con saldo)
 * @param {Array} opcionesCompromiso - Plazos permitidos
 * @param {number} compromisoDias - Plazo elegido (controlado)
 * @param {Function} onChangeCompromisoDias - Callback al elegir plazo
 * @param {string} fechaCompromiso - Vencimiento proyectado, ya formateado
 * @param {Object} form - Instancia del formulario de la pantalla
 */

import { Flex, Form, Input, Tag, Typography } from 'antd';
import { CalendarOutlined, WalletOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { StatusPill } from '@atoms';
import { EstudianteResumenPanel } from '@molecules';
import { formatFechaLiteral } from '@application/utils';
import { resolveConceptoNombre } from '../../config/aporteConcepto';
import { CompromisoPlazoSelector } from '../molecules';

const { Paragraph, Text } = Typography;
const { TextArea } = Input;

const formatMonto = (monto) =>
  `Bs. ${Number(monto || 0).toLocaleString('es-BO', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const PagoConfirmacionResumen = ({
  student,
  becaActiva = null,
  porcentajeBeca = 0,
  descuentoBeca = 0,
  esPrimeraCuota = false,
  estadoActualAporte = null,
  configuracionAporte = null,
  esPagoGratuito = false,
  montoCuota,
  selectedMetodoPago,
  cuentasPago,
  saldoRestante = 0,
  mostrarSelectorCompromiso = false,
  opcionesCompromiso = [],
  compromisoDias,
  onChangeCompromisoDias,
  fechaCompromiso,
  form,
}) => {
  // Valores capturados en "Datos del pago" (persisten en el store del Form)
  const fechaPago = form?.getFieldValue('fechaPago');
  const cuentaPagoId = form?.getFieldValue('cuentaPagoId');
  const codigoComprobante = form?.getFieldValue('codigoComprobante');
  const numeroTransaccion = form?.getFieldValue('numeroTransaccion');
  const documentoRespaldo = form?.getFieldValue('documentoRespaldo');

  const cuentaSeleccionada =
    (cuentasPago?.cuentasPago || []).find((c) => c.id === cuentaPagoId) ||
    cuentasPago?.selectedCuentaPago ||
    null;
  const cuentaLabel = cuentaSeleccionada
    ? [
        cuentaSeleccionada.accountHolderName ||
          cuentaSeleccionada.nombreTitular ||
          cuentaSeleccionada.nombre,
        cuentaSeleccionada.accountNumber || cuentaSeleccionada.numeroCuenta,
      ]
        .filter(Boolean)
        .join(' - ')
    : null;

  const archivoRespaldo =
    Array.isArray(documentoRespaldo) && documentoRespaldo.length > 0
      ? documentoRespaldo[0]?.name || documentoRespaldo[0]?.originFileObj?.name || null
      : null;

  // Fechas en forma literal ("13 de agosto de 2026"), coherentes con el
  // vencimiento del compromiso.
  const lineas = esPagoGratuito
    ? [{ label: 'Fecha de registro', valor: formatFechaLiteral(dayjs()) }]
    : [
        {
          label: 'Fecha de pago',
          valor: fechaPago && dayjs(fechaPago).isValid() ? formatFechaLiteral(dayjs(fechaPago)) : '—',
        },
        ...(cuentaLabel ? [{ label: 'Cuenta de pago', valor: cuentaLabel }] : []),
        ...(codigoComprobante ? [{ label: 'Código de comprobante', valor: codigoComprobante }] : []),
        ...(numeroTransaccion ? [{ label: 'N.º de transacción', valor: numeroTransaccion }] : []),
        ...(archivoRespaldo ? [{ label: 'Documento de respaldo', valor: archivoRespaldo }] : []),
      ];

  // Concepto del aporte (título del pago) y descuento del estudiante
  const conceptoNombre = resolveConceptoNombre(estadoActualAporte, configuracionAporte);
  const becaNombre =
    becaActiva?.scholarshipName || becaActiva?.scholarshipType?.name || null;
  const mostrarDescuento = Number(descuentoBeca) > 0;

  return (
    <Flex vertical gap="large">
      <div className="resumen-panels">
        {/* Panel estudiante (molécula compartida con asignar beca); el descuento
            por beca es del estudiante, así que se muestra en su cuadro */}
        <EstudianteResumenPanel student={student}>
          {mostrarDescuento ? (
            <div className="resumen-panel__linea">
              <span className="resumen-panel__linea-label">
                {becaNombre ? `Beca ${becaNombre}` : 'Descuento por beca'}
                {porcentajeBeca ? ` (${porcentajeBeca}%)` : ''}
              </span>
              <Text type="success" className="resumen-panel__linea-valor">
                - {formatMonto(descuentoBeca)}
              </Text>
            </div>
          ) : null}
        </EstudianteResumenPanel>

        {/* Panel pago */}
        <div className="resumen-panel">
          <div className="resumen-panel__head">
            <span className="resumen-panel__label">
              <WalletOutlined /> Pago
            </span>
            <span className="resumen-panel__pill">
              {formatMonto(esPagoGratuito ? 0 : montoCuota)}
            </span>
          </div>
          {esPagoGratuito ? (
            <>
              <div>
                <Tag color="success">Pago gratuito</Tag>
              </div>
              <Paragraph className="resumen-panel__desc">
                El aporte está cubierto por la beca o condonación del estudiante; el pago se
                registrará con monto 0.
              </Paragraph>
            </>
          ) : (
            <Text className="resumen-panel__titulo">
              {selectedMetodoPago?.nombre || 'Método de pago'}
            </Text>
          )}
          {/* Título/concepto de lo que se paga */}
          <Paragraph className="resumen-panel__desc">{conceptoNombre}</Paragraph>
          {lineas.map((linea) => (
            <div key={linea.label} className="resumen-panel__linea">
              <span className="resumen-panel__linea-label">{linea.label}</span>
              <span className="resumen-panel__linea-valor">{linea.valor}</span>
            </div>
          ))}
          {!esPagoGratuito ? (
            <div className="resumen-panel__linea">
              <span className="resumen-panel__linea-label">Saldo tras esta cuota</span>
              <span className="resumen-panel__linea-valor">{formatMonto(saldoRestante)}</span>
            </div>
          ) : null}
          {esPrimeraCuota && !esPagoGratuito ? (
            <div className="resumen-panel__meta">
              <StatusPill
                label="Primera cuota del aporte"
                className="cfg-materia-pill cfg-materia-pill--info"
              />
            </div>
          ) : null}
        </div>
      </div>

      {/* Compromiso de pago: solo 1ra cuota con saldo restante */}
      {mostrarSelectorCompromiso ? (
        <div className="fw-subsection">
          <div className="fw-subsection__header">
            <Text strong className="fw-subsection__title">
              Compromiso de pago
            </Text>
          </div>
          <Paragraph type="secondary" className="fw-subsection__desc">
            Con esta cuota quedará un saldo pendiente de{' '}
            <Text strong>{formatMonto(saldoRestante)}</Text>. Elija en cuánto tiempo se
            compromete el estudiante a cancelar el resto.
          </Paragraph>
          <Flex vertical gap="middle">
            <CompromisoPlazoSelector
              opciones={opcionesCompromiso}
              value={compromisoDias}
              onChange={onChangeCompromisoDias}
            />
            <div className="pago-compromiso-venc">
              <CalendarOutlined />
              <span>
                El estudiante deberá cancelar el saldo hasta el <strong>{fechaCompromiso}</strong>.
              </span>
            </div>
          </Flex>
        </div>
      ) : null}

      {/* No usar Form aquí: ya estamos dentro del Form del padre; solo Form.Item para no anidar <form> */}
      <Form.Item
        name="descripcion"
        label="Observación"
        tooltip="Observación del pago: plazo, datos adicionales (opcional)"
        required={false}
        rules={[
          {
            validator: (_, value) => {
              if (!value || value.trim().length === 0) {
                return Promise.resolve();
              }
              if (value.trim().length > 500) {
                return Promise.reject('La observación no puede exceder 500 caracteres');
              }
              return Promise.resolve();
            },
          },
        ]}
      >
        <TextArea
          rows={3}
          placeholder="Ej.: plazo de entrega, datos adicionales… (opcional)"
          maxLength={500}
          showCount
        />
      </Form.Item>
    </Flex>
  );
};

export default PagoConfirmacionResumen;
