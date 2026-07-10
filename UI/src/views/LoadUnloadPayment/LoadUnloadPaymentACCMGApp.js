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
import DateComponent from '../common/dateComponent';

const LoadUnloadPaymentACCMGApp = ({})  => { 
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
      name: "COUNT",
      selector: "row_count",
      sortable: true,
      minWidth: "50px",
      wrap: true,
    },
    {
      name: "VENDOR",
      selector: "Name",
      sortable: true,
      minWidth: "350px",
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
      name: "WAITING AT",
      selector: "Waiting_at",
      sortable: true,
      minWidth: "120px",
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


   
    let { showLoader, hideLoader } = useLoader(); 
    
    useEffect(() => { 
      getLoadUnloadList();
    }, []);

    const form = useFormik({
      isInitialValid: false,
      initialValues: {},
      validationSchema: Yup.object().shape({}),
      onSubmit(values) { },
    });
  
   

    const getLoadUnloadList = () => {
      let values = form.values;
      let fdata = {
      status : "3"
      };

    showLoader();
     apiPostMethod(apiBaseUrl + "Loadingunloadingcost/Load_Unload_Payment_Index", fdata)
     .then((response) => {
       const { data } = response;
       let tableData = data.results
       let load_unload_info = data.load_unload_info

       if (data.success) {
        form.setValues({
           ...form.values,
         CheckList:tableData,
       })
       }
     })
     .catch((error) => {
      errorToast("NO Record Found");
    })
     .finally((a) => {
       hideLoader();
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

    const close = () => setOpen(false);

    const Model_Open = (row) => {
        setData(row)
        setOpen(true)
        form.setValues({
          ...form.values,
      
        load_unload_info:JSON.parse(row.load_unload_info),
        load_unload_no:row.load_unload_no,
        row_count:row.row_count,
        total_value:row.total_value,
        invoice_value:row.invoice_value,
        difference:row.difference,
        vendor_invoice_no:row.invoice_no,
        invoice_date:row.invoice_date,
        tds_name:row.tds_name,
        tds_code:row.tds_code,
        process_type:row.process_type,
        confirm_vendor:row.confirm_vendor_id,
        Code:row.Code,
        remarks:row.remarks,
        refid:row.id,
        rake_id:row.rake_id,
        ias_unload_id:row.ias_unload_id,
        unload_id:row.unload_id,
        ias_load_id:row.ias_load_id,
        invoice_attachment:row.invoice_attachment,
        miro_posting_date:row.miro_date,
        company_name:row.company_name,
        overall_tonnage:row.overall_tonnage,

      })
      form.setFieldValue("confirm_vendor", {  label: row.Name,value: row.confirm_vendor_id });
    }
    const Approve=(status)=>{
      let value = [];
      let filteredData = form.values.load_unload_info

    if(status == 4){
      for (let i = 0; i < filteredData.length; i++) {
      value.push({
        PURPOSE: filteredData[i].Type,
        VA_NO: filteredData[i].va_number,
        PO_NO: filteredData[i].po_number,
        MIGO_NO: filteredData[i].migo_no,
        INV_AMT: filteredData[i].value,
        PO_LINE_ITEM: filteredData[i].po_line_item,
      })
    }
    }
      const postdata ={
       ID:form.values.refid,
       status:status,
       Code:form.values.Code,
       remarks:form.values.remarks,
       vendor_invoice_no:form.values.vendor_invoice_no,
       invoice_date:form.values.invoice_date,
       process_type:form.values.process_type,
       tds_code:form.values.tds_code,
       invoice_value:form.values.invoice_value,
       miro_posting_date:form.values.miro_posting_date,
       load_unload_no:form.values.load_unload_no,
       company_name:form.values.company_name,

       sap_info:value
      }
     
      if(status == 6 && (postdata.remarks == '' || postdata.remarks == undefined) ){
       errorToast("Please Enter Remarks...");
       return false;
      }
     if(status == 4 && (postdata.miro_posting_date == '' || postdata.miro_posting_date == undefined) ){
      errorToast("Select Miro Posting Date...");
      return false;
      }
      let msg = "Loading & Unloading Payment"
      let titles
      if(status == 4){
       titles = 'Are you sure to Approve?'
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
     if (data.success == 1) {
      if(status == 4){
        ShowToast("Saved Successfully...");
        setOpen(false)
      }else if(status == 6){
        errorToast("Rejected Successfully...");
        setOpen(false)
      }
      window.setTimeout( function() {
        window.location.reload();
      }, 2000);
     }else if (data.success == 0){
        errorToast(data.error);
        setOpen(false)
     }
     })
     .catch((error) => {
     errorToast("Something went wrong, please try again after sometime");
     });
   }});
   };
    // useEffect(() => { 
    //   if(form.values.confirm_vendor){
    //   const fdata1 = {Id:form.values.confirm_vendor.value}
    //   apiPostMethod(apiBaseUrl+'Loadingunloadingcost/getVendorById', fdata1)
    //   .then((response) => {
    //     const { data } = response;
    //     if (data.success) {
    //       form.setValues({
    //         ...form.values,
    //       tds_name:data.results[0]?.tds_name,
    //       tds_code:data.results[0]?.tds_code,
    //     })
    //     }
    //    })
    //  }
    // }, [form.values.confirm_vendor]);
    const dateRestriction = DateComponent('sap')
  return ( 
    <Fragment>
    <RefreshBlock/>
     {/* <div style={{ border: "2px solid #7367f0 ", padding: "2px", borderRadius: "6px", marginTop: "1px" }}> */}
     <CardComponent  header="Loading & Unloading Payment Approval - Accounts Manager">
   
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
        <Modal.Header><b>Accounts Manager Approval</b>
          <X onClick={close} style={{ float: "right" }} />
        </Modal.Header>
            <Modal.Body>
                <Row>
                   <Col md="4" sm="12">
                      <CustomTextInput label={"L&U No"} form={form} id="load_unload_no" type="text" disabled/>
                   </Col>
                   <Col md="4" sm="12">
                      <CustomTextInput label={"Total Row Count"} form={form} id="row_count" type="text" disabled/>
                    </Col>
                    <Col md="4" sm="12">
                      <CustomTextInput label={"Total Tonnage"} form={form} id="overall_tonnage" type="text" disabled/>
                    </Col>
                    <Col md="4" sm="12">
                      <CustomTextInput label={"Total Value"} form={form} id="total_value" type="text" disabled/>
                    </Col>
                    <Col md="4" sm="12">
                      <CustomTextInput label={"Invoice Value"} form={form} id="invoice_value" type="text" disabled/>
                    </Col>
                    <Col md="4" sm="12">
                      <CustomTextInput label={"Difference"} form={form} id="difference" value = {form.values.total_value-form.values.invoice_value} type="text" disabled/>
                    </Col>
                    <Col md="4" sm="12" >
                        <CustomDropdownInput  
                            url={`${apiBaseUrl}/Loadingunloadingcost/getVendor`} 
                            label={"Confirm Vendor Name"}  
                            form={form} 
                            id={"confirm_vendor"}
                            options ={warehouseoption} 
                            isDisabled  
                          />
                    </Col>
                    <Col md="4" sm="12">
                      <CustomTextInput label={"TDS"} form={form} id="tds_name" type="text" disabled/>
                    </Col>
                    <Col md="4" sm="12">
                      <CustomTextInput label={"Vendor Invoice No"} form={form} id="vendor_invoice_no" type="text" disabled/>
                    </Col>
                    <Col md="4" sm="12">
                      <CustomTextInput label={"Invoice Date"} form={form} id="invoice_date" type="date" disabled/>
                      {/* <DatePicker label={"From Date"} form={form} id="FromDate" type="date"  /> */}
                    </Col>
                    <Col md="4" sm="12">
                      <CustomTextInput label={"MIRO Posting Date"} form={form} id="miro_posting_date" type="date" 
                      // min={dateRestriction.min_date} 
                      // max={dateRestriction.max_date} 
                      disabled/>
                      {/* <DatePicker label={"From Date"} form={form} id="FromDate" type="date"  /> */}
                    </Col>
                    <Col md="4" sm="12">
                      <CustomTextInput label={"Remarks"} form={form} id="remarks" type="text" />
                    </Col>
                    <Col md="4" sm="12">
                       <Uploader isReadOnly={true} label={"Invoice Copy"} selectedFileName={form.values.invoice_attachment} />
                    </Col>
                </Row>
                <Row>
                  <Col align="left">
                    <Button onClick={(e) => Approve(6)} color="danger">Reject</Button>
                  </Col>
                  <Col align="right">
                    <Button onClick={(e) => Approve(4)} className = "ml-2" color="primary">Approve</Button>
                  </Col>
                </Row>
                <HrLine />
                <Row>
                  <Col>
                    <TableComponent 
                    showDownload 
                    columns={ColumnsVADetails} 
                    data={form.values.load_unload_info}/>  
                  </Col>
                </Row>
            </Modal.Body>
            </Modal>
    </Fragment>
    );
}; 


export default LoadUnloadPaymentACCMGApp 
