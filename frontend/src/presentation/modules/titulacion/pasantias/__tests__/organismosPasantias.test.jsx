import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders, permiso } from '@/test/renderWithProviders';
import PasantiaDatosSection from '../components/organisms/PasantiaDatosSection';
import PasantiaEmpresaFichaHeader from '../components/organisms/PasantiaEmpresaFichaHeader';
import PasantiaEmpresaInformacionSection from '../components/organisms/PasantiaEmpresaInformacionSection';
import PasantiaEmpresaSection from '../components/organisms/PasantiaEmpresaSection';
import PasantiaFichaHeader from '../components/organisms/PasantiaFichaHeader';
import PasantiaInformesSection from '../components/organisms/PasantiaInformesSection';
import PasantiaSeguimientosSection from '../components/organisms/PasantiaSeguimientosSection';
import PasantiaTimeline from '../components/organisms/PasantiaTimeline';
import { createPasantiasEmpresasTableColumns } from '../config/pasantiasEmpresasTableColumns';
import { createMisPasantiasTableColumns } from '../config/misPasantiasTableColumns';
import { createSeguimientosPasantiaTableColumns } from '../config/seguimientosPasantiaTableColumns';
import { createInformesPasantiaTableColumns } from '../config/informesPasantiaTableColumns';
import { createPasantiasTableColumns } from '../config/pasantiasTableColumns';
import { findColumn, renderCell, renderCells } from '@/test/renderColumns';
import { TITULACION_PERMISOS } from '@application-titulacion/utils/titulacionPermisos';

vi.mock('@container', () => ({ useContainer: () => ({ resolve: vi.fn() }) }));

const pasantia = {
  id: 4,
  tipo: 'PASANTIA',
  estado: 'EN_CURSO',
  estudianteNombre: 'Pérez Ana',
  codigoEstudiante: 'E-1',
  carreraNombre: 'Sistemas',
  gestionLabel: 'Gestión 2026',
  empresaNombre: 'Tigo',
  horasLabel: '120 / 300 h',
  porcentajeHoras: 40,
  totalInformes: 2,
  totalSeguimientos: 5,
  ultimoSeguimientoNivel: 'ALTO',
};

