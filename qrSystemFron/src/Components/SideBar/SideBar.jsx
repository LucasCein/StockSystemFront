import { useContext, useEffect, useState } from "react";
import {
  BsFillGrid3X3GapFill,
  BsClockHistory,
  BsFillPersonLinesFill,
  BsTable,
} from "react-icons/bs";
import { NavLink } from "react-router-dom";
import { ProvRouteContext } from "../ProvRouteContext/ProvRouteocntext";

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
          </>
        )}

      </ul>
    </aside>
  );
}

export default Sidebar;
