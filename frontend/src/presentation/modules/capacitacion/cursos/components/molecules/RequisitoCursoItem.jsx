/**
 * Molécula: fila de un requisito de inscripción en la ficha del curso (CAP).
 *
 * Mismo diseño que la lista de documentos del estudiante: icono, nombre y pills
 * de estado a la derecha. Indica si el requisito es obligatorio y si acredita el
 * pago del costo del curso (depósito a la entidad certificadora).
 */

import { FileOutlined } from '@ant-design/icons';
import { StatusPill } from '@atoms';
import '../../styles/requisito-curso-item.css';

const RequisitoCursoItem = ({ requisito }) => (
  <div className="requisito-curso-item">
    <div className="requisito-curso-item__icon">
      <FileOutlined />
    </div>
    <div className="requisito-curso-item__main">
      <p className="requisito-curso-item__name">{requisito.descripcion}</p>
      {requisito.acreditaPagoCurso ? (
        <p className="requisito-curso-item__hint">
          Al entregarse, el costo del curso queda pagado a la entidad certificadora.
        </p>
      ) : null}
    </div>
    <div className="requisito-curso-item__pills">
      <StatusPill
        label={requisito.obligatorio ? 'Obligatorio' : 'Opcional'}
        className={`cfg-materia-pill ${
          requisito.obligatorio ? 'cfg-materia-pill--warning' : 'cfg-materia-pill--default'
        }`}
      />
      {requisito.acreditaPagoCurso ? (
        <StatusPill label="Acredita pago del curso" className="cfg-materia-pill cfg-materia-pill--success" />
      ) : null}
    </div>
  </div>
);

export default RequisitoCursoItem;
