import React, { Fragment, Component, useState } from "react";
import { Button, CustomInput, Row, Col } from "reactstrap";
import confirmDialog from "../../../@core/components/confirm/confirmDialog";
import { errorToast, ShowToast } from "@helpers/appHelper";
import { useHistory, useParams } from "react-router";
import { useLoader } from "../../../utility/hooks/useLoader";
import { apiPostMethod } from "@helpers/axiosHelper";
import { apiBaseUrl } from "../../../urlConstants";
import { CustomDropdownInput, CustomTextInput } from "../../forms/custom-form";
import { useEffect } from "react";
import { evaWHColumns } from "../../VA/columnSpec";
//import './style.css'


const InputTable = (props) => {
    const history = useHistory();
    let { showLoader, hideLoader } = useLoader();
    const [State, setState] = useState({ data: props.data });
    const [StateNew, setStateNew] = useState({ data: props.data });

    //Mohan added for plant option fetch from server
    const [PlantLoadingFlag, setPlantLoadingFlag] = useState(false);
    const [rowdata, setRowdata] = useState({ data: [] });

    useEffect(() => {
        PlantLoading();
    },[StateNew]);


    /*
    const  PlantLoadingNew = async (row, postdata) => {
        showLoader();
        const dataTmp = await apiPostMethod(apiBaseUrl + "warehouse/master/getLotnoLocPlanList", postdata)
        .then((response) => {
            const { results } = response.data;//Plant list
            console.log("Plant Options",results, response);
            ////rowdata.data.push({...row, chkSelect:true,plantoptions: {...results}});
            ///rowdata.data.push({...row, chkSelect:true});
            row= {
                ...row,
                plantoptions: results
            }
        })
        .catch((error) => {
            console.log(" Error Data ::: "+JSON.stringify(error));
            errorToast("Something went wrong, please try again after sometime...");
            
            return {
                ...row                    
            }
        })
        .finally((a) => {
            hideLoader();
        });
        console.log(" After Post Data ::: ",row );
        return  {
            ...row                    
        };
    

      };
       //PlantLoadingNew();


    const  PlantLoading =  () => {
        console.log("Inline Plant Loading()", State);
        if (PlantLoadingFlag) return;
        setPlantLoadingFlag(true);

        const { data } = State;
        //const rowdata={data:[]};
        
        const newData = (data.map( async row => {
            const postdata = {
                warehouseid: row.warehouseid,
                plantid: row.plantid,
                locationid: row.locationid,
                lotid: row.lotid,
                wheatvarityid: row.wheatvarityid
            }
            const rowdata1 = await PlantLoadingNew(row,postdata);
console.log("rowdata1",rowdata1);
            ////setState({...State, data: rowdata1});
            ////setRowdata({data:rowdata1});
            /***

             ////console.log ("  Warehouse Weekly Plan List Item  :: "+apiBaseUrl + "Master", postdata);
             const dataTmp = await apiPostMethod(apiBaseUrl + "warehouse/master/getLotnoLocPlanList", postdata)
            .then((response) => {
                const { results } = response.data;//Plant list
                console.log("Plant Options",results, response);
                ////rowdata.data.push({...row, chkSelect:true,plantoptions: {...results}});
                rowdata.data.push({...row, chkSelect:true});
                return {
                    ...row,
                    plantoptions: results
                }
            })
            .catch((error) => {
                console.log(" Error Data ::: "+JSON.stringify(error));
                errorToast("Something went wrong, please try again after sometime...");
                
                return {
                    ...row                    
                }
            })
            .finally((a) => {
                hideLoader();
            });
            console.log(" After Post Data ::: ",rowdata );
            return rowdata;* /
        }));
        //Promise.all(newData);
        
        console.log("NEWDATA",rowdata, State);
        
        //setState( {data:rowdata} );
        ////setState(rowdata);
      };
      PlantLoading();
      */


    // const PushToNewRow = (row, results, idx) => {
    //     // console.log("PushToNewRow", idx);
    //     // console.log("PushToNewRow2");

    //     let newrowdata = [];
    //     StateNew.data.forEach((newrow, idxnew) => {
    //         // console.log("INDEX", idx, idxnew);
    //         if (idxnew == idx) {
    //             newrowdata.push({ ...newrow, plantoptions: results, lstplantid: { value: results[0].value, label: results[0].label } });
    //         } else {
    //             newrowdata.push({ ...newrow });
    //         }
    //     });
    //     // console.log("NEWDATA", newrowdata, State);
    //     setState({ data: newrowdata });
    // }



    // const PushToNewRow = (row, results, idx) => {

    //     setState((pv)=>{
    //         let newrowdata = [];
    //         pv.forEach((newrow, idxnew) => {

    //         console.log("INDEX", idx, idxnew);
    //         if (idxnew == idx) {
    //             newrowdata.push({ ...newrow, plantoptions: results, lstplantid: { value: results[0].value, label: results[0].label } });
    //         }
    //         else {
    //             if(!newrow.plantoptions)
    //             {
    //             newrowdata.push({ ...newrow });
    //             }
    //         }
    //     });
    //     console.log("NEWDATA", newrowdata, State);
    //     return newrowdata;
    //     });
    // }


    const PlantLoading = () => {
       
        if (PlantLoadingFlag) return;
        setPlantLoadingFlag(true);
        const { data } = StateNew;
        var newrowdata = [];

        data.forEach((row, idx) => {
            const postdata = {
                warehouseid: row.warehouseid,
                plantid: row.plantid,
                locationid: row.locationid,
                lotid: row.lotid,
                wheatvarityid: row.wheatvarityid
            }

            
            apiPostMethod(apiBaseUrl + "warehouse/RndConfirmationPlan/getLotnoLocPlanList", postdata)
                .then((response) => {
                    const { results } = response.data;//Plant list
                        newrowdata.push({ 
                            ...row, 
                            plantoptions: results, 
                            lstplantid: { value: results[0].value, label: results[0].label } 
                        });

                        setState({ data: newrowdata });
                    
                })
                .catch((error) => {
                    console.log(" Error Data ::: " + JSON.stringify(error));
                    errorToast("Something went wrong, please try again after sometime...");

                })
                .finally((a) => {
                    hideLoader();
                }); 
        });
    };
   
   
    const handleDataUpdate = (id, name, assignTo, label = '') => {
        // Data Upate for Edit Data
        const { data } = State;
        const newData = data.map(row => {
            if (row.rowId === id) {
                console.log("ID => ", id, " Assign TO => ", assignTo, " Input Value => ", name);
                console.log(row.Movement_Qty + " " + row.AvailabelQty);

                switch (assignTo) {
                    case "Priority":
                        if ((parseFloat(row.Movement_Qty) > parseFloat(row.AvailabelQty) ||
                            parseFloat(row.Movement_Qty) > parseFloat(row.QC_Cleared_Qty) ||
                            parseFloat(row.Movement_Qty) > parseFloat(row.Keyloan_Cleared_Qty) ||
                            parseFloat(row.Movement_Qty) > parseFloat(row.Fumi_Cleared_Qty)) &&
                            (name === "1" /*||name === "2"*/)) {


                            /*return {
                                ...row, 
                                [assignTo]:name,
                                Movement_Qty:"",
                                Release_Qty:""
                            } */
                            errorToast("Invalide Movement Qty");
                            return {
                                ...row
                            }

                        } else {
                            return {
                                ...row,
                                [assignTo]: name,
                            }
                        }
                    case "Movement_Qty":
                        if (parseFloat(row.Release_Qty) > parseFloat(row.Movement_Qty)) {
                            return {
                                ...row,
                                [assignTo]: name,
                                Release_Qty: ""
                            }
                        }
                        else {
                            return {
                                ...row,
                                [assignTo]: name,
                            }
                        }

                    case "Release_Qty":
                        return {
                            ...row,
                            [assignTo]: name
                        }
                    case "PlanMonth":
                        return {
                            ...row,
                            [assignTo]: name
                        }
                    case "plant_name":
                        const tmparr = JSON.parse(name);

                        console.log("name", tmparr, 'label', label, assignTo);
                        return {
                            ...row, ...tmparr,
                            [assignTo]: label,
                            lstplantid: { label: label, value: name },
                            oldwarehouseid: row.warehouseid,
                            oldplantid: row.plantid,
                            oldlocationid: row.locationid,
                            oldlotid: row.lotid,
                            oldwheatvarityid: row.wheatvarityid,
                        }

                    default:
                        break;
                }


            }
            return row;
        });
        // console.log("NEWDATA", newData);
        setState({ data: newData });
    }

    const SaveData = (NewData) => {
        // console.log("NEW DATA => ", State.data);
        // console.log("Length => ", State.data.length);
        const NullData = NewData.filter(item => {
            return (
                parseFloat(item.Movement_Qty) <= 0 ||
                isNaN(parseFloat(item.Movement_Qty))
            )
        })
        // console.log(NullData);

        if (NullData.length > 0) {
            errorToast("Invalid Movement Quantity");
            return;
        }


        confirmDialog({
            title: "Are you sure?",
        }).then((res) => {

            if (res == true) {
                const postdata = {
                    screentype: "WPL_Edit",
                    Data: NewData,
                    DataLength: State.data.length
                }
                showLoader();
                // console.log("  Warehouse Weekly Plan List Item  :: "+apiBaseUrl + "Master", postdata);
                apiPostMethod(apiBaseUrl + "warehouse/STOPODeliveryPlan/SavePlanListUpdate", postdata)
                    .then((response) => {
                        const { data } = response;
                        console.log(" Response Data ::: " + JSON.stringify(response));

                        console.log("RESULTS 1234 : ", data.success);

                        if (data.success && (data.success == "1" || data.success == "true")) {
                            ShowToast("Saved Successfully...");
                            props.setShowModal(false);
                            //history.push("/warehouse/Plan_List");
                            props.FetchData();
                        }
                        else if (data.success && (data.success == "-5")) {
                            errorToast("Duplicate record found ", data.ErrorMsg);
                        }
                        else {
                            errorToast("Unable to update record ", data.ErrorMsg);
                        }

                    })
                    .catch((error) => {
                        console.log(" Error Data ::: " + JSON.stringify(error));
                        errorToast("Something went wrong, please try again after sometime");
                    })
                    .finally((a) => {
                        hideLoader();
                    });
            }
            else {
                errorToast("Data not saved...");
            }
        });
    }
    console.log("BEFORE RENDER ", State.data);

    return (
        <div>
            <div>
                <table id="TableID" className='table-sm'>
                    <thead className='bg-primary text-white ' /*style={{width:"500px", overflowX: "auto", height:"50px",textAlign:"left"}}*/>
                        <tr className="col-md">
                            {/* <th style={{minWidth:"150px"}}>Plan Id</th> */}
                            {/* <th style={{minWidth:"150px"}}>Select</th> */}
                            <th style={{ minWidth: "50px" }}>Priority</th>    {/* Priority Edit */}
                            <th style={{ minWidth: "90px" }}>Planing Month</th>
                            <th style={{ minWidth: "250px" }}>Wheat Variety</th>
                            <th style={{ minWidth: "150px" }}>Receiving Bin</th>
                            <th style={{ minWidth: "150px" }}>Lot No</th>
                            <th style={{ minWidth: "150px" }}>Storage Location</th>
                            <th style={{ minWidth: "150px" }}>Plant</th>
                            <th style={{ minWidth: "250px" }}>Warehouse</th>
                            <th style={{ minWidth: "90px" }}>SAP Stock (MTS)</th>
                            <th style={{ minWidth: "100px" }}>Reserved Stock(MTS)</th>
                            <th style={{ minWidth: "100px" }}>Available Stock(MTS)</th>
                            <th style={{ minWidth: "100px" }}>Movement Qty(MTS)</th> {/* Movement Qty Edit */}
                            <th style={{ minWidth: "150px" }}>Diff for Mvmt Qty & SAP Qty(MTS)</th>
                            <th style={{ minWidth: "100px" }}>Expected Arrival</th>
                            <th style={{ minWidth: "100px" }}>Purchase Plan(MTS)</th>
                            <th style={{ minWidth: "100px" }}>Release</th> {/* Release Edit */}
                            <th style={{ minWidth: "70px" }}>Division</th>
                            <th style={{ minWidth: "130px" }}>QC Cleared Qty (MTS)</th>
                            <th style={{ minWidth: "150px" }}>Fumi. Cleared Qty (MTS)</th>
                            <th style={{ minWidth: "100px" }}>DO Cleared Qty(MTS)</th>
                            {/* <th style={{minWidth:"150px"}}>Action</th> */}
                        </tr>
                    </thead>

                    <tbody style={{ textAlign: "left" }}>
                        {/**Row data iteration and passes each row to child */}

                        {State.data.map(row => (
                            <TableRow1
                                key={row.rowId}
                                data={row}
                                form={props.form}
                                onPriorityUpdate={handleDataUpdate}
                                onMovementQtyUpdate={handleDataUpdate}
                                onReleaseQtyUpdate={handleDataUpdate}
                                onPlanMonthUpdate={handleDataUpdate}
                                onPlantUpdate={handleDataUpdate}
                            />
                        ))}
                    </tbody>
                </table>
                <hr />
            </div>
            <div>
                <Button.Ripple color="primary" type="button" onClick={(e) => {
                    let msg = "Please confirm for UPDATE";
                    // confirmDialog({
                    //     title: "Are you sure?",
                    // }).then((res) => {
                    //     if (res) {
                    //Save Edited DATA
                    SaveData(State.data)
                    // }
                    // });
                }}>Save</Button.Ripple>
            </div>
        </div>
    );
}

