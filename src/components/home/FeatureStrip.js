function FeatureStrip({ items }) {
  return (
    <section className="feature-strip" aria-label="Rental benefits">
      {items.map((item) => (
        <article className="feature-strip__item" key={item.id}>
          <span className="feature-strip__icon">
            <img src={item.icon} alt="" aria-hidden="true" />
          </span>
          <span>
            <strong>{item.title}</strong>
            <small>{item.description}</small>
          </span>
        </article>
      ))}
    </section>
  );
}

export default FeatureStrip;
