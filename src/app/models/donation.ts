export interface Donation {

    id ? : string, 
    userId : string, 
    amount : number, 
    method : 'Tarjeta' | 'Transferencia',
    date : string, 
    message ? : string,

    comprobanteUrl?: string; 
}
