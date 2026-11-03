import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { Form } from 'antd';
import { renderWithProviders, permiso } from '@/test/renderWithProviders';
import PagosRegistrar from '../pages/PagosRegistrar';

const estadoHook = vi.hoisted(() => vi.fn());
vi.mock('@container', () => ({ useContainer: () => ({ resolve: vi.fn() }) }));
vi.mock('@application-pagos/hooks', async (orig) => ({ ...(await orig()), usePagosRegistrarPageState: estadoHook }));

const hook = (form, extra = {}) => ({
  student: { codigoEstudiante: 'E-1', nombreCompleto: 'Pérez Ana', ciCompleto: '123' },
  pageTitle: 'Registrar pago de Pérez Ana',
  breadcrumbItems: [{ title: 'Matrícula' }],
  handleVolver: vi.fn(),
  handleAsignarBeca: vi.fn(),
  ocultarBotonAsignarBeca: false,
  sinEstudiante: false,
  redirigiendoADetalle: false,
  cargandoDatosBase: false,
  becaActiva: null,
  porcentajeBeca: 0,
  descuentoBeca: 0,
  esPrimeraCuota: true,
  estadoActualAporte: { gestion: { nombre: '2026' }, monto_base: 1000, saldo_pendiente: 1000, total_pagado: 0 },
  configuracionAporteActiva: { montoBase: 1000, gestionName: '2026' },
  configuracionAportes: { error: null },
  metodosPago: { metodosPago: [{ id: 1, codigo: 'EFECTIVO', nombre: 'Efectivo' }], selectedMetodoPago: { id: 1, codigo: 'EFECTIVO', nombre: 'Efectivo' }, onSelectMetodoPago: vi.fn() },
  cuentasPago: { cuentasPago: [] },
  bancosAutorizados: { bancosAutorizados: [] },
  montoCuota: 300,
  saldoPendiente: 1000,
  esPagoGratuito: false,
  mostrarSelectorCompromiso: false,
  saldoRestanteCompromiso: 700,
  compromisoDias: 7,
  setCompromisoDias: vi.fn(),
  fechaCompromisoProyectada: '2026-04-01',
  opcionesCompromiso: [],
  form,
  validarPasoDatosPago: vi.fn().mockResolvedValue(),
  handleFinish: vi.fn(),
  isSubmitting: false,
  submitError: null,
  ...extra,
});

/** Monta la página con un form real y el estado del hook simulado. */
const Montar = ({ extra }) => {
  const [form] = Form.useForm();
  estadoHook.mockReturnValue(hook(form, extra));
  return <PagosRegistrar />;
};

const auth = { permisos: [permiso('matricula.beca.asignar', 'CREAR')] };

