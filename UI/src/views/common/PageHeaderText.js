import React from "react";

export const PageHeaderText = ({ title, id }) => {
  return (
    <p className="font-medium-5 mt-0 extension-title" data-tour="extension-title">
      {title}
      {id ? " - " + id : ""}
    </p>
  );
};
