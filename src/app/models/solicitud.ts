
export type EstadoSolicitud ='pendiente' | 'aprobada' | 'rechazada' | 'cancelada';

export default interface Solicitud {
    id: string,
    animalId: string, // id del pet para identificarlo
    solicitanteUSer: string, // user del solicitante para identificarlo
    fecha: string,
    estado: EstadoSolicitud,
    comentarios?: string // Opcional 
}