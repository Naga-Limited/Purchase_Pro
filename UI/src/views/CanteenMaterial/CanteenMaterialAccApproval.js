import React, { Fragment, useState, useEffect } from 'react'
import { Col ,FormGroup, Label,Button, ButtonToggle, Input } from 'reactstrap'
import Row from 'reactstrap/lib/Row'
import { apiBaseUrl, vaUrl ,BagcuttingUrl, uploadUrl } from '../../urlConstants'
import { useFormik } from "formik";
import { CustomDropdownInput, CustomTextInput, CustomUploader, validation, Yup } from "../forms/custom-form";
import { Link, useHistory, useParams } from 'react-router-dom';
import { useLoader } from '../../utility/hooks/useLoader';
import { apiGetMethod, apiPostMethod } from '../../helper/axiosHelper';
import { errorToast } from '../../helper/appHelper';
import { CardComponent } from "../common/CardComponent";
import { ShowToast } from "../../helper/appHelper";
import confirmDialog from "../../@core/components/confirm/confirmDialog";
import TableComponent from '../common/TableComponent';
import { DatePicker } from '../forms/custom-datetime';
import { RefreshBlock } from '../common/RefreshBlock';
import { HrLine } from '../common/HrLine';
import { Modal } from "react-bootstrap";
import { Check, X } from "react-feather";
import Uploader from '../Uploader';
import DateComponent, { getAllowedPastDate, minDate } from '../common/dateComponent';
import NumberOnlyInput from '../../@core/components/number-input/number-input';
import ReactSelect from 'react-select';
import moment from 'moment';
import { useSelector } from 'react-redux';

