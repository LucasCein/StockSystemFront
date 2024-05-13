import { useState } from "react";
import * as XLSX from 'xlsx';
import Spreadsheet from 'react-spreadsheet';
import { NavLink, useNavigate } from "react-router-dom";
const CompararPS = () => {
    const [data, setData] = useState([]);
    const [fileId, setFileId] = useState('');
    const [currentPage, setCurrentPage] = useState(0);
    const rowsPerPage = 15; // Número de filas por página
    const navigate = useNavigate();
    const handleFileChange = async (event) => {
        const file = event.target.files[0];
        const data = await file.arrayBuffer();
        const workbook = XLSX.read(data, { type: 'buffer' });
        const worksheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[worksheetName];
        const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        setData(json);
        const formData = new FormData();
        formData.append('file', file);

        fetch('https://stocksystemback-mxpi.onrender.com/comparar', {
            method: 'POST',
            body: formData,
        })
            .then(response => response.json())
            .then(data => {
                setFileId(data.fileId); // Opcionalmente guardar el fileId en el estado
            })
            .catch(error => console.error('Error:', error));
    };
    const nextPage = () => setCurrentPage(currentPage + 1);
    const prevPage = () => setCurrentPage(currentPage - 1);
    const currentData = data.slice(currentPage * rowsPerPage, (currentPage + 1) * rowsPerPage);
    console.log(fileId)
    return (
        <section>
            <h1 className="text-light text-center mt-3">Planilla Sistema</h1>
            <section className="d-flex flex-column gap-5">
                <input className="ms-5" type="file" onChange={handleFileChange} accept=".xlsx, .xls" />
                <Spreadsheet className="mx-auto" data={currentData.map(row => row.map(cell => ({ value: cell })))} />
                <section className="d-flex gap-3 justify-content-center">
                    <button onClick={prevPage} disabled={currentPage === 0}>Anterior</button>
                    <button onClick={nextPage} disabled={(currentPage + 1) * rowsPerPage >= data.length}>Siguiente</button>
                </section>
                {/* PO: planilla operador */}
                <section className="mx-auto">
                <button className="btn btn-success" onClick={() => navigate(`/compararpo`, { state: { fileId } })}>Siguiente</button>
                </section>
            </section>
        </section>

    )
}


export default CompararPS