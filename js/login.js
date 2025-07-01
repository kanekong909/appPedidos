import { supabase } from './../supabase.js'

const form = document.getElementById('login-form')
const toast = document.getElementById('login-error-toast')

form.addEventListener('submit', async (e) => {
  e.preventDefault()

  const email = form.email.value
  const password = form.password.value

  const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
    email,
    password
  })

  if (loginError) {
    if (loginError.message.includes('Invalid login credentials')) {
      mostrarToast('❌ Correo o contraseña incorrectos.')
    } else {
      mostrarToast('❌ ' + loginError.message)
    }
    return
  }

  // ✅ Usuario logueado, ahora obtener su rol
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    mostrarToast('❌ Error al obtener datos del usuario.')
    return
  }

  const { data: usuario, error: rolError } = await supabase
    .from('usuarios')
    .select('rol')
    .eq('id', user.id)
    .maybeSingle()

  if (rolError || !usuario) {
    mostrarToast('❌ No se pudo obtener el rol del usuario.')
    return
  }

  // 🚀 Redirigir según el rol
  if (usuario.rol === 'encargado') {
    window.location.href = 'dashboard.html'
  } else if (usuario.rol === 'mesero') {
    window.location.href = 'mesero.html'
  } else {
    mostrarToast('⚠️ Rol no definido. Contacta al administrador.')
  }
})

function mostrarToast(mensaje) {
  toast.textContent = mensaje
  toast.classList.remove('hidden', 'opacity-0', '-translate-y-10')
  toast.classList.add('opacity-100', 'translate-y-0')

  setTimeout(() => {
    toast.classList.add('hidden', 'opacity-0', '-translate-y-10')
  }, 3000)
}
