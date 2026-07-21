import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'

import HomeView from './views/HomeView.vue'
import UsuarioView from './views/UsuarioView.vue'
import InquilinoView from './views/InquilinoView.vue'
import ServicioView from './views/ServiciosView.vue'
import TipoServicioView from './views/TipoServicioView.vue' // <-- Importamos tu nuevo módulo
import SucursalView from './views/SucursalesView.vue'
import UbicacionView from './views/UbicacionVIew.vue' 
import NotFoundView from './views/NotFoundView.vue'
import DepartamentoView from './views/DepartamentoView.vue'

import './assets/main.css'
import App from './App.vue'

const router = createRouter({
    history: createWebHistory(),
    routes: [
        { path: '/', component: HomeView, meta: { title: 'Inicio' } },
        { path: '/Usuarios', component: UsuarioView, meta: { title: 'Usuarios' } },
        { path: '/Inquilinos', component: InquilinoView, meta: { title: 'Inquilinos' } },
        { path: '/Servicios', component: ServicioView, meta: { title: 'Servicios' } },
        { path: '/TipoServicio', component: TipoServicioView, meta: { title: 'Tipos de Servicio' } }, // <-- NUEVA RUTA AGREGADA
        { path: '/Ubicacion', component: UbicacionView, meta: { title: 'Ubicaciones' } },
        { path: '/Departamentos', component: DepartamentoView, meta: { title: 'Departamentos' } },
        { path: '/:pathMatch(.*)*', component: NotFoundView } // No tiene meta.title, se ignorará automáticamente
    ]
})

const app = createApp(App);

app.use(router);
app.use(createPinia());
app.mount('#app');