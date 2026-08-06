import { useFormik } from 'formik';
import React, { Fragment, useRef, useState } from 'react';
import {
    Row,
    Col,
    Button,
    FormGroup,
    Input,
    Label
} from 'reactstrap';
import { apiBaseUrl } from '../../urlConstants';
import { CardComponent } from '../common/CardComponent';
import { apiPostMethod } from "@helpers/axiosHelper";
import { Yup, CustomDropdownInput } from '../forms/custom-form';
import { HrLine } from '../common/HrLine';
import { useLoader } from "../../utility/hooks/useLoader";
import { errorToast, ShowToast } from '../../helper/appHelper';
import { useSelector } from 'react-redux';
import { Settings, Layers, List } from 'react-feather';

const styles = {
    cardHeader: {
        background: "#7367f0",
        color: "#ffffff",
        borderRadius: "0.375rem 0.375rem 0 0",
        padding: "0.85rem 1.25rem",
        display: "flex",
        alignItems: "center",
        gap: "0.6rem",
        marginBottom: "1rem",
    },
    cardTitle: {
        color: "#ffffff",
        marginBottom: 0,
    },
    subHeader: {
        background: "#e8f1fb",
        color: "#1b4f8c",
        fontWeight: 600,
        padding: "0.6rem 1rem",
        borderRadius: "0.25rem",
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
        marginBottom: "0.75rem",
        borderLeft: "4px solid #1b4f8c",
    },
    table: {
        marginBottom: 0,
    },
    tableHeaderRow: {
        background: "#1b4f8c",
    },
    tableHeaderCell: {
        color: "#ffffff",
        border: "1px solid #1b4f8c",
    },
};

