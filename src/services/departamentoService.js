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

// Referencia a la colección en Firestore
const collectionRef = collection(db, 'departamentos')

// ── GET ALL (Firestore) ───────────────────────────────────────────
export async function getDepartamentos() {
  try {
    const querySnapshot = await getDocs(collectionRef)
    const departamentos = []
    
    querySnapshot.forEach((doc) => {
      departamentos.push({ id: doc.id, ...doc.data() })
    })
    
    return departamentos
  } catch (error) {
    console.error('[DepartamentoService] Error en getDepartamentos:', error)
    throw new Error('No se pudieron recuperar los departamentos del servidor.')
  }
}

// ── GET ONE (Firestore) ───────────────────────────────────────────
export async function getDepartamento(id) {
  try {
    const docRef = doc(db, 'departamentos', id)
    const docSnap = await getDoc(docRef)
    
    if (!docSnap.exists()) {
      throw new Error(`Departamento con ID ${id} no encontrado.`)
    }
    
    return { id: docSnap.id, ...docSnap.data() }
  } catch (error) {
    console.error(`[DepartamentoService] Error en getDepartamento (${id}):`, error)
    throw new Error(error.message || 'Error al obtener los detalles del departamento.')
  }
}

// ── CREATE (Firestore) ────────────────────────────────────────────
export async function crearDepartamento(datos) {
  try {
    const docRef = await addDoc(collectionRef, datos)
    return { id: docRef.id, ...datos }
  } catch (error) {
    console.error('[DepartamentoService] Error en crearDepartamento:', error)
    throw new Error('Error al guardar el nuevo departamento.')
  }
}

// ── UPDATE (Firestore) ────────────────────────────────────────────
export async function actualizarDepartamento(id, datos) {
  try {
    const docRef = doc(db, 'departamentos', id)
    
    const { id: _, ...datosAActualizar } = datos
    
    await updateDoc(docRef, datosAActualizar)
    return { id, ...datosAActualizar }
  } catch (error) {
    console.error(`[DepartamentoService] Error en actualizarDepartamento (${id}):`, error)
    throw new Error('Error al actualizar los datos del departamento.')
  }
}

// ── DELETE (Firestore) ────────────────────────────────────────────
export async function eliminarDepartamento(id) {
  try {
    const docRef = doc(db, 'departamentos', id)
    await deleteDoc(docRef)
  } catch (error) {
    console.error(`[DepartamentoService] Error en eliminarDepartamento (${id}):`, error)
    throw new Error('Error al intentar eliminar el departamento.')
  }
}