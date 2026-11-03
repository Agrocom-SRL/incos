import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Routes, Route } from 'react-router-dom';
import { renderWithProviders } from '@/test/renderWithProviders';
import SidebarUserFooter from '../SidebarUserFooter';
import RolPill from '../RolPill';

const arbol = (
  <Routes>
    <Route path="/" element={<SidebarUserFooter />} />
    <Route path="/perfil" element={<p>Mi perfil</p>} />
  </Routes>
);

describe('SidebarUserFooter', () => {
  it('muestra el nombre del vínculo de perfil, las iniciales y el rol', () => {
    renderWithProviders(arbol, {
      auth: {
        usuario: {
          username: 'ana.perez',
          vinculo_perfil: { nombre_completo: 'PÉREZ SOTO ANA' },
          rol: { codigo: 'DOCENTE', nombre: 'Docente', tipo: 'DOCENTE' },
        },
      },
    });
    expect(screen.getByText('PÉREZ SOTO ANA')).toBeInTheDocument();
    expect(screen.getByText('Docente')).toBeInTheDocument();
  });

  it('sin vínculo de perfil usa el username', () => {
    renderWithProviders(arbol, { auth: { usuario: { username: 'test.admin' } } });
    expect(screen.getByText('test.admin')).toBeInTheDocument();
  });

  it('clic y teclado (Enter) navegan a /perfil', async () => {
    renderWithProviders(arbol, { auth: { usuario: { username: 'u' } } });
    await userEvent.click(screen.getByRole('button', { name: 'Ir a mi perfil' }));
    expect(screen.getByText('Mi perfil')).toBeInTheDocument();
  });

  it('accesible por teclado', async () => {
    renderWithProviders(arbol, { auth: { usuario: { username: 'u' } } });
    screen.getByRole('button', { name: 'Ir a mi perfil' }).focus();
    await userEvent.keyboard('{Enter}');
    expect(screen.getByText('Mi perfil')).toBeInTheDocument();
  });

  it('colapsado oculta nombre y rol', () => {
    renderWithProviders(<SidebarUserFooter collapsed />, {
      auth: { usuario: { username: 'u', rol: { nombre: 'Admin' } } },
    });
    expect(screen.queryByText('Admin')).not.toBeInTheDocument();
  });
});

describe('RolPill', () => {
  it('muestra el nombre del rol con la clase de su tipo', () => {
    renderWithProviders(<RolPill rol={{ nombre: 'Rector', tipo: 'RECTOR' }} />);
    expect(screen.getByText('Rector')).toHaveClass('seg-rol-pill--rector');
  });

  it('sin rol no renderiza nada', () => {
    const { container } = renderWithProviders(<RolPill rol={null} />);
    expect(container.querySelector('.seg-rol-pill')).toBeNull();
  });
});
