// =====================================================
// Calculadora web - lógica en JavaScript
// =====================================================

// ----- 1. Estado de la calculadora -----
let numeroActual = "0";   // número que se está escribiendo (texto)
let numeroAnterior = null; // primer número de la operación
let operadorActual = null; // "+", "-", "*" o "/"
let reiniciarPantalla = false; // true si el próximo dígito empieza un número nuevo
let hayError = false;      // true si ocurrió un error (por ejemplo, dividir entre 0)

const MAX_DIGITOS = 15;

// Símbolos bonitos para mostrar en el historial
const SIMBOLOS = { "+": "+", "-": "−", "*": "×", "/": "÷" };

// ----- 2. Referencias al HTML -----
const pantallaResultado = document.getElementById("resultado");
const pantallaHistorial = document.getElementById("historial");

// ----- 3. Funciones auxiliares -----

// Muestra en pantalla el número actual y el historial
function actualizarPantalla(textoHistorial = "") {
  pantallaResultado.textContent = numeroActual;
  pantallaHistorial.textContent = textoHistorial;
}

// Realiza una operación entre dos números. Devuelve null si no es posible.
function operar(a, b, operador) {
  switch (operador) {
    case "+": return a + b;
    case "-": return a - b;
    case "*": return a * b;
    case "/": return b === 0 ? null : a / b; // no se puede dividir entre 0
    default:  return b;
  }
}

// Convierte un número a texto, quitando errores de decimales (0.1 + 0.2)
function formatear(numero) {
  return String(parseFloat(numero.toFixed(10)));
}

// Muestra un mensaje de error
function mostrarError(mensaje) {
  hayError = true;
  numeroActual = mensaje;
  numeroAnterior = null;
  operadorActual = null;
  reiniciarPantalla = true;
  actualizarPantalla();
}

// ----- 4. Acciones de la calculadora -----

function agregarNumero(digito) {
  if (hayError) limpiar();
  if (reiniciarPantalla) {
    numeroActual = "0";
    reiniciarPantalla = false;
  }
  if (numeroActual.replace(/[-.]/g, "").length >= MAX_DIGITOS) return;

  // Si el número es "0", se reemplaza; si no, se agrega al final
  numeroActual = numeroActual === "0" ? digito : numeroActual + digito;
  actualizarPantalla(pantallaHistorial.textContent);
}

function agregarPunto() {
  if (hayError) limpiar();
  if (reiniciarPantalla) {
    numeroActual = "0";
    reiniciarPantalla = false;
  }
  // Solo se permite un punto decimal por número
  if (!numeroActual.includes(".")) {
    numeroActual += ".";
  }
  actualizarPantalla(pantallaHistorial.textContent);
}

function elegirOperador(operador) {
  if (hayError) return;

  // Si ya había una operación pendiente, se resuelve primero (ej: 2 + 3 + ...)
  if (operadorActual !== null && !reiniciarPantalla) {
    const resultado = operar(numeroAnterior, parseFloat(numeroActual), operadorActual);
    if (resultado === null) return mostrarError("No se puede dividir entre 0");
    numeroActual = formatear(resultado);
  }

  numeroAnterior = parseFloat(numeroActual);
  operadorActual = operador;
  reiniciarPantalla = true;
  actualizarPantalla(`${formatear(numeroAnterior)} ${SIMBOLOS[operador]}`);
}

function calcular() {
  if (hayError || operadorActual === null || reiniciarPantalla) return;

  const segundoNumero = parseFloat(numeroActual);
  const resultado = operar(numeroAnterior, segundoNumero, operadorActual);
  if (resultado === null) return mostrarError("No se puede dividir entre 0");

  const historial = `${formatear(numeroAnterior)} ${SIMBOLOS[operadorActual]} ${formatear(segundoNumero)} =`;
  numeroActual = formatear(resultado);
  numeroAnterior = null;
  operadorActual = null;
  reiniciarPantalla = true;
  actualizarPantalla(historial);
}

function limpiar() {
  numeroActual = "0";
  numeroAnterior = null;
  operadorActual = null;
  reiniciarPantalla = false;
  hayError = false;
  actualizarPantalla("");
}

function retroceso() {
  if (hayError) return limpiar();
  if (reiniciarPantalla) return; // no se borra un resultado ya calculado

  // Quita el último carácter; si queda vacío (o solo "-"), vuelve a "0"
  numeroActual = numeroActual.slice(0, -1);
  if (numeroActual === "" || numeroActual === "-") numeroActual = "0";
  actualizarPantalla(pantallaHistorial.textContent);
}

function cambiarSigno() {
  if (hayError || numeroActual === "0") return;
  numeroActual = numeroActual.startsWith("-") ? numeroActual.slice(1) : "-" + numeroActual;
  actualizarPantalla(pantallaHistorial.textContent);
}

function porcentaje() {
  if (hayError) return;
  numeroActual = formatear(parseFloat(numeroActual) / 100);
  actualizarPantalla(pantallaHistorial.textContent);
}

// ----- 5. Eventos del mouse (clic en los botones) -----
document.querySelector(".teclado").addEventListener("click", (evento) => {
  const boton = evento.target.closest("button");
  if (!boton) return;

  const tipo = boton.dataset.tipo;
  const valor = boton.dataset.valor;

  switch (tipo) {
    case "numero":     agregarNumero(valor); break;
    case "punto":      agregarPunto(); break;
    case "operador":   elegirOperador(valor); break;
    case "igual":      calcular(); break;
    case "limpiar":    limpiar(); break;
    case "retroceso":  retroceso(); break;
    case "signo":      cambiarSigno(); break;
    case "porcentaje": porcentaje(); break;
  }
});

// ----- 6. Eventos del teclado físico -----
document.addEventListener("keydown", (evento) => {
  const tecla = evento.key;

  if (tecla >= "0" && tecla <= "9") agregarNumero(tecla);
  else if (tecla === "." || tecla === ",") agregarPunto();
  else if (["+", "-", "*", "/"].includes(tecla)) {
    evento.preventDefault(); // evita atajos del navegador con "/"
    elegirOperador(tecla);
  }
  else if (tecla === "Enter" || tecla === "=") {
    evento.preventDefault();
    calcular();
  }
  else if (tecla === "Backspace") retroceso();
  else if (tecla === "Escape" || tecla === "Delete") limpiar();
  else if (tecla === "%") porcentaje();
});

// Pantalla inicial
actualizarPantalla();
