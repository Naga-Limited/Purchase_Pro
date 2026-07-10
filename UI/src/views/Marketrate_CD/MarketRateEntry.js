import { useFormik } from 'formik';
import React, { Fragment, useEffect, useState } from 'react';
import {
    Row, Col, Button, FormGroup, Input,
    CardTitle, CardBody, Card, CardHeader, Modal, ModalHeader, ModalBody
} from 'reactstrap';
import { apiBaseUrl } from '../../urlConstants';
import { CardComponent } from '../common/CardComponent';
import { apiPostMethod } from "@helpers/axiosHelper";
import { CustomTextInput, Yup, CustomDropdownInput } from '../forms/custom-form';
import { HrLine } from '../common/HrLine';
import { useLoader } from "../../utility/hooks/useLoader";
import { errorToast, ShowToast } from '../../helper/appHelper';
import { useSelector } from 'react-redux';
import moment from 'moment';
import TableComponent from '../common/TableComponent';
import { useQrReader } from 'react-qr-reader';

/* ─── Responsive table styles ──────────────────────────────────────────────── */
const tableHeaderStyle = { background: "#7374f0", color: "white" };

const responsiveStyles = `
  @media (max-width: 767px) {
    .mrt-desktop-table { display: none !important; }
    .mrt-mobile-cards  { display: block !important; }
  }
  @media (min-width: 768px) {
    .mrt-desktop-table { display: table !important; }
    .mrt-mobile-cards  { display: none !important; }
  }
  .mrt-card-row {
    border: 1px solid #dee2e6;
    border-radius: 8px;
    padding: 12px 14px;
    margin-bottom: 12px;
    background: #fff;
    box-shadow: 0 1px 4px rgba(0,0,0,.07);
  }
  .mrt-card-row .mrt-field { margin-bottom: 10px; }
  .mrt-card-row .mrt-field label {
    display: block;
    font-size: 11px;
    font-weight: 600;
    color: #7374f0;
    text-transform: uppercase;
    letter-spacing: .5px;
    margin-bottom: 3px;
  }
  .mrt-card-row .mrt-item-title {
    font-size: 14px;
    font-weight: 600;
    color: #333;
    margin-bottom: 10px;
    padding-bottom: 6px;
    border-bottom: 2px solid #7374f0;
  }
`;

export const taColumns = [
    { name: "Date",           selector: "entry_date",    sortable: true, minWidth: "100px" },
    { name: "Groceries Type", selector: "groceries_type", sortable: true, minWidth: "100px" },
    { name: "State Name",     selector: "state_name",    sortable: true, minWidth: "100px" },
];

/* ─── Mobile card for a single item row ─────────────────────────────────────── */
function ItemCardMobile({ item, index, tableData, setTableData, form, apiBaseUrl, isVendor }) {
    return (
        <div className="mrt-card-row">
            <div className="mrt-item-title">{item.name}</div>

            <Row>
                <Col xs="6">
                    <div className="mrt-field">
                        <label>Rate (₹)</label>
                        <Input
                            type="number"
                            value={item.rate}
                            onChange={(e) => {
                                const updated = [...tableData];
                                updated[index].rate = e.target.value;
                                setTableData(updated);
                            }}
                        />
                    </div>
                </Col>
                <Col xs="6">
                    <div className="mrt-field">
                        <label>UOM</label>
                        <Input value={item.uom} disabled />
                    </div>
                </Col>
            </Row>

            <div className="mrt-field">
                <label>Link</label>
                <Input
                    type="text"
                    value={item.link}
                    onChange={(e) => {
                        const updated = [...tableData];
                        updated[index].link = e.target.value;
                        setTableData(updated);
                    }}
                />
            </div>

            <div className="mrt-field">
                <label>District</label>
                {isVendor ? (
                    <Input value={item.district?.label || ""} disabled />
                ) : (
                    <CustomDropdownInput
                        url={
                            form.values.State?.value
                                ? `${apiBaseUrl}MarketRateCD/MrtRateController/getDistrictsByState/${form.values.State.value}`
                                : ""
                        }
                        form={form}
                        id={`district_mobile_${index}`}
                        value={item.district}
                        onChange={(selected) => {
                            const updated = [...tableData];
                            updated[index].district = selected;
                            updated[index].city = null;
                            setTableData(updated);
                        }}
                        isDisabled={!form.values.State}
                    />
                )}
            </div>

            <div className="mrt-field">
                <label>City</label>
                {isVendor ? (
                    <Input value={item.city?.label || ""} disabled />
                ) : (
                    <CustomDropdownInput
                        url={
                            item.district?.value
                                ? `${apiBaseUrl}MarketRateCD/MrtRateController/getCitiesByDistrict/${item.district.value}`
                                : ""
                        }
                        form={form}
                        id={`city_mobile_${index}`}
                        value={item.city}
                        onChange={(selected) => {
                            const updated = [...tableData];
                            updated[index].city = selected;
                            setTableData(updated);
                        }}
                        isDisabled={!item.district?.value}
                    />
                )}
            </div>

            <div className="mrt-field">
                <label>Market Place</label>
                <Input
                    type="text"
                    value={item.market_place}
                    onChange={(e) => {
                        const updated = [...tableData];
                        updated[index].market_place = e.target.value;
                        setTableData(updated);
                    }}
                />
            </div>
        </div>
    );
}