describe('secciones de la ficha de pasantía', () => {
  it('PasantiaDatosSection muestra trámite y estudiante, con guiones donde falta', () => {
    renderWithProviders(<PasantiaDatosSection pasantia={{ ...pasantia, observaciones: 'Sin novedades' }} />);
    expect(screen.getByText('Pasantía')).toBeInTheDocument();
    expect(screen.getByText('En curso')).toBeInTheDocument();
    expect(screen.getByText('120 / 300 h')).toBeInTheDocument();
    expect(screen.getByText('Sin novedades')).toBeInTheDocument();
    expect(screen.getAllByText('—').length).toBeGreaterThan(0);
  });

  it('PasantiaEmpresaSection: el contrato solo se muestra en convalidación', () => {
    const { unmount } = renderWithProviders(<PasantiaEmpresaSection pasantia={pasantia} />);
    expect(screen.getByText('Sin supervisor asignado')).toBeInTheDocument();
    expect(screen.getByText('Sin registros')).toBeInTheDocument();
    expect(screen.queryByText('Contrato de trabajo (convalidación)')).not.toBeInTheDocument();
    unmount();
    renderWithProviders(
      <PasantiaEmpresaSection pasantia={{ ...pasantia, tipo: 'CONVALIDACION', empresaEnFuncionamiento: false, funciones: 'Soporte' }} />,
    );
    expect(screen.getByText('Contrato de trabajo (convalidación)')).toBeInTheDocument();
    expect(screen.getByText('Soporte')).toBeInTheDocument();
    expect(screen.getByText('No')).toBeInTheDocument();
  });

  it('PasantiaFichaHeader: estadísticas y edición por permiso del llamador', async () => {
    const onEditar = vi.fn();
    const { unmount } = renderWithProviders(<PasantiaFichaHeader pasantia={pasantia} puedeEditar onEditar={onEditar} />);
    expect(screen.getByText('Tigo')).toBeInTheDocument();
    expect(screen.getByText('Alto')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Editar datos del trámite de pasantía' }));
    expect(onEditar).toHaveBeenCalled();
    unmount();
    renderWithProviders(<PasantiaFichaHeader pasantia={{ ...pasantia, ultimoSeguimientoNivel: null, empresaNombre: null }} />);
    expect(screen.queryByRole('button', { name: 'Editar datos del trámite de pasantía' })).not.toBeInTheDocument();
    expect(screen.queryByText('Último desempeño')).not.toBeInTheDocument();
    expect(screen.getByText('Sin empresa asignada')).toBeInTheDocument();
  });

  it('PasantiaTimeline muestra el título y la acción opcional', () => {
    renderWithProviders(<PasantiaTimeline pasantia={pasantia} action={<button>Avanzar</button>} />);
    expect(screen.getByText('Línea de tiempo del trámite')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Avanzar' })).toBeInTheDocument();
  });
});

describe('ficha de empresa de pasantía', () => {
  const empresa = { nombre: 'Tigo SA', nombreComercial: 'Tigo', nit: '123', tipoSocietario: 'SA', activo: false, enFuncionamiento: false, sectorActividad: 'Telecom', direccion: 'Av. 1', telefono: '2222', observaciones: 'Convenio vigente' };

  it('cabecera: nombre comercial, NIT, estado inactiva y edición', async () => {
    const onEditar = vi.fn();
    renderWithProviders(<PasantiaEmpresaFichaHeader empresa={empresa} puedeEditar onEditar={onEditar} />);
    expect(screen.getByRole('heading', { name: 'Tigo' })).toBeInTheDocument();
    expect(screen.getByText('Tigo SA · NIT 123')).toBeInTheDocument();
    expect(screen.getByText('Inactiva')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Editar empresa' }));
    expect(onEditar).toHaveBeenCalled();
  });

  it('cabecera sin comercial usa el nombre y la descripción genérica', () => {
    renderWithProviders(<PasantiaEmpresaFichaHeader empresa={{ nombre: 'Solo', activo: true }} />);
    expect(screen.getByRole('heading', { name: 'Solo' })).toBeInTheDocument();
    expect(screen.getByText('Empresa de pasantía')).toBeInTheDocument();
    expect(screen.queryByText('Inactiva')).not.toBeInTheDocument();
  });

  it('información: contacto y observaciones solo si existen', () => {
    const { unmount } = renderWithProviders(<PasantiaEmpresaInformacionSection empresa={empresa} />);
    expect(screen.getByText('Av. 1')).toBeInTheDocument();
    expect(screen.getByText('Convenio vigente')).toBeInTheDocument();
    unmount();
    renderWithProviders(<PasantiaEmpresaInformacionSection empresa={{ nombre: 'X' }} />);
    expect(screen.queryByText('Observaciones')).not.toBeInTheDocument();
  });
});

describe('listas de informes y seguimientos', () => {
  it('informes: error, vacío y con datos', () => {
    const { unmount } = renderWithProviders(<PasantiaInformesSection informes={[]} error="Falla" />);
    expect(screen.getByText('No se pudieron cargar los informes')).toBeInTheDocument();
    unmount();
    const { unmount: u2 } = renderWithProviders(<PasantiaInformesSection informes={[]} loading={false} />);
    expect(screen.getByText('El trámite aún no tiene informes emitidos.')).toBeInTheDocument();
    u2();
    renderWithProviders(
      <PasantiaInformesSection informes={[{ id: 1, tipo: 'FINAL', numeroMemo: 'M-1', resultado: 'APROBADO', tienePdf: true, nombreArchivo: 'informe.pdf' }]} readOnly />,
    );
    expect(screen.getByText('Informes (1)')).toBeInTheDocument();
    expect(screen.getByText('informe.pdf')).toBeInTheDocument();
  });

  it('seguimientos: "Registrar seguimiento" exige permiso y no aparece en solo lectura', async () => {
    const onNuevo = vi.fn();
    const auth = { permisos: [permiso(TITULACION_PERMISOS.pasantiaSeguimiento, 'CREAR')] };
    const { unmount } = renderWithProviders(<PasantiaSeguimientosSection seguimientos={[]} onNuevoSeguimiento={onNuevo} />, { auth });
    expect(screen.getByText('El trámite aún no tiene seguimientos registrados.')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /Registrar seguimiento/ }));
    expect(onNuevo).toHaveBeenCalled();
    unmount();
    const { unmount: u2 } = renderWithProviders(<PasantiaSeguimientosSection seguimientos={[]} onNuevoSeguimiento={onNuevo} />);
    expect(screen.queryByRole('button', { name: /Registrar seguimiento/ })).not.toBeInTheDocument();
    u2();
    renderWithProviders(<PasantiaSeguimientosSection seguimientos={[]} readOnly error="Falla" />, { auth });
    expect(screen.getByText('No se pudieron cargar los seguimientos')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Registrar seguimiento/ })).not.toBeInTheDocument();
  });
});

