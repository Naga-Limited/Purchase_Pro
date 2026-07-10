import Swal from "sweetalert2";

let confirmDialog = ({ title, description, confirmText, cancelText, cancelButton, html_data, confirmButton, background }) => {
  let myPromise = new Promise(function (myResolve, myReject) {
    Swal.fire({
      title: title || "Are you sure?",
      text: description,
      html: html_data,
      type: "warning",
      showCancelButton: cancelButton === undefined ? true : cancelButton,
      showConfirmButton: confirmButton === undefined ? true : confirmButton,
      confirmButtonText: confirmText || "Yes",
      cancelButtonText: cancelText || "No",  
      background: background
    }).then((res) => {
      myResolve(res.isConfirmed);
    });
  });

  return myPromise;
};

export default confirmDialog;
