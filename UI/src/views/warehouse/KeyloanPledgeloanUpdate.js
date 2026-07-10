import React, { Fragment, TextField , useEffect, useState } from "react";
import Select from "react-select";
import { useFormik } from "formik";
import { validation, Yup } from "../forms/custom-form";
import { useHistory, useParams } from "react-router";
import { apiBaseUrl } from "../../urlConstants";
import { Paperclip, X, Plus, AlertTriangle } from "react-feather";
import { useLoader } from  "../../utility/hooks/useLoader";
import { addOption } from "../common/Utils"; 
import { apiPostMethod } from "../../helper/axiosHelper";
import { errorToast, ShowToast } from "../../helper/appHelper";
import { CancelSubmitButtons } from "../forms/custom-button"; 
import { CardComponent } from "../common/CardComponent";
import {  keyLoanEntryUrl } from "../../urlConstants";
import moment from "moment"; 
import { RefreshBlock } from "../common/RefreshBlock"; 
import { Card, FormGroup,Row, Col ,Button, Input, Label } from "reactstrap";
import { DatePicker } from "../forms/custom-datetime"; 
import { CustomDropdownInput, CustomTextInput } from "../forms/custom-form";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";

const KeyloanPledgeloanUpdate = ({form,onSubmit}) => {
   
      const current = new Date();
      const history = useHistory();
      const [KeyloanDatas, setKeyloanDatas] = useState([]);
      const date = `${current.getDate()}/${current.getMonth()+1}/${current.getFullYear()}`;
      let { showLoader, hideLoader } = useLoader();
      const isFilledAll = () => {
        showError('SystmDate_Error','Enter SystmDate',0);
showError('WarehouseName_Error','Enter WarehouseName',0);
showError('SRQty_Error','Enter SRQty',0);
showError('LoanNo_Error','Enter LoanNo',0);
showError('LoanAmount_Error','Enter LoanAmount',0);
showError('LoanRate_Error','Enter LoanRate',0);
showError('SRNO_Error','Select SRNO',0);

        let ShowError=0;
        let formData=form.values;
        //if(!formData.SysDate) { showError('SystmDate_Error','Enter Date',1);  ShowError =1; }
if(!formData.WarehouseName) { showError('WarehouseName_Error','Enter Ware House',1);  ShowError =1; }
if(!formData.SRQty) { showError('SRQty_Error','Enter Storage Location',1);  ShowError =1; }
if(!formData.LoanNo) { showError('LoanNo_Error','Enter Loan Number',1);  ShowError =1; }
if(!formData.LoanAmount) { showError('LoanAmount_Error','Enter Wheat Variety',1);  ShowError =1; }
//if(!formData.LoanRate) { showError('LoanRate_Error','Enter SAP Qty',1);  ShowError =1; }
if(!formData.SRNo || !formData.SRNo.value) { showError('SRNO_Error','Select SR NO',1); ShowError =1; }
if(ShowError==1){return true;}
      }
      const showError = (Id,Msg,show) => {
        if(document.getElementById(Id)) { 
          document.getElementById(Id).innerHTML="";
        if(show==1){
          console.log("SHOW ERROR:"+Id);
        document.getElementById(Id).innerHTML=Msg;
        }
      }
      }
      const onAdd = () => {
        if(isFilledAll()){
          return false;
        }

        let vd = [];
        vd = [...KeyloanDatas];
        vd.push(form.values);
        setKeyloanDatas(vd);
        
        console.log(JSON.stringify(KeyloanDatas));
        console.log(JSON.stringify(KeyloanDatas.length));
        console.log(JSON.stringify(form.values));
        form.setValues({
          SysDate:"",
           WarehouseName:"",
           SRQty:"",
           BankInterest:"",
           LoanNo:"",
           LoanAmount:"",
           LoanRate:"",
           
          
         })
         form.setFieldValue('SRNo', {  label: "",value: "" });
       
      };
      const deleteForm = (index) => {
        let vdata = [...KeyloanDatas];
        vdata.splice(index, 1);
        setKeyloanDatas(vdata);
        
      };
      const CalcLoanRate = (e) =>{
       // console.log(e.target.value);
        if(isNaN(e.target.value)){return false; }
        let LoanRateCalc=e.target.value*form.values.SRQty;
        form.setValues({
          ...form.values,
          LoanAmount:e.target.value,
          LoanRate:LoanRateCalc
        })
        //console.log(JSON.stringify(form.values));
      }

      
      const updateKeyLoan = () => {
        if(KeyloanDatas.length<=0){
          errorToast("Something went wrong, Please Enter atleast one Entry");
          return false;
        }
       
        let fdata = {
          KeyloanDatas,
          formType:"keyloanUpdate" 
        };
        
        showLoader();  
          apiPostMethod(keyLoanEntryUrl, fdata)
            .then((response) => {
              if (response.data.success) {
                ShowToast("Successfully updated...");
                history.push(`/warehouse/KeyloanPledgeloanUpdate`);
                // window.location.reload();
                setTimeout(() => window.location.reload(), 2000);
              }
            })
            .catch((error) => {
              errorToast("Something went wrong, please try again after sometime");
            }).finally((a) => {
              hideLoader();
            });
          
        
      }
      const onSRNoChange = (e) => {
        const { value, label } = e;
        
       
        //setFormData({ ...formData, WH_CODE: value, WH_Name:label });
        
        FillKeyloanDet(value); 
      };
      const FillKeyloanDet = (SRNo) => {
        let fdata = { SRNo: SRNo, screenType: "KeyloanUpdate" };
        
        for(let i=0;i<KeyloanDatas.length;i++){
          if(KeyloanDatas[i].SRNo.value==SRNo){
            errorToast("SR No Already Added");
            return false;
          }
          
        }

        apiPostMethod(apiBaseUrl+'warehouse/master/getKeyLoanDet', fdata)
          .then((response) => {
            const { data } = response;
            if (data.success) {
              form.setValues({
               SysDate:date,
                WarehouseName:data.results[0].warehouseName,
                SRQty:data.results[0].SR_Qty_in_MTS,
                BankInterest:data.results[0].BankInterest,
               // LoanNo:data.results[0].Loan_No,
               // LoanAmount:data.results[0].Loan_Amount,
               // LoanRate:data.results[0].Loan_Rate_MT,
                
               
              })
              form.setFieldValue('SRNo', {  label: SRNo,value: SRNo });
            }
          })
          .catch((error) => {
            errorToast("Something went wrong, please try again after sometime");
          });
      };

    return (
       <Fragment> 
        
        <div style={{Width:"970px",minHeight:"40vh",fontSize:"12px",overflowX:"auto"}} > 
           <table class="table-sm" >
                   <thead class="bg-primary text-white" style={{height:"50px",fontWeight:"lighter",fontSize:"12px",textAlign:"center",fontFamily:"Montserrat,Helvetica,Arial,serif"}} >
               <tr>
                       <th style={{minWidth:"150px",fontWeight:"500"}}>System Date</th>
                       <th style={{minWidth:"150px",fontWeight:"500"}}>SR No</th>
                       <th style={{minWidth:"150px",fontWeight:"500"}}>Warehouse Name</th>
                       <th style={{minWidth:"150px",fontWeight:"500"}}>SR Qty</th>
                       <th style={{minWidth:"150px",fontWeight:"500"}}>Bank Interest</th>
                       <th style={{minWidth:"150px",fontWeight:"500"}}>Loan No</th>
                       <th style={{minWidth:"150px",fontWeight:"500"}}>Loan Amount</th>
                       <th style={{minWidth:"150px",fontWeight:"500"}}>Loan Rate</th>
                       <th style={{minWidth:"150px",fontWeight:"500"}}>Add</th>
                       </tr>
                   </thead>
                   <tbody>
                       <tr>
                      
                           <td><CustomTextInput  form={form} id="SystmDate" type="text"  placeholder={date} disabled/><span id='SystmDate_Error' style={{color: 'red'}} ></span></td>
                           
                           <td style={{width:"200px",paddingTop:"5px"}}> 
                           <CustomDropdownInput label="" url={`${apiBaseUrl}warehouse/master/getKeyloanSRNo`} 
                              form={form} id="SRNo"  onChange={onSRNoChange} />
                              <span id='SRNO_Error' style={{color: 'red'}} ></span>
                            </td>
                           
                           <td> <CustomTextInput  form={form} placeholder={""} id="WarehouseName" type="text" disabled/><span id='WarehouseName_Error' style={{color: 'red'}} ></span></td>
                           <td><CustomTextInput  form={form} placeholder={""} id="SRQty" type="text" disabled/> <span id='SRQty_Error' style={{color: 'red'}} ></span></td>
                           <td><CustomTextInput  form={form} placeholder={""} id="BankInterest" type="text" disabled/> <span id='BankInterest_Error' style={{color: 'red'}} ></span></td>
                           <td><CustomTextInput  form={form} placeholder={""} id="LoanNo" type="text"/><span id='LoanNo_Error' style={{color: 'red'}} ></span></td>
                           <td><CustomTextInput  form={form} placeholder={""} id="LoanAmount" type="text"  onChange={(e) => CalcLoanRate(e)}/> <span id='LoanAmount_Error' style={{color: 'red'}} ></span></td>
                           <td><CustomTextInput  form={form} placeholder={""} id="LoanRate" type="text" disabled /> <span id='LoanRate_Error' style={{color: 'red'}} ></span></td>
                           <td style={{paddingBottom:"17px",paddingLeft:"45px"}}><Button.Ripple color="primary"   type="Button" onClick={onAdd} >Add</Button.Ripple></td>
                          
                       </tr>
                       {KeyloanDatas &&
          KeyloanDatas.length>0 &&
          KeyloanDatas.map((item, i) => { 
              return (<tr>  
                <td>{item.SysDate}</td>  
                <td>{item.SRNo.value}</td>  
                <td>{item.WarehouseName}</td>  
                <td>{item.SRQty}</td>  
                <td>{item.BankInterest}</td>  
                <td>{item.LoanNo}</td>  
                <td>{item.LoanAmount}</td>  
                <td>{item.LoanRate}</td>  
                <td><Button.Ripple
                      color="danger"
                      className="text-nowrap px-1 mt-75"
                      onClick={(e) => {
                        deleteForm(i);
                      }}
                      outline
                    >
                      <X size={14} className="" />
                      <span></span>
                    </Button.Ripple></td>
              
              </tr>  )
             })}
                   </tbody>
         
           </table>
           </div>
           <br></br><br></br>
           <Col sm="12">
           <FormGroup className="d-flex justify-content-end mb-0">
         <Button.Ripple color="primary"  type="Button" onClick={(e) => updateKeyLoan()} >Submit</Button.Ripple>
         &nbsp;&nbsp;&nbsp;
          <Button.Ripple color="primary"   type="Button" >Cancel</Button.Ripple>
          </FormGroup>
          </Col>
       </Fragment>
       
    )
}


