import { useEffect } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Form } from 'antd';
import dayjs from 'dayjs';
import CompromisoPlazoSelector from '../components/molecules/CompromisoPlazoSelector';
import ConfigurationCardContent from '../components/molecules/ConfigurationCardContent';
import PaymentInfoItem from '../components/molecules/PaymentInfoItem';
import PaymentMethodCardContent from '../components/molecules/PaymentMethodCardContent';
import PaymentFormFields from '../components/molecules/PaymentFormFields';
import ConfigurationDetailSection from '../components/organisms/ConfigurationDetailSection';
import ConfigurationSelectionSection from '../components/organisms/ConfigurationSelectionSection';
import ContributionDetailSummary from '../components/organisms/ContributionDetailSummary';
import PagoEstadoAporteSection from '../components/organisms/PagoEstadoAporteSection';
import PagoConfirmacionResumen from '../components/organisms/PagoConfirmacionResumen';
import PagoDatosPagoSection from '../components/organisms/PagoDatosPagoSection';
import PaymentMethodSelectionSection from '../components/organisms/PaymentMethodSelectionSection';
import { buildCuentaPagoOptions, createPagoComprobanteFields, createPagoMontoCuotaFields } from '../config/pagoDatosPagoFields';

/** Monta `ui(form)` dentro de un <Form> real y devuelve la instancia del formulario. */
const conForm = (ui, initialValues) => {
  let formRef;
  const Wrapper = () => {
    const [form] = Form.useForm();
    useEffect(() => {
      formRef = form;
    }, [form]);
    return <Form form={form} initialValues={initialValues}>{ui(form)}</Form>;
  };
  const view = render(<Wrapper />);
  return { ...view, getForm: () => formRef };
};

describe('moléculas de aportes', () => {
  it('CompromisoPlazoSelector: marca el plazo activo y notifica el elegido', async () => {
    const onChange = vi.fn();
    render(<CompromisoPlazoSelector opciones={[{ value: 7, label: '7 días', sub: 'Una semana' }, { value: 15, label: '15 días', sub: 'Dos semanas' }]} value={7} onChange={onChange} />);
    expect(screen.getByRole('button', { name: /7 días/ })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: /15 días/ })).toHaveAttribute('aria-pressed', 'false');
    await userEvent.click(screen.getByRole('button', { name: /15 días/ }));
    expect(onChange).toHaveBeenCalledWith(15);
  });

  it('CompromisoPlazoSelector: sin opciones ni callback no falla', async () => {
    const { container } = render(<CompromisoPlazoSelector />);
    expect(container.querySelectorAll('button')).toHaveLength(0);
    render(<CompromisoPlazoSelector opciones={[{ value: 1, label: '1 día', sub: '' }]} />);
    await userEvent.click(screen.getByRole('button', { name: /1 día/ }));
  });

  it('ConfigurationCardContent: monto con formato y nombre opcional', () => {
    const { rerender } = render(<ConfigurationCardContent configuracion={{ montoBase: 1500, nombre: 'Aporte 2026' }} />);
    expect(screen.getByText(/Bs\.\s*1[.,\s]?500/)).toBeInTheDocument();
    expect(screen.getByText('Aporte 2026')).toBeInTheDocument();
    rerender(<ConfigurationCardContent configuracion={{}} />);
    expect(screen.getByText('N/A')).toBeInTheDocument();
    rerender(<ConfigurationCardContent configuracion={{ montoBase: 0 }} />);
    expect(screen.getByText(/Bs\./)).toBeInTheDocument();
  });

  it('PaymentInfoItem y PaymentMethodCardContent: valores y respaldo', () => {
    const { rerender } = render(<PaymentInfoItem icon={<i />} label="Recibo" value="R-1" />);
    expect(screen.getByText('R-1')).toBeInTheDocument();
    rerender(<PaymentInfoItem icon={<i />} label="Recibo" />);
    expect(screen.getByText('N/A')).toBeInTheDocument();
    rerender(<PaymentMethodCardContent metodoPago={{ codigo: 'QR', nombre: 'Pago QR' }} />);
    expect(screen.getByText('QR')).toBeInTheDocument();
    expect(screen.getByText('Pago QR')).toBeInTheDocument();
    rerender(<PaymentMethodCardContent metodoPago={{ nombre: 'Otro' }} />);
    expect(screen.getByText('N/A')).toBeInTheDocument();
  });
});

