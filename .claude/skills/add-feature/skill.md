# Skill: Add Feature — SportsCards

Guía paso a paso para añadir nuevas funcionalidades al proyecto SportsCards respetando la arquitectura establecida.

## Proceso de implementación

### Paso 1: Análisis de impacto

Antes de escribir código, responde estas preguntas:
1. ¿Requiere nuevos datos en Firestore? → Necesitarás actualizar/crear un service.
2. ¿El estado es compartido entre componentes? → Crea o actualiza un hook.
3. ¿Es UI nueva? → Crea un componente en `src/components/`.
4. ¿Es lógica pura? → Va en `src/utils/`.
5. ¿Afecta a la autenticación o rutas? → Actualiza `App.js`.

---

### Paso 2: Capa de datos (si aplica)

**Si añades campos a cartas existentes:**
```js
// Edita SOLO normalizeCardPayload en src/services/cardService.js
const normalizeCardPayload = (card, userId) => ({
  // campos existentes...
  nuevoCampo: card.nuevocampo?.trim() || '',
  userId
});
```

**Si añades una nueva colección Firestore:**
1. Crea `src/services/nuevoService.js` siguiendo este template:
```js
import { addDoc, collection, deleteDoc, doc, getDocs, query, updateDoc, where } from 'firebase/firestore';
import { db } from '../firebase';

const itemsRef = collection(db, 'nombre-coleccion');

export async function fetchItemsByUser(userId) {
  const q = query(itemsRef, where('userId', '==', userId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function createItem(userId, data) {
  const payload = { ...data, userId, createdAt: new Date(), updatedAt: new Date() };
  const ref = await addDoc(itemsRef, payload);
  return { id: ref.id, ...payload };
}

export async function updateItem(itemId, data) {
  await updateDoc(doc(db, 'nombre-coleccion', itemId), { ...data, updatedAt: new Date() });
}

export async function deleteItem(itemId) {
  await deleteDoc(doc(db, 'nombre-coleccion', itemId));
}
```

---

### Paso 3: Estado reactivo (si aplica)

**Si el estado se usa en múltiples componentes, crea un hook:**
```js
// src/hooks/useNuevo.js
import { useCallback, useEffect, useState } from 'react';
import { fetchItemsByUser, createItem, updateItem, deleteItem } from '../services/nuevoService';

export default function useNuevo(user) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    if (!user?.uid) { setItems([]); setLoading(false); return; }
    try {
      setLoading(true);
      setError('');
      setItems(await fetchItemsByUser(user.uid));
    } catch (err) {
      setError(err.message || 'Error loading items');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { refresh(); }, [refresh]);

  const addItem = useCallback(async (data) => {
    const created = await createItem(user.uid, data);
    setItems(prev => [created, ...prev]);
    return created;
  }, [user]);

  const editItem = useCallback(async (id, data) => {
    await updateItem(id, data);
    setItems(prev => prev.map(i => i.id === id ? { ...i, ...data } : i));
  }, []);

  const removeItem = useCallback(async (id) => {
    await deleteItem(id);
    setItems(prev => prev.filter(i => i.id !== id));
  }, []);

  return { items, loading, error, addItem, editItem, removeItem };
}
```

---

### Paso 4: Componente UI

**Template de componente modal:**
```jsx
import React, { useState } from 'react';

function NuevoModal({ isOpen, onClose, onSave, /* otras props */ }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      // ... lógica ...
      await onSave(/* datos */);
      onClose();
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-[2rem] border border-slate-200 bg-white p-6 shadow-2xl sm:p-8">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-sky-600">Sección</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-900">Título del modal</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-500 hover:border-slate-300 hover:text-slate-900"
          >
            Cerrar
          </button>
        </div>

        {error && (
          <p className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* inputs */}
          <button
            type="submit"
            disabled={loading}
            className="inline-flex w-full items-center justify-center rounded-2xl bg-sky-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:opacity-50"
          >
            {loading ? 'Guardando…' : 'Guardar'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default NuevoModal;
```

---

### Paso 5: Integración en App.js

```jsx
// 1. Importar el componente
import NuevoModal from './components/NuevoModal';

// 2. Añadir estado de visibilidad
const [showNuevoModal, setShowNuevoModal] = useState(false);

// 3. Añadir el hook si corresponde
const { items, addItem } = useNuevo(user);

// 4. Añadir botón en el header (si aplica)
<button
  type="button"
  onClick={() => setShowNuevoModal(true)}
  className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
>
  Nuevo botón
</button>

// 5. Renderizar el modal al final del return
<NuevoModal
  isOpen={showNuevoModal}
  onClose={() => setShowNuevoModal(false)}
  onSave={addItem}
/>
```

---

### Paso 6: Verificación

- [ ] ¿El componente se renderiza correctamente en desktop y mobile?
- [ ] ¿Los estados de loading y error se muestran correctamente?
- [ ] ¿Los datos se persisten en Firestore correctamente?
- [ ] ¿El estado local se actualiza sin necesidad de recargar la página?
- [ ] ¿Se usa `normalizeCardPayload` si se modifican cartas?
- [ ] ¿Todas las queries filtran por `userId`?
