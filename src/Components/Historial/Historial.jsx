import { useContext, useEffect, useState } from "react"
import './historial.css'
import { ProvRouteContext } from "../ProvRouteContext/ProvRouteocntext";
import { BsSearch } from "react-icons/bs";
const Historial = () => {
    const [users, setUsers] = useState([]);
    const [productos, setProductos] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [fechaDesde, setFechaDesde] = useState("");
    const [fechaHasta, setFechaHasta] = useState("");
    const {back} = useContext(ProvRouteContext)
    useEffect(() => {
        fetch(`${back}/users`)
            .then(response => response.json())
            .then(data => {
                setUsers(data);
            })
            .catch(error => {
                console.error(error);
            });
    }, [])
    const getproductos = (userName) => {
        fetch(`${back}/historial/${userName}`)
            .then(response => response.json())
            .then(data => {
                setProductos(data);
                setFilteredProducts(data);
            })
            .catch(error => {
                console.error(error);
            });
    }
    const onChangeDate = () => {
        const filtered = productos.filter((item) => {
            const inputDate = new Date(item.date).toISOString().split('T')[0];
            return inputDate >= fechaDesde && inputDate <= fechaHasta;
        });

        setFilteredProducts(filtered);
    };
    const ajustarZonaHoraria = (fecha) => {
        const date = new Date(fecha);
        const newDate = new Date(date.getTime() + date.getTimezoneOffset() * 60 * 1000);
        return newDate.toLocaleDateString();
    };
    console.log('filter', filteredProducts)
    console.log(fechaDesde)
    console.log(fechaHasta)
    console.log('prods', productos)
    return (
        <section>
            <h1 className="text-center text-light mt-3 mb-5">Historial</h1>
            <section className="d-flex flex-column justify-content-around gap-5">
                <section className="d-flex flex-column align-items-center">
                    <h3 className="text-light">Usuarios</h3>
                    <section className="user-list-container  p-3" style={{ maxHeight: '300px', width: '300px', overflowY: 'auto' }}>
                        {users.map(user => (
                            <section key={user.id} className="user-card p-2 mb-2" style={{ boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                                <p className="m-0" onClick={() => getproductos(user.name)}>{user.name}</p>
                            </section>
                        ))}
                    </section>
                </section>
                <section className="ms-3 d-flex align-items-center gap-3" >
                    <section className="d-flex align-items-center gap-2">
                        <label className="text-light">Fecha Desde:</label>
                        <input
                            type="date"
                            className="form-control"
                            value={fechaDesde}
                            onChange={(e) => setFechaDesde(e.target.value)}
                        />
                    </section>
                    <section className="d-flex align-items-center gap-2">
                        <label className="text-light">Fecha Hasta:</label>
                        <input
                            type="date"
                            className="form-control"
                            value={fechaHasta}
                            onChange={(e) => setFechaHasta(e.target.value)}
                        />
                    </section>
                    <button className="btn btn-success btn-sm d-flex align-items-center p-2" onClick={onChangeDate}><BsSearch /></button>
                </section>
                <section className="d-flex flex-column align-items-center mx-3">
                    <h3 className="text-light">Productos</h3>
                    <section className="table-container product-card p-3 mb-2">
                        <table>
                            <thead>
                                <tr>
                                    <th>Nombre</th>
                                    <th>Fecha</th>
                                    <th>Código</th>
                                    <th>Cant B</th>
                                    <th>Cant U</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredProducts.map(producto => (
                                    <tr key={producto.productid}>
                                        <td>{producto.name}</td>
                                        <td>{ajustarZonaHoraria(producto.date)}</td>
                                        <td>{producto.code}</td>
                                        <td>{producto.quantityb}</td>
                                        <td>{producto.quantityu}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </section>
                </section>

            </section>
        </section>

    )
}

export default Historial