import { Card, CardHeader, CardBody, Button, Row, FormGroup, Col, Label } from "reactstrap";
import React, { useEffect } from "react";
import { useHistory } from "react-router-dom";
import Badge from "reactstrap/lib/Badge";
import { useState } from "react";
import TableComponent from "../common/TableComponent";
import { apiBaseUrl } from "../../urlConstants";
import { apiGetMethod, apiPostMethod } from "../../helper/axiosHelper";
import { ShowToast, errorToast } from "../../helper/appHelper";
import { useLoader } from "../../utility/hooks/useLoader";
import { ElapsedTimer } from "../common/ElapsedTimer";
import { useSelector } from "react-redux";
import OverAllDetails from "../FG/OverAllDetails";
import moment from "moment";
import { RefreshBlock1 } from "../common/RefreshBlock1";
import { useFormik } from "formik";
import { Yup } from "../forms/custom-form";
import { DatePicker } from "../forms/custom-datetime";
import { ArrowDown } from "react-feather";
import ReactSelect from "react-select";

export const taColumns = [
    {
        name: "WH CODE",
        selector: "WH_CODE",
        sortable: true,
        minWidth: "50px",
    },
    {
        name: "WH NAME",
        selector: "WH_NAME",
        sortable: true,
        minWidth: "200px",
        
    },
    {
        name: "PLANT NAME",
        selector: "PLANT_NAME",
        sortable: true,
        minWidth: "200px",
    },
    
    {
        name: "TOTAL LOT COUNT",
        selector: "lotnocount",
        sortable: false,
        minWidth: "50px",
    },
    {
        name: "SAP STOCK LOT COUNT",
        selector: "sap_lot",
        sortable: false,
        minWidth: "50px",
    },
    {
        name: "EMPTY LOTS",
        selector: "empty_lot",
        sortable: false,
        minWidth: "50px",
    },
    {
        name: "PARTIAL LOTS",
        selector: "partial_lot",
        sortable: false,
        minWidth: "50px",
    },
    {
        name: "TOTAL CAPACITY MTS",
        selector: "totalcapacityinmts",
        sortable: false,
        minWidth: "120px",
    },
    {
        name: "SAP STOCK MTS",
        selector: "SAP_Qty",
        sortable: false,
        minWidth: "120px",
    },
    {
        name: "FREE SPACE",
        selector: "free_space",
        sortable: false,
        minWidth: "120px",
    },
    
    
];

const WarehouseSummaryReport = ({ actionRendorer }) => {

    let { showLoader, hideLoader } = useLoader();
    const history = useHistory();

    ;

    

    

    const [show, setShow] = useState(false)
    const [gateInOutInfoId, setGateInOutInfoId] = useState('')

    const overAllDetails = (gateInOutInfoId) => {
        setShow(true)
        setGateInOutInfoId(gateInOutInfoId)
    };

    const UserDetails = useSelector((state) => (state && state.auth ? state.auth.userData : {}));
    const [landingData, setLandingData] = useState([])

    const form = useFormik({
        isInitialValid: false,
        initialValues: {},
        validationSchema: Yup.object().shape({}),
        onSubmit() { },
    });
    useEffect(() => {
        getLoadingData()
    }, [])
    const getLoadingData = () => {

        showLoader();
        apiPostMethod(apiBaseUrl + `Warehouse/WarehouseEntry/WarhouseSummaryReport`)
            .then((response) => {
                const { data } = response;
                if (data.success == true) {
                    if (data.success == true) {
                        const stoData = data.results
                        setLandingData(stoData);
                    }
                }
                else if (data.success == false) {
                    errorToast(data.message);
                    setLandingData([])
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

    

   


    const columns = [...taColumns];

    return (
        <div>
            {landingData != '' ?
                <Card >
                    <CardHeader><h5>Warehouse Summary Details</h5></CardHeader>
                    <hr />
                    <CardBody>
                        <TableComponent showDownload columns={columns} data={landingData} />
                    </CardBody>
                </Card> : null
            }
        </div >
    );
};

export default WarehouseSummaryReport;
