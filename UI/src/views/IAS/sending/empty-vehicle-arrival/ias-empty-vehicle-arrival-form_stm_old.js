import { FormGroup, Row, Col, Button, Label, InputGroup, Input, InputGroupText } from "reactstrap";
import React, { useState } from "react";
import { StopCircle, Check, Search } from "react-feather";
import { apiPostMethod } from "@helpers/axiosHelper";
import { errorToast } from "@helpers/appHelper";
import { apiBaseUrl } from "../../../../urlConstants";
import { useFormik } from "formik";
import { CustomTextInput, Yup, validation,CustomDropdownInput } from "../../../forms/custom-form";
import { useLoader } from "../../../../utility/hooks/useLoader";
import { PlantIdDropdown } from "../../../common/PlantIdDropdown";
import { PlantIdDropdown_SILO } from "../../../common/PlantIdDropdown";
import { useAuth } from "../../../../utility/hooks/useAuth";
import { statusCode } from "../../../../helper/appHelper";

const IasEmptyVehicleArrivalForm_STM = ({ onAdded, gateInStatus, isTruck, FirstWeight, data }) => {
  let { showLoader, hideLoader } = useLoader();
  let { defaultPlantId } = useAuth();
  let screenType = "EVADP";
  const RefreshPage = () => {
    window.location.reload();
  };

  const onAdd = (status) => {
    // if (!form.isValid) {
    //   form.setSubmitting(true);
    //   form.validateForm();
    //   return;
    // }
    let formData = form.values;
    screenType="SILOTOMILL";

    let fdata = {
      DRIVER_NO: formData.driverNo,
      PLANT_ID: 'FR01',
      PLANT_NAME: 'FR01',
      SCREEN_TYPE: screenType,
      VEHICLE_STATUS: status,
      formType: "A",
      isTruck: true,
      TRUCK_NO : data.VEHICLE_NO,
      VEHICLE_STATUS : 23,

      tripsheetid: formData.tripsheetid ? formData.tripsheetid : "",
      tripsheet_no: data.TRIPSHEET_NO,
      driver_name: formData.driver_name ? formData.driver_name : "",
    };
    if (data.ZTRIPSHEET_NO == '') {
      errorToast("Please Enter Correct Vehicle No,Otherwise Contact SAP Team...");
      return false
    } else if (fdata.driver_name == undefined || fdata.driver_name == "") {
      errorToast("Please Select Driver Name...");
      return false
    }

    // if (isTruck) {
      
    // } else {
      // fdata.TRAILER_NO = formData.trailerNo;
    // }
    showLoader();
    apiPostMethod(`${apiBaseUrl}EmptyVehicleArrival/addOrUpdateVehicleArrival`, fdata)
      .then((response) => {
        const { data } = response;
        if (data.success) {
          form.resetForm();
          // onAdded();
          RefreshPage()
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
  };
  const checktext = (e) => {
    if (e.which == 32) {
      return false;
    }
  }
  const form = useFormik({
    isInitialValid: false,
    initialValues: {
      trailerNo: "",
      driverNo: "",
      plant: defaultPlantId,
    },
    validationSchema: Yup.object().shape({
      trailerNo: validation.required(),
      driverlist:validation.required({ message:"Driver No", isObject:true }),
      driverNo: validation.driverNumber,

      //plant: validation.required(),

    }),
    onSubmit(values) {},
  });

  // const onVehicleNoChange = (e) =>{
  //   console.log(e);
  //   const {tripsheet_no, label, value, driver_name, driver_no}=e;
  //   form.setValues(
  //     {...form.values,
  //       tripsheetlist:{label,value},
  //     trailerNo:label,
  //     tripsheetid:value,
  //     tripsheet_no:tripsheet_no,
  //     //driver_name:driver_name,
  //     //driverNo:driver_no,
  //     //driverlist:{label:driver_name,value:driver_no},
  //   }
  //   )
  // }

  const onDriverNameChange = (e) =>{
    console.log(e);
    const { label, value } = e;
    form.setValues(
      {
        ...form.values,
        driverlist: { label, value },
        driver_name: label,
        driverNo: value,
      }
    )
  }

  //Tripsheet No SAP API
  const onVehicleNoChange = (e) =>{
    // console.log(e);
    // setTripSheetNo(e.tripsheet_no);
    const fdata = {Vehicle_Number}
    const {ZTRIPSHEET_NO, label, value, driver_name, driver_no}=e;
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
        setTripSheetNo(json_obj.ZTRIPSHEET_NO)
        setDriverName(json_obj.ZZDRIVER_NAME)
        setDriverNo(json_obj.ZZDRIVER_PH_NO)
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
        <CustomTextInput label={"TripSheet No"} disabled value={data?.TRIPSHEET_NO} isNumberOnly form={form} id="tripsheet_no" />
      </Col>
      <Col md="4" sm="12">

          <CustomDropdownInput url={`${apiBaseUrl}EmptyVehicleArrival/getDriverNameDD`}
            form={form}
            label={"Driver"}
            id="driverlist"
            /* options={warehouseoption} */
            onChange={(e) => onDriverNameChange(e)}
          />

          {/* {form.values.driverNo && "No: " + form.values.driverNo} */}



        {/* <CustomTextInput label={"Driver No"} disabled={isTruck} isNumberOnly form={form} id="driverNo" /> */}

      </Col>

      <Col md="4" sm="12">
        <CustomTextInput label={"Plant Id"} disabled value={'FR01'} form={form} id="plant" />
      </Col>
      <Col sm="12">
        <FormGroup className="d-flex justify-content-end mb-0">
          <div className="mr-1">
            <Button.Ripple outline color="primary" type="button" onClick={(e) => onAdd(statusCode.IN)}>
              <StopCircle size={16} className="mr-1" />
              Wait Outside
            </Button.Ripple>
          </div>
          <Button.Ripple color="primary" type="button" onClick={(e) => onAdd(gateInStatus)}>
            <Check size={16} className="mr-1" />
            Gate In
          </Button.Ripple>
        </FormGroup>
      </Col>
    </>
  );
};

export default IasEmptyVehicleArrivalForm_STM;
