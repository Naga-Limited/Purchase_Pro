import React, { Fragment, useState, useEffect } from 'react'
import { apiBaseUrl, vaUrl } from '../../urlConstants'
import { useFormik } from "formik";
import { validation, Yup } from "../forms/custom-form";
import { useHistory, useParams } from 'react-router-dom';
import { useLoader } from '../../utility/hooks/useLoader';
import { apiPostMethod } from '../../helper/axiosHelper';
import { errorToast } from '../../helper/appHelper';
import { CardComponent } from "../common/CardComponent";
import moment from 'moment';
import { ShowToast } from "../../helper/appHelper";
import { date } from 'yup';
import Row from 'reactstrap/lib/Row'
import { Col,FormGroup, Label, Button } from 'reactstrap'
import TableComponent from "../common/TableComponent";

const loanReport = {  
    Company:"", InsDt: "", warehouseid: "",  Bank_Name: "", Wheat_Variety_Id: "", SR_Qty_in_MTS: "", 
    SR_Rate_Per_MT:"", Loan_Amount:"", SR_Value_in_Rs: "", Transaction_Type:"", SR_No:"", Loan_No: "", 
    Loan_Rate_MT:"", SR_90_Percent_Value: "", Loan_Status:"", BankInterest:"", wh_code:"",
}

export const taColumns = [
  {
    name: "Date",
    selector: "DATE",
    sortable: true,
    minWidth: "120px",
    wrap: false,
  },
  {
    name: "Col. Manager",
    selector: "Colleratoral_Manager",
    minWidth: "250px",
    wrap: true,
    sortable: true,
  },
  {
    name: "Company-Bank",
    selector: "Company",
    sortable: true,
    minWidth: "200px",
    wrap: true,
  },
  {
    name: "Wh-code",
    selector: "wh_code",
    sortable: true,
    minWidth: "130px",
    wrap: true,
  },
  {
     name: "Wh-Name",
    selector: "WH_NAME",
    sortable: true,
    minWidth: "20rem",
    wrap: true,
  },
  {
    name: "Variety",
    selector: "WheatVariety",
    sortable: true,
    minWidth: "25rem",
    wrap: true,
  },
  {
    name: "Meterial Code",
    selector: "MaterialCode",
    sortable: true,
    minWidth: "70px",
    wrap: true,
  },
  {
    name: "Plant",
    selector: "PLANT_NAME",
    sortable: true,
    minWidth: "20rem",
    wrap: true,
  },
  {
    name: "Storage location",
    selector: "STORAGE_LOCATION",
    sortable: true,
    minWidth: "15rem",
    wrap: true,
  },
  {
    name: "Qty in MT",
    selector: "SR_Qty_in_MTS",
    sortable: true,
    minWidth: "70px",
    wrap: true,
  },
  {
    name: "Inv Rate/MT",
    selector: "SR_Rate_Per_MT",
    sortable: true,
    minWidth: "70px",
    wrap: true,
  },
  {
    name: "Amount (Rs.)",
    selector: "SR_Value_in_Rs",
    sortable: true,
    minWidth: "70px",
    wrap: true,
  },
  {
    name: "Txn. Type",
    selector: "TYPE",
    sortable: true,
    minWidth: "70px",
    wrap: true,
  },
  {
    name: "SR No",
    selector: "SR_No",
    sortable: true,
    minWidth: "200px",
    wrap: true,
  },
  {
    name: "Loan No",
    selector: "Loan_No",
    sortable: true,
    minWidth: "15rem",
    wrap: true,
  },
  {
    name: "NBHC Rate/MT",
    selector: "",
    sortable: true,
    minWidth: "70px",
    wrap: true,
  },
  {
    name: "NBHC Value(Rs.)",
    selector: "",
    sortable: true,
    minWidth: "70px",
    wrap: true,
  },
  {
    name: "90% Value(Rs.)",
    selector: "SR_90_Percent_Value",
    sortable: true,
    minWidth: "150px",
    wrap: true,
  },
  {
    name: "Loan Status",
    selector: "LoanStatus",
    sortable: true,
    minWidth: "70px",
    wrap: true,
  },
  {
    name: "Bank Name",
    selector: "pledge_bank_name",
    sortable: true,
    minWidth: "15rem",
    wrap: true,
  },
  {
    name: "ROI%",
    selector: "BankInterest",
    sortable: true,
    minWidth: "70px",
    wrap: true,
  },


];  

