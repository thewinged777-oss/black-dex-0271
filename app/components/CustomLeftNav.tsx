import { FC, useCallback } from "react";
import { Link, NavLink } from "react-router-dom";
import { Sheet, SheetContent, modal, useModal, VectorIcon } from "@orderly.network/ui";
import { LeftNavProps, LeftNavItem } from "@orderly.network/ui-scaffold";
import { ExternalLink } from "lucide-react";
import { getRuntimeConfig, getRuntimeConfigBoolean } from "@/utils/runtime-config";
import { withBasePath } from "@/utils/base-path";
import "@/styles/navigation.css";

type LeftNavUIProps = LeftNavProps & { className?: string; logo?: { src: string; alt: string }; externalLinks?: Array<{ name: string; href: string; target?: string }> };

const LeftNavUI: FC<LeftNavUIProps> = (props) => {
  const showModal = useCallback(() => modal.show(LeftNavSheet, { ...props }), [props]);
  return <button onClick={showModal} className={`black-dex-menu-trigger ${props?.className || ""}`} aria-label="Open Black DEX navigation"><VectorIcon /></button>;
};

const LeftNavSheet = modal.create<LeftNavUIProps>((props) => {
  const { visible, hide, onOpenChange } = useModal();
  return (
    <Sheet open={visible} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="black-dex-nav-sheet oui-w-[320px] oui-bg-base-8 oui-border-r oui-border-line-12" closeable closeableSize={24} closeOpacity={0.72}>
        <div className="black-dex-nav-inner">
          <div className="black-dex-nav-brand">
            <Link to="/" onClick={hide} className="black-dex-nav-logo oui-no-underline">
              {getRuntimeConfigBoolean("VITE_HAS_PRIMARY_LOGO") ? <img src={withBasePath("/logo.webp")} alt="Black DEX" /> : <div><strong>BLACK DEX</strong><span>.ONLINE</span></div>}
            </Link>
            <div className="black-dex-nav-badge">PRO</div>
          </div>
          <div className="black-dex-nav-scroll">
            {Array.isArray(props?.menus) && props.menus.length > 0 && <div className="black-dex-nav-section"><div className="black-dex-nav-label">TRADING</div><div className="black-dex-nav-menu">{props.menus.map((item) => <NavItem item={item} key={`item-${item.name}`} onLinkClick={hide} />)}</div></div>}
            {Array.isArray(props?.externalLinks) && props.externalLinks.length > 0 && <div className="black-dex-nav-section black-dex-nav-external"><div className="black-dex-nav-label">ECOSYSTEM</div><div className="black-dex-nav-menu">{props.externalLinks.map((item) => <ExternalNavItem item={item} key={`external-${item.name}`} />)}</div></div>}
          </div>
          <div className="black-dex-nav-footer"><div><span>BLACK DEX</span><small>Professional trading infrastructure</small></div><span className="black-dex-status-dot" aria-label="System operational" /></div>
        </div>
      </SheetContent>
    </Sheet>
  );
});

type NavItemProps = { item: LeftNavItem; onLinkClick?: () => void };
const NavItem: FC<NavItemProps> = ({ item, onLinkClick }) => {
  const { href, name, icon, trailing, customRender, target } = item;
  const content = <><div className="black-dex-nav-icon">{icon}</div><div className="black-dex-nav-name">{name}</div>{trailing}</>;
  if (customRender) return <button type="button" onClick={onLinkClick} className="black-dex-nav-item oui-bg-transparent oui-border-none">{customRender({ name, href })}</button>;
  if (target) return <a href={href} target={target} rel={target === "_blank" ? "noopener noreferrer" : undefined} onClick={onLinkClick} className="black-dex-nav-item">{content}</a>;
  return <NavLink to={href} onClick={onLinkClick} className={({ isActive }) => `black-dex-nav-item${isActive ? " is-active" : ""}`}>{content}</NavLink>;
};

type ExternalNavItemProps = { item: { name: string; href: string; target?: string } };
const ExternalNavItem: FC<ExternalNavItemProps> = ({ item }) => <a href={item.href} target={item.target || "_blank"} rel="noopener noreferrer" className="black-dex-nav-item"><div className="black-dex-nav-icon"><ExternalLink /></div><div className="black-dex-nav-name">{item.name}</div><ExternalLink className="black-dex-nav-external-icon" /></a>;

export default LeftNavUI;
