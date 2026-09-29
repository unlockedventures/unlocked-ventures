export function AdminLogo() {
  return (
    <a href="/" className="uv-login-logo" aria-label="Unlocked Ventures">
      <img className="uv-login-logo__mark" src="/brand/brand-logo.svg" alt="" width={115} height={117} />
      <img
        className="uv-login-logo__mark uv-login-logo__on-dark"
        src="/brand/brand-logo-on-dark.svg"
        alt=""
        width={115}
        height={117}
      />
      <img
        className="uv-login-logo__word"
        src="/brand/unlocked-ventures-wordmark.svg"
        alt=""
        width={154}
        height={15}
      />
      <img
        className="uv-login-logo__word uv-login-logo__on-dark"
        src="/brand/unlocked-ventures-wordmark-on-dark.svg"
        alt=""
        width={154}
        height={15}
      />
    </a>
  )
}
