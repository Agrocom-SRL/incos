import OfertaParaleloProgressDots from '../atoms/OfertaParaleloProgressDots';

const OfertaParaleloCardBand = ({ band, estado, estadoPillClass, dots }) => (
  <div className={band.bandClass}>
    <div className="opc-band__top">
      <span className="opc-band__carrera">{band.carreraPeriodo}</span>
      <span className={estadoPillClass}>{estado}</span>
    </div>
    <h3 className="opc-band__nombre">{band.nombre}</h3>
    <p className="opc-band__sub">{band.subtitulo}</p>
    <OfertaParaleloProgressDots dotClassNames={dots} />
  </div>
);

export default OfertaParaleloCardBand;
