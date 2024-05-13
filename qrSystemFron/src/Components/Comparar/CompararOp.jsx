import { ThemeProvider } from "@emotion/react";
import { FormControl, InputLabel, MenuItem, Select, createTheme } from "@mui/material"
import FileSaver from "file-saver";
import { useEffect, useState } from "react";
import Spreadsheet from "react-spreadsheet";
import * as XLSX from 'xlsx';
const CompararOp = () => {
    const [users, setUsers] = useState([]);
    const [user, setUser] = useState({});
    const [user2, setUser2] = useState({});
    const [productsUser, setProductsUser] = useState([]);
    const [productsUser2, setProductsUser2] = useState([]);
    const [finalProducts, setFinalProducts] = useState([]);
    useEffect(() => {
        fetch('https://stocksystemback-mxpi.onrender.com/users')
            .then(response => response.json())
            .then(data => {
                setUsers(data);
            })
            .catch(error => {
                console.error(error);
            });
    }, [])
    const handleChange = (event) => {
        const { name } = event.target.value
        setUser(event.target.value);
        console.log(name)

        try {
            fetch(`https://stocksystemback-mxpi.onrender.com/products/${name}`)
                .then(response => response.json())
                .then(data => {
                    setProductsUser(data);
                })
                .catch(error => {
                    console.error(error);
                });
        } catch (error) {
            console.error(error);
        }
    };
    const handleChange1 = (event) => {
        setUser2(event.target.value);
        const { name } = event.target.value
        try {
            fetch(`https://stocksystemback-mxpi.onrender.com/products/${name}`)
                .then(response => response.json())
                .then(data => {
                    setProductsUser2(data);
                })
                .catch(error => {
                    console.error(error);
                });
        } catch (error) {
            console.error(error);
        }
    };
    const darkTheme = createTheme({
        palette: {
            mode: 'dark',
            primary: {
                main: '#90caf9', // Un azul claro para los elementos seleccionados y foco
            },
        },
    });
    const handleClick = () => {
        let finalProduct = [[{ value: "Artículo" }, { value: "Cod. Barras" }, { value: "Nombre" }, { value: "Marca" }, { value: "Diferencia" }]];
        if (user && user2) {
            productsUser.forEach(product => {
                const matchedProduct = productsUser2.find(prod => prod.code === product.code);
                if (matchedProduct) {
                    finalProduct.push([
                        { value: product.code },
                        { value: product.codbarras },
                        { value: product.name },
                        { value: product.marca },
                        { value: parseInt(product.total) - parseInt(matchedProduct.total) }
                    ]);
                }
            });
            setFinalProducts(finalProduct);
        }
    };
    const handleDownload = () => {
        const ws = XLSX.utils.aoa_to_sheet(finalProducts.map(row => row.map(cell => cell.value)));
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Comparison");
        XLSX.writeFile(wb, "ComparisonReport.xlsx");
    };
    const prepararDatosParaExcel = (productos) => {
        console.log(productos);  // Log the structure to verify the data
        const datosExcel = productos.map(item => ({
            Artículo: item.code,
            EAN: item.codbarras,
            Descripción: item.name,
            Marca: item.marca,
            "Caja por": item.unxcaja,
            bultos: item.quantityb,
            unidades: item.quantityu,
            total: item.total,
        }));
        return datosExcel;
    };
    

    const exportToExcel = (apiData, fileName) => {
        const datosParaExcel = prepararDatosParaExcel(apiData);
        const fileType =
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
        const fileExtension = ".xlsx";

        const ws = XLSX.utils.json_to_sheet(datosParaExcel);
        const wb = { Sheets: { data: ws }, SheetNames: ["data"] };
        const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
        const data = new Blob([excelBuffer], { type: fileType });
        FileSaver.saveAs(data, fileName + fileExtension);
    };
    return (
        <section>
            <h1 className="text-center text-light mt-3 mb-5">Comparar Planilla Operadores</h1>
            <section className="d-flex justify-content-center gap-5 ">

                <section>
                    <ThemeProvider theme={darkTheme}>
                        <Select
                            sx={{
                                m: 1, minWidth: 80,
                                color: 'white', // Color del texto
                                backgroundColor: 'rgba(255, 255, 255, 0.15)', // Fondo semi-transparente blanco
                                borderColor: '#90caf9', // Borde en azul claro
                                borderWidth: '1px',
                                borderStyle: 'solid',
                                borderRadius: 1, // Bordes ligeramente redondeados
                                '& .MuiSvgIcon-root': {
                                    color: 'white', // Color del icono desplegable
                                },
                                '&:before, &:after': {
                                    borderColor: 'transparent', // Elimina el borde inferior que agrega MUI
                                },
                                '&:hover': {
                                    backgroundColor: 'rgba(255, 255, 255, 0.25)', // Fondo más opaco al pasar el mouse
                                },
                                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.5)' // Sombra para dar profundidad
                            }}
                            label="User"
                            value={user}
                            onChange={handleChange}
                        >
                            {users.map(user => (
                                <MenuItem key={user.id} value={user}>{user.name}</MenuItem>
                            ))}

                        </Select>
                    </ThemeProvider>
                </section>
                <section>
                    <ThemeProvider theme={darkTheme}>
                        <Select
                            sx={{
                                m: 1, minWidth: 80,
                                color: 'white', // Color del texto
                                backgroundColor: 'rgba(255, 255, 255, 0.15)', // Fondo semi-transparente blanco
                                borderColor: '#90caf9', // Borde en azul claro
                                borderWidth: '1px',
                                borderStyle: 'solid',
                                borderRadius: 1, // Bordes ligeramente redondeados
                                '& .MuiSvgIcon-root': {
                                    color: 'white', // Color del icono desplegable
                                },
                                '&:before, &:after': {
                                    borderColor: 'transparent', // Elimina el borde inferior que agrega MUI
                                },
                                '&:hover': {
                                    backgroundColor: 'rgba(255, 255, 255, 0.25)', // Fondo más opaco al pasar el mouse
                                },
                                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.5)' // Sombra para dar profundidad
                            }}
                            label="User"
                            value={user2}
                            onChange={handleChange1}
                        >
                            {users.map(user => (
                                <MenuItem key={user.id} value={user}>{user.name}</MenuItem>
                            ))}

                        </Select>
                    </ThemeProvider>
                </section>
            </section>
            <section className="d-flex justify-content-center mt-5">
                <button className="btn btn-success" onClick={handleClick}>Comparar</button>
            </section>
            <section className="d-flex justify-content-center mt-5">
                <Spreadsheet data={finalProducts}></Spreadsheet>
            </section>
            <section className="d-flex justify-content-center mt-5 gap-5">
                <button className="btn btn-primary" onClick={handleDownload}>Descargar</button>
                <button className="btn btn-primary" onClick={() =>
                    exportToExcel(
                        productsUser,
                        "Plantilla Limpia"
                    )
                }>Plantilla Limpia</button>
            </section>
        </section>
    )
}

export default CompararOp