import { PropsWithChildren } from 'react';
import { Link, usePage } from '@inertiajs/react';
import {
    LayoutDashboard,
    Map,
    LandPlot,
    Wrench,
    Building2,
    Route,
    BookOpen,
    FileBox,
    MapPin,
    Users,
    UserCheck,
    Settings,
    LogOut,
    ChevronDown,
    Search,
} from 'lucide-react';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarInset,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarProvider,
    SidebarTrigger,
} from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Toaster } from '@/components/ui/sonner';
import { useFlashMessages } from '@/hooks/useFlashMessages';
import { PageProps } from '@/types';

const kibMenuItems = [
    { title: 'KIB A - Tanah', url: '/assets/kib-a', icon: LandPlot },
    { title: 'KIB B - Peralatan & Mesin', url: '/assets/kib-b', icon: Wrench },
    { title: 'KIB C - Gedung & Bangunan', url: '/assets/kib-c', icon: Building2 },
    { title: 'KIB D - Jalan, Irigasi, Jaringan', url: '/assets/kib-d', icon: Route },
    { title: 'KIB E - Aset Tetap Lainnya', url: '/assets/kib-e', icon: BookOpen },
    { title: 'KIB L - Aset Lainnya', url: '/assets/kib-l', icon: FileBox },
];

const searchMenuItems = [
    { title: 'Pencarian Tabel', url: '/search', icon: Search },
    { title: 'Pencarian Peta', url: '/search/map', icon: MapPin },
];

function getInitials(name: string): string {
    return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
}

export default function AuthenticatedLayout({
    header,
    children,
}: PropsWithChildren<{ header?: string }>) {
    const { auth } = usePage<PageProps>().props;
    const user = auth.user;
    const currentUrl = usePage().url;

    useFlashMessages();

    const isActive = (url: string) => currentUrl.startsWith(url);

    return (
        <SidebarProvider>
            <Sidebar variant="inset">
                <SidebarHeader>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton size="lg" asChild>
                                <Link href="/dashboard">
                                    <div className="bg-primary text-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg text-xs font-bold">
                                        SA
                                    </div>
                                    <div className="grid flex-1 text-left text-sm leading-tight">
                                        <span className="truncate font-semibold">Simaset Dinas Perhubungan Cilacap</span>
                                        <span className="text-muted-foreground truncate text-xs">
                                            Sistem Manajemen Aset
                                        </span>
                                    </div>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarHeader>

                <SidebarContent>
                    <SidebarGroup>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                <SidebarMenuItem>
                                    <SidebarMenuButton asChild isActive={isActive('/dashboard')}>
                                        <Link href="/dashboard">
                                            <LayoutDashboard />
                                            <span>Dashboard</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>

                    <SidebarGroup>
                        <SidebarGroupLabel>Kartu Inventaris Barang</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {kibMenuItems.map((item) => (
                                    <SidebarMenuItem key={item.url}>
                                        <SidebarMenuButton asChild isActive={isActive(item.url)}>
                                            <Link href={item.url}>
                                                <item.icon />
                                                <span>{item.title}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>

                    <SidebarGroup>
                        <SidebarGroupLabel>Pencarian</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {searchMenuItems.map((item) => (
                                    <SidebarMenuItem key={item.url}>
                                        <SidebarMenuButton asChild isActive={isActive(item.url)}>
                                            <Link href={item.url}>
                                                <item.icon />
                                                <span>{item.title}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>

                    {user.role === 'admin' && (
                        <SidebarGroup>
                            <SidebarGroupLabel>Administrasi</SidebarGroupLabel>
                            <SidebarGroupContent>
                                <SidebarMenu>
                                    <SidebarMenuItem>
                                        <SidebarMenuButton asChild isActive={isActive('/wilayah')}>
                                            <Link href="/wilayah">
                                                <Map />
                                                <span>Wilayah</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                    <SidebarMenuItem>
                                        <SidebarMenuButton asChild isActive={isActive('/users')}>
                                            <Link href="/users">
                                                <Users />
                                                <span>Pengguna</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                    <SidebarMenuItem>
                                        <SidebarMenuButton asChild isActive={isActive('/pejabats')}>
                                            <Link href="/pejabats">
                                                <UserCheck />
                                                <span>Pejabat</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                    <SidebarMenuItem>
                                        <SidebarMenuButton asChild isActive={isActive('/settings')}>
                                            <Link href="/settings">
                                                <Settings />
                                                <span>Pengaturan</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                </SidebarMenu>
                            </SidebarGroupContent>
                        </SidebarGroup>
                    )}
                </SidebarContent>

                <SidebarFooter>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <SidebarMenuButton size="lg">
                                        <Avatar className="size-8">
                                            <AvatarFallback className="text-xs">
                                                {getInitials(user.name)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="grid flex-1 text-left text-sm leading-tight">
                                            <span className="truncate font-semibold">{user.name}</span>
                                            <span className="text-muted-foreground truncate text-xs capitalize">
                                                {user.role}
                                            </span>
                                        </div>
                                        <ChevronDown className="ml-auto size-4" />
                                    </SidebarMenuButton>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                    className="w-[--radix-dropdown-menu-trigger-width]"
                                    align="start"
                                >
                                    <DropdownMenuItem asChild>
                                        <Link
                                            href="/logout"
                                            method="post"
                                            as="button"
                                            className="w-full"
                                        >
                                            <LogOut className="mr-2 size-4" />
                                            Keluar
                                        </Link>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarFooter>
            </Sidebar>

            <SidebarInset>
                <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
                    <SidebarTrigger className="-ml-1" />
                    <Separator orientation="vertical" className="mr-2 h-4" />
                    {header && (
                        <h1 className="text-lg font-semibold">{header}</h1>
                    )}
                </header>
                <main className="flex-1 p-6">{children}</main>
            </SidebarInset>
            <Toaster richColors />
        </SidebarProvider>
    );
}
