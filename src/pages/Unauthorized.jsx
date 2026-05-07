import { Link } from "react-router-dom";

export default function Unauthorized() {
  return (
    <section>
      <h1>403 - Nemaš pristup</h1>
      <p>Ova stranica je dostupna samo admin korisnicima.</p>
      <Link to="/">Nazad na početnu</Link>
    </section>
  );
}