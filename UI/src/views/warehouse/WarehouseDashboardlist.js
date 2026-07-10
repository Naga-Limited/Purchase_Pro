import { Card, CardHeader, CardTitle, CardBody, Button } from "reactstrap";
import React,{useState} from "react";
import { Col ,  Label } from 'reactstrap'
import { useHistory } from "react-router-dom";
import TableComponent from "../common/TableComponent";
import Row from 'reactstrap/lib/Row'
import Badge from "reactstrap/lib/Badge";
import { useLoader } from '../../utility/hooks/useLoader';
import { apiPostMethod } from '../../helper/axiosHelper';
import { validation, Yup } from "../forms/custom-form";
import { errorToast } from '../../helper/appHelper';
import { ShowToast } from "../../helper/appHelper";
import confirmDialog from "../../@core/components/confirm/confirmDialog";
import { Modal } from 'react-responsive-modal';
import { useFormik } from "formik";
import { DatePicker } from "../forms/custom-datetime";
import { apiBaseUrl } from '../../urlConstants'
import { CustomDropdownInput, CustomTextInput } from '../forms/custom-form'
import 'react-responsive-modal/styles.css';

export const taColumns = [
  {
    name: "Warehouse Name",
    selector: "WH_NAME",
    sortable: true,
    minWidth: "200px",
  },
  {
    name: "District",
    selector: "district",
    sortable: true,
    minWidth: "200px",
  },
  {
    name: "Contract Start",
    selector: "Cstartdate",
    sortable: true,
    minWidth: "200px",
    
  },
  {
    name: "Contract End",
    selector: "Cenddate",
    sortable: true,
    minWidth: "200px",
  },
  {
    name: "Insurance Start",
    selector: "ins_start_date",
    sortable: true,
    minWidth: "200px",
  },
  {
    name: "Insurance End",
    selector: "ins_end_date",
    sortable: true,
    minWidth: "200px",
    
  },
  {
    name: "Stamping 1 Start",
    selector: "wb1_stamp_start_date",
    sortable: true,
    minWidth: "200px",
  },
  {
    name: "Stamping_1_End",
    selector: "wb1_stamp_expiry_date",
    sortable: true,
    minWidth: "200px",
  },
  {
    name: "Stamping_2_Start",
    selector: "wb2_stamp_start_date",
    sortable: true,
    minWidth: "200px",
    
  },
  {
    name: "Stamping_2_End",
    selector: "wb2_stamp_expiry_date",
    sortable: true,
    minWidth: "200px",
  },
  {
    name: "Contract Elapse Days",
    selector: "ContractElapseDays",
    sortable: true,
    minWidth: "200px",
  },
  {
    name: "Insurance Elapse Days",
    selector: "InsuranceElapseDays",
    sortable: true,
    minWidth: "200px",
    
  },
  {
    name: "Warehouse Status",
    selector: "approval_statusName",
    sortable: true,
    minWidth: "200px",
    
  },
  {
    name: "Contract Status",
    selector: "contract_status",
    sortable: true,
    minWidth: "200px",
    
  },
  
 
//   {
//     name: "WM Action",             WM Action
//     selector: "WM Action_id",
//     sortable: true,
//     minWidth: "150px",
    
//   },
//   {
//     name: "Quality Action",          Quality Action
//     selector: "Quality Action_id",
//     sortable: true,
//     minWidth: "150px",
    
//   },
//   {
//     name: "Commercial_Action",           Commercial_Action
//     selector: "Commercial_Action_id",
//     sortable: true,
//     minWidth: "150px",
    
//   },
//   {                                             Button
//     name: "Button",
//     selector: "Button_id",
//     sortable: true,
//     minWidth: "150px",
    
//   },                                           Renew/Vacate
//   {
//     name: "Renew/Vacate",
//     selector: "Renew/Vacate_id",
//     sortable: true,
//     minWidth: "150px",
    
//   },
];


