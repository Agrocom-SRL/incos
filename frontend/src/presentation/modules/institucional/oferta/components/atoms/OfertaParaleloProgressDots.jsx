const OfertaParaleloProgressDots = ({ dotClassNames = [] }) => (
  <div className="opc-dots" aria-hidden>
    {dotClassNames.map((className, idx) => (
      <span key={`opc-dot-${idx}`} className={className} />
    ))}
  </div>
);

export default OfertaParaleloProgressDots;
