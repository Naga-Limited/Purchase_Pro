import React, { Fragment, useEffect, useState } from "react";
import { useFormik } from "formik";
import { validation, Yup } from "../../forms/custom-form";
import { useHistory, useParams } from "react-router";
import { apiBaseUrl } from "../../../urlConstants";
import { Paperclip, X, Plus } from "react-feather";
import { useLoader } from "../../../utility/hooks/useLoader";
import { addOption } from "../../common/Utils";
import { RefreshBlock } from "../../common/RefreshBlock";
import { apiPostMethod } from "@helpers/axiosHelper";
import { errorToast, ShowToast } from "@helpers/appHelper";
import { CardComponent } from "../../common/CardComponent";
import moment from "moment"; 
import { Row, Col,Button,Table,FormGroup } from "reactstrap";
import { CustomDropdownInput, CustomTextInput } from "../../forms/custom-form";
import { MonthArray, LastDayOfMonth } from "./../common/appHelper";
import { LotInformation_Planned_Unplanned } from "./../WarehouseDropdownList";

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
  PlanMonth:"",
  screenType:"PLANED_AND_UNPLANED",
}

const DivisionOptions = [
  {
    options: [
      { value: "NAGA", label: "NAGA"},
      { value: "MMD", label: "MMD" },
    ],
  },
];

const LotInformationPlannedUnplannedData = ({ form }) => {
  const history = useHistory();
  const [WheatVarity, setWheatVarity] = useState([]);
  const [WhLotOptions, setWhLotOptions] = useState([]);
  const [StorageLocation, setStorageLocation] = useState([]);
  const [PlantOptions, setPlantOptions] = useState([]);
  const [WarehouseOptions, setWarehouseOptions] = useState([]);
  const [MonthList, setMonthList] = useState([]);
  const [FilterData, setFilterData] = useState({ ...filter_Id }); 
  const [tableFilterNew, setTableFilterNew]=useState([]);

  let { id } = useParams();
  let refid='';
  if(id){
  refid = id.replace(":", "");
  }

/*
  let { showLoader, hideLoader } = useLoader();
  useEffect(() => {
    planMonthList(form.values.ValidFrom);
  }, []);

  const onFetchLotById=()=>{
    let fdata ={
      id: refid,
    };
    showLoader();
    apiPostMethod(apiBaseUrl + "Warehouse/Master/getWHLotList", fdata)
      .then((response)=>{
        const {data} = response;
        console.log("Response Lot Data :: "+JSON.stringify(response));

        if (data.success){
          ShowToast("Data Sucessfully Loaded");
          form.setValues({
            ...form.values,
          });
          setWhLotOptions(data.results);
        }
      })
    .catch((error) => {
      errorToast("Something went wrong, please try again after sometime...");
    })
    .finally((a) => {
      hideLoader();
    });
  }
*/
let values = form.values;
let tableFilter = {
  screenType:"PLANED_AND_UNPLANED",
  Lotid:values.lotno,
  StorageLocationid:values.storagelocation,
  Plantid:values.plant,
  Warehouseid:values.warehouse,
  Wheatvarietyid:values.wheatvariety,
  Division:values.division
};
console.log("FILTER => ",tableFilter);

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
      screenType: "PLANED_AND_UNPLANED",
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
      screenType: "PLANED_AND_UNPLANED",
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
      screenType: "PLANED_AND_UNPLANED",
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
      screenType: "PLANED_AND_UNPLANED",
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

  const planMonthList = (inputDate)=>{
    var dateList = [];
    var Dt = new Date(inputDate);
    for (let i = 1; i <= 4; i++) {
      /*
      //const date = `${Dt.getDate()}-${Dt.getMonth()+i}-${Dt.getFullYear()}`;
      //String(number).padStart(2, '0')

      current.setMonth(current.getMonth()-1);
      const previousMonth = current.toLocaleString('default', { month: 'long' });
      console.log(previousMonth); // "September"
      */
      const date = `${String(Dt.getFullYear()).padStart(2, '0')}-${String(Dt.getMonth()+i).padStart(2,'0')}-${String(Dt.getDate()).padStart(2,'0')}`;
      dateList.push(date);
      //alert(date, " #" ,inputDate);
    }
    console.log(dateList);
    setMonthList(dateList);
  };

  const FetchData=()=>{
    
    setTableFilterNew({
      screenType:"PLANED_AND_UNPLANED1",
      MonthYear:form.values.PlanMonth,
      Lotid:form.values.lotno,
      StorageLocationid:form.values.storagelocation,
      Plantid:form.values.plant,
      Warehouseid:form.values.warehouse,
      Wheatvarietyid:form.values.wheatvariety,
      Division:form.values.division
    });
    
  }

  const onPlanMonthChange = (e) =>{
    ////form.setFieldValue("PlanMonth",FromDate);
    /*
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
    ////planMonthList(FromDate);
    console.log("MONTH",e.value);
    setTableFilterNew({
      screenType:"PLANED_AND_UNPLANED",
      MonthYear:e.value,
      Lotid:form.values.lotno,
      StorageLocationid:form.values.storagelocation,
      Plantid:form.values.plant,
      Warehouseid:form.values.warehouse,
      Wheatvarietyid:form.values.wheatvariety});
      */
    //ClearDropdown("MONTH");
    //ClearDropdown("MONTH");
  }
  const getWeek = (dt1) => {
    var onejan = new Date(dt1.getFullYear(),0,1);
    var today = new Date(dt1.getFullYear(),dt1.getMonth(),dt1.getDate());
    var dayOfYear = ((today - onejan + 86400000)/86400000);
    return Math.ceil(dayOfYear/7)
  };


  return ( 
    <Fragment >  
      <Row>              
        <Col md="4" sm="12">
          <CustomDropdownInput label={"Plan Month"} id="PlanMonth" 
            url={`${apiBaseUrl}warehouse/master/getPlanMonth`} 
            // style={{zIndex:'1000'}} 
            form={form} 
            isMulti
            // onChange={ (e)=> onPlanMonthChange(e)}
          />
          <span id='PlanMonth_Error' style={{color: 'red'}} ></span> 
          </Col>
      </Row>

      <Row>              
        <Col md="4" sm="12">
          <CustomDropdownInput label={"Division"} id="division" 
            form={form}
            options ={DivisionOptions} 
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

      <Row> 
        <Col>
          {/* # Current Month Table => Month 1 # */}
          <LotInformation_Planned_Unplanned
            title={'Lot Information Planned'}
            screenType="PLANED_AND_UNPLANED" 
            form={form}
            // url={`${apiBaseUrl}warehouse/master/getWarehousePlanUnPlanList`} 
            url={`${apiBaseUrl}warehouse/RndConfirmationPlan/getWarehousePlanUnPlanList`} 
            postData ={tableFilterNew}
            id="LotInfoPlanned"
          />
        </Col>
      </Row>
      <Row> 
        <Col>
          {/* # Current Month Table => Month 1 # */}
          <LotInformation_Planned_Unplanned
            title={'Lot Information Unplanned'}
            screenType="PLANED_AND_UNPLANED" 
            form={form}
            // url={`${apiBaseUrl}warehouse/master/getWarehouseUnPlanList`} 
            url={`${apiBaseUrl}warehouse/RndConfirmationPlan/getWarehouseUnPlanList`} 
            id="LotInfoUnPlanned"
          />
        </Col>
      </Row>   
    </Fragment>

  );
};


