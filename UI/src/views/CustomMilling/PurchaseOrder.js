import React, { Fragment, useState, useEffect } from "react";
import { apiPostMethod } from "@helpers/axiosHelper";
import { errorToast } from "@helpers/appHelper";
import { Row, Col, Button, Label, FormGroup, Input, InputGroup, InputGroupAddon, Card, CardHeader, CardBody } from "reactstrap";
import { useParams } from "react-router";
import { ArrowLeft, Check, Search, Plus, Trash2 } from "react-feather";
import { useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { useFormik } from "formik";
import { ShowToast } from "../../helper/appHelper";
import { apiBaseUrl } from "../../urlConstants";
import { useLoader } from "../../utility/hooks/useLoader";
import { CustomDropdownInput, Yup } from "../forms/custom-form";
import confirmDialog from "../../@core/components/confirm/confirmDialog";
import { set } from "lodash";

/*
  Field-type legend from the scope mock-up, and how each is implemented here:
    Auto       -> disabled <Input />, value comes from the API or a live calculation
    Select     -> dropdown. Plant Name / Storage Location use <CustomDropdownInput /> bound to
                  formik (same as "confirm_vendor" in CanteenMaterials.js). Header Segment Code
                  uses a plain controlled <Input type="select"> instead, because picking it has
                  to immediately push Material Code/Des/Uom/Rate into the header preview and into
                  the next row that gets added - that side-effect needs to live in our own
                  onChange, which CustomDropdownInput doesn't expose a hook for.
    Manual     -> editable <Input />. Broker Code (header) and Vendor Code (per row) are Manual
                  fields with an attached search icon - typing the code and clicking the icon
                  calls the lookup endpoint and fills in the matching Auto field next to it.
    Attachment -> not present anywhere on this screen in the supplied scope, so it isn't wired up.
    Button     -> Button.Ripple actions (+ Add Row / Remove / Submit / Cancel)

  Current behavior:
    - Segment Code now lives ONLY at the header level, next to Broker Name. Picking it there
      auto-fills header Material Code / Material Des / Uom / Rate (fields: segment, material_code,
      material_description, uom, rate, per your confirmed API shape).
    - "+ Add Row" only appears once both Purchase Org AND a header Segment are selected. Each new
      row is pre-filled from the current header Segment selection (SegmentCode/MaterialCode/
      MaterialDes/Uom/Rate), gets the next SAP-style line number (10, 20, 30...), and immediately
      opens its own Condition Changes section below the grid.
    - Condition Changes are fetched per Segment value (not per line/PO id), and each condition
      row's Total Amount is computed live as Rate x that line's Qty, since the API doesn't return
      a pre-computed TotalAmount on condition rows.
    - Every row stays live-editable (no "Add"-to-lock step). Each row has its own Remove action
      that deletes the line, its Condition Changes section, and recalculates OverAll Amount.
    - Endpoints used: getPurchaseOrderInfo, getPurchaseOrg (Purchase Org list only),
      getSegmentDetails/{purchaseOrgId} (Segment list), getVendor/{code} (used for BOTH the
      Vendor Code search and the Broker Code search - worth confirming with your backend that
      brokers genuinely live in the vendor master, since both reads currently pull VENDORNAME),
      getConditionChanges/{segmentValue}, getPlantName, getStorageLocation/{plantId},
      AddPurchaseOrderDetails.
*/

const PurchaseOrderMaterials = () => {

    let { purchaseOrderId } = useParams();

    let { showLoader, hideLoader } = useLoader();
    const history = useHistory();
    const UserDetails = useSelector((state) => (state && state.auth ? state.auth.userData : {}));

    const [data, setData] = useState({});
    const [brokerName, setBrokerName] = useState('');
    const [brokerLocked, setBrokerLocked] = useState(false);
    const [customerCode, setCustomerCode] = useState('');
    const [customerName, setCustomerName] = useState('');
    const [customerLocked, setCustomerLocked] = useState(false);
    const [segmentOptions, setSegmentOptions] = useState([]);
    const [lines, setLines] = useState([]);
    const [conditionTables, setConditionTables] = useState({});
    const [overAllAmount, setOverAllAmount] = useState(0);
    const [headerMaterialCode, setHeaderMaterialCode] = useState('');
    const [headerMaterialDes, setHeaderMaterialDes] = useState('');
    const [headerSegment, setHeaderSegment] = useState('');
    const [headerSegmentValue, setHeaderSegmentValue] = useState('');
    const [headerUom, setHeaderUom] = useState('');
    const [headerRate, setHeaderRate] = useState(0);

    const form = useFormik({
        isInitialValid: false,
        initialValues: {},
        validationSchema: Yup.object().shape({}),
        onSubmit: () => { },
    });

    // ---------- fetch header info ----------
    const getPurchaseOrderInfo = () => {
        showLoader();
        apiPostMethod(apiBaseUrl + `CustomMillingMasterController/getPurchaseOrderInfo/${purchaseOrderId}/${UserDetails.USERID}`)
            .then((response) => {
                const { data } = response;
                if (data.success == true) {
                    setData(data.results[0]);
                }
            })
            .catch((error) => {
                console.log(JSON.stringify(error));
                errorToast("Something went wrong, please try again after sometime");
            })
            .finally(() => hideLoader());
    };

    const getSegmentMasterList = (purchaseOrgId) => {
        apiPostMethod(apiBaseUrl + `CustomMillingMasterController/getSegmentDetails/${purchaseOrgId}`)
            .then((response) => {
                const { data } = response;
                if (data.success == 1) {
                    setSegmentOptions(data.results || []);
                }
            })
            .catch((error) => {
                console.log(JSON.stringify(error));
                errorToast("Something went wrong, please try again after sometime");
            });
    };

    // load segment options whenever Purchase Org changes
    useEffect(() => {
        const purchaseOrgId = form?.values?.purchase_org?.value;
        if (purchaseOrgId) {
            getSegmentMasterList(purchaseOrgId);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [form?.values?.purchase_org?.value]);

    const redirect = () => {
        history.push("/PURCHASEORDERCONFIRMATION");
    };

    // ---------- totals: recompute any time lines or condition rows change ----------
    // condition rows don't carry their own TotalAmount, so each one's contribution is
    // rate x that line's Qty - matched here by line number rather than assumed to be 0.
    const recalculateOverAllAmount = (currentLines, currentConditions) => {
        const lineTotal = currentLines.reduce((sum, l) => sum + parseFloat(l.TotalAmount || 0), 0);
        const conditionTotal = Object.entries(currentConditions).reduce((sum, [lineNo, conditions]) => {
            const line = currentLines.find((l) => String(l.Line) === String(lineNo));
            const qty = parseFloat(line?.Qty || 0);
            const lineConditionTotal = (conditions || []).reduce((s, c) => s + (parseFloat(c.rate || 0) * qty), 0);
            return sum + lineConditionTotal;
        }, 0);
        setOverAllAmount((lineTotal + conditionTotal).toFixed(2));
    };

    // ---------- order-entry grid: add a blank row pre-filled from the header Segment selection, ----------
    // ---------- SAP-style line numbers (10, 20, 30...), and immediately open its Condition Changes ----------
    const addNewRow = () => {
        const nextLineNo = lines.length === 0 ? 10 : Math.max(...lines.map((l) => l.Line)) + 10;
        const newLine = {
            Line: nextLineNo,
            SegmentCode: headerSegment || '',
            MaterialCode: headerMaterialCode || '',
            MaterialDes: headerMaterialDes || '',
            PoLoadingDate: '',
            VendorCode: '', VendorName: '',
            Qty: '', NoOfVehicles: '', Uom: headerUom || '', Rate: headerRate || '', TotalAmount: 0,
        };
        const newLines = [...lines, newLine];
        setLines(newLines);
        getConditionChanges(nextLineNo, newLines);
        // segment options are loaded by the purchase_org useEffect; no extra calls needed here
    };

    // ---------- header Segment Code (next to Broker Name): auto-fills header Material Code/Des/Uom/Rate ----------
    const headerSegmentChange = (segmentValue) => {
        setHeaderSegment(segmentValue);
        const selected = segmentOptions.find((o) => (o.segment || o.value) == segmentValue);
        if (!selected) {
            setHeaderMaterialCode('');
            setHeaderMaterialDes('');
            setHeaderUom('');
            setHeaderSegmentValue('');
            setHeaderRate(0);
            return;
        }
        setHeaderSegmentValue(selected.value);
        setHeaderMaterialCode(selected.material_code || selected.materialCode || '');
        setHeaderMaterialDes(selected.material_description || selected.materialDes || '');
        setHeaderUom(selected.uom || selected.UOM || 'TON');
        setHeaderRate(selected.rate || selected.Rate || 0);
    };

    // ---------- remove a line entirely: drops the row + its Condition Changes section ----------
    const removeLine = (index) => {
        const lineNo = lines[index].Line;
        const newLines = lines.filter((_, i) => i !== index);
        setLines(newLines);

        const newConditionTables = { ...conditionTables };
        delete newConditionTables[lineNo];
        setConditionTables(newConditionTables);

        recalculateOverAllAmount(newLines, newConditionTables);
    };

    // ---------- generic row field update (Manual cells, plus internal recompute of Total Amount) ----------
    const updateLine = (index, field, value) => {
        const newLines = [...lines];
        const item = { ...newLines[index], [field]: value };
        item.TotalAmount = ((item.Rate == '' || item.Rate == undefined || item.Qty == '' || item.Qty == undefined)
            ? 0
            : Number(item.Rate * item.Qty).toFixed(2));
        newLines[index] = item;
        setLines(newLines);
        recalculateOverAllAmount(newLines, conditionTables);
    };

    // ---------- Vendor Code search icon -> auto-fills Vendor Name for that row ----------
    const searchVendor = (index) => {
        const vendorCode = lines[index].VendorCode;
        if (!vendorCode) {
            errorToast("Please enter Vendor Code");
            return;
        }
        apiPostMethod(apiBaseUrl + `CustomMillingMasterController/getVendor/${vendorCode}`)
            .then((response) => {
                const { data } = response;
                if (data.success == true && data.results?.[0]) {
                    const newLines = [...lines];
                    newLines[index] = {
                        ...newLines[index],
                        VendorName: data.results[0].VENDORNAME || data.results[0].vendorName || '',
                        vendorLocked: true,   // disables Vendor Code input for this row
                    };
                    setLines(newLines);
                } else {
                    errorToast("Vendor not found");
                }
            })
            .catch((error) => {
                console.log(JSON.stringify(error));
                errorToast("Something went wrong, please try again after sometime");
            });
    };

    // ---------- Broker Code search icon (header field) -> auto-fills Broker Name, then locks the input ----------
    const searchBroker = () => {
        const brokerCode = form.values.broker_code;
        if (!brokerCode) {
            errorToast("Please enter Broker Code");
            return;
        }
        apiPostMethod(apiBaseUrl + `CustomMillingMasterController/getVendor/${brokerCode}`)
            .then((response) => {
                const { data } = response;
                if (data.success == true && data.results?.[0]) {
                    setBrokerName(data.results[0].VENDORNAME || data.results[0].brokerName || '');
                    setBrokerLocked(true);
                } else {
                    errorToast("Broker not found");
                }
            })
            .catch((error) => {
                console.log(JSON.stringify(error));
                errorToast("Something went wrong, please try again after sometime");
            });
    };

    // ---------- Customer Code search icon (header field) -> auto-fills Customer Name, then locks the input ----------
    const searchCustomer = () => {
        if (!customerCode) {
            errorToast("Please enter Customer Code");
            return;
        }
        apiPostMethod(apiBaseUrl + `CustomMillingMasterController/getCustomerCode/${customerCode}`)
            .then((response) => {
                const { data } = response;
                if (data.success == true && data.results?.[0]) {
                    setCustomerName(data.results[0].NAME_1 || data.results[0].brokerName || '');
                    setCustomerLocked(true);
                } else {
                    errorToast("Customer not found");
                }
            })
            .catch((error) => {
                console.log(JSON.stringify(error));
                errorToast("Something went wrong, please try again after sometime");
            });
    };

    // ---------- Condition Changes for a given line - fetched (by Segment) as soon as the line is added ----------
    const getConditionChanges = (lineNo, currentLines) => {
        const lineItem = (currentLines || lines).find((l) => l.Line === lineNo);
        console.log(lineItem)
        const segmentValue = lineItem?.SegmentCode || headerSegment || '';
        const segmentValues = lineItem?.value || headerSegmentValue || '';
        apiPostMethod(apiBaseUrl + `CustomMillingMasterController/getConditionChanges/${segmentValue}/${segmentValues}`)
            .then((response) => {
                const { data } = response;
                if (data.success == 1) {
                    const newConditionTables = { ...conditionTables, [lineNo]: data.results };
                    setConditionTables(newConditionTables);
                    recalculateOverAllAmount(currentLines, newConditionTables);
                }
            })
            .catch((error) => {
                console.log(JSON.stringify(error));
                errorToast("Something went wrong, please try again after sometime");
            });
    };

    const removeCondition = (lineNo, condIndex) => {
        const updatedRows = conditionTables[lineNo].filter((_, i) => i !== condIndex);
        const newConditionTables = { ...conditionTables, [lineNo]: updatedRows };
        setConditionTables(newConditionTables);
        recalculateOverAllAmount(lines, newConditionTables);
    };

    // ---------- Submit ----------
    const AddPurchaseOrderDetails = () => {

        const formData = form.values;

        if (lines.length == 0) {
            confirmDialog({
                title: `<h5><strong class="text-white">Please Add at least one Line</strong></h5>`,
                cancelButton: false, confirmText: false, confirmButton: false, background: `#BD362F`
            });
            return;
        }

        // validate every line has its required fields before building the payload
        let incompleteLineNo = null;
        for (let index = 0; index < lines.length; index++) {
            const l = lines[index];
            const plant = form.values[`plant_${index}`];
            const storage = form.values[`storage_${index}`];
            if ((l.SegmentCode == '' || l.SegmentCode == undefined) ||
                (l.VendorName == '' || l.VendorName == undefined) ||
                (l.Qty == '' || l.Qty == undefined) ||
                (plant?.value == '' || plant?.value == undefined) ||
                (storage?.value == '' || storage?.value == undefined)) {
                incompleteLineNo = l.Line;
                break;
            }
        }

        if (incompleteLineNo !== null ||
            (formData?.purchase_org?.value == '' || formData?.purchase_org?.value == undefined) ||
            (brokerName == '' || brokerName == undefined) ||
            (customerName == '' || customerName == undefined)) {
            let message = (formData?.purchase_org?.value == '' || formData?.purchase_org?.value == undefined) ? 'Please Select Purchase Org'
                : (brokerName == '' || brokerName == undefined) ? 'Please Enter Correct Broker Code'
                : (customerName == '' || customerName == undefined) ? 'Please Enter Correct Customer Code'
                : `Please complete all fields for Line ${incompleteLineNo}`;
            confirmDialog({
                title: `<h5><strong class="text-white">` + message + `</strong></h5>`, cancelButton: false, confirmText: false, confirmButton: false, background: `#BD362F`
            });
            return;
        }

        const FrmData = {
            purchaseOrderId: data.purchaseOrderId,
            UserId: UserDetails.USERID,
            purchase_org: formData?.purchase_org?.label,
            broker_code: formData?.broker_code,
            broker_name: brokerName,
            customer_code: customerCode,
            customer_name: customerName,
            LineDetails: lines.map((l, index) => {
                const plant = form.values[`plant_${index}`];
                const storage = form.values[`storage_${index}`];
                const bagType = form.values[`bagType_${index}`];
                return {
                    ...l,
                    PlantName: plant?.label,
                    StorageLocation: storage?.label,
                    BagType: bagType?.value,
                    ConditionChanges: conditionTables[l.Line] || []
                };
            }),
            OverAllAmount: overAllAmount,
        };

        showLoader();
        apiPostMethod(apiBaseUrl + "CustomMillingMasterController/AddPurchaseOrderDetails", FrmData)
            .then((response) => {
                const { data } = response;
                if (data.success == true) {
                    confirmDialog({ title: `<h5><strong class="text-white"> ${'PO Added Sucessfully'}</strong></h5>`, cancelButton: false, confirmText: false, confirmButton: false, background: `#51A351` }).then(() =>{ 
                        window.location.reload(); // Reloads the page after the confirm dialog is closed });
                    })
                }
                else if (data.success == false) {
                    errorToast(data.message);
                }
            })
            .catch((error) => {
                console.log(JSON.stringify(error));
                errorToast("Something went wrong, please try again after sometime");
            })
            .finally(() => {
                hideLoader();
            });
    };

    return (
        <Fragment>
            <Card>
                <CardHeader><h5>Purchase Order Screen</h5></CardHeader>
                <hr></hr>
                <CardBody>
                    <Row>
                        <Col md="3" sm="6">
                            <CustomDropdownInput
                                url={apiBaseUrl + "CustomMillingMasterController/getPurchaseOrg"}
                                label={"Purchase Org"}
                                form={form}
                                id={"purchase_org"}
                            />
                        </Col>
                        <Col md="3" sm="6">
                            <FormGroup>
                                <Label>Broker Code</Label>
                                <InputGroup>
                                    <Input
                                        type="text"
                                        placeholder="Enter Broker Code"
                                        name="broker_code"
                                        value={form.values.broker_code || ''}
                                        onChange={form.handleChange}
                                        disabled={brokerLocked}
                                    />
                                    <InputGroupAddon addonType="append">
                                        <Button.Ripple color="primary" type="button" onClick={searchBroker} disabled={brokerLocked}>
                                            <Search size={14} />
                                        </Button.Ripple>
                                    </InputGroupAddon>
                                </InputGroup>
                            </FormGroup>
                        </Col>
                        <Col md="3" sm="6">
                            <FormGroup>
                                <Label>Broker Name</Label>
                                <Input type="text" placeholder="Broker Name" value={brokerName} disabled />
                            </FormGroup>
                        </Col>
                        <Col md="3" sm="6">
                            <FormGroup>
                                <Label>OverAll Amount</Label>
                                <Input type="text" placeholder="OverAll Amount" value={overAllAmount} disabled />
                            </FormGroup>
                        </Col>
                    </Row>
                    <Row>
                        <Col md="3" sm="12">
                            <FormGroup>
                                <Label>Segment Code</Label>
                                <Input type="select" value={headerSegment}
                                    onChange={(e) => headerSegmentChange(e.target.value)}>
                                    <option value="">Select Segment</option>
                                    {segmentOptions.map((opt, oi) => (
                                        <option key={oi} value={opt.segment || opt.value}>
                                            {opt.segmentName || opt.label || opt.segment}
                                        </option>
                                    ))}
                                </Input>
                            </FormGroup>
                        </Col>
                        <Col md="3" sm="12">
                            <FormGroup>
                                <Label>Material Code</Label>
                                <Input type="text" value={headerMaterialCode} disabled />
                            </FormGroup>
                        </Col>
                        <Col md="3" sm="12">
                            <FormGroup>
                                <Label>Material Des</Label>
                                <Input type="text" value={headerMaterialDes} disabled />
                            </FormGroup>
                        </Col>
                        <Col md="3" sm="12">
                            <FormGroup>
                                <Label>Customer Code</Label>
                                <InputGroup>
                                    <Input
                                        type="text"
                                        placeholder="Enter Customer Code"
                                        value={customerCode}
                                        disabled={customerLocked}
                                        onChange={(e) => setCustomerCode(e.target.value)}
                                    />
                                    <InputGroupAddon addonType="append">
                                        <Button.Ripple color="primary" type="button" onClick={searchCustomer} disabled={customerLocked}>
                                            <Search size={14} />
                                        </Button.Ripple>
                                    </InputGroupAddon>
                                </InputGroup>
                            </FormGroup>
                        </Col>
                        <Col md="3" sm="12">
                            <FormGroup>
                                <Label>Customer Name</Label>
                                <Input type="text" placeholder="Customer Name" value={customerName} disabled />
                            </FormGroup>
                        </Col>
                    </Row>
                    <br />
                    <div style={{ width: '100%', overflowX: 'auto' }}>
                        <table className="table table-bordered"
                            style={{ width: '100%', minWidth: '2500px', textAlign: 'left', tableLayout: 'fixed' }}>
                            <thead>
                                <tr>
                                    <td className="bg-primary text-white text-center" width='8%'>Line</td>
                                    <td className="bg-primary text-white text-center" width='10%'>PO Loading Date</td>
                                    <td className="bg-primary text-white text-center" width='15%'>Vendor Code</td>
                                    <td className="bg-primary text-white text-center" width='15%'>Vendor Name</td>
                                    <td className="bg-primary text-white text-center" width='10%'>Bag Type</td>
                                    <td className="bg-primary text-white text-center" width='8%'>QTY</td>
                                    <td className="bg-primary text-white text-center" width='9%'>No Of Vehicles</td>
                                    <td className="bg-primary text-white text-center" width='8%'>Uom</td>
                                    <td className="bg-primary text-white text-center" width='8%'>Rate</td>
                                    <td className="bg-primary text-white text-center" width='10%'>Total Amount</td>
                                    <td className="bg-primary text-white text-center" width='12%'>Plant Name</td>
                                    <td className="bg-primary text-white text-center" width='12%'>Storage Location</td>
                                    <td className="bg-primary text-white text-center" width='8%'>Action</td>
                                </tr>
                            </thead>
                            <tbody>
                                {lines?.map((item, index) => (
                                    <tr key={item.Line}>
                                        <td className='text-center'>{item.Line}</td>
                                        <td className='text-center'>
                                            <Input type="date" value={item.PoLoadingDate || ''}
                                                onChange={(e) => updateLine(index, 'PoLoadingDate', e.target.value)}
                                            />
                                        </td>
                                        <td className='text-center'>
                                            <InputGroup>
                                                <Input type="text" placeholder="Vendor Code" value={item.VendorCode || ''}
                                                    disabled={item.vendorLocked}
                                                    onChange={(e) => updateLine(index, 'VendorCode', e.target.value)}
                                                />
                                                <InputGroupAddon addonType="append">
                                                    <Button.Ripple color="primary" size="sm" type="button"
                                                        disabled={item.vendorLocked}
                                                        onClick={() => searchVendor(index)}>
                                                        <Search size={12} />
                                                    </Button.Ripple>
                                                </InputGroupAddon>
                                            </InputGroup>
                                        </td>
                                        <td className='text-center'>{item.VendorName}</td>
                                        <td className='text-center'>
                                            <CustomDropdownInput
                                                url={apiBaseUrl + "CustomMillingMasterController/getBagType"}
                                                form={form}
                                                id={`bagType_${index}`}
                                            />
                                        </td>
                                        <td className='text-center'>
                                            <Input type="text" placeholder="Qty" value={item.Qty || ''}
                                                onChange={(e) => updateLine(index, 'Qty', e.target.value)}
                                            />
                                        </td>
                                        <td className='text-center'>
                                            <Input type="text" placeholder="No Of Vehicles" value={item.NoOfVehicles || ''}
                                                onChange={(e) => updateLine(index, 'NoOfVehicles', e.target.value)}
                                            />
                                        </td>
                                        <td className='text-center'>{item.Uom}</td>
                                        <td className='text-center'>{item.Rate}</td>
                                        <td className='text-center'>{item.TotalAmount || 0}</td>
                                        <td className='text-center'>
                                            <CustomDropdownInput
                                                url={apiBaseUrl + `CustomMillingMasterController/getPlantName/${UserDetails.USERID}`}
                                                form={form}
                                                id={`plant_${index}`}
                                            />
                                        </td>
                                        <td className='text-center'>
                                            {form.values[`plant_${index}`]?.value && (
                                                <CustomDropdownInput
                                                    url={apiBaseUrl + `CustomMillingMasterController/getStorageLocation/${form.values[`plant_${index}`]?.value}`}
                                                    form={form}
                                                    id={`storage_${index}`}
                                                />
                                            )}
                                        </td>
                                        <td className='text-center'>
                                            <Button.Ripple color="danger" size="sm" type="button"
                                                onClick={() => removeLine(index)}>
                                                <Trash2 size={14} />
                                            </Button.Ripple>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <br />
                        {(form.values.purchase_org?.value && headerSegment) &&
                            <Button.Ripple outline color="primary" type="button" onClick={addNewRow}>
                                <Plus size={16} /> Add Row
                            </Button.Ripple>}
                        <br />
                        <br />
                    </div>
                    {lines.map((line) => (
                        <Row key={line.Line}>
                            <Col md="6" sm="12">
                                <br />
                                <table className="table table-bordered">
                                    <thead>
                                        <tr>
                                            <td colSpan="5" className="bg-primary text-white text-center">
                                                Condition Changes - Line {line.Line}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="bg-primary text-white text-center">Condition Type</td>
                                            <td className="bg-primary text-white text-center">Condition Description</td>
                                            <td className="bg-primary text-white text-center">Rate</td>
                                            <td className="bg-primary text-white text-center">Total Amount</td>
                                            <td className="bg-primary text-white text-center">Action</td>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(conditionTables[line.Line] || []).map((cond, ci) => (
                                            <tr key={ci}>
                                                <td className='text-center'>{cond.condition_type_code}</td>
                                                <td className='text-center'>{cond.condition_description}</td>
                                                <td className='text-center'>{cond.rate}</td>
                                                <td className='text-center'>{((cond.rate || 0) * (line.Qty || 0)).toFixed(2)}</td>
                                                <td className='text-center'>
                                                    <Button.Ripple color="danger" size="sm" type="button"
                                                        onClick={() => removeCondition(line.Line, ci)}>
                                                        Remove
                                                    </Button.Ripple>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </Col>
                        </Row>
                    ))}

                    <Row>
                        <Col md="12" sm="12">
                            <br></br>
                            <FormGroup>
                                <div style={{ float: 'right' }}>
                                    <Button.Ripple className="ml-2" outline color="primary" type="button" onClick={redirect}>
                                        <ArrowLeft size={16} /> Cancel
                                    </Button.Ripple>
                                    <Button.Ripple className="ml-2" color="primary" type="button" onClick={AddPurchaseOrderDetails}>
                                        <Check size={16} /> Submit
                                    </Button.Ripple>
                                </div>
                            </FormGroup>
                        </Col>
                    </Row>
                </CardBody>
            </Card>
        </Fragment>
    );
};

export default PurchaseOrderMaterials;