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
import { ThemeLogo } from "@/components/ThemeLogo";

type LeftNavUIProps = LeftNavProps & {
  className?: string;
  logo?: {
    src: string;
    alt: string;
  };
  externalLinks?: Array<{
    name: string;
    href: string;
    target?: string;
  }>;
};

const LeftNavUI: FC<LeftNavUIProps> = (props) => {
  const showModal = useCallback(() => {
    modal.show(LeftNavSheet, {
      ...props,
    });
  }, [props]);

  return (
    <button
      onClick={showModal}
      className={props?.className}
      aria-label="Open navigation menu"
      style={{
        zoom: "1.2",
      }}
    >
      <VectorIcon />
    </button>
  );
};

const LeftNavSheet = modal.create<LeftNavUIProps>((props) => {
  const { visible, hide, onOpenChange } = useModal();

  return (
    <Sheet open={visible} onOpenChange={onOpenChange}>
      <SheetContent
        side="left"
        className="oui-w-[276px] oui-bg-base-9 bd-left-nav"
        closeable
        closeableSize={24}
        closeOpacity={0.54}
      >
        <div className="oui-relative oui-flex oui-h-full oui-flex-col oui-gap-3">
          <div className="oui-mt-[6px] oui-flex oui-h-[44px] oui-items-center">
            <ThemeLogo className="bd-brand-title" />
          </div>

          <div className="oui-flex oui-h-[calc(100vh-120px)] oui-flex-col oui-items-start oui-overflow-y-auto">
            {Array.isArray(props?.menus) && props.menus.length > 0 && (
              <>
                {props.menus?.map((item) => (
                  <NavItem
                    item={item}
                    key={`item-${item.name}`}
                    onLinkClick={hide}
                  />
                ))}
              </>
            )}

            {Array.isArray(props?.externalLinks) &&
              props.externalLinks.length > 0 && (
                <>
                  <div className="oui-w-full oui-border-t oui-border-line-12 oui-my-2 oui-bg-base-3"></div>
                  {props.externalLinks?.map((item) => (
                    <ExternalNavItem
                      item={item}
                      key={`external-${item.name}`}
                    />
                  ))}
                </>
              )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
});

type NavItemProps = {
  item: LeftNavItem;
  onLinkClick?: () => void;
};

const NavItem: FC<NavItemProps> = ({ item, onLinkClick }) => {
  const { href, name, icon, trailing, customRender, target } = item;

  if (customRender) {
    const rendered = customRender({ name, href });
    const className =
      "oui-flex oui-items-center oui-px-3 oui-py-4 oui-w-full hover:oui-bg-base-7 oui-bg-transparent oui-border-none oui-no-underline";

    if (target) {
      return (
        <a
          href={href}
          target={target}
          rel={target === "_blank" ? "noopener noreferrer" : undefined}
          onClick={onLinkClick}
          className={className}
        >
          {rendered}
        </a>
      );
    }

    return (
      <Link to={href || "/"} onClick={onLinkClick} className={className}>
        {rendered}
      </Link>
    );
  }

  const content = (
    <>
      <div>{icon}</div>
      <div className="oui-text-base oui-font-semibold oui-text-base-contrast-80">
        {name}
      </div>
      {trailing}
    </>
  );

  if (target) {
    return (
      <a
        href={href}
        target={target}
        rel={target === "_blank" ? "noopener noreferrer" : undefined}
        onClick={onLinkClick}
        className="oui-flex oui-items-center oui-px-3 oui-py-4 oui-w-full hover:oui-bg-base-7 oui-no-underline"
      >
        {content}
      </a>
    );
  }

  return (
    <Link
      to={href}
      onClick={onLinkClick}
      className="oui-flex oui-items-center oui-px-3 oui-py-4 oui-w-full hover:oui-bg-base-7 oui-no-underline"
    >
      {content}
    </Link>
  );
};

type ExternalNavItemProps = {
  item: {
    name: string;
    href: string;
    target?: string;
  };
};

const ExternalNavItem: FC<ExternalNavItemProps> = ({ item }) => {
  return (
    <a
      href={item.href}
      target={item.target || "_blank"}
      rel="noopener noreferrer"
      className="oui-flex oui-items-center oui-justify-between oui-px-3 oui-py-4 oui-w-full hover:oui-bg-base-7 oui-no-underline"
    >
      <div className="oui-text-base oui-font-semibold oui-text-base-contrast-80">
        {item.name}
      </div>
      <ExternalLink className="oui-w-4 oui-h-4 oui-text-base-contrast-54 oui-flex-shrink-0" />
    </a>
  );
};

export default LeftNavUI;
