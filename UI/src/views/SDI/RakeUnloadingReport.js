import React, { useState, useEffect } from "react";
import axios from 'axios';
import { Card, CardBody, FormGroup, Row, Col, Input, Button, Label, CardHeader } from "reactstrap";
import { CardComponent } from "../common/CardComponent";
import { apiPostMethod } from "../../helper/axiosHelper";
import { useSelector } from "react-redux";
import confirmDialog from "../../@core/components/confirm/confirmDialog";
import { apiBaseUrl } from "../../urlConstants";
import { errorToast } from "../../helper/appHelper";

const initialState = {
  rrNumber: "",
  fnrNumber: "",
  placementTime: "",
  placementPlatform: "",
  freeTimeTill: "",
  completionTime: "",
  rakeType: "",
  date: "",
  noOfWagonReceived: "",
  wagonNumber: "",
  noOfMissingWagon:"",
  totalDcHours: "",
  totalWharfage: "",
  remarks: "",
  tarpaulinPlaced: "",
  tarpaulinCovered: "",
  tarpaulinPlacedRemarks: "",
  tarpaulinCoveredRemarks: "",
  noOfLoadman: "",
  arrivalTime: "",
  loadingStartingTime: "",
  unloadingLocation: "",
  numberOfTrucks: "",
  nagaOwn: "",
  goodshed: "",
  total: "",
  bagsInEachWagon: "",
  spillageCleaningLadies: "",
  noOfSpillageTrucks: "",
  noOfEmptyGunnyUsed: "",
  surveyorNames: "",
  signature: "",
  rrCopy:"",
  sweepingTime:"",
  emptyBoxOpenTime:"",
  bagsUnloadPlatForm:"",
  surveyorScreenDate:"",
};

