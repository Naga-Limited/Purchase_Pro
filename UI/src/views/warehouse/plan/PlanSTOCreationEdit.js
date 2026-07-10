import { Button, Row, Col } from "reactstrap";
import React, { useState,Fragment, useEffect } from "react";
import { useHistory, useParams } from "react-router-dom";
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
import { useLoader } from "../../../utility/hooks/useLoader";
import confirmDialog from "../../../@core/components/confirm/confirmDialog";

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

const PlanSTOCreationEdit = () => {
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
  let { showLoader, hideLoader } = useLoader();

  let { id } = useParams();
    let refid='';
    if(id) {
       refid = id.replace(":", "");
    }

    useEffect(() => {
      STOPODeliveryPlanByID();
      
  }, [id]);

    const STOPODeliveryPlanByID = () => {
      let fdata = {
        id:refid,
      };
    showLoader();
     apiPostMethod(apiBaseUrl + "warehouse/STOPODeliveryPlan/STOPODeliveryPlanByID", fdata)
     .then((response) => {
       const { data } = response;
       if (data.success) {
         form.setValues({
          Segment:data.results[0].Segment,
          qty:data.results[0].moving_qty,
          FreightCost:data.results[0].freight_cost,
          LoadCost:data.results[0].loading_cost,
          UnloadCost:data.results[0].unloading_cost,
          FreightVendor:data.results[0].freightvendorcode,
          LoadingVendor:data.results[0].loadingvendorcode,
          UnloadingVendor:data.results[0].unloadingvendorcode,
          status:data.results[0].status,
         })


         let str = JSON.parse(data.results[0].plan_id);

         let plan_id = str.map(a => a.PLANID);

         setPlanID(plan_id.toString())

         form.setFieldValue("PlanMonth", {  label: data.results[0].plan_month,value: data.results[0].plan_month });
         form.setFieldValue("warehouse", {  label: data.results[0].fromwarehouse,value: data.results[0].from_warehouse_id });
         form.setFieldValue("WareHouseTO", {  label: data.results[0].towarehouse,value: data.results[0].to_warehouse_id });
         form.setFieldValue("plant", {  label: data.results[0].fromplant,value: data.results[0].from_plant_id });
         form.setFieldValue("plantidTO", {  label: data.results[0].toplantname,value: data.results[0].to_plant_id });
         form.setFieldValue("storagelocationidTO", {  label: data.results[0].STORAGE_LOCATION,value: data.results[0].to_storage_id });
         form.setFieldValue("Freight", {  label: data.results[0].freightvendor,value: data.results[0].freight_vendor_id });
         form.setFieldValue("Loading", {  label: data.results[0].loadingvendor,value: data.results[0].loading_vendor_id });
         form.setFieldValue("Unloading", {  label: data.results[0].unloadingvendor,value: data.results[0].unloading_vendor_id });
         form.setFieldValue("wheatvariety", {  label: data.results[0].WheatVariety,value: data.results[0].wheat_variety_id });
         
       }
     })
     .catch((error) => {
       console.log(error)
       errorToast("Something went wrong, please try again after sometime");
     })
     .finally((a) => {
       hideLoader();
     });
    }; 

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

    getWheatVariety(value)
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

  const getWheatVariety = (paramId) => {
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
        }
      })
      .catch((error) => {
        errorToast("Something went wrong, please try again after sometime");
      });
  };

  const onWarehouseChangeTO = (e) => {
    const { value, label } = e;  
    form.setFieldValue('WareHouseTO', {  label: label,value: value });     
    /**************RESET**************** */
//    form.setFieldValue('LotNumber','');
   form.setFieldValue('storagelocationidTO','');
   form.setFieldValue('plantidTO','');
//    form.setFieldValue('WheatVariety','');
  //  form.setFieldValue('WareHouse','');
    /********************************** */

    FillPlantList(value,label); 
  };

  const FillPlantList = (WH_CODE,WH_NAME) => {
    let fdata = { WH_CODE: WH_CODE, screenType: "FUMIGATION" };
    apiPostMethod(apiBaseUrl+'warehouse/master/getWHplantList', fdata)
      .then((response) => {
        const { data } = response;
        if (data.success) {
          setWhPlantOptionsTo([{ options: data.results }]);
        }
        form.setFieldValue('WareHouseTO', {  label: WH_NAME,value: data.results[0].WH_REFID });     
      })
      .catch((error) => {
        errorToast("Something went wrong, please try again after sometime");
      });
  };

  const onStorageLocationChangeTO=(e)=>{
    const {value,label} = e; 
    form.setFieldValue('storagelocationidTO', {  label: label,value: value });     
  }
  
  const onPlantChangeTO = (e) => {
    const { value, label } = e;
    form.setFieldValue('plantidTO', {  label: label,value: value });
   // FillLotList(value);
   
   /***************RESET******************** */
//    form.setFieldValue('LotNumber','');
   form.setFieldValue('storagelocationidTO','');
//    form.setFieldValue('WheatVariety','')
   //form.setFieldValue('plantid','');
  //  form.setFieldValue('WareHouse','');
   /*************************************** */
   
   FillStorageLocationList(value)

   
  };
  
  const FillStorageLocationList=(PlantId)=>{
    let fdata = { PlantId, screenType: "RND" };
    apiPostMethod(apiBaseUrl+'warehouse/master/getStorageLocationListFromPlant', fdata)
    .then((response) => {
    const { data } = response;
    if (data.success) {
   
      setstorageLocationOptionTo([{ options: data.results }]);
   
    //getLotInfo(paramLotId,type);
    
    }
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
        //  setPlanID(planid)

        if (data.success) {
        form.setValues({
           ...form.values,
            Segment:data.results[0].Segment,
            qty:sum_planqty
         })
         
        form.setFieldValue('wheatvariety', {  label: data.results[0].WheatVariety , value: data.results[0].Id });
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

  const onSubmit=(status,type)=>{

     const postdata ={
      ID:refid,
      plan_id:PlanID,
      status:status,
      reject_reason:form.values.reject_reason
     }
    
     if(status == 0 && (postdata.reject_reason == '' || postdata.reject_reason == undefined) ){
      errorToast("Please Enter Reject Reason...");
      return false;
    }

     let msg = "Plan STO PO"
     let titles
     if(status == 2){
      titles = 'Are you sure to Approve?'
     }else if(status == 3){
      titles = 'Are you sure to Approve?'
     }else if(status == 0){
      titles = 'Are you sure to Reject?'
     }
    
     confirmDialog({
       title: titles,
       description: msg,
     }).then((res) => {
    if (res) {
    apiPostMethod(apiBaseUrl+'warehouse/STOPODeliveryPlan/UpdateStoPO', postdata)
    .then((response) => {
    const { data } = response;
    if (data.success) {
      if(status == 2){
        ShowToast("Saved Successfully...");
        history.push(`/PLANSTOPURCHASEAPPROVAL`);
      }else if(status == 3){
        ShowToast("Saved Successfully..."+ "PO Number - " +data.results.PO_Number);
        history.push(`/PLANSTOQAAPPROVAL`);
      }else if(status == 0 && type == 2){
        errorToast("Rejected Successfully...");
        history.push(`/PLANSTOQAAPPROVAL`);
      }else if(status == 0 && type == 1){
        errorToast("Rejected Successfully...");
        history.push(`/PLANSTOPURCHASEAPPROVAL`);
      }
    }else if(data.error){
      errorToast(data.error);
      // history.push(`/PLANSTOQAAPPROVAL`);
    }
    })
    .catch((error) => {
    errorToast("Something went wrong, please try again after sometime");
    });
  }});
  };

  return (
    <Fragment>  
      <RefreshBlock />
      
      <br/>
      <CardComponent header="Plan STO PO Approval ">
      <Row>        
        <Col md="4" sm="12">
          <CustomDropdownInput label={"Plan Month"} id="PlanMonth" 
            url={`${apiBaseUrl}warehouse/master/getPlanMonth`} 
            style={{zIndex:'1000'}} 
            form={form} 
            onChange={ (e)=> onPlanMonthChange(e)}
            isDisabled
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
            isDisabled   
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
            isDisabled
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
            isDisabled  
          />
          <span id='Wheatvariety_Error' style={{color: 'red'}} ></span>
        </Col>
        <Col md="4" sm="12">
              <CustomDropdownInput label={"To WH.Name"} id="WareHouseTO"
                url={`${apiBaseUrl}marketdata/master/getwarehouses`} 
                form={form} 
                onChange={onWarehouseChangeTO}
                options={WarehoseOptionsTo}
                isDisabled
              />
              <span id='WareHouse_Error' style={{color: 'red'}} ></span>
        </Col>
        <Col md="4" sm="12">
            <CustomDropdownInput
                  options={WhPlantOptionsTo}
                  id={"plantidTO"}  
                  label={"To Plant"}
                  className="react-select"
                  classNamePrefix="select"
                  form={form}
                  onChange={(e) => onPlantChangeTO(e)}
                  isDisabled
                />
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
                isDisabled
              />
        </Col>
        
        <Col md="4" sm="12">
          <CustomTextInput  label={"Segment"} id="Segment" form={form} type="text" disabled/>
        </Col>
        <Col md="4" sm="12">
          <CustomTextInput  label={"Moving Stock Qty Per Kg"} id="qty" form={form} type="text" disabled/>
        </Col>
      
        {/* <Col md="4" sm="12">
              <CustomDropdownInput label={"Freight Vendor"} id="Freight"
                url={`${apiBaseUrl}warehouse/STOPODeliveryPlan/getVendorDetails`} 
                form={form} 
                onChange={onVendorChange}
                // options={WarehoseOptionsTo}
                isDisabled
              />
        </Col> */}
        {/* {form.values.Freight &&
        <Col md="4" sm="12">
          <CustomTextInput  label={"Freight Vendor Code"} id="FreightVendor"  form={form} type="text" disabled/>
        </Col>} */}
        {form.values.Freight &&
        <Col md="4" sm="12">
          <CustomTextInput  label={"Freight Cost Per Ton"} id="FreightCost" maxLength="7" form={form} type="text" disabled/>
        </Col>}
        {/* {form.values.LoadCost &&
        <Col md="4" sm="12">

             <CustomDropdownInput label={"Loading Vendor"} id="Loading"
                url={`${apiBaseUrl}warehouse/STOPODeliveryPlan/getVendorDetailsLoading`} 
                form={form} 
                onChange={onVendorChangeLoading}
                // options={WarehoseOptionsTo}
                isDisabled
              />
        </Col>} */}
        {/* {form.values.LoadCost &&
        <Col md="4" sm="12">
          <CustomTextInput  label={"Loading Vendor Code"} id="LoadingVendor"  form={form}  type="text" disabled/>
        </Col>} */}
        {form.values.LoadCost &&
        <Col md="4" sm="12">
          <CustomTextInput  label={"Loading Cost Per Ton"} id="LoadCost" form={form} maxLength="7" type="text"disabled/>
        </Col>}
        {/* {form.values.UnloadCost &&
        <Col md="4" sm="12">
            <CustomDropdownInput label={"Unloading Vendor"} id="Unloading"
                url={`${apiBaseUrl}warehouse/STOPODeliveryPlan/getVendorDetailsUnloading`} 
                form={form} 
                onChange={onVendorChangeUnloading}
                // options={WarehoseOptionsTo}
                isDisabled
            />
        </Col>} */}
        {/* {form.values.UnloadCost &&
        <Col md="4" sm="12">
          <CustomTextInput  label={"Unloading Vendor Code"} id="UnloadingVendor" form={form} type="text" disabled/>
        </Col>} */}
        {form.values.UnloadCost &&
        <Col md="4" sm="12">
          <CustomTextInput  label={"Unloading Cost Per Ton"} id="UnloadCost" form={form} maxLength="7" type="text" disabled/>
        </Col>}
        <Col md="12" sm="12">
          <CustomTextInput  label={"Reject Reason"} id="reject_reason" form={form} maxLength="50" type="text"/>
        </Col>
        </Row>
        <Row>
        {form.values.status == 1 &&
        <Col align="left">
          <Button onClick={(e) => onSubmit(0,1)} color="danger">Reject</Button>
        </Col>}
        {form.values.status == 1 &&
        <Col align="right">
          <Button onClick={(e) => onSubmit(2)} className = "ml-2" color="primary">Approve</Button>
        </Col>}
        {form.values.status == 2 &&
        <Col align="left">
          <Button onClick={(e) => onSubmit(0,2)} color="danger">Reject</Button>
        </Col>}
        {form.values.status == 2 &&  
        <Col align="right">
          <Button onClick={(e) => onSubmit(3)} className = "ml-2" color="primary">Approve</Button>
        </Col>}    
      </Row>
      </CardComponent>
     </Fragment>
  );
};

export default PlanSTOCreationEdit;
