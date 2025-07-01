import { supabase } from './../supabase.js'

const form = document.getElementById('register-form')

form.addEventListener('submit', async (e) => {
  e.preventDefault()

  const email = form.email.value
  const password = form.password.value
  const nombre_restaurante = form.nombre_restaurante.value
  const nombre_encargado = form.nombre_encargado.value
  const celular = form.celular.value
  const direccion = form.direccion.value
  const rol = form.rol.value

  if (!rol) {
    alert('⚠️ Debes seleccionar un rol.')
    return
  }

  // Validaciones específicas por rol
  if (rol === 'encargado' && !nombre_encargado) {
    alert('⚠️ Debes ingresar el nombre del encargado.')
    return
  }

  if (rol === 'mesero' && !nombre_encargado) {
    alert('⚠️ Debes ingresar el nombre del mesero.')
    return
  }

  // 1. Registro en Supabase Auth
  const { data: signupData, error: signupError } = await supabase.auth.signUp({
    email,
    password
  })

  if (signupError) {
    alert('❌ Error al registrar: ' + signupError.message)
    return
  }

  const userId = signupData.user.id
  console.log('✅ userId que se va a guardar:', userId)

  // 2. Insertar en tabla usuarios
  const { error: insertError } = await supabase.from('usuarios').insert([
    {
      id: userId,
      nombre_restaurante,
      nombre_encargado, // usar también para meseros por simplicidad
      celular,
      direccion,
      rol
    }
  ])

  if (insertError) {
    console.error('❌ Error al insertar en usuarios:', insertError)

    const errorToast = document.getElementById('error-toast')
    errorToast.classList.remove('hidden', 'opacity-0', '-translate-y-10')
    errorToast.classList.add('opacity-100', 'translate-y-0')

    setTimeout(() => {
      errorToast.classList.add('hidden', 'opacity-0', '-translate-y-10')
    }, 4000)

  } else {
    const toast = document.getElementById('success-toast')
    toast.classList.remove('hidden')
    toast.classList.add('translate-y-0')

    setTimeout(() => {
      toast.classList.add('hidden')
      window.location.href = 'dashboard.html'
    }, 3000)
  }
})

