const platos = [
  { id: 1, nombre: "Hamburguesa", descripcion: "Con queso y papas", precio: 25000, imagen: "https://via.placeholder.com/200" },
  { id: 2, nombre: "Pizza", descripcion: "Napolitana", precio: 30000, imagen: "https://via.placeholder.com/200" },
  { id: 3, nombre: "Ensalada", descripcion: "Fresca con pollo", precio: 18000, imagen: "https://via.placeholder.com/200" },
];

let pedido = [];

function renderPlatos() {
  const contenedor = document.getElementById("platos-lista");
  contenedor.innerHTML = "";
  platos.forEach(plato => {
    const card = document.createElement("div");
    card.className = "bg-white p-4 rounded-xl shadow flex flex-col items-center";

    card.innerHTML = `
      <img src="${plato.imagen}" alt="${plato.nombre}" class="w-full h-40 object-cover rounded-md mb-3" />
      <h3 class="text-lg font-semibold">${plato.nombre}</h3>
      <p class="text-sm text-gray-600">${plato.descripcion}</p>
      <strong class="text-green-600 text-lg">$${plato.precio.toLocaleString()}</strong>
      <div class="flex items-center gap-2 mt-2">
        <input type="number" min="1" value="1" id="cantidad-${plato.id}" class="w-16 border rounded px-2 py-1 text-center" />
        <button class="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600" onclick="agregarAlPedido(${plato.id})">
          Agregar
        </button>
      </div>
    `;
    contenedor.appendChild(card);
  });
}

function agregarAlPedido(platoId) {
  const inputCantidad = document.getElementById(`cantidad-${platoId}`);
  const cantidad = parseInt(inputCantidad.value) || 1;

  const plato = platos.find(p => p.id === platoId);
  const existente = pedido.find(p => p.id === platoId);
  if (existente) {
    existente.cantidad += cantidad;
  } else {
    pedido.push({ ...plato, cantidad });
  }
  renderPedido();
}

function renderPedido() {
  const lista = document.getElementById("pedido-lista");
  const total = document.getElementById("pedido-total");
  lista.innerHTML = "";
  let suma = 0;

  pedido.forEach(item => {
    const li = document.createElement("li");
    li.className = "flex justify-between border-b pb-1";
    li.textContent = `${item.nombre} x${item.cantidad}`;
    suma += item.precio * item.cantidad;
    lista.appendChild(li);
  });

  total.textContent = suma.toLocaleString();
}

document.getElementById("enviar-pedido").addEventListener("click", () => {
  if (pedido.length === 0) {
    alert("Agrega al menos un plato al pedido.");
    return;
  }

  alert("✅ Pedido enviado a cocina (aún no guardado en Supabase)");
  // Aquí luego se integrará Supabase
  pedido = [];
  renderPedido();
});

renderPlatos();
