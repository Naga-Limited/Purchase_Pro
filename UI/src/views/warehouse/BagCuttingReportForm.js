import { apiBaseUrl } from "../../urlConstants";
import { CancelSubmitButtons } from "../forms/custom-button";
//import  ReportList  from "./bagcuttingreportlist";
import { DatePicker } from "../forms/custom-datetime";
import { WHMaster_ListUrl } from "../../urlConstants";

import React, { Fragment, useEffect, useState } from "react";
import { useFormik } from "formik";
import { validation, Yup } from "../forms/custom-form";
import { useHistory, useParams } from "react-router";
import { useLoader } from "../../utility/hooks/useLoader";
import { addOption } from "../common/Utils";
import { RefreshBlock } from "../common/RefreshBlock";
import { apiPostMethod } from "@helpers/axiosHelper";
import { errorToast, ShowToast } from "@helpers/appHelper";
import { CardComponent } from "../common/CardComponent";
import moment from "moment"; 
import { Row, Col,Button } from "reactstrap";
import { CustomDropdownInput, CustomTextInput } from "../forms/custom-form";
import { Card, CardHeader, CardTitle, CardBody } from "reactstrap";
import TableComponent from "../common/TableComponent";

export const getDefaultPlant = (plantids) => {
	return { plant: plantids && plantids.length === 1 ? { label: plantids[0], value: plantids[0] } : undefined };
};
export const getDefaultWarehouse = (wh_refids) => {
	return { warehouse: wh_refids && wh_refids.length === 1 ? { label: wh_refids[0], value: wh_refids[0] } : undefined };
};
	export const evaColumns = [
	  {
	    name: "VA No...",
	    selector: "va_no",
	    sortable: true,
	    minWidth: "200px",
	  },
	  {
	    name: "Delivery No",
	    selector: "delivery_no",
	    sortable: true,
	    minWidth: "200px",
	  },
	  {
	    name: "Delivery Date",
	    selector: "delivery_date",
	    sortable: true,
	    minWidth: "200px",
	  },
	  {
	    name: "Delivery Qty",
	    selector: "delivery_qty",
	    sortable: true,
	    minWidth: "200px",
	  },
	  {
	    name: "Bag Type",
	    selector: "bag_type",
	    sortable: true,
	    minWidth: "200px",
	  },
	  {
	    name: "No of Bags",
	    selector: "no_of_bags",
	    sortable: true,
	    minWidth: "200px",
	  },
	  {
	    name: "Sending Plant",
	    selector: "sending_plant",
	    sortable: true,
	    minWidth: "200px",
	  },
	  {
	    name: "Sending Storage Location",
	    selector: "sending_stroage_location",
	    sortable: true,
	    minWidth: "200px",
	  },
	  {
	    name: "Receiving Plant",
	    selector: "receiving_plant",
	    sortable: true,
	    minWidth: "200px",
	  },
	  {
	    name: "Receiving Storage Location",
	    selector: "receiving_stroage_location",
	    sortable: true,
	    minWidth: "200px",
	  },
	  {
	    name: "Wheat Variety",
	    selector: "wheat_variety",
	    sortable: true,
	    minWidth: "200px",
	  },
	  {
	    name: "Bag Cutting Vendor",
	    selector: "bag_cuttiing_vendor",
	    sortable: true,
	    minWidth: "200px",
	  },
	  {
	    name: "Bag Cutting Charges",
	    selector: "bag_cutting_charges",
	    sortable: true,
	    minWidth: "200px",
	  },
	  {
	    name: "Tolerance %",
	    selector: "tollerancepercent",
	    sortable: true,
	    minWidth: "200px",
	  },
	  {
	    name: "WM Remarks ",
	    selector: "wm_remarks",
	    sortable: true,
	    minWidth: "200px",
	  },
	  {
	    name: "WM Approval Date & Time",
	    selector: "InsDt",
	    sortable: true,
	    minWidth: "200px",
	  },
	  {
	    name: "AC Remarks ",
	    selector: "ac_remarks",
	    sortable: true,
	    minWidth: "200px",
	  },
	  {
	    name: "AC Approval Date & Time",
	    selector: "ModDt",
	    sortable: true,
	    minWidth: "200px",
	  },
	  {
	    name: "Approval Status",
	    selector: "approvestatus",
	    sortable: true,
	    minWidth: "200px",
	  },
  ];

