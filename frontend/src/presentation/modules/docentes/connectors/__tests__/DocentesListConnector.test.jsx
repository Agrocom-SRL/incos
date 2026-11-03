import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import { Routes, Route } from 'react-router-dom';
import { renderWithProviders } from '@/test/renderWithProviders';
import DocentesListConnector from '../DocentesListConnector';

const mocks = vi.hoisted(() => ({ miDocente: vi.fn(), esDocente: vi.fn() }));
vi.mock('@application-auth', async (orig) => ({ ...(await orig()), esDocente: (u) => mocks.esDocente(u) }));
vi.mock('@application-docentes/hooks', async (orig) => ({ ...(await orig()), useMiDocenteId: () => mocks.miDocente() }));
vi.mock('@application-docentes/providers', () => ({ DocentesListProvider: ({ children }) => <>{children}</> }));
vi.mock('@docentes/pages/DocentesList', () => ({ default: () => <p>Listado de docentes</p> }));

const montar = () => renderWithProviders(
  <Routes>
    <Route path="/" element={<DocentesListConnector />} />
    <Route path="/docentes/:id" element={<p>Ficha del docente</p>} />
  </Routes>,
);

beforeEach(() => {
  vi.clearAllMocks();
  mocks.esDocente.mockReturnValue(true);
});

describe('DocentesListConnector', () => {
  it('staff ve el listado', () => {
    mocks.esDocente.mockReturnValue(false);
    montar();
    expect(screen.getByText('Listado de docentes')).toBeInTheDocument();
  });

  it('docente: mientras resuelve su id muestra el texto de carga (Spin fullscreen de AntD 6)', () => {
    mocks.miDocente.mockReturnValue({ loading: true, docenteId: null, error: null });
    montar();
    // Sin hijos y sin `fullscreen`, `tip` no se pinta.
    expect(screen.getByText('Abriendo su ficha…')).toBeInTheDocument();
  });

  it('docente: redirige a su ficha', () => {
    mocks.miDocente.mockReturnValue({ loading: false, docenteId: 7, error: null });
    montar();
    expect(screen.getByText('Ficha del docente')).toBeInTheDocument();
  });

  it('docente: sin registro muestra la alerta de error', () => {
    mocks.miDocente.mockReturnValue({ loading: false, docenteId: null, error: null });
    montar();
    expect(screen.getByText('No se pudo abrir su ficha')).toBeInTheDocument();
    expect(screen.getByText('No se encontró su registro de docente.')).toBeInTheDocument();
  });
});
