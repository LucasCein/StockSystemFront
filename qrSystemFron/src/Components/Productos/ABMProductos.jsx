import { useContext, useEffect, useRef, useState } from "react";
import { FaMinus, FaPlus } from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import "./css/abmprods.css";
import Popup from "reactjs-popup";
import { BsSearch } from "react-icons/bs";
import ProdsSugs from "./ProdsSugs";
import CustomSpinner from "../CustomSpinner/CustomSpinner";
import { ProvRouteContext } from "../ProvRouteContext/ProvRouteocntext";
const ABMProductos = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { productid = null } = location.state || {};
  const [productos, setProductos] = useState([]);
  const [articulos, setArticulos] = useState([]);
  const [suggestionP, setSuggestionP] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const codeRef = useRef(null);
  const nameRef = useRef(null);
  const codBarrasRef = useRef(null);
  const codProvRef = useRef(null);
  const quantitybRef = useRef(null);
  const quantityuRef = useRef(null);
  const dateRef = useRef(null);
  const idealstockRef = useRef(null);
  const [idprod, setIdProd] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { userName, setUserName } = useContext(ProvRouteContext);
  const [isLoading, setIsLoading] = useState(true);
  const [aux, setAux] = useState("");
  const [producto, setProducto] = useState({
    name: "",
    code: "",
    quantityb: 0,
    quantityu: 0,
    date: new Date().toISOString().split("T")[0],
    idealstock: 0,
    codbarras: "",
    codprov: "",
    unxcaja: "",
    username: [userName],
  });
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  useEffect(() => {
    if (productid == null) {
      setIsLoading(false);
    }
    setIdProd(productid);

    // Añadir el evento de escucha cuando el componente se monta
    window.addEventListener("keydown", handleKeyDown);
    // Eliminar el evento de escucha cuando el componente se desmonta
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);
  useEffect(() => {
    fetch("https://stocksystemback-mxpi.onrender.com/products/suggest")
      .then((response) => response.json())
      .then((data) => setArticulos(data))
      .catch((error) => console.error(error));
  }, []);
  useEffect(() => {
    if (userName.includes("admin")) {
      fetch("https://stocksystemback-mxpi.onrender.com/productos/admin")
        .then((response) => response.json())
        .then((data) => setProductos(data))
        .catch((error) => console.error(error));
    } else {
      fetch(`https://stocksystemback-mxpi.onrender.com/products/${userName}`)
        .then((response) => response.json())
        .then((data) => setProductos(data))
        .catch((error) => console.error(error));
    }
  }, []);
  console.log(productid);
  useEffect(() => {
    setError("");
    if (productid) {
      if (userName == "admin") {
        fetch(
          `https://stocksystemback-mxpi.onrender.com/productos/admin/${
            idprod == 0 ? productid : idprod
          }`
        )
          .then((response) => response.json())
          .then((data) => {
            console.log("success", data);
            // Asumiendo que 'data' es el objeto que contiene la fecha en formato ISO
            const fechaAjustada = data.date.split("T")[0];
            setProducto({
              ...data,
              date: fechaAjustada, // Aquí aseguras que la fecha esté en el formato correcto
            });
          })
          .then(() => setIsLoading(false))
          .catch((error) => {
            console.error(error);
          });
      } else {
        fetch(
          `https://stocksystemback-mxpi.onrender.com/products/edit/${
            idprod == 0 ? productid : idprod
          }`
        )
          .then((response) => response.json())
          .then((data) => {
            // Asumiendo que 'data' es el objeto que contiene la fecha en formato ISO
            const fechaAjustada = data.date.split("T")[0];
            setProducto({
              ...data,
              date: fechaAjustada, // Aquí aseguras que la fecha esté en el formato correcto
            });
          })
          .then(() => setIsLoading(false))
          .catch((error) => {
            console.error(error);
          });
      }
    }
  }, [idprod]);
  console.log(producto);
  useEffect(() => {
    const input = quantitybRef.current;
    if (input) {
      input.focus();
    }
  }, [quantitybRef]); // Dependencia: quantitybRef
  console.log(userName);
  const actualizarListaProductos = () => {
    // Llamada a la API para obtener la lista actualizada
    fetch("https://stocksystemback-mxpi.onrender.com/products")
      .then((response) => response.json())
      .then((data) => {
        setProductos(data);
        // Actualizar el estado con la nueva lista de productos
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const [error, setError] = useState(""); // Estado para manejar los mensajes de error
  console.log(articulos);
  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log(name, value);
    setProducto({
      ...producto,
      [name]: value,
    });
    if(name == 'code'){
      const prod=articulos.find((art) => art.code === value);
      if(prod){
        setProducto({
          ...producto,
          code: value,
          name: prod.descripcion,
          codbarras: prod.codbarras,
          codprov: prod.codprov,
          unxcaja: prod.unxcaja,
          familia: prod.familia,
          marca: prod.marca,
          quantityb:0,
          quantityu:0
        });
      }
    }
  };

  const handleChangeBarras = (e) => {
    const { name, value } = e.target;

    // Actualiza el input de codbarras conforme el usuario escribe
    let newState = { ...producto, [name]: value };

    // Busca un producto solo si el valor ingresado corresponde completamente a un código de barras existente
    const prod = articulos.find((art) => art[name] === value);
    if (prod) {
      newState = {
        ...newState,
        code: prod.code,
        name: prod.descripcion,
        codbarras: prod.codbarras,
        codprov: prod.codprov,
        unxcaja: prod.unxcaja,
        familia: prod.familia,
        marca: prod.marca,
      };
    }

    // Actualiza el estado con el nuevo objeto, ya sea solo con el código de barras actualizado o con el producto completo si hubo coincidencia
    setProducto(newState);
  };

  console.log(productos);

  const navigateToNextProduct = () => {
    const index = productos.findIndex(
      (product) => parseInt(product.productid) == parseInt(idprod)
    );
    console.log(index);
    if (index === -1 || index + 1 >= productos.length) {
      return null;
    }
    const nextProductId = productos[index + 1].productid;
    setIdProd(nextProductId);
    return nextProductId;
  };
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      // Chequea si el elemento activo es el input del código de barras
      if (document.activeElement === codBarrasRef.current) {
        e.preventDefault(); // Previene el comportamiento por defecto (envío del formulario)
        // Lógica adicional, si es necesario, después de capturar el código de barras
        return; // Salir de la función para evitar que se ejecute el resto del código destinado a otras teclas
      }
      // Aquí puedes agregar lógica adicional para manejar el "Enter" en otros inputs
    }
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
          console.log(e);
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
    console.log(dateString);
    // Dividimos la cadena de fecha en sus componentes (año, mes, día)
    let dateParts = dateString.split("-");

    // Convertimos los componentes en números enteros
    // Date interpreta los meses desde 0 (enero) hasta 11 (diciembre), por lo que restamos 1 al mes
    let year = parseInt(dateParts[0], 10);
    let month = parseInt(dateParts[1], 10) - 1;
    let day = parseInt(dateParts[2], 10);

    // Creamos un objeto de fecha con los componentes
    let date = new Date(year, month, day);

    // Obtenemos el día, mes y año del objeto de fecha
    // Asegurándonos de añadir un cero delante si es menor de 10
    let formattedDay = ("0" + date.getDate()).slice(-2);
    let formattedMonth = ("0" + (date.getMonth() + 1)).slice(-2);
    let formattedYear = date.getFullYear();

    // Construimos la cadena con el formato DD/MM/YYYY
    return `${formattedDay}/${formattedMonth}/${formattedYear}`;
  }
  const handleBultoChange = (aux) => {
    aux == "s"
      ? setProducto({
          ...producto,
          quantityb: parseInt(producto.quantityb) + 1,
        })
      : parseInt(producto.quantityb) > 0 &&
        setProducto({
          ...producto,
          quantityb: parseInt(producto.quantityb) - 1,
        });
  };
  const handleUnitChange = (aux) => {
    aux == "s"
      ? setProducto({
          ...producto,
          quantityu: parseInt(producto.quantityu) + 1,
        })
      : parseInt(producto.quantityu) > 0 &&
        setProducto({
          ...producto,
          quantityu: parseInt(producto.quantityu) - 1,
        });
  };
  console.log(producto);
  console.log(productos);
  console.log(productid);
  console.log("error:", error);
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setIsSubmitting(true);
    console.log(producto.name, producto.code, producto.idealstock);

    if (!producto.name || !producto.code) {
      setError("Todos los campos son obligatorios");
      return;
    }
    if (producto.quantityb <= 0 && producto.quantityu <= 0) {
      setError("Las cantidades deben ser mayores a 0");
      return;
    }
    if (productid) {
      // Si hay un ID, intenta hacer el PUT
      const total =
        parseInt(producto.quantityb) * parseInt(producto.unxcaja) +
        parseInt(producto.quantityu);
      if (userName == "admin") {
        try {
          const respuesta = await fetch(
            `https://stocksystemback-mxpi.onrender.com/productos/admin`,
            {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ ...producto, total: total }),
            }
          );

          if (!respuesta.ok) {
            throw new Error(`HTTP error! status: ${respuesta.status}`);
          }
          const MySwal = withReactContent(Swal);
          MySwal.fire({
            title: <strong>Se ha agregado con Exito!</strong>,
            icon: "success",
            preConfirm: () => {
              navigate("/productos");
            },
          });
        } catch (error) {
          console.error("Error al actualizar el producto:", error);
          setError(error.message);
        }
      } else {
        try {
          const respuesta = await fetch(
            `https://stocksystemback-mxpi.onrender.com/products`,
            {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ ...producto, total: total }),
            }
          );

          if (!respuesta.ok) {
            throw new Error(`HTTP error! status: ${respuesta.status}`);
          }
          const MySwal = withReactContent(Swal);
          MySwal.fire({
            title: <strong>Se ha agregado con Exito!</strong>,
            icon: "success",
            preConfirm: () => {
              navigate("/productos");
            },
          });
        } catch (error) {
          console.error("Error al actualizar el producto:", error);
          setError(error.message);
        }
      }
    } else {
      if (userName == "admin") {
        if (
          productos?.find(
            (art) =>
              art.code == producto.code &&
              formatToDDMMYYYY(art.date) == formatToDDMMYYYY(producto.date)
          ) !== undefined
        ) {
          const productoExistente = productos?.find(
            (art) =>
              art.code == producto.code &&
              formatToDDMMYYYY(art.date) == formatToDDMMYYYY(producto.date)
          );
          const productoActualizado = {
            ...productoExistente,
            quantityb: productoExistente.quantityb + producto.quantityb,
            quantityu: productoExistente.quantityu + producto.quantityu,
            total:
              (parseInt(productoExistente.quantityb) +
                parseInt(producto.quantityb)) *
                parseInt(productoExistente.unxcaja) +
              (parseInt(productoExistente.quantityu) +
                parseInt(producto.quantityu)),
          };
          try {
            const respuesta = await fetch(
              `https://stocksystemback-mxpi.onrender.com/productos/admin`,
              {
                method: "PUT",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(productoActualizado),
              }
            );

            if (!respuesta.ok) {
              throw new Error(`HTTP error! status: ${respuesta.status}`);
            }
            const MySwal = withReactContent(Swal);
            MySwal.fire({
              title: <strong>Se ha agregado con Exito!</strong>,
              icon: "success",
              preConfirm: () => {
                navigate("/productos");
              },
            });
            // Código para manejar la respuesta exitosa
          } catch (error) {
            console.error("Error al actualizar el producto:", error);
            setError(error.message);
          }
        }
        try {
          const respuesta = await fetch(
            "https://stocksystemback-mxpi.onrender.com/productos/admin",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                ...producto,
                total:
                  producto.quantityb * producto.unxcaja + producto.quantityu,
              }),
            }
          );

          if (!respuesta.ok) {
            throw new Error(`HTTP error! status: ${respuesta.status}`);
          }
          const MySwal = withReactContent(Swal);
          MySwal.fire({
            title: <strong>Se ha agregado con Exito!</strong>,
            icon: "success",
            preConfirm: () => {
              navigate("/productos");
            },
          });
          const resultado = await respuesta.json();
          console.log("Producto agregado con éxito:", resultado);
          //close(); // Cerrar el modal o resetear el formulario como sea necesario
        } catch (error) {
          console.error("Error al agregar el producto:", error);
          setError(error.message);
        }
      } else {
        if (
          productos?.find(
            (art) =>
              art.code == producto.code &&
              formatToDDMMYYYY(art.date) == formatToDDMMYYYY(producto.date) &&
              art.username.includes(userName)
          ) != undefined
        ) {
          const productoExistente = productos?.find(
            (art) =>
              art.code == producto.code &&
              formatToDDMMYYYY(art.date) == formatToDDMMYYYY(producto.date) &&
              art.username.includes(userName)
          );
          const productoActualizado = {
            ...productoExistente,
            quantityb: parseInt(productoExistente.quantityb) + parseInt(producto.quantityb),
            quantityu: parseInt(productoExistente.quantityu) + parseInt(producto.quantityu),
            total:
              (parseInt(productoExistente.quantityb) +
                parseInt(producto.quantityb)) *
                parseInt(productoExistente.unxcaja) +
              (parseInt(productoExistente.quantityu) +
                parseInt(producto.quantityu)),
          };
          try {
            const respuesta = await fetch(
              `https://stocksystemback-mxpi.onrender.com/products`,
              {
                method: "PUT",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(productoActualizado),
              }
            );

            if (!respuesta.ok) {
              throw new Error(`HTTP error! status: ${respuesta.status}`);
            }
            const MySwal = withReactContent(Swal);
            MySwal.fire({
              title: <strong>Se ha actualizado con Exito!</strong>,
              icon: "success",
              preConfirm: () => {
                navigate("/productos");
              },
            });
            // Código para manejar la respuesta exitosa
          } catch (error) {
            console.error("Error al actualizar el producto:", error);
            setError(error.message);
          }
        }
        else{
          try {
            const respuesta = await fetch(
              "https://stocksystemback-mxpi.onrender.com/products",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  ...producto,
                  total:
                    producto.quantityb * producto.unxcaja + producto.quantityu,
                  username: [userName],
                }),
              }
            );
  
            if (!respuesta.ok) {
              throw new Error(`HTTP error! status: ${respuesta.status}`);
            }
            const MySwal = withReactContent(Swal);
            MySwal.fire({
              title: <strong>Se ha agregado con Exito!</strong>,
              icon: "success",
              preConfirm: () => {
                navigate("/productos");
              },
            });
            const resultado = await respuesta.json();
            console.log("Producto agregado con éxito:", resultado);
            //close(); // Cerrar el modal o resetear el formulario como sea necesario
          } catch (error) {
            console.error("Error al agregar el producto:", error);
            setError(error.message);
          }
        }
      }
      // Si todo está correcto, intenta hacer el POST
    }
    // actualizarListaProductos();
    // if (productid) {
    //     const nextProd = navigateToNextProduct()
    //     if (nextProd == null) {
    //         console.log(nextProd)
    //         close()
    //     }
    // }
    setError("");
    setIsSubmitting(false);
  };
  console.log("llego prod", producto);

  return isLoading ? (
    <CustomSpinner />
  ) : (
    <section>
      <h1 className="text-center text-light mb-4 mt-3">
        {productid ? "Editar Producto" : "Agregar Producto"}
      </h1>
      <form
        onSubmit={handleSubmit}
        className="mx-auto"
        style={{ maxWidth: "500px" }}
      >
        <section className="row mb-3">
          <label htmlFor="name" className="col-sm-4 col-form-label text-light">
            Cod. Barras:
          </label>
          <div className="col-sm-8">
            <input
              type="text"
              className="form-control"
              id="codBarras"
              name="codbarras"
              ref={codBarrasRef}
              placeholder="Cod. Barras"
              onChange={handleChangeBarras}
              value={producto.codbarras}
              required
            />
          </div>
        </section>
        <section className="row mb-3">
          <label htmlFor="name" className="col-sm-4 col-form-label text-light">
            Codigo:
          </label>
          <div className="col-sm-8 d-flex justify-content-center  align-items-center gap-2">
            <input
              type="text"
              className="form-control"
              id="code"
              name="code"
              ref={codeRef}
              placeholder="Codigo"
              onChange={handleChange}
              value={producto.code}
              required
            />
            <Popup
              trigger={
                <button className="btn btn-success" type="button">
                  <BsSearch />
                </button>
              }
              modal
              contentStyle={{
                width: isMobile ? "90%" : "auto",
                height: isMobile ? "70%" : "auto",
              }}
            >
              {(close) => (
                <ProdsSugs
                  name={"code"}
                  setProducto={setProducto}
                  producto={producto}
                  close={close}
                ></ProdsSugs>
              )}
            </Popup>
          </div>
        </section>

        <section className="row mb-3">
          <label htmlFor="name" className="col-sm-4 col-form-label text-light">
            Cod. Prov:
          </label>
          <div className="col-sm-8 d-flex justify-content-center  align-items-center gap-2">
            <input
              type="text"
              className="form-control"
              id="codProv"
              name="codprov"
              ref={codProvRef}
              placeholder="Cod. Prov."
              onChange={handleChangeBarras}
              value={producto.codprov}
            />
            <Popup
              trigger={
                <button className="btn btn-success" type="button">
                  <BsSearch />
                </button>
              }
              modal
              contentStyle={{ width: isMobile ? "90%" : "auto" }}
            >
              {(close) => (
                <ProdsSugs
                  name={"codprov"}
                  setProducto={setProducto}
                  producto={producto}
                  close={close}
                ></ProdsSugs>
              )}
            </Popup>
          </div>
        </section>
        <section className="row mb-3">
          <label htmlFor="name" className="col-sm-4 col-form-label text-light">
            Nombre:
          </label>
          <div className="col-sm-8 d-flex justify-content-center  align-items-center gap-2">
            <input
              type="text"
              className="form-control"
              id="name"
              name="name"
              ref={nameRef}
              placeholder="Nombre"
              onChange={handleChange}
              value={producto.name}
              required
            />
            <Popup
              trigger={
                <button className="btn btn-success" type="button">
                  <BsSearch />
                </button>
              }
              modal
              contentStyle={{ width: isMobile ? "90%" : "auto" }}
            >
              {(close) => (
                <ProdsSugs
                  name={"descripcion"}
                  setProducto={setProducto}
                  producto={producto}
                  close={close}
                ></ProdsSugs>
              )}
            </Popup>
          </div>
        </section>
        <section className="row mb-3">
          <label
            htmlFor="quantity"
            className="col-sm-4 col-form-label text-light"
          >
            Stock:
          </label>
          <div className="col-sm-4">
            <label htmlFor="quantityb" className="text-light">
              Bultos:
            </label>
            <div className="input-group">
              <button
                className="btn btn-success btn-sm"
                type="button"
                onClick={() => handleBultoChange("r")}
              >
                <FaMinus />
              </button>
              <input
                type="number"
                className="form-control text-center"
                id="quantityb"
                name="quantityb"
                ref={quantitybRef}
                placeholder="Ingrese Stock"
                onChange={handleChange}
                value={producto.quantityb}
                required
              />
              <button
                className="btn btn-success btn-sm"
                type="button"
                onClick={() => handleBultoChange("s")}
              >
                <FaPlus />
              </button>
            </div>
          </div>
          <div className="col-sm-4">
            <label htmlFor="quantityu" className="text-light">
              Unidades:
            </label>
            <div className="input-group">
              <button
                className="btn btn-success btn-sm"
                type="button"
                onClick={() => handleUnitChange("r")}
              >
                <FaMinus />
              </button>
              <input
                type="number"
                className="form-control text-center"
                id="quantityu"
                name="quantityu"
                ref={quantityuRef}
                placeholder="Ingrese Stock"
                onChange={handleChange}
                value={producto.quantityu}
                required
              />
              <button
                className="btn btn-success btn-sm"
                type="button"
                onClick={() => handleUnitChange("s")}
              >
                <FaPlus />
              </button>
            </div>
          </div>
        </section>

        <div className="d-flex justify-content-center">
          <button
            type="submit"
            className="btn btn-success mt-4"
            disabled={isSubmitting && setError === ""}
          >
            {productid ? "Editar" : "Agregar"}
          </button>
        </div>
        {/* Mensaje de Error */}
        {error && (
          <div className="alert alert-danger mt-2 text-center" role="alert">
            {error}
          </div>
        )}
      </form>
    </section>
  );
};

export default ABMProductos;
