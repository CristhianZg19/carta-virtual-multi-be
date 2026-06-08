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
MONGODB_SERVER_SELECTION_TIMEOUT_MS=10000
JWT_SECRET=change-this-secret-before-production
LOG_FORMAT=text
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

## Render

Configuracion recomendada:

- Build Command: `npm install`
- Start Command: `npm start`

El script `postinstall` ejecuta `npm run build`, por lo que Render genera `dist/server.js` durante la instalacion.

Si el deploy falla con `MongooseServerSelectionError`, revisa:

- `MONGODB_URI` en las variables de entorno de Render.
- Usuario y password de base de datos en MongoDB Atlas.
- Atlas > Network Access con los outbound IPs de Render o, para una prueba rapida, `0.0.0.0/0`.
- `LOG_FORMAT=json` si quieres logs estructurados para filtrar mejor en Render.

## Usuario inicial

- Email: `admin@restaurant.com`
- Password: `Admin12345`
