import React, { Fragment, useState } from "react";
import { apiBaseUrl, evaUrl, vaUrl } from "../../urlConstants";
import { apiPostMethod } from "@helpers/axiosHelper";
import { errorToast } from "@helpers/appHelper";
import { Row, Col, Button, Label, FormGroup, Input, InputGroup, Card, CardBody, CardHeader } from "reactstrap";
import { Search } from "react-feather";
import { RefreshBlock1 } from "../common/RefreshBlock1";
import { useLoader } from "../../utility/hooks/useLoader";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import { apiGetMethod } from "../../helper/axiosHelper";
import confirmDialog from "../../@core/components/confirm/confirmDialog";
import { useHistory } from "react-router-dom";
import { ShowToast, statusCode } from "../../helper/appHelper";
import { CustomTextInput, Yup } from "../forms/custom-form";
import { useFormik } from "formik";


const VehicleStatusCheck = () => {

    let { showLoader, hideLoader } = useLoader();

    const [isDisable, setIsDisable] = useState(false);
    const [truckValue, setTruckValue] = useState('');
    const [data, setData] = useState('');


    const UserDetails = useSelector((state) => (state && state.auth ? state.auth.userData : {}));
    const werks = UserDetails.plantids.join(",");

    const checkPlant = ['FR02'];
    const userPlant = UserDetails.plantids.filter((plant) => plant == checkPlant);


    const form = useFormik({
        isInitialValid: false,
        initialValues: {},
        validationSchema: Yup.object().shape({}),
        onSubmit(values) { },
    });

    const getVehicleDetails = () => {
        let fdata = {
        vehicleNo:truckValue,
        userId:UserDetails.USERID,
        };
  
      showLoader();
       apiPostMethod(apiBaseUrl + "Movementchangecontroller/getVehicleDetails", fdata)
       .then((response) => {
         const { data } = response;
         let tableData = data.results
         if (data.success == 1) {
            setData(tableData[0])
            setIsDisable(true)
         }else if (data.success == 0) {
            errorToast(data.error)
         }
     
       })
       .catch((error) => {
         errorToast("Something went wrong, please try again after sometime");
       })
       .finally((a) => {
         hideLoader();
       });
      }; 

      const validateTruckNo = (truckNo) => {        
        setTruckValue(truckNo)
    }

    return (
        <Fragment>
            <Card>
                <CardHeader><h5>Check Vehicle Status</h5><RefreshBlock1 /></CardHeader>
                <hr />
                <CardBody>
                    <Row>
                        <Col md="4" sm="4">
                            <FormGroup>
                                <Label>Truck No</Label>
                                <InputGroup>
                                    <Input type="text" name="Vehicle_Number" id="Vehicle_Number" placeholder="Truck No" value={truckValue} disabled={isDisable} maxLength={15}
                                    onChange={(e) => validateTruckNo(e.target.value.trim())} />
                                    <Button size="sm" color="success" style={{ height: '38px', width: '50px' }} onClick={getVehicleDetails}>
                                        <Search size={20} />
                                    </Button>
                                </InputGroup>
                                {/* {!checkVehicleNo ? <Label className="text-danger">Invalid Truck No</Label> : null} */}
                            </FormGroup>
                        </Col> 
                        {data &&
                        <>
                        {data?.vaNumber &&
                        <Col md="4" sm="12">
                            <CustomTextInput label={"VA Number"} form={form} value={data?.vaNumber} id="row_count" type="text" disabled/>
                        </Col>}
                        <Col md="4" sm="12">
                            <CustomTextInput label={"Movement"} form={form} value={data?.movementName} id="row_count" type="text" disabled/>
                        </Col>
                        <Col md="4" sm="12">
                            <CustomTextInput label={"Movement Type"} form={form} value={data?.moduleType} id="row_count" type="text" disabled/>
                        </Col>
                        <Col md="4" sm="12">
                            <CustomTextInput label={"Plant Name"} form={form} value={data?.PLANT_NAME} id="row_count" type="text" disabled/>
                        </Col>
                        <Col md="4" sm="12">
                            <CustomTextInput label={"Vehicle Waiting status"} form={form} value={data?.waitingAtStatusName} id="row_count" type="text" disabled/>
                        </Col>
                        <Col md="4" sm="12">
                            <CustomTextInput label={"Responsible Person"} form={form} value={data?.contact_person} id="row_count" type="text" disabled/>
                        </Col>
                        <Col md="4" sm="12">
                            <CustomTextInput label={"Responsible Phone No"} form={form} value={data?.contact_person_no} id="row_count" type="text" disabled/>
                        </Col>
                        </>}
                    </Row>
                </CardBody>
            </Card>

          
        </Fragment >
    );
};

export default VehicleStatusCheck;