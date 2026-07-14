// src/servicios/serviciosService.js
//
// Capa de datos (API / Tercera Capa) para el módulo de Tipo de Servicio conectada a Cloud Firestore.
// Incluye validación de catálogos fijos para Categoría y Unidad de Medida.

import { db } from '@/config/firebase'
import { 
  collection, 
  getDocs, 
  doc, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc 
} from 'firebase/firestore'

// Referencia a la colección destino en Cloud Firestore
const collectionRef = collection(db, 'tipos_servicio')

// Catálogos estáticos permitidos por las reglas del negocio
const CATEGORIAS_PERMITIDAS = ['cuota', 'amenidad', 'mantenimiento', 'reparacion']
const UNIDADES_PERMITIDAS = ['por evento', 'mensual', 'por hora', 'por metro cuadrado']

// ── GET ALL ───────────────────────────────────────────────────────
export async function getTiposServicio() {
  try {
    const querySnapshot = await getDocs(collectionRef)
    const servicios = []
    
    querySnapshot.forEach((docSnap) => {
      // Inyectamos el hash alfanumérico generado por Firebase como la propiedad 'id'
      servicios.push({ id: docSnap.id, ...docSnap.data() })
    })
    
    return servicios
  } catch (error) {
    console.error('[serviciosService] Error en getTiposServicio:', error)
    throw new Error('No se pudieron recuperar los tipos de servicio del servidor remoto.')
  }
}

// ── GET ONE ───────────────────────────────────────────────────────
export async function getTipoServicio(id) {
  try {
    const docRef = doc(db, 'tipos_servicio', id)
    const docSnap = await getDoc(docRef)
    
    if (!docSnap.exists()) {
      throw new Error(`El tipo de servicio con ID ${id} no existe.`)
    }
    
    return { id: docSnap.id, ...docSnap.data() }
  } catch (error) {
    console.error(`[serviciosService] Error en getTipoServicio para el ID ${id}:`, error)
    throw new Error(error.message || 'Error al consultar la información detallada del servicio.')
  }
}

// ── CREATE ────────────────────────────────────────────────────────
export async function crearTipoServicio(datos) {
  try {
    // 1. Validaciones rigurosas de negocio antes de tocar la base de datos
    const categoriaNormalizada = String(datos.categoria || '').toLowerCase().trim()
    const unidadNormalizada = String(datos.unidad || '').toLowerCase().trim()

    if (!CATEGORIAS_PERMITIDAS.includes(categoriaNormalizada)) {
      throw new Error(`Categoría inválida. Debe ser una de: ${CATEGORIAS_PERMITIDAS.join(', ')}`)
    }

    if (!UNIDADES_PERMITIDAS.includes(unidadNormalizada)) {
      throw new Error(`Unidad de medida inválida. Debe ser una de: ${UNIDADES_PERMITIDAS.join(', ')}`)
    }

    // 2. Mapeo y tipado correcto de datos sanitizados
    const payload = {
      nombre: String(datos.nombre || '').trim(),
      categoria: categoriaNormalizada,
      descripcion: String(datos.descripcion || '').trim(),
      precio: Number(datos.precio || 0),
      unidad: unidadNormalizada,
      activo: Boolean(datos.activo),
      programacion: Boolean(datos.programacion),
      duracion: Number(datos.duracion || 0), // Medido en minutos
      creadoEn: new Date() // Sello de tiempo del servidor / cliente
    }

    // addDoc se encarga de estructurar el registro y generar el hash ID en el servidor
    const docRef = await addDoc(collectionRef, payload)
    return { id: docRef.id, ...payload }
  } catch (error) {
    console.error('[serviciosService] Error en crearTipoServicio:', error)
    throw new Error(error.message || 'No se pudo dar de alta el tipo de servicio en la base de datos.')
  }
}

// ── UPDATE ────────────────────────────────────────────────────────
export async function actualizarTipoServicio(id, datos) {
  try {
    const docRef = doc(db, 'tipos_servicio', id)
    
    // Desestructuramos para limpiar y asegurar que el campo destructivo 'id' no se guarde dentro del payload del documento
    const { id: _, creadoEn, ...datosAActualizar } = datos

    // Validar el catálogo si el usuario está modificando la categoría
    if (datosAActualizar.categoria) {
      datosAActualizar.categoria = String(datosAActualizar.categoria).toLowerCase().trim()
      if (!CATEGORIAS_PERMITIDAS.includes(datosAActualizar.categoria)) {
        throw new Error(`No se puede actualizar. Categoría inválida.`)
      }
    }

    // Validar el catálogo si el usuario está modificando la unidad
    if (datosAActualizar.unidad) {
      datosAActualizar.unidad = String(datosAActualizar.unidad).toLowerCase().trim()
      if (!UNIDADES_PERMITIDAS.includes(datosAActualizar.unidad)) {
        throw new Error(`No se puede actualizar. Unidad de medida inválida.`)
      }
    }

    // Asegurar parseo de números si vienen modificados de formularios de la UI
    if (datosAActualizar.precio !== undefined) datosAActualizar.precio = Number(datosAActualizar.precio)
    if (datosAActualizar.duracion !== undefined) datosAActualizar.duracion = Number(datosAActualizar.duracion)

    await updateDoc(docRef, datosAActualizar)
    return { id, ...datosAActualizar }
  } catch (error) {
    console.error(`[serviciosService] Error en actualizarTipoServicio para el ID ${id}:`, error)
    throw new Error(error.message || 'Ocurrió un error al procesar la actualización de los datos del servicio.')
  }
}

// ── DELETE ────────────────────────────────────────────────────────
export async function eliminarTipoServicio(id) {
  try {
    const docRef = doc(db, 'tipos_servicio', id)
    await deleteDoc(docRef)
  } catch (error) {
    console.error(`[serviciosService] Error en eliminarTipoServicio para el ID ${id}:`, error)
    throw new Error('Error crítico: No se pudo remover el tipo de servicio especificado.')
  }
}