describe('PaymentFormFields', () => {
  const cuentas = { loading: false, cuentasPago: [{ id: 1, accountHolderName: 'INCOS', accountNumber: '123', bancoId: 9 }, { id: 2, nombreTitular: 'Otro', banco: { nombre: 'BNB', codigo: 'BN' } }] };
  const bancos = { bancosAutorizados: [{ id: 9, nombre: 'Banco Unión', codigo: 'BUN' }] };

  it('sin requisitos solo muestra la observación', () => {
    conForm((form) => <PaymentFormFields form={form} />);
    expect(screen.getByText('Observación')).toBeInTheDocument();
    expect(screen.queryByText('Fecha de pago')).not.toBeInTheDocument();
  });

  it('showObservacion=false la oculta', () => {
    conForm((form) => <PaymentFormFields form={form} showObservacion={false} />);
    expect(screen.queryByText('Observación')).not.toBeInTheDocument();
  });

  it('muestra todos los campos de un depósito con sus etiquetas', () => {
    conForm((form) => (
      <PaymentFormFields form={form} cuentasPagoData={cuentas} bancosAutorizadosData={bancos} requiereFechaPago requiereCuenta requiereNumeroTransaccion requiereCodigoComprobante requiereDocumentoRespaldo />
    ));
    ['Fecha de pago', 'Cuenta de pago', 'Código del comprobante', 'Número de transacción', 'Documento de respaldo', 'Observación'].forEach((l) => expect(screen.getByText(l)).toBeInTheDocument());
    expect(screen.getByPlaceholderText('Código del comprobante')).toBeInTheDocument();
    expect(screen.getByText('Formatos: JPG, PNG, PDF, DOC, DOCX')).toBeInTheDocument();
  });

  it('QR cambia el texto del código y la cuenta lista titular, número y banco', async () => {
    conForm((form) => <PaymentFormFields form={form} cuentasPagoData={cuentas} bancosAutorizadosData={bancos} requiereCuenta requiereCodigoComprobante esQR />);
    expect(screen.getByPlaceholderText('Código del comprobante QR')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('combobox'));
    expect(await screen.findByText('INCOS - 123 - Banco Unión (BUN)')).toBeInTheDocument();
    expect(screen.getByText('Otro - BNB (BN)')).toBeInTheDocument();
  });

  it('la observación acepta texto y valida el máximo', async () => {
    const { getForm } = conForm((form) => <PaymentFormFields form={form} />);
    await userEvent.type(screen.getByPlaceholderText(/Ej: Plazo de entrega/), 'Pagó en mostrador');
    expect(getForm().getFieldValue('descripcion')).toBe('Pagó en mostrador');
    getForm().setFieldsValue({ descripcion: 'x'.repeat(501) });
    await expect(getForm().validateFields()).rejects.toBeTruthy();
    getForm().setFieldsValue({ descripcion: '   ' });
    await expect(getForm().validateFields()).resolves.toBeTruthy();
  });

  it('la fecha es obligatoria cuando se requiere', async () => {
    const { getForm } = conForm((form) => <PaymentFormFields form={form} requiereFechaPago showObservacion={false} />);
    await expect(getForm().validateFields()).rejects.toMatchObject({ errorFields: [expect.objectContaining({ name: ['fechaPago'] })] });
  });
});

