import { useContext, useEffect, useState } from "react"
import './historial.css'
import { ProvRouteContext } from "../ProvRouteContext/ProvRouteocntext";
const Historial = () => {
    const [users, setUsers] = useState([]);
    const [productos, setProductos] = useState([]);
    useEffect(() => {
        fetch('https://stocksystemback-uorn.onrender.com/users')
            .then(response => response.json())
            .then(data => {
                setUsers(data);
            })
            .catch(error => {
                console.error(error);
            });
    }, [])
    const getproductos = (userName) => {
        fetch(`https://stocksystemback-uorn.onrender.com/historial/${userName}`)
            .then(response => response.json())
            .then(data => {
                setProductos(data);
            })
            .catch(error => {
                console.error(error);
            });
    }
    return (
        <section>
            <h1 className="text-center text-light mt-3 mb-5">Historial</h1>
            <section className="d-flex justify-content-around gap-5">
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
                <section className="d-flex flex-column align-items-center">
                    <h3 className="text-light">Productos</h3>
                    <section className="table-container product-card p-3 mb-2">
                        <table>
                            <thead>
                                <tr>
                                    <th>Nombre</th>
                                    <th>Código</th>
                                    <th>Cant B</th>
                                    <th>Cant U</th>
                                </tr>
                            </thead>
                            <tbody>
                                {productos.map(producto => (
                                    <tr key={producto.productid}>
                                        <td>{producto.name}</td>
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