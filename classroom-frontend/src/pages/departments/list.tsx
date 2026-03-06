import { ListView } from "@/components/refine-ui/views/list-view.tsx";
import { Breadcrumb } from "@/components/refine-ui/layout/breadcrumb.tsx";
import { Input } from "@/components/ui/input";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { CreateButton } from "@/components/refine-ui/buttons/create.tsx";
import { Department } from "@/types";
import { useTable } from "@refinedev/react-table";
import { ShowButton } from "@/components/refine-ui/buttons/show.tsx";
import { EditButton } from "@/components/refine-ui/buttons/edit.tsx";
import { DeleteButton } from "@/components/refine-ui/buttons/delete.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/refine-ui/data-table/data-table.tsx";

const DepartmentsList = () => {
    const [searchQuery, setSearchQuery] = useState("");

    const columns = useMemo<ColumnDef<Department>[]>(
        () => [
            {
                id: "code",
                accessorKey: "code",
                header: "Code",
                cell: ({ getValue }) => <Badge>{getValue<string>()}</Badge>,
            },
            {
                id: "name",
                accessorKey: "name",
                header: "Name",
                cell: ({ getValue }) => <span className="font-medium">{getValue<string>()}</span>,
            },
            {
                id: "description",
                accessorKey: "description",
                header: "Description",
                cell: ({ getValue }) => <span className="text-muted-foreground truncate max-w-[300px] block">{getValue<string>()}</span>,
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

    const table = useTable<Department>({
        columns,
        refineCoreProps: {
            resource: "departments",
            pagination: { pageSize: 10, mode: "server" },
            filters: {
                permanent: searchQuery ? [{ field: "name", operator: "contains", value: searchQuery }] : [],
            },
        },
    });

    return (
        <ListView>
            <Breadcrumb />
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold tracking-tight">Departments</h1>
                <CreateButton />
            </div>

            <div className="flex items-center gap-4 mb-6">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search departments..."
                        className="pl-9"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <DataTable table={table} />
        </ListView>
    );
};

export default DepartmentsList;
