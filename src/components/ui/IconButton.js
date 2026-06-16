import { Link } from 'react-router-dom';

function IconButton({ label, icon, to, className = '' }) {
  const content = <img src={icon} alt="" aria-hidden="true" />;
  const classes = `icon-button ${className}`.trim();

  if (to) {
    return (
      <Link className={classes} to={to} aria-label={label}>
        {content}
      </Link>
    );
  }

  return (
    <button className={classes} type="button" aria-label={label}>
      {content}
    </button>
  );
}

export default IconButton;
