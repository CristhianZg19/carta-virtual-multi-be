# Carta virtual API

Backend REST para una carta virtual de restaurante con panel administrativo, generacion de QR, autenticacion JWT y modulo opcional de comunidad.

## Stack

- Node.js 21+
- Express
- TypeScript
- MongoDB y Mongoose
- JWT y bcryptjs
- Zod
- qrcode

## Configuracion

Copia `.env.example` a `.env` y ajusta las variables necesarias:

```env
PORT=4000
MONGODB_URI=mongodb://127.0.0.1:27017/restaurant_menu
JWT_SECRET=change-this-secret-before-production
CLIENT_URL=http://localhost:5173
PUBLIC_MENU_URL=http://localhost:5173/menu
```

## Instalacion

```bash
npm install
```

## Desarrollo

```bash
npm run seed
npm run dev
```

La API queda disponible en `http://localhost:4000/api`.

## Scripts

- `npm run dev`: inicia la API en desarrollo.
- `npm run build`: compila TypeScript a `dist`.
- `npm run start`: ejecuta la API compilada.
- `npm run seed`: crea datos iniciales.

## Usuario inicial

- Email: `admin@restaurant.com`
- Password: `Admin12345`
