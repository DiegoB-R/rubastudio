<template>
  <DashboardLayout>
    <template #navbar><NavBar /></template>

    <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
      
      <div class="bg-white px-8 py-6">
        <h1 class="text-2xl font-bold text-black">Catálogo de Servicios</h1>
        <p class="text-sm text-slate-400 mt-1">Administra los tipos de cuotas, amenidades y mantenimientos</p>
      </div>

      <div class="flex items-center gap-3 px-8 py-3 bg-white border-y border-slate-200 text-sm">
        <template v-if="cargandoLista || cargando">
          <div class="w-4 h-4 rounded-full border-2 border-slate-200 border-t-indigo-500 animate-spin"></div>
          <span class="text-slate-500">Sincronizando con la base de datos…</span>
        </template>
        <template v-else>
          <span class="inline-block w-2 h-2 rounded-full bg-green-400"></span>
          <span class="text-slate-600">Sistema actualizado</span>
          <span class="ml-auto text-xs font-semibold text-slate-500">
            Total registrados: {{ servicios.length }}
          </span>
        </template>
      </div>

      <div class="p-8 bg-slate-50/50 flex flex-col lg:flex-row gap-8">
        
        <div class="w-full lg:w-1/3">
          <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h2 class="text-lg font-bold text-slate-800 mb-4">Nuevo Servicio</h2>
            
            <form @submit.prevent="manejarSubmit" class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1">Nombre del servicio</label>
                <input type="text" v-model="formulario.nombre" required placeholder="Ej. Mantenimiento Preventivo" 
                       class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm" />
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-1">Categoría</label>
                  <select v-model="formulario.categoria" required class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm bg-white">
                    <option value="cuota">Cuota</option>
                    <option value="amenidad">Amenidad</option>
                    <option value="mantenimiento">Mantenimiento</option>
                    <option value="reparacion">Reparación</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-1">Unidad</label>
                  <select v-model="formulario.unidad" required class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm bg-white">
                    <option value="por evento">Por evento</option>
                    <option value="mensual">Mensual</option>
                    <option value="por hora">Por hora</option>
                    <option value="por metro cuadrado">Por m²</option>
                  </select>
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1">Descripción</label>
                <textarea v-model="formulario.descripcion" required rows="2" 
                          class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm"></textarea>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-1">Precio ($)</label>
                  <input type="number" step="0.01" v-model="formulario.precio" required 
                         class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-1">Duración (min)</label>
                  <input type="number" v-model="formulario.duracion" required 
                         class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm" />
                </div>
              </div>

              <div class="flex flex-col gap-2 pt-2">
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" v-model="formulario.activo" class="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500" />
                  <span class="text-sm text-slate-700 font-medium">Servicio Activo</span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" v-model="formulario.programacion" class="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500" />
                  <span class="text-sm text-slate-700 font-medium">Requiere Programación</span>
                </label>
              </div>

              <button type="submit" :disabled="cargando" 
                      class="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed">
                {{ cargando ? 'Guardando...' : 'Guardar Servicio' }}
              </button>
            </form>
          </div>
        </div>

        <div class="w-full lg:w-2/3">
          <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div class="overflow-x-auto">
              <table class="w-full text-left text-sm text-slate-600">
                <thead class="bg-slate-50 border-b border-slate-200 text-slate-800">
                  <tr>
                    <th class="px-6 py-4 font-semibold">Servicio</th>
                    <th class="px-6 py-4 font-semibold">Categoría / Unidad</th>
                    <th class="px-6 py-4 font-semibold">Precio</th>
                    <th class="px-6 py-4 font-semibold">Estado</th>
                    <th class="px-6 py-4 font-semibold text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                  <tr v-if="servicios.length === 0 && !cargandoLista">
                    <td colspan="5" class="px-6 py-8 text-center text-slate-400">
                      No hay servicios registrados en la base de datos.
                    </td>
                  </tr>
                  
                  <tr v-for="servicio in servicios" :key="servicio.id" class="hover:bg-slate-50/50 transition-colors">
                    <td class="px-6 py-4">
                      <p class="font-medium text-slate-900">{{ servicio.nombre }}</p>
                      <p class="text-xs text-slate-400 truncate max-w-[200px]" :title="servicio.descripcion">{{ servicio.descripcion }}</p>
                    </td>
                    <td class="px-6 py-4">
                      <span class="inline-block px-2 py-1 bg-slate-100 text-slate-600 rounded-md text-xs font-medium capitalize mb-1">{{ servicio.categoria }}</span>
                      <p class="text-xs text-slate-400 capitalize">{{ servicio.unidad }}</p>
                    </td>
                    <td class="px-6 py-4">
                      <p class="font-medium text-slate-900">${{ servicio.precio.toFixed(2) }}</p>
                      <p class="text-xs text-slate-400">{{ servicio.duracion }} min</p>
                    </td>
                    <td class="px-6 py-4">
                      <span v-if="servicio.activo" class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                        <span class="w-1.5 h-1.5 rounded-full bg-green-500"></span> Activo
                      </span>
                      <span v-else class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                        <span class="w-1.5 h-1.5 rounded-full bg-slate-400"></span> Inactivo
                      </span>
                    </td>
                    <td class="px-6 py-4 text-right">
                      <button @click="manejarEliminar(servicio.id)" 
                              class="text-red-500 hover:text-red-700 font-medium text-xs bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors">
                        Eliminar
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    </div>
  </DashboardLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'

/** Layouts y Componentes */
import DashboardLayout from '../layouts/DashboardLayout.vue'
import NavBar from '../components/NavBar.vue'

/** Servicios de Firebase */
import { 
  getTiposServicio, 
  crearTipoServicio, 
  eliminarTipoServicio 
} from '@/servicios/serviciosService'

// ── ESTADO ────────────────────────────────────────────────────────
const servicios = ref([])
const cargando = ref(false)
const cargandoLista = ref(true)

const estadoInicialFormulario = {
  nombre: '',
  categoria: 'cuota',
  descripcion: '',
  precio: 0,
  unidad: 'por evento',
  activo: true,
  programacion: false,
  duracion: 60
}

const formulario = ref({ ...estadoInicialFormulario })

// ── MÉTODOS ───────────────────────────────────────────────────────
const cargarDatos = async () => {
  cargandoLista.value = true
  try {
    servicios.value = await getTiposServicio()
  } catch (error) {
    alert(error.message)
  } finally {
    cargandoLista.value = false
  }
}

const manejarSubmit = async () => {
  cargando.value = true
  try {
    await crearTipoServicio(formulario.value)
    formulario.value = { ...estadoInicialFormulario }
    await cargarDatos()
  } catch (error) {
    alert(`Error: ${error.message}`)
  } finally {
    cargando.value = false
  }
}

const manejarEliminar = async (id) => {
  const confirmacion = confirm('¿Estás seguro de que deseas eliminar este servicio?')
  if (!confirmacion) return

  cargandoLista.value = true // Activar spinner mientras elimina
  try {
    await eliminarTipoServicio(id)
    await cargarDatos()
  } catch (error) {
    alert(error.message)
    cargandoLista.value = false
  }
}

// ── CICLO DE VIDA ─────────────────────────────────────────────────
onMounted(() => {
  cargarDatos()
})
</script>