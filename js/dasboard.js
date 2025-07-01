import { supabase } from './../supabase.js'

const borderColors = [
  'border-blue-500',
  'border-green-500',
  'border-yellow-500',
  'border-red-500',
  'border-purple-500',
  'border-pink-500',
  'border-orange-500'
]

document.addEventListener('DOMContentLoaded', async () => {
  // 🔐 Obtener usuario logueado
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      console.error("❌ Sesión no válida.")
      window.location.href = 'login.html'
      return
    }

    // 👤 Obtener datos del usuario
    const { data: usuario, error: usuarioError } = await supabase
      .from('usuarios')
      .select('*')
      .eq('id', user.id)
      .maybeSingle()

    console.log(usuario);
  
    if (usuarioError) {
      console.error('Error al obtener datos del usuario:', usuarioError)
    } else if (!usuario) {
      console.warn('⚠️ Usuario sin datos en "usuarios"')
    } else {
      const elemento = document.querySelector('.nombre-encargado')
      const nombre = usuario.nombre_encargado || 'Encargado'
      elemento.innerHTML = `<span class="size-15">Hola</span>, <span class="size-15">${nombre}</span> <span id="wave">👋</span>`
      elemento.classList.add('judson')

      // ✅ MOSTRAR MESEROS SI ES ENCARGADO
      if (usuario.rol === 'encargado') {
        console.log('🧭 Buscando meseros con restaurante:', usuario.nombre_restaurante)

        const { data: meseros, error: meserosError } = await supabase
          .from('usuarios')
          .select('*')
          .eq('nombre_restaurante', usuario.nombre_restaurante)
          .eq('rol', 'mesero')

        if (meserosError) {
          console.error('❌ Error buscando meseros:', meserosError)
        } else {

          const contenedor = document.getElementById('lista-meseros')
          if (!contenedor) {
            console.warn('⚠️ Elemento con id "lista-meseros" no encontrado en el HTML')
          } else {
            contenedor.innerHTML = ''
            if (meseros.length === 0) {
              contenedor.innerHTML = '<li class="text-gray-500 italic">No hay meseros registrados aún.</li>'
            } else {
              meseros.forEach(mesero => {
                const li = document.createElement('li')
                li.textContent = `${mesero.nombre_encargado || 'Sin nombre'} (${mesero.celular})`
                contenedor.appendChild(li)
              })
            }
          }
        }
      }

      // ⚙️ Solo ahora que todo está listo, llama al resto
      await cargarCategorias()
      await mostrarResumenCategorias()
    }

    // 📋 Menú desplegable
    const menuIcon = document.getElementById('menu-icon')
    const dropdown = document.getElementById('dropdown-menu')

    menuIcon.addEventListener('click', () => {
      dropdown.classList.toggle('hidden')
    })

    document.addEventListener('click', (e) => {
      if (!menuIcon.contains(e.target) && !dropdown.contains(e.target)) {
        dropdown.classList.add('hidden')
      }
    })

    document.getElementById('logout').addEventListener('click', async () => {
      await supabase.auth.signOut()
      window.location.href = 'login.html'
    })
})

// Crear categoría
document.getElementById('form-categoria').addEventListener('submit', async (e) => {
  e.preventDefault()
  const input = document.getElementById('nombre-categoria')
  const nombre = input.value.trim()

  if (!nombre) return

  const { data: { user } } = await supabase.auth.getUser()

  const { error } = await supabase.from('categorias').insert([
    {
      nombre,
      usuario_id: user.id
    }
  ])

  if (error) {
    console.error('❌ Error al crear categoría:', error)
    mostrarToast('❌ Error al guardar categoría.', 'error')
  } else {
    mostrarToast('✅ Categoría guardada.', 'success')
    input.value = ''
    await cargarCategorias()
    await mostrarResumenCategorias()
  }
})

// Ver categorias
async function cargarCategorias() {
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) return

  const { data: categorias, error } = await supabase
    .from('categorias')
    .select('*')
    .eq('usuario_id', user.id)

  if (error) {
    console.error('❌ Error al obtener categorías:', error)
    return
  }

  const select = document.getElementById('categoria-plato')
  select.innerHTML = '<option value="">Selecciona una categoría</option>' // Limpiar

  categorias.forEach(cat => {
    const option = document.createElement('option')
    option.value = cat.id
    option.textContent = cat.nombre
    select.appendChild(option)
  })
}

// Crear plato
document.getElementById('form-plato').addEventListener('submit', async (e) => {
  e.preventDefault()

  const nombre = document.getElementById('nombre-plato').value.trim()
  const descripcion = document.getElementById('descripcion-plato').value.trim()
  const precio = parseFloat(document.getElementById('precio-plato').value)
  const personas = parseInt(document.getElementById('personas-plato').value)
  const categoriaId = document.getElementById('categoria-plato').value

  const archivo = document.getElementById('imagen-plato').files[0] // 👈 archivo seleccionado

  if (!nombre || !descripcion || isNaN(precio) || isNaN(personas) || !archivo) {
    mostrarToast('⚠️ Debes llenar todos los campos correctamente.', 'error')
    return
  }

  if (!categoriaId) {
    mostrarToast('⚠️ Debes seleccionar una categoría.', 'error')
    return
  }

  const { data: { user } } = await supabase.auth.getUser()

  // Subir imagen a Supabase Storage
  const nombreArchivo = `imagenes/${Date.now()}-${archivo.name}`
  const { error: errorUpload } = await supabase.storage
    .from('platos') // Asegúrate de que el bucket se llama 'platos'
    .upload(nombreArchivo, archivo)

  if (errorUpload) {
    console.error('❌ Error al subir imagen:', errorUpload)
    mostrarToast('❌ Error al subir imagen.', 'error')
    return
  }

  // Obtener URL pública
  const { data: urlData } = supabase
    .storage
    .from('platos')
    .getPublicUrl(nombreArchivo)

  const imagen_url = urlData.publicUrl

  // Insertar plato en la base de datos
  const { error } = await supabase.from('platos').insert([{
    nombre,
    descripcion,
    precio,
    personas,
    imagen_url,
    categoria_id: categoriaId,
    usuario_id: user.id
  }])

  if (error) {
    mostrarToast('❌ Error al guardar el plato.', 'error')
    console.error(error)
  } else {
    mostrarToast('✅ Plato guardado con éxito.')
    e.target.reset()
  }
})

