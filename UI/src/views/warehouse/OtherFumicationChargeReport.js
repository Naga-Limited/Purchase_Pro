import React, { Fragment, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardBody, Button, Label, FormGroup } from "reactstrap";
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
import { DatePicker } from "../forms/custom-datetime";
const RelottingEntrySummaryForm = ({ form,onSubmit }) => {

	 const taColumns = [
		{
		  name: "ID",
		  selector: "id",
		  sortable: true,
		  minWidth: "20px",
		},
    {
			name: "Warehouse",
			selector: "WH_NAME",
			sortable: true,
			minWidth: "150px",
		  },
		  {
			name: "Vendor",
			selector: "Name",
			sortable: true,
			minWidth: "250px",
		  },
    {
		  name: "Fumigation",
		  selector: "Fumigation_Type",
		  sortable: true,
		  minWidth: "100px",
		},
		{
		  name: "Area",
		  selector: "area",
		  sortable: true,
		  minWidth: "50px",
		},
		{
		  name: "Rate",
		  selector: "rate",
		  sortable: true,
		  minWidth: "50px",
		},
		{
			name: "Amount",
			selector: "total_amount",
			sortable: true,
			minWidth: "50px",
		  },
		  {
			name: "Gst",
			selector: "gst_amount",
			sortable: true,
			minWidth: "50px",
		  },
		  {
			name: "Total Amount",
			selector: "overall_amount",
			sortable: true,
			minWidth: "50px",
		  },
		  {
        name: "SAP PR No",
        selector: "sap_pr_no",
        sortable: true,
        minWidth: "150px",
      },
      {
        name: "Reject Reason",
        selector: "reject_reason",
        sortable: true,
        minWidth: "200px",
      },
		  {
			name: "Created",
			selector: "created_at",
			sortable: true,
			minWidth: "200px",
		  },
      {
        name: "Updated",
        selector: "updated_at",
        sortable: true,
        minWidth: "200px",
      },
	  ];
	  const actionsCol = {
        name: "Status",
        selector: "status",
        sortable: true,
        minWidth: "100px",
        cell: (row) => {
          return  (
            <>
            {row.status == '1' &&
            <span className="badge rounded-pill bg-info">
              Created
            </span>}
            {row.status == '2' &&
            <span className="badge rounded-pill bg-success">
              Approved
            </span>}
            {row.status == '3' &&
            <span className="badge rounded-pill bg-danger">
              Rejected
            </span>}
            </>
          );
		   },
      }

	  const columns = [...taColumns,actionsCol];
  const history = useHistory();
  let { id } = useParams();
  let refid='';
  if(id){
  refid = id.replace(":", "");
  }
  console.log("test");
  let { showLoader, hideLoader } = useLoader();
 
  const getSublotlist = () => {
    let Data={
      fromdate:form.values.FromDate,
      todate:form.values.ToDate,
    }
      let fdata = {
        Data,
       formType:"1,2,3"
      };
  

  showLoader();
    // console.log("Request Url :: "+apiBaseUrl + "warehouse/getbagcuttingEntrydatabyid", fdata);
   apiPostMethod(apiBaseUrl + "warehouse/Fumigation/FumigationOtherPRReport", fdata)
   .then((response) => {
     const { data } = response;
     console.log("Response Data :: "+JSON.stringify(response));

     console.log("Data :: ", data);
     let tableData = []
     tableData = data.results
    
     if (data.success) {
       form.setValues({
         
        ...form.values,
         CheckList:tableData,
       })
     }
     console.log("Result Data :: "+JSON.stringify(form));
   })
   .catch((error) => {
     errorToast("Something went wrong, please try again after sometime");
   })
   .finally((a) => {
     hideLoader();
   });
  }; 
  
 
  return (
    <Fragment>
       <Card>
        <CardHeader>
          <CardTitle>Other Fumigation Charge Report </CardTitle>
        </CardHeader>
        <CardBody>
        <Row>
           <Col md="3" sm="12">
             <DatePicker label={"From Date"} form={form} id="FromDate" type="date"  />
          </Col>
          <Col md="3" sm="12">
             <DatePicker label={"To Date"} form={form} id="ToDate" type="date"  />
          </Col>

          <Col md="2" sm="12"> 
             <Label></Label>
            <FormGroup className="d-flex justify-content-end mb-0">
            <Button.Ripple onClick={getSublotlist}  color="primary"  type="Button"  >
            Show
            </Button.Ripple>
            </FormGroup>
          </Col>
        </Row>
           <TableComponent showDownload columns={columns} data={form.values.CheckList} formType="Report" />
        </CardBody>
      </Card>
    
    </Fragment>
    
  );
};
const OtherFumicationChargeReport = () => {
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
       
          <RelottingEntrySummaryForm form={form}  onSubmit={onSubmit} />
       
      </Fragment>
    );
  };
  export default OtherFumicationChargeReport;
  