const RakeUnloadingReport = () => {
  const [form, setForm] = useState(initialState);
  const [errors, setErrors] = useState({});

  const [fnrOptions, setFnrOptions] = useState([]);
  const [fnrLoading, setFnrLoading] = useState(false);
  const [fnrError, setFnrError] = useState(null);

  const [freeTimeOptions, setFreeTimeOptions] = useState([]);
  const [freeTimeLoading, setFreeTimeLoading] = useState(false);
  const [freeTimeError, setFreeTimeError] = useState(null);

  const update = (path, value) => {
    if (typeof path === "string" && path.includes(".")) {
      const [parent, child] = path.split(".");
      setForm((s) => ({ ...s, [parent]: { ...s[parent], [child]: value } }));
      return;
    }
    setForm((s) => ({ ...s, [path]: value }));
    // Clear error for this field when user changes it
    if (errors[path]) {
      setErrors((e) => ({ ...e, [path]: "" }));
    }
  };

  const validate = () => {
    const newErrors = {};

    // Required text/number fields
    if (!form.rrNumber?.trim()) newErrors.rrNumber = "RR Number is required.";

    if (!form.fnrNumber) newErrors.fnrNumber = "FNR Number is required.";

    if (!form.placementTime) {
      newErrors.placementTime = "Placement Date & Time is required.";
    }
    if (!form.emptyBoxOpenTime) {
      newErrors.emptyBoxOpenTime = "Sweeping Date & Time is required.";
    }
    if (!form.sweepingTime) {
      newErrors.sweepingTime = "Sweeping Date & Time is required.";
    }
    if (!form.completionTime) {
      newErrors.completionTime = "Completion Date & Time is required.";
    } else if (form.placementTime && form.completionTime) {
      const start = new Date(form.placementTime);
      const end = new Date(form.completionTime);
      if (end < start) {
        newErrors.completionTime = "Completion time must be after placement time.";
      }
    }

    if (!form.rakeType) newErrors.rakeType = "Rake Type is required.";

    if (!form.noOfWagonReceived) {
      newErrors.noOfWagonReceived = "No. of Wagon Received is required.";
    } 
    // if (!form.noOfMissingWagon) {
    //   newErrors.noOfMissingWagon = "No. of Missing Wagon Received is required.";
    // } 

    if (!form.placementPlatform) {
      newErrors.placementPlatform = "Placement Platform is required.";
    } 

    // freeTimeTill is auto-filled, but if empty and rakeType is set, it may indicate misconfiguration
    if (!form.freeTimeTill && form.rakeType) {
      newErrors.freeTimeTill = "Free time not configured for selected Rake Type.";
    }

    // Optional numeric fields: validate if provided
    // if (form.totalWharfage && isNaN(Number(form.totalWharfage))) {
    //   newErrors.totalWharfage = "Total Wharfage must be a number.";
    // }

    // Tarpaulin logic
    if (!form.tarpaulinPlaced) {
      newErrors.tarpaulinPlaced = "Select YES/NO for Tarpaulin Placed.";
    } else if (form.tarpaulinPlaced === "NO" && !form.tarpaulinPlacedRemarks?.trim()) {
      newErrors.tarpaulinPlacedRemarks = "Remarks required when Tarpaulin Placed is NO.";
    }

    if (!form.tarpaulinCovered) {
      newErrors.tarpaulinCovered = "Select YES/NO for Tarpaulin Covered.";
    } else if (form.tarpaulinCovered === "NO" && !form.tarpaulinCoveredRemarks?.trim()) {
      newErrors.tarpaulinCoveredRemarks = "Remarks required when Tarpaulin Covered is NO.";
    }

    // Loadman section
    if (!form.noOfLoadman) {
      newErrors.noOfLoadman = "No. of Loadman Present is required.";
    } else {
      const n = Number(form.noOfLoadman);
      if (!Number.isInteger(n) || n < 0) {
        newErrors.noOfLoadman = "Must be a non‑negative integer.";
      }
    }
    if (!form.spillageCleaningLadies) {
      newErrors.spillageCleaningLadies = "No. of Spillage Ladies Present is required.";
    } else {
      const n = Number(form.spillageCleaningLadies);
      if (!Number.isInteger(n) || n < 0) {
        newErrors.spillageCleaningLadies = "Must be a non‑negative integer.";
      }
    }
    if (!form.noOfSpillageTrucks) {
      newErrors.noOfSpillageTrucks = "No. of Spillage Truck is required.";
    } else {
      const n = Number(form.noOfSpillageTrucks);
      if (!Number.isInteger(n) || n < 0) {
        newErrors.noOfSpillageTrucks = "Must be a non‑negative integer.";
      }
    }
    if (!form.noOfEmptyGunnyUsed) {
      newErrors.noOfEmptyGunnyUsed = "No. of Spillage Gunny Used is required.";
    } else {
      const n = Number(form.noOfEmptyGunnyUsed);
      if (!Number.isInteger(n) || n < 0) {
        newErrors.noOfEmptyGunnyUsed = "Must be a non‑negative integer.";
      }
    }
    if (!form.arrivalTime) {
      newErrors.arrivalTime = "Arrival Date & Time is required.";
    //   if (form.placementTime && form.arrivalTime) {
    //   const start = new Date(form.placementTime);
    //   const end = new Date(form.arrivalTime);
    //   if (end < start) {
    //     newErrors.completionTime = "Arriaval time must be after placement time.";
    //   }
    }

    if (!form.loadingStartingTime) {
      newErrors.loadingStartingTime = "Loading Starting Date & Time is required.";
    } else if (form.arrivalTime && form.loadingStartingTime) {
      const arr = new Date(form.arrivalTime);
      const load = new Date(form.loadingStartingTime);
      if (load < arr) {
        newErrors.loadingStartingTime = "Loading starting time must be after arrival time.";
      }
    }

    // Spillage section
    if (form.spillageCleaningLadies && isNaN(Number(form.spillageCleaningLadies))) {
      newErrors.spillageCleaningLadies = "Must be a number.";
    }

    if (form.noOfSpillageTrucks && isNaN(Number(form.noOfSpillageTrucks))) {
      newErrors.noOfSpillageTrucks = "Must be a number.";
    }

    if (form.noOfEmptyGunnyUsed && isNaN(Number(form.noOfEmptyGunnyUsed))) {
      newErrors.noOfEmptyGunnyUsed = "Must be a number.";
    }

    
    if (!form.bagsInEachWagon?.trim()) {
      newErrors.bagsInEachWagon = "Bag Each Wagon Wise Details Required.";
    }
    if (!form.surveyorNames?.trim()) {
      newErrors.surveyorNames = "Surveyor Names & Responsibility is required.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
const UserDetails = useSelector((state) =>
    state && state.auth ? state.auth.userData : {}
  );
  const onSubmit = async (e) => {
  e.preventDefault();

  const isValid = validate();

  if (!isValid) {
    alert("Form has validation errors. Please correct them before saving.");
    return;
  }

  const payload = {
    ...form,
    user_id: UserDetails.USERID
  };

  console.log("📤 Backend payload:", payload);

  try {

    const response = await apiPostMethod(
      apiBaseUrl + "RakeloadingController/Rake_Unloading_Surveyor_Insert",
      payload
    );

    const { data } = response;

    if (data.success === true) {

      confirmDialog({
        title: `<h5><strong class="text-white">${data.message}</strong></h5>`,
        cancelButton: false,
        confirmText: false,
        confirmButton: false,
        background: `#51A351`
      }).then(() => {
        window.location.reload();
      });

    } else {

      confirmDialog({
        title: `<h5><strong class="text-white">${data.message}</strong></h5>`,
        cancelButton: false,
        confirmText: false,
        confirmButton: false,
        background: `#dc3545`
      }).then(() => {});

    }

  } catch (error) {

    console.error("Submission error:", error);
    errorToast("Submission failed.");

  } finally {

    // setIsSubmitting(false);

  }
};

  // Load FNR options
  useEffect(() => {
    let mounted = true;
    const fetchFnrs = async () => {
      setFnrLoading(true);
      setFnrError(null);
      try {
        const res = await apiPostMethod(`${apiBaseUrl}RakeloadingController/RakeFNRNO`);
        const data = res && res?.data?.results ? res?.data?.results : [];
        if (!mounted) return;
        setFnrOptions(Array.isArray(data) ? data : []);
      } catch (err) {
        if (!mounted) return;
        setFnrError('Failed to load FNRs');
        console.error('Error fetching FNRs', err);
      } finally {
        if (mounted) setFnrLoading(false);
      }
    };
    fetchFnrs();
    return () => { mounted = false; };
  }, []);

  // Load Free Time options
  useEffect(() => {
    let mounted = true;
    const fetchFreeTimes = async () => {
      setFreeTimeLoading(true);
      setFreeTimeError(null);
      try {
        const res = await apiPostMethod(`${apiBaseUrl}GatePro/Master/getDefinitionsList/31`);
        console.log(res)
        const data = res && res?.data?.results ? res?.data?.results : [];
        if (!mounted) return;
        setFreeTimeOptions(Array.isArray(data) ? data : []);
      } catch (err) {
        if (!mounted) return;
        setFreeTimeError('Failed Rake Type Option');
        console.error('Error fetching Free Time options', err);
      } finally {
        if (mounted) setFreeTimeLoading(false);
      }
    };
    fetchFreeTimes();
    return () => { mounted = false; };
  }, []);

  // DC HOURS CALCULATION
  useEffect(() => {
    if (form.placementTime && form.completionTime) {
      const start = new Date(form.placementTime);
      const end = new Date(form.completionTime);
      const diffMs = end - start;
      const totalHours = diffMs / (1000 * 60 * 60);
      const freeTime = parseFloat(form.freeTimeTill) || 0;
      const dcHours = totalHours - freeTime;

      let dcTime = "00:00";
      if (dcHours > 0) {
        const hours = Math.floor(dcHours);
        const minutes = Math.round((dcHours - hours) * 60);
        dcTime =
          String(hours).padStart(2, "0") +
          ":" +
          String(minutes).padStart(2, "0");
      }

      setForm((prev) => ({
        ...prev,
        totalDcHours: dcTime,
      }));
    }
  }, [form.placementTime, form.completionTime, form.freeTimeTill]);
  const now = new Date();

const minDate = new Date();
minDate.setDate(now.getDate() - (form?.surveyorScreenDate || 3));

const formatDateTime = (date) => {
  const pad = (n) => n.toString().padStart(2, "0");

  return (
    date.getFullYear() +
    "-" +
    pad(date.getMonth() + 1) +
    "-" +
    pad(date.getDate()) +
    "T" +
    pad(date.getHours()) +
    ":" +
    pad(date.getMinutes())
  );
};
  return (
    <div>
      <Card>
        <CardHeader className="py-1 bg-primary d-flex justify-content-center align-items-center">
          <h4 className="mb-0 text-white">Rake Unloading Report</h4>
        </CardHeader>
        <CardBody>
          <CardComponent>
            <form onSubmit={onSubmit}>
              <Row>
                <Col sm="12">
                  <div className="subtitle-side mb-2">
                    <u><strong className="title-underline text-primary">RAKE DETAILS</strong></u>
                  </div>
                </Col>

                <Col md="4" sm="12">
                  <FormGroup>
                    <Label>FNR NUMBER</Label>
                    <Input
                      type="select"
                      value={form.fnrNumber}
                      onChange={(e) => {
                        const value = e.target.value;
                        const selected = fnrOptions.find((opt) => opt.value === value);
                        update("fnrNumber", value);
                        if (selected) {
                          const own = Number(selected.Own_Count) || 0;
                          const hire = Number(selected.Hire_Count) || 0;
                          const total = own + hire;
                          let completionTime = "";
                          if (selected.last_created) {
                            const [date, time] = selected.last_created.split(" ");
                            const [day, month, year] = date.split("-");
                            completionTime = `${year}-${month}-${day}T${time}`;
                          }
                          update("unloadingLocation", selected.plant_ids || "");
                          update("numberOfTrucks", selected.total_count || "");
                          update("nagaOwn", own);
                          update("goodshed", hire);
                          update("total", total);
                          update("completionTime", selected.last_created);
                          update("rrCopy", selected.rrCopy);
                          update("noOfWagonReceived", selected.noOfWagan);
                          update("surveyorScreenDate", selected.surveyorScreenDate);
                        }
                      }}
                      invalid={!!errors.fnrNumber}
                    >
                      <option value="">Select</option>
                      {fnrLoading && <option>Loading...</option>}
                      {!fnrLoading &&
                        fnrOptions.map((opt, idx) => (
                          <option key={idx} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                    </Input>
                    {errors.fnrNumber && (
                      <div className="text-danger small mt-1">{errors.fnrNumber}</div>
                    )}
                  </FormGroup>
                </Col>

                <Col md="4" sm="12">
                  <FormGroup>
                    <Label>RR NUMBER</Label>
                    <Input
                      type="text"
                      value={form.rrNumber}
                      onChange={(e) => update("rrNumber", e.target.value)}
                      invalid={!!errors.rrNumber}
                    />
                    {errors.rrNumber && (
                      <div className="text-danger small mt-1">{errors.rrNumber}</div>
                    )}
                  </FormGroup>
                </Col>

                <Col md="4" sm="12">
                  <FormGroup>
                    <Label>RAKE TYPE</Label>
                    <Input
                      type="select"
                      value={form.rakeType}
                      onChange={(e) => {
                        const value = e.target.value;
                        const selected = freeTimeOptions.find(
                          (opt) => (opt.label ?? opt) === value
                        );
                        update("rakeType", value);
                        if (selected) {
                          update("freeTimeTill", selected.definition_values || "");
                        }
                      }}
                      invalid={!!errors.rakeType}
                    >
                      <option value="">Select</option>
                      {freeTimeOptions.map((opt, idx) => {
                        if (typeof opt === "string")
                          return (
                            <option key={idx} value={opt}>
                              {opt}
                            </option>
                          );
                        const value = opt.label ?? JSON.stringify(opt);
                        const label = opt.label ?? JSON.stringify(opt);
                        return (
                          <option key={value + idx} value={value}>
                            {label}
                          </option>
                        );
                      })}
                    </Input>
                    {errors.rakeType && (
                      <div className="text-danger small mt-1">{errors.rakeType}</div>
                    )}
                  </FormGroup>
                </Col>

                <Col md="4" sm="12">
                  <FormGroup>
                    <Label>NO OF WAGON RECEIVED</Label>
                    <Input
                      type="number"
                      min="0"
                      value={form.noOfWagonReceived}
                      onChange={(e) => {
                        let value = e.target.value;
                        if (value.length <= 2) {
                          update("noOfWagonReceived", value);
                        }
                      }}
                      invalid={!!errors.noOfWagonReceived}
                    />
                    {errors.noOfWagonReceived && (
                      <div className="text-danger small mt-1">{errors.noOfWagonReceived}</div>
                    )}
                  </FormGroup>
                </Col>
                <Col md="4" sm="12">
                  <FormGroup>
                    <Label>NO OF MISSING WAGON</Label>
                    <Input
                      type="number"
                      min="0"
                      value={form.noOfMissingWagon}
                      onChange={(e) => {
                        let value = e.target.value;
                        if (value.length <= 2) {
                          update("noOfMissingWagon", value);
                        }
                      }}
                      invalid={!!errors.noOfMissingWagon}
                    />
                    {errors.noOfMissingWagon && (
                      <div className="text-danger small mt-1">{errors.noOfMissingWagon}</div>
                    )}
                  </FormGroup>
                </Col>
                <Col md="4" sm="12">
                  <FormGroup>
                    <Label>MISSING WAGON NUMBERS</Label>
                    <Input
                      type="text"
                      value={form.wagonNumber}
                      onChange={(e) => {
                          update("wagonNumber", e.target.value);
                      }}
                      invalid={!!errors.wagonNumber}
                    />
                    {errors.wagonNumber && (
                      <div className="text-danger small mt-1">{errors.wagonNumber}</div>
                    )}
                  </FormGroup>
                </Col>
                    
                <Col md="4" sm="12">
                  <FormGroup>
                    <Label>PLACEMENT DATE & TIME</Label>
                    <Input
                      type="datetime-local"
                      value={form.placementTime}
                      onChange={(e) => update("placementTime", e.target.value)}
                    //   max={new Date().toISOString().slice(0, 16)}
                      min={formatDateTime(minDate)}   // 2 days back allowed
                      max={formatDateTime(now)}       // future not allowed
                      invalid={!!errors.placementTime}
                    />
                    {errors.placementTime && (
                      <div className="text-danger small mt-1">{errors.placementTime}</div>
                    )}
                  </FormGroup>
                </Col>

                <Col md="4" sm="12">
                  <FormGroup>
                    <Label>PLACEMENT PLATFORM</Label>
                    <Input
                      type="number"
                      min="0"
                      value={form.placementPlatform}
                      onChange={(e) => {
                        let value = e.target.value;
                        if (value.length <= 1) {
                          update("placementPlatform", value);
                        }
                      }}
                      invalid={!!errors.placementPlatform}
                    />
                    {errors.placementPlatform && (
                      <div className="text-danger small mt-1">{errors.placementPlatform}</div>
                    )}
                  </FormGroup>
                </Col>

                <Col md="4" sm="12">
                  <FormGroup>
                    <Label>FREE TIME TILL (Hrs)</Label>
                    <Input
                      type="text"
                      value={form.freeTimeTill}
                      disabled
                      invalid={!!errors.freeTimeTill}
                    />
                    {errors.freeTimeTill && (
                      <div className="text-danger small mt-1">{errors.freeTimeTill}</div>
                    )}
                  </FormGroup>
                </Col>

                <Col md="4" sm="12">
                  <FormGroup>
                    <Label>COMPLETION DATE & TIME</Label>
                    <Input
                      type="datetime-local"
                      value={form.completionTime}
                      onChange={(e) => update("completionTime", e.target.value)}
                      min={formatDateTime(minDate)}   // 2 days back allowed
                      max={formatDateTime(now)}       // future not allowed
                    //   max={new Date().toISOString().slice(0, 16)}
                      invalid={!!errors.completionTime}
                    />
                    {errors.completionTime && (
                      <div className="text-danger small mt-1">{errors.completionTime}</div>
                    )}
                  </FormGroup>
                </Col>

                <Col md="4" sm="12">
                  <FormGroup>
                    <Label>TOTAL DC HOURS IF ANY</Label>
                    <Input
                      type="text"
                      value={form.totalDcHours}
                      disabled
                    />
                  </FormGroup>
                </Col>
                <Col md="4" sm="12">
                  <FormGroup>
                    <Label>BAGS UNLOADED AT PLATFORM</Label>
                    <Input
                      type="text"
                      value={form.bagsUnloadPlatForm}
                      onChange={(e) => update("bagsUnloadPlatForm", e.target.value)}
                      invalid={!!errors.bagsUnloadPlatForm}
                    />
                    {errors.bagsUnloadPlatForm && (
                      <div className="text-danger small mt-1">{errors.bagsUnloadPlatForm}</div>
                    )}
                  </FormGroup>
                </Col>    
                <Col md="4" sm="12">
                  <FormGroup>
                    <Label>TOTAL WHARFAGE IF ANY</Label>
                    <Input
                      type="text"
                      value={form.totalWharfage}
                      onChange={(e) => update("totalWharfage", e.target.value)}
                      invalid={!!errors.totalWharfage}
                    />
                    {errors.totalWharfage && (
                      <div className="text-danger small mt-1">{errors.totalWharfage}</div>
                    )}
                  </FormGroup>
                </Col>
                <Col md="4" sm="12">
                  <FormGroup>
                    <Label>REMARKS</Label>
                    <Input
                      type="text"
                      value={form.remarks}
                      onChange={(e) => update("remarks", e.target.value)}
                      invalid={!!errors.totalWharfage}
                    />
                    {errors.remarks && (
                      <div className="text-danger small mt-1">{errors.remarks}</div>
                    )}
                  </FormGroup>
                </Col>    
                {/* If you add "BAGS UNLOADED AT PLATFORM" field, ensure `bagsUnloaded` exists in initialState */}
                <Col md="4" sm="12">
                  <FormGroup>
                    <Label>TARPAULIN PLACED AT EVERY WAGON BEFORE UNLOADING (YES/NO)</Label>
                    <Input
                      type="select"
                      value={form.tarpaulinPlaced}
                      onChange={(e) => update("tarpaulinPlaced", e.target.value)}
                      invalid={!!errors.tarpaulinPlaced}
                    >
                      <option value="">Select</option>
                      <option value="YES">YES</option>
                      <option value="NO">NO</option>
                    </Input>
                    {errors.tarpaulinPlaced && (
                      <div className="text-danger small mt-1">{errors.tarpaulinPlaced}</div>
                    )}
                  </FormGroup>
                </Col>

                {form.tarpaulinPlaced === 'NO' && (
                  <Col md="4" sm="12">
                    <FormGroup>
                      <Label>TARPAULIN PLACED REMARKS</Label>
                      <Input
                        type="text"
                        value={form.tarpaulinPlacedRemarks}
                        onChange={(e) => update("tarpaulinPlacedRemarks", e.target.value)}
                        invalid={!!errors.tarpaulinPlacedRemarks}
                      />
                      {errors.tarpaulinPlacedRemarks && (
                        <div className="text-danger small mt-1">{errors.tarpaulinPlacedRemarks}</div>
                      )}
                    </FormGroup>
                  </Col>
                )}

                <Col md="4" sm="12">
                  <FormGroup>
                    <Label>TARPAULIN COVERED AT ALL TRUCK (YES/NO)</Label>
                    <Input
                      type="select"
                      value={form.tarpaulinCovered}
                      onChange={(e) => update("tarpaulinCovered", e.target.value)}
                      invalid={!!errors.tarpaulinCovered}
                    >
                      <option value="">Select</option>
                      <option value="YES">YES</option>
                      <option value="NO">NO</option>
                    </Input>
                    {errors.tarpaulinCovered && (
                      <div className="text-danger small mt-1">{errors.tarpaulinCovered}</div>
                    )}
                  </FormGroup>
                </Col>

                {form.tarpaulinCovered === 'NO' && (
                  <Col md="4" sm="12">
                    <FormGroup>
                      <Label>TARPAULIN COVERED REMARKS</Label>
                      <Input
                        type="text"
                        value={form.tarpaulinCoveredRemarks}
                        onChange={(e) => update("tarpaulinCoveredRemarks", e.target.value)}
                        invalid={!!errors.tarpaulinCoveredRemarks}
                      />
                      {errors.tarpaulinCoveredRemarks && (
                        <div className="text-danger small mt-1">{errors.tarpaulinCoveredRemarks}</div>
                      )}
                    </FormGroup>
                  </Col>
                )}
              </Row>

              <Row>
                <Col sm="12">
                  <div className="subtitle-side mb-2">
                    <u><strong className="title-underline text-primary">LOADMAN</strong></u>
                  </div>
                </Col>
              </Row>

              <Row>
                <Col md="4" sm="12">
                  <FormGroup>
                    <Label>NO OF LOADMAN PRESENT</Label>
                    <Input
                      type="number"
                      min="0"
                      value={form.noOfLoadman}
                      onChange={(e) => update("noOfLoadman", e.target.value)}
                      invalid={!!errors.noOfLoadman}
                    />
                    {errors.noOfLoadman && (
                      <div className="text-danger small mt-1">{errors.noOfLoadman}</div>
                    )}
                  </FormGroup>
                </Col>

                <Col md="4" sm="12">
                  <FormGroup>
                    <Label>ARRIVAL DATE & TIME</Label>
                    <Input
                      type="datetime-local"
                      value={form.arrivalTime}
                      onChange={(e) => update("arrivalTime", e.target.value)}
                    //   max={new Date().toISOString().slice(0, 16)}
                      min={formatDateTime(minDate)}   // 2 days back allowed
                      max={formatDateTime(now)}       // future not allowed
                      invalid={!!errors.arrivalTime}
                    />
                    {errors.arrivalTime && (
                      <div className="text-danger small mt-1">{errors.arrivalTime}</div>
                    )}
                  </FormGroup>
                </Col>

                <Col md="4" sm="12">
                  <FormGroup>
                    <Label>LOADING STARTING DATE & TIME</Label>
                    <Input
                      type="datetime-local"
                      value={form.loadingStartingTime}
                      onChange={(e) => update("loadingStartingTime", e.target.value)}
                    //   max={new Date().toISOString().slice(0, 16)}
                      min={formatDateTime(minDate)}   // 2 days back allowed
                      max={formatDateTime(now)}       // future not allowed
                      invalid={!!errors.loadingStartingTime}
                    />
                    {errors.loadingStartingTime && (
                      <div className="text-danger small mt-1">{errors.loadingStartingTime}</div>
                    )}
                  </FormGroup>
                </Col>
                <Col md="4" sm="12">
                  <FormGroup>
                    <Label>NO OF SPILLAGE CLEANING LADIES</Label>
                    <Input
                      type="number"
                      min="0"
                      value={form.spillageCleaningLadies}
                      onChange={(e) => update("spillageCleaningLadies", e.target.value)}
                      invalid={!!errors.spillageCleaningLadies}
                    />
                    {errors.spillageCleaningLadies && (
                      <div className="text-danger small mt-1">{errors.spillageCleaningLadies}</div>
                    )}
                  </FormGroup>
                </Col>
                <Col md="4" sm="12">
                  <FormGroup>
                    <Label>EMPTY BOX DATE & TIME</Label>
                    <Input
                      type="datetime-local"
                      value={form.emptyBoxOpenTime}
                      onChange={(e) => update("emptyBoxOpenTime", e.target.value)}
                      min={formatDateTime(minDate)}   // 2 days back allowed
                      max={formatDateTime(now)}       // future not allowed
                    //   max={new Date().toISOString().slice(0, 16)}
                      invalid={!!errors.emptyBoxOpenTime}
                    />
                    {errors.emptyBoxOpenTime && (
                      <div className="text-danger small mt-1">{errors.emptyBoxOpenTime}</div>
                    )}
                  </FormGroup>
                </Col>
                <Col md="4" sm="12">
                  <FormGroup>
                    <Label>SWEEPING DATE & TIME</Label>
                    <Input
                      type="datetime-local"
                      value={form.sweepingTime}
                      onChange={(e) => update("sweepingTime", e.target.value)}
                      min={formatDateTime(minDate)}   // 2 days back allowed
                      max={formatDateTime(now)}       // future not allowed
                    //   max={new Date().toISOString().slice(0, 16)}
                      invalid={!!errors.sweepingTime}
                    />
                    {errors.sweepingTime && (
                      <div className="text-danger small mt-1">{errors.sweepingTime}</div>
                    )}
                  </FormGroup>
                </Col>
              </Row>

              <Row>
                <Col sm="12">
                  <div className="subtitle-side mb-2">
                    <u><strong className="title-underline text-primary">TRUCK DETAILS</strong></u>
                  </div>
                </Col>

                <Col md="4" sm="12">
                  <FormGroup>
                    <Label>NAGA TRUCK</Label>
                    <Input
                      type="number"
                      min="0"
                      value={form.nagaOwn}
                      onChange={(e) => update("nagaOwn", e.target.value)}
                      disabled
                    />
                  </FormGroup>
                </Col>

                <Col md="4" sm="12">
                  <FormGroup>
                    <Label>GOODSHED TRUCK</Label>
                    <Input
                      type="number"
                      min="0"
                      value={form.goodshed}
                      onChange={(e) => update("goodshed", e.target.value)}
                      disabled
                    />
                  </FormGroup>
                </Col>

                <Col md="4" sm="12">
                  <FormGroup>
                    <Label>TOTAL NO OF TRUCK</Label>
                    <Input
                      type="number"
                      min="0"
                      value={form.total}
                      onChange={(e) => update("total", e.target.value)}
                      disabled
                    />
                  </FormGroup>
                </Col>
                <Col md="4" sm="12">
                  <FormGroup>
                    <Label>NO OF SPILLAGE TRUCKS</Label>
                    <Input
                      type="number"
                      min="0"
                      value={form.noOfSpillageTrucks}
                      onChange={(e) => update("noOfSpillageTrucks", e.target.value)}
                      invalid={!!errors.noOfSpillageTrucks}
                    />
                    {errors.noOfSpillageTrucks && (
                      <div className="text-danger small mt-1">{errors.noOfSpillageTrucks}</div>
                    )}
                  </FormGroup>
                </Col>

                <Col md="4" sm="12">
                  <FormGroup>
                    <Label>BAGS IN EACH WAGON (SPILLAGE)</Label>
                    <Input
                      type="text"
                      value={form.bagsInEachWagon}
                      onChange={(e) => update("bagsInEachWagon", e.target.value)}
                      invalid={!!errors.bagsInEachWagon}
                    />
                    {errors.bagsInEachWagon && (
                      <div className="text-danger small mt-1">{errors.bagsInEachWagon}</div>
                    )}
                  </FormGroup>
                </Col>

                <Col md="4" sm="12">
                  <FormGroup>
                    <Label>NO OF EMPTY GUNNY USED FOR SPILLAGE COLLECTION</Label>
                    <Input
                      type="number"
                      min="0"
                      value={form.noOfEmptyGunnyUsed}
                      onChange={(e) => update("noOfEmptyGunnyUsed", e.target.value)}
                      invalid={!!errors.noOfEmptyGunnyUsed}
                    />
                    {errors.noOfEmptyGunnyUsed && (
                      <div className="text-danger small mt-1">{errors.noOfEmptyGunnyUsed}</div>
                    )}
                  </FormGroup>
                </Col>
              </Row>

              <Row>
                <Col sm="12">
                  <div className="subtitle-side mb-2">
                    <u><strong className="title-underline text-primary">UNLOADING LOCATION DETAILS</strong></u>
                  </div>
                </Col>
                <Col md="12" sm="12">
                  <table
                    className="table table-sm table-bordered"
                    style={{ fontSize: "12px", width: "60%" }}
                  >
                    <thead className="table-primary">
                      <tr>
                        <th style={{ padding: "4px", textAlign: "center" }}>Unloading Location</th>
                        <th style={{ padding: "4px", textAlign: "center" }}>Total Trucks - {form.numberOfTrucks} </th>
                      </tr>
                    </thead>
                    <tbody>
                      {form.unloadingLocation &&
                        JSON.parse(form.unloadingLocation).map((row, i) => (
                          <tr key={i}>
                            <td style={{ padding: "4px" , textAlign: "center" }}>{row.PLANT_ID}</td>
                            <td style={{ padding: "4px", textAlign: "center" }}>
                              {row.TOTAL_VEHICLE}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </Col>
                </Row>
                <br />
                <Row>
                <Col md="4" sm="12">
                  <FormGroup>
                    <Label>SURVEYOR NAMES & RESPONSIBILITY</Label>
                    <Input
                      type="text"
                      value={form.surveyorNames}
                      onChange={(e) => update("surveyorNames", e.target.value)}
                      invalid={!!errors.surveyorNames}
                    />
                    {errors.surveyorNames && (
                      <div className="text-danger small mt-1">{errors.surveyorNames}</div>
                    )}
                  </FormGroup>
                </Col>
                <Col sm="4" md="4">
                    <Label></Label>
                    <FormGroup className="d-flex justify-content-start mb-0">
                    <a target="_blank" href={form?.rrCopy}>
                        {form?.rrCopy &&
                        <Button outline color="success" type="button">
                            RR Copy 
                        </Button>}
                    </a>
                    </FormGroup>
                </Col>
              </Row>

              <Row>
                <Col sm="12" className="mt-2">
                  <FormGroup className="d-flex mb-0 justify-content-end">
                    <div className="mr-1">
                      <Button.Ripple color="primary" type="submit">
                        Save
                      </Button.Ripple>
                    </div>
                    <Button.Ripple
                      color="secondary"
                      type="button"
                      onClick={() => {
                        setForm(initialState);
                        setErrors({});
                      }}
                    >
                      Clear
                    </Button.Ripple>
                  </FormGroup>
                </Col>
              </Row>
            </form>
          </CardComponent>
        </CardBody>
      </Card>
    </div>
  );
};

export default RakeUnloadingReport;
