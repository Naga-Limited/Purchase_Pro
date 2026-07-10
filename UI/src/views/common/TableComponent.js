import { Row, Col, InputGroup, InputGroupAddon, Input, InputGroupText } from "reactstrap";
import DataTable from "react-data-table-component";
import { ChevronDown } from "react-feather";
import React, { Suspense, useEffect, useState, lazy } from "react";

import { Search } from "react-feather";

import { apiPostMethod } from "@helpers/axiosHelper";
import { errorToast } from "@helpers/appHelper";
import Spinner from "reactstrap/lib/Spinner";
import { PrimaryButton } from "../forms/custom-button";

const ExcelDownload = lazy(() => import("../common/ExcelDownload"));

const TableComponent = ({
  hideSearch,
  columns,
  url,
  sheetName,
  fileName,
  showDownload,
  formType,
  ScreenName,
  postData,
  onDataReceived,
  filterRenderor,

  ...props
}) => {
  const [pageSize, setPageSize] = useState(25);
  const [loading, setLoading] = useState(false);
  const [totalPage, setTotalPage] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchValue, setSearchValue] = useState("");
  const [Tbldata, setTbldata] = useState([]);
  const [TbldataAll, setTbldataAll] = useState([]);
  const [downloadExcel, setdowloadExcel] = useState(false);
  const [Selectable, setSelectable] = useState(false);
  const [ExcelType, setExcelType] = useState("");
  const [serachData, setSearchData] = useState("");
  const [filterresult, setFilterresult] = useState([]);

  useEffect(() => {
    setTbldata(props.data);
    setTbldataAll(props.data);
    setSelectable(props.select);
    setExcelType(props.exceltype || "")

    if (props.data && props.data.length > 0) {
      setTotalPage(Number(props.data.length));
    }
  }, [props.data]);

  useEffect(() => {

    if (url) {
      let start = (currentPage - 1) * pageSize;
      let fdata = {
        formType: formType,
        ScreenName: ScreenName,
        startCount: start,
        pageSize: pageSize,
        ...postData,
      };
      if (searchValue && searchValue.length) {
        fdata = { ...fdata, searchTxt: searchValue };
      }

      setLoading(true);

      apiPostMethod(url, fdata)
        .then((response) => {
          const { data } = response;
          if (data.success) {
            //console.log("onDataReceived:"+onDataReceived);
            if (onDataReceived) {
              setTbldata(onDataReceived(data));
            } else {
              //console.log("SET")
              setTbldata(data.results);
              setTbldataAll(data.results);
            }
            //console.log(JSON.stringify(Tbldata))
            setTotalPage(Number(data.count));

          }
        })
        .catch((error) => {
          errorToast("Something went wrong, please try again after sometime");
        })
        .finally((a) => {
          setLoading(false);
        });
    }
  }, [currentPage, formType, postData, url, searchValue, pageSize]);
  const handlePagination = (page) => {
    setCurrentPage(page);
  };
  const handlePerRowsChange = async (newPerPage) => {
    // console.log(newPerPage);
    setPageSize(newPerPage);
  };
  const handleFilter = (e) => {
    const value = e.target.value;
    //setSearchValue(value);
    handleEnterSearchData(value);
  };

  const handleEnterSearch = (e) => {
    const { value } = e.target;
    if (e.charCode === 13) {
      //setSearchValue(value);

      handleEnterSearchData(value);

    }
  };
  const handleEnterSearchData = (value) => {
    var searchValue = value.toLowerCase();
    let updatedList = TbldataAll.filter((item) => {
      return Object.keys(item).some(key => ((item[key]) ? item[key] : "").toString().search(searchValue) !== -1);
    });
    setTbldata(updatedList);
    setSearchValue(value);
    setSelectable(props.select);
  }

  const handlesearch = (event) => {
    const search = event.target.value;
    // console.log(search);
    setSearchData(search);

    if (search !== "") {
      const filterdata = TbldataAll.filter((item) => {
        return Object.values(item)
          .join("")
          .toLowerCase()
          .includes(search.toLowerCase());
      });
      setFilterresult(filterdata);
    } else {
      setFilterresult(TbldataAll);
    }
  };

  // ** Custom Pagination , setTotalPage
  // const CustomPagination = () => {
  //   console.log(totalPage);
  //   return (
  //     <ReactPaginate
  //       previousLabel=""
  //       nextLabel=""
  //       forcePage={currentPage}
  //       onPageChange={(page) => handlePagination(page)}
  //       pageCount={totalPage / 10 || 1}
  //       breakLabel="..."
  //       pageRangeDisplayed={2}
  //       marginPagesDisplayed={2}
  //       activeClassName="active"
  //       pageClassName="page-item"
  //       breakClassName="page-item"
  //       breakLinkClassName="page-link"
  //       nextLinkClassName="page-link"
  //       nextClassName="page-item next"
  //       previousClassName="page-item prev"
  //       previousLinkClassName="page-link"
  //       pageLinkClassName="page-link"
  //       containerClassName="pagination react-paginate separated-pagination pagination-sm justify-content-end pr-1 mt-1"
  //     />
  //   );
  // };

  const getDataSets_Plan = () => {
    const TitleFontSize = 11;
    const BodyFontSize = TitleFontSize - 1;
    console.log("ACTUAL", Tbldata);

    const DataSet = [
      {
        columns: [
          { title: "PlanMonth", style: { font: { sz: TitleFontSize, bold: true } }, width: { wch: 30 } }, // width in characters
          { title: "Priorty", style: { font: { sz: TitleFontSize, bold: true } }, width: { wpx: 100 } }, // width in pixels
          { title: "WheatvarietyName", style: { font: { sz: TitleFontSize, bold: true } }, width: { wpx: 100 } }, // width in pixels
          { title: "ReceivingBin", style: { font: { sz: TitleFontSize, bold: true } }, width: { wpx: 100 } }, // width in pixels
          { title: "Lot_No", style: { font: { sz: TitleFontSize, bold: true } }, width: { wpx: 100 } }, // width in pixels
          { title: "Storage_Location", style: { font: { sz: TitleFontSize, bold: true } }, width: { wpx: 100 } }, // width in pixels
          { title: "Plant_Name", style: { font: { sz: TitleFontSize, bold: true } }, width: { wpx: 100 } },// width in pixels
          { title: "WH_Name", style: { font: { sz: TitleFontSize, bold: true } }, width: { wpx: 100 } }, // width in pixels
          { title: "SAP_Qty", style: { font: { sz: TitleFontSize, bold: true } }, width: { wpx: 100 } },// width in pixels
          { title: "Reserved_Stock", style: { font: { sz: TitleFontSize, bold: true } }, width: { wpx: 100 } },// width in pixels
          { title: "Available_Stock", style: { font: { sz: TitleFontSize, bold: true } }, width: { wpx: 100 } },// width in pixels
          { title: "Movement_Qty", style: { font: { sz: TitleFontSize, bold: true } }, width: { wpx: 100 } }, // width in pixels
          { title: "Difference_Qty", style: { font: { sz: TitleFontSize, bold: true } }, width: { wpx: 100 } }, // width in pixels
          { title: "Expected_Arrival", style: { font: { sz: TitleFontSize, bold: true } }, width: { wpx: 100 } }, // width in pixels
          { title: "Purchase_Plan", style: { font: { sz: TitleFontSize, bold: true } }, width: { wpx: 100 } }, // width in pixels
          { title: "Release_Qty", style: { font: { sz: TitleFontSize, bold: true } }, width: { wpx: 100 } }, // width in pixels
          { title: "Division", style: { font: { sz: TitleFontSize, bold: true } }, width: { wpx: 100 } }, // width in pixels
          { title: "QC_Cleared_Qty", style: { font: { sz: TitleFontSize, bold: true } }, width: { wpx: 150 } }, // width in pixels
          { title: "Fumi_Cleared_Qty", style: { font: { sz: TitleFontSize, bold: true } }, width: { wpx: 150 } }, // width in pixels
          { title: "Keyloan_Cleared_Qty", style: { font: { sz: TitleFontSize, bold: true } }, width: { wpx: 150 } } // width in pixels

        ],
        data: Tbldata.map((data) => [
          { value: data.PlanMonth, style: { font: { sz: BodyFontSize, color: { rgb: "000000" } }, fill: { patternType: "solid", fgColor: { rgb: "FFFFFF" } } } },
          { value: data.Priority == null ? '' : data.Priority, style: { font: { sz: BodyFontSize, color: { rgb: "000000" } }, fill: { patternType: "solid", fgColor: { rgb: "FFFFFF" } } } },
          { value: data.WheatvarietyName == null ? '' : data.WheatvarietyName, style: { font: { sz: BodyFontSize, color: { rgb: "000000" } }, fill: { patternType: "solid", fgColor: { rgb: "FFFFFF" } } } },
          { value: data.ReceivingBinName == null ? '' : data.ReceivingBinName, style: { font: { sz: BodyFontSize, color: { rgb: "000000" } }, fill: { patternType: "solid", fgColor: { rgb: "FFFFFF" } } } },
          { value: data.lotno == null ? '' : data.lotno, style: { font: { sz: BodyFontSize, color: { rgb: "000000" } }, fill: { patternType: "solid", fgColor: { rgb: "FFFFFF" } } } },
          { value: data.storage_location == null ? '' : data.storage_location, style: { font: { sz: BodyFontSize, color: { rgb: "000000" } }, fill: { patternType: "solid", fgColor: { rgb: "FFFFFF" } } } },
          { value: data.plant_name == null ? '' : data.plant_name, style: { font: { sz: BodyFontSize, color: { rgb: "000000" } }, fill: { patternType: "solid", fgColor: { rgb: "FFFFFF" } } } },
          { value: data.wh_name == null ? '' : data.wh_name, style: { font: { sz: BodyFontSize, color: { rgb: "000000" } }, fill: { patternType: "solid", fgColor: { rgb: "FFFFFF" } } } },
          { value: data.SAP_Qty == null ? '' : data.SAP_Qty, style: { font: { sz: BodyFontSize, color: { rgb: "000000" } }, fill: { patternType: "solid", fgColor: { rgb: "FFFFFF" } } } },
          { value: data.Reserved_Stock == null ? '' : data.Reserved_Stock, style: { font: { sz: BodyFontSize, color: { rgb: "000000" } }, fill: { patternType: "solid", fgColor: { rgb: "FFFFFF" } } } },
          { value: data.AvailabelQty == null ? '' : data.AvailabelQty, style: { font: { sz: BodyFontSize, color: { rgb: "000000" } }, fill: { patternType: "solid", fgColor: { rgb: "FFFFFF" } } } },
          { value: data.Movement_Qty == null ? '' : data.Movement_Qty, style: { font: { sz: BodyFontSize, color: { rgb: "000000" } }, fill: { patternType: "solid", fgColor: { rgb: "FFFFFF" } } } },
          { value: data.Diff_for_Mvmt_Qty_SAP_QTY == null ? '' : data.Diff_for_Mvmt_Qty_SAP_QTY, style: { font: { sz: BodyFontSize, color: { rgb: "000000" } }, fill: { patternType: "solid", fgColor: { rgb: "FFFFFF" } } } },
          { value: data.Expected_Arrival == null ? '' : data.Expected_Arrival, style: { font: { sz: BodyFontSize, color: { rgb: "000000" } }, fill: { patternType: "solid", fgColor: { rgb: "FFFFFF" } } } },
          { value: data.Purchase_Plan == null ? '' : data.Purchase_Plan, style: { font: { sz: BodyFontSize, color: { rgb: "000000" } }, fill: { patternType: "solid", fgColor: { rgb: "FFFFFF" } } } },
          { value: data.Release_Qty == null ? '' : data.Release_Qty, style: { font: { sz: BodyFontSize, color: { rgb: "000000" } }, fill: { patternType: "solid", fgColor: { rgb: "FFFFFF" } } } },
          { value: data.Division == null ? '' : data.Division, style: { font: { sz: BodyFontSize, color: { rgb: "000000" } }, fill: { patternType: "solid", fgColor: { rgb: "FFFFFF" } } } },

          {
            value: (data.QC_Cleared_Qty?data.QC_Cleared_Qty:0),
            style: {
              font: { sz: BodyFontSize, bold: true, color: { rgb: "FFFFFF" } },
              fill: {
                patternType: "solid",
                fgColor: { rgb: parseFloat(data.Movement_Qty) > parseFloat((data.QC_Cleared_Qty?data.QC_Cleared_Qty:0)) ? "A00000" : "00A000" }
              }
            }
          },

          {
            value: (data.Fumi_Cleared_Qty?data.Fumi_Cleared_Qty:0),
            style: {
              font: { sz: BodyFontSize, bold: true, color: { rgb: "FFFFFF" } },
              fill: {
                patternType: "solid",
                fgColor: { rgb: parseFloat(data.Movement_Qty) > parseFloat((data.Fumi_Cleared_Qty?data.Fumi_Cleared_Qty:0)) ? "A00000" : "00A000" }
              }
            }
          },

          {
            value: (data.Keyloan_Cleared_Qty?data.Keyloan_Cleared_Qty:0),
            style: {
              font: { sz: BodyFontSize, bold: true, color: { rgb: "FFFFFF" } },
              fill: {
                patternType: "solid",
                fgColor: { rgb: parseFloat(data.Movement_Qty) > parseFloat((data.Keyloan_Cleared_Qty?data.Keyloan_Cleared_Qty:0)) ? "A00000" : "00A000" }
              }
            }
          },

        ]),
      }];
    console.log("EXCEL DATASET", DataSet);
    return DataSet;
  };

  const getDataSets = () => {
    let cols = columns.filter((f) => !f.hideInExcel);
    let ds = [
      {
        rows: Tbldata || [],
        columns: cols,
        backgroundColor: "#FF0000",
        sheetName: sheetName,
      },
    ];
    return ds;
  };

  const Custstyle = {
    header: {
      style: {
        fontColor: '#194D33',
        backgroundColor: '#ffff00',
      }
    }
  }
  return (
    <div>

      {(!hideSearch || showDownload) && (
        <Row className="justify-content-end mx-0">
          {filterRenderor && filterRenderor()}
          <Col md="6" sm="12" className="d-flex align-items-center justify-content-end">
            {Tbldata && Tbldata.length > 0 && showDownload && (
              <>
                {downloadExcel && (ExcelType === "NORMAL" || ExcelType === "") && (
                  <Suspense fallback={<Spinner />}>
                    <ExcelDownload fileName={fileName} dataSets={getDataSets()} excelType={ExcelType} />
                  </Suspense>
                )
                }

                {downloadExcel && ExcelType === "PLAN" && (
                  <Suspense fallback={<Spinner />}>
                    <ExcelDownload fileName={fileName} dataSets={getDataSets_Plan()} excelType={ExcelType} />
                  </Suspense>
                )
                }

                <PrimaryButton
                  text={"Excel Export"}
                  className=""

                  onClick={() => {
                    setdowloadExcel(true);
                    setTimeout(() => { setdowloadExcel(false); }, 1000);
                  }}
                />
              </>
            )}

            &nbsp;&nbsp;

            {!hideSearch && (
              <InputGroup className="input-group-merge mb-2">
                <InputGroupAddon addonType="prepend">
                  <InputGroupText>
                    <Search size={16} />
                  </InputGroupText>
                </InputGroupAddon>
                <Input
                  placeholder="search..."
                  // value={searchValue}
                  // onChange={(e) => handleFilter(e)}
                  // onKeyPress={(e) => {
                  //   handleEnterSearch(e);
                  // }}
                  onChange={(e) => handlesearch(e)}
                />
              </InputGroup>
            )}
            {/* <Button.Ripple color="primary" type="button" onClick={(e) => onRefresh()} className="mr-2">
              Refresh
            </Button.Ripple> */}
          </Col>
        </Row>
      )}

      <DataTable
        noHeader
        responsive
        selectableRows={Selectable || false}
        columns={columns}
        className="react-dataTable"
        sortIcon={<ChevronDown size={10} />}
        // data={Tbldata}
        data={ serachData.length > 1 ?  filterresult  : Tbldata }
        pagination
        paginationTotalRows={totalPage || 1}
        progressPending={loading}
        progressComponent={<Spinner className={"m-2"} />}
        paginationServer={!!url}
        persistTableHead
        paginationRowsPerPageOptions={[25, 50, 75, 100]}
        onChangeRowsPerPage={handlePerRowsChange}
        paginationPerPage={pageSize}
        onChangePage={handlePagination}
        fixedHeader
        fixedHeaderScrollingHeight='100px'
        customStyles={Custstyle}
        onSelectedRowsChange={Selectable && props.onSelectedRowsChange}
        selectableRowDisabled={Selectable && props.selectableRowDisabled}
      />
    </div>
  );
};

export default TableComponent;