const ReportList = ({ title, url, actionRendorer }) => {
	const history = useHistory();
  const [Tbldata, setTbldata] = useState([]);
  

	const actionsCol = {
	  name: "Actions",
	  selector: "status",
	  minWidth: "150px",
	  cell: (row) => {
		return actionRendorer ? (
		  actionRendorer(row)
		) : (
		  <Button.Ripple color="primary" onClick={() => onActionClick(row.id, row.isApproved)}>
			{row.isApproved ? `View` : "Approve"}
		  </Button.Ripple>
		);
	  },
	};
	const columns = [...evaColumns, actionsCol];
  
	const onActionClick = (id, approved) => {
	  alert(approved)
	  if (!approved) {
		history.push("/IASRPRApprove/" + id);
	  } else {
		history.push("/IASRPRView/" + id);
	  }
	};
  
	return (
	  <div>
		<Card>
		  <CardHeader>
			<CardTitle>{title}</CardTitle>
		  </CardHeader>
		  <CardBody>
			
      <DataTable
        noHeader
        responsive
        selectableRows={false}
        columns={columns}
        className="react-dataTable"
        sortIcon={<ChevronDown size={10} />}
        data={Tbldata}
        pagination
        paginationTotalRows={totalPage || 1}
        progressPending={loading}
        progressComponent={<Spinner className={"m-2"} />}
        persistTableHead
        paginationRowsPerPageOptions={[5, 10, 25, 50, 75]}
        fixedHeader
        fixedHeaderScrollingHeight='100px'
      />

		  </CardBody>
		</Card>
	  </div>
	);
  };

