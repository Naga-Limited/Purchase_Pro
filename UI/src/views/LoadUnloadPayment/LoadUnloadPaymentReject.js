import React, { Fragment, useState, useEffect } from 'react'
import { Col ,FormGroup, Label,Button, ButtonToggle, Input } from 'reactstrap'
import Row from 'reactstrap/lib/Row'
import { apiBaseUrl, vaUrl ,BagcuttingUrl, sapFileShare } from '../../urlConstants'
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
import { X } from "react-feather";
import Uploader from '../Uploader';
import NumberOnlyInput from '../../@core/components/number-input/number-input';

const LoadUnloadPaymentReject = ({})  => { 
  const history = useHistory();
  const EditableCell = ({ value, rowIndex, field, onTextChanges }) => {
    const [localValue, setLocalValue] = React.useState(value ?? "");
  
    React.useEffect(() => {
      setLocalValue(value ?? "");
    }, [value]);
  
    return (
      <Input
        type="text"
        style={{
          fontSize: "12px",
          height: "30px",
          marginBottom: "-5px",
          width: "100px",
        }}
        value={localValue}
        onChange={(e) => {
          const val = e.target.value;
          if (/^\d*\.?\d*$/.test(val)) {
            setLocalValue(val); // ✅ keep typing smooth
          }
        }}
        onBlur={() => {
          onTextChanges(localValue, rowIndex, field); // ✅ update form only on blur
        }}
      />
    );
  };
  
  const taColumns = [
    {
      name: "L&U NO",
      selector: "load_unload_no",
      sortable: true,
      minWidth: "120px",
      wrap: true,
    },
    {
      name: "COUNT",
      selector: "row_count",
      sortable: true,
      minWidth: "50px",
      wrap: true,
    },
    {
      name: "VENDOR",
      selector: "Name",
      sortable: true,
      minWidth: "350px",
      wrap: true,
    },
    
    {
      name: "TRANSACTION DATE",
      selector: "created_at",
      sortable: true,
      minWidth: "50px",
      wrap: true,
    },
    {
      name: "VALUE",
      selector: "invoice_value",
      sortable: true,
      minWidth: "120px",
      wrap: true,
    },
    {
      name: "WAITING AT",
      selector: "Waiting_at",
      sortable: true,
      minWidth: "120px",
      wrap: true,
      cell: (row) => {
        return  (
          <>
          <span className="badge rounded-pill bg-info">
            {row.Waiting_at}
          </span>
          </>
        );
     },
    },
    
    
  ];

    const actionsCol2 = {
      name: "ACTION",
      selector: "status",
      minWidth: "50px",
      cell: (row) => {
        return  (
          ActionColumn(row)
        );
      },
    };
    const taColumnsVADetails = [
      {
        name: "VA NO",
        selector: "va_number",
        sortable: true,
        minWidth: "200px",
        wrap: true,
      },
      {
        name: "MIGO NO",
        selector: "migo_no",
        sortable: true,
        minWidth: "100px",
        wrap: true,
      },
      {
        name: "PO NO",
        selector: "po_number",
        sortable: true,
        minWidth: "100px",
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
        minWidth: "80px",
        wrap: true,
      },
      {
        name: "TYPE",
        selector: "Type",
        sortable: true,
        minWidth: "80px",
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
        minWidth: "120px",
        cell: (row, rowIndex) => (
          <EditableCell
          value={row.confirm_value}
          rowIndex={rowIndex}
          field="confirm_value"
          onTextChanges={onTextChanges}
        />
        ),
      },
           
      {
        name: "MOVEMENT",
        selector: "vehicle_type",
        sortable: true,
        minWidth: "100px",
        wrap: true,
      },
    ];
    const columns = [...taColumns, actionsCol2];
    const ColumnsVADetails = [...taColumnsVADetails];

    const [warehouseoption, setWarehouseoption] = useState([]);  


   
    let { showLoader, hideLoader } = useLoader(); 
    
    useEffect(() => { 
      getLoadUnloadList();
    }, []);

    const form = useFormik({
      isInitialValid: false,
      initialValues: {},
      validationSchema: Yup.object().shape({}),
      onSubmit(values) { },
    });
  
    const onTextChanges = (value, rowIndex, field) => {
      form.setValues((prevValues) => {
        const updatedData = [...(prevValues.load_unload_info || [])];
    
        if (updatedData[rowIndex]) {
          updatedData[rowIndex] = {
            ...updatedData[rowIndex],
            [field]: value,
          };
        }
    
        return {
          ...prevValues,
          load_unload_info: updatedData,
        };
      });
    };
    
    

    const getLoadUnloadList = () => {
      let values = form.values;
      let fdata = {
      status : 8
      };

    showLoader();
     apiPostMethod(apiBaseUrl + "Loadingunloadingcost/Load_Unload_Payment_Index", fdata)
     .then((response) => {
       const { data } = response;
       let tableData = data.results
       let load_unload_info = data.load_unload_info

       if (data.success) {
        form.setValues({
           ...form.values,
         CheckList:tableData,
       })
       form.setFieldValue("confirm_vendor", {  label: data.results[0].Name,value: data.results[0].confirm_vendor_id });
       LoadingCostValidation()
       }
     })
     .catch((error) => {
      errorToast("NO Record Found");
      })
     .finally((a) => {
       hideLoader();
     });
    }; 
   

  const ActionColumn=(row)=>{
        return (
          <Button color="primary" type="Button" onClick={(e) => {Model_Open(row)}}>View</Button>
        )
  }

  
 

 //Modal pop up window 
   const [open, setOpen] = useState(false);
   const [Data, setData] = useState([]);

    const close = () => setOpen(false);

    const Model_Open = (row) => {
        setData(row)
        setOpen(true)
        form.setValues({
          ...form.values,
      
        load_unload_info:JSON.parse(row.load_unload_info),
        load_unload_no:row.load_unload_no,
        row_count:row.row_count,
        total_value:row.total_value,
        invoice_value:row.invoice_value,
        difference:row.difference,
        vendor_invoice_no:row.invoice_no,
        invoice_date:row.invoice_date,
        tds_name:row.tds_name,
        confirm_vendor:row.confirm_vendor_id,
        remarks:row.remarks,
        refid:row.id,
        rake_id:row.rake_id,
        ias_unload_id:row.ias_unload_id,
        unload_id:row.unload_id,
        ias_load_id:row.ias_load_id,
        gate_out_id:row.gate_out_id,
        invoice_attachment:row.invoice_attachment,
        overall_tonnage:row.overall_tonnage,
      })
      form.setFieldValue("confirm_vendor", {  label: row.Name,value: row.confirm_vendor_id });
    }

    const [LoadUnloadCostPercentage, setLoadUnloadCostPercentage] = useState([]);
    const LoadingCostValidation = () => {
      apiPostMethod(apiBaseUrl + "Loadingunloadingcost/SAP_PostingDate")
        .then((response) => {
          const { data } = response;
          setLoadUnloadCostPercentage(data.results[0]?.load_unload_cost_percentage)
        })
    }
    const [attachedFiles, setAttachment] = useState({invoice_attachment:{}});
    const [ImgData, setImgData] = useState({});

    const handleFileChange = (file, id) => {
      setAttachment((p) => ({
        ...p,
        [id]: file,
      }));
    };
    const POST = (status) => {

      
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
                const Invoicecopy = data.files[0] ? data.files[0].updname : "";
                Approve(status,Invoicecopy);
              }
            })
            .catch((error) => {
              errorToast("Something went wrong, please try again after sometime");
            })
            .finally((a) => {
              hideLoader();
            });
        }else{
          Approve(status);
        }
      }
    
    
    const Approve = (status,Invoicecopy) => {
      let totalValue = 0;
      let invoiceValue = 0;
      let details = [];
    
      if (form.values.load_unload_info && form.values.load_unload_info.length > 0) {
        for (let i = 0; i < form.values.load_unload_info.length; i++) {
          const row = form.values.load_unload_info[i];
          const original = Number(row.value || 0);
          const confirm = Number(row.confirm_value || 0);
          const percentage = Number(row.LoadUnloadCostPercentage || 10);
    
          // Accumulate totals
          totalValue += original;
          invoiceValue += confirm;
    
          // === % Validation ===
          if (original > 0) {
            const max = original * (1 + percentage / 100);
            if (confirm > max) {
              errorToast(
                `Row ${i + 1}: Confirm Value (${confirm}) cannot exceed ${percentage}% of Value (${original}).`
              );
              return false;
            }
          }
    
          // Push row details
          details.push({
            ...row,
            value: original,
            confirm_value: confirm,
          });
        }
      }
    
      const differenceValue = invoiceValue - totalValue;
    
      const postdata = {
        ID: form.values.refid,
        status: status,
        remarks: form.values.remarks,
        vendor_invoice_no: form.values.vendor_invoice_no,
        invoice_date: form.values.invoice_date,
        rake_id: form.values.rake_id,
        ias_unload_id: form.values.ias_unload_id,
        unload_id: form.values.unload_id,
        ias_load_id: form.values.ias_load_id,
        gate_out_id: form.values.gate_out_id,
        Invoicecopy:Invoicecopy || form.values.invoice_attachment,
        confirm_vendor : form.values.confirm_vendor?.value,
        // Totals
        totalValue,
        invoiceValue,
        differenceValue,
    
        // Full details
        load_unload_info: details,
      };
    
      if (status == 5 && (postdata.remarks == "" || postdata.remarks == undefined)) {
        errorToast("Please Enter Remarks...");
        return false;
      }
    
      let msg = "Loading & Unloading Payment";
      let titles;
      if (status == 9) {
        titles = "Are you sure to Approve?";
      } else if (status == 5) {
        titles = "Are you sure to Reject?";
      }
    
      confirmDialog({
        title: titles,
        description: msg,
      }).then((res) => {
        if (res) {
          apiPostMethod(
            apiBaseUrl + "Loadingunloadingcost/Load_Unload_Payment_Update",
            postdata
          )
            .then((response) => {
              const { data } = response;
              if (data.success) {
                if (status == 9) {
                  ShowToast("Saved Successfully...");
                  setOpen(false);
                } else if (status == 5) {
                  errorToast("Rejected Successfully...");
                  setOpen(false);
                }
                window.setTimeout(function () {
                  window.location.reload();
                }, 2000);
              }
            })
            .catch((error) => {
              errorToast("Something went wrong, please try again after sometime");
            });
        }
      });
    };
    
    useEffect(() => { 
      if(form?.values?.confirm_vendor){
      const fdata1 = {Id:form?.values?.confirm_vendor?.value}
      apiPostMethod(apiBaseUrl+'Loadingunloadingcost/getVendorById', fdata1)
      .then((response) => {
        const { data } = response;
        if (data.success) {
          form.setValues({
            ...form.values,
          tds_name:data.results[0]?.tds_name,
          tds_code:data.results[0]?.tds_code,
        })
        }
       })
     }
    }, [form?.values?.confirm_vendor]);
    useEffect(() => {
      if (form?.values?.load_unload_info && form?.values?.load_unload_info?.length > 0) {
        let totalValue = 0;
        let invoiceValue = 0;
    
        form.values.load_unload_info.forEach((row) => {
          totalValue += Number(row.value || 0);
          invoiceValue += Number(row.confirm_value || 0);
        });
    
        form.setValues((prev) => ({
          ...prev,
          total_value: totalValue,
          invoice_value: invoiceValue,
          difference: (totalValue - invoiceValue).toFixed(2),
        }));
      }
    }, [form?.values?.load_unload_info]);
  return ( 
    <Fragment>
    <RefreshBlock/>
     {/* <div style={{ border: "2px solid #7367f0 ", padding: "2px", borderRadius: "6px", marginTop: "1px" }}> */}
     <CardComponent  header="Load Unload Payment Correction - Incharge">
   
      <Row>
        <Col>
          <TableComponent 
          showDownload 
          columns={columns} 
          data={form.values.CheckList}/>  
        </Col>
      </Row>
      </CardComponent>
 
      {/* </CardComponent>} */}
      <Modal show={open} centered size="xl">
        <Modal.Header><b>Load Unload Payment Correction</b>
          <X onClick={close} style={{ float: "right" }} />
        </Modal.Header>
            <Modal.Body>
                <Row>
                    <Col md="4" sm="12">
                      <CustomTextInput label={"L&U No"} form={form} id="load_unload_no" type="text" disabled/>
                    </Col>
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
                      <CustomTextInput label={"Difference"} form={form} id="difference" value = {form.values.total_value-form.values.invoice_value} type="text" disabled/>
                    </Col>
                    <Col md="4" sm="12" >
                        <CustomDropdownInput  
                            url={`${apiBaseUrl}/Loadingunloadingcost/getVendor`} 
                            label={"Confirm Vendor Name"}  
                            form={form} 
                            id={"confirm_vendor"}
                            options ={warehouseoption}
                            // isDisabled  
                          />
                    </Col>
                    <Col md="4" sm="12">
                      <CustomTextInput label={"TDS"} form={form} id="tds_name" type="text" disabled/>
                    </Col>
                    <Col md="4" sm="12">
                      <CustomTextInput label={"Vendor Invoice No"} form={form} id="vendor_invoice_no" type="text"/>
                    </Col>
                    <Col md="4" sm="12">
                      <CustomTextInput label={"Invoice Date"} form={form} id="invoice_date" type="date" 
                      max={new Date().toISOString().split("T")[0]} 
                      onKeyDown={(e) => e.preventDefault()}/>
                      {/* <DatePicker label={"From Date"} form={form} id="FromDate" type="date"  /> */}
                    </Col>
                    <Col md="4" sm="12">
                      <CustomTextInput label={"Remarks"} form={form} id="remarks" type="text" />
                    </Col>
                    <Col md="2" sm="12">
                       <Uploader isReadOnly={true} label={"Invoice Copy"} selectedFileName={form.values.invoice_attachment} />
                    </Col>
                    <Col md="2" sm="12">
                    <Uploader 
                      setAttachment={handleFileChange}
                      // form={form}
                      label={"Invoice Re Attachment"}
                      title="Invoice Re Attachment"
                      id={"invoice_attachment"}
                      selectedFileName={attachedFiles.invoice_attachment.name}
                    />
                    </Col>
                </Row>
                <Row>
                  <Col align="left">
                    <Button onClick={(e) => Approve(5,'')} color="danger">Reject</Button>
                  </Col>
                  <Col align="right">
                    <Button onClick={(e) => POST(9)} className = "ml-2" color="primary">Approve</Button>
                  </Col>
                </Row>
                <HrLine />
                <Row>
                  <Col>
                    <TableComponent 
                    showDownload 
                    columns={ColumnsVADetails} 
                    data={form.values.load_unload_info}/>  
                  </Col>
                </Row>
            </Modal.Body>
            </Modal>
    </Fragment>
    );
}; 


export default LoadUnloadPaymentReject 
