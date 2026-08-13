/**
 * PagoDatosPagoSection - Organism del paso "Datos del pago"
 *
 * Single Responsibility: Capturar la decisión de caja completa — con qué método
 * paga el estudiante, los datos del comprobante y el monto de esta cuota.
 *
 * Atomic Design: Organism (step content, patrón UsuarioWizard*StepContent)
 * - Secciones planas del workspace (`FormWorkspaceSection`) con los campos
 *   declarados por configuración (`config/pagoDatosPagoFields`), NO inputs a
 *   mano: mismos labels verticales, grid y validación que el resto de
 *   formularios del sistema.
 *   1. Método de pago (cards, único bloque custom — como el paso "Tipo de
 *      alta" de usuarios)
 *   2. Datos del comprobante — SOLO aparece con un método ya seleccionado
 *   3. Monto de esta cuota (al final, con el máximo en la descripción)
 * - Absorbe los efectos de formulario del antiguo SelectedPaymentSection
 *   (fecha de pago por defecto, limpieza de campos al elegir EFECTIVO).
 * - La observación NO va aquí: se captura en el paso de Confirmación.
 *
 * @param {number} saldoPendiente - Saldo pendiente (máximo de la cuota)
 * @param {Object} metodosPago - Grupo de métodos de pago del contexto
 * @param {Object} cuentasPago - Grupo de cuentas de pago del contexto
 * @param {Object} bancosAutorizados - Grupo de bancos autorizados del contexto
 * @param {Object} form - Instancia del formulario de la pantalla
 */

import { useEffect, useMemo } from 'react';
import { Flex } from 'antd';
import dayjs from 'dayjs';
import { FormWorkspaceSection } from '@organisms';
import {
  buildCuentaPagoOptions,
  createPagoComprobanteFields,
  createPagoMontoCuotaFields,
} from '../../config/pagoDatosPagoFields';
import PaymentMethodSelectionSection from './PaymentMethodSelectionSection';

const formatMonto = (monto) =>
  `Bs. ${Number(monto || 0).toLocaleString('es-BO', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const PagoDatosPagoSection = ({
  saldoPendiente,
  metodosPago,
  cuentasPago,
  bancosAutorizados,
  form,
}) => {
  const selectedMetodoPago = metodosPago?.selectedMetodoPago ?? null;

  // Características del método elegido (mismas reglas que el backend)
  const codigoMetodo = selectedMetodoPago?.codigo?.toUpperCase() || '';
  const esEfectivo = codigoMetodo === 'EFECTIVO';
  const esTransferencia = codigoMetodo === 'TRANSFERENCIA';
  const esQR = codigoMetodo === 'QR';
  const esDeposito = codigoMetodo === 'DEPOSITO';

  const requiereCuenta = !!codigoMetodo && ['TRANSFERENCIA', 'DEPOSITO', 'TIGO_MONEY'].includes(codigoMetodo);
  const mostrarDocumentoRespaldo = !!selectedMetodoPago && !esEfectivo;
  const mostrarNumeroTransaccion = esTransferencia || esDeposito;
  const requiereCodigoComprobante = esQR || esTransferencia || esDeposito;

  // EFECTIVO no usa cuenta/comprobante/transacción, pero sí fecha de pago;
  // la fecha se propone con el día actual si aún no fue elegida.
  useEffect(() => {
    if (!form || !selectedMetodoPago) return;
    if (esEfectivo) {
      form.setFieldsValue({
        numeroTransaccion: undefined,
        codigoComprobante: undefined,
        documentoRespaldo: undefined,
      });
    }
    if (!form.getFieldValue('fechaPago')) {
      form.setFieldsValue({ fechaPago: dayjs() });
    }
  }, [codigoMetodo, form, esEfectivo, selectedMetodoPago]);

  // Campos declarativos según el método vigente
  const cuentaOptions = useMemo(
    () => buildCuentaPagoOptions(cuentasPago?.cuentasPago, bancosAutorizados?.bancosAutorizados),
    [cuentasPago?.cuentasPago, bancosAutorizados?.bancosAutorizados]
  );

  const comprobanteFields = useMemo(
    () =>
      createPagoComprobanteFields({
        esQR,
        requiereCuenta,
        mostrarNumeroTransaccion,
        requiereCodigoComprobante,
        mostrarDocumentoRespaldo,
        cuentaOptions,
        cuentasLoading: !!cuentasPago?.loading,
      }),
    [
      esQR,
      requiereCuenta,
      mostrarNumeroTransaccion,
      requiereCodigoComprobante,
      mostrarDocumentoRespaldo,
      cuentaOptions,
      cuentasPago?.loading,
    ]
  );

  const montoFields = useMemo(
    () => createPagoMontoCuotaFields({ saldoMax: saldoPendiente }),
    [saldoPendiente]
  );

  return (
    <Flex vertical gap="large">
      {/* 1. Método de pago */}
      <FormWorkspaceSection
        title="Método de pago"
        description="Seleccione el método con el que el estudiante realiza el pago."
        form={form}
      >
        <PaymentMethodSelectionSection
          bare
          metodosPagoData={metodosPago}
          onSelectMetodoPago={metodosPago?.onSelectMetodoPago}
          form={form}
        />
      </FormWorkspaceSection>

      {/* 2. Datos del comprobante: solo con un método ya seleccionado */}
      {selectedMetodoPago ? (
        <FormWorkspaceSection
          title="Datos del comprobante"
          description="Complete la información del pago según el método elegido."
          fields={comprobanteFields}
          form={form}
        />
      ) : null}

      {/* 3. Monto de esta cuota */}
      <FormWorkspaceSection
        title="Monto de esta cuota"
        description={`Puede pagar en una o varias cuotas. Máximo por cuota (saldo pendiente): ${formatMonto(saldoPendiente)}.`}
        fields={montoFields}
        form={form}
      />
    </Flex>
  );
};

export default PagoDatosPagoSection;
