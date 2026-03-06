import express from "express";
import { and, eq, getTableColumns, sql } from "drizzle-orm";

import { db } from "../db/index.js";
import { enrollments, classes, user } from "../db/schema/index.js";

const router = express.Router();

// Get all enrollments (optional: by class or student)
router.get("/", async (req, res) => {
    try {
        const { classId, studentId, page = 1, limit = 10 } = req.query;

        const currentPage = Math.max(1, parseInt(String(page), 10) || 1);
        const limitPerPage = Math.min(Math.max(1, parseInt(String(limit), 10) || 10), 100);
        const offset = (currentPage - 1) * limitPerPage;

        const filterConditions = [];
        if (classId) filterConditions.push(eq(enrollments.classId, Number(classId)));
        if (studentId) filterConditions.push(eq(enrollments.studentId, String(studentId)));

        const whereClause = filterConditions.length > 0 ? and(...filterConditions) : undefined;

        const countResult = await db
            .select({ count: sql<number>`count(*)` })
            .from(enrollments)
            .where(whereClause);

        const totalCount = countResult[0]?.count ?? 0;

        const enrollmentsList = await db
            .select({
                ...getTableColumns(enrollments),
                class: {
                    id: classes.id,
                    name: classes.name,
                },
                student: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                },
            })
            .from(enrollments)
            .leftJoin(classes, eq(enrollments.classId, classes.id))
            .leftJoin(user, eq(enrollments.studentId, user.id))
            .where(whereClause)
            .limit(limitPerPage)
            .offset(offset);

        res.status(200).json({
            data: enrollmentsList,
            pagination: {
                page: currentPage,
                limit: limitPerPage,
                total: totalCount,
                totalPages: Math.ceil(totalCount / limitPerPage),
            },
        });
    } catch (error) {
        console.error("GET /enrollments error:", error);
        res.status(500).json({ error: "Failed to fetch enrollments" });
    }
});

// Enroll a student in a class
router.post("/", async (req, res) => {
    try {
        const { studentId, classId } = req.body;

        if (!studentId || !classId) {
            return res.status(400).json({ error: "studentId and classId are required" });
        }

        // Check if already enrolled
        const [existing] = await db
            .select()
            .from(enrollments)
            .where(and(eq(enrollments.studentId, studentId), eq(enrollments.classId, classId)));

        if (existing) {
            return res.status(400).json({ error: "Student is already enrolled in this class" });
        }

        // Check class capacity
        const [classData] = await db
            .select({ capacity: classes.capacity })
            .from(classes)
            .where(eq(classes.id, classId));

        if (!classData) {
            return res.status(404).json({ error: "Class not found" });
        }

        const countResult = await db
            .select({ count: sql<number>`count(*)` })
            .from(enrollments)
            .where(eq(enrollments.classId, classId));
        
        const currentEnrollments = countResult[0]?.count ?? 0;

        if (currentEnrollments >= classData.capacity) {
            return res.status(400).json({ error: "Class has reached its maximum capacity" });
        }

        const [newEnrollment] = await db
            .insert(enrollments)
            .values({ studentId, classId })
            .returning();

        res.status(201).json({ data: newEnrollment });
    } catch (error) {
        console.error("POST /enrollments error:", error);
        res.status(500).json({ error: "Failed to enroll student" });
    }
});

// Unenroll a student (by enrollment ID or studentId+classId)
router.delete("/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (isNaN(id)) {
            // Support deleting by query params if ID is not a number (optional strategy)
            const { studentId, classId } = req.query;
            if (studentId && classId) {
                const [deleted] = await db
                    .delete(enrollments)
                    .where(and(eq(enrollments.studentId, String(studentId)), eq(enrollments.classId, Number(classId))))
                    .returning();
                if (!deleted) return res.status(404).json({ error: "Enrollment not found" });
                return res.status(200).json({ data: deleted });
            }
            return res.status(400).json({ error: "Invalid enrollment ID" });
        }

        const [deletedEnrollment] = await db
            .delete(enrollments)
            .where(eq(enrollments.id, id))
            .returning();

        if (!deletedEnrollment) {
            return res.status(404).json({ error: "Enrollment not found" });
        }

        res.status(200).json({ data: deletedEnrollment });
    } catch (error) {
        console.error("DELETE /enrollments/:id error:", error);
        res.status(500).json({ error: "Failed to unenroll student" });
    }
});

export default router;
