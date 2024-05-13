import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import Spreadsheet from "react-spreadsheet";
import * as XLSX from 'xlsx';
import CustomSpinner from "../CustomSpinner/CustomSpinner";

const Comparar = () => {
    const location = useLocation();
    const { fileId, fileId2 } = location.state || {};
    const [excelData, setExcelData] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    const rowsPerPage = 15;

    useEffect(() => {
        Promise.all([
            fetch(`https://stocksystemback-mxpi.onrender.com/comparar/${fileId}`).then(res => res.arrayBuffer()),
            fetch(`https://stocksystemback-mxpi.onrender.com/comparar/${fileId2}`).then(res => res.arrayBuffer())
        ]).then(([data1, data2]) => {
            const wb1 = XLSX.read(data1, { type: 'buffer' });
            const wb2 = XLSX.read(data2, { type: 'buffer' });

            const ws1 = wb1.Sheets[wb1.SheetNames[0]];
            const ws2 = wb2.Sheets[wb2.SheetNames[0]];

            const jsonData1 = XLSX.utils.sheet_to_json(ws1, { header: 1 });
            const jsonData2 = XLSX.utils.sheet_to_json(ws2, { header: 1 });

            const columnNames1 = jsonData1.shift();
            const columnNames2 = jsonData2.shift();
            columnNames2.push("diferencia");

            const formattedColumnNames = columnNames2.map(name => ({ value: name }));
            const newRows = jsonData2.map((row2, index) => {
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
                return row2.map(value => ({ value }));
            });

            setExcelData([formattedColumnNames].concat(newRows));
        }).catch(error => console.error('Error fetching the files:', error));
    }, [fileId, fileId2]);

    const handleDownload = () => {
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet(excelData.map(row => row.map(cell => cell.value)));
        XLSX.utils.book_append_sheet(wb, ws, "Results");
        XLSX.writeFile(wb, "Resultados.xlsx");
    };

    const nextPage = () => setCurrentPage(currentPage + 1);
    const prevPage = () => setCurrentPage(currentPage - 1);
    const currentData = excelData.slice(currentPage * rowsPerPage, (currentPage + 1) * rowsPerPage);

    return (
        <section>
            <h1 className="text-light text-center mt-3">Planilla Final</h1>
            <section className="d-flex justify-content-end" style={{marginRight:'15%'}}>
                <button className="btn btn-success my-3 " onClick={handleDownload}>Descargar Excel</button>
            </section>
            <section className="d-flex flex-column gap-5">
                {excelData.length > 0 ? (
                    <>
                        <Spreadsheet className="mx-auto" data={currentData} />
                        <section className="d-flex gap-3 justify-content-center">
                            <button onClick={prevPage} disabled={currentPage === 0}>Anterior</button>
                            <button onClick={nextPage} disabled={(currentPage + 1) * rowsPerPage >= excelData.length}>Siguiente</button>
                        </section>
                    </>
                ) : (
                    <CustomSpinner />
                )}
            </section>
        </section>
    );
}

export default Comparar;
