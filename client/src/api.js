const API_URL = import.meta.env.VITE_API_URL || '';

async function fetchJson(url, options = {}, auth = null) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };
  if (auth) {
    headers['Authorization'] = auth;
  }
  const response = await fetch(`${API_URL}${url}`, {
    ...options,
    headers
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || `Erreur ${response.status}`);
  }
  return response.json();
}

export function getCocktails(params = '') {
  return fetchJson(`/api/cocktails${params}`);
}

export function getCocktail(id) {
  return fetchJson(`/api/cocktails/${id}`);
}

export function createCocktail(data, auth) {
  return fetchJson('/api/cocktails', {
    method: 'POST',
    body: JSON.stringify(data)
  }, auth);
}

export function updateCocktail(id, data, auth) {
  return fetchJson(`/api/cocktails/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }, auth);
}

export function deleteCocktail(id, auth) {
  return fetchJson(`/api/cocktails/${id}`, {
    method: 'DELETE'
  }, auth);
}

export function updateCocktailPages(id, pageIds, auth) {
  return fetchJson(`/api/cocktails/${id}/pages`, {
    method: 'PUT',
    body: JSON.stringify({ page_ids: pageIds })
  }, auth);
}

export function getIngredients() {
  return fetchJson('/api/ingredients');
}

export function createIngredient(data, auth) {
  return fetchJson('/api/ingredients', {
    method: 'POST',
    body: JSON.stringify(data)
  }, auth);
}

export function updateIngredient(id, data, auth) {
  return fetchJson(`/api/ingredients/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }, auth);
}

export function deleteIngredient(id, auth) {
  return fetchJson(`/api/ingredients/${id}`, {
    method: 'DELETE'
  }, auth);
}

export function getCategories() {
  return fetchJson('/api/categories');
}

export function getFlatCategories() {
  return fetchJson('/api/categories/flat');
}

export function createCategory(data, auth) {
  return fetchJson('/api/categories', {
    method: 'POST',
    body: JSON.stringify(data)
  }, auth);
}

export function updateCategory(id, data, auth) {
  return fetchJson(`/api/categories/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }, auth);
}

export function deleteCategory(id, auth) {
  return fetchJson(`/api/categories/${id}`, {
    method: 'DELETE'
  }, auth);
}

export function getPages() {
  return fetchJson('/api/pages');
}

export function createPage(data, auth) {
  return fetchJson('/api/pages', {
    method: 'POST',
    body: JSON.stringify(data)
  }, auth);
}

export function updatePage(id, data, auth) {
  return fetchJson(`/api/pages/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }, auth);
}

export function deletePage(id, auth) {
  return fetchJson(`/api/pages/${id}`, {
    method: 'DELETE'
  }, auth);
}

export async function login(username, password) {
  const response = await fetch(`${API_URL}/api/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || 'Identifiants incorrects');
  }
  return response.json();
}

export async function uploadImage(file, auth) {
  const body = new FormData();
  body.append('image', file);

  const response = await fetch(`${API_URL}/api/uploads`, {
    method: 'POST',
    headers: auth ? { 'Authorization': auth } : {},
    body
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || 'Erreur lors de l\'envoi de l\'image');
  }
  return response.json();
}