describe('config de datos del pago', () => {
  it('buildCuentaPagoOptions arma el rótulo con titular, número y banco', () => {
    const opts = buildCuentaPagoOptions(
      [{ id: 1, accountHolderName: 'INCOS', accountNumber: '123', bancoId: 9 }, { id: 2, nombre: 'Caja', bancoNombre: 'BNB' }, { id: 3 }],
      [{ id: 9, nombre: 'Banco Unión', codigo: 'BUN' }],
    );
    expect(opts).toEqual([
      { label: 'INCOS - 123 - Banco Unión (BUN)', value: 1 },
      { label: 'Caja - BNB', value: 2 },
      { label: '', value: 3 },
    ]);
    expect(buildCuentaPagoOptions(null, null)).toEqual([]);
  });

  it('el comprobante cambia según el método: efectivo, QR, transferencia', () => {
    const keys = (cfg) => createPagoComprobanteFields(cfg).map((f) => f.key);
    expect(keys({})).toEqual(['fechaPago']);
    expect(keys({ esQR: true, requiereCodigoComprobante: true, mostrarDocumentoRespaldo: true })).toEqual(['fechaPago', 'cuentaPagoId', 'codigoComprobante', 'documentoRespaldo']);
    const transf = createPagoComprobanteFields({ requiereCuenta: true, requiereCodigoComprobante: true, mostrarNumeroTransaccion: true, mostrarDocumentoRespaldo: true });
    expect(transf.map((f) => f.key)).toEqual(['fechaPago', 'cuentaPagoId', 'codigoComprobante', 'numeroTransaccion', 'documentoRespaldo']);
    expect(transf[1].required).toBe(true);
    expect(createPagoComprobanteFields({ esQR: true })[1].required).toBe(false);
    const fecha = transf[0];
    expect(fecha.disabledDate(dayjs().add(2, 'day'))).toBe(true);
    expect(fecha.disabledDate(dayjs().subtract(1, 'day'))).toBe(false);
  });

  it('el monto de la cuota se acota al saldo pendiente entero', () => {
    const [monto] = createPagoMontoCuotaFields({ saldoMax: 100.9 });
    expect(monto).toMatchObject({ name: 'montoCuota', max: 100, min: 0, precision: 0, placeholder: '100', required: true });
    expect(createPagoMontoCuotaFields()[0].max).toBe(0);
  });
});

describe('ConfigurationDetailSection', () => {
  it('carga, error y sin configuración', () => {
    const { container, rerender } = render(<ConfigurationDetailSection loading />);
    expect(screen.getByText('Cargando configuración de aporte...')).toBeInTheDocument();
    rerender(<ConfigurationDetailSection error="Falla de red" />);
    expect(screen.getByText('Error al cargar configuración de aporte')).toBeInTheDocument();
    expect(screen.getByText('Falla de red')).toBeInTheDocument();
    rerender(<ConfigurationDetailSection />);
    expect(container).toBeEmptyDOMElement();
  });

  it('sin beca: monto base igual al saldo y texto informativo por defecto', () => {
    render(<ConfigurationDetailSection configuracionAporte={{ montoBase: 1000, gestion: { name: '2026' } }} />);
    expect(screen.getByText('Monto base')).toBeInTheDocument();
    expect(screen.queryByText('Descuento por beca')).not.toBeInTheDocument();
    expect(screen.getByText(/no cuenta con descuentos por beca/)).toBeInTheDocument();
    expect(screen.getByText('2026')).toBeInTheDocument();
  });

  it('con beca activa descuenta el porcentaje', () => {
    render(<ConfigurationDetailSection configuracionAporte={{ montoBase: 1000, gestionName: '2026' }} becaActiva={{ estado: 'ACTIVA', scholarshipPercentage: 25, scholarshipName: 'Excelencia' }} />);
    expect(screen.getByText('Descuento por beca')).toBeInTheDocument();
    expect(screen.getByText(/Excelencia \(25% de descuento\)/)).toBeInTheDocument();
    expect(screen.getByText(/\(Bs\.\s*250/)).toBeInTheDocument();
    expect(screen.getByText(/beca activa del 25%/)).toBeInTheDocument();
  });

  it('una beca no activa no descuenta y la descripción propia prevalece', () => {
    render(<ConfigurationDetailSection configuracionAporte={{ montoBase: 500, descripcion: 'Descripción propia' }} becaActiva={{ estado: 'FINALIZADA', scholarshipPercentage: 50 }} />);
    expect(screen.queryByText('Descuento por beca')).not.toBeInTheDocument();
    expect(screen.getByText('Descripción propia')).toBeInTheDocument();
  });
});

describe('ConfigurationSelectionSection', () => {
  const data = (extra = {}) => ({ configuracionAportes: [{ id: 1, montoBase: 100 }, { id: 2, montoBase: 200 }], loading: false, error: null, selectedConfiguracion: { id: 2 }, ...extra });

  it('muestra una tarjeta por configuración y notifica la elegida', async () => {
    const onSelect = vi.fn();
    conForm(() => (
      <ConfigurationSelectionSection configuracionAportesData={data()} onSelectConfiguracion={onSelect} renderConfiguracionCard={(c) => <span>Config {c.id}</span>} />
    ));
    expect(screen.getByText('Seleccionar configuración de aporte')).toBeInTheDocument();
    await userEvent.click(screen.getByText('Config 1'));
    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ id: 1 }), 0);
  });

  it('error y vacío', () => {
    conForm(() => (
      <ConfigurationSelectionSection configuracionAportesData={data({ configuracionAportes: [], error: 'Falla' })} renderConfiguracionCard={() => null} />
    ));
    expect(screen.getByText('Error al cargar configuraciones de aportes')).toBeInTheDocument();
    expect(screen.getByText('No hay configuraciones de aportes disponibles')).toBeInTheDocument();
  });
});

