import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import DocenteColorBar from '../DocenteColorBar';
import DocenteHorarioBloqueRow from '../DocenteHorarioBloqueRow';
import DocenteCargaCell from '../DocenteCargaCell';
import DocenteCargaHorariaCell from '../DocenteCargaHorariaCell';
import DocenteReferenciaCell from '../DocenteReferenciaCell';

describe('DocenteColorBar', () => {
  it('no renderiza nada con un hex inválido', () => {
    const { container } = render(<DocenteColorBar hex="rojo" />);
    expect(container).toBeEmptyDOMElement();
  });

  it('acepta hex con o sin # y aplica el color', () => {
    const { container } = render(<DocenteColorBar hex="3498DB" title="Color" />);
    const barra = container.querySelector('.docente-color-bar');
    expect(barra).toHaveAttribute('style', expect.stringContaining('rgb(52, 152, 219)'));
    expect(barra).toHaveAttribute('title', 'Color');
  });
});

describe('DocenteHorarioBloqueRow', () => {
  it('muestra día, hora recortada a HH:MM, aula, turno y tipo', () => {
    render(
      <DocenteHorarioBloqueRow
        bloque={{ dia: 'Lunes', horaInicio: '08:00:00', horaFin: '09:30:00', aula: 'A-1', turno: 'NOCHE', tipoHorario: 'TEORIA' }}
      />,
    );
    expect(screen.getByText('Lunes')).toBeInTheDocument();
    expect(screen.getByText(/08:00 – 09:30/)).toBeInTheDocument();
    expect(screen.getByText(/A-1/)).toBeInTheDocument();
    expect(screen.getByText(/Turno NOCHE/)).toBeInTheDocument();
    expect(screen.getByText('TEORIA')).toBeInTheDocument();
  });

  it('sin datos muestra guion y omite la hora', () => {
    render(<DocenteHorarioBloqueRow bloque={{}} />);
    expect(screen.getByText('—')).toBeInTheDocument();
  });
});

describe('DocenteCargaCell', () => {
  it('sin asignaciones muestra "Sin materias"', () => {
    render(<DocenteCargaCell />);
    expect(screen.getByText('Sin materias')).toBeInTheDocument();
  });

  it('singulariza y pluraliza materias y paralelos', () => {
    const { rerender } = render(<DocenteCargaCell hasAsignaciones totalMaterias={1} totalParalelos={1} />);
    expect(screen.getByText('1 materia')).toBeInTheDocument();
    expect(screen.getByText('1 paralelo')).toBeInTheDocument();
    rerender(<DocenteCargaCell hasAsignaciones totalMaterias={3} totalParalelos={2} />);
    expect(screen.getByText('3 materias')).toBeInTheDocument();
    expect(screen.getByText('2 paralelos')).toBeInTheDocument();
  });
});

describe('DocenteCargaHorariaCell', () => {
  it('sin color ni límites muestra guion', () => {
    render(<DocenteCargaHorariaCell />);
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('muestra límites semanal y mensual y el color del docente', () => {
    render(<DocenteCargaHorariaCell colorHex="#112233" maxHorasSemana={20} maxHorasMes="80" />);
    expect(screen.getByText('20 h / semana')).toBeInTheDocument();
    expect(screen.getByText('80 h / mes')).toBeInTheDocument();
    expect(screen.getByLabelText('Color del docente #112233')).toBeInTheDocument();
  });

  it('ignora límites no numéricos', () => {
    render(<DocenteCargaHorariaCell maxHorasSemana="abc" />);
    expect(screen.getByText('—')).toBeInTheDocument();
  });
});

describe('DocenteReferenciaCell', () => {
  it('sin datos muestra guion', () => {
    render(<DocenteReferenciaCell />);
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('prefiere el celular al teléfono y muestra género y correo', () => {
    render(<DocenteReferenciaCell genero="FEMENINO" celular=" 7000 " telefono="2222" emailPersonal="a@b.com" />);
    expect(screen.getByText('Femenino')).toBeInTheDocument();
    expect(screen.getByText('7000')).toBeInTheDocument();
    expect(screen.queryByText('2222')).not.toBeInTheDocument();
    expect(screen.getByText('a@b.com')).toBeInTheDocument();
  });

  it('usa el teléfono fijo si no hay celular', () => {
    render(<DocenteReferenciaCell telefono="2222" />);
    expect(screen.getByText('2222')).toBeInTheDocument();
  });
});
