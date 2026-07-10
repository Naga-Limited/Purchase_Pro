import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Check,
  Search,
  Plus,
  X,
  Paperclip,
  Download,
  AlertCircle,
  AlertTriangle
} from "react-feather";
import {
  Row,
  Col,
  Form,
  FormGroup,
  Label,
  Input,
  Button,
  Card,
  CardHeader,
  CardBody,
  InputGroup,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Spinner,
  Alert
} from "reactstrap";
import { DropdownControl } from "../../@core/components/dropdown";
import { apiBaseUrl, masterUrl, sapFileShare } from "../../urlConstants";
import { useSelector } from "react-redux";
import { apiPostMethod } from "../../helper/axiosHelper";
import { useLoader } from "../../utility/hooks/useLoader";
import { errorToast } from "../../helper/appHelper";
import confirmDialog from "../../@core/components/confirm/confirmDialog";

const SupplierEntry = () => {
  /* ---------------- STATES ---------------- */
  const [poNumber, setPoNumber] = useState("");
  const [isPoLocked, setIsPoLocked] = useState(false);

  const [mode, setMode] = useState(""); // TRUCK / CONTAINER / RAKE
  const [brokerName, setBrokerName] = useState("");
  const [supplierName, setSupplierName] = useState("");
  const [purchaseMode, setPurchaseMode] = useState("");
  const [poQty, setPoQty] = useState("");
  const [loadingDueDt, setLoadingDueDt] = useState(""); // just info from PO (optional)
  const [contractNo, setContractNo] = useState("");
  const [noOfTrucks, setNoOfTrucks] = useState("");
  const [poRate, setPoRate] = useState("");

  const [loadingPoint, setLoadingPoint] = useState(""); // header Supplier Loading Point (manual, mandatory)
  const [headerLoadingDate, setHeaderLoadingDate] = useState(""); // header Loading Date (manual, mandatory)

  const [selectedLiner, setSelectedLiner] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);

  // Vendor Info (PO Wise)
  const [vendorInfo, setVendorInfo] = useState({ invoiceQty: "" });

  const emptyVehicle = {
    vehicleNo: "",
    wagons: "",
    driver: "",
    invoiceNo: "",
    invoiceDate: "",
    invoiceQty: "",
    // invoiceRate: poRate,
    loadingDate: "",
    expArrivalDate: "",
    loadPoint: "",
    linerName: ""
  };

  const [vehicles, setVehicles] = useState([emptyVehicle]);
  const initialAttachment = {
    invoiceCopy: null,
    wbCopy: null,
    ewayCopy: null,
    rrCopy: null
  };
  const [attachments, setAttachments] = useState([initialAttachment]);

  // Previous loads & modals
  const [previousLoads, setPreviousLoads] = useState([]);
  const [showPrevModal, setShowPrevModal] = useState(false);
  const [previousLoadDetails, setPreviousLoadDetails] = useState([]);
  // Submission states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [submitResult, setSubmitResult] = useState(null);
  const [showResultModal, setShowResultModal] = useState(false);

  // Validation states
  const [validationErrors, setValidationErrors] = useState({});
  const [attachmentErrors, setAttachmentErrors] = useState({});

  // refs for hidden file inputs
  const invoiceInputRefs = useRef([]);
  const wbInputRefs = useRef([]);
  const ewayInputRefs = useRef([]);
  const rrInputRefs = useRef([]);

  // user & loader
  const UserDetails = useSelector((state) =>
    state && state.auth ? state.auth.userData : {}
  );
  const [purchaseOrderDetails, setPurchaseOrderDetails] = useState([]);
  const { showLoader, hideLoader } = useLoader();

  /* ---------------- EFFECTS ---------------- */
  useEffect(() => {
    invoiceInputRefs.current = Array(vehicles.length).fill(null);
    wbInputRefs.current = Array(vehicles.length).fill(null);
    ewayInputRefs.current = Array(vehicles.length).fill(null);
    rrInputRefs.current = Array(vehicles.length).fill(null);
  }, [vehicles.length]);

  /* ---------------- VALIDATION HELPERS ---------------- */
  const isNumeric = (val) => /^[0-9]+$/.test(val);
  const isDecimalWith2Places = (val) =>
    /^[0-9]+(\.[0-9]{1,3})?$/.test(val); // 20 / 20.1 / 20.15[web:2][web:5]

  const getMandatoryFieldsByMode = (m) => {
    const baseFields = [
      "vehicleNo",
      "invoiceNo",
      "invoiceDate",
      "invoiceQty",
      // "invoiceRate",
      "loadingDate",
      "expArrivalDate"
      // loadPoint & linerName are filled from header, not mandatory per row now
    ];

    switch (m) {
      case "TRUCK":
        return [...baseFields, "driver"];
      case "CONTAINER":
        return [...baseFields]; // linerName not mandatory per row
      case "RAKE":
        return [...baseFields, "wagons"];
      default:
        return baseFields;
    }
  };

  const validateVehicle = (vehicle, rowIndex, m) => {
    const errors = {};
    const mandatoryFields = getMandatoryFieldsByMode(m);

    // Required fields
    mandatoryFields.forEach((field) => {
      if (!vehicle[field]?.toString().trim()) {
        errors[field] = `${field
          .replace(/([A-Z])/g, " $1")
          .replace(/^./, (str) => str.toUpperCase())} is required`;
      }
    });

    // Invoice No max 16
    if (vehicle.invoiceNo && vehicle.invoiceNo.length > 16) {
      errors.invoiceNo = "Invoice No cannot exceed 16 characters";
    }

    // Invoice Date <= today
    if (vehicle.invoiceDate) {
      const inv = new Date(vehicle.invoiceDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      inv.setHours(0, 0, 0, 0);
      if (inv > today) {
        errors.invoiceDate = "Invoice Date cannot be in the future";
      }
    }

    // Invoice Qty numeric, 7 digits
    if (vehicle.invoiceQty) {
      const val = vehicle.invoiceQty.toString().trim();
      if (!isDecimalWith2Places(val)) {
        errors.invoiceQty = "Invoice Qty must be numeric";
      }else if (val.length < 1) {
        errors.invoiceQty = "Invoice Qty cannot less 1 digits";
      } else if (val.length > 10) {
        errors.invoiceQty = "Invoice Qty cannot exceed 10 digits";
      }
    }
    if(vehicle.driver && m === "TRUCK"){
      const val = vehicle.driver.toString().trim();
      if (!isNumeric(val)) {
        errors.driver = "Driver No must be numeric";
      }else if (val.length < 10) {
        errors.driver = "Driver No must be 10 digits";
    }
    }
    
    
    // // Invoice Rate numeric up to 2 decimals
    // if (vehicle.invoiceRate) {
    //   const val = vehicle.invoiceRate.toString().trim();
    //   if (!isDecimalWith2Places(val)) {
    //     errors.invoiceRate =
    //       "Invoice Rate must be numeric with up to 2 decimals (e.g. 20.15)";
    //   }
    // }

    // Loading Date <= today
    if (vehicle.loadingDate) {
      const load = new Date(vehicle.loadingDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      load.setHours(0, 0, 0, 0);
      if (load > today) {
        errors.loadingDate = "Loading Date cannot be in the future";
      }
    }

    // Date relations
    // if (vehicle.invoiceDate && vehicle.loadingDate) {
    //   const invoiceDate = new Date(vehicle.invoiceDate);
    //   const loadingDate = new Date(vehicle.loadingDate);
    //   invoiceDate.setHours(0, 0, 0, 0);
    //   loadingDate.setHours(0, 0, 0, 0);
    //   if (loadingDate >= invoiceDate) {
    //     errors.loadingDate = "Invoice Date cannot be before Invoice Date";
    //   }
    // }

    if (vehicle.loadingDate && vehicle.expArrivalDate) {
      const loadingDate = new Date(vehicle.loadingDate);
      const expArrivalDate = new Date(vehicle.expArrivalDate);
      loadingDate.setHours(0, 0, 0, 0);
      expArrivalDate.setHours(0, 0, 0, 0);
      if (expArrivalDate < loadingDate) {
        errors.expArrivalDate =
          "Expected Arrival must be on or after Loading Date";
      }
    }

    // Container / Truck / FNR formats
    if (m === "CONTAINER" && vehicle.vehicleNo) {
      const val = vehicle.vehicleNo.toString().trim();
      if (!/^[A-Za-z0-9]+$/.test(val)) {
        errors.vehicleNo = "Container No must be alphanumeric";
      } else if (val.length > 11) {
        errors.vehicleNo = "Container No cannot exceed 11 characters";
      }
    }

    if (m === "TRUCK" && vehicle.vehicleNo) {
      const val = vehicle.vehicleNo.toString().trim();
      if (!/^[A-Za-z0-9]+$/.test(val)) {
        errors.vehicleNo = "Truck No must be alphanumeric";
      }
    }

    if (m === "RAKE" && vehicle.vehicleNo) {
      const val = vehicle.vehicleNo.toString().trim();
      if (!/^[0-9]+$/.test(val)) {
        errors.vehicleNo = "FNR must be numeric";
      } else if (val.length !== 11) {
        errors.vehicleNo = "FNR must be exactly 11 digits";
      }
    }

    return errors;
  };

  /* ---- FIELD + ATTACHMENT VALIDATION ---- */
  const validateAllVehicles = useCallback(() => {
    const newFieldErrors = {};
    const newAttachmentErrors = {};
    let hasErrors = false;

    vehicles.forEach((vehicle, index) => {
      const vehicleErrors = validateVehicle(vehicle, index, mode);
      if (Object.keys(vehicleErrors).length > 0) {
        newFieldErrors[index] = vehicleErrors;
        hasErrors = true;
      }

      const att = attachments[index] || {};
      const attErr = {};

      if (mode === "TRUCK" || mode === "CONTAINER") {
        if (!att.invoiceCopy)
          attErr.invoiceCopy = "Invoice Copy is required";
        if (!att.wbCopy) attErr.wbCopy = "WB Copy is required";
      }

      if (mode === "RAKE") {
        if (!att.invoiceCopy)
          attErr.invoiceCopy = "Invoice Copy is required";
        if (!att.rrCopy) attErr.rrCopy = "RR Copy is required";
      }

      if (Object.keys(attErr).length > 0) {
        newAttachmentErrors[index] = attErr;
        hasErrors = true;
      }
    });

    setValidationErrors(newFieldErrors);
    setAttachmentErrors(newAttachmentErrors);
    return !hasErrors;
  }, [vehicles, attachments, mode]);

  /* ---------------- PO SEARCH (BACKEND CALL) ---------------- */
  const getPoDetails = () => {
    if (!poNumber.trim()) {
      errorToast("Please enter PO Number");
      return;
    }

    showLoader();
    const reqBody = { poNumber: poNumber, userId: UserDetails.USERID,role: UserDetails.role };

    apiPostMethod(apiBaseUrl + "SupplierDispatch/getSDIPoDetails", reqBody)
      .then((response) => {
        const { data } = response;
        if (data.success === true && Array.isArray(data.data) && data.data.length) {
          const po = data.data[0];

          setPurchaseOrderDetails(data.data);

          const entryType =
            po.PURCHASE_GROUP_DESCRIPTION?.toUpperCase() === "TRUCK"
              ? "TRUCK"
              : po.PURCHASE_GROUP_DESCRIPTION?.toUpperCase() === "CONTAINER"
              ? "CONTAINER"
              : po.PURCHASE_GROUP_DESCRIPTION?.toUpperCase() === "RAKE"
              ? "RAKE"
              : po.PURCHASE_GROUP_DESCRIPTION?.toUpperCase() === "CM RAKE"
              ? "RAKE"
              : po.PURCHASE_GROUP_DESCRIPTION?.toUpperCase() === "CM TRUCK"
              ? "TRUCK"
              : po.PURCHASE_GROUP_DESCRIPTION?.toUpperCase() === "CM CONTAINER"
              ? "CONTAINER"
              : "";

          setMode(entryType);
          setBrokerName(po.VENDOR_NAME || "");
          setSupplierName(po.SUPPLIER_NAME || "");
          setPurchaseMode(po.PURCHASE_GROUP_DESCRIPTION || "");
          setPoQty(po.VENDOR_QUANTITY || "");
          setLoadingDueDt(po.PO_LOADING_DATE || ""); // just display
          setContractNo(po.CONTRACT_NO || "");
          setNoOfTrucks(po.NUMBER_OF_VEHICLES || "");
          setPoRate(po.PO_RATE || "");
          // DO NOT auto-fill loading date or loading point from backend
          setHeaderLoadingDate("");
          setLoadingPoint("");
          setSelectedLocation(null);

          setVehicles([emptyVehicle]);
          setAttachments([initialAttachment]);
          setVendorInfo({ invoiceQty: "" });
          setPreviousLoads([]);
          setSubmitResult(null);
          setValidationErrors({});
          setAttachmentErrors({});
          setSelectedLiner(null);

          setIsPoLocked(true); // lock PO Number after success
          saveCurrentLoadsAsPrevious(data.vendorInfo || []);
        } else {
          errorToast(data.message || "PO not found");
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

  /* ---------------- VEHICLE FUNCTIONS ---------------- */
  const addVehicle = useCallback(() => {
    setVehicles((prev) => [
      ...prev,
      {
        ...emptyVehicle,
        loadPoint: loadingPoint,
        loadingDate: headerLoadingDate
      }
    ]);
    setAttachments((prev) => [...prev, { ...initialAttachment }]);
  }, [loadingPoint, headerLoadingDate]);

  const removeVehicle = useCallback((index) => {
    setVehicles((prev) => prev.filter((_, i) => i !== index));
    setAttachments((prev) => prev.filter((_, i) => i !== index));
    setValidationErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[index];
      return newErrors;
    });
    setAttachmentErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[index];
      return newErrors;
    });
  }, []);

  const updateVehicle = useCallback((index, field, value) => {
    setVehicles((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };

      if (field === "vehicleNo" && !value) {
        updated[index].driver = "";
      }
      return updated;
    });

    setValidationErrors((prev) => {
      const newErrors = { ...prev };
      if (newErrors[index]) {
        delete newErrors[index][field];
        if (Object.keys(newErrors[index]).length === 0) {
          delete newErrors[index];
        }
      }
      return newErrors;
    });
  }, []);

  /* ---------------- LINER NAME DROPDOWN ---------------- */
  const onLinerChange = useCallback(
    (val) => {
      setSelectedLiner(val);
      const linerName =
        typeof val === "object" ? val.label ?? val.value : val;

      if (!linerName) return;

      setVehicles((prev) =>
        prev.map((v) =>
          mode === "CONTAINER" ? { ...v, linerName } : v
        )
      );

      setValidationErrors((prev) => {
        const copy = { ...prev };
        Object.keys(copy).forEach((idx) => {
          if (copy[idx]?.linerName) {
            delete copy[idx].linerName;
            if (Object.keys(copy[idx]).length === 0) delete copy[idx];
          }
        });
        return copy;
      });
    },
    [mode]
  );

  /* ---------------- HEADER LOADING DATE ---------------- */
  const onHeaderLoadingDateChange = useCallback((val) => {
    setHeaderLoadingDate(val || "");

    if (!val) return;

    setVehicles((prev) =>
      prev.map((v) => ({
        ...v,
        loadingDate: val
      }))
    );

    setValidationErrors((prev) => {
      const copy = { ...prev };
      Object.keys(copy).forEach((idx) => {
        if (copy[idx]?.loadingDate) {
          delete copy[idx].loadingDate;
          if (Object.keys(copy[idx]).length === 0) delete copy[idx];
        }
      });
      return copy;
    });
  }, []);

  /* ---------------- SUPPLIER LOADING POINT DROPDOWN ---------------- */
  const onLocationChange = useCallback(
    (val) => {
      setSelectedLocation(val);

      const location =
        typeof val === "object" ? val.label ?? val.value : val;

      setLoadingPoint(location || "");

      if (!location) return;

      setVehicles((prev) =>
        prev.map((v) => {
          const updated = { ...v, loadPoint: location };
          if (mode === "CONTAINER") {
            updated.linerName = location;
          }
          return updated;
        })
      );

      setValidationErrors((prev) => {
        const copy = { ...prev };
        Object.keys(copy).forEach((idx) => {
          if (copy[idx]) {
            delete copy[idx].loadPoint;
            delete copy[idx].linerName;
            if (Object.keys(copy[idx]).length === 0) delete copy[idx];
          }
        });
        return copy;
      });
    },
    [mode]
  );

  /* ---------------- ATTACHMENT HANDLERS ---------------- */
  const handleAttachmentChange = useCallback((rowIndex, field, file) => {
    if (!file) return;

    setAttachments((prev) => {
      const copy = [...prev];
      copy[rowIndex] = { ...copy[rowIndex], [field]: file };
      return copy;
    });

    setAttachmentErrors((prev) => {
      const copy = { ...prev };
      if (copy[rowIndex]) {
        delete copy[rowIndex][field];
        if (Object.keys(copy[rowIndex]).length === 0) delete copy[rowIndex];
      }
      return copy;
    });
  }, []);

  const handleAttachmentSelect = useCallback(
    (rowIndex, field) => {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*,application/pdf";
      input.style.display = "none";

      input.onchange = (e) => {
        const file = e.target.files[0];
        if (file) handleAttachmentChange(rowIndex, field, file);
      };

      document.body.appendChild(input);
      input.click();
      document.body.removeChild(input);
    },
    [handleAttachmentChange]
  );
const [totalPreviousQty, setTotalPreviousQty] = useState(0);
  /* ---------------- PREVIOUS LOADS ---------------- */
 const saveCurrentLoadsAsPrevious = (vehicles) => {
  const newLoads = vehicles
    .filter((v) => v.truckNo || v.invoiceQty || v.invoiceDate)
    .map((v) => ({
      invoiceQty: v.invoiceQty,
      invoiceDate: v.invoiceDate,
      truckNo: v.truckNo,
      invoiceNo: v.invoiceNo
    }));

  if (newLoads.length) {
    setPreviousLoads((prev) => {
      const updated = [...prev, ...newLoads];
      
      // 🚨 CALCULATE TOTAL INSIDE FUNCTION
      const totalQty = updated.reduce((sum, load) => {
        const qty = parseFloat(load.invoiceQty) || 0;
        return sum + qty;
      }, 0);
      
      // 🚨 SET TOTAL STATE (if you have totalPreviousQty state)
      setTotalPreviousQty?.(totalQty);
      
      console.log(`Previous loads: ${updated.length}, Total Qty: ${totalQty}`);
      
      return updated;
    });
  }
};

// Usage
const openPreviousLoad = () => {
  if (!previousLoads.length) {
    alert("No previous loads found");
    return;
  }
  setShowPrevModal(true);
};


const AttachmentApiCall = async () => {
  if (!poNumber || !mode) {
    errorToast("Please search PO first");
    return;
  }
  if (!headerLoadingDate) {
    errorToast("Please select Loading Date");
    return;
  }
  if (!loadingPoint.trim()) {
    errorToast("Please select Supplier Loading Point");
    return;
  }
  if ((vehicles[0]?.linerName === vehicles[0]?.loadPoint) && mode === "CONTAINER") {
    errorToast("Please select Liner Name");
    return;
  }
  const isValid = validateAllVehicles();
  if (!isValid) {
    errorToast("Please fix validation errors before submitting");
    return;
  }
  
   // 🚨 INLINE: CALCULATE CURRENT TOTAL INVOICE QTY
  const currentTotalInvoiceQty = vehicles.reduce((total, vehicle) => {
    return total + (parseFloat(vehicle.invoiceQty || 0));
  }, 0);
  // 🚨 PO QTY VALIDATION WITH 10% TOLERANCE
  const poQtyKg = parseFloat(poQty || 0);
  const poQtyTolerance = poQtyKg * 1.10;  // 110% (10% buffer)
  const grandTotalQty = currentTotalInvoiceQty + parseFloat(totalPreviousQty || 0);
  
  if (poQtyTolerance < grandTotalQty) {
    confirmDialog({
      title: `<h5><strong class="text-white">
        Load Qty (${grandTotalQty.toLocaleString()} Ton)<br>
        PO Limit (${poQtyTolerance.toLocaleString()} Ton)<br>
        <small>PO Qty: ${poQtyKg.toLocaleString()} Ton + 10% tolerance</small>
      </strong></h5>`,
      cancelButton: false, 
      confirmText: false, 
      confirmButton: false, 
      background: '#dc3545'
    }).then(() => {});
    return;
  }

  // 🚨 DUPLICATE VEHICLE NO CHECK
  const vehicleNos = vehicles
    .map(v => v.vehicleNo?.trim().toUpperCase())
    .filter(Boolean);
  const duplicateVehicles = vehicleNos.filter(
    (vehNo, index) => vehicleNos.indexOf(vehNo) !== index
  );
  if (duplicateVehicles.length > 0) {
    errorToast(`Duplicate Vehicle No(s): ${duplicateVehicles.join(', ')}`);
    return;
  }

  // 🚨 DUPLICATE INVOICE CHECK
  const invoiceNos = vehicles
    .map(v => v.invoiceNo?.trim().toUpperCase())
    .filter(Boolean);
  const duplicateInvoices = invoiceNos.filter(
    (invoice, index) => invoiceNos.indexOf(invoice) !== index
  );
  if (duplicateInvoices.length > 0) {
    errorToast(`Duplicate Invoice No(s): ${duplicateInvoices.join(', ')}`);
    return;
  }

  // 🚨 DUPLICATE FILE CHECK
  const allFiles = [];
  attachments.forEach((vehicleAttachments, vehicleIndex) => {
    const atts = vehicleAttachments || initialAttachment;
    Object.entries(atts).forEach(([fieldType, file]) => {
      if (file instanceof File) {
        allFiles.push(file.name.toLowerCase());
      }
    });
  });
  const duplicateFiles = allFiles.filter(
    (name, index) => allFiles.indexOf(name) !== index
  );
  if (duplicateFiles.length > 0) {
    errorToast(`Duplicate file(s): ${[...new Set(duplicateFiles)].join(', ')}`);
    return;
  }

  setIsSubmitting(true);
  setUploadProgress(0);
  setSubmitResult(null);

  // 🚗 VEHICLE DETAILS → FILE MAPPING
  const vehicleFileMap = {}; // { vehicleIndex: { fieldType: file } }
  const postData = new FormData();

  // Map attachments TO their vehicle details
  attachments.forEach((vehicleAttachments, vehicleIndex) => {
    const vehicle = vehicles[vehicleIndex];
    const atts = vehicleAttachments || initialAttachment;
    
    vehicleFileMap[vehicleIndex] = {};
    
    Object.entries(atts).forEach(([fieldType, file]) => {
      if (file instanceof File) {
        vehicleFileMap[vehicleIndex][fieldType] = {
          file,
          vehicleNo: vehicle.vehicleNo,
          invoiceNo: vehicle.invoiceNo,
          vehicleIndex
        };
        postData.append('file[]', file);
      }
    });
  });

  if (Object.keys(vehicleFileMap).filter(idx => Object.keys(vehicleFileMap[idx]).length > 0).length === 0) {
    errorToast("No files to upload");
    setIsSubmitting(false);
    return;
  }

  postData.append("form_name", 'SDI');
  postData.append("SubFolder", "SupplierDispatch");

  showLoader();
  try {
    const response = await apiPostMethod(sapFileShare, postData, "File");
    const { data } = response;
    
    if (data.success && data.files && Array.isArray(data.files)) {
      // 🗺️ MAP UPLOADED PATHS BACK TO VEHICLES
      const enrichedVehicles = vehicles.map((vehicle, vehicleIndex) => {
        const vehicleFiles = vehicleFileMap[vehicleIndex] || {};
        const attachments = {};
        
        // Match each uploaded file back to its vehicle/field
        data.files.forEach(uploadedFile => {
          Object.entries(vehicleFiles).forEach(([fieldType, fileInfo]) => {
            if (fileInfo.file.name === uploadedFile.orgname) {
              attachments[fieldType] = uploadedFile.updname;
            }
          });
        });
        
        return {
          ...vehicle,
          attachments  // { invoiceCopy: '/path1.pdf', wbCopy: '/path2.pdf', ... }
        };
      });

      console.log('🚗 Vehicles with attachments:', enrichedVehicles);
      
      // Send COMPLETE vehicle details WITH their attachments
      handleSubmit(enrichedVehicles);
    } else {
      console.error("Upload response invalid:", data);
      errorToast("File upload failed.");
    }
  } catch (err) {
    console.error("Upload error:", err);
    errorToast("Upload failed.");
  } finally {
    hideLoader();
  }
};
const handleSubmit = async (enrichedVehicles) => {  // Now receives vehicles WITH attachments
  const payload = {
    poNumber,
    mode,
    brokerName,
    supplierName,
    purchaseMode,
    poQty,
    vendorInfo,
    loadingPoint,
    poRate,
    loadingDate: headerLoadingDate,
    linerName : selectedLocation,
    purchaseOrderDetails,
    vehicles: enrichedVehicles,  // 🚗 COMPLETE: each vehicle + its attachments
    user_id: UserDetails.USERID,
    city: city || "Unknown"
    
  };

  console.log('📤 Backend payload:', payload);

  try {
    const response = await apiPostMethod(
      apiBaseUrl + 'SupplierDispatch/addSupplierDetailsInsert', 
      payload
    );
    const { data } = response;
    if (data.success === true) {
      confirmDialog({ title: `<h5><strong class="text-white"> ${data.message}</strong></h5>`, cancelButton: false, confirmText: false, confirmButton: false, background: `#51A351` }).then(() =>{ 
          window.location.reload(); // Reloads the page after the confirm dialog is closed });
      })
    } else {
      confirmDialog({ title: `<h5><strong class="text-white">${data.message}</strong></h5>`, cancelButton: false, confirmText: false, confirmButton: false, background: '#dc3545' }).then(() => { });
    }
  } catch (error) {
    errorToast("Submission failed.");
  } finally {
    setIsSubmitting(false);
    setUploadProgress(0);
  }
};



  /* ---------------- UI HELPERS ---------------- */
  const titleByMode =
    mode === "TRUCK"
      ? "Supplier Entry Screen(Truck)"
      : mode === "CONTAINER"
      ? "Supplier Entry Screen(Container)"
      : mode === "RAKE"
      ? "Supplier Entry Screen(Rake)"
      : "Supplier Entry Screen";

  const getVehicleLabel = (m) =>
    m === "TRUCK"
      ? "Truck No *"
      : m === "CONTAINER"
      ? "Container No *"
      : "FNR No *";

  const getAttachmentsConfig = useCallback((m) => {
    if (m === "RAKE") {
      return [
        { label: "Invoice Copy *", field: "invoiceCopy" },
        { label: "RR Copy *", field: "rrCopy" }
      ];
    }
    return [
      { label: "Invoice Copy *", field: "invoiceCopy" },
      { label: "WB Copy *", field: "wbCopy" },
      { label: "Eway Bill", field: "ewayCopy" }
    ];
  }, []);

  const isFieldMandatory = (field, m) =>
    getMandatoryFieldsByMode(m).includes(field);

  const getFieldLabel = (field, m) => {
    const label = field
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase());
    return isFieldMandatory(field, m) ? `${label} *` : label;
  };
  const [city, setCity] = useState("");
  const [error, setError] = useState("");
  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation not supported");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;

          const res = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`
          );

          const data = await res.json();

          // This is the city name
          setCity(data.city || data.locality);
        } catch (err) {
          setError("Failed to fetch city");
        }
      },
      (err) => {
        setError(err.message);
      }
    );
  }, []);
  /* ---------------- RENDER ---------------- */
  return (
    <div className="container-fluid py-4">
      <Form>
        <Card className="mb-4">
          <CardHeader className="py-1 bg-primary d-flex justify-content-center align-items-center">
            <h4 className="mb-0 text-white">📦 {titleByMode}</h4>
          </CardHeader>

          <br />
          <CardBody>
            {/* PO Search Row */}
            <Row>
              <Col md={3}>
                <FormGroup>
                  <Label>🔍 PO Number</Label>
                  <InputGroup>
                    <Input
                      value={poNumber}
                      onChange={(e) => setPoNumber(e.target.value)}
                      placeholder="Enter PO Number (e.g., 2800001766)"
                      disabled={isPoLocked}
                    />
                    <Button
                      color="primary"
                      type="button"
                      onClick={getPoDetails}
                      disabled={isPoLocked}
                    >
                      <Search size={16} />
                    </Button>
                  </InputGroup>
                </FormGroup>
              </Col>

              <Col md={3}>
                <FormGroup>
                  <Label>🏢 Broker Name</Label>
                  <Input value={brokerName} disabled className="bg-light" />
                </FormGroup>
              </Col>

              <Col md={3}>
                <FormGroup>
                  <Label>🏪 Purchase Mode</Label>
                  <Input value={purchaseMode} disabled className="bg-light" />
                </FormGroup>
              </Col>

              <Col md={3}>
                <FormGroup>
                  <Label>🏭 Supplier Name</Label>
                  <Input value={supplierName} disabled className="bg-light" />
                </FormGroup>
              </Col>
            </Row>

            {/* PO Details Row */}
            {mode && (
              <>
                <Row >
                  <Col md={3}>
                    <FormGroup>
                      <Label>📦 PO Quantity</Label>
                      <Input value={poQty} disabled className="bg-light" />
                    </FormGroup>
                  </Col>
                  <Col md={3}>
                    <FormGroup>
                      <Label>📅 PO Loading Date (Info)</Label>
                      <Input
                        type="date"
                        value={loadingDueDt}
                        disabled
                        className="bg-light"
                      />
                    </FormGroup>
                  </Col>
                  <Col md={3}>
                    <FormGroup>
                      <Label>📜 Contract No</Label>
                      <Input
                        value={contractNo}
                        disabled
                        className="bg-light"
                      />
                    </FormGroup>
                  </Col>
                  <Col md={3}>
                    <FormGroup>
                      <Label>🚚 No. of Trucks</Label>
                      <Input
                        value={noOfTrucks}
                        disabled
                        className="bg-light"
                      />
                    </FormGroup>
                  </Col>
                </Row>

                {/* Liner Name + Loading Date + Supplier Loading Point */}
                <Row >
                  <Col md={3}>
                    <FormGroup>
                      <Label>Loading Date *</Label>
                      <Input
                        type="date"
                        value={headerLoadingDate}
                        max={new Date().toISOString().split("T")[0]}   // ⛔ future dates disabled
                        onChange={(e) =>
                          onHeaderLoadingDateChange(e.target.value)
                        }
                      />
                    </FormGroup>
                  </Col>

                  <Col md={3}>
                    <FormGroup>
                      <Label htmlFor="cityMulti">
                        Supplier Loading Point *
                      </Label>
                      <DropdownControl
                        isDisabled={false}
                        placeholder="Supplier Loading Point"
                        selectedValue={selectedLocation}
                        url={`${masterUrl}?formType=GetFromLocation`}
                        onDdlChange={onLocationChange}
                      />
                    </FormGroup>
                  </Col>
                   {mode === "CONTAINER" && (
                    <Col md={3}>
                      <FormGroup>
                        <Label htmlFor="linerMulti">Liner Name</Label>
                        <DropdownControl
                          selectedValue={selectedLiner}
                          url={`${masterUrl}?formType=LinerName`}
                          onDdlChange={onLinerChange}
                        />
                      </FormGroup>
                    </Col>
                  )}
                  <Col md={3}>
                          <FormGroup>
                            <Label>
                               Invoice & PO Rate *
                            </Label>
                             <Input value={poRate} disabled className="bg-light" />
                           
                          </FormGroup>
                  </Col>
                </Row>
              </>
            )}

            {/* Vendor Info */}
            {mode && (
              <>
              {/* <h4 className="text-primary"><u>Material Details</u></h4><br /> */}
                <h6 className="mt-2 mb-1 text-primary">
                  <u>
                  💼 Vendor Info Details (PO Wise)
                  </u>
                </h6>
                <Row >
                  <Col md={4}>
                    <FormGroup>
                      <Label>📊 Previous Load Qty</Label>
                      <Input
                        value={totalPreviousQty}
                        // onChange={(e) =>
                        //   setVendorInfo({
                        //     ...vendorInfo,
                        //     invoiceQty: e.target.value
                        //   })
                        // }
                        disabled
                        className="bg-light"
                      />
                    </FormGroup>
                  </Col>
                  <Col md={4} className="d-flex align-items-center">
                    <Button
                      size="sm"
                      color="secondary"
                      type="button"
                      onClick={openPreviousLoad}
                      className="w-100"
                    >
                      📋 Previous Load Details
                    </Button>
                  </Col>
                </Row>
              </>
            )}

            {/* Vehicles Loop */}
            {mode &&
              vehicles.map((vehicle, rowIndex) => {
                const vehicleErrors = validationErrors[rowIndex] || {};
                const attErr = attachmentErrors[rowIndex] || {};
                const hasVehicleErrors =
                  Object.keys(vehicleErrors).length > 0 ||
                  Object.keys(attErr).length > 0;

                return (
                  <Card
                    key={rowIndex}
                    className={`mb-4 ${hasVehicleErrors ? "border-danger" : ""}`}
                  >
                    <CardBody>
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        {/* <h4 className="text-primary"><u>Material Details</u></h4><br /> */}
                        <h6
                          className={`mb-0 text-primary  ${
                            hasVehicleErrors ? "text-danger" : ""
                          }`}
                        >
                          <u>
                          🚛 Vehicle {rowIndex + 1} Details{" "}
                          </u>
                          {hasVehicleErrors && (
                            <AlertTriangle size={16} className="ml-1" />
                          )}
                        </h6>
                        <div className="d-flex gap-2">
                          {vehicles.length > 1 && (
                            <Button
                              size="sm"
                              color="danger"
                              outline
                              type="button"
                              onClick={() => removeVehicle(rowIndex)}
                              title="Remove Vehicle"
                            >
                              <X size={14} />
                            </Button>
                          )}
                          {rowIndex === vehicles.length - 1 && (
                            <Button
                              size="sm"
                              color="success"
                              outline
                              type="button"
                              onClick={addVehicle}
                              title="Add Vehicle"
                            >
                              <Plus size={14} />
                            </Button>
                          )}
                        </div>
                      </div>

                      {hasVehicleErrors && (
                        <Alert color="danger" className="mb-3">
                          Please fix the following errors:
                          <ul className="mb-0 mt-2">
                            {Object.values(vehicleErrors).map(
                              (error, i) => (
                                <li key={`f-${i}`} className="small">
                                  {error}
                                </li>
                              )
                            )}
                            {Object.values(attErr).map((error, i) => (
                              <li key={`a-${i}`} className="small">
                                {error}
                              </li>
                            ))}
                          </ul>
                        </Alert>
                      )}

                      {/* Vehicle Basic Info + Attachments */}
                      <Row>
                        <Col md={3}>
                          <FormGroup>
                            <Label>{getVehicleLabel(mode)}</Label>
                            <Input
                              value={vehicle.vehicleNo}
                              onChange={(e) =>
                                updateVehicle(
                                  rowIndex,
                                  "vehicleNo",
                                  e.target.value
                                )
                              }
                              placeholder={
                                mode === "RAKE"
                                  ? "11 digit FNR"
                                  : "e.g., TN01AB1234"
                              }
                              invalid={!!vehicleErrors.vehicleNo}
                              className={
                                vehicleErrors.vehicleNo ? "is-invalid" : ""
                              }
                            />
                            {vehicleErrors.vehicleNo && (
                              <small className="text-danger">
                                {vehicleErrors.vehicleNo}
                              </small>
                            )}
                          </FormGroup>
                        </Col>

                        {mode === "RAKE" && (
                          <Col md={3}>
                            <FormGroup>
                              <Label>{getFieldLabel("wagons", mode)}</Label>
                              <Input
                                value={vehicle.wagons}
                                onChange={(e) =>
                                  updateVehicle(
                                    rowIndex,
                                    "wagons",
                                    e.target.value
                                  )
                                }
                                invalid={!!vehicleErrors.wagons}
                                className={
                                  vehicleErrors.wagons ? "is-invalid" : ""
                                }
                              />
                              {vehicleErrors.wagons && (
                                <small className="text-danger">
                                  {vehicleErrors.wagons}
                                </small>
                              )}
                            </FormGroup>
                          </Col>
                        )}

                        {mode === "TRUCK" && (
                          <Col md={3}>
                            <FormGroup>
                              <Label>{getFieldLabel("driver no", mode)}</Label>
                              <Input
                                value={vehicle.driver}
                                onChange={(e) =>
                                  updateVehicle(
                                    rowIndex,
                                    "driver",
                                    e.target.value
                                  )
                                }
                                className={
                                  !vehicle.vehicleNo
                                    ? "bg-light"
                                    : vehicleErrors.driver
                                    ? "is-invalid"
                                    : ""
                                }
                                invalid={!!vehicleErrors.driver}
                                masLength={10}
                              />
                              {vehicleErrors.driver && (
                                <small className="text-danger">
                                  {vehicleErrors.driver}
                                </small>
                              )}
                            </FormGroup>
                          </Col>
                        )}

                        {getAttachmentsConfig(mode).map(
                          ({ label, field }) => (
                            <Col md={2} key={field}>
                              <FormGroup>
                                <Label>{label}</Label>
                                <Input
                                  type="file"
                                  ref={(el) => {
                                    if (el) {
                                      if (field === "invoiceCopy")
                                        invoiceInputRefs.current[rowIndex] =
                                          el;
                                      else if (field === "wbCopy")
                                        wbInputRefs.current[rowIndex] = el;
                                      else if (field === "ewayCopy")
                                        ewayInputRefs.current[rowIndex] = el;
                                      else if (field === "rrCopy")
                                        rrInputRefs.current[rowIndex] = el;
                                    }
                                  }}
                                  style={{ display: "none" }}
                                  accept="image/*,application/pdf"
                                  onChange={(e) =>
                                    handleAttachmentChange(
                                      rowIndex,
                                      field,
                                      e.target.files[0]
                                    )
                                  }
                                />
                                <div className="d-flex align-items-center">
                                  <Button
                                    size="sm"
                                    color={attErr[field] ? "danger" : "light"}
                                    type="button"
                                    className="d-flex align-items-center justify-content-center me-2 p-0"
                                    style={{ width: 40, height: 40 }}
                                    onClick={() =>
                                      handleAttachmentSelect(
                                        rowIndex,
                                        field
                                      )
                                    }
                                  >
                                    <Paperclip size={16} />
                                  </Button>
                                  {attachments[rowIndex]?.[field]?.name && (
                                    <div className="flex-grow-1">
                                      <small className="text-truncate d-block text-muted">
                                        {attachments[rowIndex][field].name}
                                      </small>
                                      <small className="badge badge-success badge-sm">
                                        {Math.round(
                                          attachments[rowIndex][field].size /
                                            1024
                                        )}{" "}
                                        KB
                                      </small>
                                    </div>
                                  )}
                                </div>
                                {attErr[field] && (
                                  <small className="text-danger d-block mt-1">
                                    {attErr[field]}
                                  </small>
                                )}
                              </FormGroup>
                            </Col>
                          )
                        )}
                      </Row>

                      {/* Invoice / Rate / Qty */}
                      <Row >
                        <Col md={3}>
                          <FormGroup>
                            <Label>
                              {getFieldLabel("invoiceNo", mode)} (max 16 chars)
                            </Label>
                            <Input
                              value={vehicle.invoiceNo}
                              onChange={(e) =>
                                updateVehicle(
                                  rowIndex,
                                  "invoiceNo",
                                  e.target.value
                                )
                              }
                              invalid={!!vehicleErrors.invoiceNo}
                              className={
                                vehicleErrors.invoiceNo ? "is-invalid" : ""
                              }
                              maxLength={16}
                            />
                            {vehicleErrors.invoiceNo && (
                              <small className="text-danger">
                                {vehicleErrors.invoiceNo}
                              </small>
                            )}
                          </FormGroup>
                        </Col>

                        <Col md={3}>
                          <FormGroup>
                            <Label>{getFieldLabel("invoiceDate", mode)}</Label>
                            <Input
                              type="date"
                              value={vehicle.invoiceDate}
                              max={new Date().toISOString().split("T")[0]}   // ⛔ future dates disabled
                              onChange={(e) =>
                                updateVehicle(
                                  rowIndex,
                                  "invoiceDate",
                                  e.target.value
                                )
                              }
                              invalid={!!vehicleErrors.invoiceDate}
                              className={
                                vehicleErrors.invoiceDate ? "is-invalid" : ""
                              }
                            />
                            {vehicleErrors.invoiceDate && (
                              <small className="text-danger">
                                {vehicleErrors.invoiceDate}
                              </small>
                            )}
                          </FormGroup>
                        </Col>

                        <Col md={3}>
                          <FormGroup>
                            <Label>
                              {getFieldLabel("invoiceQty", mode)} (In Ton)
                            </Label>
                            <Input
                              value={vehicle.invoiceQty}
                              onChange={(e) =>
                                updateVehicle(
                                  rowIndex,
                                  "invoiceQty",
                                  e.target.value
                                )
                              }
                              invalid={!!vehicleErrors.invoiceQty}
                              className={
                                vehicleErrors.invoiceQty ? "is-invalid" : ""
                              }
                              maxLength={10}
                            />
                            {vehicleErrors.invoiceQty && (
                              <small className="text-danger">
                                {vehicleErrors.invoiceQty}
                              </small>
                            )}
                          </FormGroup>
                        </Col>

                        
                      {/* </Row> */}

                      {/* Exp Arrival Date */}
                      {/* <Row > */}
                        <Col md={3}>
                          <FormGroup>
                            <Label>
                              {getFieldLabel("expArrivalDate", mode)} (future
                              allowed)
                            </Label>
                            <Input
                              type="date"
                              value={vehicle.expArrivalDate}
                              min={new Date().toISOString().split("T")[0]}   // ⛔ past dates disabled
                              onChange={(e) =>
                                updateVehicle(
                                  rowIndex,
                                  "expArrivalDate",
                                  e.target.value
                                )
                              }
                              invalid={!!vehicleErrors.expArrivalDate}
                              className={
                                vehicleErrors.expArrivalDate
                                  ? "is-invalid"
                                  : ""
                              }
                            />
                            {vehicleErrors.expArrivalDate && (
                              <small className="text-danger">
                                {vehicleErrors.expArrivalDate}
                              </small>
                            )}
                          </FormGroup>
                        </Col>
                      </Row>
                    </CardBody>
                  </Card>
                );
              })}

            {/* Submit Button */}
            {mode && (
              <Row className="mt-4">
                <Col sm={12}>
                  <FormGroup className="d-flex justify-content-end">
                    <Button.Ripple
                      color="primary"
                      size="lg"
                      type="button"
                      onClick={AttachmentApiCall}
                      disabled={isSubmitting}
                      className="px-5"
                    >
                     
                          <Check size={18} className="mr-2" />
                          Submit Entry ({vehicles.length} Vehicles)
                        
                    </Button.Ripple>
                  </FormGroup>
                </Col>
              </Row>
            )}
          </CardBody>
        </Card>

        {/* Previous Loads Modal */}
        <Modal
          isOpen={showPrevModal}
          toggle={() => setShowPrevModal(false)}
          size="lg"
        >
          <ModalHeader toggle={() => setShowPrevModal(false)}>
            📋 Previous Loads
          </ModalHeader>
          <ModalBody>
            {previousLoads.length ? (
              <div className="table-responsive">
                <table className="table table-sm table-hover">
                  <thead className="thead-light">
                    <tr>
                      <th>#</th>
                      <th>Truck/Fnr/Container No</th>
                      <th>Invoice Qty</th>
                      <th>Invoice No</th>
                      <th>Invoice Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {previousLoads.map((load, idx) => (
                      <tr key={idx}>
                        <td>{idx + 1}</td>
                        <td>
                          <strong>{load.truckNo}</strong>
                        </td>
                        <td>{load.invoiceQty}</td>
                        <td>{load.invoiceNo}</td>
                        <td>{load.invoiceDate}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <Alert color="info">
                <AlertCircle size={20} className="mr-2" />
                No previous loads found.
              </Alert>
            )}
          </ModalBody>
          <ModalFooter>
            <Button color="secondary" onClick={() => setShowPrevModal(false)}>
              Close
            </Button>
          </ModalFooter>
        </Modal>

       
      </Form>
    </div>
  );
};

export default SupplierEntry;
