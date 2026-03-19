# SportsCards

Aplicación web para registrar y consultar cartas deportivas, con foco en colecciones personales de béisbol.

## Qué cambié en esta versión

- **Arquitectura refactorizada:** la capa de acceso a datos está separada en `src/services/cardService.js`, `src/services/profileService.js` y el estado de colección en `src/hooks/useCards.js`.
- **Persistencia confirmada:** el proyecto ya usa **Firebase Firestore**, por lo que no era necesario migrar desde `localStorage` a SQLite.
- **Mejora de seguridad:** se eliminó la dependencia funcional de ImgBB y la subida con clave embebida; las imágenes se comprimen en el navegador y se guardan inline en Firestore.
- **UI/UX modernizada:** dashboard responsive, métricas principales, layout de trabajo más claro y perfil con opciones de compartición.
- **OCR open source:** flujo asistido con **Tesseract.js** cargado dinámicamente desde CDN para sugerir campos al escanear una carta.
- **Perfil público compartible:** cada usuario puede activar un enlace público de sólo lectura (`/collection/:slug`) para enseñar su colección sin requerir login al visitante.

## Stack actual

- React 19
- Firebase Auth
- Firebase Firestore
- Tailwind CSS
- OCR con Tesseract.js (cliente)

## Perfil público

1. Abre **Profile settings**.
2. Activa **Share publicly**.
3. Define un slug público y una breve descripción opcional.
4. Guarda y comparte el enlace generado.

> El perfil público muestra las cartas guardadas por el usuario. Si más adelante quieres enseñar también “las que te faltan”, habría que modelar además una wishlist/checklist aparte.

## Flujo de OCR

1. Sube una imagen frontal de la carta.
2. La app comprime la imagen en el navegador.
3. Pulsa **Run OCR assist**.
4. Tesseract.js extrae texto y propone año, fabricante, set, número y datos de grading cuando es posible.
5. Revisa los campos y guarda la carta.

> Nota: la carga inicial del OCR depende de descargar el runtime/modelo desde CDN en el navegador.

## Variables de entorno opcionales

Puedes sobrescribir la configuración pública de Firebase con variables `REACT_APP_FIREBASE_*` estándar de Create React App.

## Scripts

```bash
npm start
npm test -- --watchAll=false
npm run build
```
