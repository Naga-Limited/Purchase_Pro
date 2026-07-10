import React, { Fragment, useState, useEffect } from 'react'
import { Col , FormGroup, Label,Button, ButtonToggle, CardBody } from 'reactstrap'
import Select from "react-select";
import Row from 'reactstrap/lib/Row'
import { apiBaseUrl, vaUrl } from '../../urlConstants'
import { CustomDropdownInput, CustomTextInput } from '../forms/custom-form'
import { DatePicker } from "../forms/custom-datetime"; 
import { useFormik } from "formik";
import { validation, Yup } from "../forms/custom-form";
import Table from 'reactstrap/lib/Table';
import { useHistory, useParams } from 'react-router-dom';
import { useLoader } from '../../utility/hooks/useLoader';
import { apiPostMethod } from '../../helper/axiosHelper';
import { JsonWebTokenError } from 'jsonwebtoken';
import { errorToast } from '../../helper/appHelper';
import { isObject, set } from 'lodash';
import { CardComponent } from "../common/CardComponent";
import moment from 'moment';
import { ShowToast } from "../../helper/appHelper";
import { object } from 'prop-types';
import { event } from 'jquery';
import Input from 'reactstrap/lib/Input';
import ButtonToolbar from 'reactstrap/lib/ButtonToolbar';
import { ToggleLeft } from 'react-feather';
import NavbarToggler from 'reactstrap/lib/NavbarToggler';
import TableComponent from "../common/TableComponent";
//import { ToggleLeft } from 'react-feather';


