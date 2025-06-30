
import { Sidebar, SidebarItem, SidebarItemGroup, SidebarItems, SidebarLogo } from "flowbite-react";
import { HiArrowSmRight, HiChartPie, HiInbox, HiShoppingBag, HiTable, HiUser, HiViewBoards } from "react-icons/hi";

export function Component() {
  return (
    <Sidebar aria-label="Main Sidebar">
      <SidebarLogo href="#" img="/favicon.svg" imgAlt="Wujie logo">
        Manipulation Agent
      </SidebarLogo>
      <SidebarItems>
        <SidebarItemGroup>
          <SidebarItem href="#" icon={HiChartPie}>
            Dashboard
          </SidebarItem>
          <SidebarItem href="#" icon={HiViewBoards}>
            视频监控
          </SidebarItem>
          <SidebarItem href="#" icon={HiInbox}>
            远程控制
          </SidebarItem>
          <SidebarItem href="#" icon={HiUser}>
            Agent任务
          </SidebarItem>
          <SidebarItem href="#" icon={HiShoppingBag}>
            Logs
          </SidebarItem>
        </SidebarItemGroup>
      </SidebarItems>
    </Sidebar>
  );
}
