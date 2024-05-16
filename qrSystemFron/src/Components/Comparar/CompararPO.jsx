import { useContext, useState, useRef } from "react";
import * as XLSX from 'xlsx';
import { PlanillasContext } from "./PlanillasContext";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Box } from '@mui/material';
import { FileUpload } from 'primereact/fileupload';
import { Toast } from 'primereact/toast';
import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';

const CompararPO = () => {
  const [data, setData] = useState([]);
  const { fileId2, setFileId2 } = useContext(PlanillasContext);
  const [currentPage, setCurrentPage] = useState(0);
  const rowsPerPage = 15; // Número de filas por página
  const toast = useRef(null);

  const handleFileUpload = async (event) => {
    const files = event.files;
    let combinedData = [];
    let bultoIndex, unidadIndex, totalIndex, unxcajaIndex, headers;

    for (const file of files) {
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'buffer' });
      const worksheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[worksheetName];
      let json = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      // Obtener los encabezados e índices de columnas
      headers = json[0];
      bultoIndex = headers.indexOf("bultos");
      unidadIndex = headers.indexOf("unidades");
      totalIndex = headers.indexOf("total");
      unxcajaIndex = headers.indexOf("Caja por");

      // Convertir las filas numéricas a enteros y eliminar los encabezados
      json = json.slice(1).map(row => {
        row[bultoIndex] = parseInt(row[bultoIndex], 10);
        row[unidadIndex] = parseInt(row[unidadIndex], 10);
        row[totalIndex] = parseInt(row[totalIndex], 10);
        row[unxcajaIndex] = parseInt(row[unxcajaIndex], 10);
        return row;
      });

      combinedData = [...combinedData, ...json];
    }

    // Agregar los datos agregados
    const aggregatedData = aggregateData(combinedData, bultoIndex, unidadIndex, totalIndex, unxcajaIndex);

    // Agregar los encabezados
    setData([headers, ...aggregatedData]);

    // Crear un payload JSON y enviar los datos
    const payload = {
      headers: headers,
      data: aggregatedData
    };

    fetch('https://stocksystemback-mxpi.onrender.com/comparar/json', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload),
    })
      .then(async response => {
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(errorText);
        }
        return response.json();
      })
      .then(data => {
        setFileId2(data.fileId);
        toast.current.show({ severity: 'success', summary: 'Éxito', detail: 'Archivo subido y procesado con éxito', life: 3000 });
      })
      .catch(error => {
        console.error('Error:', error);
        toast.current.show({ severity: 'error', summary: 'Error', detail: 'Hubo un error al subir el archivo', life: 3000 });
      });
  };

  const aggregateData = (data, bultoIndex, unidadesIndex, totalIndex, unxcajaIndex) => {
    const aggregatedData = data.reduce((acc, curr) => {
      const existingProduct = acc.find(product => product[0] === curr[0]);
      if (existingProduct) {
        existingProduct[bultoIndex] = parseInt(existingProduct[bultoIndex], 10) + parseInt(curr[bultoIndex], 10);
        existingProduct[unidadesIndex] = parseInt(existingProduct[unidadesIndex], 10) + parseInt(curr[unidadesIndex], 10);
        existingProduct[totalIndex] = (parseInt(existingProduct[bultoIndex], 10) * parseInt(existingProduct[unxcajaIndex], 10)) + parseInt(existingProduct[unidadesIndex], 10);
      } else {
        const newProduct = [...curr];
        newProduct[bultoIndex] = parseInt(newProduct[bultoIndex], 10);
        newProduct[unidadesIndex] = parseInt(newProduct[unidadesIndex], 10);
        newProduct[totalIndex] = parseInt(newProduct[totalIndex], 10);
        newProduct[unxcajaIndex] = parseInt(newProduct[unxcajaIndex], 10);
        acc.push(newProduct);
      }
      return acc;
    }, []);
    return aggregatedData;
  };

  const nextPage = () => setCurrentPage(currentPage + 1);
  const prevPage = () => setCurrentPage(currentPage - 1);
  const currentData = data.slice(currentPage * rowsPerPage, (currentPage + 1) * rowsPerPage);

  return (
    <section>
      <h1 className="text-center mt-3">Planilla Operador Limpia</h1>
      <section className="d-flex flex-column gap-5">
        <Toast ref={toast} />
        <Box sx={{ maxWidth: '50%', margin: 'auto' }}>
          <FileUpload
            mode="basic"
            name="demo[]"
            accept=".xlsx,.xls"
            maxFileSize={1000000}
            customUpload
            multiple
            uploadHandler={handleFileUpload}
            chooseLabel="Seleccionar Archivos"
          />
        </Box>
        <TableContainer component={Paper} sx={{ maxWidth: '80%', margin: 'auto', mt: 3 }}>
          <Table>
            <TableHead>
              <TableRow>
                {data.length > 0 && data[0].map((cell, index) => (
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
      </section>
    </section>
  );
}

export default CompararPO;