const TableRow1 = ({ key, data, onPriorityUpdate, onMovementQtyUpdate, onReleaseQtyUpdate, onPlanMonthUpdate, onPlantUpdate, form }) => {
    console.log("RECIVED DATA : ", data);
    const handleChange_Priority = e => {

        /*if (e.target.value === "1" || e.target.value === "2"){
            onMovementQtyUpdate(data.rowId, "", "Movement_Qty");
            onReleaseQtyUpdate(data.rowId, "", "Release_Qty");
        }*/
        onPriorityUpdate(data.rowId, e.target.value, "Priority");
    };
    const onPlanMonthChange = e => {
        //let {value, label}=e;
        /*if (e.target.value === "1" || e.target.value === "2"){
            onMovementQtyUpdate(data.rowId, "", "Movement_Qty");
            onReleaseQtyUpdate(data.rowId, "", "Release_Qty");
        }*/
        console.log("ROWDATA", data);
        onPlanMonthUpdate(data.rowId, e.value, "PlanMonth");
    };

    const handleChange_MovementQty = e => {
        // {(data.Priority ===1 || data.Priority ===2) && (data.SAP_Qty > e.target.value) && 
        if (data.Priority === "1" /*||data.Priority === "2"*/) {
            if (e.target.value === "") {
                onMovementQtyUpdate(data.rowId, e.target.value, "Movement_Qty");
            } else {
                // if (parseFloat(data.SAP_Qty) >= parseFloat(e.target.value) && parseFloat(e.target.value)>0){
                if (parseFloat(data.AvailabelQty) >= parseFloat(e.target.value) && parseFloat(e.target.value) > 0) {
                    onMovementQtyUpdate(data.rowId, e.target.value, "Movement_Qty");
                } else {
                    errorToast("Movement Qty should be greater than Zero and should not Greater than Availabel Qty");
                }
            }
        } else {
            onMovementQtyUpdate(data.rowId, e.target.value, "Movement_Qty");
        }
    };

    const handleChange_ReleaseQty = e => {
        //onReleaseQtyUpdate(data.rowId, e.target.value, "Release") 
        if (data.Priority === "1" /*||data.Priority === "2"*/) {
            if (e.target.value === "") {
                ////onReleaseQtyUpdate(data.rowId, "", "Release_Qty") 
            } else {
                if (parseFloat(data.Movement_Qty) >= parseFloat(e.target.value)) {
                    onReleaseQtyUpdate(data.rowId, e.target.value, "Release_Qty");
                } else {
                    errorToast("Release Qty should not Greater than Movement Qty");
                }
            }
        } else {
            onReleaseQtyUpdate(data.rowId, e.target.value, "Release_Qty")
        }

    };


    const onPlantChange = (e) => {
        onPlantUpdate(data.rowId, e.value, "plant_name", e.label);
        console.log("ON Plant Change");
    }
    /* Assign our table Columns and De-Structure */
    /*
    const data= { 
        Priority,
        PlanMonth,
        WheatvarietyName,
        ReceivingBinNo,
        lotno,
        storage_location,
        plant_name,
        wh_name,
        SAP_Qty,
        Reserved_Stock,
        wheatqty,
        Movement_Qty,
        Diff_for_Mvmt_Qty_SAP_QTY,
        Expected_Arrival,
        Purchase_Plan,
        Release,
        Division,
        QC_Cleared_Qty,
        Fumi_Cleared_Qty,
        Keyloan_Cleared_Qty
        }
        */

    return (
        <tr>
            <td valign="bottom" style={{ paddingBottom: "33px" }}><input type="text" value={data.Priority} style={{ width: "50px" }} onChange={handleChange_Priority} /></td>
            <td style={{ minWidth: "120px" }}>
                {/* {data.PlanMonth} *
                { parseFloat(data.Keyloan_Cleared_Qty)> parseFloat(data.Movement_Qty) && "EDIT"}
    { parseFloat(data.Keyloan_Cleared_Qty) < parseFloat(data.Movement_Qty) && "NOEDIT"*/}
                <CustomDropdownInput label={""} id="PlanMonth"
                    url={`${apiBaseUrl}warehouse/master/getPlanMonth`}
                    style={{ zIndex: '1000', minWidth: '500px' }}
                    form={form}

                    value={{ value: data.PlanMonth, label: data.PlanMonth }}
                    onChange={(e) => onPlanMonthChange(e)}
                />
                <span id='PlanMonth_Error' style={{ color: 'red' }} ></span>

            </td>
            <td>{data.WheatvarietyName}</td>
            <td>{data.ReceivingBinName}</td>
            <td>{data.lotno}</td>
            <td>{data.storage_location}</td>
            <td style={{ minWidth: "220px" }}>
                {data.plant_name}
                <CustomDropdownInput
                    options={data.plantoptions}
                    id="lstplantid"
                    label={""}
                    className="react-select"
                    classNamePrefix="select"
                    form={form}
                    value={data.lstplantid}
                    onChange={(e) => onPlantChange(e)}
                    isDisabled={parseFloat(data.Keyloan_Cleared_Qty) < parseFloat(data.Movement_Qty)}
                />
            </td>
            <td>{data.wh_name}</td>
            <td>{data.SAP_Qty}</td>
            <td>{data.Reserved_Stock}</td>
            <td>{data.AvailabelQty}</td>
            {/* <td>{data.Movement_Qty}</td> */}
            <td><input type="text" value={data.Movement_Qty} style={{ width: "80px" }} onChange={handleChange_MovementQty} /></td>
            <td>{data.Diff_for_Mvmt_Qty_SAP_QTY}</td>
            <td>{data.Expected_Arrival}</td>
            <td>{data.Purchase_Plan}</td>
            {/* <td>{Release}</td> */}
            <td><input type="text" value={data.Release_Qty} style={{ width: "80px" }} onChange={handleChange_ReleaseQty} /></td>
            <td>{data.Division}</td>
            <td>{data.QC_Cleared_Qty}</td>
            <td>{data.Fumi_Cleared_Qty}</td>
            <td>{data.Keyloan_Cleared_Qty}</td>
        </tr>

    );
}


