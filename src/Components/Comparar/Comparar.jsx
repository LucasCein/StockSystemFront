import { useContext, useEffect, useState } from "react";
import { PlanillasContext } from "./PlanillasContext";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Box } from '@mui/material';
import CustomSpinner from "../CustomSpinner/CustomSpinner";
import * as XLSX from 'xlsx';

const Comparar = () => {
    const { fileId, fileId2 } = useContext(PlanillasContext);
    const [excelData, setExcelData] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    const rowsPerPage = 15;

    useEffect(() => {
        Promise.all([
            fetch(`https://stocksystemback-mxpi.onrender.com/comparar/planillasistema`).then(res => res.json()),
            fetch(`https://stocksystemback-mxpi.onrender.com/comparar/planillaoperador`).then(res => res.json())
        ]).then(([data1, data2]) => {
            const columnsToExclude = ['quantityu', 'quanitityb', 'total'];
            const columnNames1 = Object.keys(data1[0]).filter(col => !columnsToExclude.includes(col));
            const columnNames2 = Object.keys(data2[0]).filter(col => !columnsToExclude.includes(col));
            columnNames2.push("diferencia");

            const newRows = data2.map((row2) => {
                const item = row2["code"];
                const row1 = data1.find(r => r["code"] === item);

                if (row1) {
                    const deposito = parseInt(row1["total"]);
                    const total = parseInt(row2["total"]);
                    const diferencia = total - deposito;
                    const formattedDiferencia = diferencia < 0 ? `(${Math.abs(diferencia)})` : diferencia;
                    row2["diferencia"] = formattedDiferencia;
                } else {
                    row2["diferencia"] = "";
                }
                return row2;
            });

            setExcelData([columnNames2, ...newRows]);
        }).catch(error => console.error('Error fetching the data:', error));
    }, []);

    const handleDownload = async () => {
        const columnsToExclude = ['planillaoperadorid','quantityu', 'quanitityb', 'total'];
        const headers = excelData[0].filter(col => !columnsToExclude.includes(col));
        const filteredData = excelData.slice(1).map(row => {
            const filteredRow = {};
            headers.forEach(header => {
                filteredRow[header] = row[header];
            });
            return filteredRow;
        });

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(filteredData, { header: headers });
        XLSX.utils.book_append_sheet(wb, ws, "Results");
        XLSX.writeFile(wb, "Resultados.xlsx");

        // Clear data in the backend after downloading the file
        fetch('https://stocksystemback-mxpi.onrender.com/comparar/clear-data', {
            method: 'DELETE',
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to clear data');
            }
            return response.json();
        })
        .then(data => {
            console.log(data.message); // Optional: Show a success message
        })
        .catch(error => {
            console.error('Error clearing data:', error);
        });
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
                                    {currentData.map((row, rowIndex) => (
                                        <TableRow key={rowIndex}>
                                            {excelData[0].map((header, cellIndex) => (
                                                <TableCell key={cellIndex}>{row[header]}</TableCell>
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
