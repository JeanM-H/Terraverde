/**
 * ============================================================
 * TerraVerde — Sistema Inmobiliario
 * app.js  |  ADSO-19
 * ============================================================
 * Módulos:
 *  1. Datos demo (localStorage seed)
 *  2. Sesión y autenticación
 *  3. Toast / notificaciones
 *  4. Validaciones de formulario
 *  5. Utilidades UI (navbar, modal, password toggle)
 *  6. Helpers de formato
 * ============================================================
 */

'use strict';

/* ============================================================
   1. DATOS DEMO — se inicializan una sola vez
   ============================================================ */
function seedData() {
  // USUARIOS
  if (!localStorage.getItem('tv_users')) {
    const users = [
      { id: 1, name: 'Administrador TerraVerde', email: 'admin@terraverde.co',
        password: btoa('admin123'), role: 'admin',   phone: '3001234567', createdAt: '2024-01-10T08:00:00Z' },
      { id: 2, name: 'Carlos Rodríguez',          email: 'carlos@gmail.com',
        password: btoa('carlos123'), role: 'cliente', phone: '3109876543', createdAt: '2024-02-15T10:30:00Z' },
      { id: 3, name: 'María González',             email: 'maria@gmail.com',
        password: btoa('maria123'),  role: 'cliente', phone: '3156781234', createdAt: '2024-03-01T09:00:00Z' },
    ];
    localStorage.setItem('tv_users', JSON.stringify(users));
  }

  // LOTES
  if (!localStorage.getItem('tv_lotes')) {
    const lotes = [
      { id: 1, area: 100, ubicacion: 'Sector A — Manzana 1, Lote 1', valor: 45000000, estado: 'disponible', etapa: 'Preventa',     clienteId: null },
      { id: 2, area: 120, ubicacion: 'Sector A — Manzana 1, Lote 2', valor: 54000000, estado: 'disponible', etapa: 'Preventa',     clienteId: null },
      { id: 3, area: 150, ubicacion: 'Sector B — Manzana 2, Lote 1', valor: 67500000, estado: 'reservado',  etapa: 'Preventa',     clienteId: 2   },
      { id: 4, area: 150, ubicacion: 'Sector B — Manzana 2, Lote 2', valor: 67500000, estado: 'vendido',    etapa: 'Lanzamiento',  clienteId: 3   },
      { id: 5, area: 200, ubicacion: 'Sector C — Manzana 3, Lote 1', valor: 90000000, estado: 'disponible', etapa: 'Preventa',     clienteId: null },
      { id: 6, area: 180, ubicacion: 'Sector C — Manzana 3, Lote 2', valor: 81000000, estado: 'reservado',  etapa: 'Preventa',     clienteId: 2   },
      { id: 7, area: 100, ubicacion: 'Sector D — Manzana 4, Lote 1', valor: 46000000, estado: 'disponible', etapa: 'Construcción', clienteId: null },
      { id: 8, area: 120, ubicacion: 'Sector D — Manzana 4, Lote 2', valor: 55000000, estado: 'disponible', etapa: 'Construcción', clienteId: null },
    ];
    localStorage.setItem('tv_lotes', JSON.stringify(lotes));
  }

  // PAGOS
  if (!localStorage.getItem('tv_pagos')) {
    const pagos = [
      { id: 1, clienteId: 2, clienteNombre: 'Carlos Rodríguez', loteId: 3, nCuota: 1, monto: 6750000,  fecha: '2024-03-10T10:00:00Z', nota: 'Cuota inicial' },
      { id: 2, clienteId: 2, clienteNombre: 'Carlos Rodríguez', loteId: 3, nCuota: 2, monto: 6750000,  fecha: '2024-04-10T10:00:00Z', nota: '' },
      { id: 3, clienteId: 2, clienteNombre: 'Carlos Rodríguez', loteId: 6, nCuota: 1, monto: 8100000,  fecha: '2024-03-15T11:00:00Z', nota: 'Cuota inicial' },
      { id: 4, clienteId: 3, clienteNombre: 'María González',   loteId: 4, nCuota: 1, monto: 13500000, fecha: '2024-02-20T09:00:00Z', nota: 'Pago de contado parcial' },
      { id: 5, clienteId: 3, clienteNombre: 'María González',   loteId: 4, nCuota: 2, monto: 13500000, fecha: '2024-03-20T09:00:00Z', nota: '' },
    ];
    localStorage.setItem('tv_pagos', JSON.stringify(pagos));
  }

  // PQRS
  if (!localStorage.getItem('tv_pqrs')) {
    const pqrs = [
      { id: 1, clienteId: 2, clienteNombre: 'Carlos Rodríguez', tipo: 'Petición',   asunto: 'Inicio de obras', descripcion: 'Quisiera saber cuándo inician las obras de urbanización en el Sector B del proyecto.',   estado: 'pendiente',   fecha: '2024-04-10T08:00:00Z', respuesta: '' },
      { id: 2, clienteId: 3, clienteNombre: 'María González',   tipo: 'Sugerencia', asunto: 'Zonas verdes',    descripcion: 'Sugiero ampliar las zonas verdes en el proyecto para mejorar la calidad de vida de los residentes.', estado: 'en proceso', fecha: '2024-04-05T14:00:00Z', respuesta: 'Gracias por su sugerencia. La estamos evaluando con el equipo de diseño.' },
    ];
    localStorage.setItem('tv_pqrs', JSON.stringify(pqrs));
  }
}