const CanteenMaterialAccApproval = ({})  => { 
  const history = useHistory();
  const form = useFormik({
    isInitialValid: false,
    initialValues: {},
    validationSchema: Yup.object().shape({}),
    onSubmit(values) { },
  });
  const taColumns = [
    {
      name: "VA NUMBER",
      selector: "vaNumber",
      sortable: true,
      minWidth: "150px",
      wrap: true,
    },
    {
      name: "MATERIAL TYPE",
      selector: "subModuleType",
      sortable: true,
      minWidth: "120px",
      wrap: true,
    },
    {
      name: "CREATION DATE",
      selector: "created_at",
      sortable: true,
      minWidth: "120px",
      wrap: true,
    },
    {
      name: "INVOICE DATE",
      selector: "invoice_date",
      sortable: true,
      minWidth: "120px",
      wrap: true,
    },
    {
      name: "INVOICE NO",
      selector: "invoice_no",
      sortable: true,
      minWidth: "120px",
      wrap: true,
    },
    {
      name: "VENDOR NAME",
      selector: "master_vendor",
      sortable: true,
      minWidth: "200px",
      wrap: true,
    },
    {
      name: "TOTAL AMOUNT",
      selector: "total_amount",
      sortable: true,
      minWidth: "120px",
      wrap: true,
    },
    {
      name: "TOTAL QTY",
      selector: "total_qty",
      sortable: true,
      minWidth: "80px",
      wrap: true,
    },
    {
      name: "TOTAL RATE",
      selector: "total_rate",
      sortable: true,
      minWidth: "80px",
      wrap: true,
    },
    
    
  ];

    const actionsCol2 = {
      name: "ACTION",
      selector: "status",
      minWidth: "150px",
      cell: (row) => {
        return  (
          ActionColumn(row)
        );
      },
    };
    const taColumnsVADetails = [
        {
          name: "VA NO",
          selector: "vaNumber",
          sortable: true,
          minWidth: "200px",
          wrap: true,
        },
        {
          name: "Material Name",
          selector: "material_name",
          sortable: true,
          minWidth: "100px",
          wrap: true,
        },
        {
          name: "Material Qty",
          selector: "material_qty",
          sortable: true,
          minWidth: "100px",
          wrap: true,
        },
        {
          name: "Material Rate",
          selector: "material_rate",
          sortable: true,
          minWidth: "250px",
          wrap: true,
        },
        
        {
          name: "Old Material Rate",
          selector: "material_old_rate",
          sortable: true,
          minWidth: "80px",
          wrap: true,
        },
        {
          name: "OLD Material Qty",
          selector: "material_old_qty",
          sortable: true,
          minWidth: "80px",
          wrap: true,
        },
        {
          name: "Rate Diff",
          selector: "rate_diff",
          sortable: true,
          minWidth: "80px",
          wrap: true,
        },
        {
          name: "Material Amount",
          selector: "material_amount",
          sortable: true,
          minWidth: "80px",
          wrap: true,
        },
      
      
      ];
    const columns = [...taColumns, actionsCol2];
    const ColumnsVADetails = [...taColumnsVADetails];

    const [warehouseoption, setWarehouseoption] = useState([]);  


    let { id } = useParams();
    let refid='';
    let fdata='';
    if(id) {
       refid = id.replace(":", "");
    }
    let { showLoader, hideLoader } = useLoader(); 
    
    useEffect(() => { 
        getSubModuleType();
    }, [id]);

    
  
    const onTextChanges = (e,PKey,Check,Val,index) => {

      for(let i=0;i<Check.length;i++){
        if(Check[i].index==PKey){
          if(Val=="confirm_value"){
              Check[i].confirm_value=e.target.value;
          }
        }
      }
    
      form.setValues({...form.values,CheckList:Check});
    }
    const [FromDate, setFromDate] = useState('');
    const [ToDate, setToDate] = useState('');
    const [ImgData, setImgData] = useState({});

    const [LoadUnloadCostPercentage, setLoadUnloadCostPercentage] = useState([]);
  


  const ActionColumn=(row)=>{
        return (
          <Row>&nbsp;&nbsp;
          <Button color="primary" type="Button" onClick={(e) => {reject(row)}}>View</Button>
          <Button.Ripple color="danger" size="sm" type="button" className='ml-1' onClick={() => onActionClick(row)}>Reject</Button.Ripple>
          </Row>
        )
  }

  const [SelectedList, setSelectedList] = useState();

  const onSelectedRowsChange = (selectedRowState) => {
    for (let i=0;i<=selectedRowState.selectedRows.length;i++){
      setSelectedList(selectedRowState.selectedRows);
    }

  }

 
 const [showModal, setShowModal] = useState(false);

 const closed = () => setShowModal(false);

 const OpenData = () => {
  setShowModal(true)
 }
  const getSelectedRows = () => {
    let TotalAmount = 0;
    let filteredData = SelectedList
    if (filteredData && filteredData.length > 0) {
        filteredData.forEach((item, index) => {
            TotalAmount += Number(item.total_amount);      
          });

        const idList = filteredData.map(item => item.id);

         form.setValues({
            ...form.values,
          CheckLists:filteredData,
          total_amount:TotalAmount.toFixed(2),
          row_count:filteredData.length,
          vendor_code:filteredData[0].vendor_code,
          master_vendor:filteredData[0].master_vendor,
          invoice_no:filteredData[0].invoice_no,
          vaNumber:filteredData[0].vaNumber,
          id_list: idList,
        })
        setFormaData(form.values)
        OpenData()
    }else{
      errorToast("Please Select the Load and Unload Charges");
    }
  }
 
 //Modal pop up window 
   const [open, setOpen] = useState(false);
   const [Data, setData] = useState([]);

    const close = () => setOpen(false);

    const reject = (row) => {
        apiPostMethod(apiBaseUrl + `GatePro/Gate/CanteenPaymentMaterialsList/${row.id}`)
        .then((response) => {
          const { data } = response;
          if (data.success) {
            setData(data.results)
            setOpen(true)
          } 
        })
        .catch((error) => {
         errorToast("NO Record Found");
       })
    }
    const [show, setShow] = useState(false);
    const [Data1, setData1] = useState([]);

    const closeRemarksModal = () => setShow(false);
    const onActionClick = (row) => {
        setShow(true)
        setData1(row)
    };

    const [attachedFiles, setAttachment] = useState({invoice_attachment:{}});
    const handleFileChange = (file, id) => {
      setAttachment((p) => ({
        ...p,
        [id]: file,
      }));
    };
    const [formData, setFormaData] = useState({});

    const {
      invoice_attachment,
    } = formData; 

  const dateRestriction = DateComponent('invoice')
  const [moduleTypeData, setModuleTypeData] = useState([])
  const [moduleType, setModuleType] = useState('');
  const [moduleTypeId, setModuleTypeId] = useState('');

  const selectModuleType = (e) => {
      const id = e.value;
      setModuleTypeId(id)
      setModuleType([e])
    //   getSubModuleType()
      getApprovalList(e.value)
  }
  const UserDetails = useSelector((state) => (state && state.auth ? state.auth.userData : {}));

  const getApprovalList = (moduleType) => {
    const formData = form.values
    const fromDate = formData.date != undefined ? new Date(moment(formData.date.start).format('YYYY-MM-DD')) : 0
    const toDate = formData.date != undefined ? new Date(moment(formData.date.end).format('YYYY-MM-DD')) : 0
    const fromDateMilliSecond = formData.date != undefined ? fromDate.getTime() : 0
    const toDateMilliSecond = formData.date != undefined ? toDate.getTime() : 0

    apiGetMethod(apiBaseUrl + `GatePro/Gate/getCanteenAccConfirmationList/${fromDateMilliSecond}/${toDateMilliSecond}/${moduleType}/${UserDetails.USERID}`)
      .then((response) => {
        const { data } = response;
        let tableData = data.results

        if (data.success == true) {
            // setModuleTypeData(data.results)
            form.setValues({
                ...form.values,
              CheckList:tableData,
            })
        }
        else if (data.success == false) {
            form.setValues({
                ...form.values,
              CheckList:tableData,
            })
        }
      })
      .catch((error) => {
        console.log(JSON.stringify(error))
        errorToast("Something went wrong, please try again after sometime");
      })
  }
  const getSubModuleType = () => {
    apiGetMethod(apiBaseUrl + `GatePro/Master/getSubModuleType/${40}`)
      .then((response) => {
        const { data } = response;
        if (data.success == true) {
            setModuleTypeData(data.results)
            InvoiceValidation()
        }
        else if (data.success == false) {
          // errorToast(data.message)
        }
      })
      .catch((error) => {
        console.log(JSON.stringify(error))
        errorToast("Something went wrong, please try again after sometime");
      })
  }
  const InvoiceValidation = () => {
    apiPostMethod(apiBaseUrl + "Loadingunloadingcost/SAP_PostingDate")
      .then((response) => {
        const { data } = response;
        setInvoicePostingDate(data.results[0]?.invoice_posting_date)
        setSAPPostingDate(data.results[0]?.sap_posting_date)

      })
  }
  const [invoicePostingDate, setInvoicePostingDate] = useState('');
  const [SAPPostingDate, setSAPPostingDate] = useState('');

  const POST=(status)=>{
    const postdata ={
     ID:form?.values?.id_list,
    //  gate_id:Data1?.gate_id,
     ref_no: form?.values?.invoice_no,
     doc_date: form?.values?.invoiceDate,
     sap_posting_date: form?.values?.sapPosting,
     item_text: form?.values?.remarks,
     vendor_code: form?.values?.vendor_code,
     amount:form?.values?.total_amount,
     UserId:UserDetails.USERID,
     status:status,
     remarks:form?.values?.remarks
    }
   
    if(status == 0 && (postdata.remarks == '' || postdata.remarks == undefined) ){
        errorToast("Please Enter Remarks...");
        return false;
    }else if(status == 3 && (postdata.doc_date == '' || postdata.doc_date == undefined) ){
        errorToast("Please Enter Invoice Date...");
        return false;
    }else if(status == 3 && (postdata.sap_posting_date == '' || postdata.sap_posting_date == undefined) ){
      errorToast("Please Enter Posting Date...");
      return false;
    }
  
    let msg = "Canteen Expense"
    let titles
    if(status == 2){
     titles = 'Are you sure to Approve?'
    }else if(status == 0){
     titles = 'Are you sure to Reject?'
    }
   
    confirmDialog({
      title: titles,
      description: msg,
    }).then((res) => {
   if (res) {
   apiPostMethod(apiBaseUrl+'GatePro/Gate/UpdateCanteenMaterial', postdata)
   .then((response) => {
   const { data } = response;
   if (data.success == true) {
    if(status == 3){
      ShowToast(data.message);
      setOpen(false)
      confirmDialog({
          title: `<h5><strong class="text-white"> DOCUMENT NO : ${data.results}</strong></h5>`, cancelButton: false, confirmText: false, confirmButton: false, background: `#51A351`
      }).then(() => {
        window.location.reload();  // Reloads the page after the confirm dialog is closed
      });
    }else if(status == false){
      errorToast("Rejected Successfully...");
      setOpen(false)
    }
    // window.setTimeout( function() {
    //   window.location.reload();
    // }, 2000);
    // setFormaData([])
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

 const approveOrRejectVehicle=(status)=>{
    const postdata ={
     ID:Data1.id,
     gate_id:Data1.gate_id,
     status:status,
     remarks:form?.values?.remarks
    }
   
    if(status == 0 && (postdata.remarks == '' || postdata.remarks == undefined) ){
        errorToast("Please Enter Remarks...");
        return false;
    }
  
    let msg = "Canteen Expense"
    let titles
    if(status == 2){
     titles = 'Are you sure to Approve?'
    }else if(status == 0){
     titles = 'Are you sure to Reject?'
    }
   
    confirmDialog({
      title: titles,
      description: msg,
    }).then((res) => {
   if (res) {
   apiPostMethod(apiBaseUrl+'GatePro/Gate/UpdateCanteenMaterial', postdata)
   .then((response) => {
   const { data } = response;
   if (data.success == true) {
    if(status == 3){
      ShowToast("Saved Successfully...");
      setOpen(false)
    }else if(status == false){
      errorToast("Rejected Successfully...");
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
  return ( 
    <Fragment>
    <RefreshBlock/>
     {/* <div style={{ border: "2px solid #7367f0 ", padding: "2px", borderRadius: "6px", marginTop: "1px" }}> */}
     <CardComponent  header="Canteen Material Accounts Approval">
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
        </Row>
        <HrLine />
      <Row>
        <Col>
          <TableComponent 
          select 
          onSelectedRowsChange={onSelectedRowsChange}
          // selectableRowDisabled={selectableRowDisabled}
          showDownload 
          columns={columns} 
          data={form.values.CheckList}/>  
        </Col>
      </Row>
      <Row>
      <Col md="12" sm="12">
                <FormGroup className="d-flex mb-0 justify-content-start">
                  {/* <Button.Ripple outline color="secondary" tag={Link} to={`/LOADUNLOADPAYMENT`} type="reset" className="mr-2">
                    Cancel
                  </Button.Ripple> */}
                    <div className="mr-1">
                      <Button.Ripple color="primary" type="button" onClick={() => getSelectedRows() /*handleShowModal(form.setValues({...form.values,CheckList}))*/}>
                        Add
                      </Button.Ripple>
                    </div>
                </FormGroup>
        </Col>
        </Row>
      </CardComponent>
      <Modal show={showModal} centered size="xl">
      <Modal.Header><b>Payment Confirmation</b></Modal.Header>
      <Modal.Body>
      <Row>
      <Col md="12" sm="12"><X onClick={closed} style={{ float: "right" }} /></Col>
       <Col md="4" sm="12">
          <CustomTextInput label={"Total Row Count"} form={form} id="row_count" type="text" disabled/>
        </Col>
        <Col md="4" sm="12">
          <CustomTextInput label={"Invoice Value"} form={form} id="total_amount" type="text" disabled/>
        </Col>
        <Col md="4" sm="12">
          <CustomTextInput label={"Vendor Name"} form={form} id="master_vendor" type="text" disabled />
        </Col>
        <Col md="4" sm="12">
          <CustomTextInput label={"Vendor Invoice No"} form={form} id="invoice_no" type="text" disabled />
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
        <Col md="4" sm="12" >
             <CustomTextInput
                label={"Posting Date"}
                form={form}
                id="sapPosting"
                type="date"
                min={getAllowedPastDate(SAPPostingDate)}
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
          <Col md="12" sm="12">
                <FormGroup className="d-flex mb-0 justify-content-end">
                  {/* <Button.Ripple outline color="secondary" tag={Link} to={`/LOADUNLOADPAYMENT`} type="reset" className="mr-2">
                    Cancel
                  </Button.Ripple> */}
                    <div className="mr-1">
                      <Button.Ripple color="primary" type="button" onClick={() => POST(3) /*handleShowModal(form.setValues({...form.values,CheckList}))*/}>
                        Submit
                      </Button.Ripple>
                    </div>
                </FormGroup>
              </Col>
      </Row>
      </Modal.Body>
      </Modal>
      {/* </CardComponent>} */}
      <Modal show={open} centered size="xl">
       <Modal.Header><b>Material Details</b>
          <X onClick={close} style={{ float: "right" }} />
        </Modal.Header>
                <Modal.Body>
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
      <Modal show={show} centered>
                <Modal.Header>
                    <Row>
                        <Col md="12" sm="12">
                            <FormGroup style={{ width: 460 }}>
                                <Modal.Title>{'Reject'} <X onClick={closeRemarksModal} style={{ float: "right" }} /></Modal.Title>
                            </FormGroup>
                        </Col>
                    </Row>
                </Modal.Header>
                <Modal.Body>
                    <Row>
                        
                        <Col sm="12" md="12">
                            <FormGroup>
                                <CustomTextInput label={"Remark"} type="text" form={form} id="remarks" />
                            </FormGroup>
                        </Col>
                        <Col sm="12" md="12">
                            <label></label>
                            <FormGroup className="d-flex justify-content-center mb-0">
                                    <Button.Ripple color="danger" type="button" 
                                    onClick={() => approveOrRejectVehicle(0)}
                                    >
                                        <X size={16} /> Reject
                                    </Button.Ripple>
                            </FormGroup>
                        </Col>
                    </Row>
                </Modal.Body>
            </Modal >
    </Fragment>
    );
}; 


export default CanteenMaterialAccApproval 
