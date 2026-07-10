import React from 'react'
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

const PurchaseOrderDetailsInfo = ({tripSheetData,truckValue,remarks,phoneNo,Type,subModuleTypeId,screen,loadingAndUnloadingInfoId,gateInOutInfoData,isVehicle}) => {
  
  console.log(screen,gateInOutInfoData,loadingAndUnloadingInfoId)
    const [isInvoice, setIsInvoice] = useState(false)
    const [poDetails, setPoDetails] = useState([]);
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
        invoiceNo: invoiceNo?invoiceNo:0,        
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
                form.setFieldValue('invoiceDate', ''); // Use formik's setFieldValue to reset
            } 
           }).catch((error) => {
                console.log(error)
                errorToast("Something went wrong, please try again after sometime2");
            })
    }

    const checkInvoiceNo = () => {

        if ((invoiceNo == "")) {
          confirmDialog({
            title: `<h5><strong class="text-white">Please Enter Invoice No</strong></h5>`, cancelButton: false, confirmText: false, confirmButton: false, background: `#BD362F`
          })
        }else if(form?.values?.invoiceDate == "" || form?.values?.invoiceDate == undefined){
            confirmDialog({
                title: `<h5><strong class="text-white">Please Enter Invoice Date</strong></h5>`, cancelButton: false, confirmText: false, confirmButton: false, background: `#BD362F`
              })
        }else if (purchaseOrderList.length > 0) {
          const checkPoNo = purchaseOrderList.filter((poData) => poData.poNumber == poNo && poData.invoiceNo == invoiceNo);
          if (checkPoNo != '') {
            confirmDialog({
              title: `<h5><strong class="text-white">PO Details Already Added</strong></h5>`, cancelButton: false, confirmText: false, confirmButton: false, background: `#BD362F`
            })
            setPoType('')
            setPoNo('')
            
          } else {
            getPoDetails('test')
          }
        }
        else {
          getPoDetails('TEST')
        }
      }
      const getPoDetails = (type) => {
        showLoader();
        const poNumber = { poNumber: poNo, moduleTypeId: 12 }
        apiPostMethod(apiBaseUrl + `GatePro/Master/getPoDetails`, poNumber)
          .then((response) => {
            const { data } = response;
            if (data.success == true) {
              let plantCode = data.data[0].PO_LINEITEM[0].PLANT
              const plant = UserDetails.plantids.filter((userPlant) => userPlant == plantCode)
              let poLineItem = data.data[0].PO_LINEITEM.filter((item) => item.PLANT == userPlant[0]);
              if (plant == '') {
                confirmDialog({
                  title: `<h5><strong class="text-white"> ${plantCode} - Plant not assigned for user, please assign</strong></h5>`, cancelButton: false, confirmText: false, confirmButton: false, background: `#BD362F`
                })
                setPoDetails([])
                setPoType('')
              }else {
                if (type == 'list') {
                  getPoType(data.data[0].TYPE)
                  setPoDetails(data.data[0])
                  setPlantCode(data.data[0].LINE_ITEM ? data.data[0].LINE_ITEM[0].PLANT : data.data[0].PO_LINEITEM[0].PLANT)
                  getUserPlant(data.data[0].FROMPLANT)
                  checkMasterPlant(data.data[0].LINE_ITEM ? data.data[0].LINE_ITEM[0].PLANT : data.data[0].PO_LINEITEM[0].PLANT)
                  getAllPoType(data.data[0].TYPE)
                }else{
                  getPoDetails('list')
                  setPoDetails([])
                  setPoNo('')
                  setPoType('')
                  setInvoiceNo('')
                  form.setFieldValue('invoiceDate', ''); // Use formik's setFieldValue to reset
                  setIsDisableForPo(true)
                  getAllPoType(data.data[0].TYPE)
                const length = data.data[0].LINE_ITEM ? data.data[0].LINE_ITEM.length : data.data[0].PO_LINEITEM.length
                const length1 = data.data[0].LINE_ITEM ? data.data[0].LINE_ITEM.length : poLineItem.length
                
                  for (let i = 0; i < data.data.length ; i++) {
                    const obj = {
                      poNumber: data.data[0].PO_NUMBER || data.data[0].PO_NO,
                      invoiceNo: invoiceNo ? invoiceNo : null,
                      invoiceDate: form?.values?.invoiceDate,
                      type: data.data[0].TYPE,
                      plantCode: data.data[0].FROMPLANT ? data.data[0].FROMPLANT : data.data[0].PO_LINEITEM[0].PLANT,
                      vendorName: data.data[0].VENDOR_NAME,
                      poName: poTypeData.name,
                      plantName: plantName,
                      vendorCode: data.data[0].VENDOR,
                    }
                    purchaseOrderList.push(obj);
                  }
                  setPurchaseOrderList(purchaseOrderList)
    

                  for (let i = 0; i < length; i++) {
                    const obj1 = {
                      poNumber: data.data[0].PO_NUMBER || data.data[0].PO_NO,
                      invoiceNo: invoiceNo ? invoiceNo : null,
                      invoiceDate: form?.values?.invoiceDate,
                      poRate:data.data[0].LINE_ITEM 
                      ? Number(data.data[0].LINE_ITEM[i].RATE).toFixed(3) 
                      : Number(data.data[0].PO_LINEITEM[i].RATE).toFixed(3),
                      freightAmount:data.data[0].LINE_ITEM ? Number(data.data[0].LINE_ITEM[i].FREIGHT).toFixed(3) : data.data[0]?.PO_LINEITEM[i]?.FREIGHT ? Number(data.data[0]?.PO_LINEITEM[i]?.FREIGHT).toFixed(3) : 0,
                      type: data.data[0].TYPE,
                      plantCode: data.data[0].FROMPLANT ? data.data[0].FROMPLANT : data.data[0].PO_LINEITEM[0].PLANT,
                      vendorName: data.data[0].VENDOR_NAME,
                      poName: poTypeData.name,
                      plantName: plantName,
                      toPlantCode: data.data[0].LINE_ITEM ? data.data[0].LINE_ITEM[i].PLANT : data.data[0].PO_LINEITEM[i].PLANT,
                      quantity: data.data[0].LINE_ITEM ? data.data[0].LINE_ITEM[i].QUANTITY : data.data[0].PO_LINEITEM[i].QUANTITY,
                      material: data.data[0].LINE_ITEM ? data.data[0].LINE_ITEM[i].MATERIAL : data.data[0].PO_LINEITEM[i].MATERIAL,
                      poType: data.data[0].TYPE,
                      description: data.data[0].PO_LINEITEM ? data.data[0].PO_LINEITEM[i].MATERIAL_DES : null,
                      line: data.data[0].LINE_ITEM ? data.data[0].LINE_ITEM[i].LINE : data.data[0].PO_LINEITEM[i].PO_LINEITEM,
                      documentDate: data.data[0].DOCUMENT_DATE || data.data[0].PO_DATE,
                      vendorCode: data.data[0].VENDOR,
                      storageLocation: data.data[0].LINE_ITEM ? data.data[0].LINE_ITEM[i].STO_LOCATION : data.data[0].PO_LINEITEM[i].STORAGE_LOC,
                    }
                    purchaseOrderDetails.push(obj1);
                  }
                  setPurchaseOrderDetails(purchaseOrderDetails);
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
            // setPoType('')
            // setPoNo('')
            // }else{
            setPoTypeData(data.results[0])
            setModuleTypeId(data.results[0].moduleTypeId)
            setModuleType(data.results[0].moduleType)
            // }
            } else {
            confirmDialog({
                title: `<h5><strong class="text-white">PO Type Not Maintained</strong></h5>`, cancelButton: false, confirmText: false, confirmButton: false, background: `#BD362F`
            })
            setPoDetails([])
            setPoType('')
            setPoNo('')
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
                setPoType('')
                setPoNo('')
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

        const gateIn = async (moduleStatusId) => {
           
          
            let postdata = new FormData();
            let invoiceCopyMap = {}; // invoiceNo => uploaded file name
          
            // Collect files per invoiceNo
            const invoiceFileMap = {};
            let missingInvoices = [];

            purchaseOrderList.forEach((po) => {
              const invoiceNo = po.invoiceNo;
              const shipmentCopy = po.attachments?.shipmentCopy?.localFile;
          
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
          
          
        const fileToBase64 = (file) => {
          return new Promise((resolve, reject) => {
            const reader = new FileReader();
        
            reader.readAsDataURL(file); // This line starts the conversion
        
            reader.onload = () => resolve(reader.result); // When successful
            reader.onerror = (error) => reject(error);    // If error occurs
          });
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
            
              const file = item?.attachments?.shipmentCopy?.localFile || null;
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
                  shipmentCopy: shipmentCopy
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
              screen:screen,
              moduleTypeId: moduleTypeId
            };
          
            // Validations
            if (postdata.vehicleNo === '') {
              errorToast('Please Check Vehicle No');
              return false;
            } else if (moduleTypeId == 15 && UserDetails.GATE_ID == 1) {
              errorToast('This purchase not applicable for direct gate in ...');
              return false;
            }
            showLoader();
                  
            // apiPostMethod(apiBaseUrl + "GatePro/Gate/addGateInInfo", postdata)
            apiPostMethod(apiBaseUrl + 'MigoAutomationController/addGateInPODetails', postdata, 'File')

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
          
                  // if (Type != 2) {
                  //   addLoadingUnloadingInfo('', res.vehicle,enrichedPurchaseOrderDetails);
                  // }
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
    
            // showLoader();
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
                // .finally((a) => {
                //     hideLoader();
                // });
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

    const todayIST = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });

    const GateInVehicleMultiplePurchase = async (moduleStatusId) => {
           
      let purchaseOrderData = [];
        const enrichedPurchaseOrderDetails = purchaseOrderDetails.map(item => {
            // const matchingPO = purchaseOrderList.find(po =>
            //   po.poNumber === item.poNumber 
            // );
          
            // const invoiceNo = matchingPO?.invoiceNo;
            // const shipmentCopy = invoiceNo ? shipmentCopys[invoiceNo] || null : null;
          
            return {
              ...item,
              // shipmentCopy: shipmentCopy
            };
          });
          
        let formData = form.values;
        const postdata = {
          masterPlantId: purchaseOrderList[0]?.plantCode,
          userInfoId: UserDetails.USERID,
          movementType: "Unloading",
          // moduleType: 'MULTIPLE GATE IN PURCHASE',
          vehicleNo: Type == 0 ? 'ByHand' : truckValue ? truckValue : '',
          // subModuleTypeId: Type == 0 ? 5 : Type == 2 ? subModuleTypeId : '',
          driverMobileNumber: tripSheetData != '' ? tripSheetData.DRIVER_PHONE_NO : phoneNo,
          tripSheetNumber: tripSheetData != '' ? tripSheetData.TRIPSHEET_NO : null,
          moduleStatusId: moduleStatusId,
          remarks: formData.remarks ? formData.remarks : null,
          isWeight: Type == 0 ? 0 : isWeight != '' ? 1 : 0,
          purchaseOrderDetails: purchaseOrderData,
          invoiceCopy: '',
          gate_id: UserDetails.GATE_ID,
          purchaseOrderDetailsList: enrichedPurchaseOrderDetails,
          screen:screen,
          moduleTypeId: 45
        };
      
        // Validations
        if (postdata.vehicleNo === '') {
          errorToast('Please Check Vehicle No');
          return false;
        } 
        showLoader();
              
        // apiPostMethod(apiBaseUrl + "GatePro/Gate/addGateInInfo", postdata)
        apiPostMethod(apiBaseUrl + 'MigoAutomationController/addGateIn', postdata, 'File')

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
      
              // if (Type != 2) {
              //   addLoadingUnloadingInfo('', res.vehicle,enrichedPurchaseOrderDetails);
              // }
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
                            <BarcodeScanner onScan={handleScan} Label={'PO'}/>
                            {/* <QRCodeScanner /> */}
                            <InputGroup>
                            <Input type="text" name="PO Number" id="poNumber" placeholder="PO Number" onChange={(e) => setPoNo(e.target.value)} value={poNo} disabled={(poType == 'show') ? true : false} />
                                <Button size="sm" color="success" style={{ height: '38px', width: '50px' }} onClick={() => { getPoDetails('list'); setPoType(isVehicle == 3 ? 'notShow' : 'show') }}>
                                    <Search size={20} />
                            </Button>
                            </InputGroup>
                        </Col>
                        {/* } */}
                {poType == 'show' && isInvoice ?
                    <Col md="4" sm="4">
                        <Label>Invoice No / Delivery Challan</Label>
                        <Input type="text" placeholder="Invoice No / Delivery Challan" onChange={(e) => setInvoiceNo(e.target.value)} value={invoiceNo} />
                    </Col> : null
                }
               {poType == 'show' && isInvoice ?
                 <Col md="4" sm="4" >
                    <CustomTextInput
                        label={"Invoice Date"}
                        form={form}
                        id="invoiceDate"
                        type="date"
                        // min={getAllowedPastDate(invoicePostingDate)}
                        max={todayIST}
                        onKeyDown={(e) => {
                        e.preventDefault()
                        }}
                    />
                </Col> : null }

                {poTypeData != '' && (poType == 'show' || poType == 'notShow')  ? <>
                    {[poDetails].map((poDetails) => (
                        <Col md="12" sm="12" key={poDetails?.PO_NO != undefined ? poDetails?.PO_NO : poDetails?.PO_NUMBER}>
                            <Row>
                                <Col md="3" sm="3">
                                    <FormGroup>
                                        <Label>PO NUMBER</Label>
                                        <Input placeholder="Po Number" value={poDetails?.PO_NO ? poDetails?.PO_NO : poDetails?.PO_NUMBER} disabled />
                                    </FormGroup>
                                </Col>
                                <Col md="3" sm="3">
                                    <FormGroup>
                                        <Label>PO TYPE</Label>
                                        <Input placeholder="Po Type" value={poDetails?.REFERENCE ? poDetails?.REFERENCE : poTypeData?.name} disabled />
                                    </FormGroup>
                                </Col>
                                <Col md="3" sm="3">
                                    <FormGroup>
                                        <Label>FROM PLANT</Label>
                                        <Input placeholder="Plant Name" value={poDetails?.FROMPLANT ? poDetails?.FROMPLANT : plantCode} disabled />
                                    </FormGroup>
                                </Col>
                                {poDetails?.VENDOR_NAME == '' ?
                                    <Col md="3" sm="3">
                                        <FormGroup>
                                            <Label>TO PLANT</Label>
                                            <Input placeholder="To Plant" value={plantCode} disabled />
                                        </FormGroup>
                                    </Col> : null
                                }
                                {poDetails?.VENDOR_NAME != '' ?
                                    < Col md="3" sm="3" >
                                        <FormGroup>
                                            <Label>VENDOR NAME</Label>
                                            <Input placeholder="Vendor Name" value={poDetails?.VENDOR_NAME} disabled />
                                        </FormGroup>
                                    </Col> : null
                                }
                            </Row>
                        </Col>
                    ))} </> : null
                }

                {poTypeData != '' && poDetails != '' && (poType == 'show' || poType == 'notShow' )  ? <>
                    {poDetails != "" ? <Col sm="4" md="4" style={{ marginLeft: "50px" }}></Col> : <Col sm="6" md="6"></Col>}
                    <Col sm="2" md="2">
                        <label>&nbsp;</label>
                        <FormGroup className="d-flex justify-content-end mb-0">
                            <Button.Ripple color="primary" type="button" onClick={ poType == 'notShow' ? getPoDetails : InvoiceCheck}>
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
                            {purchaseOrderList[0]?.invoiceNo &&
                            <th className="bg-primary text-white">Invoice No</th>}
                            {purchaseOrderList[0]?.invoiceNo &&
                            <th className="bg-primary text-white">Attachment</th>}
                            <th className="bg-primary text-white">PO Number</th>
                            {purchaseOrderList[0]?.invoiceNo &&
                            <th className="bg-primary text-white">Invoice Date</th>}
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
                                {purchaseOrderList[0]?.invoiceNo &&
                                <td rowSpan={pos.length}>{invoiceNo}</td>}

                                {/* Attachment - once per invoiceNo */}
                                {purchaseOrderList[0]?.invoiceNo &&
                                <td rowSpan={pos.length}>
                                  <Uploader
                                    title="Invoice"
                                    id={`shipmentCopy_${invoiceNo}`}
                                    selectedFileName={shipmentCopys[invoiceNo]?.name}
                                    setAttachment={(file, id) => handleFileChange(file, id, invoiceNo)}
                                  />
                                </td>} 

                                {/* First Row */}
                                <td>{pos[0]?.poNumber}</td>
                                {purchaseOrderList[0]?.invoiceNo &&
                                <td>{new Date(pos[0]?.invoiceDate).toLocaleDateString('en-GB')}</td>}
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
                    <Button.Ripple color="primary" type="button" onClick={() => purchaseOrderList[0]?.invoiceNo ? gateIn(6) : GateInVehicleMultiplePurchase(6)}>
                        <StopCircle size={16} /> Wait OutSide
                      </Button.Ripple>} &nbsp;&nbsp;
                      <Button.Ripple color="primary" type="button" onClick={() => purchaseOrderList[0]?.invoiceNo ? gateIn(1) : GateInVehicleMultiplePurchase(1)}>
                        <Check size={16} /> Submit
                      </Button.Ripple>
                    </FormGroup>
                  </Col>
                </> : null
                }
        </>
    )
}

export default PurchaseOrderDetailsInfo