/* ─── Mobile card for modal (edit) rows ─────────────────────────────────────── */
function ModalItemCardMobile({ item, index, selectedRowData, setSelectedRowData, form, apiBaseUrl }) {
    return (
        <div className="mrt-card-row">
            <div className="mrt-item-title">{item.groceries_name}</div>

            <Row>
                <Col xs="6">
                    <div className="mrt-field">
                        <label>Rate (₹)</label>
                        <Input
                            type="number"
                            value={item.groceries_rate}
                            onChange={(e) => {
                                const updated = [...selectedRowData];
                                updated[index].groceries_rate = e.target.value;
                                setSelectedRowData(updated);
                            }}
                        />
                    </div>
                </Col>
                <Col xs="6">
                    <div className="mrt-field">
                        <label>UOM</label>
                        <Input value={item.groceries_uom} disabled />
                    </div>
                </Col>
            </Row>

            <div className="mrt-field">
                <label>Link</label>
                <Input
                    value={item.groceries_ref_link}
                    onChange={(e) => {
                        const updated = [...selectedRowData];
                        updated[index].groceries_ref_link = e.target.value;
                        setSelectedRowData(updated);
                    }}
                />
            </div>

            <div className="mrt-field">
                <label>District</label>
                <CustomDropdownInput
                    url={
                        selectedRowData[0]?.state_id
                            ? `${apiBaseUrl}MarketRateCD/MrtRateController/getDistrictsByState/${selectedRowData[0].state_id}`
                            : ""
                    }
                    form={form}
                    id={`modal_district_mobile_${index}`}
                    value={item.district_id ? { value: item.district_id, label: item.district_name } : null}
                    onChange={(selected) => {
                        const updated = [...selectedRowData];
                        updated[index].district_id   = selected?.value || null;
                        updated[index].district_name = selected?.label || "";
                        setSelectedRowData(updated);
                    }}
                    placeholder={selectedRowData[0]?.state_id ? "Select District" : "Select State First"}
                    isDisabled={!selectedRowData[0]?.state_id}
                    isClearable
                />
            </div>

            <div className="mrt-field">
                <label>City</label>
                <CustomDropdownInput
                    url={
                        item.district_id
                            ? `${apiBaseUrl}MarketRateCD/MrtRateController/getCitiesByDistrict/${item.district_id}`
                            : ""
                    }
                    form={form}
                    id={`modal_city_mobile_${index}`}
                    value={item.city_id ? { value: item.city_id, label: item.city_name } : null}
                    onChange={(selected) => {
                        const updated = [...selectedRowData];
                        updated[index].city_id   = selected?.value || null;
                        updated[index].city_name = selected?.label || "";
                        setSelectedRowData(updated);
                    }}
                    isDisabled={!item.district_id}
                    isClearable
                />
            </div>

            <div className="mrt-field">
                <label>Market Place</label>
                <Input
                    value={item.market_place}
                    onChange={(e) => {
                        const updated = [...selectedRowData];
                        updated[index].market_place = e.target.value;
                        setSelectedRowData(updated);
                    }}
                />
            </div>
        </div>
    );
}

