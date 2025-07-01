import { supabase } from './../supabase.js'

let carrito = []

document.addEventListener('DOMContentLoaded', async () => {
  const params = new URLSearchParams(window.location.search)
  const categoriaId = params.get('categoria_id');

   if (!categoriaId) {
    alert('⚠️ No se proporcionó una categoría válida.')
    return
  }

  const { data: { user } } = await supabase.auth.getUser()

  const { data: encargadoLista, error: encargadoError } = await supabase
  .from('usuarios')
  .select('*')
  .eq('nombre_restaurante', usuarioActual.nombre_restaurante)
  .eq('rol', 'encargado')
  .limit(1)

const encargado = encargadoLista?.[0] || null
console.log('🧑‍💼 Encargado encontrado:', encargado)

  platos.forEach(plato => {
    const div = document.createElement('div')
    div.className = 'border rounded p-3 bg-white shadow'

    div.innerHTML = `
      <img src="${plato.imagen_url}" alt="${plato.nombre}" class="w-full h-32 object-cover mb-2 rounded" />
      <h2 class="text-lg font-semibold">${plato.nombre}</h2>
      <p class="text-sm text-gray-600 mb-1">${plato.descripcion}</p>
      <p class="text-sm text-gray-800 mb-2">Precio: $${plato.precio}</p>
      <input type="number" min="1" value="1" class="cantidad w-full border px-2 py-1 mb-2" />
      <button class="agregar bg-blue-600 text-white w-full py-1 rounded">Agregar</button>
    `

    div.querySelector('.agregar').addEventListener('click', () => {
      const cantidad = parseInt(div.querySelector('.cantidad').value)
      if (cantidad > 0) {
        carrito.push({
          nombre: plato.nombre,
          precio: plato.precio,
          cantidad
        })
        alert(`✅ ${cantidad} × ${plato.nombre} agregado`)
      }
    })

    container.appendChild(div)
  })

  document.getElementById('enviar-pedido').addEventListener('click', async () => {
    if (carrito.length === 0) {
      alert('⚠️ No hay platos seleccionados.')
      return
    }

    const pedido = {
      mesero_id: user.id,
      nombre_restaurante: usuario.nombre_restaurante,
      platos: carrito,
      estado: 'pendiente'
    }

    const { error: pedidoError } = await supabase.from('pedidos').insert([pedido])

    if (pedidoError) {
      console.error('❌ Error al enviar pedido:', pedidoError)
      alert('❌ Error al enviar pedido')
    } else {
      alert('✅ Pedido enviado con éxito')
      carrito = []
    }
  })
})
