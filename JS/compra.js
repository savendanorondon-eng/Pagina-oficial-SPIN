const seleccionadas = new Map();

let pagoExitoso = false;
let temporizadorPago = null;

function formatearPrecio(numero) {
    return '$' + String(numero).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

function leerPrecio(texto) {
    return Number(texto.replace(/\D/g, ''));
}

function marcarPlan(plan, activo) {
    plan.classList.toggle('seleccionado', activo);
    plan.setAttribute('aria-pressed', String(activo));
}

document.addEventListener('click', function (evento) {
    const plan = evento.target.closest('.plan');
    if (plan) {
    alternarPlan(plan);
    return;
}

const quitar = evento.target.closest('[data-quitar]');
    if (quitar) {
    quitarPlan(quitar.dataset.quitar);
    return;
}

if (evento.target.closest('#go')) {
    if (seleccionadas.size === 0) return;
    mostrarFormularioPago();
    obtenerDialogo().showModal();
    }
});

document.addEventListener('keydown', function (evento) {
    if (evento.key !== 'Enter' && evento.key !== ' ') return;

    const plan = evento.target;
    if (!plan.classList || !plan.classList.contains('plan')) return;

    evento.preventDefault();
    alternarPlan(plan);
});

function alternarPlan(plan){
    const id = plan.id;

    if (seleccionadas.has(id)){
    seleccionadas.delete(id);
    marcarPlan(plan, false);
} else {
    const parrafos = plan.querySelectorAll('p');
    const nombre = plan.querySelector('h3').textContent.trim();
    const precio = leerPrecio(parrafos[parrafos.length - 1].textContent);

    seleccionadas.set(id, { nombre: nombre, precio: precio });
    marcarPlan(plan, true);
}

actualizarResumen();
}

function quitarPlan(id) {
    seleccionadas.delete(id);

    const plan = document.getElementById(id);
    if (plan) marcarPlan(plan, false);

    actualizarResumen();
}

function totalActual() {
    let total = 0;
    seleccionadas.forEach(function (plan) {
        total += plan.precio;
    });
    return total;
}

function actualizarResumen() {
    const itemsEl = document.getElementById('items');
    const totalEl = document.getElementById('total');
    const botonPago = document.getElementById('go');

    itemsEl.innerHTML = '';

    if (seleccionadas.size === 0) {
    itemsEl.innerHTML = '<p class="inicio">Aún no has seleccionado ningún plan.</p>';
    totalEl.innerHTML = '<strong>$0</strong>';
    botonPago.disabled = true;
    return;
}

seleccionadas.forEach(function (plan, id) {
    const fila = document.createElement('div');
    fila.className = 'item';
    fila.innerHTML =
        '<span>' + plan.nombre + '</span>' +
        '<span>' + formatearPrecio(plan.precio) + ' ' +
        '<button type="button" data-quitar="' + id + '" aria-label="Quitar ' + plan.nombre + '">×</button>' +
        '</span>';
    itemsEl.appendChild(fila);
});

    totalEl.innerHTML = '<strong>' + formatearPrecio(totalActual()) + '</strong>';
    botonPago.disabled = false;
}

function marcarPestanaActual() {
    const enlaces = document.querySelectorAll('.elige a');
    if (enlaces.length === 0) return;

    const pagina = location.pathname.split('/').pop().toLowerCase();
    let actual = enlaces[0];

    enlaces.forEach(function (enlace) {
    if (enlace.getAttribute('href').toLowerCase() === pagina) actual = enlace;
    });

    actual.classList.add('activo');
}

function iniciar() {
    document.querySelectorAll('.plan').forEach(function (plan) {
        plan.tabIndex = 0;
        plan.setAttribute('role', 'button');
        plan.setAttribute('aria-pressed', 'false');
    });

    marcarPestanaActual();
    actualizarResumen();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', iniciar);
}   else {
    iniciar();
}

function obtenerDialogo() {
  let dlg = document.getElementById('dlg');
 
  if (!dlg) {
    dlg = document.createElement('dialog');
    dlg.id = 'dlg';
    dlg.innerHTML = '<div class="dlg" id="dbody"></div>';
    document.body.appendChild(dlg);
 
    dlg.addEventListener('click', function (evento) {
      if (evento.target === dlg) dlg.close();
    });
 
    dlg.addEventListener('close', function () {
      clearTimeout(temporizadorPago);
 
      if (pagoExitoso) {
        pagoExitoso = false;
        vaciarCarrito();
      }
    });
  }
 
  return dlg;
}
 
function cuerpoDialogo() {
  obtenerDialogo();
  return document.getElementById('dbody');
}
 
function metodoPagoElegido() {
  const radio = document.querySelector('input[name="metodo"]:checked');
  return radio ? radio.value : 'pse';
}
 
function nombreMetodoPago(valor) {
  const nombres = {
    pse: 'Transferencia con PSE',
    efecty: 'Efecty',
    credito: 'Tarjeta de Crédito',
    debito: 'Tarjeta de Débito',
    bancolombia: 'Transferencia Bancolombia',
  };
  return nombres[valor] || valor;
}
 
function mostrarFormularioPago() {
  pagoExitoso = false;
 
  const metodo = metodoPagoElegido();
  const esTarjeta = metodo === 'credito' || metodo === 'debito';
 
  cuerpoDialogo().innerHTML = `
    <h3>Completa tus datos</h3>
    <p class="metodo-elegido">Pagando con ${nombreMetodoPago(metodo)}</p>
 
    <form id="form-pago" novalidate>
      <label class="f">
        Nombre completo
        <input type="text" id="nombre" autocomplete="name" required>
      </label>
 
      <label class="f">
        Correo electrónico
        <input type="email" id="correo" autocomplete="email" required>
      </label>
 
      ${esTarjeta ? `
        <label class="f">
          Número de tarjeta
          <input type="text" id="tarjeta" inputmode="numeric" maxlength="19" placeholder="0000 0000 0000 0000" autocomplete="cc-number" required>
        </label>
 
        <div class="row">
          <label class="f">
            Vencimiento
            <input type="text" id="vencimiento" inputmode="numeric" placeholder="MM/AA" maxlength="5" autocomplete="cc-exp" required>
          </label>
          <label class="f">
            CVV
            <input type="text" id="cvv" inputmode="numeric" maxlength="4" autocomplete="cc-csc" required>
          </label>
        </div>
      ` : ''}
 
      <p class="er" id="error-pago" style="display:none;"></p>
 
      <div class="dlg-total">
        <span>Total a pagar</span>
        <b>${formatearPrecio(totalActual())}</b>
      </div>
 
      <button type="submit" class="cta">Pagar ${formatearPrecio(totalActual())}</button>
      <button type="button" class="ghost" id="cancelar-pago">Cancelar</button>
    </form>
  `;
 
  document.getElementById('form-pago').addEventListener('submit', procesarPago);
  document.getElementById('cancelar-pago').addEventListener('click', function () {
    obtenerDialogo().close();
  });
 
  if (esTarjeta) activarFormatoTarjeta();
}
 
function activarFormatoTarjeta() {
  const tarjeta = document.getElementById('tarjeta');
  const vencimiento = document.getElementById('vencimiento');
  const cvv = document.getElementById('cvv');
 
  tarjeta.addEventListener('input', function () {
    const digitos = tarjeta.value.replace(/\D/g, '').slice(0, 16);
    tarjeta.value = digitos.replace(/(\d{4})(?=\d)/g, '$1 ');
  });
 
  vencimiento.addEventListener('input', function () {
    let digitos = vencimiento.value.replace(/\D/g, '').slice(0, 4);
    if (digitos.length > 2) digitos = digitos.slice(0, 2) + '/' + digitos.slice(2);
    vencimiento.value = digitos;
  });
 
  cvv.addEventListener('input', function () {
    cvv.value = cvv.value.replace(/\D/g, '').slice(0, 4);
  });
}
 
function mostrarError(mensaje) {
  const errorEl = document.getElementById('error-pago');
  errorEl.textContent = mensaje;
  errorEl.style.display = 'block';
}
 
function correoValido(correo) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo);
}
 
