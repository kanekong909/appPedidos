import { supabase } from './../supabase.js'

const { data: { user } } = await supabase.auth.getUser()

// Obtener info del usuario actual
const { data: usuarioActual } = await supabase
  .from('usuarios')
  .select('*')
  .eq('id', user.id)
  .single()

if (usuarioActual?.rol === 'encargado') {
  // Obtener meseros que trabajen en el mismo restaurante
  const { data: meseros, error } = await supabase
    .from('usuarios')
    .select('nombre_encargado, email, celular')
    .eq('rol', 'mesero')
    .eq('nombre_restaurante', usuarioActual.nombre_restaurante)

  if (error) {
    console.error('Error obteniendo meseros:', error)
    return
  }

  const lista = document.getElementById('meseros-lista')
  if (meseros.length === 0) {
    lista.innerHTML = '<p class="text-gray-500">No hay meseros registrados aún.</p>'
    return
  }

  meseros.forEach(mesero => {
    const card = document.createElement('div')
    card.className = 'border rounded p-4 shadow bg-white'

    card.innerHTML = `
      <p class="font-semibold text-lg">${mesero.nombre_encargado}</p>
      <p class="text-sm text-gray-600">📧 ${mesero.email}</p>
      <p class="text-sm text-gray-600">📞 ${mesero.celular}</p>
    `
    lista.appendChild(card)
  })
}

