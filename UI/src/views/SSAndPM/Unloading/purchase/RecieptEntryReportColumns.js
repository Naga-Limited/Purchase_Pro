import React from "react";
import { Badge, Button, Row, Col, FormGroup } from "reactstrap";

/** Large column set loaded asynchronously to keep the MIGO report route chunk small. */
export const taColumns = [
    // {
    //     name: "S.NO",
    //     selector: "serialNo",
    //     sortable: true,
    //     minWidth: "50px",
    // },
    {
        name: "Material Code",
        selector: "material",
        sortable: true,
        minWidth: "150px",
    },
    {
        name: "Material Desc",
        selector: "materialDescription",
        sortable: true,
        minWidth: "250px",
    },
    {
        name: "UOM",
        selector: "uom",
        sortable: true,
        minWidth: "100px",
    },
    {
        name: "HSN CODE",
        selector: "hsn",
        sortable: true,
        minWidth: "150px",
    },
    {
        name: "TRUCK NO",
        selector: "vehicleNo",
        sortable: true,
        minWidth: "150px",
    },
    {
        name: "VA NO",
        selector: "vaNumber",
        sortable: true,
        minWidth: "150px",
    },
    {
        name: "PURPOSE",
        selector: "moduleType",
        sortable: true,
        minWidth: "200px",
    },
    {
        name: "PO TYPE",
        selector: "poType",
        sortable: true,
        minWidth: "200px",
    },
    {
        name: "PLANT NAME",
        selector: "PLANT_NAME",
        sortable: true,
        minWidth: "150px",
    },
    {
        name: "MIGO NUMBER",
        selector: "migoNumber",
        sortable: true,
        minWidth: "150px",
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
        minWidth: "250px",
    },
    {
        name: "INVOICE NO",
        selector: "invoiceNo",
        sortable: true,
        minWidth: "150px",
    },
    {
        name: "INVOICE DATE",
        selector: "invoiceDate",
        sortable: true,
        minWidth: "150px",
    },
    {
        name: "PO NUMBER",
        selector: "poNumber",
        sortable: true,
        minWidth: "150px",
    },
    {
        name: "PO Line",
        selector: "lineItem",
        sortable: true,
        minWidth: "150px",
    },
    // {
    //     name: "Material Code",
    //     selector: "material",
    //     sortable: true,
    //     minWidth: "150px",
    // },
    // {
    //     name: "Material Desc",
    //     selector: "materialDescription",
    //     sortable: true,
    //     minWidth: "250px",
    // },
    
    {
        name: "PO Qty",
        selector: "poQty",
        sortable: true,
        minWidth: "150px",
    },
    {
        name: "Before GRN QTY",
        selector: "grnQty",
        sortable: true,
        minWidth: "150px",
    },
    {
        name: "RECEIVE QTY",
        selector: "receivedQty",
        sortable: true,
        minWidth: "150px",
    },
    {
        name: "TOLERANCE",
        selector: "tolerance",
        sortable: true,
        minWidth: "150px",
    },
    {
        name: "OPEN QTY",
        selector: "openQty",
        sortable: true,
        minWidth: "150px",
    },
    {
        name: "REMAIN QTY",
        selector: "remainQty",
        sortable: true,
        minWidth: "150px",
    },
    {
        name: "PO RATE",
        selector: "poRate",
        sortable: true,
        minWidth: "150px",
    },
    {
        name: "STORAGE LOCATION",
        selector: "storageLocation",
        sortable: true,
        minWidth: "150px",
    },
    {
        name: "PR NUMBER",
        selector: "prNumber",
        sortable: true,
        minWidth: "150px",
    },
    {
        name: "PR TYPE",
        selector: "prType",
        sortable: true,
        minWidth: "150px",
    },
    {
        name: "FREIGHT",
        selector: "freightCharge",
        sortable: true,
        minWidth: "150px",
    },
    {
        name: "PACKING",
        selector: "packingCharge",
        sortable: true,
        minWidth: "150px",
    },
    {
        name: "LOADING",
        selector: "loadingCharge",
        sortable: true,
        minWidth: "150px",
    },
    {
        name: "UNLOADING",
        selector: "unloadingCharge",
        sortable: true,
        minWidth: "150px",
    },
    {
        name: "OTHER",
        selector: "otherCharge",
        sortable: true,
        minWidth: "150px",
    },
    {
        name: "INELIGIBLE",
        selector: "ineligibleCharge",
        sortable: true,
        minWidth: "150px",
    },
    {
        name: "TAX CODE",
        selector: "rcm",
        sortable: true,
        minWidth: "150px",
    },
    {
        name: "LOT NO",
        selector: "lotNo",
        sortable: true,
        minWidth: "150px",
    },
    {
        name: "WH CODE",
        selector: "whCode",
        sortable: true,
        minWidth: "150px",
    },
    {
        name: "LOT UPDATION DATE",
        selector: "lotUpdationAt",
        sortable: true,
        minWidth: "150px",
    },
    {
        name: "QC CHECK DATE",
        selector: "qcCheckAt",
        sortable: true,
        minWidth: "150px",
    },
    {
        name: "REC NO",
        selector: "manualRecord",
        sortable: true,
        minWidth: "150px",
    },
    {
        name: "MANUFACTURE DATE",
        selector: "manufacturingDate",
        sortable: true,
        minWidth: "150px",
    },
    {
        name: "INVOICE QTY",
        selector: "invoiceQty",
        sortable: true,
        minWidth: "150px",
    },
    {
        name: "LLR NO",
        selector: "llrNo",
        sortable: true,
        minWidth: "150px",
    },
    {
        name: "WEIGHMENT NO",
        selector: "weighmentNo",
        sortable: true,
        minWidth: "150px",
    },
    {
        name: "POSTING DATE",
        selector: "postingDate",
        sortable: true,
        minWidth: "150px",
    },
    {
        name: "RECEIPT CREATED",
        selector: "createdAt",
        sortable: true,
        minWidth: "150px",
    },
    {
        name: "RECEIPT APPROVED",
        selector: "mgApprovedAt",
        sortable: true,
        minWidth: "150px",
    },
    {
        name: "INVOICE SUBMIT",
        selector: "mgApprovedAt",
        sortable: true,
        minWidth: "150px",
    },
    {
        name: "INVOICE CONFIRM",
        selector: "mgApprovedAt",
        sortable: true,
        minWidth: "150px",
    },
    {
        name: "MANAGER REJECT",
        selector: "rejectAt",
        sortable: true,
        minWidth: "150px",
    },
    {
        name: "STORES REJECT",
        selector: "storeRejectAt",
        sortable: true,
        minWidth: "150px",
    },
    {
        name: "ACCOUNTS REJECT",
        selector: "accountsRejectAt",
        sortable: true,
        minWidth: "150px",
    },
    {
        name: "STATUS",
        selector: "statusName",
        sortable: true,
        minWidth: "150px",
        cell: (row) => {
            return (
                <Col sm="12" md="12">
                    <FormGroup className="d-flex justify-content-center mb-0">
                        <Badge color={row.status == 5 || row.status == 0 ? "danger" : "primary"} pill>
                            {row.statusName}
                        </Badge>
                    </FormGroup>
                </Col>
            );
        },
    },
    {
        name: "DURATION",
        selector: "duration",
        sortable: false,
        minWidth: "170px",
    },
    {
        name: "Attachments",
        selector: "invoiceCopy",
        minWidth: "900px",
        cell: (row) => {
            return (
                <Row>
                    {row.invoiceCopy && (
                        <a target="_blank" rel="noopener noreferrer" href={row.invoiceCopy ? row.invoiceCopy : row.invoiceCopys}>
                            <Button outline color="success" size="sm">
                                Invoice
                            </Button>
                        </a>
                    )}
                    &nbsp;
                    {row.bargainNote && (
                        <a target="_blank" rel="noopener noreferrer" href={row.bargainNote}>
                            <Button outline color="success" size="sm">
                                Bargain Note
                            </Button>
                        </a>
                    )}
                    &nbsp;
                    {row.deliveryChallanCopy && (
                        <a target="_blank" rel="noopener noreferrer" href={row.deliveryChallanCopy}>
                            <Button outline color="success" size="sm">
                                Delivery Challan
                            </Button>
                        </a>
                    )}
                    &nbsp;
                    {row.ewayBillCopy && (
                        <a target="_blank" rel="noopener noreferrer" href={row.ewayBillCopy}>
                            <Button outline color="success" size="sm">
                                E-Way Bill
                            </Button>
                        </a>
                    )}
                    &nbsp;
                    {row.eInvoiceCopy && (
                        <a target="_blank" rel="noopener noreferrer" href={row.eInvoiceCopy}>
                            <Button outline color="success" size="sm">
                                eInvoice
                            </Button>
                        </a>
                    )}
                    &nbsp;
                    {row.qcCertificateInternalCopy && (
                        <a target="_blank" rel="noopener noreferrer" href={row.qcCertificateInternalCopy}>
                            <Button outline color="success" size="sm">
                                QC Internal
                            </Button>
                        </a>
                    )}
                    &nbsp;
                    {row.qcCertificateExternalCopy && (
                        <a target="_blank" rel="noopener noreferrer" href={row.qcCertificateExternalCopy}>
                            <Button outline color="success" size="sm">
                                QC External
                            </Button>
                        </a>
                    )}
                    &nbsp;
                    {row.externalWbCopy && (
                        <a target="_blank" rel="noopener noreferrer" href={row.externalWbCopy}>
                            <Button outline color="success" size="sm">
                                External WB
                            </Button>
                        </a>
                    )}
                    &nbsp;
                    {row.vendorEmailCopy && (
                        <a target="_blank" rel="noopener noreferrer" href={row.vendorEmailCopy}>
                            <Button outline color="success" size="sm">
                                Vendor Email
                            </Button>
                        </a>
                    )}
                    &nbsp;
                    {row.projectTeamAcknowledgement && (
                        <a target="_blank" rel="noopener noreferrer" href={row.projectTeamAcknowledgement}>
                            <Button outline color="success" size="sm">
                                Project Ack
                            </Button>
                        </a>
                    )}
                    &nbsp;
                    {row.creditNoteCopy && (
                        <a target="_blank" rel="noopener noreferrer" href={row.creditNoteCopy}>
                            <Button outline color="success" size="sm">
                                Credit Note
                            </Button>
                        </a>
                    )}
                </Row>
            );
        },
    },
];
