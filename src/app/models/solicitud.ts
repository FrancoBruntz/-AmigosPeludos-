export type EstadoSolicitud = 'pendiente' | 'aprobada' | 'rechazada' | 'cancelada';

export type TipoVivienda = 'casa' | 'departamento';

export default interface Solicitud {
  id: string;
  animalId: string;        // id del pet para identificarlo
  solicitanteUser: string; // dni del solicitante , tomado de UserService
  fecha: string;
  estado: EstadoSolicitud;
  comentarios?: string;    // Opcional (comentarios del admin)
  mensaje?: string;        // Mensaje del solicitante (opcional)

  // ===== Nuevos datos de adopción =====
  tipoVivienda: TipoVivienda;
  tienePatio: boolean;
  tieneMascotas: boolean;
  detalleMascotas?: string;
  viveConNinos: boolean;
  aceptaCompromiso: boolean;
}
