import React, { useEffect, useState } from "react";
import {
    Card,
    CardBody,
    CardHeader,
    CardTitle,
    Row,
    Col,
    Input,
    Button,
    Label,
    Modal,
    ModalHeader,
    ModalBody,
    ModalFooter,
    FormGroup
} from "reactstrap";

import { useSelector } from "react-redux";

import { apiBaseUrl } from "../../urlConstants";
import { apiGetMethod, apiPostMethod } from "../../helper/axiosHelper";
import { errorToast, ShowToast } from "../../helper/appHelper";

import TableComponent from "../common/TableComponent";
import { HrLine } from "../common/HrLine";

const CRegisterEntry = () => {

    const [registerOptions, setRegisterOptions] = useState([]);
    const [selectedRegister, setSelectedRegister] = useState(null);
    const [subtypeData, setSubtypeData] = useState([]);
    const [errors, setErrors] = useState({});
    const [entryList, setEntryList] = useState([]);

    // EDIT STATES
    const [editModal, setEditModal] = useState(false);
    const [editRow, setEditRow] = useState(null);
    const [editDetails, setEditDetails] = useState([]);

    const UserDetails = useSelector(
        (state) => state.auth?.userData || {}
    );

    const getCurrentDateString = () => {
        const date = new Date();
        return date.toISOString().split("T")[0];
    };

    /* ================= LOAD INITIAL DATA ================= */

    useEffect(() => {

        let isMounted = true;

        const loadInitialData = async () => {

            try {

                // REGISTER LIST
                const registerRes = await apiGetMethod(
                    apiBaseUrl +
                    `RegisterController/getRegisterListentry/${UserDetails.plantids}`
                );

                if (registerRes.data.success && isMounted) {

                    const formatted = registerRes.data.results.map(x => ({
                        label: x.label,
                        value: x.value,
                        plantCode: x.plantCode
                    }));

                    setRegisterOptions(formatted);

                }

                // ENTRY LIST
                const entryRes = await apiGetMethod(
                    apiBaseUrl +
                    `RegisterController/getRegisterEntryList/${UserDetails.plantids}/${getCurrentDateString()}`
                );

                if (entryRes.data.success && isMounted) {
                    setEntryList(entryRes.data.results || []);
                }

            } catch (err) {

                console.error(err);

                errorToast("Failed to load initial data");

            }

        };

        loadInitialData();

        return () => {
            isMounted = false;
        };

    }, [UserDetails.plantids]);

    /* ================= DROPDOWN CHANGE ================= */

    const handleRegisterChange = async (value) => {

        const selected = registerOptions.find(
            x => x.value == value
        );

        setSelectedRegister(selected);

        try {

            const res = await apiGetMethod(
                apiBaseUrl +
                `RegisterController/getRegisterDetails/${value}`
            );

            if (res.data.success) {

                const formatted = res.data.results.map(x => ({
                    id: x.reg_det_id,
                    label: x.register_subtype,
                    datatype: x.datatype,
                    options: x.select_array
                        ? JSON.parse(x.select_array)
                        : [],
                    value: "",
                    required: true
                }));

                setSubtypeData(formatted);

                setErrors({});

            }

        } catch {

            errorToast("Failed to load subtype details");

        }

    };

    /* ================= INPUT CHANGE ================= */

    const handleValueChange = (index, value) => {

        const updated = [...subtypeData];

        updated[index].value = value;

        setSubtypeData(updated);

        setErrors(prev => ({
            ...prev,
            [index]: ""
        }));

    };

    /* ================= VALIDATION ================= */

    const validate = () => {

        let newErrors = {};

        subtypeData.forEach((row, index) => {

            if (row.required && !row.value) {
                newErrors[index] = "This field is required";
            }

            if (
                row.datatype === "NUMBER" &&
                row.value
            ) {

                if (isNaN(row.value)) {
                    newErrors[index] = "Only numbers allowed";
                }

            }

        });

        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;

    };

    /* ================= GET ENTRY LIST ================= */

    const getEntryList = async () => {

        try {

            const res = await apiGetMethod(
                apiBaseUrl +
                `RegisterController/getRegisterEntryList/${UserDetails.plantids}/${getCurrentDateString()}`
            );

            if (res.data.success) {
                setEntryList(res.data.results || []);
            }

        } catch {

            errorToast("Failed to load entry list");

        }

    };

    /* ================= SUBMIT ================= */

    const handleSubmit = async () => {

        if (!validate()) {

            errorToast("Please fill all required fields");

            return;

        }

        const payload = {

            register_id: selectedRegister.value,

            plant_code: selectedRegister.plantCode,

            entries: subtypeData.map(x => ({
                subtype_id: x.id,
                value: x.value
            })),

            Created_by: UserDetails.USERID

        };

        try {

            const res = await apiPostMethod(
                apiBaseUrl +
                "RegisterController/saveRegisterEntry",
                payload
            );

            if (res?.data?.success) {

                ShowToast(
                    res.data.message ||
                    "Saved Successfully"
                    
                );
                 window.setTimeout( function() {
           window.location.reload();
         }, 2000);

                setSubtypeData([]);
                setSelectedRegister(null);

                getEntryList();

            } else {

                errorToast(
                    res?.data?.error ||
                    "Save failed"
                );

            }

        } catch (err) {

            console.error(err);

            errorToast(
                "Something went wrong, please try again later..."
            );

        }

    };

    /* ================= FORMAT TABLE DATA ================= */

    const formattedEntryList = entryList.map(item => {

        let detailObj = {};

        item.details.forEach(detail => {

            detailObj[detail.register_subtype] =
                detail.value;

        });

        return {
            ...item,
            ...detailObj
        };

    });

    /* ================= EDIT ================= */

    const handleEdit = (row) => {

        setEditRow(row);

        const formatted = row.details.map(item => ({
            id: item.id,
            register_subtype: item.register_subtype,
            datatype: item.datatype,
            value: item.value,
            options: Array.isArray(item.select_array)
                ? item.select_array
                : []
        }));

        setEditDetails(formatted);

        setEditModal(true);

    };

    /* ================= EDIT VALUE CHANGE ================= */

    const handleEditValueChange = (index, value) => {

        const updated = [...editDetails];

        updated[index].value = value;

        setEditDetails(updated);

    };

    /* ================= UPDATE ================= */

    const handleUpdate = async () => {

        const payload = {

            register_id: editRow.register_id,

            entries: editDetails.map(x => ({
                id: x.id,
                value: x.value
            })),

            updated_by: UserDetails.USERID

        };

        try {

            const res = await apiPostMethod(
                apiBaseUrl +
                "RegisterController/updateRegisterEntry",
                payload
            );

            if (res.data.success) {

                ShowToast(
                    res.data.message ||
                    "Updated Successfully"

                );
                 window.setTimeout( function() {
           window.location.reload();
         }, 2000);

                setEditModal(false);

                getEntryList();

            } else {

                errorToast(
                    res.data.error ||
                    "Update Failed"
                );

            }

        } catch (err) {

            console.error(err);

            errorToast("Failed to update");

        }

    };

    /* ================= DELETE ================= */

    const handleDelete = (row) => {

        console.log("DELETE", row);

    };

    /* ================= TABLE COLUMNS ================= */

    const columns = [

        {
            name: "Register Name",
            selector: row => row.register_name,
            sortable: true
        },

        {
            name: "Plant Code",
            selector: row => row.plant_code,
            sortable: true
        },

        {
            name: "Actions",
            cell: row => (
                <>

                    <Button
                        size="sm"
                        color="primary"
                        onClick={() => handleEdit(row)}
                    >
                        Edit
                    </Button>

                    &nbsp;

                    <Button
                        size="sm"
                        color="danger"
                        onClick={() => handleDelete(row)}
                    >
                        Delete
                    </Button>

                </>
            )
        }

    ];

    /* ================= UI ================= */

    return (

        <>

            <Card>

                <CardHeader>

                    <CardTitle>
                        Register Entry
                    </CardTitle>

                </CardHeader>

                <CardBody>

                    {/* SELECT REGISTER */}

                    <Row className="mb-2">

                        <Col md="4">

                            <Label>
                                Select Register
                            </Label>

                            <Input
                                type="select"
                                value={
                                    selectedRegister?.value || ""
                                }
                                onChange={(e) =>
                                    handleRegisterChange(
                                        e.target.value
                                    )
                                }
                            >

                                <option value="">
                                    Select Register
                                </option>

                                {registerOptions.map((x, i) => (

                                    <option
                                        key={i}
                                        value={x.value}
                                    >
                                        {x.label}
                                    </option>

                                ))}

                            </Input>

                        </Col>

                    </Row>

                    {/* ENTRY FORM */}

                    {subtypeData.length > 0 && (

                        <table className="table table-bordered">

                            <thead
                                style={{
                                    backgroundColor: "#7374f0",
                                    color: "#fff"
                                }}
                            >

                                <tr>

                                    <th
                                        style={{
                                            background: "#7374f0",
                                            color: "white",
                                            width: "20%"
                                        }}
                                    >
                                        Subtype
                                    </th>

                                    <th
                                        style={{
                                            background: "#7374f0",
                                            color: "white",
                                            width: "20%"
                                        }}
                                    >
                                        Value
                                    </th>

                                </tr>

                            </thead>

                            <tbody>

                                {subtypeData.map((row, index) => (

                                    <tr key={index}>

                                        <td>

                                            {row.label}

                                            {row.required && (
                                                <span
                                                    style={{
                                                        color: "red"
                                                    }}
                                                >
                                                    {" "}*
                                                </span>
                                            )}

                                        </td>

                                        <td>

                                            {/* TEXT */}

                                            {row.datatype === "TEXT" && (

                                                <Input
                                                    value={row.value}
                                                    invalid={!!errors[index]}
                                                    onChange={(e) =>
                                                        handleValueChange(
                                                            index,
                                                            e.target.value
                                                        )
                                                    }
                                                />

                                            )}

                                            {/* NUMBER */}

                                            {row.datatype === "NUMBER" && (

                                                <Input
                                                    type="number"
                                                    value={row.value}
                                                    invalid={!!errors[index]}
                                                    onChange={(e) =>
                                                        handleValueChange(
                                                            index,
                                                            e.target.value
                                                        )
                                                    }
                                                />

                                            )}

                                            {/* DATE */}

                                            {row.datatype === "DATE" && (

                                                <Input
                                                    type="date"
                                                    value={row.value}
                                                    invalid={!!errors[index]}
                                                    onChange={(e) =>
                                                        handleValueChange(
                                                            index,
                                                            e.target.value
                                                        )
                                                    }
                                                />

                                            )}

                                            {/* SELECT */}

                                            {row.datatype === "SELECT" && (

                                                <Input
                                                    type="select"
                                                    value={row.value}
                                                    invalid={!!errors[index]}
                                                    onChange={(e) =>
                                                        handleValueChange(
                                                            index,
                                                            e.target.value
                                                        )
                                                    }
                                                >

                                                    <option value="">
                                                        Select
                                                    </option>

                                                    {row.options.map((opt, i) => (

                                                        <option
                                                            key={i}
                                                            value={opt}
                                                        >
                                                            {opt}
                                                        </option>

                                                    ))}

                                                </Input>

                                            )}

                                            {/* RADIO */}

                                            {row.datatype === "RADIO" && (

                                                <div
                                                    style={{
                                                        display: "inline-flex",
                                                        border: "1px solid #ccc",
                                                        borderRadius: "6px",
                                                        overflow: "hidden"
                                                    }}
                                                >

                                                    <Button
                                                        type="button"
                                                        color="success"
                                                        outline={row.value !== "1"}
                                                        active={row.value === "1"}
                                                        style={{
                                                            borderRadius: 0
                                                        }}
                                                        onClick={() =>
                                                            handleValueChange(
                                                                index,
                                                                "1"
                                                            )
                                                        }
                                                    >
                                                        Yes
                                                    </Button>

                                                    <Button
                                                        type="button"
                                                        color="danger"
                                                        outline={row.value !== "0"}
                                                        active={row.value === "0"}
                                                        style={{
                                                            borderRadius: 0
                                                        }}
                                                        onClick={() =>
                                                            handleValueChange(
                                                                index,
                                                                "0"
                                                            )
                                                        }
                                                    >
                                                        No
                                                    </Button>

                                                </div>

                                            )}

                                            {/* ERROR */}

                                            {errors[index] && (

                                                <div
                                                    style={{
                                                        color: "red",
                                                        fontSize: "12px"
                                                    }}
                                                >
                                                    {errors[index]}
                                                </div>

                                            )}

                                        </td>

                                    </tr>

                                ))}

                            </tbody>

                        </table>

                    )}
                    <br></br>
                    <br></br>

                    {/* SUBMIT */}

                    {subtypeData.length > 0 && (

                        <Col sm="12">

                            <FormGroup className="d-flex mb-0 justify-content-end">

                                <Button.Ripple
                                    color="primary"
                                    type="button"
                                    onClick={handleSubmit}
                                >
                                    Submit
                                </Button.Ripple>

                            </FormGroup>

                        </Col>

                    )}

                    <HrLine />
                    <HrLine />

                    {/* ENTRY LIST */}

                    <Card>

                        <CardHeader>

                            <CardTitle>
                                Entry List
                            </CardTitle>

                        </CardHeader>

                        <CardBody>

                            <TableComponent
                                columns={columns}
                                data={formattedEntryList}
                            />

                        </CardBody>

                    </Card>

                </CardBody>

            </Card>

            {/* ================= EDIT MODAL ================= */}

            <Modal
                isOpen={editModal}
                toggle={() => setEditModal(false)}
                size="lg"
                centered
            >

                <ModalHeader toggle={() => setEditModal(false)}>
                    Edit Register Entry
                </ModalHeader>

                <ModalBody>

                    <table className="table table-bordered">

                        <thead
                            style={{
                                backgroundColor: "#7374f0",
                                color: "#fff"
                            }}
                        >

                            <tr>

                                <th
                                    style={{
                                        background: "#7374f0",
                                        color: "#fff"
                                    }}
                                >
                                    Subtype
                                </th>

                                <th
                                    style={{
                                        background: "#7374f0",
                                        color: "#fff"
                                    }}
                                >
                                    Value
                                </th>

                            </tr>

                        </thead>

                        <tbody>

                            {editDetails.map((row, index) => (

                                <tr key={index}>

                                    <td>
                                        {row.register_subtype}
                                    </td>

                                    <td>

                                        {/* TEXT */}

                                        {row.datatype === "TEXT" && (

                                            <Input
                                                value={row.value}
                                                onChange={(e) =>
                                                    handleEditValueChange(
                                                        index,
                                                        e.target.value
                                                    )
                                                }
                                            />

                                        )}

                                        {/* NUMBER */}

                                        {row.datatype === "NUMBER" && (

                                            <Input
                                                type="number"
                                                value={row.value}
                                                onChange={(e) =>
                                                    handleEditValueChange(
                                                        index,
                                                        e.target.value
                                                    )
                                                }
                                            />

                                        )}

                                        {/* DATE */}

                                        {row.datatype === "DATE" && (

                                            <Input
                                                type="date"
                                                value={row.value}
                                                onChange={(e) =>
                                                    handleEditValueChange(
                                                        index,
                                                        e.target.value
                                                    )
                                                }
                                            />

                                        )}

                                        {/* SELECT */}

                                        {row.datatype === "SELECT" && (

                                            <Input
                                                type="select"
                                                value={row.value}
                                                onChange={(e) =>
                                                    handleEditValueChange(
                                                        index,
                                                        e.target.value
                                                    )
                                                }
                                            >

                                                <option value="">
                                                    Select
                                                </option>

                                                {row.options.map((opt, i) => (

                                                    <option
                                                        key={i}
                                                        value={opt}
                                                    >
                                                        {opt}
                                                    </option>

                                                ))}

                                            </Input>

                                        )}

                                        {/* RADIO */}

                                        {row.datatype === "RADIO" && (

                                            <div
                                                style={{
                                                    display: "inline-flex",
                                                    border: "1px solid #ccc",
                                                    borderRadius: "6px",
                                                    overflow: "hidden"
                                                }}
                                            >

                                                <Button
                                                    type="button"
                                                    color="success"
                                                    outline={row.value !== "1"}
                                                    active={row.value === "1"}
                                                    style={{
                                                        borderRadius: 0
                                                    }}
                                                    onClick={() =>
                                                        handleEditValueChange(
                                                            index,
                                                            "1"
                                                        )
                                                    }
                                                >
                                                    Yes
                                                </Button>

                                                <Button
                                                    type="button"
                                                    color="danger"
                                                    outline={row.value !== "0"}
                                                    active={row.value === "0"}
                                                    style={{
                                                        borderRadius: 0
                                                    }}
                                                    onClick={() =>
                                                        handleEditValueChange(
                                                            index,
                                                            "0"
                                                        )
                                                    }
                                                >
                                                    No
                                                </Button>

                                            </div>

                                        )}

                                    </td>

                                </tr>

                            ))}

                        </tbody>

                    </table>

                </ModalBody>

                <ModalFooter>

                    <Button
                        color="primary"
                        onClick={handleUpdate}
                    >
                        Update
                    </Button>

                    <Button
                        color="secondary"
                        onClick={() => setEditModal(false)}
                    >
                        Cancel
                    </Button>

                </ModalFooter>

            </Modal>

        </>

    );

};

export default CRegisterEntry;