describe('ContributionDetailSummary', () => {
  it('carga, error y sin datos', () => {
    const { container, rerender } = render(<ContributionDetailSummary loading />);
    expect(screen.getByText('Cargando la configuración del aporte…')).toBeInTheDocument();
    rerender(<ContributionDetailSummary error="Sin red" />);
    expect(screen.getByText('Sin red')).toBeInTheDocument();
    rerender(<ContributionDetailSummary />);
    expect(container).toBeEmptyDOMElement();
  });

  it('solo configuración: saldo total de la deuda y descuento de beca activa', () => {
    render(<ContributionDetailSummary configuracionAporte={{ montoBase: 1000, gestionName: '2026' }} becaActiva={{ estado: 'ACTIVA', scholarshipPercentage: 50 }} />);
    expect(screen.getByText('Aporte académico - Gestión 2026')).toBeInTheDocument();
    expect(screen.getByText('Descuento')).toBeInTheDocument();
    expect(screen.getByText('Subtotal')).toBeInTheDocument();
    expect(screen.getByText('Saldo total de la deuda')).toBeInTheDocument();
    expect(screen.getAllByText(/Bs\.\s*500/).length).toBeGreaterThan(0);
  });

  it('beca pendiente sin porcentaje no aplica descuento', () => {
    render(<ContributionDetailSummary configuracionAporte={{ montoBase: 1000 }} becaActiva={{ estado: 'PENDIENTE' }} />);
    expect(screen.queryByText('Subtotal')).not.toBeInTheDocument();
  });

  it('con estado actual: pagos registrados, total pagado y saldo pendiente', () => {
    render(
      <ContributionDetailSummary
        estadoActualAporte={{
          gestion: { nombre: '2026' }, monto_base: 1000, descuento_beca: 200, tiene_descuento_aplicado: true, total_pagado: 300, saldo_pendiente: 500,
          cuotas: [{ id: 1, numero_recibo: 'R-1', fecha_pago: '2026-03-05', monto: 300 }, { monto: 0 }],
        }}
      />,
    );
    expect(screen.getByText('Descuento (aplicado)')).toBeInTheDocument();
    expect(screen.getByText('Total ya pagado')).toBeInTheDocument();
    expect(screen.getByText('Cuotas registradas (2)')).toBeInTheDocument();
    expect(screen.getByText('R-1')).toBeInTheDocument();
    expect(screen.getByText('Saldo pendiente a pagar')).toBeInTheDocument();
  });
});

describe('PagoEstadoAporteSection', () => {
  it('envuelve el resumen del aporte en el panel de estado', () => {
    render(<PagoEstadoAporteSection configuracionAporte={{ montoBase: 800, gestionName: '2026' }} />);
    expect(screen.getByText('Estado del aporte')).toBeInTheDocument();
    expect(screen.getByText('Aporte académico - Gestión 2026')).toBeInTheDocument();
  });
});

