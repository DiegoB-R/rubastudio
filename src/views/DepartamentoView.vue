<template>
  <DashboardLayout>
    <template #navbar>
      <NavBar />
    </template>

    <div class="bg-white rounded-2xl shadow-sm p-6">
      <!-- Encabezado -->
      <div class="flex items-center justify-between mb-6">
        <div>
          <h2 class="text-2xl font-bold text-slate-800">Departamentos</h2>
          <p class="text-sm text-slate-400 mt-0.5">
            {{ store.lista?.length || 0 }} registro{{ (store.lista?.length || 0) !== 1 ? 's' : '' }} guardado{{ (store.lista?.length || 0) !== 1 ? 's' : '' }}
          </p>
        </div>

        <button
          @click="abrirNuevo"
          class="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Nueva propiedad
        </button>
      </div>

      <!-- Alertas de estado -->
      <transition name="fade">
        <div v-if="store.exito" class="flex items-center gap-2 mb-4 px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-200 text-sm text-emerald-700">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          {{ store.exito }}
        </div>
      </transition>

      <div v-if="store.error && !mostrarForm" class="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600">
        {{ store.error }}
      </div>

      <!-- Contenido Principal (Tabla + Formulario lateral) -->
      <div class="flex flex-col xl:flex-row gap-6">
        <div class="flex-1 min-w-0">
          <!-- Skeleton Loading -->
          <div v-if="store.cargando" class="flex flex-col gap-3">
            <div v-for="i in 3" :key="i" class="h-14 rounded-xl bg-slate-100 animate-pulse"></div>
          </div>

          <!-- Estado Vacío -->
          <div v-else-if="!store.lista || store.lista.length === 0" class="flex flex-col items-center justify-center py-16 text-slate-400 text-sm gap-2">
            <span>Sin departamentos registrados</span>
          </div>

          <!-- Tabla de Resultados -->
          <div v-else class="overflow-x-auto rounded-xl border border-slate-100">
            <table class="w-full text-sm">
              <thead>
                <tr class="bg-slate-50 text-slate-500 text-xs uppercase tracking-wide">
                  <th class="text-left px-4 py-3 font-medium">Departamento</th>
                  <th class="text-left px-4 py-3 font-medium">Ubicación</th>
                  <th class="text-left px-4 py-3 font-medium">Inquilino</th>
                  <th class="text-left px-4 py-3 font-medium">Estado</th>
                  <th class="text-left px-4 py-3 font-medium">Renta</th>
                  <th class="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                <tr v-for="depto in store.lista" :key="depto.id" class="hover:bg-slate-50 transition-colors">
                  <td class="px-4 py-3 font-medium text-slate-800">
                    {{ depto.nombre || `Departamento ${depto.numero || ''}` }}
                  </td>
                  <td class="px-4 py-3 text-slate-600">
                    {{ getNombreUbicacion(depto.ubicacionId) }}
                  </td>
                  <td class="px-4 py-3 text-slate-600">
                    {{ getNombreInquilino(depto.inquilinoId) }}
                  </td>
                  <td class="px-4 py-3">
                    <span class="px-2.5 py-1 rounded-full text-xs font-medium" :class="estadoClase(depto.estado)">
                      {{ estadoEtiqueta(depto.estado) }}
                    </span>
                  </td>
                  <td class="px-4 py-3 font-semibold text-slate-800 whitespace-nowrap">
                    {{ formatearMoneda(depto.rentaMensual) }}
                  </td>
                  <td class="px-4 py-3 whitespace-nowrap">
                    <div class="flex items-center gap-1 justify-end">
                      <button
                        @click="editar(depto.id)"
                        class="p-2 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                        title="Editar"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                          <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                        </svg>
                      </button>
                      <button
                        @click="confirmarEliminar(depto)"
                        class="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        title="Eliminar"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Formulario Lateral -->
        <transition name="slide">
          <div v-if="mostrarForm" class="w-full xl:w-[500px] shrink-0 border border-slate-200 rounded-2xl overflow-hidden flex flex-col bg-white">
            <div class="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h3 class="text-sm font-bold text-slate-700 uppercase tracking-wide">
                {{ store.modoEdicion ? 'Editar propiedad' : 'Nueva propiedad' }}
              </h3>
              <button
                @click="cerrarForm"
                class="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
                aria-label="Cerrar"
              >
                ×
              </button>
            </div>

            <div class="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-6">
              <div v-if="store.error" class="px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-600">
                {{ store.error }}
              </div>

              <!-- Inquilino -->
              <div class="flex flex-col gap-2">
                <span class="text-xs font-bold text-indigo-600 uppercase tracking-wide">Inquilino (opcional)</span>
                <CampoSelect v-model="store.form.inquilinoId" label="Asociar inquilino">
                  <option value="">Seleccione un inquilino</option>
                  <option v-for="i in inquilinoStore.lista" :key="i.id" :value="i.id">
                    {{ i.nombre }} {{ i.apellidos }}
                  </option>
                </CampoSelect>
              </div>

              <!-- Edificio / Ubicación -->
              <div class="flex flex-col gap-2">
                <span class="text-xs font-bold text-indigo-600 uppercase tracking-wide">Edificio / Ubicación</span>
                <CampoSelect v-model="store.form.ubicacionId" label="Asociar ubicación">
                  <option value="" disabled selected>Seleccione una ubicación</option>
                  <option v-for="u in ubicacionStore.lista" :key="u.id" :value="u.id">
                    {{ u.nombre }} ({{ u.ciudad }})
                  </option>
                </CampoSelect>
              </div>

              <!-- Disponibilidad -->
              <div class="flex flex-col gap-2">
                <span class="text-xs font-bold text-indigo-600 uppercase tracking-wide">Disponibilidad</span>
                <CampoSelect v-model="store.form.estado" label="Estado de operación">
                  <option value="disponible">Disponible</option>
                  <option value="ocupado">Rentado</option>
                  <option value="mantenimiento">Mantenimiento</option>
                </CampoSelect>
              </div>

              <!-- Detalles del inmueble -->
              <div class="flex flex-col gap-3">
                <span class="text-xs font-bold text-indigo-600 uppercase tracking-wide">Detalles del inmueble</span>

                <div class="grid grid-cols-2 gap-3">
                  <CampoInput v-model="store.form.numero" label="N° de departamento / local" placeholder="Ej. A-101" />
                  <CampoInput v-model="store.form.piso" label="Piso" placeholder="Ej. 2" />
                </div>

                <div class="grid grid-cols-2 gap-3">
                  <CampoSelect v-model="store.form.tipoInmueble" label="Tipo de inmueble">
                    <option value="departamento">Departamento</option>
                    <option value="local">Local</option>
                    <option value="casa">Casa</option>
                    <option value="oficina">Oficina</option>
                  </CampoSelect>
                  <CampoInput v-model.number="store.form.rentaMensual" label="Renta mensual (MXN)" type="number" placeholder="12000" />
                </div>
              </div>

              <!-- Distribución -->
              <div class="flex flex-col gap-2">
                <span class="text-xs font-bold text-indigo-600 uppercase tracking-wide">Distribución</span>
                <div class="grid grid-cols-3 gap-3">
                  <CampoInput v-model.number="store.form.area" label="M² área" type="number" placeholder="85" />
                  <CampoInput v-model.number="store.form.habitaciones" label="Habitaciones" type="number" placeholder="2" />
                  <CampoInput v-model.number="store.form.banos" label="Baños" type="number" placeholder="1.5" />
                </div>
              </div>

              <!-- Notas internas -->
              <div class="flex flex-col gap-2">
                <span class="text-xs font-bold text-indigo-600 uppercase tracking-wide">Notas internas</span>
                <textarea
                  v-model="store.form.notas"
                  rows="3"
                  placeholder="Especificaciones estructurales, medidores de agua, luz…"
                  class="rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
                ></textarea>
              </div>
            </div>

            <div class="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50">
              <button
                @click="cerrarForm"
                class="px-5 py-2 rounded-xl border border-slate-200 text-sm text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Cancelar
              </button>
              <button
                @click="ejecutarGuardar"
                :disabled="store.guardando"
                class="px-6 py-2 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-60 transition-colors flex items-center gap-2"
              >
                <div v-if="store.guardando" class="w-3.5 h-3.5 rounded-full border-2 border-white/40 border-t-white animate-spin"></div>
                {{ store.guardando ? 'Guardando…' : store.modoEdicion ? 'Actualizar' : 'Dar de alta' }}
              </button>
            </div>
          </div>
        </transition>
      </div>

      <!-- Modal de Confirmación de Eliminación -->
      <div
        v-if="itemAEliminar"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        style="background:rgba(0,0,0,0.35)"
        @click.self="itemAEliminar = null"
      >
        <div class="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm">
          <h4 class="text-base font-semibold text-slate-800 mb-2">¿Eliminar departamento?</h4>
          <p class="text-sm text-slate-500 mb-6">
            Se eliminará <strong class="text-slate-700">{{ itemAEliminar.nombre || 'este registro' }}</strong> de forma permanente.
          </p>
          <div class="flex justify-end gap-3">
            <button
              @click="itemAEliminar = null"
              class="px-5 py-2 rounded-xl border border-slate-200 text-sm text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancelar
            </button>
            <button
              @click="ejecutarEliminar"
              :disabled="store.eliminando"
              class="px-5 py-2 rounded-xl bg-red-600 text-white text-sm font-medium hover:bg-red-700 disabled:opacity-60 transition-colors flex items-center gap-2"
            >
              <div v-if="store.eliminando" class="w-3.5 h-3.5 rounded-full border-2 border-white/40 border-t-white animate-spin"></div>
              {{ store.eliminando ? 'Eliminando…' : 'Sí, eliminar' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useDepartamentoStore } from '@/stores/departamentoStore'
import { useUbicacionStore } from '@/stores/ubicacionStore'
import { useInquilinoStore } from '@/stores/inquilinoStore'
import CampoInput from '@/components/CampoInput.vue'
import CampoSelect from '@/components/CampoSelect.vue'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import NavBar from '@/components/NavBar.vue'

const store = useDepartamentoStore()
const ubicacionStore = useUbicacionStore()
const inquilinoStore = useInquilinoStore()

const mostrarForm = ref(false)
const itemAEliminar = ref(null)

onMounted(() => {
  store.cargarLista()
  ubicacionStore.cargarLista()
  inquilinoStore.cargarLista()
})

function abrirNuevo() {
  store.iniciarCrear()
  mostrarForm.value = true
}

async function editar(id) {
  await store.iniciarEditar(id)
  mostrarForm.value = true
}

function cerrarForm() {
  mostrarForm.value = false
  store.iniciarCrear()
}

function confirmarEliminar(item) {
  itemAEliminar.value = item
}

async function ejecutarEliminar() {
  if (!itemAEliminar.value) return
  await store.eliminar(itemAEliminar.value.id)
  itemAEliminar.value = null
}

async function ejecutarGuardar() {
  const exito = await store.guardar()
  if (exito) {
    mostrarForm.value = false
  }
}

function getNombreUbicacion(id) {
  if (!id) return 'Sin ubicación'
  const ubicacion = ubicacionStore.lista.find(u => u.id === id)
  return ubicacion ? `${ubicacion.nombre}` : 'Desconocida'
}

function getNombreInquilino(id) {
  if (!id) return 'Sin inquilino'
  const inquilino = inquilinoStore.lista.find(i => i.id === id)
  return inquilino ? `${inquilino.nombre} ${inquilino.apellidos || ''}`.trim() : 'Desconocido'
}

function formatearMoneda(valor) {
  const numero = Number(valor)
  if (Number.isNaN(numero) || valor === '' || valor === null || valor === undefined) {
    return 'N/A'
  }
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(numero)
}

function estadoEtiqueta(estado) {
  const mapa = {
    disponible: 'Disponible',
    ocupado: 'Rentado',
    mantenimiento: 'Mantenimiento',
  }
  return mapa[estado] ?? estado ?? 'Sin estado'
}

function estadoClase(estado) {
  const mapa = {
    disponible: 'bg-emerald-50 text-emerald-700',
    ocupado: 'bg-indigo-50 text-indigo-700',
    mantenimiento: 'bg-amber-50 text-amber-700',
  }
  return mapa[estado] ?? 'bg-slate-100 text-slate-600'
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-enter-active,
.slide-leave-active {
  transition: all 0.25s ease;
}

.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  transform: translateX(16px);
}
</style>