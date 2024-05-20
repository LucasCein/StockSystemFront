import { useContext, useEffect, useState } from "react";
import { ProvRouteContext } from "../ProvRouteContext/ProvRouteocntext";


const ProdsSugs = ({ name, setProducto, producto, close }) => {
    const [articulos, setArticulos] = useState([]);
    const [paginaActual, setPaginaActual] = useState(0);
    const [suggestions, setSuggestions] = useState([]);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const {back}= useContext(ProvRouteContext)
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    const articulosPorPagina = isMobile ? 2 : 5;
    useEffect(() => {
        fetch(`${back}/products/suggest`)
            .then(response => response.json())
            .then(data => { setArticulos(data), setSuggestions(data) })
            .catch(error => console.error(error));
    }, [])
    const selectArt = (art) => {
        console.log(art)
        if (name == 'name') {
            setProducto({ ...producto, name: art.descripcion.toLowerCase(), code: art.code, codbarras: art.codbarras, codprov: art.codprov, unxcaja: art.unxcaja, familia: art.familia, marca: art.marca })
        }
        else {
            setProducto({ ...producto, name: art.descripcion.toLowerCase(), code: art.code, codbarras: art.codbarras, codprov: art.codprov, unxcaja: art.unxcaja, familia: art.familia, marca: art.marca })
        }
        close()
    }
    // const inputChange = (e) => {
    //     const { value } = e.target
    //     console.log('value', value)
    //     if (name == 'descripcion' || name == 'codprov') {
    //         setSuggestions(articulos.filter((art) => art[name].toLowerCase().includes(value.toLowerCase())));
    //     } else {
    //         setSuggestions(articulos.filter((art) => art[name].includes(value.toLowerCase())));
    //     }
    //     setPaginaActual(0);
    // }

    const inputChange = (e) => {
        
        const value = e.target.value.toLowerCase(); // Convertir el valor de entrada a minúsculas para la comparación
        const palabrasClave = value.split(' ').filter(palabra => palabra.trim() !== ''); // Dividir la entrada en palabras clave y eliminar espacios vacíos
    
        // Filtrar los artículos que contienen todas las palabras clave
        const articulosFiltrados = articulos.filter((articulo) => {
            // Convertir la descripción (o el campo relevante) a minúsculas para la comparación
            const descripcion = articulo[name].toLowerCase();
            // Verificar que todas las palabras clave estén contenidas en la descripción
            return palabrasClave.every(palabraClave => descripcion.includes(palabraClave));
        });
    
        setSuggestions(articulosFiltrados);
        setPaginaActual(0); // Restablecer a la primera página de resultados
    }
    

    // Calcula el número total de páginas
    const totalPaginas = Math.ceil(suggestions.length / articulosPorPagina);
    // Obtiene los artículos para la página actual
    const articulosEnPagina = suggestions.slice(
        paginaActual * articulosPorPagina,
        (paginaActual + 1) * articulosPorPagina
    );
    // Navega a la página siguiente
    const siguientePagina = () => {
        setPaginaActual((actual) => Math.min(actual + 1, totalPaginas - 1));
    };

    // Navega a la página anterior
    const anteriorPagina = () => {
        setPaginaActual((actual) => Math.max(actual - 1, 0));
    };
    console.log(suggestions)
    console.log(name)
    return (
        <div className="container-fluid text-center">
            <h1 className="text-dark">Artículos sugeridos</h1>
            <section className="d-flex flex-column flex-sm-row gap-2 justify-content-center align-items-center">
                <label className="text-dark" htmlFor="searchInput">Buscar:</label>
                <input type="text" id="searchInput" className="form-control" onChange={(e) => inputChange(e)} />
            </section>
            <div className="row justify-content-center mt-3">
                <div className="col-12 col-md-8 col-lg-9">
                    <div className="table-responsive">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Descripción</th>
                                    <th>Código</th>
                                    <th>Cod. Prov</th>
                                </tr>
                            </thead>
                            <tbody>
                                {articulosEnPagina.map((articulo, index) => (
                                    <tr key={index} onClick={() => selectArt(articulo)}>
                                        <td>{articulo.descripcion}</td>
                                        <td>{articulo.code}</td>
                                        <td>{articulo.codprov}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <nav aria-label="Page navigation">
                        <ul className="pagination justify-content-center">
                            <li className={`page-item ${paginaActual === 0 ? 'disabled' : ''}`}>
                                <button className="page-link" onClick={anteriorPagina}>Anterior</button>
                            </li>
                            <li className={`page-item ${paginaActual === totalPaginas - 1 ? 'disabled' : ''}`}>
                                <button className="page-link" onClick={siguientePagina}>Siguiente</button>
                            </li>
                        </ul>
                    </nav>
                    <div>Página {paginaActual + 1} de {totalPaginas}</div>
                </div>
            </div>
        </div>
    );

}

export default ProdsSugs