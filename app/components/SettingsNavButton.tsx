import { FC } from "react";
import { Link } from "react-router-dom";
import { SettingsIcon } from "@/components/icons/desk";

export const SettingsNavButton: FC = () => {
  return (
    <Link
      to="/portfolio/setting"
      aria-label="Settings"
      title="Settings"
      className="bd-header-control oui-flex oui-h-8 oui-w-8 oui-shrink-0 oui-items-center oui-justify-center oui-no-underline"
    >
      <SettingsIcon size={20} />
    </Link>
  );
};

export default SettingsNavButton;
