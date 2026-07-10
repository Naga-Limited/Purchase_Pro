import React, { Fragment, useState } from "react";
import { apiPostMethod } from "@helpers/axiosHelper";
import { errorToast } from "@helpers/appHelper";
import { Row, Col, Button, Label, FormGroup, Input, Card, CardHeader, CardBody, Alert, Badge } from "reactstrap";
import { useEffect } from "react";
import { useParams } from "react-router";
import { Modal } from "react-bootstrap";
import { ArrowLeft, Check, X } from "react-feather";
import { useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { useFormik } from "formik";
import { ShowToast } from "../../helper/appHelper";
import { apiBaseUrl, sapFileShare } from "../../urlConstants";
import { useLoader } from "../../utility/hooks/useLoader";
import { CustomDropdownInput, CustomTextInput, Yup } from "../forms/custom-form";
import Uploader from "../Uploader";
import confirmDialog from "../../@core/components/confirm/confirmDialog";
import { apiGetMethod } from "../../helper/axiosHelper";

const CanteenMaterials = () => {

    const [show, setShow] = useState(false);
    const closeRemarksModal = () => setShow(false);
    const openRemarksModal = () => setShow(true);

    let { gateInOutInfoId } = useParams();

    let { showLoader, hideLoader } = useLoader();
    const history = useHistory();

    const [data, setData] = useState([])
    const [material, setMaterial] = useState([])
    const [TotalQty, setTotalQty] = useState(0)
    const [TotalRate, setTotalRate] = useState(0)
    const [TotalAmount, setTotalAmount] = useState(0)

    const form = useFormik({
        isInitialValid: false,
        initialValues: {},
        validationSchema: Yup.object().shape({
            rejectReason: ""
        }),
        reject() { },
    });

    const getGateInInfo = () => {
        apiPostMethod(apiBaseUrl + `GatePro/Gate/getGateInInfo/0/0/0/${gateInOutInfoId}/${UserDetails.USERID}`)
            .then((response) => {
                const { data } = response;
                if (data.success == true) {
                    setData(data.results[0]);
                    MaterialDetails(data.results[0].subModuleType,data.results[0].subModuleTypeId)
                }
            }).catch((error) => {
                console.log(JSON.stringify(error))
                setData(false)
                errorToast("Something went wrong, please try again after sometime");
            })
    }
    const MaterialDetails = (subModuleType,subModuleTypeId) => {
        apiPostMethod(apiBaseUrl + `GatePro/Gate/getCanteenMaterialDetails/${subModuleType}/${subModuleTypeId}`)
            .then((response) => {
                const { data } = response;
                if (data.success == true) {
                    setMaterial(data.results)

                }
            }).catch((error) => {
                // console.log(JSON.stringify(error))
                // setData(false)
                errorToast("Something went wrong, please try again after sometime");
            })
    }
    useEffect(() => {
        getGateInInfo()
    }, [])

    const redirect = () => {
        history.push("/CANTEENCONFIRMATION");
    }

    const UserDetails = useSelector((state) => (state && state.auth ? state.auth.userData : {}));

    const reject = () => {

        const formData = form.values;

        const postdata = {
            gateInOutInfoId: data.gateInOutInfoId,
            moduleStatusId: 2,
            rejectReasonId: formData.rejectReason.value,
            userInfoId: UserDetails.USERID
        }

        showLoader();
        console.log(apiBaseUrl + "GatePro/Gate/updateVehicleStatus", postdata);
        apiPostMethod(apiBaseUrl + "GatePro/Gate/updateVehicleStatus", postdata)
            .then((response) => {
                const res = response.data;
                if (res.success == true) {
                    ShowToast("Rejected Successfully...");
                    redirect()
                }
                else if (res.success == false) {
                    errorToast(res.message)
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

    const [attachedFiles, setAttachment] = useState({ shipmentCopy: {} });

    const handleFileChange = (file, id) => {
        setAttachment({
            ...attachedFiles,
            [id]: file,
        });
    };

    const AddCanteenMaterialDetails = () => {

        let formData = form.values;
        const filteredData = material.filter(item => item.TotalCost > 0);

        const FrmData = {
            gateInOutInfoId: gateInOutInfoId,
            UserId: UserDetails.USERID,
            invoice_no: formData.invoice_no,
            remarks: formData.remarks,
            MaterialDetails: filteredData,
            invoice_date:data?.gateInDateStamp,
            TotalAmount:TotalAmount,
            TotalQty:TotalQty,	
            TotalRate:TotalRate,
            confirm_vendor:formData?.confirm_vendor?.value	
        };
        if((FrmData.invoice_no == '' || FrmData.invoice_no == undefined) || FrmData.TotalAmount == 0 || FrmData.TotalQty == 0 || FrmData.TotalRate == 0 || FrmData?.MaterialDetails?.length == 0 || formData?.confirm_vendor?.value == '' || formData?.confirm_vendor?.value == undefined){
            let message = (FrmData.invoice_no == '' || FrmData.invoice_no == undefined) ? 'Please Enter Invoice No' : FrmData.TotalAmount== 0 ? 'Please Check OverAllCost' : FrmData.TotalQty == 0 ? 'Please Check OverAllQty' : FrmData.TotalRate == 0 ? 'Please Check OverAllRate' : FrmData?.MaterialDetails?.length == 0 ? 'Please Check Material Details' :  (formData?.confirm_vendor?.value == '' || formData?.confirm_vendor?.value == undefined) ? 'Please Check Vendor Details' :''
            confirmDialog({
            title: `<h5><strong class="text-white">` + message + `</strong></h5>`, cancelButton: false, confirmText: false, confirmButton: false, background: `#BD362F`
            })
            return
        }
        showLoader();
        console.log(apiBaseUrl + "GatePro/Gate/AddCanteenMaterialDetails", FrmData)
        apiPostMethod(apiBaseUrl + "GatePro/Gate/AddCanteenMaterialDetails", FrmData)
            .then((response) => {
                const { data } = response;
                if (data.success == true) {
                    ShowToast(data.message);
                    redirect()
                }
                else if (data.success == false) {
                    errorToast(data.message);
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

    function addMaterial(cell, event,Rate) {

        const newData = [];
        console.log(cell,event)

        material.forEach((item, index) => {
          if (index == cell) {
            item['Qty'] = event
            item['Rate'] = Rate
            item['DiffQty'] = ((Rate == '' || Rate == undefined) ? 0 : Number( (item?.OldRate || Rate)-Rate).toFixed(2))
            item['TotalCost'] = ((Rate == '' || Rate == undefined || event == '' || event == undefined)? 0 : Number(Rate*event).toFixed(2))
          }
          newData.push(item)
        });
        // Calculate the total Qty
        const totalQty = newData.reduce((sum, item) => sum + parseFloat(item.Qty || 0), 0).toFixed(3);

        // Calculate the total Rate
        const totalRate = newData.reduce((sum, item) => sum + parseFloat(item.Rate || 0), 0).toFixed(2);

         // Calculate the total Rate
        const totalAmount = newData.reduce((sum, item) => sum + parseFloat(item.TotalCost || 0), 0).toFixed(2);

        // Set the totals
        setTotalQty(totalQty);
        setTotalRate(totalRate);

        // Calculate the total amount using parsed values of totalQty and totalRate
        setTotalAmount(totalAmount);

        // Update the material state
        setMaterial(newData);

      }

    return (
        <Fragment>
            <Card>
                <CardHeader><h5>Canteen Material Confirmation</h5></CardHeader>
                <hr></hr>
                <CardBody>
                    <Row>
                        <Col md="12" sm="12">
                            <h4 className="text-primary"><u>General Info</u></h4><br />
                        </Col>
                        <Col md="4" sm="4">
                            <FormGroup>
                                <Label>VA No</Label>
                                <Input type="text" placeholder="Enter VA No" value={data.vaNumber} disabled />
                            </FormGroup>
                        </Col>
                        <Col md="4" sm="4">
                            <FormGroup>
                                <Label>Truck No</Label>
                                <Input type="text" placeholder="Enter Truck No" value={data.vehicleNo} disabled />
                            </FormGroup>
                        </Col>
                        <Col md="4" sm="4">
                            <FormGroup>
                                <Label>Movement</Label>
                                <Input type="text" placeholder="Enter Driver Phone No" value={data.moduleType} disabled />
                            </FormGroup>
                        </Col>
                        <Col md="4" sm="4">
                            <FormGroup>
                                <Label>Sub Movement</Label>
                                <Input type="text" placeholder="Enter Driver Phone No" value={data.subModuleType} disabled />
                            </FormGroup>
                        </Col>
                        <Col md="4" sm="4">
                            <FormGroup>
                                <Label>Plant</Label>
                                <Input type="text" placeholder="Enter To Plant" value={data.plantName} disabled />
                            </FormGroup>
                        </Col>
                        <Col md="4" sm="4">
                            <FormGroup>
                                <Label>Driver Phone No</Label>
                                <Input type="text" placeholder="Enter Driver Phone No" value={data.driverMobileNumber} disabled />
                            </FormGroup>
                        </Col>
                        
                            <Col md="12" sm="12"><hr></hr></Col>

                            <Col md="12" sm="12">
                                <h4 className="text-primary"><u>Weighment Info In Kg's</u></h4><br />
                            </Col>
                                <Col md="4" sm="4"><Label>First Weight</Label></Col>
                                <Col md="4" sm="4"><Label>Second Weight</Label></Col>
                                <Col md="4" sm="4"><Label>Net Weight</Label></Col>
                                    <Col md="4" sm="4">
                                        <FormGroup>
                                            <Input typr="text" placeholder="Weight" value={data.firstWeight} disabled />
                                        </FormGroup>
                                    </Col>
                                    <Col md="4" sm="4">
                                        <FormGroup>
                                            <Input typr="text" placeholder="Weight" value={data.secondWeight} disabled />
                                        </FormGroup>
                                    </Col>
                                    <Col md="4" sm="4">
                                        <FormGroup>
                                            <Input typr="text" placeholder="Weight" value={data.netWeight} disabled />
                                        </FormGroup>
                                    </Col>
                                    <Col md="12" sm="12"><hr></hr></Col>

                        <Col md="12" sm="12">
                            <h4 className="text-primary"><u>Material Details</u></h4><br />
                        </Col>  
                        <Col md="4" sm="4">
                            <FormGroup>
                                <CustomTextInput label={"Invoice No"} type="text" form={form} id="invoice_no" />
                            </FormGroup>
                        </Col>
                        <Col md="4" sm="12" >
                            <CustomDropdownInput  
                                url={apiBaseUrl + "GatePro/Gate/getVendor"} 
                                label={"Vendor Name"}  
                                form={form} 
                                id={"confirm_vendor"}
                            />
                        </Col>
                        <Col md="4" sm="4">
                            <FormGroup>
                                <CustomTextInput label={"Remarks"} type="text" form={form} id="remarks" />
                            </FormGroup>
                        </Col>
                        </Row>
                        <br /><br />
                        <Row>
                        {/* {materialData != "" ? <> */}
                            <Col md="12" sm="12">
                                <table className="table table-bordered">
                                <thead>
                                    <tr>
                                    <td className="bg-primary text-white text-center" width='5%'>S.No</td>
                                    <td className="bg-primary text-white text-center" width='25%'>Material Name</td>
                                    <td className="bg-primary text-white text-center" width='5%'>Old Qty</td>
                                    <td className="bg-primary text-white text-center" width='5%'>Old Rate</td>
                                    <td className="bg-primary text-white text-center" width='15%'>New Qty</td>
                                    <td className="bg-primary text-white text-center" width='15%'>New Rate</td>
                                    {/* <td className="bg-primary text-white text-center" width='10%'>Old Per Qty Cost</td>
                                    <td className="bg-primary text-white text-center" width='10%'>Per Qty Cost</td> */}
                                    <td className="bg-primary text-white text-center" width='15%'>Rate Diff</td>
                                    <td className="bg-primary text-white text-center" width='15%'>Total Cost</td>
                                    </tr>
                                </thead>
                                {material?.map((data,index) => (
                                    <tbody key={index}>
                                    <tr>
                                        <td className='text-center'>{index+1}</td>
                                        <td className='text-center'>
                                        {data.definitionsName}</td>
                                        <td className='text-center'>{data?.OldQty}</td>
                                        <td className='text-center'>{data?.OldRate}</td>
                                        <td className='text-center'>
                                        <Input type="text" placeholder="Qty" 
                                        onChange={(e) => addMaterial(index, e.target.value, data?.Rate)}
                                        />
                                        </td>
                                        <td className='text-center'>
                                        <Input type="text" placeholder="Rate" 
                                          onChange={(e) => addMaterial(index, data?.Qty,e.target.value)}
                                        />
                                        </td>
                                        {/* <td className='text-center'>{data?.contractMaterialDetailsId}</td>
                                        <td className='text-center'>{data?.contractMaterialDetailsId}</td> */}
                                        <td className='text-center'>{(data?.Rate == '' || data?.Rate == undefined) ? 0 : ( (data?.OldRate || data?.Rate) - data?.Rate).toFixed(2)}</td>
                                        <td className='text-center'>{(data?.Rate == '' || data?.Rate == undefined || data?.Qty == '' || data?.Qty == undefined)? 0 :(data?.Rate * data?.Qty).toFixed(2)}</td>
                                    </tr>
                                    </tbody>
                                ))}
                                </table>
                                <table  className="table table-bordered">
                                <tr className='text-center'>
                                    <td width='44.4%'>
                                    
                                    </td>
                                    <td width='13.9%'>
                                        {/* <Input type="text" placeholder="Total Qty" value = {TotalQty}
                                        //   onChange={(e) => addMaterial(index, data?.Qty,e.target.value)}
                                        /> */}
                                        {TotalQty}
                                    </td>
                                    <td width='13.9%'>
                                        {/* <Input type="text" placeholder="Total Cost" value = 
                                        //   onChange={(e) => addMaterial(index, data?.Qty,e.target.value)}
                                        /> */}
                                        {TotalRate}
                                    </td>
                                    <td width='30%'>
                                        {/* <Input type="text" placeholder="Total Amount" value = {TotalAmount}
                                        //   onChange={(e) => addMaterial(index, data?.Qty,e.target.value)}
                                        /> */}
                                        {TotalAmount}
                                    </td>
                                </tr>
                                </table>
                                <br />
                            </Col>
                             {/* </> : null
                            }       */}
                        <Col md="12" sm="12">
                            <br></br>
                            <FormGroup>
                                <div style={{ float: 'right' }}>
                                        <Button.Ripple color="primary" type="button" onClick={AddCanteenMaterialDetails}>
                                            <Check size={16} /> Submit
                                        </Button.Ripple> 
                                    
                                    <Button.Ripple className="ml-2" outline color="primary" type="button" onClick={redirect}>
                                        <ArrowLeft size={16} /> Back
                                    </Button.Ripple>
                                </div>

                            </FormGroup>
                        </Col>
                    </Row>
                </CardBody>
            </Card>

            <Modal show={show} centered>
                <Modal.Header>
                    <Row>
                        <Col md="12" sm="12">
                            <FormGroup style={{ width: 460 }}>
                                <Modal.Title>Reject <X onClick={closeRemarksModal} style={{ float: "right" }} /></Modal.Title>
                            </FormGroup>
                        </Col>
                    </Row>
                </Modal.Header>
                <Modal.Body>
                    <Row>
                        <Col sm="12" md="12">
                            <FormGroup>
                                <CustomDropdownInput
                                    url={`${apiBaseUrl}GatePro/Master/getMasterRejectReason`}
                                    label={"Reason"}
                                    form={form}
                                    id="rejectReason"
                                />
                            </FormGroup>
                        </Col>
                        <Col md="4" sm="4"></Col>
                        <Col md="3" sm="3" style={{ marginLeft: "25px" }}>
                            <FormGroup>
                                <Button.Ripple color="danger" type="button" onClick={reject}>
                                    <X size={16} /> Reject
                                </Button.Ripple>
                            </FormGroup>
                        </Col>
                    </Row>
                </Modal.Body>
            </Modal>
        </Fragment >
    );
};

export default CanteenMaterials;