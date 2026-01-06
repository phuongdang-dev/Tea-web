import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar"
import { Outlet, useLocation, useNavigate, useSearchParams } from "react-router-dom"
import { AppSidebar } from "./components/app-sidebar"
import { routerNavBar } from "@/routers/router.navbar"
import { Bell } from "lucide-react"
import { useSelector } from "react-redux"
import { fetchUserAPIs, selectCurrentUser } from "@/store/slice/userSlice"
import { useAppDispatch } from "@/hooks/useDispatch"
import { useEffect } from "react"
import { TabProvider } from "@/contexts/TabContext"
import { TabLayout } from "@/components/TabLayout"
import { Tab } from "@/hooks/useTabManager"

export default function DashboardLayout() {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const currentUser = useSelector(selectCurrentUser);

    // Initial tabs - Dashboard tab is always present and not closable
    const initialTabs: Tab[] = [
        {
            id: 'dashboard-main',
            title: 'Dashboard',
            url: '/dashboard',
            isActive: true,
            isClosable: false
        }
    ];

    useEffect(() => {
        if (!currentUser) {
            navigate("/dang-nhap", { replace: true })
        }

    }, [currentUser, navigate])

    return (
        <TabProvider initialTabs={initialTabs}>
            <SidebarProvider>
                <AppSidebar />
                <SidebarInset>
                    <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
                        <SidebarTrigger className="-ml-1" />
                        <Separator
                            orientation="vertical"
                            className="mr-2 data-[orientation=vertical]:h-4"
                        />
                        <Breadcrumb>
                            <BreadcrumbList>
                                <BreadcrumbItem className="hidden md:block">
                                    <BreadcrumbLink >
                                        Quản trị hệ thống
                                    </BreadcrumbLink>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                        <Bell className="mr-5 ml-auto" size={20} />
                    </header>
                    <Outlet />
                </SidebarInset>
            </SidebarProvider>
        </TabProvider>
    )
}
