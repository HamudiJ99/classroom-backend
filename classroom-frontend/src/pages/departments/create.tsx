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
import { Textarea } from "@/components/ui/textarea.tsx";
import { Button } from "@/components/ui/button.tsx";

const DepartmentsCreate = () => {
    const { 
        refineCore: { onFinish, formLoading }, 
        handleSubmit, 
        control, 
        formState: { errors } 
    } = useForm({
        refineCoreProps: {
            resource: "departments",
            redirect: "list",
        },
    });

    return (
        <CreateView>
            <Breadcrumb />
            <div className="mb-6">
                <h1 className="text-3xl font-bold tracking-tight">Create Department</h1>
                <p className="text-muted-foreground text-sm mt-1">
                    Add a new academic department to the university system.
                </p>
            </div>

            <Form {...{ handleSubmit, control, formState: { errors } } as any}>
                <form onSubmit={handleSubmit(onFinish)} className="space-y-6 max-w-2xl">
                    <FormField
                        control={control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Department Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="e.g. Computer Science" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={control}
                        name="code"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Department Code</FormLabel>
                                <FormControl>
                                    <Input placeholder="e.g. CS" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={control}
                        name="description"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Description</FormLabel>
                                <FormControl>
                                    <Textarea 
                                        placeholder="Brief description of the department's focus..." 
                                        className="min-h-[100px]"
                                        {...field} 
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <div className="flex justify-end gap-4">
                        <Button type="submit" disabled={formLoading}>
                            {formLoading ? "Creating..." : "Create Department"}
                        </Button>
                    </div>
                </form>
            </Form>
        </CreateView>
    );
};

export default DepartmentsCreate;
