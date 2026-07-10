import React, { Fragment, useState } from "react";
import { apiBaseUrl } from "../../urlConstants";
import { apiPostMethod } from "@helpers/axiosHelper";
import { errorToast } from "@helpers/appHelper";
import { Row, Col, Button, Label, FormGroup, Input, Card, CardHeader, CardBody } from "reactstrap";
import { useEffect } from "react";
import { useLoader } from "../../utility/hooks/useLoader";
import { useParams } from "react-router";
import { Modal } from "react-bootstrap";
import { ArrowLeft, Check, X } from "react-feather";
import { useSelector } from "react-redux";
import { ShowToast } from "../../helper/appHelper";
import { useHistory } from "react-router-dom";
import { CustomDropdownInput, Yup } from "../forms/custom-form";
import { useFormik } from "formik";
import { apiGetMethod } from "../../helper/axiosHelper";
import InvoiceInfo from "../FG/salesReturn/InvoiceInfo"
import GatePassInfo from "../Info/GatePassInfo";
import confirmDialog from "../../@core/components/confirm/confirmDialog";

const D2RSalesSapDocument = () => {

    useEffect(() => {
        getGateInInfo('Get')
    }, [])

    let { gateInOutInfoId } = useParams();
    let { showLoader, hideLoader } = useLoader();
    let history = useHistory();

    const [invoiceData, setInvoiceData] = useState([])
    const [fgDetailsData, setfgDetailsData] = useState([])
    const [gatePassDeliveryData, setGatePassDeliveryData] = useState([])
    const [show, setShow] = useState(false);
    const [data, setData] = useState({})
    const [response, setResponse] = useState([])
    const [ssAndpmDeliveryData, setSsAndpmDeliveryData] = useState([])

    const UserDetails = useSelector((state) => (state && state.auth ? state.auth.userData : {}));

    const form = useFormik({
        isInitialValid: false,
        initialValues: {},
        validationSchema: Yup.object().shape({}),
        onSubmit() { },
    });

    const getGateInInfo = () => {
        apiGetMethod(apiBaseUrl + `GatePro/Gate/getGateInInfo/0/0/0/${gateInOutInfoId}/${UserDetails.USERID}`)
            .then((response) => {
                const { data } = response;
                if (data.success) {
                    setData(data.results[0]);
                    hideRejectButton(data.results[0].userGateId)
                    getWeighmentInfo(data.results[0].gateInOutInfoId, '')
                    Cost_Details()
                    for (let i = 0; i < data.invoiceInfo.length; i++) {
                        data.invoiceInfo[i].INVOICE_NO = data.invoiceInfo[i].invoiceNumber;
                        data.invoiceInfo[i].DELIVERY_NO = data.invoiceInfo[i].deliveryNumber;
                        data.invoiceInfo[i].DELIVERY_QTY = data.invoiceInfo[i].deliveryQty;
                        data.invoiceInfo[i].PGI_COMPLETION = data.invoiceInfo[i].PgiCompletion;
                    }

                    let invoiceData = data.invoiceInfo.filter((item) => item.PgiCompletion == '')
                    setInvoiceList(invoiceData)
                }
                else if (data.success == false) {
                    errorToast(data.message)
                }
            }).catch((error) => {
                console.log(JSON.stringify(error))
                setData(false)
                errorToast("Something went wrong, please try again after sometime");
            })
    }

    const [weighmentData, setWeighmentData] = useState([])
    const [overAllWeight, setOverAllWeight] = useState([])
    const [fgWeighment, setFgWeighment] = useState([])

    const getWeighmentInfo = (gateInOutInfoId, documentNo) => {
        console.log(apiBaseUrl + `GatePro/Weighment/getWeighmentInfo/0/${gateInOutInfoId}/${UserDetails.USERID}`);
        apiPostMethod(apiBaseUrl + `GatePro/Weighment/getWeighmentInfo/0/${gateInOutInfoId}/${UserDetails.USERID}`)
            .then((response) => {
                const { data } = response;
                if (data.success == true) {
                    setWeighmentData(data.data)
                    console.log(data.data);
                    let lastItem = data.data.slice(-1)[0]
                    setOverAllWeight(lastItem)
                    let fgWeight = data.data.filter((item) => item.documentNumber == documentNo)
                    setFgWeighment(fgWeight[0])
                }
                else if (data.success == false) {
                    // errorToast(data.message);
                }
            }).catch((error) => {
                console.log(JSON.stringify(error))
                setData(false)
                errorToast("Something went wrong, please try again after sometime");
            })
    }

    const redirect = () => {
        if(data.moduleTypeId == 39 && data.moduleStatusId == 5){
        history.push("/SALECONFIRMATION");
        }else{
        history.push("/SAPDocumentDetails");
        }
    }

    const reject = (moduleStatusId) => {

        let formData = form.values;

        const postdata = {
            gateInOutInfoId: data.gateInOutInfoId,
            moduleStatusId: moduleStatusId,
            rejectReasonId: formData.rejectReason.value,
            userInfoId: UserDetails.USERID
        }
        showLoader();
        console.log(apiBaseUrl + "GatePro/Weighment/rejectWeighmentInfo", postdata);
        apiPostMethod(apiBaseUrl + "GatePro/Weighment/rejectWeighmentInfo", postdata)
            .then((response) => {
                const data = response.data;
                if (data.success == true) {
                    ShowToast(data.message)
                    redirect()
                }
                else if (data.success == false) {
                    errorToast(data.message)
                    redirect()
                }
            })
            .catch((error) => {
                errorToast("Something went wrong, please try again after sometime");
            })
            .finally((a) => {
                hideLoader();
            });
    };

    const [isHide, setIsHide] = useState(true)

    const hideRejectButton = (userGateId) => {
        console.log(apiBaseUrl + `GatePro/Master/hideRejectButton/${userGateId}`);
        apiGetMethod(apiBaseUrl + `GatePro/Master/hideRejectButton/${userGateId}`)
            .then((response) => {
                const { data } = response;
                if (data.isHide == true) {
                    setIsHide(data.isHide)
                } else {
                    setIsHide(data.isHide)
                }
            }).catch((error) => {
                console.log(JSON.stringify(error))
                errorToast("Something went wrong, please try again after sometime");
            })
    }

    const updateVehicleStatus = () => {
        console.log(contractorPersonDetails.length,noOfPersons)
        
         if (noOfPersons == '' || noOfPersons == undefined) {
            let message = 'Please fill Total no of Invoices'
            confirmDialog({
              title: `<h5><strong class="text-white">` + message + `</strong></h5>`, cancelButton: false, confirmText: false, confirmButton: false, background: `#BD362F`
            })
            return
          }else if(Number(contractorPersonDetails.length) != Number(noOfPersons)){
          
            let message = 'Please fill all Invoice Details'
            confirmDialog({
              title: `<h5><strong class="text-white">` + message + `</strong></h5>`, cancelButton: false, confirmText: false, confirmButton: false, background: `#BD362F`
            })
            return
          }

          let isDataValid = true;

          contractorPersonDetails.forEach((person) => {
            console.log(
              `Person ID: ${person.contractPersonId}, Person Name Length: ${person.personName.length} ,Invoice Count: ${CostDetails}`
            );
            const isInvoiceNumber = /^\d+$/.test(person.personName); 

            if((person.personName.length != CostDetails) || (!isInvoiceNumber)){
                let message = 'Please Check Invoice Details' + person.contractPersonId
                confirmDialog({
                title: `<h5><strong class="text-white">` + message + `</strong></h5>`, cancelButton: false, confirmText: false, confirmButton: false, background: `#BD362F`
                })
                isDataValid = false;
            }
          });

          if (!isDataValid) return false;
          
        let formData = form.values;

        const fdata = {
            gateInOutInfoId: data.gateInOutInfoId,
            remarks: formData.remarks,
            userInfoId: UserDetails.USERID,
            moduleTypeId:39,
            contractorPersonDetails: contractorPersonDetails,
        }

        showLoader();
        console.log(apiBaseUrl + "LandingDataController/FGSalesNLDV_DocumentVerify", fdata);
        apiPostMethod(apiBaseUrl + "LandingDataController/FGSalesNLDV_DocumentVerify", fdata)
            .then((response) => {
                const res = response.data;
                if (res.success == true) {
                    ShowToast(res.message);
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
    }

    const [invoiceList, setInvoiceList] = useState([])
    const [contractPersonData, setContractPersonData] = useState([]);
    const [contractorPersonDetails, setContractorPersonDetails] = useState([]);
    const [noOfPersons, setNoOfPersons] = useState('');
    const [checkNoOfPersons, setCheckNoOfPersons] = useState(false);
    const [CostDetails, setCostDetails] = useState('');

    const addInput = (noOfPersons) => {
      setCheckNoOfPersons(noOfPersons == '' ? true : false)
      setNoOfPersons(noOfPersons)
      const newData = [];
  
      for (let i = 0; i < noOfPersons; i++) {
        newData.push({
          contractPersonId: i + 1,
          personName: '',
        })
      }
      setContractPersonData(newData)
    }
    function addContractPersons(event, cell) {
        if (contractorPersonDetails.length == 0) {
          var obj
          obj = {
            contractPersonId: cell,
            personName: event,
            gateInOutInfoId: data.gateInOutInfoId,
            userInfoId: UserDetails.USERID,
            moduleTypeId:39,
            status:0
          };
          contractorPersonDetails.push(obj);
        } else {
          let selectedItem
          contractorPersonDetails.forEach((item) => {
            if (item['contractPersonId'] == cell) {
              selectedItem = item
            }
          });
          if (selectedItem != undefined) {
            selectedItem['personName'] = event
          } else {
            var obj
            obj = {
              contractPersonId: cell,
              personName: event,
              gateInOutInfoId: data.gateInOutInfoId,
              userInfoId: UserDetails.USERID,
              moduleTypeId:39,
              status:0
            };
            contractorPersonDetails.push(obj);
          }
        }
      }
      const Cost_Details = () => {
   
        apiPostMethod(apiBaseUrl + "FCITruckController/FCI_Cost_Details")
          .then((response) => {
            const { data } = response;
            if (data.success == 1) {
              setCostDetails(data.results[0].invoice_validation)
            }
          })
          .catch((error) => {
            errorToast("Something went wrong, please try again after sometime");
          });
      };
    return (
        <div>
            <Card>
                <CardHeader><h5>Loading - SAP Document</h5></CardHeader>
                <hr></hr>
                <CardBody>
                    <Row>
                        <Col md="12" sm="12">
                            <h4 className="text-primary"><u>General Info</u></h4><br />
                        </Col>

                        <Col md="4" sm="4">
                            <FormGroup>
                                <Label>Truck No</Label>
                                <Input type="text" placeholder="Enter Truck No" value={data?.vehicleNo} disabled />
                            </FormGroup>
                        </Col>
                        <Col md="4" sm="4">
                            <FormGroup>
                                <Label>VA No</Label>
                                <Input type="text" placeholder="Enter VA No" value={data?.vaNumber} disabled />
                            </FormGroup>
                        </Col>
                        <Col md="4" sm="4">
                            <FormGroup>
                                <Label>Driver Phone No</Label>
                                <Input type="text" placeholder="Enter Driver Phone No" value={data?.driverMobileNumber} disabled />
                            </FormGroup>
                        </Col>
                        <Col md="4" sm="4">
                            <FormGroup>
                                <Label>Plant</Label>
                                <Input type="text" placeholder="Enter Plant" value={data?.plantName} disabled />
                            </FormGroup>
                        </Col>

                        {data.colorToken != null ?
                            <Col md="4" sm="4">
                                <FormGroup>
                                    <Label>Color / Token</Label>
                                    <Input type="text" placeholder="Enter Color / Token" value={data?.colorToken} disabled />
                                </FormGroup>
                            </Col> : null
                        }

                        {data.rejectReason != null ?
                            <Col md="4" sm="4">
                                <FormGroup>
                                    <Label>Reason</Label>
                                    <Input type="text" placeholder="Enter Reason" value={data?.rejectReason} disabled />
                                </FormGroup>
                            </Col> : null
                        }

                        {data.remarks != null ?
                            <Col md="4" sm="4">
                                <FormGroup>
                                    <Label>Remarks</Label>
                                    <Input type="text" placeholder="Enter Remarks" value={data?.remarks} disabled />
                                </FormGroup>
                            </Col> : null
                        }

                        {data?.tripSheetNumber ?
                            <Col md="4" sm="4">
                                <FormGroup>
                                    <Label>TRIP Sheet No</Label>
                                    <Input type="text" placeholder="Enter TRIP Sheet No" value={data?.tripSheetNumber} disabled />
                                </FormGroup>
                            </Col> : null
                        }

                        {data?.truckType ?
                            <Col md="4" sm="4">
                                <FormGroup>
                                    <Label>Truck Type</Label>
                                    <Input type="text" placeholder="Enter Truck Type" value={data?.truckType} disabled />
                                </FormGroup>
                            </Col> : null
                        }

                        {data.shipmentOrderNo != null ?
                            <Col md="4" sm="4">
                                <FormGroup>
                                    <Label>Shipment Order No</Label>
                                    <Input type="text" placeholder="Enter Shipment Order No" value={data?.shipmentOrderNo} disabled />
                                </FormGroup>
                            </Col> : null
                        }
                         {data?.userGateId == 19 ?
                            <>
                        <Col md="12" sm="12"><hr></hr></Col>
                        <Col md="12" sm="12">
                            <h4 className="text-primary"><u>Delivery Info</u></h4><br />
                        </Col>
                        <Col sm="4" md="4">
                            <FormGroup>
                                <Label>Total No of Invoice</Label>
                                <Input type="text" placeholder="No of Invoices" onChange={(e) => addInput(e.target.value)} value={noOfPersons} />
                                {checkNoOfPersons ? <Label className='text-danger'>Please Enter Invoice Count</Label> : null}
                            </FormGroup>
                        </Col>

                        {contractPersonData.map((data) => (
                        <Col sm="4" md="4" key={data.contractPersonId}>
                            <FormGroup>
                            <Label>{'Invoice No' + ' - ' + data.contractPersonId}</Label>
                            <Input type="text" placeholder="Enter Invoice" onChange={(e) => addContractPersons(e.target.value, data.contractPersonId)} />
                            </FormGroup>
                        </Col>
                        ))}
                        </> : null}
                        {data.userGateId == 19 ? <>
                        <Col sm="12" md="12">
                        <InvoiceInfo gateInOutData={data} setInvoiceList={setInvoiceList} invoiceList={invoiceList} isDisbled ={false}/>
                        </Col>
                        </> : null
                        }
                        { data.moduleTypeId == 29 &&
                        <GatePassInfo isDisable={'isDisable'} UserDetails={UserDetails} tripSheetData={'tripSheetData'} truckValue={data.gateInOutInfoId} getLoadingData={'getLoadingData'} moduleTypeId={29} selectedValue={'selectedValue'} reset={'reset'} form={form} subModuleTypeId={29} />
                        }
                        {data.weighmentInfoId > 0 ?
                            <>
                                <Col md="12" sm="12"><hr></hr></Col>

                                <Col md="12" sm="12">
                                    <h4 className="text-primary"><u>Weighment Info In Kg's</u></h4><br />
                                </Col>

                                <Col md="3" sm="3"><Label>Document Number</Label></Col>
                                <Col md="3" sm="3"><Label>First Weight</Label></Col>
                                <Col md="3" sm="3"><Label>Second Weight</Label></Col>
                                <Col md="3" sm="3"><Label>Net Weight</Label></Col>

                                {weighmentData.map((weighmentData) => (
                                    <Col md="12" sm="12">
                                        <Row>
                                            <Col md="3" sm="3" key={weighmentData.documentNumber}>
                                                <FormGroup>
                                                    <Input typr="text" placeholder="Document" value={weighmentData?.documentNumber ? weighmentData?.documentNumber : 0} disabled />
                                                </FormGroup>
                                            </Col>
                                            <Col md="3" sm="3">
                                                <FormGroup>
                                                    <Input typr="text" placeholder="Weight" value={weighmentData?.firstWeight} disabled />
                                                </FormGroup>
                                            </Col>
                                            <Col md="3" sm="3">
                                                <FormGroup>
                                                    <Input typr="text" placeholder="Weight" value={weighmentData?.secondWeight ? weighmentData?.secondWeight : 0} disabled />
                                                </FormGroup>
                                            </Col>
                                            <Col md="3" sm="3">
                                                <FormGroup>
                                                    <Input typr="text" placeholder="Weight" value={weighmentData?.netWeight ? weighmentData?.netWeight : 0} disabled />
                                                </FormGroup>
                                            </Col>
                                        </Row>
                                    </Col>
                                ))}

                                <Col md="4" sm="4">
                                    <FormGroup>
                                        <Label>Over All First Weight</Label>
                                        <Input typr="text" placeholder="First Weight" value={data?.firstWeight} disabled />
                                    </FormGroup>
                                </Col>
                                <Col md="4" sm="4">
                                    <FormGroup>
                                        <Label>Over All Second Weight</Label>
                                        <Input typr="text" placeholder="Second Weight" value={overAllWeight.secondWeight ? overAllWeight.secondWeight : 0} disabled />
                                    </FormGroup>
                                </Col>
                                <Col md="4" sm="4">
                                    <FormGroup>
                                        <Label>Over All Net Weight</Label>
                                        <Input typr="text" placeholder="Net Weight" value={data?.movementTypeId == 1 ? Number(overAllWeight.secondWeight - data?.firstWeight) : Number(data?.firstWeight - overAllWeight.secondWeight)} disabled />
                                    </FormGroup>
                                </Col>
                            </> : null
                        }

                        {/* <InvoiceInfo gateInOutData={data} setInvoiceList={setInvoiceList} /> */}

                        <Col md="12" sm="12">
                            <br></br>
                            <FormGroup>
                                {(data?.weighmentInfoId > 0) && (data?.moduleStatusId == 3 || data?.moduleStatusId == 4) && data?.userGateId == 19 ?
                                    <Button.Ripple color="danger" type="button" onClick={() => setShow(true)}>
                                        <X size={16} /> Reject
                                    </Button.Ripple> : null
                                }

                                <div style={{ float: 'right' }}>
                                    {data?.userGateId == 19 ? <>
                                        {data?.moduleStatusId == 3 || data?.moduleStatusId == 4 || data?.waitingAt == 15?
                                            <Button.Ripple color="primary" type="button" onClick={updateVehicleStatus}>
                                                <Check size={16} /> Submit
                                            </Button.Ripple> : null
                                        } </> : null
                                    }

                                    <Button.Ripple className="ml-2" outline color="primary" type="button" onClick={redirect}>
                                        <ArrowLeft size={16} /> Back
                                    </Button.Ripple>
                                </div>

                            </FormGroup>
                        </Col>
                    </Row>
                </CardBody >
            </Card >

            <Modal show={show} centered>
                <Modal.Header>
                    <Row>
                        <Col md="12" sm="12">
                            <FormGroup style={{ width: 460 }}>
                                <Modal.Title>Reject <X onClick={() => setShow(false)} style={{ float: "right" }} /></Modal.Title>
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
        </div >
    );
};

export default D2RSalesSapDocument;
