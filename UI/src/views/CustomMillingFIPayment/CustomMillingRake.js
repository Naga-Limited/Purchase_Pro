import React, { useState, useEffect } from "react";
import { apiBaseUrl, sapFileShare } from "../../urlConstants";
import { apiPostMethod, apiGetMethod } from "@helpers/axiosHelper";
import { errorToast, ShowToast } from "@helpers/appHelper";
import { Row, Col, Button, Label, FormGroup, Input, CardHeader,Card, CardBody, InputGroup, } from "reactstrap";
import { ArrowDown, Edit, Eye, Paperclip, Search, X } from "react-feather";
import { useSelector } from "react-redux";
import { Modal } from "react-bootstrap";
import Uploader from "../Uploader";
import { useLoader } from "../../utility/hooks/useLoader";
import confirmDialog from "../../@core/components/confirm/confirmDialog";
import Select from 'react-select';
import { DatePicker } from "../forms/custom-datetime";
import { useFormik } from "formik";
import { CustomDropdownInput, CustomTextInput, Yup } from "../forms/custom-form";
import moment from "moment";
import POCopyModal from "../POCopyModal";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import DateComponent from "../common/dateComponent";

const CustomMillingRake = ({ }) => {

    const form = useFormik({
        isInitialValid: false,
        initialValues: {},
        validationSchema: Yup.object().shape({}),
        onSubmit() { },
    });
    useEffect(() => {
        getGateInInfo()
        // GetPODetails()
    }, [])
    useEffect(() => {
        if (form?.values?.date !== undefined) {
        getGateInInfo()
        GetPODetails()
        }
    }, [form?.values?.date])
    // console.log(form)
    const [data, setData] = useState([])
    const [show1, setShow1] = useState(false)
    const [poData, setPoData] = useState([])
    const [weighmentImages, setWeighmentImages] = useState([])
    const [materialInfo, setMaterialInfo] = useState([])
    const [isDisable, setIsDisable] = useState(false);
    const [selectAll, setSelectAll] = useState(false);
    const [clubbedItems, setClubbedItems] = useState([]);
    const [singleMaxQty, setSingleMaxQty] = useState(0);

    const firstWeight = weighmentImages.filter((item) => item.moduleStatusId === 2);
    const secondWeight = weighmentImages.filter((item) => item.moduleStatusId === 3);

    const [salesDeliveryData, setSalesDeliveryData] = useState([])
    const [truckValue, setTruckValue] = useState('');
    const totalDeliveryQty = (salesDeliveryData.reduce((a, i) => a = a + Number(i.deliveryQty), 0))
    const differentWeight = Number(totalDeliveryQty) - Number(data.netWeight)

    const UserDetails = useSelector((state) => (state && state.auth ? state.auth.userData : {}));

    const getGateInInfo = () => {  
        const formData = form.values
        const fromDate = formData.date != undefined ? new Date(moment(formData.date.start).format('YYYY-MM-DD')) : 0
        const toDate = formData.date != undefined ? new Date(moment(formData.date.end).format('YYYY-MM-DD')) : 0
        const fromDateMilliSecond = formData.date != undefined ? fromDate.getTime() : 0
        const toDateMilliSecond = formData.date != undefined ? toDate.getTime() : 0

        
        const requestData = {
            poNumbers: selectedPoNumbers, // Send the entire array of selected PO numbers
            vendorCode:selectedVendor,
            condtion:condtion,
            fromDate:fromDateMilliSecond,
            toDate:toDateMilliSecond
        };
        // if (!requestData?.poNumbers?.length) {
        //     errorToast('Please select a poNumber');
        //     return;
        // }
    
        // if (!requestData?.vendorCode) {
        //     errorToast('Please select a Vendor Code');
        //     return;
        // } 
        showLoader();
        apiPostMethod(apiBaseUrl + `SupplierDispatch/getCustomMillingMiroDetailsByIdWheatRake`, requestData)  // Send as body, not in URL
            .then((response) => {
                const { data } = response;
                console.log(data.success)
                if (data.success === true) {
                    setPoData(data.results);
                    // Optional: If you want to handle material info or other data
                    // setMaterialInfo(data.materialDetails);
                    // getWeighmentInfo(data.results[0].gateInOutInfoId);
                    setIsDisable(true);
                    InvoiceValidation();

                    const uniqueConditions = Array.from(
                        new Map(
                            (data.results || [])
                                .filter((item) => item.condition_type_code)
                                .map((item) => [item.condition_type_code, item])
                        ).values()
                    ).map((item) => ({
                        label: item.condition_description,
                        value: item.condition_type_code,
                    }));
                    setCondtionOptions(uniqueConditions);
                } else {
                    setPoData([])
                    setCondtionOptions([])
                    errorToast(data.message);
                }
            })
            .catch((error) => {
                setData(false);
                errorToast("Something went wrong, please try again after sometime");
            })
            .finally(() => {
                hideLoader();
            });
    };
  

  

    const [attachedFiles, setAttachment] = useState({ invoice_attachment: {}});
    const [ImgData, setImgData] = useState({});


    const handleFileChange = (file,id) => {
        setAttachment({
            ...attachedFiles,
            [id]: file,
        });
    };


    const { showLoader, hideLoader } = useLoader();

 
   
    const [openImage, setOpenImage] = useState('');
    const [openPdf, setOpenPDF] = useState('');

    const closeRemarksModal = () => setShow1(false);
    const isImage = (url) => /\.(jpg|jpeg|png|gif|bmp|svg|webp)$/i.test(url);
    const isPDF = (url) => /\.pdf$/i.test(url);
   
  
   
    const handleCheckboxChange = (index, isChecked) => {
        const updated = [...poData];
        updated[index].selected = isChecked;
        setPoData(updated); // or your state updater
    };
    const handleSelectAll = (checked) => {
        setSelectAll(checked);
        const updated = poData.map(item => ({ ...item, selected: checked }));
        setPoData(updated);
    };
    const currentDate = new Date().toISOString().split("T")[0];
    const handleKeyDown = (e) => {
        // Prevent typing anything manually in the input field
        e.preventDefault();
    };
    const [date_control, setDate_control] = useState('');
      const InvoiceValidation = () => {
        apiPostMethod(apiBaseUrl + "Loadingunloadingcost/SAP_PostingDate")
          .then((response) => {
            const days = parseInt(response?.data?.results[0]?.miro_date ?? 0);
            const today = new Date();
            const limitedDate = new Date(today);
            limitedDate.setDate(today.getDate() - days);
      
            const formattedMin = limitedDate.toISOString().split("T")[0];
            setDate_control(formattedMin); // use as min
          });
      };

      const [selectedPoNumbers, setSelectedPoNumbers] = useState([]);

      const handlePoNumberChange = (selectedOptions) => {
        setSelectedPoNumbers(selectedOptions || []);
        console.log(selectedOptions)
        // getVendorList(selectedOptions)
        // ConditonType(selectedOptions)
      };

      const [poOptions, setPoOptions] = useState([]);

      const GetPODetails = () => {
        // Replace with the actual API endpoint that provides PO numbers based on userInfoId
        const formData = form.values
        const fromDate = formData.date != undefined ? new Date(moment(formData.date.start).format('YYYY-MM-DD')) : 0
        const toDate = formData.date != undefined ? new Date(moment(formData.date.end).format('YYYY-MM-DD')) : 0
        const fromDateMilliSecond = formData.date != undefined ? fromDate.getTime() : 0
        const toDateMilliSecond = formData.date != undefined ? toDate.getTime() : 0

        apiPostMethod(apiBaseUrl + `SupplierDispatch/getCustomMillingPoNumbersWheat/${UserDetails.USERID}/${fromDateMilliSecond}/${toDateMilliSecond}/${UserDetails.plantids.length > 0 ? UserDetails.plantids.join(',') : 0}/${1}`)  // Assuming '1' is the type for Rake
          .then((response) => {
            if (response.data.success) {
              setPoOptions(response.data.results); // Directly set the PO numbers from backend response
            } else {
              errorToast(response.data.message);
            }
          })
          .catch((error) => {
            errorToast("Error fetching PO numbers:", error);
          });
      };
      const [vendorOptions, setVendorOptions] = useState([]);
      const [selectedVendor, setSelectedVendor] = useState(null);
      const [vendorOptions1, setVendorOptions1] = useState([]);
      const [selectedVendor1, setSelectedVendor1] = useState(null);
      const [condtionOptions, setCondtionOptions] = useState([]);
      const [condtion, setCondtion] = useState(null);
      const handleVendorChange = (selectedOption) => {
            setSelectedVendor(selectedOption || []);
      };
       const handleVendorChange1 = (selectedOption) => {
            setSelectedVendor1(selectedOption || []);
      };
      const handleCondtionChange = (selectedOption) => {
            setCondtion(selectedOption || []);
      };
      const getVendorList = (PoNumbers) => {

        const requestData = {
            PoNumbers: PoNumbers, // Send the entire array of selected PO numbers
           
        };
        apiPostMethod(apiBaseUrl + 'MigoAutomationController/getVendorListWheat',requestData)
            .then((response) => {
                const { data } = response;
                if (data.success) {
                   
                    setVendorOptions(data.results);
                    setVendorOptions1(data.results);
                } else {
                    errorToast(data.message);
                }
            })
            .catch((error) => {
                console.log(error);
                errorToast("Failed to fetch vendor list.");
            });
    };
    const ConditonType = (PoNumbers) => {

        const requestData = {
            PoNumbers: PoNumbers, // Send the entire array of selected PO numbers
           
        };
        apiPostMethod(apiBaseUrl + 'MigoAutomationController/getCondtionWheat',requestData)
            .then((response) => {
                const { data } = response;
                if (data.success) {
                   
                    setCondtionOptions(data.results);
                } else {
                    errorToast(data.message);
                }
            })
            .catch((error) => {
                console.log(error);
                errorToast("Failed to fetch vendor list.");
            });
    };

    const [formValue, setFormValue] = useState({ refDocNo: '', docDate: '' });

    const [selectedPO, setSelectedPO] = useState(null);
    const [poModalOpen, setPoModalOpen] = useState(false);
    const [selectedType, setSelectedType] = useState(null);
    const openPOModal = (poNumber,type) => {
        setSelectedPO(poNumber);
        setSelectedType(type)
        setPoModalOpen(true);
    };
    const togglePOModal = () => setPoModalOpen(!poModalOpen);
    
    
    const exportToExcel = () => {
    console.log(poData)
    // You can export selected rows OR all rows
    const dataToExport = poData.filter(item => item.selected); 
    // If you want all rows use: const dataToExport = poData;
    const dataToExport1 = dataToExport.length === 0 ? poData : dataToExport;

    if (!dataToExport1.length) {
        alert("No data selected for export");
        return;
    }

    // Format data for Excel - one row per truck line under each PO/condition
    const formattedData = dataToExport1.flatMap(item => {
        const lines = item.lines && item.lines.length ? item.lines : [null];
        return lines.map(line => ({
            "PO NO": item.ZPO_NUMBER,
            "Vendor Name": item.ZVENDOR_NAME,
            "Plant": item.WERKS,
            "Purchase Type": item.VEHICLE_TYPE,
            "Condition Type": item.condition_description,
            "Invoice No": item.invoice_no,
            "Qty In Ton": item.gunny_less_wt,
            "Rate": item.rate,
            "Condition Cost": item.condition_amount,
            "Truck No": line?.TRUCK_NO || "",
            "Truck Qty In Ton": line?.total_gunny_less_wt || "",
            "Truck Condition Cost": line?.condition_amount || "",
        }));
    });

    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "MIRO Details");

    const excelBuffer = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array"
    });

    const fileData = new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    });

    saveAs(fileData, "Invoice_Details.xlsx");
    };

    const exportVehicleDetailsToExcel = () => {
        const lines = clubbedItems.length > 0
            ? clubbedItems.flatMap((item) => (item?.lines?.length ? item.lines : [item]))
            : (data?.lines?.length ? data.lines : []);
        if (!lines.length) {
            alert("No vehicle data to export");
            return;
        }

        const formattedData = lines.map(line => ({
            "Truck No": line?.TRUCK_NO,
            "VA Number": line?.ZVA_NUMBER,
            "PO Number": line?.ZPO_NUMBER,
            "Plant": line?.WERKS,
            "Invoice No": line?.invoice_no,
            "Qty In Ton": line?.total_gunny_less_wt || line?.gunny_less_wt,
            "Rate": line?.rate,
            "Amount": line?.condition_amount,
        }));

        const worksheet = XLSX.utils.json_to_sheet(formattedData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Vehicle Details");

        const excelBuffer = XLSX.write(workbook, {
            bookType: "xlsx",
            type: "array"
        });

        const fileData = new Blob([excelBuffer], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        });

        saveAs(fileData, "Vehicle_Details.xlsx");
    };

    const [showModal, setShowModal] = useState(false);
    const OpenData = (materialData) => {
        // Populate form fields for the modal from the selected row (with safe fallbacks)
        setClubbedItems([]);
        setData(materialData);
        setSingleMaxQty(Number(materialData?.gunny_less_wt || 0));
        console.log(materialData)
        try {
            form.setValues({
                ...form.values,
                // row_count: materialData.row_count || 1,
                overall_tonnage: materialData.gunny_less_wt || 0,
                total_value: materialData.condition_amount || materialData.total_value || 0,
                invoice_value: materialData.condition_amount,
                rate: materialData.rate || 0,
                confirm_vendor: materialData.vendor || "",
                tds_name: materialData.tds_name || "",
                vendor_invoice_no: "",
                invoice_date: "",
                remarks: materialData.remarks || "",
                gl: materialData.customMillingGl || "412007",
                cost_center: materialData.customMillingCostCenter || "FR01-WHTMV",
                profit_center: materialData.customMillingProfitCenter || "92001110",
            });
        } catch (e) {
            // if setValues is not available for some reason, still open the modal with data stored in state
            console.warn("Failed to set form values for modal:", e);
        }
        setShowModal(true)
    }

    const OpenClubbedData = () => {
        const selected = poData.filter((item) => item.selected);
        if (selected.length < 2) {
            errorToast("Please select at least 2 rows to club");
            return;
        }
        const totalTonnage = selected.reduce((a, i) => a + Number(i.gunny_less_wt || 0), 0).toFixed(3);
        const totalValue = selected.reduce((a, i) => a + Number(i.condition_amount || 0), 0).toFixed(2);
        const avgRate = totalTonnage > 0 ? (totalValue / totalTonnage).toFixed(2) : 0;
        // maxQty locks in the originally available tonnage for this row, so an
        // edited Qty can never be inflated past what was actually fetched.
        // originalAmount locks in this row's own stable target total_value,
        // same reasoning as the header Total Value: it must not chase edits
        // to Qty/Rate, so what's stored in the DB per row stays comparable
        // against the (possibly edited) invoice_value for that row.
        setClubbedItems(selected.map((row) => ({
            ...row,
            maxQty: Number(row.gunny_less_wt || 0),
            originalAmount: Number(row.condition_amount || 0),
        })));
        setData({});
        try {
            form.setValues({
                ...form.values,
                overall_tonnage: totalTonnage,
                total_value: totalValue,
                invoice_value: totalValue,
                rate: avgRate,
                confirm_vendor: "",
                tds_name: "",
                vendor_invoice_no: "",
                invoice_date: "",
                remarks: "",
                gl: selected[0]?.customMillingGl || "412007",
                cost_center: selected[0]?.customMillingCostCenter || "FR01-WHTMV",
                profit_center: selected[0]?.customMillingProfitCenter || "92001110",
            });
        } catch (e) {
            console.warn("Failed to set form values for clubbed modal:", e);
        }
        setShowModal(true);
    };

    // Recompute tonnage/avg-rate whenever a row's own qty or rate is edited.
    // total_value is intentionally left untouched here - it's the original
    // expected amount captured once at club time, and Difference is meant to
    // show the variance between that stable target and the edited entries,
    // so it must not chase the edits it's supposed to be comparing against.
    const recalcClubbedHeader = (items) => {
        const totalTonnage = items.reduce((a, i) => a + Number(i.gunny_less_wt || 0), 0).toFixed(3);
        const editedTotal = items.reduce((a, i) => a + Number(i.condition_amount || 0), 0).toFixed(2);
        const avgRate = totalTonnage > 0 ? (editedTotal / totalTonnage).toFixed(2) : 0;
        form.setValues({
            ...form.values,
            overall_tonnage: totalTonnage,
            rate: avgRate,
        });
    };

    const handleClubbedItemChange = (index, field, value) => {
        if (field === "gunny_less_wt" && Number(value) > Number(clubbedItems[index]?.maxQty || 0)) {
            errorToast(`Qty cannot exceed available tonnage (${clubbedItems[index]?.maxQty}) for PO ${clubbedItems[index]?.ZPO_NUMBER}`);
            return;
        }
        const updated = [...clubbedItems];
        const row = { ...updated[index], [field]: value };
        row.condition_amount = (Number(row.gunny_less_wt || 0) * Number(row.rate || 0)).toFixed(2);
        updated[index] = row;
        setClubbedItems(updated);
        recalcClubbedHeader(updated);
    };

    const closed = () => setShowModal(false);
    const dateRestriction = DateComponent('invoice')

    const Submit = (fdata) => {
        apiPostMethod(apiBaseUrl + "CustomMillingMasterController/InsertFIPayment", fdata)
            .then((response) => {
                const { data } = response;
                if (data.success == 1) {
                    ShowToast("Saved Successfully...");
                    window.setTimeout(function () {
                        window.location.reload();
                    }, 2000);
                } else if (data.success == 0) {
                    errorToast(data.error);
                }
            })
            .catch((error) => {
                errorToast("Something went wrong, please try again after sometime");
            });
    };

    const POST = () => {
        const isClubbed = clubbedItems.length > 0;

        const toItem = (row) => ({
            poNumbers: row?.ZPO_NUMBER,
            purchaseInfoId: row?.PI_REFID ? String(row.PI_REFID).split(",").map((id) => id.trim()) : [],
            PI_REFID: row?.PI_REFID ? String(row.PI_REFID).split(",").map((id) => id.trim()) : [],
            condtion_id: row?.rmd_id,
            overall_tonnage: row?.gunny_less_wt || 0,
            rate: row?.rate || 0,
            // total_value/difference compare against this row's original,
            // stable target amount (originalAmount) - not condition_amount,
            // which handleClubbedItemChange recomputes on every Qty/Rate
            // edit and would otherwise always net out to ~0 difference.
            total_value: row?.originalAmount ?? row?.condition_amount ?? 0,
            invoice_value: (Number(row?.rate || 0) * Number(row?.gunny_less_wt || 0)).toFixed(2),
            difference: (Number(row?.originalAmount ?? row?.condition_amount ?? 0) - (Number(row?.rate || 0) * Number(row?.gunny_less_wt || 0))).toFixed(2),
        });

        const fdata = {
            process_type: "RAKE",
            overall_tonnage: form.values.overall_tonnage,
            rate: form.values.rate,
            total_value: form.values.total_value,
            invoice_value: (form.values.rate * form.values.overall_tonnage).toFixed(2),
            difference: (form.values.total_value - (form.values.rate * form.values.overall_tonnage)).toFixed(2),
            confirm_vendor: form.values.confirm_vendor?.value || form.values.confirm_vendor,
            tds_code: form.values.tds_code,
            gl: form.values.gl,
            cost_center: form.values.cost_center,
            profit_center: form.values.profit_center,
            vendor_invoice_no: form.values.vendor_invoice_no,
            invoice_date: form.values.invoice_date,
            remarks: form.values.remarks,
            poNumbers: data?.ZPO_NUMBER,
            purchaseInfoId: data?.PI_REFID ? String(data.PI_REFID).split(",").map((id) => id.trim()) : [],
            condtion_id: data?.rmd_id,
            // child_info: poData.filter((item) => item.ZPO_NUMBER === data?.ZPO_NUMBER),
            created_by: UserDetails.USERID,
            
        };

        if (isClubbed) {
            fdata.child_info = clubbedItems.map(toItem);
        }

        if (!isClubbed && Number(fdata.overall_tonnage) > singleMaxQty) {
            errorToast(`Total Tonnage cannot exceed available tonnage (${singleMaxQty})`);
            return false;
        }

        if (fdata.confirm_vendor == undefined || fdata.confirm_vendor == '') {
            errorToast("Please Select Confirm Vendor");
            return false;
        } else if (fdata.vendor_invoice_no == undefined || fdata.vendor_invoice_no == '') {
            errorToast("Please Enter Invoice No");
            return false;
        } else if (fdata.invoice_date == undefined || fdata.invoice_date == '') {
            errorToast("Please Select Invoice Date");
            return false;
        }

        let keys = Object.keys(attachedFiles).filter((k) => attachedFiles[k].name);
        if (keys.length > 0) {
            let postdata = new FormData();
            Object.keys(attachedFiles).forEach((key) => {
                postdata.append("file[]", attachedFiles[key]);
            });
            postdata.append("form_name", "CUSTOM_MILLING_FI");
            postdata.append("ponumber", "invoice_copy");
            postdata.append("SubFolder", "CUSTOM_MILLING_FI");
            showLoader();
            apiPostMethod(sapFileShare, postdata, "File")
                .then((response) => {
                    const { data } = response;
                    if (data.success) {
                        fdata.invoice_attachment = data.files[0] ? data.files[0].updname : "";
                        Submit(fdata);
                    }
                })
                .catch((error) => {
                    errorToast("Something went wrong, please try again after sometime");
                })
                .finally(() => {
                    hideLoader();
                });
        } else {
            errorToast("Please Attach Invoice Copy");
        }
    };

    return (
        <div>
            {/* <Modal show={show} centered size="xl"> */}
            <Card>
                <Row>
                  <Col md="8" sm="8">
                        <h4 className="text-primary"><u>Custom Milling FI Payment Details</u></h4><br />
                   </Col>
                </Row>
                <Row>
                <Col md="4" sm="4">
                    <DatePicker form={form} id="date" isDateRange label={"Date Range"} />
                </Col>
                 <Col md="4" sm="4">
                    <FormGroup>
                        <h5>PO Number</h5>
                        <Select
                            isMulti
                            name="poNumbers"
                            options={poOptions}
                            classNamePrefix="select"
                            onChange={handlePoNumberChange}
                            value={selectedPoNumbers}
                            // isDisabled={isDisable}
                            placeholder="Select PO Numbers"
                            styles={{
                            // control: (provided) => ({
                            //     ...provided,
                            //     height: '38px',
                            //     fontSize: '14px',
                            // }),
                            }}
                        />
                    </FormGroup>
                    </Col>
                   
                    <Col md="4" sm="4">
                    <FormGroup>
                        <h5>Condtion Type</h5>
                            <Select
                            isMulti
                            name="itemText"
                            options={condtionOptions}
                            classNamePrefix="select"
                            onChange={handleCondtionChange}
                            value={condtion}
                            // isDisabled={isDisable}
                            placeholder="Select Condtion"
                            // styles={{
                            //     control: (provided) => ({
                            //     ...provided,
                            //     height: '38px',
                            //     fontSize: '14px',
                            //     }),
                            // }}
                            />

                        
                     </FormGroup>
                    </Col>
                    
                    <Col md="4" sm="4">
                        <FormGroup className='mt-2'>
                            <Button.Ripple color="primary" type="submit" onClick={getGateInInfo}>
                                View <ArrowDown size={16} />
                            </Button.Ripple>
                        </FormGroup>
                    </Col>
                    
                 </Row>     
                
                      
                    <br />
                <Row>

                  
                   {poData?.length > 0 &&
                   <Col md="12" sm="12" className="d-flex justify-content-end">
                   <Button
                        color="primary"
                        size="sm"
                        onClick={OpenClubbedData}
                        className="mb-1 mr-1"
                        disabled={poData.filter((item) => item.selected).length < 2}
                    >
                        Club & Submit ({poData.filter((item) => item.selected).length})
                    </Button>
                   <Button
                        color="success"
                        size="sm"
                        onClick={exportToExcel}
                        className="mb-1"
                    >
                        Export to Excel
                    </Button>
                    </Col>}
                        <label></label>
                            <div
                            style={{
                                width: "100%",
                                overflowX: "auto",
                                maxHeight: "500px",
                                overflowY: "auto",
                                border: "1px solid #ddd"
                            }}
                            >
                            <table
                                className="table table-bordered"
                                style={{
                                width: "100%",
                                minWidth: "1500px",
                                tableLayout: "fixed",
                                textAlign: "left",
                                borderCollapse: "separate"
                                }}
                            >
                                <thead>
                                <tr>
                                    {/* CHECKBOX HEADER */}
                                    <th
                                    style={{
                                        width: "45px",
                                        minWidth: "45px",
                                        maxWidth: "45px",
                                        padding: 0,
                                        textAlign: "center",
                                        verticalAlign: "middle",
                                        position: "sticky",
                                        top: 0,
                                        zIndex: 3,
                                        background: "#7367f0",
                                        color: "white"
                                    }}
                                    >
                                    <input
                                        type="checkbox"
                                        checked={selectAll}
                                        onChange={(e) => handleSelectAll(e.target.checked)}
                                        disabled={poData.length === 0}
                                    />
                                    </th>

                                    {[
                                    { label: "PO No", width: "120px" },
                                    // { label: "PI Ref ID", width: "120px" },
                                    { label: "Vendor Name", width: "170px" },
                                    { label: "Plant", width: "80px" },
                                    { label: "Purchase Type", width: "100px" },
                                    { label: "Condition Type", width: "140px" },
                                    // { label: "UOM", width: "80px" },
                                    { label: "Invoice No", width: "100px" },
                                    { label: "Qty In Ton", width: "80px" },
                                    { label: "Rate", width: "80px" },
                                    { label: "Condition Cost", width: "100px" },
                                    { label: "Action", width: "80px" },
                                    ].map((col, i) => (
                                    <th
                                        key={i}
                                        style={{
                                        width: col.width,
                                        position: "sticky",
                                        top: 0,
                                        zIndex: 2,
                                        background: "#7367f0",
                                        color: "white"
                                        }}
                                    >
                                        {col.label}
                                    </th>
                                    ))}
                                </tr>
                                </thead>

                                <tbody>
                                {poData?.map((materialData, index) => (
                                    <tr key={index}>
                                    {/* CHECKBOX CELL */}
                                    <td
                                        style={{
                                        width: "45px",
                                        minWidth: "45px",
                                        maxWidth: "45px",
                                        padding: 0,
                                        textAlign: "center",
                                        verticalAlign: "middle"
                                        }}
                                    >
                                        <input
                                        type="checkbox"
                                        checked={materialData?.selected || false}
                                        onChange={(e) =>
                                            handleCheckboxChange(index, e.target.checked)
                                        }
                                        />
                                    </td>

                                    <td>{materialData?.ZPO_NUMBER}</td>
                                    {/* <td>{materialData?.PI_REFID}</td> */}
                                    <td>
                                        {materialData?.ZVENDOR_NAME}
                                    </td>

                                    <td>
                                        {/* <Input
                                        type="text"
                                        value={materialData?.refDocNo || ""}
                                        onChange={(e) =>
                                            updateValue(index, "refDocNo", e.target.value)
                                        }
                                        /> */}
                                        {materialData?.WERKS}
                                    </td>

                                    <td>
                                        {/* <Input
                                        type="date"
                                        value={materialData?.docDate || ""}
                                        max={new Date().toISOString().split("T")[0]}
                                        onChange={(e) =>
                                            updateValue(index, "docDate", e.target.value)
                                        }
                                        onKeyDown={(e) => e.preventDefault()}
                                        /> */}
                                        {materialData?.VEHICLE_TYPE}
                                    </td>

                                    <td>
                                        {materialData?.condition_description}
                                    </td>
                                    {/* <td>{materialData?.uom}</td> */}
                                    <td>{materialData?.invoice_no}</td>
                                     <td>
                                        {materialData?.gunny_less_wt}
                                    </td>
                                    <td>
                                        {/* {<Input
                                        type="text"
                                        value={materialData?.rate || ""}
                                        onChange={(e) =>
                                            updateValue(index, "rate", e.target.value)
                                        }
                                        />} */}
                                        {materialData?.rate}
                                    </td>
                                    
                                    <td>
                                        {materialData?.condition_amount}
                                    </td>
                                    <td>
                                        <Button
                                            color="primary"
                                            size="sm"
                                            onClick={() => OpenData(materialData)}
                                        >
                                            View
                                        </Button>
                                    </td>
                                    {/* <td>
                                        {materialData?.actual_amount}
                                    </td> */}
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                            </div>


                {/* </CardBody> */}
                </Row>
                </Card>
                {/* <ModalBody>
                    <Row>
                    </Row>
                    <Row />
                    <Row>
                        <Col md="6" sm="6" >
                        <FormGroup className="d-flex justify-content-end mb-0">
                            <Button.Ripple color="primary" type="button"  onClick={() => AddDatasPO(0)} >Add</Button.Ripple>
                        </FormGroup>
                        </Col>
                    </Row>
                </ModalBody> */}
            {/* </Modal> */}

            <Modal show={show1} centered >
                <Modal.Header>
                    <Row>
                        <Col md="12" sm="12">
                            <FormGroup style={{ width: 460 }}>
                                <Modal.Title> <X onClick={closeRemarksModal} style={{ float: "right" }} /></Modal.Title>
                            </FormGroup>
                        </Col>
                    </Row>
                </Modal.Header>
                <Modal.Body>
                 
                    <Row>
                            {/* Show Image if available */}
                        {openImage && (
                            <Col sm={12} style={{ textAlign: "center" }}>
                                <img src={encodeURI(openImage)} alt="Invoice Copy" style={{ width: "100%", maxWidth: "600px" }} />
                            </Col>
                        )}

                        {/* Show PDF if available */}
                        {openPdf && (
                            <Col sm={12} style={{ textAlign: "center" }}>
                                <iframe src={encodeURI(openPdf)} title="PDF Preview" style={{ width: "100%", height: "600px", border: "none" }} />
                            </Col>
                        )}

                        {/* Alternative Link if PDF is blocked */}
                        {openPdf && (
                            <Col sm={12} style={{ textAlign: "center", marginTop: "10px" }}>
                                <a href={encodeURI(openPdf)} target="_blank" rel="noopener noreferrer">Open PDF in New Tab</a>
                            </Col>
                        )} 
                    </Row>
                </Modal.Body>
         </Modal >
         <Modal show={showModal} centered size="xl">
            <Modal.Header><b>Payment Confirmation</b> <X onClick={closed} style={{ float: "right" }} /></Modal.Header>
            <Modal.Body>
            <Row>
                <Col md="12" sm="12">
                    <h5 className="text-primary"><u>General Details</u></h5>
                </Col>
            {/* <Col md="12" sm="12"><X onClick={closed} style={{ float: "right" }} /></Col> */}
                {/* <Col md="4" sm="12">
                <CustomTextInput label={"Total Row Count"} form={form} id="row_count" type="text" disabled/>
                </Col> */}
                <Col md="4" sm="12">
                <CustomTextInput label={"Total Tonnage"} form={form} id="overall_tonnage" type="text" max={clubbedItems.length > 0 ? undefined : singleMaxQty} disabled={clubbedItems.length > 0} />
                </Col>
                <Col md="4" sm="12">
                <CustomTextInput label={"Rate"} form={form} id="rate" type="text" disabled={clubbedItems.length > 0}/>
                </Col>
                <Col md="4" sm="12">
                <CustomTextInput label={"Total Value"} form={form} id="total_value" type="text" disabled/>
                </Col>
                <Col md="4" sm="12">
                <CustomTextInput label={"Invoice Value"} form={form} id="invoice_value" value={(form.values.rate * form.values.overall_tonnage).toFixed(2)} type="text" disabled/>
                </Col>
                <Col md="4" sm="12">
                <CustomTextInput label={"Difference"} form={form} id="difference" value = {(form.values.total_value-(form.values.rate * form.values.overall_tonnage)).toFixed(2)} type="text" disabled/>
                </Col>
                <Col md="4" sm="12" >
                    <CustomDropdownInput
                        url={`${apiBaseUrl}/Loadingunloadingcost/getVendor`}
                        label={<>Confirm Vendor Name <span className="text-danger">*</span></>}
                        form={form}
                        id={"confirm_vendor"}
                        onChange={(e) => {
                            form.setValues({
                                ...form.values,
                                confirm_vendor: e,
                                tds_name: e?.tds_name || "",
                                tds_code: e?.tds_code || "",
                            });
                        }}
                        // options ={warehouseoption}
                    />
                </Col>
                <Col md="4" sm="12">
                <CustomTextInput label={"TDS"} form={form} id="tds_name" type="text" disabled/>
                </Col>
                <Col md="4" sm="12">
                <CustomTextInput label={"GL"} form={form} id="gl" type="text" disabled/>
                </Col>
                <Col md="4" sm="12">
                <CustomTextInput label={"Cost Center"} form={form} id="cost_center" type="text" disabled/>
                </Col>
                <Col md="4" sm="12">
                <CustomTextInput label={"Vendor Invoice No"} form={form} id="vendor_invoice_no" type="text" />
                </Col>
                <Col md="4" sm="12">
                <CustomTextInput label={"Invoice Date"} form={form} id="invoice_date" type="date" 
                min={dateRestriction.min_date} 
                max={dateRestriction.max_date} />
                </Col>
            
            
                <Col md="4" sm="12">
                <CustomTextInput label={"Remarks"} form={form} id="remarks" type="text" />
                </Col>
                <Col md="4" sm="12">
                <Uploader
                          
                            setAttachment={handleFileChange}
                            label={"Invoice Attachment"}
                            title="Pdf"
                            id={"invoice_attachment"}
                            selectedFileName={attachedFiles.invoice_attachment.name}
                        />
                </Col>
            </Row>
            {clubbedItems.length > 0 &&
            <Row>
                <Col md="12" sm="12">
                    <h5 className="text-primary"><u>Clubbed Rows (edit Qty / Rate per row)</u></h5>
                    <br />
                    <div style={{ width: "100%", overflowX: "auto", border: "1px solid #ddd" }}>
                        <table
                            className="table table-bordered"
                            style={{ width: "100%", minWidth: "700px", tableLayout: "fixed", textAlign: "left", borderCollapse: "separate" }}
                        >
                            <thead>
                                <tr>
                                    {[
                                        { label: "PO No", width: "140px" },
                                        { label: "Plant", width: "80px" },
                                        { label: "Qty In Ton", width: "120px" },
                                        { label: "Rate", width: "120px" },
                                        { label: "Amount", width: "100px" },
                                    ].map((col, i) => (
                                        <th key={i} style={{ width: col.width, background: "#7367f0", color: "white" }}>
                                            {col.label}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {clubbedItems.map((row, i) => (
                                    <tr key={i}>
                                        <td>{row?.ZPO_NUMBER}</td>
                                        <td>{row?.WERKS}</td>
                                        <td>
                                            <Input
                                                type="number"
                                                max={row?.maxQty}
                                                value={row?.gunny_less_wt ?? ""}
                                                onChange={(e) => handleClubbedItemChange(i, "gunny_less_wt", e.target.value)}
                                            />
                                        </td>
                                        <td>
                                            <Input
                                                type="number"
                                                value={row?.rate ?? ""}
                                                onChange={(e) => handleClubbedItemChange(i, "rate", e.target.value)}
                                            />
                                        </td>
                                        <td>{row?.condition_amount}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Col>
            </Row>}
            <Row>
                 <Col md="12" sm="12">
                    <div className="d-flex justify-content-between align-items-center">
                        <h5 className="text-primary"><u>Vehicle Details</u></h5>
                        <Button color="primary" size="sm" type="button" onClick={exportVehicleDetailsToExcel}>
                            Export Excel
                        </Button>
                    </div>
                    <br />
                    <div style={{ width: "100%", overflowX: "auto", border: "1px solid #ddd" }}>
                        <table
                            className="table table-bordered"
                            style={{ width: "100%", minWidth: "900px", tableLayout: "fixed", textAlign: "left", borderCollapse: "separate" }}
                        >
                            <thead>
                                <tr>
                                    {[
                                        { label: "Truck No", width: "120px" },
                                        { label: "VA Number", width: "120px" },
                                        { label: "PO Number", width: "120px" },                                       
                                        { label: "Plant", width: "80px" },
                                        { label: "Invoice No", width: "100px" },
                                        { label: "Qty In Ton", width: "80px" },
                                        { label: "Rate", width: "80px" },
                                        { label: "Amount", width: "80px" },
                                    ].map((col, i) => (
                                        <th
                                            key={i}
                                            style={{ width: col.width, background: "#7367f0", color: "white" }}
                                        >
                                            {col.label}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {(clubbedItems.length > 0
                                    ? clubbedItems.flatMap((item) => (item?.lines?.length ? item.lines : [item]))
                                    : (data?.lines?.length ? data.lines : [null])
                                ).map((line, i) => (
                                    <tr key={i}>
                                        <td>{line?.TRUCK_NO}</td>
                                        <td>{line?.ZVA_NUMBER}</td>
                                        <td>{line?.ZPO_NUMBER}</td>
                                        <td>{line?.WERKS}</td>
                                        <td>{line?.invoice_no}</td>
                                        <td>{line?.total_gunny_less_wt || line?.gunny_less_wt}</td>
                                        <td>{line?.rate}</td>
                                        <td>{line?.condition_amount}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Col>
            </Row>
            <br />
            <Row>
                <Col md="12" sm="12">
                        <FormGroup className="d-flex mb-0 justify-content-end">
                        {/* <Button.Ripple outline color="secondary" tag={Link} to={`/LOADUNLOADPAYMENT`} type="reset" className="mr-2">
                            Cancel
                        </Button.Ripple> */}
                            <div className="mr-1">
                            <Button.Ripple color="primary" type="button"
                            onClick={() => POST()}
                            >
                                Submit
                            </Button.Ripple>
                            </div>
                        </FormGroup>
                    </Col>
            </Row>
            </Modal.Body>
         </Modal>
         <POCopyModal
                isOpen={poModalOpen}
                toggle={togglePOModal}
                poNumber={selectedPO}
                type={selectedType}
        />
        </div >
    );
};

export default CustomMillingRake;
