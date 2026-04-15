# SportsCards — Contexto del proyecto para IA

> Este fichero es el punto de entrada para cualquier modelo de IA que trabaje en este repositorio.
> Lee este documento completo antes de escribir o modificar código.

---

## 📌 Sobre el proyecto

**SportsCards** es una aplicación web SPA (Single Page Application) construida con **React 19** que permite a coleccionistas registrar, gestionar y compartir su colección de cartas deportivas (principalmente béisbol).

- **URL local**: `http://localhost:3000`
- **Deploy destino**: Firebase Hosting
- **Repositorio**: `Dans182/SportsCards`

### Funcionalidades principales

| Funcionalidad | Estado |
|---|---|
| Autenticación de usuarios | ✅ Firebase Auth |
| CRUD de cartas deportivas | ✅ Firestore |
| Gestión de colecciones | ✅ Agrupación de cartas |
| OCR de cartas (Tesseract.js) | ✅ Cliente-side |
| Importación masiva CSV | ✅ PapaParse |
| Subida y compresión de imágenes | ✅ Inline en Firestore |
| Perfil público compartible | ✅ `/collection/:slug` |
| Dashboard con estadísticas | ✅ Total, béisbol, imágenes, año más reciente |

---

## 🏗 Architecture Overview

```
src/
├── App.js                    # Componente raíz, routing, estado global de Auth
├── firebase.js               # Inicialización Firebase (auth, db)
├── components/
│   ├── AddCard.js            # Formulario para añadir cartas (con OCR assist)
│   ├── ViewCards.js          # Grid/listado + filtros + búsqueda
│   ├── EditCardModal.js      # Modal edición de carta existente
│   ├── CardDetailModal.js    # Modal de detalle (solo lectura)
│   ├── ImportCardsModal.js   # Importación CSV masiva
│   ├── CollectionsManager.js # CRUD de colecciones
│   ├── CollectionPicker.js   # Selector de colección (dropdown)
│   ├── Login.js              # Pantalla de login (Firebase Auth)
│   ├── ProfileSettings.js    # Config perfil (slug público, descripción)
│   ├── PublicProfilePage.js  # Vista pública de colección (sin auth)
│   ├── ConfirmModal.js       # Modal de confirmación genérico
│   ├── Toast.js              # Notificaciones temporales
│   └── ui/
│       └── StatCard.js       # Tarjeta de métrica del dashboard
├── hooks/
│   ├── useCards.js           # Estado de cartas + operaciones CRUD
│   └── useCollections.js     # Estado de colecciones + operaciones CRUD
├── services/
│   ├── cardService.js        # Acceso a Firestore (cards collection)
│   ├── collectionService.js  # Acceso a Firestore (collections collection)
│   └── profileService.js     # Acceso a Firestore (profiles collection)
├── utils/
│   ├── cardTextParser.js     # Parser OCR → campos de carta
│   ├── imageProcessing.js    # Compresión y resize de imágenes
│   ├── ocr.js                # Integración Tesseract.js (carga dinámica CDN)
│   └── publicProfile.js      # Helpers para URL de perfil público
└── data/                     # Datos estáticos (listas de deportes, fabricantes…)
```

---

## 🛠 Stack tecnológico

| Capa | Tecnología | Notas |
|---|---|---|
| UI Framework | React 19 | Hooks, sin class components |
| State Management | useState / useCallback / useMemo | No Redux, no Zustand |
| Base de datos | Firebase Firestore | NoSQL, colecciones `cards`, `collections`, `profiles` |
| Autenticación | Firebase Auth | Email/password |
| Hosting | Firebase Hosting | Deploy con `firebase deploy` |
| Estilos | Tailwind CSS v3 | Utility-first, no CSS modules |
| CSV parsing | PapaParse | Importación masiva de cartas |
| OCR | Tesseract.js | Carga dinámica desde CDN, no es dependencia npm |
| Testing | React Testing Library + Jest | `npm test` |
| Build | Create React App (react-scripts 5) | NO Next.js, NO Vite |

---

## 🗄 Modelo de datos (Firestore)

### Colección `cards`