describe('PagosRegistrar', () => {
  beforeEach(() => estadoHook.mockReset());

  it('muestra el título, el estado del aporte y las acciones de la cabecera', async () => {
    const Wrapper = () => {
      const [form] = Form.useForm();
      const [estado] = useState(() => hook(form));
      estadoHook.mockReturnValue(estado);
      return <PagosRegistrar />;
    };
    renderWithProviders(<Wrapper />, { auth });
    const s = estadoHook();
    expect(screen.getByRole('heading', { name: 'Registrar pago de Pérez Ana' })).toBeInTheDocument();
    expect(screen.getByText('Verifique el estado del aporte')).toBeInTheDocument();
    expect(screen.getByText('Aporte académico - Gestión 2026')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /Asignar beca/ }));
    expect(s.handleAsignarBeca).toHaveBeenCalledTimes(1);
    await userEvent.click(screen.getByRole('button', { name: /Volver/ }));
    expect(s.handleVolver).toHaveBeenCalledTimes(1);
  });

  it('RBAC: sin permiso de asignar beca o con el botón oculto no se ofrece', () => {
    const { unmount } = renderWithProviders(<Montar />);
    expect(screen.queryByRole('button', { name: /Asignar beca/ })).not.toBeInTheDocument();
    unmount();
    renderWithProviders(<Montar extra={{ ocultarBotonAsignarBeca: true }} />, { auth });
    expect(screen.queryByRole('button', { name: /Asignar beca/ })).not.toBeInTheDocument();
  });

  it('con pago gratuito el wizard salta el paso de datos del pago', () => {
    renderWithProviders(<Montar extra={{ esPagoGratuito: true }} />, { auth });
    expect(screen.queryByText('Datos del pago')).not.toBeInTheDocument();
    expect(screen.getByText('Confirmación')).toBeInTheDocument();
  });

  it('con pago normal los tres pasos están en la navegación', () => {
    renderWithProviders(<Montar />, { auth });
    ['Estado del aporte', 'Datos del pago', 'Confirmación'].forEach((t) => expect(screen.getAllByText(t).length).toBeGreaterThan(0));
  });

  it('avanza al paso de datos del pago validándolo y al de confirmación', async () => {
    const Wrapper = () => {
      const [form] = Form.useForm();
      const [estado] = useState(() => hook(form));
      estadoHook.mockReturnValue(estado);
      return <PagosRegistrar />;
    };
    renderWithProviders(<Wrapper />, { auth });
    const s = estadoHook();
    await userEvent.click(screen.getByRole('button', { name: /Siguiente/ }));
    expect(await screen.findByText('Registre los datos del pago')).toBeInTheDocument();
    expect(screen.getByText('Método de pago')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /Siguiente/ }));
    await waitFor(() => expect(s.validarPasoDatosPago).toHaveBeenCalled());
    expect(await screen.findByText('Confirme el registro del pago')).toBeInTheDocument();
    expect(screen.getByText('Resumen del pago')).toBeInTheDocument();
  });

  it('si la validación del paso falla no avanza', async () => {
    const err = Object.assign(new Error('x'), { errorFields: [{ name: ['montoCuota'] }] });
    renderWithProviders(<Montar extra={{ validarPasoDatosPago: vi.fn().mockRejectedValue(err) }} />, { auth });
    await userEvent.click(screen.getByRole('button', { name: /Siguiente/ }));
    await screen.findByText('Registre los datos del pago');
    await userEvent.click(screen.getByRole('button', { name: /Siguiente/ }));
    await waitFor(() => expect(screen.getByText('Registre los datos del pago')).toBeInTheDocument());
    expect(screen.queryByText('Confirme el registro del pago')).not.toBeInTheDocument();
  });

  it('en confirmación el botón registra el pago con los valores del formulario', async () => {
    const Wrapper = () => {
      const [form] = Form.useForm();
      const [estado] = useState(() => hook(form, { esPagoGratuito: true }));
      estadoHook.mockReturnValue(estado);
      return <PagosRegistrar />;
    };
    renderWithProviders(<Wrapper />, { auth });
    const s = estadoHook();
    await userEvent.click(screen.getByRole('button', { name: /Siguiente/ }));
    expect(await screen.findByText('Revise el resumen y registre el pago del aporte cubierto por la beca.')).toBeInTheDocument();
    await userEvent.type(screen.getByPlaceholderText(/Ej\.: plazo de entrega/), 'Sin novedades');
    await userEvent.click(screen.getByRole('button', { name: /Registrar pago/ }));
    await waitFor(() => expect(s.handleFinish).toHaveBeenCalledWith(expect.objectContaining({ descripcion: 'Sin novedades' })));
  });

  it('muestra el error de envío', async () => {
    renderWithProviders(<Montar extra={{ esPagoGratuito: true, submitError: 'Recibo duplicado' }} />, { auth });
    await userEvent.click(screen.getByRole('button', { name: /Siguiente/ }));
    expect(await screen.findByText('Recibo duplicado')).toBeInTheDocument();
  });

  it('carga de datos base, sin estudiante y aporte cubierto muestran su aviso', () => {
    const a = renderWithProviders(<Montar extra={{ cargandoDatosBase: true }} />);
    expect(screen.getByText('Cargando los datos del estudiante y del aporte…')).toBeInTheDocument();
    a.unmount();
    const b = renderWithProviders(<Montar extra={{ sinEstudiante: true }} />);
    expect(screen.getByText('Redirigiendo a la lista anterior…')).toBeInTheDocument();
    b.unmount();
    renderWithProviders(<Montar extra={{ redirigiendoADetalle: true }} />);
    expect(screen.getByText('El aporte ya está cubierto. Redirigiendo al detalle del pago…')).toBeInTheDocument();
  });
});
