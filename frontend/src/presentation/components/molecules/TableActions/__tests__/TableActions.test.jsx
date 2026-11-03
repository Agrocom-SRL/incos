import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders, permiso } from '@/test/renderWithProviders';
import TableActions from '../TableActions';

// El container real carga todos los módulos; aquí solo interesa el contrato de resolución.
const resolve = vi.fn();
vi.mock('@container', () => ({ useContainer: () => ({ resolve }) }));

const record = { id: 7, nombre: 'Ana' };
const todos = [
  permiso('docentes.ver', 'DETALLE'),
  permiso('docentes.editar', 'EDITAR'),
  permiso('docentes.eliminar', 'ELIMINAR'),
];
const permisosProp = {
  ver: { codigo: 'docentes.ver', accion: 'DETALLE' },
  editar: { codigo: 'docentes.editar', accion: 'EDITAR' },
  eliminar: { codigo: 'docentes.eliminar', accion: 'ELIMINAR' },
};

const botones = () => screen.queryAllByRole('button').map((b) => b.getAttribute('aria-label') ?? b.textContent);
const porIcono = (icono) => screen.queryByRole('button', { name: icono });

describe('TableActions (RBAC)', () => {
  beforeEach(() => {
    resolve.mockReset();
  });

  it('con todos los permisos muestra ver, editar y eliminar y navega con el id', async () => {
    const navigate = vi.fn();
    renderWithProviders(
      <TableActions
        record={record}
        navigate={navigate}
        viewPath="/docentes/:id"
        editPath="/docentes/:id/editar"
        deleteFn={vi.fn()}
        permisos={permisosProp}
      />,
      { auth: { permisos: todos } },
    );

    expect(porIcono('eye')).toBeInTheDocument();
    expect(porIcono('edit')).toBeInTheDocument();
    expect(porIcono('delete')).toBeInTheDocument();

    await userEvent.click(porIcono('eye'));
    expect(navigate).toHaveBeenCalledWith('/docentes/7', undefined);
    await userEvent.click(porIcono('edit'));
    expect(navigate).toHaveBeenCalledWith('/docentes/7/editar');
  });

  it('oculta cada acción cuyo permiso no tiene el usuario', () => {
    renderWithProviders(
      <TableActions
        record={record}
        navigate={vi.fn()}
        viewPath="/docentes/:id"
        editPath="/docentes/:id/editar"
        deleteFn={vi.fn()}
        permisos={permisosProp}
      />,
      { auth: { permisos: [permiso('docentes.ver', 'DETALLE')] } },
    );

    expect(porIcono('eye')).toBeInTheDocument();
    expect(porIcono('edit')).not.toBeInTheDocument();
    expect(porIcono('delete')).not.toBeInTheDocument();
  });

  it('sin permisos declarados en props (fail-closed) no muestra ninguna acción', () => {
    renderWithProviders(
      <TableActions
        record={record}
        navigate={vi.fn()}
        viewPath="/docentes/:id"
        editPath="/docentes/:id/editar"
        deleteFn={vi.fn()}
      />,
      { auth: { permisos: todos } },
    );
    expect(botones()).toEqual([]);
  });

  it('permisos como arreglo se evalúan como OR', () => {
    renderWithProviders(
      <TableActions
        record={record}
        navigate={vi.fn()}
        viewPath="/docentes/:id"
        permisos={{
          ver: [
            { codigo: 'otro.modulo', accion: 'DETALLE' },
            { codigo: 'docentes.ver', accion: 'DETALLE' },
          ],
        }}
      />,
      { auth: { permisos: [permiso('docentes.ver', 'DETALLE')] } },
    );
    expect(porIcono('eye')).toBeInTheDocument();
  });

  it('editDisabled deja el botón editar deshabilitado y no navega', async () => {
    const navigate = vi.fn();
    renderWithProviders(
      <TableActions
        record={record}
        navigate={navigate}
        editPath="/docentes/:id/editar"
        editDisabled
        permisos={permisosProp}
      />,
      { auth: { permisos: todos } },
    );

    expect(porIcono('edit')).toBeDisabled();
    await userEvent.click(porIcono('edit'));
    expect(navigate).not.toHaveBeenCalled();
  });

  it('onEdit / onView personalizados reciben el registro', async () => {
    const onEdit = vi.fn();
    const onView = vi.fn();
    renderWithProviders(
      <TableActions record={record} navigate={vi.fn()} onEdit={onEdit} onView={onView} permisos={permisosProp} />,
      { auth: { permisos: todos } },
    );

    await userEvent.click(porIcono('eye'));
    await userEvent.click(porIcono('edit'));
    expect(onView).toHaveBeenCalledWith(record);
    expect(onEdit).toHaveBeenCalledWith(record);
  });

  describe('acciones extra', () => {
    const icon = <span>x</span>;

    it('sin `permiso` explícito no se muestra (fail-closed)', () => {
      renderWithProviders(
        <TableActions
          record={record}
          navigate={vi.fn()}
          extraActions={[{ key: 'a', icon, tooltip: 'Imprimir', onClick: vi.fn() }]}
        />,
        { auth: { permisos: todos } },
      );
      expect(botones()).toEqual([]);
    });

    it('con permiso+acción se muestra y recibe el registro; acción por defecto LISTAR', async () => {
      const onClick = vi.fn();
      renderWithProviders(
        <TableActions
          record={record}
          navigate={vi.fn()}
          extraActions={[
            { key: 'a', icon, tooltip: 'Imprimir', permiso: 'docentes.ver', accion: 'DETALLE', onClick },
            { key: 'b', icon, tooltip: 'Otra', permiso: 'docentes.ver', onClick: vi.fn() },
          ]}
        />,
        { auth: { permisos: [permiso('docentes.ver', 'DETALLE')] } },
      );

      // La segunda exige LISTAR (default) que el usuario no tiene → solo hay un botón.
      const visibles = screen.getAllByRole('button');
      expect(visibles).toHaveLength(1);
      await userEvent.click(visibles[0]);
      expect(onClick).toHaveBeenCalledWith(record);
    });

    it('extra deshabilitada no dispara onClick', async () => {
      const onClick = vi.fn();
      renderWithProviders(
        <TableActions
          record={record}
          navigate={vi.fn()}
          extraActions={[{ key: 'a', icon, permiso: 'docentes.ver', accion: 'DETALLE', disabled: true, onClick }]}
        />,
        { auth: { permisos: [permiso('docentes.ver', 'DETALLE')] } },
      );
      const [boton] = screen.getAllByRole('button');
      expect(boton).toBeDisabled();
      await userEvent.click(boton);
      expect(onClick).not.toHaveBeenCalled();
    });
  });

  describe('eliminar', () => {
    it('pide confirmación, elimina por id y recarga la lista', async () => {
      const deleteFn = vi.fn().mockResolvedValue({ success: true });
      const refetch = vi.fn();
      renderWithProviders(
        <TableActions
          record={record}
          navigate={vi.fn()}
          deleteFn={deleteFn}
          refetch={refetch}
          itemName="el docente Ana"
          permisos={permisosProp}
        />,
        { auth: { permisos: todos } },
      );

      await userEvent.click(porIcono('delete'));
      expect(deleteFn).not.toHaveBeenCalled(); // aún sin confirmar
      expect(await screen.findByRole('dialog')).toHaveTextContent('Confirmar eliminación');

      await userEvent.click(screen.getByRole('button', { name: 'Eliminar' }));
      await waitFor(() => expect(deleteFn).toHaveBeenCalledWith(7));
      await waitFor(() => expect(refetch).toHaveBeenCalledTimes(1));
    });

    it('cancelar no elimina', async () => {
      const deleteFn = vi.fn();
      renderWithProviders(
        <TableActions record={record} navigate={vi.fn()} deleteFn={deleteFn} permisos={permisosProp} />,
        { auth: { permisos: todos } },
      );

      await userEvent.click(porIcono('delete'));
      await userEvent.click(await screen.findByRole('button', { name: 'Cancelar' }));
      expect(deleteFn).not.toHaveBeenCalled();
    });

    it('si el borrado falla no recarga y muestra el error', async () => {
      const deleteFn = vi.fn().mockResolvedValue({ success: false, error: 'Tiene asignaciones' });
      const refetch = vi.fn();
      renderWithProviders(
        <TableActions
          record={record}
          navigate={vi.fn()}
          deleteFn={deleteFn}
          refetch={refetch}
          permisos={permisosProp}
        />,
        { auth: { permisos: todos } },
      );

      await userEvent.click(porIcono('delete'));
      await userEvent.click(await screen.findByRole('button', { name: 'Eliminar' }));
      expect(await screen.findByText('Tiene asignaciones')).toBeInTheDocument();
      expect(refetch).not.toHaveBeenCalled();
    });

    it('con useCaseKey resuelve el caso de uso del container y lo ejecuta', async () => {
      const ejecutar = vi.fn().mockResolvedValue({ success: true });
      resolve.mockReturnValue({ ejecutar });
      renderWithProviders(
        <TableActions record={record} navigate={vi.fn()} useCaseKey="eliminarDocente" permisos={permisosProp} />,
        { auth: { permisos: todos } },
      );

      await userEvent.click(porIcono('delete'));
      await userEvent.click(await screen.findByRole('button', { name: 'Eliminar' }));
      await waitFor(() => expect(ejecutar).toHaveBeenCalledWith(7));
      expect(resolve).toHaveBeenCalledWith('eliminarDocente');
    });

    it('useCaseKey inexistente muestra el botón eliminar deshabilitado', () => {
      resolve.mockImplementation(() => {
        throw new Error('no registrado');
      });
      vi.spyOn(console, 'warn').mockImplementation(() => {});
      renderWithProviders(
        <TableActions record={record} navigate={vi.fn()} useCaseKey="noExiste" permisos={permisosProp} />,
        { auth: { permisos: todos } },
      );

      expect(porIcono('delete')).toBeDisabled();
    });

    it('sin permiso ELIMINAR no se ofrece aunque haya deleteFn', () => {
      renderWithProviders(
        <TableActions record={record} navigate={vi.fn()} deleteFn={vi.fn()} permisos={permisosProp} />,
        { auth: { permisos: [permiso('docentes.ver', 'DETALLE')] } },
      );
      expect(porIcono('delete')).not.toBeInTheDocument();
    });
  });
});
