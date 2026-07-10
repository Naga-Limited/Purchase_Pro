import React, { Fragment, useState, useEffect } from 'react'
import { Col ,FormGroup, Label,Button, ButtonToggle } from 'reactstrap'
import Row from 'reactstrap/lib/Row'
import { apiBaseUrl, vaUrl ,BagcuttingUrl } from '../../urlConstants'
import { useFormik } from "formik";
import { CustomDropdownInput, CustomTextInput, CustomUploader, validation, Yup } from "../forms/custom-form";
import { Link, useHistory, useParams } from 'react-router-dom';
import { useLoader } from '../../utility/hooks/useLoader';
import { apiPostMethod } from '../../helper/axiosHelper';
import { errorToast } from '../../helper/appHelper';
import { CardComponent } from "../common/CardComponent";
import { ShowToast } from "../../helper/appHelper";
import confirmDialog from "../../@core/components/confirm/confirmDialog";
import TableComponent from '../common/TableComponent';
import { DatePicker } from '../forms/custom-datetime';
import { RefreshBlock } from '../common/RefreshBlock';
import { HrLine } from '../common/HrLine';
import { Modal } from "react-bootstrap";
import { X } from "react-feather";
import Uploader from '../Uploader';

const LoadUnloadPaymentReport = ({})  => { 
  const history = useHistory();

  const taColumns = [
    {
      name: "L&U NO",
      selector: "load_unload_no",
      sortable: true,
      minWidth: "120px",
      wrap: true,
    },
    {
      name: "MIRO NO",
      selector: "miro_no",
      sortable: true,
      minWidth: "120px",
      wrap: true,
    },
    {
      name: "COUNT",
      selector: "row_count",
      sortable: true,
      minWidth: "50px",
      wrap: true,
    },
    {
      name: "OVER ALL TON",
      selector: "overall_tonnage",
      sortable: true,
      minWidth: "100px",
      wrap: true,
    },
    {
      name: "VENDOR",
      selector: "Name",
      sortable: true,
      minWidth: "250px",
      wrap: true,
    },
    
    {
      name: "TRANSACTION DATE",
      selector: "created_at",
      sortable: true,
      minWidth: "50px",
      wrap: true,
    },
    {
      name: "VALUE",
      selector: "invoice_value",
      sortable: true,
      minWidth: "120px",
      wrap: true,
    },
    {
      name: "MIRO REVERSE NUMBER",
      selector: "miro_reverse_no",
      sortable: true,
      minWidth: "120px",
      wrap: true,
    },
    {
      name: "TDS",
      selector: "tds_name",
      sortable: true,
      minWidth: "150px",
      wrap: true,
    },
    {
      name: "INVOICE COPY",
      selector: "invoice_attachment",
      sortable: true,
      minWidth: "120px",
      wrap: true,
      cell:(row) => {
        return (
          <>
           <Uploader isReadOnly={true} selectedFileName={row.invoice_attachment} />
          </>
        )
        }
    },
    {
      name: "CURRENT STATUS",
      selector: "Waiting_at",
      sortable: true,
      minWidth: "150px",
      wrap: true,
      cell: (row) => {
        return  (
          <>
          <span className="badge rounded-pill bg-info">
            {row.Waiting_at}
          </span>
          </>
        );
     },
    },
    
    
  ];

    const actionsCol2 = {
      name: "ACTION",
      selector: "status",
      minWidth: "50px",
      cell: (row) => {
        return  (
          ActionColumn(row)
        );
      },
    };
    const taColumnsVADetails = [
      {
        name: "VA NO",
        selector: "va_number",
        sortable: true,
        minWidth: "200px",
        wrap: true,
      },
      {
        name: "MIGO NO",
        selector: "migo_no",
        sortable: true,
        minWidth: "100px",
        wrap: true,
      },
      {
        name: "PO NO",
        selector: "po_number",
        sortable: true,
        minWidth: "100px",
        wrap: true,
      },
      {
        name: "VENDOR",
        selector: "Name",
        sortable: true,
        minWidth: "250px",
        wrap: true,
      },
      
      {
        name: "PLANT",
        selector: "plant_id",
        sortable: true,
        minWidth: "80px",
        wrap: true,
      },
      {
        name: "TYPE",
        selector: "Type",
        sortable: true,
        minWidth: "80px",
        wrap: true,
      },
      {
        name: "QTY IN TON",
        selector: "total_weight",
        sortable: true,
        minWidth: "80px",
        wrap: true,
      },
      {
        name: "COST PER TON",
        selector: "loading_charge",
        sortable: true,
        minWidth: "80px",
        wrap: true,
      },
      {
        name: "CONDITION VALUE",
        selector: "value",
        sortable: true,
        minWidth: "100px",
        wrap: true,
      },
      {
        name: "INVOICE VALUE",
        selector: "confirm_value",
        sortable: true,
        minWidth: "100px",
        wrap: true,
      },
      {
        name: "MOVEMENT",
        selector: "vehicle_type",
        sortable: true,
        minWidth: "100px",
        wrap: true,
      },
    ];
    const columns = [...taColumns, actionsCol2];
    const ColumnsVADetails = [...taColumnsVADetails];

    const [warehouseoption, setWarehouseoption] = useState([]);  
    const [MiroNumber, setMiroNumber] = useState([]);  


   
    let { showLoader, hideLoader } = useLoader(); 
    
    // useEffect(() => { 
    //   getLoadUnloadList();
    // }, []);

    const form = useFormik({
      isInitialValid: false,
      initialValues: {},
      validationSchema: Yup.object().shape({}),
      onSubmit(values) { },
    });
  
   

    const getLoadUnloadList = () => {
      let fdata = {
      fromdate:form.values.FromDate,
      todate:form.values.ToDate,
      };

    showLoader();
     apiPostMethod(apiBaseUrl + "Loadingunloadingcost/Load_Unload_Payment_Report", fdata)
     .then((response) => {
       const { data } = response;
       let tableData = data.results
      //  let load_unload_info = data.results.load_unload_info
      // console.log(load_unload_info)
       if (data.success) {
        form.setValues({
           ...form.values,
         CheckList:tableData,
         load_unload_info:JSON.parse(data.results[0].load_unload_info),
         load_unload_no:tableData[0].load_unload_no,
         row_count:tableData[0].row_count,
         total_value:tableData[0].total_value,
         invoice_value:tableData[0].invoice_value,
         difference:tableData[0].difference,
         vendor_invoice_no:tableData[0].invoice_no,
         invoice_date:tableData[0].invoice_date,
         tds_name:tableData[0].tds_name,
         confirm_vendor:tableData[0].confirm_vendor_id,
         remarks:tableData[0].remarks,
         refid:tableData[0].id,
         rake_id:tableData[0].rake_id,
         ias_unload_id:tableData[0].ias_unload_id,
         unload_id:tableData[0].unload_id,
         ias_load_id:tableData[0].ias_load_id,
         invoice_attachment:tableData[0].invoice_attachment
       })
       form.setFieldValue("confirm_vendor", {  label: data.results[0].Name,value: data.results[0].confirm_vendor_id });
       }
     })
     .catch((error) => {
      errorToast("NO Record Found");
     })
     .finally((a) => {
       hideLoader();
     });
    }; 
   
    useEffect(() => { 
      if(form.values.FromDate && form.values.ToDate)
      getVendorCode();
    }, [form.values.ToDate && form.values.FromDate]);

    const getVendorCode = () => {
      let fdata = { 
        toDate: form.values.ToDate, 
        fromdate:form.values.FromDate,
      };
  
      apiPostMethod(apiBaseUrl+'Loadingunloadingcost/MIRO_NUMBER', fdata)
        .then((response) => {
          const { data } = response;
          console.log(data)
          if (data.success) {
            setMiroNumber(data.results);
          }
        })
        .catch((error) => {
          errorToast("Something went wrong, please try again after sometime");
        });
    };
  const ActionColumn=(row)=>{
        return (
          <Button color="primary" type="Button" onClick={(e) => {Model_Open(row)}}>View</Button>
        )
  }


 //Modal pop up window 
   const [open, setOpen] = useState(false);
   const [Data, setData] = useState([]);
   const [LoadData, setLoadData] = useState([]);

    const close = () => setOpen(false);

    const Model_Open = (row) => {
      setLoadData(JSON.parse(row.load_unload_info))
        setData(row)
        setOpen(true)
    }
    const Approve=(status)=>{

      const postdata ={
       ID:form.values.refid,
       status:status,
       remarks:form.values.remarks,
       vendor_invoice_no:form.values.vendor_invoice_no,
       invoice_date:form.values.invoice_date,
       rake_id:form.values.rake_id,
       ias_unload_id:form.values.ias_unload_id,
       unload_id:form.values.unload_id,
       ias_load_id:form.values.ias_load_id,
      }
     
      if(status == 6 && (postdata.remarks == '' || postdata.remarks == undefined) ){
       errorToast("Please Enter Remarks...");
       return false;
     }
 
      let msg = "Loading & Unloading Payment"
      let titles
      if(status == 7){
       titles = 'Are you sure to Reverse?'
      }else if(status == 6){
       titles = 'Are you sure to Reject?'
      }
     
      confirmDialog({
        title: titles,
        description: msg,
      }).then((res) => {
     if (res) {
     apiPostMethod(apiBaseUrl+'Loadingunloadingcost/Load_Unload_Payment_Update', postdata)
     .then((response) => {
     const { data } = response;
     if (data.success) {
      if(status == 7){
        ShowToast("Saved Successfully...");
        setOpen(false)
      }else if(status == 6){
        errorToast("Rejected Successfully...");
        setOpen(false)
      }
      window.setTimeout( function() {
        window.location.reload();
      }, 2000);
     }
     })
     .catch((error) => {
     errorToast("Something went wrong, please try again after sometime");
     });
   }});
   };

 
  return ( 
    <Fragment>
    <RefreshBlock/>
     {/* <div style={{ border: "2px solid #7367f0 ", padding: "2px", borderRadius: "6px", marginTop: "1px" }}> */}
     <CardComponent  header="Load and Unload Report">
     <Row>
           <Col md="3" sm="12">
             <DatePicker label={"From Date"} form={form} id="FromDate" type="date"  />
          </Col>
          <Col md="3" sm="12">
             <DatePicker label={"To Date"} form={form} id="ToDate" type="date"/>
          </Col>
          <Col md="3" sm="12"> 
             <Label></Label>
            <FormGroup className="d-flex justify-content-start mb-0">
            <Button.Ripple onClick={getLoadUnloadList}  color="primary"  type="Button"  >
            Show
            </Button.Ripple>
            </FormGroup>
          </Col>
      </Row>
      <HrLine />
      <Row>
        <Col>
          <TableComponent 
          showDownload 
          columns={columns} 
          data={form.values.CheckList}/>  
        </Col>
      </Row>
      </CardComponent>
 
      {/* </CardComponent>} */}
      <Modal show={open} centered size="xl">
        <Modal.Header><b>Load Unload Details</b>
          <X onClick={close} style={{ float: "right" }} />
        </Modal.Header>
            <Modal.Body>
                <Row>
                  <Col>
                    <TableComponent 
                    showDownload 
                    columns={ColumnsVADetails} 
                    data={LoadData}/>  
                  </Col>
                </Row>
            </Modal.Body>
            </Modal>
    </Fragment>
    );
}; 


export default LoadUnloadPaymentReport 
