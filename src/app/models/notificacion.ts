export type TipoNotificacion = 'aprobada' | 'rechazada' | 'comentario';

export default interface Notificacion {
  id: string;
  usuarioDNI: string; // DNI del adoptante que recibe la notificación
  mensaje: string; // Mensaje de la notificación
  tipo: TipoNotificacion; // Tipo de evento
  solicitudId: string; // ID de la solicitud relacionada
  animalId: string; // ID del animal
  leida: boolean; // Si fue leída o no
  fechaCreacion: string; // ISO timestamp
  comentarios?: string; // Opcional: comentarios del admin
}