```js
{
  id: string,           // Firestore auto-ID
  userId: string,       // UID del propietario (Firebase Auth)
  player: string,       // Nombre del jugador
  year: string,         // Año de la carta
  manufacturer: string, // Fabricante (Topps, Panini, Upper Deck…)
  sport: string,        // Deporte (Baseball, Basketball, Football…)
  set: string,          // Serie/set (Chrome, Heritage…)
  cardNumber: string,   // Número de carta
  gradingCompany: string, // PSA, BGS, SGC…
  gradeNumber: string,  // Nota de grading (ej. "9.5")
  notes: string,        // Notas libres del coleccionista
  debut: string,        // Año de debut del jugador
  isParallel: boolean,  // ¿Es paralela?
  isAutograph: boolean, // ¿Tiene autógrafo?
  isRelic: boolean,     // ¿Tiene reliquia (jersey, bat…)?
  numbered: string,     // Numeración (ej. "45/99")
  imageUrl: string,     // Data URL base64 de la imagen (o vacío)
  ocrText: string,      // Texto extraído por OCR
  collectionIds: string[], // IDs de colecciones a las que pertenece
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### Colección `collections`

```js
{
  id: string,
  userId: string,
  name: string,
  description: string,
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### Colección `profiles`

```js
{
  id: string,           // = Firebase Auth UID
  name: string,         // Nombre público del coleccionista
  email: string,
  publicProfileEnabled: boolean,
  publicSlug: string,   // Slug único para URL pública (/collection/:slug)
  shareDescription: string,
  avatarUrl: string
}
```

---

## ⚙️ Variables de entorno

El proyecto usa **Create React App** (`REACT_APP_` prefix obligatorio).

```env
REACT_APP_FIREBASE_API_KEY=
REACT_APP_FIREBASE_AUTH_DOMAIN=
REACT_APP_FIREBASE_PROJECT_ID=
REACT_APP_FIREBASE_STORAGE_BUCKET=
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=
REACT_APP_FIREBASE_APP_ID=
REACT_APP_FIREBASE_MEASUREMENT_ID=
```

> ⚠️ El fichero `.env` real NO debe commitearse. Usa `.env.example` como referencia.

---

## 🚀 Comandos útiles

```bash
# Arrancar en desarrollo
npm start

# Ejecutar tests
npm test -- --watchAll=false

# Build de producción
npm run build

# Deploy a Firebase Hosting
firebase deploy
```

---

## 📐 Convenciones del proyecto

### JavaScript / React
- **Sin TypeScript** — el proyecto es JavaScript puro.
- **Sin class components** — solo functional components con hooks.
- **Sin Redux** — el estado global se pasa por props o context cuando sea necesario.
- **Hooks en `src/hooks/`** — lógica de negocio y estado de dominio.
- **Servicios en `src/services/`** — toda comunicación con Firestore va aquí. NUNCA llamar directamente a Firestore desde un componente.
- **Utils en `src/utils/`** — funciones puras sin efectos secundarios.

### Estilos (Tailwind CSS)
- Usar **clases de Tailwind** directamente en JSX.
- Paleta base: `slate` para fondos y texto, `sky` para acento principal, `emerald` para positivo, `amber` para advertencia.
- Los modales usan `fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm`.
- Los botones primarios: `rounded-2xl bg-sky-600 px-5 py-3 text-sm font-semibold text-white hover:bg-sky-700`.
- Los bordes de cards: `rounded-[2rem]` (border-radius grande, estilo premium).

### Firestore
- **Nunca** realizar queries sin filtrar por `userId` en colecciones privadas.
- La función `normalizeCardPayload` en `cardService.js` es el único lugar donde se define la forma del payload de una carta — **siempre actualizar ahí**.
- `collectionIds` es un array de strings; las cartas pueden pertenecer a múltiples colecciones.

### Imágenes
- Las imágenes se comprimen a ≤ 800px de ancho y se convierten a JPEG con calidad ~0.7 antes de guardar.
- Se guardan como **Data URL base64** inline en el documento Firestore (no Firebase Storage).
- El módulo responsable es `src/utils/imageProcessing.js`.

### OCR
- Tesseract.js se carga dinámicamente desde CDN en runtime (no está en `package.json`).
- El módulo de carga está en `src/utils/ocr.js`.
- El parser de texto OCR → campos de carta está en `src/utils/cardTextParser.js`.

---

## 🔒 Seguridad

- Firestore Security Rules deben garantizar que cada usuario solo puede leer/escribir sus propios documentos.
- Las reglas están en `firestore.rules` (si no existe, hay que crearlas).
- Firebase Auth gestiona la sesión; el UID se usa como `userId` en todos los documentos.

---

## 📂 Ficheros relevantes de configuración

| Fichero | Propósito |
|---|---|
| `firebase.json` | Config de Firebase Hosting y Firestore |
| `.firebaserc` | Proyecto Firebase por defecto |
| `tailwind.config.js` | Config Tailwind (paths de content) |
| `postcss.config.js` | PostCSS para Tailwind |
| `package.json` | Dependencias y scripts |
| `.env.example` | Plantilla de variables de entorno |

---

## 🧩 Skills disponibles

| Skill | Descripción |
|---|---|
| [`code-review`](.claude/skills/code-review/skill.md) | Revisión de código React/Firebase con checklist del proyecto |
| [`add-feature`](.claude/skills/add-feature/skill.md) | Guía para añadir nuevas funcionalidades respetando la arquitectura |
| [`firestore-query`](.claude/skills/firestore-query/skill.md) | Patrones seguros de consulta a Firestore con userId |
| [`debug-firebase`](.claude/skills/debug-firebase/skill.md) | Troubleshooting de errores comunes de Firebase/Firestore |

---

## 🤖 Agentes disponibles

| Agente | Descripción |
|---|---|
| [`feature-builder`](.claude/agents/feature-builder.md) | Agente para implementar nuevas features end-to-end |
| [`bug-fixer`](.claude/agents/bug-fixer.md) | Agente para diagnosticar y resolver bugs |

---

## ❓ Preguntas frecuentes para la IA

**¿Dónde añado lógica de base de datos?**
→ En `src/services/`. Crea un nuevo service si el dominio es nuevo, o añade una función al service correspondiente.

**¿Dónde añado estado reactivo de la colección?**
→ En `src/hooks/`. Crea un custom hook si el estado es reutilizable entre componentes.

**¿Cómo añado un nuevo campo a las cartas?**
→ 1) Añade el campo a `normalizeCardPayload` en `cardService.js`. 2) Actualiza el formulario en `AddCard.js` y/o `EditCardModal.js`. 3) Actualiza la visualización en `ViewCards.js` o `CardDetailModal.js`.

**¿Cómo gestiono un nuevo tipo de modal?**
→ Sigue el patrón de `ConfirmModal.js`: props `isOpen` + `onClose` + contenido. El estado de visibilidad vive en `App.js` o en el componente padre.

**¿Cómo añado una nueva ruta/página?**
→ El proyecto NO usa React Router. Las "rutas" se gestionan manualmente en `App.js` con condiciones (e.g., `publicProfileSlug` para el perfil público). Añade la lógica de detección de ruta en `App.js` y el nuevo componente en `src/components/`.
