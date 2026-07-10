import React, { Fragment, useState } from "react";
import { useFormik } from "formik";
import { CustomDropdownInput, CustomTextInput, validation, Yup } from "../forms/custom-form";
import { apiBaseUrl } from "../../urlConstants";
import { Row, Col, Label, FormGroup, Input, Card, CardBody, CardHeader, Button, InputGroup } from "reactstrap";
import { RefreshBlock1 } from "../common/RefreshBlock1";
import { errorToast, ShowToast } from "../../helper/appHelper";
import { apiPostMethod } from "@helpers/axiosHelper";
import { useLoader } from "../../utility/hooks/useLoader";
import { useEffect } from "react";
import { useParams } from "react-router";
import { ArrowLeft, Check, Plus, Search, Trash, X } from "react-feather";
import Select from 'react-select'
import { useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { apiGetMethod } from "../../helper/axiosHelper";
import confirmDialog from "../../@core/components/confirm/confirmDialog";
import { minDate, minDate1 } from "../common/dateComponent";

const LoadingUnloadingInfo = () => {

    useEffect(() => {
        getLoadingAndUnloadingInfo()
        getUserPlant()
    }, [])

    let { showLoader, hideLoader } = useLoader();
    let { loadingAndUnloadingInfoId } = useParams();
    const history = useHistory();

    const [data, setData] = useState(true)
    const [plantId, setPlantId] = useState("")
    const [plantName, setPlantName] = useState("")

    const selectPlant = (e) => {
        setPlantId(e.value)
        setPlantName(e.label)
    }

    const form = useFormik({
        isInitialValid: false,
        initialValues: {},
        validationSchema: Yup.object().shape({
            phoneNo: validation.number({ min: 10, max: 10 })
        }),
        onSubmit() { },
    });

    const getLoadingAndUnloadingInfo = () => {
        showLoader();
        console.log(apiBaseUrl + `GatePro/Master/getLoadingAndUnloadingInfo/0/${loadingAndUnloadingInfoId}/${UserDetails.USERID}`);
        apiPostMethod(apiBaseUrl + `GatePro/Master/getLoadingAndUnloadingInfo/0/${loadingAndUnloadingInfoId}/${UserDetails.USERID}`)
            .then((response) => {
                const { data } = response;
                if (data.success == true) {
                    setData(data.results[0]);
                    let loadingData = data.results[0]
                    getPurchaseOrder(loadingData.loadingAndUnloadingInfoId)
                    form.setValues({
                        invoiceNo: loadingData.invoiceNo,
                        truckNo: loadingData.truckNo,
                        masterPlantId: loadingData.masterPlantId,
                        eda: loadingData.eda,
                        remarks: loadingData.remarks,
                        fromDate: loadingData.fromDate,
                        toDate: loadingData.toDate,
                        personName: loadingData.personName,
                        phoneNo: loadingData.phoneNo,
                        tripSheetNo: loadingData.tripSheetNo,
                        isWeight: [{ value: loadingData.isWeight, label: loadingData.isWeight == 1 ? 'Yes' : 'No' }]
                    })
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

    const [poData, setPoData] = useState([])

    const getPurchaseOrder = (loadingUnloadingInfoId) => {
        console.log(apiBaseUrl + `GatePro/Master/getPurchaseOrder/${loadingUnloadingInfoId}`);
        apiPostMethod(apiBaseUrl + `GatePro/Master/getPurchaseOrder/${loadingUnloadingInfoId}`)
            .then((response) => {
                const { data } = response;
                if (data.success == true) {
                    setPoData(data.results)
                }
                else if (data.success == false) {
                    setPoData([])
                    // errorToast(data.message);
                }
            }).catch((error) => {
                console.log(JSON.stringify(error))
                errorToast("Something went wrong, please try again after sometime");
            })
    }

    const [userPlant, setUserGate] = useState([])

    const getUserPlant = (plantCode) => {
        console.log(apiBaseUrl + `GatePro/Master/getUserPlant/${UserDetails.USERID}`);
        apiGetMethod(apiBaseUrl + `GatePro/Master/getUserPlant/${UserDetails.USERID}`)
            .then((response) => {
                const data = response.data;
                if (data.success == true) {
                    setUserGate(data.results)
                    const masterPlant = data.results.filter((plant) => plant.werks == plantCode);
                    setPlantName(masterPlant[0]?.plantName)
                }
            })
            .catch((error) => {
                console.log(error)
                errorToast("Something went wrong, please try again after sometime");
            })
    }

    const [poNo, setPoNo] = useState('');

    const masterPlantId = [{ value: plantId ? plantId : data.masterPlantId, label: plantName ? plantName : data.plantName }]
    const UserDetails = useSelector((state) => (state && state.auth ? state.auth.userData : {}));

    const updateLoadingUnloadingInfo = (statusId,id) => {

        let formData = form.values;

        const FrmData = {
            loadingUnloadingInfoId: data.loadingAndUnloadingInfoId,
            invoiceNo: formData.invoiceNo,
            truckNo: formData.truckNo,
            masterPlantId: plantId ? plantId : data.masterPlantId,
            eda: formData.eda,
            remarks: formData.remarks,
            fromDate: formData.fromDate,
            toDate: formData.toDate,
            personName: formData.personName,
            phoneNo: formData.phoneNo,
            tripSheetNo: formData.tripSheetNo,
            isWeight: formData?.isWeight?.value,
            statusId: statusId,
            userInfoId: UserDetails.USERID,
        };

        if (statusId == 8 && id == 1) {
            confirmDialog({
                title: `<h4>Are you sure want to Reject?<h4>`,
            }).then((res) => {
                if (res) {
                    showLoader();
                    apiPostMethod(apiBaseUrl + "GatePro/Master/updateLoadingUnloadingInfo", FrmData)
                        .then((response) => {
                            const { data } = response;
                            if (data.success == true) {
                                ShowToast("Rejected Successfully");
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
            })
        }
        else {
            showLoader();
            apiPostMethod(apiBaseUrl + "GatePro/Master/updateLoadingUnloadingInfo", FrmData)
                .then((response) => {
                    const { data } = response;
                    if (data.success == true) {
                        if (purchaseOrderDetails.length > 0) {
                            updatePurchaseOrderDetails()
                        } else {
                            ShowToast(data.message);
                        }
                        redirect()
                    }
                    else if (data.success == false) {
                        if (purchaseOrderDetails.length > 0) {
                            updatePurchaseOrderDetails()
                        } else {
                            errorToast(data.message);
                        }

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
    }

    const [poDetails, setPoDetails] = useState([])
    const [purchaseOrderDetails, setPurchaseOrderDetails] = useState([]);
    const [invoiceNo, setInvoiceNo] = useState('');
    const [showPoDetails, setShowPoDetails] = useState(false);

    const getPoDetails = (type) => {
        showLoader();
        const poNumber = { poNumber: poNo, moduleTypeId: data.moduleTypeId == 15 || data.moduleTypeId == 21 ? 12 : data.moduleTypeId }
        apiPostMethod(apiBaseUrl + `GatePro/Master/getPoDetails`, poNumber)
            .then((response) => {
                const { data } = response;
                if (data.success == true) {
                    let plantCode = data.data[0].LINE_ITEM ? data.data[0].LINE_ITEM[0].PLANT : data.data[0].PO_LINEITEM[0].PLANT
                    const plant = UserDetails.plantids.filter((userPlant) => userPlant == plantCode)
                    if (plant == '') {
                        confirmDialog({
                            title: `<h5><strong class="text-white"> ${plantCode} - Plant not assigned for user, please assign</strong></h5>`, cancelButton: false, confirmText: false, confirmButton: false, background: `#BD362F`
                        })
                    }
                    else {
                        if (type == 'list') {
                            getPoType(data.data[0].TYPE)
                            setPoDetails(data.data[0])
                            getUserPlant(data.data[0].LINE_ITEM ? data.data[0].LINE_ITEM[0].PLANT : data.data[0].PO_LINEITEM[0].PLANT)

                            if (data.moduleTypeId == 14) {
                                const length = data.data[0].LINE_ITEM ? data.data[0].LINE_ITEM.length : data.data[0].PO_LINEITEM.length

                                for (let i = 0; i < length; i++) {
                                    const obj = {
                                        poType: data.data[0].TYPE,
                                        poNumber: data.data[0].LINE_ITEM ? data.data[0].PO_NUMBER : data.data[0].PO_NO,
                                        invoiceNo: invoiceNo ? invoiceNo : null,
                                        line: data.data[0].LINE_ITEM ? data.data[0].LINE_ITEM[i].LINE : data.data[0].PO_LINEITEM[i].PO_LINEITEM,
                                        material: data.data[0].LINE_ITEM ? data.data[0].LINE_ITEM[i].MATERIAL : data.data[0].PO_LINEITEM[i].MATERIAL,
                                        description: data.data[0].LINE_ITEM ? data.data[0].LINE_ITEM[i].DESCRIPTION : null,
                                        plantCode: data.data[0].LINE_ITEM ? data.data[0].LINE_ITEM[i].PLANT : data.data[0].PO_LINEITEM[i].PLANT,
                                        quantity: data.data[0].LINE_ITEM ? data.data[0].LINE_ITEM[i].QUANTITY : data.data[0].PO_LINEITEM[i].QUANTITY,
                                        documentDate: data.data[0].DOCUMENT_DATE || data.data[0].PO_DATE,
                                        vendorName: data.data[0].VENDOR_NAME,
                                        vendorCode: data.data[0].VENDOR,
                                        storageLocation: data.data[0].LINE_ITEM ? data.data[0].LINE_ITEM[i].STO_LOCATION : data.data[0].PO_LINEITEM[i].STORAGE_LOC,
                                    }
                                    purchaseOrderDetails.push(obj);
                                }
                                setPurchaseOrderDetails(purchaseOrderDetails);
                            }
                        } else {
                            getPoDetails('list')
                            setPoDetails([])
                            setPoNo('')
                            setInvoiceNo('')

                            for (let i = 0; i < data.data.length; i++) {
                                const obj = {
                                    poNumber: data.data[0].PO_NUMBER || data.data[0].PO_NO,
                                    invoiceNo: invoiceNo,
                                    type: data.data[0].TYPE,
                                    plantCode: data.data[0].LINE_ITEM ? data.data[0].LINE_ITEM[0].PLANT : data.data[0].PO_LINEITEM[0].PLANT,
                                    vendorName: data.data[0].VENDOR_NAME,
                                    poName: poTypeData.name,
                                    plantName: plantName
                                }
                                poData.push(obj);
                            }
                            setPoData(poData)

                            const length = data.data[0].LINE_ITEM ? data.data[0].LINE_ITEM.length : data.data[0].PO_LINEITEM.length

                            for (let i = 0; i < length; i++) {
                                const obj = {
                                    poType: data.data[0].TYPE,
                                    poNumber: data.data[0].LINE_ITEM ? data.data[0].PO_NUMBER : data.data[0].PO_NO,
                                    invoiceNo: invoiceNo ? invoiceNo : null,
                                    line: data.data[0].LINE_ITEM ? data.data[0].LINE_ITEM[i].LINE : data.data[0].PO_LINEITEM[i].PO_LINEITEM,
                                    material: data.data[0].LINE_ITEM ? data.data[0].LINE_ITEM[i].MATERIAL : data.data[0].PO_LINEITEM[i].MATERIAL,
                                    description: data.data[0].LINE_ITEM ? data.data[0].LINE_ITEM[i].DESCRIPTION : null,
                                    plantCode: data.data[0].LINE_ITEM ? data.data[0].LINE_ITEM[i].PLANT : data.data[0].PO_LINEITEM[i].PLANT,
                                    quantity: data.data[0].LINE_ITEM ? data.data[0].LINE_ITEM[i].QUANTITY : data.data[0].PO_LINEITEM[i].QUANTITY,
                                    documentDate: data.data[0].DOCUMENT_DATE || data.data[0].PO_DATE,
                                    vendorName: data.data[0].VENDOR_NAME,
                                    vendorCode: data.data[0].VENDOR,
                                    storageLocation: data.data[0].LINE_ITEM ? data.data[0].LINE_ITEM[i].STO_LOCATION : data.data[0].PO_LINEITEM[i].STORAGE_LOC,
                                }
                                purchaseOrderDetails.push(obj);
                            }
                            console.log("Add purchaseOrderDetails");
                            console.log(purchaseOrderDetails);
                            setPurchaseOrderDetails(purchaseOrderDetails);
                        }
                    }
                } else {
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

    const [poTypeData, setPoTypeData] = useState([])

    const getPoType = (moduleType) => {
        console.log(apiBaseUrl + `GatePro/Master/getPoType/${moduleType}`)
        apiGetMethod(apiBaseUrl + `GatePro/Master/getPoType/${moduleType}`)
            .then((response) => {
                const data = response.data;
                if (data.success == true) {
                    setPoTypeData(data.results[0])
                } else {
                    confirmDialog({
                        title: `<h5><strong class="text-white">PO Type Not Maintained</strong></h5>`, cancelButton: false, confirmText: false, confirmButton: false, background: `#BD362F`
                    })
                }
            })
            .catch((error) => {
                console.log(error)
                errorToast("Something went wrong, please try again after sometime");
            })
    }

    const checkInvoiceNo = () => {

        if ((invoiceNo == "") && (data.moduleTypeId == 11 || data.moduleTypeId == 12 || data.moduleTypeId == 13 || data.moduleTypeId == 15 || data.moduleTypeId == 21 || data.moduleTypeId == 33 || data.moduleTypeId == 34 || data.moduleTypeId == 35 || data.moduleTypeId == 16)) {
            confirmDialog({
                title: `<h5><strong class="text-white">Please Enter Invoice No</strong></h5>`, cancelButton: false, confirmText: false, confirmButton: false, background: `#BD362F`
            })
        } else if (poData.length > 0) {
            const checkPoNo = poData.filter((poData) => poData.invoiceNo == invoiceNo && poData.poNumber == poNo);
            if (checkPoNo != '') {
                confirmDialog({
                    title: `<h5><strong class="text-white">Invoice No Already Added</strong></h5>`, cancelButton: false, confirmText: false, confirmButton: false, background: `#BD362F`
                })
            } else {
                getPoDetails()
                setShowPoDetails(false)
            }
        }
        else {
            getPoDetails()
            setShowPoDetails(false)
        }
    }

    function handleremove(poNumber) {

        let purchaseLength = purchaseOrderDetails.length;

        setPoNo('PO Number')
        confirmDialog({
            title: `<h4>Are you sure want to Remove?<h4>`,
        }).then((res) => {
            if (res) {
                let selectedItem
                poData.forEach((item) => {
                    if (item['poNumber'] == poNumber) {
                        selectedItem = item
                        poData.splice(poData.indexOf(selectedItem), 1);
                    }
                });
                for (let i = 0; i < purchaseLength; i++) {
                    purchaseOrderDetails.forEach((item) => {
                        if (item['poNumber'] == poNumber) {
                            selectedItem = item
                            purchaseOrderDetails.splice(purchaseOrderDetails.indexOf(selectedItem), 1);
                        }
                    });
                }
                console.log("End", purchaseOrderDetails);
                setPoNo('')
            }
            else {
                setPoNo('')
            }
        })
    }

    const updatePurchaseOrderDetails = () => {

        const FrmData = {
            loadingUnloadingInfoId: data.loadingAndUnloadingInfoId,
            purchaseOrderDetails: purchaseOrderDetails
        };

        showLoader();
        console.log(apiBaseUrl + "GatePro/Master/updatePurchaseOrderDetails", FrmData)
        apiPostMethod(apiBaseUrl + "GatePro/Master/updatePurchaseOrderDetails", FrmData)
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

    const deletePurchaseOrderDetails = (purchaseOrderId,line) => {
        setPoNo('PO Number')
        const postdata = {
            purchaseOrderId: purchaseOrderId,
            userInfoId: UserDetails.USERID,
            line:line+1
        }

        confirmDialog({
            title: `<h4>Are you sure want to delete?<h4>`,
        }).then((res) => {
            if (res) {
                showLoader();
                console.log(apiBaseUrl + "GatePro/Master/deletePurchaseOrderDetails", postdata)
                apiPostMethod(apiBaseUrl + "GatePro/Master/deletePurchaseOrderDetails", postdata)
                    .then((response) => {
                        const { data } = response;
                        if (data.success == true) {
                            ShowToast(data.message);
                            let selectedItem
                            poData.forEach((item) => {
                                if (item['purchaseOrderId'] == purchaseOrderId) {
                                    selectedItem = item
                                    poData.splice(poData.indexOf(selectedItem), 1);
                                }
                            });
                            setPoNo('')
                            setPoData(poData)
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
        })
            .catch((error) => {
                errorToast("Something went wrong please try again after sometime");

            });
    };

    const redirect = () => {
        history.push(`/LoadingUnloadingDetails`)
    }

    const isWeight = [{ value: 1, label: 'Yes' }, { value: 0, label: 'No' }]

    return (
        <form >
            <Fragment>
                <Card>
                    <CardHeader><h5>Update Loading & Unloading Info</h5><RefreshBlock1 /></CardHeader>
                    <hr />
                    <CardBody>
                        <Row>
                            {data?.moduleType ?
                                <Col md="4" sm="4">
                                    <CustomTextInput label={"Movement Type"} form={form} id="truckNo" type="text" value={data?.movementType} disabled />
                                </Col> : null
                            }
                            {data?.moduleType ?
                                <Col md="4" sm="4">
                                    <CustomTextInput label={"Module Type"} form={form} id="truckNo" type="text" value={data?.moduleType} disabled />
                                </Col> : null
                            }
                            {data?.truckNo ?
                                <Col md="4" sm="4">
                                    <CustomTextInput label={"Truck No"} form={form} id="truckNo" type="text" value={form.values.truckNo} maxLength={10} disabled={data?.isGateIn > 0 ? true : false} />
                                </Col> : null
                            }
                            {data?.invoiceNo ?
                                <Col md="4" sm="4">
                                    <CustomTextInput label={"Invoice Number"} form={form} id="invoiceNo" type="text" value={form.values.invoiceNo} />
                                </Col> : null
                            }
                            {data?.plantName ?
                                <Col sm="4" md="4">
                                    <FormGroup>
                                        <Label>Plant</Label>
                                        <Select
                                            value={masterPlantId}
                                            options={userPlant}
                                            onChange={selectPlant}
                                            isDisabled={data?.isGateIn > 0 ? true : false}
                                        />
                                    </FormGroup>
                                </Col> : null
                            }
                            {data?.eda ?
                                <Col md="4" sm="4">
                                    <FormGroup>
                                        <CustomTextInput label={"EDA"} form={form} id="eda" type="text" value={form.values.eda} />
                                    </FormGroup>
                                </Col> : null
                            }
                            {data?.fromDate ?
                                <Col md="4" sm="4">
                                    <CustomTextInput
                                        label={"From Date"}
                                        form={form}
                                        id="fromDate"
                                        type="date"
                                        min={minDate}
                                        onKeyDown={(e) => {
                                            e.preventDefault()
                                        }}
                                    />
                                </Col> : null
                            }
                            {data?.toDate ?
                                <Col md="4" sm="4">
                                    <CustomTextInput
                                        label={"To Date"}
                                        form={form}
                                        id="toDate"
                                        type="date"
                                        min={minDate1}
                                        onKeyDown={(e) => {
                                            e.preventDefault()
                                        }}
                                    />
                                </Col> : null
                            }
                            {data?.personName ?
                                <Col md="4" sm="4">
                                    <CustomTextInput label={"Person Name"} form={form} id="personName" type="text" value={form.values.personName} />
                                </Col> : null
                            }
                            {data?.phoneNo ?
                                <Col md="4" sm="4">
                                    <CustomTextInput label={"Phone Number"} form={form} id="phoneNo" type="text" value={form.values.phoneNo} />
                                </Col> : null
                            }
                            {data?.tripSheetNo ?
                                <Col md="4" sm="4">
                                    <FormGroup>
                                        <CustomTextInput type="text" label="Tripsheet Number" form={form} id="tripSheetNo" value={form.values.tripSheetNo} disabled />
                                    </FormGroup>
                                </Col> : null
                            }
                            {data?.remarks ?
                                <Col md="4" sm="4">
                                    <FormGroup>
                                        <CustomTextInput label={"Remarks"} form={form} id="remarks" type="text" value={form.values.remarks} />
                                    </FormGroup>
                                </Col> : null
                            }

                            {data?.moduleTypeId == 12 || data?.moduleTypeId == 15 || data?.moduleTypeId == 21 ?
                                <Col sm="4" md="4">
                                    <FormGroup>
                                        <CustomDropdownInput
                                            options={isWeight}
                                            label={"Is Weight"}
                                            form={form}
                                            id="isWeight"
                                            isDisabled={data?.isGateIn > 0 ? true : false}
                                        />
                                    </FormGroup>
                                </Col> : null
                            }

                            {data?.moduleTypeId == 6 || data?.moduleTypeId == 20 || data?.moduleTypeId == 11 || data?.moduleTypeId == 12 || data?.moduleTypeId == 13 || data?.moduleTypeId == 14 || data?.moduleTypeId == 15 || data?.moduleTypeId == 21 || data?.moduleTypeId == 33 || data?.moduleTypeId == 34 || data?.moduleTypeId == 35 || data?.moduleTypeId == 16 ||  data?.moduleTypeId == 38 ||  data?.moduleTypeId == 44 ? <>

                                <Col md="12" sm="12"><hr></hr></Col>

                                <Col md="12" sm="12">
                                    <h4 className="text-primary"><u>Purchase Order Details</u></h4><br />
                                </Col>

                                {data.moduleTypeId != 14 ?
                                    <Col md="4" sm="4">
                                        <FormGroup>
                                            <Label>PO Number</Label>
                                            <InputGroup>
                                                <Input type="text" name="PO Number" id="poNumber" placeholder="PO Number" onChange={(e) => setPoNo(e.target.value)} value={poNo} />
                                                <Button size="sm" color="success" style={{ height: '38px', width: '50px' }} onClick={() => { getPoDetails('list'); setShowPoDetails(true) }}>
                                                    <Search size={20} />
                                                </Button>
                                            </InputGroup>
                                        </FormGroup>    
                                    </Col> : null
                                } </> : null
                            }

                            {poDetails != '' ? <>
                                {(showPoDetails && poDetails != '') && (data.moduleTypeId == 12 || data.moduleTypeId == 15 || data.moduleTypeId == 21 || data.moduleTypeId == 33 || data.moduleTypeId == 34 || data.moduleTypeId == 35 || data.moduleTypeId == 16 || data.moduleTypeId == 38 || data.moduleTypeId == 44) ?
                                    <Col md="4" sm="4">
                                        <Label>Invoice No / Delivery Challan</Label>
                                        <Input type="text" placeholder="Invoice No / Delivery Challan" onChange={(e) => setInvoiceNo(e.target.value)} value={invoiceNo} />
                                    </Col> : null
                                }

                                {showPoDetails && poDetails != '' ? <>
                                    {[poDetails].map((poDetails) => (
                                        <Col md="12" sm="12" key={poDetails?.PO_NO ? poDetails?.PO_NO : poDetails?.PO_NUMBER}>
                                            <Row>
                                                <Col md="3" sm="3">
                                                    <FormGroup>
                                                        <Label>PO NUMBER</Label>
                                                        <Input placeholder="Po Number" value={poDetails?.PO_NO ? poDetails?.PO_NO : poDetails?.PO_NUMBER} disabled />
                                                    </FormGroup>
                                                </Col>

                                                <Col md="3" sm="3">
                                                    <FormGroup>
                                                        <Label>PO TYPE</Label>
                                                        <Input placeholder="Po Type" value={poTypeData?.name} disabled />
                                                    </FormGroup>
                                                </Col>

                                                <Col md="3" sm="3">
                                                    <FormGroup>
                                                        <Label>PLANT</Label>
                                                        <Input placeholder="Plant Name" value={plantName} disabled />
                                                    </FormGroup>
                                                </Col>

                                                {poDetails?.VENDOR_NAME != '' ?
                                                    < Col md="3" sm="3" >
                                                        <FormGroup>
                                                            <Label>VENDOR NAME</Label>
                                                            <Input placeholder="Vendor Name" value={poDetails?.VENDOR_NAME} disabled />
                                                        </FormGroup>
                                                    </Col> : null
                                                }

                                                <Col sm="12" md="12">
                                                    <FormGroup className="d-flex justify-content-center mb-0">
                                                        <Button.Ripple color="primary" type="button" onClick={checkInvoiceNo}>
                                                            <Plus size={16} /> Add
                                                        </Button.Ripple>
                                                    </FormGroup>
                                                </Col>
                                            </Row>
                                        </Col>
                                    ))} </> : null
                                }
                            </> : null}

                            {poData != "" ?
                                <Col md="12" sm="12">
                                    <label></label>
                                    <table className="table table-bordered">
                                        <thead >
                                            <tr>
                                                <th className="bg-primary text-white">PO Number</th>
                                                {data.moduleTypeId == 6 || data.moduleTypeId == 20 || data.moduleTypeId == 14 ? null : <th className="bg-primary text-white">Invoice No /<br /> Delivery Challan</th>}
                                                <th className="bg-primary text-white">PO Type</th>
                                                <th className="bg-primary text-white">Plant</th>
                                                {data.moduleTypeId == 6 || data.moduleTypeId == 20 || data.moduleTypeId == 14 ? null : <th className="bg-primary text-white">Vendor Name</th>}
                                                <th className="bg-primary text-white" style={{ width: '3%' }}>Remove</th>
                                            </tr>
                                        </thead>
                                        {poData.map((poDetailsData,index) => (
                                            <tbody key={poDetailsData.poNumber}>
                                                <tr>
                                                    <td>{poDetailsData?.poNumber}</td>
                                                    {data.moduleTypeId == 6 || data.moduleTypeId == 20 || data.moduleTypeId == 14 ? null : <td>{poDetailsData?.invoiceNo}</td>}
                                                    <td>{poDetailsData?.name ? poDetailsData?.name : poDetailsData?.poName}</td>
                                                    <td>{poDetailsData?.plantName}</td>
                                                    {data.moduleTypeId == 6 || data.moduleTypeId == 20 || data.moduleTypeId == 14 ? null : <td>{poDetailsData?.vendorName}</td>}
                                                    {poDetailsData?.purchaseOrderId == undefined ? <td className="text-center"><X size={16} onClick={() => handleremove(poDetailsData?.poNumber)} /></td> : <td className="text-center text-danger"><Trash size={16} onClick={() => deletePurchaseOrderDetails(poDetailsData?.purchaseOrderId,index)} hidden = {poDetailsData?.migoNumber != null}/></td>}
                                                </tr>
                                            </tbody>
                                        ))}
                                    </table>
                                </Col> : null
                            }
                        </Row>
                        <Row>
                            <Col md="8" sm="8">
                                <FormGroup className="d-flex justify-content-start mb-0 mt-2">
                                    <Button.Ripple outline color="primary" type="button" onClick={redirect}><ArrowLeft size={16} /> Back</Button.Ripple>
                                </FormGroup>
                            </Col>

                            <Col sm="4" md="4">
                                <FormGroup className="d-flex justify-content-end mb-0 mt-2">
                                    {data?.isGateIn == 0 ?
                                        <div className="mr-1">
                                            <Button.Ripple color="danger" type="button" onClick={() => updateLoadingUnloadingInfo(8,1)}>
                                                <X size={16} /> Reject
                                            </Button.Ripple>
                                        </div> : null
                                    }
                                    <Button.Ripple color="primary" type="button" onClick={() => updateLoadingUnloadingInfo(data?.statusId,2)}>
                                        <Check size={16} /> Update
                                    </Button.Ripple>
                                </FormGroup>
                            </Col>
                        </Row>
                    </CardBody>
                </Card>
                <div style={{ marginBottom: "160px" }}></div>
            </Fragment >
        </form>
    );
};

export default LoadingUnloadingInfo;
