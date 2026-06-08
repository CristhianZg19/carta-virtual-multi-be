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
GCP_IMAGES_BASE_URL=https://storage.googleapis.com/matrimonioxd/platos
GCP_STORAGE_BUCKET=matrimonioxd
GCP_IMAGES_PREFIX=platos
GCP_PROJECT_ID=hale-skill-452420-j6
GCP_CREDENTIALS_JSON=
AUTO_SEED_ADMIN=false
ADMIN_SEED_EMAIL=admin@restaurant.com
ADMIN_SEED_PASSWORD=Admin12345
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

## Endpoints de auth

- `POST /api/auth/login`: inicia sesion.
- `GET /api/auth/me`: obtiene el usuario autenticado.
- `PUT /api/auth/password`: cambia la contrasena del usuario autenticado.

## Imagenes

- `POST /api/uploads/dish-image`: sube una imagen de plato a Google Cloud Storage.
- Campo multipart: `image`.
- Tipos permitidos: JPG, PNG, WebP y GIF.
- Tamano maximo: 8 MB.

En Render configura `GCP_CREDENTIALS_JSON` con el JSON de una service account con permisos de escritura sobre el bucket, o con ese mismo JSON en Base64.

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

Para crear el usuario administrador en Render, agrega temporalmente:

```env
AUTO_SEED_ADMIN=true
ADMIN_SEED_NAME=Administrador
ADMIN_SEED_EMAIL=admin@restaurant.com
ADMIN_SEED_PASSWORD=Admin12345
```

Haz redeploy. Cuando el log muestre `Admin seed user created`, puedes volver `AUTO_SEED_ADMIN=false`.
Si necesitas resetear la clave de un admin existente, usa tambien `ADMIN_SEED_RESET_PASSWORD=true` durante un redeploy y luego apagalo.

## Usuario inicial

- Email: `admin@restaurant.com`
- Password: `Admin12345`
