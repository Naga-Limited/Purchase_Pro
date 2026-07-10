import React, { Fragment, useState, useEffect } from 'react'
import { Col ,  Label,Button, ButtonToggle } from 'reactstrap'
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
//import { ToggleLeft } from 'react-feather';



const physicalstock = {
  warehouseid: "", 
  slocation: "",
  wh_code: "",
  warehousename: "",                        
  locationid: "",    
  lotid: "",
  lotno: "", 
  plantid: "",
  Physical_Stock_date: "", 
  Maker: "", 
  Checker: "", 
  wheatvarietyid: "",
  WheatVariety: "",
  BagType: "",
  NoOfBag: "",  
  Qty_in_MTS: "",
  Image1 : "",
  Image2: "",
  Images3: "",
  Images4: "",
  Audit_Remarks: "",
  OutBox_Indicator: "",
  BagType: {label:"", value:""},
}





 const Physicalstockentry = ({form, onSubmit}) => {
   const[stockEntryformData , setStockEntryfromData] = useState({ ...physicalstock });  
   const[warehouseoption, setWarehouseoption] = useState([]);                                                                       
   const[locationoption,setLocationoption] = useState([]);                                                                       
   const[lotoption,setLotoption] = useState([]);                                                                       
   const[makeroption,setMakeroption] = useState([]);                                                                       
   const[checkeroption,setcheckeroption] = useState([]);                                                                         
   const[wheatvarietyoption,setWheatvarietyoption] = useState([]);                                                                        
   const[bagtype,setBagtypeoption] = useState([]);                                                                         
   const[showlot,setshowlot] = useState([]);                                                                        
   const[showwheat, setwheat] = useState([]);                                                                      
   const [KeyloanDatas, setKeyloanDatas] = useState([]);

   const { warehouseid, warehousename,plantid,slocation ,wh_code, locationid, lotid, lotno, Maker, Checker,BagType, NoOfBag, Qty_in_MTS, wheatvarietyid,WheatVariety} = stockEntryformData;
   const history = useHistory();
   let { Physical_Stock_Id } = useParams();
   let refid='';
   let fdata='';
   if( Physical_Stock_Id) {
      refid = Physical_Stock_Id.replace(":", "");
   }
   let { showLoader, hideLoader } = useLoader(); 
   useEffect(() => {
     if(Physical_Stock_Id){
       onFetchStockentryById();

     }
   }, [Physical_Stock_Id]);
   const onFetchStockentryById = () => {
     let fdata = {
       id:refid,
     };
   showLoader();
   console.log("Request Url :: "+apiBaseUrl + "Master/getstockEntrydatabyid", fdata);
    apiPostMethod(apiBaseUrl + "Master/getstockEntrydatabyid", fdata)
    .then((response) => {
      const { data } = response;
      console.log("Response Data :: "+JSON.stringify(response));
      if (data.success) {
        form.setValues({
          warehouseid:data.results[0].warehouseid,
          locationid:data.results[0].locationid,
          lotid:data.results[0].lotid,
          Physical_Stock_date:data.results[0].Physical_Stock_date,
          Maker:data.results[0].Maker,
          Checker:data.results[0].Checker,
          Wheat_Variety_Id:data.results[0].Wheat_Variety_Id,
          BagType:data.results[0].BagType,
          NoOfBag:data.results[0].NoOfBag,
          Qty_in_MTS:data.results[0].Qty_in_MTS,
          WheatVarietyid:data.results[0].WheatVarietyid
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
     history.push(`/master/PhysicalstockEntry`);
   };
   const handleViewHistory = (data) => {

   } 

   const onWarehouseChange = (e) => {
     const {value, label} = e; 
     setStockEntryfromData({ ...stockEntryformData, warehouseid:value, warehousename:label});
     FillPlantList(value);
}

const FillPlantList  = (warehouseid) => {
  let fdata = {WH_CODE:warehouseid, screentype:"PhysicalStockEntry"}
  apiPostMethod(apiBaseUrl+'warehouse/master/getWHplantList',fdata)
  .then((response) => {
    const { data } = response; 
    if(data.success) {
      setLocationoption([{options:data.results}]);
    }
  })
  .catch((error) => {
    errorToast("Something went wrong, please try again after sometime");
  });
};

const onPlantchange = (e) => {
  const {value,label} = e; 
  setStockEntryfromData({ ...stockEntryformData, locationid:value , slocation:label})  
  FillLotList(value)

}
const FillLotList = (plant) => {
  let fdata ={plantid:plant, screentype: "PhysicalstockEntry"} 
  apiPostMethod(apiBaseUrl+'warehouse/master/getWHLotList',fdata) 
  .then((response) => {
    const { data } =response; 
    if(data.success) {
      setLotoption([{options:data.results}]);
    }
  })
  .catch((error) => {
    errorToast("Something went wrong please try again after sometime");
  });
};
const OnLotChange = (e) => {
  const {value, label} = e; 
  setStockEntryfromData({ ...stockEntryformData, lotid:value, lotno:label}); 
 // Fillwheatvarity(value)
 
} 
const onWheatvarietyChange = (e) => {
   const{value, label} = e; 
   setWheatvarietyoption({ ...stockEntryformData, WheatVarietyid:value, WheatVariety:label }); 

}
/* let a   
 const Details = () => {
     return `${apiBaseUrl}Warehous/physicalstocktaking/getphysicalstocklist`  
}
a = Details
console.log(a) */


// const  Fillwheatvarity = (lotid) => {
//   let fdata ={lotid:lotid, screentype: "PhysicalstockEntry"} 
//   apiPostMethod(apiBaseUrl+'warehouse/master/getWHWheatvarietyList',fdata) 
//   .then((response) => {
//     const { data } =response; 
//     if(data.success) {
//       setWheatvarietyoption([{options:data.results}]);
//     }
//   })
//   .catch((error) => {
//     errorToast("Something went wrong please try again after sometime");
//   });
// }; 
// const onWheatvarietyChange = (e) => {
//   const {value, label} = e; 
//   setStockEntryfromData({ ...stockEntryformData, wheatvarietyid:value , wheatvarietys:label});
// }


/*
const FillwheatList = () => {   
  let fdata = {lotid:lotid, screentype: "PhysicalStockEntry"}
  apiPostMethod(apiBaseUrl +'warehouse',fdata)
  .then((response) => {
    const { data} = response; 
    if(data.success){
      setLotoption([{option:data.results}])
    }
 })
 .catch((error) => {
   errorToast("Something went wrong, please try again after sometime")
 }); 

};  
/*

const onMakerchange = (e) => {
  const {value,label}  = e 
  setMakeroption({ ...stockEntryformData, Maker:value, Maker:label})
  FillMakerList(value);
}
const FillMakerList = (Maker) => {
  let fdata = {Maker:Maker, screentype: "PhysicalStockEntry"} 
  apiPostMethod(apiBaseUrl +'warehouse',fdata) 
  .then((response) => {
    const {data} = response;
    if(data.success){
      setMakeroption([{option:data.results}])
    }
  })
  .catch((error) =>{
    errorToast("Something went wrong, please try again after sometime")
  });

};
const onCheckerchange = (e) => {
  const {value,label}  = e 
  setcheckeroption({ ...stockEntryformData, Checker:value, Checker:label})
  FillCheckerList(value);
}
const FillCheckerList = (Maker) => {
  let fdata = {Maker:Maker, screentype: "PhysicalStockEntry"} 
  apiPostMethod(apiBaseUrl +'warehouse',fdata) 
  .then((response) => {
    const {data} = response;
    if(data.success){
      setcheckeroption([{option:data.results}])
    }
  })
  .catch((error) =>{
    errorToast("Something went wrong, please try again after sometime")
  }) ;

}; 
const onWheatvarietyChange = (e) => {
  const{value,label} = e 
  setWheatvarietyoption({ ...stockEntryformData, Wheat_Variety_Id:value , wheatvariety:label})
  FillWheatList(value);
} 
const FillWheatList = (Wheat_Variety_Id) => {
  let fdata = {Wheat_Variety_Id:Wheat_Variety_Id, screentype: "PhysicalstockEntry"}
  apiPostMethod(apiBaseUrl + 'warehouse',fdata) 
  .then((response) => {
    const {data} =response; 
    if(data.success){
       setWheatvarietyoption([{option:data.results}])
    }
  })
  .catch((error) => {
    errorToast("Something went wrong, please try again after sometime")
  });
}; 

const onbagtypechange = (e) => {
  const{value,label} = e 
  setBagtypeoption({ ...stockEntryformData, bagtype:value, wheatvariety:label}) 
  FillbagList(value);
}
const FillbagList = (bagtype) => {
  let fdata = {bagtype:bagtype, screentype: "PhysicalstocEntry"} 
  apiPostMethod(apiBaseUrl+'warehouse',fdata)
  .then((response) => {
    const {data} = response;
    if(data.success){
      setBagtypeoption([{option:data.results}])
    }
  })
  .catch((error) => {
    errorToast("Something went wrong, please try again after sometime")
  }); 
}
*/  
const onChangelist = (e,i,Data,Key) => {
  console.log(JSON.stringify(form.values));
  const { value, label } = e;
  for(let j=0;j < Data.length;j++){
    if(j==i){
      if(Key=="BagType"){  Data[j].BagType=value; }
      if(Key=="NoOfBags"){  Data[j].NoOfBags=value; }
      if(Key=="QtyinMTS"){  Data[j].QtyinMTS=KeyloanDatas[j].QtyinMTS+e.target.value; }
      if(Key=="AuditRemarks"){  Data[j].AuditRemarks=value; }
     
    }
  }
  setKeyloanDatas(Data);

 //console.log(JSON.stringify(Data));
};
const onTextChange = (e,PKey, checkList,Val) => {
 // let KeyValue=e.target.value;
  //console.log(KeyValue);
  for(let i=0;i<checkList.length;i++){
    if(checkList[i].sub_lot_id==PKey){
        if(Val=="QtyinMTS"){
          checkList[i].QtyinMTS=e.target.value;
        }
        if(Val=="AuditRemarks"){
          checkList[i].AuditRemarks=e.target.value;
        }
        if(Val=="NoOfBags"){
          checkList[i].NoOfBags=e.target.value;
        }
        if(Val=="BagType"){
          checkList[i].BagType={value:e.value, label:e.label};
        }
        
    }
  }
  console.log(JSON.stringify(checkList));
  console.log(JSON.stringify(form.values));
  form.setValues({CheckList:checkList});
  console.log(JSON.stringify(form.values));
}
const ShowStock = (e) => {
  let fdata = {warehouseid:warehouseid,locationid:locationid,lotid:lotid, screentype: "PhysicalstocEntry"} 
  apiPostMethod(apiBaseUrl+'warehouse/physicalstocktaking/getphysicalstocklist',fdata)
  .then((response) => {    
    const {data} = response;
    const  value = value;
    if(data.success){ 
      console.log(  data.results[0].lotid+"  "+  data.results[0].wheatvarietyid)  

      setKeyloanDatas(data.results);

      form.setValues({
       
        CheckList:data.results,
       
      });
      console.log("Checklist");
      console.log(form.values.CheckList);
      /*
      let CheckList={}
      for(let i=0;i<data.results.length;i++)
      {
        CheckList[i]={lotid:data.results[i].lotid,wheatvarietyid:data.results[i].wheatvarietyid , BagType:{lable:"",value:""}};
      }
      form.setValues({CheckList});*/
        //setshowlot({ ...stockEntryformData, lotno:value}); 
        //setwheat({ ...stockEntryformData,WheatVarietyid:value});  
           
    }
  })
  .catch((error) => {
    errorToast("Something went wrong, please try again after sometime")
  }); 

}

    return (
     <Fragment>

         <Row >
         <Col md="3" sm="12" >
           
           <CustomDropdownInput  url={`${apiBaseUrl}marketdata/master/getwarehouses`} 
           label={"Warehouse Name"}  form={form} id="warehouseid" 
           onChange = {onWarehouseChange}   
           options ={warehouseoption}   
           value={{label:warehousename, value:warehouseid}}
          
           />
         
           </Col>
           <Col md="3" sm="12"> 
           <Label>Storage Location</Label>
           <Select  
            form={form} id="locationid"
           onChange={onPlantchange} 
           options={locationoption}
           value={{label:slocation, value:locationid }}

           />
           </Col>
           <Col md="3" sm="12"> 
           <Label>Lot No</Label>
           <Select  
           form={form} id="lotid"   
            options= {lotoption}
           onChange={OnLotChange} 
           value={{label:lotno, value:lotid }}
           
           />
           </Col>
           <Col md="3" sm="12">
             <CustomTextInput label={"Date"} form={form} id="Physical_Stock_date" type="date"  />
             </Col>
         </Row>
         <Row>
             
        <Col md="3" sm="12">
          <Label>Maker</Label>
          <Select
                    
                    options={makeroption}
                    id={"Maker"}
                    className="react-select"
                    classNamePrefix="select"
                    value={{label:Maker,value:Maker}} 
                    // onChange={(e) => onMakerchange (e)}
                  />
        </Col>
        <Col md="3" sm="12">
          <Label>Checker</Label>
          <Select
                    options={checkeroption}
                    id={"Checker"}
                    className="react-select"
                    classNamePrefix="select" 
                    value={{label:Checker,value:Checker}} 
                    // onChange={(e) =>  onCheckerchange(e)}
                  
                   />
        </Col>           
           <Col md="3" sm="12"> 
           <div class ="mt-1 p-1  mx-5">
         <Button.Ripple color="primary"   type="Button" onClick={ShowStock}>Show</Button.Ripple> 
            
          </div>  
        
        </Col>
        <Col md="3" sm="12">
           <CustomTextInput label={"Search"} form={form} id="0" type="search" />
           </Col>
         </Row>
      
         <div class="d-flex justify-content-center mt-2">
             <div class="p-1 ">
         <Button.Ripple color="primary"  type="Button"   >
          Submit
          </Button.Ripple>
          </div>
          <div class="p-1 ">
          <Button.Ripple color="primary"  type="Button" >
          Cancel
          </Button.Ripple>
          </div>
         </div>
        
         <table class="table-sm" border={0} style={{width:"100%"}}>
                   <thead class="bg-primary text-white">
                    <tr>
                       <th >lot No</th>
                        <th >Wheat Variety</th>
                        <th>Bag Type</th>
                        <th>No of Bags</th>
                        <th>Qty in MTS</th>
                        <th>Photo</th>
                        <th>Audit Remarks</th>
                        <th>OutBox Indicator</th>
                        <th>Save</th>
                    </tr>

                    </thead>
                     <tbody  style={{textAlign:"center"}}>
                     {form.values.CheckList && form.values.CheckList.map((row, index) => (  
              <tr data-index={index}> 
                <td style={{width:"10%"}}>{row.lotno}</td>  
                <td style={{width:"10%"}}>{row.WheatVariety}</td>  
                <td style={{width:"20%"}}><CustomDropdownInput style={{minWidth:"200px"}}
         url={`${apiBaseUrl}warehouse/master/bagtype`} 
        
         onChange={(e) => onTextChange(e,row.sub_lot_id,form.values.CheckList,"BagType")} 
         form={form} id={`BagType_${index}`}  type="text"   />
       
      
         </td>
                <td> 
                <CustomTextInput style={{width:"50%",fontSize:"12px",height:"30px",marginBottom:"-10px"}}
            placeholder={" "}  
            onChange={(e) => onTextChange(e,row.sub_lot_id,form.values.CheckList,"NoOfBags")} 
             form={form} id={`NoOfBags_${index}`}  type="text" value={row.NoOfBags}   />
          
          </td>

                <td> 
           <td> <CustomTextInput style={{width:"50%",fontSize:"12px",height:"30px",marginBottom:"-10px"}}
            placeholder={" "}  
            onChange={(e) => onTextChange(e,row.sub_lot_id,form.values.CheckList,"QtyinMTS")} 
             form={form} id={`QtyinMTS_${index}`}  type="text" value={row.QtyinMTS}   /></td>  
               
          </td>
                <td></td>
                <td> 
          <CustomTextInput style={{width:"50%",fontSize:"12px",height:"30px",marginBottom:"-10px"}}
            placeholder={" "}  
            onChange={(e) => onTextChange(e,row.sub_lot_id,form.values.CheckList,"AuditRemarks")} 
             form={form} id={`AuditRemarks_${index}`}  type="text" value={row.AuditRemarks}   />
             </td>
                <td></td>
                <td><Button.Ripple
                      color="danger"
                      className="text-nowrap px-1 mt-75"
                    
                    >
                      
                      <span></span>
                    </Button.Ripple></td>
              
              </tr> 
               ))}  
                    </tbody>
             </table >
     </Fragment>
    )
} 



const Physicalstockentryformdata = () => {

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
      <CardComponent  header="Physical Stock Entry">
     < Physicalstockentry form={form}  onSubmit={onSubmit}  />
   </CardComponent>
    </Fragment>
  )
}


export default Physicalstockentryformdata