describe('PagoConfirmacionResumen', () => {
  const base = {
    student: { codigoEstudiante: 'E-1', nombreCompleto: 'Pérez Ana', ciCompleto: '123' },
    estadoActualAporte: { gestion: { nombre: '2026' } },
    montoCuota: 300,
    selectedMetodoPago: { nombre: 'Transferencia' },
    saldoRestante: 700,
  };

  it('resume estudiante, método, concepto, monto y saldo tras la cuota', () => {
    conForm((form) => <PagoConfirmacionResumen {...base} form={form} />, { fechaPago: dayjs('2026-03-05'), codigoComprobante: 'COD-9', numeroTransaccion: 'TX-1' });
    expect(screen.getByText('Transferencia')).toBeInTheDocument();
    expect(screen.getByText('Aporte académico - Gestión 2026')).toBeInTheDocument();
    expect(screen.getByText('COD-9')).toBeInTheDocument();
    expect(screen.getByText('TX-1')).toBeInTheDocument();
    expect(screen.getByText('Saldo tras esta cuota')).toBeInTheDocument();
    expect(screen.getByText('Fecha de pago')).toBeInTheDocument();
  });

  it('primera cuota con descuento de beca y selector de compromiso', async () => {
    const onChangeCompromisoDias = vi.fn();
    conForm((form) => (
      <PagoConfirmacionResumen
        {...base}
        form={form}
        esPrimeraCuota
        becaActiva={{ scholarshipName: 'Excelencia' }}
        porcentajeBeca={20}
        descuentoBeca={200}
        mostrarSelectorCompromiso
        opcionesCompromiso={[{ value: 7, label: '7 días', sub: 'x' }, { value: 15, label: '15 días', sub: 'y' }]}
        compromisoDias={7}
        onChangeCompromisoDias={onChangeCompromisoDias}
        fechaCompromiso="12 de abril de 2026"
      />
    ));
    expect(screen.getByText('Primera cuota del aporte')).toBeInTheDocument();
    expect(screen.getByText('Beca Excelencia (20%)')).toBeInTheDocument();
    expect(screen.getByText('Compromiso de pago')).toBeInTheDocument();
    expect(screen.getByText('12 de abril de 2026')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /15 días/ }));
    expect(onChangeCompromisoDias).toHaveBeenCalledWith(15);
  });

  it('pago gratuito: monto cero, sin saldo ni método', () => {
    conForm((form) => <PagoConfirmacionResumen {...base} form={form} esPagoGratuito esPrimeraCuota descuentoBeca={0} />);
    expect(screen.getByText('Pago gratuito')).toBeInTheDocument();
    expect(screen.getByText('Fecha de registro')).toBeInTheDocument();
    expect(screen.queryByText('Saldo tras esta cuota')).not.toBeInTheDocument();
    expect(screen.queryByText('Primera cuota del aporte')).not.toBeInTheDocument();
    expect(screen.queryByText('Transferencia')).not.toBeInTheDocument();
  });

  it('cuenta y documento de respaldo elegidos aparecen en el resumen', () => {
    conForm(
      (form) => <PagoConfirmacionResumen {...base} form={form} cuentasPago={{ cuentasPago: [{ id: 5, nombreTitular: 'INCOS', numeroCuenta: '999' }] }} />,
      { cuentaPagoId: 5, documentoRespaldo: [{ name: 'recibo.pdf' }], fechaPago: dayjs('2026-03-05') },
    );
    expect(screen.getByText('INCOS - 999')).toBeInTheDocument();
    expect(screen.getByText('recibo.pdf')).toBeInTheDocument();
  });

  it('la observación valida el máximo de 500 caracteres', async () => {
    const { getForm } = conForm((form) => <PagoConfirmacionResumen {...base} form={form} />);
    getForm().setFieldsValue({ descripcion: 'x'.repeat(501) });
    await expect(getForm().validateFields()).rejects.toBeTruthy();
    getForm().setFieldsValue({ descripcion: 'ok' });
    await expect(getForm().validateFields()).resolves.toMatchObject({ descripcion: 'ok' });
  });
});

describe('PaymentMethodSelectionSection', () => {
  const metodos = [{ id: 2, codigo: 'QR', nombre: 'Pago QR' }, { id: 1, codigo: 'EFECTIVO', nombre: 'Efectivo' }, { id: 3, nombre: 'Otro' }];

  it('carga, error y vacío', () => {
    const { rerender } = conForm(() => <PaymentMethodSelectionSection metodosPagoData={{ loading: true }} bare />);
    expect(screen.getByText('Cargando métodos de pago…')).toBeInTheDocument();
    rerender(<Form><PaymentMethodSelectionSection metodosPagoData={{ metodosPago: [], error: 'Falla' }} bare /></Form>);
    expect(screen.getByText('Error al cargar métodos de pago')).toBeInTheDocument();
    expect(screen.getByText('No hay métodos de pago disponibles')).toBeInTheDocument();
  });

  it('lista con EFECTIVO primero, marca el elegido y notifica la selección', async () => {
    const onSelect = vi.fn();
    const { getForm } = conForm((form) => (
      <PaymentMethodSelectionSection metodosPagoData={{ metodosPago: metodos, selectedMetodoPago: metodos[1] }} onSelectMetodoPago={onSelect} form={form} bare />
    ));
    const nombres = screen.getAllByText(/Efectivo|Pago QR|Otro/).map((n) => n.textContent);
    expect(nombres).toEqual(['Efectivo', 'Pago QR', 'Otro']);
    await waitFor(() => expect(getForm().getFieldValue('metodoPagoId')).toBe(1));
    await userEvent.click(screen.getByText('Pago QR'));
    expect(onSelect).toHaveBeenCalledWith(metodos[0]);
    expect(getForm().getFieldValue('metodoPagoId')).toBe(2);
  });

  it('elegir un método sin cuenta limpia cuenta y transacción; con tarjeta propia si no es bare', async () => {
    const { getForm } = conForm((form) => (
      <PaymentMethodSelectionSection metodosPagoData={{ metodosPago: metodos, selectedMetodoPago: metodos[0] }} form={form} />
    ), { cuentaPagoId: 4, numeroTransaccion: 'T' });
    expect(screen.getByText('Seleccionar método de pago')).toBeInTheDocument();
    await userEvent.click(screen.getByText('Efectivo'));
    expect(getForm().getFieldValue('cuentaPagoId')).toBeUndefined();
    expect(getForm().getFieldValue('numeroTransaccion')).toBeUndefined();
  });
});

