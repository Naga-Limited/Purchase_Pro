import React, { Fragment, useEffect, useState } from "react";
import { useFormik } from "formik";
import { validation, Yup } from "../forms/custom-form";
import { useHistory, useParams } from "react-router";
import { apiBaseUrl } from "../../urlConstants";
import { Paperclip, X, Plus } from "react-feather";
import { useLoader } from "../../utility/hooks/useLoader";
import { addOption } from "../common/Utils";
import { RefreshBlock } from "../common/RefreshBlock";
import { apiPostMethod } from "@helpers/axiosHelper";
import { errorToast, ShowToast } from "@helpers/appHelper";
import { CancelSubmitButtons } from "../forms/custom-button";
import { CardComponent } from "../common/CardComponent";
import moment from "moment";
////import STOPODeliveryCreationEditForm from "./STOPODeliveryCreationEditForm";
import { Row, Col, Button, Table, FormGroup } from "reactstrap";
import { Link } from "react-router-dom";
import { CustomDropdownInput, CustomTextInput } from "../forms/custom-form";
import Select from "react-select";

const STOPODeliveryCreationEditForm = ({ form }) => {
  const history = useHistory();
  const [PlanDatas, setPlanData] = useState([]);
  const [WhPlantOptions, setWhPlantOptions] = useState([]);
  const [toWhPlantOptions, settoWhPlantOptions] = useState([]);
  const [WhLotOptions, setWhLotOptions] = useState([]);
  const [toWhLotOptions, settoWhLotOptions] = useState([]);

  const [WhWheatvarietyOptions, setWhWheetVarietyOptions] = useState([]);
  const [storageLocationOption, setstorageLocationOption] = useState([]);
  const [tostorageLocationOption, settostorageLocationOption] = useState([]);

  //const {WH_CODE}=form.values.WH_CODE;

  let { id } = useParams();
  let refid = '';
  if (id) {
    refid = id.replace(":", "");
  }
  let { showLoader, hideLoader } = useLoader();
  useEffect(() => {

    onFetchSDIdetailsById();

  }, [id]);
  const getMovementGroupNumber = () => {
    let fdata = {
      id: refid,
    };
    showLoader();
    apiPostMethod(apiBaseUrl + "Warehouse/Master/getMovementGroupNumber", fdata)
      .then((response) => {
        const { data } = response;
        console.log(JSON.stringify(response));
        if (data.success) {
          form.setValues({
            MovementGroupNumber: data.results[0].MovementGroupNumber,
          })


        }
      })
      .catch((error) => {
        errorToast("Something went wrong, please try again after sometime...");
      })
      .finally((a) => {
        hideLoader();

      });
  };
  const onTextChange = (e, PKey, CheckList, Val, Ind) => {
    let KeyValue = e.target.value;
    if (isNaN(e.target.value)) {
      return false;
    }
    console.log(KeyValue);
    document.getElementById("MovementQty_" + Ind).value = KeyValue;
    for (let i = 0; i < CheckList.length; i++) {
      if (CheckList[i].planid == PKey) {

        CheckList[i].MovementQty = KeyValue;




      }
    }
    console.log(JSON.stringify(PlanDatas));
    form.setValues({ ...form.values, CheckList });
  }
  const onFetchSDIdetailsById = () => {
    let fdata = {
      Screen: "GTG_EDIT"
    };
    showLoader();
    //alert("ok")
    apiPostMethod(apiBaseUrl + "Warehouse/STOPODeliveryPlan/getGodowntoGodown", fdata)
      .then((response) => {
        const { data } = response;
        console.log(JSON.stringify(response));
        if (data.success) {

          let vd = [];
          let NewData = {};
          vd = [...PlanDatas];
          for (let i = 0; i < data.results.length; i++) {
            if (data.results[i].planid != refid) {
              NewData = {
                planid: data.results[i].planid,
                MovementGroupNumber: data.results[i].MovementGroupNumber,
                WeekNo: data.results[i].WeekNo, WeekNoName: data.results[i].WeekNoName,
                date: data.results[i].date,
                WareHouse: data.results[i].WareHouse, WareHouseName: data.results[i].WareHouseName,
                fromplantid: data.results[i].planid, PlantName: data.results[i].PLANT_NAME,

                storagelocationid: data.results[i].fromlocationid, StorageLocationName: data.results[i].StorageLocationName,
                WheatVariety: data.results[i].WheatVariety, WheatVarietyName: data.results[i].WheatVarietyName,
                ActualStock: data.results[i].ActualStock,
                RandDConfirmedQty: data.results[i].RandDConfirmedQty,
                LotNumber: data.results[i].LotNumber, LotNumberName: data.results[i].LotNumberName,
                FumigationClearedQty: data.results[i].FumigationClearedQty,
                Division: data.results[i].Division,
                KeyLoanDOQty: data.results[i].KeyLoanDOQty,
                MovementQty: data.results[i].MovementQty,
                ActualMovementQty: data.results[i].ActualMovementQty,
                MixingRatio: data.results[i].MixingRatio,
                ValidFrom: data.results[i].ValidFrom,
                ValidTo: data.results[i].ValidTo,
                RestrictMode: data.results[i].RestrictMode,
                ReceivingBin: data.results[i].ReceivingBin,
                ReceivingBinName: data.results[i].ReceivingBinName,

                toplantid: data.results[i].planid, toPlantName: data.results[i].toPlantName,
                storagelocationid: data.results[i].fromlocationid, toStorageLocationName: data.results[i].toStorageLocationName,
                LotNumber: data.results[i].tolotid, toLotNumberName: data.results[i].tolotno,

              }
              vd.push(NewData);
            } else {
              form.setValues({
                planid: data.results[i].planid,
                MovementGroupNumber: data.results[i].MovementGroupNumber,
                date: data.results[i].date,
                ActualStock: data.results[i].ActualStock,
                RandDConfirmedQty: data.results[i].RandDConfirmedQty,
                FumigationClearedQty: data.results[i].FumigationClearedQty,
                Division: data.results[i].Division,
                KeyLoanDOQty: data.results[i].KeyLoanDOQty,
                MovementQty: data.results[i].MovementQty,
                ActualMovementQty: data.results[i].ActualMovementQty,
                MixingRatio: data.results[i].MixingRatio,
                ValidFrom: data.results[i].ValidFrom,
                ValidTo: data.results[i].ValidTo,
                MinNumberQty: data.results[i].MovementQty,


              })
              form.setFieldValue('WeekNo', { label: data.results[i].WeekNoName, value: data.results[i].WeekNo });
              form.setFieldValue('WareHouse', { label: data.results[i].WareHouseName, value: data.results[i].WareHouse });
              form.setFieldValue('storagelocationid', { label: data.results[i].StorageLocationName, value: data.results[i].fromlocationid });
              form.setFieldValue('WheatVariety', { label: data.results[i].WheatVarietyName, value: data.results[i].WheatVariety });
              form.setFieldValue('LotNumber', { label: data.results[i].LotNumberName, value: data.results[i].LotNumber });
              form.setFieldValue('RestrictMode', { label: data.results[i].RestrictMode, value: data.results[i].RestrictMode });

              form.setFieldValue('plantid', { label: data.results[i].PLANT_NAME, value: data.results[i].fromplantid });
              form.setFieldValue('ReceivingBin', { label: data.results[i].ReceivingBinName, value: data.results[i].ReceivingBin });


            }
          }



          setPlanData(vd);

          form.setValues({
            ...form.values,
            CheckList: vd,

          });

        }
      })
      .catch((error) => {
        errorToast("Something went wrong, please try again after sometime");
      })
      .finally((a) => {
        hideLoader();

      });
  };
  const addTblRecord = () => {

    showError('MovementGroupNumber_Error', '', 0);
    showError('WareHouse_Error', '', 0);
    showError('WheatVariety_Error', '', 0);
    showError('ActualStock_Error', '', 0);
    showError('RandDConfirmedQty_Error', '', 0);
    showError('LotNumber_Error', '', 0);
    showError('FumigationClearedQty_Error', '', 0);
    showError('Division_Error', '', 0);
    showError('KeyLoanDOQty_Error', '', 0);
    showError('MovementQty_Error', '', 0);
    showError('ActualMovementQty_Error', '', 0);
    showError('MixingRatio_Error', '', 0);
    showError('ValidFrom_Error', '', 0);
    showError('ValidTo_Error', '', 0);
    showError('RestrictMode_Error', '', 0);

    let RetFalse = 0;

    console.log(JSON.stringify(form.values));
    console.log(!form.values.WareHouse);
    console.log(form.values.WareHouse.value == '');
    if (!form.values.WareHouse || form.values.WareHouse.value == '') {
      showError('WareHouse_Error', 'Select WareHouse', 1);
      RetFalse = 1;
    }
    if (!form.values.WheatVariety || form.values.WheatVariety.value == '') { showError('WheatVariety_Error', 'Select Wheat Variety', 1); RetFalse = 1; }
    if (!form.values.ActualStock || form.values.ActualStock == '') { showError('ActualStock_Error', 'Enter Actual Stock', 1); RetFalse = 1; }
    //if(!form.values.RandDConfirmedQty || form.values.RandDConfirmedQty==''){ showError('RandDConfirmedQty_Error','Enter RandD Confirmed Qty',1); RetFalse=1;}
    if (!form.values.LotNumber || form.values.LotNumber.value == '') { showError('LotNumber_Error', 'Select Lot Number', 1); RetFalse = 1; }
    //if(!form.values.FumigationClearedQty || form.values.FumigationClearedQty==''){ showError('FumigationClearedQty_Error','Enter Fumigation Cleared Qty',1); RetFalse=1;}
    if (!form.values.Division || form.values.Division == '') { showError('Division_Error', 'Enter Division', 1); RetFalse = 1; }
    if (!form.values.KeyLoanDOQty || form.values.KeyLoanDOQty == '') { showError('KeyLoanDOQty_Error', 'Enter KeyLoan DO Qty', 1); RetFalse = 1; }
    if (!form.values.MovementQty || form.values.MovementQty == '') { showError('MovementQty_Error', 'Enter Movement Qty', 1); RetFalse = 1; }
    //if(!form.values.ActualMovementQty || form.values.ActualMovementQty==''){ showError('ActualMovementQty_Error','Enter Actual Movement Qty',1); RetFalse=1;}
    //if(!form.values.MixingRatio || form.values.MixingRatio==''){ showError('MixingRatio_Error','Enter Mixing Ratio',1); RetFalse=1;}
    if (!form.values.ValidFrom || form.values.ValidFrom == '') { showError('ValidFrom_Error', 'Enter Valid From', 1); RetFalse = 1; }
    //if(!form.values.ValidTo || form.values.ValidTo==''){ showError('ValidTo_Error','Enter Valid To',1); RetFalse=1;}
    //if(!form.values.RestrictMode || form.values.RestrictMode.value==''){ showError('RestrictMode_Error','Enter Restrict Mode',1); return false}

    if (!form.values.toplantid || form.values.toplantid.value == '') { showError('toplantid_Error', 'Select Receiving Plant', 1); RetFalse = 1; }
    if (!form.values.tostoragelocationid || form.values.tostoragelocationid.value == '') { showError('tostoragelocationid_Error', 'Select Receiving Storage Location', 1); RetFalse = 1; }
    if (!form.values.toLotNumber || form.values.toLotNumber.value == '') { showError('toLotNumber_Error', 'Select Receiving Lot Number', 1); RetFalse = 1; }
    if (RetFalse == 1) {
      return false;
    }



    console.log("start")
    console.log(JSON.stringify(PlanDatas));
    console.log("form");
    console.log(JSON.stringify(form));
    let Len = parseFloat(PlanDatas.length) + parseFloat(1);
    let NewData = {
      planid: form.values.planid,
      MovementGroupNumber: form.values.MovementGroupNumber,
      //WeekNo:form.values.WeekNo.value,WeekNoName:form.values.WeekNo.label,
      //date:form.values.date,
      WareHouse: form.values.WareHouse.value, WareHouseName: form.values.WareHouse.label,
      Plant: form.values.plantid.value, PlantName: form.values.plantid.label,
      StorageLocation: form.values.storagelocationid.value, StorageLocationName: form.values.storagelocationid.label,
      WheatVariety: form.values.WheatVariety.value, WheatVarietyName: form.values.WheatVariety.label,
      ActualStock: form.values.ActualStock,
      //RandDConfirmedQty:form.values.RandDConfirmedQty,
      LotNumber: form.values.LotNumber.value, LotNumberName: form.values.LotNumber.label,
      //FumigationClearedQty:form.values.FumigationClearedQty,
      Division: form.values.Division,
      KeyLoanDOQty: form.values.KeyLoanDOQty,
      MovementQty: form.values.MovementQty,
      //ActualMovementQty:form.values.ActualMovementQty,
      //MixingRatio:form.values.MixingRatio,
      ValidFrom: form.values.ValidFrom,
      //ValidTo:form.values.ValidTo,
      //RestrictMode:form.values.RestrictMode.value,
      //ReceivingBin:form.values.ReceivingBin.value,
      //ReceivingBinName:form.values.ReceivingBin.label

      toPlant: form.values.toplantid.value, toPlantName: form.values.toplantid.label,
      toStorageLocation: form.values.tostoragelocationid.value, toStorageLocationName: form.values.tostoragelocationid.label,
      toLotNumber: form.values.toLotNumber.value, toLotNumberName: form.values.toLotNumber.label,

    };
    console.log("NewData");
    console.log(JSON.stringify(NewData));
    let vd = [];

    vd = [...PlanDatas];

    vd.push(NewData);

    setPlanData(vd);
    console.log(JSON.stringify(PlanDatas));
    console.log("OK");

    let MgNo = form.values.MovementGroupNumbe;
    let MoveQty = form.values.MovementQty;
    form.setValues({
      MovementGroupNumber: MgNo,
      MovementQty: MoveQty
    });
    form.setValues({
      ...form.values,
      planid: form.values.planid,
      // MovementGroupNumber:form.values.MovementGroupNumber,
      // WeekNo:'',
      //date:'',



      ActualStock: '',
      //RandDConfirmedQty:'',

      //FumigationClearedQty:'',
      Division: '',
      KeyLoanDOQty: '',
      //MovementQty:'',
      //ActualMovementQty:'',
      //MixingRatio:'',
      ValidFrom: '',
      //ValidTo:'',
      //RestrictMode:'',
      WareHouse: "",
      plantid: "",
      LotNumber: "",
      WheatVariety: ""
    });
    document.getElementById("MovementQty").disabled = true;


    form.setFieldValue('plantid', '');
    form.setFieldValue('LotNumber', '');
    form.setFieldValue('WheatVariety', '');
    form.setFieldValue('WareHouse', '');
    form.setFieldValue('ReceivingBin', '');

    form.setFieldValue('toplantid', '');
    form.setFieldValue('tostoragelocationid', '');
    form.setFieldValue('toLotNumber', '');

    setWhPlantOptions([]);
    setWhLotOptions([]);
    setWhWheetVarietyOptions([]);
    console.log(JSON.stringify(form.values));
    //setPlanData(newVal);
  };
  const showError = (Id, Msg, show) => {
    if (document.getElementById(Id)) {
      document.getElementById(Id).innerHTML = "";
      if (show == 1) {
        console.log("SHOW ERROR:" + Id);
        document.getElementById(Id).innerHTML = Msg;
      }
    }
  }
  const EditRow = (item, i) => {

    form.setValues({
      planid: item.planid,
      MovementGroupNumber: item.MovementGroupNumber,
      date: item.date,
      ActualStock: item.ActualStock,
      RandDConfirmedQty: item.RandDConfirmedQty,
      FumigationClearedQty: item.FumigationClearedQty,
      Division: item.Division,
      KeyLoanDOQty: item.KeyLoanDOQty,
      MovementQty: item.MovementQty,
      ActualMovementQty: item.ActualMovementQty,
      MixingRatio: item.MixingRatio,
      ValidFrom: item.ValidFrom,
      ValidTo: item.ValidTo,

    })
    form.setFieldValue('WeekNo', { label: item.WeekNoName, value: item.WeekNo });
    form.setFieldValue('WareHouse', { label: item.WareHouseName, value: item.WareHouse });
    form.setFieldValue('WheatVariety', { label: item.WheatVarietyName, value: item.WheatVariety });
    form.setFieldValue('LotNumber', { label: item.LotNumberName, value: item.LotNumber });
    form.setFieldValue('RestrictMode', { label: item.RestrictMode, value: item.RestrictMode });
    form.setFieldValue('ReceivingBin', { label: item.ReceivingBinName, value: item.ReceivingBin });



    let vdata = [...PlanDatas];
    vdata.splice(i, 1);
    setPlanData(vdata);

  }
  const DeleteRow = (i) => {
    let vdata = [...PlanDatas];
    vdata.splice(i, 1);
    setPlanData(vdata);
  }
  const AddValue = () => {
    if (form.values.WeekNo && form.values.WeekNo != "") {
      return true;
    } else {
      return false;
    }
  }
  const onDelete = (Id) => {

    const postdata = {

      planid: Id,

    }
    //  alert(JSON.stringify(postdata)) ;
    // alert("3");
    console.log(JSON.stringify(postdata))

    showLoader();
    apiPostMethod(apiBaseUrl + "Warehouse/STOPODeliveryPlan/DeleteUpdateSTOPODeliveryPlan", postdata)
      .then((response) => {
        //  alert("4");
        const { data } = response;
        console.log(JSON.stringify(response))
        let UsrId = data.success;
        if (data.success) {
          ShowToast("Saved Successfully...");
          //history.push(`/master/ead:`+UsrId);
          history.push(`/warehouse/WheatmvmntgdntogdnEdit`);
          window.location.reload();
        } else {
          errorToast("Enter Atleast One Entry");
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


  const onSubmit = (ApproveStatus, Id) => {

    for (let i = 0; i < PlanDatas.length; i++) {
      if (PlanDatas[i].planid == Id) {
        console.log("test")
        if (parseFloat(PlanDatas[i].ActualStock) < parseFloat(PlanDatas[i].MovementQty)) {
          errorToast("Movement Qty Should be Less than Actual");
          return false;
        }
      }
    }

    const postdata = {
      MovementType: "GODOWN",
      PlanDatas,
      ApproveStatus,
      planid: Id,
      RejectReason: form.values.RejectReason ? form.values.RejectReason : "",
      Screen: "GTG_EDIT"
    }
    //  alert(JSON.stringify(postdata)) ;
    // alert("3");
    console.log(JSON.stringify(postdata))

    showLoader();
    apiPostMethod(apiBaseUrl + "Warehouse/STOPODeliveryPlan/AddUpdateSTOPODeliveryPlan", postdata)
      .then((response) => {
        //  alert("4");
        const { data } = response;
        console.log(JSON.stringify(response))
        let UsrId = data.success;
        if (data.success) {
          ShowToast("Saved Successfully...");
          //history.push(`/master/ead:`+UsrId);
          history.push(`/warehouse/WheatmvmntgdntogdnEdit`);
          window.location.reload();
        } else {
          errorToast("Enter Atleast One Entry");
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


  const RefreshPage = () => {
    history.push(`/master/Wheatmvmntgdntogdn`);
  };

  const onDateChange = (e) => {
    console.log(e.target.value);
    var dt1 = new Date(e.target.value);
    const wkno = getWeek(dt1);
    console.log("WeekNo" + wkno);
    //form.values.date=e.target.value; PVS Date
    form.values.ValidFrom = e.target.value;
    let result = new Date(e.target.value);
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
    /*console.log(e);
    
    
      alert(e);
      alert(e.target.value);
      */

  };


  const onWarehouseChange = (e) => {
    const { value, label } = e;

    form.setFieldValue('WareHouse', { label: label, value: value });
    //setFormData({ ...formData, WH_CODE: value, WH_Name:label });

    FillPlantList(value);
  };

  const FillPlantList = (WH_CODE) => {
    let fdata = { WH_CODE: WH_CODE, screenType: "FUMIGATION" };
    apiPostMethod(apiBaseUrl + 'warehouse/master/getWHplantList', fdata)
      .then((response) => {
        const { data } = response;
        if (data.success) {
          setWhPlantOptions([{ options: data.results }]);
          settoWhPlantOptions([{ options: data.results }]);
        }
      })
      .catch((error) => {
        errorToast("Something went wrong, please try again after sometime");
      });
  };
  const onStorageLocationChange = (e) => {
    const { value, label } = e;
    form.setFieldValue('storagelocationid', { label: label, value: value });
    // setStockEntryfromData({ ...stockEntryformData, locationid:value , slocation:label})  
    FillLotList(value)

  }
  const ontoStorageLocationChange = (e) => {
    const { value, label } = e;
    form.setFieldValue('tostoragelocationid', { label: label, value: value });
    // setStockEntryfromData({ ...stockEntryformData, locationid:value , slocation:label})  
    FilltoLotList(value)

  }
  const onPlantChange = (e) => {
    const { value, label } = e;
    form.setFieldValue('plantid', { label: label, value: value });

    // FillLotList(value);
    FillStorageLocationList(value)
  };
  const ontoPlantChange = (e) => {
    const { value, label } = e;
    form.setFieldValue('toplantid', { label: label, value: value });

    // FillLotList(value);
    FilltoStorageLocationList(value)
  }


  const FilltoStorageLocationList = (PlantId) => {
    let fdata = { PlantId, screenType: "RND" };
    apiPostMethod(apiBaseUrl + 'warehouse/master/getStorageLocationListFromPlant', fdata)
      .then((response) => {
        const { data } = response;
        if (data.success) {

          settostorageLocationOption([{ options: data.results }]);

          //getLotInfo(paramLotId,type);

        }
      })
      .catch((error) => {
        errorToast("Something went wrong, please try again after sometime");
      });
  };

  const FillStorageLocationList = (PlantId) => {
    let fdata = { PlantId, screenType: "RND" };
    apiPostMethod(apiBaseUrl + 'warehouse/master/getStorageLocationListFromPlant', fdata)
      .then((response) => {
        const { data } = response;
        if (data.success) {

          setstorageLocationOption([{ options: data.results }]);

          //getLotInfo(paramLotId,type);

        }
      })
      .catch((error) => {
        errorToast("Something went wrong, please try again after sometime");
      });
  };

  const FilltoLotList = (sLocId) => {
    //let fdata = { plantid: paramPlantid, screenType: "FUMIGATION" };
    let fdata = { storagelocationId: sLocId, plantid: form.values.toplantid.value, screenType: "FUMIGATION" };
    apiPostMethod(apiBaseUrl + 'warehouse/master/getWHLotList', fdata)
      .then((response) => {
        const { data } = response;
        if (data.success) {
          settoWhLotOptions([{ options: data.results }]);
        }
      })
      .catch((error) => {
        errorToast("Something went wrong, please try again after sometime");
      });
  };
  const FillLotList = (sLocId) => {
    //let fdata = { plantid: paramPlantid, screenType: "FUMIGATION" };
    let fdata = { storagelocationId: sLocId, plantid: form.values.plantid.value, screenType: "FUMIGATION" };
    apiPostMethod(apiBaseUrl + 'warehouse/master/getWHLotList', fdata)
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

    form.setFieldValue('LotNumber', { label: label, value: value });


    FillWheatVarityList(value);
  };
  const ontoLotChange = (e) => {
    const { value, label } = e;

    form.setFieldValue('toLotNumber', { label: label, value: value });


    //FillWheatVarityList(value);
  };

  const FillWheatVarityList = (paramLotId) => {
    let fdata = { lotid: paramLotId, screenType: "FUMIGATION" };
    apiPostMethod(apiBaseUrl + 'warehouse/master/getWHWheatvarityList', fdata)
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
    if (Diff >= 7) {
      form.setValues({
        ...form.values,
        MovementQty: e.target.value
      })
      return false;
    }

    let MinQty = 0;
    if (parseFloat(form.values.FumigationClearedQty) < parseFloat(form.values.KeyLoanDOQty)) {
      MinQty = form.values.FumigationClearedQty;
    } else {
      MinQty = form.values.KeyLoanDOQty;
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
    getSublotData(label, value);
  };

  const getSublotData = (lab, val) => {
    let fdata = {
      warehouseid: form.values.WareHouse.value,
      plantid: form.values.plantid.value,
      lotid: form.values.LotNumber.value,
      WheatVarietyId: val,
      screenType: "WEEKLYPLAN"
    };
    apiPostMethod(apiBaseUrl + 'warehouse/STOPODeliveryPlan/getsublotDet', fdata)
      .then((response) => {
        const { data } = response;
        if (data.success) {
          // setWhWheetVarietyOptions([{ options: data.results }]);
          form.setValues({
            ...form.values,
            ActualStock: data.results[0].wheatqty,
            RandDConfirmedQty: data.results[0].Rndlockqty,
            FumigationClearedQty: data.results[0].FumigationClearedQty,
            KeyLoanDOQty: data.results[0].Unpledgeqty
          })

          form.setFieldValue('WheatVariety', { label: lab, value: val });
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
  return (
    <Fragment >

      <Row>
        <Col md="12" sm="12">
          <Table className='table-sm mt-2' style={{ width: "160%", sortable: true }} >

            <thead>
              <tr>
                <th style={{ verticalAlign: "middle", backgroundColor: "#7367f0", color: "#fff", textTransform: "none", fontWeight: "500", fontSize: "12px" }} className="custom-width">Valid From</th>

                <th style={{ verticalAlign: "middle", backgroundColor: "#7367f0", color: "#fff", textTransform: "none", fontWeight: "500", fontSize: "12px" }} className="custom-width">Warehouse</th>
                <th style={{ verticalAlign: "middle", backgroundColor: "#7367f0", color: "#fff", textTransform: "none", fontWeight: "500", fontSize: "12px" }} className="custom-width">Plant</th>
                <th style={{ verticalAlign: "middle", backgroundColor: "#7367f0", color: "#fff", textTransform: "none", fontWeight: "500", fontSize: "12px" }} className="custom-width">Storage Location</th>
                <th style={{ verticalAlign: "middle", backgroundColor: "#7367f0", color: "#fff", textTransform: "none", fontWeight: "500", fontSize: "12px" }} className="custom-width">Lot No</th>
                <th style={{ verticalAlign: "middle", backgroundColor: "#7367f0", color: "#fff", textTransform: "none", fontWeight: "500", fontSize: "12px" }} className="custom-width">Wheat Variety </th>
                <th style={{ verticalAlign: "middle", backgroundColor: "#7367f0", color: "#fff", textTransform: "none", fontWeight: "500", fontSize: "12px" }} className="custom-width">Division</th>
                <th style={{ verticalAlign: "middle", backgroundColor: "#7367f0", color: "#fff", textTransform: "none", fontWeight: "500", fontSize: "12px" }} className="custom-width">Actual Qty</th>
                <th style={{ verticalAlign: "middle", backgroundColor: "#7367f0", color: "#fff", textTransform: "none", fontWeight: "500", fontSize: "12px" }} className="custom-width">Keyloan DO Qty</th>
                <th style={{ verticalAlign: "middle", backgroundColor: "#7367f0", color: "#fff", textTransform: "none", fontWeight: "500", fontSize: "12px" }} className="custom-width">Movement Qty</th>


                <th style={{ verticalAlign: "middle", backgroundColor: "#7367f0", color: "#fff", textTransform: "none", fontWeight: "500", fontSize: "12px" }} className="custom-width">Receiving Plant</th>
                <th style={{ verticalAlign: "middle", backgroundColor: "#7367f0", color: "#fff", textTransform: "none", fontWeight: "500", fontSize: "12px" }} className="custom-width">Receiving Storage Location</th>
                <th style={{ verticalAlign: "middle", backgroundColor: "#7367f0", color: "#fff", textTransform: "none", fontWeight: "500", fontSize: "12px" }} className="custom-width">Receiving Lot No</th>
                <th style={{ verticalAlign: "middle", backgroundColor: "#7367f0", color: "#fff", textTransform: "none", fontWeight: "500", fontSize: "12px" }} className="custom-width">Save</th>
                <th style={{ verticalAlign: "middle", backgroundColor: "#7367f0", color: "#fff", textTransform: "none", fontWeight: "500", fontSize: "12px" }} className="custom-width">Delete</th>

              </tr>
            </thead>
            <tbody>
              {PlanDatas &&
                PlanDatas.length > 0 &&
                PlanDatas.map((item, index) => {
                  return (

                    <tr>
                      {/*<td><Button.Ripple
            className="btn-icon"
            color="primary"
            onClick={(e) => {
              EditRow(item,i);
            }}
          >
           
            <span className="align-middle ml-25">Edit</span>
          </Button.Ripple></td>*/}
                      <td style={{ fontSize: "13px" }}>{item.ValidFrom}</td>
                      <td style={{ fontSize: "13px" }}>{item.WareHouseName}</td>
                      <td style={{ fontSize: "13px" }}>{item.PlantName}</td>
                      <td style={{ fontSize: "13px" }}>{item.StorageLocationName}</td>
                      <td style={{ fontSize: "13px" }}>{item.LotNumberName}</td>
                      <td style={{ fontSize: "13px" }}>{item.WheatVarietyName}</td>
                      <td style={{ fontSize: "13px" }}> {item.Division}</td>

                      <td style={{ fontSize: "13px" }}>{item.ActualStock}</td>

                      <td style={{ fontSize: "13px" }}>{item.KeyLoanDOQty}</td>
                      {/*<td>{item.MovementQty}</td>*/}
                      <td> <CustomTextInput style={{ width: "100%", fontSize: "12px", height: "30px", marginBottom: "-10px" }}
                        placeholder={" "} onChange={(e) => onTextChange(e, item.planid, form.values.CheckList, "MovementQty", index)}
                        form={form} id={`MovementQty_${index}`} type="text" value={item.MovementQty} /></td>
                      <td style={{ fontSize: "13px" }}>{item.toPlantName}</td>
                      <td style={{ fontSize: "13px" }}>{item.toStorageLocationName}</td>
                      <td style={{ fontSize: "13px" }}>{item.toLotNumberName}</td>



                      <td>

                        <Button.Ripple color="primary" type="button" onClick={(e) => onSubmit(1, item.planid)}>
                          Save
                        </Button.Ripple>



                      </td>
                      <td> <Button.Ripple color="primary" type="button" onClick={(e) => onDelete(item.planid)}>
                        Delete
                      </Button.Ripple></td>
                    </tr>

                  );
                })}
            </tbody>
          </Table>
        </Col>
      </Row>




      <Row>



      </Row>

    </Fragment>
  );
};


const STOPOGTGDeliveryCreationEdit = () => {
  const { showLoader, hideLoader } = useLoader();
  const dateFormat = "YYYY-MM-DD";
  const today = moment().format(dateFormat);
  const isToday = (date) => {
    return moment(date).format(dateFormat) == today;
  };
  const form = useFormik({
    isInitialValid: false,
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
  const values = form.values;

  const history = useHistory();
  const resetForm = () => {
    history.push(`/master/Wheatmvmntgdntogdn`);
  };

  return (
    <Fragment >

      <CardComponent header="Wheat Movement Godown to Godown - Edit" >
        <RefreshBlock />
        <div style={{ overflowY: 'auto', overflowX: 'auto', maxWidth: '100vw', maxHeight: '100vh' }}>
          <STOPODeliveryCreationEditForm form={form} />
        </div>
      </CardComponent>

    </Fragment>
  );
};

export default STOPOGTGDeliveryCreationEdit;