/* ─── Main Component ─────────────────────────────────────────────────────────── */
function RMrtRateEntry() {
    const dateFormat = "YYYY-MM-DD";
    const today = moment().format(dateFormat);
    const [data, setData] = useState([]);
    const [tableData, setTableData] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedRowData, setSelectedRowData] = useState([]);
    const { showLoader, hideLoader } = useLoader();
    const UserDetails = useSelector((state) => (state?.auth?.userData || {}));

    const isVendor = UserDetails.role === 'Vendor';

    useEffect(() => { callgetotpdata(); }, []);

    const callgetotpdata = () => {
        apiPostMethod(apiBaseUrl + `MarketRateCD/MrtRateController/getmarketratedetails/${today}`)
            .then((response) => {
                const { data } = response;
                if (data.success === 1) setData(data.results);
                else errorToast(data.error);
            })
            .catch(() => errorToast("Something went wrong, please try again later."));
    };

    const form = useFormik({
        isInitialValid: false,
        initialValues: { entry_date: today, GroceriesType: null, State: null },
        validationSchema: Yup.object().shape({}),
        onSubmit(values) {}
    });

    const fetchGroceriesTypeData = async (movementTypeLabel) => {
        try {
            showLoader();
            const res = await apiPostMethod(
                `${apiBaseUrl}MarketRateCD/MrtRateController/getGrocerieslist`,
                { movement_type: movementTypeLabel, user_id: UserDetails.USERID, role: UserDetails.role }
            );
            if (res.data.success === 1) {
                setTableData(
                    (res.data.results || []).map((item) => ({
                        name:         item.groceriesitem,
                        rate:         "",
                        uom:          item.uom || "KG",
                        link:         "",
                        market_place: "",
                        // ── Vendor: freeze state / district / city using IDs from API ──
                        // ── Non-vendor: start with nulls so dropdowns are free ──────────
                        state: isVendor && item.state_id
                            ? { value: item.state_id, label: item.state_name }
                            : null,
                        district: isVendor && item.district_id
                            ? { value: item.district_id, label: item.district_name }
                            : null,
                        city: isVendor && item.city_id
                            ? { value: item.city_id, label: item.city_name }
                            : null,
                    }))
                );
            } else {
                errorToast("Failed to fetch Groceries List");
            }
        } catch { errorToast("Error fetching data"); }
        finally { hideLoader(); }
    };

    const handlesubmitButtonClick = () => {
        const formData = form.values;
        if (!formData.GroceriesType) { errorToast('Please select Groceries Type'); return; }

        const postData = {
            entry_date:     formData.entry_date,
            groceries_type: formData.GroceriesType?.value || "",
            // Vendor → state_id from frozen per-row API data (all rows share the same state)
            // Non-Vendor → state_id from the form-level State dropdown
            state: isVendor ? (tableData[0]?.state?.value || "") : (formData.State?.value || ""),
            created_by: UserDetails.USERID,
            user_role: UserDetails.role,
            tableItems: tableData.map((item) => ({
                item_name:         item.name,
                item_rate:         item.rate,
                item_uom:          item.uom,
                item_link:         item.link,
                // Vendor  → state/district/city come from per-row data (frozen from API)
                // Non-Vendor → state from form-level, district/city from per-row dropdowns
                item_state:        isVendor ? item.state?.value : (formData.State?.value || ""),
                item_district:     item.district?.value || "",
                item_city:         item.city?.value || "",
                item_market_place: item.market_place,
            })),
        };

        showLoader();
        apiPostMethod(apiBaseUrl + "MarketRateCD/MrtRateController/InsertMrtRatedetails", postData)
            .then((response) => {
                const { data } = response;
                if (data.success === 1) { ShowToast("Saved Successfully..."); setTimeout(() => window.location.reload(), 2000); }
                else errorToast(data.error);
            })
            .catch(() => errorToast("Something went wrong, please try again later."))
            .finally(() => hideLoader());
    };

    const handleView = async (row) => {
        setModalOpen(true);
        showLoader();
        try {
            const res = await apiPostMethod(`${apiBaseUrl}MarketRateCD/MrtRateController/getmarketratedetailsforview`, {
                groceries_type: row.groceries_id,
                date:           row.entry_date,
            });
            if (res.data.success) setSelectedRowData(res.data.results || []);
            else errorToast("Failed to load grocery rate data");
        } catch { errorToast("Error fetching data"); }
        finally { hideLoader(); }
    };

    const handleSaveModalChanges = async () => {
        try {
            showLoader();
            const response = await apiPostMethod(
                `${apiBaseUrl}MarketRateCD/MrtRateController/updateGroceryRates`,
                { updatedItems: selectedRowData, updated_by: UserDetails.USERID }
            );
            if (response.data.success === 1) {
                ShowToast("Updated successfully.");
                setModalOpen(false);
                callgetotpdata();
                setTimeout(() => window.location.reload(), 2000);
            } else {
                errorToast(response.data.error || "Update failed.");
            }
        } catch { errorToast("Error while saving changes."); }
        finally { hideLoader(); }
    };

    const actionsCol = {
        name: "Actions",
        selector: "Edit",
        minWidth: "120px",
        cell: (row) => (
            <Button.Ripple color="primary" onClick={() => handleView(row)}>Edit</Button.Ripple>
        ),
    };

    const columns = isVendor
        ? [...taColumns]
        : [...taColumns, actionsCol];

    return (
        <div>
            <style>{responsiveStyles}</style>

            <Fragment>
                <CardComponent header="Market Rate Entry Screen">
                    <Row>
                        <Col md="4" sm="12">
                            <CustomTextInput label="Date" form={form} id="entry_date" name="entry_date" type="date" disabled />
                        </Col>
                        <Col md="4" sm="12">
                            <CustomDropdownInput
                                url={`${apiBaseUrl}MarketRateCD/MrtRateController/getGroceriesCategory/${UserDetails.USERID}/${UserDetails.role}`}
                                label="Groceries Category"
                                id="GroceriesType"
                                name="GroceriesType"
                                form={form}
                                onChange={(selected) => {
                                    form.setFieldValue("GroceriesType", selected);
                                    if (selected?.value) fetchGroceriesTypeData(selected.value);
                                }}
                            />
                        </Col>

                        {/* State — frozen read-only for Vendor, free dropdown for others */}
                        <Col md="4" sm="12">
                            {isVendor ? (
                                /* Show the state from the API response (same for all rows) */
                                <div>
                                    <label style={{ fontWeight: 600, fontSize: "0.875rem" }}>State</label>
                                    <Input
                                        value={tableData[0]?.state?.label || ""}
                                        disabled
                                    />
                                </div>
                            ) : (
                                <CustomDropdownInput
                                    url={`${apiBaseUrl}MarketRateCD/MrtRateController/getStates`}
                                    label="State"
                                    id="State"
                                    name="State"
                                    form={form}
                                    onChange={(selected) => {
                                        form.setFieldValue("State", selected);
                                        const updated = [...tableData];
                                        updated.forEach(item => { item.district = null; item.city = null; });
                                        setTableData(updated);
                                    }}
                                />
                            )}
                        </Col>
                    </Row>

                    {tableData.length > 0 && (
                        <div className="mt-3">
                            <h5>Item Rate Details</h5>

                            {/* ── DESKTOP TABLE ── */}
                            <div style={{ overflowX: "auto" }}>
                                <table className="table table-bordered mrt-desktop-table" style={{ minWidth: 700 }}>
                                    <thead style={{ background: "#7374f0", color: "white" }}>
                                        <tr>
                                            <th style={{ background: "#7374f0", color: "white", width: '20%' }}>Name</th>
                                            <th style={{ background: "#7374f0", color: "white", width: '10%' }}>Rate (Rupees)</th>
                                            <th style={{ background: "#7374f0", color: "white", width: '12%' }}>UOM</th>
                                            <th style={{ background: "#7374f0", color: "white", width: '12%' }}>Link</th>
                                            <th style={{ background: "#7374f0", color: "white", width: '15%' }}>District</th>
                                            <th style={{ background: "#7374f0", color: "white", width: '15%' }}>City</th>
                                            <th style={{ background: "#7374f0", color: "white", width: '20%' }}>Market Place</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {tableData.map((item, index) => (
                                            <tr key={index}>
                                                <td><Input value={item.name} disabled /></td>
                                                <td>
                                                    <Input type="number" value={item.rate}
                                                        onChange={(e) => { const u = [...tableData]; u[index].rate = e.target.value; setTableData(u); }} />
                                                </td>
                                                <td><Input value={item.uom} disabled /></td>
                                                <td>
                                                    <Input type="text" value={item.link}
                                                        onChange={(e) => { const u = [...tableData]; u[index].link = e.target.value; setTableData(u); }} />
                                                </td>

                                                {/* ── District cell ── */}
                                                <td>
                                                    {isVendor ? (
                                                        <Input value={item.district?.label || ""} disabled />
                                                    ) : (
                                                        <CustomDropdownInput
                                                            url={form.values.State?.value
                                                                ? `${apiBaseUrl}MarketRateCD/MrtRateController/getDistrictsByState/${form.values.State.value}`
                                                                : ""}
                                                            form={form}
                                                            id={`district_${index}`}
                                                            value={item.district}
                                                            onChange={(s) => { const u = [...tableData]; u[index].district = s; u[index].city = null; setTableData(u); }}
                                                            isDisabled={!form.values.State}
                                                        />
                                                    )}
                                                </td>

                                                {/* ── City cell ── */}
                                                <td>
                                                    {isVendor ? (
                                                        <Input value={item.city?.label || ""} disabled />
                                                    ) : (
                                                        <CustomDropdownInput
                                                            url={item.district?.value
                                                                ? `${apiBaseUrl}MarketRateCD/MrtRateController/getCitiesByDistrict/${item.district.value}`
                                                                : ""}
                                                            form={form}
                                                            id={`city_${index}`}
                                                            value={item.city}
                                                            onChange={(s) => { const u = [...tableData]; u[index].city = s; setTableData(u); }}
                                                            isDisabled={!item.district?.value}
                                                        />
                                                    )}
                                                </td>

                                                <td>
                                                    <Input type="text" value={item.market_place}
                                                        onChange={(e) => { const u = [...tableData]; u[index].market_place = e.target.value; setTableData(u); }} />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* ── MOBILE CARDS ── */}
                            <div className="mrt-mobile-cards">
                                {tableData.map((item, index) => (
                                    <ItemCardMobile
                                        key={index}
                                        item={item}
                                        index={index}
                                        tableData={tableData}
                                        setTableData={setTableData}
                                        form={form}
                                        apiBaseUrl={apiBaseUrl}
                                        isVendor={isVendor}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    <Col sm="12">
                        <FormGroup className="d-flex mb-0 justify-content-end mt-2">
                            <Button.Ripple color="primary" onClick={handlesubmitButtonClick}>Submit</Button.Ripple>
                        </FormGroup>
                    </Col>
                    <HrLine />
                </CardComponent>
            </Fragment>

            <Card>
                <CardHeader><CardTitle>Market Rate details</CardTitle></CardHeader>
                <CardBody><TableComponent columns={columns} data={data} /></CardBody>
            </Card>

            <Modal isOpen={modalOpen} toggle={() => setModalOpen(!modalOpen)} centered size="xl">
                <ModalHeader toggle={() => setModalOpen(!modalOpen)}>Edit Groceries Rate Details</ModalHeader>
                <ModalBody>
                    <Col md="4" sm="12" className="mb-3">
                        <CustomDropdownInput
                            url={`${apiBaseUrl}MarketRateCD/MrtRateController/getStates`}
                            label="State"
                            id="modalState"
                            form={form}
                            value={
                                selectedRowData[0]?.state_id
                                    ? { value: selectedRowData[0].state_id, label: selectedRowData[0].state_name }
                                    : null
                            }
                            onChange={(selected) => {
                                setSelectedRowData(selectedRowData.map((item) => ({
                                    ...item,
                                    state_id:      selected?.value || null,
                                    state_name:    selected?.label || "",
                                    district_id:   null,
                                    district_name: "",
                                })));
                            }}
                            isClearable
                        />
                    </Col>

                    {/* ── DESKTOP TABLE (modal) ── */}
                    <div style={{ overflowX: "auto" }}>
                        <table className="table table-bordered mrt-desktop-table" style={{ minWidth: 700 }}>
                            <thead style={{ background: "#7374f0", color: "white" }}>
                                <tr>
                                    <th style={{ background: "#7374f0", color: "white", width: '20%' }}>Name</th>
                                    <th style={{ background: "#7374f0", color: "white", width: '10%' }}>Rate (Rupees)</th>
                                    <th style={{ background: "#7374f0", color: "white", width: '12%' }}>UOM</th>
                                    <th style={{ background: "#7374f0", color: "white", width: '12%' }}>Link</th>
                                    <th style={{ background: "#7374f0", color: "white", width: '15%' }}>District</th>
                                    <th style={{ background: "#7374f0", color: "white", width: '15%' }}>City</th>
                                    <th style={{ background: "#7374f0", color: "white", width: '20%' }}>Market Place</th>
                                </tr>
                            </thead>
                            <tbody>
                                {selectedRowData.map((item, index) => (
                                    <tr key={index}>
                                        <td><Input value={item.groceries_name} disabled /></td>
                                        <td>
                                            <Input type="number" value={item.groceries_rate}
                                                onChange={(e) => { const u = [...selectedRowData]; u[index].groceries_rate = e.target.value; setSelectedRowData(u); }} />
                                        </td>
                                        <td><Input value={item.groceries_uom} disabled /></td>
                                        <td>
                                            <Input value={item.groceries_ref_link}
                                                onChange={(e) => { const u = [...selectedRowData]; u[index].groceries_ref_link = e.target.value; setSelectedRowData(u); }} />
                                        </td>
                                        <td>
                                            <CustomDropdownInput
                                                url={selectedRowData[0]?.state_id
                                                    ? `${apiBaseUrl}MarketRateCD/MrtRateController/getDistrictsByState/${selectedRowData[0].state_id}`
                                                    : ""}
                                                form={form}
                                                id={`district_${index}`}
                                                value={item.district_id ? { value: item.district_id, label: item.district_name } : null}
                                                onChange={(s) => { const u = [...selectedRowData]; u[index].district_id = s?.value || null; u[index].district_name = s?.label || ""; setSelectedRowData(u); }}
                                                placeholder={selectedRowData[0]?.state_id ? "Select District" : "Select State First"}
                                                isDisabled={!selectedRowData[0]?.state_id}
                                                isClearable
                                            />
                                        </td>
                                        <td>
                                            <CustomDropdownInput
                                                url={item.district_id
                                                    ? `${apiBaseUrl}MarketRateCD/MrtRateController/getCitiesByDistrict/${item.district_id}`
                                                    : ""}
                                                form={form}
                                                id={`modal_city_${index}`}
                                                value={item.city_id ? { value: item.city_id, label: item.city_name } : null}
                                                onChange={(s) => { const u = [...selectedRowData]; u[index].city_id = s?.value || null; u[index].city_name = s?.label || ""; setSelectedRowData(u); }}
                                                isDisabled={!item.district_id}
                                                isClearable
                                            />
                                        </td>
                                        <td>
                                            <Input value={item.market_place}
                                                onChange={(e) => { const u = [...selectedRowData]; u[index].market_place = e.target.value; setSelectedRowData(u); }} />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* ── MOBILE CARDS (modal) ── */}
                    <div className="mrt-mobile-cards">
                        {selectedRowData.map((item, index) => (
                            <ModalItemCardMobile
                                key={index}
                                item={item}
                                index={index}
                                selectedRowData={selectedRowData}
                                setSelectedRowData={setSelectedRowData}
                                form={form}
                                apiBaseUrl={apiBaseUrl}
                            />
                        ))}
                    </div>

                    <div className="text-end mt-2">
                        <Button.Ripple color="success" onClick={handleSaveModalChanges}>Save Changes</Button.Ripple>
                    </div>
                </ModalBody>
            </Modal>
        </div>
    );
}

export default RMrtRateEntry;