/* ============================================================
   2. SESIÓN Y AUTENTICACIÓN
   ============================================================ */
const Auth = {
  getSession() {
    const raw = localStorage.getItem('tv_session');
    if (!raw || raw === 'undefined') return null;
    try {
      return JSON.parse(raw);
    } catch {
      // Valor corrupto en localStorage (ej: "undefined")
      localStorage.removeItem('tv_session');
      return null;
    }
  },
  getUsers()   { return JSON.parse(localStorage.getItem('tv_users')   || '[]');  },
  saveUsers(u) { localStorage.setItem('tv_users', JSON.stringify(u)); },

  login(email, password) {
    const users = this.getUsers();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === btoa(password));
    if (user) {
      localStorage.setItem('tv_session', JSON.stringify(user));
      return { ok: true, user };
    }
    return { ok: false, error: 'Correo o contraseña incorrectos' };
  },

  register(data) {
    const users = this.getUsers();
    if (users.find(u => u.email.toLowerCase() === data.email.toLowerCase())) {
      return { ok: false, error: 'Este correo ya está registrado' };
    }
    const newUser = {
      id: Date.now(),
      name: data.name,
      email: data.email,
      password: btoa(data.password),
      role: 'cliente',
      phone: data.phone || '',
      createdAt: new Date().toISOString(),
    };
    users.push(newUser);
    this.saveUsers(users);
    localStorage.setItem('tv_session', JSON.stringify(newUser));
    return { ok: true, user: newUser };
  },

  logout() {
    localStorage.removeItem('tv_session');
    window.location.href = 'login.html';
  },

  requireAuth() {
    if (!this.getSession()) { window.location.href = 'login.html'; return false; }
    return true;
  },

  requireAdmin() {
    const s = this.getSession();
    if (!s || s.role !== 'admin') { window.location.href = 'dashboard.html'; return false; }
    return true;
  },

  updateProfile(id, data) {
    const users = this.getUsers();
    const idx = users.findIndex(u => u.id === id);
    if (idx < 0) return;
    Object.assign(users[idx], data);
    this.saveUsers(users);
    localStorage.setItem('tv_session', JSON.stringify(users[idx]));
  },
};

const session = Auth.getSession && Auth.getSession();
console.log('Usuario recibido:', session);

/* ============================================================
   3. TOAST / NOTIFICACIONES
   ============================================================ */
const Toast = {
  show(msg, type = 'success', duration = 4000) {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    const icons = { success: '✓', error: '✕', info: 'ℹ', warning: '⚠' };
    const el = document.createElement('div');
    el.className = `toast t-${type}`;
    el.innerHTML = `
      <span class="toast-icon">${icons[type] || '•'}</span>
      <span class="toast-msg">${msg}</span>
      <button class="toast-close" onclick="this.closest('.toast').remove()">✕</button>`;
    container.appendChild(el);
    setTimeout(() => {
      el.style.transition = 'all .3s';
      el.style.opacity = '0';
      el.style.transform = 'translateX(110%)';
      setTimeout(() => el.remove(), 320);
    }, duration);
  },
};

/* ============================================================
   4. VALIDACIONES
   ============================================================ */