const BagCuttingReportForm = ({ form,onSubmit }) => {
  const history = useHistory();
  let { id } = useParams();
  let refid='';
  if(id){
  refid = id.replace(":", "");
  }
  let { showLoader, hideLoader } = useLoader();
  useEffect(() => {
    if (id) {
      onFetchSDIdetailsById();
    }
  }, [id]);
  const onFetchSDIdetailsById = () => {
    let fdata = {
      id: refid,
    };
    showLoader();
    apiPostMethod(apiBaseUrl + "Master/getEadDetailsById", fdata)
      .then((response) => {
        const { data } = response;
        console.log(JSON.stringify(response));
        if (data.success) {
          form.setValues({
            EadId:data.results[0].id,
            EAD:data.results[0].EAD,
            date:data.results[0].date,
          })
          form.setFieldValue("From_Location", {  label: data.results[0].From_Location,value: data.results[0].From_Location });
          form.setFieldValue("To_Location", {  label: data.results[0].To_Location,value: data.results[0].To_Location });
          form.setFieldValue("Mode_Of_Transport", {  label: data.results[0].Mode_Of_Transport,value: data.results[0].Mode_Of_Transport });
          
        }
      })
      .catch((error) => {
        errorToast("Something went wrong, please try again after sometime");
      })
      .finally((a) => {
        hideLoader();
        
      });
  };
  const RefreshPage = () => {
    history.push(`/master/ead`);
  }; 
  const ShowReport = () => {
    console.log("Show Report");
    console.log(form.values.date.start);
    console.log(form.values.date.end);
    console.log(form.values.wh_refid);
    console.log(form.values.plantid);
    
    let fdata = {
      startdate: form.values.date.start,
      enddate:form.values.date.end,
      WarehouseIdList:form.values.wh_refid,
      PlantIdList:form.values.plantid,
    };

    showLoader();
    apiPostMethod(apiBaseUrl + "warehouse/Reports/getBagCuttingReport", fdata)
      .then((response) => {
        const { data } = response;
        console.log(JSON.stringify(response));
        return;
        if (data.success) {
          setTbldata(data.reportdate);
          form.setValues({
            EadId:data.results[0].id,
            EAD:data.results[0].EAD,
            date:data.results[0].date,
          })
          form.setFieldValue("From_Location", {  label: data.results[0].From_Location,value: data.results[0].From_Location });
          form.setFieldValue("To_Location", {  label: data.results[0].To_Location,value: data.results[0].To_Location });
          form.setFieldValue("Mode_Of_Transport", {  label: data.results[0].Mode_Of_Transport,value: data.results[0].Mode_Of_Transport });
          
        }
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
      <Row>
        <Col md="3" sm="12">
          <DatePicker form={form} id="date" isDateRange label={"Date Range"} />
          {/* <DatePicker form={form} id="date2" label={"Date"} /> */}
        </Col>
        <Col md="3" sm="12">
          <CustomDropdownInput
            url={`${apiBaseUrl}marketdata/master/getwarehouses`}
            isMulti label={"Warehouse Name"} form={form} id="wh_refid" />
        </Col>
        <Col md="3" sm="12">
          <CustomDropdownInput
            url={`${apiBaseUrl}warehouse/master/getstoragelocationDetailsById`}
            isMulti label={"Storage Location"} form={form} id="plantid" />
        </Col>
        <Col md="3" sm="12">
            <Button.Ripple
              color="primary"
              onClick={() => {
                ShowReport();
              }}
            >
              Show
            </Button.Ripple>

        </Col>
      </Row>
      <Row>
      <ReportList
        url={WHMaster_ListUrl}
        title={"Bag Cutting Report"}
        formType={"Bag_Cutting_Report"}
        
        actionRendorer={(row) => {
          let tx = row.isApproved ? `View` : "Edit";
          return (
            <Button.Ripple
              color="primary"
              onClick={() => {
                history.push(`/master/ead:` + row.id );
              }}
            >
              {tx}
            </Button.Ripple>
          );
        }}
      />
      </Row>
    </Fragment>
  );
};

const BagCuttingReport = () => {

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
      date: validation.required({ message:"Date should not be empty", isObject: false }),
      From_Location: validation.required({  message:"From Location should not be empty",isObject: true }),
      To_Location: validation.required({ message:"To Location should not be empty", isObject: false }),
      Mode_Of_Transport: validation.required({ message:"Mode of Transport should not be empty", isObject: false }),
      EAD: validation.required({  message:"Ead should not be empty",isObject: false  }),
    }),
    onSubmit(values) {},
  });
  const values = form.values;
  const onSubmit = () => {
//  alert("1");
    if (!form.isValid) {
      form.setSubmitting(true);
      form.validateForm();
      return;
    }
    // alert("2");
   
    let formData = form.values;
   /* if (poData.LINE_ITEM === formData.LINE_ITEM.value) {
      resetForm();
      return;
    }*/
    //alert(JSON.stringify(formData));
    const FrmData = {
     
      date:formData.date,
      From_Location:formData.From_Location.label,
      To_Location:formData.To_Location.label,
      Mode_Of_Transport:formData.Mode_Of_Transport.label,
      EAD:formData.EAD,
    };
    const postdata = {
      id:formData.EadId,
      Data:FrmData

    }
  //  alert(JSON.stringify(postdata)) ;
   // alert("3");
   console.log(JSON.stringify(postdata))
   
    showLoader();
    apiPostMethod(apiBaseUrl + "Master/updateEad", postdata)
      .then((response) => {
      //  alert("4");
        const { data } = response;
        console.log(JSON.stringify(response))
        let UsrId=data.success;
        ShowToast("Saved Successfully...");
        //history.push(`/master/ead:`+UsrId);
        history.push(`/master/ead`);
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
    history.push(`/master/ead`);
  };

  return (
    <Fragment>
      <RefreshBlock />
      <CardComponent header="Bag Cutting Report">
        <BagCuttingReportForm form={form}  onSubmit={onSubmit} />
      </CardComponent>
    </Fragment>
  );
};

export default BagCuttingReport;