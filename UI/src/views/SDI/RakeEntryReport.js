import React, { Fragment, useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardBody, Button, Label, FormGroup, Input, InputGroup, InputGroupText } from "reactstrap";
import { useFormik } from "formik";
import { validation, Yup } from "../forms/custom-form";
import { useHistory, useParams } from "react-router";
import { apiBaseUrl, BASE_URL } from "../../urlConstants";
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
import { HrLine } from "../common/HrLine";
import Select from "react-select";

const RakeEntryReportyForm = ({ form,onSubmit }) => {

	 const taColumns = [
		{
		  name: "ID",
		  selector: "id",
		  sortable: true,
		  minWidth: "20px",
		},
    {
		  name: "VA NO",
		  selector: "ZVA_NUMBER",
		  sortable: true,
		  minWidth: "200px",
		},
    {
      name: "FNR NO",
      selector: "fnr_no",
      sortable: true,
      minWidth: "150px",
    },
    {
		  name: "VEHICLE NO",
		  selector: "vehicle_no",
		  sortable: true,
		  minWidth: "150px",
		},
    
    {
		  name: "MIGO NUMBER",
		  selector: "MIGO_NUM",
		  sortable: true,
		  minWidth: "200px",
		},
		{
		  name: "TRIPSHEET NO",
		  selector: "tripsheet_no",
		  sortable: true,
		  minWidth: "150px",
		},
		{
		  name: "DRIVER NO",
		  selector: "driver_no",
		  sortable: true,
		  minWidth: "120px",
		},
		{
      name: "PO NUMBER",
      selector: "po_number",
      sortable: true,
      minWidth: "150px",
    },
    {
      name: "PO LINE ITEM",
      selector: "po_line_item",
      sortable: true,
      minWidth: "50px",
    },
    {
      name: "SUPPLIER NAME",
      selector: "supplier_name",
      sortable: true,
      minWidth: "250px",
    },
    {
      name: "BROKER NAME",
      selector: "brocker_name",
      sortable: true,
      minWidth: "250px",
    },
    {
      name: "WHEAT VARIETY",
      selector: "wheat_variety",
      sortable: true,
      minWidth: "250px",
    },
    {
      name: "PLANT NAME",
      selector: "PLANT_NAME",
      sortable: true,
      minWidth: "100px",
    },
    {
      name: "STORAGE LOCATION",
      selector: "STORAGE_LOCATION",
      sortable: true,
      minWidth: "100px",
    },
    {
      name: "Loading Vendor Name",
      selector: "Name",
      sortable: true,
      minWidth: "250px",
    },
    {
      name: "Load Charges",
      selector: "loading_charge",
      sortable: true,
      minWidth: "50px",
    }, 
    {
      name: "Unloading Vendor Name",
      selector: "UnloadVendorName",
      sortable: true,
      minWidth: "250px",
    },
    {
      name: "UnLoad Charges",
      selector: "UnloadVendorCharge",
      sortable: true,
      minWidth: "50px",
    },
    {
      name: "Receive Bag1",
      selector: "BAG_NAME",
      sortable: true,
      minWidth: "250px",
    },
    {
      name: "Receive Bag2",
      selector: "BAG_NAME2",
      sortable: true,
      minWidth: "250px",
    },
    {
      name: "Receive Bag3",
      selector: "BAG_NAME3",
      sortable: true,
      minWidth: "250px",
    },
    {
      name: "No of Bag1",
      selector: "no_bags1",
      sortable: true,
      minWidth: "50px",
    },
    {
      name: "No of Bag2",
      selector: "no_bags2",
      sortable: true,
      minWidth: "50px",
    },
    {
      name: "No of Bag3",
      selector: "no_bags3",
      sortable: true,
      minWidth: "50px",
    },{
      name: "Machine_type1",
      selector: "machine_type1",
      sortable: true,
      minWidth: "150px",
    },{
      name: "Machine_type2",
      selector: "machine_type2",
      sortable: true,
      minWidth: "150px",
    },{
      name: "Machine_type3",
      selector: "machine_type3",
      sortable: true,
      minWidth: "150px",
    },
    {
      name: "Gunny Weight 1",
      selector: "gunny_wt1",
      sortable: true,
      minWidth: "50px",
    },
    {
      name: "Gunny Weight 2",
      selector: "gunny_wt2",
      sortable: true,
      minWidth: "50px",
    },
    {
      name: "Gunny Weight 3",
      selector: "gunny_wt3",
      sortable: true,
      minWidth: "50px",
    },
    {
      name: "Total Bags",
      selector: "total_bags",
      sortable: true,
      minWidth: "50px",
    },
    {
      name: "Total Gunny Weight",
      selector: "total_gunny_wt",
      sortable: true,
      minWidth: "50px",
    },
    {
      name: "Created",
      selector: "Formattedcreated_at",
      sortable: true,
      minWidth: "200px",
    },
    {
      name: "Created By",
      selector: "Createdby",
      sortable: true,
      minWidth: "200px",
    },{
      name: "Gate In By",
      selector: "GateInByName",
      sortable: true,
      minWidth: "100px",
    },{
      name: "Gate In Time & Date",
      selector: "FormattedGateInDt",
      sortable: true,
      minWidth: "200px",
    },{
      name: "FirstWeight ",
      selector: "FirstWeight",
      sortable: true,
      minWidth: "100px",
    },{
      name: "FirstWeight Time & Date",
      selector: "FormattedFirstWeightEntryDt",
      sortable: true,
      minWidth: "200px",
    },{
      name: "FirstWeight By",
      selector: "FirstWeightEntryByName",
      sortable: true,
      minWidth: "100px",
    },{
      name: "UnloadWH Submitted Time & Date",
      selector: "FormattedUnloadWHSubmitDt",
      sortable: true,
      minWidth: "200px",
    },{
      name: "UnloadWH Submitted By",
      selector: "UnloadWHSubmitByName",
      sortable: true,
      minWidth: "150px",
    },{
      name: "SecondWeight",
      selector: "SecondWeight",
      sortable: true,
      minWidth: "100px",
    },{
      name: "SecondWeight Time & Date",
      selector: "FormattedSecondWeightEntryDt",
      sortable: true,
      minWidth: "200px",
    },{
      name: "SecondWeight By",
      selector: "SecondWeightEntryByName",
      sortable: true,
      minWidth: "100px",
    },{
      name: "NetWeight",
      selector: "NetWeight",
      sortable: true,
      minWidth: "100px",
    },{
      name: "Gunny Weight",
      selector: "gunnyweight",
      sortable: true,
      minWidth: "100px",
    },{
      name: "Gunny Less Weight",
      selector: "gunnylessweight",
      sortable: true,
      minWidth: "100px",
    },{
      name: "Gate Out Time & Date",
      selector: "FormattedGateOutDt",
      sortable: true,
      minWidth: "200px",
    },{
      name: "Gate Out By",
      selector: "GateOutByName",
      sortable: true,
      minWidth: "100px",
    },
    {
      name: "Waiting At",
      selector: "status",
      sortable: true,
      minWidth: "150px",
      cell: (row) => {
        return  (
          <>
           {row.StatusName == '' &&
          <span className="badge rounded-pill bg-danger">
            Process Reject
          </span>}
          {row.StatusName == 'Completed' &&
          <span className="badge rounded-pill bg-success">
            {row.StatusName}
          </span>}
          {row.StatusName != 'Completed' &&
          <span className="badge rounded-pill bg-info">
            {row.StatusName}
          </span>}
          </>
        );
     },
    },
	  ];
	  const actionsCol = {
        name: "Action",
        selector: "print",
        sortable: true,
        minWidth: "200px",
        cell: (row) => {
          let tx="Edit";
          return  (
            <>
            <Button.Ripple color="primary"  onClick={() => print(row.id)} > 
              DC Print
            </Button.Ripple>&nbsp;
            {row?.FormattedGateOutDt &&
            <Button.Ripple color="primary"  onClick={() => print1(row.purchase_info_id)} > 
              Print
            </Button.Ripple>}
            
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
  const print = (RR_ID) => {
    window.open(`/public/#/RAKEDELIVERYSMARTFORM/${RR_ID}`)
  }
   const print1 = (id) => {
    window.open(BASE_URL + "/#/STOSDTSlip:" + id, "", "width=900,height=650")
  }
  let { showLoader, hideLoader } = useLoader();
 
  const getSublotlist = () => {
    let newDate = new Date()
    // let date = newDate.getDate()

    let Data={
      fromdate:form.values.FromDate,
      todate:form.values.ToDate,
      FNR_NO:FNR_NOS
    }
      let fdata = {
        Data,
       formType:"1,2,3"
      };
  

  showLoader();
    // console.log("Request Url :: "+apiBaseUrl + "warehouse/getbagcuttingEntrydatabyid", fdata);
   apiPostMethod(apiBaseUrl + "RakeloadingController/RakeEntryReport", fdata)
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
  const [FNRNofetch, setFNRNofetch] = useState([]);

  useEffect(() => {
      onFetchFNRNO()
  }, []);

  const onFetchFNRNO = () => {
    let fdata = {  };
    apiPostMethod(apiBaseUrl + "RakeloadingController/FNRNOOverAllList", fdata)
      .then((response) => {
        const { data } = response;
        if (data.success) {
            setFNRNofetch([{ options: data.results }]);
        }
      })
      // .catch((error) => {
      //   errorToast("Something went wrong, please try again after sometime");
      // });
  };
  const [formData, setFormaData] = useState({});
  const [FNR_NOS, setFNR_NO] = useState('')

  const onFNRChange = (e) => {
    const { value } = e;
    setFormaData({ ...formData, FNR_NO: value, });
    setFNR_NO(value)
  };


  const {FNR_NO } = formData;

  return (
    <Fragment>
       <Card>
        <CardBody>         
        <CardHeader>
          <CardTitle>Rake Entry Report </CardTitle>
        </CardHeader>
        <Row>
           <Col md="3" sm="12">
             <DatePicker label={"From Date"} form={form} id="FromDate" type="date"  />
          </Col>
          <Col md="3" sm="12">
             <DatePicker label={"To Date"} form={form} id="ToDate" type="date"  />
          </Col>
            <Col md="3" sm="12">
              <FormGroup>
                <Label>FNR Number</Label>
                <Select
                  className="react-select"
                  classNamePrefix="select"
                  options={FNRNofetch}
                  value={{ label: FNR_NO, value: FNR_NO }}
                  onChange={(e) => onFNRChange(e)}
                />
              </FormGroup>
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
        <br />
           <TableComponent showDownload columns={columns} data={form.values.CheckList} formType="Report" />
        </CardBody>
      </Card>
    </Fragment>
    
  );
};
const RakeEntryReport = () => {
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
       
          <RakeEntryReportyForm form={form}  onSubmit={onSubmit} />
       
      </Fragment>
    );
  };
  export default RakeEntryReport;
  
