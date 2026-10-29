function Ghost() {
  return (
    <svg viewBox="0 0 80 96" fill="none" focusable="false">
      <path
        d="M12 80V38a28 28 0 0 1 56 0v42q-7-12-14 0-7 12-14 0-7-12-14 0-7 12-14 0Z"
        fill="#f2e8da"
      />
      <ellipse cx="30" cy="40" rx="3.5" ry="5" fill="#291d35" />
      <ellipse cx="50" cy="40" rx="3.5" ry="5" fill="#291d35" />
      <path d="M35 52q5 7 10 0" stroke="#291d35" strokeWidth="3" strokeLinecap="round" />
      <ellipse cx="23" cy="50" rx="5" ry="3" fill="#ff9b45" opacity=".55" />
      <ellipse cx="57" cy="50" rx="5" ry="3" fill="#ff9b45" opacity=".55" />
    </svg>
  );
}

function Bat() {
  return (
    <svg viewBox="0 0 100 64" fill="none" focusable="false">
      <g className="halloween-bat-wings" fill="#c49aef">
        <path d="M46 29Q25 5 4 12q8 10 2 26 14-7 18 7 13-5 22 4Z" />
        <path d="M54 29Q75 5 96 12q-8 10-2 26-14-7-18 7-13-5-22 4Z" />
      </g>
      <path d="m40 27 1-16 9 9 9-9 1 16q9 25-10 28-19-3-10-28Z" fill="#ab7dd8" />
      <circle cx="46" cy="32" r="2" fill="#f2e8da" />
      <circle cx="54" cy="32" r="2" fill="#f2e8da" />
      <path d="m47 40 3 3 3-3" stroke="#291d35" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function Pumpkin() {
  return (
    <svg viewBox="0 0 80 80" fill="none" focusable="false">
      <path d="M40 23q-4-13 6-16" stroke="#b8d975" strokeWidth="6" strokeLinecap="round" />
      <ellipse cx="40" cy="46" rx="33" ry="27" fill="#ff9b45" />
      <ellipse cx="40" cy="46" rx="18" ry="27" stroke="#ce622a" strokeWidth="2" />
      <path d="m22 42 8-9 5 11Zm23 2 5-11 8 9ZM26 52q14 18 28 0l-9 4-5-4-5 4Z" fill="#291d35" />
    </svg>
  );
}

/** CSS ties visibility to the saved theme before React hydrates. */
export function HalloweenBackground() {
  return (
    <div className="halloween-background" aria-hidden="true">
      <span className="halloween-friend halloween-ghost-one">
        <Ghost />
      </span>
      <span className="halloween-friend halloween-bat-one">
        <Bat />
      </span>
      <span className="halloween-friend halloween-ghost-two">
        <Ghost />
      </span>
      <span className="halloween-friend halloween-bat-two">
        <Bat />
      </span>
      <span className="halloween-friend halloween-pumpkin">
        <Pumpkin />
      </span>
    </div>
  );
}
