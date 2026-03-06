import { CreateView } from "@/components/refine-ui/views/create-view.tsx";
import { Breadcrumb } from "@/components/refine-ui/layout/breadcrumb.tsx";
import { useForm } from "@refinedev/react-hook-form";
import { 
    Form, 
    FormControl, 
    FormField, 
    FormItem, 
    FormLabel, 
    FormMessage 
} from "@/components/ui/form.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Button } from "@/components/ui/button.tsx";
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from "@/components/ui/select.tsx";
import { UserRole } from "@/types";

const UsersCreate = () => {
    const { 
        refineCore: { onFinish, formLoading }, 
        handleSubmit, 
        control, 
        formState: { errors } 
    } = useForm({
        refineCoreProps: {
            resource: "users",
            redirect: "list",
        },
    });

    return (
        <CreateView>
            <Breadcrumb />
            <div className="mb-6">
                <h1 className="text-3xl font-bold tracking-tight">Create User</h1>
                <p className="text-muted-foreground text-sm mt-1">
                    Add a new student, teacher, or admin to the platform.
                </p>
            </div>

            <Form {...{ handleSubmit, control, formState: { errors } } as any}>
                <form onSubmit={handleSubmit(onFinish)} className="space-y-6 max-w-2xl">
                    <FormField
                        control={control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Full Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="John Doe" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Email Address</FormLabel>
                                <FormControl>
                                    <Input type="email" placeholder="john@example.com" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={control}
                        name="role"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Role</FormLabel>
                                <Select 
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a role" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value={UserRole.STUDENT}>Student</SelectItem>
                                        <SelectItem value={UserRole.TEACHER}>Teacher</SelectItem>
                                        <SelectItem value={UserRole.ADMIN}>Admin</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <div className="flex justify-end gap-4">
                        <Button type="submit" disabled={formLoading}>
                            {formLoading ? "Creating..." : "Create User"}
                        </Button>
                    </div>
                </form>
            </Form>
        </CreateView>
    );
};

export default UsersCreate;
