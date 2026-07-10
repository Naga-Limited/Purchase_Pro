import { Card, CardHeader, CardBody, Button, Row, FormGroup, Col, Label } from "reactstrap";
import React, { useEffect } from "react";
import { useHistory } from "react-router-dom";
import Badge from "reactstrap/lib/Badge";
import { useState } from "react";
import TableComponent from "../common/TableComponent";
import { apiBaseUrl } from "../../urlConstants";
import { apiGetMethod, apiPostMethod } from "../../helper/axiosHelper";
import { ShowToast, errorToast } from "../../helper/appHelper";
import { useLoader } from "../../utility/hooks/useLoader";
import { ElapsedTimer } from "../common/ElapsedTimer";
import { useSelector } from "react-redux";
import OverAllDetails from "../FG/OverAllDetails";
import moment from "moment";
import { RefreshBlock1 } from "../common/RefreshBlock1";
import { useFormik } from "formik";
import { CustomDropdownInput, CustomTextInput, Yup } from "../forms/custom-form";
import { DatePicker } from "../forms/custom-datetime";
import { ArrowDown } from "react-feather";
import ReactSelect from "react-select";
import { Modal } from "react-bootstrap";
import { X } from "react-feather";
import { HrLine } from "../common/HrLine";
import { getAllowedPastDate, minDate } from "../common/dateComponent";
import confirmDialog from "../../@core/components/confirm/confirmDialog";

