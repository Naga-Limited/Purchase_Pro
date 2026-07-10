// ** Third Party Components
import { Button, Modal, ModalHeader, ModalBody } from "reactstrap";
import { X } from "react-feather";

const PPModal = ({ open, closeModal, title, children, hideCancel }) => {
  // ** Custom close btn
  const CloseBtn = <X className="cursor-pointer" size={15} onClick={closeModal} />;

  return (
    <Modal isOpen={open} toggle={closeModal} className="sidebar-sm" modalClassName="modal-slide-in" contentClassName="pt-0">
      <ModalHeader className="mb-3" toggle={closeModal} close={CloseBtn} tag="div">
        <h5 className="modal-title">{title}</h5>
      </ModalHeader>
      <ModalBody className="flex-grow-1">
        {children}
        {!hideCancel && (
          <Button color="secondary" onClick={closeModal} outline>
            Cancel
          </Button>
        )}
      </ModalBody>
    </Modal>
  );
};

export default PPModal;
