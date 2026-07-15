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
const collectionRef = collection(db, 'inquilinos')

// ── GET ALL (Firestore) ───────────────────────────────────────────
export async function getInquilinos() {
  try {
    const querySnapshot = await getDocs(collectionRef)
    const inquilinos = []
    
    querySnapshot.forEach((doc) => {
      // Mapeamos el ID del documento de Firebase junto con sus datos
      inquilinos.push({ id: doc.id, ...doc.data() })
    })
    
    return inquilinos
  } catch (error) {
    console.error('[InquilinoService] Error en getInquilinos:', error)
    throw new Error('No se pudieron recuperar los inquilinos del servidor.')
  }
}

// ── GET ONE (Firestore) ───────────────────────────────────────────
export async function getInquilino(id) {
  try {
    const docRef = doc(db, 'inquilinos', id)
    const docSnap = await getDoc(docRef)
    
    if (!docSnap.exists()) {
      throw new Error(`Inquilino con ID ${id} no encontrado.`)
    }
    
    return { id: docSnap.id, ...docSnap.data() }
  } catch (error) {
    console.error(`[InquilinoService] Error en getInquilino (${id}):`, error)
    throw new Error(error.message || 'Error al obtener los detalles del inquilino.')
  }
}

// ── CREATE (Firestore) ────────────────────────────────────────────
export async function crearInquilino(datos) {
  try {
    // Cloud Firestore genera automáticamente hashes alfanuméricos únicos como IDs
    const docRef = await addDoc(collectionRef, datos)
    return { id: docRef.id, ...datos }
  } catch (error) {
    console.error('[InquilinoService] Error en crearInquilino:', error)
    throw new Error('Error al guardar el nuevo inquilino.')
  }
}

// ── UPDATE (Firestore) ────────────────────────────────────────────
export async function actualizarInquilino(id, datos) {
  try {
    const docRef = doc(db, 'inquilinos', id)
    
    // Evitamos enviar el campo ID dentro del payload de actualización de Firestore
    const { id: _, ...datosAActualizar } = datos
    
    await updateDoc(docRef, datosAActualizar)
    return { id, ...datosAActualizar }
  } catch (error) {
    console.error(`[InquilinoService] Error en actualizarInquilino (${id}):`, error)
    throw new Error('Error al actualizar los datos del inquilino.')
  }
}

// ── DELETE (Firestore) ────────────────────────────────────────────
export async function eliminarInquilino(id) {
  try {
    const docRef = doc(db, 'inquilinos', id)
    await deleteDoc(docRef)
  } catch (error) {
    console.error(`[InquilinoService] Error en eliminarInquilino (${id}):`, error)
    throw new Error('Error al intentar eliminar el inquilino.')
  }
}