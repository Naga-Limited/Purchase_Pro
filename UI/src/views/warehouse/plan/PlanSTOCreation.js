import { Button, Row, Col } from "reactstrap";
import React, { useState,Fragment, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { CardComponent } from "../../common/CardComponent";
import { useFormik } from "formik";
import { validation, Yup,CustomDropdownInput, CustomTextInput } from "../../forms/custom-form";
import { addColumn, getDropdownValue, getFromDate, getToDate } from "../../common/Utils";
import { previewUrl, BASE_URL, apiBaseUrl } from "../../../urlConstants";
import { RefreshBlock } from "../../common/RefreshBlock";
import { apiPostMethod } from "@helpers/axiosHelper";
import { errorToast, ShowToast } from "@helpers/appHelper";
import { MonthArray, LastDayOfMonth } from "../common/appHelper";
import WeeklyPlanListTable from "../common/WeeklyPlanListTable";
import { Plan_STOPO_DeliveryCreation_Add, Plan_Testing } from "../WarehouseDropdownList";

const filter_Id={
  lot_id:"",
  lot_Name:"",
  location_id:"",
  location_Name:"",
  plant_id:"",
  plant_Name:"",
  warehouse_id:"",
  warehouse_Name:"",
  wheatvariety_id:"",
  wheatvariety_Name:"",
  division_id:"",
  division_Name:"",
  screenType:"PLAN_LIST",

}

const PlanSTOCreation = () => {
  const history = useHistory();
  const [MonthList, setMonthList] = useState([]);
  const [WarehoseOptionsTo, setWarehouseOptionsTo] = useState([]);
  const [storageLocationOptionTo,setstorageLocationOptionTo] = useState([]); 
  const [WhPlantOptionsTo, setWhPlantOptionsTo] = useState([]);
  const [PlantOptions, setPlantOptions] = useState([]);
  const [WarehouseOptions, setWarehouseOptions] = useState([]);
  const [WheatVarity, setWheatVarity] = useState([]);
  const [FilterData, setFilterData] = useState({ ...filter_Id });  
  const [Plan_id, setPlan_id] = useState([]);
  const [PlanID, setPlanID] = useState('');

  const form = useFormik({
    isInitialValid: false,
    initialValues: {},
    validationSchema: Yup.object().shape({
      date: validation.required({ isObject: true }),
    }),

  });

  let values = form.values;

 

  const onPlanMonthChange = (e) =>{
    let {value, label}=e;
    form.setFieldValue("PlanMonth",{label:label,value:value});
    form.setFieldValue('warehouse','');
    form.setFieldValue('plant','');
    form.setFieldValue('wheatvariety','');

    getWHByPlantId(value);
  }

  const getPlantByLocationId = (paramId) => {
    let fdata = { 
        MONTH: form.values.PlanMonth.value, 
        WAREHOUSE_ID: paramId, 
        screenType: "PLANSTO",
      };
  
      apiPostMethod(apiBaseUrl+'warehouse/STOPODeliveryPlan/getPlant', fdata)
      .then((response) => {
        const { data } = response;
        console.log("Response SubLot Data :: "+JSON.stringify(response));
        if (data.success) {
          setPlantOptions(data.results);
        }
      })
      .catch((error) => {
        errorToast("Something went wrong, please try again after sometime");
      });
  };

  const onPlantChange = (e) => {
    const { value, label } = e;
    form.setFieldValue('plant', {  label: label,value: value });
    setFilterData({...FilterData, plant_id:value, plant_Name:label});
    // ClearDropdown("PLANT");
    form.setFieldValue('wheatvariety','');

    getWheatVariety(value,label)
  };

  const getWHByPlantId = (paramId) => {
    let fdata = { 
      search_Id: paramId, 
      screenType: "PLANSTO",
    };

    apiPostMethod(apiBaseUrl+'warehouse/STOPODeliveryPlan/getWarehouse', fdata)
      .then((response) => {
        const { data } = response;
        console.log("Response SubLot Data :: "+JSON.stringify(response));
        if (data.success) {
          setWarehouseOptions(data.results);
        }
      })
      .catch((error) => {
        errorToast("Something went wrong, please try again after sometime");
      });
  };

  const onWarehouseChange = (e) => {
    const { value, label } = e;
    form.setFieldValue('warehouse', {  label: label,value: value });
    setFilterData({...FilterData, warehouse_id:value, warehouse_Name:label});
    // getWheatVariety(value);
    form.setFieldValue('plant','');
    form.setFieldValue('wheatvariety','');
    getPlantByLocationId(value)
  };

  const getWheatVariety = (paramId,label) => {
    let fdata = {
      MONTH: form.values.PlanMonth.value, 
      WAREHOUSE_ID: form.values.warehouse.value, 
      screenType: "PLANSTO",
      PLANT_ID:paramId,
    };

    apiPostMethod(apiBaseUrl+'warehouse/STOPODeliveryPlan/getWheat', fdata)
    .then((response) => {
        const { data } = response;
        console.log("Response SubLot Data :: "+JSON.stringify(response));
        if (data.success) {
          setWheatVarity(data.results);
          FillPlantList("SIL",paramId,label)
        }
      })
      .catch((error) => {
        errorToast("Something went wrong, please try again after sometime");
      });
  };

//   const onWarehouseChangeTO = (e) => {
//     const { value, label } = e;  
//     form.setFieldValue('WareHouseTO', {  label: label,value: value });     
//     /**************RESET**************** */
// //    form.setFieldValue('LotNumber','');
//    form.setFieldValue('storagelocationidTO','');
//    form.setFieldValue('plantidTO','');
// //    form.setFieldValue('WheatVariety','');
//   //  form.setFieldValue('WareHouse','');
//     /********************************** */

//     FillPlantList(value,label); 
//   };

  const FillPlantList = (WH_CODE,plant_id,label) => {
    let fdata = { WH_CODE: WH_CODE, plant_id : plant_id,screenType: "FUMIGATION" };
    apiPostMethod(apiBaseUrl+'warehouse/STOPODeliveryPlan/getWHplantList', fdata)
      .then((response) => {
        const { data } = response;
        if (data.success) {
          // setWhPlantOptionsTo([{ options: data.results }]);
          form.setValues({
            ...form.values,
            plantidTO:data.results[0].value,
            plantidvalue:data.results[0].label,
          })
        }
        // form.setFieldValue('WareHouseTO', {  label: WH_NAME,value: data.results[0].WH_REFID });  
        FillStorageLocationList(data.results[0].value,data.results[0].label,plant_id,label)   
      })
      .catch((error) => {
        errorToast("Something went wrong, please try again after sometime");
      });
  };

  const onStorageLocationChangeTO=(e)=>{
    const {value,label} = e; 
    form.setFieldValue('storagelocationidTO', {  label: label,value: value });
    if(form.values.from_plant != undefined && form.values.to_plant !=undefined){
      SAPAPIVendorGet(label,value);
      }     
  }
  
//   const onPlantChangeTO = (e) => {
//     const { value, label } = e;
//     form.setFieldValue('plantidTO', {  label: label,value: value });
//    // FillLotList(value);
   
//    /***************RESET******************** */
// //    form.setFieldValue('LotNumber','');
//    form.setFieldValue('storagelocationidTO','');
// //    form.setFieldValue('WheatVariety','')
//    //form.setFieldValue('plantid','');
//   //  form.setFieldValue('WareHouse','');
//    /*************************************** */
   
//    FillStorageLocationList(value,label)
//   };
  
  const FillStorageLocationList=(PlantId,plantidvalue,plan_id,plant_label)=>{
    let fdata = { PlantId, screenType: "RND" };
    apiPostMethod(apiBaseUrl+'warehouse/STOPODeliveryPlan/getStorageLocationListToPlant', fdata)
    .then((response) => {
    const { data } = response;
    if (data.success) {
      form.setValues({
        ...form.values,
         to_plant:data.results[0].WERKS,
         plantidvalue:plantidvalue,
         plantidTO:PlantId,
      }) 
    setstorageLocationOptionTo([{ options: data.results }]);
    // form.setFieldValue('plantidTO', {  label: label,value: PlantId });
    }
    form.setFieldValue('plant', {  label: plant_label,value: plan_id });
    })
    .catch((error) => {
    errorToast("Something went wrong, please try again after sometime");
    });
  };
  const onWheatvarietyChange = (e) => {
    const { value, label } = e;
    // form.setFieldValue('wheatvariety', {  label: label,value: value });
    getDetails(value, label)
  };

  const getDetails = (WheatVarietyId,WheatVarietyName) => {
    let fdata = {
      MONTH: form.values.PlanMonth.value, 
      WAREHOUSE_ID: form.values.warehouse.value, 
      PLANT_ID: form.values.plant.value, 
      WHEAT_ID:WheatVarietyId,
      screenType: "STO_PLAN_CHANGE" 
    };
    
    //let fdata={}
    apiPostMethod(apiBaseUrl+'warehouse/STOPODeliveryPlan/getPlanSTODetails', fdata)
      .then((response) => {
        const { data } = response;

        var sum_planqty = 0;
        

         (data.results).forEach(subData => sum_planqty += Number(subData.planqty));
         let planid = data.results.map(a => a.planid);

         setPlan_id(data.results)
         setPlanID(planid)

        if (data.success) {
        form.setValues({
           ...form.values,
            Segment:data.results[0].Segment,
            from_plant:data.results[0].WERKS,
            qty:sum_planqty
         })
         
        form.setFieldValue('wheatvariety', {  label: data.results[0].WheatVariety , value: data.results[0].Id });
        }
        if(form.values.from_plant != undefined && form.values.to_plant !=undefined){
          SAPAPIVendorGet();
          }
      })
      .catch((error) => {
        errorToast("Something went wrong, please try again after sometime");
      });
  };

  const catagriesOptions = [
    {
      options: [
        { value: "1", label: "Freight Vendor" },
        { value: "2", label: "Loading Vendor" },
        { value: "3", label: "Unloading Vendor" },
      ],
    },
  ];

  const onVendorChange = (e) => {
    const { value, label } = e;
   FreightVendorGet(value,label)
  };

  const FreightVendorGet=(Vendor_ID,Vendor_Name)=>{
    let fdata = { Vendor_ID, screenType: "plan_STO" };
    apiPostMethod(apiBaseUrl+'warehouse/STOPODeliveryPlan/getVendorByID', fdata)
    .then((response) => {
    const { data } = response;
    if (data.success) {
      form.setValues({
        ...form.values,
        FreightVendor:data.results[0].Code,
      })
      form.setFieldValue('Freight', {  label: Vendor_Name,value: Vendor_ID });
    }
    })
    .catch((error) => {
    errorToast("Something went wrong, please try again after sometime");
    });
  };

  const onVendorChangeLoading = (e) => {
    const { value, label } = e;
    LoadingVendorGet(value,label)
  };

  const LoadingVendorGet=(Vendor_ID,Vendor_Name)=>{
    let fdata = { Vendor_ID, screenType: "plan_STO" };
    apiPostMethod(apiBaseUrl+'warehouse/STOPODeliveryPlan/getVendorByID', fdata)
    .then((response) => {
    const { data } = response;
    if (data.success) {
      form.setValues({
        ...form.values,
        LoadingVendor:data.results[0].Code,
      })
      form.setFieldValue('Loading', {  label: Vendor_Name,value: Vendor_ID });
    }
    })
    .catch((error) => {
    errorToast("Something went wrong, please try again after sometime");
    });
  };

  const onVendorChangeUnloading = (e) => {
    const { value, label } = e;
   UnloadingVendorGet(value,label)
  };

  const UnloadingVendorGet=(Vendor_ID,Vendor_Name)=>{
    let fdata = { Vendor_ID, screenType: "plan_STO" };
    apiPostMethod(apiBaseUrl+'warehouse/STOPODeliveryPlan/getVendorByID', fdata)
    .then((response) => {
    const { data } = response;
    if (data.success) {
      form.setValues({
        ...form.values,
        UnloadingVendor:data.results[0].Code,
      })
      form.setFieldValue('Unloading', {  label: Vendor_Name,value: Vendor_ID });
    }
    })
    .catch((error) => {
    errorToast("Something went wrong, please try again after sometime");
    });
  };

  const onSubmit=()=>{

    var today = new Date().toLocaleString();

    let fdata = {screenType: "plan_STO", 
      plan_id:JSON.stringify(Plan_id),
      plan_month:form.values.PlanMonth?.value,
      from_warehouse_id:form.values.warehouse?.value,
      from_plant_id:form.values.plant?.value,
      wheat_variety_id:form.values.wheatvariety?.value,
      to_warehouse_id:14,
      to_plant_id:form.values.plantidTO,
      to_storage_id:form.values.storagelocationidTO?.value,
      moving_qty:form.values.qty,
      loading_cost:form.values.LoadCost || 0,
      unloading_cost:form.values.UnloadCost || 0,
      freight_cost:form.values.FreightCost,
      freight_vendor_id:11,
      loading_vendor_id:0,
      unloading_vendor_id:0,
      status:1,
      created_at:today,
     };

     let ngw_weeklyplan = {screenType: "plan_STO", 
      towarehouseid:form.values.WareHouseTO?.value,
      toplantid:form.values.plantidTO,
      tolocationid:form.values.storagelocationidTO?.value,
     };
     const postdata ={
      fdata,
      ngw_weeklyplan,
      plan_id:PlanID.toString(),
     }
    if(fdata.plan_month == '' || fdata.plan_month == undefined ){
      errorToast("Please Select Plan Month...");
      return false;
    }else if(fdata.wheat_variety_id == '' || fdata.wheat_variety_id == undefined ){
      errorToast("Please Select Wheat Variety...");
      return false;
    }else if(fdata.to_storage_id == '' || fdata.to_storage_id == undefined ){
      errorToast("Please Select To Storage Location...");
      return false;
    }else if(fdata.moving_qty == '' || fdata.moving_qty == undefined || fdata.moving_qty == 0 ){
      errorToast("Please Confirm Moving Qty...");
      return false;
    }
    // else if(fdata.freight_vendor_id == '' || fdata.freight_vendor_id == undefined ){
    //   errorToast("Please Select Freight Vendor...");
    //   return false;
    // }
    else if(fdata.freight_cost == undefined || !/^[\d]{2}/.test(fdata.freight_cost)){
      errorToast("Please Enter Correct Freight Cost...");
      return false;
    }
    // else if(fdata.loading_vendor_id != undefined && (fdata.loading_cost == undefined || !/^[\d]{2}/.test(fdata.loading_cost))){
    //   errorToast("Please Enter Loading Cost...");
    //   return false;
    // }else if(fdata.unloading_vendor_id != undefined && (fdata.unloading_cost > undefined || !/^[\d]{2}/.test(fdata.unloading_cost))){
    //   errorToast("Please Enter Correct Unloading Cost...");
    //   return false;
    // }else if(fdata.loading_vendor_id == undefined && (fdata.loading_cost > 0)){
    //   errorToast("Please Check Loading Vendor & Cost...");
    //   return false;
    // }else if(fdata.unloading_vendor_id == undefined && (fdata.unloading_cost > 0)){
    //   errorToast("Please Check UnLoading Vendor & Cost...");
    //   return false;
    // }
   
    apiPostMethod(apiBaseUrl+'warehouse/STOPODeliveryPlan/PostStoPO', postdata)
    .then((response) => {
    const { data } = response;
    if (data.success) {
      ShowToast("Saved Successfully...");
      history.push(`/PLANSTOCREATION`);
      window.location.reload();
    }
    })
    .catch((error) => {
    errorToast("Something went wrong, please try again after sometime");
    });
  };

  // useEffect(() => {
  //   if(form.values.from_plant != undefined && form.values.to_plant !=undefined){
  //   SAPAPIVendorGet();
  //   }
  // }, [form.values.from_plant,form.values.to_plant]);

  const SAPAPIVendorGet=(label,value)=>{
    let fdata = { from_plant:form.values.from_plant, to_plant: form.values.to_plant };
    apiPostMethod(apiBaseUrl+'warehouse/STOPODeliveryPlan/SAP_Vendor_Cost', fdata)
    .then((response) => {
    const { data } = response;
    if (data.success) {
      form.setValues({
        ...form.values,
        LoadCost:data.results[0].LOADING_AMOUNT,
        UnloadCost:data.results[0].UNLOADING_AMOUNT,
        FreightCost:data.results[0].FRIGHT_AMOUNT,
      })
      form.setFieldValue('storagelocationidTO', {  label: label,value: value });
    }
    })
    .catch((error) => {
    errorToast("Something went wrong, please try again after sometime");
    });
  };
  return (
    <Fragment>  
      <RefreshBlock />
      
      <br/>
      <CardComponent header="Plan STO Creation">
      <Row>        
        <Col md="4" sm="12">
          <CustomDropdownInput label={"Plan Month"} id="PlanMonth" 
            url={`${apiBaseUrl}warehouse/master/getPlanMonth`} 
            style={{zIndex:'1000'}} 
            form={form} 
            onChange={ (e)=> onPlanMonthChange(e)}
          />
          <span id='PlanMonth_Error' style={{color: 'red'}} ></span> 
        </Col>
        <Col md="4" sm="12">
          <CustomDropdownInput label={"From Warehouse Name"} id="warehouse"  
            // url={`${apiBaseUrl}Warehouse/Master/getWarehouse`}
            form={form}
            // isMulti
            options ={WarehouseOptions}   
            onChange = {(e) => onWarehouseChange(e)}   
          />
          <span id='Warehouse_Error' style={{color: 'red'}} ></span>
        </Col>    
        <Col md="4" sm="12" > 
          <CustomDropdownInput label={"From Plant Name"} id="plant" 
            // url={`${apiBaseUrl}Warehouse/Master/getPlants`}
            form={form} 
            // isMulti
            options={PlantOptions} 
            onChange={(e) => onPlantChange(e)}
          />
          <span id='plant_Error' style={{color: 'red'}} ></span>
        </Col>  
        <Col md="4" sm="12">
          <CustomDropdownInput label={"Wheat variety"} id="wheatvariety" 
            // url={`${apiBaseUrl}Warehouse/Master/getWheatVariety`} 
            form={form}
            // isMulti
            options ={WheatVarity}   
            onChange = {(e) => onWheatvarietyChange(e)}   
          />
          <span id='Wheatvariety_Error' style={{color: 'red'}} ></span>
        </Col>
         <Col md="4" sm="12">
         <CustomTextInput  label={"To WH.Name"} id="Freight" form={form} value={"Silo"} type="text" disabled/>
              {/* <CustomDropdownInput label={"To WH.Name"} id="WareHouseTO"
                url={`${apiBaseUrl}marketdata/master/getwarehouses`} 
                form={form} 
                onChange={onWarehouseChangeTO}
                options={WarehoseOptionsTo}
              />
              <span id='WareHouse_Error' style={{color: 'red'}} ></span> */}
        </Col> 
        
        <Col md="4" sm="12">
        <CustomTextInput  label={"To Plant"} id="plantidvalue" form={form} type="text" disabled/>
            {/* <CustomDropdownInput
                  options={WhPlantOptionsTo}
                  id={"plantidTO"}  
                  label={"To Plant"}
                  className="react-select"
                  classNamePrefix="select"
                  form={form}
                  onChange={(e) => onPlantChangeTO(e)}
                /> */}
        </Col>
        <Col md="4" sm="12">
              <CustomDropdownInput
                options={storageLocationOptionTo}
                id={"storagelocationidTO"}
                label={"To Storage Location"}
                className="react-select"
                classNamePrefix="select"
                form={form}
                onChange={(e) => onStorageLocationChangeTO(e)}

              />
        </Col>
        
        <Col md="4" sm="12">
          <CustomTextInput  label={"Segment"} id="Segment" form={form} type="text" disabled/>
        </Col>
        <Col md="4" sm="12">
          <CustomTextInput  label={"Moving Stock Qty Per Kg"} id="qty" form={form} type="text" disabled/>
        </Col>
      
        {/* <Col md="4" sm="12">
          <CustomTextInput  label={"Freight Vendor"} id="Freight" form={form} value={"NLLD 410001"} type="text" disabled/> */}
          
              {/* <CustomDropdownInput label={"Freight Vendor"} id="Freight"
                url={`${apiBaseUrl}warehouse/STOPODeliveryPlan/getVendorDetails`} 
                form={form} 
                onChange={onVendorChange}
                // options={WarehoseOptionsTo}
              /> */}
        {/* </Col> */}
        {/* {form.values.Freight && */}
        {/* <Col md="4" sm="12">
          <CustomTextInput  label={"Freight Vendor Code"} id="FreightVendor" value ={"410001"}  form={form} type="text" disabled/>
        </Col> */}
        {/* {form.values.Freight  && */}
        <Col md="4" sm="12">
          <CustomTextInput  label={"Freight Cost Per Ton"} id="FreightCost" disabled form={form} type="text"/>
        </Col>
        {/* } */}
        {/* <Col md="4" sm="12"> */}
          {/* <CustomTextInput  label={"Loading Vendor"} id="Load" form={form} type="text" disabled/> */}
{/* 
             <CustomDropdownInput label={"Loading Vendor"} id="Loading"
                url={`${apiBaseUrl}warehouse/STOPODeliveryPlan/getVendorDetailsLoading`} 
                form={form} 
                onChange={onVendorChangeLoading}
                // options={WarehoseOptionsTo}
              />
        </Col> */}
        {/* {form.values.Loading &&
        <Col md="4" sm="12">
          <CustomTextInput  label={"Loading Vendor Code"} id="LoadingVendor"  form={form}  type="text" disabled/>
        </Col>} */}
        {/* {form.values.Loading && */}
        <Col md="4" sm="12">
          <CustomTextInput  label={"Loading Cost Per Ton"} id="LoadCost" form={form} maxLength="7" type="text" disabled/>
        </Col>
        {/* } */}
        {/* <Col md="4" sm="12"> */}
          {/* <CustomTextInput  label={"Unloading Vendor"} id="Unload" form={form} type="text" disabled/> */}
            {/* <CustomDropdownInput label={"Unloading Vendor"} id="Unloading"
                url={`${apiBaseUrl}warehouse/STOPODeliveryPlan/getVendorDetailsUnloading`} 
                form={form} 
                onChange={onVendorChangeUnloading}
                // options={WarehoseOptionsTo}
            /> */}
        {/* </Col> */}
        {/* {form.values.Unloading &&
        <Col md="4" sm="12">
          <CustomTextInput  label={"Unloading Vendor Code"} id="UnloadingVendor" form={form} type="text" disabled/>
        </Col>} */}
        {/* {form.values.Unloading  && */}
        <Col md="4" sm="12">
          <CustomTextInput  label={"Unloading Cost Per Ton"} id="UnloadCost" form={form} maxLength="7" type="text" disabled/>
        </Col>
        {/* } */}
        </Row>
        <Row>
        <Col md="12" sm="12" align="right">
          <Button onClick={(e) => onSubmit()} className = "ml-2" color="primary">Submit</Button>
        </Col>  
      </Row>
      </CardComponent>
     </Fragment>
  );
};

export default PlanSTOCreation;
