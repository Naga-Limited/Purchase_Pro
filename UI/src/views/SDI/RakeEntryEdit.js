import React, { Fragment, useEffect ,useState} from "react";
import { Card, CardHeader, CardTitle, CardBody, Button ,FormGroup} from "reactstrap";
import { useFormik } from "formik";
import { validation, Yup } from "../forms/custom-form";
import { useHistory, useParams } from "react-router";
import { apiBaseUrl } from "../../urlConstants";
import { useLoader } from "../../utility/hooks/useLoader";
import TableComponent from "../common/TableComponent";
import { addOption } from "../common/Utils";
import { apiPostMethod } from "@helpers/axiosHelper";
import { errorToast, ShowToast } from "@helpers/appHelper";
import { CancelSubmitButtons } from "../forms/custom-button";
import { CardComponent } from "../common/CardComponent";
import moment from "moment"; 
////import RelottingEntrySummaryForm from "./RelottingEntrySummaryForm";
import { Row, Col } from "reactstrap";
import { CustomDropdownInput, CustomTextInput } from "../forms/custom-form";

import { RelottingUrl } from "../../urlConstants";
import { useSelector } from "react-redux";
import { Modal } from "react-bootstrap";
import { Printer, X } from "react-feather";
import QRCode from "react-qr-code";