const KeyloanReport = ({form,onSubmit}) => { 
    const [KeyloanReports , setKeyloanReports] = useState({ ...loanReport });  
    const { Company,InsDt,warehouseid,BankInterest,wh_code,Bank_Name,Wheat_Variety_Id,SR_Qty_in_MTS,SR_Rate_Per_MT,Loan_Amount,SR_Value_in_Rs,Transaction_Type,SR_No,Loan_No,Loan_Rate_MT,SR_90_Percent_Value,Loan_Status} = KeyloanReports;
    const history = useHistory();
    let { id } = useParams();
    let refid='';
        if( id) {
       refid = id.replace(":", "");
    }
    let { showLoader, hideLoader } = useLoader(); 
    useEffect(() => {
        onFetchKeyloanRepoortById();
    }, [id]);

    const onFetchKeyloanRepoortById = () => {
      let Data=form.values;
      let fdata = {
      Screen:"REPORT",
      Data
      };

    showLoader();
   // console.log("Request Url :: "+apiBaseUrl + "warehouse/getbagcuttingEntrydatabyid", fdata);
     apiPostMethod(apiBaseUrl + "warehouse/keyloan/getkeyloanReportlist", fdata)
     .then((response) => {
       const { data } = response;
       console.log("Response Data :: "+JSON.stringify(response));
       if (data.success) {
         form.setValues({
           
          ...form.values,
        CheckList:data.results,
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
   
    const RefreshPage = () => {
      history.push(`/master`);
    };

    const ExcelExport = (e)=>{
      // Select rows from table_id
      let table_id="TableID";
      let separator = ','
      var rows = document.querySelectorAll('table#' + table_id + ' tr');
      // Construct csv
      var csv = [];
      for (var i = 0; i < rows.length; i++) {
          var row = [], cols = rows[i].querySelectorAll('td, th');
          for (var j = 0; j < cols.length; j++) {
              // Clean innertext to remove multiple spaces and jumpline (break csv)
              var data = cols[j].innerText.replace(/(\r\n|\n|\r)/gm, '').replace(/(\s\s)/gm, ' ')
              // Escape double-quote with double-double-quote (see https://stackoverflow.com/questions/17808511/properly-escape-a-double-quote-in-csv)
              data = data.replace(/"/g, '""');
              // Push escaped string
              row.push('"' + data + '"');
          }
          csv.push(row.join(separator));
      }
      var csv_string = csv.join('\n');
      // Download it
      var filename = 'export_' + table_id + '_' + new Date().toLocaleDateString() + '.csv';
      var link = document.createElement('a');
      link.style.display = 'none';
      link.setAttribute('target', '_blank');
      link.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv_string));
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }

 
  return (
    <Fragment> 
      <Row>
        <Col sm="12"> 
          <FormGroup className="d-flex justify-content-end mb-0">
            {/* <Button.Ripple onClick={ExcelExport} color="primary" type="Button">Excel Export</Button.Ripple> */}
          </FormGroup>
        </Col>
      </Row>
      <br></br><br></br>
      <Row>
        <Col>
          <TableComponent showDownload columns={taColumns} data={form.values.CheckList}/>  
        </Col>
      </Row>

      {/*
      
      <div style={{Width:"970px",minHeight:"60vh",fontSize:"12px",overflowX:"auto"}} >
        <table className='table-sm' id="TableID"> 
          <thead className='bg-primary text-white ' style={{height:"50px",fontSize:"12px",textAlign:"center"}}> 
            <tr>
            <th style={{minWidth:"13rem",fontWeight:"400"}}>Date</th> 
            <th style={{minWidth:"13rem",fontWeight:"400"}}>Colleratoral Manager</th> 
            <th style={{minWidth:"13rem",fontWeight:"400"}}>Company-Bank</th>
            <th style={{minWidth:"13rem",fontWeight:"400"}}>Warehouse code</th>
            <th style={{minWidth:"13rem",fontWeight:"400"}}>Warehouse</th>
            <th style={{minWidth:"13rem",fontWeight:"400"}}>Variety</th>
            <th style={{minWidth:"13rem",fontWeight:"400"}}>Meterial No</th>
            <th style={{minWidth:"13rem",fontWeight:"400"}}>Plant</th>
            <th style={{minWidth:"13rem",fontWeight:"400"}}>Storage location</th>
            <th style={{minWidth:"13rem",fontWeight:"400"}}>Qty in MT</th>
            <th style={{minWidth:"13rem",fontWeight:"400"}}>Inv Rate/MT</th> 
            <th style={{minWidth:"13rem",fontWeight:"400"}}>Amount in Rs</th> 
            <th style={{minWidth:"13rem",fontWeight:"400"}}>Transaction Type </th> 
            <th style={{minWidth:"13rem",fontWeight:"400"}}>SR No</th> 
            <th style={{minWidth:"13rem",fontWeight:"400"}}>Loan No</th>
            <th style={{minWidth:"13rem",fontWeight:"400"}}>NBHC Rate/MT</th> 
            <th style={{minWidth:"13rem",fontWeight:"400"}}>NBHC Value in Rs</th>  
            <th style={{minWidth:"13rem",fontWeight:"400"}}>90% Value in Rs</th> 
            <th style={{minWidth:"13rem",fontWeight:"400"}}>Loan Status</th> 
            <th style={{minWidth:"13rem",fontWeight:"400"}}>Bank Name</th>
            <th style={{minWidth:"13rem",fontWeight:"400"}}>ROI%</th>
            </tr>
          </thead> 
          <tbody style={{textAlign:"center"}}>
            {form.values.CheckList && form.values.CheckList.map((row, index) => ( 
            <tr>
              <td>{row.DATE}</td> 
              <td>{row.Colleratoral_Manager}</td>
              <td>{row.Company}</td>
              <td>{row.wh_code}</td>
              <td>{row.WH_NAME}</td>
              <td>{row.WheatVariety}</td>
              <td>{row.MaterialCode}</td> {/*Meterial Code* /}
              <td>{row.PLANT_NAME}</td> {/*Plant* /}
              <td>{row.STORAGE_LOCATION}</td> {/*Storage Location* /}
              <td>{row.SR_Qty_in_MTS}</td>
              <td>{row.SR_Rate_Per_MT}</td>
              <td>{row.SR_Value_in_Rs}</td> 
              <td>{row.TYPE}</td>
              <td>{row.SR_No}</td> 
              <td>{row.Loan_No}</td>
              <td></td> {/*NBHC Rate/Mt* /}
              <td></td> {/*NBHC Value* /}
              <td>{row.SR_90_Percent_Value}</td> 
              <td>{row.LoanStatus}</td> 
              <td>{row.pledge_bank_name}</td> 
              <td>{row.BankInterest} " %"</td>
            </tr>
            ))}  
        </tbody>
      </table> 
    </div>
            */}
  </Fragment>
 
  )
}

const KeyloanReportData = () => { 
  const history = useHistory();
  const {showLoader , hideLoader} = useLoader(); 
  const dateFormat = "YYYY-MM-DD";
  const today = moment().format(dateFormat);
  const isToday = (data) => {
    return moment(data).format(dateFormat) == today;
  };
  const form = useFormik({
    isInitialValid: false,
    initialValues: {},
    validationSchema: Yup.object().shape({
     
     }),
    onSubmit(values) {},
  }); 
  const Values = form.values;
  const onSubmit = () => { 
    if(!form.isValid)
    {
      form.setSubmitting(true);
      form.validateForm();
      return;
    }
    let stockEntryformData = form.values;
    const FrmData = { 
      // warehousid:stockEntryformData.warehousename.value,
      // locationid:stockEntryformData.locationid,
      // lotid:stockEntryformData.lotno.value,
      // Maker:stockEntryformData.Maker, 
      // Checker:stockEntryformData.Checker,
      // Wheat_Variety:stockEntryformData.Wheat_Variety,
      // BagType:stockEntryformData.bagtype,

    };
    console.log("  :: "+JSON.stringify(FrmData));
    const postdata = {
      id:stockEntryformData.F_ID,
      Data:FrmData
    }
    console.log("    :: "+JSON.stringify(postdata));
    showLoader();
    console.log("    :: "+apiBaseUrl + "Master", postdata);
    apiPostMethod(apiBaseUrl + "Master", postdata)
      .then((response) => {
        const { data } = response;
        console.log(" Response Data ::: "+JSON.stringify(response));
        
        let RespId=data.success;
        if(RespId && RespId>=1)
        {
          ShowToast("Saved Successfully...");
 
          if(document.getElementById("F_ID").value=="")
          {
            history.push("/warehouse");
          }
          else
          {
            history.push("/warehouse");
          }
        }
        else
        {
          if(data.ErrorMsg)
          {
            errorToast(data.ErrorMsg);
          }
          else
          {
            errorToast("Unable to update record");
          } 
        }      
      })
      .catch((error) => {
        console.log(" Error Data ::: "+JSON.stringify(error));
        errorToast("Something went wrong, please try again after sometime");
      })
      .finally((a) => {
        hideLoader();
      });


  }
  return (
    <Fragment>
      <CardComponent  header="Keyloan Report">
        <KeyloanReport form={form}  onSubmit={onSubmit}  />
      </CardComponent>
    </Fragment>
  )
}

export default KeyloanReportData
