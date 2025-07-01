
import { Sidebar, SidebarItem, SidebarItemGroup, SidebarItems, SidebarLogo} from "flowbite-react";
import { HiArrowSmRight, HiChartPie, HiInbox, HiShoppingBag, HiTable, HiUser, HiViewBoards } from "react-icons/hi";
import { FaChartPie } from "react-icons/fa";
import { IoVideocam } from "react-icons/io5";
import { IoGameController } from "react-icons/io5";
import { FaTasks} from "react-icons/fa";
import { FaBook } from "react-icons/fa";
import { NavLink } from "react-router-dom";
export function Component() {
  const createRipple = (e) => {
    const target = e.currentTarget;
    const rect   = target.getBoundingClientRect();
    const diameter = Math.max(rect.width, rect.height);
    const radius   = diameter / 2;

    const circle = document.createElement("span");
    circle.className = "ripple animate-ripple";
    circle.style.width  = circle.style.height = `${diameter}px`;
    circle.style.left   = `${e.clientX - rect.left - radius}px`;
    circle.style.top    = `${e.clientY - rect.top  - radius}px`;

    // 移除旧的
    const prev = target.querySelector(".ripple");
    if (prev) prev.remove();

    target.appendChild(circle);
  };
  const itemBase = "relative overflow-hidden hover:bg-sky-50";
  return (
    <Sidebar aria-label="Main Sidebar" className="`w-64 h-screen flex flex-col border-1 border-gray-200
    [&>div.overflow-y-auto]:relative
    `">
        <div className="h-16 flex-none flex flex-row items-center justify-center">
            <SidebarLogo as={NavLink} href="/" to="/" img="/img/wujie_icon.svg" imgAlt="Wujie logo">
                操作助手
            </SidebarLogo>
        </div>
        <hr className="border-b-1 border-gray-200 mx-4 w-[calc(100%-2rem)] mb-4" />
        <div className="absolute top-[30%] left-0 right-0 flex flex-col items-center space-y-4 px-4">
            <SidebarItems>
                <SidebarItemGroup className="space-y-8">
                <SidebarItem as={NavLink} to="/dashboard" className={itemBase} onMouseDown={createRipple} icon={FaChartPie}>
                    Dashboard
                </SidebarItem>
                <SidebarItem as={NavLink} to="/video-control" className={itemBase} onMouseDown={createRipple} icon={IoVideocam}>
                    视频监控
                </SidebarItem>
                <SidebarItem as={NavLink} to="/remote-control" className={itemBase} onMouseDown={createRipple} icon={IoGameController}>
                    远程控制
                </SidebarItem>
                <SidebarItem as={NavLink} to="/agent-tasks" className={itemBase} onMouseDown={createRipple} icon={FaTasks}>
                    Agent任务
                </SidebarItem>
                <SidebarItem as={NavLink} to="/logs" className={itemBase} onMouseDown={createRipple} icon={FaBook}>
                    Logs
                </SidebarItem>
                </SidebarItemGroup>
            </SidebarItems>
        </div>
    </Sidebar>
  );
}
