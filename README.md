# GeoQuiz Junior
GeoQuiz Junior je moderna, full-stack web aplikacija dizajnirana da pomogne deci da uče geografiju kroz interaktivne kvizove. Projekat je razvijen sa fokusom na čistu logiku, responzivni dizajn i efikasno upravljanje podacima.

# Tehnologije
Frontend:
React.js (Functional Components, Hooks)

React Router Dom (Navigacija i URL parametri)

Vanilla CSS (Custom dizajn, bez eksternih framework-ova)

Backend (API):
Node.js & Express.js

MongoDB (Mongoose ORM)

REST API arhitektura

# Ključne Funkcionalnosti
Dinamičko filtriranje: Korisnici mogu birati kvizove na osnovu kategorije, težine i razreda.

Tajmer: Implementiran sistem od 10 minuta za rešavanje, sa automatskim slanjem rezultata po isteku vremena.

Map Click Challenge: Specijalni tipovi pitanja koji zahtevaju interakciju sa SVG mapama.

Responzivni "Hamburger" Meni: Potpuno prilagođen navigacioni sistem za mobilne uređaje (desktop-first pristup).

Sistem Rangiranja: Čuvanje pokušaja (attempts) i prikazivanje rezultata.

# Struktura Projekta
/src - React komponente, hook-ovi i logika frontenda.

/api - Node.js backend sa kontrolerima, modelima i rutama.

/public - Statički resursi i SVG geografske mape.

.gitignore - Pravilno konfigurisana zaštita za node_modules i .env fajlove.


# Instalacija i Pokretanje
Klonirajte repozitorijum:

Bash
git clone https://github.com/milan03906/Geoquiz-junior.git
Instalacija zavisnosti (Frontend & Backend):

Bash
# U root folderu
npm install
# U api folderu
cd api && npm install
Pokretanje aplikacije:

Bash
# Pokretanje API-ja (iz /api foldera)
npm start
# Pokretanje Frontenda (iz root foldera)
npm run dev


# Autor: Milan Erić

Junior Front-end Developer