import { Row, Col } from "reactstrap";
import { apiPostMethod } from "@helpers/axiosHelper";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { apiBaseUrl, irsUrl } from "../../urlConstants";
import { errorToast } from "@helpers/appHelper";
import TableComponent from "../common/TableComponent";
import { CustomDropdownInput, CustomTextInput, CustomUploader } from "../forms/custom-form";
import { useLoader } from "../../utility/hooks/useLoader";
export const ContainerDetails = (props) => {
  const { isViewOnly, isEdit, form, selectedContainers } = props;
  const canFetchContainer = !isViewOnly && !isEdit && !selectedContainers;
  let poDetails = form.values.poDetails;
  let { showLoader, hideLoader } = useLoader();

  let containerListRef = useRef([]);
  const [containerList, setContainerList] = useState([]);

  useEffect(() => {
    if (isEdit && form.values.containers) {
      containerListRef.current = form.values.containers;
    }
  }, [form.values.containers, isEdit]);

  const onFetchContainer = useCallback(() => {
    form.setFieldValue("poDetails", []);
    form.setFieldValue("containers", []);
    form.setFieldValue("noOfContainers", 0);
    let portOfLoading = form.values.portOfLoading;
    if (portOfLoading && portOfLoading.value) {
      showLoader();
      apiPostMethod(`${apiBaseUrl}PortDispatch/getContainersBySendingPort`, {
        portOfLoading: portOfLoading.value,
      })
        .then((response) => {
          const { data } = response;
          if (data.success) {
            setContainerList([...containerListRef.current, ...data.results]);
          }
        })
        .catch((error) => {
          errorToast("Something went wrong, please try again after sometime");
        })
        .finally(() => hideLoader());
    }
  }, [form.values.portOfLoading]);

  useEffect(() => {
    if (canFetchContainer) {
      onFetchContainer();
    }
  }, [onFetchContainer, canFetchContainer]);

  const onDdlChange = (e) => {
    form.setValues({
      ...form.values,
      poDetails: [],
      containers: e || [],
      noOfContainers: 0,
    });
    if (e && e.length > 0) {
      let fdata = { containerId: e.map((m) => m.value), intercomPoNumber: null, formType: "GetDetailsByContainerId" };
      if (isEdit) {
        fdata.status = [9, 10];
      }
      showLoader();
      apiPostMethod(irsUrl, fdata)
        .then((response) => {
          const { data } = response;
          if (data.success) {
            let po = data.results.map((a) => ({
              ...a,
              poLineItem: a.lineItem,
            }));
            form.setValues({
              ...form.values,
              poDetails: po,
              containers: e,
              noOfContainers: e.length,
            });
          }
        })
        .catch((error) => {
          errorToast("Something went wrong, please try again after sometime");
        })
        .finally(() => hideLoader());
    }
  };
  return (
    <>
      <Row>
        <Col md="12" sm="12">
          <CustomDropdownInput
            isDisabled={isViewOnly}
            onChange={onDdlChange}
            isMulti
            options={containerList}
            label={"Container"}
            form={form}
            id="containers"
            fixedOption={selectedContainers}
          />
        </Col>
        <Col md="4" sm="12">
          <CustomTextInput label={"No Of Containers"} disabled form={form} id="noOfContainers" />
        </Col>
      </Row>
      {poDetails && poDetails.length > 0 && <TableComponent hideSearch columns={taColumns} data={poDetails} />}
    </>
  );
};

const addColumn = (name, selector, minWidth) => ({
  name: name,
  selector: selector,
  sortable: true,
  wrap: true,
  minWidth: minWidth,
});
const addDownLoadColumn = (name, selector) => {
  return {
    name: name,
    selector: selector,
    cell: (props, i) => {
      return (
        <CustomUploader
          isReadOnly
          form={{
            values: {
              [selector]: { name: props[selector] },
            },
          }}
          id={selector}
        />
      );
    },
  };
};
const taColumns = [
  {
    name: "S.No",
    selector: "salesInvoice",
    sortable: true,
    cell: (props, i) => {
      return i + 1;
    },
  },
  addColumn("Container No", "containerNo", "130px"),
  addColumn("Container Type", "containerType", "120px"),
  addColumn("Packed Type", "packedType"),
  addColumn("Plant Name", "plantId"),
  addColumn("Sale Invoice Number", "salesInvoice"),
  addColumn("Sending storage location", "sendingStorageLocation"),
  addColumn("Receiving Storage Location", "receivingStorageLocation"),
  addColumn("Wheat Variety", "wheatVariety", "200px"),
  addColumn("Loading Type", "loadingType"),
  addColumn("Total Bags", "totalBags"),
  addColumn("No Of Bags", "noOfBags"),
  addColumn("Fumigation", "fumigation"),
  addColumn("WB Net Wt (In Kgs)", "wbNetWt"),
  addColumn("Gunny Less Net Wt (In Kgs)", "gunnyLessNetWt"),
  addColumn("Loading Date", "loadingDate"),
  addColumn("Seal Number", "sealNumber"),
  addColumn("Supplier Name", "supplierName"),
  addColumn("PO Line Item", "poLineItem"),

  addDownLoadColumn("Custom Document Copy", "customDocumentCopy"),
  addDownLoadColumn("Naga Wb Copy", "nagaWbCopy"),
  addDownLoadColumn("Sale Invoice Copy", "saleInvoiceCopy"),
  addDownLoadColumn("EWay Bill Copy", "eWayBillCopy"),
];
