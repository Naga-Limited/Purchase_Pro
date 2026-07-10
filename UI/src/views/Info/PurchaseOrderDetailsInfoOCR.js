import React, { useRef } from 'react'
import { useEffect } from 'react';
import { useState } from 'react';
import { ArrowLeft, Check, Plus, Search, StopCircle, X } from 'react-feather';
import { Button, Card, CardBody, Col, FormGroup, Input, InputGroup, Label, Row } from 'reactstrap'
import { errorToast, ShowToast } from '../../helper/appHelper';
import { apiBaseUrl, sapFileShare } from '../../urlConstants';
import { apiGetMethod, apiPostMethod } from '../../helper/axiosHelper';
import confirmDialog from '../../@core/components/confirm/confirmDialog';
import { useSelector } from 'react-redux';
import BarcodeScanner from '../common/BarcodeScanner';
import { useLoader } from '../../utility/hooks/useLoader';
import { minDate } from '../common/dateComponent';
import { CustomTextInput, Yup } from '../forms/custom-form';
import { useFormik } from 'formik';
import QRCode from 'react-qr-code';
import Uploader from '../Uploader';

const PurchaseOrderDetailsInfoOCR = ({tripSheetData,truckValue,remarks,phoneNo,Type,subModuleTypeId,screen,loadingAndUnloadingInfoId,gateInOutInfoData}) => {
  

    const [isInvoice, setIsInvoice] = useState(false)
    const [poDetails, setPoDetails] = useState([]);
    const [poDetails1, setPoDetails1] = useState([]);
    const [purchaseOrderDetails, setPurchaseOrderDetails] = useState([]);
    const [purchaseOrderList, setPurchaseOrderList] = useState([]);
    const [poType, setPoType] = useState('')
    const [plantCode, setPlantCode] = useState('')
    const [userPlant, setUserGate] = useState([])
    const [plantName, setPlantName] = useState('')
    const [masterPlantId, setMasterPlantId] = useState('')
    const [IsDisableForPo, setIsDisableForPo] = useState(false);
    const [invoiceNo, setInvoiceNo] = useState('');
    const [poNo, setPoNo] = useState('');
    const [checkIsWeight, setCheckIsWeight] = useState([])
    const [moduleTypeId, setModuleTypeId] = useState('')
    const [moduleType, setModuleType] = useState('')

    let { showLoader, hideLoader } = useLoader();

    const isShowInvoice = () => {
        setIsInvoice(true)   
    }

    function handleremove(poNumber) {

        let purchaseLength = purchaseOrderDetails.length;

        setPoNo('PO Number')
        confirmDialog({
            title: `<h4>Are you sure want to Remove?<h4>`,
        }).then((res) => {
            if (res) {
                let selectedItem
                purchaseOrderList.forEach((item) => {
                    if (item['poNumber'] == poNumber) {
                        selectedItem = item
                        purchaseOrderList.splice(purchaseOrderList.indexOf(selectedItem), 1);
                    }
                });
                for (let i = 0; i < purchaseLength; i++) {
                    purchaseOrderDetails.forEach((item) => {
                        if (item['poNumber'] == poNumber) {
                            selectedItem = item
                            purchaseOrderDetails.splice(purchaseOrderDetails.indexOf(selectedItem), 1);
                        }
                    });
                }
                setPoNo('')
                
            }
            else {
                setPoNo('')
            }
        })
    }

    useEffect(() => {
        isShowInvoice()
        QRCodeControl()
    }, [])

    const [QRControl, SetQRControl] = useState(false);
    const UserDetails = useSelector((state) => (state && state.auth ? state.auth.userData : {}));
    const QRCodeControl = () => {
        apiGetMethod(apiBaseUrl + `GatePro/Master/QRCodeControl/${UserDetails.USERID}`)
            .then((response) => {
                const data = response.data;
                if (data.success == 1) {
                    SetQRControl(data.results)
                }
            })
            .catch((error) => {
                console.log(error)
                errorToast("Something went wrong, please try again after sometime1");
            })
    }

    const handleScan = (barcode) => {
        fetchData(barcode)
    };
    const fetchData = (barcode) => {
        console.log(`Fetching data for barcode: ${barcode}`);
        // setTruckValue(barcode)
        // checkUserGate(barcode)
        setPoNo(barcode)
        getPoDetails('list',barcode); 
        setPoType('show');
    };

    const InvoiceCheck = () => {
      const postdata = {
        invoiceNo: poDetails.invoiceNo,
        vendorCode: poDetails.VENDOR,
        poNumber: poDetails.PO_NO,
        gateId: UserDetails.GATE_ID,
      }
      apiPostMethod(apiBaseUrl + 'GatePro/Gate/CheckVendorInvoice',postdata)
        .then((response) => {
          const data = response.data;
            if (data.success == true) {
                checkInvoiceNo()
            }else{
                confirmDialog({
                    title: `<h5><strong class="text-white">Invoice No Already Added</strong></h5>`, cancelButton: false, confirmText: false, confirmButton: false, background: `#BD362F`
                  })
                // poDetails=''
                setPoType([])
                setInvoiceNo('')
            } 
           }).catch((error) => {
                console.log(error)
                errorToast("Something went wrong, please try again after sometime2");
            })
    }

    const checkInvoiceNo = () => {

        if ((poDetails.invoiceNo == "")) {
          confirmDialog({
            title: `<h5><strong class="text-white">Please Enter Invoice No</strong></h5>`, cancelButton: false, confirmText: false, confirmButton: false, background: `#BD362F`
          })
        }else if(poDetails.invoiceDate == "" || poDetails.invoiceDate == undefined){
            confirmDialog({
                title: `<h5><strong class="text-white">Please Enter Invoice Date</strong></h5>`, cancelButton: false, confirmText: false, confirmButton: false, background: `#BD362F`
              })
        }else if (purchaseOrderList.length > 0) {
       
          const checkPoNo = purchaseOrderList.filter((poData) => poData.poNumber == poDetails.PO_NO && poData.invoiceNo == poDetails.invoiceNo);
          if (checkPoNo != '') {
            confirmDialog({
              title: `<h5><strong class="text-white">PO Details Already Added</strong></h5>`, cancelButton: false, confirmText: false, confirmButton: false, background: `#BD362F`
            })
            setPoType('')
            setPoNo('')
            if (fileInputRef.current) {
              fileInputRef.current.value = '';
            }
            // Optionally, reset the attachedFiles1 state
            setAttachedFiles1({});
            
          } else {
            addPoDetails('')
          }
        }
        else {
          addPoDetails('')
        }
      }
      const addPoDetails = () => {
        setIsDisableForPo(true);
        
        const tempPurchaseOrderList = [];
        const tempPurchaseOrderDetails = [];
        
        poDetails1.forEach((poGroup) => {
            const poNumber = poGroup.PO_NUMBER || poGroup.PO_NO;
            const invoiceNo = poGroup.invoiceNo;
            const invoiceDate = poGroup.invoiceDate;
            const lineItems = poGroup.LINE_ITEM || poGroup.PO_LINEITEM;
            const plantCode = poGroup.FROMPLANT || (lineItems[0]?.PLANT || '');
            
            // Add to purchaseOrderList
            tempPurchaseOrderList.push({
                poNumber,
                invoiceNo,
                invoiceDate,
                type: poGroup.TYPE,
                plantCode,
                vendorName: poGroup.VENDOR_NAME,
                poName: poTypeData.name,
                plantName: plantName,
                invoiceCopy: attachedFiles1?.InvoiceCopy,
                vendorCode: poGroup.VENDOR,
            });
            
            // Add to purchaseOrderDetails
            lineItems.forEach((item) => {
                tempPurchaseOrderDetails.push({
                    poNumber,
                    invoiceNo,
                    invoiceDate,
                    poRate: Number(item.RATE).toFixed(3),
                    freightAmount: item.FREIGHT ? Number(item.FREIGHT).toFixed(3) : 0,
                    type: poGroup.TYPE,
                    plantCode,
                    vendorName: poGroup.VENDOR_NAME,
                    poName: poTypeData.name,
                    plantName: plantName,
                    toPlantCode: item.PLANT,
                    quantity: item.QUANTITY,
                    material: item.MATERIAL,
                    poType: poGroup.TYPE,
                    description: item.MATERIAL_DES || null,
                    line: item.LINE || item.PO_LINEITEM,
                    documentDate: poGroup.DOCUMENT_DATE || poGroup.PO_DATE,
                    vendorCode: poGroup.VENDOR,
                    storageLocation: item.STO_LOCATION || item.STORAGE_LOC,
                    invoiceCopy: attachedFiles1?.InvoiceCopy,
                });
            });
        });
        
        // Update state
        setPurchaseOrderList(prev => [...prev, ...tempPurchaseOrderList]);
        setPurchaseOrderDetails(prev => [...prev, ...tempPurchaseOrderDetails]);
        
        // Reset form
        setPoDetails([]);
        setPoDetails1([]);
        setPoNo('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        setAttachedFiles1({});
        setPoType('');
      };
      const getPoDetails = (type) => {

        const file = attachedFiles1?.InvoiceCopy;
        if (!file || !(file instanceof File)) {
          errorToast("Please attach a valid Invoice Copy");
          return;
        }
      
        let postdata = new FormData();
        postdata.append("file", file); // backend expects 'file'
        postdata.append("PLANT_IDS", UserDetails.plantids);

        showLoader();
        apiPostMethod(apiBaseUrl + `MigoAutomationController/sendFileToInvoiceParser`, postdata, "File")
          .then((response) => {
            const { data } = response;
            if(data.error){
              confirmDialog({
                title: `<h5><strong class="text-white"> ${data.error}</strong></h5>`, cancelButton: false, confirmText: false, confirmButton: false, background: `#BD362F`
              })
              setPoDetails([])
              setPoDetails1([])
              setPoType('')
            }else if (data.success == true){
              let plantCode = data.data[0].PO_LINEITEM[0].PLANT
              const plant = UserDetails.plantids.filter((userPlant) => userPlant == plantCode)
              let poLineItem = data.data[0].PO_LINEITEM.filter((item) => item.PLANT == userPlant[0]);
              if (plant == '') {
                confirmDialog({
                  title: `<h5><strong class="text-white"> ${plantCode} - Plant not assigned for user, please assign</strong></h5>`, cancelButton: false, confirmText: false, confirmButton: false, background: `#BD362F`
                })
                setPoDetails([])
                setPoDetails1([])
                setPoType('')
              }else {
                if (type == 'list') {
                  getPoType(data.data[0].TYPE)
                  setPoDetails(data.data[0])
                  setPoDetails1(data.data)
                  setPlantCode(data.data[0].LINE_ITEM ? data.data[0].LINE_ITEM[0].PLANT : data.data[0].PO_LINEITEM[0].PLANT)
                  getUserPlant(data.data[0].FROMPLANT)
                  checkMasterPlant(data.data[0].LINE_ITEM ? data.data[0].LINE_ITEM[0].PLANT : data.data[0].PO_LINEITEM[0].PLANT)
                  getAllPoType(data.data[0].TYPE)
                }else{
                  getPoDetails('list')
                  setPoDetails([])
                  setPoDetails1([])
                  setPoNo('')
                  if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                  }
                  // Optionally, reset the attachedFiles1 state
                  setAttachedFiles1({});
                  setPoType('')
                  // file = ''
                  setIsDisableForPo(true)
                  getAllPoType(data.data[0].TYPE)
                  const tempPurchaseOrderList = [];
                  const tempPurchaseOrderDetails = [];
                  
                  data.data.forEach((poGroup, groupIndex) => {
                    const poNumber = poGroup.PO_NUMBER || poGroup.PO_NO;
                    const invoiceNo = poGroup.invoiceNo;
                    const invoiceDate = poGroup.invoiceDate;
                    const lineItems = poGroup.LINE_ITEM || poGroup.PO_LINEITEM;
                    const plantCode = poGroup.FROMPLANT || lineItems[0]?.PLANT;
                  
                    // Add one entry to purchaseOrderList per group
                    tempPurchaseOrderList.push({
                      poNumber,
                      invoiceNo,
                      invoiceDate,
                      type: poGroup.TYPE,
                      plantCode,
                      vendorName: poGroup.VENDOR_NAME,
                      poName: poTypeData.name,
                      plantName: plantName,
                      invoiceCopy: file,
                      vendorCode: poGroup.VENDOR,
                    });
                  
                    // Add one entry to purchaseOrderDetails per line item
                    lineItems.forEach((item, idx) => {
                      tempPurchaseOrderDetails.push({
                        poNumber,
                        invoiceNo,
                        invoiceDate,
                        poRate: Number(item.RATE).toFixed(3),
                        freightAmount: item.FREIGHT ? Number(item.FREIGHT).toFixed(3) : 0,
                        type: poGroup.TYPE,
                        plantCode,
                        vendorName: poGroup.VENDOR_NAME,
                        poName: poTypeData.name,
                        plantName: plantName,
                        toPlantCode: item.PLANT,
                        quantity: item.QUANTITY,
                        material: item.MATERIAL,
                        poType: poGroup.TYPE,
                        description: item.MATERIAL_DES || null,
                        line: item.LINE || item.PO_LINEITEM,
                        documentDate: poGroup.DOCUMENT_DATE || poGroup.PO_DATE,
                        vendorCode: poGroup.VENDOR,
                        storageLocation: item.STO_LOCATION || item.STORAGE_LOC,
                        invoiceCopy: file,
                      });
                    });
                  });
                  
                  // Now update state once
                  setPurchaseOrderList((prev) => [...prev, ...tempPurchaseOrderList]);
                  setPurchaseOrderDetails((prev) => [...prev, ...tempPurchaseOrderDetails]);
              }
            }
            } else {
              errorToast(data.message)
              setPoType('')
            }
          })
          .catch((error) => {
            console.log(JSON.stringify(error))
            // errorToast("Something went wrong, please try again after sometime");
          })
          .finally((a) => {
            hideLoader();
          });
      }
      const getAllPoType = (poType) => {
        console.log(apiBaseUrl + `GatePro/Master/getPoType`)
        apiGetMethod(apiBaseUrl + `GatePro/Master/getPoType`)
          .then((response) => {
            const data = response.data;
            if (data.success == true) {
              const poTypeData = data.results.filter((plant) => plant.type == poType);
              checkIsWeight.push(poTypeData[0]?.isWeight)
              setCheckIsWeight(checkIsWeight)
            } else {
              errorToast(data.message)
            }
          })
          .catch((error) => {
            console.log(error)
            errorToast("Something went wrong, please try again after sometime4");
          })
      }
    const getUserPlant = (plantCode) => {
    console.log(apiBaseUrl + `GatePro/Master/getUserPlant/${UserDetails.USERID}`);
    apiGetMethod(apiBaseUrl + `GatePro/Master/getUserPlant/${UserDetails.USERID}`)
        .then((response) => {
        const data = response.data;
        if (data.success == true) {
            setUserGate(data.results)
            const masterPlant = data.results.filter((plant) => plant.werks == plantCode);
            setPlantName(masterPlant[0]?.plantName)
            setMasterPlantId(masterPlant[0]?.userPlantId)
        }
        })
        .catch((error) => {
        console.log(error)
        errorToast("Something went wrong, please try again after sometime5");
        })
    }

    const [poTypeData, setPoTypeData] = useState([])

    const getPoType = (poType) => {
        console.log(apiBaseUrl + `GatePro/Master/getPoType/${poType}`)
        apiGetMethod(apiBaseUrl + `GatePro/Master/getPoType/${poType}`)
        .then((response) => {
            const data = response.data;
            if (data.success == true) {
              // if(data.results[0].po_type == 0 && screen == 'service'){
              //   confirmDialog({
              //     title: `<h5><strong class="text-white">This PO Type Not Maintained in Service</strong></h5>`, cancelButton: false, confirmText: false, confirmButton: false, background: `#BD362F`
              //   })
              // setPoDetails([])
              // setPoDetails1([])
              // setPoType('')
              // setPoNo('')
              // }else{
              setPoTypeData(data.results[0])
              setModuleTypeId(data.results[0].moduleTypeId)
              setModuleType(data.results[0].moduleType)
              //}
            } else {
            confirmDialog({
                title: `<h5><strong class="text-white">PO Type Not Maintained</strong></h5>`, cancelButton: false, confirmText: false, confirmButton: false, background: `#BD362F`
            })
            setPoDetails([])
            setPoDetails1([])
            setPoType('')
            setPoNo('')
            if (fileInputRef.current) {
              fileInputRef.current.value = '';
            }
            // Optionally, reset the attachedFiles1 state
            setAttachedFiles1({});
            }
        })
        .catch((error) => {
            console.log(error)
            errorToast("Something went wrong, please try again after sometime6");
        })
    }
    const checkMasterPlant = (plantCode) => {
        console.log(apiBaseUrl + `GatePro/Master/checkMasterPlant/${plantCode}`)
        apiGetMethod(apiBaseUrl + `GatePro/Master/checkMasterPlant/${plantCode}`)
            .then((response) => {
            const data = response.data;
            if (data.success == true) {
                console.log(data.results);
            } else if ((data.success == false)) {
                confirmDialog({
                title: `<h5><strong class="text-white">${plantCode} - Plant Not Maintained</strong></h5>`, cancelButton: false, confirmText: false, confirmButton: false, background: `#BD362F`
                })
                setPoDetails([])
                setPoDetails1([])
                setPoType('')
                setPoNo('')
                if (fileInputRef.current) {
                  fileInputRef.current.value = '';
                }
                // Optionally, reset the attachedFiles1 state
                setAttachedFiles1({});
            }
            })
            .catch((error) => {
            console.log(error)
            errorToast("Something went wrong, please try again after sometime7");
            })
        }
        const form = useFormik({
        isInitialValid: false,
        initialValues: {},
        validationSchema: Yup.object().shape({}),
        onSubmit(values) { },
        });

        
        const [barcosedata, setbarcosedata] = useState('');
        const isWeight = checkIsWeight.filter((isWeight) => isWeight == 1)
        const [attachedFiles, setAttachment] = useState({ shipmentCopy: {}, coaCopy: {} });

        const fileToBase64 = (file) => {
          return new Promise((resolve, reject) => {
            const reader = new FileReader();
        
            reader.readAsDataURL(file); // This line starts the conversion
        
            reader.onload = () => resolve(reader.result); // When successful
            reader.onerror = (error) => reject(error);    // If error occurs
          });
        };

        const gateIn = async (moduleStatusId) => {
           
          
            let postdata = new FormData();
            let invoiceCopyMap = {}; // invoiceNo => uploaded file name
          
            // Collect files per invoiceNo
            const invoiceFileMap = {};
            let missingInvoices = [];
            purchaseOrderList.forEach((po) => {
              const invoiceNo = po.invoiceNo;
              const shipmentCopy = po.invoiceCopy;

              if (invoiceNo && shipmentCopy instanceof File) {
                invoiceFileMap[invoiceNo] = shipmentCopy;
                postdata.append("file[]", shipmentCopy);
              } else {
                missingInvoices.push(invoiceNo);
              }
            });
           // ❌ Show error if any invoice has no attachment
            if (missingInvoices.length > 0) {
              const uniqueMissing = [...new Set(missingInvoices)];
              errorToast(`Missing attachments for invoice(s): ${uniqueMissing.join(", ")}`);
              return;
            }
            const phoneRegex = /^[0-9]{10}$/;
            if ((!phoneRegex.test(phoneNo)) && (screen != 'change' && screen != 'Diesel' && screen != 'FGSales')) {
              errorToast("Enter a valid 10-digit phone number.");
              return;
            }
            postdata.append("form_name", 'Payment');
            postdata.append("SubFolder", "FG_GateOut");
            showLoader();
            try {
              const response = await apiPostMethod(sapFileShare, postdata, "File");
              const { data } = response;
              if (data.success) {
                console.log(data.files)
                data.files.forEach((file) => {
                  const matchedInvoice = Object.entries(invoiceFileMap).find(
                    ([_, localFile]) => localFile?.name === file.orgname
                  );
                  if (matchedInvoice) {
                    const [invoiceNo] = matchedInvoice;
                    invoiceCopyMap[invoiceNo] = file.updname;
                  }
                });
          
                GateInVehicle(moduleStatusId, invoiceCopyMap);
              } else {
                console.error("Upload response format invalid", data);
                errorToast("File upload failed.");
              }
            } catch (err) {
              console.error("Upload error:", err);
              errorToast("Something went wrong during upload.");
            }finally {
              hideLoader();
            }
        };
          
          

        const GateInVehicle = async (moduleStatusId, shipmentCopys) => {
            let purchaseOrderData = [];
            const processedSet = new Set(); // To track unique poNumber + invoiceNo combinations
            for (let i = 0; i < purchaseOrderList.length; i++) {
              const item = purchaseOrderList[i];
              const key = `${item.poNumber}_${item.invoiceNo}`;
              // Skip duplicates
              if (processedSet.has(key)) continue;
              processedSet.add(key);
            
              const file = item?.invoiceCopy || null;

              let base64File = null;
              let fileFormat = null;
              let fileName = null;
            
              if (file instanceof File) {
                base64File = await fileToBase64(file); // wait for base64 conversion
                base64File = base64File.split(',')[1]; 
                fileName = file.name;
                fileFormat = '.' + file.name.split('.').pop(); // safer than using mime type
              } else {
                const mimeType = file?.type || 'application/octet-stream';
                fileFormat = '.' + mimeType.split('/')[1];
              }
            
              const obj = {
                ZZLINE: purchaseOrderData.length + 1,
                ZZPO_NO: item.poNumber,
                ZZVENDOR: item.vendorCode,
                ZZINV_NO: item.invoiceNo,
                fileformat: fileFormat,
                filename: fileName,
                lv_xstring: base64File, // Base64-encoded file
              };
            
              purchaseOrderData.push(obj);
            }
            const enrichedPurchaseOrderDetails = purchaseOrderDetails.map(item => {
                const matchingPO = purchaseOrderList.find(po =>
                  po.poNumber === item.poNumber && po.invoiceNo === item.invoiceNo
                );
              
                const invoiceNo = matchingPO?.invoiceNo;
                const shipmentCopy = invoiceNo ? shipmentCopys[invoiceNo] || null : null;
              
                return {
                  ...item,
                  invoiceCopy: shipmentCopy
                };
              });
              if(screen == 'change'){
                updatePurchaseOrderDetails(enrichedPurchaseOrderDetails,purchaseOrderData)
              }else if(screen == 'Diesel'|| screen == 'FGSales'){
                updateVehicleStatus(enrichedPurchaseOrderDetails,purchaseOrderData)
              }else{
            let formData = form.values;
            const postdata = {
              masterPlantId: purchaseOrderList[0]?.plantCode,
              userInfoId: UserDetails.USERID,
              movementType: "Unloading",
              moduleType: moduleType,
              vehicleNo: Type == 0 ? 'ByHand' : truckValue ? truckValue : '',
              subModuleTypeId: Type == 0 ? 5 : Type == 2 ? subModuleTypeId : '',
              driverMobileNumber: tripSheetData != '' ? tripSheetData.DRIVER_PHONE_NO : phoneNo,
              tripSheetNumber: tripSheetData != '' ? tripSheetData.TRIPSHEET_NO : null,
              moduleStatusId: moduleStatusId,
              remarks: formData.remarks ? formData.remarks : null,
              isWeight: Type == 0 ? 0 : isWeight != '' ? 1 : 0,
              purchaseOrderDetails: purchaseOrderData,
              invoiceCopy: '',
              gate_id: UserDetails.GATE_ID,
              purchaseOrderDetailsList: enrichedPurchaseOrderDetails,
              screen:screen
            };

            showLoader();
          
            console.log(apiBaseUrl + "GatePro/Gate/addGateInInfo", postdata);
          
            apiPostMethod(apiBaseUrl + "GatePro/Gate/addGateInInfo", postdata)
              .then((response) => {
                const res = response.data;
                if (res.success === true) {
                  const message = moduleStatusId === 6 ? "Waiting for In..." : res.message;
          
                  confirmDialog({
                    title: `<h5><strong class="text-white">${message}</strong></h5>`,
                    cancelButton: false,
                    confirmText: false,
                    confirmButton: false,
                    background: `#51A351`,
                  }).then(() => {
                    window.location.reload();
                  });
          
                  reset();
          
                  if (Type != 2) {
                    addLoadingUnloadingInfo('', res?.vehicle,enrichedPurchaseOrderDetails);
                  }
                } else {
                  confirmDialog({
                    title: `<h5><strong class="text-white">${res.message}</strong></h5>`,
                    cancelButton: false,
                    confirmText: false,
                    confirmButton: false,
                    background: `#BD362F`,
                  });
                }
              })
              .catch((error) => {
                console.log(error);
                errorToast("Something went wrong, please try again after sometime");
              })
              .finally(() => {
                hideLoader();
              });
            }
          };
          
          const updatePurchaseOrderDetails = (enrichedPurchaseOrderDetails,purchaseOrderData) => {

            const purchaseOrderDetails = enrichedPurchaseOrderDetails.map(item => {
            
              const matchingUpload = purchaseOrderData.find(
                data => data.ZZPO_NO === item.poNumber && data.ZZINV_NO === item.invoiceNo
              );
              return {
                ...item,
                lv_xstring: matchingUpload?.lv_xstring || null,
                fileformat: matchingUpload?.fileformat || null,
                filename: matchingUpload?.filename,
              };
              });
            
            const FrmData = {
                loadingUnloadingInfoId: loadingAndUnloadingInfoId,
                purchaseOrderDetails: purchaseOrderDetails,
                // purchaseOrderData:purchaseOrderData,
            };
    
            showLoader();
            console.log(apiBaseUrl + "GatePro/Master/updatePurchaseOrderDetails", FrmData)
            apiPostMethod(apiBaseUrl + "GatePro/Master/updatePurchaseOrderDetails", FrmData)
                .then((response) => {
                    const { data } = response;
                    if (data.success == true) {
                      confirmDialog({
                        title: `<h5><strong class="text-white">${data.message}</strong></h5>`,
                        cancelButton: false,
                        confirmText: false,
                        confirmButton: false,
                        background: `#51A351`,
                      }).then(() => {
                        window.location.reload();
                      });
                    }
                    else if (data.success == false) {
                        errorToast(data.message);
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
           const updateVehicleStatus = (enrichedPurchaseOrderDetails,purchaseOrderData) => {

            // const purchaseOrderDetails = enrichedPurchaseOrderDetails.map(item => {
            
            //   const matchingUpload = purchaseOrderData.find(
            //     data => data.ZZPO_NO === item.poNumber && data.ZZINV_NO === item.invoiceNo
            //   );
            //   return {
            //     ...item,
            //     lv_xstring: matchingUpload?.lv_xstring || null,
            //     fileformat: matchingUpload?.fileformat || null
            //   };
            //   });
                       
            const postdata = {
              gateInOutInfoId: screen == 'FGSales' || screen == 'Diesel' ? gateInOutInfoData : gateInOutInfoData,
              loadingUnloadingInfoId: screen == 'Diesel' ? loadingAndUnloadingInfoId : loadingAndUnloadingInfoId,
              moduleStatusId: 1,
              remarks: remarks,
              userInfoId: UserDetails.USERID,
              purchaseOrderDetails: screen == 'FGSales' || screen == 'Diesel' ? enrichedPurchaseOrderDetails : []
            };
        
            showLoader();
            console.log(apiBaseUrl + "GatePro/Gate/updateVehicleStatus", postdata);
            apiPostMethod(apiBaseUrl + "GatePro/Gate/updateVehicleStatus", postdata)
              .then((response) => {
                const res = response.data;
                if (res.success == true) {
                  const message = "Gate In Success...";
                  confirmDialog({
                    title: `<h5><strong class="text-white">${message}</strong></h5>`,
                    cancelButton: false,
                    confirmText: false,
                    confirmButton: false,
                    background: `#51A351`,
                  }).then(() => {
                    window.location.reload();
                  });
                  
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
          const addLoadingUnloadingInfo = (gatePassDocument,vehicle,enrichedPurchaseOrderDetails) => {
            // if (screen == 'loadingUnloadingInfo') {
            //   form.setSubmitting(true);
            //   form.validateForm();
            //   return;
            // }
            let formData = form.values;

            const FrmData = {
                movementTypeId: 2,
                moduleTypeId: moduleTypeId,
                truckNo: truckValue||vehicle,
                masterPlantId: purchaseOrderList[0].plantCode,
                remarks: remarks ? remarks : null,
                phoneNo:phoneNo,
                tripSheetNo:  tripSheetData?.TRIPSHEET_NO,
                statusId: 1,
                userInfoId: UserDetails.USERID,
                isWeight: Type == 0 ? 0 : isWeight != '' ? 1 : 0,
                purchaseOrderDetails: enrichedPurchaseOrderDetails,
                gatePassDocument:gatePassDocument||barcosedata,
                screen:screen,
                serviceStatus:screen=='service' ? 1 : 0
            };
            apiPostMethod(apiBaseUrl + "GatePro/Master/addLoadingUnloadingInfo", FrmData)
            .then((response) => {
                const { data } = response;
                if (data.success == true) {
                    ShowToast(data.message)
                    reset()
                }
                else if (data.success == false) {
                errorToast(data.message);
                }
            })
            .catch((error) => {
                console.log(JSON.stringify(error))
                errorToast("Something went wrong, please try again after sometime9");
            })
          }
          const reset = () => {
            setPurchaseOrderList([])
            form.resetForm("");
            setPoNo("")
            if (fileInputRef.current) {
              fileInputRef.current.value = '';
            }
            // Optionally, reset the attachedFiles1 state
            setAttachedFiles1({});
            setIsDisableForPo(false)
            setPurchaseOrderDetails([])
            setPlantCode('')
            setInvoiceNo('')
            form.setFieldValue('invoiceDate', ''); // Use formik's setFieldValue to reset
            setPoTypeData([])
            setPlantName('')
            setPoType('')
          }
          const [shipmentCopys, setShipmentCopys] = useState({});

          const handleFileChange = (file, id, invoiceNo) => {
            setShipmentCopys(prev => ({
              ...prev,
              [invoiceNo]: file
            }));

            setPurchaseOrderList(prevList =>
              prevList.map(po =>
                po.invoiceNo === invoiceNo
                  ? {
                      ...po,
                      attachments: {
                        ...po.attachments,
                        shipmentCopy: {
                          localFile: file,
                          name: file.name
                        }
                      }
                    }
                  : po
              )
            );
          };
    const [poFile, setPoFile] = useState(null);
    const [attachedFiles1, setAttachedFiles1] = useState({ InvoiceCopy: null });
    const fileInputRef = useRef(null);
    const handleFileChange1 = (file, id) => {
      setAttachedFiles1({
        ...attachedFiles1,
        [id]: file,
      });
    };
    return (
        <>
            <Col md="12" sm="12"><hr></hr></Col>
            {truckValue &&
                <Col md="2" sm="2">
                  <QRCode 
                  value={truckValue} 
                  id="barcode"
                  size = '100'
                  hidden
                  />
                </Col> }
            <Col md="12" sm="12">
                <h4 className="text-primary"><u>Purchase Order Details</u></h4><br />
            </Col>
              
                <Col md="4" sm="4"> 
                    <InputGroup>
                    {/* <Input type="text" name="PO Number" id="poNumber" placeholder="PO Number" onChange={(e) => setPoNo(e.target.value)} value={poNo} disabled={(poType == 'show') ? true : false} /> */}
                       <div className="mr-0">
                            <Uploader
                                setAttachment={handleFileChange1}
                                title="Invoice Copy / Delivery Challan"
                                id={"InvoiceCopy"}
                                selectedFileName={attachedFiles1?.InvoiceCopy?.name}
                                height="42px" // optional, if your Uploader component accepts it
                                width="100%"  // optional
                                inputRef={fileInputRef}
                            />
                        </div>
                        <Button size="sm" color="success" style={{ height: '34px', width: '50px' }} onClick={() => { getPoDetails('list'); setPoType('show') }}>
                            <Search size={20} />
                    </Button>
                    </InputGroup>
                </Col>
                        {/* } */}
            

                {poTypeData != '' && poType == 'show'  ? <>
                    {poDetails1.map((poDetails) => (
                        <Col md="12" sm="12" key={poDetails?.PO_NO != undefined ? poDetails?.PO_NO : poDetails?.PO_NUMBER}>
                            <Row>
                                <Col md="2" sm="2">
                                    <FormGroup>
                                        <Label>PO NUMBER</Label>
                                        <Input placeholder="Po Number" value={poDetails?.PO_NO ? poDetails?.PO_NO : poDetails?.PO_NUMBER} disabled />
                                    </FormGroup>
                                </Col>
                                <Col md="2" sm="2">
                                    <FormGroup>
                                        <Label>PO TYPE</Label>
                                        <Input placeholder="Po Type" value={poDetails?.REFERENCE ? poDetails?.REFERENCE : poTypeData?.name} disabled />
                                    </FormGroup>
                                </Col>
                                <Col md="1" sm="1">
                                    <FormGroup>
                                        <Label>FROM PLANT</Label>
                                        <Input placeholder="Plant Name" value={poDetails?.FROMPLANT ? poDetails?.FROMPLANT : plantCode} disabled />
                                    </FormGroup>
                                </Col>
                                {poDetails?.VENDOR_NAME != '' ?
                                    < Col md="3" sm="3" >
                                        <FormGroup>
                                            <Label>VENDOR NAME</Label>
                                            <Input placeholder="Vendor Name" value={poDetails?.VENDOR_NAME} disabled />
                                        </FormGroup>
                                    </Col> : null
                                }
                                    < Col md="2" sm="2" >
                                        <FormGroup>
                                            <Label>INVOICE NO</Label>
                                            <Input placeholder="Vendor Name" value={poDetails?.invoiceNo} disabled />
                                        </FormGroup>
                                    </Col>
                                
                                    < Col md="2" sm="2" >
                                        <FormGroup>
                                            <Label>INVOICE DATE</Label>
                                            <Input placeholder="Vendor Name" value={poDetails?.invoiceDate} disabled />
                                        </FormGroup>
                                    </Col>
                                
                            </Row>
                        </Col>
                    ))} </> : null
                }

                {poTypeData != '' && poDetails != '' && poType == 'show'  ? <>
                    {poDetails != "" ? <Col sm="4" md="4" style={{ marginLeft: "50px" }}></Col> : <Col sm="6" md="6"></Col>}
                    <Col sm="2" md="2">
                        <label>&nbsp;</label>
                        <FormGroup className="d-flex justify-content-end mb-0">
                            <Button.Ripple color="primary" type="button" onClick={InvoiceCheck}>
                                <Plus size={16} /> Add
                            </Button.Ripple>
                        </FormGroup>
                    </Col> </> : null
                }
                {IsDisableForPo ? (
                    <Col md="12" sm="12">
                        <label></label>
                        <table className="table table-bordered">
                        <thead>
                            <tr>
                            <th className="bg-primary text-white">Invoice No</th>
                            {/* <th className="bg-primary text-white">Attachment</th> */}
                            <th className="bg-primary text-white">PO Number</th>
                            <th className="bg-primary text-white">Invoice Date</th>
                            <th className="bg-primary text-white">PO Type</th>
                            <th className="bg-primary text-white">From Plant</th>
                            <th className="bg-primary text-white">Remove</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Object.entries(
                            purchaseOrderList.reduce((acc, po) => {
                                const key = po.invoiceNo || 'NO_INVOICE';
                                if (!acc[key]) acc[key] = [];
                                acc[key].push(po);
                                return acc;
                            }, {})
                            ).map(([invoiceNo, pos], index) => (
                            <React.Fragment key={index}>
                                <tr>
                                {/* Invoice Number - rowspan */}
                                <td rowSpan={pos.length}>{invoiceNo}</td>

                                {/* Attachment - once per invoiceNo */}
                                {/* <td rowSpan={pos.length}>
                                  <Uploader
                                    title="Invoice"
                                    id={`shipmentCopy_${invoiceNo}`}
                                    selectedFileName={shipmentCopys[invoiceNo]?.name}
                                    setAttachment={(file, id) => handleFileChange(file, id, invoiceNo)}
                                    disabled
                                  />
                                </td> */}

                                {/* First Row */}
                                <td>{pos[0]?.poNumber}</td>
                                <td>{new Date(pos[0]?.invoiceDate).toLocaleDateString('en-GB')}</td>
                                <td>{pos[0]?.poName}</td>
                                <td>{pos[0]?.plantCode}</td>
                                <td className="text-center">
                                    <X size={16} onClick={() => handleremove(pos[0]?.poNumber)} />
                                </td>
                                </tr>

                                {/* Rest of POs under same invoice */}
                                {pos.slice(1).map((po, i) => (
                                <tr key={i}>
                                    <td>{po.poNumber}</td>
                                    <td>{new Date(po.invoiceDate).toLocaleDateString('en-GB')}</td>
                                    <td>{po.poName}</td>
                                    <td>{po.plantCode}</td>
                                    <td className="text-center">
                                    <X size={16} onClick={() => handleremove(po.poNumber)} />
                                    </td>
                                </tr>
                                ))}
                            </React.Fragment>
                            ))}
                        </tbody>
                        </table>
                    </Col>
                    ) : null}


                    {purchaseOrderList != ''  ? <>
                  <Col sm="2" md="2">
                    <label>&nbsp;</label>
                    <FormGroup className="d-flex justify-content-start mb-0">
                      <Button.Ripple outline color="primary" type="button" onClick={reset}>
                        <ArrowLeft size={16} /> Back
                      </Button.Ripple>
                    </FormGroup>
                  </Col>
                  <Col sm="10" md="10">
                    <label></label>
                    <FormGroup className="d-flex justify-content-end mb-0 mt-2">
                    {screen == 'gate' &&
                    <Button.Ripple color="primary" type="button" onClick={() => gateIn(6)}>
                        <StopCircle size={16} /> Wait OutSide
                      </Button.Ripple>} &nbsp;&nbsp;
                      <Button.Ripple color="primary" type="button" onClick={() => gateIn(1)}>
                        <Check size={16} /> Submit
                      </Button.Ripple>
                    </FormGroup>
                  </Col>
                </> : null
                }
        </>
    )
}

export default PurchaseOrderDetailsInfoOCR