function vencimientoValido(texto) {
  const partes = /^(\d{2})\/(\d{2})$/.exec(texto);
  if (!partes) return false;
 
  const mes = Number(partes[1]);
  const anio = 2000 + Number(partes[2]);
  if (mes < 1 || mes > 12) return false;
 
  return new Date(anio, mes, 1) > new Date();
}
 
function procesarPago(evento) {
  evento.preventDefault();
 
  const nombre = document.getElementById('nombre').value.trim();
  const correo = document.getElementById('correo').value.trim();
  const tarjetaInput = document.getElementById('tarjeta');
 
  if (!nombre) {
    mostrarError('Escribe tu nombre completo.');
    return;
  }
 
  if (!correoValido(correo)) {
    mostrarError('Escribe un correo válido.');
    return;
  }
 
  if (tarjetaInput) {
    const numero = tarjetaInput.value.replace(/\s/g, '');
    const vencimiento = document.getElementById('vencimiento').value.trim();
    const cvv = document.getElementById('cvv').value.trim();
 
    if (numero.length < 13) {
      mostrarError('El número de tarjeta no es válido.');
      return;
    }
 
    if (!vencimientoValido(vencimiento)) {
      mostrarError('La fecha de vencimiento no es válida o ya pasó.');
      return;
    }
 
    if (!/^\d{3,4}$/.test(cvv)) {
      mostrarError('El CVV debe tener 3 o 4 números.');
      return;
    }
  }
 
  cuerpoDialogo().innerHTML = '<div class="center"><p>Procesando tu pago...</p></div>';
 
  temporizadorPago = setTimeout(mostrarExito, 1800);
}
 
function generarReferencia() {
  const letras = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let codigo = '';
  for (let i = 0; i < 6; i++) {
    codigo += letras[Math.floor(Math.random() * letras.length)];
  }
  return 'SPIN-' + codigo;
}
 
function mostrarExito() {
  pagoExitoso = true;
  const totalPagado = formatearPrecio(totalActual());
 
  cuerpoDialogo().innerHTML = `
    <div class="center">
      <div class="ok">✅</div>
      <h3>¡Pago exitoso!</h3>
      <p class="ref">${generarReferencia()}</p>
      <p>Te enviamos la confirmación a tu correo.</p>
 
      <div class="dlg-total">
        <span>Total pagado</span>
        <b>${totalPagado}</b>
      </div>
 
      <button type="button" class="cta" id="cerrar-exito">Listo</button>
    </div>
  `;
 
  document.getElementById('cerrar-exito').addEventListener('click', function () {
    obtenerDialogo().close();
  });
}
 
function vaciarCarrito() {
  seleccionadas.clear();
  document.querySelectorAll('.plan').forEach(function (plan) {
    marcarPlan(plan, false);
  });
  actualizarResumen();
}