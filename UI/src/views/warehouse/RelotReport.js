import React, { Fragment, useState, useEffect } from 'react'
import { apiBaseUrl, vaUrl } from '../../urlConstants'
import { useFormik } from "formik";
import TableComponent from "../common/TableComponent";
import { CustomDropdownInput, validation, Yup, CustomTextInput } from "../forms/custom-form";
import { useHistory, useParams } from 'react-router-dom';
import { useLoader } from '../../utility/hooks/useLoader';
import { apiPostMethod } from '../../helper/axiosHelper';
import { errorToast } from '../../helper/appHelper';
import { CardComponent } from "../common/CardComponent";
import moment from 'moment';
import { ShowToast } from "../../helper/appHelper";
import { date } from 'yup';
import { Col,Row, FormGroup, Label,Button, ButtonToggle } from 'reactstrap'
import { DatePicker } from '../forms/custom-datetime';


//Added By MS.Karthick on 05-05-2022

export const taColumns = [
  {
    name: "Date",
    selector: "Dt",  //"RelotDate",
    sortable: true,
    minWidth: "8rem",
    wrap: true,
  },
  {
    name: "Godown Name",
    selector: "from_warehouse",
    minWidth: "25rem",
    wrap: true,
    sortable: true,
  },
  {
    name: "Plant",
    selector: "from_plantname",
    sortable: true,
    minWidth: "13rem",
    wrap: true,
  },

  {
    name: "Storage Location",
    selector: "FROM_LGORT",
    sortable: true,
    minWidth: "13rem",
    wrap: true,
  },
  {
     name: "From Lot",
    selector: "fromlotno",
    sortable: true,
    minWidth: "13rem",
    wrap: true,
  },
  {
    name: "Wheat Variety",
    selector: "WheatVariety",
    sortable: true,
    minWidth: "25rem",
    wrap: true,
  },
  {
    name: "Material Code",
    selector: "MaterialCode",
    sortable: true,
    minWidth: "10rem",
    wrap: true,
  },
  {
    name: "To Lot",
    selector: "tolotno",
    sortable: true,
    minWidth: "13rem",
    wrap: true,
  },
  {
    name: "Bag Type 1",
    selector: "BAG_NAME",
    sortable: true,
    minWidth: "20rem",
    wrap: true,
  },
  {
    name: "No of Bags 1",
    selector: "NoOfBags",
    sortable: true,
    minWidth: "13rem",
    wrap: true,
  },
  {
    name: "Bag Type 2",
    selector: "BAG_NAME2",
    sortable: true,
    minWidth: "20rem",
    wrap: true,
  },
  {
    name: "No of Bags 2",
    selector: "NoOfBags2",
    sortable: true,
    minWidth: "13rem",
    wrap: true,
  },
  {
    name: "Bag Type 3",
    selector: "BAG_NAME3",
    sortable: true,
    minWidth: "20rem",
    wrap: true,
  },
  {
    name: "No of Bags 3",
    selector: "NoOfBags3",
    sortable: true,
    minWidth: "13rem",
    wrap: true,
  },
  {
    name: "Qty in MTS",
    selector: "BeforeFromLotQty",
    sortable: true,
    minWidth: "13rem",
    wrap: true,
  },
  {
    name: "Relotting Qty",
    selector: "QtyinMTS",
    sortable: true,
    minWidth: "13rem",
    wrap: true,
  },
  {
    name: "Relotting Vendor",
    selector: "VendorName",
    sortable: true,
    minWidth: "30rem",
    wrap: true,
  },
  {
    name: "Relotting Charges",
    selector: "RelottingCharges",
    sortable: true,
    minWidth: "13rem",
    wrap: true,
  },
];  

