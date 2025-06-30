
import { Sidebar, SidebarItem, SidebarItemGroup, SidebarItems, SidebarLogo} from "flowbite-react";
import { HiArrowSmRight, HiChartPie, HiInbox, HiShoppingBag, HiTable, HiUser, HiViewBoards } from "react-icons/hi";
import { NavLink } from "react-router-dom";
export function Component() {
  return (
    <Sidebar aria-label="Main Sidebar" className="w-64 flex flex-col">
      <SidebarLogo as={NavLink} href="/" to="/" img="/img/wujie_icon.svg" imgAlt="Wujie logo">
        操作助手
      </SidebarLogo>
      <hr className="border-b-1 border-gray-200 mx-4 w-[calc(100%-2rem)]" />
      <div className="flex-1 flex items-center justify-center">
        <SidebarItems>
            <SidebarItemGroup>
            <SidebarItem as={NavLink} to="/dashboard" icon={HiChartPie}>
                Dashboard
            </SidebarItem>
            <SidebarItem as={NavLink} to="/video-control" icon={HiViewBoards}>
                视频监控
            </SidebarItem>
            <SidebarItem as={NavLink} to="/remote-control" icon={HiInbox}>
                远程控制
            </SidebarItem>
            <SidebarItem as={NavLink} to="/agent-tasks" icon={HiUser}>
                Agent任务
            </SidebarItem>
            <SidebarItem as={NavLink} to="/logs" icon={HiShoppingBag}>
                Logs
            </SidebarItem>
            </SidebarItemGroup>
        </SidebarItems>
      </div>
    </Sidebar>
  );
}