const Validate = {
  email(v)    { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()); },
  required(v) { return v.trim().length > 0; },
  minLen(v,n) { return v.length >= n; },
  phone(v)    { return /^[0-9+\s\-]{7,15}$/.test(v.trim()); },

  setError(id, msg) {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = msg;
    el.previousElementSibling?.querySelector('input,select,textarea')?.classList.add('is-error');
    el.closest('.form-group')?.querySelector('input,select,textarea')?.classList.add('is-error');
  },

  clearError(id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = '';
    el.closest('.form-group')?.querySelector('input,select,textarea')?.classList.remove('is-error');
  },

  clearAll(formId) {
    document.querySelectorAll(`#${formId} .field-error`).forEach(e => { e.textContent = ''; });
    document.querySelectorAll(`#${formId} .is-error`).forEach(e => e.classList.remove('is-error'));
  },
};

/* ============================================================
   5. UTILIDADES UI
   ============================================================ */

// Toggle visibilidad contraseña
function togglePw(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.type = el.type === 'password' ? 'text' : 'password';
}

// Indicador de fortaleza de contraseña
function checkPwStrength(pw, barId) {
  const bar = document.getElementById(barId);
  if (!bar) return;
  let s = 0;
  if (pw.length >= 6)         s++;
  if (pw.length >= 10)        s++;
  if (/[A-Z]/.test(pw))       s++;
  if (/[0-9]/.test(pw))       s++;
  if (/[^A-Za-z0-9]/.test(pw))s++;
  const colors = ['#dc2626','#f97316','#eab308','#16a34a','#15803d'];
  bar.style.width   = (s * 20) + '%';
  bar.style.background = colors[s - 1] || '#e5e7eb';
}

// Navbar scroll + mobile
function initNavbar() {
  const nav    = document.getElementById('navbar');
  const toggle = document.getElementById('navToggle');
  const links  = document.getElementById('navLinks');
  if (nav)    window.addEventListener('scroll', () => nav.classList.toggle('scrolled', window.scrollY > 20));
  if (toggle && links) {
    toggle.addEventListener('click', () => links.classList.toggle('open'));
    links.querySelectorAll('a').forEach(a => a.addEventListener('click', () => links.classList.remove('open')));
  }
  // Mostrar dashboard link si hay sesión
  const s = Auth.getSession();
  if (s && links) {
    const li1 = links.querySelector('li:has(a[href="login.html"])');
    const li2 = links.querySelector('li:has(a[href="registro.html"])');
    if (li1) li1.innerHTML = `<a href="dashboard.html" class="btn btn-ghost btn-sm">Dashboard</a>`;
    if (li2) li2.innerHTML = `<a href="#" onclick="Auth.logout()" class="btn btn-ghost btn-sm">Salir</a>`;
  }
}

// Modal genérico
const Modal = {
  open(contentHtml) {
    const ov = document.getElementById('modalOverlay');
    const mb = document.getElementById('modalBox');
    if (!ov || !mb) return;
    mb.innerHTML = `<button class="modal-close" onclick="Modal.close()">✕</button>${contentHtml}`;
    ov.classList.remove('hidden');
  },
  close() { document.getElementById('modalOverlay')?.classList.add('hidden'); },
};

// Sidebar dashboard
function toggleSidebar() {
  document.getElementById('sidebar')?.classList.toggle('open');
  document.getElementById('sbOverlay')?.classList.toggle('show');
}

/* ============================================================
   6. HELPERS DE FORMATO
   ============================================================ */