// Resumen categorias
async function mostrarResumenCategorias() {
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) return

  const { data: categorias, error } = await supabase
    .from('categorias')
    .select('*')
    .eq('usuario_id', user.id)

  if (error) {
    console.error('❌ Error al obtener categorías:', error)
    return
  }

  const contenedor = document.querySelector('.categorias-resumen')
  contenedor.innerHTML = '' // Limpiar contenido previo

  categorias.forEach((cat, index) => {
    const borderColor = borderColors[index % borderColors.length]

    const div = document.createElement('div')
    div.className = `categoria-item bg-white p-4 rounded shadow hover:shadow-md transition duration-300 border-l-4 ${borderColor} cursor-pointer mb-2`

    div.innerHTML = `
      <h3 class="text-lg font-bold text-gray-800">${cat.nombre}</h3>
      <div class="contenido-categoria mt-2 hidden" data-categoria-id="${cat.id}"></div>
    `

    div.addEventListener('click', async () => {
      const actual = div.querySelector('.contenido-categoria')
      const yaVisible = !actual.classList.contains('hidden')

      // 🔁 Ocultar todos los demás
      document.querySelectorAll('.contenido-categoria').forEach(el => {
        el.classList.add('hidden')
        el.innerHTML = ''
      })

      // Toggle: si ya estaba visible, lo ocultamos todo
      if (yaVisible) return

      actual.classList.remove('hidden')
      actual.innerHTML = `<p class="text-gray-500 text-sm italic">Cargando platos...</p>`

      const { data: platos, error: platosError } = await supabase
        .from('platos')
        .select('*')
        .eq('categoria_id', cat.id)

      if (platosError) {
        console.error('❌ Error al cargar platos:', platosError)
        actual.innerHTML = `<p class="text-red-500 text-sm">Error al cargar platos</p>`
        return
      }

      if (!platos.length) {
        actual.innerHTML = `<p class="text-gray-500 text-sm italic">No hay platos en esta categoría.</p>`
        return
      }

      // Renderizar platos
      actual.innerHTML = ''
      platos.forEach(plato => {
        const platoDiv = document.createElement('div')
        platoDiv.className = 'mt-2 p-3 border rounded bg-gray-50'

        platoDiv.innerHTML = `
            <div class="flex flex-col text-left">
            <span class="font-semibold text-gray-700 text-lg">${plato.nombre}</span>

            <label class="text-sm text-gray-800 mt-2 font-semibold inter">Descripción</label>
            <p class="text-sm text-gray-600 mb-2">${plato.descripcion}</p>

            <p class="text-sm text-gray-800 font-semibold mb-3">
                Precio: <span class="inter red-color">${plato.precio.toLocaleString('es-CO', {
                    style: 'currency',
                    currency: 'COP',
                    minimumFractionDigits: 0
                })}</span> |
                Personas: <span class="font-normal text-black">${plato.personas}</span>
            </p>

            <img src="${plato.imagen_url}" alt="${plato.nombre}" class="w-full mt-2 rounded shadow-sm cursor-pointer open-image" />

            `

        actual.appendChild(platoDiv)
      })
    })

    contenedor.appendChild(div)
  })
}

// Modal notificación
function mostrarToast(mensaje, tipo = 'success') {
  const toast = document.getElementById('toast')
  const mensajeSpan = document.getElementById('toast-message')

  mensajeSpan.textContent = mensaje
  toast.className = `fixed top-4 right-4 z-50 px-4 py-3 rounded shadow-lg text-white text-sm transition-all duration-500 toast-${tipo}`
  toast.classList.remove('hidden', 'opacity-0', '-translate-y-10')
  toast.classList.add('opacity-100', 'translate-y-0')

  setTimeout(() => {
    toast.classList.add('opacity-0', '-translate-y-10')
    setTimeout(() => toast.classList.add('hidden'), 300)
  }, 3000)
}

// Mostrar imagen en modal
document.addEventListener('click', function (e) {
  if (e.target.classList.contains('open-image')) {
    const modal = document.getElementById('modal-imagen')
    const imagen = document.getElementById('imagen-grande')

    imagen.src = e.target.src
    modal.classList.remove('hidden')
  }
})

// Cerrar modal solo si se hace clic FUERA del contenido
document.getElementById('modal-imagen').addEventListener('click', function (e) {
  // Si se hace clic directamente sobre el fondo (el modal), cerrar
  if (e.target.id === 'modal-imagen') {
    e.stopPropagation()
    document.getElementById('modal-imagen').classList.add('hidden')
  }
})



