import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { ProvRouteContext } from "../ProvRouteContext/ProvRouteocntext";

const Login = () => {
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate()
    const {userName,setUserName,setUserId, back}=useContext(ProvRouteContext)
    useEffect(() => {
        sessionStorage.setItem('userName', name);
    }, [name]);
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${back}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name, password })
            });

            const responseData = await response.json();
            setUserId(responseData.userid)
            if (response.ok) {
                if (responseData.message === 'Login exitoso') {
                    setUserName(name)
                    // Manejo de login exitoso
                    navigate('/home');
                }
            } else {
                // Manejo de respuesta de error
                Swal.fire('Error al iniciar sesión', responseData.message, 'error');
            }
        } catch (error) {
            // Manejo de errores de red o del servidor
            Swal.fire('Error', 'Hubo un problema al conectarse al servidor', 'error');
            console.log('Error en el login:', error);
        }
    };


    // return (
    //     <form onSubmit={handleSubmit}>
    //         <input
    //             type="text"
    //             value={name}
    //             onChange={(e) => setName(e.target.value)}
    //             placeholder="Correo electrónico"
    //         />
    //         <input
    //             type="password"
    //             value={password}
    //             onChange={(e) => setPassword(e.target.value)}
    //             placeholder="Contraseña"
    //         />
    //         <button type="submit">Iniciar sesión</button>
    //     </form>
    // );
    return (
        <div className="bg-light">
            <div className="container">
                <div className="row align-items-center" style={{ minHeight: '100vh' }}>
                    {/* Parte izquierda: Formulario */}
                    <div className="col-md-6">
                        <form onSubmit={handleSubmit} className="p-5">
                            <h2 className="mb-4 text-center text-dark fw-bold">Iniciar Sesión</h2>
                            <div className="form-group mb-3">
                                <label htmlFor="emailInput">Usuario</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    id="emailInput"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Ingresa tu usuario"
                                />
                            </div>
                            <div className="form-group mb-4">
                                <label htmlFor="passwordInput">Contraseña</label>
                                <input
                                    type="password"
                                    className="form-control"
                                    id="passwordInput"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Ingresa tu contraseña"
                                />
                            </div>
                            <button type="submit" className="btn btn-primary w-100">Iniciar sesión</button>
                        </form>
                    </div>

                    {/* Parte derecha: Imagen */}
                    <div className="col-md-6 d-none d-md-block">
                        <img
                            src="https://yt3.googleusercontent.com/ytc/APkrFKacLugMm4fDM-Z3Adnygu3JlSyoHNoueAgpZTpT=s900-c-k-c0x00ffffff-no-rj"
                            alt="Descripción de la imagen"
                            className="img-fluid"
                            style={{ maxHeight: '100vh', objectFit: 'cover' }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );

}

export default Login