const Fmt = {
  money(n)    { return '$' + Number(n).toLocaleString('es-CO'); },
  date(iso)   { return new Date(iso).toLocaleDateString('es-CO', { day:'2-digit', month:'short', year:'numeric' }); },
  datetime(iso){ return new Date(iso).toLocaleString('es-CO', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' }); },
  initials(name){ return (name || '?').split(' ').map(w => w[0]).join('').substring(0,2).toUpperCase(); },
};

/* ============================================================
   LOTES — helpers globales
   ============================================================ */
const Lotes = {
  async getAll() {
    const data = await API.get('/api/lotes');
    return Array.isArray(data) ? data : data.data || [];
  },
  async getById(id) {
    const lotes = await this.getAll();
    return lotes.find(l => l.id === id);
  },
  async getByCliente(cid) {
    const lotes = await this.getAll();
    return lotes.filter(l => l.clienteId === cid);
  }
};

const Pagos = {
  async getAll() {
    const data = await API.get('/api/pagos');
    return Array.isArray(data) ? data : data.data || [];
  },
  async getByCliente(cid) {
    const pagos = await this.getAll();
    return pagos.filter(p => p.clienteId === cid);
  },
  async getByLote(lid) {
    const pagos = await this.getAll();
    return pagos.filter(p => p.loteId === lid);
  }
};

const PQRS = {
  async getAll() {
    const data = await API.get('/api/pqrs');
    return Array.isArray(data) ? data : data.data || [];
  },
  async getByCliente(cid) {
    const pqrs = await this.getAll();
    return pqrs.filter(p => p.clienteId === cid);
  },
  async save(pqrsData) {
    return await API.post('/api/pqrs', pqrsData);
  }
};

const Users = {
  getAll()      { return JSON.parse(localStorage.getItem('tv_users') || '[]'); },
  save(u)       { localStorage.setItem('tv_users', JSON.stringify(u)); },
  getById(id)   { return this.getAll().find(u => u.id === id); },
  getClientes() { return this.getAll().filter(u => u.role === 'cliente'); },
};

const Credit = {
  key: 'tv_creditos',
  getAll() {
    return JSON.parse(localStorage.getItem(this.key) || '{}');
  },
  saveAll(data) {
    localStorage.setItem(this.key, JSON.stringify(data));
  },
  get(loteId) {
    const all = this.getAll();
    return all[loteId] || null;
  },
  save(loteId, payload) {
    const all = this.getAll();
    all[loteId] = payload;
    this.saveAll(all);
  },
  addPayment(loteId, amount) {
    const credit = this.get(loteId);
    if (!credit) return null;
    credit.pagado = (credit.pagado || 0) + Number(amount || 0);
    credit.restante = Math.max(0, credit.total - credit.pagado);
    this.save(loteId, credit);
    return credit;
  },
  clear(loteId) {
    const all = this.getAll();
    delete all[loteId];
    this.saveAll(all);
  }
};

/* ============================================================
   COMPROBANTE — generar HTML para modal e impresión
   ============================================================ */
async function buildComprobante(pago) {
  const lote = await Lotes.getById(pago.loteId) || {};
  return `
  <div class="comprobante">
    <div class="comp-head">
      <div class="logo-big">◈</div>
      <h3>TerraVerde</h3>
      <p>Comprobante de Pago — No. ${pago.id}</p>
    </div>
    <div class="comp-body">
      <div class="comp-row"><span>Cliente</span><span>${pago.clienteNombre}</span></div>
      <div class="comp-row"><span>Lote</span><span>#${pago.loteId} — ${lote.area || '?'}m² (${lote.ubicacion || 'N/A'})</span></div>
      <div class="comp-row"><span>N° Cuota</span><span>Cuota ${pago.nCuota}</span></div>
      <div class="comp-row highlight"><span>Monto Pagado</span><span>${Fmt.money(pago.monto)}</span></div>
      <div class="comp-row"><span>Fecha</span><span>${Fmt.datetime(pago.fecha)}</span></div>
      <div class="comp-row"><span>Nota</span><span>${pago.nota || '—'}</span></div>
      <div class="comp-row"><span>ID Transacción</span><span>#TV-${pago.id}</span></div>
    </div>
    <div class="comp-foot">
      <span class="badge badge-green">✓ Pago Verificado</span>
      <button class="comp-print" onclick="window.print()">🖨 Imprimir</button>
    </div>
  </div>`;
}

/* ============================================================
   INIT GLOBAL
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  seedData();
  initNavbar();
});

async function crearLote(lote) {
  const res = await fetch('http://localhost:3000/api/lotes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(lote)
  });
  return await res.json();
}

async function guardarNuevoLote() {
  // Lee los valores del formulario
  const area = parseInt(document.querySelector('[name="area"]').value);
  const valor = parseFloat(document.querySelector('[name="valor"]').value);
  const ubicacion = document.querySelector('[name="ubicacion"]').value;
  const etapa = document.querySelector('[name="etapa"]').value;
  const estado = document.querySelector('[name="estado"]').value;
  const clienteId = document.querySelector('[name="clienteId"]').value || null;

  // Validación básica
  if (!area || !valor || !ubicacion || !etapa || !estado) {
    Toast.show('Completa todos los campos obligatorios', 'error');
    return;
  }

  // Llama a la función que hace el fetch
  const resp = await crearLote({ area, valor, ubicacion, etapa, estado, clienteId: clienteId || null });

  if (resp.ok) {
    Toast.show('Lote guardado correctamente', 'success');
    Modal.close();
    // Recarga la lista de lotes, si tienes una función para eso
    if (typeof loadPage === 'function') loadPage('lotes');
  } else {
    Toast.show('Error al guardar el lote', 'error');
  }
}

async function llenarSelectClientes() {
  const res = await fetch('http://localhost:3000/api/usuarios');
  const clientes = await res.json();
  const select = document.querySelector('select[name="clienteId"]');
  if (!select) return;
  select.innerHTML = '<option value="">— Sin asignar —</option>' +
    clientes.filter(c => c.role === 'cliente')
            .map(c => `<option value="${c.id}">${c.nombre || c.name}</option>`)
            .join('');
}

// Llama esta función cuando se muestre el formulario
document.addEventListener('DOMContentLoaded', llenarSelectClientes);

async function reservarLoteCliente(loteId) {
  // Asegúrate de tener el id del usuario in session.id
  if (!session || !session.id) {
    Toast.show('Debes iniciar sesión para reservar un lote', 'error');
    return;
  }
  const resp = await fetch(`http://localhost:3000/api/lotes/${loteId}/reservar`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ clienteId: session.id })
  });
  const data = await resp.json();
  if (data.ok) {
    Toast.show('¡Lote reservado exitosamente!', 'success');
    // Recarga la lista de lotes para actualizar el estado
    if (typeof loadPage === 'function') loadPage('lotes');
  } else {
    Toast.show(data.error || 'No se pudo reservar el lote', 'error');
  }
}

/* ============================================================
   9. HELPER DE FETCH CON JWT
   ============================================================ */
/**
 * Función helper para hacer fetch requests con token JWT automático
 * Uso: await API.get('/api/usuarios'), await API.post('/api/pagos', data)
 */
const API = {
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3000',
  
  getHeaders() {
    const headers = { 'Content-Type': 'application/json' };
    const sessionData = localStorage.getItem('tv_token');
    if (sessionData) {
      headers['Authorization'] = `Bearer ${sessionData}`;
    }
    return headers;
  },

  async request(method, endpoint, body = null) {
    const url = this.baseURL + endpoint;
    const options = {
      method,
      headers: this.getHeaders(),
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    try {
      const response = await fetch(url, options);
      
      if (response.status === 401) {
        // Token expirado o inválido
        localStorage.removeItem('tv_session');
        localStorage.removeItem('tv_token');
        Toast.show('Sesión expirada. Por favor, inicia sesión nuevamente.', 'error');
        window.location.href = '/login.html';
        return { ok: false, error: 'Token expirado' };
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return { ok: false, error: error.message };
    }
  },

  get(endpoint) {
    return this.request('GET', endpoint);
  },

  post(endpoint, body) {
    return this.request('POST', endpoint, body);
  },

  put(endpoint, body) {
    return this.request('PUT', endpoint, body);
  },

  delete(endpoint) {
    return this.request('DELETE', endpoint);
  }
};

// Mantener sesión para compatibilidad
const session = Auth.getSession();
}

function renderPagos(pagos) {
  const tbody = document.getElementById('pagosTableBody');
  if (!tbody) return;
  tbody.innerHTML = pagos.map(p => `
    <tr>
      <td>${p.id}</td>
      <td>${p.clienteNombre}</td>
      <td>#${p.loteId}</td>
      <td>${Fmt.money(p.monto)}</td>
      <td>${Fmt.datetime(p.fecha)}</td>
      <td>${p.nota || '—'}</td>
      <td>
        <button class="btn btn-sm btn-primary" onclick="openComprobante(${p.id})">Ver</button>
      </td>
    </tr>`).join('');
  // CAMBIA ESTA LÍNEA:
  // const total = pagos.reduce((sum, pago) => sum + Number(pago.monto || 0), 0);

  // POR ESTO:
  const total = pagos.reduce((sum, pago) => {
    let monto = pago.monto;
    if (typeof monto === 'string') {
      // Elimina símbolo de dólar, puntos, comas, espacios y deja solo números y punto decimal
      monto = monto.replace(/[^0-9,.-]+/g, '').replace(/\./g, '').replace(',', '.');
    }
    console.log('Original:', pago.monto, 'Procesado:', monto);
    monto = Number(monto) || 0;
    return sum + monto;
  }, 0);

  document.getElementById('totalRecaudado').textContent = `$${total.toLocaleString('es-CO')}`;
}

async function cargarLotesParaPago() {
  const res = await fetch('http://localhost:3000/api/lotes');
  const lotes = await res.json();
  const lotesDisponibles = lotes.filter(lote => lote.estado !== 'vendido');
  const select = document.getElementById('selectLotePago');
  select.innerHTML = lotesDisponibles.map(lote =>
    `<option value="${lote.id}">Lote #${lote.id} - ${lote.ubicacion} (${lote.estado})</option>`
  ).join('');
}