describe('PagoDatosPagoSection', () => {
  const metodosBase = (codigo) => ({
    metodosPago: [{ id: 1, codigo, nombre: codigo }],
    selectedMetodoPago: codigo ? { id: 1, codigo, nombre: codigo } : null,
    onSelectMetodoPago: vi.fn(),
  });
  const montar = (codigo, initial) =>
    conForm((form) => (
      <PagoDatosPagoSection
        saldoPendiente={400}
        metodosPago={metodosBase(codigo)}
        cuentasPago={{ cuentasPago: [{ id: 3, nombreTitular: 'INCOS', numeroCuenta: '1' }], loading: false }}
        bancosAutorizados={{ bancosAutorizados: [] }}
        form={form}
      />
    ), initial);

  it('sin método elegido solo se ve la selección del método', () => {
    montar(null);
    expect(screen.getByText('Método de pago')).toBeInTheDocument();
    expect(screen.queryByText('Datos del comprobante')).not.toBeInTheDocument();
    expect(screen.queryByText('Fecha de pago')).not.toBeInTheDocument();
    expect(screen.getAllByText('Monto de esta cuota').length).toBeGreaterThan(0);
  });

  it('efectivo: fecha propuesta hoy, sin cuenta ni comprobante y limpia sus campos', async () => {
    const { getForm } = montar('EFECTIVO', { codigoComprobante: 'viejo', numeroTransaccion: 'viejo' });
    expect(await screen.findByText('Fecha de pago')).toBeInTheDocument();
    expect(screen.queryByText('Cuenta de pago')).not.toBeInTheDocument();
    expect(screen.queryByText('Código del comprobante')).not.toBeInTheDocument();
    expect(screen.getAllByText('Monto de esta cuota').length).toBeGreaterThan(0);
    await waitFor(() => expect(dayjs(getForm().getFieldValue('fechaPago')).isSame(dayjs(), 'day')).toBe(true));
    expect(getForm().getFieldValue('codigoComprobante')).toBeUndefined();
    expect(getForm().getFieldValue('numeroTransaccion')).toBeUndefined();
  });

  it('transferencia: cuenta, código, transacción y documento de respaldo', async () => {
    montar('TRANSFERENCIA');
    ['Fecha de pago', 'Cuenta de pago', 'Código del comprobante', 'Número de transacción', 'Documento de respaldo'].forEach((l) => expect(screen.getByText(l)).toBeInTheDocument());
  });

  it('QR: código y documento, cuenta opcional', () => {
    montar('QR');
    expect(screen.getByText('Código del comprobante')).toBeInTheDocument();
    expect(screen.getByText('Cuenta de pago')).toBeInTheDocument();
    expect(screen.queryByText('Número de transacción')).not.toBeInTheDocument();
  });

  it('el monto no puede superar el saldo pendiente', async () => {
    const { getForm } = montar('EFECTIVO');
    await screen.findByText('Fecha de pago');
    const input = screen.getByPlaceholderText('400');
    await userEvent.type(input, '999');
    await userEvent.tab();
    expect(Number(getForm().getFieldValue('montoCuota'))).toBeLessThanOrEqual(400);
  });
});
