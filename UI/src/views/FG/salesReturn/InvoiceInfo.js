import React from 'react'
import { Button, Card, CardBody, CardHeader, Col, Form, FormGroup, Input, InputGroup, Label, Row } from 'reactstrap'
import { CustomDropdownInput, CustomTextInput, Yup, validation } from '../../forms/custom-form'
import { apiBaseUrl } from '../../../urlConstants'
import { Plus, Search, Trash2, Edit, X } from 'react-feather'
import { useState } from 'react'
import { ShowToast, errorToast } from '../../../helper/appHelper'
import { useLoader } from '../../../utility/hooks/useLoader'
import { apiPostMethod, apiGetMethod } from '../../../helper/axiosHelper'
import { useFormik } from 'formik'
import { useSelector } from 'react-redux'
import confirmDialog from '../../../@core/components/confirm/confirmDialog'
import { useEffect } from 'react'

const InvoiceInfo = ({ gateInOutData, setInvoiceList, invoiceList,isDisbled }) => {

    useEffect(() => {
        setQuantityList(invoiceList);
    }, [invoiceList])
    const [isDisable, setIsDisable] = useState(false);

    let { showLoader, hideLoader } = useLoader();
    const [data, setData] = useState("")
    const [quantityDetails, setQuantityDetails] = useState([])
    const [invoiceValue, setInvoiceValue] = useState('')

    const [moduleTypeId, setModuleTypeId] = useState('')

    const SelectInvoice = (e) => {
        setInvoiceValue(e.target.value)
    }

    const getInvoiceDetails = (type) => {

        const postdata = { invoiceNo: invoiceValue, userInfoId: UserDetails.USERID };

        showLoader();
        apiPostMethod(apiBaseUrl + "GatePro/Master/getInvoiceDetails", postdata)
            .then((response) => {
                const res = response.data;
                if (res.success == true) {
                    apiGetMethod(apiBaseUrl + `GatePro/Master/checkInvoiceDetails/${invoiceValue}`)
                        .then((response) => {
                            const { data } = response;
                            if (data.success == true) {
                                if (data.results[0].getExistCount == 0) {
                                    setData(res.data[0])
                                    addQuantityDetails(res.data[0])
                                    setQuantityDetails(res.data[0])
                                    setIsDisable(true)
                                    setModuleTypeId(res.moduleTypeId)
                                } else {
                                    confirmDialog({
                                        title: `<h5><strong class="text-white">Invoice Already Exist</strong></h5>`, cancelButton: false, confirmText: false, confirmButton: false, background: `#BD362F`
                                    })
                                }
                            }
                        }).catch((error) => {
                            console.log(JSON.stringify(error))
                            errorToast("Something went wrong, please try again after sometime");
                        })
                }
                else if (res.success == false) {
                    errorToast(res.message)
                }
            })
            .catch((error) => {
                errorToast("Something went wrong, please try again after sometime");
            })
            .finally((a) => {
                hideLoader();
            });
    }

    const UserDetails = useSelector((state) => (state && state.auth ? state.auth.userData : {}));

    const [quantityDetailsData, setQuantityDetailsData] = useState([])

    const addQuantityDetails = (quantityList) => {

        const obj = [{
            invoiceValue: invoiceValue,
            INVOICE_NO: quantityList.INVOICE_NO,
            DELIVERY_NO: quantityList.DELIVERY,
            DELIVERY_QTY: quantityList.DELIVERY_QTY,
            PGI_COMPLETION: quantityList.PGI_COMPLETION,
            CUSTOMER_ID: quantityList.CUSTOMER_CODE,
            CUSTOMER_NAME: quantityList.CUSTOMER_NAME,
            PLANT: quantityList.PLANT,
            isManual: 1
        }]

        setQuantityDetailsData(obj)
    }

    const reset = () => {
        setData("")
        setInvoiceValue("")
        setQuantityDetails([])
        setQuantityDetailsData([])
    }

    const [quantityList, setQuantityList] = useState([])

    const add = () => {

        if (quantityList.length == 0) {
            setQuantityList(quantityList.concat(quantityDetailsData))
            setInvoiceList(quantityList.concat(quantityDetailsData))
            reset()
        } else {
            const checkInvoiceNo = quantityList.filter((quantityList) => quantityList.invoiceValue == invoiceValue);
            if (checkInvoiceNo != '') {
                reset()
                confirmDialog({
                    title: `<h5><strong class="text-white">Invoice Details Already Added</strong></h5>`, cancelButton: false, confirmText: false, confirmButton: false, background: `#BD362F`
                })
            }
            else {
                setQuantityList(quantityList.concat(quantityDetailsData))
                setInvoiceList(quantityList.concat(quantityDetailsData))
                reset()
            }
        }
    }

    function handleremove(invoiceNo) {

        setInvoiceValue('Invoice No')
        confirmDialog({
            title: `<h4>Are you sure want to Remove?<h4>`,
        }).then((res) => {
            if (res) {
                let selectedItem
                quantityList.forEach((item) => {
                    if (item['INVOICE_NO'] == invoiceNo) {
                        selectedItem = item
                        quantityList.splice(quantityList.indexOf(selectedItem), 1);
                    }
                });
                setInvoiceList(quantityList)
                quantityDetailsData.forEach((item) => {
                    if (item['INVOICE_NO'] == invoiceNo) {
                        selectedItem = item
                        quantityDetailsData.splice(quantityDetailsData.indexOf(selectedItem), 1);
                    }
                });
                setInvoiceList(quantityDetailsData)
                setInvoiceValue('')
            }
            else {
                setInvoiceValue('')
            }
        })
    }

    const deleteInvoiceDetails = (invoiceNo, gateInOutInfoDetailsId,status) => {
        setInvoiceValue('Invoice No')
        const postdata = {
            gateInOutInfoDetailsId: gateInOutInfoDetailsId,
            userInfoId: UserDetails.USERID,
            invoiceNo:invoiceNo,
            gateInOutInfoId:gateInOutData.gateInOutInfoId,
            status:status,
        }

        confirmDialog({
            title: `<h4>Are you sure want to delete?<h4>`,
        }).then((res) => {
            if (res) {
                showLoader();
                console.log(apiBaseUrl + "GatePro/Master/deleteInvoiceDetail", postdata)
                apiPostMethod(apiBaseUrl + "GatePro/Master/deleteInvoiceDetail", postdata)
                    .then((response) => {
                        const { data } = response;
                        if (data.success == true) {
                            ShowToast(data.message);
                            let selectedItem
                            quantityList.forEach((item) => {
                                if (item['INVOICE_NO'] == invoiceNo) {
                                    selectedItem = item
                                    quantityList.splice(quantityList.indexOf(selectedItem), 1);
                                }
                            });
                            setInvoiceValue('')
                            setInvoiceList(quantityList)
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
            } else {
                setInvoiceValue('')
            }
        })
            .catch((error) => {
                errorToast("Something went wrong please try again after sometime");

            });
    };

    return (
        <Row>
            {gateInOutData.userGateId != 19 && isDisbled != true &&
            <Col md="4" sm="4">
                <FormGroup>
                    <Label>Invoice No</Label>
                    <InputGroup>
                        <Input type="text" placeholder="Invoice No" onChange={SelectInvoice} value={invoiceValue} />
                        <Button size="sm" color="success" style={{ height: '38px', width: '50px' }} onClick={() => getInvoiceDetails('list')}>
                            <Search size={20} />
                        </Button>
                    </InputGroup>
                </FormGroup>
            </Col>}

            {quantityDetails != '' ?
                <Col md="12" sm="12" >
                    <Row>
                        <Col md="3" sm="3">
                            <FormGroup>
                                <Label>Invoice No</Label>
                                <Input placeholder="Material" value={quantityDetails?.INVOICE_NO} disabled />
                            </FormGroup>
                        </Col>
                        <Col md="3" sm="3">
                            <FormGroup>
                                <Label>Delivery No</Label>
                                <Input placeholder="Material" value={quantityDetails?.DELIVERY} disabled />
                            </FormGroup>
                        </Col>
                        <Col md="3" sm="3">
                            <FormGroup>
                                <Label>Delivery Qty</Label>
                                <Input placeholder="Material" value={quantityDetails?.DELIVERY_QTY} disabled />
                            </FormGroup>
                        </Col>
                        <Col md="3" sm="3">
                            <FormGroup>
                                <Label>PGI Status</Label>
                                <Input placeholder="Material" value={quantityDetails.PGI_COMPLETION == 'C' ? 'Completed' : 'Waiting at PGI'} disabled />
                            </FormGroup>
                        </Col>
                    </Row>
                </Col> : null
            }

            {data ? <>
                <Col sm="12" md="12" className='d-flex justify-content-center mb-0'>
                    <label>&nbsp;</label>
                    <FormGroup className="d-flex justify-content-end mb-0">
                        <Button.Ripple color="primary" type="button" onClick={add}>
                            <Plus size={16} /> Add
                        </Button.Ripple>
                    </FormGroup>
                </Col> </> : null
            }

            {quantityList != '' ?
                <Col md="12" sm="12">
                    <label></label>
                    <table className="table table-bordered">
                        <thead>
                            <tr>
                                <td className="bg-primary text-white text-center"><strong>Invoice No</strong></td>
                                <td className="bg-primary text-white text-center"><strong>Delivery No</strong></td>
                                <td className="bg-primary text-white text-center"><strong>Delivery Qty</strong></td>
                                <td className="bg-primary text-white text-center"><strong>PGI Status</strong></td>
                                <td className="bg-primary text-white text-center"><strong>Remove</strong></td>
                            </tr>
                        </thead>
                        <tbody className='text-center'>
                            {quantityList?.map((quantity) => (
                                <tr key={quantity.INVOICE_NO}>
                                    <td>{quantity.INVOICE_NO}</td>
                                    <td>{quantity.DELIVERY_NO}</td>
                                    <td>{quantity.DELIVERY_QTY}</td>
                                    <td>{quantity.PGI_COMPLETION == 'C' ? 'Completed' : ''}</td>
                                    {quantity?.gateInOutInfoId == undefined ? <td className="text-center"><X size={16} onClick={() => handleremove(quantity?.INVOICE_NO)} /></td> : (quantity?.isManual == 1 ||  quantity?.isManual == 0 && UserDetails.USERID == 1)?  <td className="text-center text-danger"><Trash2 size={16} onClick={() => deleteInvoiceDetails(quantity?.INVOICE_NO, quantity?.gateInOutInfoDetailsId,2)} hidden = {quantity?.isManual == 2}/></td> : (quantity?.isManual == 2 && (UserDetails.role == 'Admin' || UserDetails.role == 'Manager') )?
                                    <td><Edit size={18} color='green' onClick={() => deleteInvoiceDetails(quantity?.INVOICE_NO, quantity?.gateInOutInfoDetailsId,0) } hidden = {quantity?.isManual == 1}/></td> : quantity?.isManual == 0 ? '' : 'Deleted'
                                    }
                                    
                                </tr>
                            ))}
                        </tbody>

                    </table>
                </Col> : null
            }
        </Row>
    )
}

export default InvoiceInfo