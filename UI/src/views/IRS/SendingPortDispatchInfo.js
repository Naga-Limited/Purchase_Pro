import { Card, CardBody, FormGroup, Row, Col, Button } from "reactstrap";
import React, { useEffect, useRef,useState } from "react";
import { ContainerDetails } from "./ContainerInfo";
import { apiPostMethod } from "@helpers/axiosHelper";
import { errorToast } from "@helpers/appHelper";
import { irsUrl, masterUrl, uploadUrl,SaveCaptureImage, sapFileShare } from "../../urlConstants";
import { useHistory, useParams } from "react-router";
import uniq from "lodash/uniq";
import { Link } from "react-router-dom";
import { useFormik } from "formik";
import { CustomDropdownInput, CustomTextInput, CustomUploader, validation, Yup } from "../forms/custom-form";
import { useLoader } from "../../utility/hooks/useLoader";
import { addFileName, addOption } from "../common/Utils";
import moment from "moment";
import CaptureImage from "../CaptureImage";
let SendingPortDispatchInfo = () => {
  let { showLoader, hideLoader } = useLoader();
  const dateFormat = "YYYY-MM-DD";
  const [ImgData, setImgData] = useState({});
  const today = moment().format(dateFormat);
  const history = useHistory();
  let { id, fromPage, mode } = useParams();
  let refid = "";
  let isEdit = mode === "Edit";
  let isApprove = mode === "Approve";

  let isViewOnly = !!id && !isEdit;

  let selectedContainers = useRef();

  let disableFields = isViewOnly || isEdit || isApprove;
  useEffect(() => {
    if (id) {
      let fdata = { id: id, formType: "GetEntriesAtPortById" };
      showLoader();
      apiPostMethod(irsUrl, fdata)
        .then((response) => {
          const { data } = response;
          if (data.success) {
            let { details: d, container } = data.results;

            let containerNumbers = uniq(container.map((a) => a.containerNo));
            selectedContainers.current = containerNumbers.map((p) => ({ label: p, value: p }));
            formik.setValues({
              ...formik.values,
              containers: selectedContainers.current,
              noOfContainers: containerNumbers.length,
              poDetails: container,
              isApproved: d.isApproved,
              sisterConcernTo: d.sisterConcernTo,
              portOfLoading: addOption(d.portOfLoading), //{ label: d.portOfLoading, value: d.portOfLoading },
              sisterConcernFrom: d.sisterConcernFrom,
              vesselDispatchDate: d.vesselDispatchDate ? d.vesselDispatchDate.split(" ")[0] : "",
              portOfDischarge: addOption(d.portOfDischarge), // { label: d.portOfDischarge, value: d.portOfDischarge },
              linerName: d.linerName,
              vesselName: addOption(d.vesselName), // { label: d.vesselName, value: d.vesselName },
              vesselNo: d.vesselNo,
              eda: d.eda,
              customDocumentCopy: addFileName(d.customDocumentCopy), // { name: d.customDocumentCopy },
            });
          }
        })
        .catch((error) => {
          errorToast("Something went wrong, please try again after sometime");
        })
        .finally(() => hideLoader());
    }
  }, [id]);

  const onApprove = () => {
    let fdata = { formType: "UpdateDispatchStatus", id: id };
    showLoader();
    apiPostMethod(irsUrl, fdata)
      .then((response) => {
        const { data } = response;
        if (data.success) {
          history.push(`/IASRPR`);
        }
      })
      .catch((error) => {
        errorToast("Something went wrong, please try again after sometime");
      })
      .finally(() => hideLoader());
  };
  const goBack = () => {
    history.push(fromPage ? `/${fromPage}` : `/IASRPR`);
  };
  const updateContainerList = () => {
    if (!formik.isValid) {
      formik.setSubmitting(true);
      formik.validateForm();
      return;
    }
    showLoader();
    let values = formik.values;
    if (id) {
      let fdata = {
        formType: "UpdatePortDispatchInfo",
        containerDetails: values.poDetails.map((po) => ({
          ContainerNo: po.containerNo,
          VehicleArrivalId: po.vehilceArraivalId,
          PoNumber: po.poNumber,
          InvoiceQuantity: po.invoiceQuantity,
          WheatVariety: po.wheatVariety,
          LoadingDate: po.loadingDate,
          StoDeliveryNo: po.deliveryNo,
          InterCoSaleInvNo: po.saleInvoiceNumber,
        })),
        id: id,
      };
      apiPostMethod(irsUrl, fdata)
        .then((response) => {
          const { data } = response;
          if (data.success) {
            goBack();
          } else if (data.error) {
            errorToast(data.error);
          }
        })
        .catch((error) => {
          errorToast("Something went wrong, please try again after sometime");
        })
        .finally(() => hideLoader());
    } else {
      if (values.customDocumentCopy) {
        let postdata = new FormData();
        let FileSaveUrl="";
        let {CustomDocuments_C} = ImgData;
        if(CustomDocuments_C!=null ){
          postdata.append("image[]", CustomDocuments_C);
        
          FileSaveUrl=SaveCaptureImage;
        }else{

        postdata.append("file[]", values.customDocumentCopy);
        FileSaveUrl=sapFileShare;
        }
        //postdata.append("form_name", "OY_PO");
        postdata.append("form_name", "IRS");
        postdata.append("ponumber", refid);
        postdata.append("VA_Number", "");
        postdata.append("SubFolder","PortDispatch");
      //  postdata.append("ponumber", refid);
      
        apiPostMethod(sapFileShare, postdata, "File")
          .then((response) => {
            const { data } = response;
            if (data.success) {
              insertData(data.files[0].updname);
            }
          })
          .catch((error) => {
            errorToast("Something went wrong, please try again after sometime");
          })
          .finally(() => hideLoader());
      } else {
        insertData("");
      }
    }
  };

  const insertData = (attachment) => {
    let fdata = { formType: "AddPortDispatchInfo", fieldsToAdd: {}, id: id };
    fdata.containerDetails = values.poDetails.map((po) => ({
      ContainerNo: po.containerNo,
      VehicleArrivalId: po.vehilceArraivalId,
      PoNumber: po.poNumber,
      InvoiceQuantity: po.invoiceQuantity,
      WheatVariety: po.wheatVariety,
      LoadingDate: po.loadingDate,
      StoDeliveryNo: po.deliveryNo,
      InterCoSaleInvNo: po.saleInvoiceNumber,
    }));
    let ftu = {
      VesselName: values.vesselName.label,
      VesselNo: values.vesselNo,
      SisterConcernFrom: values.sisterConcernFrom,
      SisterConcernTo: values.sisterConcernTo,
      PortOfLoading: values.portOfLoading.label,
      PortOfDischarge: values.portOfDischarge.label,
      LinerName: values.linerName,
      LoadingDate: values.loadingDate,
      Eda: values.eda,
      VesselDispatchDate: values.vesselDispatchDate,
      customDocumentCopy: attachment,
    };
    fdata = { ...fdata, fieldsToAdd: { ...fdata.fieldsToAdd, ...ftu } };
    apiPostMethod(irsUrl, fdata)
      .then((response) => {
        const { data } = response;
        if (data.success) {
          goBack();
        }
      })
      .catch((error) => {
        errorToast("Something went wrong, please try again after sometime");
      })
      .finally(() => hideLoader());
  };

  const formik = useFormik({
    isInitialValid: false,
    initialValues: {},
    validationSchema: Yup.object().shape({
      vesselName: validation.required({isObject: true}),
      vesselNo: validation.required(),
      portOfLoading: validation.required({isObject: true}),
      portOfDischarge: validation.required({isObject: true}),
      vesselDispatchDate: validation.required(),
      eda: validation.required(),
      containers: Yup.array().required().min(1),
      poDetails: Yup.array().required().min(1),
    }),
    onSubmit(values) {},
  });

  let values = formik.values;
  return (
    <div>
      <div>
        <Card>
          <CardBody>
            <Row>
              <Col md="12" sm="12">
                <h5>{isViewOnly ? "Port Receipt" : "Port Dispatch"}</h5>
              </Col>
            </Row>
            <Row>
              <Col md="4" sm="12">
                <CustomDropdownInput
                  isDisabled={disableFields}
                  label={"Vessel Name"}
                  url={`${masterUrl}?formType=VesselName`}
                  form={formik}
                  id="vesselName"
                />
              </Col>
              <Col md="4" sm="12">
                <CustomTextInput label={"Vessel No"} disabled={disableFields} form={formik} id="vesselNo" />
              </Col>
              <Col md="4" sm="12">
                <CustomDropdownInput
                  isDisabled={disableFields}
                  label={"Port of Loading"}
                  url={`${masterUrl}?formType=PortOfLoading`}
                  form={formik}
                  id="portOfLoading"
                />
              </Col>
              <Col md="4" sm="12">
                <CustomDropdownInput
                  isDisabled={disableFields}
                  label={"Port of Discharge"}
                  url={`${masterUrl}?formType=PortOfDischarge`}
                  form={formik}
                  id="portOfDischarge"
                />
              </Col>
              <Col md="4" sm="12">
                <CustomTextInput
                  label={"Vessel Dispatch Date"}
                  disabled={disableFields}
                  type="date"
                  max={today}
                  form={formik}
                  id="vesselDispatchDate"
                />
              </Col>
              <Col md="4" sm="12">
                <CustomTextInput label={"EDA"} type="date" disabled={disableFields} form={formik} id="eda" />
              </Col>
            </Row>
          </CardBody>
        </Card>
      </div>
      <Card>
        <CardBody>
          <Row>
            <Col md="12" sm="12">
              <h5>Container Details</h5>
            </Col>
          </Row>
          <ContainerDetails form={formik} isEdit={isEdit} isViewOnly={isViewOnly} selectedContainers={selectedContainers.current} />
        </CardBody>
      </Card>

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
                <CustomUploader isReadOnly={isViewOnly || isEdit} form={formik} label={"Custom Documents"} id={"customDocumentCopy"} />
                {/*<CaptureImage ImgData={ImgData} setImgData={setImgData} ItemName={"CustomDocuments_C"} />*/}
              </Col>
              <Col sm="12" className="mt-2">
                <FormGroup className="d-flex mb-0 justify-content-end">
                  <div className="mr-1">
                    <Button.Ripple
                      outline
                      color="secondary"
                      tag={Link}
                      to={fromPage ? `/${fromPage}` : `/IASRPR`}
                      type="reset"
                      className="mr-2"
                    >
                      Cancel
                    </Button.Ripple>
                    {isViewOnly ? (
                      <>
                        {values.isApproved ? (
                          <Button.Ripple color="primary" type="button" disabled>
                            Approved
                          </Button.Ripple>
                        ) : (
                          <Button.Ripple color="primary" type="button" onClick={(e) => onApprove()}>
                            Approve
                          </Button.Ripple>
                        )}
                      </>
                    ) : (
                      <Button.Ripple color="primary" type="button" onClick={(e) => updateContainerList()}>
                        {isEdit ? "Update" : "Port Dispatch"}
                      </Button.Ripple>
                    )}
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

export default SendingPortDispatchInfo;
