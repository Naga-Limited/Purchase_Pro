import React, { useEffect, useState } from "react";
import { Modal, Button, Spinner } from "reactstrap";
import { apiGetMethod } from "../helper/axiosHelper";
import { apiBaseUrl } from "../urlConstants";
import { errorToast } from "../helper/appHelper";

const POCopyModal = ({ poNumber, isOpen, toggle,type }) => {
  const [pdfBase64, setPdfBase64] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && poNumber) {
      setLoading(true);
      apiGetMethod(`${apiBaseUrl}MigoAutomationController/getPOCopy/${poNumber}/${type}`)
        .then((res) => {
          if (res.data.success && res.data?.base64_pdf) {
            setPdfBase64(res.data.base64_pdf);
          } else {
            setPdfBase64("")
            errorToast(res.data.message);
          }
        })
        .catch(() => errorToast("Error fetching PO copy"))
        .finally(() => setLoading(false));
    }
  }, [isOpen, poNumber]);

  const printPdf = () => {
    const iframe = document.getElementById("poIframe");
    if (iframe && iframe.contentWindow) {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
    }
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle} size="lg">
      <div className="modal-header">
        <h5 className="modal-title">{type == 'PO' ? 'PO Copy' : 'GRN Copy'} - {poNumber}</h5>
        <Button close onClick={toggle} />
      </div>
      <div className="modal-body" style={{ height: "80vh" }}>
        {loading ? (
          <Spinner color="primary" />
        ) : pdfBase64 ? (
          <iframe
            id="poIframe"
            title="PO Copy"
            src={`data:application/pdf;base64,${pdfBase64}`}
            width="100%"
            height="100%"
            frameBorder="0"
          />
        ) : (
          <p>No PDF to display</p>
        )}
      </div>
      <div className="modal-footer">
        {/* <Button color="primary" onClick={printPdf}>
          Print
        </Button> */}
        <Button color="secondary" onClick={toggle}>
          Close
        </Button>
      </div>
    </Modal>
  );
};

export default POCopyModal;
