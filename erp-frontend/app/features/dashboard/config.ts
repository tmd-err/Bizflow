import {
  LayoutDashboard,
  BarChart3,
  Users,
  ShoppingCart,
  Package,
  Truck,
  Receipt,
  CreditCard,
  Wallet,
  Building2,
  Shield,
  Settings,
  User,
} from "lucide-react";

export const dashboardNavItems = [
  {
    title: "Overview",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: "LayoutDashboard" },
      {
        label: "Analytics",
        href: "/dashboard/analytics",
        icon: "BarChart3",
      },
    ],
  },
  {
    title: "Operations",
    items: [
      {
        label: "Customers",
        href: "/dashboard/customers",
        icon: "Users",
        permission: "customers.view",
      },
      {
        label: "Sales",
        href: "/dashboard/sales",
        icon: "ShoppingCart",
        permission: "sales.view",
      },
      {
        label: "Products",
        href: "/dashboard/products",
        icon: "Package",
        permission: "products.view",
      },
      {
        label: "Inventory",
        href: "/dashboard/inventory",
        icon: "Package",
        permission: "inventory.view",
      },
      {
        label: "Purchase Orders",
        href: "/dashboard/purchases",
        icon: "ShoppingCart",
        permission: "purchases.view",
      },
      {
        label: "Suppliers",
        href: "/dashboard/purchases/suppliers",
        icon: "Users",
        permission: "suppliers.view",
      },
      {
        label: "Delivery Receipts",
        href: "/dashboard/purchases/delivery-receipts",
        icon: "ClipboardList",
        permission: "purchases.view",
      },
      {
        label: "Purchase Invoices",
        href: "/dashboard/purchases/invoices",
        icon: "Receipt",
        permission: "purchases.view",
      },
    ],
  },
  {
    title: "Finance",
    items: [
      {
        label: "Invoices",
        href: "/dashboard/invoices",
        icon: "Receipt",
        permission: "sales.view",
      },
      {
        label: "Payments",
        href: "/dashboard/payments",
        icon: "CreditCard",
        permission: "sales.view",
      },
      {
        label: "Expenses",
        href: "/dashboard/expenses",
        icon: "Wallet",
        permission: "purchases.view",
      },
    ],
  },
  {
    title: "People",
    items: [
      {
        label: "Employees",
        href: "/dashboard/employees",
        icon: "Users",
        permission: "users.view",
      },
      {
        label: "Departments",
        href: "/dashboard/departments",
        icon: "Building2",
        permission: "users.view",
      },
    ],
  },
  {
    title: "System",
    items: [
      {
        label: "Users & Roles",
        href: "/dashboard/users",
        icon: "Shield",
        permission: "users.view",
      },
      { label: "Profile", href: "/dashboard/settings/profile", icon: "User" },
      { label: "Settings", href: "/dashboard/settings", icon: "Settings" },
    ],
  },
] as const;

export const dashboardQuickActions = [
  { label: "New invoice", href: "/dashboard/invoices/create" },
  { label: "Add product", href: "/dashboard/products/create" },
  { label: "Create order", href: "/dashboard/sales/orders/create" },
  { label: "Record payment", href: "/dashboard/payments/create" },
] as const;

export const dashboardStats = [
  {
    label: "Revenue",
    value: "$48,250",
    change: "+12.4%",
    trend: "up" as const,
  },
  {
    label: "Open orders",
    value: "128",
    change: "+8 today",
    trend: "up" as const,
  },
  {
    label: "Low stock items",
    value: "14",
    change: "Needs attention",
    trend: "down" as const,
  },
  {
    label: "Pending invoices",
    value: "$9,840",
    change: "6 overdue",
    trend: "down" as const,
  },
] as const;

export const dashboardActivity = [
  {
    id: 1,
    title: "Invoice #INV-1042 sent",
    module: "Finance",
    time: "2 min ago",
  },
  {
    id: 2,
    title: "Stock alert: Widget Pro",
    module: "Inventory",
    time: "18 min ago",
  },
  {
    id: 3,
    title: "Sales order #ORD-883 confirmed",
    module: "Sales",
    time: "1 hr ago",
  },
  {
    id: 4,
    title: "New employee added",
    module: "HR",
    time: "3 hr ago",
  },
] as const;

export const dashboardModules = [
  {
    title: "Sales & CRM",
    description: "Quotes, orders, and customer pipeline.",
    href: "/dashboard/sales",
  },
  {
    title: "Inventory",
    description: "Products, warehouses, and stock levels.",
    href: "/dashboard/inventory",
  },
  {
    title: "Finance",
    description: "Invoices, payments, and cash flow.",
    href: "/dashboard/invoices",
  },
  {
    title: "HR & Teams",
    description: "Employees, roles, and departments.",
    href: "/dashboard/employees",
  },
] as const;