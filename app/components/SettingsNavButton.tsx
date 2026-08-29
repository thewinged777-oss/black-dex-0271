import { FC } from "react";
import { Link } from "react-router-dom";
import { Settings } from "lucide-react";

export const SettingsNavButton: FC = () => {
  return (
    <Link
      to="/portfolio/setting"
      aria-label="Settings"
      title="Settings"
      className="oui-flex oui-h-8 oui-w-8 oui-items-center oui-justify-center oui-rounded oui-text-base-contrast-80 hover:oui-bg-base-7 oui-no-underline"
    >
      <Settings className="oui-h-5 oui-w-5" strokeWidth={1.75} />
    </Link>
  );
};

export default SettingsNavButton;
