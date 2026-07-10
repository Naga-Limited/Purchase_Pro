import React from 'react'
import { Plus, Search } from 'react-feather';
import { Button, Col, FormGroup, Input, InputGroup, Label, Row } from 'reactstrap'

const RmInvoiceInfo = ({ purchaseOrderDetails, poDetails, getInvoiceDetails, setPoType, poType, setInvoiceNo, invoiceNo, IsDisableForPo }) => {

    return (
        <>
            <Col md="12" sm="12"><hr></hr></Col>

            <Col md="12" sm="12">
                <h4 className="text-primary"><u>Invoice Details</u></h4><br />
            </Col>

            <Col md="4" sm="4">
                <FormGroup>
                    <Label>Invoice Number</Label>
                    <InputGroup>
                        <Input type="text" name="Invoice Number" id="invoiceNo" placeholder="Invoice Number" onChange={(e) => setInvoiceNo(e.target.value)} value={invoiceNo} />
                        <Button size="sm" color="success" style={{ height: '38px', width: '50px' }} onClick={() => { getInvoiceDetails('list'); setPoType('show') }}>
                            <Search size={20} />
                        </Button>
                    </InputGroup>
                </FormGroup>
            </Col>

            {IsDisableForPo == false ? <>
                {poDetails.LINE_ITEM?.map((poDetails) => (
                    <Col md="12" sm="12" key={poDetails?.LINE}>
                        <Row>
                            <Col md="3" sm="3">
                                <FormGroup>
                                    <Label>Line</Label>
                                    <Input placeholder="Material" value={poDetails?.LINE} disabled />
                                </FormGroup>
                            </Col>
                            <Col md="3" sm="3">
                                <FormGroup>
                                    <Label>Material</Label>
                                    <Input placeholder="Material" value={poDetails?.MATERIAL} disabled />
                                </FormGroup>
                            </Col>

                            <Col md="3" sm="3" >
                                <FormGroup>
                                    <Label>Description</Label>
                                    <Input placeholder="Material Description" value={poDetails?.DESCRIPTION} disabled />
                                </FormGroup>
                            </Col>

                            < Col md="3" sm="3" >
                                <FormGroup>
                                    <Label>Quantity</Label>
                                    <Input placeholder="Qty" value={poDetails?.QUANTITY} disabled />
                                </FormGroup>
                            </Col>
                        </Row>
                    </Col>
                ))} </> : null
            }

            {poDetails && poType == 'show' ? <>
                {poDetails != "" ? <Col sm="4" md="4" style={{ marginLeft: "50px" }}></Col> : <Col sm="6" md="6"></Col>}
                <Col sm="2" md="2">
                    <label>&nbsp;</label>
                    <FormGroup className="d-flex justify-content-end mb-0">
                        <Button.Ripple color="primary" type="button" onClick={getInvoiceDetails}>
                            <Plus size={16} /> Add
                        </Button.Ripple>
                    </FormGroup>
                </Col> </> : null
            }

            {IsDisableForPo ?
                <Col md="12" sm="12">
                    <label></label>
                    <table className="table table-bordered">
                        <thead >
                            <th className="bg-primary text-white">INVOICE NO</th>
                            <th className="bg-primary text-white">LINE</th>
                            <th className="bg-primary text-white">MATERIAL</th>
                            <th className="bg-primary text-white">DESCRIPTION</th>
                            <th className="bg-primary text-white">QUANTITY</th>
                        </thead>
                        {purchaseOrderDetails?.map((poDetailsData) => (
                            <tbody key={poDetailsData.line}>
                                <td>{poDetailsData.invoiceNo}</td>
                                <td>{poDetailsData.line}</td>
                                <td>{poDetailsData.material}</td>
                                <td>{poDetailsData.description}</td>
                                <td>{poDetailsData.quantity}</td>
                            </tbody>
                        ))}
                    </table>
                </Col> : null
            }
        </>
    )
}

export default RmInvoiceInfo