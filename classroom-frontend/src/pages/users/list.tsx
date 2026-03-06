import { ListView } from "@/components/refine-ui/views/list-view.tsx";
import { Breadcrumb } from "@/components/refine-ui/layout/breadcrumb.tsx";
import { Input } from "@/components/ui/input";
import { useMemo, useState } from "react";
import { Search, Mail, User as UserIcon } from "lucide-react";
import { CreateButton } from "@/components/refine-ui/buttons/create.tsx";
import { User, UserRole } from "@/types";
import { useTable } from "@refinedev/react-table";
import { EditButton } from "@/components/refine-ui/buttons/edit.tsx";
import { DeleteButton } from "@/components/refine-ui/buttons/delete.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/refine-ui/data-table/data-table.tsx";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar.tsx";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select.tsx";

const UsersList = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [roleFilter, setRoleFilter] = useState("all");

    const columns = useMemo<ColumnDef<User>[]>(
        () => [
            {
                id: "user",
                header: "User",
                cell: ({ row }) => (
                    <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                            <AvatarImage src={row.original.image} alt={row.original.name} />
                            <AvatarFallback><UserIcon className="h-4 w-4" /></AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                            <span className="font-medium text-sm">{row.original.name}</span>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Mail className="h-3 w-3" />
                                <span>{row.original.email}</span>
                            </div>
                        </div>
                    </div>
                ),
            },
            {
                id: "role",
                accessorKey: "role",
                header: "Role",
                cell: ({ getValue }) => {
                    const role = getValue<UserRole>();
                    const variants: Record<UserRole, "default" | "secondary" | "outline"> = {
                        [UserRole.ADMIN]: "default",
                        [UserRole.TEACHER]: "secondary",
                        [UserRole.STUDENT]: "outline",
                    };
                    return <Badge variant={variants[role]}>{role}</Badge>;
                },
            },
            {
                id: "createdAt",
                accessorKey: "createdAt",
                header: "Joined",
                cell: ({ getValue }) => new Date(getValue<string>()).toLocaleDateString(),
            },
            {
                id: "actions",
                header: "Actions",
                cell: ({ row }) => (
                    <div className="flex gap-2">
                        <EditButton hideText size="sm" recordItemId={row.original.id} />
                        <DeleteButton hideText size="sm" recordItemId={row.original.id} />
                    </div>
                ),
            },
        ],
        []
    );

    const table = useTable<User>({
        columns,
        refineCoreProps: {
            resource: "users",
            pagination: { pageSize: 10, mode: "server" },
            filters: {
                permanent: [
                    ...(searchQuery ? [{ field: "name", operator: "contains" as const, value: searchQuery }] : []),
                    ...(roleFilter !== "all" ? [{ field: "role", operator: "eq" as const, value: roleFilter }] : []),
                ],
            },
        },
    });

    return (
        <ListView>
            <Breadcrumb />
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold tracking-tight">Users</h1>
                <CreateButton />
            </div>

            <div className="flex items-center gap-4 mb-6">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search users..."
                        className="pl-9"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="All Roles" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Roles</SelectItem>
                        <SelectItem value={UserRole.ADMIN}>Admin</SelectItem>
                        <SelectItem value={UserRole.TEACHER}>Teacher</SelectItem>
                        <SelectItem value={UserRole.STUDENT}>Student</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <DataTable table={table} />
        </ListView>
    );
};

export default UsersList;
