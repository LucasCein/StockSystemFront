import { ThemeProvider } from "@emotion/react";
import { FormControl, InputLabel, MenuItem, Select, createTheme, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button } from "@mui/material";
import FileSaver from "file-saver";
import { useEffect, useState } from "react";
import { BsCloudUpload, BsCloudUploadFill } from "react-icons/bs";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import * as XLSX from 'xlsx';

const CompararOp = () => {
    const [users, setUsers] = useState([]);
    const [user, setUser] = useState({});
    const [user2, setUser2] = useState({});
    const [productsUser, setProductsUser] = useState([]);
    const [productsUser2, setProductsUser2] = useState([]);
    const [finalProducts, setFinalProducts] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [prod1, setProd1] = useState([]);
    const [prod2, setProd2] = useState([]);
    const rowsPerPage = 10;
    const nextPage = () => setCurrentPage(currentPage + 1);
    const prevPage = () => setCurrentPage(currentPage - 1);
    const currentData = finalProducts.slice(currentPage * rowsPerPage, (currentPage + 1) * rowsPerPage);

    useEffect(() => {
        fetch('https://stocksystemback-mxpi.onrender.com/users')
            .then(response => response.json())
            .then(data => {
                setUsers(data);
            })
            .catch(error => {
                console.error(error);
            });
    }, []);

    const handleChange = (event) => {
        const { name } = event.target.value;
        setUser(event.target.value);
        console.log(name);

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
        const { name } = event.target.value;
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
                main: '#90caf9',
            },
        },
    });

    const handleClick = () => {
        let finalProduct = [];

        const userProductsMap = new Map();
        const user2ProductsMap = new Map();

        // Crear mapas para acceder rápidamente a los productos por su código
        productsUser.forEach(product => userProductsMap.set(product.code, product));
        productsUser2.forEach(product => user2ProductsMap.set(product.code, product));

        // Recorrer productos de user1
        productsUser.forEach(product => {
            const matchedProduct = user2ProductsMap.get(product.code);
            if (matchedProduct) {
                // Producto está en ambos
                finalProduct.push({
                    "Artículo": product.code,
                    "Cod. Barras": product.codbarras,
                    "Nombre": product.name,
                    "Marca": product.marca,
                    "Diferencia": parseInt(product.total) - parseInt(matchedProduct.total),
                    "isExclusive": false // No es exclusivo, aparece en ambos
                });
            } else {
                // Producto solo en user1
                finalProduct.push({
                    "Artículo": product.code,
                    "Cod. Barras": product.codbarras,
                    "Nombre": product.name,
                    "Marca": product.marca,
                    "Diferencia": parseInt(product.total) - 0,
                    "isExclusive": true // Exclusivo para user1
                });
            }
        });

        // Recorrer productos de user2 que no están en user1
        productsUser2.forEach(product => {
            if (!userProductsMap.has(product.code)) {
                // Producto solo en user2
                finalProduct.push({
                    "Artículo": product.code,
                    "Cod. Barras": product.codbarras,
                    "Nombre": product.name,
                    "Marca": product.marca,
                    "Diferencia": 0 - parseInt(product.total),
                    "isExclusive": true // Exclusivo para user2
                });
            }
        });

        console.log("Final Products: ", finalProduct);
        setFinalProducts(finalProduct);
    };

    const handleDownload = () => {
        const ws = XLSX.utils.json_to_sheet(finalProducts);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Comparison");
        XLSX.writeFile(wb, "ComparisonReport.xlsx");
    };

    const prepararDatosParaExcel = (productos) => {
        console.log(productos);
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
        const fileType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
        const fileExtension = ".xlsx";

        const ws = XLSX.utils.json_to_sheet(datosParaExcel);
        const wb = { Sheets: { data: ws }, SheetNames: ["data"] };
        const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
        const data = new Blob([excelBuffer], { type: fileType });
        FileSaver.saveAs(data, fileName + fileExtension);
    };

    const handleRowClick = (row) => {
        const codeprod = row.Artículo;
        fetch(
            `https://stocksystemback-mxpi.onrender.com/products/edit/${codeprod}/${user.name}`
        )
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Producto no encontrado');
                }
                return response.json();
            })
            .then((data) => {
                setProd1({
                    code: codeprod,
                    quantityb: data.quantityb,
                    quantityu: data.quantityu,
                    unxcaja: data.unxcaja
                });
            })
            .catch((error) => {
                console.error(error);
                setProd1({
                    code: codeprod,
                    quantityb: 0,
                    quantityu: 0,
                    unxcaja: 0
                });
            });

        fetch(
            `https://stocksystemback-mxpi.onrender.com/products/edit/${codeprod}/${user2.name}`
        )
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Producto no encontrado');
                }
                return response.json();
            })
            .then((data) => {
                setProd2({
                    code: codeprod,
                    quantityb: data.quantityb,
                    quantityu: data.quantityu,
                    unxcaja: data.unxcaja
                });
            })
            .catch((error) => {
                console.error(error);
                setProd2({
                    code: codeprod,
                    quantityb: 0,
                    quantityu: 0,
                    unxcaja: 0
                });
            });
    };

    const handleUpdateProd = async (user, prod) => {
        console.log(user)
        console.log(prod)
        try {
            const respuesta = await fetch(
                `https://stocksystemback-mxpi.onrender.com/products/edit/${prod.code}/${user.name}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ quantityb: prod.quantityb, quantityu: prod.quantityu, total: parseInt(prod.quantityb) * parseInt(prod.unxcaja) + parseInt(prod.quantityu) }),
                }
            );

            if (!respuesta.ok) {
                throw new Error(`HTTP error! status: ${respuesta.status}`);
            }
            const MySwal = withReactContent(Swal);
            MySwal.fire({
                title: <strong>Se ha actualizado con Exito!</strong>,
                icon: "success",
            });
        } catch (error) {
            console.error("Error al actualizar el producto:", error);
        }
    };

    return (
        <section>
            <h1 className="text-center text-light mt-3 mb-3">Comparar Planilla Operadores</h1>
            <section className="d-flex justify-content-center  align-items-center gap-5 ">
                <section className="d-flex flex-column">
                    <label className="text-light ">{user?.name} :</label>
                    <section className="d-flex gap-2 align-items-center jus w-50">
                        <section className="d-flex flex-column">
                            <label className="text-light">Unidades:</label>
                            <input type="number" placeholder="unidades" value={prod1?.quantityu} onChange={e => setProd1({ ...prod1, quantityu: parseInt(e.target.value) })} />
                        </section>
                        <section>
                            <label className="text-light">Bultos:</label>
                            <input type="number" placeholder="bultos" value={prod1?.quantityb} onChange={e => setProd1({ ...prod1, quantityb: parseInt(e.target.value) })} />
                        </section>
                        <button className="btn btn-primary mt-4" onClick={() => handleUpdateProd(user, prod1)}><BsCloudUpload size={24} /></button>
                    </section>
                </section>
                <section className="d-flex  align-items-center mt-3">
                    <section >
                        <ThemeProvider theme={darkTheme}>
                            <Select
                                sx={{
                                    m: 1, minWidth: 80,
                                    color: 'white',
                                    backgroundColor: 'rgba(255, 255, 255, 0.15)',
                                    borderColor: '#90caf9',
                                    borderWidth: '1px',
                                    borderStyle: 'solid',
                                    borderRadius: 1,
                                    '& .MuiSvgIcon-root': {
                                        color: 'white',
                                    },
                                    '&:before, &:after': {
                                        borderColor: 'transparent',
                                    },
                                    '&:hover': {
                                        backgroundColor: 'rgba(255, 255, 255, 0.25)',
                                    },
                                    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.5)',
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
                                    color: 'white',
                                    backgroundColor: 'rgba(255, 255, 255, 0.15)',
                                    borderColor: '#90caf9',
                                    borderWidth: '1px',
                                    borderStyle: 'solid',
                                    borderRadius: 1,
                                    '& .MuiSvgIcon-root': {
                                        color: 'white',
                                    },
                                    '&:before, &:after': {
                                        borderColor: 'transparent',
                                    },
                                    '&:hover': {
                                        backgroundColor: 'rgba(255, 255, 255, 0.25)',
                                    },
                                    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.5)',
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
                <section className="d-flex flex-column">
                    <label className="text-light ">{user2?.name} :</label>
                    <section className="d-flex gap-2 align-items-center  w-50">
                        <section className="d-flex flex-column">
                            <label className="text-light">Unidades:</label>
                            <input type="number" placeholder="unidades" value={prod2?.quantityu} onChange={e => setProd2({ ...prod2, quantityu: parseInt(e.target.value) })} />
                        </section>
                        <section>
                            <label className="text-light">Bultos:</label>
                            <input type="number" placeholder="bultos" value={prod2?.quantityb} onChange={e => setProd2({ ...prod2, quantityb: parseInt(e.target.value) })} />
                        </section>
                        <button className="btn btn-primary mt-4" onClick={() => handleUpdateProd(user2, prod2)}><BsCloudUpload size={24} /></button>
                    </section>
                </section>
            </section>
            <section className="d-flex justify-content-center mt-5">
                <Button variant="contained" color="success" onClick={handleClick}>Comparar</Button>
            </section>
            <section className="d-flex flex-column align-items-center gap-3 justify-content-center mt-5">
                <TableContainer component={Paper} sx={{ width: '80%' }}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Artículo</TableCell>
                                <TableCell>Cod. Barras</TableCell>
                                <TableCell>Nombre</TableCell>
                                <TableCell>Marca</TableCell>
                                <TableCell>Diferencia</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {currentData.map((row, index) => (
                                <TableRow key={index} onClick={() => handleRowClick(row)} style={{ cursor: 'pointer', backgroundColor: row.isExclusive ? 'red' : 'inherit' }}>
                                    <TableCell>{row["Artículo"]}</TableCell>
                                    <TableCell>{row["Cod. Barras"]}</TableCell>
                                    <TableCell>{row["Nombre"]}</TableCell>
                                    <TableCell>{row["Marca"]}</TableCell>
                                    <TableCell>{row["Diferencia"]}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
                <section className="d-flex gap-3 justify-content-center">
                    <Button onClick={prevPage} disabled={currentPage === 0}>Anterior</Button>
                    <Button onClick={nextPage} disabled={(currentPage + 1) * rowsPerPage >= finalProducts.length}>Siguiente</Button>
                </section>
            </section>
            <section className="d-flex justify-content-center mt-5 gap-5 mb-5">
                <Button variant="contained" onClick={handleDownload}>Descargar</Button>
                <Button variant="contained" onClick={() => exportToExcel(productsUser, "Plantilla Limpia")}>Plantilla Limpia</Button>
            </section>
        </section>
    );
};

export default CompararOp;
