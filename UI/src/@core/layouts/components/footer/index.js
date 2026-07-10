// ** Icons Import
import { Heart } from "react-feather";

const Footer = () => {
  return (
    <p className="clearfix mb-0">
      <span className="float-md-left d-block d-md-inline-block mt-25">
        COPYRIGHT © {new Date().getFullYear()} Naga foods limited
        <span className="d-none d-sm-inline-block">, All rights Reserved</span>
      </span>
      {window.location.href.startsWith("http://182.71.62.216/pp/") && (
        <span className="float-md-right d-none d-md-block">
          Hand-crafted & Made with
          <Heart size={14} /> at{" "}
          <a href="http://www.peczaweb.com/" target="_blank" rel="noopener noreferrer">
            Peczaweb
          </a>
        </span>
      )}
    </p>
  );
};

export default Footer;
