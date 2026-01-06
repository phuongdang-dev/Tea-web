"use client"

import * as React from "react"
import {
    AudioWaveform,
    BookOpen,
    Bot,
    Command,
    Frame,
    GalleryVerticalEnd,
    Map,
    PieChart,
    Settings2,
    SquareTerminal,
} from "lucide-react"

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarRail,
} from "@/components/ui/sidebar"
import { NavProjects } from "./nav-projects"
import { NavMain } from "./nav-main"
import { NavUser } from "./nav-user"
import { TeamSwitcher } from "./team-switcher"
import { routerNavBar } from "@/routers/router.navbar"
import { useSelector } from "react-redux"
import { selectCurrentUser } from "@/store/slice/userSlice"
import { useNavigate } from "react-router-dom"

// This is sample data.

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const userSelect = useSelector(selectCurrentUser)
    const navigate = useNavigate()
    React.useEffect(() => {
        if (!userSelect) {
            navigate("/dang-nhap", { replace: true })
        }
    }, [userSelect, navigate])

    return (
        <Sidebar collapsible="icon" {...props}>
            <SidebarHeader>
                <TeamSwitcher />
            </SidebarHeader>
            <SidebarContent>
                <NavMain items={routerNavBar} />
            </SidebarContent>
            <SidebarFooter>
                <NavUser user={userSelect} />
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    )
}
