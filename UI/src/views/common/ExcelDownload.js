import React from "react";
import ReactExport from "react-export-excel";
import ReactExportNew from 'react-data-export';

const ExcelFile = ReactExport.ExcelFile;
const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
const ExcelColumn = ReactExport.ExcelFile.ExcelColumn;

const ExcelFileNew = ReactExportNew.ExcelFile;
const ExcelSheetNew = ReactExportNew.ExcelFile.ExcelSheet;
const ExcelColumnNew = ReactExportNew.ExcelFile.ExcelColumn;

export default function ExcelDownload({ fileName, dataSets, excelType }) {
  return (
    <>
    {(excelType === "NORMAL" || excelType === "") && 
      (<ExcelFile hideElement filename={fileName || "Download"}>
        {dataSets.map((dataset, i) => {
          return (
            <ExcelSheet key={i} data={dataset.rows} name={dataset.sheetName || "Sheet1"}>
              {dataset.columns.map((c, j) => {
                return <ExcelColumn key={j} label={c.name} value={c.excelCell ? c.excelCell : c.selector} backgroundcolor={c.backgroundcolor ? "#00FF00" : "#0000FF"} />;
              })}
            </ExcelSheet>
          );
        })}
      </ExcelFile>)
    }

    {excelType === "PLAN" && 
      (<ExcelFileNew hideElement fileName={fileName || "Download"}>
        <ExcelSheetNew dataSet={dataSets}  name={fileName || "Sheet1"} />
      </ExcelFileNew>)
    }
    </>
    );
}