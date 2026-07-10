import React from 'react'
import { ArrowLeft, Check, Plus, Search } from 'react-feather';
import { Button, Col, FormGroup, Input, InputGroup, Label, Row } from 'reactstrap'
import { useLoader } from '../../utility/hooks/useLoader';
import { apiPostMethod } from "@helpers/axiosHelper";
import { useState } from 'react';
import { apiBaseUrl, sapFileShare } from '../../urlConstants';
import { ShowToast, errorToast } from '../../helper/appHelper';
import confirmDialog from '../../@core/components/confirm/confirmDialog';
import { apiGetMethod } from '../../helper/axiosHelper';
import { CustomTextInput } from '../forms/custom-form';
import { useHistory } from 'react-router-dom';
import Uploader from '../Uploader';

const GatePassInfo = ({ isDisable, UserDetails, tripSheetData, truckValue, getLoadingData, moduleTypeId, selectedValue, reset, form, subModuleTypeId }) => {

    let { showLoader, hideLoader } = useLoader();

    const [gatePassNo, setGatePassNo] = useState('')
    const [fromPlant, setFromPlant] = useState('')
    const [masterPlantId, setMasterPlantId] = useState('')
    const [toPlant, setToPlant] = useState('')

    const [gatePassDetails, setGatePassDetails] = useState([])
    const [gatePassDetailsList, setGatePassDetailsList] = useState([])

    const getGatePassDetails = () => {
        showLoader();
        let postData = { gatePassNo: gatePassNo }
        apiPostMethod(apiBaseUrl + `GatePro/Master/getGatePassDetails`, postData)
            .then((response) => {
                const { data } = response;
                if (data.success == true) {
                    setGatePassDetails(data.results)
                    setFromPlant(data.results[0].FROM_PLANT)
                    getMasterPlant(data.results[0].FROM_PLANT)
                    setToPlant(data.results[0].SAP_LINE[0].REC_PLANT)
                    const plant = UserDetails.plantids.filter((userPlant) => userPlant == data.results[0].FROM_PLANT)
                    if (plant == '') {
                        confirmDialog({
                            title: `<h5><strong class="text-white"> ${data.results[0].FROM_PLANT} - Plant not assigned for user, please assign</strong></h5>`, cancelButton: false, confirmText: false, confirmButton: false, background: `#BD362F`
                        })
                        setGatePassDetails([])
                        setGatePassNo('')
                    }
                }
                else if (data.success == false) {
                    errorToast(data.message)
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

    const getMasterPlant = (fromPlant) => {
        apiGetMethod(apiBaseUrl + `GatePro/Master/getMasterPlant`)
            .then((response) => {
                const { data } = response;
                if (data.success == true) {
                    let plantData = data.results.filter((data) => data.WERKS == fromPlant);
                    setMasterPlantId(plantData[0].ID)
                }
                else if (data.success == false) {
                    errorToast(data.message)
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

    const checkPlant = () => {

        if (gatePassDetailsList.length > 0) {

            const checkGatePassNo = gatePassDetailsList.filter((data) => data.GATEPASS_NO == gatePassNo);
            const checkPlant = gatePassDetailsList.filter((data) => data.FROM_PLANT != fromPlant);

            if (checkGatePassNo != '') {
                confirmDialog({
                    title: `<h5><strong class="text-white">Gate Pass Details Already Added</strong></h5>`, cancelButton: false, confirmText: false, confirmButton: false, background: `#BD362F`
                })
                setGatePassDetails([])
                setGatePassNo('')
            } else if (checkPlant != '') {
                confirmDialog({
                    title: `<h5><strong class="text-white">Plant not Matched</strong></h5>`, cancelButton: false, confirmText: false, confirmButton: false, background: `#BD362F`
                })
                setGatePassDetails([])
                setGatePassNo('')
            }
            else {
                addGatePassDetails()
            }
        }
        else {
            addGatePassDetails()
        }
    }

    const addGatePassDetails = () => {
        setGatePassDetails([])
        setGatePassNo('')

        for (let i = 0; i < gatePassDetails.length; i++) {
            const obj = {
                GATEPASS_NO: gatePassDetails[0].GATEPASS_NO,
                GATEPASS_TYPE: gatePassDetails[0].GATEPASS_TYPE,
                FROM_PLANT: gatePassDetails[0].FROM_PLANT,
                VENDOR_PLANT: gatePassDetails[0].VENDOR_PLANT,
                VENDOR_PLANT_NAME: gatePassDetails[0].VENDOR_PLANT_NAME,
                SAP_LINE: gatePassDetails[0].SAP_LINE
            }
            gatePassDetailsList.push(obj);
        }
        setGatePassDetailsList(gatePassDetailsList)
        console.log(gatePassDetailsList)
    }

    const submit = (gatePassDocument) => {
        if(UserDetails.role == 'Security' && subModuleTypeId == 1 && (UserDetails.GATE_ID == 17 || UserDetails.GATE_ID == 18 || UserDetails.GATE_ID == 19)){
            upload(moduleTypeId)
        }
        else if (subModuleTypeId == 1 || subModuleTypeId == 3) {
            gateIn()
        } else {
            addLoadingUnloadingInfo(gatePassDocument)
        }
    }
    const history = useHistory();
    const redirect = () => {
        history.push("/SAPDocumentDetails");
    }
    const GatePass_DocumentVerify = () => {

        const gatePasspostData = { gateInOutInfoId:truckValue , GatepassDeliveryDetails: gatePassDetailsList}

        apiPostMethod(apiBaseUrl + "LandingDataController/GatePass_Add", gatePasspostData)
            .then((response) => {
                const { data } = response;
                if (data.success == true) {
                        ShowToast('Added Successfully')
                        redirect()
                }
            })
            .catch((error) => {
                console.log(JSON.stringify(error))
                errorToast("Something went wrong, please try again after sometime");
            })
    }
    const gateIn = (shipmentCopy) => {
        let formData = form.values;

        const postdata = {
            userInfoId: UserDetails.USERID,
            subModuleTypeId: subModuleTypeId ? subModuleTypeId : null,
            movementType: moduleTypeId == 22 ? "Unloading" : "Loading",
            moduleType: moduleTypeId == 22 ? 'Gate pass - Receipt' : "Gate Pass",
            masterPlantId: masterPlantId,
            driverMobileNumber: formData.phoneNo ? formData.phoneNo : null,
            moduleStatusId: moduleTypeId == 22 ? 3 : 4,
            remarks: formData.remarks,
            gatePassDetails: gatePassDetailsList,
            gatePassDocument:shipmentCopy,
            gate_id:UserDetails.GATE_ID
        };

        if(UserDetails.role == 'Security' && subModuleTypeId == 1 && (UserDetails.GATE_ID == 17 || UserDetails.GATE_ID == 18 || UserDetails.GATE_ID == 19) && (postdata.gatePassDocument == undefined || postdata.gatePassDocument == '')){
            errorToast('Please Attach Gate Pass Document')
            return false
        }
        showLoader();
        console.log(apiBaseUrl + "GatePro/Gate/addGateInInfo", postdata);
        apiPostMethod(apiBaseUrl + "GatePro/Gate/addGateInInfo", postdata)
            .then((response) => {
                const data = response.data;
                if (data.success == true) {
                    ShowToast(data.message)
                    reset()
                    getLoadingData()
                }
                else if (data.success == false) {
                    errorToast(data.message);
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

    const addLoadingUnloadingInfo = (gatePassDocument) => {

        let formData = form.values;

        const FrmData = {
            movementTypeId: selectedValue.value ? selectedValue.value : null,
            moduleTypeId: moduleTypeId ? moduleTypeId : null,
            subModuleTypeId: subModuleTypeId ? subModuleTypeId : null,
            truckNo: truckValue ? truckValue : null,
            masterPlantId: fromPlant,
            eda: formData.eda ? formData.eda : null,
            remarks: formData.remarks ? formData.remarks : null,
            fromDate: formData.fromDate ? formData.fromDate : null,
            toDate: formData.toDate ? formData.toDate : null,
            personName: formData.personName ? formData.personName : null,
            phoneNo: formData.phoneNo ? formData.phoneNo : tripSheetData ? tripSheetData.DRIVER_PHONE_NO : null,
            tripSheetNo: tripSheetData ? tripSheetData.TRIPSHEET_NO : null,
            cashInvoiceNo: form.values.cashInvoiceNo ? form.values.cashInvoiceNo : null,
            statusId: 0,
            userInfoId: UserDetails.USERID,
            GatepassDeliveryDetails: gatePassDetailsList,
            gatePassDocument: moduleTypeId == 22 && subModuleTypeId == 2 ?  gatePassDocument : ''
        };

        showLoader();
        console.log(apiBaseUrl + "GatePro/Master/addLoadingUnloadingInfo", FrmData)
        apiPostMethod(apiBaseUrl + "GatePro/Master/addLoadingUnloadingInfo", FrmData)
            .then((response) => {
                const { data } = response;
                if (data.success == true) {
                    ShowToast(data.message);
                    reset()
                    getLoadingData()
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

    const back = () => {
        setGatePassNo('')
        setFromPlant('')
        setMasterPlantId('')
        setToPlant('')
        setGatePassDetails([])
        setGatePassDetailsList([])
        reset()
    }   

    const [attachedFiles, setAttachment] = useState({ shipmentCopy: {}, coaCopy: {} });

    const handleFileChange = (file, id) => {
        setAttachment({
            ...attachedFiles,
            [id]: file,
        });
    };
    const upload = (moduleStatusId) => {
        
        let keys = Object.keys(attachedFiles).filter((k) => attachedFiles[k].name);
        let shipmentCopys;
        if (keys.length > 0 && (UserDetails.GATE_ID == 17 || UserDetails.GATE_ID == 18 || UserDetails.GATE_ID == 19)) {
          let postdata = new FormData();
                let { shipmentCopy } = postdata;
    
                postdata.append("image[]", shipmentCopy);
    
                let UploadFile = 0;
    
                Object.keys(attachedFiles).forEach((key) => {
                    postdata.append("file[]", attachedFiles[key]);
                });
    
                UploadFile = attachedFiles.shipmentCopy && attachedFiles.shipmentCopy.name && attachedFiles.shipmentCopy.name.length ? true : false;
                
    
                postdata.append("form_name", 'Gate pass - Receipt');
                postdata.append("SubFolder", "FG_GateOut");
    
                apiPostMethod(sapFileShare, postdata, "File")
                    .then((response) => {
                        const { data } = response;
                        if (data.success) {
                          shipmentCopys = data.files[0] ? data.files[0].updname : "";
                          gateIn(shipmentCopys)
                        }
                    })
        }else{
          gateIn()
        }
    }
    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!truckValue) {
          errorToast('Please enter a value to generate the barcode.');
          return;
        }
    
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        const barcodeSvg = document.getElementById('barcode');
        const svgData = new XMLSerializer().serializeToString(barcodeSvg);
        const img = new Image();
        img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
        img.onload = () => {
          context.drawImage(img, 0, 0);
    
          const dataURL = canvas.toDataURL('image/png');
          fetch(dataURL)
            .then(res => res.blob())
            .then(blob => {
              const postdata = new FormData();
    
              postdata.append('file[]', blob, `${truckValue}.png`);
              postdata.append("form_name", 'Barcode');
              postdata.append("SubFolder", "Barcode");
    
              apiPostMethod(sapFileShare, postdata, "File")
                  .then(response => {
                    const { data } = response;
                if (data.success) {
                  let gatePassDocument ;
                  gatePassDocument = data.files[0] ? data.files[0].updname : "";
                  submit(gatePassDocument);
                } else {
                  errorToast('Failed to save barcode data.');
                }
              }).catch(error => {
                console.error('Error saving barcode data:', error);
                errorToast('An error occurred while saving barcode data.');
              });
            });
        };
      };
    return (
        <>

            {subModuleTypeId != 1 && subModuleTypeId != 3 ? <Col md="12" sm="12"><hr></hr></Col> : null}

            <Col md="12" sm="12">
                <h4 className="text-primary"><u>Gate Pass Details</u></h4><br />
            </Col>

            {isDisable || subModuleTypeId == 1 || subModuleTypeId == 3 ? <>
                <Col md="4" sm="4">
                    <FormGroup>
                        <Label>Gate Pass Number</Label>
                        <InputGroup>
                            <Input type="text" placeholder="Gate Pass Number" onChange={(e) => setGatePassNo(e.target.value)} value={gatePassNo} disabled={gatePassDetails != '' ? true : false} />
                            <Button size="sm" color="success" style={{ height: '38px', width: '50px' }} onClick={getGatePassDetails}>
                                <Search size={20} />
                            </Button>
                        </InputGroup>
                    </FormGroup>
                </Col>
                <Col md="8" sm="8"></Col>

                {gatePassDetails.map((data) => (
                    <Col md="12" sm="12" key={data.GATEPASS_NO}>
                        <Row>
                            <Col md="3" sm="3">
                                <FormGroup>
                                    <Label>Gate Pass No</Label>
                                    <Input placeholder="Gate Pass No" value={data.GATEPASS_NO} disabled />
                                </FormGroup>
                            </Col>

                            <Col md="3" sm="3">
                                <FormGroup>
                                    <Label>Gate Pass Type</Label>
                                    <Input placeholder="Gate Pass Type" value={data.GATEPASS_TYPE} disabled />
                                </FormGroup>
                            </Col>

                            <Col md="3" sm="3">
                                <FormGroup>
                                    <Label>From Plant</Label>
                                    <Input placeholder="From Plant" value={data.FROM_PLANT} disabled />
                                </FormGroup>
                            </Col>

                            {data.VENDOR_PLANT ?
                                <Col md="3" sm="3">
                                    <FormGroup>
                                        <Label>Vendor Plant</Label>
                                        <Input placeholder="Vendor Plant" value={data.VENDOR_PLANT_NAME} disabled />
                                    </FormGroup>
                                </Col> : null
                            }

                            {data.VENDOR_PLANT == '' ?
                                <Col md="3" sm="3">
                                    <FormGroup>
                                        <Label>To Plant</Label>
                                        <Input placeholder="Vendor Plant" value={toPlant} disabled />
                                    </FormGroup>
                                </Col> : null
                            }
                        </Row>
                    </Col>
                ))}

                {gatePassDetails != "" ?
                    <Col sm="12" md="12">
                        <FormGroup className="d-flex justify-content-center mb-0">
                            <Button.Ripple color="primary" type="button" onClick={checkPlant}>
                                <Plus size={16} /> Add
                            </Button.Ripple>
                        </FormGroup>
                    </Col> : null
                }

                {gatePassDetailsList != '' ? <>
                    <Col md="12" sm="12">
                        <label></label>
                        <table className="table table-bordered">
                            <thead>
                                <tr>
                                    <th className="bg-primary text-white">Gate Pass No</th>
                                    <th className="bg-primary text-white">Gate Pass Type</th>
                                    <th className="bg-primary text-white">From Plant</th>
                                    <th className="bg-primary text-white">{toPlant == '' ? 'Vendor Plant' : 'To Plant'}</th>
                                </tr>
                            </thead>
                            {gatePassDetailsList?.map((data) => (
                                <tbody key={data.GATEPASS_NO}>
                                    <tr>
                                        <td>{data?.GATEPASS_NO}</td>
                                        <td>{data?.GATEPASS_TYPE}</td>
                                        <td>{data?.FROM_PLANT}</td>
                                        <td>{data?.VENDOR_PLANT ? data?.VENDOR_PLANT_NAME : toPlant}</td>
                                    </tr>
                                </tbody>
                            ))}
                        </table>
                    </Col>
                    {moduleTypeId != 29 && UserDetails.role == 'Security' && subModuleTypeId == 1 && (UserDetails.GATE_ID == 17 || UserDetails.GATE_ID == 18 || UserDetails.GATE_ID == 19) &&
                    <Col sm="12" md="12">
                                <label></label>
                                    <div className="mr-1">
                                        <div style={{ marginBottom: "7px" }}></div>
                                        <Label><b>Attachments :</b></Label>
                                    </div>
                                    <div className="mr-1">
                                        <Uploader
                                            setAttachment={handleFileChange}
                                            title="Receipt Document"
                                            id={"shipmentCopy"}
                                            selectedFileName={attachedFiles.shipmentCopy.name}
                                        />
                                    </div>
                                   
                     </Col>}
                    {moduleTypeId != 29 &&
                    <Col sm="10" md="10">
                        <label>&nbsp;</label>
                        <FormGroup className="d-flex justify-content-start mb-0">
                            <Button.Ripple outline color="primary" type="button" onClick={back}>
                                <ArrowLeft size={16} /> Back
                            </Button.Ripple>
                        </FormGroup>
                    </Col>}
                    {moduleTypeId != 29 &&
                    <Col sm="2" md="2">
                        <label>&nbsp;</label>
                        <FormGroup className="d-flex justify-content-end mb-0">
                            <Button color="primary" type="button" onClick={(moduleTypeId == 22 && subModuleTypeId == 2) ? handleSubmit :submit}>
                                <Check size={16} /> Save
                            </Button>
                        </FormGroup>
                    </Col>}
                    {moduleTypeId == 29 &&
                    <Col sm="12" md="12">
                        <label>&nbsp;</label>
                        <FormGroup className="d-flex justify-content-end mb-0">
                            <Button color="primary" type="button" onClick={GatePass_DocumentVerify}>
                                <Check size={16} /> Save
                            </Button>
                        </FormGroup>
                    </Col>} </> : null

                }

            </> : null}
        </>
    )
}

export default GatePassInfo
