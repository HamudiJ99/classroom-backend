import { useApiUrl, useCustom } from "@refinedev/core";
import { 
    Users, 
    GraduationCap, 
    BookOpen, 
    TrendingUp, 
    BarChart3, 
    PieChart as PieChartIcon, 
    School
} from "lucide-react";
import { 
    Card, 
    CardContent, 
    CardHeader, 
    CardTitle, 
    CardDescription 
} from "@/components/ui/card";
import { 
    ResponsiveContainer, 
    AreaChart, 
    Area, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    BarChart, 
    Bar, 
    PieChart, 
    Pie, 
    Cell,
    Legend
} from "recharts";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

const Dashboard = () => {
    const apiUrl = useApiUrl();

    const { data: overview, isLoading: overviewLoading } = useCustom({
        url: `${apiUrl}/stats/overview`,
        method: "get",
    });

    const { data: charts, isLoading: chartsLoading } = useCustom({
        url: `${apiUrl}/stats/charts`,
        method: "get",
    });

    const stats = [
        {
            title: "Total Users",
            value: overview?.data?.data?.totalUsers ?? 0,
            icon: Users,
            description: "Registered students, teachers & admins",
            color: "text-blue-600",
        },
        {
            title: "Total Classes",
            value: overview?.data?.data?.totalClasses ?? 0,
            icon: School,
            description: "Active classes across all departments",
            color: "text-green-600",
        },
        {
            title: "Total Enrollments",
            value: overview?.data?.data?.totalEnrollments ?? 0,
            icon: GraduationCap,
            description: "Students enrolled in various classes",
            color: "text-purple-600",
        },
        {
            title: "Total Subjects",
            value: overview?.data?.data?.totalSubjects ?? 0,
            icon: BookOpen,
            description: "Courses offered by the university",
            color: "text-orange-600",
        },
    ];

    if (overviewLoading || chartsLoading) {
        return <div className="flex items-center justify-center h-full">Loading Dashboard...</div>;
    }

    const chartData = charts?.data?.data;

    return (
        <div className="space-y-8 p-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
                <p className="text-muted-foreground">Welcome to the Classroom Management System admin panel.</p>
            </div>

            {/* Overview Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => (
                    <Card key={stat.title}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                            <stat.icon className={`h-4 w-4 ${stat.color}`} />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stat.value}</div>
                            <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                {/* Enrollment Trends */}
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5" />
                            Enrollment Trends
                        </CardTitle>
                        <CardDescription>Monthly enrollment growth</CardDescription>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData?.enrollmentTrends}>
                                    <defs>
                                        <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                                            <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                                    <XAxis dataKey="month" className="text-xs" />
                                    <YAxis className="text-xs" />
                                    <Tooltip />
                                    <Area type="monotone" dataKey="count" stroke="#8884d8" fillOpacity={1} fill="url(#colorCount)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* User Distribution */}
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <PieChartIcon className="h-5 w-5" />
                            User Distribution
                        </CardTitle>
                        <CardDescription>Breakdown by role</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={chartData?.userDistribution}
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="count"
                                        nameKey="role"
                                    >
                                        {chartData?.userDistribution?.map((entry: any, index: number) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                {/* Classes by Department */}
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BarChart3 className="h-5 w-5" />
                            Classes by Department
                        </CardTitle>
                        <CardDescription>Distribution across departments</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData?.classesByDept} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                                    <XAxis type="number" className="text-xs" />
                                    <YAxis dataKey="department" type="category" className="text-xs" width={100} />
                                    <Tooltip />
                                    <Bar dataKey="count" fill="#82ca9d" radius={[0, 4, 4, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Capacity Status */}
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5" />
                            Class Capacity Status
                        </CardTitle>
                        <CardDescription>Enrolled students vs. total capacity</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData?.capacityStatus?.slice(0, 10)}>
                                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                                    <XAxis dataKey="className" className="text-xs" />
                                    <YAxis className="text-xs" />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="enrolled" fill="#8884d8" name="Enrolled" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="capacity" fill="#eee" name="Total Capacity" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default Dashboard;
