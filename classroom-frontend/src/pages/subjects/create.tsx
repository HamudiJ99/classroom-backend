import { CreateView } from "@/components/refine-ui/views/create-view.tsx";
import { Breadcrumb } from "@/components/refine-ui/layout/breadcrumb.tsx";
import { useForm } from "@refinedev/react-hook-form";
import { useSelect } from "@refinedev/core";
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
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from "@/components/ui/select.tsx";

const SubjectsCreate = () => {
    const { 
        refineCore: { onFinish, formLoading }, 
        handleSubmit, 
        control, 
        formState: { errors } 
    } = useForm({
        refineCoreProps: {
            resource: "subjects",
            redirect: "list",
        },
    });

    const { options: departmentOptions } = useSelect({
        resource: "departments",
        optionLabel: "name",
        optionValue: "id",
    });

    return (
        <CreateView>
            <Breadcrumb />
            <div className="mb-6">
                <h1 className="text-3xl font-bold tracking-tight">Create Subject</h1>
                <p className="text-muted-foreground text-sm mt-1">
                    Add a new course subject to a department.
                </p>
            </div>

            <Form {...{ handleSubmit, control, formState: { errors } } as any}>
                <form onSubmit={handleSubmit(onFinish)} className="space-y-6 max-w-2xl">
                    <FormField
                        control={control}
                        name="departmentId"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Department</FormLabel>
                                <Select 
                                    onValueChange={(value) => field.onChange(Number(value))}
                                    value={field.value?.toString()}
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a department" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {departmentOptions?.map((option) => (
                                            <SelectItem key={option.value} value={option.value.toString()}>
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Subject Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="e.g. Algorithms & Data Structures" {...field} />
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
                                <FormLabel>Subject Code</FormLabel>
                                <FormControl>
                                    <Input placeholder="e.g. CS101" {...field} />
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
                                        placeholder="Brief description of the course content..." 
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
                            {formLoading ? "Creating..." : "Create Subject"}
                        </Button>
                    </div>
                </form>
            </Form>
        </CreateView>
    );
};

export default SubjectsCreate;
