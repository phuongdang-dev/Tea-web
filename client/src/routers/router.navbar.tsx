import { RouteNavBar } from "@/types/router";
import { LayoutDashboard, LeafyGreen, PencilIcon, ShoppingBag, Tickets, UserRoundCheck, UsersRound, FileText, Truck } from "lucide-react";

export const routerNavBar: RouteNavBar[] = [
    {
        title: "Dashboard",
        url: "/dashboard",
        icon: LayoutDashboard,
        isActive: true,
    },
    {
        title: "Sản phẩm",
        url: "/products",
        icon: LeafyGreen,
        isActive: false,
        items: [
            {
                title: "Danh mục sản phẩm",
                url: "/products/category",
            },
            {
                title: "Danh sách sản phẩm",
                url: "/products/list",
            },
            {
                title: "Thuộc tính sản phẩm",
                url: "/products/attribute",
            }, {
                title: "Các loại trà",
                url: "/products/tea-category",
            }
        ],
    },
    {
        title: "Đơn hàng",
        url: "/orders",
        icon: ShoppingBag,
        isActive: false,

    },
    {
        title: "Customers",
        url: "/customers",
        icon: UserRoundCheck,
        isActive: false,
    },
    {
        title: "Phiếu giảm giá",
        url: "/discount",
        icon: Tickets,
        isActive: false,
    },
    {
        title: "Giao diện website",
        url: "/web-ui",
        icon: PencilIcon,
        isActive: false,
        items: [
            {
                title: "Landing page",
                url: "/web-ui/landing-page"
            },
            {
                title: "Thông tin công ty",
                url: "/web-ui/company-info"
            }
        ]
    }, {
        title: "Quản lý Blog",
        url: "/admin/blog",
        icon: FileText,
        isActive: false,
    }, {
        title: "Quản lý phí ship",
        url: "/admin/ship",
        icon: Truck,
        isActive: false,
    }

]



