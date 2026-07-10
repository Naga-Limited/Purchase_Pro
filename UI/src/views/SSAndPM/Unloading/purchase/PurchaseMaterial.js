import React from 'react'
import { useEffect } from 'react';
import { useState } from 'react';
import { ArrowLeft, Check, Plus, Search, X } from 'react-feather';
import { Button, Card, CardBody, Col, FormGroup, Input, InputGroup, Label, Row } from 'reactstrap'
import { errorToast, ShowToast } from '../../../../helper/appHelper';
import { apiBaseUrl, sapFileShare } from '../../../../urlConstants';
import { apiGetMethod, apiPostMethod } from '../../../../helper/axiosHelper';
import confirmDialog from '../../../../@core/components/confirm/confirmDialog';
import { useSelector } from 'react-redux';
import BarcodeScanner from '../../../common/BarcodeScanner';
import { useLoader } from '../../../../utility/hooks/useLoader';
import { minDate } from '../../../common/dateComponent';
import { CustomTextInput, Yup } from '../../../forms/custom-form';
import { useFormik } from 'formik';
import QRCode from 'react-qr-code';
import Uploader from '../../../Uploader';

const PurchaseMaterial = ({ screen,getUnLoadingData,moduleTypeId,loadingUnloadingReset,tripSheetData,truckValue,remarks,phoneNo}) => {

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
                errorToast("Something went wrong, please try again after sometime");
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
            } 
           }).catch((error) => {
                console.log(error)
                errorToast("Something went wrong, please try again after sometime");
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
            getPoDetails()
          }
        }
        else {
          getPoDetails()
        }
      }
      const getPoDetails = (type) => {
        showLoader();
        const poNumber = { poNumber: poNo, moduleTypeId: moduleTypeId }
        apiPostMethod(apiBaseUrl + `GatePro/Master/getPoDetails`, poNumber)
          .then((response) => {
            const { data } = response;
            if (data.success == true) {
              let plantCode = moduleTypeId == 15 ? data.data[0].PO_LINEITEM[0].PLANT : data.data[0].FROMPLANT
              const plant = UserDetails.plantids.filter((userPlant) => userPlant == plantCode)
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
                }else{
                  getPoDetails('list')
                  setPoDetails([])
                  setPoNo('')
                  setPoType('')
                  setInvoiceNo('')
                  setIsDisableForPo(true)
                  const length = data.data[0].LINE_ITEM ? data.data[0].LINE_ITEM.length : data.data[0].PO_LINEITEM.length

                  for (let i = 0; i < length; i++) {
                    const obj = {
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
                    purchaseOrderList.push(obj);
                  }
                  setPurchaseOrderList(purchaseOrderList)
    
    
                  for (let i = 0; i < length; i++) {
                    const obj = {
                      poType: data.data[0].TYPE,
                      poNumber: data.data[0].LINE_ITEM ? data.data[0].PO_NUMBER : data.data[0].PO_NO,
                      invoiceNo: invoiceNo ? invoiceNo : null,
                      invoiceDate: form?.values?.invoiceDate,
                      poRate:data.data[0].PO_LINEITEM 
                      ? Number(data.data[0]?.PO_LINEITEM[i]?.RATE).toFixed(3) 
                      : Number(data.data[0]?.LINE_ITEM[i]?.RATE).toFixed(3),
                      freightAmount:data.data[0]?.LINE_ITEM[i]?.FREIGHT ? Number(data.data[0]?.LINE_ITEM[i]?.FREIGHT).toFixed(3) : data.data[0]?.PO_LINEITEM[i]?.FREIGHT ? Number(data.data[0]?.PO_LINEITEM[i]?.FREIGHT).toFixed(3) : 0,
                      line: data.data[0].LINE_ITEM ? data.data[0].LINE_ITEM[i].LINE : data.data[0].PO_LINEITEM[i].PO_LINEITEM,
                      material: data.data[0].LINE_ITEM ? data.data[0].LINE_ITEM[i].MATERIAL : data.data[0].PO_LINEITEM[i].MATERIAL,
                      description: data.data[0].PO_LINEITEM ? data.data[0].PO_LINEITEM[i].MATERIAL_DES : null,
                      plantCode: data.data[0].LINE_ITEM ? data.data[0].LINE_ITEM[i].PLANT : data.data[0].PO_LINEITEM[i].PLANT,
                      quantity: data.data[0].LINE_ITEM ? data.data[0].LINE_ITEM[i].QUANTITY : data.data[0].PO_LINEITEM[i].QUANTITY,
                      documentDate: data.data[0].DOCUMENT_DATE || data.data[0].PO_DATE,
                      vendorName: data.data[0].VENDOR_NAME,
                      vendorCode: data.data[0].VENDOR,
                      storageLocation: data.data[0].LINE_ITEM ? data.data[0].LINE_ITEM[i].STO_LOCATION : data.data[0].PO_LINEITEM[i].STORAGE_LOC,
                    }
                    purchaseOrderDetails.push(obj);
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
        errorToast("Something went wrong, please try again after sometime");
        })
    }

    const [poTypeData, setPoTypeData] = useState([])

    const getPoType = (poType) => {
        console.log(apiBaseUrl + `GatePro/Master/getPoType/${poType}`)
        apiGetMethod(apiBaseUrl + `GatePro/Master/getPoType/${poType}`)
        .then((response) => {
            const data = response.data;
            if (data.success == true) {
            setPoTypeData(data.results[0])
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
            errorToast("Something went wrong, please try again after sometime");
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
            errorToast("Something went wrong, please try again after sometime");
            })
        }
        const form = useFormik({
        isInitialValid: false,
        initialValues: {},
        validationSchema: Yup.object().shape({}),
        onSubmit(values) { },
        });

        function addMaterial(cell, INV_Rate,ORD_QTY,INV_BAG) {

        const newData = [];
        console.log(cell,INV_Rate,ORD_QTY,INV_BAG)

        purchaseOrderList.forEach((item, index) => {
            if (index == cell) {
            item['INV_Rate'] = INV_Rate
            item['ORD_QTY'] = ORD_QTY
            item['INV_BAG'] = INV_BAG
            item['InvoiceCost'] = ((INV_Rate == '' || INV_Rate == undefined || INV_BAG == '' || INV_BAG == undefined)? 0 : Number(INV_Rate*INV_BAG).toFixed(2))
            item['TotalCost'] = ((parseFloat((INV_Rate == '' || INV_Rate == undefined || INV_BAG == '' || INV_BAG == undefined)? 0 : Number(INV_Rate*INV_BAG)) + parseFloat(Number(item.freightAmount))).toFixed(2))
            item['BAG_RATE'] = (INV_BAG ? (  
                (parseFloat(
                INV_Rate === '' || INV_Rate === undefined || 
                INV_BAG === '' || INV_BAG === undefined
                    ? 0
                    : INV_Rate * INV_BAG
                ) + parseFloat(item?.freightAmount || 0)) /
                parseFloat(INV_BAG) // To avoid division by zero
                ).toFixed(2)  : 0)
            
            }
            newData.push(item)
        });

        // Calculate the total Qty
        // const totalQty = newData.reduce((sum, item) => sum + parseFloat(item.Qty || 0), 0).toFixed(3);

        // Calculate the total Rate
        // const totalRate = newData.reduce((sum, item) => sum + parseFloat(item.Rate || 0), 0).toFixed(2);

            // Calculate the total Rate
        // const totalAmount = newData.reduce((sum, item) => sum + parseFloat(item.TotalCost || 0), 0).toFixed(2);

        // Set the totals
        // setTotalQty(totalQty);
        // setTotalRate(totalRate);

        // Calculate the total amount using parsed values of totalQty and totalRate
        // setTotalAmount(totalAmount);
        
        // Update the material state
        // setMaterial(newData);
        setPurchaseOrderList(newData)
        }
        const [barcosedata, setbarcosedata] = useState('');
  
        const handleSubmit = async (event) => {
            event.preventDefault();
            if (!truckValue) {
              errorToast('Please enter a value to generate the barcode.');
              return;
            }
        
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            const barcodeSvg = document.getElementById('barcode');
            const svgData = new XMLSerializer().serializeToString(barcodeSvg);
            const img = new Image();
            img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
            img.onload = () => {
              context.drawImage(img, 0, 0);
        
              const dataURL = canvas.toDataURL('image/png');
              fetch(dataURL)
                .then(res => res.blob())
                .then(blob => {
                  const postdata = new FormData();
        
                  postdata.append('file[]', blob, `${truckValue}.png`);
                  postdata.append("form_name", 'Barcode');
                  postdata.append("SubFolder", "Barcode");
        
                  apiPostMethod(sapFileShare, postdata, "File")
                      .then(response => {
                        const { data } = response;
                    if (data.success) {
                      let gatePassDocument ;
                      gatePassDocument = data.files[0] ? data.files[0].updname : "";
                      setbarcosedata(gatePassDocument)
                      upload(gatePassDocument,truckValue);
                    } else {
                      errorToast('Failed to save barcode data.');
                    }
                  }).catch(error => {
                    console.error('Error saving barcode data:', error);
                    errorToast('An error occurred while saving barcode data.');
                  });
                });
            };
          };
          const upload = (gatePassDocument,truckValue) => {
            let formData = form.values;
    
            const fdata = {
               
                moduleStatusId: 5,
                remarks: formData.remarks,
                userInfoId: UserDetails.USERID,
            }
    
                let keys = Object.keys(attachedFiles).filter((k) => attachedFiles[k].name);
    
            if (keys.length > 0) {
                let postdata = new FormData();
                let { invoiceCopy } = postdata;
    
                postdata.append("image[]", invoiceCopy);
    
                let UploadFile = 0;
    
                Object.keys(attachedFiles).forEach((key) => {
                    postdata.append("file[]", attachedFiles[key]);
                });
    
                UploadFile = attachedFiles.invoiceCopy && attachedFiles.invoiceCopy.name && attachedFiles.invoiceCopy.name.length ? true : false;
    
                postdata.append("form_name", 'Payment');
                postdata.append("SubFolder", "FG_GateOut");
                showLoader();
                apiPostMethod(sapFileShare, postdata, "File")
                    .then((response) => {
                        const { data } = response;
                        if (data.success) {
                            let invoiceCopy = data.files[0] ? data.files[0].updname : "";
                            addLoadingUnloadingInfo(gatePassDocument,truckValue,invoiceCopy)
                        }
                    })
                    .catch((error) => {
                        errorToast("Something went wrong, please try again after sometime");
                    })
                    .finally((a) => {
                        hideLoader();
                    });
            }else{
              errorToast('Please upload Invoice Copy before proceeding');
            }
        };
        const addLoadingUnloadingInfo = (gatePassDocument,truckValue,invoiceCopy) => {
          
          const filteredData = purchaseOrderList.filter(item => item.BAG_RATE > 0);
        
          console.log(filteredData)
          const invalidItem = filteredData.find(item => ((parseFloat(item.INV_Rate)).toFixed(3)) != ((parseFloat(item.poRate).toFixed(3))));
          const invalidItem1 = filteredData.find(item => 
            parseFloat(item.quantity) < parseFloat(item.INV_BAG)
        );

        if (invalidItem) {
              errorToast(`Please check invoice rate`);
              return;
          }
          else if(invalidItem1){
              errorToast(`Please check order qty`);
              return;
          }
        // //   else if(invalidItem2){
        //     errorToast(`Please check order qty`);
        //     return;
        //   }
            let formData = form.values;
          const updatedFilteredData = filteredData.map(item => ({
              ...item,
              invoiceCopy: invoiceCopy || ''
            }));
            const FrmData = {
              movementTypeId: 2,
              moduleTypeId: moduleTypeId,
              truckNo: truckValue ,
              masterPlantId: purchaseOrderList[0].plantCode,
              remarks: remarks,
              phoneNo: tripSheetData != '' ? tripSheetData?.DRIVER_PHONE_NO : phoneNo,
              tripSheetNo: tripSheetData != '' ? tripSheetData?.TRIPSHEET_NO : '',
              statusId: screen == 'loadingUnloadingInfo' ? 0 : 1,
              userInfoId: UserDetails.USERID,
              isWeight: 1,
              purchaseOrderDetails: updatedFilteredData,
              gatePassDocument:gatePassDocument||barcosedata
            };
            
            if(FrmData?.purchaseOrderDetails?.length == 0 ){
                let message = 'Please Check Invoice Details'
                confirmDialog({
                title: `<h5><strong class="text-white">` + message + `</strong></h5>`, cancelButton: false, confirmText: false, confirmButton: false, background: `#BD362F`
                })
                return
            }
            console.log(apiBaseUrl + "GatePro/Master/addLoadingUnloadingInfo", FrmData)
            apiPostMethod(apiBaseUrl + "GatePro/Master/addLoadingUnloadingInfo", FrmData)
              .then((response) => {
                const { data } = response;
                if (data.success == true) {
                  getUnLoadingData()
                  if (screen == 'loadingUnloadingInfo') {
                    ShowToast(data.message)
                    reset()
                    loadingUnloadingReset()
                  }
                }
                else if (data.success == false) {
                  errorToast(data.message);
                }
              })
              .catch((error) => {
                console.log(JSON.stringify(error))
                errorToast("Something went wrong, please try again after sometime");
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
            setPoTypeData([])
            setPlantName('')
            setPoType('')
          }
          const [attachedFiles, setAttachment] = useState({ invoiceCopy: {} });

          const handleFileChange = (file, id) => {
              setAttachment({
                  ...attachedFiles,
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
                            <BarcodeScanner onScan={handleScan} Label={'PO'}/>
                            {/* <QRCodeScanner /> */}
                            <InputGroup>
                            <Input type="text" name="PO Number" id="poNumber" placeholder="PO Number" onChange={(e) => setPoNo(e.target.value)} value={poNo} disabled={(moduleTypeId == 14) || (poType == 'show') ? true : false} />
                                <Button size="sm" color="success" style={{ height: '38px', width: '50px' }} onClick={() => { getPoDetails('list'); setPoType('show') }}>
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
                        max={minDate}
                        onKeyDown={(e) => {
                        e.preventDefault()
                        }}
                    />
                </Col> : null }
                {isInvoice  && poTypeData != '' ? 
                <Col sm="4" md="4">
                    <label></label>
                    <FormGroup className="d-flex justify-content-start mb-0">
                        <div className="mr-1">
                            <div style={{ marginBottom: "7px" }}></div>
                            <Label><b>Attachments :</b></Label>
                        </div>
                        <div className="mr-1">
                            <Uploader
                                setAttachment={handleFileChange}
                                title="Invoice Copy"
                                id={"invoiceCopy"}
                                selectedFileName={attachedFiles.invoiceCopy.name}
                            />
                        </div>
                    </FormGroup>
                </Col>: null }        
                {poTypeData != '' && poType == 'show' && moduleTypeId != 14 ? <>
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

                {poTypeData != '' && poDetails != '' && poType == 'show' && moduleTypeId != 14 ? <>
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
                {IsDisableForPo &&
                <Card>
                <CardBody>
                        <label></label>
                        <div style={{ width: '100%', overflowX: 'auto' }}>
                        <table className="table table-bordered" style={{ width: '100%', minWidth: '800px', textAlign: 'left' }}>
                            <thead >
                                <tr>
                                    <th className="bg-primary text-white" width='5%'>PO NO</th>
                                    <th className="bg-primary text-white" width='5%'>Material</th>
                                    {isInvoice ? <th className="bg-primary text-white" width='5%'>Inv No</th> : null}
                                    <th className="bg-primary text-white" width='5%'>Inv Date</th>
                                    <th className="bg-primary text-white" width='5%'>Rate</th>
                                    <th className="bg-primary text-white" width='5%'>Invoice Rate</th>
                                    <th className="bg-primary text-white" width='5%'>Ord QTY</th>
                                    <th className="bg-primary text-white" width='5%'>Inv QTY(Kgs)</th>
                                    <th className="bg-primary text-white" width='5%'>No.Bags</th>
                                    <th className="bg-primary text-white" width='5%'>Fre Amount</th>
                                    <th className="bg-primary text-white" width='5%'>Inv Value</th>
                                    <th className="bg-primary text-white" width='5%'>Total Value</th>
                                    <th className="bg-primary text-white" width='5%'>Rate Per Bag</th>
                                    {/* <th className="bg-primary text-white" width='5%'>From Plant</th> */}
                                    {/* {moduleTypeId == 6 || moduleTypeId == 20 || moduleTypeId == 13 || moduleTypeId == 14 ? <th className="bg-primary text-white" width='5%'>To Plant</th> : <th className="bg-primary text-white" width='20%'>Vendor Name</th>} */}
                                    <th className="bg-primary text-white" width='2%'>Remove</th>
                                </tr>
                            </thead>
                            {purchaseOrderList?.map((poDetailsData,index) => (
                                <tbody key={index}>
                                    <tr>
                                        <td>{poDetailsData?.poNumber}</td>
                                        <td>{poDetailsData?.description}</td>
                                        {isInvoice ? <td>{poDetailsData?.invoiceNo}</td> : null}
                                        <td>{poDetailsData?.invoiceDate}</td>
                                        <td>{poDetailsData?.poRate}</td>
                                        <td style={{ width: "10%", padding: "0.5rem" }}>
                                        <Input 
                                        type="text" 
                                        placeholder="INV_Rate" 
                                        onChange={(e) => addMaterial(index, e.target.value, poDetailsData?.ORD_QTY , poDetailsData?.INV_BAG)}
                                        />
                                        </td>
                                        <td>{poDetailsData?.quantity}</td>
                                        <td style={{ width: "10%", padding: "0.5rem" }}>
                                        <Input 
                                        type="text" 
                                        placeholder="ORD_QTY" 
                                        onChange={(e) => addMaterial(index, poDetailsData?.INV_Rate ,e.target.value, poDetailsData?.INV_BAG)}
                                        />
                                        </td>
                                        <td style={{ width: "10%", padding: "0.5rem" }}>
                                        <Input 
                                        type="text" 
                                        placeholder="INV_BAG" 
                                        onChange={(e) => addMaterial(index, poDetailsData?.INV_Rate, poDetailsData?.ORD_QTY ,e.target.value)}
                                        />
                                        </td>
                                        <td>{poDetailsData?.freightAmount}</td>

                                        <td>{((poDetailsData?.INV_Rate == '' || poDetailsData?.INV_Rate == undefined || poDetailsData?.INV_BAG == '' || poDetailsData?.INV_BAG == undefined)? 0 : Number(poDetailsData?.INV_Rate*poDetailsData?.INV_BAG).toFixed(2))}</td>

                                        <td>{(parseFloat((poDetailsData?.INV_Rate == '' || poDetailsData?.INV_Rate == undefined || poDetailsData?.INV_BAG == '' || poDetailsData?.INV_BAG == undefined)? 0 : Number(poDetailsData?.INV_Rate*poDetailsData?.INV_BAG)) + parseFloat(Number(poDetailsData.freightAmount))).toFixed(2)}</td>

                                        <td>{poDetailsData?.INV_BAG ? (  
                                                (parseFloat(
                                                poDetailsData?.INV_Rate === '' || poDetailsData?.INV_Rate === undefined || 
                                                poDetailsData?.INV_BAG === '' || poDetailsData?.INV_BAG === undefined
                                                    ? 0
                                                    : poDetailsData?.INV_Rate * poDetailsData?.INV_BAG
                                                ) + parseFloat(poDetailsData?.freightAmount || 0)) /
                                                parseFloat(poDetailsData?.INV_BAG) // To avoid division by zero
                                            ).toFixed(2)  : 0}
                                        </td>
                                        {/* {moduleTypeId == 6 || moduleTypeId == 20 || moduleTypeId == 13 || moduleTypeId == 14 ?
                                            <td>{poDetailsData?.toPlantCode}</td> : <td>{poDetailsData?.vendorName}</td>} */}
                                        <td className="text-center"><X size={16} onClick={() => handleremove(poDetailsData?.poNumber)} /></td>
                                    </tr>
                                </tbody>
                            ))}
                        </table>
                        </div>
                    </CardBody>
                    </Card>}

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
                    <FormGroup className="d-flex justify-content-end mb-0">
                      <Button.Ripple color="primary" type="button" onClick={ handleSubmit}>
                        <Check size={16} /> Submit
                      </Button.Ripple>
                    </FormGroup>
                  </Col>
                </> : null
                }
        </>
    )
}

export default PurchaseMaterial