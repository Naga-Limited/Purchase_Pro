import { Card, CardHeader, CardBody, Button, Row } from "reactstrap";
import React, { useEffect } from "react";
import { useHistory } from "react-router-dom";
import { useState } from "react";
import { useSelector } from "react-redux";
import { useFormik } from "formik";
import { Yup } from "../forms/custom-form";
import { useLoader } from "../../utility/hooks/useLoader";
import { apiBaseUrl } from "../../urlConstants";
import { apiGetMethod } from "../../helper/axiosHelper";
import { errorToast } from "../../helper/appHelper";
import TableComponent from "../common/TableComponent";

export const taColumns = [
    {
        name: "NATURE OF WORK",
        selector: "workNature",
        sortable: true,
        minWidth: "170px",
    },
    {
        name: "SERVICE PO NO",
        selector: "servicePoNo",
        sortable: true,
        minWidth: "170px",
    },
    {
        name: "TOTAL DAYS",
        selector: "totalDays",
        sortable: true,
        minWidth: "130px",
    },
    {
        name: "PREFFERED SHIFT",
        selector: "shift",
        sortable: true,
        minWidth: "170px",
    },
    {
        name: "PLANT",
        selector: "plantName",
        sortable: true,
        minWidth: "180px",
    },
    {
        name: "CONTRACTOR NAME",
        selector: "contractorName",
        sortable: true,
        minWidth: "190px",
    },
    {
        name: "SUPERVISOR NAME",
        selector: "supervisorName",
        sortable: true,
        minWidth: "190px",
    }
];

const WorkPermitList = ({ actionRendorer}) => {

    let { showLoader, hideLoader } = useLoader();
    const [show, setShow] = useState(false);
    const history = useHistory();

    const form = useFormik({
        isInitialValid: false,
        initialValues: {},
        validationSchema: Yup.object().shape({}),
        onSubmit() { },
    });

    const actionsCol = {
        name: "ACTIONS",
        selector: "status",
        minWidth: "100px",
        cell: (row) => {
            return actionRendorer ? (
                actionRendorer(row)
            ) : (
                <Row>&nbsp;&nbsp;
                    <Button color="primary" size="sm" type="button" onClick={() => onActionClick(row)}>Gate In</Button>
                </Row>
            );
        },
    };

    const onActionClick = (row) => {
        history.push(`/ContractorGateIn/${row.workPermitId}`);
    };

    const UserDetails = useSelector((state) => (state && state.auth ? state.auth.userData : {}));

    const [landingData, setLandingData] = useState([]);

    const getWorkPermit = () => {
        console.log(apiBaseUrl + `GatePro/Gate/getWorkPermit/0/${UserDetails.USERID}`);
        apiGetMethod(apiBaseUrl + `GatePro/Gate/getWorkPermit/0/${UserDetails.USERID}`)
            .then((response) => {
                const data = response.data;
                if (data.success == true) {
                    setLandingData(data.results)
                }
                else if (data.success == false) {
                    // errorToast(data.message)
                }
            })
            .catch((error) => {
                console.log(error)
                errorToast("Something went wrong, please try again after sometime");
            })
    }

    useEffect(() => {
        getWorkPermit()
    }, [])
  

    const columns = [...taColumns, actionsCol];

    return (
        <>
            <Card>
                <CardHeader><h5>Work Permit List</h5></CardHeader>
                <hr />
                <CardBody>
                    <TableComponent columns={columns} data={landingData} />
                </CardBody>
            </Card>            
        </>
    );
};

export default WorkPermitList;

