import { useEffect, useState } from "react";
import { useParams } from "react-router-dom"

const Detallespanroducto = () => {
    const { productid } = useParams();
    const [prod, setProd] = useState([])
    console.log(productid)
    useEffect(() => {
        // Obtener el idspanroducto de los spanarámetros de la URL

        // Función spanara cargar los datos del spanroducto
        const cargarDatosProducto = async () => {
            try {
                const respuesta = await fetch(`https://stocksystemback-uorn.onrender.com/products/${productid}`);
                const jsonData = await respuesta.json()
                // Dividimos la cadena de fecha en sus componentes (año, mes, día)
                let dateParts = jsonData.date.split('-');

                // Convertimos los componentes en números enteros
                // Date interpreta los meses desde 0 (enero) hasta 11 (diciembre), por lo que restamos 1 al mes
                let year = parseInt(dateParts[0], 10);
                let month = parseInt(dateParts[1], 10) - 1;
                let day = parseInt(dateParts[2], 10);

                // Creamos un objeto de fecha con los componentes
                let date = new Date(year, month, day);

                // Obtenemos el día, mes y año del objeto de fecha
                // Asegurándonos de añadir un cero delante si es menor de 10
                let formattedDay = ('0' + date.getDate()).slice(-2);
                let formattedMonth = ('0' + (date.getMonth() + 1)).slice(-2);
                let formattedYear = date.getFullYear();

                // Construimos la cadena con el formato DD/MM/YYYY
                 `${formattedDay}/${formattedMonth}/${formattedYear}`;
                setProd({...jsonData,date:`${formattedDay}/${formattedMonth}/${formattedYear}`})
                // Manejar los datos del spanroducto como sea necesario
            } catch (error) {
                console.error('Hubo un problema con la petición Fetch:', error);
            }
        };
        cargarDatosProducto();
    }, [productid]);
    console.log(prod)
    return (
        <div className="d-flex justify-content-center align-items-center min-vh-100">
            <section className="text-center bg-white p-3 mt-4 fs-4">
                <h2 className="text-dark">{prod.name}</h2>
                <span className="text-dark">Codigo: {prod.code}</span>
                <div className="text-dark">Stock actual:</div>
                <div className="ms-2 text-dark">- Bulto: {prod.quantityb} - Unidad: {prod.quantityu}</div>
                <div className="text-dark">Fecha de Vencimiento: {prod.date}</div>
                <div className="text-dark">Stock Ideal: {prod.idealstock}</div>
            </section>
        </div>


    )
}

export default Detallespanroducto