describe('columnas de pasantías', () => {
  it('listado: celdas con guiones, orden y acciones por permiso', async () => {
    const navigate = vi.fn();
    const cols = createPasantiasTableColumns({ navigate, listNavState: { x: 1 }, refetch: vi.fn(), deleteFn: vi.fn() });
    const textos = renderCells(cols, pasantia);
    expect(textos.nro).toBe('1');
    expect(Object.values(textos).join(' ')).toMatch(/PÉREZ ANA/);
    expect(Object.values(textos).join(' ')).toMatch(/Sin supervisor asignado/);

    const vacio = renderCells(cols, {});
    expect(Object.values(vacio).join(' ')).toMatch(/SIN NOMBRE/);

    const nombre = cols[1];
    expect(nombre.sortCompare({ estudianteNombre: 'A' }, { estudianteNombre: 'B' })).toBeLessThan(0);

    const auth = { permisos: [permiso(TITULACION_PERMISOS.pasantia, 'DETALLE', 'EDITAR')] };
    const { unmount } = renderCell(findColumn(cols, 'acciones'), pasantia, { auth });
    await userEvent.click(screen.getByRole('button', { name: 'eye' }));
    expect(navigate).toHaveBeenCalledWith(expect.stringContaining('4'), { state: { x: 1 } });
    await userEvent.click(screen.getByRole('button', { name: 'edit' }));
    expect(navigate).toHaveBeenCalledTimes(2);
    expect(screen.queryByRole('button', { name: 'delete' })).not.toBeInTheDocument();
    unmount();
  });

  it('mis pasantías: "Registrar seguimiento" solo en trámites solicitados o en curso', async () => {
    const onRegistrar = vi.fn();
    const cols = createMisPasantiasTableColumns({ onVerPasantia: vi.fn(), onRegistrarSeguimiento: onRegistrar });
    const accion = cols[cols.length - 1];
    const auth = { permisos: [permiso(TITULACION_PERMISOS.pasantia, 'DETALLE'), permiso(TITULACION_PERMISOS.pasantiaSeguimiento, 'CREAR')] };
    const { unmount } = renderCell(accion, pasantia, { auth });
    await userEvent.click(screen.getByRole('button', { name: 'file-add' }));
    expect(onRegistrar).toHaveBeenCalledWith(pasantia);
    unmount();
    renderCell(accion, { ...pasantia, estado: 'FINALIZADA' }, { auth });
    expect(screen.queryByRole('button', { name: 'file-add' })).not.toBeInTheDocument();
  });

  it('empresas: estado con toggle, acciones y orden', async () => {
    const onVer = vi.fn();
    const cols = createPasantiasEmpresasTableColumns({ onEditar: vi.fn(), onToggleEstado: vi.fn(), onVer, eliminarEmpresa: vi.fn(), refetch: vi.fn() });
    const empresa = { id: 2, nombre: 'Tigo SA', nombreComercial: 'Tigo', nit: '123', tipoSocietario: 'SA', direccion: 'Av. 1', telefono: '2222', sectorActividad: 'Telecom', activo: true };
    const textos = renderCells(cols, empresa);
    expect(textos.nro).toBe('1');
    expect(Object.values(textos).join(' ')).toMatch(/TIGO/);
    expect(Object.values(textos).join(' ')).toMatch(/Telecom/);
    expect(cols[2].sortCompare({ tipoSocietario: 'A' }, { tipoSocietario: 'B' })).toBeLessThan(0);
    const { unmount } = renderCell(cols[cols.length - 1], empresa, { auth: { permisos: [permiso(TITULACION_PERMISOS.pasantiaEmpresa, 'DETALLE')] } });
    await userEvent.click(screen.getByRole('button', { name: 'eye' }));
    expect(onVer).toHaveBeenCalledWith(empresa);
    unmount();
  });

  it('seguimientos e informes: en solo lectura no hay columna de acciones', () => {
    expect(createSeguimientosPasantiaTableColumns({ readOnly: true })).toHaveLength(5);
    expect(createSeguimientosPasantiaTableColumns({})).toHaveLength(6);
    expect(createInformesPasantiaTableColumns({ readOnly: true })).toHaveLength(5);
    expect(createInformesPasantiaTableColumns({})).toHaveLength(6);
  });

  it('seguimientos: descarga deshabilitada mientras el mismo registro descarga', async () => {
    const onDescargar = vi.fn();
    const cols = createSeguimientosPasantiaTableColumns({ onEditar: vi.fn(), onDescargar, descargandoId: 9 });
    const seguimiento = { id: 9, fechaLabel: '05/03/2026', descripcionTrabajo: 'Soporte', nivelDesempeno: 'ALTO' };
    const textos = renderCells(cols, seguimiento);
    expect(textos.nro ?? Object.values(textos)[0]).toBe('1');
    const { unmount } = renderCell(cols[cols.length - 1], seguimiento, { auth: { permisos: [permiso(TITULACION_PERMISOS.pasantia, 'EXPORTAR')] } });
    expect(screen.getByRole('button', { name: 'download' })).toBeDisabled();
    unmount();
  });

  it('informes: sin archivo, resultado y emisión', () => {
    const cols = createInformesPasantiaTableColumns({ readOnly: true });
    const textos = renderCells(cols, { id: 1, tipo: 'FINAL', fechaEmisionLabel: null, destinatario: 'Dirección', tienePdf: false });
    const juntos = Object.values(textos).join(' | ');
    expect(juntos).toMatch(/Sin fecha de emisión/);
    expect(juntos).toMatch(/Para: Dirección/);
    expect(juntos).toMatch(/Sin archivo generado/);
  });
});
