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
    const [exportRequested, setExportRequested] = useState(false);
    const rowsPerPage = 10;
    const nextPage = () => setCurrentPage(currentPage + 1);
    const prevPage = () => setCurrentPage(currentPage - 1);

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
        const fetchProducts = async () => {
            try {
                const response1 = await fetch(`https://stocksystemback-mxpi.onrender.com/products/${user.name}`);
                const data1 = await response1.json();
                setProductsUser(data1);

                const response2 = await fetch(`https://stocksystemback-mxpi.onrender.com/products/${user2.name}`);
                const data2 = await response2.json();
                setProductsUser2(data2);

                return [data1, data2];
            } catch (error) {
                console.error("Error al obtener los productos:", error);
                return [[], []];
            }
        };

        fetchProducts().then(([productsUser, productsUser2]) => {
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
                        code: product.code,
                        codbarras: product.codbarras,
                        name: product.name,
                        marca: product.marca,
                        unxcaja: product.unxcaja,
                        quantityb: product.quantityb,
                        quantityu: product.quantityu,
                        total: parseInt(product.quantityb) * parseInt(product.unxcaja) + parseInt(product.quantityu),
                        diferencia: parseInt(product.total) - parseInt(matchedProduct.total),
                        isExclusive: false // No es exclusivo, aparece en ambos
                    });
                } else {
                    // Producto solo en user1
                    finalProduct.push({
                        code: product.code,
                        codbarras: product.codbarras,
                        name: product.name,
                        marca: product.marca,
                        unxcaja: product.unxcaja,
                        quantityb: product.quantityb,
                        quantityu: product.quantityu,
                        total: parseInt(product.quantityb) * parseInt(product.unxcaja) + parseInt(product.quantityu),
                        diferencia: parseInt(product.total) - 0,
                        isExclusive: true // Exclusivo para user1
                    });
                }
            });

            // Recorrer productos de user2 que no están en user1
            productsUser2.forEach(product => {
                if (!userProductsMap.has(product.code)) {
                    // Producto solo en user2
                    finalProduct.push({
                        code: product.code,
                        codbarras: product.codbarras,
                        name: product.name,
                        marca: product.marca,
                        unxcaja: product.unxcaja,
                        quantityb: product.quantityb,
                        quantityu: product.quantityu,
                        total: parseInt(product.quantityb) * parseInt(product.unxcaja) + parseInt(product.quantityu),
                        diferencia: 0 - parseInt(product.total),
                        isExclusive: true // Exclusivo para user2
                    });
                }
            });

            setFinalProducts(finalProduct);
            if (exportRequested) {
                exportToExcel(finalProduct, "Plantilla Limpia");
                setExportRequested(false);
            }
        });
    };

    const prepararDatosParaExcel = (productos) => {
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
        const codeprod = row.code;

        // Fetch for prod1
        fetch(`https://stocksystemback-mxpi.onrender.com/products/edit/${codeprod}/${user.name}`)
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Producto no encontrado');
                }
                return response.json();
            })
            .then((data) => {
                setProd1({
                    code: codeprod,
                    name: data.name || "Desconocido",
                    codbarras: data.codbarras || "",
                    codprov: data.codprov || "",
                    quantityb: data.quantityb || 0,
                    quantityu: data.quantityu || 0,
                    date: data.date || new Date().toISOString().split("T")[0],
                    idealstock: data.idealstock || 0,
                    unxcaja: data.unxcaja || 1,
                    total: parseInt(data.quantityb) * parseInt(data.unxcaja) + parseInt(data.quantityu),
                    familia: data.familia || "General",
                    marca: data.marca || "Sin Marca",
                    username: [user.name]
                });
            })
            .catch((error) => {
                console.error(error);
                fetch(`https://stocksystemback-mxpi.onrender.com/products/edit/${codeprod}/${user2.name}`)
                    .then((response) => {
                        if (!response.ok) {
                            throw new Error('Producto no encontrado');
                        }
                        return response.json();
                    })
                    .then((data) => {
                        setProd1({
                            code: codeprod,
                            name: data.name || "Desconocido",
                            codbarras: data.codbarras || "",
                            codprov: data.codprov || "",
                            quantityb: 0,
                            quantityu: 0,
                            date: data.date || new Date().toISOString().split("T")[0],
                            idealstock: data.idealstock || 0,
                            unxcaja: data.unxcaja || 1,
                            total: 0,
                            familia: data.familia || "General",
                            marca: data.marca || "Sin Marca",
                            username: [user.name]
                        });
                    })
                    .catch((error) => {
                        console.error(error);
                        setProd1({
                            code: codeprod,
                            name: "Desconocido",
                            codbarras: "",
                            codprov: "",
                            quantityb: 0,
                            quantityu: 0,
                            date: new Date().toISOString().split("T")[0],
                            idealstock: 0,
                            unxcaja: 1,
                            total: 0,
                            familia: "General",
                            marca: "Sin Marca",
                            username: [user.name]
                        });
                    });
            });

        // Fetch for prod2
        fetch(`https://stocksystemback-mxpi.onrender.com/products/edit/${codeprod}/${user2.name}`)
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Producto no encontrado');
                }
                return response.json();
            })
            .then((data) => {
                setProd2({
                    code: codeprod,
                    name: data.name || "Desconocido",
                    codbarras: data.codbarras || "",
                    codprov: data.codprov || "",
                    quantityb: data.quantityb || 0,
                    quantityu: data.quantityu || 0,
                    date: data.date || new Date().toISOString().split("T")[0],
                    idealstock: data.idealstock || 0,
                    unxcaja: data.unxcaja || 1,
                    total: parseInt(data.quantityb) * parseInt(data.unxcaja) + parseInt(data.quantityu),
                    familia: data.familia || "General",
                    marca: data.marca || "Sin Marca",
                    username: [user2.name]
                });
            })
            .catch((error) => {
                console.error(error);
                fetch(`https://stocksystemback-mxpi.onrender.com/products/edit/${codeprod}/${user.name}`)
                    .then((response) => {
                        if (!response.ok) {
                            throw new Error('Producto no encontrado');
                        }
                        return response.json();
                    })
                    .then((data) => {
                        setProd2({
                            code: codeprod,
                            name: data.name || "Desconocido",
                            codbarras: data.codbarras || "",
                            codprov: data.codprov || "",
                            quantityb: 0,
                            quantityu: 0,
                            date: data.date || new Date().toISOString().split("T")[0],
                            idealstock: data.idealstock || 0,
                            unxcaja: data.unxcaja || 1,
                            total: 0,
                            familia: "General",
                            marca: "Sin Marca",
                            username: [user2.name]
                        });
                    })
                    .catch((error) => {
                        console.error(error);
                        setProd2({
                            code: codeprod,
                            name: "Desconocido",
                            codbarras: "",
                            codprov: "",
                            quantityb: 0,
                            quantityu: 0,
                            date: new Date().toISOString().split("T")[0],
                            idealstock: 0,
                            unxcaja: 1,
                            total: 0,
                            familia: "General",
                            marca: "Sin Marca",
                            username: [user2.name]
                        });
                    });
            });
    };

    const handleUpdateProd = async (user, prod, newProd) => {
        try {
            const response = await fetch(
                `https://stocksystemback-mxpi.onrender.com/products/edit/${prod.code}/${user.name}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        quantityb: prod.quantityb,
                        quantityu: prod.quantityu,
                        total: parseInt(prod.quantityb) * parseInt(prod.unxcaja) + parseInt(prod.quantityu)
                    }),
                }
            );

            if (!response.ok) {
                if (response.status === 404) {
                    // Si el producto no existe, lo creamos
                    const newProduct = newProd === 'prod1' ? prod1 : prod2;
                    const createResponse = await fetch(
                        `https://stocksystemback-mxpi.onrender.com/products`,
                        {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify(newProduct),
                        }
                    );

                    if (!createResponse.ok) {
                        throw new Error(`HTTP error! status: ${createResponse.status}`);
                    }
                    const MySwal = withReactContent(Swal);
                    MySwal.fire({
                        title: <strong>Producto creado con éxito!</strong>,
                        icon: "success",
                    });
                } else {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
            } else {
                const MySwal = withReactContent(Swal);
                MySwal.fire({
                    title: <strong>Se ha actualizado con éxito!</strong>,
                    icon: "success",
                });
            }

            // Actualizar la tabla después de actualizar o crear el producto
            const updatedProducts = await fetch(`https://stocksystemback-mxpi.onrender.com/products/${user.name}`)
                .then(response => response.json())
                .catch(error => {
                    console.error('Error al actualizar la tabla:', error);
                    return [];
                });

            setFinalProducts(updatedProducts);

        } catch (error) {
            console.error("Error al actualizar o crear el producto:", error);
        }
    };

    useEffect(() => {
        if (exportRequested) {
            exportToExcel(finalProducts, "Plantilla Limpia");
            setExportRequested(false);
        }
    }, [finalProducts, exportRequested]);

    const handleExport = () => {
        setExportRequested(true);
        handleClick();
    };

    const currentData = finalProducts.slice(currentPage * rowsPerPage, (currentPage + 1) * rowsPerPage);

    return (
        <section>
            <h1 className="text-center text-light mt-3 mb-3">Comparar Planilla Operadores</h1>
            <section className="d-flex justify-content-center  align-items-center gap-5 ">
                <section className="d-flex flex-column">
                    <label className="text-light ">{user?.name} :</label>
                    <section className="d-flex gap-2 align-items-center jus w-50">
                        <section className="d-flex flex-column">
                            <label className="text-light">Unidades:</label>
                            <input type="number" placeholder="unidades" value={parseInt(prod1?.quantityu)} onChange={e => setProd1({ ...prod1, quantityu: parseInt(e.target.value), total: parseInt(prod1.quantityb) * parseInt(prod1.unxcaja) + parseInt(e.target.value), })} />
                        </section>
                        <section>
                            <label className="text-light">Bultos:</label>
                            <input type="number" placeholder="bultos" value={parseInt(prod1?.quantityb)} onChange={e => setProd1({ ...prod1, quantityb: parseInt(e.target.value), total: parseInt(e.target.value) * parseInt(prod1.unxcaja) + parseInt(prod1.quantityu), })} />
                        </section>
                        <button className="btn btn-primary mt-4" onClick={() => handleUpdateProd(user, prod1, 'prod1')}><BsCloudUpload size={24} /></button>
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
                            <input type="number" placeholder="unidades" value={parseInt(prod2?.quantityu)} onChange={e => setProd2({ ...prod2, quantityu: parseInt(e.target.value), total: parseInt(prod2.quantityb) * parseInt(prod2.unxcaja) + parseInt(e.target.value) })} />
                        </section>
                        <section>
                            <label className="text-light">Bultos:</label>
                            <input type="number" placeholder="bultos" value={parseInt(prod2?.quantityb)} onChange={e => setProd2({ ...prod2, quantityb: parseInt(e.target.value), total: parseInt(prod2.quantityb) * parseInt(prod2.unxcaja) + parseInt(e.target.value) })} />
                        </section>
                        <button className="btn btn-primary mt-4" onClick={() => handleUpdateProd(user2, prod2, 'prod2')}><BsCloudUpload size={24} /></button>
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
                                    <TableCell>{row.code}</TableCell>
                                    <TableCell>{row.codbarras}</TableCell>
                                    <TableCell>{row.name}</TableCell>
                                    <TableCell>{row.marca}</TableCell>
                                    <TableCell>{row.diferencia}</TableCell>
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
                <Button variant="contained" onClick={handleExport}>Plantilla Limpia</Button>
            </section>
        </section>
    );
};

export default CompararOp;
