import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useLoader } from "../../../utility/hooks/useLoader";
import { useHistory, useParams } from 'react-router-dom';
import { Card, CardBody, CardHeader, CardTitle, FormGroup } from "reactstrap";
import { Button, Row, Col } from "reactstrap";
import { CustomDropdownInput, CustomTextInput } from "../../forms/custom-form";
import TableComponent from "../../common/TableComponent";
import { useFormik } from "formik";
import { RefreshBlock } from "../../common/RefreshBlock";
import { BASE_URL, apiBaseUrl } from "../../../urlConstants";
import { errorToast, ShowToast } from "../common/appHelper";
import { apiPostMethod } from "../../../helper/axiosHelper";
import { date } from "yup";

const filter_Id={
    
    VA_No:"",
    SendingPlant_id:"",
    SendingPlant:"",
    ReceivingPlant_id:"",
    ReceivingPlant:"",
    FromDt:"",
    ToDt:"",
    FromDt_id:"",
    ToDt_id:"",
    Truck_No_id:"",
    Truck_No:"",
    screenType:"IAS_REPORT",

}

const WhUnloadingReport = () => {
    let { showLoader, hideLoader } = useLoader();
    const [FilterData, setFilterData] = useState({ ...filter_Id });  
    
    const form = useFormik({
        initialErrors : false,
        initialValues: {},
        // validationSchema: getValidationSchema(dispatchDetails, isReceivingGateOut),
    });

    
        // let current = new Date();
        // let current_dt = `${current.getFullYear()}-${String(current.getMonth()+1).padStart(2, '0')}-${String(current.getDate()).padStart(2, '0')}`;
        // let current1 = new Date(current.setDate(current.getDate() -7))
        // let Pre_dt = `${current1.getFullYear()}-${String(current1.getMonth()+1).padStart(2, '0')}-${String(current1.getDate()).padStart(2, '0')}`;
    // const current = new Date();
    // const current_dt = `${current.getFullYear()}-${String(current.getMonth()+1).padStart(2, '0')}-${String(current.getDate()).padStart(2, '0')}`;
    // var result = current.setDate(current.getDate() -10);
    // new Date(current.setDate(current.getDate() -10))
    // const current1 = new Date(current.setDate(current.getDate() -9))
    // const Pre_dt = `${current1.getFullYear()}-${String(current1.getMonth()+1).padStart(2, '0')}-${String(current1.getDate()).padStart(2, '0')}`;
    // console.log(new Date(result))
    // console.log("CURRENT DT: ", current_dt);
    // console.log("PRE DT: ", Pre_dt);
    

    // let id=0;
    // useEffect(() => { 
        
    //     getReportDetails(FilterData);
    //   }, [FilterData]);


    const history = useHistory();
    let { id } = useParams();
    let refid='';
        if( id) {
       refid = id.replace(":", "");
    }
    // let { showLoader, hideLoader } = useLoader(); 
    

    useEffect(() => {
        onFetchRelotReportById();
    }, [id]);

    const onFetchRelotReportById = () => {
      //let Data=form.values;
      let fdata = {
        screenType:"IAS_REPORT",
      //Data
      };

    showLoader();
    //apiPostMethod(apiBaseUrl + "warehouse/Master/getReportDetails", fdata)
    apiPostMethod(apiBaseUrl + "warehouse/IASSending/getReportDetails", fdata)
     .then((response) => {
       const { data } = response;
       //console.log("Response Data :: "+JSON.stringify(response));
       console.log("RESULT 007 :", data.results);
       if (data.success) {
           form.setValues({
               ...form.values,
               CheckList: data.results,
               FromDate:data.results[0].start_Dt,
               ToDate:data.results[0].end_Dt

           })
       }else{
        errorToast("Data Not Found !!!");      
      }
     })
     .catch((error) => {
    //    errorToast("Something went wrong, please try again after sometime");
     })
     .finally((a) => {
       hideLoader();
     });
    };
  
    const taColumns = [
        {
            name: "VA No",
            selector: "ZVA_NUMBER",
            sortable: true,
            minWidth: "250px",
        },
        {
            name: "Vehicle No",
            selector: "TruckNo",
            sortable: true,
            minWidth: "150px",
        },
        {
            name: "Delivery No",
            selector: "DeliveryNo",
            sortable: true,
            minWidth: "150px",
        },
        {
            name: "Eway Bill No",
            selector: "EwayBillNo",
            sortable: true,
            minWidth: "150px",
        },
        {
            name: "Sending Plant",
            selector: "SendingPlant" ,
            sortable: true,
            minWidth: "150px",
        },
        {
            name: "Sending Storage Location",
            selector: "SendingStorageLocation" ,
            sortable: true,
            minWidth: "150px",
        },
        {
            name: "Sending Lot1",
            selector: "LoadedLotNo",
            sortable: true,
            minWidth: "150px",
        },
        {
            name: "Sending Wheatvariety1",
            selector: "WheatVariety",
            sortable: true,
            minWidth: "150px",
        },
        {
            name: "Sending Lot2",
            selector: "LoadedLotNo2" ,
            sortable: true,
            minWidth: "150px",
        },
        {
            name: "Sending Wheatvariety2",
            selector: "WheatVariety2",
            sortable: true,
            minWidth: "150px",
        },
        {
            name: "Sending Lot3",
            selector: "LoadedLotNo3" ,
            sortable: true,
            minWidth: "150px",
        },
        {
            name: "Sending Wheatvariety3",
            selector: "WheatVariety3",
            sortable: true,
            minWidth: "150px",
        },
        {
            name: "Sending Empty Weight",
            selector: "Send_WbEmptyWt",
            sortable: true,
            minWidth: "150px",
        },
        {
            name: "Sending Load Weight",
            selector: "Send_WbLoadWt" ,
            sortable: true,
            minWidth: "150px",
        },
        {
            name: "Sending Net Weight",
            selector: "Send_WbNetWt",
            sortable: true,
            minWidth: "150px",
        },
        {
            name: "Sending Gunny Weight",
            selector: "Send_GunnyWt",
            sortable: true,
            minWidth: "150px",
        },
        {
            name: "Sending Gunnyless Weight",
            selector: "Send_GunnyLessNetWt" ,
            sortable: true,
            minWidth: "150px",
        },
        {
            name: "Receiving Plant",
            selector: "ReceivingPlant",
            sortable: true,
            minWidth: "150px",
        },
        {
            name: "Receiving Storage Location",
            selector: "ReceivingStorageLocation" ,
            sortable: true,
            minWidth: "150px",
        },
        // {
        //     name: "Receiving Lot1",
        //     selector: "Lot1_Lot_No",
        //     sortable: true,
        //     minWidth: "150px",
        // },
        // {
        //     name: "Receiving Wheatvariety1",
        //     selector: "R_WheatVariety1",
        //     sortable: true,
        //     minWidth: "150px",
        // },
        // {
        //     name: "Receiving Lot2",
        //     selector: "Lot2_Lot_No",
        //     sortable: true,
        //     minWidth: "150px",
        // },
        // {
        //     name: "Receiving Wheatvariety2",
        //     selector: "R_WheatVariety2",
        //     sortable: true,
        //     minWidth: "150px",
        // },
        // {
        //     name: "Receiving Lot3",
        //     selector: "Lot3_Lot_No",
        //     sortable: true,
        //     minWidth: "150px",
        // },
        // {
        //     name: "Receiving Wheatvariety3",
        //     selector: "R_WheatVariety3",
        //     sortable: true,
        //     minWidth: "150px",
        // },
        {
            name: "Receiving Empty Weight",
            selector: "Rec_WbEmptyWt" ,
            sortable: true,
            minWidth: "150px",
        },
        {
            name: "Receiving Load Weight",
            selector: "Rec_WbLoadWt",
            sortable: true,
            minWidth: "150px",
        },
        {
            name: "Receiving Net Weight",
            selector: "Rec_WbNetWt",
            sortable: true,
            minWidth: "150px",
        },
        {
            name: "Receiving Gunny Weight",
            selector: "Rec_GunnyWt",
            sortable: true,
            minWidth: "150px",
        },
        {
            name: "Receiving Gunnyless Weight",
            selector: "Rec_GunnyLessNetWt",
            sortable: true,
            minWidth: "150px",
        },
        {
            name: "L1_BagTypes",
            selector: "L1_BagTypes",
            sortable: true,
            minWidth: "150px",
        }, {
            name: "L2_BagTypes",
            selector: "L2_BagTypes",
            sortable: true,
            minWidth: "150px",
        }, {
            name: "L3_BagTypes",
            selector: "L3_BagTypes",
            sortable: true,
            minWidth: "150px",
        }, {
            name: "L1_TotalBags",
            selector: "L1_TotalBags",
            sortable: true,
            minWidth: "150px",
        }, {
            name: "L2_TotalBags",
            selector: "L2_TotalBags",
            sortable: true,
            minWidth: "150px",
        }, {
            name: "L3_TotalBags",
            selector: "L3_TotalBags",
            sortable: true,
            minWidth: "150px",
        }, {
            name: "L1_MachineType1",
            selector: "L1_MachineType1",
            sortable: true,
            minWidth: "150px",
        }, {
            name: "L1_MachineType2",
            selector: "L1_MachineType2",
            sortable: true,
            minWidth: "150px",
        }, {
            name: "L1_MachineType3",
            selector: "L1_MachineType3",
            sortable: true,
            minWidth: "150px",
        }, {
            name: "L2_MachineType1",
            selector: "L2_MachineType1",
            sortable: true,
            minWidth: "150px",
        }, {
            name: "L2_MachineType2",
            selector: "L2_MachineType2",
            sortable: true,
            minWidth: "150px",
        },  {
            name: "L2_MachineType3",
            selector: "L2_MachineType3",
            sortable: true,
            minWidth: "150px",
        },  {
            name: "L3_MachineType1",
            selector: "L3_MachineType1",
            sortable: true,
            minWidth: "150px",
        },  {
            name: "L3_MachineType2",
            selector: "L3_MachineType2",
            sortable: true,
            minWidth: "150px",
        },  {
            name: "L3_MachineType3",
            selector: "L3_MachineType3",
            sortable: true,
            minWidth: "150px",
        }, 
        {
            name: "Unloading Lot No",
            selector: "UnloadedLotNo",
            sortable: true,
            minWidth: "150px",
        },
        {
            name: "Sending GateIn Time",
            selector: "GateInDt",
            sortable: true,
            minWidth: "150px",
        }, {
            name: "Sending GateIn By",
            selector: "SecGateInBy",
            sortable: true,
            minWidth: "150px",
        }, {
            name: "Sending Lot Updated Time",
            selector: "SECUpdateLotDt",
            sortable: true,
            minWidth: "150px",
        }, {
            name: "Lot Updated By",
            selector: "UpdateLotByName",
            sortable: true,
            minWidth: "150px",
        }, {
            name: "Sending FirstWeight Time",
            selector: "SECFirstWeightEntryDt",
            sortable: true,
            minWidth: "150px",
        }, {
            name: "Sending FirstWeight By",
            selector: "SecFirstWeightEntryByName",
            sortable: true,
            minWidth: "150px",
        },{
            name: "Sending SecondWeight By",
            selector: "SECSecondWeightEntryDt",
            sortable: true,
            minWidth: "150px",
        },{
            name: "Sending SecondWeight By",
            selector: "SecSecondWeightEntryByName",
            sortable: true,
            minWidth: "150px",
        },
        {
            name: "Sending GateOut Time",
            selector: "GATE_OUT_TM",
            sortable: true,
            minWidth: "150px",
        }, 
        {
            name: "Sending GateOut By",
            selector: "SecGateoutby",
            sortable: true,
            minWidth: "150px",
        }, 
        {
            name: "Loading Vendor",
            selector: "LoadingVendor",
            sortable: true,
            minWidth: "150px",
        },
         {
            name: "Loading ChargesPerTon",
            selector: "LoadingChargesPerTon",
            sortable: true,
            minWidth: "150px",
        },
        {
            name: "Receiving GateIn Time",
            selector: "RecGateInDt",
            sortable: true,
            minWidth: "150px",
        }, {
            name: "Receiving GateIn Time",
            selector: "RecGateInDt",
            sortable: true,
            minWidth: "150px",
        }, {
            name: "Receiving GateIn By",
            selector: "GateInByName",
            sortable: true,
            minWidth: "150px",
        }, {
            name: "Receiving QCCheck Time",
            selector: "RecQualityCheckSubmitDt",
            sortable: true,
            minWidth: "150px",
        },{
            name: "Receiving QCCheck By",
            selector: "QualityCheckSubmitByName",
            sortable: true,
            minWidth: "150px",
        },{
            name: "Receiving FirstWeight Time",
            selector: "RecFirstWeightEntryDt",
            sortable: true,
            minWidth: "150px",
        },{
            name: "Receiving FirstWeight By",
            selector: "FirstWeightEntryByName",
            sortable: true,
            minWidth: "150px",
        },{
            name: "Receiving SecondWeight Time",
            selector: "RecFirstWeightEntryDt",
            sortable: true,
            minWidth: "150px",
        },{
            name: "Receiving SecondWeight By",
            selector: "SecondWeightEntryByName",
            sortable: true,
            minWidth: "150px",
        },
        {
            name: "Receiving GateOut Time",
            selector: "RecGateOutDt",
            sortable: true,
            minWidth: "150px",
        },{
            name: "Receiving GateOut By",
            selector: "GateOutByName",
            sortable: true,
            minWidth: "150px",
        },
        {
            name: "UnLoading Vendor",
            selector: "UnLoadingVendor",
            sortable: true,
            minWidth: "150px",
        },
        {
            name: "Unloading ChargePerTon",
            selector: "UnloadingChargePerTon",
            sortable: true,
            minWidth: "150px",
        },
        // {
        //     name: "Action",
        //     selector: "",
        //     minWidth: "150px",
        //     cell: (row) => {
        //         return  (
        //           <Button.Ripple color="primary"  /*onClick={() => ViewRelot(row.RelotId)}*/ >
        //             {"Edit"}
        //           </Button.Ripple>
        //         );
        //     }
        // },
    ];

    

    // const getReportDetails = (FilterData)=>{
        const getReportDetails = ()=>{
        let Data={
            VA_No:form.values.VANumber ? form.values.VANumber:"",
            SendingPlant:form.values.SendingPlant ? form.values.SendingPlant.value:"",
            ReceivingPlant:form.values.ReceivingPlant ? form.values.ReceivingPlant.value:"",
            FromDate:form.values.FromDate ? form.values.FromDate:"",
            ToDate:form.values.ToDate ? form.values.ToDate:"",
            Truck_No:form.values.VehicleNo ? form.values.VehicleNo.value:"",
          };
        // let fdata = {FilterData};
        let fdata = {
            Data,
            screenType:"IAS_REPORT"
        };

        showLoader();
        // apiPostMethod(apiBaseUrl+'warehouse/Master/getReportDetails', fdata)
        apiPostMethod(apiBaseUrl+'warehouse/IASSending/getReportDetails', fdata)
          .then((response) => {
            const { data } = response;
            console.log("RESULTS 000 12 :: ", data.results);

            // console.log("FromDate",data.results[0].start_Dt);
            // console.log("ToDate",data.results[0].end_Dt);

            if (data.success) {

                // form.setFieldValue('FromDate',data.results[0].start_Dt);
                // form.setFieldValue('ToDate',data.results[0].end_Dt);
                
                form.setValues({
                    ...form.values, 
                    CheckList: data.results
                   
                })
            }else{
                errorToast("Data Not Found !!!");      
            }
            // console.log("Data Fetched001");
            // console.log("Result Data :: "+JSON.stringify(form));

        })
        .catch((error) => {
          errorToast("Something went wrong, please try again after sometime");
        })
        .finally((a) => {
          hideLoader();
        });
    }

    const onVANoChange=(e)=>{
        const { value, label } = e;
        
        // setFilterData({...FilterData, VA_No:e.value});
        // form.setFieldValue('VANumber',{value:e.value, label:e.label});
        // console.log(FilterData);
        setFilterData({...form.values, VA_No:e.value});
        form.setFieldValue('VANumber', e.target.value);
        console.log(form.values);
        
    }

    const onSendingPlantChange=(e)=>{
        const { value, label } = e;
        // form.setFieldValue('SendingPlant',{value:e.value, label:e.label});
        // setFilterData({...FilterData, SendingPlant_id:e.value, SendingPlant:e.label});
        // console.log(FilterData);
        form.setFieldValue('SendingPlant',{value:e.value, label:e.label});
        setFilterData({...form.values, SendingPlant_id:e.value, SendingPlant:e.label});
        console.log(form.values);
    }

    const onReceivingPlantChange=(e)=>{
        const { value, label } = e;
        // form.setFieldValue('ReceivingPlant',{value:e.value, label:e.label});
        // setFilterData({...FilterData, ReceivingPlant_id:e.value, ReceivingPlant:e.label});
        // console.log(FilterData);
        form.setFieldValue('ReceivingPlant',{value:e.value, label:e.label});
        setFilterData({...form.values, ReceivingPlant_id:e.value, ReceivingPlant:e.label});
        console.log(form.values);
    }

    const onFromDateChange=(e)=>{
        const { value, label } = e;
        // form.setFieldValue('FromDate',{value:e.value, label:e.label});
        // setFilterData({...FilterData, FromDt_id:e.value, FromDt:e.label});
        // console.log("FromDate".FilterData);
        form.setFieldValue('FromDate',{value:e.value, label:e.label});
        setFilterData({...form.values, FromDt_id:e.value, FromDt:e.label});
        console.log("FromDate".form.values);
    }

    const onToDateChange=(e)=>{
        const { value, label } = e;
        // form.setFieldValue('ToDate',{value:value});
        // setFilterData({...FilterData, ToDt_id:value});
        // console.log(FilterData);
        form.setFieldValue('ToDate',{value:value});
        setFilterData({...form.values, ToDt_id:value});
        console.log(form.values);
    }

    const onVehicleChange=(e)=>{
        const { value, label } = e;
        // form.setFieldValue('VehicleNo',{value:e.value, label:e.label});
        // setFilterData({...FilterData, Truck_No_id:e.value, Truck_No:e.label});
        // console.log(FilterData);
        form.setFieldValue('VehicleNo',{value:e.value, label:e.label});
        setFilterData({...form.values, Truck_No_id:e.value, Truck_No:e.label});
        console.log(form.values);
    }

    return (
        <div>
            <RefreshBlock />
            <Card>
                <CardHeader>
                    <CardTitle>{"IAS Report"}</CardTitle>
                </CardHeader>
                <CardBody>
                    <Row>
                        <Col md="4" sm="12">
                            <CustomTextInput label={"VA Number"} form={form} id="VANumber" type="text"  onChange = {(e)=>onVANoChange(e)}/>
                            {/* <CustomDropdownInput options={""} label={"VA No"} form={form} id="VANumber" 
                                url={`${apiBaseUrl}warehouse/Master/getVANumber`}
                                onChange = {(e)=>onVANoChange(e)}/> */}
                        </Col>

                        <Col md="4" sm="12">
                            <CustomDropdownInput options={""} label={"Sending Plant"} form={form} id="SendingPlant"
                                url={`${apiBaseUrl}warehouse/Master/getSendingPlant`}
                                onChange = {(e)=>onSendingPlantChange(e)}/>
                        </Col>
                        <Col md="4" sm="12">
                            <CustomDropdownInput options={""} label={"Receiving Plant"} form={form} id="ReceivingPlant" 
                                url={`${apiBaseUrl}warehouse/Master/getReceivingPlant`}
                                onChange = {(e)=>onReceivingPlantChange(e)}/>
                        </Col>
                    </Row>
                    <Row>
                        <Col md="3" sm="12">
                            <CustomTextInput label={"From Date"} form={form} id="FromDate" type="date"/>
                        </Col>
                        <Col md="3" sm="12">
                            <CustomTextInput label={"To Date"} form={form} id="ToDate" type="date"/>
                        </Col>
                        <Col md="4" sm="12">
                            <CustomDropdownInput options={""} label={"Vehicle No"} form={form} id="VehicleNo"
                                url={`${apiBaseUrl}warehouse/Master/getVehicleNO`}
                                onChange = {(e)=>onVehicleChange(e)}/>
                        </Col>
                        <Col md="2" sm="12"> 
                            <FormGroup className="d-flex justify-content-center mb-0" style={{paddingTop:"25px"}}>
                            <Button.Ripple onClick={getReportDetails}  color="primary"  type="Button"  >
                                Show
                            </Button.Ripple>
                            </FormGroup>
                        </Col>
                    </Row>

                </CardBody>
            </Card>
            <Card>
                <CardBody>
                    <TableComponent showDownload columns={taColumns} data={form.values.CheckList}/>
                </CardBody>
            </Card>

        </div>
    )
};
export default WhUnloadingReport;