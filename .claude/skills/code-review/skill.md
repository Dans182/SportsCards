# Skill: Code Review — SportsCards

Realiza una revisión completa de código siguiendo las convenciones y patrones establecidos en el proyecto SportsCards.

## Cuándo usar esta skill

- Antes de hacer merge de una nueva funcionalidad
- Al añadir un nuevo componente, hook o service
- Al modificar lógica crítica de Firestore o Auth
- Cuando el agente duda sobre si el código respeta la arquitectura del proyecto

---

## Checklist de revisión

### ✅ Arquitectura y separación de responsabilidades

- [ ] La lógica de Firestore está **solo** en `src/services/` — nunca en componentes ni hooks directamente.
- [ ] Los custom hooks en `src/hooks/` orquestan servicios y exponen estado reactivo.
- [ ] Los componentes en `src/components/` solo hacen render + llamadas a hooks/callbacks.
- [ ] Las funciones puras (sin efectos) están en `src/utils/`.
- [ ] Si hay un nuevo dominio de datos, ¿se creó un service correspondiente?

### ✅ Firestore / Firebase

- [ ] Toda query a `cards` filtra por `userId` (evitar exponer datos de otros usuarios).
- [ ] Las operaciones de escritura usan `normalizeCardPayload` para garantizar consistencia de campos.
- [ ] No se almacenan datos sensibles sin protección de Security Rules.
- [ ] Si se añade una nueva colección Firestore, ¿se actualizaron las Security Rules?
- [ ] Los errores de Firestore se capturan con `try/catch` — no se dejan promesas sin manejar.

### ✅ React / Hooks

- [ ] No se usan class components — solo functional components.
- [ ] `useCallback` en funciones que se pasan como props para evitar re-renders innecesarios.
- [ ] `useMemo` para cómputos derivados costosos (estadísticas, filtros de lista).
- [ ] Las dependencias de `useEffect` y `useCallback` son correctas y completas.
- [ ] No hay fetch de datos directamente en el cuerpo de un componente (sin useEffect).

### ✅ Estilos (Tailwind CSS)

- [ ] Se usan las clases de la paleta establecida: `slate`, `sky`, `emerald`, `amber`, `violet`.
- [ ] Los modales siguen el patrón: `fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm`.
- [ ] Los border-radius de cards son `rounded-[2rem]` para mantener el estilo premium.
- [ ] No hay estilos inline `style={{...}}` salvo casos excepcionales documentados.

### ✅ Seguridad y privacidad

- [ ] No se loguean datos de usuario en `console.log` en producción.
- [ ] Las variables de entorno se acceden con `process.env.REACT_APP_*`.
- [ ] No hay claves de API o credenciales hardcodeadas.
- [ ] Las imágenes se comprimen antes de guardar (ver `src/utils/imageProcessing.js`).

### ✅ UX y accesibilidad

- [ ] Los botones interactivos tienen un tipo explícito (`type="button"` o `type="submit"`).
- [ ] Los formularios tienen labels asociados a sus inputs.
- [ ] Los estados de carga (loading) y error se comunican al usuario.
- [ ] Los modales tienen un botón de cierre visible y funcionan con Escape (si aplica).

### ✅ Calidad general

- [ ] No hay `console.log` / `console.error` de debug olvidados.
- [ ] No hay código comentado TODO sin issue asociado.
- [ ] Los nombres de variables y funciones son descriptivos en inglés o español (consistente con el archivo).
- [ ] Las funciones asíncronas usan `async/await` — no `.then()` encadenado a menos que sea necesario para el flujo.

---

## Patrones de referencia

### Añadir un campo nuevo a una carta

```js
// 1. En cardService.js → normalizeCardPayload
const normalizeCardPayload = (card, userId) => ({
  // ... campos existentes ...
  newField: card.newField?.trim() || '',  // ← aquí
  userId
});

// 2. En AddCard.js y EditCardModal.js → añadir al estado inicial y al JSX
// 3. En ViewCards.js / CardDetailModal.js → mostrar el campo
```

### Patrón de modal

```jsx
// Componente modal
function MyModal({ isOpen, onClose, onConfirm }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-[2rem] border border-slate-200 bg-white p-6 shadow-2xl sm:p-8">
        {/* contenido */}
      </div>
    </div>
  );
}

// Uso en App.js o componente padre
const [showMyModal, setShowMyModal] = useState(false);
// ...
<MyModal isOpen={showMyModal} onClose={() => setShowMyModal(false)} />
```

### Patrón de service + hook

```js
// src/services/myService.js
export async function fetchItems(userId) {
  const q = query(collection(db, 'items'), where('userId', '==', userId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
}

// src/hooks/useItems.js
export default function useItems(user) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) return;
    fetchItems(user.uid).then(setItems).finally(() => setLoading(false));
  }, [user]);

  return { items, loading };
}
```
