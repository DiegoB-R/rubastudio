<template>
  <DashboardLayout>
    <template #navbar>
      <NavBar />
    </template>

    <div class="bg-white rounded-2xl shadow-sm p-6">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h2 class="text-2xl font-bold text-slate-800">Inquilinos</h2>
          <p class="text-sm text-slate-400 mt-0.5">
            {{ store.totalinquilinos }} registro{{ store.totalinquilinos !== 1 ? 's' : '' }} guardado{{ store.totalinquilinos !== 1 ? 's' : '' }}
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
          Nuevo inquilino
        </button>
      </div>

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

      <div class="flex flex-col xl:flex-row gap-6">
        <div class="flex-1 min-w-0">
          <div v-if="store.cargando" class="flex flex-col gap-3">
            <div v-for="i in 3" :key="i" class="h-14 rounded-xl bg-slate-100 animate-pulse"></div>
          </div>

          <div v-else-if="store.lista.length === 0" class="flex flex-col items-center justify-center py-16 text-slate-400 text-sm gap-2">
            <span>Sin inquilinos registrados</span>
          </div>

          <div v-else class="overflow-x-auto rounded-xl border border-slate-100">
            <table class="w-full text-sm">
              <thead>
                <tr class="bg-slate-50 text-slate-500 text-xs uppercase tracking-wide">
                  <th class="text-left px-4 py-3 font-medium">Inquilino</th>
                  <th class="text-left px-4 py-3 font-medium">Contacto</th>
                  <th class="text-left px-4 py-3 font-medium">Estado</th>
                  <th class="text-left px-4 py-3 font-medium">Renta</th>
                  <th class="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                <tr v-for="inquilino in store.lista" :key="inquilino.id" class="hover:bg-slate-50 transition-colors">
                  <td class="px-4 py-3">
                    <p class="font-medium text-slate-800">{{ nombreCompleto(inquilino) }}</p>
                    <p class="text-xs text-slate-400 mt-0.5">{{ inquilino.fechaInicio || 'Sin fecha de inicio' }}</p>
                  </td>
                  <td class="px-4 py-3">
                    <p class="text-slate-700">{{ inquilino.celular || 'Sin celular' }}</p>
                    <p class="text-xs text-slate-400 truncate max-w-xs">{{ inquilino.correo || 'Sin correo' }}</p>
                  </td>
                  <td class="px-4 py-3">
                    <span class="px-2.5 py-1 rounded-full text-xs font-medium" :class="estadoClase(inquilino.estado)">
                      {{ estadoEtiqueta(inquilino.estado) }}
                    </span>
                  </td>
                  <td class="px-4 py-3 font-semibold text-slate-800 whitespace-nowrap">
                    {{ formatearMoneda(inquilino.rentaMensual) }}
                  </td>
                  <td class="px-4 py-3 whitespace-nowrap">
                    <div class="flex items-center gap-2 justify-end">
                      <button
                        @click="editar(inquilino.id)"
                        class="px-3 py-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                        title="Editar"
                      >
                        Editar
                      </button>
                      <button
                        @click="confirmarEliminar(inquilino)"
                        class="px-3 py-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                        title="Eliminar"
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <transition name="slide">
          <div v-if="mostrarForm" class="w-full xl:w-[500px] shrink-0 border border-slate-200 rounded-2xl overflow-hidden flex flex-col">
            <div class="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h3 class="text-sm font-semibold text-slate-700">
                {{ store.modoEdicion ? 'Editar inquilino' : 'Nuevo inquilino' }}
              </h3>
              <button
                @click="cerrarForm"
                class="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
                aria-label="Cerrar"
              >
                ×
              </button>
            </div>

            <div class="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-4">
              <div v-if="store.error" class="px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-600">
                {{ store.error }}
              </div>

              <div class="grid grid-cols-2 gap-3">
                <CampoInput v-model="store.form.nombre" label="Nombre" placeholder="María" />
                <CampoInput v-model="store.form.apellidos" label="Apellidos" placeholder="López García" />
              </div>

              <div class="grid grid-cols-2 gap-3">
                <CampoInput v-model="store.form.celular" label="Celular" placeholder="55 8988 5578" />
                <CampoInput v-model="store.form.telefono" label="Teléfono" placeholder="55 1234 5678" />
                <CampoInput v-model="store.form.correo" label="Correo" type="email" placeholder="correo@ejemplo.com" />
              </div>

              <CampoSelect v-model="store.form.estado" label="Estado">
                <option value="activo">Activo</option>
                <option value="terminado">Terminado</option>
                <option value="moroso">Moroso</option>
              </CampoSelect>

              <div class="grid grid-cols-2 gap-3">
                <CampoInput v-model="store.form.fechaInicio" label="Fecha inicio" type="date" />
                <CampoInput v-model="store.form.fechaFin" label="Fecha fin" type="date" />
              </div>

              <div class="grid grid-cols-2 gap-3">
                <CampoInput v-model.number="store.form.rentaMensual" label="Renta mensual" type="number" placeholder="8500" />
                <CampoInput v-model="store.form.fechaNacimiento" label="Fecha nacimiento" type="date" />
              </div>

              <div class="flex flex-col gap-1">
                <label class="text-xs font-medium text-slate-500 uppercase tracking-wide">Notas</label>
                <textarea
                  v-model="store.form.notas"
                  rows="3"
                  placeholder="Observaciones del inquilino…"
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
                {{ store.guardando ? 'Guardando…' : store.modoEdicion ? 'Actualizar' : 'Guardar' }}
              </button>
            </div>
          </div>
        </transition>
      </div>

      <div
        v-if="itemAEliminar"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        style="background:rgba(0,0,0,0.35)"
        @click.self="itemAEliminar = null"
      >
        <div class="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm">
          <h4 class="text-base font-semibold text-slate-800 mb-2">¿Eliminar inquilino?</h4>
          <p class="text-sm text-slate-500 mb-6">
            Se eliminará <strong class="text-slate-700">{{ nombreCompleto(itemAEliminar) }}</strong> de forma permanente.
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
import { useInquilinoStore } from '@/stores/inquilinoStore'
import CampoInput from '@/components/CampoInput.vue'
import CampoSelect from '@/components/CampoSelect.vue'
import DashboardLayout from '../layouts/DashboardLayout.vue'
import NavBar from '../components/NavBar.vue'

const store = useInquilinoStore()
const mostrarForm = ref(false)
const itemAEliminar = ref(null)

onMounted(() => store.cargarLista())

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

function nombreCompleto(inquilino) {
  if (!inquilino) return ''
  return [inquilino.nombre, inquilino.apellidos].filter(Boolean).join(' ').trim() || 'Sin nombre'
}

function formatearMoneda(valor) {
  const numero = Number(valor)
  if (Number.isNaN(numero) || valor === '' || valor === null || valor === undefined) {
    return 'Sin renta'
  }
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(numero)
}

function estadoEtiqueta(estado) {
  const mapa = {
    activo: 'Activo',
    terminado: 'Terminado',
    moroso: 'Moroso',
  }
  return mapa[estado] ?? estado ?? 'Sin estado'
}

function estadoClase(estado) {
  const mapa = {
    activo: 'bg-emerald-50 text-emerald-700',
    terminado: 'bg-slate-100 text-slate-600',
    moroso: 'bg-amber-50 text-amber-700',
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