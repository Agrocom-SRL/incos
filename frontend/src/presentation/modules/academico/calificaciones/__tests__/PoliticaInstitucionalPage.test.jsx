/**
 * PoliticaInstitucionalPage: formulario de política de notas (validación de sumas, RBAC, guardado).
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders, permiso } from '../../../../../test/renderWithProviders.jsx';

const hook = vi.hoisted(() => vi.fn());
const navigate = vi.hoisted(() => vi.fn());

vi.mock('react-router-dom', async (orig) => ({ ...(await orig()), useNavigate: () => navigate }));
vi.mock('@application-academico/calificaciones/hooks/usePoliticaInstitucional.js', () => ({
  usePoliticaInstitucional: hook,
}));

import PoliticaInstitucionalPage from '../pages/PoliticaInstitucionalPage.jsx';
import PoliticaInstitucionalConnector from '../connectors/PoliticaInstitucionalConnector.jsx';

const EDITAR = { permisos: [permiso('academico.calificacion.politica', 'EDITAR')] };

const politicaBase = {
  gestionNombre: 'Gestión 2026',
  configurada: true,
  cuotaTeorico: 30,
  cuotaPractico: 70,
  pesosBimestres: [25, 25, 25, 25],
  politicaAsistenciaDefault: { politica: 'NO_AFECTA' },
  notaMinimaAprobacion: 61,
};

const estado = (extra = {}) => ({
  politica: politicaBase,
  politicaGestionAnterior: null,
  gestionVigente: 'Gestión 2026',
  isLoading: false,
  isSaving: false,
  error: null,
  refetch: vi.fn(),
  guardar: vi.fn().mockResolvedValue(politicaBase),
  breadcrumbItems: [{ title: 'Configuración de notas' }],
  ...extra,
});

beforeEach(() => {
  navigate.mockClear();
  hook.mockReset();
});

describe('PoliticaInstitucionalPage', () => {
  it('carga la política en el formulario y muestra el resumen vigente', async () => {
    hook.mockReturnValue(estado());
    renderWithProviders(<PoliticaInstitucionalPage />, { auth: EDITAR });
    expect(await screen.findByText('Detalle de la configuración')).toBeInTheDocument();
    expect(screen.getByText('Guardada')).toBeInTheDocument();
    expect(screen.getByText('Ponderación teórico / práctico (gestión)', { selector: '.ant-card-head-title' })).toBeInTheDocument();
    expect(screen.getByText('Nota mínima para aprobar la materia')).toBeInTheDocument();
    expect(await screen.findByText('30.0%')).toBeInTheDocument();
  });

  it('guarda el payload normalizado y avisa', async () => {
    const s = estado();
    hook.mockReturnValue(s);
    renderWithProviders(<PoliticaInstitucionalPage />, { auth: EDITAR });
    await userEvent.click(await screen.findByRole('button', { name: 'Guardar configuración de notas' }));
    await waitFor(() => expect(s.guardar).toHaveBeenCalled());
    expect(s.guardar).toHaveBeenCalledWith({
      cuotaTeorico: 30,
      cuotaPractico: 70,
      pesosBimestres: [25, 25, 25, 25],
      notaMinimaAprobacion: 61,
      politicaAsistenciaDefault: {
        politica: 'NO_AFECTA',
        pesoAsistencia: null,
        minimoAsistencia: null,
        notaReprobada: null,
      },
    });
    expect(await screen.findByText('Configuración guardada')).toBeInTheDocument();
  });

  it('no guarda si la cuota teórico + práctico no suma 100', async () => {
    const s = estado({ politica: { ...politicaBase, cuotaPractico: 60 } });
    hook.mockReturnValue(s);
    renderWithProviders(<PoliticaInstitucionalPage />, { auth: EDITAR });
    await userEvent.click(await screen.findByRole('button', { name: 'Guardar configuración de notas' }));
    expect(await screen.findByText('La ponderación teórico + práctico debe sumar 100%')).toBeInTheDocument();
    expect(s.guardar).not.toHaveBeenCalled();
  });

  it('no guarda si los bimestres no suman 100', async () => {
    const s = estado({ politica: { ...politicaBase, pesosBimestres: [20, 20, 20, 20] } });
    hook.mockReturnValue(s);
    renderWithProviders(<PoliticaInstitucionalPage />, { auth: EDITAR });
    await userEvent.click(await screen.findByRole('button', { name: 'Guardar configuración de notas' }));
    expect(await screen.findByText('La ponderación de los 4 bimestres debe sumar 100%')).toBeInTheDocument();
    expect(s.guardar).not.toHaveBeenCalled();
  });

  it('un fallo al guardar se muestra con reintento', async () => {
    const s = estado({ guardar: vi.fn().mockRejectedValue(new Error('Gestión cerrada')) });
    hook.mockReturnValue(s);
    renderWithProviders(<PoliticaInstitucionalPage />, { auth: EDITAR });
    await userEvent.click(await screen.findByRole('button', { name: 'Guardar configuración de notas' }));
    expect(await screen.findByText('Gestión cerrada')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Reintentar' })).toBeInTheDocument();
  });

  it('RBAC: sin EDITAR muestra el botón deshabilitado', async () => {
    hook.mockReturnValue(estado());
    renderWithProviders(<PoliticaInstitucionalPage />);
    expect(await screen.findByRole('button', { name: 'Sin permiso para editar' })).toBeDisabled();
    expect(screen.queryByRole('button', { name: 'Guardar configuración de notas' })).not.toBeInTheDocument();
  });

  it('gestión sin configurar con anterior configurada: copia y guarda', async () => {
    const anterior = { ...politicaBase, gestionNombre: 'Gestión 2025', configurada: true };
    const s = estado({
      politica: { ...politicaBase, configurada: false },
      politicaGestionAnterior: anterior,
      guardar: vi.fn().mockResolvedValue({ ...politicaBase, configurada: true }),
    });
    hook.mockReturnValue(s);
    renderWithProviders(<PoliticaInstitucionalPage />, { auth: EDITAR });
    expect(await screen.findByText('Configuración de la gestión anterior')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /Copiar y guardar configuración/ }));
    await waitFor(() => expect(s.guardar).toHaveBeenCalled());
    expect(await screen.findByText('Configuración copiada y guardada')).toBeInTheDocument();
  });

  it('copiar con error muestra el mensaje', async () => {
    const anterior = { ...politicaBase, gestionNombre: 'Gestión 2025' };
    const s = estado({
      politica: { ...politicaBase, configurada: false },
      politicaGestionAnterior: anterior,
      guardar: vi.fn().mockRejectedValue(new Error('')),
    });
    hook.mockReturnValue(s);
    renderWithProviders(<PoliticaInstitucionalPage />, { auth: EDITAR });
    await userEvent.click(await screen.findByRole('button', { name: /Copiar y guardar configuración/ }));
    expect(await screen.findByText('No se pudo copiar la configuración. Reintente.')).toBeInTheDocument();
  });

  it('gestión sin configurar y sin anterior muestra borrador', async () => {
    hook.mockReturnValue(estado({ politica: { ...politicaBase, configurada: false } }));
    renderWithProviders(<PoliticaInstitucionalPage />, { auth: EDITAR });
    expect(await screen.findByText('Borrador (sin guardar)')).toBeInTheDocument();
  });

  it('error de carga con reintento; sin política no hay formulario', async () => {
    const s = estado({ politica: null, error: 'Falla del servidor' });
    hook.mockReturnValue(s);
    renderWithProviders(<PoliticaInstitucionalPage />, { auth: EDITAR });
    expect(screen.getByText('Falla del servidor')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Guardar configuración de notas' })).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Reintentar' }));
    expect(s.refetch).toHaveBeenCalled();
  });

  it('cargando muestra el indicador', () => {
    hook.mockReturnValue(estado({ politica: null, isLoading: true }));
    const { container } = renderWithProviders(<PoliticaInstitucionalPage />, { auth: EDITAR });
    expect(container.querySelector('.ant-spin-spinning')).not.toBeNull();
  });

  it('volver regresa a Calificaciones', async () => {
    hook.mockReturnValue(estado());
    const { container } = renderWithProviders(<PoliticaInstitucionalPage />, { auth: EDITAR });
    await userEvent.click(container.querySelector('.anticon-arrow-left').closest('button'));
    expect(navigate).toHaveBeenCalled();
  });

  it('el conector monta la página', () => {
    hook.mockReturnValue(estado({ politica: null, isLoading: true }));
    renderWithProviders(<PoliticaInstitucionalConnector />);
    expect(screen.getAllByText('Configuración de notas').length).toBeGreaterThan(0);
  });
});
