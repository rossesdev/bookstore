export type Book = {
    id: number;
    title: string;
    author: string;
    price: number;
    description: string;
};
export const books: Book[] = [
    { id: 1, title: "Cien años de soledad", author: "Gabriel García Márquez", price: 24.99, description: "La épica odisea de la familia Buendía en el mítico pueblo de Macondo." },
    { id: 2, title: "Ficciones", author: "Jorge Luis Borges", price: 18.50, description: "Laberintos, espejos y bibliotecas infinitas en una obra cumbre del ingenio." },
    { id: 3, title: "El Principito", author: "Antoine de Saint-Exupéry", price: 12, description: "Un cuento poético sobre el amor, la amistad y el sentido de la vida." },
    { id: 4, title: "Rayuela", author: "Julio Cortázar", price: 22, description: "Una contranovela revolucionaria que invita al lector a múltiples itinerarios." },
    { id: 5, title: "Pedro Páramo", author: "Juan Rulfo", price: 15.75, description: "Un viaje sobrecogedor a Comala en busca de un padre fantasmal." },
    { id: 6, title: "1984", author: "George Orwell", price: 19.90, description: "La inquietante advertencia distópica sobre el Gran Hermano y la vigilancia." },
    { id: 7, title: "Don Quijote de la Mancha", author: "Miguel de Cervantes", price: 29.99, description: "Las inmortales andanzas del caballero andante y su fiel escudero." },
    { id: 8, title: "La sombra del viento", author: "Carlos Ruiz Zafón", price: 21.50, description: "Un misterio inolvidable en el legendario Cementerio de los Libros Olvidados." },
    { id: 9, title: "Ensayo sobre la ceguera", author: "José Saramago", price: 23.25, description: "Una sobrecogedora parábola sobre la fragilidad de la condición humana." },
    { id: 10, title: "Crónica de una muerte anunciada", author: "Gabriel García Márquez", price: 16.80, description: "La fascinante reconstrucción de una tragedia predestinada en el Caribe." },
];
export const bookById = new Map(books.map((book) => [book.id, book]));
export const money = new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" });

