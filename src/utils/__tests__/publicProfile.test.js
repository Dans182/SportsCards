import {
  buildPublicProfilePath,
  buildPublicProfileUrl,
  createProfileSlug,
  getPublicProfileSlugFromPath,
  slugifyProfileName,
} from '../publicProfile';

describe('slugifyProfileName', () => {
  it('normaliza tildes y caracteres especiales', () => {
    expect(slugifyProfileName('Álvaro Rookie PC')).toBe('alvaro-rookie-pc');
    expect(slugifyProfileName('José María')).toBe('jose-maria');
    expect(slugifyProfileName('Ñoño')).toBe('nono');
  });

  it('recorta espacios al inicio y final', () => {
    expect(slugifyProfileName('  collector  ')).toBe('collector');
  });

  it('sustituye espacios y caracteres no alfanuméricos por guiones', () => {
    expect(slugifyProfileName('my card collection!')).toBe('my-card-collection');
  });

  it('elimina guiones al inicio y final', () => {
    expect(slugifyProfileName('---cards---')).toBe('cards');
  });

  it('trunca a 40 caracteres', () => {
    const longName = 'a'.repeat(50);
    expect(slugifyProfileName(longName).length).toBe(40);
  });

  it('devuelve cadena vacía para entradas vacías', () => {
    expect(slugifyProfileName('')).toBe('');
    expect(slugifyProfileName('   ')).toBe('');
  });

  it('acepta undefined sin lanzar', () => {
    expect(() => slugifyProfileName(undefined)).not.toThrow();
    expect(slugifyProfileName(undefined)).toBe('');
  });
});

describe('createProfileSlug', () => {
  it('devuelve el fallback cuando el nombre está vacío', () => {
    expect(createProfileSlug('')).toBe('collector');
    expect(createProfileSlug('   ')).toBe('collector');
  });

  it('usa el fallback personalizado', () => {
    expect(createProfileSlug('', 'user')).toBe('user');
  });

  it('devuelve el slug normalizado del nombre', () => {
    expect(createProfileSlug('Juan Cards')).toBe('juan-cards');
  });
});

describe('getPublicProfileSlugFromPath', () => {
  it('extrae el slug de una ruta de colección válida', () => {
    expect(getPublicProfileSlugFromPath('/collection/juan-cards')).toBe('juan-cards');
  });

  it('ignora rutas no relacionadas', () => {
    expect(getPublicProfileSlugFromPath('/dashboard')).toBeNull();
    expect(getPublicProfileSlugFromPath('/')).toBeNull();
    expect(getPublicProfileSlugFromPath('')).toBeNull();
  });

  it('acepta trailing slash', () => {
    expect(getPublicProfileSlugFromPath('/collection/my-slug/')).toBe('my-slug');
  });

  it('decodifica slugs con caracteres URL-encoded', () => {
    expect(getPublicProfileSlugFromPath('/collection/juan%20cards')).toBe('juan cards');
  });
});

describe('buildPublicProfilePath', () => {
  it('genera la ruta correcta', () => {
    expect(buildPublicProfilePath('juan-cards')).toBe('/collection/juan-cards');
  });

  it('codifica caracteres especiales en el slug', () => {
    expect(buildPublicProfilePath('juan cards')).toBe('/collection/juan%20cards');
  });
});

describe('buildPublicProfileUrl', () => {
  it('combina origin y path correctamente', () => {
    expect(buildPublicProfileUrl('my-slug', 'https://example.com')).toBe(
      'https://example.com/collection/my-slug'
    );
  });
});