function CRateConditiontype() {

    const UserDetails = useSelector((state) =>
        (state && state.auth ? state.auth.userData : {})
    );

    const { showLoader, hideLoader } = useLoader();

    const [conditionList, setConditionList] = useState([]);

    const [segmentSearchText, setSegmentSearchText] = useState("");
    const [segmentSuggestions, setSegmentSuggestions] = useState([]);
    const [showSegmentSuggestions, setShowSegmentSuggestions] = useState(false);
    const segmentSearchDebounceRef = useRef(null);

    /* ================= FORMIK ================= */
    const form = useFormik({
        initialValues: {
            valid_from: "",
            valid_to: "",
            purchase_org: null,
        },
        validationSchema: Yup.object().shape({
            valid_from: Yup.string().nullable(),
            valid_to: Yup.string().nullable(),
            purchase_org: Yup.object().nullable(),
        }),
        onSubmit: () => { },
    });

    /* ================= FETCH PURCHASE ORG DETAILS ================= */
    const fetchPurchaseOrgDetails = (purchaseorg) => {

        showLoader();

        apiPostMethod(
            apiBaseUrl + "CustomMillingMasterController/fetchPurchaseOrgDetails",
            { purchaseorg }
        )
            .then((response) => {

                if (response?.data?.success === 1) {

                    const apiData = response.data.results;

                    const updatedData = apiData.map(item => ({
                        ...item,
                        rate: 0
                    }));

                    setConditionList(updatedData);
                } else {
                    setConditionList([]);
                }
            })
            .catch(() => {
                errorToast("Failed to fetch purchase org details");
            })
            .finally(() => {
                hideLoader();
            });
    };

    /* ================= SEGMENT SEARCH (SAP) ================= */
    const searchSegments = (searchText) => {
        if(searchText.length < 7) {
            // setSegmentSuggestions([]);
            return;
        }
        apiPostMethod(apiBaseUrl + `CustomMillingMasterController/getSegment/${searchText}`)
            .then((response) => {

                const { data } = response;

                if (data?.success === 1 && Array.isArray(data.results) && data.results[0]?.MATERIAL_CODE) {

                    const options = data.results.map(item => ({
                        label: `${searchText} - ${item.SEGMENT_DEC}`,
                        value: searchText,
                        material_description: item.SEGMENT_DEC,
                        material_code: item.MATERIAL_CODE

                    }));

                    setSegmentSuggestions(options);
                } else {
                    setSegmentSuggestions([]);
                }
            })
            .catch(() => {
                setSegmentSuggestions([]);
            });
    };

    const handleSegmentInputChange = (e) => {

        const value = e.target.value;
        setSegmentSearchText(value);
        setShowSegmentSuggestions(true);

        if (segmentSearchDebounceRef.current) {
            clearTimeout(segmentSearchDebounceRef.current);
        }

        if (!value || value.trim() === "") {
            setSegmentSuggestions([]);
            return;
        }

        segmentSearchDebounceRef.current = setTimeout(() => {
            searchSegments(value.trim());
        }, 400);
    };

    const handleSegmentSelect = (selected) => {

        setSegmentSearchText(selected.label);
        setShowSegmentSuggestions(false);
        setSegmentSuggestions([]);

        form.setFieldValue("segment", selected);
        form.setFieldValue("material_description", selected.material_description);
        form.setFieldValue("material_code", selected.material_code);
    };

    /* ================= SUBMIT ================= */
    const handlesubmitButtonClick = () => {

        const hasAtLeastOneRate = conditionList.some(
            item => item.rate && item.rate.toString().trim() !== ""
        );

        if (!hasAtLeastOneRate) {
            errorToast("Please enter at least one Rate in the Condition table");
            return;
        }

        const hasInvalidMate = conditionList.some(
            item => item.condition_type_code === "MATE" && !(Number(item.rate) > 0)
        );

        if (hasInvalidMate) {
            errorToast("Please enter a Rate greater than 0 for MATE");
            return;
        }

        const postData = {
            valid_from: form.values.valid_from || null,
            valid_to: form.values.valid_to || null,
            purchase_org: form.values.purchase_org?.value || null,
            material_code: form.values.material_code,
            material_description: form.values.material_description,
            segment: form.values.segment?.value,
            conditions: conditionList,
            created_by: UserDetails.USERID,
        };


        const { valid_from, valid_to } = form.values;

        // VALID FROM VALIDATION
        if (!valid_from) {
            errorToast("Please select Valid From date");
            return;
        }

        // VALID TO VALIDATION
        if (!valid_to) {
            errorToast("Please select Valid To date");
            return;
        }
        showLoader();

        apiPostMethod(apiBaseUrl + "CustomMillingMasterController/InsertValidDetails", postData)
            .then((response) => {
                const { data } = response;
                console.log("Response from InsertValidDetails:", data.error); // Debugging line
                if (data.error) {
                    errorToast(data.error || "Unable to save");
                    return;
                }
                if (data.results.success === true) {
                    ShowToast("Saved Successfully...");
                    setTimeout(() => window.location.reload(), 2000);
                }

            })
            .catch(() => {
                errorToast("Something went wrong, please try again later");
            })
            .finally(() => {
                hideLoader();
            });
    };

    return (
        <div>
             <div style={styles.cardHeader}>
                        <Settings size={22} />
                        <h2 style={{ ...styles.cardTitle, fontSize: "1.35rem" }}>Custom Milling Rate Details</h2>
             </div>
            <Fragment>
                <CardComponent>
                   
                    <Row>

                        {/* VALID FROM */}
                        <Col md="4" sm="12">
                            <FormGroup>
                                <Label>Valid From</Label>
                                <Input
                                    type="date"
                                    value={form.values.valid_from}
                                    onChange={(e) =>
                                        form.setFieldValue("valid_from", e.target.value)
                                    }
                                    onKeyDown={(e) => e.preventDefault()}
                                />
                            </FormGroup>
                        </Col>

                        {/* VALID TO */}
                        <Col md="4" sm="12">
                            <FormGroup>
                                <Label>Valid To</Label>
                                <Input
                                    type="date"
                                    value={form.values.valid_to}
                                    min={new Date().toISOString().split("T")[0]}
                                    onChange={(e) =>
                                        form.setFieldValue("valid_to", e.target.value)
                                    }
                                    onKeyDown={(e) => e.preventDefault()}
                                />
                            </FormGroup>
                        </Col>

                        {/* PURCHASE ORG */}
                        <Col md="4" sm="12">
                            <CustomDropdownInput
                                label="Purchase ORG"
                                url={`${apiBaseUrl}CustomMillingMasterController/getpurchaseorg`}
                                id="purchase_org"
                                name="purchase_org"
                                form={form}
                                onChange={(selected) => {

                                    form.setFieldValue("purchase_org", selected);

                                    if (selected?.definitionsvalues) {
                                        fetchPurchaseOrgDetails(selected.definitionsvalues);
                                    }

                                }}
                            />
                        </Col>

                    </Row>
                    <Row>
                        <Col md="4" sm="12" style={{ position: "relative" }}>
                            <FormGroup>
                                <Label>Segment</Label>
                                <Input
                                    type="text"
                                    placeholder="Type to search segment..."
                                    autoComplete="off"
                                    value={segmentSearchText}
                                    onChange={handleSegmentInputChange}
                                    onFocus={() => {
                                        if (segmentSuggestions.length > 0) {
                                            setShowSegmentSuggestions(true);
                                        }
                                    }}
                                    onBlur={() => {
                                        setTimeout(() => setShowSegmentSuggestions(false), 150);
                                    }}
                                />
                                {showSegmentSuggestions && segmentSuggestions.length > 0 && (
                                    <div
                                        className="list-group"
                                        style={{
                                            position: "absolute",
                                            zIndex: 1000,
                                            width: "100%",
                                            maxHeight: "200px",
                                            overflowY: "auto",
                                            border: "1px solid #d8d6de",
                                            borderRadius: "0.357rem",
                                            background: "#fff",
                                        }}
                                    >
                                        {segmentSuggestions.map((option) => (
                                            <button
                                                type="button"
                                                key={option.value}
                                                className="list-group-item list-group-item-action"
                                                onMouseDown={() => handleSegmentSelect(option)}
                                            >
                                                {option.label}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </FormGroup>
                        </Col>
                        {/* MATERIAL DESCRIPTION */}
                        {/* <Col md="4">
                            <FormGroup>
                                <Label>Material Code</Label>
                                <Input
                                    type="text"
                                    value={form.values.material_code}
                                    disabled
                                />
                            </FormGroup>
                        </Col>

                        {/* SEGMENT */}
                        {/* <Col md="4">
                            <FormGroup>
                                <Label>Material Description</Label>
                                <Input
                                    type="text"
                                    value={form.values.material_description}
                                    disabled
                                />
                            </FormGroup>
                        </Col>  */}

                    </Row>
                    <br />
                    <div style={styles.subHeader}>
                        <Layers size={16} />
                        <span>Material Rate Details</span>
                    </div>
                    {conditionList.filter(item => item.condition_type_code === "MATE").length > 0 && (
                        <Row className="mt-2">
                            <Col sm="12">
                                <table className="table table-bordered">
                                    <thead className="bg-primary text-white">
                                        <tr>
                                            <th className="bg-primary text-white">Condition Type Code</th>
                                            <th className="bg-primary text-white">Condition Description</th>
                                            {/* <th>sE</th> */}
                                            <th className="bg-primary text-white">Material Code</th>
                                            <th className="bg-primary text-white">Material Description</th>
                                            <th className="bg-primary text-white">Rate (TON)</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {conditionList.map((item, index) => (
                                            item.condition_type_code === "MATE" && (
                                                <tr key={item.ctm_id}>
                                                    <td>
                                                        <Input
                                                            type="text"
                                                            value={item.condition_type_code}
                                                            disabled
                                                        />
                                                    </td>
                                                    <td>
                                                        <Input
                                                            type="text"
                                                            value={item.condition_description}
                                                            disabled
                                                        />
                                                    </td>
                                                    {/* <td>
                                                        <DropdownControl
                                                            options={materialOptions}
                                                            selectedValue={item.material_segment || null}
                                                            onDdlChange={(selected) => {

                                                                const updatedList = [...conditionList];
                                                                updatedList[index] = {
                                                                    ...updatedList[index],
                                                                    material_segment: selected,
                                                                    material_code: selected?.material_code || "",
                                                                    material_description: selected?.material_description || ""
                                                                };
                                                                setConditionList(updatedList);
                                                            }}
                                                            placeholder="Select Material"
                                                        />
                                                    </td> */}
                                                    <td>
                                                        <Input
                                                            type="text"
                                                            value={form.values.material_code || ""}
                                                            disabled
                                                        />
                                                    </td>
                                                    <td>
                                                        <Input
                                                            type="text"
                                                            value={form.values.material_description || ""}
                                                            disabled
                                                        />
                                                    </td>
                                                    <td>
                                                        <Input
                                                            type="number"
                                                            step="0.01"
                                                            min="0"
                                                            value={item.rate}
                                                            onChange={(e) => {

                                                                let value = e.target.value;

                                                                if (/^\d*\.?\d{0,2}$/.test(value)) {

                                                                    const updatedList = [...conditionList];
                                                                    updatedList[index].rate = value;
                                                                    setConditionList(updatedList);
                                                                }
                                                            }}
                                                        />
                                                    </td>
                                                </tr>
                                            )
                                        ))}
                                    </tbody>
                                </table>
                            </Col>
                        </Row>
                    )}
                    <br />
                    <div style={styles.subHeader}>
                        <List size={16} />
                        <span>Condition Details</span>
                    </div>
                    {/* ================= TABLE ================= */}
                    {conditionList.filter(item => item.condition_type_code !== "MATE").length > 0 && (
                        <Row className="mt-2">
                            <Col sm="12">
                                <table className="table table-bordered">
                                    <thead className="text-white">
                                        <tr>
                                            <th className="bg-primary text-white" >Condition Type Code</th>
                                            <th className="bg-primary text-white">Condition Description</th>
                                            <th className="bg-primary text-white">Rate (TON)</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {conditionList.map((item, index) => (
                                            item.condition_type_code !== "MATE" && (
                                                <tr key={item.ctm_id}>
                                                    <td>
                                                        <Input
                                                            type="text"
                                                            value={item.condition_type_code}
                                                            disabled
                                                        />
                                                    </td>
                                                    <td>
                                                        <Input
                                                            type="text"
                                                            value={item.condition_description}
                                                            disabled
                                                        />
                                                    </td>
                                                    <td>
                                                        <Input
                                                            type="number"
                                                            step="0.01"
                                                            min="0"
                                                            value={item.rate}
                                                            onChange={(e) => {

                                                                let value = e.target.value;

                                                                // Allow only numbers with max 2 decimal places
                                                                if (/^\d*\.?\d{0,2}$/.test(value)) {

                                                                    const updatedList = [...conditionList];
                                                                    updatedList[index].rate = value;
                                                                    setConditionList(updatedList);
                                                                }
                                                            }}
                                                        />

                                                    </td>
                                                </tr>
                                            )
                                        ))}
                                    </tbody>
                                </table>
                            </Col>
                        </Row>
                    )}

                    {/* ================= MATE CONDITION TABLE ================= */}


                    {/* ================= SUBMIT BUTTON ================= */}
                    <Col sm="12">
                        <FormGroup className="d-flex mb-0 justify-content-end">
                            <Button.Ripple
                                color="primary"
                                type="button"
                                onClick={handlesubmitButtonClick}
                            >
                                Submit
                            </Button.Ripple>
                        </FormGroup>
                    </Col>

                    <HrLine />

                </CardComponent>
            </Fragment>
        </div>
    );
}

export default CRateConditiontype;
