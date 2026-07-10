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
      minWidth: "400px",
      wrap: true,
    },
    {
      name: "Amount",
      selector: "non_tax_amount",
      sortable: true,
      minWidth: "100px",
      wrap: true,
    },
    {
      name: "Gst",
      selector: "gst",
      sortable: true,
      minWidth: "100px",
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
      minWidth: "300px",
      // wrap: true,
      cell:(row, index) => {
        return (
             <CustomTextInput style={{fontSize:"12px",height:"30px",marginBottom:"-10px",width:"250px"}}
                        placeholder={" "}  
                        onChange={(e) => onTextChange(e,row.id,form.values.CheckList,"reject_reason",index)} 
                        form={form} 
                        id={'reject_reason'} 
                        type="text" 
                        value={row.reject_reason}
             />
        )

      }
    },
  ];

    const actionsCol2 = {
      name: "Action",
      selector: "status",
      minWidth: "300px",
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
    
    useEffect(() => { 
      getSublotlist();
    }, [id]);

    const form = useFormik({
      isInitialValid: false,
      initialValues: {},
      validationSchema: Yup.object().shape({}),
      onSubmit(values) { },
    });
  
    const onTextChange = (e,PKey, CheckList,Val,index) => {

      for(let i=0;i<CheckList.length;i++){
        if(CheckList[i].id==PKey){
            if(Val=="reject_reason"){
              CheckList[i].reject_reason=e.target.value;
            }
        }
      }
      // form.setValues({...form.values,CheckLists});
    }

    const getSublotlist = () => {
      let Data=form.values;
      let fdata = {
      Screen:"FUMIGATIONENTRYLIST",
      Data,
      status:1
      };

    showLoader();
      // console.log("Request Url :: "+apiBaseUrl + "warehouse/getbagcuttingEntrydatabyid", fdata);
     apiPostMethod(apiBaseUrl + "warehouse/Fumigation/getFumigatiomPRData", fdata)
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

const FumigationPRApprove = (id,fumigation_id,status,sap_pr_info,index) => {
  // console.log(form.values.CheckList[index].reject_reason)
  const postdata = {
    id,
    fumigation_id,
    status,
    sap_pr_info,
    Reject_Reason:form.values.CheckList[index].reject_reason,
  } 
  if(postdata.status == 0 && (postdata.Reject_Reason == '' || postdata.Reject_Reason == undefined)){
    errorToast("Please Enter the Reject reason ..."); 
    return false
  }

  let msg=""
  let title=""

        if(status == 0){
          msg="Fumigation PR"
          title="Are you sure want to Reject?"
        }else if(status == 2){
          msg="Fumigation PR"
          title="Are you sure want to Approve?"
        }
      confirmDialog({
      title: title,
      description: msg,
    }).then((res) => {
      if (res) {
        showLoader();
        apiPostMethod(apiBaseUrl + "warehouse/Fumigation/getFumigatiomPRUpdate", postdata)
        .then((response) => {
          const { data } = response;
          if(data.success == 1){
          if(status == 0){
            errorToast("Rejected Successfully...");
          }else if(status == 2){
            ShowToast("Approved Successfully...");
          }
          window.setTimeout( function() {
            window.location.reload();
          }, 2000);
         }else if(data.error){
          errorToast(data.error);
        }
        })
        .catch((error) => {
          console.log(JSON.stringify(error))
          errorToast("Something went wrong, please try again after sometime");
        })
        .finally((a) => {
          hideLoader();
        });
      }})
    }
   
  

  const ActionColumn=(id,fumigation_id,sap_pr_info,index)=>{
        return (
          <>
          <Button color="warning" type="Button" onClick={(e) => {ActionEntry(id)}}>View</Button>
          <Button color="primary" type="Button" className="ml-2" onClick={(e) => {FumigationPRApprove(id,fumigation_id,2,sap_pr_info,index)}}>Approve</Button>
          <Button color="danger" type="Button" className="ml-2" onClick={(e) => {FumigationPRApprove(id,fumigation_id,0,sap_pr_info,index)}}>Reject</Button>
          </>
        )
  }


  return ( 
    <Fragment>
     {/* <div style={{ border: "2px solid #7367f0 ", padding: "2px", borderRadius: "6px", marginTop: "1px" }}> */}
     <CardComponent  header="Fumigation PR Approval">
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
