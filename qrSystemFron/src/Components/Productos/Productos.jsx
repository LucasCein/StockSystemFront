import { MDBListGroup, MDBListGroupItem } from "mdb-react-ui-kit";
import { useContext, useEffect, useState } from "react";
import ProductosItems from "./ProductosItems";
import Popup from 'reactjs-popup';
import 'reactjs-popup/dist/index.css'
import ABMProductos from "./ABMProductos";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./css/prodsCss.css"
import * as FileSaver from 'file-saver';
import * as XLSX from 'xlsx';
import { useNavigate } from "react-router-dom";
import { ProvRouteContext } from "../ProvRouteContext/ProvRouteocntext";
import { BsTrash3Fill } from "react-icons/bs";
import withReactContent from "sweetalert2-react-content";
import Swal from "sweetalert2";
import Button from '@mui/material/Button';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

const Productos = () => {
    const [productos, setProductos] = useState([]);
    const [prodsFiltrados, setProdsFiltrados] = useState([])
    const [dateRange, setDateRange] = useState([null, null]);
    const [startDate, endDate] = dateRange;
    const [orden, setOrden] = useState({ columna: 'date', direccion: 'asc' });
    const navigate = useNavigate()
    const { userName, setUserName } = useContext(ProvRouteContext)
    const [user, setUser] = useState(userName)
    const [prodsAdmin, setProdsAdmin] = useState([])
    const [allProducts, setAllProducts] = useState([])
    const [stockExcel, setStockExcel] = useState([])
    const [fileName, setFileName] = useState('')
    // Función para actualizar la lista de productos
    const actualizarListaProductos = () => {
        // Llamada a la API para obtener la lista actualizada
        if (user == 'admin') {
            fetch('https://stocksystemback-uorn.onrender.com/products')
                .then(response => response.json())
                .then(data => {
                    setProductos(data); // Esto establece los productos en tu estado o donde necesites.
                    console.log('data', data);
                })
                .catch(error => {
                    console.error(error);
                });
            fetch('https://stocksystemback-uorn.onrender.com/productos/admin')
                .then(response => response.json())
                .then(data => {
                    setProdsAdmin(data); // Esto establece los productos en tu estado o donde necesites.
                    console.log('data', data);
                })
                .catch(error => {
                    console.error(error);
                });

        }


        else {
            fetch(`https://stocksystemback-uorn.onrender.com/products/${user}`)
                .then(response => response.json())
                .then(data => {
                    setProductos(data);
                    // Actualizar el estado con la nueva lista de productos
                })
                .catch(error => {
                    console.error(error);
                });
        }

    };
    console.log(prodsAdmin)
    useEffect(() => {
        setUser(userName)
        actualizarListaProductos()
        if (userName == 'admin') {
            try {
                fetch('https://stocksystemback-uorn.onrender.com/allproducts')
                    .then(response => response.json())
                    .then(data => {
                        setAllProducts(data); // Esto establece los productos en tu estado o donde necesites.
                        console.log('data', data);
                    })
                    .catch(error => {
                        console.error(error);
                    });
            } catch (error) {
                console.log(error);
            }
        }
    }, []);
    console.log(userName)
    useEffect(() => {
        console.log('prodadmin', prodsAdmin)

        if (user == 'admin') {
            const prods = productos.filter((prod) => {
                return !prodsAdmin.includes(prod.id)
            })
            console.log('filteredprods', prods)

            fetch(`https://stocksystemback-uorn.onrender.com/productos/admin`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(prods)
            })
                .then(response => response.json())
                .then(data => {
                    console.log('Success:', data);
                })
                .catch((error) => {
                    console.error('Error:', error);
                });
        }
    }, [prodsAdmin])
    const cambiarOrden = (columna) => {
        setOrden((ordenActual) => ({
            columna,
            direccion: ordenActual.direccion === 'asc' && ordenActual.columna === columna ? 'desc' : 'asc'
        }));
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
    // Agrupar los productos por marca
    const agruparPorFamilia = (productos) => {
        return productos.reduce((acc, producto) => {
            // Asumiendo que cada producto tiene una propiedad 'familia'
            if (!acc[producto.marca]) {
                acc[producto.marca] = [];
            }
            acc[producto.marca].push(producto);
            return acc;
        }, {});
    };
    function formatoNumero(numero) {
        // Verificar si el número es negativo
        if (numero < 0) {
            // Convertir el número a positivo y luego a string para añadir los paréntesis
            return '(' + (-numero) + ')';
        } else {
            // Si el número no es negativo, simplemente devolverlo como string
            return numero.toString();
        }
    }

    // Ejemplo de uso
    console.log(formatoNumero(-123));  // Imprime "(123)"
    console.log(formatoNumero(456));   // Imprime "456"

    const prepararDatosParaExcel = (productosAgrupados) => {
        const datosExcel = [];
        for (const prod in productosAgrupados) {
            productosAgrupados[prod].forEach(item => {
                datosExcel.push({
                    'Artículo': item.code,
                    'EAN': item.codbarras,
                    'Descripción': item.name,
                    'Marca': item.marca,
                    'Caja por': item.unxcaja,
                    'DEPOSITO HIPERMAYORISTA SALTA': stockExcel.find(
                        stock => stock.code === item.code
                    )?.stockdep ?? 0,
                    'bultos': item.quantityb,
                    'unidades': item.quantityu,
                    'total': item.total,
                    'diferencia': formatoNumero(item.total - (stockExcel.find(
                        stock => stock.code === item.code
                    )?.stockdep ?? 0))
                });
            });
        }
        return datosExcel;
    };

    const mapDataForExcel = (data) => {
        return data.map(item => ({
            'Codigo': item.code,
            'EAN': item.codbarras,
            'Descripcion': item.name,
            'Cod Proveedor': item.codprov,
            'Cantidad Unid.': item.quantityu,
            'Cantidad Bulto': item.quantityb,
            'Unid. x Caja': item.unxcaja,
            'Total': item.total,
        }));
    }

    const exportToExcel = (apiData, fileName) => {
        console.log('allproducts', allProducts)
        try {
            fetch(`https://stocksystemback-uorn.onrender.com/historial`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(allProducts)
            })
                .then(response => response.json())
                .then(data => {
                    console.log('Success:', data);
                })
                .catch((error) => {
                    console.error('Error:', error);
                });
        } catch (error) {
            console.error('Error:', error);
        }
        const productosAgrupados = agruparPorFamilia(apiData);
        const datosParaExcel = prepararDatosParaExcel(productosAgrupados);
        const fileType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
        const fileExtension = '.xlsx';

        const ws = XLSX.utils.json_to_sheet(datosParaExcel);
        const wb = { Sheets: { 'data': ws }, SheetNames: ['data'] };
        const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        const data = new Blob([excelBuffer], { type: fileType });
        FileSaver.saveAs(data, fileName + fileExtension);
    }

    const ordenarProductos = (productos) => {
        return productos.sort((a, b) => {
            if (a[orden.columna] < b[orden.columna]) {
                return orden.direccion === 'asc' ? -1 : 1;
            }
            if (a[orden.columna] > b[orden.columna]) {
                return orden.direccion === 'asc' ? 1 : -1;
            }
            return 0;
        });
    };

    const onChange = (e) => {

        const { name, value } = e.target;
        console.log(value);

        if (value) {
            setProdsFiltrados(productos.filter((prod) => {
                return prod[name].toString().toLowerCase().includes(value.toLowerCase());
            }));
        } else {
            // Si no hay ningún valor, muestra todos los productos
            setProdsFiltrados(productos);
        }
    };
    const changeDate = (update) => {
        const [start, end] = update;
        setDateRange(update);

        // Verifica si ambas fechas, inicio y fin, están establecidas
        if (start && end) {
            const sDate = new Date(start).toISOString().split('T')[0];
            const eDate = new Date(end).toISOString().split('T')[0];
            console.log(sDate)
            console.log(eDate)
            setProdsFiltrados(productos.filter((prod) => {
                const prodDate = new Date(prod.date).toISOString().split('T')[0];
                return prodDate >= sDate && prodDate <= eDate;
            }));
        } else {
            setProdsFiltrados(productos);
        }
    };
    const resetProds = async (user) => {
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

                fetch(user == 'admin' ? `https://stocksystemback-uorn.onrender.com/productos/admin` : `https://stocksystemback-uorn.onrender.com/products`, {
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
                            'Los productos han sido eliminados.',
                            'success'
                        );
                        // Actualizar lista de productos
                        actualizarListaProductos();
                    })
                    .catch(error => {
                        console.error('Error al eliminar los productos:', error);
                        Swal.fire('Error', error.message, 'error'); // Mostrar mensaje de error
                    });

            }
        });
    }
    const handleFileSelect = (event) => {
        const files = event.target.files;
        if (files && files[0]) {
            const file = files[0];
            setFileName(file.name);

            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = new Uint8Array(e.target.result);
                    const workbook = XLSX.read(data, { type: 'array' });
                    const firstSheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[firstSheetName];
                    if (!worksheet) throw new Error('No se encontró la hoja de cálculo');

                    const dataForServer = XLSX.utils.sheet_to_json(worksheet);
                    const requiredFields = ['Artículo', 'Caja por', 'DEPOSITO HIPERMAYORISTA SALTA', 'Descripción', 'EAN', 'Marca'];

                    const isRowValid = (row) => requiredFields.every(field => row.hasOwnProperty(field));
                    const modifiedData = dataForServer
                        .filter(isRowValid)
                        .map(row => ({
                            code: row['Artículo'],
                            unxcaja: row['Caja por'],
                            stockdep: row['DEPOSITO HIPERMAYORISTA SALTA'],
                            descripcion: row['Descripción'],
                            codbarras: row['EAN'],
                            marca: row['Marca'],
                        }));

                    sendDataToServer(modifiedData);
                } catch (error) {
                    console.error('Error al procesar el archivo:', error);
                    // Manejar el error adecuadamente en tu UI
                }
            };

            reader.onerror = (error) => {
                console.error('Error al leer el archivo:', error);
                // Manejar el error adecuadamente en tu UI
            };

            reader.readAsArrayBuffer(file);
        }
    };

    const getExcelStock = () => {

        fetch(`https://stocksystemback-uorn.onrender.com/excelstock`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        })
            .then(response => response.json())
            .then(data => {
                setStockExcel(data);
            })
            .catch((error) => {
                console.error('Error:', error);
            });
    }
    // Simulación de envío de datos al servidor
    function sendDataToServer(data) {
        console.log(data)
        try {
            fetch(`https://stocksystemback-uorn.onrender.com/excelstock`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            })
                .then(response => response.json())
                .then(data => {
                    console.log('Success:', data);
                })
                .then(() => {
                    getExcelStock();
                })
                .catch((error) => {
                    console.error('Error:', error);
                });
        } catch (error) {
            console.error('Error:', error);
        }
        console.log("Datos enviados al servidor:", data);
        // Aquí implementarías la lógica para enviar los datos al servidor
    }
    console.log(prodsFiltrados)
    const productosOrdenados = ordenarProductos(user == 'admin' ? prodsFiltrados.length > 0 ? prodsFiltrados : prodsAdmin : prodsFiltrados.length > 0 ? prodsFiltrados : productos);
    return (
        // <section>
        //     <section>
        //         <h1 className="text-center text-light mt-5">Productos</h1>
        //     </section>
        //     <section>
        //         <h3 className="text-light" style={{ marginLeft: '10%' }}>Filtros</h3>
        //         <section className="d-flex align-items-center justify-content-start gap-2" style={{ marginLeft: '10%' }}>
        //             <section className="d-flex">
        //                 <span className="text-light fw-bold" style={{ marginLeft: '10%' }}>Codigo:</span>
        //                 <input type="text" className="rounded ms-1" placeholder="Ingresa el Codigo" name='code' onChange={onChange} />
        //             </section>
        //             <section className="d-flex">
        //                 <span className="text-light fw-bold" style={{ marginLeft: '10%' }}>Nombre:</span>
        //                 <input type="text" className="rounded ms-1" placeholder="Ingresa el Nombre" name='name' onChange={onChange} />
        //             </section>
        //             <section className="d-flex ms-5 gap-1" >
        //                 <span className="text-light fw-bold">Fecha: </span>
        //                 <DatePicker
        //                     selectsRange={true}
        //                     startDate={startDate}
        //                     endDate={endDate}
        //                     onChange={(update) => {
        //                         changeDate(update);
        //                     }}
        //                     isClearable={true}
        //                     placeholderText="Seleccione el rango"
        //                 />
        //             </section>
        //         </section>
        //     </section>
        //     <MDBListGroup className="w-100 mt-5">
        //         <section className="d-flex justify-content-end mb-3" style={{ marginRight: '10%' }}>
        //             <Popup trigger={<button className="btn btn-success" >agregar Nuevo</button>} modal position={'center center'}>
        //                 {close => <ABMProductos close={close} productos={productos} actualizarListaProductos={actualizarListaProductos}></ABMProductos>}
        //             </Popup>
        //         </section>
        //         {/* Header */}
        //         <section className="container pt-1 rounded d-flex align-items-center justify-content-center bg-black">
        //             <section className="row w-100 ">
        //                 <section className="col d-flex justify-content-center ">
        //                 </section>
        //                 <section className="col d-flex justify-content-center">
        //                     <p className="fw-bold text-light mb-0 cursor-pointer" onClick={() => cambiarOrden('name')}>Nombre</p>
        //                 </section>
        //                 <section className="col d-flex justify-content-center">
        //                     <p className="fw-bold text-light mb-0 cursor-pointer" onClick={() => cambiarOrden('code')} >Codigo</p>
        //                 </section>
        //                 <section className="col d-flex justify-content-center">
        //                     <p className="fw-bold text-light mb-0 cursor-pointer" onClick={() => cambiarOrden('date')} >Fecha Vencimiento</p>
        //                 </section>
        //                 <section className="col d-flex justify-content-center">
        //                     <p className="fw-bold text-light mb-0 cursor-pointer" onClick={() => cambiarOrden('quantityu')} >Cantidad Unid.</p>
        //                 </section>
        //                 <section className="col d-flex justify-content-center ">
        //                     <p className="fw-bold text-light mb-0 cursor-pointer"  onClick={() => cambiarOrden('quantityb')} >Cantidad Bulto</p>
        //                 </section>
        //                 <section className="col d-flex justify-content-center">
        //                     <p className="fw-bold text-light mb-0">Acciones</p>
        //                 </section>
        //             </section>
        //         </section>
        //         {/* Items */}
        //         <ProductosItems productos={productosOrdenados} />
        //     </MDBListGroup>
        // </section>
        <section className="container-fluid p-3">
            <section className="d-flex align-items-center justify-content-between">
                <div className="me-5">
                    <input
                        accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                        style={{ display: 'none' }}
                        id="raised-button-file"
                        multiple
                        type="file"
                        onChange={handleFileSelect}
                    />
                    <label htmlFor="raised-button-file">
                        <Button variant="contained" component="span" startIcon={<CloudUploadIcon />}>
                            {fileName}
                        </Button>
                    </label>
                </div>
                <button className="btn btn-danger" onClick={() => navigate('/')}>Salir</button>
            </section>
            <h1 className="text-center text-light">Productos</h1>
            <section className="row">
                <section className="col-12">
                    <h3 className="text-light">Filtros</h3>

                    <section className="row">
                        <section className="col-md-4 mb-2">
                            <span className="text-light fw-bold">Codigo:</span>
                            <input type="text" className="form-control" placeholder="Ingresa el Codigo" name='code' onChange={onChange} />
                        </section>
                        <section className="col-md-4 mb-2">
                            <span className="text-light fw-bold">Nombre:</span>
                            <input type="text" className="form-control" placeholder="Ingresa el Nombre" name='name' onChange={onChange} />
                        </section>
                        {/* <section className="col-md-4 mb-2 "> */}
                        {/* <span className="text-light fw-bold d-block">Fecha: </span> */}
                        {/* <DatePicker */}
                        {/* className="form-control" */}
                        {/* selectsRange={true} */}
                        {/* startDate={startDate} */}
                        {/* endDate={endDate} */}
                        {/* onChange={(update) => changeDate(update)} */}
                        {/* isClearable={true} */}
                        {/* placeholderText="Seleccione el rango" */}
                        {/* /> */}
                        {/* </section> */}
                    </section>
                </section>
            </section>

            <MDBListGroup className="mt-3">
                <section className="d-flex justify-content-end mb-3 flex-wrap " style={{ marginRight: '9%' }}>

                    {userName == 'admin' && <button className="btn btn-danger btn-sm me-2 mb-2" onClick={() => resetProds('user')} ><span>Reset usuarios</span></button>}
                    {userName == 'admin' && <button className="btn btn-danger btn-sm me-2 mb-2" onClick={() => resetProds('admin')}><span>Reset admin</span></button>}
                    <button className="btn btn-light btn-sm me-2 mb-2" onClick={() => actualizarListaProductos()}><i className="fa fa-refresh"></i></button>
                    <button
                        className="btn btn-primary btn-sm me-2 mb-2"
                        onClick={() => exportToExcel(userName == 'admin' ? prodsAdmin : productos, 'Productos')}
                    >
                        <i className="fa fa-file-excel-o"></i> Descargar Excel
                    </button>
                    <button className="btn btn-success btn-sm me-2 mb-2" onClick={() => navigate("/abmProductos")}>Agregar Nuevo</button>
                </section>

                <section className="container pt-1 rounded d-flex align-items-center justify-content-center bg-black">
                    <section className="row w-100">
                        <section className="col d-flex justify-content-center">
                            <p className="fw-bold text-light mb-0 cursor-pointer d-block" onClick={() => cambiarOrden('name')}>Nombre</p>
                        </section>

                        {/* Ocultar en móviles */}
                        <section className="col d-flex justify-content-center d-none d-md-flex">
                            <p className="fw-bold text-light mb-0 cursor-pointer" onClick={() => cambiarOrden('code')}>Cod. Interno</p>
                        </section>
                        <section className="col d-flex justify-content-center d-none d-md-flex">
                            <p className="fw-bold text-light mb-0 cursor-pointer" onClick={() => cambiarOrden('code')}>Cod. Proveedor</p>
                        </section>
                        <section className="col d-flex justify-content-center d-none d-md-flex">
                            <p className="fw-bold text-light mb-0 cursor-pointer" onClick={() => cambiarOrden('code')}>Cod. Barras</p>
                        </section>

                        <section className="col d-flex justify-content-center">
                            <p className="fw-bold text-light mb-0 cursor-pointer d-block" onClick={() => cambiarOrden('quantityu')}>Cant Unid.</p>
                        </section>

                        <section className="col d-flex justify-content-center">
                            <p className="fw-bold text-light mb-0 cursor-pointer d-block" onClick={() => cambiarOrden('quantityb')}>Cant Bulto</p>
                        </section>

                        {/* Ocultar en móviles */}
                        <section className="col d-flex justify-content-center d-none d-md-flex">
                            <p className="fw-bold text-light mb-0 cursor-pointer">Cant. x Caja</p>
                        </section>
                        <section className="col-md d-flex justify-content-center d-none d-md-flex">
                            <p className="fw-bold text-light mb-0 cursor-pointer">Total</p>
                        </section>

                        <section className="col d-flex justify-content-center ">
                            <p className="fw-bold text-light mb-0 d-block">Acciones</p>
                        </section>
                    </section>
                </section>

                <ProductosItems productos={productosOrdenados} actualizarListaProductos={actualizarListaProductos} />
            </MDBListGroup>
        </section>
    );
};

export default Productos;