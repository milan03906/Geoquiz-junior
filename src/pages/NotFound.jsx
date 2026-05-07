import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <section>
      <h1>404</h1>
      <p>Stranica nije pronađena.</p>
      <Link to="/">Nazad na početnu</Link>
    </section>
  );
}