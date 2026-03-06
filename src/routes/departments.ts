import express from "express";
import { and, desc, eq, getTableColumns, ilike, or, sql } from "drizzle-orm";

import { db } from "../db/index.js";
import { departments } from "../db/schema/index.js";

const router = express.Router();

// Get all departments with optional search and pagination
router.get("/", async (req, res) => {
    try {
        const { search, page = 1, limit = 10 } = req.query;

        const currentPage = Math.max(1, parseInt(String(page), 10) || 1);
        const limitPerPage = Math.min(Math.max(1, parseInt(String(limit), 10) || 10), 100);
        const offset = (currentPage - 1) * limitPerPage;

        const filterConditions = [];

        if (search) {
            filterConditions.push(
                or(
                    ilike(departments.name, `%${search}%`),
                    ilike(departments.code, `%${search}%`)
                )
            );
        }

        const whereClause =
            filterConditions.length > 0 ? and(...filterConditions) : undefined;

        // Count query
        const countResult = await db
            .select({ count: sql<number>`count(*)` })
            .from(departments)
            .where(whereClause);

        const totalCount = countResult[0]?.count ?? 0;

        // Data query
        const departmentsList = await db
            .select()
            .from(departments)
            .where(whereClause)
            .orderBy(desc(departments.createdAt))
            .limit(limitPerPage)
            .offset(offset);

        res.status(200).json({
            data: departmentsList,
            pagination: {
                page: currentPage,
                limit: limitPerPage,
                total: totalCount,
                totalPages: Math.ceil(totalCount / limitPerPage),
            },
        });
    } catch (error) {
        console.error("GET /departments error:", error);
        res.status(500).json({ error: "Failed to fetch departments" });
    }
});

// Get department by ID
router.get("/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({ error: "Invalid department ID" });
        }

        const [department] = await db
            .select()
            .from(departments)
            .where(eq(departments.id, id));

        if (!department) {
            return res.status(404).json({ error: "Department not found" });
        }

        res.status(200).json({ data: department });
    } catch (error) {
        console.error("GET /departments/:id error:", error);
        res.status(500).json({ error: "Failed to fetch department" });
    }
});

// Create department
router.post("/", async (req, res) => {
    try {
        const { name, code, description } = req.body;

        if (!name || !code) {
            return res.status(400).json({ error: "Name and code are required" });
        }

        const [newDepartment] = await db
            .insert(departments)
            .values({ name, code, description })
            .returning();

        res.status(201).json({ data: newDepartment });
    } catch (error) {
        console.error("POST /departments error:", error);
        res.status(500).json({ error: "Failed to create department" });
    }
});

// Update department
router.put("/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);
        const { name, code, description } = req.body;

        if (isNaN(id)) {
            return res.status(400).json({ error: "Invalid department ID" });
        }

        const [updatedDepartment] = await db
            .update(departments)
            .set({ name, code, description })
            .where(eq(departments.id, id))
            .returning();

        if (!updatedDepartment) {
            return res.status(404).json({ error: "Department not found" });
        }

        res.status(200).json({ data: updatedDepartment });
    } catch (error) {
        console.error("PUT /departments/:id error:", error);
        res.status(500).json({ error: "Failed to update department" });
    }
});

// Delete department
router.delete("/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({ error: "Invalid department ID" });
        }

        // Note: Subjects have a 'restrict' onDelete on departmentId, so deletion will fail if subjects exist
        const [deletedDepartment] = await db
            .delete(departments)
            .where(eq(departments.id, id))
            .returning();

        if (!deletedDepartment) {
            return res.status(404).json({ error: "Department not found" });
        }

        res.status(200).json({ data: deletedDepartment });
    } catch (error) {
        console.error("DELETE /departments/:id error:", error);
        res.status(500).json({ error: "Failed to delete department (it might be linked to subjects)" });
    }
});

export default router;
