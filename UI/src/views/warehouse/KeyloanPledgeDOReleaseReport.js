import React, { Fragment, TextField , useEffect, useState } from "react";
import Select from "react-select";
import { useFormik } from "formik";
import { validation, Yup } from "../forms/custom-form";
import { useHistory, useParams } from "react-router";
import { apiBaseUrl } from "../../urlConstants";
import { useLoader } from  "../../utility/hooks/useLoader";
import { addOption } from "../common/Utils"; 
import { apiPostMethod } from "../../helper/axiosHelper";
import { errorToast, ShowToast } from "../../helper/appHelper";
import { CancelSubmitButtons } from "../forms/custom-button"; 
import { CardComponent } from "../common/CardComponent";
import moment from "moment"; 
import { RefreshBlock } from "../common/RefreshBlock"; 
import { Card, FormGroup,Row, Col ,Button, Input, Label } from "reactstrap";
import { DatePicker } from "../forms/custom-datetime"; 
import { CustomDropdownInput, CustomTextInput } from "../forms/custom-form";
import { Link } from "react-router-dom";


export const _keylaoanPledgeDOReleaseReport = {
    warehouseid: "",
    warehousename: "",
    lotid: "",
    lotno: "",
    Wheat_Variety_Id: "",
    locationid: "",

  
  }
