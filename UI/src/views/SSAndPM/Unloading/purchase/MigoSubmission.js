import { Card, CardHeader, CardBody, Button, Row, Label, FormGroup, Col, Input, InputGroup, } from "reactstrap";
import React from "react";
import { useHistory } from "react-router-dom";
import { useState } from "react";
import TableComponent from "../../../common/TableComponent";
import { apiBaseUrl } from "../../../../urlConstants";
import { apiGetMethod, apiPostMethod } from "../../../../helper/axiosHelper";
import { ShowToast, errorToast } from "../../../../helper/appHelper";
import { useLoader } from "../../../../utility/hooks/useLoader";
import { useSelector } from "react-redux";
import { RefreshBlock1 } from "../../../common/RefreshBlock1";
import { useFormik } from "formik";
import { CustomDropdownInput, CustomTextInput, Yup } from "../../../forms/custom-form";
import { ArrowDown, Search } from "react-feather";
import { Modal } from "react-bootstrap";
import { X } from "react-feather";
import Select from "react-select";
import { HrLine } from "../../../common/HrLine";
import { getAllowedPastDate, minDate } from "../../../common/dateComponent";
import confirmDialog from "../../../../@core/components/confirm/confirmDialog";

export const taColumns = [
    {
        name: "PO NUMBER",
        selector: "poNumber",
        sortable: true,
        minWidth: "100px",
    },
    {
        name: "PO TYPE",
        selector: "poTypeName",
        sortable: true,
        minWidth: "200px",
    },

    {
        name: "VENDOR CODE",
        selector: "vendorCode",
        sortable: true,
        minWidth: "150px",
    },
    {
        name: "VENDOR NAME",
        selector: "vendorName",
        sortable: true,
        minWidth: "150px",
    },
    {
        name: "NET WEIGHT",
        selector: "netWeight",
        sortable: true,
        minWidth: "150px",
    },

];
const taColumnsVADetails = [
    {
        name: "VA NO",
        selector: "vaNumber",
        sortable: true,
        minWidth: "200px",
        wrap: true,
    },
    {
        name: "Vehicle No",
        selector: "vehicleNo",
        sortable: true,
        minWidth: "200px",
        wrap: true,
    },
    {
        name: "First Weight",
        selector: "firstWeight",
        sortable: true,
        minWidth: "200px",
        wrap: true,
    },
    {
        name: "Second Weight",
        selector: "secondWeight",
        sortable: true,
        minWidth: "200px",
        wrap: true,
    },
    {
        name: "Net Weight",
        selector: "netWeight",
        sortable: true,
        minWidth: "200px",
        wrap: true,
    },

];
const MigoSubmission = ({ actionRendorer }) => {

    let { showLoader, hideLoader } = useLoader();
    const history = useHistory();
    const [show, setShow] = useState(false);
    const [poNumber, setpoNumber] = useState('');
    const [poLineData, setpoLineData] = useState([]);
    const [poLine2Data, setpoLine2Data] = useState([]);
    const [material, setMaterial] = useState('');
    const [material2, setMaterial2] = useState('');
    const [selectedDetails, setSelectedDetails] = useState('');
    const [selectedDetails2, setSelectedDetails2] = useState('');
    const [poLine, setpoLine] = useState('');
    const [poLine2, setpoLine2] = useState('');
    const [poDetails, setPoDetails] = useState({});
    const [poTypeData, setPoTypeData] = useState([])
    const [quantity, setQuantity] = useState('');
    const UserDetails = useSelector((state) => (state && state.auth ? state.auth.userData : {}));
    const [landingData, setLandingData] = useState([]);
    const [poNo, setPoNo] = useState('');
    const [plantCode, setPlantCode] = useState('');
    const [open, setOpen] = useState(false);
    const [Data, setData] = useState([]);
    const [Data1, setData1] = useState([]);
    const [invoicePostingDate, setInvoicePostingDate] = useState('');


    const actionsCol = {
        name: "ACTIONS",
        selector: "status",
        minWidth: "220px",
        cell: (row) => {
            return actionRendorer ? (
                actionRendorer(row)
            ) : (
                <Row>&nbsp;&nbsp;
                    <>
                        <Button.Ripple color="primary" size="sm" type="button" onClick={() => onActionClick(row)}>Action</Button.Ripple>
                    </>
                </Row>
            );
        },
    };


    const handlePoNumberChange = async (poNumber) => {
        setpoNumber(poNumber)
    }

    const onActionClick = (row) => {
        const poNo = poNumber.label;
        return (
            apiPostMethod(apiBaseUrl + `GatePro/Weighment/getVehicleList/${poNo}/1`)
                .then((response) => {
                    const { data } = response;
                    if (data.success) {
                        setData(data.results);
                        setData1(row);
                        setOpen(true);
                        getPoInfo(poNo);

                    }
                })
                .catch((error) => {
                    errorToast("NO Record Found");
                })
        )
    };

    const form = useFormik({
        isInitialValid: false,
        initialValues: {},
        validationSchema: Yup.object().shape({}),
        onSubmit() { },
    });

    const getVehicleList = () => {
        const poNo = poNumber.label;
        showLoader();
        apiPostMethod(apiBaseUrl + `GatePro/Weighment/getVehicleList/${poNo}/0`)
            .then((response) => {
                const { data } = response;
                if (data.success == true) {
                    const stoData = data.results
                    setLandingData(stoData);
                }
                else if (data.success == false) {
                    errorToast(data.message);
                    setLandingData([])
                }
            })
            .catch((error) => {
                errorToast("Something went wrong, please try again after sometime");
            })
            .finally((a) => {
                hideLoader();
            });
    }


    const Approve = (status) => {

        if (selectedDetails?.value == '' || selectedDetails?.value == undefined) {
            errorToast("Please Select The Poline");
            return false;
        } else if(Data1?.netWeight < Data1?.quantity){
            errorToast("Please Check The Weight");
            return false;
        }  else if ( selectedDetails2?.value == '' || selectedDetails2?.value == undefined) {
            errorToast("Please Fill The Second PO & Poline");
            return false;
        }   else if (form.values.invoice_no == '' || form.values.invoice_no == undefined) {
            errorToast("Please Enter Invoice No...");
            return false;
        } else if (form.values.invoiceDate == '' || form.values.invoiceDate == undefined) {
            errorToast("Please Select Invoice Date...");
            return false;
        }   else if (form.values.remarks == '' || form.values.remarks == undefined) {
            errorToast("Please Enter Remarks...");
            return false;
        } else if (quantity < (Data1?.netWeight - Data1?.quantity)) {
            errorToast("Please Upgrade The Quantity");
            return false;
        } 

        const postdata = {
            userId: UserDetails.USERID,
            value1: {
                poNumber: Data1?.poNumber	 || '', 
                poLine: selectedDetails?.value.slice(-2) || '',
                material: selectedDetails?.materialCode || '',
                plant: selectedDetails?.plant || '',
                storage: selectedDetails?.storage || '' ,     
                quantity: Data1?.netWeight || '' ,     
                uom: selectedDetails?.uom || '', 
                vendor: Data1?.vendorCode || '',    
                invoiceNo: form.values?.invoice_no || '',    
                invoiceDate: form.values?.invoiceDate || '',    
                remarks: form.values?.remarks || '',
                rowCnt: Data.length || '',
            },
            value2: {
                poNumber: poDetails?.PO_NO || '', 
                poLine: selectedDetails2?.value.slice(-2) || '',
                material: selectedDetails2?.materialCode || '',
                plant: selectedDetails2?.plant || '',
                storage: selectedDetails2?.storage || '' ,     
                quantity: Data1?.netWeight - Data1?.quantity || '' ,     
                uom: selectedDetails2?.uom || '', 
                vendor: poDetails?.VENDOR || '',    
                invoiceNo: form.values?.invoice_no || '',    
                invoiceDate: form.values?.invoiceDate || '',    
                remarks: form.values?.remarks || '',    
                rowCnt: form.values?.remarks || 0,    
            }
        }

        let msg = "Migo Confimation"
        let titles
        if (status == 1) {
            titles = 'Are you sure to Add?'
        }

        confirmDialog({
            title: titles,
            description: msg,
        }).then((res) => {
            if (res) {
                apiPostMethod(apiBaseUrl + 'GatePro/Weighment/migoConfirmation', postdata)
                    .then((response) => {
                        const { data } = response;
                        if (data.success == true) {
                            if (status == 1) {
                                ShowToast("Saved Successfully...");
                                setOpen(false)
                            }
                            window.setTimeout(function () {
                                window.location.reload();
                            }, 2000);
                        } else if (data.success == false) {
                            errorToast(data.message);
                            setOpen(false)
                        }
                    })
                    .catch((error) => {
                        errorToast("Something went wrong, please try again after sometime");
                    });
            }
        });
    };

    const getPoInfo = (Data1) => {
        showLoader();
        const postData = {
            poNumber : Data1,
            moduleTypeId: 12,
        }
        apiPostMethod(apiBaseUrl + `GatePro/Weighment/getPoDetails`, postData)
            .then((response) => {
                const { data } = response;
                if (data.success) {
                    const poData = data.data[0];
                    const poLineItemOptions = poData.PO_LINEITEM.map(item => ({
                        value: item.PO_LINEITEM,
                        label: item.PO_LINEITEM,
                        materialCode: item.MATERIAL, 
                        materialName: item.MATERIAL_DES, 
                        plant: item.PLANT, 
                        storage: item.STORAGE_LOC, 
                        uom: item.UOM, 
                    }));

                    setpoLineData(poLineItemOptions);
                
                } else {
                    errorToast(data.message);
                }
            })
            .finally(() => {
                hideLoader();
            });
    };


    const getPoDetails = (PoNumber) => {
        showLoader();
        const poNumber = { poNumber: poNo || PoNumber  };
        apiPostMethod(apiBaseUrl + `GatePro/Weighment/getPoDetails`, poNumber)
            .then((response) => {
                const { data } = response;
                if (data.success) {
                    const poData = data.data[0];
                    getPoType(poData.TYPE ? poData.TYPE : 0);
                    setPoDetails(poData);

                    let hasErrorShown = false; // Flag to track if an error has been shown
                    setPlantCode(poData.PO_LINEITEM[0]?.PLANT)
                    setQuantity(poData.PO_LINEITEM[0]?.QUANTITY)
                    poData.PO_LINEITEM?.forEach(item => {
                        if (UserDetails?.plantids?.includes(item.PLANT)) {
                           
                        } else if (!hasErrorShown) {
                            confirmDialog({
                                title: `<h5><strong class="text-white"> Plant not assigned for user, please assign</strong></h5>`, cancelButton: false, confirmText: false, confirmButton: false, background: `#BD362F`
                              })
                            hasErrorShown = true; // Prevents further error toasts
                        }
                    });

                    // Map PO_LINEITEM for Dropdown
                    const poLineItemOptions2 = poData.PO_LINEITEM.map(item => ({
                        value: item.PO_LINEITEM,
                        label: item.PO_LINEITEM,
                        materialCode: item.MATERIAL, 
                        materialName: item.MATERIAL_DES, 
                        plant: item.PLANT, 
                        storage: item.STORAGE_LOC, 
                        uom: item.UOM, 
                    }));

                    setpoLine2Data(poLineItemOptions2);
                
                } else {
                    errorToast(data.message);
                }
            })
            .finally(() => {
                hideLoader();
            });
    };


    const handlePoLineChange = (poL) => {
        setpoLine(poL.value)
        const selectedItem = poLineData.find(item => item.value === poL.value);
        setSelectedDetails(selectedItem);
        if (selectedItem) {
            setMaterial(selectedItem.materialName); // Set Material
        }
    }
    const handlePoLine2Change = (poL2) => {
        setpoLine2(poL2.value)
        const selectedItem = poLine2Data.find(item => item.value === poL2.value);
        setSelectedDetails2(selectedItem);
        if (selectedItem) {
            setMaterial2(selectedItem.materialName); // Set Material
        }
    }


    const getPoType = (poType) => {
        apiGetMethod(apiBaseUrl + `GatePro/Master/getPoType/${poType}`)
            .then((response) => {
                const data = response.data;
                if (data.success == true) {
                    setPoTypeData(data.results[0])
                } else {
                    confirmDialog({
                        title: `<h5><strong class="text-white">${data.message}</strong></h5>`, cancelButton: false, confirmText: false, confirmButton: false, background: `#BD362F`
                    })
                }
            })
            .catch((error) => {
                errorToast("Something went wrong, please try again after sometime");
            })
    }

    const close = () => setOpen(false);

    const columns = [...taColumns, actionsCol];
    const ColumnsVADetails = [...taColumnsVADetails];

    return (
        <div>

            <Card>
                <CardHeader><h5>Migo Submission</h5><RefreshBlock1 /></CardHeader>
                <hr />
                <CardBody>
                    <Row>
                        <Col sm="3" md="3">
                            <CustomDropdownInput
                                url={`${apiBaseUrl}GatePro/Weighment/GetPoNumbers`}
                                label={"Po Number"}
                                form={form}
                                id="poNumber"
                                name="poNumber"
                                value={form.values.poNumber}
                                onChange={(poNumber) => {
                                    handlePoNumberChange(poNumber);
                                }}
                            />
                        </Col>
                        <Col md="2" sm="2">
                            <FormGroup className='mt-2'>
                                <Button
                                    color="primary"
                                    type="submit"
                                    onClick={getVehicleList}
                                > View <ArrowDown size={16} />
                                </Button>
                            </FormGroup>
                        </Col>
                    </Row>
                </CardBody>
            </Card>

            {landingData != '' ?
                <Card >
                    <CardHeader><h5>Document Details</h5></CardHeader>
                    <hr />
                    <CardBody>
                        <TableComponent showDownload columns={columns} data={landingData} />
                    </CardBody>
                </Card> : null
            }


            {landingData == '' ? <div style={{ marginBottom: "330px" }}></div> : null}

            <Modal show={open} centered size="xl">
                <Modal.Header><b>Migo Confirmation</b>
                    <X onClick={close} style={{ float: "right" }} />
                </Modal.Header>
                <Modal.Body>
                    <Row>
                        <Col md="3" sm="12">
                            <CustomTextInput label={"Po Number"} form={form} id="Data" value={Data1?.poNumber} type="text" disabled />
                        </Col>
                        <Col sm="12" md="3">
                            <CustomDropdownInput
                                options={poLineData}
                                label={"Po Line"}
                                form={form}
                                id="poLine"
                                name="poLine"
                                value={form.values.poLine}
                                onChange={(poL) => {
                                    handlePoLineChange(poL);
                                }}
                            />
                        </Col>
                        <Col md="3" sm="3">
                            <FormGroup>
                                <Label>MATERIAL</Label>
                                <Input placeholder="Material" form={form} id="material" value={material} disabled />
                            </FormGroup>
                        </Col>
                        <Col md="3" sm="12">
                            <CustomTextInput label={"Vehicle Count"} form={form} id="Data" value={Data.length} type="text" disabled />
                        </Col>

                        <Col md="3" sm="12">
                            <CustomTextInput label={"Total Net Weight(GRN Quantity)"} form={form} id="net_weight" value={Data1?.netWeight} type="text" disabled />
                        </Col>
                        <Col md="3" sm="12">
                            <CustomTextInput label={"Quantity"} form={form} id="quantity" value={Data1?.quantity} type="text" disabled />
                        </Col>
                        <Col md="3" sm="12">
                            <CustomTextInput label={"Balance"} form={form} id="balance" value={Data1?.netWeight - Data1?.quantity} type="text" disabled />
                        </Col>
                        <Col md="3" sm="12">
                            <CustomTextInput label={"Vendor Name"} form={form} id="vendor_name" value={Data1?.vendorName} type="text" disabled />
                        </Col>
                        <Col md="3" sm="4">
                            <FormGroup>
                                <CustomTextInput
                                    label="Invoice No"
                                    type="text"
                                    value={form.values.invoice_no}
                                    onChange={(e) => form.setFieldValue('invoice_no', e.target.value)}
                                    form={form}
                                    id="invoice_no"
                                />
                            </FormGroup>
                        </Col>
                        <Col md="3" sm="12" >
                            <CustomTextInput
                                label={"Invoice Date"}
                                form={form}
                                id="invoiceDate"
                                type="date"
                                min={getAllowedPastDate(invoicePostingDate)}
                                max={minDate}
                                onKeyDown={(e) => {
                                    e.preventDefault()
                                }}
                            />
                        </Col>
                        <Col md="3" sm="12">
                            <CustomTextInput label={"Remarks"} form={form} id="remarks" type="text" />
                        </Col>
                    </Row>
                    <Row>
                        <Col md="3" sm="4">
                            <Label for="poNumber">PO Number</Label>
                            <InputGroup>
                                <Input type="text" name="PO Number" id="poNumber" placeholder="PO Number" onChange={(e) => setPoNo(e.target.value)} value={poNo} />
                                <Button size="sm" color="success" style={{ height: '38px', width: '50px' }} onClick={() => { getPoDetails('list') }}>
                                    <Search size={20} />
                                </Button>
                            </InputGroup>
                        </Col>
                        <Col sm="12" md="3">
                            <CustomDropdownInput
                                options={poLine2Data}
                                label={"Po Line"}
                                form={form}
                                id="poLine2"
                                name="poLine2"
                                value={form.values.poLine2}
                                onChange={(poL2) => {
                                    handlePoLine2Change(poL2);
                                }}
                            />
                        </Col>
                        {poLine2 !== "" && (
                            <>
                        <Col md="3" sm="4">
                            <Label>Invoice No / Delivery Challan</Label>
                            <Input type="text" placeholder="Invoice No / Delivery Challan" disabled value={form.values.invoice_no} />
                        </Col>
                        <Col md="3" sm="3">
                            <FormGroup>
                                <Label>MATERIAL</Label>
                                <Input placeholder="Material" form={form} id="material2" value={material2} disabled />
                            </FormGroup>
                        </Col>
                        {/* 
                        
                        {poDetails?.VENDOR_NAME == '' ?
                            <Col md="3" sm="3">
                                <FormGroup>
                                    <Label>TO PLANT</Label>
                                    <Input placeholder="To Plant" value={plantCode} disabled />
                                </FormGroup>
                            </Col> : null
                        } */}
                        <Col md="3" sm="3">
                            <FormGroup>
                                <Label>PO TYPE</Label>
                                <Input placeholder="Po Type" value={poDetails?.REFERENCE ? poDetails?.REFERENCE : poTypeData?.name} disabled />
                            </FormGroup>
                        </Col>
                        <Col md="3" sm="3">
                            <FormGroup>
                                <Label>FROM PLANT</Label>
                                <Input placeholder="Plant Name" value={poDetails?.FROMPLANT ? poDetails?.FROMPLANT : plantCode} disabled />
                            </FormGroup>
                        </Col>
                        <Col md="3" sm="3" >
                            <FormGroup>
                                <Label>VENDOR NAME</Label>
                                <Input placeholder="Vendor Name" value={poDetails?.VENDOR_NAME} disabled />
                            </FormGroup>
                        </Col>
                        <Col md="3" sm="3" >
                            <FormGroup>
                                <Label>QUANTITY</Label>
                                <Input placeholder="Vendor Name" value={quantity} disabled />
                            </FormGroup>
                        </Col>
                        <Col md="3" sm="3" >
                            <FormGroup>
                                <Label>GRN QUANTITY</Label>
                                <Input placeholder="GRN Quantity" value={Data1?.netWeight - Data1?.quantity} disabled />
                            </FormGroup>
                        </Col>
                        </>
                        )}
                    </Row>

                    <Row>
                        <Col align="right">
                            <Button onClick={(e) => Approve(1)} className="ml-2" color="primary">Approve</Button>
                        </Col>
                    </Row>
                    <HrLine />
                    <Row>
                        <Col>
                            <TableComponent
                                showDownload
                                columns={ColumnsVADetails}
                                data={Data} />
                        </Col>
                    </Row>
                </Modal.Body>
            </Modal>
        </div >
    );
};

export default MigoSubmission;
