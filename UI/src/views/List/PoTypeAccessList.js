import { Card, CardHeader, CardBody, FormGroup, Col } from "reactstrap";
import React from "react";
import TableComponent from "../common/TableComponent";
import { useSelector } from "react-redux";
import { apiBaseUrl } from "../../urlConstants";
import { useState } from "react";
import { apiGetMethod } from "../../helper/axiosHelper";
import { errorToast } from "../../helper/appHelper";
import { CustomDropdownInput, Yup } from "../forms/custom-form";
import { useFormik } from "formik";

export const taColumns = [
    {
        name: "USER",
        selector: "werks",
        sortable: true,
        minWidth: "120px",
        cell: (row) => {
            return <>
                <span className="fs-6">{row.loginId + ' - ' + row.firstName}</span>
            </>
        },
    },
    {
        name: "PO Type",
        selector: "type",
        sortable: true,
        minWidth: "150px",
        cell: (row) => {
            return <>
                <span className="fs-6">{row.type + ' - ' + row.name}</span>
            </>
        },
    },

];

const PoTypeAccessList = ({ data, setData }) => {

    const columns = [...taColumns];

    const form = useFormik({
        isInitialValid: false,
        initialValues: {},
        validationSchema: Yup.object().shape({}),
    });

    const UserDetails = useSelector((state) => (state && state.auth ? state.auth.userData : {}));
    const [plant, setPlant] = useState('');

    const getPoTypeAccessByMasterPlantId = (e) => {

        console.log(e.ID);
        setPlant([e])
        const plantId = e.ID;

        console.log(apiBaseUrl + `GatePro/Master/getPoTypeAccess/${UserDetails.USERID}/${plantId}`)
        apiGetMethod(apiBaseUrl + `GatePro/Master/getPoTypeAccess/${UserDetails.USERID}/${plantId}`)
            .then((response) => {
                const data = response.data;
                if (data.success == true) {
                    setData(data.results);
                } else {
                    errorToast(data.message)
                    setData([])
                }
            })
            .catch((error) => {
                console.log(error)
                errorToast("Something went wrong, please try again after sometime");
            })
    }

    return (
        <div>
            <Card>
                <CardHeader><h5>PO Type Access List</h5></CardHeader>
                <hr />
                <CardBody>

                    {/* <Col md="4" sm="12">
                        <CustomDropdownInput
                            url={`${apiBaseUrl}/GatePro/Master/getMasterPlant`}
                            label={"Plant"}
                            form={form}
                            id='plant'
                            onChange={getPoTypeAccessByMasterPlantId}
                            value={plant}
                        />
                    </Col> */}

                    <TableComponent columns={columns} data={data} />
                </CardBody>
            </Card>
        </div>
    );
};

export default PoTypeAccessList;