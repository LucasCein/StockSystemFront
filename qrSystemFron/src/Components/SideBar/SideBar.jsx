import { useContext, useEffect, useState } from "react";
import {
  BsGrid1X2Fill,
  BsFillGrid3X3GapFill,
  BsClockHistory,
  BsCashCoin,
  BsFileEarmarkText,
  BsHouse,
  BsFillPersonFill,
  BsCurrencyDollar,
  BsQuestionCircle,
  BsFillPersonLinesFill,
} from "react-icons/bs";
import { Link, NavLink } from "react-router-dom";
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
        {/* <li className='sidebar-list-item'>
                <NavLink to="/home">
                    <BsGrid1X2Fill className='icon'/> Dashboard
                </NavLink>
            </li>
            <li className='sidebar-list-item'>
                <NavLink to={"/properties"}>
                    <BsHouse className='icon'/> Propiedades
                </NavLink>
            </li> */}
        <li className="sidebar-list-item" onClick={isMobile ? OpenSidebar: null}>
          <NavLink to={"/productos"}>
            <BsFillGrid3X3GapFill className="icon" />{" "}
            <span className="text-light">Productos</span>
          </NavLink>
        </li>
        {userName == "admin" && (
          <li className="sidebar-list-item" onClick={isMobile ? OpenSidebar: null}>
            <NavLink to={"/historial"}>
              <BsClockHistory className="icon" />{" "}
              <span className="text-light">Historial</span>
            </NavLink>
          </li>
        )}
        {/* <li className='sidebar-list-item'>
                <NavLink to={"/products/24"}>
                    <BsCashCoin className='icon'/> Pagos
                </NavLink>
            </li>  */}
        {/* 
            <li className='sidebar-list-item'>
                <NavLink to={"/bill"}>
                    <BsFileEarmarkText className='icon'/> Facturas
                </NavLink>
            </li>

            <li className='sidebar-list-item'>
                <NavLink to={"/Clientes"}>
                    <BsFillPersonFill className='icon'/> Clientes
                </NavLink>
            </li>

            <li className='sidebar-list-item'>
                <NavLink to={"/Ventas"}>
                    <BsCurrencyDollar className='icon'/> Ventas
                </NavLink>
            </li>
            <li className='sidebar-list-item'>
                <NavLink to={"/Consultas"}>
                    <BsQuestionCircle className='icon'/> Consultas
                </NavLink>
            </li> */}
      </ul>
    </aside>
  );
}

export default Sidebar;
