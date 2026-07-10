import { FormGroup, Row, Col, Button, Label, Input, InputGroup, InputGroupText } from "reactstrap";
import React, { useState } from "react";
import { StopCircle, Check, Search } from "react-feather";
import { apiPostMethod } from "@helpers/axiosHelper";
import { errorToast } from "@helpers/appHelper";
import { apiBaseUrl } from "../../../../urlConstants";
import { useFormik } from "formik";
import { CustomTextInput, Yup, validation, CustomDropdownInput } from "../../../forms/custom-form";
import { useLoader } from "../../../../utility/hooks/useLoader";
import { PlantIdDropdown } from "../../../common/PlantIdDropdown";
import { useAuth } from "../../../../utility/hooks/useAuth";
import { statusCode } from "../../../../helper/appHelper";
import confirmDialog from "../../../../@core/components/confirm/confirmDialog";

const IasEmptyVehicleArrivalForm = ({ onAdded, gateInStatus, isTruck, FirstWeight, data }) => {
  let { showLoader, hideLoader } = useLoader();
  let { defaultPlantId } = useAuth();
  let screenType = "EVADP";
console.log(data)
const RefreshPage = () => {
  setTimeout(() => window.location.reload(), 1000);
};
  const onAdd = (status) => {
    // if (!form.isValid) {
    //   form.setSubmitting(true);
    //   form.validateForm();
    //   return;
    // }
   
    let formData = form.values;
    if(formData.plant == '' || formData.plant == undefined){
      errorToast("Please Select Plant Code ...");
      return false
    } else if (data.VEHICLE_NO == '' || data.VEHICLE_NO == undefined) {
      errorToast("Please Enter Correct Vehicle No,Otherwise Contact SAP Team...");
      return false
    } else if (data.TRIPSHEET_NO == '') {
      errorToast("Please Enter TripSheet No...");
      return false
    }
    else if (data.DRIVER_PHONE_NO == '') {
      errorToast("Please Enter Correct Vehicle No,Otherwise Contact SAP Team...");
      return false
    }
    else if (data.DRIVER_NAME == '') {
      errorToast("Please Enter Correct Vehicle No,Otherwise Contact SAP Team...");
      return false
    }
    if(formData.plant.value=="1111"){
     // screenType="SILOTOMILL";
    }
    let fdatas = {
      plant_id: formData.plant.value,
    };
    showLoader();
    apiPostMethod(`${apiBaseUrl}LandingDataController/WB_Details_Check`, fdatas).then((response) => {
      let isTrucks = response.data.results;
      let fdata = {
      DRIVER_NO: data.DRIVER_PHONE_NO,
      PLANT_ID: formData.plant.value,
      PLANT_NAME: formData.plant.label,
      SCREEN_TYPE: screenType,
      VEHICLE_STATUS: isTrucks == 1 ? statusCode.FirstWeight : statusCode.LOADING,
      formType: "A",
      isTruck: isTrucks,
      // tripsheetid:TripSheetNo,
      tripsheet_no: data.TRIPSHEET_NO,
      driver_name: data.DRIVER_NAME,
    };

    // if (isTrucks) {
      fdata.TRUCK_NO = data.VEHICLE_NO;
    // } else {
    //   fdata.TRAILER_NO = data.VEHICLE_NO;
    // }
    apiPostMethod(`${apiBaseUrl}EmptyVehicleArrival/addOrUpdateVehicleArrival`, fdata)
      .then((response) => {
        const { data } = response;
        console.log("Result Data : ". response);

        if (data.success) {
          confirmDialog({
            title: `<h5><strong class="text-white">'Gate in successfully'</strong></h5>`, cancelButton: false, confirmText: false, confirmButton: false, background: `#51A351`
          })
          form.resetForm()
          // form.resetForm();
          // onAdded();
          RefreshPage();
        } else if (data.error) {
          errorToast(data.error);
        }
      })
      
  }).catch((error) => {
    errorToast("Something went wrong, please try again after sometime");
  })
  .finally((a) => {
    hideLoader();
  });
  };
  const checktext = (e) => {
    if(e.which==32){
      return false;
    }
  }
  const form = useFormik({
    initialErrors : false,
    initialValues: {
      trailerNo: "",
      driverNo: "",
      plant: defaultPlantId, //defaultPlantId
    },
    validationSchema: Yup.object().shape({
      trailerNo: validation.required(),
      driverNo: validation.driverNumber,
      //plant: validation.required(),
    }),
    onSubmit(values) {},
  });

  const onVehicleNoChange = (e) =>{
    // console.log(e);
    // setTripSheetNo(e.tripsheet_no);
    const fdata = { Vehicle_Number }
    const { ZTRIPSHEET_NO, label, value, driver_name, driver_no } = e;
    console.log(`${apiBaseUrl}EmptyVehicleArrival/getTripsheetDetails`, fdata);
    apiPostMethod(`${apiBaseUrl}EmptyVehicleArrival/getTripsheetDetails`, fdata)
      .then((response) => {
        const { data } = response;
        let json_array = JSON.parse(data.results)
        let json_obj = json_array[0]
        console.log(json_obj);

        if(json_obj == undefined || json_obj == ""){
          errorToast("Please Enter Correct Vehicle No ...")
          return false
        }else{
        setTripSheetNo(json_obj.TRIPSHEET_NO)
        setDriverName(json_obj.DRIVER_NAME)
        setDriverNo(json_obj.DRIVER_PHONE_NO)
        setVehicleNoVerify(true)
        }

        if (data.success) {
          form.resetForm();
          onAdded();
        } else if (data.error) {
          errorToast(data.error);
        }
      })
      .catch((error) => {
        errorToast("Something went wrong, please try again after sometime");
      })
      .finally((a) => {
        hideLoader();
      });
    
  }


// console.log(form.setValues({...form.values}))
const [formData, setFormaData] = useState({});
const [TripSheetNo, setTripSheetNo] = useState('');
const [DriverName, setDriverName] = useState('');
const [DriverNo, setDriverNo] = useState('');
const [VehicleNoVerify,setVehicleNoVerify] = useState(false)

const updateData = (data) => {
  setFormaData(data);
};

const onTextChange = (e, key) => {
  const newData = {
    ...formData,
    [key]: e.target ? e.target.value : e.value,
  };
  updateData(newData);
};
const {
  Vehicle_Number,
} = formData;  
  return (
    <>
      <Col md="4" sm="12">
        <CustomTextInput label={"TripSheet No"} disabled isNumberOnly form={form} id="tripsheet_no" value={data.TRIPSHEET_NO} />
      </Col>
      <Col md="4" sm="12">
        <CustomTextInput label={"Driver Name"} disabled isNumberOnly form={form} id="driver_name" value={data.DRIVER_NAME} />
      </Col>
      <Col md="4" sm="12">
        <CustomTextInput label={"Driver No"} disabled isNumberOnly form={form} id="driverNo" value={data.DRIVER_PHONE_NO} />
      </Col>
      <Col md="4" sm="12">
        <PlantIdDropdown form={form} id="plant" />
      </Col>
      <Col sm="12">
        <FormGroup className="d-flex justify-content-end mb-0">
          <div className="mr-1">
            <Button.Ripple outline color="primary" type="button" onClick={(e) => onAdd(statusCode.IN)}>
              <StopCircle size={16} className="mr-1" />
              Wait Outside
            </Button.Ripple> 
          </div>
          <Button.Ripple color="primary" type="button" onClick={(e) => onAdd((isTruck ? statusCode.FirstWeight : gateInStatus))} /*onClick={(e) => onAdd(gateInStatus)}*/>
            <Check size={16} className="mr-1" />
            Gate In
          </Button.Ripple>
        </FormGroup>
      </Col>
    </>
  );
};

export default IasEmptyVehicleArrivalForm;
