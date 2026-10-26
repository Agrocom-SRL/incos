import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders, permiso } from '@/test/renderWithProviders';
import PagoMontoCell from '../components/atoms/PagoMontoCell';
import PagoPagadoCell from '../components/atoms/PagoPagadoCell';
import PagoSaldoCell from '../components/atoms/PagoSaldoCell';
import PagoDescuentoCell from '../components/atoms/PagoDescuentoCell';
import PagoEstudianteCell from '../components/atoms/PagoEstudianteCell';
import IngresoPersonaCell from '../components/atoms/IngresoPersonaCell';
import EstadoAporteResumen from '../components/organisms/EstadoAporteResumen';
import PagoFichaHeader from '../components/organisms/PagoFichaHeader';
import PagoCuotasSection from '../components/organisms/PagoCuotasSection';
import EstudianteSelector from '../components/organisms/EstudianteSelector';
import { createCuotasTableColumns, formatCuotaMonto } from '../config/cuotasTableColumns';
import { createIngresosTableColumns } from '../config/ingresosTableColumns';
import {
  buildMontoRules,
  buildReglasMetodo,
  findMetodoCodigo,
  normFileFromUpload,
} from '../config/registrarFormConfig';
import { FINANZAS_PERMISOS } from '@application-finanzas/utils/finanzasPermisos';

vi.mock('@container', () => ({ useContainer: () => ({ resolve: vi.fn() }) }));

describe('registrarFormConfig', () => {
  it('reglas por método: efectivo no pide cuenta ni comprobante; transferencia pide ambos', () => {
    expect(buildReglasMetodo('EFECTIVO')).toMatchObject({ esEfectivo: true, cuentaVisible: false, comprobanteVisible: false });
    expect(buildReglasMetodo('TRANSFERENCIA')).toMatchObject({ cuentaRequerida: true, comprobanteRequerido: true });
    expect(buildReglasMetodo('QR')).toMatchObject({ cuentaVisible: true, cuentaRequerida: false, comprobanteRequerido: true });
    expect(buildReglasMetodo('')).toMatchObject({ cuentaVisible: false });
  });

  it('findMetodoCodigo y normFileFromUpload tolerantes', () => {
    expect(findMetodoCodigo([{ id: 1, codigo: 'QR' }], 1)).toBe('QR');
    expect(findMetodoCodigo([], 9)).toBe('');
    expect(normFileFromUpload([1])).toEqual([1]);
    expect(normFileFromUpload({ fileList: [2] })).toEqual([2]);
    expect(normFileFromUpload(undefined)).toEqual([]);
  });

  it('el monto no puede ser negativo ni superar el saldo', async () => {
    const [, regla] = buildMontoRules(100);
    await expect(regla.validator(null, -1)).rejects.toThrow(/mayor o igual a 0/);
    await expect(regla.validator(null, 150)).rejects.toThrow(/no puede superar el saldo/);
    await expect(regla.validator(null, 100)).resolves.toBeUndefined();
    // Sin saldo pendiente no hay tope
    await expect(buildMontoRules(0)[1].validator(null, 500)).resolves.toBeUndefined();
  });
});

