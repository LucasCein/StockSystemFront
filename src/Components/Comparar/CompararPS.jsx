import React, { useState, useRef, useContext } from "react";
import * as XLSX from 'xlsx';
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Box
} from '@mui/material';
import { useNavigate } from "react-router-dom";
import { FileUpload } from 'primereact/fileupload';
import { Toast } from 'primereact/toast';
import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import { PlanillasContext } from "./PlanillasContext";

const CompararPS = () => {
    const [data, setData] = useState([]);
    const { fileId, setFileId } = useContext(PlanillasContext);
    const [currentPage, setCurrentPage] = useState(0);
    const rowsPerPage = 15; // Número de filas por página
    const navigate = useNavigate();
    const toast = useRef(null);

    const handleFileUpload = async (event) => {
        const file = event.files[0];
        const data = await file.arrayBuffer();
        const workbook = XLSX.read(data, { type: 'buffer' });
        const worksheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[worksheetName];
        const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        setData(json);

        // Prepare data for backend
        const rows = json.slice(1).map(row => ({
            code: row[0],
            codbarras: row[1],
            descripcion: row[2],
            marca: row[3],
            unxcaja: row[4],
            total: row[5],
        }));
        console.log(rows)
        fetch("https://stocksystemback-mxpi.onrender.com/comparar/planillasistema", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(rows),
        })
            .then(response => response.json())
            .then(data => {
                setFileId(data.fileId); // Opcionalmente guardar el fileId en el estado
                toast.current.show({ severity: 'success', summary: 'Éxito', detail: 'Archivo subido y procesado con éxito', life: 3000 });
            })
            .catch(error => {
                console.error('Error:', error);
                toast.current.show({ severity: 'error', summary: 'Error', detail: 'Hubo un error al subir el archivo', life: 3000 });
            });
    };

    const nextPage = () => setCurrentPage(currentPage + 1);
    const prevPage = () => setCurrentPage(currentPage - 1);
    const currentData = data.slice(currentPage * rowsPerPage, (currentPage + 1) * rowsPerPage);

    return (
        <section>
            <h1 className="text-center mt-3">Planilla Sistema</h1>
            <section className="d-flex flex-column gap-5">
                <Toast ref={toast} />
                <Box sx={{ maxWidth: '50%', margin: 'auto' }}>
                    <FileUpload
                        mode="basic"
                        name="demo[]"
                        accept=".xlsx,.xls"
                        maxFileSize={1000000}
                        customUpload
                        uploadHandler={handleFileUpload}
                        chooseLabel="Seleccionar Archivo"
                    />
                </Box>
                <TableContainer component={Paper} sx={{ maxWidth: '80%', margin: 'auto', mt: 3 }}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                {currentData[0] && currentData[0].map((cell, index) => (
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
                    <Button variant="contained" onClick={nextPage} disabled={(currentPage + 1) * rowsPerPage >= data.length}>Siguiente</Button>
                </Box>
                {/* PO: planilla operador */}
                {/* <Box className="mx-auto"> */}
                    {/* <Button variant="contained" color="success" onClick={() => navigate(`/compararpo`, { state: { fileId } })}>Siguiente</Button> */}
                {/* </Box> */}
            </section>
        </section>
    );
}

export default CompararPS;
