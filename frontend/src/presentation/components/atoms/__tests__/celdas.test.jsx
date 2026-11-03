import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import StatusPill from '../StatusPill';
import DetailField from '../DetailField';
import IdentidadCelda from '../IdentidadCelda';
import InfoLinesCell from '../InfoLinesCell';
import TruncatedTextCell from '../TruncatedTextCell';
import CompromisoAlertTag from '../CompromisoAlertTag';
import {
  formatFechaCompromiso,
  compromisoSortValue,
  resolverCompromisoEstado,
} from '../compromisoAlerta';

describe('StatusPill', () => {
  it('muestra la etiqueta con la clase indicada', () => {
    render(<StatusPill label="Vigente" className="pill pill--ok" />);
    expect(screen.getByText('Vigente')).toHaveClass('pill', 'pill--ok');
  });

  it('sin etiqueta muestra un guion (estado vacío)', () => {
    render(<StatusPill label="" />);
    expect(screen.getByText('—')).toBeInTheDocument();
  });
});

describe('DetailField', () => {
  it('muestra etiqueta y valor', () => {
    render(<DetailField label="CI">1234567</DetailField>);
    expect(screen.getByText('CI')).toBeInTheDocument();
    expect(screen.getByText('1234567')).toBeInTheDocument();
  });

  it('sin valor muestra un guion', () => {
    render(<DetailField label="Correo" />);
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('aplica la clase de span', () => {
    const { container } = render(<DetailField label="X" span={2}>y</DetailField>);
    expect(container.firstChild).toHaveClass('sd-field--span-2');
  });
});

describe('IdentidadCelda', () => {
  it('muestra sigla y nombre', () => {
    render(<IdentidadCelda codigo="INF-101" nombre="Programación" />);
    expect(screen.getByText('INF-101')).toBeInTheDocument();
    expect(screen.getByText('Programación')).toBeInTheDocument();
  });

  it('sin código omite la sigla y sin nombre usa guion', () => {
    render(<IdentidadCelda />);
    expect(screen.getByText('—')).toBeInTheDocument();
  });
});

describe('InfoLinesCell', () => {
  it('renderiza solo las líneas con etiqueta', () => {
    render(
      <InfoLinesCell
        lines={[
          { key: 'a', label: 'Turno noche' },
          { key: 'b', label: '' },
          { key: 'c', label: null },
          { key: 'd', label: 'Aula 4' },
        ]}
      />,
    );
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
    expect(screen.getByText('Aula 4')).toBeInTheDocument();
  });

  it('sin líneas válidas muestra un guion', () => {
    render(<InfoLinesCell lines={[{ label: '' }]} />);
    expect(screen.getAllByRole('listitem')).toHaveLength(1);
    expect(screen.getByText('—')).toBeInTheDocument();
  });
});

describe('TruncatedTextCell', () => {
  it('expone el texto completo como title', () => {
    render(<TruncatedTextCell text="Descripción larga" />);
    expect(screen.getByText('Descripción larga')).toHaveAttribute('title', 'Descripción larga');
  });

  it('sin texto usa el emptyLabel', () => {
    render(<TruncatedTextCell emptyLabel="Sin descripción" />);
    expect(screen.getByText('Sin descripción')).toBeInTheDocument();
  });
});

describe('compromisoAlerta (utils)', () => {
  it('formatFechaCompromiso: YYYY-MM-DD → DD/MM/YYYY, vacío → guion, inválido tal cual', () => {
    expect(formatFechaCompromiso('2026-03-09')).toBe('09/03/2026');
    expect(formatFechaCompromiso('2026-03-09T00:00:00.000Z')).toBe('09/03/2026');
    expect(formatFechaCompromiso(null)).toBe('—');
    expect(formatFechaCompromiso('texto')).toBe('texto');
  });

  it('resolverCompromisoEstado: CUMPLIDO gana sobre la alerta', () => {
    expect(resolverCompromisoEstado({ estado: 'CUMPLIDO', alerta: 'VENCIDA' })).toEqual({
      color: 'default',
      label: 'Cumplido',
      icon: 'cumplido',
    });
  });

  it('resolverCompromisoEstado: vencida con días de atraso', () => {
    expect(resolverCompromisoEstado({ estado: 'VIGENTE', alerta: 'VENCIDA', diasAtraso: 5 })).toMatchObject({
      color: 'error',
      label: 'Vencida · 5d',
    });
    // INCUMPLIDO sin días: sin sufijo
    expect(resolverCompromisoEstado({ estado: 'INCUMPLIDO', diasAtraso: 0 }).label).toBe('Vencida');
  });

  it('resolverCompromisoEstado: próxima y al día', () => {
    expect(resolverCompromisoEstado({ estado: 'VIGENTE', alerta: 'PROXIMA' }).color).toBe('warning');
    expect(resolverCompromisoEstado({ estado: 'VIGENTE', alerta: 'AL_DIA' })).toMatchObject({
      color: 'success',
      label: 'Al día',
    });
  });

  it('compromisoSortValue: vencida primero, sin compromiso al final', () => {
    const vencida = compromisoSortValue({ estado: 'VIGENTE', alerta: 'VENCIDA' });
    const proxima = compromisoSortValue({ estado: 'VIGENTE', alerta: 'PROXIMA' });
    const alDia = compromisoSortValue({ estado: 'VIGENTE', alerta: 'AL_DIA' });
    const cumplido = compromisoSortValue({ estado: 'CUMPLIDO' });
    const ninguno = compromisoSortValue(null);
    expect([vencida, proxima, alDia, cumplido, ninguno]).toEqual(
      [...[vencida, proxima, alDia, cumplido, ninguno]].sort((a, b) => a - b),
    );
    expect(ninguno).toBeGreaterThan(cumplido);
  });
});

describe('CompromisoAlertTag', () => {
  it('sin compromiso muestra un guion', () => {
    render(<CompromisoAlertTag compromiso={null} />);
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('muestra la etiqueta resuelta', () => {
    render(<CompromisoAlertTag compromiso={{ estado: 'VIGENTE', alerta: 'VENCIDA', diasAtraso: 3 }} />);
    expect(screen.getByText('Vencida · 3d')).toBeInTheDocument();
  });

  it('icon=false oculta el ícono', () => {
    const { container } = render(
      <CompromisoAlertTag compromiso={{ estado: 'VIGENTE', alerta: 'AL_DIA' }} icon={false} />,
    );
    expect(screen.getByText('Al día')).toBeInTheDocument();
    expect(container.querySelector('.anticon')).toBeNull();
  });
});
