// ** Dropdowns Imports
import { Fragment } from "react";

import UserDropdown from "./UserDropdown";

// ** Third Party Components
import { Menu } from "react-feather";
import { NavItem, NavLink } from "reactstrap";

const NavbarUser = (props) => {
  // ** Props
  const { setMenuVisibility, sideBarVisibility, setSideBarVisibility } = props;

  // ** Function to toggle Theme (Light/Dark)
  // const ThemeToggler = () => {
  //   if (skin === 'dark') {
  //     return <Sun className='ficon' onClick={() => setSkin('light')} />
  //   } else {
  //     return <Moon className='ficon' onClick={() => setSkin('dark')} />
  //   }
  // }

  return (
    <Fragment>
      <ul className="navbar-nav d-xl-none d-flex align-items-center">
        <NavItem className="mobile-menu mr-auto">
          <NavLink className="nav-menu-main menu-toggle hidden-xs is-active" onClick={() => {setMenuVisibility(true); setSideBarVisibility(false)}}>
            <Menu className="ficon" />
          </NavLink>
        </NavItem>
      </ul>
      <div className='bookmark-wrapper d-flex align-items-center color-white'>
        <NavItem className='d-none d-lg-block'>
          <NavLink onClick={() => setSideBarVisibility(!sideBarVisibility)}>
            <Menu color="white" className="ficon" />
          </NavLink>
        </NavItem>
      </div>
      <ul className="nav navbar-nav align-items-center ml-auto">
        <UserDropdown />
      </ul>
    </Fragment>
  );
};
export default NavbarUser;
