// ** Third Party Components
import { MoreHorizontal } from "react-feather";

const VerticalNavMenuSectionHeader = ({ item, index }) => {
  return (
    <li className="navigation-header" title={item.header}>
      <span>{item.header}</span>
      <MoreHorizontal className="feather-more-horizontal" />
    </li>
  );
};

export default VerticalNavMenuSectionHeader;
