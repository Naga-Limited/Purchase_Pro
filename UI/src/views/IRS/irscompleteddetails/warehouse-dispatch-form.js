import { Card, CardBody, FormGroup, Row, Col, Button } from "reactstrap";
import { apiPostMethod } from "@helpers/axiosHelper";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router";
import { Link, useHistory } from "react-router-dom";
import { uploadUrl, uaUrl, apiBaseUrl,irsUrl, sapFileShare } from "../../../urlConstants";
import { errorToast } from "@helpers/appHelper";
// import { useDispatch } from "react-redux";
import { PoDetails } from "./po-detail-form";
import Uploader from "../../Uploader";
import { DispatchInfoForm } from "./dispatch-info-form";
import { roundOf } from "../../../helper/appHelper";
import { CustomUploader, validation, Yup } from "../../forms/custom-form";
import { useFormik } from "formik";
import { getNewId } from "../../../utility/Common";
import { useLoader } from "../../../utility/hooks/useLoader";
import { PageHeaderText } from "../../common/PageHeaderText";

const WarehouseDispatchForm = () => {
  const [formData, setFormaData] = useState({});
  const history = useHistory();
  const { showLoader, hideLoader } = useLoader();
  let { id, showTruck } = useParams();
  let refid = id.replace(":", "");
  const buildRequiredForFumigation = () => {
    return {
      is: (value) => {
        return value && value.label === "Yes";
      },
      then: Yup.string().required("Required"),
    };
  };
  useEffect(() => {
    if (id) {
      getYardDispDetails();
    }
  }, [id]);

  const getYardDispDetails = () => {
   // alert(refid);
    let fdata = {
      id: refid,
      formType: "getIRSDetailsForView",
    };
    showLoader();
   // alert("ok")
   // return false;
    apiPostMethod(`${irsUrl}`, fdata)
      .then((response) => {
        const { data } = response;
        console.log(JSON.stringify(response));
        if (data.success) {
          /*form.setValues({
            EadId:data.results[0].id,
            Ead:data.results[0].EAD,
            date:data.results[0].date,
         
          })
          form.setFieldValue("FromLocation", {  label: data.results[0].From_Location,value: data.results[0].From_Location });
          form.setFieldValue("ToLocation", {  label: data.results[0].To_Location,value: data.results[0].To_Location });
          form.setFieldValue("ModeofTransport", {  label: data.results[0].Mode_Of_Transport,value: data.results[0].Mode_Of_Transport });
          */
         
          form.setValues({
            PlantName:data.VehDetails[0].PLANT_NAME,
            TrailorNumber:data.VehDetails[0].TRAILER_NO,
            ContainerNumber:data.VehDetails[0].CONTAINER_NO,

            invoiceNo:data.results[0].SaleInvoiceNumber,
            selection:data.results[0].LoadingType,

            supplierName:data.results[0].SupplierName,
           
            trailerNo:data.VehDetails[0].TRAILER_NO,
            driverNo:data.VehDetails[0].DRIVER_NO,
            containerNo:data.VehDetails[0].CONTAINER_NO,
            containerType:data.VehDetails[0].CONTAINER_TYPE,
            stuffingRate:data.results[0].StuffingRate,
            yardToPortRate:data.results[0].YardToPortRate,
            fumigation:data.results[0].Fumigation,
            linerName:data.results[0].LinerName,
            linerOceanFrt:data.results[0].LinerOceanFrt,
            wbName:data.VehDetails[0].WB_NAME,
            wbSerialNo:data.VehDetails[0].WB_SERIAL_NO,
            wbEmptyWt:data.VehDetails[0].WB_EMPTY_WT,
            wbLoadWt:data.results[0].WbLoadWt,
            wbNetWt:data.results[0].WbNetWt,
            gunnyLessNetWt:data.results[0].GunnyLessNetWt,
            LDate:data.results[0].LDate,
            serialNo:data.results[0].SerialNo,
            eWayBillCopy:data.results[0].EWayBillCopy,
            saleInvoiceCopy:data.results[0].SaleInvoiceCopy,
            nagaWbCopy:data.results[0].NagaWbCopy,
            customDocumentCopy:data.results[0].CustomDocumentCopy,

            portOfLoading:data.results[0].PortOfLoading,
            stuffingVendor:data.results[0].StuffingVendor,
            yarToPortFrtVendor:data.results[0].YarToPortFrtVendor,
            totalBags_1:data.results[0].TotalBags,
           })
           
         // form.setFieldValue("invoiceNo", {  label: data.results[0].SaleInvoiceNumber,value: data.results[0].SaleInvoiceNumber });
        //  form.setFieldValue("selection", {  label: data.results[0].LoadingType,value: data.results[0].LoadingType });
        //  form.setFieldValue("portOfLoading", {  label: data.results[0].PortOfLoading,value: data.results[0].PortOfLoading });
        //  form.setFieldValue("stuffingVendor", {  label: data.results[0].StuffingVendor,value: data.results[0].StuffingVendor });
        //  form.setFieldValue("yarToPortFrtVendor", {  label: data.results[0].YarToPortFrtVendor,value: data.results[0].YarToPortFrtVendor });
          
          form.setFieldValue("truckList", data.TruckList);
          form.setFieldValue("poList", data.DispatchLineItems);
         
         

          
        }
      })
      .catch((error) => {
        console.log(error);
        errorToast("Something went wrong, please try again after sometime");
      })
      .finally((a) => {
        hideLoader();
        
      });
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
      portOfLoading: validation.required(),
      stuffingVendor: validation.required(),
      stuffingRate: validation.required(),
      yarToPortFrtVendor: validation.required(),
      yardToPortRate: validation.required(),
      fumigation: validation.required({ isObject: true }),
      fumigationVendorName: Yup.string().when("fumigation", buildRequiredForFumigation()),
      fumigationRatePerC: Yup.string().when("fumigation", buildRequiredForFumigation()),
      linerName: validation.required(),
      wbLoadWt: validation.required(),
      linerOceanFrt: validation.required(),
      loadingDate: validation.required(),
      serialNo: validation.required(),
      saleInvoiceCopy: validation.required(),
      eWayBillCopy: validation.required(),
      nagaWbCopy: validation.required(),

      invoiceNo: validation.required(),
      supplierName: validation.required(),
      selection: validation.required({ isObject: true }),
      totalBags: validation.required(),
      poList: Yup.array().of(
        Yup.object({
          packedType: validation.required(),
          noOfBags: validation.required(),
          bagType: validation.required(),
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
    return false;
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
    if (!form.isValid) {
      form.setSubmitting(true);
      form.validateForm();
      return;
    }
    let postdata = new FormData();
    let fileKeys = ["eWayBillCopy", "nagaWbCopy", "saleInvoiceCopy"];
    if (form.values.customDocumentCopy) {
      fileKeys.push("customDocumentCopy");
    }
    fileKeys.forEach((f) => {
      postdata.append("file[]", form.values[f]);
    });
    postdata.append("form_name", "OY_PO");
    postdata.append("ponumber", refid);
    postdata.append("VA_Number", form.values.zvaNumber);
    postdata.append("SubFolder","LoadingContainerOrg");
    showLoader();
    apiPostMethod(sapFileShare, postdata, "File")
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
 // alert("values"+JSON.stringify(values))
  //alert("form"+JSON.stringify(form))
  //const {eWayBillCopy,saleInvoiceCopy,nagaWbCopy,customDocumentCopy} =values;
  const eWayBillCopy=values.eWayBillCopy ? values.eWayBillCopy : "";
  const saleInvoiceCopy=values.saleInvoiceCopy ? values.saleInvoiceCopy : "";
  const nagaWbCopy=values.nagaWbCopy ? values.nagaWbCopy : "";
  const customDocumentCopy=values.customDocumentCopy ? values.customDocumentCopy : "";
  return (
    <div>
      <PageHeaderText title={`IRS VIEW`} id={values.zvaNumber} />
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
                
                <Uploader isReadOnly={true} label={"E Way Bill"} selectedFileName={eWayBillCopy} />
              </Col>
              <Col md="4" sm="12">
               
                <Uploader isReadOnly={true} label={"Sale Invoice Copy"} selectedFileName={saleInvoiceCopy} />
              </Col>
              <Col md="4" sm="12">
                <Uploader isReadOnly={true} label={"Naga Origin WB Copy (Optional)"} selectedFileName={nagaWbCopy} />
              </Col>
              <Col md="4" sm="12">
                <Uploader isReadOnly={true} label={"Custom Documents Copy (Optional)"} selectedFileName={customDocumentCopy} />
              </Col>
              <Col sm="12" className="mt-2">
                <FormGroup className="d-flex mb-0 justify-content-end">
                  <Button.Ripple outline color="secondary" tag={Link} to={`/IRSView`} type="reset" className="mr-2">
                    Cancel
                  </Button.Ripple>
                  
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
