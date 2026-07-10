import React, { Fragment, useState, useEffect } from 'react'
import { Col ,FormGroup, Label,Button, ButtonToggle, Input } from 'reactstrap'
import Row from 'reactstrap/lib/Row'
import { apiBaseUrl, vaUrl ,BagcuttingUrl, uploadUrl, sapFileShare } from '../../urlConstants'
import { useFormik } from "formik";
import { CustomDropdownInput, CustomTextInput, CustomUploader, validation, Yup } from "../forms/custom-form";
import { Link, useHistory, useParams } from 'react-router-dom';
import { useLoader } from '../../utility/hooks/useLoader';
import { apiPostMethod } from '../../helper/axiosHelper';
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
import DateComponent from '../common/dateComponent';
import NumberOnlyInput from '../../@core/components/number-input/number-input';

const LoadUnloadPayment = ({})  => { 
  const history = useHistory();
  const form = useFormik({
    isInitialValid: false,
    initialValues: {},
    validationSchema: Yup.object().shape({}),
    onSubmit(values) { },
  });
  const taColumns = [
    {
      name: "DATE",
      selector: "DateAdded",
      sortable: true,
      minWidth: "120px",
      wrap: true,
    },
    {
      name: "MIGO NO",
      selector: "MIGO_NUM",
      sortable: true,
      minWidth: "120px",
      wrap: true,
    },
    {
      name: "PO NO",
      selector: "po_number",
      sortable: true,
      minWidth: "120px",
      wrap: true,
    },
    {
      name: "VENDOR",
      selector: "Name",
      sortable: true,
      minWidth: "250px",
      wrap: true,
    },
    
    {
      name: "PLANT",
      selector: "plant_id",
      sortable: true,
      minWidth: "60px",
      wrap: true,
    },
    {
      name: "TYPE",
      selector: "Type",
      sortable: true,
      minWidth: "120px",
      wrap: true,
    },
    {
      name: "QTY IN TON",
      selector: "total_weight",
      sortable: true,
      minWidth: "80px",
      wrap: true,
    },
    {
      name: "COST PER TON",
      selector: "loading_charge",
      sortable: true,
      minWidth: "80px",
      wrap: true,
    },
    {
      name: "CONDITION VALUE",
      selector: "value",
      sortable: true,
      minWidth: "100px",
      wrap: true,
    },
    {
      name: "INVOICE VALUE",
      selector: "confirm_value",
      sortable: true,
      minWidth: "100px",
      // wrap: true,
      cell:(row) => {
        return (
          <NumberOnlyInput style={{fontSize:"12px",height:"30px",marginBottom:"-10px",width:"80px"}}
          placeholder={" "}  
          onChange={(e) => onTextChanges(e,row.index,form.values.CheckList,"confirm_value")} 
          form={form} 
          decimalFormat={"5,2"}
          id={'confirm_value'} 
          type="text" 
          value={row.confirm_value}
         />
        )
       
      }
    },
    {
      name: "MOVEMENT",
      selector: "vehicle_type",
      sortable: true,
      minWidth: "100px",
      wrap: true,
      // cell: 
      cell: (row) => {
        return  (
          row.vehicle_type == 'EVADP' ? 'IAS' : row.vehicle_type
        );
      },
    },
    
  ];

    const actionsCol2 = {
      name: "ACTION",
      selector: "status",
      minWidth: "100px",
      cell: (row) => {
        return  (
          ActionColumn(row)
        );
      },
    };

    const columns = [...taColumns, actionsCol2];
    const [warehouseoption, setWarehouseoption] = useState([]);  


    let { id } = useParams();
    let refid='';
    let fdata='';
    if(id) {
       refid = id.replace(":", "");
    }
    let { showLoader, hideLoader } = useLoader(); 
    
    // useEffect(() => { 
    //   getSublotlist();
    // }, [id]);

    
  
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

    const getSublotlist = () => {
      let values = form.values;
      let fdata = {
      fromdate:form.values.FromDate,
      todate:form.values.ToDate,
      Vendor_Name:form.values.Vendor_Name,
      // Vendor_Names:form.values.Vendor_Name?.label,
      Plant:form.values.plant,
      Type:form.values.type?.value,
      company_name:form.values.company_name?.value,
      vehicle_type:form.values.movement?.value,
      ScreenName:form.values.movement?.label == 'STO' ? 'IAS' : form.values.movement?.label,

      po_number:form.values.po_number
      // po_number:'1700031981,2800000933'

      };

    showLoader();
     apiPostMethod(apiBaseUrl + "Loadingunloadingcost/Loading_Unloading_Data", fdata)
     .then((response) => {
       const { data } = response;
       let tableData = data.result
    
       if (data.success) {
        form.setValues({
           ...form.values,
         CheckList:tableData,
       })
       }
       LoadingCostValidation()
     })
     .catch((error) => {
       errorToast("Something went wrong, please try again after sometime");
     })
     .finally((a) => {
       hideLoader();
     });
    }; 
    const [LoadUnloadCostPercentage, setLoadUnloadCostPercentage] = useState([]);
    const LoadingCostValidation = () => {
      apiPostMethod(apiBaseUrl + "Loadingunloadingcost/SAP_PostingDate")
        .then((response) => {
          const { data } = response;
          setLoadUnloadCostPercentage(data.results[0]?.load_unload_cost_percentage)
        })
    }


  const ActionColumn=(row)=>{
        return (
          <Button color="primary" type="Button" onClick={(e) => {reject(row)}}>View</Button>
        )
  }

  const [SelectedList, setSelectedList] = useState();

  const onSelectedRowsChange = (selectedRowState) => {
    for (let i=0;i<=selectedRowState.selectedRows.length;i++){
      setSelectedList(selectedRowState.selectedRows);
    }

  }

  // const selectableRowDisabled = (row) => {
  //   // console.log("SUPER");
  //   // console.log(row);
  //   return !(row.ApprovalEnableFlag === "1" && row.status === "2");
  // }
  const [SelectedData, setSelectedData] = useState([]);
  const [showModal, setShowModal] = useState(false);

 const closed = () => setShowModal(false);

 const OpenData = () => {
  setShowModal(true)
 }
  const getSelectedRows = () => {

    let data = [];
    let confirm_value = [];
    let value = [];
    let filteredData = SelectedList
    let count = 0
    var invoice_value= 0;
    var total_value= 0;
    var overall_tonnage= [];
    var overall_ton = 0;

    if(filteredData){
       for (let i = 0; i < filteredData.length; i++) {
        let validation = (Number(filteredData[i].value*LoadUnloadCostPercentage/100)+Number(filteredData[i].value)).toFixed(0)
        if(Number(filteredData[i].confirm_value) > validation){
          errorToast('Invoice value should not be more than 10% of condition value');
          return false
        }
        if(Number(filteredData[i].confirm_value) <= 0){
          errorToast('Please Check Invoice Value for this MIGO number'+' - '+filteredData[i].MIGO_NUM);
          return false     
        }
        confirm_value.push(filteredData[i].confirm_value);
        value.push(filteredData[i].value);
        overall_tonnage.push(filteredData[i].total_weight);
       } 
       (confirm_value).forEach(subData => invoice_value += Number(subData));
       (value).forEach(subData => total_value += Number(subData));
       (overall_tonnage).forEach(subData2 => overall_ton += Number(subData2));

         form.setValues({
            ...form.values,
          CheckLists:filteredData,
          invoice_value:invoice_value.toFixed(2),
          total_value:total_value.toFixed(2),
          overall_tonnage:overall_ton.toFixed(3),
          row_count:value.length
        })
        setFormaData(form.values)
        OpenData()
    }else{
      errorToast("Please Select the Load and Unload Charges");
    }
  }
  const POST = () => {

    let value = [];
    let rake_load_id = [];
    let unload_id = [];
    let ias_unload_id = [];
    let ias_load_id = [];
    let gate_out_id = [];


    let filteredData = SelectedList
    if(filteredData){
       for (let i = 0; i < filteredData.length; i++) {

        // value.push(filteredData[i].value);
        if(filteredData[i].id){
        rake_load_id.push(filteredData[i].id);
        }
        if(filteredData[i].ias_unload_id){
        ias_unload_id.push(filteredData[i].ias_unload_id);
        }
        if(filteredData[i].PI_REFID){
        unload_id.push(filteredData[i].PI_REFID);
        }
        if(filteredData[i].ID){
        ias_load_id.push(filteredData[i].ID);
        }
        if(filteredData[i].GO_REFID){
        gate_out_id.push(filteredData[i].GO_REFID);
        }
        value.push({
          DateAdded: filteredData[i].DateAdded,
          po_number: filteredData[i].po_number,
          Name: filteredData[i].Name,
          plant_id: filteredData[i].plant_id,
          total_weight: filteredData[i].total_weight,
          loading_charge: filteredData[i].loading_charge,
          value: filteredData[i].value,
          confirm_value: filteredData[i].confirm_value,
          vehicle_type: filteredData[i].vehicle_type == 'EVADP' ? 'IAS' : filteredData[i].vehicle_type,
          va_number: filteredData[i].ZVA_NUMBER,
          migo_no: filteredData[i].MIGO_NUM,
          po_line_item: filteredData[i].po_line_item,
          Type: filteredData[i].Type == 'Loading'? 'LOAD':'UNLOAD',
        })
       } 
    const fdata = {
      row_count : form.values.row_count,
      invoice_value : form.values.invoice_value,
      total_value : form.values.total_value,
      difference : (form.values.total_value-form.values.invoice_value).toFixed(2),
      confirm_vendor : form.values.confirm_vendor?.value,
      tds_code : form.values.tds_code,
      invoice_no : form.values.vendor_invoice_no,
      invoice_date : form.values.invoice_date,
      remarks : form.values.remarks,
      overall_tonnage : form.values.overall_tonnage,
      process_type : form.values.movement.value,
      company_name : form.values.company_name.label,
      rake_id:rake_load_id.toString(),
      unload_id:unload_id.toString(),
      ias_unload_id:ias_unload_id.toString(),
      ias_load_id:ias_load_id.toString(),
      gate_out_id:gate_out_id.toString(),
      child_info:value
    };
    if(fdata.tds_code == undefined || fdata.tds_code == ''){
      errorToast("Please Add Confirmation Vendor and TDS");
      return false
    }else if(fdata.invoice_no == undefined || fdata.invoice_no == ''){
      errorToast("Please Enter Invoice No");
      return false
    }
    // else if(fdata.difference < 0){
    //   errorToast("Please Check Invoice Value");
    //   return false
    // }
    else if(fdata.invoice_date == undefined || fdata.invoice_date == undefined){
      errorToast("Please Select Invoice Date");
      return false
    }

      let keys = Object.keys(attachedFiles).filter((k) => attachedFiles[k].name);
      if (keys.length > 0) {
        let FileSaveUrl="";
          let postdata = new FormData();
      
        let {Invoicecopy} = ImgData;
        
   
          postdata.append("image[]", Invoicecopy);
        
        Object.keys(attachedFiles).forEach((key) => {
        postdata.append("file[]", attachedFiles[key]);
        });
  
        postdata.append("form_name", "LOAD_UNLOAD");
        postdata.append("ponumber", "invoice_copy");
        // postdata.append("VA_Number", "001");
        postdata.append("SubFolder", "LOAD_UNLOAD");
        showLoader();
        apiPostMethod(sapFileShare, postdata, "File")
          .then((response) => {
            const { data } = response;
            if (data.success) {
              fdata.Invoicecopy = data.files[0] ? data.files[0].updname : "";
              Submit(fdata);
            }
          })
          .catch((error) => {
            errorToast("Something went wrong, please try again after sometime");
          })
          .finally((a) => {
            hideLoader();
          });
      }else{
        errorToast("Please Attach Invoice Copy");
      }
    };
  const Submit = (fdata) => {
    apiPostMethod(apiBaseUrl + "Loadingunloadingcost/Load_Unload_Payment_insert", fdata)
    .then((response) => {
      const { data } = response;
          if (data.success == 1) {
            ShowToast("Saved Successfully...");
            window.setTimeout( function() {
              window.location.reload();
            }, 2000);
          }else if(data.success == 0){
            errorToast(data.error);
          }
    }).catch((error) => {
      errorToast("Something went wrong, please try again after sometime");
    });
    }
  }
 //Modal pop up window 
   const [open, setOpen] = useState(false);
   const [Data, setData] = useState([]);

    const close = () => setOpen(false);

    const reject = (row) => {
        setData(row)
        setOpen(true)
    }
    const [VendorOptions, setVendorOptions] = useState([]);
    const [PlantOptions, setPlantOptions] = useState([]);
    const [PoNumber, setPoNumber] = useState([]);

    useEffect(() => { 
      if(form.values.FromDate && form.values.ToDate)
      getVendorCode();
    }, [form.values.ToDate && form.values.FromDate]);
    useEffect(() => { 
      if(form.values.FromDate && form.values.ToDate && form.values.Vendor_Name && form.values.company_name && form.values.movement)
      getSublotlist();
    }, [form.values.ToDate && form.values.FromDate && form.values.Vendor_Name && form.values.company_name && form.values.movement]);
    const getVendorCode = () => {
      let fdata = { 
        toDate: form.values.ToDate, 
        fromdate:form.values.FromDate,
      };
  
      apiPostMethod(apiBaseUrl+'Loadingunloadingcost/getVendorList', fdata)
        .then((response) => {
          const { data } = response;
          console.log(data)
          if (data.success) {
            const map = new Map();
            let values = data.results
            values.forEach(v => map.set(v.value, v)) // having `value` is always unique
            values=[...map.values()];
            setVendorOptions(values);
          }
          getPlantCode();
        })
        .catch((error) => {
          errorToast("Something went wrong, please try again after sometime");
        });
    };
    const getPlantCode = () => {
      let fdata = { 
        toDate: form.values.ToDate, 
        fromdate:form.values.FromDate,
      };
  
      apiPostMethod(apiBaseUrl+'Loadingunloadingcost/getPlantList', fdata)
        .then((response) => {
          const { data } = response;
          console.log(data)
          if (data.success) {
            const map = new Map();
            let values = data.results
            values.forEach(v => map.set(v.value, v)) // having `value` is always unique
            values=[...map.values()];
            setPlantOptions(values);
          }
          getPONUMBER();
        })
        .catch((error) => {
          errorToast("Something went wrong, please try again after sometime");
        });
    };

    const getPONUMBER = () => {
      let fdata = { 
        toDate: form.values.ToDate, 
        fromdate:form.values.FromDate,
      };
  
      apiPostMethod(apiBaseUrl+'Loadingunloadingcost/getPOList', fdata)
        .then((response) => {
          const { data } = response;
          console.log(data)
          if (data.success) {
            const map = new Map();
            let values = data.results
            values.forEach(v => map.set(v.value, v)) // having `value` is always unique
            values=[...map.values()];
            setPoNumber(values);
          }
        })
        .catch((error) => {
          errorToast("Something went wrong, please try again after sometime");
        });
    };
    useEffect(() => { 
      if(form.values.confirm_vendor){
      const fdata1 = {Id:form.values.confirm_vendor.value}
      apiPostMethod(apiBaseUrl+'Loadingunloadingcost/getVendorById', fdata1)
      .then((response) => {
        const { data } = response;
        if (data.success) {
          form.setValues({
            ...form.values,
          tds_name:data.results[0].tds_name,
          tds_code:data.results[0].tds_code,
        })
        }
       }).catch((error) => {
        errorToast("The selected Vendor");
      });
     }
    }, [form.values.confirm_vendor]);

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

  return ( 
    <Fragment>
    <RefreshBlock/>
     {/* <div style={{ border: "2px solid #7367f0 ", padding: "2px", borderRadius: "6px", marginTop: "1px" }}> */}
     <CardComponent  header="Loading & Unloading Payment - Warehouse Incharge">
     <Row>
           <Col md="3" sm="12">
             <DatePicker label={"From Date"} form={form} id="FromDate" type="date"  />
          </Col>
          <Col md="3" sm="12">
             <DatePicker label={"To Date"} form={form} id="ToDate" type="date"/>
          </Col>
          <Col md="3" sm="12" >
            <CustomDropdownInput  
                // url={`${apiBaseUrl}/Loadingunloadingcost/getVendor`} 
                label={"Vendor Name"}  
                form={form} 
                id={"Vendor_Name"}
                options ={VendorOptions}  
                isMulti 
              />
          </Col>
          <Col md="3" sm="12" > 
          <CustomDropdownInput label={"Company Name"} id="company_name" 
              url={`${apiBaseUrl}Loadingunloadingcost/Company_Name`}
              form={form}
              // isMulti
              //options={PlantOptions} 
              //onChange={(e) => onPlantChange(e)}
            />
          </Col>
          <Col md="3" sm="12" > 
           <CustomDropdownInput label={"Movement"} id="movement" 
            url={`${apiBaseUrl}Loadingunloadingcost/Movement`}
            form={form}
            // isMulti
            //options={PlantOptions} 
            //onChange={(e) => onPlantChange(e)}
           />
          </Col>
          <Col md="3" sm="12" > 
          <CustomDropdownInput 
            label={"Plant Name"} 
            id="plant" 
            // url={`${apiBaseUrl}Warehouse/Master/getPlants`}
            form={form}
            isMulti
            options={PlantOptions} 
            //onChange={(e) => onPlantChange(e)}
          />
         </Col>
         
          <Col md="3" sm="12">
            <CustomDropdownInput 
            label={"PO/STO Number"} 
            form={form} 
            id="po_number" 
            isMulti
            options={PoNumber} 
            />
          </Col>
          <Col md="3" sm="12" > 
          <CustomDropdownInput label={"Type"} id="type" 
              url={`${apiBaseUrl}Loadingunloadingcost/Type`}
              form={form}
              // isMulti
              //options={PlantOptions} 
              //onChange={(e) => onPlantChange(e)}
            />
          </Col>
          
          <Col md="3" sm="12"> 
             <Label></Label>
            <FormGroup className="d-flex justify-content-end mb-0">
            <Button.Ripple onClick={getSublotlist}  color="primary"  type="Button"  >
            Show
            </Button.Ripple>
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
          <CustomTextInput label={"Total Tonnage"} form={form} id="overall_tonnage" type="text" disabled/>
        </Col>
        <Col md="4" sm="12">
          <CustomTextInput label={"Total Value"} form={form} id="total_value" type="text" disabled/>
        </Col>
        <Col md="4" sm="12">
          <CustomTextInput label={"Invoice Value"} form={form} id="invoice_value" type="text" disabled/>
        </Col>
        <Col md="4" sm="12">
          <CustomTextInput label={"Difference"} form={form} id="difference" value = {(form.values.total_value-form.values.invoice_value).toFixed(2)} type="text" disabled/>
        </Col>
        <Col md="4" sm="12" >
            <CustomDropdownInput  
                url={`${apiBaseUrl}/Loadingunloadingcost/getVendor`} 
                label={"Confirm Vendor Name"}  
                form={form} 
                id={"confirm_vendor"}
                options ={warehouseoption}   
              />
        </Col>
        <Col md="4" sm="12">
          <CustomTextInput label={"TDS"} form={form} id="tds_name" type="text" disabled/>
        </Col>
        <Col md="4" sm="12">
          <CustomTextInput label={"Vendor Invoice No"} form={form} id="vendor_invoice_no" type="text" />
        </Col>
        <Col md="4" sm="12">
          <CustomTextInput label={"Invoice Date"} form={form} id="invoice_date" type="date" 
          min={dateRestriction.min_date} 
          max={dateRestriction.max_date} />
          {/* <DatePicker label={"From Date"} form={form} id="FromDate" type="date"  /> */}
        </Col>
       
      {/* </Row> */}
      {/* <Row> */}
        {/* <Col md="4" sm="12">
          <CustomTextInput label={"Additional Amount"} form={form} id="invoice_no" type="text" />
        </Col> */}
        <Col md="4" sm="12">
          <CustomTextInput label={"Remarks"} form={form} id="remarks" type="text" />
        </Col>
        <Col md="4" sm="12">
        <Uploader
                    // isReadOnly={!attachedFiles.invoice_attachment.name}
                    // canEdit={!isReadOnly}
                    setAttachment={handleFileChange}
                    // form={form}
                    label={"Invoice Attachment"}
                    title="Pdf"
                    id={"invoice_attachment"}
                    selectedFileName={attachedFiles.invoice_attachment.name}
                  />
        </Col>
      </Row>
      <Row>
          <Col md="12" sm="12">
                <FormGroup className="d-flex mb-0 justify-content-end">
                  {/* <Button.Ripple outline color="secondary" tag={Link} to={`/LOADUNLOADPAYMENT`} type="reset" className="mr-2">
                    Cancel
                  </Button.Ripple> */}
                    <div className="mr-1">
                      <Button.Ripple color="primary" type="button" onClick={() => POST() /*handleShowModal(form.setValues({...form.values,CheckList}))*/}>
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
      <Modal.Header><b>VA Number Details</b></Modal.Header>
                <Modal.Body>
                    <Row>
                        <Col md="12" sm="12"><X onClick={close} style={{ float: "right" }} /></Col>
                        <Col md="4" sm="12">
                        <CustomTextInput label={"VA Number"} form={form} id="invoice_no" value={Data?.ZVA_NUMBER} disabled type="text" />
                        </Col>
                        {Data.DeliveryNo &&
                        <Col md="4" sm="12">
                        <CustomTextInput label={"Delivery No"} form={form} id="invoice_no" value={Data?.DeliveryNo} disabled type="text" />
                        </Col>}
                        {Data.MIGO_NUM &&
                        <Col md="4" sm="12">
                        <CustomTextInput label={"Migo Number"} form={form} id="invoice_no" value={Data?.MIGO_NUM} disabled type="text" />
                        </Col>}
                        <Col md="4" sm="12">
                        <CustomTextInput label={"Date"} form={form} id="invoice_no" value={Data?.DateAdded} disabled type="text" />
                        </Col>
                        <Col md="4" sm="12">
                        <CustomTextInput label={"PO Number"} form={form} id="invoice_no" value={Data?.po_number} disabled type="text" />
                        </Col>
                        <Col md="4" sm="12">
                        <CustomTextInput label={"Vendor"} form={form} id="invoice_no" value={Data?.Name} disabled type="text" />
                        </Col>
                        <Col md="4" sm="12">
                        <CustomTextInput label={"Plant"} form={form} id="invoice_no" value={Data?.plant_id} disabled type="text" />
                        </Col>
                        <Col md="4" sm="12">
                        <CustomTextInput label={"Type"} form={form} id="invoice_no" value={Data?.Type} disabled type="text" />
                        </Col>
                        <Col md="4" sm="12">
                        <CustomTextInput label={"Ton"} form={form} id="invoice_no" value={Data?.total_weight} disabled type="text" />
                        </Col>
                        <Col md="4" sm="12">
                        <CustomTextInput label={"Cost Per Ton"} form={form} id="invoice_no" value={Data?.loading_charge} disabled type="text" />
                        </Col>
                        <Col md="4" sm="12">
                        <CustomTextInput label={"Value"} form={form} id="invoice_no"  value={Data?.value} disabled type="text" />
                        </Col>
                        <Col md="4" sm="12">
                        <CustomTextInput label={"Movement"} form={form} id="invoice_no" value={Data?.vehicle_type} disabled type="text" />
                        </Col>
                        {Data.SendingPlant &&
                        <Col md="4" sm="12">
                        <CustomTextInput label={"From Plant"} form={form} id="invoice_no" value={Data?.SendingPlant} disabled type="text" />
                        </Col>}
                        {Data.ReceivingPlant &&
                        <Col md="4" sm="12">
                        <CustomTextInput label={"To Plant"} form={form} id="invoice_no" value={Data?.ReceivingPlant} disabled type="text" />
                        </Col>}
                        <Col md="4" sm="12">
                        <CustomTextInput label={"Truck No"} form={form} id="invoice_no" value={Data?.vehicle_no} disabled type="text" />
                        </Col>
                    </Row>
                </Modal.Body>
            </Modal>
    </Fragment>
    );
}; 


export default LoadUnloadPayment 