describe('celdas de pagos', () => {
  it('PagoMontoCell muestra valor y sub opcional', () => {
    const { rerender } = render(<PagoMontoCell valor="Bs 10" />);
    expect(screen.getByText('Bs 10')).toBeInTheDocument();
    rerender(<PagoMontoCell valor="Bs 10" sub="descuento" />);
    expect(screen.getByText('descuento')).toBeInTheDocument();
  });

  it('PagoPagadoCell singulariza cuotas y omite la gestión si falta', () => {
    const { rerender } = render(<PagoPagadoCell total="Bs 50" cantidadPagos={1} gestionLabel="2026" />);
    expect(screen.getByText('1 cuota')).toBeInTheDocument();
    expect(screen.getByText('2026')).toBeInTheDocument();
    rerender(<PagoPagadoCell total="Bs 50" cantidadPagos={3} />);
    expect(screen.getByText('3 cuotas')).toBeInTheDocument();
  });

  it('PagoSaldoCell muestra aporte, cubierto y saldo', () => {
    render(<PagoSaldoCell aporte="Bs 300" cubierto="Bs 100" saldoLabel="Bs 200" saldoPillClass="pago-pill pago-pill--saldo" />);
    expect(screen.getByText('Bs 300')).toBeInTheDocument();
    expect(screen.getByText('Bs 100')).toBeInTheDocument();
    expect(screen.getByText('Bs 200')).toHaveClass('pago-pill--saldo');
  });

  it('PagoDescuentoCell redondea el porcentaje y muestra la beca', () => {
    render(<PagoDescuentoCell porcentaje={49.6} montoLabel="Bs 50" nombre="Excelencia" nombreCompleto="Beca excelencia" pillClass="x" />);
    expect(screen.getByText('50%')).toBeInTheDocument();
    expect(screen.getByText('Excelencia')).toHaveAttribute('title', 'Beca excelencia');
  });

  it('PagoEstudianteCell: nombre en mayúsculas y estado derivado', () => {
    render(<PagoEstudianteCell nombre="Pérez Ana" codigo="E-1" estadoKey="SIN_PAGOS" />);
    expect(screen.getByText('PÉREZ ANA')).toBeInTheDocument();
    expect(screen.getByText('Sin pagos')).toBeInTheDocument();
  });

  it('IngresoPersonaCell: origen del ingreso', () => {
    render(<IngresoPersonaCell codigo="E-1" nombre={null} origen="CAPACITACION" />);
    expect(screen.getByText('—')).toBeInTheDocument();
  });
});

describe('EstadoAporteResumen', () => {
  const estado = {
    gestion: { anio: 2026 },
    montoObligatorio: 1000,
    totalPagado: 400,
    saldoPendiente: 600,
    tieneDescuentoAplicado: true,
    descuentoBeca: 200,
  };

  it('carga, error y vacío', () => {
    const { container, rerender } = render(<EstadoAporteResumen loading />);
    expect(container.querySelector('.ant-spin')).toBeInTheDocument();
    rerender(<EstadoAporteResumen error="Falla" />);
    expect(screen.getByText('No se pudo obtener el estado del aporte')).toBeInTheDocument();
    rerender(<EstadoAporteResumen />);
    expect(screen.queryByText('Monto obligatorio')).not.toBeInTheDocument();
  });

  it('muestra importes en bolivianos, gestión y descuento aplicado', () => {
    render(<EstadoAporteResumen estado={estado} />);
    expect(screen.getByText('Gestión 2026')).toBeInTheDocument();
    expect(screen.getByText(/Bs\s*1\.?000,00/)).toBeInTheDocument();
    expect(screen.getByText('Aplicado')).toBeInTheDocument();
    expect(screen.getByText(/Bs\s*600,00/)).toHaveClass('pago-pill--saldo');
  });

  it('sin descuento no muestra el renglón de beca', () => {
    render(<EstadoAporteResumen estado={{ ...estado, tieneDescuentoAplicado: false }} />);
    expect(screen.queryByText('Descuento por beca')).not.toBeInTheDocument();
  });
});

describe('PagoFichaHeader', () => {
  it('con saldo cero la ficha figura Cancelado', () => {
    render(<PagoFichaHeader nombreCompleto="Ana Pérez" codigoEstudiante="E-1" gestionLabel="2026" montoObligatorio={100} totalPagado={100} saldoPendiente={0} cantidadPagos={1} />);
    expect(screen.getByRole('heading', { name: 'Ana Pérez' })).toBeInTheDocument();
    expect(screen.getByText('E-1 · 2026')).toBeInTheDocument();
    expect(screen.getByText('Cancelado')).toBeInTheDocument();
  });

  it('valores por defecto: título genérico y "Sin pagos"', () => {
    render(<PagoFichaHeader montoObligatorio={100} totalPagado={0} saldoPendiente={100} cantidadPagos={0} />);
    expect(screen.getByRole('heading', { name: 'Pago de aporte' })).toBeInTheDocument();
    expect(screen.getByText('Aporte académico')).toBeInTheDocument();
    expect(screen.getByText('Sin pagos')).toBeInTheDocument();
  });
});