function KeyloanPledgeDOReleaseReport({form,onSubmit}) {
    const [WhPlantOptions, setWhPlantOptions] = useState([]);                                                                      
    const [WhLotOptions, setWhLotOptions] = useState([]);      
    const [WhWheatvarietyOptions, setWhWheetVarietyOptions] = useState([]);                                                               
    const [KeyloanDatas, setKeyloanDatas] = useState([]);
    //const [KeyloanReleaseDatas, setKeyloanReleaseDatas] = useState([]);
    console.log("test");
    const current = new Date();
    const date = `${current.getDate()}/${current.getMonth()+1}/${current.getFullYear()}`;
    const ExcelExport = (e)=>{
        // Select rows from table_id
        let table_id="KeyloanPledgeDORelease";
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

    const onWarehouseChange = (e) => {
      const { value, label } = e;
        FillPlantList(value, label); 
      };
    
      const FillPlantList = (WH_CODE, WH_NAME) => {
        let fdata = { WH_CODE: WH_CODE, screenType: "KEYLOAN" };
        apiPostMethod(apiBaseUrl+'warehouse/master/getWHplantList', fdata)
          .then((response) => {
            const { data } = response;
            if (data.success) {
              console.log("Plant") ;
              setWhPlantOptions([{ options: data.results }]);
              form.setValues({
                ...form.values,
                ColleratoralManager :  data.results[0].name_of_collateral,
                Company: data.results[0].company_name,
                WareHouse: {label: WH_NAME,value: WH_CODE},
              });
              console.log("After Fetch Plant"+data.results[0].name_of_collateral) ;
            }
          })
          .catch((error) => {
            errorToast("Something went wrong, please try again after sometime");
          });
      };
      const onPlantChange = (e) => {
        const { value, label } = e;
        form.setFieldValue('plantid', {  label: label,value: value });
        
        FillLotList(value);
      };
      const FillLotList = (paramPlantid) => {
        let fdata = { plantid: paramPlantid, screenType: "FUMIGATION" };
        apiPostMethod(apiBaseUrl+'warehouse/master/getWHLotList', fdata)
          .then((response) => {
            const { data } = response;
            if (data.success) {
              setWhLotOptions([{ options: data.results }]);
            }
          })
          .catch((error) => {
            errorToast("Something went wrong, please try again after sometime");
          });
      };
    
      const onLotChange = (e) => {
        const { value, label } = e;
        
        form.setFieldValue('LotNumber', {  label: label,value: value });
    
        
        FillWheatVarityList(value);
      };
    
      const FillWheatVarityList = (paramLotId) => {
        let fdata = { lotid: paramLotId, screenType: "FUMIGATION" };
        apiPostMethod(apiBaseUrl+'warehouse/master/getWHWheatvarityList', fdata)
          .then((response) => {
            const { data } = response;
            if (data.success) {
              setWhWheetVarietyOptions([{ options: data.results }]);
            }
          })
          .catch((error) => {
            errorToast("Something went wrong, please try again after sometime");
          });
      };
    
      
      const onWheatvarietyChange = (e) => {
        const { value, label } = e;
        
        form.setFieldValue('WheatVariety', {  label: label,value: value });
        
       
      };
      const onSRNoChange = (e) => {
        const { value, label } = e;
 
      };

      const FillKeyloanDet = () => {
          
        let fdata = { 
            WareHouse:form.values.WareHouse,
            date : form.values.date,
            plantid : form.values.plantid,
            LotNumber : form.values.LotNumber,
            WheatVariety : form.values.WheatVariety,
            SRNo : form.values.SRNo, formType: "KeyloanPledgeReport" };

        apiPostMethod(apiBaseUrl+'warehouse/keyloan.php', fdata)
          .then((response) => {
            const { data } = response;
            if (data.success) {
             
              setKeyloanDatas(data.results);
            }
          })
          .catch((error) => {
            errorToast("Something went wrong, please try again after sometime");
          });
      };

    const ShowReport = () => {
       
       // FillKeyloanDet();
    };

    return (
      <Fragment>
        <div class="p-1">
        <h5 class="text-primary">Keyloan Pledge Report</h5>
        <Row >
        <Col md="2" sm="12" >
          <CustomDropdownInput 
            url={`${apiBaseUrl}marketdata/master/getwarehouses`} 
            label={"Warehouse Name"} 
            onChange={onWarehouseChange} 
            form={form} 
            id="WareHouse" 
          />
        </Col>
        <Col md="2" sm="12">
          <CustomTextInput label={"Transaction Date"} form={form} id="date" type="date"  />
        </Col>
        <Col md="2" sm="12">
          <CustomDropdownInput
            style={{"width":"370px"}}
            options={WhPlantOptions}
            id={"plantid"}
            className="react-select"
            classNamePrefix="select"
            label={"Plant Name"}
            onChange={(e) => onPlantChange(e)}
          />
        </Col>
        <Col md="2" sm="12">
          <CustomDropdownInput
            options={WhLotOptions} form={form} id="LotNumber" 
            className="react-select"
            classNamePrefix="select"
            label={"Lot No"}
            onChange={(e) => onLotChange(e)}
          />
        </Col>
        <Col md="2" sm="12">   
          <CustomDropdownInput
            style={{"width":"170px"}}
            options={WhWheatvarietyOptions}
            id={"WheatVariety"}
            className="react-select"
            classNamePrefix="select"
            label={"Wheat Variety"}
            onChange={(e) => onWheatvarietyChange(e)}
          />   
        </Col>

        <Col md="2" sm="12">
          <CustomDropdownInput 
            label="" 
            url={`${apiBaseUrl}warehouse/master/getKeyloanSRNo`} 
            form={form} 
            id="SRNo" 
            onChange={onSRNoChange} 
          />
        </Col>   
      </Row>
    <div class="d-flex justify-content-end">
    <div class="p-1">
      <Button.Ripple color="primary"  type="Button" onChange={ShowReport}>Show</Button.Ripple>
    </div>
    <div class="p-1">
      <Button.Ripple color="primary"  type="Button" onClick={ExcelExport}>Excel Export</Button.Ripple>
    </div>
    </div>
    </div > 
    <div style={{minWidth:"98vw",overflow:"scroll",minHeight:"40vh",fontSize:"12px"}}>
    <table class="table-sm" id="KeyloanPledgeDORelease">
        <thead class="bg-primary text-white" style={{height:"50px",fontSize:"12px",textAlign:"center"}}>
            <tr>
                <th style={{minWidth:"120px"}}>System Date</th>
                <th style={{minWidth:"140px"}}>Warehouse Name</th>
                <th style={{minWidth:"140px"}}>Storage Location</th>
                <th style={{minWidth:"100px"}}>Lot No</th>
                <th style={{minWidth:"130px"}}>Wheat Variety</th>
                <th style={{minWidth:"110px"}}>SAP Qty</th>
                <th style={{minWidth:"110px"}}>SR No</th>
                <th style={{minWidth:"130px"}}>SR Qty in MTS</th>
                <th style={{minWidth:"130px"}}>SR Rate / MT</th> 
                <th style={{minWidth:"130px"}}>SR Value in Rs</th>
                <th style={{minWidth:"130px"}}>SR 90 % Value</th>
                <th style={{minWidth:"120px"}}>Company</th>
                <th style={{minWidth:"120px"}}>Bank Name</th>
                <th style={{minWidth:"170px"}}>Collateral Manager</th>
                <th style={{minWidth:"100px"}}>Loan No</th>
                <th style={{minWidth:"120px"}}>Loan Amount</th>
                <th style={{minWidth:"120px"}}>Loan Rate M/T</th>
                <th style={{minWidth:"120px"}}>Pledge Value</th>
                <th style={{minWidth:"120px"}}>Pledge Letter</th>
                <th style={{minWidth:"140px"}}>Transaction Type</th>
                <th style={{minWidth:"120px"}}>Loan Status</th>
            </tr>
        </thead>
        <tbody style={{textAlign:"center"}}>
        {/*KeyloanDatas &&
          KeyloanDatas.length>0 &&
          KeyloanDatas.map((item, i) => { 
              return (<tr>  
                <td>{item.SysDate}</td>  
                <td>{item.SRNo.value}</td>  
                <td>{item.WarehouseName}</td>  
                <td>{item.SRQty}</td>  
                <td>{item.LoanNo}</td>  
                <td>{item.LoanAmount}</td>  
                <td>{item.LoanRate}</td>  
              </tr>  )
             })*/}

        </tbody>
      </table> 
    </div>
    <hr></hr>
    <div class="p-1">
      <h5 class="text-primary">Keyloan DO Release Report</h5>
    </div> 
    
    <div style={{minWidth:"100vw",overflow:"scroll",minHeight:"40vh",fontSize:"12px"}}>
      <table class="table-sm">
        <thead class="bg-primary text-white"  style={{height:"50px",textAlign:"center",fontSize:"12px"}}>
          <tr>
            <th style={{minWidth:"200px",fontWeight:"500"}}>System Date</th>
            <th style={{minWidth:"200px",fontWeight:"500"}}>Warehouse Name</th>
            <th style={{minWidth:"200px",fontWeight:"500"}}>Storage Location</th>
            <th style={{minWidth:"200px",fontWeight:"500"}}>Lot No</th>
            <th style={{minWidth:"200px",fontWeight:"500"}}>Wheat Variety</th>
            <th style={{minWidth:"200px",fontWeight:"500"}}>SR No</th>
            <th style={{minWidth:"200px",fontWeight:"500"}}>SR Qty</th>
            <th style={{minWidth:"200px",fontWeight:"500"}}>Release Qty</th> 
            <th style={{minWidth:"200px",fontWeight:"500"}}>Balance Qty</th>
            <th style={{minWidth:"200px",fontWeight:"500"}}>SR Rate / MT</th>
            <th style={{minWidth:"200px",fontWeight:"500"}}>DO Value</th>
            <th style={{minWidth:"200px",fontWeight:"500"}}>DO 90% Value</th>
            <th style={{minWidth:"200px",fontWeight:"500"}}>Company</th>
            <th style={{minWidth:"200px",fontWeight:"500"}}>Bank Name</th>
            <th style={{minWidth:"200px",fontWeight:"500"}}>Collateral Manager</th>
            <th style={{minWidth:"200px",fontWeight:"500"}}>Release Letter</th>
            <th style={{minWidth:"200px",fontWeight:"500"}}>Bank Statement</th>
            <th style={{minWidth:"200px",fontWeight:"500"}}>Transaction Type</th>
            <th style={{minWidth:"200px",fontWeight:"500"}}>Loan Status</th>
          </tr>
        </thead>
        <tbody style={{textAlign:"center"}}>
        {/*KeyloanReleaseDatas &&
          KeyloanReleaseDatas.length>0 &&
          KeyloanReleaseDatas.map((item, i) => { 
              return (<tr>  
                <td>{item.SysDate}</td>  
                <td>{item.SRNo.value}</td>  
                <td>{item.WarehouseName}</td>  
                <td>{item.SRQty}</td>  
                <td>{item.LoanNo}</td>  
                <td>{item.LoanAmount}</td>  
                <td>{item.LoanRate}</td>  
              </tr>  )
             })
            */}

        </tbody>
    </table>
    </div>
         </Fragment>
    )
}

const KeyloanPledgeDOReleaseReportData = () =>{
    const form = useFormik({
        isInitialValid: false,
        initialValues: {},
        validationSchema: Yup.object().shape({
     
           warehousename: validation.required({ message:"Warehouse Name should not be empty", isObject: true }),
           locationid: validation.required({  message:"Storage Location should not be empty",isObject: true }),
           LotNo: validation.required({ message:"Lot No should not be empty", isObject: true }),
           WheetVariety: validation.required({  message:"Wheat Variety should be numeric value",isObject: true }),
        
           BagType: validation.required({  message:"Bag Type should not be empty",isObject: true }),
       
         }),
        onSubmit(values) {},
      });
      const onSubmit = () => {
          
    }
    return (
      <Fragment>
        <CardComponent  header="Keyloan Pledge &nbsp; DO Release Report">
          <KeyloanPledgeDOReleaseReport form={form}  onSubmit={onSubmit}/>
        </CardComponent>
      </Fragment>
    )
}
export default KeyloanPledgeDOReleaseReport