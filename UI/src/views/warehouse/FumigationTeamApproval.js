import React, { Fragment, useState, useEffect } from 'react'
import { Col ,FormGroup, Label,Button, ButtonToggle } from 'reactstrap'
import Select from "react-select";
import Row from 'reactstrap/lib/Row'
import { apiBaseUrl, vaUrl ,BagcuttingUrl } from '../../urlConstants'
import { CustomDropdownInput, CustomTextInput } from '../forms/custom-form'
import { DatePicker } from "../forms/custom-datetime"; 
import { useFormik } from "formik";
import { validation, Yup } from "../forms/custom-form";
import Table from 'reactstrap/lib/Table';
import { useHistory, useParams } from 'react-router-dom';
import { useLoader } from '../../utility/hooks/useLoader';
import { apiPostMethod } from '../../helper/axiosHelper';
import { JsonWebTokenError } from 'jsonwebtoken';
import { errorToast } from '../../helper/appHelper';
import { isObject, set, upperCase } from 'lodash';
import { CardComponent } from "../common/CardComponent";
import moment from 'moment';
import { ShowToast } from "../../helper/appHelper";
import { object } from 'prop-types';
import { event } from 'jquery';
import Input from 'reactstrap/lib/Input';
import ButtonToolbar from 'reactstrap/lib/ButtonToolbar';
import { ToggleLeft } from 'react-feather';
import NavbarToggler from 'reactstrap/lib/NavbarToggler';
//import warehousebagcuttingentrylist from './bagcuttingapprovalscreen';
import confirmDialog from "../../@core/components/confirm/confirmDialog";
import TableComponent from '../common/TableComponent';
// import InputTable from './plan/InputTable';
// import { Modal } from 'react-responsive-modal';
// import TableData from './plan/TableData';

const FumigationTeamApproval = ({})  => { 
  const history = useHistory();

  const taColumns = [
    {
      name: "ID",
      selector: "FumigationId",
      sortable: true,
      minWidth: "100px",
      wrap: true,
    },
    {
      name: "Warehouse Name",
      selector: "WH_NAME",
      sortable: true,
      minWidth: "200px",
      wrap: true,
    },
    {
      name: "Plant Code",
      selector: "werks",
      sortable: true,
      minWidth: "100px",
      wrap: true,
    },
    {
      name: "Lot No",
      selector: "lotno",
      sortable: true,
      minWidth: "100px",
      wrap: true,
    },
    {
      name: "Fumigation Type",
      selector: "Fumigation_Type",
      sortable: true,
      minWidth: "80px",
      wrap: true,
    },
    {
      name: "Stock in MTS",
      selector: "Stock_MTS",
      sortable: true,
      minWidth: "80px",
      wrap: true,
    },
    
    {
      name: "Rate",
      selector: "Rate",
      sortable: true,
      minWidth: "80px",
      wrap: true,
    },
    {
      name: "Area",
      selector: "Area",
      sortable: true,
      minWidth: "80px",
      wrap: true,
    },
    {
      name: "MBR Can",
      selector: "MBRCan",
      sortable: true,
      minWidth: "80px",
      wrap: true,
    },
    {
      name: "Non Tax Amount",
      selector: "WithoutTaxAmount",
      sortable: true,
      minWidth: "80px",
      wrap: true,
    },
    {
      name: "Gst",
      selector: "Gst",
      sortable: true,
      minWidth: "80px",
      wrap: true,
    },
    {
      name: "Total Amount",
      selector: "Amount",
      sortable: true,
      minWidth: "80px",
      wrap: true,
    },
    {
      name: "Created_At",
      selector: "created_at",
      sortable: true,
      minWidth: "150px",
      wrap: true,
    },
  ];

    const actionsCol2 = {
      name: "Action",
      selector: "status",
      minWidth: "200px",
      cell: (row) => {
        return  (
          ActionColumn(row.warehouseid)
        );
      },
    };

    const columns = [...taColumns];


    let { id } = useParams();
    let refid='';
    let fdata='';
    if(id) {
       refid = id.replace(":", "");
    }
    let { showLoader, hideLoader } = useLoader(); 
    
    useEffect(() => { 
      getSublotlist();
    }, [id]);

    const form = useFormik({
      isInitialValid: false,
      initialValues: {},
      validationSchema: Yup.object().shape({}),
      onSubmit(values) { },
    });
  
    const onTextChange = (e, PKey, CheckList, Val, index) => {
      for (let i = 0; i < CheckList.length; i++) {
        if (Val == "chkSelect") {
          if (i === index) {
            CheckList[i].chkSelect = e.target.checked;
            
            // }else{
            //   CheckList[i].chkSelect = false;
          }
        }
      }
      console.log(CheckList);
      //form.setValues({...form.values,CheckList});
    }

    
    const getSublotlist = () => {
      let Data=form.values;
      let fdata = {
        warehouseid: refid,

      };

    showLoader();
      // console.log("Request Url :: "+apiBaseUrl + "warehouse/getbagcuttingEntrydatabyid", fdata);
    //  apiPostMethod(apiBaseUrl + "warehouse/Fumigation/getSublotApprovallist", fdata)
    apiPostMethod(apiBaseUrl + "warehouse/Fumigation/Fumigation_Approval_View", fdata)
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
    console.log("Request url :: "+apiBaseUrl + "Master/")
   
  
  
const ActionEntry = (warehouseid) => {

    history.push("/FUMIGATIONAPPROVAL:"+warehouseid); 
}

  const ActionColumn=(warehouseid)=>{
        return (
          <Button color="primary" type="Button" onClick={(e) => {ActionEntry(warehouseid)}}>View</Button>
        )
  }

  const [SelectedList, setSelectedList] = useState();

  const onSelectedRowsChange = (selectedRowState) => {
    console.log("HAUI");
    console.log(selectedRowState);
    setSelectedList(selectedRowState.selectedRows);
    // for (i=0;i<=selectedRowState.selectedRows.length;i++){
    //   if form.values.CheckList[i].
    // }

  }

  // const selectableRowDisabled = (row) => {
  //   // console.log("SUPER");
  //   // console.log(row);
  //   return !(row.ApprovalEnableFlag === "1" && row.status === "2");
  // }
  const [SelectedData, setSelectedData] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const getSelectedRows = (CheckList,actionPerform) => {

    let selectedItem = [];
    console.log("New DATA 001 => ", JSON.stringify(CheckList));

    for (let i = 0; i < CheckList.length; i++) {
      if (CheckList[i].chkSelect === true) {
        selectedItem.push(CheckList[i].warehouseid);
      }
    }
    console.log(selectedItem)
    PlantLoading(selectedItem)
  }
 
  const PlantLoading = (selectedItem) => {
  
    //  selectedItem.forEach((row, idx) => {
        const postdata = {
            warehouseid: selectedItem.toString(),
        }
        
        apiPostMethod(apiBaseUrl + "warehouse/Fumigation/getWarehouseWiseDataget", postdata)
            .then((response) => {
                const { results } = response.data;//Plant list
                console.log(results)  
            })
            .catch((error) => {
                console.log(" Error Data ::: " + JSON.stringify(error));
                errorToast("Something went wrong, please try again after sometime...");

            })
            .finally((a) => {
                hideLoader();
            }); 
    // });
};
  return ( 
    <Fragment>
      <CardComponent  header="Fumigation WareHouse Wise">
        <Row>
          <Col>
            <TableComponent hideSearch showDownload columns={columns} data={form.values.CheckList}/>  
          </Col>
        </Row>  
      </CardComponent>
    </Fragment>
    );
}; 


export default FumigationTeamApproval 
