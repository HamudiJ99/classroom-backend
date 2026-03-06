import express from "express";
import { count, eq, sql } from "drizzle-orm";

import { db } from "../db/index.js";
import { departments, subjects, classes, enrollments, user } from "../db/schema/index.js";

const router = express.Router();

router.get("/overview", async (req, res) => {
    try {
        const [usersCount] = await db.select({ count: count() }).from(user);
        const [classesCount] = await db.select({ count: count() }).from(classes);
        const [enrollmentsCount] = await db.select({ count: count() }).from(enrollments);
        const [subjectsCount] = await db.select({ count: count() }).from(subjects);

        res.status(200).json({
            data: {
                totalUsers: usersCount?.count ?? 0,
                totalClasses: classesCount?.count ?? 0,
                totalEnrollments: enrollmentsCount?.count ?? 0,
                totalSubjects: subjectsCount?.count ?? 0,
            }
        });
    } catch (error) {
        console.error("GET /stats/overview error:", error);
        res.status(500).json({ error: "Failed to fetch overview stats" });
    }
});

router.get("/charts", async (req, res) => {
    try {
        // 1. Enrollment Trends (by month - simplified for now using createdAt)
        const enrollmentTrends = await db.select({
            month: sql<string>`to_char(${enrollments.createdAt}, 'Mon')`,
            count: count(),
        })
        .from(enrollments)
        .groupBy(sql`to_char(${enrollments.createdAt}, 'Mon')`);

        // 2. Classes by Department
        const classesByDept = await db.select({
            department: departments.name,
            count: count(classes.id),
        })
        .from(departments)
        .leftJoin(subjects, eq(departments.id, subjects.departmentId))
        .leftJoin(classes, eq(subjects.id, classes.subjectId))
        .groupBy(departments.name);

        // 3. Capacity Status (Enrolled vs Total Capacity)
        const capacityStatus = await db.select({
            className: classes.name,
            enrolled: count(enrollments.id),
            capacity: classes.capacity,
        })
        .from(classes)
        .leftJoin(enrollments, eq(classes.id, enrollments.classId))
        .groupBy(classes.id, classes.name, classes.capacity);

        // 4. User Distribution by Role
        const userDistribution = await db.select({
            role: user.role,
            count: count(),
        })
        .from(user)
        .groupBy(user.role);

        res.status(200).json({
            data: {
                enrollmentTrends,
                classesByDept,
                capacityStatus,
                userDistribution,
            }
        });
    } catch (error) {
        console.error("GET /stats/charts error:", error);
        res.status(500).json({ error: "Failed to fetch chart stats" });
    }
});

export default router;
