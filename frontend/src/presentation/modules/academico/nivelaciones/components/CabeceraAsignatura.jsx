/**
 * Cabecera de columna de asignatura de la grilla de Nivelación — sigla en
 * negrita + nombre de la materia, separados por un borde blanco. Sin
 * docente (la grilla de Nivelación no lo trae: es una "foto" del estado
 * actual, no el cuaderno del curso).
 *
 * Duplicado local de `centralizador/components/CabeceraAsignatura.jsx`
 * (módulo autocontenido, ver documento de diseño B0).
 */

import { Tooltip } from 'antd';

const CabeceraAsignatura = ({ sigla, nombre }) => {
  const tooltip = [sigla, nombre].filter(Boolean).join(' — ');
  return (
    <Tooltip title={tooltip} placement="top">
      <span className="niv-nivelacion-grid__asig-head">
        <span className="niv-nivelacion-grid__asig-sigla">{sigla ?? nombre}</span>
        <span className="niv-nivelacion-grid__asig-nombre">{nombre}</span>
      </span>
    </Tooltip>
  );
};

export default CabeceraAsignatura;
