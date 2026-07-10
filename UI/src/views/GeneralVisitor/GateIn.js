
    import React, { Fragment, useState } from "react";
    import { useFormik } from "formik";
    import { CustomDropdownInput, CustomTextInput, validation, Yup } from "../forms/custom-form";
    import { SaveCaptureImage, SaveVisitorsCaptureImage, apiBaseUrl, sapFileShare, uploadUrl } from "../../urlConstants";
    import { Row, Col, Button, Label, FormGroup, Input, Card, CardHeader, CardBody } from "reactstrap";
    import { Modal } from "react-bootstrap";
    import { Camera, Check, ChevronDown, ChevronUp, StopCircle, X } from "react-feather";
    import { apiPostMethod, apiGetMethod } from "@helpers/axiosHelper";
    import { ShowToast, errorToast } from "../../helper/appHelper";
    import { useLoader } from "../../utility/hooks/useLoader";
    import { useSelector } from "react-redux";
    import confirmDialog from "../../@core/components/confirm/confirmDialog";
    import { useEffect } from "react";
    import GeneralVisitorList from "./GeneralVisitorList";
    import { RefreshBlock1 } from "../common/RefreshBlock1";
    import Select from 'react-select'
    import ReactSelect from "react-select";
    import Uploader from "../Uploader";
    import CaptureImage from "../CaptureImage";
    import { HrLine } from "../common/HrLine";

    const GeneralVisitorGateIn = () => {

        const UserDetails = useSelector((state) => (state && state.auth ? state.auth.userData : {}));
        let { showLoader, hideLoader } = useLoader();
        const [meetingType, setMeetingType] = useState([])
        const [visitorName, setVisitorName] = useState('')
        const [ImgData, setImgData] = useState({});
        const [itemName, setItemName] = useState("generalVisitors");
        const [checkMeetingType, setCheckMeetingType] = useState(false)
        const [meetingTypeData, setMeetingTypeData] = useState([])
        const [isNagaEmployee, setIsNagaEmployee] = useState(null);

        const [address, setAddress] = useState('')

        const wbOptions = [
            { value: 1, label: "NAGA Employee" },
            { value: 0, label: "OutSiders" },
        ];


        const selectModuleType = (e) => {
            console.log(e);
            setCheckMeetingType(e.value == '' ? true : false)
            setMeetingType(e)
        }

        const form = useFormik({
            isInitialValid: false,
            initialValues: {},
            validationSchema: Yup.object().shape({
                employeeMasterId: validation.required({ message: "Please Select To Meet Person", isObject: true }),
                companyName: meetingType?.value == 12 ? validation.required({ message: "Please Enter Company Name", isObject: false }) : '',
                collegeName: meetingType?.value == 14 || meetingType?.value == 590 ? validation.required({ message: "Please Enter College Name", isObject: false }) : '',
                studentsCount:
                    meetingType?.value == 590
                        ? validation.number({ min: 1, max: 3 })
                        : Yup.mixed().notRequired(),
                visitorPhoneNo: validation.number({ min: 10, max: 10 }),
            }),
            onSubmit() { },
        });
        const showForOutsider = isNagaEmployee?.value == 0;
        const showForNagaEmployee = isNagaEmployee?.value == 1 && form.values.Nagadivision;

        const [attachedFiles, setAttachment] = useState({ idProof: {}, industrialVisitDetails: {} });

        const handleFileChange = (file, id) => {
            setAttachment({
                ...attachedFiles,
                [id]: file,
            });
        };

        const upload = (moduleStatusId) => {
            // if (isNagaEmployee?.value == 0 && !ImgData.generalVisitors) {
            //     errorToast("Please capture visitor image");
            //     return;
            // }
            if (!form.isValid || meetingType == '') {
                setCheckNoOfVisitors(noOfVisitors == '' ? true : false)
                form.setSubmitting(true);
                form.validateForm();
                return;
            }
            else if (noOfVisitors == '') {
                setCheckNoOfVisitors(true)
            }
            else {

                if (!generalVisitorDetails || generalVisitorDetails.length === 0 || generalVisitorDetails[0].visitorName === '') {
                    errorToast("Please enter at least one visitor");
                    return;
                }
                if (isNagaEmployee?.value == 1 && Number(noOfVisitors) > 1) {

                    // collect all selected visitor names
                    const selectedEmployees = generalVisitorDetails
                        .map(v => v.visitorName)
                        .filter(Boolean);

                    // find duplicates
                    const hasDuplicate = new Set(selectedEmployees).size !== selectedEmployees.length;

                    if (hasDuplicate) {
                        errorToast("Same employee cannot be selected for multiple visitors");
                        return;
                    }
                }

                let formData = form.values;

                const fdata = {
                    employeeMasterId: formData.employeeMasterId.value,
                    meetingTypeId: meetingType.value,
                    noOfVisitors: noOfVisitors,
                    companyName: formData.companyName != '' ? formData.companyName : null,
                    collegeName: formData.collegeName != '' ? formData.collegeName : null,
                    address: address,
                    visitorPhoneNo: formData.visitorPhoneNo,
                    studentsCount: formData.studentsCount,
                    moduleStatusId: moduleStatusId,
                    remarks: formData?.remarks,
                    userInfoId: UserDetails.USERID,
                    generalVisitorDetails: generalVisitorDetails,
                    division: formData.Nagadivision?.value,
                };
                if (meetingType?.value == 590) {
                    if (!attachedFiles.industrialVisitDetails || !attachedFiles.industrialVisitDetails.name) {
                        errorToast("Industrial Visit Attachment is mandatory for this meeting type");
                        return;
                    }
                }
                if ((attachedFiles.idProof && attachedFiles.idProof.name)
                    || (attachedFiles.industrialVisitDetails && attachedFiles.industrialVisitDetails.name)
                ) {

                    let postdata = new FormData();

                    if (attachedFiles.idProof) {
                        postdata.append("file[]", attachedFiles.idProof);
                    }
                    if (attachedFiles.industrialVisitDetails) {
                        postdata.append("file[]", attachedFiles.industrialVisitDetails);
                    }

                    postdata.append("form_name", 'GeneralVisitor');
                    postdata.append("SubFolder", "FG_GateOut");

                    showLoader();
                    apiPostMethod(sapFileShare, postdata, "File")
                        .then((response) => {
                            const { data } = response;
                            if (data.success) {
                                if (attachedFiles.idProof) {
                                    const idProofFile = data.files.find(
                                        (f) => f.orgname === attachedFiles.idProof.name
                                    );
                                    fdata.idProof = idProofFile?.updname || idProofFile?.orgname || "";
                                }

                                if (attachedFiles.industrialVisitDetails) {
                                    const visitFile = data.files.find(
                                        (f) => f.orgname === attachedFiles.industrialVisitDetails.name
                                    );
                                    fdata.industrialVisitDetails = visitFile?.updname || visitFile?.orgname || "";
                                }
                                saveImage(fdata);
                            }
                        })
                        .catch((error) => {
                            errorToast("Something went wrong, please try again after sometime");
                        })
                        .finally((a) => {
                            hideLoader();
                        });
                } else {
                    saveImage(fdata);
                }
            }
        };

        const saveImage = (fdata) => {
            if (ImgData.generalVisitors) {
                let postdata = new FormData();
                Object.keys(attachedFiles).forEach((key) => {
                    postdata.append("file[]", attachedFiles[key]);
                });

                postdata.append("image[]", ImgData.generalVisitors);

                postdata.append("form_name", 'GeneralVisitor');
                postdata.append("SubFolder", "FG_GateOut");
                postdata.append("userInfoId", UserDetails.USERID);

                showLoader();
                apiPostMethod(SaveVisitorsCaptureImage, postdata, "File")
                    .then((response) => {
                        const { data } = response;
                        if (data.success) {
                            fdata.imagePath = data.files[0] ? data.files[0].updname : "";
                            console.log("data 2");
                            console.log(data);
                            gateIn(fdata);

                        } else {
                            errorToast(data.files[0].orgname + " file format is not supported ");
                        }
                    })
                    .catch((error) => {
                        errorToast("Something went wrong, please try again after sometime");
                    })
                    .finally((a) => {
                        hideLoader();
                    });
            } else {
                gateIn(fdata);
            }
        }

        const gateIn = (fdata) => {

            showLoader();
            console.log(apiBaseUrl + "GatePro/Gate/addGeneralVisitorInfo", fdata);
            apiPostMethod(apiBaseUrl + "GatePro/Gate/addGeneralVisitorInfo", fdata)
                .then((response) => {
                    const res = response.data;
                    if (res.success == true) {
                        confirmDialog({
                            title: `<h5><strong class="text-white">` + res.message + `</strong></h5>`, cancelButton: false, confirmText: false, confirmButton: false, background: `#51A351`
                        }).then(() => {
                            window.location.reload();  // Reloads the page after the confirm dialog is closed
                        });
                        form.resetForm()
                        getGeneralVisitorInfo()
                        setMeetingType([])
                        setGeneralVisitorDetails([])
                        setGeneralVisitorDetailsData([])
                        setNoOfVisitors([])
                        setImgData({})
                        setAttachment({ idProof: {} })
                        setItemName("")
                        setCheckNoOfVisitors(false)
                        setAddress('')
                        setResetCapture(prev => !prev);

                        console.log(apiBaseUrl + "GatePro/Document/sendEmail", fdata);
                        apiPostMethod(apiBaseUrl + "GatePro/Document/sendEmail", fdata)
                            .then((response) => {
                                const { data } = response;
                                if (data.success == true) {
                                    console.log(data.message);
                                } else if (data.success == false) {
                                    console.log(data.message);
                                }
                            })
                            .catch((error) => {
                                console.log(JSON.stringify(error))
                                errorToast("Something went wrong, please try again after sometime");
                            })
                    }
                    else if (res.success == false) {
                        confirmDialog({
                            title: `<h5><strong class="text-white">` + res.message + `</strong></h5>`, cancelButton: false, confirmText: false, confirmButton: false, background: `#BD362F`
                        })
                    }
                })
                .catch((error) => {
                    console.log(error)
                    errorToast("Something went wrong, please try again after sometime");
                })
                .finally((a) => {
                    hideLoader();
                });
        }

        const [landingData, setLandingData] = useState([]);

        const getGeneralVisitorInfo = () => {
            console.log(apiBaseUrl + `GatePro/Gate/getGeneralVisitorInfo/${UserDetails.USERID}`);
            apiGetMethod(apiBaseUrl + `GatePro/Gate/getGeneralVisitorInfo/${UserDetails.USERID}`)
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

        const getMeetingType = () => {
            console.log(apiBaseUrl + `GatePro/Master/getDefinitionsList/5`);
            apiGetMethod(apiBaseUrl + `GatePro/Master/getDefinitionsList/5`)
                .then((response) => {
                    const data = response.data;
                    if (data.success == true) {
                        setMeetingTypeData(data.results)
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

        const [noOfVisitors, setNoOfVisitors] = useState('');
        const [checkNoOfVisitors, setCheckNoOfVisitors] = useState(false);
        const [generalVisitorDetailsData, setGeneralVisitorDetailsData] = useState([]);
        const [generalVisitorDetails, setGeneralVisitorDetails] = useState([]);
        const [resetCapture, setResetCapture] = useState(false);

        const addInput = (noOfVisitors) => {
            setCheckNoOfVisitors(noOfVisitors == '' ? true : false)
            setNoOfVisitors(noOfVisitors)
            const newData = [];

            for (let i = 0; i < noOfVisitors; i++) {
                newData.push({
                    generalVisitorId: i + 1,
                    visitorName: '',
                    visitorTagId: '',
                })
            }
            setGeneralVisitorDetailsData(newData)
        }

        function addContractPersons(field, value, visitorId, extra = {}) {
            const index = generalVisitorDetails.findIndex(
                (item) => item.generalVisitorId === visitorId
            );

            if (index !== -1) {
                generalVisitorDetails[index][field] = value;
                if (extra.empdesign) {
                    generalVisitorDetails[index].empdesign = extra.empdesign;
                }
            } else {
                generalVisitorDetails.push({
                    generalVisitorId: visitorId,
                    visitorName: field === "visitorName" ? value : "",
                    visitorTagId: field === "visitorTagId" ? value : "",
                    empdesign: extra.empdesign || ""
                });
            }
            console.log("Updated Visitors:", generalVisitorDetails);
        }
        useEffect(() => {
            // Reset form values
            form.resetForm();

            // Clear meeting & visitor related data
            setMeetingType([]);
            setCheckMeetingType(false);
            setNoOfVisitors('');
            setGeneralVisitorDetails([]);
            setGeneralVisitorDetailsData([]);
            setAddress('');
            setImgData({});
            setAttachment({ idProof: {}, industrialVisitDetails: {} });

            // Reset capture component
            setResetCapture(prev => !prev);
        }, [isNagaEmployee]);

        const OFFICIAL_MEET_ID = 11; // change this to actual value from API

        useEffect(() => {
            if (isNagaEmployee?.value == 1 && meetingTypeData.length > 0) {
                const officialMeet = meetingTypeData.find(
                    (m) => m.value == OFFICIAL_MEET_ID
                );

                if (officialMeet) {
                    setMeetingType(officialMeet);
                    setCheckMeetingType(false);
                }
            }

            // OPTIONAL: reset when switching back to Outsider
            if (isNagaEmployee?.value == 0) {
                setMeetingType([]);
            }
        }, [isNagaEmployee, meetingTypeData]);


        useEffect(() => {
            getGeneralVisitorInfo()
            getMeetingType()
        }, [])
        

        return (
            <Fragment>
                <Card>
                    <CardHeader><h5>General Visiter - Gate In</h5><RefreshBlock1 /></CardHeader>
                    <hr />
                    <CardBody>
                        <Row>
                            <Col md="4" sm="4">
                                <FormGroup>
                                    <Label>Vistor Type</Label>
                                    <ReactSelect
                                        options={wbOptions}
                                        value={isNagaEmployee}
                                        onChange={(selected) => setIsNagaEmployee(selected)}
                                        placeholder="Select"
                                    />
                                </FormGroup>
                            </Col>
                            {isNagaEmployee?.value === 1 && (
                                <Col md="4" sm="12">
                                    <FormGroup>
                                        <Label>Division</Label>
                                        <CustomDropdownInput
                                            url={`${apiBaseUrl}GatePro/Gate/getDivision`}
                                            name="Nagadivision"
                                            id="Nagadivision"
                                            form={form}
                                        />
                                    </FormGroup>
                                </Col>
                            )}

                        </Row>
                        {(showForOutsider || showForNagaEmployee) && (
                            <>
                                <HrLine />
                                <Col md="12" sm="12">
                                    <h4 className="text-primary"><u>Visitors Name</u></h4><br />
                                </Col>
                                <Row>

                                    <Col sm="4" md="4">
                                        <FormGroup>
                                            <Label>No of Visitors</Label>
                                            <Input type="text" placeholder="No of Visitors" onChange={(e) => addInput(e.target.value)} value={noOfVisitors} />
                                            {checkNoOfVisitors ? <Label className='text-danger'>Please Enter No of Visitors</Label> : null}
                                        </FormGroup>
                                    </Col>
                                </Row>
                                <Row>
                                    {generalVisitorDetailsData.map((data) => (
                                        <React.Fragment key={data.generalVisitorId}>
                                            <Col sm="4" md="4">
                                                <FormGroup>
                                                    <Label>
                                                        {isNagaEmployee?.value === 1 ? "Employee Name" : "Visitor Name"}
                                                    </Label>

                                                    {isNagaEmployee?.value == 1 ? (
                                                        <CustomDropdownInput
                                                            url={`${apiBaseUrl}GatePro/Gate/getemplyeedetails/${form.values.Nagadivision?.value || ""}`}
                                                            name={`visitorName_${data.generalVisitorId}`}
                                                            id={`visitorName_${data.generalVisitorId}`}
                                                            form={form}
                                                            onChange={(selected) => {
                                                                // ✅ THIS LINE FIXES THE DISPLAY
                                                                form.setFieldValue(
                                                                    `visitorName_${data.generalVisitorId}`,
                                                                    selected
                                                                );
                                                                if (
                                                                    isNagaEmployee?.value === 1 &&
                                                                    data.generalVisitorId === 1 &&
                                                                    selected?.mobilenumber
                                                                ) {
                                                                    form.setFieldValue("visitorPhoneNo", selected.mobilenumber);
                                                                }

                                                                // existing logic (UNCHANGED)
                                                                addContractPersons(
                                                                    "visitorName",
                                                                    selected?.EMPNAME || "",
                                                                    data.generalVisitorId,
                                                                    { empdesign: selected?.empdesign }
                                                                );
                                                            }}
                                                        />
                                                    ) : (
                                                        <Input
                                                            type="text"
                                                            placeholder="Enter Visitor Name"
                                                            onChange={(e) =>
                                                                addContractPersons(
                                                                    "visitorName",
                                                                    e.target.value,
                                                                    data.generalVisitorId
                                                                )
                                                            }
                                                        />
                                                    )}
                                                </FormGroup>
                                            </Col>
                                            {isNagaEmployee?.value === 1 && (                                        
                                            <Col sm="4" md="4">
                                                <FormGroup>
                                                    <Label>Designation</Label>
                                                    <Input
                                                        type="text"
                                                        value={
                                                            generalVisitorDetails.find(
                                                                (v) => v.generalVisitorId === data.generalVisitorId
                                                            )?.empdesign || ""
                                                        }
                                                        disabled
                                                        placeholder="Designation"
                                                    />
                                                </FormGroup>
                                            </Col>
                                            )}
                                            <Col sm="4" md="4">
                                                <FormGroup>
                                                    <Label>Tag ID No</Label>
                                                    <Input
                                                        type="text"
                                                        placeholder="Enter Tag ID No"
                                                        onChange={(e) =>
                                                            addContractPersons("visitorTagId", e.target.value, data.generalVisitorId)
                                                        }
                                                    />
                                                </FormGroup>
                                            </Col>
                                        </React.Fragment>
                                    ))}
                                </Row>
                            </>
                        )}
                        {(showForOutsider || showForNagaEmployee) && (
                            <Row>
                                <Col md="12" sm="12">
                                    <h4 className="text-primary"><u>General Details</u></h4><br />
                                </Col>
                                <Col sm="4" md="4">
                                    <FormGroup>
                                        <CustomDropdownInput
                                            url={`${apiBaseUrl}GatePro/Master/getEmployeeDetails/${UserDetails.USERID}`}
                                            label={"Person to Meet"}
                                            form={form}
                                            id="employeeMasterId"
                                            onChange={(selected) => {
                                                form.setFieldValue("employeeMasterId", selected);
                                                // Auto populate department & division
                                                form.setFieldValue("emp_mobile_number", selected?.emp_mobile_number || "");
                                                form.setFieldValue("department", selected?.emp_department || "");
                                                form.setFieldValue("division", selected?.emp_division || ""); 
                                            }}
                                        />
                                    </FormGroup>
                                </Col>
                                <Col sm="4" md="4">
                                    <FormGroup>
                                        <Label>MobileNumber</Label>
                                        <Input
                                            type="text"
                                            placeholder="MobileNumber"
                                            value={form.values.emp_mobile_number || ""}
                                            disabled
                                        />
                                    </FormGroup>
                                </Col>
                                <Col sm="4" md="4">
                                    <FormGroup>
                                        <Label>Department</Label>
                                        <Input
                                            type="text"
                                            placeholder="Department"
                                            value={form.values.department || ""}
                                            disabled
                                        />
                                    </FormGroup>
                                </Col>

                                <Col sm="4" md="4">
                                    <Label>Division</Label>
                                    <FormGroup>
                                        <Input
                                            type="text"
                                            placeholder="Division"
                                            value={form.values.division || ""}
                                            disabled
                                        />
                                    </FormGroup>
                                </Col>
                                <Col sm="4" md="4">
                                    <FormGroup>
                                        <Label>Purpose of Visit</Label>
                                        <ReactSelect
                                            options={meetingTypeData}
                                            value={meetingType}
                                            onChange={selectModuleType}
                                            isDisabled={isNagaEmployee?.value == 1}
                                        />
                                        {checkMeetingType ? <Label className='text-danger'>Please Select purpose of Meet</Label> : null}
                                    </FormGroup>
                                </Col>

                                {meetingType?.value == 12 ?
                                    <Col md="4" sm="4">
                                        <FormGroup>
                                            <CustomTextInput label={"Company Name"} type="text" form={form} id="companyName" />
                                        </FormGroup>
                                    </Col> : null
                                }
                                {(meetingType?.value == 14 || meetingType?.value == 590) ?
                                    <Col md="4" sm="4">
                                        <FormGroup>
                                            <CustomTextInput label={meetingType?.value == 590 ? "College/School Name" : "College Name"} type="text" form={form} id="collegeName" />
                                        </FormGroup>
                                    </Col> : null
                                }
                                {(meetingType?.value == 590) ?
                                    <Col md="4" sm="4">
                                        <FormGroup>
                                            <CustomTextInput label={"Students Count"} type="number" form={form} id="studentsCount" />
                                        </FormGroup>
                                    </Col> : null
                                }
                                <Col md="4" sm="4">
                                    <CustomTextInput
                                        label={"Visitor Phone No"}
                                        type="text"
                                        form={form}
                                        id="visitorPhoneNo"
                                        disabled={isNagaEmployee?.value == 1}
                                    />
                                </Col>
                                {(meetingType?.value != 14 && meetingType?.value != 590) ?
                                    <Col md="8" sm="8">
                                        <FormGroup>
                                            <Label>Address</Label>
                                            <Input type='text' value={address} placeholder='Enter Address' onChange={(e) => setAddress(e.target.value)} />
                                        </FormGroup>
                                    </Col> : null
                                }
                                <Col md="4" sm="4">
                                    <FormGroup>
                                        <CustomTextInput label={"Remarks"} type="text" form={form} id="remarks" />
                                    </FormGroup>
                                </Col>

                                <Col sm="8" md="8" className='mt-2'>
                                    <FormGroup className="d-flex justify-content-start mb-0">
                                        <div className="mr-1">
                                            <div style={{ marginBottom: "7px" }}></div>
                                            <Label><b>Attachments :</b></Label>
                                        </div>
                                        <div className="mr-1">
                                            <Uploader
                                                setAttachment={handleFileChange}
                                                title="ID Proof"
                                                id={"idProof"}
                                                selectedFileName={attachedFiles.idProof.name}
                                            />
                                        </div>
                                        {meetingType?.value == 590 && (
                                            <div className="mr-1">
                                                <Uploader
                                                    setAttachment={handleFileChange}
                                                    title="Industrial Visit"
                                                    id={"industrialVisitDetails"}
                                                    selectedFileName={attachedFiles.industrialVisitDetails.name}
                                                />
                                            </div>)}
                                        <CaptureImage ImgData={ImgData} setImgData={setImgData} ItemName={itemName} resetTrigger={resetCapture} />
                                    </FormGroup>
                                </Col>

                                <Col md="12" sm="12"><hr></hr></Col>



                                <Col sm="12" md="12">
                                    <label></label>
                                    <FormGroup className="d-flex justify-content-end mb-0">
                                        {/* <div className="mr-1">
                                        <Button.Ripple outline color="primary" type="button" onClick={() => gateIn(6)}>
                                            <StopCircle size={16} /> Wait OutSide
                                        </Button.Ripple>
                                    </div> */}
                                        <Button.Ripple color="primary" type="button" onClick={() => upload(1)}>
                                            <Check size={16} /> Gate In
                                        </Button.Ripple>
                                    </FormGroup>
                                </Col>
                            </Row>
                        )}
                    </CardBody>
                </Card>

                {/* {landingData != '' ?  */}
                <GeneralVisitorList data={landingData} setData={setLandingData} getGeneralVisitorInfo={getGeneralVisitorInfo} /> 
                 {/* : null */}
            </Fragment >
        );
    };

    export default GeneralVisitorGateIn;
