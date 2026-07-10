import { Card, CardBody, FormGroup, Row, Col, Button } from "reactstrap";
import { apiPostMethod } from "@helpers/axiosHelper";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router";
import { Link, useHistory } from "react-router-dom";
import { uploadUrl, uaUrl, apiBaseUrl,SaveCaptureImage } from "../../../urlConstants";
import { errorToast } from "@helpers/appHelper";
// import { useDispatch } from "react-redux";
import { PoDetails } from "./po-detail-form";
import { DispatchInfoForm } from "./dispatch-info-form";
import { roundOf } from "../../../helper/appHelper";
import { CustomUploader, validation, Yup } from "../../forms/custom-form";
import { useFormik } from "formik";
import { getNewId } from "../../../utility/Common";
import { useLoader } from "../../../utility/hooks/useLoader";
import { PageHeaderText } from "../../common/PageHeaderText";
import CaptureImage from "../../CaptureImage";
const WarehouseDispatchForm = () => {
  const [formData, setFormaData] = useState({});
  const history = useHistory();
  const [ImgData, setImgData] = useState({});
  const { showLoader, hideLoader } = useLoader();
  let { id, showTruck } = useParams();
  let refid = id.replace(":", "");
  const buildRequiredForFumigation = () => {
    return {
      is: (value) => {
        return value && value.label === "Yes";
      },
      //Mohan Commented on 07112022 for Dropdown mandatory check then: Yup.string().required("Required"),
      then: validation.required({ isObject: true }),
    };
  };
  const buildRequiredForFumigationRate = () => {
    return {
      is: (value) => {
        return value && value.label === "Yes";
      },
      then: Yup.string().required("Required"),
    };
  };
  const form = useFormik({
    isInitialValid: false,
    initialValues: {
      ...formData,
      truckList: [
        {
          id: getNewId(),
          truckNumber: "",
          noOfBags: "",
          lotNumber: "",
          warehouseName: "",
        },
      ],
      poList: [],
    },
    validationSchema: Yup.object().shape({
      portOfLoading: validation.required({ isObject: true }),
      stuffingVendor: validation.required({ isObject: true }),
      stuffingRate: validation.required(),
      yarToPortFrtVendor: validation.required({ isObject: true }),
      yardToPortRate: validation.required(),
      fumigation: validation.required({ isObject: true }),
      fumigationVendorName: Yup.object().when("fumigation", buildRequiredForFumigation()),
      fumigationRatePerC: Yup.string().when("fumigation", buildRequiredForFumigationRate()),
      linerName: validation.required({ isObject: true }),
      wbLoadWt: validation.required(),
      linerOceanFrt: validation.required(),
      loadingDate: validation.required(),
      serialNo: validation.required(),
      saleInvoiceCopy: validation.required(),
      eWayBillCopy: validation.required(),
      nagaWbCopy: validation.required(),

      invoiceNo: validation.required({ isObject: true }),
      supplierName: validation.required(),
      selection: validation.required({ isObject: true }),
      totalBags: validation.required(),
      poList: Yup.array().of(
        Yup.object({
          packedType: validation.required({ isObject: true }),
          noOfBags: validation.required(),
          bagType: validation.required({ isObject: true }),
        })
      ),
      truckList: Yup.array().when("selection", {
        is: (sel) => {
          return sel && sel.label === "Crossing";
        },
        then: Yup.array().of(
          Yup.object({
            noOfBags: validation.required(),
            truckNumber: validation.required(),
          })
        ),
        otherwise: Yup.array().of(
          Yup.object({
            noOfBags: validation.required(),
            lotNumber: validation.required(),
            warehouseName: validation.required({ isObject: true }),
          })
        ),
      }),
    }),
    onSubmit(values) {},
  });
  const values = form.values;

  const onFetchPodetailsById = () => {
    showLoader();
    apiPostMethod(`${apiBaseUrl}emptyVehicleArrival/getById?id=${refid}`)
      .then((response) => {
        const { data } = response;
        if (data.success) {
          const podata = data.results;
          form.setValues({
            ...form.values,
            ...formData,
            ...podata,
          });
          setFormaData({
            ...formData,
            ...podata,
          });
        }
      })
      .catch((error) => {
        errorToast(error);
      })
      .finally(() => hideLoader());
  };

  const onGateOutDetails = (status) => {
    if(status==11){
      let dataToPost = {
       
        id: refid,
        formType: "AddWhDispatch",
        vehicleStatus: status,
      };
      apiPostMethod(uaUrl, dataToPost)
      .then((response) => {
        const { data } = response;
        if (data.success) {
          history.push(`/EVAOY`);
        }
      })
      .catch((error) => {
        errorToast("Something went wrong, please try again after sometime");
      })
      .finally(() => hideLoader());
    }
    else{
    if (!form.isValid) {
      form.setSubmitting(true);
      form.validateForm();
      return;
    }
    let postdata = new FormData();
    let fileKeys = ["eWayBillCopy", "nagaWbCopy", "saleInvoiceCopy"];
    let FolderNames = ["Eway_Bill", "Naga_Origin_WB", "Sale_Invoice"];

    if (form.values.customDocumentCopy) {
      fileKeys.push("customDocumentCopy");
      FolderNames.push("Custom_Documents");
    }

    //let {eWayBillCopy_c,saleInvoiceCopy_c,nagaWbCopy_C,customDocumentCopy_C} = ImgData;
    let fileKeys_c = ["eWayBillCopy_c", "saleInvoiceCopy_c", "nagaWbCopy_C"];
    let FileSaveUrl="";
    if (ImgData.customDocumentCopy_C) {
      fileKeys_c.push("customDocumentCopy_C");
    }
    if(ImgData.eWayBillCopy_c!=null){
      fileKeys_c.forEach((f) => {
        postdata.append("image[]", ImgData.fileKeys_c[f]);
      });
     
      FileSaveUrl=SaveCaptureImage;
    }else{
      fileKeys.forEach((f) => {
        postdata.append("file[]", form.values[f]);
      });
      FileSaveUrl=uploadUrl;
    }
   

   
    //postdata.append("form_name", "OY_PO");
    postdata.append("form_name", "IRS");
    postdata.append("ponumber", refid);
    postdata.append("VA_Number", form.values.zvaNumber);
    postdata.append("SubFolder","LoadingContainerOrg");
    showLoader();
    apiPostMethod(FileSaveUrl, postdata, "File")
      .then((response) => {
        const { data } = response;
        if (data.success) {
          let files = {};
          data.files.forEach((item) => {
            fileKeys.forEach((k, i) => {
              if (item.orgname === form.values[k].name) {
                files[k] = item.updname;
              }
            });
          });

          let lineItems = values.poList.map((a, i) => ({
            PoNumber: a.poNumber,
            LineItem: a.poLineItem,
            MaterialNo: a.materialNo,
            WheatVariety: a.wheatVariety,
            DeliveryNo: a.deliveryNo,
            DeliveryQty: a.deliveryQuantity,
            SisterConcernFrom: a.sisterConcernFrom,
            SisterConcernTo: a.sisterConcernTo,
            SendingStorageLocation: a.sendingStorageLocation,
            ReceivingStorageLocation: a.receivingStorageLocation,
            PackedType: a.packedType.label,
            BagType: a.bagType.label,
            NoOfBags: a.noOfBags,
            GunnyWt: a.gunnyWt || "",
            SalesInvoice: values.invoiceNo.value,
          }));

          let truckList = values.truckList.map((a, i) => ({
            TruckNumber: a.truckNumber,
            WarehouseName: a.warehouseName ? a.warehouseName.label : "",
            LotNumber: a.lotNumber,
            NoOfBags: a.noOfBags,
          }));
          let dispatchInfo = {
            TruckNo: values.truckNo,
            PortOfLoading: values.portOfLoading.value,
            WbLoadWt: values.wbLoadWt,
            WbNetWt: values.wbNetWt,
            GunnyLessNetWt: values.gunnyLessNetWt,
            StuffingRate: values.stuffingRate,
            YardToPortRate: values.yardToPortRate,
            LinerName: values.linerName.value,
            Fumigation: values.fumigation.value,
            LinerOceanFrt: values.linerOceanFrt,
            SerialNo: values.serialNo,
            LoadingDate: values.loadingDate,
            ArrivalId: refid,
            SupplierName: values.supplierName,
            LoadingType: values.selection.label,
            TotalBags: values.totalBags,
            
            SaleInvoiceNumber: values.invoiceNo.value,
            YarToPortFrtVendor:values.yarToPortFrtVendor.label,
            StuffingVendor:values.stuffingVendor.label,
            ...files,
          };
          if (values.fumigation.value === "Yes") {
            dispatchInfo.FumigationVendorName = values.fumigationVendorName.value;
            dispatchInfo.FumigationRatePerC = values.fumigationRatePerC;
          }

          let dataToPost = {
            dispatchInfo: dispatchInfo,
            lineItems: lineItems,
            truckList: truckList,
            id: refid,
            formType: "AddWhDispatch",
            vehicleStatus: status,
          };
          apiPostMethod(uaUrl, dataToPost)
            .then((response) => {
              const { data } = response;
              if (data.success) {
                history.push(`/EVAOY`);
              }
            })
            .catch((error) => {
              errorToast("Something went wrong, please try again after sometime");
            })
            .finally(() => hideLoader());
        }
      })
      .catch((error) => {
        errorToast("Something went wrong, please try again after sometime");
        hideLoader();
      });
    }
  };

  useEffect(() => {
    onFetchPodetailsById();
  }, []);

  useEffect(() => {
    if (values.poList) {
      form.setFieldValue(
        "gunnyWt",
        roundOf(values.poList.map((dt) => Number(dt.gunnyWt || 0)).reduce((accumVariable, curValue) => accumVariable + curValue, 0))
      );
    }
  }, [values.poList]);

  return (
    <div>
      <PageHeaderText title={`Yard/WH Dispatch info`} id={values.zvaNumber} />
      <PoDetails form={form} />
      <DispatchInfoForm showTruck={showTruck} form={form} />
      <Card>
        <CardBody>
          <div>
            <Row>
              <Col md="12" sm="12">
                <h5>Attachments</h5>
              </Col>
            </Row>
            <Row>
              <Col md="4" sm="12">
                <CustomUploader form={form} label={"E Way Bill"} id={"eWayBillCopy"} />
                {/*<CaptureImage ImgData={ImgData} setImgData={setImgData} ItemName={"eWayBillCopy_c"} />*/}
              </Col>
              <Col md="4" sm="12">
                <CustomUploader form={form} label={"Sale Invoice Copy"} id={"saleInvoiceCopy"} />
                {/*<CaptureImage ImgData={ImgData} setImgData={setImgData} ItemName={"saleInvoiceCopy_c"} />*/}
              </Col>
              <Col md="4" sm="12">
                <CustomUploader form={form} label={"Naga Origin WB Copy (Optional)"} id={"nagaWbCopy"} />
                {/*<CaptureImage ImgData={ImgData} setImgData={setImgData} ItemName={"nagaWbCopy_C"} />*/}
              </Col>
              <Col md="4" sm="12">
                <CustomUploader form={form} label={"Custom Documents Copy (Optional)"} id={"customDocumentCopy"} />
                {/*<CaptureImage ImgData={ImgData} setImgData={setImgData} ItemName={"customDocumentCopy_C"} />*/}
              </Col>
              <Col sm="12" className="mt-2">
                <FormGroup className="d-flex mb-0 justify-content-end">
                <Button.Ripple color="primary" type="button" onClick={(e) => onGateOutDetails(11)}>
                     Reject
                    </Button.Ripple>
&nbsp;
                  <Button.Ripple outline color="secondary" tag={Link} to={`/EVAOY`} type="reset" className="mr-2">
                    Cancel
                  </Button.Ripple>
                  <div className="mr-1">
                    <Button.Ripple color="primary" type="button" onClick={(e) => onGateOutDetails(9)}>
                      Gate Out
                    </Button.Ripple>
                  </div>
                </FormGroup>
              </Col>
            </Row>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default WarehouseDispatchForm;
