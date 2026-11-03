import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/test/renderWithProviders';
import DocenteAccessSection from '../DocenteAccessSection';
import DocenteProfileSummary from '../DocenteProfileSummary';

const navigate = vi.fn();
vi.mock('react-router-dom', async (orig) => ({ ...(await orig()), useNavigate: () => navigate }));

describe('DocenteAccessSection', () => {
  beforeEach(() => navigate.mockReset());

  it('sin usuario vinculado: explica y permite crear la cuenta con el docente precargado', async () => {
    renderWithProviders(
      <DocenteAccessSection
        access={{ tieneAcceso: false }}
        docenteId={9}
        docenteNombreCompleto="Ana Pérez"
        docenteCiCompleto="123 LP"
        puedeCrearUsuario
      />,
    );
    expect(screen.getByText(/no tiene usuario vinculado/)).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /Crear usuario de acceso/ }));
    const [ruta, opts] = navigate.mock.calls[0];
    expect(ruta).toBe('/seguridad/usuarios/nuevo');
    expect(opts.state).toMatchObject({
      forceRoleCode: 'DOCENTE',
      prefillDocenteUsuario: { docenteId: 9, nombreCompleto: 'Ana Pérez', ciCompleto: '123 LP', emailPersonal: null },
    });
  });

  it('sin permiso de crear no ofrece el botón', () => {
    renderWithProviders(<DocenteAccessSection access={{ tieneAcceso: false }} docenteId={9} />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('con acceso: muestra usuario, rol y estado por defecto; administra el usuario', async () => {
    renderWithProviders(
      <DocenteAccessSection access={{ tieneAcceso: true, usuarioId: 4, usuario: 'ana', rol: 'DOCENTE' }} puedeEditarUsuario />,
    );
    expect(screen.getByText('ana')).toBeInTheDocument();
    expect(screen.getByText('DOCENTE')).toBeInTheDocument();
    expect(screen.getByText('Activo (sin restricción registrada)')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /Administrar usuario/ }));
    expect(navigate).toHaveBeenCalledWith('/seguridad/usuarios/4');
  });
});

describe('DocenteProfileSummary', () => {
  const base = { nombreCompleto: 'Ana Pérez', iniciales: 'AP', ciCompleto: '123 LP' };

  it('muestra identidad y guiones donde no hay contacto', () => {
    renderWithProviders(<DocenteProfileSummary {...base} />);
    expect(screen.getByRole('heading', { name: 'Ana Pérez' })).toBeInTheDocument();
    expect(screen.getByText('AP')).toBeInTheDocument();
    expect(screen.getAllByText('—').length).toBeGreaterThanOrEqual(3);
    expect(screen.queryByText('Máx. h/sem.')).not.toBeInTheDocument();
  });

  it('enlaza teléfono y correo y muestra el estado laboral', () => {
    renderWithProviders(
      <DocenteProfileSummary {...base} celular="7000" emailPersonal="a@b.com" estadoLaboral="ACTIVO" maxHorasSemana={20} />,
    );
    expect(screen.getByRole('link', { name: '7000' })).toHaveAttribute('href', 'tel:7000');
    expect(screen.getByRole('link', { name: 'a@b.com' })).toHaveAttribute('href', 'mailto:a@b.com');
    expect(screen.getByText('ACTIVO')).toBeInTheDocument();
    expect(screen.getByText('20')).toBeInTheDocument();
  });

  it('el botón de editar solo aparece con permiso y dispara onEditar', async () => {
    const onEditar = vi.fn();
    const { unmount } = renderWithProviders(<DocenteProfileSummary {...base} puedeEditar onEditar={onEditar} />);
    await userEvent.click(screen.getByRole('button', { name: 'Editar ficha del docente' }));
    expect(onEditar).toHaveBeenCalled();
    unmount();
    renderWithProviders(<DocenteProfileSummary {...base} onEditar={onEditar} />);
    expect(screen.queryByRole('button', { name: 'Editar ficha del docente' })).not.toBeInTheDocument();
  });
});
