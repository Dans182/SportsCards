# Skill: Debug Firebase — SportsCards

Guía de troubleshooting para los errores más comunes de Firebase/Firestore en el proyecto SportsCards.

---

## Errores de autenticación (Firebase Auth)

### `auth/user-not-found` o `auth/wrong-password`

```
FirebaseError: Firebase: Error (auth/user-not-found)
```

**Causa**: El usuario no existe o la contraseña es incorrecta.
**Solución**: Mostrar mensaje genérico al usuario. No revelar si el email existe o no.

### `auth/email-already-in-use`

**Causa**: El email ya está registrado.
**Solución**: Redirigir al login o mostrar botón "¿Olvidaste tu contraseña?".

### `auth/network-request-failed`

**Causa**: Sin conexión a internet o el dominio no está autorizado en Firebase Console.
**Solución**: 
1. Verificar conexión.
2. En Firebase Console → Auth → Authorized domains → añadir el dominio de la app.

### El usuario se desautentica al recargar

**Causa**: La persistencia de sesión no está configurada.
**Diagnóstico**: Verificar que `onAuthStateChanged` está correctamente configurado en `App.js`.
**Solución**: Firebase Auth persiste la sesión por defecto en `localStorage`. Si no funciona, verificar que no se llama a `signOut()` accidentalmente.

---

## Errores de Firestore

### `permission-denied`

```
FirebaseError: Missing or insufficient permissions.
```

**Causa**: Las Security Rules de Firestore bloquean la operación.
**Diagnóstico**:
1. Revisar las reglas en Firebase Console → Firestore → Rules.
2. Verificar que el usuario está autenticado (`user.uid` no es `undefined`).
3. Verificar que el campo `userId` en el documento coincide con el UID del usuario.

**Reglas mínimas de ejemplo:**
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /cards/{cardId} {
      allow read, write: if request.auth != null && 
                            request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && 
                       request.auth.uid == request.resource.data.userId;
    }
    match /collections/{collectionId} {
      allow read, write: if request.auth != null && 
                            request.auth.uid == resource.data.userId;
      allow create: if request.auth != null;
    }
    match /profiles/{userId} {
      allow read: if true; // perfiles públicos
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### `failed-precondition` (índice compuesto requerido)

```
FirebaseError: The query requires an index. You can create it here: https://console.firebase.google.com/...
```

**Causa**: La query usa múltiples filtros `where` o `orderBy` que requieren un índice compuesto.
**Solución**: Clic en el link del mensaje de error → Firebase Console crea el índice automáticamente.

### Datos no aparecen después de crear/actualizar

**Causa posible 1**: El estado local no se actualizó después de la operación.
```js
// ✅ Actualizar el estado local después de crear
const created = await createCard(user.uid, card);
setCards(prev => [created, ...prev]); // ← esto es crítico
```

**Causa posible 2**: La query filtra por `userId` pero el documento se creó sin `userId`.
```js
// Verificar en cardService.js que normalizeCardPayload incluye userId
const payload = {
  ...normalizeCardPayload(card, userId),
  createdAt: new Date()
};
```

### Firestore está devolviendo datos de otros usuarios

**Causa**: La query no filtra por `userId`.
**Solución**: Siempre añadir `where('userId', '==', userId)` a las queries.

---

## Errores de imágenes

### La imagen no se guarda o aparece en blanco

**Causa posible 1**: La imagen es demasiado grande para Firestore (límite: 1MB por documento).
**Diagnóstico**: Ver si el `imageUrl` (base64) tiene más de ~750KB.
**Solución**: `src/utils/imageProcessing.js` comprime automáticamente. Verificar que se llama correctamente.

```js
// En AddCard.js / EditCardModal.js — la imagen debe comprimirse antes de guardar
const compressedImage = await compressImage(file); // de imageProcessing.js
// compressedImage es un Data URL base64 comprimido
```

**Causa posible 2**: El documento Firestore supera el límite de 1MB.
**Diagnóstico**: Cartas con imágenes base64 de alta resolución pueden superar el límite.
**Solución**: Reducir más la calidad en `imageProcessing.js` (calidad actual ~0.7).

### La imagen no se muestra en `<img src={card.imageUrl}>`

**Causa**: El `imageUrl` es un Data URL inválido o está vacío.
**Diagnóstico**:
```js
console.log(typeof card.imageUrl, card.imageUrl?.substring(0, 50));
// debe ser: "string" "data:image/jpeg;base64,/9j/4AAQSkZJRgAB..."
```

---

## Errores de OCR (Tesseract.js)

### El OCR no arranca / timeout

**Causa**: Tesseract.js se carga desde CDN; si hay problemas de red o el CDN está caído, falla.
**Diagnóstico**: Abrir DevTools → Network → verificar que se carga `tesseract.min.js` desde CDN.
**Solución**: El proyecto carga Tesseract dinámicamente en `src/utils/ocr.js`. Si falla, el botón "Run OCR assist" no debe bloquear el guardado de la carta.

### OCR produce texto sin sentido

**Causa**: La imagen de entrada tiene baja resolución o poca luz.
**Solución**: El OCR es asistido (no automático). El usuario debe revisar y corregir los campos sugeridos.

---

## Errores de importación CSV

### `Papa.parse` no reconoce las columnas

**Causa**: El CSV no tiene cabeceras que coincidan con los campos esperados.
**Diagnóstico**: Ver `ImportCardsModal.js` para los nombres de columna esperados.
**Solución**: Documentar el formato CSV esperado al usuario.

### Las imágenes del CSV no se suben

**Causa**: `ImportCardsModal.js` soporta imágenes individuales por carta pero depende de que el usuario las suba por separado.
**Diagnóstico**: Ver la lógica de matching entre nombre de fichero en CSV y fichero subido.

---

## Problemas de build y entorno

### Variables de entorno `undefined`

```
firebaseConfig.apiKey is undefined
```

**Causa**: Las variables de entorno no están definidas o no tienen el prefijo `REACT_APP_`.
**Solución**:
1. Verificar que existe el fichero `.env` (no solo `.env.example`).
2. Verificar que todas las variables tienen el prefijo `REACT_APP_`.
3. Reiniciar el servidor de desarrollo después de cambiar `.env`.

### `Cannot find module` después de npm install

**Causa**: Conflicto de versiones o node_modules corrupto.
**Solución**:
```bash
rm -rf node_modules package-lock.json
npm install
```

### Build falla con `GENERATE_SOURCEMAP=false`

Si el build tarda demasiado o hay problemas de memoria:
```bash
GENERATE_SOURCEMAP=false npm run build
```

---

## Herramientas de diagnóstico

### Firebase Emulator (desarrollo local sin afectar producción)

```bash
# Instalar Firebase CLI si no está instalado
npm install -g firebase-tools

# Iniciar emuladores
firebase emulators:start

# La app se conectará automáticamente si está configurado
```

### Ver documentos en Firestore Console

1. Firebase Console → Firestore Database → Data
2. Buscar la colección `cards`, `collections` o `profiles`
3. Verificar que el campo `userId` es correcto

### Debuggear queries en browser DevTools

```js
// Añadir temporalmente en el service para debug
const snapshot = await getDocs(q);
console.log('Docs encontrados:', snapshot.size);
console.log('Primer doc:', snapshot.docs[0]?.data());
```

> Eliminar estos `console.log` antes de hacer commit.