/* ================================================================================ */
/*
class  InputTable extends Component {
    
    constructor(props){
        super(props);
        
        this.state = {
        
            // /**Mock Table row Data * /
            data:this.props.data,
            //rowValues : {}
        }     
    };

    //Dynamically chages name and update the same in Name column * /
    handleDataUpdate = (id, name, assignTo) => {
        // Data Upate for Edit Data
        const { data } = this.state;
        const newData = data.map(row => {
            if (row.rowId === id) {
                console.log("ID => ",id," Assign TO => ",assignTo, " Input Value => ",name);
                return {
                    ...row, 
                    assignTo:name
                }
                // (   
                //     (assignTo ==="Priority")?{...row, Priority:name}:{...row,}
                //     (assignTo ==="MovementQty")?{...row, Movement_Qty:name}:{...row,}
                //     (assignTo ==="ReleaseQty")?{...row, Release:name}:{...row,}
                // );
            }
            return row;
        });
        this.setState({ data: newData });
    }

    //Based on the value selection it updates same in dropdown
    handleSelect = (id, gender) => {
        const { data } = this.state;
        const newData = data.map(row => {
            if (row.id === id) {
                return {
                    ...row,
                    gender
                };
            }
            return row;
        });
        this.setState({ data: newData });
    }

    handelCheck = (id, chk) => {
        const { data } = this.state;
        const newData = data.map(row => {
            if (row.id === id) {
                return {
                    ...row,
                    chk
                };
            }
            return row;
        });
        this.setState({ data: newData });
    }

    // Receiving selected data from Child Component 
    selectedRows = (data) => {
        this.setState({ rowValues: data });
    }

    SaveData = ( NewData ) => {
        console.log("NEW DATA => ", this.state.data);
        const postdata = {
            screentype:"WPL_Edit",
            Data:NewData
        }
        showLoader();
        // console.log("  Warehouse Weekly Plan List Item  :: "+apiBaseUrl + "Master", postdata);
        apiPostMethod(apiBaseUrl + "warehouse/STOPODeliveryPlan/SavePlanListUpdate", postdata)
        .then((response) => {
            const { data } = response;
            console.log(" Response Data ::: "+JSON.stringify(response));
            
            let RespId = data.success;
            if(RespId && RespId>=1){
                ShowToast("Saved Successfully...");
                history.push("/warehouse/Plan_List");
            }else{
                if(data.ErrorMsg){
                    errorToast(data.ErrorMsg);
                }else{
                    errorToast("Unable to update record");
                } 
            }      
        })
        .catch((error) => {
            console.log(" Error Data ::: "+JSON.stringify(error));
            errorToast("Something went wrong, please try again after sometime");
        })
        .finally((a) => {
            hideLoader();
        });
    }

    render() {
        return (
            <div className="App">
                <div className="table-input">
                    <table className="table-inp">
                        <thead>
                            <tr className="col-md">
                                {/* <th style={{minWidth:"150px"}}>Plan Id</th> * /}
                                //{/* <th style={{minWidth:"150px"}}>Select</th> * /}
                                <th style={{minWidth:"150px"}}>Priority</th>   // {/* Priority Edit * /}
                                <th style={{minWidth:"150px"}}>Planing Month</th>
                                <th style={{minWidth:"150px"}}>Wheat Variety</th>
                                <th style={{minWidth:"150px"}}>Receiving Bin</th>
                                <th style={{minWidth:"150px"}}>Lot No</th>
                                <th style={{minWidth:"150px"}}>Storage Location</th>
                                <th style={{minWidth:"150px"}}>Plant</th>
                                <th style={{minWidth:"150px"}}>Warehouse</th>
                                <th style={{minWidth:"150px"}}>SAP Stock (MTS)</th>
                                <th style={{minWidth:"150px"}}>Reserved Stock(MTS)</th>
                                <th style={{minWidth:"150px"}}>Available Stock(MTS)</th>
                                <th style={{minWidth:"150px"}}>Movement Qty(MTS)</th> {/* Movement Qty Edit * /}
                                <th style={{minWidth:"150px"}}>Diff for Mvmt Qty & SAP Qty(MTS)</th>
                                <th style={{minWidth:"150px"}}>Expected Arrival</th>
                                <th style={{minWidth:"150px"}}>Purchase Plan(MTS)</th>
                                <th style={{minWidth:"150px"}}>Release</th> {/* Release Edit * /}
                                <th style={{minWidth:"150px"}}>Division</th>
                                <th style={{minWidth:"150px"}}>QC Cleared Qty (MTS)</th>
                                <th style={{minWidth:"150px"}}>Fumi. Cleared Qty (MTS)</th>
                                <th style={{minWidth:"150px"}}>DO Cleared Qty(MTS)</th>
                                {/* <th style={{minWidth:"150px"}}>Action</th> * /}
                            </tr>
                            
                        </thead>
                        <tbody>

                            {/**Row data iteration and passes each row to child * /}
                            {this.state.data.map(row => (
                                <TableRow
                                    key={row.rowId}
                                    data={row}
                                    //onCheckChange ={this.handelCheck}
                                    onPriorityUpdate={this.handleDataUpdate}
                                    onMovementQtyUpdate={this.handleDataUpdate}
                                    onReleaseQtyUpdate={this.handleDataUpdate}

                                    //onSelectChange = {this.handleSelect}
                                    selectedRowData = {this.selectedRows}
                                />
                            ))}
                        </tbody>
                    </table>
                    
                    <hr/>

                    <div>
                        <Button.Ripple color="primary" type="button" onClick={(e) => {
                                let msg = "Please confirm for UPDATE";
                                confirmDialog({
                                    title: "Are you sure?",
                                }).then((res) => {
                                    if (res) {
                                    //Save Edited DATA
                                    this.SaveData(this.state.data)
                                    }
                                });
                        }}>Save</Button.Ripple>
                    </div>
                </div>
            </div>
        );
    }
}


class TableRow extends Component {
    handelCheck = e => {
        this.props.onCheckChange(this.props.data.id, e.target.checked)
    }

    handleChange_Priority = e => {
        this.props.onPriorityUpdate(this.state.data.rowId, e.target.value, "Priority");
    }
    handleChange_MovementQty = e => {
        this.props.onMovementQtyUpdate(this.state.data.rowId, e.target.value, "Movement_Qty");
    }
    handleChange_ReleaseQty = e => {
        this.props.onReleaseQtyUpdate(this.state.data.rowId, e.target.value, "Release");
    }

    handleSelect = (e) => {
        this.props.onSelectChange(this.props.data.id, e.target.value);
    }

    handleSubmit = (e, rowData) => {
        this.props.selectedRowData(rowData.data);
        console.log(rowData.data);
    }
    render() {
        /* Assign our table Columns and De-Structure * /
        const {data: { 
                Priority,
                PlanMonth,
                WheatvarietyName,
                ReceivingBinNo,
                lotno,
                storage_location,
                plant_name,
                wh_name,
                SAP_Qty,
                Reserved_Stock,
                wheatqty,
                Movement_Qty,
                Diff_for_Mvmt_Qty_SAP_QTY,
                Expected_Arrival,
                Purchase_Plan,
                Release,
                Division,
                QC_Cleared_Qty,
                Fumi_Cleared_Qty,
                Keyloan_Cleared_Qty
            }} = this.props;

        return (
            <tr>
                <td><input type="text" value={Priority} onChange={this.handleChange_Priority}/></td>
                <td>{PlanMonth}</td>
                <td>{WheatvarietyName}</td>
                <td>{ReceivingBinNo}</td>
                <td>{lotno}</td>
                <td>{storage_location}</td>
                <td>{plant_name}</td>
                <td>{wh_name}</td>
                <td>{SAP_Qty}</td>
                {/* <td>{Reserved_Stock}</td> * /}
                <td><input type="text" value={Reserved_Stock} onChange={this.handleChange_MovementQty}/></td>

                <td>{wheatqty}</td>
                <td>{Movement_Qty}</td>
                <td>{Diff_for_Mvmt_Qty_SAP_QTY}</td>
                <td>{Expected_Arrival}</td>
                <td>{Purchase_Plan}</td>
                {/* <td>{Release}</td> * /}
                <td><input type="text" value={Release} onChange={this.handleChange_ReleaseQty}/></td>

                <td>{Division}</td>
                <td>{QC_Cleared_Qty}</td>
                <td>{Fumi_Cleared_Qty}</td>
                <td>{Keyloan_Cleared_Qty}</td>
            </tr>
        );
    }
}
*/
export default InputTable;