export default interface Pets{
    id: string,
    name:string,
    type: string,
    age: number,
    ageUnit?: string,
    size: string,
    sexo?: string,
    color: string,
    castrado: boolean,
    notes:string,
    image?: string,
    activo?: boolean
}