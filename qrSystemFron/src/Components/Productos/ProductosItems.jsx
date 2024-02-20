import { MDBListGroupItem } from "mdb-react-ui-kit"
import { useEffect, useState } from "react";
import { BsEyeFill, BsTrash3Fill } from "react-icons/bs";
import { NavLink, useNavigate } from "react-router-dom";
import Popup from "reactjs-popup";
import { BsPrinterFill } from "react-icons/bs";
import { BsPencilFill } from "react-icons/bs";
import ABMProductos from "./ABMProductos";
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import "./css/prodItems.css"
const ProductosItems = ({ productos, actualizarListaProductos }) => {
    const [prods, setProds] = useState([])
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;
    const navigate=useNavigate()
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = currentPage * itemsPerPage;
    let currentItems = productos.slice(startIndex, endIndex);

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
    

    const deleteProduct = (productid) => {
        const MySwal = withReactContent(Swal);
    
        // Mostrar un modal de confirmación
        MySwal.fire({
            title: '¿Estás seguro?',
            text: "Esta acción no se puede deshacer",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, eliminarlo!',
            cancelButtonText: 'No, cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                // Si el usuario confirma, proceder con la eliminación
                fetch(`https://stocksystemback-uorn.onrender.com/products/${productid}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                })
                .then(response => {
                    if (!response.ok) {
                        // Si el servidor responde con un error, lanzar una excepción
                        throw new Error(response.statusText);
                    }
                    // Mostrar mensaje de éxito
                    MySwal.fire(
                        'Eliminado!',
                        'El producto ha sido eliminado.',
                        'success'
                    );
                    // Actualizar lista de productos
                    actualizarListaProductos();
                })
                .catch(error => {
                    console.error('Error al eliminar el producto:', error);
                    Swal.fire('Error', error.message, 'error'); // Mostrar mensaje de error
                });
            }
        });
    };
    

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
        // Dividimos la cadena de fecha en sus componentes (año, mes, día)
        let dateParts = dateString.split('-');
    
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
        return `${formattedDay}/${formattedMonth}/${formattedYear}`;
    }
    
    
    const getQR = async (productid) => {
        const response = await fetch(`https://stocksystemback-uorn.onrender.com/products/${productid}`);
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
            {currentItems.map(({ productid, name, code, date, quantityu, quantityb,codprov,codbarras, unxcaja, total }) => (
                <MDBListGroupItem key={productid} className="container align-items-center justify-content-center" >

                    <div className="row w-100">
                        {/* <div className="col-12 col-md-2 d-flex justify-content-center "> */}
                            {/* <div className="color-square" style={{ backgroundColor: generateSquareColor(date) }}></div> */}
                        {/* </div> */}
                        <div className="col-12 col-md-2 d-flex justify-content-center align-items-center ">
                            <p className="mb-0 text-dark value">{name}</p>
                        </div>
                        <div className="col-12 col-md-1 d-flex justify-content-center align-items-center  ">
                            <p className="mb-0 text-dark">{code}</p>
                        </div>
                        <div className="col-12 col-md-1 d-flex justify-content-center align-items-center  ">
                            <p className="mb-0 text-dark">{codprov}</p>
                        </div>
                        <div className="col-12 col-md-1 d-flex justify-content-center align-items-center  ">
                            <p className="mb-0 text-dark">{codbarras}</p>
                        </div>
                        {/* <div className="col-12 col-md-2 d-flex justify-content-center align-items-center  "> */}
                            {/* <p className="mb-0 text-dark">{formatToDDMMYYYY(date)}</p> */}
                        {/* </div> */}
                        <div className="col-12 col-md-2 d-flex justify-content-center align-items-center  ">
                            <p className="mb-0 text-dark">{quantityu}</p>
                        </div>
                        <div className="col-12 col-md-1 d-flex justify-content-center align-items-center  ">
                            <p className="mb-0 text-dark">{quantityb}</p>
                        </div>
                        {/* cant x caja */}
                        <div className="col-12 col-md-1 d-flex justify-content-md-end justify-content-center align-items-center  ">
                            <p className="mb-0 text-dark">{unxcaja}</p>
                        </div>
                        {/* total */}
                        <div className="col-12 col-md-1 d-flex justify-content-md-end justify-content-center align-items-center  ">
                            <p className="mb-0 text-dark ">{total}</p>
                        </div>
                        {/* <div className="col d-flex justify-content-center align-items-center  ">
                            <p className="mb-0 text-dark">{idealstock}</p>
                        </div>
                        <div className="col d-flex justify-content-center align-items-center  ">
                            <p className="mb-0 text-dark">{missingstock}</p>
                        </div> */}

                        <div className="col-12 col-md-2 d-flex justify-content-md-end justify-content-center align-items-center gap-2 ">
                            <section>
                                <section><BsPencilFill className="icon" cursor={"pointer"} onClick={()=>navigate("/abmProductos",{state:{productid}})} /></section>
                                {/* <Popup trigger={<div><BsPencilFill className="icon " cursor={"pointer"} /></div>} position="center center" modal>
                                    {close => <ABMProductos productid={productid} close={close} actualizarListaProductos={actualizarListaProductos} productos={productos}></ABMProductos>}
                                </Popup> */}
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