const LotInformationPlannedUnplanned = () => {
  const { showLoader, hideLoader } = useLoader();
  const dateFormat = "YYYY-MM-DD";
  const today = moment().format(dateFormat);
  const isToday = (date) => {
    return moment(date).format(dateFormat) == today;
  };
  const form = useFormik({
    initialErrors: false,
    initialValues: {},
    validationSchema: Yup.object().shape({
      // PlanMonth: validation.required({ message:"Date should not be empty", isObject: true }),
      // date: validation.required({ message:"Date should not be empty", isObject: false }),
      // date: validation.required({ message:"Date should not be empty", isObject: false }),
      // date: validation.required({ message:"Date should not be empty", isObject: false }),
      // date: validation.required({ message:"Date should not be empty", isObject: false }),


      /*From_Location: validation.required({  message:"From Location should not be empty",isObject: true }),
      To_Location: validation.required({ message:"To Location should not be empty", isObject: false }),
      Mode_Of_Transport: validation.required({ message:"Mode of Transport should not be empty", isObject: false }),
      EAD: validation.required({  message:"Ead should not be empty",isObject: false  }),*/
    }),
    onSubmit(values) {},
  });
  const values = form.values;
  
  const history = useHistory();
  const resetForm = () => {
    history.push(`/master/STOPODeliveryCreationApproval`);
  };
 
  return (
    <Fragment >
       
      <CardComponent header="Planned And Unplanned Lot Information" >    
       <RefreshBlock /> 
        <LotInformationPlannedUnplannedData form={form}  />
      </CardComponent>
    </Fragment>
  );
};

export default LotInformationPlannedUnplanned;
