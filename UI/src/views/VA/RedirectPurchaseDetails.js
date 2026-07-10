import { Card, CardHeader, CardBody, Button, Row, FormGroup, Col } from "reactstrap";
import React, { useEffect } from "react";
import { useHistory } from "react-router-dom";
import Badge from "reactstrap/lib/Badge";
import { useState } from "react";
import { useSelector } from "react-redux";
import { X } from "react-feather";
import { useFormik } from "formik";
import { Modal } from "react-bootstrap";
import { CustomTextInput, Yup } from "../forms/custom-form";
import { useLoader } from "../../utility/hooks/useLoader";
import { apiBaseUrl } from "../../urlConstants";
import { apiPostMethod } from "../../helper/axiosHelper";
import { ShowToast, errorToast } from "../../helper/appHelper";
import TableComponent from "../common/TableComponent";
import { ElapsedTimer } from "../common/ElapsedTimer";

export const taColumns = [
    {
        name: "TRUCK NO",
        selector: "vehicleNo",
        sortable: true,
        minWidth: "50px",
    },
    {
        name: "PURPOSE",
        selector: "moduleType",
        sortable: true,
        minWidth: "150px",
    },
    {
        name: "PLANT NAME",
        selector: "plantName",
        sortable: true,
        minWidth: "150px",
    },
    {
        name: "OVERALL DURATION",
        selector: "createdOn",
        sortable: false,
        minWidth: "170px",
        cell: (row) => {
            return <ElapsedTimer date={row.createdOn} />
        },

    },
    {
        name: "WAITING AT",
        selector: "waitingStatus",
        sortable: true,
        minWidth: "150px",
        cell: (row) => {
            return (
                <Col sm="12" md="12">
                    <FormGroup className="d-flex justify-content-center mb-0">
                        <Badge color="primary" pill>
                            {row.StatusName == 'Gate In' ? 'Waiting for In' : row.waitingStatus}
                        </Badge>
                    </FormGroup>
                </Col>
            );
        },
    },
];


const RedirectPurchaseDetails = ({ actionRendorer }) => {

    let { showLoader, hideLoader } = useLoader();
    const history = useHistory();


    const [show, setShow] = useState(false);
    const closeRemarksModal = () => setShow(false);

    const form = useFormik({
        isInitialValid: false,
        initialValues: {},
        validationSchema: Yup.object().shape({
            // colorToken: validation.required({ message: "Please Select Color Token", isObject: true })
        }),
        gateIn() { },
    });

    const actionsCol = {
        name: "ACTIONS",
        selector: "status",
        minWidth: "200px",
        cell: (row) => {
            return actionRendorer ? (
                actionRendorer(row)
            ) : (
                <Row>&nbsp;&nbsp;
                    <Button.Ripple color="primary" size="sm" type="button" onClick={() => onActionClick(row)}>Redirect</Button.Ripple>
                </Row>
            );
        },
    };

    const [data, setData] = useState([])

    const onActionClick = (row) => {
        setShow(true)
        setData(row);
        history.push(`/RedirectPurchase/${row.gateInOutInfoId}`);
    };


    const UserDetails = useSelector((state) => (state && state.auth ? state.auth.userData : {}));
    const [landingData, setLandingData] = useState([])

    const getLoadingData = () => {
        showLoader();
        console.log(apiBaseUrl + `GatePro/Gate/getAllGateInOutInfo/2/${UserDetails.USERID}`)
        apiPostMethod(apiBaseUrl + `GatePro/Gate/getAllGateInOutInfo/2/${UserDetails.USERID}`)
            .then((response) => {
                const { data } = response;
                if (data.success == true) {
                    setLandingData(data.results.filter((item) => (item.isRedirect == null && item.redirectMasterPlantId == null) || ((item.isRedirect > 0 && item.redirectMasterPlantId > 0) && (item.moduleStatusId == 0 || item.moduleStatusId == 4 || item.moduleStatusId == 5))));
                } else if (data.success == true) {
                    errorToast(data.message)
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

    useEffect(() => {
        getLoadingData()
    }, [])

    const columns = [...taColumns, actionsCol];

    return (
        <div>
            <Card>
                <CardHeader><h5>Redirect Purchase Details</h5></CardHeader>
                <hr />
                <CardBody>
                    <TableComponent columns={columns} data={landingData} />
                </CardBody>
            </Card>
        </div >
    );
};

export default RedirectPurchaseDetails;

