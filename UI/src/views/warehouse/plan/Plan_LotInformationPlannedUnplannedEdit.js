import React, { Fragment, useEffect, useState } from "react";
import { useFormik } from "formik";
import { validation, Yup } from "../../forms/custom-form";
import { useHistory, useParams } from "react-router";
import { apiBaseUrl } from "../../../urlConstants";
import { Paperclip, X, Plus, Save } from "react-feather";
import { useLoader } from "../../../utility/hooks/useLoader";
import { addOption } from "../../common/Utils";
import { RefreshBlock } from "../../common/RefreshBlock";
import { apiPostMethod } from "@helpers/axiosHelper";
import { errorToast, ShowToast } from "@helpers/appHelper";
import { CancelSubmitButtons } from "../../forms/custom-button";
import { CardComponent } from "../../common/CardComponent";
import moment from "moment";
////import STOPODeliveryCreationEditForm from "./STOPODeliveryCreationEditForm";
import { Row, Col, Button, Table, FormGroup, Label, CustomInput } from "reactstrap";
import { Link } from "react-router-dom";
import { CustomDropdownInput, CustomTextInput } from "../../forms/custom-form";
import Select from "react-select";
import { MonthArray, LastDayOfMonth } from "./../common/appHelper";
import { WarehousePlanList, WarehousePlanList_Edit } from "./../WarehouseDropdownList";
import { forEach, isNull } from "lodash";
import { useLocation } from "react-router-dom";
import { check } from "prettier";

const Division = [
  {
    options: [
      { value: "1", label: "NAGA" },
      { value: "2", label: "MMD" },
    ],
  },
];