const WarehouseDashboardlist = ({ title, url, actionRendorer,postData, ...rest }) => {
  const history = useHistory();
  const [showModal, setShowModal] = useState(false);
  
  let { showLoader, hideLoader } = useLoader(); 
  const handleShowModal =(WarehouseId)=>{
    //  console.log(showModal);
    form.setValues({VacatewareHouseId:WarehouseId})
      setShowModal(true);
    //  console.log(showModal);
  }
  
  const actionsCol = {
    name: "WM Action",
    selector: "status",
    minWidth: "200px",
    cell: (row) => {
      return  (
        <Button.Ripple
            color="primary"
            onClick={(e) => {
              history.push(`/WMView:${row.WH_REFID}/${"warehouse/WarehouseDashBoard"}`);
            }}
          >
            {"View"}
          </Button.Ripple>
      );
    },
  };

  const qualityCol = {
    name: "Quality Action",
    selector: "status",
    minWidth: "200px",
    cell: (row) => {
      return  (
        <Button.Ripple
            color="primary"
            onClick={(e) => {
              history.push(`/WHQCView:${row.WH_REFID}/${"warehouse/WarehouseDashBoard"}`);
            }}
          >
            {"View"}
          </Button.Ripple>
      );
    },
  };

  const CommericalCol = {
    name: " Commercial Action",
    selector: "status",
    minWidth: "200px",
    cell: (row) => {
      return (
        <Button.Ripple
        color="primary"
        onClick={(e) => {
          history.push(`/ViewWMComm:${row.WH_REFID}/${"warehouse/WarehouseDashBoard"}`);
        }}
      >
        {"View"}
      </Button.Ripple>
      );
    },
  };

  const ButtonslCol = {
    name: "Button",
    selector: "status",
    minWidth: "200px",
    cell: (row) => {
      return  (
        <Button.Ripple
            color="primary"
            onClick={(e) => {
              history.push(`/AllView:${row.WH_REFID}/${"warehouse/WarehouseDashBoard"}`);
            }}
          >
            {"View"}
          </Button.Ripple>
      );
    },
  };

  const  RenewCol = {
    name: "Vacate",
    selector: "status",
    minWidth: "400px",
    cell: (row) => {
      return (
        <>
          {row.RenewBtn === 1 &&
            <Button.Ripple color="primary" onClick={(e) => {history.push(`/warehouse/masters/WareHouseRenew:${row.WH_REFID}`);}}>
                {"Renew"}
            </Button.Ripple>
          }

          &nbsp;

          {row.VacateBtn === 1 && (row.approval_status == 11 ? row.VEDate+" - " + row.Reason:
            <Button.Ripple color="primary" onClick={() => handleShowModal(row.WH_REFID)}>
              {"Vacate"}
            </Button.Ripple>)
          }
          

          {/* {row.approval_status == 11 ? row.VEDate+" - " + row.Reason :
            <Button.Ripple color="primary" onClick={() => handleShowModal(row.WH_REFID)}>
              {"Vacate"}
            </Button.Ripple>}
              &nbsp;
            <Button.Ripple color="primary" onClick={(e) => {history.push(`/warehouse/masters/WareHouseRenew:${row.wh_refid}`);}}>
              {"Renew"}
            </Button.Ripple> */}
      </>
      );
    },
  };

  const columns = [...taColumns, actionsCol,qualityCol,CommericalCol,ButtonslCol,RenewCol];
  const onActionClick = () => {

    let id=form.values.VacatewareHouseId;
    //console.log(id);
    //return false;
    const FrmData = { 
      approval_status:'11',
      VacateEndDate:form.values.VacateEndDate,
      Reason:form.values.Reason
    };
    let fdata={id,Data:FrmData};
      showLoader();
          
      apiPostMethod(apiBaseUrl + "warehouse/master/updatewarehouse", fdata)
      .then((response) => {
        if (response.data.success) {
          ShowToast("Successfully updated...");
          history.push("/warehouse/WarehouseDashBoard");
          window.location.reload();
        }
      })
      .catch((error) => {
        errorToast("Something went wrong, please try again after sometime");
      }).finally((a) => {
        hideLoader();
      });
   
  };
  const form = useFormik({
    isInitialValid: false,
    initialValues: {},
    validationSchema: Yup.object().shape({


     }),
    onSubmit(values) {},
  });
  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardBody>
          <TableComponent columns={columns} postData={postData} url={url} formType="getWarehouseList" {...rest}/>
        </CardBody>
      </Card>

      <Modal open={showModal} onClose={()=>setShowModal(false)}>
        <Row >
          <Col md="12" sm="12" >
            <DatePicker form={form} id="VacateEndDate" showFutureDate={true} isDateRange={false} label={"Vacate End Date"} />
          </Col>
        </Row>
        <Row >
          <Col md="12" sm="12" >
            <CustomTextInput   label={"Reason"} form={form} id="Reason" type="text" />
          </Col>
        </Row>
      <Row>
        <Col md="12" sm="12">
          <Button.Ripple color="primary" type="button" onClick={(e) => {
            let msg = "Please confirm for vacate";
            confirmDialog({title: "Are you sure?",
                        //description: msg,
                          }).then((res) => {
                            if (res) {
                              onActionClick()
                            }
                          });
          }}>Save</Button.Ripple>
        </Col>
      </Row>
    </Modal>
  </div>
  );
};
export default WarehouseDashboardlist;