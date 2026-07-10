import React, { Fragment, useState } from "react";
import { useFormik } from "formik";
import { CustomDropdownInput, CustomTextInput, validation, Yup } from "../forms/custom-form";
import { apiBaseUrl } from "../../urlConstants";
import { Row, Col, Button, Label, FormGroup, Input, Card, CardHeader, CardBody, InputGroup } from "reactstrap";
import { Modal } from "react-bootstrap";
import { Check, ChevronDown, ChevronUp, Search, StopCircle, X } from "react-feather";
import { apiPostMethod, apiGetMethod } from "@helpers/axiosHelper";
import { ShowToast, errorToast } from "../../helper/appHelper";
import { useLoader } from "../../utility/hooks/useLoader";
import { useSelector } from "react-redux";
import confirmDialog from "../../@core/components/confirm/confirmDialog";
import { useEffect } from "react";
import { RefreshBlock1 } from "../common/RefreshBlock1";
import moment from "moment";

const FoodBill = () => {

    const UserDetails = useSelector((state) => (state && state.auth ? state.auth.userData : {}));
    let { showLoader, hideLoader } = useLoader();

    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')
    const [totalDays, setTotalDays] = useState('')
    const [poNo, setPoNo] = useState('');
    const [poDetails, setPoDetails] = useState('');
    

    const getPoDetails = (type) => {
        showLoader();
        const poNumber = { poNumber: poNo, moduleTypeId: 12 }
        apiPostMethod(apiBaseUrl + `GatePro/Master/getPoDetails`, poNumber)
            .then((response) => {
                const { data } = response;
                if (data.success == true) {
                    setPoDetails(data.data[0])
                } else {
                    // errorToast(data.message)
                    setPoDetails('show')
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

    const form = useFormik({
        isInitialValid: false,
        initialValues: {},
        validationSchema: Yup.object().shape({
            workNatureId: validation.required({ message: "Please Select Nature Of Work", isObject: true }),
            prefferedShiftId: validation.required({ message: "Please Select Preffered Shift", isObject: true }),
            masterPlantId: validation.required({ message: "Please Select Location Name", isObject: true }),
            supervisorId: validation.required({ message: "Please Select Supervisor Name", isObject: true }),
            contractorName: validation.required({ message: "Please Enter Contractor Name", isObject: false }),
            noOfPerson: validation.required({ message: "Please Enter No Of Persons", isObject: false })
        }),
        onSubmit() { },
    });

    function days_between(date1, date2) {

        setStartDate(date1)
        setEndDate(date2)

        const startDate = new Date(moment(date1).format('YYYY-MM-DD'));
        const endDate = new Date(moment(date2).format('YYYY-MM-DD'));

        const ONE_DAY = 1000 * 60 * 60 * 24;
        const differenceMs = Math.abs(startDate.getTime() - endDate.getTime());
        let totalDays = Math.round(differenceMs / ONE_DAY);
        setTotalDays(totalDays);
    }

    const addWorkPermit = () => {


        let formData = form.values;
        const postdata = {
            vendorId: formData.hotelName?.value,
            employeeId: employeeId,
            shiftId: shiftId,
            shiftTime: shiftTime,
            inTime: inTime,
            outTime: formData.outTime,
            foodType: foodDefinitionValue,
            foodTypename: form.values?.foodtype?.label,
            toWhom: isCPPlant? cpToWhom?.value: form.values?.towhom?.value,

            toWhomName: isCPPlant? cpToWhom?.label: form.values?.towhom?.label,
            noOfLoadman: isCPGuest? Number(noOfLoadman || 0): ["LOADMAN", "PACKING"].includes(form.values?.towhom?.label) ? Number(noOfLoadman || 0): 0,
            contractorName: ["LOADMAN", "PACKING"].includes(form.values?.towhom?.label)
                ? contractorName
                : "",
            amount: amount,
            remark: formData?.remarks,
            userInfoId: UserDetails.USERID,
            plantCode: plantCode,
            billDate: poDetailsData.postingDate || currentDate,
        };


            showLoader();
            console.log(apiBaseUrl + "FoodTeaTokenController/foodBillPosting", postdata);
            apiPostMethod(apiBaseUrl + "FoodTeaTokenController/foodBillPosting", postdata)
                .then((response) => {
                    const data = response.data;
                    if (data.success == true) {
                        confirmDialog({
                            title: `<h5><strong class="text-white">` + data.message + `</strong></h5>`, cancelButton: false, confirmText: false, confirmButton: false, background: `#51A351`
                        }).then(() => {
                            window.location.reload();
                        });
                        
                    }
                    else if (data.success == false) {
                        confirmDialog({
                            title: `<h5><strong class="text-white">` + data.message + `</strong></h5>`, cancelButton: false, confirmText: false, confirmButton: false, background: `#f50e0a`
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
    const [poDetailsData, setPoDetailsData] = useState({
        postingDate: '',
        invoiceDate: ''
      });
    const [department, setDepartment] = useState('');
    const [cost_centre, setcostcentre] = useState('');
    const [shiftTime, setShiftTime] = useState('');
    const [inTime, setInTime] = useState('');
    const [amount, setAmount] = useState('');
    const [employeeId, setEmployeeId] = useState('');
    const [shiftId, setShiftId] = useState('');
    const [plantCode, setPlantCode] = useState('');
    const [foodDefinitionValue, setFoodDefinitionValue] = useState('');
    const [noOfLoadman, setNoOfLoadman] = useState('');
    const [baseAmount, setBaseAmount] = useState(0);
    const [employeeDesignation, setEmployeeDesignation] = useState('');
    const [cpToWhom, setCpToWhom] = useState(null);

    const isCPPlant = UserDetails.plantids?.includes("CP00");    
    const isCPGuest = isCPPlant && cpToWhom?.label == "GUEST";

    const handleInputChange1 = (value, field) => {
        const today = new Date();
        const threeDaysAgo = new Date(today);
        threeDaysAgo.setDate(today.getDate() - 3);
      
        const minDate = threeDaysAgo.toISOString().split("T")[0];
        const maxDate = today.toISOString().split("T")[0];
      
        // Clamp date within range
        if (value < minDate) value = minDate;
        if (value > maxDate) value = maxDate;
      
        setPoDetailsData(prev => ({
          ...prev,
          [field === 'posting' ? 'postingDate' : 'invoiceDate']: value
        }));
      };
    const currentDate = new Date().toISOString().split("T")[0];
    const handleKeyDown = (e) => {
        // Prevent typing anything manually in the input field
        e.preventDefault();
    };
    const handleEmployeeNameChange = async (employeename) => {
        const postData = { employeename };

        try {
            const response = await apiPostMethod(
                `${apiBaseUrl}CourierMaster/getEmployeeDetails`,
                postData
            );
            const { data } = response;

            if (data?.length > 0) {
                setDepartment(data[0].emp_department);
                setcostcentre(data[0].emp_costcentre);
                setEmployeeId(data[0].emp_id);
                setPlantCode(data[0].plant_code);
                setEmployeeDesignation(data[0].emp_designation); // ✅ ADD THIS
            } else {
                setDepartment('');
                setEmployeeDesignation('');
            }
        } catch (error) {
            console.error("Error fetching employee details:", error);
            errorToast("Failed to fetch employee department");
        }
    };
    const [contractorName, setContractorName] = useState('');

      const handleShiftChange = (selectedShift) => {
    setShiftTime(selectedShift.shiftInTime);
    setShiftId(selectedShift.value);
    setInTime(selectedShift.shiftInTime);

    const shiftAmt = Number(selectedShift.amount || 0);
    setBaseAmount(shiftAmt);

    // If LOADMAN selected → multiply
          if (["LOADMAN", "PACKING"].includes(form.values?.towhom?.label)) {
              setAmount(shiftAmt * (Number(noOfLoadman) || 0));
          } else {
              setAmount(shiftAmt);
          }
    };
   useEffect(() => {
  apiPostMethod(`${apiBaseUrl}FoodTeaTokenController/gettowhomlist`)
    .then(res => {
      const employee = res.data?.results?.find(r => r.label === "EMPLOYEE");
      if (employee) {
        form.setFieldValue("towhom", employee);
      }
    })
    .catch(() => {});
}, []);
useEffect(() => {
    if (!isCPPlant) return;

    apiPostMethod(`${apiBaseUrl}FoodTeaTokenController/gettowhomlistforcp`)
        .then(res => {
            const employee = res.data?.results?.find(r => r.label === "EMPLOYEE");
            if (employee) {
                setCpToWhom(employee);   // ✅ set default
            }
        })
        .catch(() => {});
}, [isCPPlant]);
    const isAmountEditable =
        ["FM01", "FR01"].some(p => UserDetails.plantids?.includes(p)) &&
        employeeDesignation?.toLowerCase().includes("manager");
    const isShiftDisabled =
        ["FM01", "FR01"].some(p => UserDetails.plantids?.includes(p)) && !foodDefinitionValue;


   useEffect(() => {

    if (isAmountEditable) return;

    // ✅ NEW: CP00 Guest logic
    if (isCPGuest) {
        setAmount(baseAmount * (Number(noOfLoadman) || 0));
        return;
    }

    // ✅ Existing logic (unchanged)
    if (["LOADMAN", "PACKING"].includes(form.values?.towhom?.label)) {
        setAmount(baseAmount * (Number(noOfLoadman) || 0));
    } else {
        setAmount(baseAmount);
        setNoOfLoadman('');
        setContractorName('');
    }

}, [form.values?.towhom, noOfLoadman, baseAmount, isAmountEditable, isCPGuest]);

    


    return (
        <Fragment>
            <Card>
                <CardHeader><h5>Food Bill Token</h5><RefreshBlock1 /></CardHeader>
                <hr />
                <CardBody>
                    <Row>
                            <Col md="4" sm="4">
                                <Label>Date</Label>
                                <Input
                                    type="date"
                                    value={poDetailsData.postingDate || new Date().toISOString().split("T")[0]}
                                    min={new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]}
                                    max={new Date().toISOString().split("T")[0]}
                                    onChange={(e) => handleInputChange1(e.target.value, 'posting')}
                                    onKeyDown={handleKeyDown}
                                />
                            </Col>

                            <Col md="4" sm="4">
                                <FormGroup>
                                <CustomDropdownInput
                                        url={apiBaseUrl + `FoodTeaTokenController/getVendor/${'FOOD'}/${UserDetails.plantids}`} 
                                        label={"Hotel Name"}
                                        form={form}
                                        id="hotelName"
                                    />
                                </FormGroup>
                            </Col>
                          {["FM01","FR01"].some(p => UserDetails.plantids?.includes(p)) && (
                            <>
                                <Col md="4">
                                    <CustomDropdownInput
                                        url={`${apiBaseUrl}FoodTeaTokenController/gettypeforfood`}
                                        label="Food Type"
                                        form={form}
                                        id="foodtype"
                                        onChange={(selected) => {
                                            form.setFieldValue("foodtype", selected);
                                            setFoodDefinitionValue(selected?.definitionsvalues);

                                            // reset shift
                                            form.setFieldValue("shiftId", null);
                                            setShiftTime("");
                                        }}
                                    />
                                </Col>

                                <Col md="4">
                                    <CustomDropdownInput
                                        url={`${apiBaseUrl}FoodTeaTokenController/gettowhomlist`}
                                        label="To Whom"
                                        form={form}
                                        id="towhom"
                                    />
                                </Col>
                                {["LOADMAN", "PACKING"].includes(form.values?.towhom?.label) && (
                                    <Col md="4" sm="4">
                                        <FormGroup>
                                            <Label>No of Members</Label>
                                           <Input type="number" value={noOfLoadman} onChange={(e) => { const value = Math.max(Number(e.target.value)); setNoOfLoadman(value); }} />
                                        </FormGroup>
                                    </Col>
                                )}
                            </>
                        )}
                        {["LOADMAN", "PACKING"].includes(form.values?.towhom?.label) && (
                            <Col md="4" sm="4">
                                <FormGroup>
                                    <Label>Contractor Name</Label>
                                    <Input
                                        type="text"
                                        value={contractorName}
                                        onChange={(e) => setContractorName(e.target.value)}
                                        placeholder="Enter contractor name"
                                    />
                                </FormGroup>
                            </Col>
                        )}
                        {isCPPlant && (
                            <Col md="4">
                                <CustomDropdownInput
                                    url={`${apiBaseUrl}FoodTeaTokenController/gettowhomlistforcp`}
                                    label="To Whom (CP00)"
                                    form={form}
                                    id="cpToWhom"
                                    value={cpToWhom}
                                    onChange={(selected) => {
                                        setCpToWhom(selected);
                                    }}
                                />
                            </Col>
                        )}
                        {isCPGuest && (
                            <Col md="4" sm="4">
                                <FormGroup>
                                    <Label>No of Members (Guest)</Label>
                                    <Input
                                        type="number"
                                        value={noOfLoadman}
                                        onChange={(e) => {
                                            const value = Math.max(Number(e.target.value || 0));
                                            setNoOfLoadman(value);
                                        }}
                                    />
                                </FormGroup>
                            </Col>
                        )}
                            <Col md="4" sm="4">
                                <CustomDropdownInput
                                        url={`${apiBaseUrl}FoodTeaTokenController/GetEmployeeName/${UserDetails.plantids}`}
                                        label={"Employee Name"}
                                        form={form}
                                        id="empname"
                                        name="empname"
                                        value={form.values.empname}
                                        onChange={(employeename) => {
                                        handleEmployeeNameChange(employeename);
                                        }}
                                />
                            </Col>
                            <Col md="4" sm="4">
                                <FormGroup>
                                    <CustomTextInput label={"Department"} type="text" form={form} id="department" value={department} disabled/>
                                </FormGroup>
                            </Col> 
                            <Col md="4" sm="4">
                                <FormGroup>
                                    <CustomTextInput label={"CostCentre"} type="text" form={form} id="emp_costcentre" value={cost_centre} disabled/>
                                </FormGroup>
                            </Col>
                        {(
                            !["FM01", "FR01"].some(p => UserDetails.plantids?.includes(p)) ||
                            foodDefinitionValue
                        ) && (
                                <Col sm="4" md="4">
                                    <FormGroup>
                                        <CustomDropdownInput
                                            url={`${apiBaseUrl}FoodTeaTokenController/getShift/${UserDetails.plantids}/${foodDefinitionValue}`}
                                            label={"Shift"}
                                            form={form}
                                            id="shiftId"
                                            value={form.values.shiftId}
                                        onChange={(selectedShift) => {
                                            form.setFieldValue("shiftId", selectedShift);   // ✅ update formik
                                            handleShiftChange(selectedShift);               // ✅ your custom logic
                                        }}
                                        />
                                    </FormGroup>
                                </Col>
                            )}
                            <Col md="4" sm="4">
                                <FormGroup>
                                    <CustomTextInput label={"Shift Time"} type="text" form={form} id="shiftTime" value={shiftTime} disabled/>
                                </FormGroup>
                            </Col>
                            <Col md="4" sm="4">
                                <Label for="inTime">In Time</Label>
                                <Input type="time" value={inTime} onChange={(e) => setInTime(e.target.value)} />
                            </Col>
                            <Col md="4" sm="4">
                                <FormGroup>
                                    <CustomTextInput 
                                    label={"Out Time"} 
                                    type="time" 
                                    form={form} 
                                    id="outTime"
                                    />
                                </FormGroup>
                            </Col>
                        <Col md="4" sm="4">
                            <FormGroup>
                                <Label>Amount</Label>
                                <Input
                                    type="number"
                                    value={amount}
                                    disabled={!isAmountEditable}
                                    onChange={(e) => {
                                        if (isAmountEditable) {
                                            setAmount(Number(e.target.value || 0));
                                        }
                                    }}
                                />
                            </FormGroup>
                        </Col>

                            <Col md="4" sm="4">
                                <FormGroup>
                                    <CustomTextInput label={"Issued By"} type="text" form={form} value={UserDetails.username} id="amount" disabled/>
                                </FormGroup>
                            </Col>
                            <Col md="4" sm="4">
                            <FormGroup>
                                <Label>Remarks</Label>
                                <Input
                                    type="text"
                                    id="remarks"
                                    name="remarks"
                                    value={form.values.remarks}
                                    onChange={form.handleChange}
                                    onBlur={form.handleBlur}
                                    placeholder="Enter remarks"
                                />
                            </FormGroup>
                        </Col>


                            <Col sm="12" md="12">
                                <FormGroup className="d-flex justify-content-end">
                                    <Button.Ripple color="primary" type="button" onClick={addWorkPermit}>
                                        <Check size={16} /> Submit
                                    </Button.Ripple>
                                </FormGroup>
                            </Col>
                     
                    </Row>
                </CardBody>
            </Card>
            <div style={{ marginBottom: "250px" }}></div>
        </Fragment >
    );
};

export default FoodBill;
