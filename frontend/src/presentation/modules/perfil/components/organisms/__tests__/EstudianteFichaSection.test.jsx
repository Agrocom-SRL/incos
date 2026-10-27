/**
 * EstudianteFichaSection: ficha de solo lectura del estudiante autenticado en "Mi perfil".
 */
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import EstudianteFichaSection from '../EstudianteFichaSection.jsx';

const misDatos = {
  student: {
    studentCode: 'E-100',
    ci: '1234567',
    expedition: 'SC',
    bloodType: 'O+',
    firstName: 'Juan Carlos',
    lastName: 'Pérez',
    motherLastName: 'Gómez',
    birthDate: '2000-05-01',
    gender: 'M',
    estadoCivilNombre: 'Soltero',
    personalEmail: 'juan@correo.com',
    mobilePhone: '70000000',
    zone: 'Centro',
    address: 'Calle 1',
    residenceMunicipalityName: 'Santa Cruz',
    residenceDepartmentName: 'Santa Cruz de la Sierra',
  },
  guardians: [
    { id: 1, firstName: 'María', lastName: 'Gómez', relationshipTypeName: 'Madre', cellphone1: '71111111', email: 'maria@correo.com' },
    { id: 2, nombres: 'Pedro', apellidoPaterno: 'Pérez', parentesco: 'Padre', celular: '72222222' },
    {},
  ],
  academicData: {
    tipoAdmision: 'Regular',
    career: { code: 'SIS', name: 'Sistemas' },
    management: { name: 'Gestión 2023' },
  },
};

describe('EstudianteFichaSection', () => {
  it('cargando muestra el indicador y no la ficha', () => {
    const { container } = render(<EstudianteFichaSection loading />);
    expect(container.querySelector('.ant-spin-spinning')).not.toBeNull();
    expect(screen.getByText('Cargando sus datos…')).toBeInTheDocument();
  });

  it('error muestra la advertencia con el detalle', () => {
    render(<EstudianteFichaSection error="Sin conexión" />);
    expect(screen.getByText('No se pudieron cargar sus datos')).toBeInTheDocument();
    expect(screen.getByText('Sin conexión')).toBeInTheDocument();
  });

  it('sin estudiante muestra el vacío', () => {
    const { rerender } = render(<EstudianteFichaSection misDatos={null} />);
    expect(screen.getByText('No se encontró su ficha de estudiante.')).toBeInTheDocument();
    rerender(<EstudianteFichaSection misDatos={{ guardians: [] }} />);
    expect(screen.getByText('No se encontró su ficha de estudiante.')).toBeInTheDocument();
  });

  it('muestra los datos personales con CI completa, residencia y nombre completo', () => {
    render(<EstudianteFichaSection misDatos={misDatos} />);
    expect(screen.getByText('Datos personales')).toBeInTheDocument();
    expect(screen.getByText('E-100')).toBeInTheDocument();
    expect(screen.getByText('1234567 SC')).toBeInTheDocument();
    expect(screen.getByText('Santa Cruz, Santa Cruz de la Sierra')).toBeInTheDocument();
    expect(screen.getByText('juan@correo.com')).toBeInTheDocument();
    expect(screen.getByText('Soltero')).toBeInTheDocument();
    // Nombre completo: apellidos primero, nombres al final.
    expect(screen.getByText('Pérez Gómez Juan Carlos')).toBeInTheDocument();
  });

  it('datos faltantes se ven como guion', () => {
    render(<EstudianteFichaSection misDatos={{ student: { firstName: 'Ana' } }} />);
    expect(screen.getAllByText('—').length).toBeGreaterThan(8);
    expect(screen.queryByText('Datos académicos')).not.toBeInTheDocument();
  });

  it('datos académicos con carrera, tipo de admisión y gestión', () => {
    render(<EstudianteFichaSection misDatos={misDatos} />);
    expect(screen.getByText('Datos académicos')).toBeInTheDocument();
    expect(screen.getByText('SIS — Sistemas')).toBeInTheDocument();
    expect(screen.getByText('Regular')).toBeInTheDocument();
    expect(screen.getByText('Gestión 2023')).toBeInTheDocument();
  });

  it('datos académicos desde la inscripción y con ids de reserva', () => {
    render(
      <EstudianteFichaSection
        misDatos={{
          student: { firstName: 'Ana' },
          inscripcion: { enrollment: { enrollmentType: 'Traspaso' }, career: { name: 'Contaduría' } },
          academicData: { managementId: 7 },
        }}
      />,
    );
    expect(screen.getByText('Traspaso')).toBeInTheDocument();
    expect(screen.getByText('Contaduría')).toBeInTheDocument();
    expect(screen.getByText('ID: 7')).toBeInTheDocument();
  });

  it('lista los contactos con parentesco, celular y correo opcional', () => {
    render(<EstudianteFichaSection misDatos={misDatos} />);
    expect(screen.getByText('Madre')).toBeInTheDocument();
    expect(screen.getByText('71111111')).toBeInTheDocument();
    expect(screen.getByText('maria@correo.com')).toBeInTheDocument();
    expect(screen.getByText('Padre')).toBeInTheDocument();
    expect(screen.getByText('72222222')).toBeInTheDocument();
    expect(screen.getByText('Correo')).toBeInTheDocument();
    expect(screen.getAllByText('Parentesco')).toHaveLength(3);
  });
});