const RakeEntryEditForm = ({ form,onSubmit }) => {

	 const taColumns = [
		// {
		//   name: "ID",
		//   selector: "id",
		//   sortable: true,
		//   minWidth: "20px",
		// },
    {
      name: "FNR NO",
      selector: "fnr_no",
      sortable: true,
      minWidth: "130px",
    },
    {
		  name: "VEHICLE NO",
		  selector: "vehicle_no",
		  sortable: true,
		  minWidth: "130px",
		},
		{
		  name: "TRIPSHEET NO",
		  selector: "tripsheet_no",
		  sortable: true,
		  minWidth: "150px",
		},
		// {
		//   name: "DRIVER NO",
		//   selector: "driver_no",
		//   sortable: true,
		//   minWidth: "100px",
		// },
		{
      name: "PO NUMBER",
      selector: "po_number",
      sortable: true,
      minWidth: "150px",
    },
    // {
    //   name: "PO LINE ITEM",
    //   selector: "po_line_item",
    //   sortable: true,
    //   minWidth: "50px",
    // },
    // {
    //   name: "WHEAT VARIETY",
    //   selector: "wheat_variety",
    //   sortable: true,
    //   minWidth: "250px",
    // },
    {
      name: "PLANT NAME",
      selector: "PLANT_NAME",
      sortable: true,
      minWidth: "200px",
    },
    {
      name: "STORAGE LOCATION",
      selector: "STORAGE_LOCATION",
      sortable: true,
      minWidth: "100px",
    },
    // {
    //   name: "Vendor Name",
    //   selector: "Name",
    //   sortable: true,
    //   minWidth: "250px",
    // },
    // {
    //   name: "Load Charges",
    //   selector: "loading_charge",
    //   sortable: true,
    //   minWidth: "50px",
    // },
    // {
    //   name: "Total Bags",
    //   selector: "total_bags",
    //   sortable: true,
    //   minWidth: "50px",
    // },
    // {
    //   name: "Total Gunny Weight",
    //   selector: "total_gunny_wt",
    //   sortable: true,
    //   minWidth: "50px",
    // },
    {
    name: "Created",
    selector: "created_at",
    sortable: true,
    minWidth: "130px",
    },
      
	  ];
	  const actionsCol = {
		name: "Actions",
		selector: "status",
		minWidth: "250px",
		cell: (row) => {
      let tx="Edit";
		  return  (
        <>
      {UserDetails.role != 'Security' &&
			<Button.Ripple color="primary"  onClick={() => ViewRelot(row.id)} >
			  {tx}
			</Button.Ripple>}&nbsp;
      {UserDetails.role != 'Security' &&
      <Button.Ripple color="primary"  onClick={() => print(row.id)} > 
        DC Print
      </Button.Ripple>}&nbsp;
      <Button.Ripple className='ml-0' color="primary" size="sm" type="button" onClick={() => onActionClick(row.vehicle_no)}> QR Print</Button.Ripple>  &nbsp;
      </> 
		  );
		},
	  };
  const [show, setShow] = useState(false);
  const [qrImage, setqrImage] = useState('');
  const ViewRelot = (id) => {
      history.push("RAKEENTRYEDITSCREEN:" + id);
  }
  
  const print = (RR_ID) => {
    window.open(`/public/#/RAKEDELIVERYSMARTFORM/${RR_ID}`)
  }
  const onActionClick = (Image) => {
    setShow(true)
    setqrImage(Image)
  };
  const closeRemarksModal = () => setShow(false);

  const print1 = () => {

    const date = new Date();
            const formattedDate = date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
            });
    const qrCodeElement = document.getElementById('qrCode').innerHTML;

    const printWindow = window.open('', '', 'width=600,height=600');
    printWindow.document.open();
    printWindow.document.write(`
      <html>
        <head>
          <title>QR Print (Rake)</title>
          <style>
          @media print {
            @page { width: 80mm; margin: 0; }
            body { width: 80mm; font-family: Arial, sans-serif; margin: 0; padding: 10px; }
        }
        .header { font-size: 18px; font-weight: bold; text-align: center; margin-bottom: 10px; }
        .content { font-size: 12px; line-height: 1.5; text-align: left; }
        .barcode { display: block; width: 70mm; margin: 10px auto; }
          </style>
        </head>
        <body onload="window.print(); window.close();">
         <div class="header">QR Print (Rake)</div>
          <div class="content">
                <p>Date: ${date}</p>
                <p>Vehicle No: ${qrImage}</p>
          </div>
          <div class="qrcode">${qrCodeElement}</div>
          <div class="content">
          <p>Thanks for visiting Naga!</p>
        </div>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

	const columns = [...taColumns, actionsCol];
  const history = useHistory();
  let { id } = useParams();
  let refid='';
  if(id){
  refid = id.replace(":", "");
  }
  console.log("test");
  let { showLoader, hideLoader } = useLoader();
  const UserDetails = useSelector((state) => (state && state.auth ? state.auth.userData : {}));

 
  return (
    <Fragment>
       <Card>
        <CardHeader>
          <CardTitle>Rake Loading Edit </CardTitle>
        </CardHeader>
        <CardBody>
          <TableComponent columns={columns} url={`${apiBaseUrl}RakeloadingController/RakeEntryEdit`} 
          formType={UserDetails.plantids.toString()} />
        </CardBody>
      </Card>


        {/*Model for QR Print */}

        <Modal show={show} centered >
                <Modal.Header>
                    <Row>
                        <Col md="12" sm="12">
                            <FormGroup style={{ width: 460 }}>
                                <Modal.Title>QR Print (Rake)<X onClick={closeRemarksModal} style={{ float: "right" }} /></Modal.Title>
                            </FormGroup>
                        </Col>
                    </Row>
                </Modal.Header>
                <Modal.Body>
                    <Row>
                        <Col sm="12" md="12" style={{ textAlign: "end" }}>
                        <Printer size={16} onClick={print1} color="blue" style={{ cursor: "pointer" }} />
                        </Col>
                    </Row>
                    <Row>
                        <Col sm="12" md="12" style={{ textAlign: "center" }}>
                            <div id="qrCode">
                                <QRCode
                                 value={qrImage}
                                 size={100}
                                 level="H"
                                 includeMargin={true}
                                />
                            </div>
                        </Col>
                        
                    </Row>
                </Modal.Body>
      </Modal >

    </Fragment>
    
  );
};
const RakeEntryEdit = () => {
  const { showLoader, hideLoader } = useLoader();
  const dateFormat = "YYYY-MM-DD";
  const today = moment().format(dateFormat);
  const isToday = (date) => {
    return moment(date).format(dateFormat) == today;
  };
  const form = useFormik({
    isInitialValid: false,
    initialValues: {},
    validationSchema: Yup.object().shape({
      divisionname: validation.required({ message:"Division Name should not be empty", isObject: false }),
      sapdivisioncode: validation.required({ message:"SAP Division Code should not be empty", isObject: false }),
    }),
    onSubmit(values) {},
  });
  const values = form.values;

  const onSubmit = () => {
    if (!form.isValid) {
      form.setSubmitting(true);
      form.validateForm();
      return;
    }
   let formData=form.values;

   const FrmData = {
      divisionid:formData.divisionid,
      divisionname:formData.divisionname,
      sapdivisioncode:formData.sapdivisioncode,
    };
    const postdata = {
      id:formData.divisionid,
      Data:FrmData
    }
 
   console.log(JSON.stringify(postdata))
    showLoader();
    apiPostMethod(apiBaseUrl + "warehouse/master/updateMaster_ngw_division", postdata)
      .then((response) => {
        const { data } = response;
        console.log(JSON.stringify(response))
        let UsrId=data.success;
        if(UsrId==-5){
          errorToast("Duplicate Entry");
        }else{
          let RespId=data.success;
          if(RespId && RespId>=1)
          {
            ShowToast("Saved Successfully...");
            if(document.getElementById("divisionid").value=="")
            {
              history.push("/warehouse/masters/RelottingEntrySummary:0");
            }
            else
            {
              history.push("/Warehouse/Masters/RelottingEntrySummary");
            }
          }
          else
          {
            if(data.ErrorMsg)
            {
              errorToast(data.ErrorMsg);
            }
            else
            {
              errorToast("Unable to update record");
            }
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
    const history = useHistory();
    const resetForm = () => {
      history.push(`/warehouse/masters/RelottingEntrySummary`);
    };
    return (
      <Fragment>
       
          <RakeEntryEditForm form={form}  onSubmit={onSubmit} />
       
      </Fragment>
    );
  };
  export default RakeEntryEdit;
  