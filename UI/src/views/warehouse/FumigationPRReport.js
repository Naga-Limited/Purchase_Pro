import React, { Fragment, useState, useEffect } from 'react'
import { Col ,FormGroup, Label,Button, ButtonToggle } from 'reactstrap'
import Select from "react-select";
import Row from 'reactstrap/lib/Row'
import { apiBaseUrl, vaUrl ,BagcuttingUrl } from '../../urlConstants'
import { useFormik } from "formik";
import { CustomTextInput, validation, Yup } from "../forms/custom-form";
import { useHistory, useParams } from 'react-router-dom';
import { useLoader } from '../../utility/hooks/useLoader';
import { apiPostMethod } from '../../helper/axiosHelper';
import { errorToast } from '../../helper/appHelper';
import { CardComponent } from "../common/CardComponent";
import { ShowToast } from "../../helper/appHelper";
import confirmDialog from "../../@core/components/confirm/confirmDialog";
import TableComponent from '../common/TableComponent';
import { DatePicker } from '../forms/custom-datetime';


const FumigationEntryList = ({})  => { 
  const history = useHistory();

  const taColumns = [
    {
      name: "ID",
      selector: "id",
      sortable: true,
      minWidth: "50px",
      wrap: true,
    },
    {
      name: "Warehouse Name and Type",
      selector: "warehouse_name",
      sortable: true,
      minWidth: "300px",
      wrap: true,
    },
    {
      name: "Total Amount",
      selector: "total_amount",
      sortable: true,
      minWidth: "100px",
      wrap: true,
    },
    {
      name: "Reject Reason",
      selector: "reject_reason",
      sortable: true,
      minWidth: "200px",
      wrap: true,
    },
    {
      name: "PR No",
      selector: "sap_pr_no",
      sortable: true,
      minWidth: "200",
      wrap: true,
    },
    {
      name: "Created At",
      selector: "created_at",
      sortable: true,
      minWidth: "120px",
      wrap: true,
    },
    {
      name: "Status",
      selector: "StatusName",
      sortable: true,
      minWidth: "100px",
      wrap: true,
    },
  ];

    const actionsCol2 = {
      name: "Action",
      selector: "status",
      minWidth: "100px",
      cell: (row,index) => {
        return  (
          ActionColumn(row.id,row.fumigation_id,row.sap_pr_info,index)
        );
      },
    };

    const columns = [...taColumns, actionsCol2];


    let { id } = useParams();
    let refid='';
    let fdata='';
    if(id) {
       refid = id.replace(":", "");
    }
    let { showLoader, hideLoader } = useLoader(); 
    
   

    const form = useFormik({
      isInitialValid: false,
      initialValues: {},
      validationSchema: Yup.object().shape({}),
      onSubmit(values) { },
    });
  
    const getSublotlist = () => {
      let Data={
        fromdate:form.values.FromDate,
        todate:form.values.ToDate,
      }
        let fdata = {
          Data,
         formType:"0,1,2"
        };
    

    showLoader();
      // console.log("Request Url :: "+apiBaseUrl + "warehouse/getbagcuttingEntrydatabyid", fdata);
     apiPostMethod(apiBaseUrl + "warehouse/Fumigation/FumigationPRReport", fdata)
     .then((response) => {
       const { data } = response;
       console.log("Response Data :: "+JSON.stringify(response));

       console.log("Data :: ", data);
       let tableData = []
       tableData = data.results
      
       if (data.success) {
         form.setValues({
           
          ...form.values,
           CheckList:tableData,
         })
       }
       console.log("Result Data :: "+JSON.stringify(form));
     })
     .catch((error) => {
       errorToast("Something went wrong, please try again after sometime");
     })
     .finally((a) => {
       hideLoader();
     });
    }; 
    console.log("Request url :: "+apiBaseUrl + "Master/")
   
  
  
const ActionEntry = (id) => {

    history.push("/FUMIGATIONPRAPPROVAL:"+id); 
}


   
  

  const ActionColumn=(id,fumigation_id,sap_pr_info,index)=>{
        return (
          <>
          <Button color="warning" type="Button" onClick={(e) => {ActionEntry(id)}}>View</Button>
          {/* <Button color="primary" type="Button" className="ml-2" onClick={(e) => {FumigationPRApprove(id,fumigation_id,2,sap_pr_info,index)}}>Approve</Button>
          <Button color="danger" type="Button" className="ml-2" onClick={(e) => {FumigationPRApprove(id,fumigation_id,0,sap_pr_info,index)}}>Reject</Button> */}
          </>
        )
  }


  return ( 
    <Fragment>
     {/* <div style={{ border: "2px solid #7367f0 ", padding: "2px", borderRadius: "6px", marginTop: "1px" }}> */}
     <CardComponent  header="Fumigation PR Report">
      <Row>
           <Col md="3" sm="12">
             <DatePicker label={"From Date"} form={form} id="FromDate" type="date"  />
          </Col>
          <Col md="3" sm="12">
             <DatePicker label={"To Date"} form={form} id="ToDate" type="date"  />
          </Col>

          <Col md="2" sm="12"> 
             <Label></Label>
            <FormGroup className="d-flex justify-content-end mb-0">
            <Button.Ripple onClick={getSublotlist}  color="primary"  type="Button"  >
            Show
            </Button.Ripple>
            </FormGroup>
          </Col>
      </Row>
        <br></br>
      <Row>
        <Col>
          <TableComponent 
           showDownload columns={columns} data={form.values.CheckList}/>  
        </Col>
      </Row>
     </CardComponent>
    </Fragment>
    );
}; 


export default FumigationEntryList