const KeyloanPledgeloanUpdateDate = () => {
    const form = useFormik({
        isInitialValid: false,
        initialValues: {},
        validationSchema: Yup.object().shape({
     
           Wh_Name: validation.required({ message:"Warehouse Name should not be empty", isObject: true }),
           SLocation: validation.required({  message:"Storage Location should not be empty",isObject: true }),
           LotNo: validation.required({ message:"Lot No should not be empty", isObject: true }),
           WheetVariety: validation.required({  message:"Wheat Variety should be numeric value",isObject: true }),
           SIMTS: validation.required({ message:"Stock in MTS should not be empty", isObject: false }),
           BagType: validation.required({  message:"Bag Type should not be empty",isObject: true }),
           LFO: validation.required({ message:"Last Fumigated on should not be empty", isObject: false }),
           LeadDays: validation.required({  message:"Lead Days should be numeric value",isObject: false }),
           LDO: validation.required({ message:"Last Degassed on should not be empty", isObject: false }),
           LFT: validation.required({  message:"Last Fumigation Type should not be empty",isObject: false }),
           FS: validation.required({ message:"Fumigation Status should not be empty", isObject: true }),
           RFD: validation.required({  message:"Reason for Delay should be numeric value",isObject: true }),
           FT: validation.required({ message:"Fumigation Type should not be empty", isObject: true }),
          
         
        
         }),
        onSubmit(values) {},
      });
      const onSubmit = () => {
        
      }
    return (
        <Fragment>
    
      <CardComponent  header="Keyloan Pledge Loan Updation Screen">
     
       <KeyloanPledgeloanUpdate form={form}  onSubmit={onSubmit}  />
     </CardComponent>
   </Fragment>
    )
}

export default KeyloanPledgeloanUpdateDate
