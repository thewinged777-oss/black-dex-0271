import { FC, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  Sheet,
  SheetContent,
  modal,
  useModal,
  VectorIcon,
} from "@orderly.network/ui";
import { LeftNavProps, LeftNavItem } from "@orderly.network/ui-scaffold";
import { ExternalLink } from "lucide-react";
import {
  getRuntimeConfig,
  getRuntimeConfigBoolean,
} from "@/utils/runtime-config";
import { withBasePath } from "@/utils/base-path";

type LeftNavUIProps = LeftNavProps & {
  className?: string;
  logo?: { src: string; alt: string };
  externalLinks?: Array<{ name: string; href: string; target?: string }>;
};

const LeftNavUI: FC<LeftNavUIProps> = (props) => {
  const showModal = useCallback(() => {
    modal.show(LeftNavSheet, { ...props });
  }, [props]);

  return (
    <button
      onClick={showModal}
      className={props?.className}
      aria-label="Open navigation menu"
      style={{ zoom: "1.2" }}
    >
      <VectorIcon />
    </button>
  );
};

const LeftNavSheet = modal.create<LeftNavUIProps>((props) => {
  const { visible, onOpenChange } = useModal();

  return (
    <Sheet open={visible} onOpenChange={onOpenChange}>
      <SheetContent
        side="left"
        className="oui-w-[292px] oui-bg-base-8 oui-border-r oui-border-line-12"
        closeable
        closeableSize={24}
        closeOpacity={0.54}
      >
        <div className="oui-relative oui-flex oui-h-full oui-flex-col oui-gap-3">
          <div className="oui-mt-[6px] oui-flex oui-h-[52px] oui-items-center oui-px-2 oui-border-b oui-border-line-12">
            {getRuntimeConfigBoolean("VITE_HAS_PRIMARY_LOGO") ? (
              <img src={withBasePath("/logo.webp")} alt="Black DEX" className="oui-h-[34px]" />
            ) : (
              <h1 className="oui-text-base-contrast-100 oui-font-bold oui-tracking-wide">
                {getRuntimeConfig("VITE_ORDERLY_BROKER_NAME") || "BLACK DEX"}
              </h1>
            )}
          </div>

          <div className="oui-flex oui-h-[calc(100vh-130px)] oui-flex-col oui-items-start oui-overflow-y-auto oui-px-1">
            {Array.isArray(props?.menus) && props.menus.length > 0 && (
              <div className="oui-w-full oui-space-y-1">
                {props.menus.map((item) => (
                  <NavItem item={item} key={`item-${item.name}`} onLinkClick={props.onClose} />
                ))}
              </div>
            )}

            {Array.isArray(props?.externalLinks) && props.externalLinks.length > 0 && (
              <>
                <div className="oui-w-full oui-border-t oui-border-line-12 oui-my-3" />
                <div className="oui-w-full oui-space-y-1">
                  {props.externalLinks.map((item) => (
                    <ExternalNavItem item={item} key={`external-${item.name}`} />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
});

type NavItemProps = { item: LeftNavItem; onLinkClick?: () => void };

const NavItem: FC<NavItemProps> = ({ item, onLinkClick }) => {
  const { href, name, icon, trailing, customRender, target } = item;

  const className =
    "oui-flex oui-items-center oui-gap-3 oui-rounded-md oui-px-3 oui-py-3 oui-w-full oui-transition-colors hover:oui-bg-base-7 hover:oui-text-primary oui-no-underline";

  const content = (
    <>
      <div className="oui-flex-shrink-0">{icon}</div>
      <div className="oui-flex-1 oui-text-sm oui-font-semibold oui-text-base-contrast-80">{name}</div>
      {trailing}
    </>
  );

  if (customRender) {
    return (
      <button type="button" onClick={onLinkClick} className={`${className} oui-bg-transparent oui-border-none`}>
        {customRender({ name, href })}
      </button>
    );
  }

  if (target) {
    return (
      <a href={href} target={target} rel={target === "_blank" ? "noopener noreferrer" : undefined} onClick={onLinkClick} className={className}>
        {content}
      </a>
    );
  }

  return <Link to={href} onClick={onLinkClick} className={className}>{content}</Link>;
};

type ExternalNavItemProps = { item: { name: string; href: string; target?: string } };

const ExternalNavItem: FC<ExternalNavItemProps> = ({ item }) => (
  <a
    href={item.href}
    target={item.target || "_blank"}
    rel="noopener noreferrer"
    className="oui-flex oui-items-center oui-justify-between oui-rounded-md oui-px-3 oui-py-3 oui-w-full oui-text-sm oui-font-semibold hover:oui-bg-base-7 oui-no-underline"
  >
    <div className="oui-text-base-contrast-80">{item.name}</div>
    <ExternalLink className="oui-w-4 oui-h-4 oui-text-base-contrast-54 oui-flex-shrink-0" />
  </a>
);

export default LeftNavUI;
