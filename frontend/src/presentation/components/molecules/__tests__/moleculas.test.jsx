import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import ResumenDato from '../ResumenDato';
import DetailInfoCard from '../DetailInfoCard';
import DetailRelatedList from '../DetailRelatedList';
import DetailTabLabel from '../DetailTabLabel';
import ListPanelHeader from '../ListPanelHeader';
import PageHeader from '../PageHeader';
import TableCell from '../TableCell';
import DataList from '../DataList';

describe('ResumenDato', () => {
  it('muestra etiqueta y valor', () => {
    render(<ResumenDato label="CI" value="1234567" />);
    expect(screen.getByText('CI')).toBeInTheDocument();
    expect(screen.getByText('1234567')).toBeInTheDocument();
  });

  it('sin valor no renderiza nada', () => {
    const { container } = render(<ResumenDato label="CI" value="" />);
    expect(container).toBeEmptyDOMElement();
  });
});

describe('DetailInfoCard', () => {
  it('muestra título, extra y contenido; aplica columnas', () => {
    const { container } = render(
      <DetailInfoCard title="Datos personales" extra={<button type="button">Editar</button>} cols={3}>
        <p>contenido</p>
      </DetailInfoCard>,
    );
    expect(screen.getByText('Datos personales')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Editar' })).toBeInTheDocument();
    expect(screen.getByText('contenido')).toBeInTheDocument();
    expect(container.querySelector('.sd-card__body--cols-3')).toBeInTheDocument();
  });

  it('sin extra no renderiza su contenedor', () => {
    const { container } = render(<DetailInfoCard title="Solo título">x</DetailInfoCard>);
    expect(container.querySelector('.sd-card__extra')).toBeNull();
  });
});

describe('DetailRelatedList', () => {
  it('vacío: muestra el texto por defecto o el personalizado', () => {
    const { rerender } = render(<DetailRelatedList items={[]} />);
    expect(screen.getByText('Sin registros relacionados')).toBeInTheDocument();
    rerender(<DetailRelatedList items={[]} emptyText="Sin materias" />);
    expect(screen.getByText('Sin materias')).toBeInTheDocument();
  });

  it('ítems con onClick son enlaces accionables; sin onClick, texto', async () => {
    const onClick = vi.fn();
    render(
      <DetailRelatedList
        items={[
          { key: 1, label: 'Programación I', caption: 'Paralelo A', onClick },
          { key: 2, label: 'Bases de datos' },
        ]}
      />,
    );
    await userEvent.click(screen.getByText('Programación I'));
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(screen.getByText('Paralelo A')).toBeInTheDocument();
    expect(screen.getByText('Bases de datos')).toBeInTheDocument();
  });
});

describe('DetailTabLabel', () => {
  it('muestra icono y texto', () => {
    render(<DetailTabLabel icon={<i data-testid="ico" />}>Resumen</DetailTabLabel>);
    expect(screen.getByTestId('ico')).toBeInTheDocument();
    expect(screen.getByText('Resumen')).toBeInTheDocument();
  });
});

describe('ListPanelHeader', () => {
  it('título como encabezado y acciones opcionales', () => {
    const { rerender } = render(<ListPanelHeader title="Listado de docentes" />);
    expect(screen.getByRole('heading', { level: 4, name: 'Listado de docentes' })).toBeInTheDocument();
    rerender(<ListPanelHeader title="Listado" actions={<button type="button">Nuevo</button>} />);
    expect(screen.getByRole('button', { name: 'Nuevo' })).toBeInTheDocument();
  });
});

describe('PageHeader', () => {
  it('título como h3, acciones y migas de pan', () => {
    render(
      <MemoryRouter>
        <PageHeader
          title="Plantel docente"
          actions={<button type="button">Registrar</button>}
          breadcrumbItems={[{ title: 'Docentes' }, { title: 'Listado' }]}
        />
      </MemoryRouter>,
    );
    expect(screen.getByRole('heading', { level: 3, name: 'Plantel docente' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Registrar' })).toBeInTheDocument();
    expect(screen.getByText('Docentes')).toBeInTheDocument();
  });

  it('sin acciones ni migas solo muestra el título', () => {
    render(
      <MemoryRouter>
        <PageHeader title="Solo título" />
      </MemoryRouter>,
    );
    expect(screen.getByRole('heading', { name: 'Solo título' })).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});

describe('TableCell', () => {
  it('texto principal con subtexto', () => {
    render(<TableCell subtext="CI 123">PÉREZ ANA</TableCell>);
    expect(screen.getByText('PÉREZ ANA')).toBeInTheDocument();
    expect(screen.getByText('CI 123')).toBeInTheDocument();
  });

  it('sin contenido usa el fallback (N/A por defecto)', () => {
    const { rerender } = render(<TableCell>{null}</TableCell>);
    expect(screen.getByText('N/A')).toBeInTheDocument();
    rerender(<TableCell fallback="Sin dato">{''}</TableCell>);
    expect(screen.getByText('Sin dato')).toBeInTheDocument();
  });

  it('con tag lo muestra', () => {
    render(<TableCell tag="Activo">Ana</TableCell>);
    expect(screen.getByText('Activo')).toBeInTheDocument();
  });

  it('actions renderiza los hijos tal cual (botones)', () => {
    render(
      <TableCell actions>
        <button type="button">Ver</button>
      </TableCell>,
    );
    expect(screen.getByRole('button', { name: 'Ver' })).toBeInTheDocument();
  });
});

describe('DataList (estados)', () => {
  const renderItem = (item) => ({ title: item.nombre });

  it('cargando: skeleton accesible y sin ítems', () => {
    render(<DataList loading loadingText="Cargando estudiantes" data={[{ id: 1, nombre: 'Ana' }]} renderItem={renderItem} />);
    expect(screen.getByLabelText('Cargando estudiantes')).toHaveAttribute('aria-busy', 'true');
    expect(screen.queryByText('Ana')).not.toBeInTheDocument();
  });

  it('vacío: título, mensaje y acción', () => {
    render(
      <DataList
        data={[]}
        renderItem={renderItem}
        emptyTitle="Sin estudiantes"
        emptyMessage="Aún no hay inscritos"
        emptyAction={<button type="button">Inscribir</button>}
      />,
    );
    expect(screen.getByText('Sin estudiantes')).toBeInTheDocument();
    expect(screen.getByText('Aún no hay inscritos')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Inscribir' })).toBeInTheDocument();
  });

  it('error: variante visual de error en el estado vacío', () => {
    const { container } = render(<DataList data={[]} status="error" emptyMessage="Falló la carga" renderItem={renderItem} />);
    expect(screen.getByText('Falló la carga')).toBeInTheDocument();
    expect(container.querySelector('.data-list__empty--error')).toBeInTheDocument();
  });

  it('con datos: renderiza ítems y notifica la selección', async () => {
    const onSelect = vi.fn();
    const data = [
      { id: 1, nombre: 'Ana' },
      { id: 2, nombre: 'Luis' },
    ];
    render(<DataList data={data} renderItem={renderItem} onSelect={onSelect} />);
    await userEvent.click(screen.getByText('Luis'));
    expect(onSelect).toHaveBeenCalledWith(data[1], 1);
  });

  it('grupos: omite los grupos vacíos y muestra los títulos', () => {
    render(
      <DataList
        renderItem={renderItem}
        groups={[
          { key: 'a', title: 'Nuevos', items: [{ id: 1, nombre: 'Ana' }] },
          { key: 'b', title: 'Antiguos', items: [] },
        ]}
      />,
    );
    expect(screen.getByText('Nuevos')).toBeInTheDocument();
    expect(screen.queryByText('Antiguos')).not.toBeInTheDocument();
  });
});
