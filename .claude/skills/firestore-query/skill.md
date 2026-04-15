# Skill: Firestore Query Patterns — SportsCards

Patrones seguros y eficientes para consultar Firebase Firestore en el proyecto SportsCards.

## Reglas fundamentales

> ⚠️ **CRÍTICO**: Toda query sobre colecciones privadas (`cards`, `collections`, `profiles`) 
> DEBE filtrar por `userId`. Nunca hacer un `getDocs` sin filtro de usuario.

---

## Patrones de consulta

### Obtener todas las cartas de un usuario

```js
// ✅ CORRECTO — siempre filtrar por userId
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase';

async function fetchCardsByUser(userId) {
  const q = query(
    collection(db, 'cards'),
    where('userId', '==', userId)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
}

// ❌ INCORRECTO — expone datos de todos los usuarios
async function fetchAllCards() {
  const snapshot = await getDocs(collection(db, 'cards')); // PELIGROSO
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
}
```

### Obtener cartas de una colección específica

```js
// ✅ Usar array-contains para el campo collectionIds
async function fetchCardsByCollection(userId, collectionId) {
  const q = query(
    collection(db, 'cards'),
    where('userId', '==', userId),
    where('collectionIds', 'array-contains', collectionId)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
}
```

### Obtener un documento por ID

```js
import { doc, getDoc } from 'firebase/firestore';

async function fetchCardById(cardId) {
  const docRef = doc(db, 'cards', cardId);
  const snap = await getDoc(docRef);
  if (!snap.exists()) return null;
  
  const data = snap.data();
  // ⚠️ Verificar userId antes de devolver
  return { id: snap.id, ...data };
}
```

### Crear un documento

```js
import { addDoc, collection } from 'firebase/firestore';

async function createCard(userId, cardData) {
  const payload = {
    ...normalizeCardPayload(cardData, userId),
    createdAt: new Date()
  };
  const ref = await addDoc(collection(db, 'cards'), payload);
  return { id: ref.id, ...payload };
}
```

### Actualizar un documento

```js
import { doc, updateDoc } from 'firebase/firestore';

async function saveCard(userId, cardId, cardData) {
  const payload = normalizeCardPayload(cardData, userId);
  await updateDoc(doc(db, 'cards', cardId), payload);
  return { id: cardId, ...payload };
}
```

### Eliminar un documento

```js
import { deleteDoc, doc } from 'firebase/firestore';

async function removeCard(cardId) {
  await deleteDoc(doc(db, 'cards', cardId));
}
```

### serverTimestamp vs new Date()

```js
import { serverTimestamp } from 'firebase/firestore';

// Para campos de timestamp en Firestore:
const payload = {
  createdAt: serverTimestamp(), // ← usa esto para timestamps de servidor
  // o
  updatedAt: new Date()         // ← también válido, usa el reloj del cliente
};
```

---

## Índices compuestos

Las queries con múltiples `where` pueden requerir **índices compuestos** en Firestore.

### Cuándo se necesitan

```js
// Esta query requiere índice compuesto (userId + año)
query(
  collection(db, 'cards'),
  where('userId', '==', userId),
  where('year', '==', '2023'),
  orderBy('createdAt', 'desc')  // ← orderBy + multiple where = índice requerido
);
```

### Cuándo NO se necesitan (el caso actual del proyecto)

```js
// Solo where simple → no requiere índice
query(collection(db, 'cards'), where('userId', '==', userId));

// array-contains + userId → puede requerir índice en algunos casos
query(
  collection(db, 'cards'),
  where('userId', '==', userId),
  where('collectionIds', 'array-contains', collectionId)
);
```

> Si Firestore lanza un error con un link para crear el índice, sigue ese link en la consola de Firebase.

---

## Filtrado en cliente (workaround actual)

Para colecciones sin índice compuesto disponible, el proyecto filtra en cliente:

```js
// Patrón actual en collectionService.js para evitar índice compuesto
const snapshot = await getDocs(collectionsRef); // fetch todo
return snapshot.docs
  .map(d => normalizeCollection(d.id, d.data()))
  .filter(c => c.userId === userId); // filtrar en cliente
```

> ⚠️ Esto es aceptable para colecciones pequeñas pero no escala bien.
> Si la base de usuarios crece, migrar a queries con índice compuesto.

---

## Límites y paginación

```js
import { limit, orderBy, query, startAfter } from 'firebase/firestore';

// Paginación básica (si se necesita en el futuro)
async function fetchCardsPaginated(userId, lastDoc = null, pageSize = 20) {
  let q = query(
    collection(db, 'cards'),
    where('userId', '==', userId),
    orderBy('updatedAt', 'desc'),
    limit(pageSize)
  );

  if (lastDoc) {
    q = query(q, startAfter(lastDoc));
  }

  const snapshot = await getDocs(q);
  return {
    cards: snapshot.docs.map(d => ({ id: d.id, ...d.data() })),
    lastDoc: snapshot.docs[snapshot.docs.length - 1] || null,
    hasMore: snapshot.docs.length === pageSize
  };
}
```

---

## Timestamps en Firestore

```js
// Leer un timestamp de Firestore
const secondsSinceEpoch = card.updatedAt?.seconds || card.createdAt?.seconds || 0;

// Convertir a Date de JavaScript
const date = card.updatedAt?.toDate() || new Date();

// Formatear para mostrar
const formatted = date.toLocaleDateString('es-ES', {
  year: 'numeric', month: 'short', day: 'numeric'
});
```

---

## Manejo de errores

```js
// Patrón estándar del proyecto para operaciones Firestore
try {
  const cards = await fetchCardsByUser(userId);
  setCards(cards);
} catch (error) {
  // Firestore Error codes: permission-denied, not-found, unavailable, etc.
  if (error.code === 'permission-denied') {
    setError('No tienes permisos para acceder a estos datos.');
  } else {
    setError(error.message || 'Error al cargar la colección.');
  }
} finally {
  setLoading(false);
}
```