describe('PagoCuotasSection y columnas de cuotas', () => {
  const cuotas = [
    { id: 1, numeroRecibo: 'R-001', fechaPago: '2026-03-05', monto: 150, metodoNombre: 'QR', cuenta: 'BNB' },
    { id: 2, numeroRecibo: null, fechaPago: null, monto: 'x', metodoNombre: null },
  ];
  const permisosAll = [
    permiso(FINANZAS_PERMISOS.pagoVer, 'EXPORTAR'),
    permiso(FINANZAS_PERMISOS.pagoEditar, 'EDITAR', 'ELIMINAR'),
  ];
  const props = { montoBase: 1000, descuentoBeca: 0, montoObligatorio: 1000, totalPagado: 150, saldoPendiente: 850, cuotas };

  it('sin cuotas muestra el vacío', () => {
    renderWithProviders(<PagoCuotasSection {...props} cuotas={[]} />);
    expect(screen.getByText('No hay cuotas registradas para este pago.')).toBeInTheDocument();
    expect(screen.getByText('Cuotas registradas (0)')).toBeInTheDocument();
  });

  it('lista cuotas con guiones donde faltan datos y sin columna de acciones sin callbacks', () => {
    renderWithProviders(<PagoCuotasSection {...props} />);
    expect(screen.getByText('R-001')).toBeInTheDocument();
    expect(screen.getByText('BNB')).toBeInTheDocument();
    expect(screen.queryByText('Acciones')).not.toBeInTheDocument();
  });

  it('las acciones por cuota dependen del permiso (recibo, editar, eliminar)', async () => {
    const onGenerarRecibo = vi.fn();
    const onEditarCuota = vi.fn();
    const { unmount } = renderWithProviders(
      <PagoCuotasSection {...props} puedeExportarRecibo puedeEditarCuota puedeEliminarCuota onGenerarRecibo={onGenerarRecibo} onEditarCuota={onEditarCuota} onEliminarCuota={vi.fn()} />,
      { auth: { permisos: permisosAll } },
    );
    await userEvent.click(screen.getAllByRole('button', { name: 'edit' })[0]);
    expect(onEditarCuota).toHaveBeenCalledWith(cuotas[0]);
    await userEvent.click(screen.getAllByRole('button', { name: 'file-pdf' })[0]);
    expect(onGenerarRecibo).toHaveBeenCalledWith(cuotas[0]);
    unmount();

    renderWithProviders(
      <PagoCuotasSection {...props} puedeExportarRecibo puedeEditarCuota puedeEliminarCuota onGenerarRecibo={onGenerarRecibo} onEditarCuota={onEditarCuota} onEliminarCuota={vi.fn()} />,
    );
    expect(screen.queryByRole('button', { name: 'edit' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'file-pdf' })).not.toBeInTheDocument();
  });

  it('formatCuotaMonto formatea y tolera valores no numéricos', () => {
    expect(formatCuotaMonto('x')).toMatch(/^Bs 0,00$/);
    expect(createCuotasTableColumns({}).map((c) => c.title)).toEqual(['#', 'Recibo', 'Fecha', 'Monto', 'Método de pago']);
  });
});

