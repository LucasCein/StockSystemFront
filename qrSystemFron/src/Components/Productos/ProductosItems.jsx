import { MDBListGroupItem } from "mdb-react-ui-kit"
import { useEffect, useState } from "react";
import { BsEyeFill, BsTrash3Fill } from "react-icons/bs";
import { NavLink, useNavigate } from "react-router-dom";
import Popup from "reactjs-popup";
import { BsPrinterFill } from "react-icons/bs";
import { BsPencilFill } from "react-icons/bs";
import ABMProductos from "./ABMProductos";
const ProductosItems = ({ productos }) => {
    const [prods, setProds] = useState([])
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = currentPage * itemsPerPage;
    const currentItems = productos.slice(startIndex, endIndex);

    const handlePreviousPage = () => {
        setCurrentPage(Math.max(currentPage - 1, 1));
    };

    const handleNextPage = () => {
        const totalPages = Math.ceil(productos.length / itemsPerPage);
        setCurrentPage(Math.min(currentPage + 1, totalPages));
    };
    useEffect(() => {
        if (productos) {
            setProds(productos)
        }
    }, [productos]);
    const actualizarListaProductos = () => {
        // Aquí se hace la llamada a la API para obtener la lista actualizada de productos
        fetch('https://qrsystemback.onrender.com/products')
            .then(response => response.json())
            .then(data => setProds(data))
            .catch(error => console.error(error));
    };

    const deleteProduct = (productid) => {
        fetch(`https://qrsystemback.onrender.com/products/${productid}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        })
            .then(response => {
                if (!response.ok) {
                    // Si el servidor responde con un error, lanzar una excepción
                    return response.text().then(text => { throw new Error(text) });
                }
                // Si la respuesta es exitosa, actualizar la lista de productos
                // No necesitas parsear la respuesta como JSON si esperas texto plano
                actualizarListaProductos();
            })
            .catch(error => {
                console.error('Error al eliminar el producto:', error);
                alert(error.message); // Muestra el mensaje de error
            });
    }

    //rojo cuando esta vencido, amarillo 30 dias o menos, naranja 60 dias o menos y verde el resto
    const generateSquareColor = (productDate) => {
        const today = new Date();
        const expirationDate = new Date(productDate);

        // Calcula la diferencia en días
        const differenceInTime = expirationDate.getTime() - today.getTime();
        const differenceInDays = differenceInTime / (1000 * 3600 * 24);

        // Determina el color basado en la diferencia de días
        if (differenceInDays < 0) {
            return "red"; // Producto vencido
        } else if (differenceInDays <= 14) {
            return "orange"; // Faltan 14 días o menos
        } else if (differenceInDays <= 30) {
            return "yellow"; // Faltan entre 15 y 30 días
        } else if (differenceInDays <= 90) {
            return "green"; // Faltan entre 30 y 90 días
        } else {
            return "grey"; // Más de 90 días o fecha inválida
        }
    };


    function formatToDDMMYYYY(dateString) {
        // Creamos un objeto de fecha a partir de tu cadena con formato ISO
        let date = new Date(dateString);

        // Obtenemos el día, mes y año del objeto de fecha
        let day = date.getDate();
        let month = date.getMonth() + 1; // Los meses en JavaScript van de 0 a 11
        let year = date.getFullYear();

        // Añadimos un cero al inicio si el día o mes es menor de 10 para el formato DD y MM
        day = day < 10 ? '0' + day : day;
        month = month < 10 ? '0' + month : month;

        // Construimos la cadena con el formato DD/MM/YYYY
        return `${day}/${month}/${year}`;
    }
    const getQR = async (productid) => {
        const response = await fetch(`https://qrsystemback.onrender.com/products/${productid}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data.qrCode;
    };

    const printImage = async (productid) => {
        try {
            const qrCode = await getQR(productid);
            const content = `
                <html>
                <head>
                    <style>
                        body {
                            margin: 0;
                            padding: 0;
                            display: flex;
                            justify-content: center;
                            align-items: center;
                            height: 100vh;
                        }
                        img {
                            max-width: 90%;
                            max-height: 90%;
                            width: auto;
                            height: auto;
                        }
                    </style>
                </head>
                <body>
                    <img src="${qrCode}" onload="window.print()" onerror="alert('Error al cargar la imagen');" />
                </body>
                </html>`;
            const printWindow = window.open('', '_blank');
            printWindow.document.write(content);
            printWindow.document.addEventListener('load', () => {
                printWindow.print();
                printWindow.close();
            }, true);
        } catch (error) {
            console.error('Error al obtener el código QR:', error);
            alert('No se pudo cargar el código QR para la impresión.');
        }
    };


    return (
        <div>
            {currentItems.map(({ productid, name, code, date, quantityu, quantityb }) => (
                <MDBListGroupItem key={productid} className="container align-items-center justify-content-center" >

                    <div className="row w-100">
                        <div className="col-12 col-md-2 d-flex justify-content-center ">
                            <div className="color-square" style={{ backgroundColor: generateSquareColor(date) }}></div>
                        </div>
                        <div className="col-12 col-md-2 d-flex justify-content-center align-items-center  ">
                            <p className="mb-0 text-dark">{name}</p>
                        </div>
                        <div className="col-12 col-md-2 d-flex justify-content-center align-items-center  ">
                            <p className="mb-0 text-dark">{code}</p>
                        </div>
                        <div className="col-12 col-md-2 d-flex justify-content-center align-items-center  ">
                            <p className="mb-0 text-dark">{formatToDDMMYYYY(date)}</p>
                        </div>
                        <div className="col-12 col-md-1 d-flex justify-content-center align-items-center  ">
                            <p className="mb-0 text-dark">{quantityu}</p>
                        </div>
                        <div className="col-12 col-md-1 d-flex justify-content-center align-items-center  ">
                            <p className="mb-0 text-dark">{quantityb}</p>
                        </div>
                        {/* <div className="col d-flex justify-content-center align-items-center  ">
                            <p className="mb-0 text-dark">{idealstock}</p>
                        </div>
                        <div className="col d-flex justify-content-center align-items-center  ">
                            <p className="mb-0 text-dark">{missingstock}</p>
                        </div> */}

                        <div className="col-12 col-md-2 d-flex justify-content-center align-items-center gap-2 ">
                            <section>
                                <Popup trigger={<div><BsPencilFill className="icon " cursor={"pointer"} /></div>} position="center center" modal>
                                    {close => <ABMProductos productid={productid} close={close} actualizarListaProductos={actualizarListaProductos}></ABMProductos>}
                                </Popup>
                            </section>
                            <section>
                                <BsPrinterFill className="icon " cursor={"pointer"} onClick={() => printImage(productid)} />
                            </section>
                            <section>
                                <BsTrash3Fill className="icon " cursor={"pointer"} onClick={() => deleteProduct(productid)} />
                            </section>
                        </div>
                    </div>

                </MDBListGroupItem>
            ))}
            <section className="d-flex justify-content-center align-items-center mt-3">

                <button
                    style={{ margin: "5px" }}
                    className="btn btn-secondary"
                    onClick={handlePreviousPage}
                    disabled={currentPage === 1}
                >
                    Previous
                </button>
                <button
                    style={{ margin: "5px" }}
                    className="btn btn-secondary"
                    onClick={handleNextPage}
                    disabled={endIndex >= productos.length}
                >
                    Next
                </button>
            </section>
        </div>
    );
}

export default ProductosItems