const RelotReport = ({form,onSubmit}) => { 
  const [WhPlantOptions, setWhPlantOptions] = useState([]);
  const [WhLotOptions, setWhLotOptions] = useState([]);
  
    const history = useHistory();
    let { id } = useParams();
    let refid='';
        if( id) {
       refid = id.replace(":", "");
    }
    let { showLoader, hideLoader } = useLoader(); 
    useEffect(() => {
        onFetchRelotReportById();
    }, [id]);

    const onFetchRelotReportById = () => {
      //let Data=form.values;
      let fdata = {
      Screen:"REPORT",
      //Data
      };

    showLoader();

     apiPostMethod(apiBaseUrl + "warehouse/relot/getRelotReportlist", fdata)
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
   

 const onWarehouseChange = (e) => {
  const {value, label} = e; 
  //setStockEntryfromData({ ...stockEntryformData, warehouseid:value, warehousename:label}); //ms
  FillPlantList(value,label);
  ClearDropdown("WH");
}

console.log("S2");
const FillPlantList  = (warehouseid, whname) => {
let fdata = {WH_CODE:warehouseid, screentype:"warehouseQCTeamEntry"}
apiPostMethod(apiBaseUrl+'warehouse/master/getWHplantList',fdata)
.then((response) => {
 const { data } = response; 
 if(data.success) {
   setWhPlantOptions([{options:data.results}]);
   form.setFieldValue("warehouseid",{value:warehouseid, label:whname})
 }
})
.catch((error) => {
 errorToast("Something went wrong, please try again after sometime");
});
};
console.log("S83");
const onPlantChange = (e) => {
const {value,label} = e; 
//setStockEntryfromData({ ...stockEntryformData, locationid:value , slocation:label})  //ms
FillLotList(value, label)
ClearDropdown("PLANT");

}
console.log("S90");
const FillLotList = (plantid,plantname) => {
let fdata ={plantid:plantid, screentype: "RelotReport"} 
apiPostMethod(apiBaseUrl+'warehouse/master/getWHLotList',fdata) 
.then((response) => {
 const { data } =response; 
 if(data.success) {
   setWhLotOptions([{options:data.results}]);
   form.setFieldValue("plantid",{label:plantname,value:plantid});
 }
})
.catch((error) => {
 errorToast("Something went wrong please try again after sometime");
});
};
const onLotChange = (e,type) => {
  const { value, label } = e;
    form.setFieldValue("lotid", {  label: label,value: value });
    ClearDropdown("LOT");
};

//Added by MS.Karthick om 09-05-2022

const ClearDropdown = (Item) => {
  if (Item === "WH"){
    form.setFieldValue('plantid', '');
    form.setFieldValue('lotid','');
  }else if (Item === "PLANT"){
    form.setFieldValue('lotid','');
  }
}


const getRelotReportlist = () => {
   let Data={
    warehouseid:form.values.warehouseid,
    plantid:form.values.plantid,
    lotid:form.values.lotid,
    fromdate:form.values.FromDate,
    todate:form.values.ToDate,
  }
  console.log("S117");
    let fdata = {
      Data,
     formType:"getRelotReport"
    };

      showLoader();
        apiPostMethod(apiBaseUrl + "warehouse/relot/getRelotReportlist", fdata)
        .then((response) => {
          if (response.data.success) {
           // ShowToast("Successfully updated...");
           // history.push(`/warehouse/KeyloanPledgeloanUpdate`);
           // window.location.reload();
           
           form.setValues({
            ...form.values,
          CheckList:response.data.results,
           });
  

           console.log(JSON.stringify(response.data.results));
          // console.log(JSON.stringify(stockEntryformData))
          }
        })
        .catch((error) => {
          errorToast("Something went wrong, please try again after sometime");
        }).finally((a) => {
          hideLoader();
        });
      
    
  }
  console.log("S149");
    return (
      <>
        <Fragment>

        <Row > 
        <Col md="3" sm="12" >
        <CustomDropdownInput  url={`${apiBaseUrl}marketdata/master/getwarehouses`} 
           label={"Warehouse Name"}  form={form} id="warehouseid" 
           onChange = {onWarehouseChange}   
           />
      <span id='warehouseid_Error' style={{color: 'red'}} ></span>
          </Col>

          <Col md="3" sm="12"> 
           <CustomDropdownInput style={{"width":"370px"}}
              form={form}
              options={WhPlantOptions}
              id={"plantid"}
              label={"Plant"}
              className="react-select"
              classNamePrefix="select"
              onChange={(e) => onPlantChange(e)}
            />
             <span id='plantid_Error' style={{color: 'red'}} ></span>
            </Col>

            <Col md="3" sm="12"> 
            <CustomDropdownInput  
           label={"Lot No"}
           form={form} id="lotid"   
           className="react-select"
              classNamePrefix="select"
            options= {WhLotOptions}
           onChange={onLotChange} 
           />
            <span id='lotid_Error' style={{color: 'red'}} ></span>
           </Col>
           </Row>

           <Row>
           <Col md="3" sm="12">
             <DatePicker label={"From Date"} form={form} id="FromDate" type="date"  />
             </Col>
             <Col md="3" sm="12">
             <DatePicker label={"To Date"} form={form} id="ToDate" type="date"  />
             </Col>
     

          <Col sm="12"> 
          <FormGroup className="d-flex justify-content-end mb-0">
           <Button.Ripple onClick={getRelotReportlist}  color="primary"  type="Button"  >
          Show
          </Button.Ripple>
          </FormGroup>
        </Col>
    </Row>    
          <br></br><br></br>

      <Row>
        
        <Col>
        
        {/*<div style={{Width:"970px",minHeight:"60vh",fontSize:"12px",overflowX:"auto"} >*/}
        {/*<table className='table-sm' id="TableID"> 
          <thead className='bg-primary text-white ' style={{height:"50px",fontSize:"12px",textAlign:"center"}}> 
            <tr>
           
           <th style={{minWidth:"13rem",fontWeight:"400"}}>Date</th> 
            <th style={{minWidth:"13rem",fontWeight:"400"}}>Godown Name</th> 
            <th style={{minWidth:"13rem",fontWeight:"400"}}>Plant</th>
            <th style={{minWidth:"13rem",fontWeight:"400"}}>Storage Location</th>
            <th style={{minWidth:"13rem",fontWeight:"400"}}>From Lot</th>
            <th style={{minWidth:"13rem",fontWeight:"400"}}>Wheat Variety</th>
            <th style={{minWidth:"13rem",fontWeight:"400"}}>Material Code</th>
            <th style={{minWidth:"13rem",fontWeight:"400"}}>To Lot</th> 
            <th style={{minWidth:"13rem",fontWeight:"400"}}>Bag Type 1</th> 
            <th style={{minWidth:"13rem",fontWeight:"400"}}>No of Bags 1</th> 
            <th style={{minWidth:"13rem",fontWeight:"400"}}>Bag Type 2</th> 
            <th style={{minWidth:"13rem",fontWeight:"400"}}>No of Bags 2</th>
            <th style={{minWidth:"13rem",fontWeight:"400"}}>Bag Type 3</th> 
            <th style={{minWidth:"13rem",fontWeight:"400"}}>No of Bags 3</th>  
            <th style={{minWidth:"13rem",fontWeight:"400"}}>Qty in MTS</th> 
            <th style={{minWidth:"13rem",fontWeight:"400"}}>Relotting Qty</th> 
            <th style={{minWidth:"13rem",fontWeight:"400"}}>Relotting Vendor</th>
            <th style={{minWidth:"13rem",fontWeight:"400"}}>Relotting Charges</th>
            </tr>
          </thead> 
          <tbody style={{textAlign:"center"}}>
          {form.values.CheckList && form.values.CheckList.map((row, index) => ( 
          <tr>
            <td>{row.RelotDate}</td> 
            <td>{row.from_warehouse}</td> 
            <td>{row.from_plantname}</td> 
            <td>{row.from_werks}</td> 
            <td>{row.fromlotno}</td> 
            <td>{row.WheatVariety}</td> 
            <td>{row.MaterialCode}</td> 
            <td>{row.tolotno}</td> 
            <td>{row.BAG_NAME}</td> 
            <td>{row.NoOfBags}</td> 
            <td>{row.BAG_NAME2}</td> 
            <td>{row.NoOfBags2}</td> 
            <td>{row.BAG_NAME3}</td> 
            <td>{row.NoOfBags3}</td> 
            <td>{row.BeforeFromLotQty}</td> 
            <td>{row.QtyinMTS}</td> 
            <td>{row.VendorCode + "-"+row.VendorName}</td> 
            <td>{row.RelottingCharges}</td> 
          </tr>
          ))}  
        </tbody>
          </table> */}
    <TableComponent showDownload columns={taColumns} data={form.values.CheckList} />
   </Col>

      </Row>
  </Fragment>
 </>
  )
}

const RelotReportData = () => { 
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
    //let stockEntryformData = form.values;


  }
  return (
  <Fragment>
    <CardComponent header="Relot Report">
      <RelotReport form={form}  onSubmit={onSubmit}  />
     
    </CardComponent>
  </Fragment>
  )
}

export default RelotReportData;
