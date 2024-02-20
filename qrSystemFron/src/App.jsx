import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import Sidebar from './Components/SideBar/SideBar'
import { MyProvider } from './Components/ProvRouteContext/ProvRouteocntext'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './App.css'
import Header from './Components/Header/Header'
import Productos from './Components/Productos/Productos'
import DetalleProducto from './Components/Productos/DetalleProducto'
import Login from './Components/Login/Login'
import ABMProductos from './Components/Productos/ABMProductos'


function App() {
  const [openSidebarToggle, setOpenSidebarToggle] = useState(false)

  const OpenSidebar = () => {
    setOpenSidebarToggle(!openSidebarToggle)
  }

  return (

    <MyProvider>
      <BrowserRouter>

        <Routes>
          <Route
            path='/home'
            element={<div className='grid-container'>
              <Header OpenSidebar={OpenSidebar} />
              <Sidebar openSidebarToggle={openSidebarToggle} OpenSidebar={OpenSidebar} />
            </div>
            }
          />
          <Route
            path='/productos'
            element={<div className='grid-container'>
              <Header OpenSidebar={OpenSidebar} />
              <Sidebar openSidebarToggle={openSidebarToggle} OpenSidebar={OpenSidebar} />
              <Productos></Productos>
            </div>
            }
          />
          <Route
            path='/abmProductos'
            element={<div className='grid-container'>
              <Header OpenSidebar={OpenSidebar} />
              <Sidebar openSidebarToggle={openSidebarToggle} OpenSidebar={OpenSidebar} />
              <ABMProductos></ABMProductos>
            </div>
            }
          />
          <Route
            path='/products/:productid'
            element={
              <DetalleProducto></DetalleProducto>
            }
          />
          <Route
            path='*'
            element={<div className='grid-container'>
              <Header OpenSidebar={OpenSidebar} />
              <Sidebar openSidebarToggle={openSidebarToggle} OpenSidebar={OpenSidebar} />
            </div>
            }
          />
          <Route
            path='/'
            element={<div><Login></Login></div>
            }
          />
        </Routes>
      </BrowserRouter>
    </MyProvider>
  )
}

export default App