const Plan_LotInformationPlannedUnplannedEdit = ({ form, pRec_data }) => {

  const history = useHistory();
  const [WarehoseOptions, setWarehouseOptions] = useState([]);
  const [PlanDatas, setPlanData] = useState([]);
  const [WhPlantOptions, setWhPlantOptions] = useState([]);
  const [WhLotOptions, setWhLotOptions] = useState([]);
  const [WhWheatvarietyOptions, setWhWheetVarietyOptions] = useState([]);
  const [storageLocationOption, setstorageLocationOption] = useState([]);
  const [MonthList, setMonthList] = useState([]);

  let Rec_data = [];
  
  Rec_data.push(...pRec_data)

  console.log("Received useParams Data : ", pRec_data);

  let { id } = useParams();
  let refid = '';
  if (id) {
    refid = id.replace(":", "");
  }
  let { showLoader, hideLoader } = useLoader();

  // const CheckPlanLotDuplicate = async () => {

  //   let fdata = {
  //     PlanMonth: form.values.ValidFrom,
  //     warehouseid: form.values.WareHouse.value,
  //     plantid: form.values.plantid.value,
  //     storagelocationid: form.values.storagelocationid.value,
  //     lotid: form.values.LotNumber.value,
  //     wheatvarietyid: form.values.WheatVariety.value,
  //   };

  //   let TmpPlanDatas = [];
  //   console.log(JSON.stringify(PlanDatas));

  //   TmpPlanDatas = [...PlanDatas];
  //   showLoader();
  //   //alert("ok")
  //   let retval = false;

  //   await apiPostMethod(apiBaseUrl + "warehouse/STOPODeliveryPlan/checkPlanLotDuplicate", fdata)
  //     .then((response) => {
  //       const { data } = response;
  //       console.log(data.DuplicateRecord);
  //       if (data.success) {
  //         if (parseInt(data.DuplicateRecord) > 0) {
  //           //errorToast("Plan already for this wheat variety/lot ");
  //           retval = false;
  //         }else {
  //           retval = true;
  //         }
  //       }
  //     })
  //     .catch((error) => {
  //       errorToast("Something went wrong, please try again after sometime");
  //       return false;
  //     })
  //     .finally((a) => {
  //       hideLoader();
  //       //return retval;  
  //     });

  //   // Mohan 02062022 Checking in Local table please dont change the position to top of API Call, it will not work sometimes
  //   const filteredUsers = TmpPlanDatas.filter(item => {
  //     return (
  //       item.ValidFrom.indexOf(fdata.PlanMonth) >= 0
  //       && item.WareHouse.indexOf(fdata.warehouseid) >= 0
  //       && item.Plant.indexOf(fdata.plantid) >= 0
  //       && item.LotNumber.indexOf(fdata.lotid) >= 0
  //       && item.StorageLocation.indexOf(fdata.storagelocationid) >= 0
  //       && item.WheatVariety.indexOf(fdata.wheatvarietyid) >= 0
  //     )
  //   })
  //   // console.log(filteredUsers);
  //   //return false;
  //   if (filteredUsers.length > 0) {
  //     retval = false;
  //   }
  //   return retval;
  // };

  // const CheckTblRecord = async () => {
  //   showError('PlanMonth_Error', '', 0);
   
  //   let RetFalse = 0;

  //   const NotDuplicateRecord = await CheckPlanLotDuplicate();
  //   if (NotDuplicateRecord == false) { showError('PlanMonth_Error', 'Lot/Wheat variety already exists', 1); RetFalse = 1; }

  //   if (RetFalse == 1) {
  //     return false;
  //   }else{
  //     return true;
  //   }
  // };

  const showError = (Id, Msg, show) => {
    if (document.getElementById(Id)) {
      document.getElementById(Id).innerHTML = "";
      if (show == 1) {
        console.log("SHOW ERROR:" + Id);
        document.getElementById(Id).innerHTML = Msg;
      }
    }
  }

  const onDateChange = (e) => {
    console.log(e.target.value);
    var dt1 = new Date(e.target.value);
    const wkno = getWeek(dt1);
    console.log("WeekNo" + wkno);
    //form.values.date=e.target.value; PVS Date

    form.values.ValidFrom = e.target.value;
    let result = new Date(e.target.value);
    console.log("Valid From",e.target.value);
    //const dateFormat = "YYYY-MM-DD";
    for (let i = 1; i <= 7; i++) {
      result.setDate(result.getDate() + 1);

      if (result.getDay() == 6) {
        console.log(result);
        console.log(result.getDay());
        let month = (result.getMonth()) + 1;
        if (month < 10) {
          month = 0 + "" + month;
        }
        let dt = result.getDate();
        if (dt < 10) {
          dt = 0 + "" + dt;
        }

        form.values.ValidTo = result.getFullYear() + "-" + month + "-" + dt;
      }
    }

    form.setFieldValue('WeekNo', { label: "W-" + wkno, value: wkno });
    console.log("WeekNo 1 " + getWeek(dt1));
  };

  function getDifferenceInDays(date1, date2) {
    const diffInMs = Math.abs(date2 - date1);
    return diffInMs / (1000 * 60 * 60 * 24);
  }

  const getMoveQty = (e) => {
    let newDate = new Date();
    let ValidFromDt = new Date(form.values.ValidFrom);
    console.log(newDate)
    console.log(ValidFromDt);
    let Diff = getDifferenceInDays(newDate, ValidFromDt);
    Diff = Math.ceil(Diff);
    Diff = parseFloat(Diff) + 1;

    console.log(Diff);
    let MinQty = form.values.ActualStock;

    if (Diff >= 7 || 1 == 1) {  // 1==1 => Always true weekwise validation not required
      //MinQty=form.values.ActualStock;
      console.log(MinQty, e.target.value);
      // if(parseFloat(e.target.value) > parseFloat(MinQty)){
      //   errorToast("Movement Qty Less than or Equal to  "+ MinQty);
      //   return false;
      // }

      form.setValues({
        ...form.values,
        MovementQty: e.target.value
      })
      return false;
    } else {

      if ((parseFloat(form.values.FumigationClearedQty) < parseFloat(MinQty)) && (form.values.FumigationSkipFlag == 0)) {
        MinQty = form.values.FumigationClearedQty;
        console.log("Fumiation  Qty")
      }

      if ((parseFloat(form.values.RandDConfirmedQty) < parseFloat(MinQty)) && (form.values.RndSkipFlag == 0)) {
        MinQty = form.values.RandDConfirmedQty
        console.log("RND Qty")
      }
      if (parseFloat(form.values.KeyLoanDOQty) < parseFloat(MinQty)) {
        MinQty = form.values.KeyLoanDOQty
        console.log("Key loan Qty")
      }
      if (parseFloat(e.target.value) > parseFloat(MinQty)) {
        errorToast("Movement Qty Less than or Equal to  " + MinQty);
        return false;
      }

      form.setValues({
        ...form.values,
        MovementQty: e.target.value
      })
    }
  }


  const getActualQty = (e) => {
    let ActualMovementQty1 = (e.target.value / 100) * form.values.MovementQty;
    //let ActualMovementQty1=(e.target.value/100)*form.values.KeyLoanDOQty;
    let totalQty = ActualMovementQty1;
    for (let i = 0; i < PlanDatas.length; i++) {
      totalQty = parseFloat(PlanDatas[i].ActualMovementQty) + parseFloat(totalQty);
    }
    if (totalQty > form.values.MovementQty) {
      errorToast("Invalid Mixing %, Actual Qty is Greater than Movement Qty");
      return false;
    }

    form.setValues({
      ...form.values,
      MixingRatio: e.target.value,
      ActualMovementQty: ActualMovementQty1
    })
  }
  const onWheatvarietyChange = (e) => {
    const { value, label } = e;

    //FillWheatVarityList(value);
    //getSublotData(label,value);
    Fill_WH_Plant_Lot_Wheatvariety(e.value, e.label);
  };

  const Fill_WH_Plant_Lot_Wheatvariety = (pWheatVarietyId, pWheatVarietyName) => {
    let fdata = { WheatVarietyId: pWheatVarietyId, screenType: "WEEKLYPLAN" };

    //apiPostMethod(apiBaseUrl+'warehouse/master/getWH_Plant_Lot_Wheatvariety', fdata)getWH_Plant_SL_Lot_WheatvarietyId
    apiPostMethod(apiBaseUrl + 'warehouse/master/getWH_Plant_SL_Lot_WheatvarietyId', fdata)
      .then((response) => {
        const { data } = response;
        if (data.success) {
          setWarehouseOptions([{ options: data.results.warehouse }]);
          setWhPlantOptions([{ options: data.results.plant }]);
          setstorageLocationOption([{ options: data.results.slocation }]);
          setWhLotOptions([{ options: data.results.lot }]);
          form.setFieldValue("WheatVariety", { value: pWheatVarietyId, label: pWheatVarietyName })
          form.setFieldValue('WareHouse', {});
          form.setFieldValue('plantid', {});
          form.setFieldValue('storagelocationid', {});
          form.setFieldValue('LotNumber', {});

        }
      })
      .catch((error) => {
        errorToast("Something went wrong, please try again after sometime");
      });
  };


  const getSublotData = (WheatVarietyId, WheatVariety, LotNo, LotId) => {
    let fdata = {
      //warehouseid: form.values.WareHouse.value, 
      //plantid: form.values.plantid.value, 
      lotid: LotId,
      WheatVarietyId: WheatVarietyId,
      screenType: "WEEKLYPLAN",
    };

    apiPostMethod(apiBaseUrl + 'warehouse/STOPODeliveryPlan/getsublotDet', fdata)
      .then((response) => {
        const { data } = response;
        if (data.success) {
          // setWhWheetVarietyOptions([{ options: data.results }]); parseFloat(myNumber).toFixed(2)
          form.setValues({
            ...form.values,

            ActualStock: parseFloat(data.results[0].SAP_Qty).toFixed(3),

            RandDConfirmedQty: data.results[0].Rndreleasedqty,
            FumigationClearedQty: data.results[0].FumigationClearedQty,
            KeyLoanDOQty: data.results[0].Unpledgeqty,

            ReservedQty: data.results[0].Reserved_Stock,
            AvailableQty: parseFloat(data.results[0].SAP_Qty) - parseFloat(data.results[0].Reserved_Stock),
            FumigationSkipFlag: data.results[0].FumigationSkipFlag,
            RndSkipFlag: data.results[0].RndSkipFlag,
          })
          let locationoption = [], warehouseoption = [], plantoption = [], r = 0;
          for (r = 0; r < data.results.length; r++) {
            locationoption.push({ label: data.results[r].STORAGE_LOCATION, value: data.results[r].StorageLocationId });
            warehouseoption.push({ label: data.results[r].WH_NAME, value: data.results[r].warehouseid });
            plantoption.push({ label: data.results[r].PLANT_NAME, value: data.results[r].plantid });
          }
          setstorageLocationOption(locationoption);
          setWhPlantOptions(plantoption);
          setWarehouseOptions(warehouseoption);

          form.setFieldValue('WareHouse', { label: data.results[0].WH_NAME, value: data.results[0].warehouseid });
          form.setFieldValue('plantid', { label: data.results[0].PLANT_NAME, value: data.results[0].plantid });
          form.setFieldValue('storagelocationid', { label: data.results[0].STORAGE_LOCATION, value: data.results[0].StorageLocationId });
          form.setFieldValue('LotNumber', { label: LotNo, value: LotId });
        }
      })
      .catch((error) => {
        errorToast("Something went wrong, please try again after sometime");
      });
  };

  const getWeek = (dt1) => {
    var onejan = new Date(dt1.getFullYear(), 0, 1);
    var today = new Date(dt1.getFullYear(), dt1.getMonth(), dt1.getDate());
    var dayOfYear = ((today - onejan + 86400000) / 86400000);
    return Math.ceil(dayOfYear / 7)
  };

  const onPlanMonthChange = (e) => {
    let { value, label } = e;
    let year = value.split("-")[1];
    let month = value.split("-")[0];
    let MonthIdx = MonthArray.indexOf(month) + 1;
    let ToDate;
    let FromDate;
    if (MonthIdx > 9) {
      ToDate = year + "-" + MonthIdx + "-" + LastDayOfMonth(year, MonthIdx - 1);
      FromDate = year + "-" + MonthIdx + "-01";
    }
    else {
      ToDate = year + "-0" + MonthIdx + "-" + LastDayOfMonth(year, MonthIdx - 1);
      FromDate = year + "-0" + MonthIdx + "-01";
    }
    form.setFieldValue("ValidFrom", FromDate);
    form.setFieldValue("ValidTo", ToDate);
    form.setFieldValue("PlanMonth", { label: label, value: value });

    //Week No Auto Fetch
    var dt1 = new Date(FromDate);
    const wkno = getWeek(dt1);
    form.setFieldValue('WeekNo', { label: "W-" + wkno, value: wkno });

    planMonthList(FromDate);
  }

  const planMonthList = (inputDate) => {
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
      const date = `${String(Dt.getFullYear()).padStart(2, '0')}-${String(Dt.getMonth() + i).padStart(2, '0')}-${String(Dt.getDate()).padStart(2, '0')}`;
      dateList.push(date);
      //alert(date, " #" ,inputDate);
    }
    console.log(dateList);
    setMonthList(dateList);
  };

  const Save = () => {
    console.log("SAVED");
    // console.log("TEST 0001", Rec_data);

    //check Duplication
    //CheckTblRecord();

    let PlanDatas = { ...Rec_data };
    let planDt = "";
    let CrntDt = "";

    for (let i = 0; i < Rec_data.length; i++) {

      if (form.values["PlanMonth_" + i]) PlanDatas[i].PlanMonth = form.values["PlanMonth_" + i].label;
      if (form.values["Division_" + i]) PlanDatas[i].Division = form.values["Division_" + i].label;
      if (form.values["ReceivingBin_" + i]) PlanDatas[i].ReceivingBinId = form.values["ReceivingBin_" + i].value;
      if (form.values["MovementQty_" + i]) PlanDatas[i].Movement_Qty = form.values["MovementQty_" + i];
      if (form.values["ExpectedArrival_" + i]) PlanDatas[i].Expected_Arrival = form.values["ExpectedArrival_" + i];

      planDt = "01-" + PlanDatas[i].PlanMonth;
      console.log("PlanDate", planDt);
      PlanDatas[i].plandate = moment(planDt).format('YYYY-MM-DD');
      PlanDatas[i].ValidFrom = moment(planDt).format('YYYY-MM-DD');
      
      // console.log("Valid From ", PlanDatas[i].ValidFrom);
      CrntDt = moment(planDt).format('YYYY-MM-DD');

      let year = CrntDt.split("-")[0];
      let month = CrntDt.split("-")[1];
      let MonthIdx = MonthArray.indexOf(month) ;
      let ToDate;
      ToDate = year + "-" + month + "-" + LastDayOfMonth(year, MonthIdx - 1);

      PlanDatas[i].ValidTo = ToDate;
      console.log("Valid To ", PlanDatas[i].ValidTo);
      var dt1 = new Date(CrntDt);
      const wkno = getWeek(dt1);
      form.setFieldValue('WeekNo', { label: "W-" + wkno, value: wkno });
    }

    const postdata = {
      PlanDatas
    }

    // console.log(JSON.stringify(postdata));
    console.log("postdata : ", postdata);

    showLoader();
    apiPostMethod(apiBaseUrl + "Warehouse/STOPODeliveryPlan/AddPlanPlannedUnplanned", postdata)
      .then((response) => {
        const { data } = response;
        console.log(JSON.stringify(response))
        console.log("RETURN DATA",data.success);

        if (data.success && data.success==1 ) {
          ShowToast("Saved Successfully...");
          history.push(`/warehouse/plan/LotInformationPlannedUnplanned`);
        } else {
          errorToast("Duplicates Not Allowed (OR) Enter Atleast One Entry");
        }
      })
      .catch((error) => {
        console.log(JSON.stringify(error))
        errorToast("Something went wrong, please try again after sometime");
      })
      .finally((a) => {
        hideLoader();
      });
  }


  const onSelectChange = (e, index) => {
    let k = 0;
    for (k = 0; k < Rec_data.length; k++) {
      if (index == k) {
        Rec_data[k].chkSelect = e.target.checked;
      }
    }
  }

  const onPlan_MonthChange = (e, index) => {
    let k = 0;
    for (k = 0; k < Rec_data.length; k++) {
      if (index == k) {
        Rec_data[k].PlanMonth = e.label;
        form.setFieldValue('PlanMonth_' + { k }, { label: e.label, value: e.value });
      }
    }
  }

  const onDivisionChange = (e, index) => {
    let k = 0;
    for (k = 0; k < Rec_data.length; k++) {
      if (index == k) {
        Rec_data[k].Division = e.label;
        form.setFieldValue('Division_' + { k }, { label: e.label, value: e.value });
      }
    }
  }

  const onBinChange = (e, index) => {
    let k = 0;
    for (k = 0; k < Rec_data.length; k++) {
      if (index == k) {
        Rec_data[k].ReceivingBinId = e.value;
        Rec_data[k].ReceivingBinName = e.label;
        form.setFieldValue('ReceivingBin_' + { k }, { label: e.label, value: e.value });
      }
    }
  }

  const onMovementQty = (e, index) => {
    let k = 0;
    //console.log("LEN",Rec_data.length);
    for (k = 0; k < Rec_data.length; k++) {
      if (index == k) {
        Rec_data[k].Movement_Qty = e.target.value;
        form.setFieldValue('MovementQty_' + { k }, e.target.value);
        //console.log("Get VAl:",e.target.value);
      }
    }
  }

  const onExpectedArrival = (e, index) => {
    let k = 0;
    //console.log("LEN",Rec_data.length);
    for (k = 0; k < Rec_data.length; k++) {
      if (index == k) {
        Rec_data[k].Expected_Arrival = e.target.value;
        form.setFieldValue('ExpectedArrival_' + { k }, e.target.value);
        console.log("Get VAl:", e.label);
      }
    }
  }



  return (
    <Fragment>

      {Rec_data.map((row, index) => (
        
        <CardComponent header={parseInt(index) + 1 + " : " + row.lotno + " "} >
          <div>
            {/* {console.log("Rec_data",Rec_data)} */}
            <Row>
              <Col md="2" sm="12">
                <CustomInput label={"Select"} id={`select_${index}`} 
                  type="checkbox" 
                  form={form} 
                  onChange ={(e) => onSelectChange(e, index)}
                />
                <span id='PlanMonth_Error' style={{color: 'red',}} ></span>
              </Col>

              <Col md="2" sm="12">
                <CustomDropdownInput label={"Plan Month"} id={`PlanMonth_${index}`}
                  url={`${apiBaseUrl}warehouse/master/getPlanMonth`}
                  style={{ zIndex: '1000' }}
                  form={form}
                  value={{ label: row.PlanMonth, value: row.PlanMonth }}
                  onChange={(e) => onPlan_MonthChange(e, index)}
                />
              </Col>

              <Col md="2" sm="12">
                <CustomDropdownInput label={"Division"} id={`Division_${index}`}
                  form={form}
                  options={Division}
                  value={{ label: row.Division, value: row.Division }}
                  onChange={(e) => onDivisionChange(e, index)}

                />
              </Col>

              <Col md="2" sm="12">
                <CustomDropdownInput label={"Receiving Bin"} id={`ReceivingBin_${index}`}
                  url={`${apiBaseUrl}warehouse/master/getReceivingBinwithValue`}
                  form={form}
                  //options={row.ReceivingBinName}
                  value={{ label: row.ReceivingBinName, value: row.ReceivingBinId }}
                  onChange={(e) => onBinChange(e, index)}
                //value={row.ReceivingBinName}
                />
              </Col>

              <Col md="2" sm="12">
                <CustomTextInput label={"Movement Qty"} form={form} id={`MovementQty_${index}`}
                  //onChange={(e) => getMoveQty(e)}
                  MinNumberVal={form.values.MinNumberQty ? form.values.MinNumberQty : "-1"}
                  type="text"
                  isNumberOnly
                  value={row.Movement_Qty}
                  onChange={(e) => onMovementQty(e, index)}
                />
              </Col>

              <Col md="2" sm="12">
                <CustomTextInput label={"Expected Arrival"} id={`ExpectedArrival_${index}`}
                  form={form}
                  type="text"
                  value={row.Expected_Arrival}
                  onChange={(e) => onExpectedArrival(e, index)}
                />
              </Col>
            </Row>

            <Row>
              <Col md="3" sm="12">
                <Label>Lot Number:{row.lotno}</Label><br />
                <CustomTextInput id={`lotno_${index}`}
                  form={form}
                  type="hidden"
                  value={row.lotno}
                />

                <Label id={`veriety_${index}`}>Variety: {row.WheatvarietyName}</Label><br />
              </Col>
              <Col md="3" sm="12">
                <Label id={`warehouse_${index}`}>Warehouse: {row.wh_name}</Label><br />
                <Label id={`plant_${index}`}>Plant: {row.plant_name}</Label><br />
                <Label id={`location_${index}`}>Location   : {row.storage_location}</Label>
              </Col>
              <Col md="3" sm="12">
                <Label id={`sap_${index}`}>SAP Qty: {row.SAP_Qty}</Label><br />
                <Label id={`reserve_${index}`}>Reserved Qty: {row.Reserved_Stock ? row.Reserved_Stock : 0}</Label><br />
                <Label id={`available_${index}`}>Available Qty: {row.AvailabelQty ? row.AvailabelQty : 0}</Label>
              </Col>
              <Col md="3" sm="12">
                <Label id={`qcqty_${index}`}>QC Cleared Qty: {row.QC_Cleared_Qty}</Label><br />
                <Label id={`doqty_${index}`}>DO Cleared Qty: {row.Keyloan_Cleared_Qty}</Label><br />
                <Label id={`fumiqty_${index}`}>Fumi. Cleared Qty: {row.Fumi_Cleared_Qty}</Label>
              </Col>
            </Row>
            <br />
          </div>
        </CardComponent>
      ))}

      <Button.Ripple color="primary" block type="button" onClick={() => Save()}>SAVE</Button.Ripple>

    </Fragment>
  );
};


