import { useContext, useEffect, useState } from "react";
import {
  BsFillGrid3X3GapFill,
  BsClockHistory,
  BsFillPersonLinesFill,
  BsTable,
} from "react-icons/bs";
import { NavLink } from "react-router-dom";
import { ProvRouteContext } from "../ProvRouteContext/ProvRouteocntext";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

function Sidebar({ openSidebarToggle, OpenSidebar }) {
  const { userName, setUserName } = useContext(ProvRouteContext);

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);
  const resetProds = async (userName) => {
    const MySwal = withReactContent(Swal);

    // Mostrar un modal de confirmación
    MySwal.fire({
      title: "¿Estás seguro?",
      text: "Esta acción no se puede deshacer",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, eliminarlo!",
      cancelButtonText: "No, cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        // Si el usuario confirma, proceder con la eliminación

        fetch(
          userName == "admin"
            ? `https://stocksystemback-mxpi.onrender.com/productos/admin`
            : `https://stocksystemback-mxpi.onrender.com/products`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
          }
        )
          .then((response) => {
            if (!response.ok) {
              // Si el servidor responde con un error, lanzar una excepción
              throw new Error(response.statusText);
            }
            // Mostrar mensaje de éxito
            MySwal.fire(
              "Eliminado!",
              "Los productos han sido eliminados.",
              "success"
            );
            // Actualizar lista de productos
          })
          .catch((error) => {
            console.error("Error al eliminar los productos:", error);
            Swal.fire("Error", error.message, "error"); // Mostrar mensaje de error
          });

      }
    });
  };
  return (
    <aside
      id="sidebar"
      className={openSidebarToggle ? "sidebar-responsive" : ""}
    >
      <div className="sidebar-title">
        <div className="sidebar-brand">
          <BsFillPersonLinesFill className="icon_header " />{" "}
          {userName.toUpperCase()}
        </div>
        <span className="icon close_icon" onClick={OpenSidebar}>
          X
        </span>
      </div>

      <ul className="sidebar-list">
        {userName !== "admin" &&

          <li className="sidebar-list-item" onClick={isMobile ? OpenSidebar : null}>
            <NavLink to={"/productos"}>
              <BsFillGrid3X3GapFill className="icon" />{" "}
              <span className="text-light">Productos</span>
            </NavLink>
          </li>}
        {userName == "admin" && (
          <>
            <li className="sidebar-list-item" onClick={isMobile ? OpenSidebar : null}>
              <NavLink to={"/compararps"}>
                <BsTable className="icon" />{" "}
                <span className="text-light">Comparar Planillas</span>
              </NavLink>
            </li>
            <li className="sidebar-list-item" onClick={isMobile ? OpenSidebar : null}>
              <NavLink to={"/compararope"}>
                <BsTable className="icon" />{" "}
                <span className="text-light">Comparar Operadores</span>
              </NavLink>
            </li>
            <li className="sidebar-list-item" onClick={isMobile ? OpenSidebar : null}>
              <NavLink to={"/historial"}>
                <BsClockHistory className="icon" />{" "}
                <span className="text-light">Historial</span>
              </NavLink>
            </li>
            <section className="d-flex flex-column align-items-center mt-5 gap-2">
              <button
                className="btn btn-danger btn-sm me-2 mb-2"
                onClick={() => resetProds("userName")}
              >
                <span>Reset usuarios</span>
              </button>
              <button
                className="btn btn-danger btn-sm me-2 mb-2"
                onClick={() => resetProds("admin")}
              >
                <span>Reset admin</span>
              </button>
            </section>
          </>
        )}

      </ul>
    </aside>
  );
}

export default Sidebar;