export const taColumns = [
    {
        name: "UNIQUE NO",
        selector: "unique_no",
        sortable: true,
        minWidth: "170px",
    },
    {
        name: "PAYMENT FOR",
        selector: "payment_for",
        sortable: true,
        minWidth: "170px",
    },
    {
        name: "PLANT NAME",
        selector: "WERKS",
        sortable: true,
        minWidth: "100px",
    },
    {
        name: "VENDOR NAME",
        selector: "vendor_name",
        sortable: true,
        minWidth: "250px",
    },
    {
        name: "CREATED ON",
        selector: "created_at",
        sortable: true,
        minWidth: "150px",
    },
   
    {
        name: "Amount",
        selector: "actual_sap_amount",
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
      name: "Receive Date",
      selector: "createdOn",
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
const WaterPaymentAccApprove = ({ actionRendorer }) => {

    let { showLoader, hideLoader } = useLoader();
    const history = useHistory();

    const actionsCol = {
        name: "ACTIONS",
        selector: "status",
        minWidth: "100px",
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

    const print = (row) => {
        if (row.moduleTypeId == 42) {
            window.open(`/public/#/OverAllSmartForm/${row.gateInOutInfoId}`)
        }
    }

    const onActionClick = (row) => {
        const postdata ={
            UserId:UserDetails.USERID,
            gate_id:row.gate_id
           }
        return (
            apiPostMethod(apiBaseUrl + `GatePro/Gate/getWaterListDetails/${row.gate_id}/${UserDetails.USERID}`)
            .then((response) => {
              const { data } = response;
              if (data.success) {
                setData(data.results)
                setData1(row)    
                setOpen(true)
                InvoiceValidation()
              }
            })
            .catch((error) => {
             errorToast("NO Record Found");
           })
          )
    };

    const [show, setShow] = useState(false)
    const [gateInOutInfoId, setGateInOutInfoId] = useState('')

    const overAllDetails = (gateInOutInfoId) => {
        setShow(true)
        setGateInOutInfoId(gateInOutInfoId)
    };

    const UserDetails = useSelector((state) => (state && state.auth ? state.auth.userData : {}));
    const [landingData, setLandingData] = useState([])

    const form = useFormik({
        isInitialValid: false,
        initialValues: {},
        validationSchema: Yup.object().shape({}),
        onSubmit() { },
    });
    useEffect(() => {
        getLoadingData(2)
    }, [])
    const getLoadingData = (status) => {

        const formData = form.values
        const fromDate = formData.date != undefined ? new Date(moment(formData.date.start).format('YYYY-MM-DD')) : 0
        const toDate = formData.date != undefined ? new Date(moment(formData.date.end).format('YYYY-MM-DD')) : 0
        const fromDateMilliSecond = formData.date != undefined ? fromDate.getTime() : 0
        const toDateMilliSecond = formData.date != undefined ? toDate.getTime() : 0

        let moduleType = moduleTypeId != '' ? moduleTypeId : 0

        showLoader();
        apiPostMethod(apiBaseUrl + `GatePro/Gate/getWaterList/${fromDateMilliSecond}/${toDateMilliSecond}/${status}/${UserDetails.USERID}`)
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
                console.log(JSON.stringify(error))
                errorToast("Something went wrong, please try again after sometime");
            })
            .finally((a) => {
                hideLoader();
            });
    }

    // const [moduleTypeData, setModuleTypeData] = useState([])
    const [moduleType, setModuleType] = useState('');
    const [moduleTypeId, setModuleTypeId] = useState('');

    const selectModuleType = (e) => {
        const id = e.value;
        setModuleTypeId(id)
        setModuleType([e])
        // getLoadingData()
    }
    const moduleTypeData = [
        { label: "Water Payment", value: "1" },
        { label: "Vehicle Payment", value: "2" },
       
    ];
    
    const Approve=(status)=>{
    
       
        const postdata ={
         id:Data1.id,
         gate_id:Data1.gate_id,
         load_unload_id:Data1.load_unload_id,
         payment_for:Data1.payment_for,
         UserId:UserDetails.USERID,
         status:status,
         remarks:form.values.remarks,
         sap_posting_date:form.values.sap_posting_date,
         invoice_no:Data1.invoice_no,
         invoice_date:Data1.invoice_date,
         actual_sap_amount:Data1.actual_sap_amount,
         vendor_code:Data1.vendor_code,
         unique_no:Data1.unique_no,
         tds_code:Data1.tds_code,
         tds_name:Data1.tds_name,
        }
       
        if(form.values.sap_posting_date == '' || form.values.sap_posting_date == undefined){
            errorToast("Please Select SAP Posting Date...");
            return false;
        }else if(status == 0 && (form.values.remarks == '' || form.values.remarks == undefined)){
            errorToast("Please Enter Remark...");
            return false;
        }
      
        let msg = "Water Expense"
        let titles
        if(status == 0){
            titles = 'Are you sure to Reject?'
        }else{
            titles = 'Are you sure to Approve?'
        }
       
        confirmDialog({
          title: titles,
          description: msg,
        }).then((res) => {
       if (res) {
       apiPostMethod(apiBaseUrl+'GatePro/Gate/UpdateWaterTankerPayment', postdata)
       .then((response) => {
       const { data } = response;
       if (data[0] == 1) {
        confirmDialog({
            title: `<h5><strong class="text-white">${data[1]}</strong></h5>`, cancelButton: false, confirmText: false, confirmButton: false, background: `#51A351`
        }).then(() => {
          window.location.reload();  // Reloads the page after the confirm dialog is closed
        });
       }else if (data[0] == 0){
        confirmDialog({
            title: `<h5><strong class="text-white">${data[1]}</strong></h5>`, cancelButton: false, confirmText: false, confirmButton: false, background: `#e32417`
        })
       }
       })
       .catch((error) => {
       errorToast("Something went wrong, please try again after sometime");
       });
     }});
     }; 
    

    const [open, setOpen] = useState(false);
    const [Data, setData] = useState([]);
    const [Data1, setData1] = useState([]);
 
    const close = () => setOpen(false);

    

    const columns = [...taColumns, actionsCol];
    const ColumnsVADetails = [...taColumnsVADetails];
    const [sapPostingDate, setSapPostingDate] = useState('');
    const [tankerValidation, setTankerValidation] = useState('');

    const InvoiceValidation = () => {
        apiPostMethod(apiBaseUrl + "Loadingunloadingcost/SAP_PostingDate")
          .then((response) => {
            const { data } = response;
            setSapPostingDate(data.results[0]?.sap_posting_date)    
            setTankerValidation(data.results[0]?.water_tanker_validation)
          })
    }

    return (
        <div>

                <Card >
                    <CardHeader><h5>Water Expense Approval</h5></CardHeader>
                    <hr />
                    <CardBody>
                        <TableComponent showDownload columns={columns} data={landingData} />
                    </CardBody>
                </Card> 

            {landingData == '' ? <div style={{ marginBottom: "330px" }}></div> : null}

            <Modal show={open} centered size="xl">
                <Modal.Header><b>Water Expense</b>
                <X onClick={close} style={{ float: "right" }} />
                </Modal.Header>
                    <Modal.Body>
                        <Row>
                            <Col md="4" sm="12">
                                <CustomTextInput label={"VA NUMBER"} form={form} id="Data" value = {Data1?.unique_no} type="text" disabled/>
                            </Col>
                            <Col md="4" sm="12">
                                <CustomTextInput label={"Vehicle Count"} form={form} id="Data" value = {Data.length} type="text" disabled/>
                            </Col>
                            <Col md="4" sm="12">
                            <CustomTextInput label={"Payment For"} form={form} id="payment_for" value = {Data1?.payment_for} type="text" disabled/>
                            </Col>
                            <Col md="4" sm="12">
                            <CustomTextInput label={"Total Amount"} form={form} id="total_value" value = {Data1?.total_amount} type="text" disabled/>
                            </Col>
                            <Col md="4" sm="12">
                            <CustomTextInput label={"Actual Amount"} form={form} id="actual_sap_amounts" value = {Data1?.actual_sap_amount} type="text" disabled/>
                            </Col>
                            <Col md="4" sm="12">
                            <CustomTextInput label={"Difference"} form={form} id="difference" value = {(Data1?.total_amount - Data1?.actual_sap_amount).toFixed(2)} type="text" disabled/>
                            </Col>
                            <Col md="4" sm="12" >
                            <CustomTextInput label={"Vendor Name"} form={form} id="vendor_name" value = {Data1?.vendor_name} type="text" disabled/>
                            </Col>
                            <Col md="4" sm="4">
                            <FormGroup>
                                <CustomTextInput label={"Invoice No"} type="text" form={form} value = {Data1?.invoice_no} disabled id="invoice_no" />
                            </FormGroup>
                            </Col>
                            <Col md="4" sm="4">
                            <FormGroup>
                                <CustomTextInput label={"Invoice Date"} type="text" form={form} value = {Data1?.invoice_date} disabled id="invoice_date" />
                            </FormGroup>
                            </Col>
                            <Col md="4" sm="4">
                            <CustomTextInput
                                label={"SAP Posting Date"}
                                form={form}
                                id="sap_posting_date"
                                type="date"
                                min={getAllowedPastDate(sapPostingDate)}
                                max={minDate}
                                onKeyDown={(e) => {
                                e.preventDefault()
                                }}
                            />
                            </Col>
                            <Col md="4" sm="4">
                            <FormGroup>
                                <CustomTextInput label={"Remark Details"} type="text" form={form} value = {Data1?.remark} disabled id="invoice_date" />
                            </FormGroup>
                            </Col>
                            <Col md="4" sm="12">
                            <CustomTextInput label={"Remarks"} form={form} id="remarks" type="text" />
                            </Col>
                        </Row>
                        <Row>
                        <Col align="left">
                            <Button onClick={(e) => Approve(0)} color="danger">Reject</Button>
                        </Col>
                        <Col align="right">
                            <Button onClick={(e) => Approve(3)} className = "ml-2" color="primary">Approve</Button>
                        </Col>
                        </Row>
                        <HrLine />
                        <Row>
                        <Col>
                            <TableComponent 
                            showDownload 
                            columns={ColumnsVADetails} 
                            data={Data}/>  
                        </Col>
                        </Row>
                    </Modal.Body>
            </Modal>
        </div >
    );
};

export default WaterPaymentAccApprove;
