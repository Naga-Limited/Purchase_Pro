import React, { Fragment, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardBody, Button, Badge } from "reactstrap";
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
const RelottView = ({ form,onSubmit,formTypes }) => {

    const status = {
        "QC Approval": { title: "QC Approval", color: "light-primary" },
        "Relot Entry": { title: "Relot Entry", color: "light-success" },
        "QC Rejected": { title: "QC Rejected", color: "warning" },
        "Relot Approval": { title: "Relot Approval", color: "light-success" },
        "WH Incharge Reject": { title: "WH MG Reject", color: "danger" },
        "WH MG Reject": { title: "WH Acc.MG Reject", color: "danger" },
      };
	 const taColumns = [
		{
		  name: "Unique ID",
		  selector: "RelotId",
		  sortable: true,
		  minWidth: "150px",
		},
    {
		  name: "Warehouse",
		  selector: "WH_NAME",
		  sortable: true,
		  minWidth: "150px",
		},
		{
		  name: "Plant",
		  selector: "PLANT_NAME",
		  sortable: true,
		  minWidth: "150px",
		},
		{
		  name: "Storage Location",
		  selector: "STORAGE_LOCATION",
		  sortable: true,
		  minWidth: "150px",
		},
		{
			name: "From Lot",
			selector: "fromlotno",
			sortable: true,
			minWidth: "150px",
		  },
		  {
			name: "To Lot",
			selector: "tolotno",
			sortable: true,
			minWidth: "150px",
		  },
		  {
			name: "Wheat Variety",
			selector: "WheatvarietyName",
			sortable: true,
			minWidth: "150px",
		  },
		  
		  {
			name: "WH Remarks",
			selector: "WHInchargeRemarks",
			sortable: true,
			minWidth: "150px",
		  },
      {
      name: "WH Manager Remarks",
      selector: "WHManagerRemarks",
      sortable: true,
      minWidth: "150px",
      },
      {
      name: "Acc Manager Remarks",
      selector: "AccManagerRemarks",
      sortable: true,
      minWidth: "150px",
      },
      {
      name: "Over all Duration",
      selector: "overallduration",
      sortable: true,
      minWidth: "150px",
      },
      {
      name: "Screen Duration",
      selector: "Entryduration",
      sortable: true,
      minWidth: "150px",
      },
		  {
			name: "Waiting At",
			selector: "StatusName",
			sortable: true,
			minWidth: "150px",
            cell: (row) => {
                let s = status[row.StatusName] ? status[row.StatusName] : {};
                if(!row.StatusName){
                  s = status[row.StatusName] ? status[row.StatusName] : {};
                }
                return (
                  <Badge color={s.color} pill>
                    {s.title}
                  </Badge>
                );
              },
            }
	  ];
	  const actionsCol = {
		name: "Actions",
		selector: "status",
		minWidth: "150px",
		cell: (row) => {
		  return  (
			<Button.Ripple color="danger"  onClick={() => ViewRelot(row.RelotId)} >
                Reject
			</Button.Ripple>
		  );
		},
	  };
	  const ViewRelot = (RelotId) => {
        history.push(`RelotPlanChange:${RelotId}`);
      }
	  
	  const columns = [...taColumns, actionsCol];
  const history = useHistory();
  let { id } = useParams();
  let refid='';
  if(id){
  refid = id.replace(":", "");
  }
  console.log("test");
  let { showLoader, hideLoader } = useLoader();
  useEffect(() => {
    if (id && id!=":0") {
      onFetchSDIdetailsByid();
    }
  }, [id]);
  const onFetchSDIdetailsByid = () => {
    let fdata = {
      id: refid,
    };
    showLoader();
    apiPostMethod(apiBaseUrl + "warehouse/master/getMaster_ngw_divisionById", fdata)
      .then((response) => {
        const { data } = response;
        console.log(JSON.stringify(response));
        if (data.success) {
          form.setValues({
            divisionid:data.results[0].divisionid,
            divisionname:data.results[0].divisionname,
            sapdivisioncode:data.results[0].sapdivisioncode,
          })
          //form.setFieldValue("divisionname", {  label: data.results[0].divisionname,value: data.results[0].divisionname });
          //form.setFieldValue("sapdivisioncode", {  label: data.results[0].sapdivisioncode,value: data.results[0].sapdivisioncode });
          /*let { LINE_ITEM, ...sResult } = data.results[0];
          setPOData({
            ...poData,
            ...sResult,
            LINE_ITEM,
          });
          onFetchPOLine(sResult.ZPO_NUMBER, sResult.ZSUPPLIER_CODE);
          form.setFieldValue("LINE_ITEM", { label: LINE_ITEM, value: LINE_ITEM });*/
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
    history.push(`/warehouse/masters/RelottingEntrySummary`);
  };
 
  return (
    <Fragment>
       <Card>
        <CardHeader>
          <CardTitle>Relotting Entry</CardTitle>
        </CardHeader>
        <CardBody>
          <TableComponent columns={columns} url={RelottingUrl} formType={formTypes} />
        </CardBody>
      </Card>
    
    </Fragment>
    
  );
};
const RelottingEntry = ({formTypes}) => {
  const { showLoader, hideLoader } = useLoader();
  const dateFormat = "YYYY-MM-DD";
  const today = moment().format(dateFormat);
  const isToday = (date) => {
    return moment(date).format(dateFormat) == today;
  };
  console.log(formTypes);
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
       
          <RelottView form={form} formTypes={formTypes} onSubmit={onSubmit} />
       
      </Fragment>
    );
  };
  export default RelottingEntry;
  