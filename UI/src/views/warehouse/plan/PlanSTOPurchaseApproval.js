import React, { Fragment, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardBody, Button } from "reactstrap";
import { useFormik } from "formik";
import { validation, Yup } from "../../forms/custom-form";
import { useHistory, useParams } from "react-router";
import { apiBaseUrl } from "../../../urlConstants";
import { useLoader } from "../../../utility/hooks/useLoader";
import TableComponent from "../../common/TableComponent";
import { apiPostMethod } from "@helpers/axiosHelper";
import { errorToast, ShowToast } from "@helpers/appHelper";
import moment from "moment"; 

const EntrySummaryForm = ({ form,onSubmit }) => {

	 const taColumns = [
		{
		  name: "ID",
		  selector: "id",
		  sortable: true,
		  minWidth: "20px",
		},
    {
      name: "Plan Month",
      selector: "plan_month",
      sortable: true,
      minWidth: "150px",
    },
    {
      name: "From Warehouse",
      selector: "fromwarehouse",
      sortable: true,
      minWidth: "250px",
    },
    {
      name: "From Plant",
      selector: "fromplant",
      sortable: true,
      minWidth: "250px",
    },
    {
		  name: "Wheat Variety",
		  selector: "WheatVariety",
		  sortable: true,
		  minWidth: "300px",
		},
		{
		  name: "To Warehouse",
		  selector: "towarehouse",
		  sortable: true,
		  minWidth: "250px",
		},
		{
		  name: "To Plant",
		  selector: "toplantname",
		  sortable: true,
		  minWidth: "250px",
		},
		{
			name: "Moving Qty",
			selector: "moving_qty",
			sortable: true,
			minWidth: "30px",
		},
		{
			name: "Freight Cost",
			selector: "freight_cost",
			sortable: true,
			minWidth: "30px",
		},
		{
			name: "Load Cost",
			selector: "loading_cost",
			sortable: true,
			minWidth: "30px",
		},
		{
			name: "Unload Cost",
			selector: "unloading_cost",
			sortable: true,
			minWidth: "30px",
		}, 
		{
			name: "Created",
			selector: "created_at",
			sortable: true,
			minWidth: "200px",
		},
      
	  ];
	  const actionsCol = {
		name: "Actions",
		selector: "status",
		minWidth: "150px",
		cell: (row) => {
      let tx="Approval";
      if(row.RelotStatus==-1)
      {
        tx="Edit Request";
      }
		  return  (
        
			<Button.Ripple color="primary"  onClick={() => ViewRelot(row.id)} >
			  {tx}
			</Button.Ripple>


		  );
		},
	  };
	  const ViewRelot = (RelotId) => {
        history.push("PLANSTOQAAPPROVAL:" + RelotId);
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
          <CardTitle>Plan STO Purchase Approval</CardTitle>
        </CardHeader>
        <CardBody>
          <TableComponent columns={columns} url={`${apiBaseUrl}warehouse/STOPODeliveryPlan/PlanSTOPODataGet`} 
          formType="1" />
        </CardBody>
      </Card>
    
    </Fragment>
    
  );
};
const PlanSTOPurchaseApproval = () => {
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
   
    return (
      <Fragment>
       
          <EntrySummaryForm form={form}  onSubmit={onSubmit} />
       
      </Fragment>
    );
  };
  export default PlanSTOPurchaseApproval;
  