const Plan_LotInformationPlannedUnplanned = () => {
  const { showLoader, hideLoader } = useLoader();
  const [ReceivedList, setReceivedList] = useState([]);
  const dateFormat = "YYYY-MM-DD";
  const today = moment().format(dateFormat);
  const isToday = (date) => {
    return moment(date).format(dateFormat) == today;
  };
  const form = useFormik({
    initialErrors: false,
    initialValues: {},
    validationSchema: Yup.object().shape({
      date: validation.required({ message: "Date should not be empty", isObject: false }),
      /*From_Location: validation.required({  message:"From Location should not be empty",isObject: true }),
      To_Location: validation.required({ message:"To Location should not be empty", isObject: false }),
      Mode_Of_Transport: validation.required({ message:"Mode of Transport should not be empty", isObject: false }),
      EAD: validation.required({  message:"Ead should not be empty",isObject: false  }),*/
    }),
    onSubmit(values) { },
  });

  const location = useLocation();
  useEffect(() => {
    setReceivedList(location.state.detail)
    console.log(location.state.detail);
  }, [location.state.detail]);

  
  return (
    newFunction()
  );

  function newFunction() {
    return <Fragment>
      <h4>Planned & Unplanned Lot Information</h4>
      {/* <RefreshBlock />  */}
      
      <Plan_LotInformationPlannedUnplannedEdit form={form} pRec_data={ReceivedList} />
    </Fragment>;
  }
};
export default Plan_LotInformationPlannedUnplanned;
