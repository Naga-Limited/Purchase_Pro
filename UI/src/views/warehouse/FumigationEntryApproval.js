import React, { Fragment, useState, useEffect } from 'react'
import { Col ,FormGroup, Label,Button, ButtonToggle } from 'reactstrap'
import Row from 'reactstrap/lib/Row'
import { apiBaseUrl, vaUrl ,BagcuttingUrl } from '../../urlConstants'
import { useFormik } from "formik";
import { CustomDropdownInput, validation, Yup } from "../forms/custom-form";
import { useHistory, useParams } from 'react-router-dom';
import { useLoader } from '../../utility/hooks/useLoader';
import { apiPostMethod } from '../../helper/axiosHelper';
import { errorToast } from '../../helper/appHelper';
import { CardComponent } from "../common/CardComponent";
import { ShowToast } from "../../helper/appHelper";
import confirmDialog from "../../@core/components/confirm/confirmDialog";
import TableComponent from '../common/TableComponent';
import { DatePicker } from '../forms/custom-datetime';
import { RefreshBlock } from '../common/RefreshBlock';

const FumigationEntryList = ({})  => { 
  const history = useHistory();

  const taColumns = [
    {
      name: "Select",
      selector: "",
      sortable: true,
      minWidth: "100px",
      hideInExcel: true,
      cell: (row, index) => {
        return (
          <div style={{/*backgroundColor:"#f47373",color:"#FFFFFF", width:"100%", height:"100%",*/ textAlign: "left" }}>
              <>
                  <input /*style={{fontSize:"12px",height:"30px",marginBottom:"10px"}}*/
                    type="checkbox" id={`LINE_ITEM_${index}`}
                    form={form} name={row.Status_String}
                  onChange={(e) => onTextChange(e, row.warehouseid, form.values.CheckList,"LINE_ITEM",index)} 
                  />
                
                &nbsp;&nbsp;{row.Status_String}
              </>
            
            {row.Status_String}
  
          </div>
  
        );
      },
    },
    {
      name: "Warehouse Name",
      selector: "WH_NAME",
      sortable: true,
      minWidth: "200px",
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
      name: "Total Stock in MTS",
      selector: "TotalStock",
      sortable: true,
      minWidth: "80px",
      wrap: true,
    },
    
    {
      name: "Total Rate",
      selector: "TotalRate",
      sortable: true,
      minWidth: "80px",
      wrap: true,
    },
    {
      name: "Total Area",
      selector: "TotalArea",
      sortable: true,
      minWidth: "80px",
      wrap: true,
    },
    {
      name: "Total MBR Can",
      selector: "TotalMBRCan",
      sortable: true,
      minWidth: "80px",
      wrap: true,
    },
    {
      name: "Non Tax Amount",
      selector: "TotalWithoutTaxAmount",
      sortable: true,
      minWidth: "80px",
      wrap: true,
    },
    {
      name: "Total Gst",
      selector: "TotalGst",
      sortable: true,
      minWidth: "100px",
      wrap: true,
    },
    {
      name: "Total Amount",
      selector: "TotalAmount",
      sortable: true,
      minWidth: "100px",
      wrap: true,
    },
    {
      name: "Vendor Name",
      selector: "Name",
      sortable: true,
      minWidth: "150px",
      wrap: true,
    },
    {
      name: "Lot Count",
      selector: "count",
      sortable: true,
      minWidth: "40px",
      wrap: true,
    },
  ];

    const actionsCol2 = {
      name: "Action",
      selector: "status",
      minWidth: "100px",
      cell: (row) => {
        return  (
          ActionColumn(row.warehouseid,row.Status,row.Code)
        );
      },
    };

    const columns = [...taColumns, actionsCol2];
    const [warehouseoption, setWarehouseoption] = useState([]);  


    let { id } = useParams();
    let refid='';
    let fdata='';
    if(id) {
       refid = id.replace(":", "");
    }
    let { showLoader, hideLoader } = useLoader(); 
    
    // useEffect(() => { 
    //   getSublotlist();
    // }, [id]);

    const form = useFormik({
      isInitialValid: false,
      initialValues: {},
      validationSchema: Yup.object().shape({}),
      onSubmit(values) { },
    });
  
    const onTextChange = (e, PKey, CheckList, Val, index) => {

      for (let i = 0; i < CheckList.length; i++) {
        if (Val == "LINE_ITEM") {
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
    const [FromDate, setFromDate] = useState('');
    const [ToDate, setToDate] = useState('');

    const getSublotlist = () => {
      let fdata = {
      Screen:"FUMIGATIONENTRYLIST",
      fromdate:form.values.FromDate,
      todate:form.values.ToDate,
      Vendor_Name:form.values.Vendor_Name?.value
      };

    showLoader();
      // console.log("Request Url :: "+apiBaseUrl + "warehouse/getbagcuttingEntrydatabyid", fdata);
     apiPostMethod(apiBaseUrl + "warehouse/Fumigation/getSublotApprovallist", fdata)
     .then((response) => {
       const { data } = response;
       console.log("Response Data :: "+JSON.stringify(response));

       console.log("Data :: ", data);
       let tableData = []
       tableData = data.results
      setFromDate(data.from_date)
      setToDate(data.to_date)

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
   
  
  
const ActionEntry = (warehouseid,Fumigation_Type,Code) => {

    history.push("/FUMIGATIONAPPROVAL:"+warehouseid +','+Fumigation_Type+','+Code+','+FromDate+','+ToDate); 
}

  const ActionColumn=(warehouseid,Fumigation_Type,Code)=>{
        return (
          <Button color="primary" type="Button" onClick={(e) => {ActionEntry(warehouseid,Fumigation_Type,Code)}}>View</Button>
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

  const getSelectedRows = (CheckList,actionPerform,index) => {

    let selectedItem = [];
    let HireExpense = {}
    let data = [];
    let WH_NAME = [];
    let Fumigation_Types = [];
    let TotalAmount = [];
    let TotalWithoutTaxAmount = [];
    let TotalGst = [];

    
    console.log("New DATA 001 => ", JSON.stringify(CheckList));

    let filteredData = CheckList.filter((filter) => (filter.chkSelect != '' ))

    let count = 0

    for (let i = 0; i < filteredData.length; i++) {
      console.log(filteredData[i],'filteredData')
      if (filteredData[i].chkSelect === true) {
        count += 1
        selectedItem.push(filteredData[i].warehouseid);
        // data.push(CheckList[i]);
        WH_NAME.push(filteredData[i].WH_NAME +'-'+filteredData[i].Fumigation_Type);
        Fumigation_Types.push(filteredData[i].Status);
        TotalAmount.push(filteredData[i].TotalAmount);
        TotalWithoutTaxAmount.push(filteredData[i].TotalWithoutTaxAmount);
        TotalGst.push(filteredData[i].TotalGst);

        data.push({
              LINE_ITEM : count,
              Fumigation_Type: filteredData[i].Fumigation_Type,
              SAPStatus_Flag: filteredData[i].SAPStatus_Flag,
              Status: filteredData[i].Status,
              TotalAmount: filteredData[i].TotalAmount,
              TotalArea: filteredData[i].TotalArea,
              TotalGst: filteredData[i].TotalGst,
              TotalMBRCan: filteredData[i].TotalMBRCan,
              TotalRate: filteredData[i].TotalRate,
              TotalStock: filteredData[i].TotalStock,
              TotalWithoutTaxAmount: filteredData[i].TotalWithoutTaxAmount,
              WH_CODE: filteredData[i].WH_CODE,
              WH_NAME: filteredData[i].WH_NAME,
              warehouseid: filteredData[i].warehouseid,
              VENDOR_CODE: filteredData[i].Code,
              VENDOR_NAME: filteredData[i].Name,
            })
        
      }           
    }

    console.log(data)
    PlantLoading(selectedItem,data,WH_NAME,Fumigation_Types,TotalAmount,TotalWithoutTaxAmount,TotalGst)
  }
 
  const PlantLoading = (selectedItem,data,WH_NAME,Fumigation_Types,TotalAmount,TotalWithoutTaxAmount,TotalGst) => {
  
    //  selectedItem.forEach((row, idx) => {
    var sum= 0;
    var sum1= 0;
    var sum2= 0;

    (TotalAmount).forEach(subData => sum += Number(subData));
    (TotalWithoutTaxAmount).forEach(subData1 => sum1 += Number(subData1));
    (TotalGst).forEach(subData2 => sum2 += Number(subData2));

        const postdata = {
            warehouseid: selectedItem.toString(),
            WH_NAME: WH_NAME.toString(),
            data: data,
            Fumigation_Type:Fumigation_Types.toString(),
            total_amount:sum.toFixed(2),
            non_tax_amount:sum1.toFixed(2),
            gst:sum2.toFixed(2),

        }
        if(postdata.total_amount == 0){
          errorToast("Please Select the line item ..."); 
          return false
        }


        let msg='<b>' + 'WH Name : ' +'</b>'+ WH_NAME.toString() + '<br />'+'<b>' + "Amount : " +'</b>' + sum1.toFixed(2)+ '<br />'+'<b>' + "Total Gst : " +'</b>' + sum2.toFixed(2)+ '<br />'+'<b>' + "Total Amount : " +'</b>' + sum.toFixed(2)
       confirmDialog({
        title: "Are you sure want to Create PR?",
        // description: msg,
        html_data : msg 
      }).then((res) => {
        if (res) {
        apiPostMethod(apiBaseUrl + "warehouse/Fumigation/getWarehouseWiseDataget", postdata)
            .then((response) => {
                const { results } = response.data;
                ShowToast("Successfully Created...");
                window.setTimeout( function() {
                  window.location.reload();
                }, 2000);
            })
            .catch((error) => {
                console.log(" Error Data ::: " + JSON.stringify(error));
                errorToast("Something went wrong, please try again after sometime...");

            })
            .finally((a) => {
                hideLoader();
            }); 
        }});
};

 //Modal pop up window 
 const [open, openModal] = useState(false)
 const onOpenModal = () => {
   openModal(!open)
 };
 const onCloseModal = () => {
   openModal(!open)
 };

  return ( 
    <Fragment>
    <RefreshBlock/>
     {/* <div style={{ border: "2px solid #7367f0 ", padding: "2px", borderRadius: "6px", marginTop: "1px" }}> */}
     <CardComponent  header="Fumigation PR Creation">
     <Row>
           <Col md="3" sm="12">
             <DatePicker label={"From Date"} form={form} id="FromDate" type="date"  />
          </Col>
          <Col md="3" sm="12">
             <DatePicker label={"To Date"} form={form} id="ToDate" type="date"  />
          </Col>
          <Col md="3" sm="12" >
            <CustomDropdownInput  
                url={`${apiBaseUrl}warehouse/master/getFumigationVendor`} 
                label={"Vendor Name"}  
                form={form} 
                id={"Vendor_Name"}
                options ={warehouseoption}   
              />
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
      <Row>
        <Col>
          <TableComponent 
          showDownload columns={columns} data={form.values.CheckList}/>  
        </Col>
      </Row>
      <Row>
          <Col md="3" sm="12">
            <Button.Ripple color="primary waves-effect" onClick={() => getSelectedRows(form.values.CheckList, "EDIT",0) /*handleShowModal(form.setValues({...form.values,CheckList}))*/}>
              Approve
            </Button.Ripple>
            &nbsp; &nbsp; &nbsp; &nbsp;
          </Col>
      </Row>
     </CardComponent>
    </Fragment>
    );
}; 


export default FumigationEntryList 
