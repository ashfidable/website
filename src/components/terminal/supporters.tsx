import supporters from "$content/supporters.json";

export function Supporters() {
  return (
    <div className="max-w-sm">
      <p className="text-site-heading">Thanks for the coffee.</p>
      {supporters.length > 0 && (
        <ul aria-label="Supporters" className="mt-4 grid gap-1">
          {supporters.map(({ name }) => (
            <li key={name} className="[overflow-wrap:anywhere]">
              {name}
            </li>
          ))}
        </ul>
      )}
      <p className="mt-4 text-sm text-site-muted">
        Plus everyone who supported anonymously.
      </p>
    </div>
  );
}
