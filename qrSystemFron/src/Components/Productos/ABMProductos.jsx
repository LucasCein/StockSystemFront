import { useEffect, useRef, useState } from "react";
import { FaMinus, FaPlus } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import './css/abmprods.css'
import Popup from "reactjs-popup";
const ABMProductos = ({ close, productid, productos, actualizarListaProductos }) => {
    const navigate = useNavigate()
    const [articulos, setArticulos] = useState([])
    const [suggestions, setSuggestions] = useState([]);
    const [suggestionP, setSuggestionP] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const codeRef = useRef(null);
    const nameRef = useRef(null);
    const codBarrasRef = useRef(null);
    const codProvRef = useRef(null);
    const quantitybRef = useRef(null);
    const quantityuRef = useRef(null);
    const dateRef = useRef(null);
    const idealstockRef = useRef(null);
    const [idprod, setIdProd] = useState(0)
    useEffect(() => {
        setIdProd(productid)
        // Añadir el evento de escucha cuando el componente se monta
        window.addEventListener("keydown", handleKeyDown);
        // Eliminar el evento de escucha cuando el componente se desmonta
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, []);
    useEffect(() => {
        fetch('https://stocksystemback.onrender.com/products/suggest')
            .then(response => response.json())
            .then(data => setArticulos(data))
            .catch(error => console.error(error));
    }, [])
    useEffect(() => {
        setError("")
        if (productid) {
            fetch(`https://stocksystemback.onrender.com/products/${idprod}`)
                .then(response => response.json())
                .then(data => {
                    // Asumiendo que 'data' es el objeto que contiene la fecha en formato ISO
                    const fechaAjustada = data.date.split("T")[0];
                    setProducto({
                        ...data,
                        date: fechaAjustada // Aquí aseguras que la fecha esté en el formato correcto
                    });
                })
                .catch(error => {
                    console.error(error);
                });
        }
    }, [idprod]);
    console.log(idprod)
    useEffect(() => {
        const input = quantitybRef.current;
        if (input) {
            input.focus();
            
        }
    }, [quantitybRef]); // Dependencia: quantitybRef
    
    const [producto, setProducto] = useState({
        name: '',
        code: '',
        quantityb: 0,
        quantityu: 0,
        date: '',
        idealstock: '',
        codbarras:'',
        codprov:''
    });
    const [error, setError] = useState(""); // Estado para manejar los mensajes de error
    console.log(articulos)
    const handleChange = (e) => {
        const { name, value } = e.target;
        console.log(name, value)
        if (name === "date") {
            // Convierte el valor del input y la fecha actual a formato YYYY-MM-DD
            const inputDate = new Date(value).toISOString().split('T')[0];
            const today = new Date().toISOString().split('T')[0];

            if (inputDate < today) {
                setError("La fecha no puede ser anterior a la actual");
            }
            else {
                setError("");
            }
            setProducto({ ...producto, [name]: value });
        } else if (name == 'code') {
            setProducto({ ...producto, code: value });
            console.log('code', value)
            if (value) {
                setSuggestions(articulos.filter((art) => art.code.toLowerCase().includes(value.toLowerCase())));
            } else {
                setSuggestions([]);
            }
        }
        else if(name=='name'){
            setProducto({ ...producto, name: value });
            if (value) {
                setSuggestions(articulos.filter((art) => art.descripcion.toLowerCase().includes(value.toLowerCase())));
            } else {
                setSuggestions([]);
            }
        }
        else {
            // Manejo de otros campos
            if (name === 'quantityb' || name === 'quantityu' || name === 'idealstock') {
                setProducto({ ...producto, [name]: value === '' ? '' : Number(value) });
            }
            else {
                setProducto({ ...producto, [name]: value });
            }
        }
    };
    const handleChangeBarras=(e)=>{
        const {name,value}=e.target
        if (value && name=='codprov') {
            setSuggestions(articulos.filter((art) => art[name].toLowerCase().includes(value.toLowerCase())));
        } else {
            setSuggestions([]);
        }
        setProducto({ ...producto, [name]: value })
        const prod=articulos.find(art=>art[name]==value)
        setProducto({...producto,code:prod.code,name:prod.descripcion,codbarras:prod.codbarras,codprov:prod.codprov})
    }
    console.log(productos)
    const navigateToNextProduct = () => {
        const index = productos.findIndex(product => parseInt(product.productid) == parseInt(idprod));
        console.log(index)
        if (index === -1 || index + 1 >= productos.length) {
            return null;
        }
        const nextProductId = productos[index + 1].productid;
        setIdProd(nextProductId);
        return nextProductId

    }
    const handleKeyDown = (e) => {
        const currentActive = document.activeElement;
        switch (e.key) {
            case "ArrowRight":
                // Navegar al siguiente campo
                if (currentActive == codeRef.current) {
                    nameRef.current.focus();
                } else if (currentActive == nameRef.current) {
                    quantitybRef.current.focus();
                } else if (currentActive == quantitybRef.current) {
                    quantityuRef.current.focus();
                } else if (currentActive == quantityuRef.current) {
                    dateRef.current.focus();
                } else if (currentActive == dateRef.current) {
                    idealstockRef.current.focus();
                }
                break;
            case "ArrowLeft":
                // Navegar al campo anterior
                if (currentActive == idealstockRef.current) {
                    dateRef.current.focus();
                } else if (currentActive == dateRef.current) {
                    quantityuRef.current.focus();
                } else if (currentActive == quantityuRef.current) {
                    quantitybRef.current.focus();
                } else if (currentActive == quantitybRef.current) {
                    nameRef.current.focus();
                } else if (currentActive == nameRef.current) {
                    codeRef.current.focus();
                }
                break;
            case "Enter":
                // Acción al presionar Enter
                if (!productid) {
                    // Si estás agregando un producto

                    handleSubmit(); // Asegúrate de que esta función maneja el evento 'e'
                } else {
                    console.log(e)
                    // Si estás editando un producto
                    handleSubmit(); // Actualizar el producto
                    // Lógica adicional para cerrar el formulario actual y abrir uno nuevo con el siguiente producto
                }
                break;
            default:
                break;
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
    const handleBultoChange = (aux) => {

        aux == 's' ? setProducto({ ...producto, quantityb: parseInt(producto.quantityb) + 1 }) : parseInt(producto.quantityb) > 0 && setProducto({ ...producto, quantityb: parseInt(producto.quantityb) - 1 });
    };
    const handleUnitChange = (aux) => {

        aux == 's' ? setProducto({ ...producto, quantityu: parseInt(producto.quantityu) + 1 }) : parseInt(producto.quantityu) > 0 && setProducto({ ...producto, quantityu: parseInt(producto.quantityu) - 1 });
    };
    console.log(producto)
    console.log(productid)
    console.log('error:', error)
    const handleSubmit = async (e) => {
        if (e) e.preventDefault()
        console.log(producto.name, producto.code, producto.idealstock)
        if (!producto.name || !producto.code || !producto.idealstock) {
            setError("Todos los campos son obligatorios");
            return;
        }

        if (producto.quantityb == 0 && producto.quantityu == 0) {
            try {
                fetch(`https://stocksystemback.onrender.com/products/${productid}`, {
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
                        const MySwal = withReactContent(Swal)
                        console.log('entropa')
                        MySwal.fire({
                            title: <strong>Se ha eliminado con Exito!</strong>,
                            icon: 'success',
                            preConfirm: () => {
                                actualizarListaProductos();
                            }
                        })
                        // Si la respuesta es exitosa, actualizar la lista de productos
                        // No necesitas parsear la respuesta como JSON si esperas texto plano

                    })
                    .catch(error => {
                        console.error('Error al eliminar el producto:', error);
                        alert(error.message); // Muestra el mensaje de error
                    });
                close(); // Cerrar el modal o resetear el formulario como sea necesario
            }
            catch (err) {
                console.log(error)
            }
        }
        // Prevenir el comportamiento por defecto de envío del formulario

        // Verificar si todos los campos están llenos

        else if (productid) {
            // Si hay un ID, intenta hacer el PUT
            try {
                const respuesta = await fetch(`https://stocksystemback.onrender.com/products`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(producto)
                })

                if (!respuesta.ok) {
                    throw new Error(`HTTP error! status: ${respuesta.status}`);
                }
                const MySwal = withReactContent(Swal);
                MySwal.fire({
                    title: <strong>Se ha actualizado con Éxito!</strong>,
                    icon: 'success',
                    timer: 3000, // La alerta se cerrará después de 3000 milisegundos (3 segundos)
                    timerProgressBar: true,
                    showConfirmButton: false, // Muestra una barra de progreso que indica cuánto tiempo queda
                    didOpen: (toast) => {
                        toast.addEventListener('mouseenter', Swal.stopTimer);
                        toast.addEventListener('mouseleave', Swal.resumeTimer);
                    }
                });


                const resultado = await respuesta.json();
                console.log('Producto actualizado con：', resultado);
                navigateToNextProduct();
                console.log(productid)
            } catch (error) {
                console.error('Error al actualizar el producto:', error);
                setError(error.message);
            }
        }
        //art.code == producto.code && formatToDDMMYYYY(art.date) == producto.date
        else if (productos.find(art => art.code == producto.code && formatToDDMMYYYY(art.date) == formatToDDMMYYYY(producto.date)) != undefined) {
            const productoExistente = productos.find(art => art.code == producto.code && formatToDDMMYYYY(art.date) == formatToDDMMYYYY(producto.date));
            console.log(productoExistente)
            if (productoExistente) {
                // Actualizar cantidades del producto existente
                const productoActualizado = {
                    ...productoExistente,
                    quantityb: productoExistente.quantityb + producto.quantityb,
                    quantityu: productoExistente.quantityu + producto.quantityu
                };
                try {
                    const respuesta = await fetch(`https://stocksystemback.onrender.com/products`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(productoActualizado)
                    });

                    if (!respuesta.ok) {
                        throw new Error(`HTTP error! status: ${respuesta.status}`);
                    }
                    const MySwal = withReactContent(Swal)
                    MySwal.fire({
                        title: <strong>Se ha agregado con Exito!</strong>,
                        icon: 'success',
                        preConfirm: () => {
                            navigate("/productos")
                        }
                    })
                    // Código para manejar la respuesta exitosa
                } catch (error) {
                    console.error('Error al actualizar el producto:', error);
                    setError(error.message);
                }
            }

        }
        else {

            try {
                const respuesta = await fetch('https://stocksystemback.onrender.com/products', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(producto)
                });

                if (!respuesta.ok) {
                    throw new Error(`HTTP error! status: ${respuesta.status}`);
                }
                const MySwal = withReactContent(Swal)
                MySwal.fire({
                    title: <strong>Se ha agregado con Exito!</strong>,
                    icon: 'success',
                    preConfirm: () => {
                        navigate("/productos")
                    }
                })
                const resultado = await respuesta.json();
                console.log('Producto agregado con éxito:', resultado);
                close(); // Cerrar el modal o resetear el formulario como sea necesario
            } catch (error) {
                console.error('Error al agregar el producto:', error);
                setError(error.message);
            }
            // Si todo está correcto, intenta hacer el POST


        }
        actualizarListaProductos();
        if (productid) {
            const nextProd = navigateToNextProduct()
            if (nextProd == null) {
                console.log(nextProd)
                close()
            }
        }
        setError("")
    };
    console.log(producto.date)
    console.log('suggs', suggestions)
    return (
        <section>
            <h1 className="text-center text-dark mb-4">{productid ? 'Editar Producto' : 'Agregar Producto'}</h1>
            <form onSubmit={handleSubmit} className="mx-auto" style={{ maxWidth: '500px' }}>
                <section className="row mb-3">
                    <label htmlFor="name" className="col-sm-4 col-form-label">Codigo:</label>
                    <div className="col-sm-8">
                        <input type="text" className="form-control" id="code" name="code" ref={codeRef} placeholder="Codigo" onChange={handleChange} value={producto.code} required />
                    </div>
                    {suggestions.length > 0 && (
                        <ul className="suggestions mt-5 w-50">
                            {suggestions.map((articulo, index) => (
                                <li key={index} onClick={() => {
                                    setProducto({ ...producto, code: articulo.code, name: articulo.descripcion.toLowerCase(),codbarras:articulo.codbarras, codprov:articulo.codprov })
                                    setSuggestions([]);
                                   
                                }}>
                                    {articulo.descripcion} ({articulo.code})
                                </li>
                            ))}
                        </ul>
                    )}
                </section>
                <section className="row mb-3">
                    <label htmlFor="name" className="col-sm-4 col-form-label">Cod. Barras:</label>
                    <div className="col-sm-8">
                        <input type="text" className="form-control" id="codBarras" name="codbarras" ref={codBarrasRef} placeholder="Cod. Barras" onChange={handleChangeBarras} value={producto.codbarras} required />
                    </div>
                </section>
                <section className="row mb-3">
                    <label htmlFor="name" className="col-sm-4 col-form-label">Cod. Prov:</label>
                    <div className="col-sm-8">
                        <input type="text" className="form-control" id="codProv" name="codprov" ref={codProvRef} placeholder="Cod. Prov." onChange={handleChangeBarras} value={producto.codprov} required />
                    </div>
                    {suggestions.length > 0 && (
                        <ul className="suggestions mt-5 w-50">
                            {suggestions.map((articulo, index) => (
                                <li key={index} onClick={() => {
                                    setProducto({ ...producto, code: articulo.code, name: articulo.descripcion.toLowerCase(),codbarras:articulo.codbarras, codprov:articulo.codprov })
                                    setSuggestions([]);
                                    
                                }}>
                                    {articulo.descripcion} ({articulo.code})
                                </li>
                            ))}
                        </ul>
                    )}
                </section>
                <section className="row mb-3">
                    <label htmlFor="name" className="col-sm-4 col-form-label">Nombre:</label>
                    <div className="col-sm-8">
                        <input type="text" className="form-control" id="name" name="name" ref={nameRef} placeholder="Nombre" onChange={handleChange} value={producto.name} required />
                    </div>
                    {suggestions.length > 0 && (
                        <ul className="suggestions mt-5 w-50">
                            {suggestions.map((articulo, index) => (
                                <li key={index} onClick={() => {
                                    setProducto({ ...producto, code: articulo.code, name: articulo.descripcion.toLowerCase(),codbarras:articulo.codbarras, codprov:articulo.codprov })
                                    setSuggestions([]);
                                    
                                }}>
                                    {articulo.descripcion} ({articulo.code})
                                </li>
                            ))}
                        </ul>
                    )}
                </section>
                <section className="row mb-3">
                    <label htmlFor="quantity" className="col-sm-4 col-form-label">Stock:</label>
                    <div className="col-sm-4">
                        <label htmlFor="quantityb">Bultos:</label>
                        <div className="input-group">
                            <button className="btn btn-success btn-sm" type="button" onClick={() => handleBultoChange('r')}><FaMinus /></button>
                            <input type="number" className="form-control text-center" id="quantityb" name="quantityb" ref={quantitybRef} placeholder="Ingrese Stock" onChange={handleChange} value={producto.quantityb} required />
                            <button className="btn btn-success btn-sm" type="button" onClick={() => handleBultoChange('s')}><FaPlus /></button>
                        </div>
                    </div>
                    <div className="col-sm-4">
                        <label htmlFor="quantityu">Unidades:</label>
                        <div className="input-group">
                            <button className="btn btn-success btn-sm" type="button" onClick={() => handleUnitChange('r')}><FaMinus /></button>
                            <input type="number" className="form-control text-center" id="quantityu" name="quantityu" ref={quantityuRef} placeholder="Ingrese Stock" onChange={handleChange} value={producto.quantityu} required />
                            <button className="btn btn-success btn-sm" type="button" onClick={() => handleUnitChange('s')}><FaPlus /></button>
                        </div>
                    </div>
                </section>
                <section className="row mb-3">
                    <label htmlFor="date" className="col-sm-4 col-form-label">Fecha de Vencimiento:</label>
                    <div className="col-sm-8">
                        <input type="date" className="form-control" id="date" name="date" ref={dateRef} placeholder="Ingrese Fecha de Vencimiento" onChange={handleChange} value={producto.date} required />
                    </div>
                </section>
                <section className="row mb-3">
                    <label htmlFor="idealstock" className="col-sm-4 col-form-label">Stock Ideal:</label>
                    <div className="col-sm-8">
                        <input type="number" className="form-control" id="idealstock" name="idealstock" ref={idealstockRef} placeholder="Ingrese Stock Ideal" onChange={handleChange} value={producto.idealstock} required />
                    </div>
                </section>
                <div className="d-flex justify-content-center">
                    <button type="submit" className="btn btn-success mt-4">{productid ? 'Editar' : 'Agregar'}</button>
                </div>
                {/* Mensaje de Error */}
                {error && <div className="alert alert-danger mt-2 text-center" role="alert">{error}</div>}

            </form>
        </section>
    );
}

export default ABMProductos;
