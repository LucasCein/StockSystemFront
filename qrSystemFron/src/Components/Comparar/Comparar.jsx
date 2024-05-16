import { useContext, useEffect, useState } from "react";
import * as XLSX from 'xlsx';
import { PlanillasContext } from "./PlanillasContext";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Box } from '@mui/material';
import CustomSpinner from "../CustomSpinner/CustomSpinner";

const Comparar = () => {
    const { fileId, fileId2 } = useContext(PlanillasContext);
    const [excelData, setExcelData] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    const rowsPerPage = 15;

    useEffect(() => {
        Promise.all([
            fetch(`https://stocksystemback-mxpi.onrender.com/comparar/${fileId}`).then(res => res.arrayBuffer()),
            fetch(`https://stocksystemback-mxpi.onrender.com/comparar/json/${fileId2}`).then(res => res.json())
        ]).then(([data1, jsonData2]) => {
            const wb1 = XLSX.read(data1, { type: 'buffer' });

            const ws1 = wb1.Sheets[wb1.SheetNames[0]];
            const jsonData1 = XLSX.utils.sheet_to_json(ws1, { header: 1 });

            const columnNames1 = jsonData1.shift();
            const columnNames2 = jsonData2.headers;
            columnNames2.push("diferencia");

            const newRows = jsonData2.data.map((row2, index) => {
                const itemIndex = columnNames2.indexOf("Artículo");
                const item = row2[itemIndex];
                const row1 = jsonData1.find(r => r[columnNames1.indexOf("Artículo")] === item);

                if (row1) {
                    const depositoIndex = columnNames1.indexOf("deposito");
                    const totalIndex = columnNames2.indexOf("total");
                    const deposito = Number(row1[depositoIndex]);
                    const total = Number(row2[totalIndex]);
                    const diferencia = total - deposito;
                    const formattedDiferencia = diferencia < 0 ? `(${Math.abs(diferencia)})` : diferencia;
                    row2.push(formattedDiferencia);
                } else {
                    row2.push("");
                }
                return row2;
            });

            setExcelData([columnNames2, ...newRows]);
        }).catch(error => console.error('Error fetching the files:', error));
    }, [fileId, fileId2]);

    const handleDownload = () => {
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet(excelData);
        XLSX.utils.book_append_sheet(wb, ws, "Results");
        XLSX.writeFile(wb, "Resultados.xlsx");
    };

    const nextPage = () => setCurrentPage(currentPage + 1);
    const prevPage = () => setCurrentPage(currentPage - 1);
    const currentData = excelData.slice(currentPage * rowsPerPage, (currentPage + 1) * rowsPerPage);

    return (
        <section>
            <h1 className=" text-center mt-3">Planilla Final</h1>
            <section className="d-flex justify-content-end" style={{ marginRight: '15%' }}>
                <Button variant="contained" color="success" onClick={handleDownload}>Descargar Excel</Button>
            </section>
            <section className="d-flex flex-column gap-5">
                {excelData.length > 0 ? (
                    <>
                        <TableContainer component={Paper} sx={{ maxWidth: '80%', margin: 'auto', mt: 3 }}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        {excelData[0].map((cell, index) => (
                                            <TableCell key={index}>{cell}</TableCell>
                                        ))}
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {currentData.slice(1).map((row, rowIndex) => (
                                        <TableRow key={rowIndex}>
                                            {row.map((cell, cellIndex) => (
                                                <TableCell key={cellIndex}>{cell}</TableCell>
                                            ))}
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                        <Box className="d-flex gap-3 justify-content-center">
                            <Button variant="contained" onClick={prevPage} disabled={currentPage === 0}>Anterior</Button>
                            <Button variant="contained" onClick={nextPage} disabled={(currentPage + 1) * rowsPerPage >= excelData.length}>Siguiente</Button>
                        </Box>
                    </>
                ) : (
                    <CustomSpinner />
                )}
            </section>
        </section>
    );
};

export default Comparar;
