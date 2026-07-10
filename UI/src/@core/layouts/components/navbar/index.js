// ** React Imports
import { Fragment } from "react";

// ** Custom Components
import NavbarUser from "./NavbarUser";

const ThemeNavbar = (props) => {
  // ** Props
  const { skin, setSkin, setMenuVisibility, setSideBarVisibility, sideBarVisibility } = props;

  return (
    <Fragment>
      <NavbarUser skin={skin} setSkin={setSkin} setMenuVisibility={setMenuVisibility} setSideBarVisibility={setSideBarVisibility} sideBarVisibility={sideBarVisibility}/>
    </Fragment>
  );
};

export default ThemeNavbar;
