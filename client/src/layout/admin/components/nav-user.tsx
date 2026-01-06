"use client"

import {
    BadgeCheck,
    Bell,
    ChevronsUpDown,
    CreditCard,
    LogOut,
    Settings,
    Sparkles,
    UserRoundIcon,
} from "lucide-react"

import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from "@/components/ui/sidebar"
import { useAppDispatch } from "@/hooks/useDispatch"
import { logoutUserAPIs } from "@/store/slice/userSlice"
import { useNavigate } from "react-router-dom"

export function NavUser({
    user,
}: {
    user: {
        usr_name: string
        usr_email: string
        usr_avatar: string
        usr_status: string
    }
}) {
    const { isMobile } = useSidebar()

    const dispatch = useAppDispatch()
    const navigate = useNavigate()

    const handleLogout = () => {
        dispatch(logoutUserAPIs()).then(() => {
            navigate('/dang-nhap', { replace: true })
        })
    }

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton
                            size="lg"
                            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                        >
                            <Avatar className="h-8 w-8 rounded-lg">
                                <AvatarImage src={user.usr_avatar} alt={user.usr_name} />
                                <AvatarFallback className="rounded-lg">{
                                    user.usr_name.slice(0, 1).toUpperCase()
                                }</AvatarFallback>
                            </Avatar>
                            <div className="grid flex-1 text-left text-sm leading-tight">
                                <span className="truncate font-medium">{user.usr_name}</span>
                                <span className="truncate text-xs">{user.usr_email}</span>
                            </div>
                            <ChevronsUpDown className="ml-auto size-4" />
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                        side={isMobile ? "bottom" : "right"}
                        align="end"
                        sideOffset={4}
                    >
                        <DropdownMenuLabel className="p-0 font-normal">
                            <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                                <Avatar className="h-8 w-8 rounded-lg">
                                    <AvatarImage src={user.usr_avatar} alt={user.usr_name} />
                                    <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                                </Avatar>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-medium">{user.usr_name}</span>
                                    <span className="truncate text-xs">{user.usr_email}</span>
                                </div>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />

                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                            <DropdownMenuItem >
                                <UserRoundIcon className="mr-2 h-4 w-4" />
                                Thông tin tài khoản
                            </DropdownMenuItem>
                            <DropdownMenuItem >
                                <Settings className="mr-2 h-4 w-4" />
                                Đổi mật khẩu
                            </DropdownMenuItem>

                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleLogout}>
                            <LogOut className="mr-2 h-4 w-4" />
                            Log out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    )
}
