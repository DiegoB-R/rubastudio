import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  getDepartamentos,
  getDepartamento,
  crearDepartamento,
  actualizarDepartamento,
  eliminarDepartamento,
} from '@/services/departamentoService'

const FORM_VACIO = () => ({
  nombre: '',
  ubicacionId: '',
  numerodepto: '',
  piso: '',
  tipo: '',
  m2: '',
  habitaciones: '',
  banos: '',
  rentaMensual: '',
  estado: 'disponible',
  inquilinoId: '',
  notas: '',
})

// Corregido a CamelCase: useDepartamentoStore
export const useDepartamentoStore = defineStore('departamento', () => {

  // ── Estado ────────────────────────────────────────────────────
  const lista           = ref([])
  const seleccionada   = ref(null)
  const form           = ref(FORM_VACIO())
  const modoEdicion    = ref(false)
  const cargando       = ref(false)
  const guardando      = ref(false)
  const eliminando     = ref(false)
  const error          = ref(null)
  const exito          = ref(null)

  // ── Getters ───────────────────────────────────────────────────
  const totalDepartamentos = computed(() => lista.value.length)

  // ── Helpers ───────────────────────────────────────────────────
  function _notificar(msg) {
    exito.value = msg
    setTimeout(() => { exito.value = null }, 3500)
  }

  // ── CRUD ──────────────────────────────────────────────────────
  async function cargarLista() {
    cargando.value = true
    error.value    = null
    try {
      lista.value = await getDepartamentos()
    } catch (e) {
      error.value = e.message
    } finally {
      cargando.value = false
    }
  }

  function iniciarCrear() {
    form.value         = FORM_VACIO()
    seleccionada.value = null
    modoEdicion.value  = false
    error.value        = null
  }

  async function iniciarEditar(id) {
    error.value = null
    try {
      const data         = await getDepartamento(id)
      form.value         = { ...data }
      seleccionada.value = id
      modoEdicion.value  = true
    } catch (e) {
      error.value = e.message
    }
  }

  async function guardar() {
    guardando.value = true
    error.value     = null
    try {
      const payload = { ...form.value }

      if (modoEdicion.value) {
        const actualizada = await actualizarDepartamento(seleccionada.value, payload)
        const idx = lista.value.findIndex(u => u.id === actualizada.id)
        if (idx !== -1) lista.value[idx] = actualizada
        _notificar('Departamento actualizado correctamente.')
      } else {
        const nueva = await crearDepartamento(payload)
        lista.value.push(nueva)
        _notificar('Departamento creado correctamente.')
      }
      iniciarCrear()
      return true
    } catch (e) {
      error.value = e.message
      return false
    } finally {
      guardando.value = false
    }
  }

  async function eliminar(id) {
    eliminando.value = true
    error.value      = null
    try {
      await eliminarDepartamento(id)
      lista.value = lista.value.filter(u => u.id !== id)
      if (seleccionada.value === id) iniciarCrear()
      _notificar('Departamento eliminado.')
    } catch (e) {
      error.value = e.message
    } finally {
      eliminando.value = false
    }
  }

  return {
    lista, seleccionada, form, modoEdicion,
    cargando, guardando, eliminando,
    error, exito,
    totalDepartamentos,
    cargarLista,
    iniciarCrear, iniciarEditar,
    guardar, eliminar,
  }
})