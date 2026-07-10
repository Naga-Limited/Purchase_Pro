import React, { Fragment, useState, useEffect } from 'react'
import { Col ,FormGroup, Label,Button, ButtonToggle } from 'reactstrap'
import Row from 'reactstrap/lib/Row'
import { apiBaseUrl, vaUrl ,BagcuttingUrl } from '../../urlConstants'
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
import DateComponent from '../common/dateComponent';
import { useSelector } from 'react-redux';

const CanteenMaterialApproval = ({})  => { 
  const history = useHistory();

  const taColumns = [
    {
      name: "VA NO",
      selector: "vaNumber",
      sortable: true,
      minWidth: "150px",
      wrap: true,
    },
    {
        name: "MATERIAL TYPE",
        selector: "subModuleType",
        sortable: true,
        minWidth: "150px",
        wrap: true,
    },
    {
      name: "CREATION DATE",
      selector: "created_at",
      sortable: true,
      minWidth: "80px",
      wrap: true,
    },
    {
      name: "RECEIVE DATE",
      selector: "invoice_date",
      sortable: true,
      minWidth: "80px",
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
        minWidth: "300px",
        wrap: true,
    }, 
    {
      name: "TOTAL AMOUNT",
      selector: "total_amount",
      sortable: true,
      minWidth: "80px",
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
  
   

    const getLoadUnloadList = () => {
      let values = form.values;
     showLoader();
     apiPostMethod(apiBaseUrl + "GatePro/Gate/CanteenPaymentDetailsList")
     .then((response) => {
       const { data } = response;
       let tableData = data.results
       if (data.success) {
        form.setValues({
           ...form.values,
         CheckList:tableData,
       })
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
   const [Data1, setData1] = useState([]);

    const close = () => setOpen(false);

    const Model_Open = (row) => {
        apiPostMethod(apiBaseUrl + `GatePro/Gate/CanteenPaymentMaterialsList/${row.id}`)
        .then((response) => {
          const { data } = response;
          if (data.success) {
            setData(data.results)
            setData1(data.results[0])

            setOpen(true)
          }
        })
        .catch((error) => {
         errorToast("NO Record Found");
       })
        

    }
    const UserDetails = useSelector((state) => (state && state.auth ? state.auth.userData : {}));

    const Approve=(status)=>{
      const postdata ={
       ID:Data1?.PaymentId,
       gate_id:Data1?.gate_id,
       UserId:UserDetails.USERID,
       status:status,
       remarks:form?.values?.remarks
      }
     
      if(status == 0 && (postdata.remarks == '' || postdata.remarks == undefined) ){
       errorToast("Please Enter Remarks...");
       return false;
      }
    
      let msg = "Canteen Payment"
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
      if(status == 2){
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
     <CardComponent  header="Canteen Material Approval">
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
        <Modal.Header><b>Canteen Material Approval</b>
          <X onClick={close} style={{ float: "right" }} />
        </Modal.Header>
            <Modal.Body>
                <Row>
                   <Col md="4" sm="12">
                      <CustomTextInput label={"VA No"} form={form} id="Data" value = {Data1?.vaNumber} type="text" disabled/>
                   </Col>
                   <Col md="4" sm="12">
                      <CustomTextInput label={"Material Type"} form={form} id="vendor_invoice_no"  value = {Data1?.subModuleType} type="text" disabled/>
                    </Col>
                   <Col md="4" sm="12">
                      <CustomTextInput label={"Created Date"} form={form} id="row_count" value = {Data1?.createdAt} type="text" disabled/>
                    </Col>
                    <Col md="4" sm="12">
                      <CustomTextInput label={"Receive Date"} form={form} id="overall_tonnage" value = {Data1?.invoiceDate} type="text" disabled/>
                    </Col>
                    <Col md="4" sm="12">
                      <CustomTextInput label={"Total Qty"} form={form} id="invoice_value" value = {Data1?.total_qty} type="text" disabled/>
                    </Col>
                    <Col md="4" sm="12">
                      <CustomTextInput label={"Total Rate"} form={form} id="total_rate" value = {Data1?.total_rate} type="text" disabled/>
                    </Col>
                    <Col md="4" sm="12">
                      <CustomTextInput label={"Amount"} form={form} id="total_value" value = {Data1?.total_amount} type="text" disabled/>
                    </Col>
                    
                    <Col md="4" sm="12">
                      <CustomTextInput label={"Vendor Name"} form={form} id="vendor_invoice_no"  value = {Data1?.master_vendor} type="text" disabled/>
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
                    <Button onClick={(e) => Approve(2)} className = "ml-2" color="primary">Approve</Button>
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
    </Fragment>
    );
}; 


export default CanteenMaterialApproval 
