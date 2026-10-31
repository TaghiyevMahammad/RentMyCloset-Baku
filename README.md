# RentMyCloset

**Wear it once. Share it forever.**
A local marketplace that connects people who own occasion outfits with people in the same city who need one for a single event. It starts in 8 cities across Azerbaijan (Baku, Sumgait, Ganja, Mingachevir, Shaki, Gabala, Lankaran, Nakhchivan), and adding a city is one line in `js/utils.js`.

This is the MVP website for our Introduction to Entrepreneurship group project.

## Run it on your computer

You need [Node.js](https://nodejs.org) 18 or newer.

```bash
npm install      # first time only: downloads Vite into node_modules/
npm run dev      # starts the site at http://localhost:5173 and opens your browser
```

The page reloads by itself when you save a file. Press `Ctrl + C` in the terminal to stop (answer `Y` if asked).

| Command | What it does |
|---|---|
| `npm install` | Installs the tools (run once, and again after pulling changes to `package.json`) |
| `npm run dev` | Development server with auto-reload: **use this while working** |
| `npm run dev:phone` | Same, but also reachable from your phone on the same Wi-Fi (open the "Network" address it prints) |
| `npm run stop` | Force-stops a leftover server if you see "Port 5173 is already in use" |
| `npm run build` | Makes an optimised version of the site in `dist/` for hosting (Netlify, GitHub Pages...) |
| `npm run preview` | Opens the `dist/` build at http://localhost:4173 to check it before publishing |
| `npm start` | Backup server with no install needed (no auto-reload) |

> Opening `index.html` by double-clicking will not work, because browsers block JavaScript modules on `file://`. Always use one of the commands above.

## Demo accounts

All passwords are `demo1234`. On the login page you can also log in with one click.

| Account | Email | What to try |
|---|---|---|
| Aysel (renter) | aysel@demo.az | Browse, save, request dates, see upcoming rentals, leave reviews |
| Leyla (owner) | leyla@demo.az | Approve or decline requests, confirm pickup and return, list outfits |
| Elegance Dress Hire (salon) | salon@demo.az | A salon with many listings |
| Team (admin) | team@rentmycloset.az | Admin panel: pilot goals, commission settings, all bookings and users |

Use **Account menu → Switch demo account** to jump between sides of the marketplace.
**Reset demo data** in the footer restores everything.

## Features

- **Browse and filter** by event, size, category, price, pickup area and available dates
- **Item page** with photo gallery, availability calendar (booked days and a cleaning gap are blocked) and a full price breakdown
- **Booking flow**: Request → Owner OK → Pickup → Return, matching the report
  - Contact details are shared only after the owner approves
  - Condition photos and ID check at pickup
  - Deposit returned, or partly kept if there is damage
  - Two-way reviews after return
- **List an outfit** with photo upload, price suggestion (25–35% of retail for a 2-day rental), live preview and earnings estimate
- **Dashboard**: rentals, requests with one-click approve, listings (edit, pause, delete), saved items, profile
- **Public profiles** with ratings and reviews
- **Admin panel**: pilot goals (30 items, 20 rentals/month), commission 10% → 15% switch, cleaning fee, tables, JSON export
- Fully responsive (phone, tablet, desktop)

## Project structure

```
index.html              page shell
css/styles.css          all styles (brand colours: navy #1F2440, rose #D6336C, blush #FCE8EF)
js/app.js               starts the app and lists all routes
js/store.js             THE DATA LAYER: every read/write goes through here
js/seed.js              demo data
js/utils.js             constants (events, sizes, areas) and helpers
js/ui.js                icons, logo, illustrations, cards, toasts, pop-ups
js/router.js            page navigation (#/browse, #/item/123...)
js/layout.js            header and footer
js/components/          calendar, photo uploader
js/pages/               one file per page
server.js               tiny local web server
```

## Important: where the data lives right now

In this MVP, all data is saved **in your own browser** (localStorage). Your friend opening the site on another phone will not see your listings. This is fine for demos and the pitch. For real users, connect a database (next steps below).
