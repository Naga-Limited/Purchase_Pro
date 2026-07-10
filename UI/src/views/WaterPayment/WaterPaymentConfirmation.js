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
        name: "TRUCK NO",
        selector: "vehicleNo",
        sortable: true,
        minWidth: "100px",
    },
    {
        name: "PURPOSE",
        selector: "moduleType",
        sortable: true,
        minWidth: "200px",
    },
    
    {
        name: "PAYMENT FOR",
        selector: "payment_for",
        sortable: true,
        minWidth: "150px",
    },
    {
        name: "PLANT NAME",
        selector: "PLANT_NAME",
        sortable: true,
        minWidth: "150px",
    },
    {
        name: "Amount",
        selector: "water_rate",
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
const WaterPaymentConfirmation = ({ actionRendorer }) => {

    let { showLoader, hideLoader } = useLoader();
    const history = useHistory();

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

    const print = (row) => {
        if (row.moduleTypeId == 42) {
            window.open(`/public/#/OverAllSmartForm/${row.gateInOutInfoId}`)
        }
    }

    const onActionClick = (row) => {
        const formData = form.values
        const fromDate = formData.date != undefined ? new Date(moment(formData.date.start).format('YYYY-MM-DD')) : 0
        const toDate = formData.date != undefined ? new Date(moment(formData.date.end).format('YYYY-MM-DD')) : 0
        const fromDateMilliSecond = formData.date != undefined ? fromDate.getTime() : 0
        const toDateMilliSecond = formData.date != undefined ? toDate.getTime() : 0
        return (
            apiPostMethod(apiBaseUrl + `GatePro/Gate/getWaterConfirmationList/${fromDateMilliSecond}/${toDateMilliSecond}/3/${UserDetails.USERID}`)
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
    // useEffect(() => {
    //     getSubModuleType()
    // }, [])
    const getLoadingData = () => {

        const formData = form.values
        const fromDate = formData.date != undefined ? new Date(moment(formData.date.start).format('YYYY-MM-DD')) : 0
        const toDate = formData.date != undefined ? new Date(moment(formData.date.end).format('YYYY-MM-DD')) : 0
        const fromDateMilliSecond = formData.date != undefined ? fromDate.getTime() : 0
        const toDateMilliSecond = formData.date != undefined ? toDate.getTime() : 0

        let moduleType = moduleTypeId != '' ? moduleTypeId : 0

        showLoader();
        apiPostMethod(apiBaseUrl + `GatePro/Gate/getWaterConfirmationList/${fromDateMilliSecond}/${toDateMilliSecond}/${moduleType}/${UserDetails.USERID}`)
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
        let gate_id = [];
        let filteredData = Data
        for (let i = 0; i < filteredData.length; i++) {
            if(filteredData[i].id){
                gate_id.push(filteredData[i].id);
            }
        }
        const postdata ={
         Data:form.values,
         Data1:Data1,
         UserId:UserDetails.USERID,
         gate_id:gate_id.toString()
        }
       
        if(tankerValidation == 0 && (form.values.remarks == '' || form.values.remarks == undefined) ){
         errorToast("Please Enter Remarks...");
         return false;
        }else if(form.values.invoice_no == '' || form.values.invoice_no == undefined){
            errorToast("Please Enter Invoice No...");
            return false;
        }else if(form.values.invoiceDate == '' || form.values.invoiceDate == undefined){
            errorToast("Please Select Invoice Date...");
            return false;
        }else if(form.values?.confirm_vendor?.value == '' || form.values?.confirm_vendor?.value == undefined){
            errorToast("Please Select Vendor code...");
            return false;
        }else if(tankerValidation == 0 &&
            (!form.values.actual_sap_amount || // Check if value is empty
             !/^\d+(\.\d+)?$/.test(form.values.actual_sap_amount) || // Check if only numbers or decimals are entered
             parseFloat(form.values.actual_sap_amount) <= 0)){
            errorToast("Please Enter Amount...");
            return false;
        }
      
        let msg = "Water Expense"
        let titles
        if(status == 1){
         titles = 'Are you sure to Add?'
        }
       
        confirmDialog({
          title: titles,
          description: msg,
        }).then((res) => {
       if (res) {
       apiPostMethod(apiBaseUrl+'GatePro/Gate/AddWaterTankerPayment', postdata)
       .then((response) => {
       const { data } = response;
       if (data.success == true) {
        if(status == 1){
          ShowToast("Saved Successfully...");
          setOpen(false)
        }
        window.setTimeout( function() {
          window.location.reload();
        }, 2000);
       }else if (data.success == false){
          errorToast(data.message);
          setOpen(false)
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
    const [invoicePostingDate, setInvoicePostingDate] = useState('');
    const [tankerValidation, setTankerValidation] = useState('');

    const InvoiceValidation = () => {
        apiPostMethod(apiBaseUrl + "Loadingunloadingcost/SAP_PostingDate")
          .then((response) => {
            const { data } = response;
            setInvoicePostingDate(data.results[0]?.invoice_posting_date)    
            setTankerValidation(data.results[0]?.water_tanker_validation)
          })
    }

    return (
        <div>

            <Card>
                <CardHeader><h5>Canteen Material Confirmation List</h5><RefreshBlock1 /></CardHeader>
                <hr />
                <CardBody>
                    <Row>
                        <Col md="3" sm="3">
                            <DatePicker form={form} id="date" isDateRange label={"Date Range"} />
                        </Col>

                        <Col sm="3" md="3">
                            <FormGroup>
                                <Label>Movement Type</Label>
                                <ReactSelect
                                    options={moduleTypeData}
                                    onChange={selectModuleType}
                                    value={moduleType}
                                />
                            </FormGroup>
                        </Col>
                        <Col md="2" sm="2">
                            <FormGroup className='mt-2'>
                                <Button
                                    color="primary"
                                    type="submit"
                                    onClick={getLoadingData}
                                    disabled={form.values.date == undefined ? true : false}
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
                <Modal.Header><b>Water Payment</b>
                <X onClick={close} style={{ float: "right" }} />
                </Modal.Header>
                    <Modal.Body>
                        <Row>
                            <Col md="4" sm="12">
                                <CustomTextInput label={"Vehicle No"} form={form} id="Data" value = {Data1?.vehicleNo} type="text" disabled/>
                            </Col>
                            <Col md="4" sm="12">
                                <CustomTextInput label={"Vehicle Count"} form={form} id="Data" value = {Data.length} type="text" disabled/>
                            </Col>
                            <Col md="4" sm="12">
                            <CustomTextInput label={"Payment For"} form={form} id="payment_for" value = {Data1?.payment_for} type="text" disabled/>
                            </Col>
                            <Col md="4" sm="12">
                            <CustomTextInput label={"Total Amount"} form={form} id="total_value" value = {Data1?.water_rate} type="text" disabled/>
                            </Col>
                            {tankerValidation == 1 &&
                            <Col md="4" sm="12">
                            <CustomTextInput label={"Actual Amount"} form={form} id="actual_sap_amounts" value = {Data1?.actual_water_rate} type="text" disabled/>
                            </Col>}
                            {tankerValidation == 0 &&
                            <Col md="4" sm="12">
                            <CustomTextInput label={"Actual Amount"} form={form} id="actual_sap_amount" type="text" />
                            </Col> }
                            <Col md="4" sm="12">
                            <CustomTextInput label={"Difference"} form={form} id="difference" value = {(Data1?.water_rate - ( tankerValidation == 0 ? form.values.actual_sap_amount : Data1?.actual_water_rate)).toFixed(2)} type="text" disabled/>
                            </Col>
                            <Col md="4" sm="12" >
                            <CustomDropdownInput  
                                url={apiBaseUrl + "GatePro/Gate/getVendorWater"} 
                                label={"Vendor Name"}  
                                form={form} 
                                id={"confirm_vendor"}
                            />
                            </Col>
                            <Col md="4" sm="4">
                            <FormGroup>
                                <CustomTextInput label={"Invoice No"} type="text" form={form} id="invoice_no" />
                            </FormGroup>
                            </Col>
                            <Col md="4" sm="12" >
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
                            <Col md="4" sm="12">
                            <CustomTextInput label={"Remarks"} form={form} id="remarks" type="text" />
                            </Col>
                        </Row>
                        <Row>
                       
                        <Col align="right">
                            <Button onClick={(e) => Approve(1)} className = "ml-2" color="primary">Approve</Button>
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

export default WaterPaymentConfirmation;
