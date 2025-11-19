export default interface usuarios{
    id: string,
    user: string,
    password:string,
    isAdmin: boolean

    nombre?: string;
    apellido?: string;
    email?: string;
    telefono?: string;
    direccion?: string;
}