export const taColumns = [
  {
    name: "Warehouse Code",
    selector: "WH_CODE",
    sortable: true,
    minWidth: "200px",
    wrap: true,
  },
  {
    name: "Warehouse Name",
    selector: "WH_NAME",
    sortable: true,
    minWidth: "200px",
    wrap: true,
  },
  {
    name: "Used Days",
    selector: "UsedDays",
    sortable: true,
    minWidth: "200px",
    wrap: true,
  },

  {
    name: "Rent Per Sqft",
    selector: "rentpersqft",
    sortable: true,
    minWidth: "200px",
    wrap: true,
  },

  {
    name: "Total Sqft",
    selector: "totalcapacityinsqft",
    sortable: true,
    minWidth: "200px",
    wrap: true,
  },
 
  {
    name: "Total Rent Amt",
    selector: "RentPerMonth",
    sortable: true,
    minWidth: "200px",
    wrap: true,
  },
  {
    name: "Cost Centre",
    selector: "cost_centre",
    sortable: true,
    minWidth: "200px",
    wrap: true,
  },
  {
    name: "GL Account",
    selector: "gl_account",
    sortable: true,
    minWidth: "200px",
    wrap: true,
  },
];



 const WarehouseRentalCalculation = ({form, onSubmit}) => {
   const[WarehouseDatas , setWarehouseDatas] = useState([]);  

   const history = useHistory();

   let { showLoader, hideLoader } = useLoader(); 
   /*
   useEffect(() => {
     
     if(Physical_Stock_Id){
       onFetchStockentryById();

     }
   }, [Physical_Stock_Id]);
  */
  const RefreshPage = () => {
    history.push(`/master/PhysicalstockEntry`);
  };

const onRunRental = (e) => {
    let fdata = {Month:form.values.Month, screentype: "WHRentalCalculation"} 
    apiPostMethod(apiBaseUrl+'warehouse/warehouseEntry/getWarehouseRentaldet',fdata)
    .then((response) => { 

      const {data} = response;
      //const  value = value;
      if(data.success){ 
        console.log(  data.results[0].wh_refid +"  "+ data.results[0].WH_NAME);
          setWarehouseDatas(data.results); 
      }
    })
    .catch((error) => {
      errorToast("Something went wrong, please try again after sometime")
    }); 
  }

  const updateApprove = (e, wh_refid) => {
    if(WarehouseDatas.length<=0){
      errorToast("Something went wrong, Please Enter atleast one Entry");
      return false;

    }  
   
    let fdata = {
     wh_refid:wh_refid,
     formType:"WAREHOUSERENTAL",
     Month:form.values.Month,
    };
    /*
    postdate
    postremarks
  */
    showLoader();
      
        apiPostMethod(apiBaseUrl + "/warehouse/warehouseEntry/UpdateApproveRental", fdata)
        .then((response) => {
          if (response.data.success) {
            ShowToast("Successfully updated...");
            history.push(`/warehouse/WarehouseRentalCalculation`);
            // window.location.reload();
          }
        })
        .catch((error) => {
          errorToast("Something went wrong, please try again after sometime");
        }).finally((a) => {
          hideLoader();
        });
      
    
  }

  const actionsCol = {
    name: "Verification",
    selector: "rent_approve_status",
    minWidth: "200px",
    cell: (row) => {
      const showButton = (rent_approve_status, id) => {
        if(rent_approve_status==1){
          return (<Label>APPROVED</Label>)
        }else{
          return (
            <Button.Ripple color="primary" onClick={(e) => updateApprove(e, id)} type="Button">
              Approve
            </Button.Ripple>
          )
        }
    }
    return showButton(row.rent_approve_status, row.wh_refid);
  },
  };
  const columns = [...taColumns, actionsCol];
  const ExcelExport = (e)=>{
    // Select rows from table_id
    let table_id="WareHouseRental";
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
  const onPost=(e)=>{
    if(WarehouseDatas.length<=0){
      errorToast("Something went wrong, Please Enter atleast one Entry");
      return false;

    }  
   
    let fdata = {
     WarehouseDatas,
     formType:"WAREHOUSERENTALPOST",
     PostDate:form.values.PostDate,
     PostRemarks:form.values.PostRemarks,
     rentmonth:form.values.Month,
    };
    /*
    postdate
    postremarks 
  */
    showLoader();
      
        apiPostMethod(apiBaseUrl + "/warehouse/warehouseEntry/UpdateApproveRentalPostDet", fdata)
        .then((response) => {
          if (response.data.success) {
            ShowToast("Successfully updated...");
            history.push(`/warehouse/WarehouseRentalCalculation`);
            // window.location.reload();
          }
        })
        .catch((error) => {
          errorToast("Something went wrong, please try again after sometime");
        }).finally((a) => {
          hideLoader();
        });
  }
      return (
       <Fragment> 
           <Row>
               <Col md="3">
               <CustomTextInput label={"Month"} form={form} id="Month" type="month" />
               </Col>

          <Col sm="12">
          <FormGroup className="d-flex justify-content-end mb-0">
          <Button.Ripple color="primary"  type="Button" onClick={onRunRental}  >Run</Button.Ripple>
          &nbsp;&nbsp;&nbsp;
          {/* <Button.Ripple color="primary"  type="Button" onClick={ExcelExport}>Excel Download</Button.Ripple> */}
          </FormGroup>
          </Col>
           </Row>  
           <br></br>
           
           {/* <div className='mt-2' style={{overflow:"auto",minHeight:"40vh",fontSize:"12px"}} >
               <table className='table-sm' id='WareHouseRental' style={{minWidth:"98vw"}}>
                   <thead className="bg-primary text-white" style={{height:"50px",fontSize:"12px",textAlign:"center"}}>
                       <tr>
                           <th style={{minWidth:"150px",fontWeight:"500"}}>Warehouse Code</th> 
                           <th style={{minWidth:"150px",fontWeight:"500"}}>Warehouse Name</th> 
                           <th style={{minWidth:"150px",fontWeight:"500"}}>Used Days</th> 
                           <th style={{minWidth:"150px",fontWeight:"500"}}>Rent Per Sqft</th>
                           <th style={{minWidth:"150px",fontWeight:"500"}}>Total Sqft</th> 
                           <th style={{minWidth:"150px",fontWeight:"500"}}>Total Rent Amt</th> 
                           <th style={{minWidth:"150px",fontWeight:"500"}}>Cost Centre</th>
                           <th style={{minWidth:"150px",fontWeight:"500"}}>GL Account</th> 
                           <th style={{minWidth:"150px",fontWeight:"500"}}>Verification</th>
                       </tr>
                   </thead> 

                   <tbody style={{textAlign:"center"}}>
                      {WarehouseDatas && WarehouseDatas.length>0 && WarehouseDatas.map((item, i) => { 
                        const showButton = (rent_approve_status, id) => {
                          if(rent_approve_status==1){
                            return (<Label>APPROVED</Label>)
                          }else{
                            return (
                              <Button.Ripple color="primary" onClick={(e) => updateApprove(e, id)} type="Button">
                                Approve
                              </Button.Ripple>
                            )
                          }
                        };
              
                        return (
                          <tr>  
                            <td>{item.WH_CODE}</td>  
                            <td>{item.WH_NAME}</td>  
                            <td>{item.UsedDays}</td>                  
                            <td>{item.rentpersqft}</td>
                            <td>{item.totalcapacityinsqft}</td>                  
                            <td>{item.RentPerMonth}</td>  
                            <td>{item.cost_centre}</td>  
                            <td>{item.gl_account}</td>  
                            <td>{showButton(item.rent_approve_status, item.wh_refid)}</td>  
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div> */}
                <Row>
                  <Col sm="12">
                  <TableComponent showDownload columns={columns} data={WarehouseDatas} />
                  </Col>
                </Row>
                
                

                <Row className="mt-2">
                  <Col md="3" sm="12">
                    <DatePicker label={"Date"} form={form} id="PostDate" type="Date" />
                  </Col> 
                  <Col md="3" sm="12" className="mx-4">
                    <CustomTextInput label={"Entry Text"} form={form} id="PostRemarks" type="text" />
                  </Col> 

                  <Col sm="12"  >
                  <FormGroup className="d-flex justify-content-end mb-0">
                    <Button.Ripple color="primary" type="Button" onClick={(e)=>{onPost(e)}} className="mt-2">Post Entry</Button.Ripple>
                  </FormGroup>
                  </Col> 
                </Row>
              </Fragment>
            )
          } 
  
  
  
  const WarehouseRentalCalculationData = () => {
  
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
        warehousid:validation.required({ message:"Warehouse Name should not be empty", isObject:false }),
        locationid: validation.required({  message:"Storage Location should not be empty",isObject: true }),
        lotid: validation.required({ message:"Lot No should not be empty", isObject: true }),
        Physical_Stock_date: validation.required({  message:"Date should not be empty",isObject: true }),
        Maker: validation.required({  message:"Maker should not be empty",isObject: true }),
        Checker: validation.required({  message:"Checker should not be empty",isObject: true }),
        Wheat_Variety_Id: validation.required({ message:"wheat vareity should not be empty", isObject: true }),
        BagType: validation.required({ message:"BagType should not be empty", isObject: true }),
        NoOfBag: validation.required({ message:"No of bag should not be empty", isObject: true }),
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
        warehousid:stockEntryformData.warehousename.value,
        locationid:stockEntryformData.locationid,
        lotid:stockEntryformData.lotno.value,
        Maker:stockEntryformData.Maker, 
        Checker:stockEntryformData.Checker,
        Wheat_Variety:stockEntryformData.Wheat_Variety,
        BagType:stockEntryformData.bagtype,
  
      };
      console.log(" Physical stock Entry :: "+JSON.stringify(FrmData));
      const postdata = {
        id:stockEntryformData.F_ID,
        Data:FrmData
      }
      console.log("  Physical stock Entry  :: "+JSON.stringify(postdata));
      showLoader();
      console.log("  Physical stock Entry  :: "+apiBaseUrl + "Master", postdata);
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
        <CardComponent  header="Warehouse Rental Calculation">
       <WarehouseRentalCalculation form={form}  onSubmit={onSubmit}  />
     </CardComponent>
      </Fragment>
    )
  }
  
  
  export default WarehouseRentalCalculationData;
  
  