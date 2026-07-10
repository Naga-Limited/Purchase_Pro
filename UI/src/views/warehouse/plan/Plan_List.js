import { Button, Row, Col } from "reactstrap";
import React, { useState,Fragment } from "react";
import { useHistory } from "react-router-dom";
import { CardComponent } from "../../common/CardComponent";
import { useFormik } from "formik";
import { validation, Yup,CustomDropdownInput } from "../../forms/custom-form";
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

const Plan_List = ({ isViewOnly, title, returnUrl, status }) => {
  const history = useHistory();
  const [MonthList, setMonthList] = useState([]);
  const [StorageLocation, setStorageLocation] = useState([]);
  const [PlantOptions, setPlantOptions] = useState([]);
  const [WarehouseOptions, setWarehouseOptions] = useState([]);
  const [WheatVarity, setWheatVarity] = useState([]);
  const [FilterData, setFilterData] = useState({ ...filter_Id });  
  const [tableFilterNew, setTableFilterNew]=useState([]);
  
  const form = useFormik({
    isInitialValid: false,
    initialValues: {},
    validationSchema: Yup.object().shape({
      date: validation.required({ isObject: true }),
    }),

  });

  let values = form.values;
  let tableFilter = {
    screenType:"PLAN_LIST",
    Lotid:values.lotno,
    StorageLocationid:values.storagelocation,
    Plantid:values.plant,
    Warehouseid:values.warehouse,
    Wheatvarietyid:values.wheatvariety,
  };
  console.log("FILTER => ",tableFilter);
  
  const onUpdateStatus = (id) => {
    history.push(`/AP:${id}`);
  };
  const AddNewPlan = () => {
    history.push(`/warehouse/PLan_EntryScreen`);
  }
  const openAttach = (url) => {
    //window.open(previewUrl + url, "_blank");
    window.open(previewUrl +"pdfview.php?fn="+ url, "_blank");
  };

  const onPlanMonthChange = (e) =>{
    let {value, label}=e;
    let year=value.split("-")[1];
    let month=value.split("-")[0];
    let MonthIdx = MonthArray.indexOf(month)+1;
    let ToDate;
    let FromDate;

    if(MonthIdx>9){
     ToDate=year + "-"+MonthIdx+"-"+LastDayOfMonth(year, MonthIdx-1);
     FromDate=year + "-"+MonthIdx+"-01";
    }else{
      ToDate=year + "-0"+MonthIdx+"-"+LastDayOfMonth(year, MonthIdx-1);
      FromDate=year + "-0"+MonthIdx+"-01";
    }
    form.setFieldValue("ValidFrom",FromDate);
    form.setFieldValue("ValidTo",ToDate);
    form.setFieldValue("PlanMonth",{label:label,value:value});

    //Week No Auto Fetch
    var dt1 = new Date(FromDate);
    const wkno = getWeek(dt1);
    form.setFieldValue('WeekNo', {  label: "W-"+wkno,value: wkno });
    
    //alert(FromDate);
    planMonthList(FromDate);
    setTableFilterNew({
      screenType:"PLAN_LIST",
      Lotid:form.values.lotno,
      StorageLocationid:form.values.storagelocation,
      Plantid:form.values.plant,
      Warehouseid:form.values.warehouse,
      Wheatvarietyid:form.values.wheatvariety});
    //ClearDropdown("MONTH");
    //ClearDropdown("MONTH");
  }

  const getWeek = (dt1) => {
    var onejan = new Date(dt1.getFullYear(),0,1);
    var today = new Date(dt1.getFullYear(),dt1.getMonth(),dt1.getDate());
    var dayOfYear = ((today - onejan + 86400000)/86400000);
    return Math.ceil(dayOfYear/7)
  };

  const planMonthList = (inputDate)=>{
    var dateList = [];
    var Dt = new Date(inputDate);
    for (let i = 1; i <= 4; i++){ 
      const date = `${String(Dt.getFullYear()).padStart(2, '0')}-${String(Dt.getMonth()+i).padStart(2,'0')}-${String(Dt.getDate()).padStart(2,'0')}`;
      dateList.push(date);
    }
    console.log("DATE LIST ==> ",dateList);
    setMonthList(dateList);
    
  };

  const onLotChange = (e) => {
    const { value, label } = e;
    form.setFieldValue('lotno', { label: label,value: value });
    setFilterData({...FilterData, lot_id:value, lot_Name:label});
    getStorageLocationByLotId(value);
    planMonthList(form.values.ValidFrom);
    ClearDropdown("LOT");

  };

  const getStorageLocationByLotId = (paramId) => {
    let fdata = { 
      search_Id: paramId, 
      screenType: "RNDCONFIRMATION",
    };

    apiPostMethod(apiBaseUrl+'warehouse/RndConfirmationPlan/getStorageLocationByLotId', fdata)
      .then((response) => {
        const { data } = response;
        console.log("Response SubLot Data :: "+JSON.stringify(response));
        if (data.success) {
          setStorageLocation(data.results);
        }
      })
      .catch((error) => {
        errorToast("Something went wrong, please try again after sometime");
      });
  };

  const onStorageLocationChange = (e) => {
    const { value, label } = e;
    form.setFieldValue('storagelocation', { label: label,value: value });
    setFilterData({...FilterData, location_id:value, location_Name:label});
    getPlantByLocationId(value);
    ClearDropdown("SL");
  };

  const getPlantByLocationId = (paramId) => {
    let fdata = { 
      search_Id: paramId, 
      screenType: "RNDCONFIRMATION",
    };

    apiPostMethod(apiBaseUrl+'warehouse/RndConfirmationPlan/getPlantByLocationId', fdata)
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
    getWHByPlantId(value);
    ClearDropdown("PLANT");
  };

  const getWHByPlantId = (paramId) => {
    let fdata = { 
      search_Id: paramId, 
      screenType: "RNDCONFIRMATION",
    };

    apiPostMethod(apiBaseUrl+'warehouse/RndConfirmationPlan/getWHByPlantId', fdata)
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
    getWheatVariety(value);
  };

  const getWheatVariety = (paramId) => {
    let fdata = { 
      lot_id:form.values.lotno.value, 
      sl_id:form.values.storagelocation.value, 
      plant_id:form.values.plant.value, 
      wh_id:paramId,
      screenType: "RNDCONFIRMATION",
    };

    apiPostMethod(apiBaseUrl+'warehouse/RndConfirmationPlan/getWheatVariety', fdata)
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

  const onWheatvarietyChange = (e) => {
    const { value, label } = e;
    form.setFieldValue('wheatvariety', {  label: label,value: value });
    setFilterData({...FilterData, wheatvariety_id:value, wheatvariety_Name:label});
  };

  const ClearDropdown = (Item) => {
    if (Item === "MONTH"){
      form.setFieldValue('lotno', '');
      form.setFieldValue('storagelocation', '');
      form.setFieldValue('plant','');
      form.setFieldValue('warehouse', '');
      form.setFieldValue('wheatvariety', '');
    }else if (Item === "LOT"){
      form.setFieldValue('storagelocation', '');
      form.setFieldValue('plant','');
      form.setFieldValue('warehouse', '');
      form.setFieldValue('wheatvariety', '');
    }else if (Item === "SL"){
      form.setFieldValue('plant','');
      form.setFieldValue('warehouse', '');
      form.setFieldValue('wheatvariety', '');
    }else if (Item === "PLANT"){
      form.setFieldValue('warehouse', '');
      form.setFieldValue('wheatvariety', '');
    }else if (Item === "WH"){
      form.setFieldValue('wheatvariety', '');
    }
  }

  const FetchData=()=>{
    setTableFilterNew({
      screenType:"PLAN_LIST",
      Lotid:form.values.lotno,
      StorageLocationid:form.values.storagelocation,
      Plantid:form.values.plant,
      Warehouseid:form.values.warehouse,
      Wheatvarietyid:form.values.wheatvariety});
  }

  return (
    <Fragment>  
      <RefreshBlock />
      <Row> 
        <Col md="3" sm="12">
          <Button.Ripple  color="primary" block type="button" onClick={(e) => AddNewPlan()}>32 Bin Fillup Plan List</Button.Ripple>
        </Col>
      </Row>
     
      {/* <Row>
        <Col md="3" sm="12">
          <Button.Ripple  color="primary" block type="button" onClick={(e) => AddNewPlan()}>32 Bin Fillup Plan List</Button.Ripple>
        </Col>
      </Row> */}
      <br/>
      <CardComponent header="Planlist - Search by Filter">
      {/* <h5>Planlist - Search by Filter</h5> */}
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

        <Col md="4" sm="12" > 
          <CustomDropdownInput label={"Lot Number"} id="lotno" 
            url={`${apiBaseUrl}Warehouse/Master/getWHLotList_With_Plantid`} 
            form={form} 
            isMulti
            //options={WhLotOptions} 
            //onChange={(e) => onLotChange(e)}
          />
          <span id='lotno_Error' style={{color: 'red'}} ></span>
        </Col> 

        <Col md="4" sm="12">
          <CustomDropdownInput label={"Storage Location"}  id="storagelocation" 
            url={`${apiBaseUrl}Warehouse/Master/getstoragelocationlist`}
            form={form}
            isMulti
            //options ={StorageLocation}   
            //onChange = {(e) => onStorageLocationChange(e)}
          />
          <span id='storagelocation_Error' style={{color: 'red'}} ></span>
        </Col>
        </Row>
        <Row>
        <Col md="4" sm="12" > 
          <CustomDropdownInput label={"Plant Name"} id="plant" 
            url={`${apiBaseUrl}Warehouse/Master/getPlants`}
            form={form} 
            isMulti
            //options={PlantOptions} 
            //onChange={(e) => onPlantChange(e)}
          />
          <span id='plant_Error' style={{color: 'red'}} ></span>
        </Col>  

        <Col md="4" sm="12">
          <CustomDropdownInput label={"Warehouse Name"} id="warehouse"  
            url={`${apiBaseUrl}Warehouse/Master/getWarehouse`}
            form={form}
            isMulti
            //options ={WarehouseOptions}   
            //onChange = {(e) => onWarehouseChange(e)}   
          />
          <span id='Warehouse_Error' style={{color: 'red'}} ></span>
        </Col>   
        
        <Col md="4" sm="12">
          <CustomDropdownInput label={"Wheat variety"} id="wheatvariety" 
            url={`${apiBaseUrl}Warehouse/Master/getWheatVariety`} 
            form={form}
            isMulti
            //options ={WheatVarity}   
            //onChange = {(e) => onWheatvarietyChange(e)}   
          />
          <span id='Wheatvariety_Error' style={{color: 'red'}} ></span>
        </Col>  
        </Row>
        <Row>
        <Col md="12" sm="12" align="right">
          <Button onClick={FetchData} color="primary">Show</Button>
          <span id='Wheatvariety_Error' style={{color: 'red'}} ></span>
        </Col>  
      </Row>
      </CardComponent>
    

      {MonthList.map((confirmation_month) => {
        return( 
          <>
            <Row>  
              <Col>
                <Plan_STOPO_DeliveryCreation_Add
                  title={'Plan List'}
                  screenType="CONFIRMATION" 
                  form={form}
                  url={`${apiBaseUrl}warehouse/RndConfirmationPlan/getWarehousePlanList`} 
                  monthyear = {confirmation_month} 
                  postData ={tableFilterNew}
                  FetchData = {FetchData}
                />
              </Col>
            </Row>
            <br/>
          </>
        )})}      

      {/*     
      <WeeklyPlanListTable
        hideFilter={true}
        formType={"Creation"}
        postData={tableFilter}
        ScreenName={"Wheat Movement Weekly Plan"}
        actionCell={actionsCol}
        title={"Wheat Movement Weekly Plan"}
        actionColumnWidth={"100px"}
      /> 
      */}
     </Fragment>
  );
};

export default Plan_List;