describe('createIngresosTableColumns', () => {
  const ingreso = { id: 1, fechaPago: '2026-03-05', personaCodigo: 'E-1', personaNombreCompleto: 'Pérez Ana', origen: 'APORTE', referenciaId: 7, concepto: 'Aporte', monto: 100, metodoPagoNombre: 'Efectivo', numeroRecibo: 'R-9' };

  it('columnas, numeración con offset y valores por defecto', () => {
    const cols = createIngresosTableColumns({ navigate: vi.fn() });
    expect(cols.map((c) => c.title)).toEqual(['#', 'Fecha', 'Persona', 'Concepto', 'Monto (Bs)', 'Método de pago', 'N° recibo', 'Acciones']);
    expect(cols[0].render(null, null, 1, 10)).toBe(12);
    expect(cols[3].render(null, {})).toBe('—');
    expect(cols[6].render(null, {})).toBe('—');
    expect(cols[5].render(null, {})).toBe('—');
  });

  it('la acción ver abre la ficha según el origen y se oculta sin referencia o permiso', async () => {
    const navigate = vi.fn();
    const acciones = createIngresosTableColumns({ navigate, listNavState: { a: 1 } })[7];
    const auth = { permisos: [permiso(FINANZAS_PERMISOS.pagoVer, 'DETALLE')] };

    const { unmount } = renderWithProviders(acciones.render(null, ingreso), { auth });
    await userEvent.click(screen.getByRole('button', { name: 'eye' }));
    expect(navigate).toHaveBeenCalledWith(expect.stringContaining('7'), { state: { a: 1 } });
    unmount();

    expect(acciones.render(null, { ...ingreso, referenciaId: null })).toBeNull();
    renderWithProviders(acciones.render(null, ingreso));
    expect(screen.queryByRole('button', { name: 'eye' })).not.toBeInTheDocument();
  });
});

describe('EstudianteSelector', () => {
  const estudiantes = [
    { id: 1, nombreCompleto: 'Pérez Ana', codigoEstudiante: 'E-1', carreraNombre: 'Sistemas', aporte: { tieneSaldoPendiente: true, saldoPendienteTotal: 80 } },
    { id: 2, nombreCompleto: 'Soto Luis', aporte: { totalmenteCubierto: true } },
    { id: 3, nombreCompleto: 'Rojas Eva', aporte: {} },
  ];

  it('buscar notifica el texto, lista resultados con saldo y permite seleccionar', async () => {
    const onBuscar = vi.fn();
    const onSeleccionar = vi.fn();
    render(<EstudianteSelector estudiantes={estudiantes} onBuscar={onBuscar} onSeleccionar={onSeleccionar} />);
    await userEvent.type(screen.getByPlaceholderText(/Buscar por nombre, código, CI o carrera/), 'pe');
    expect(onBuscar).toHaveBeenLastCalledWith('pe');
    expect(screen.getByText(/Saldo\s*Bs\s*80,00/)).toBeInTheDocument();
    expect(screen.getByText('Aporte al día')).toBeInTheDocument();
    expect(screen.getAllByText('Sin carrera asignada')).toHaveLength(2);
    await userEvent.click(screen.getByText(/Pérez Ana/));
    expect(onSeleccionar).toHaveBeenCalledWith(estudiantes[0]);
  });

  it('sin resultados invita a buscar y con error lo muestra', () => {
    const { rerender } = render(<EstudianteSelector estudiantes={[]} />);
    expect(screen.getByText('Escriba para buscar un estudiante')).toBeInTheDocument();
    rerender(<EstudianteSelector estudiantes={[]} error="Sin red" />);
    expect(screen.getByText('No se pudieron buscar los estudiantes')).toBeInTheDocument();
  });

  it('con selección muestra el resumen y permite cambiar', async () => {
    const onCambiar = vi.fn();
    render(<EstudianteSelector estudianteSeleccionado={{ nombreCompleto: 'Pérez Ana', codigoEstudiante: 'E-1' }} onCambiar={onCambiar} />);
    expect(screen.getByText('E-1')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Cambiar estudiante' }));
    expect(onCambiar).toHaveBeenCalled();
  });
});
