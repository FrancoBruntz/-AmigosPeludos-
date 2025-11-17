export interface Donation {

    id ? : string, 
    userId : string, 
    amount : number, 
    method : 'Tarjeta' | 'Transferencia' | 'Efectivo',
    date : string, 
    message ? : string,
}
