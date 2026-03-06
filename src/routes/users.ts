import express from "express";
import { eq, ilike, or, and, desc, sql, getTableColumns } from "drizzle-orm";

import { db } from "../db/index.js";
import { user } from "../db/schema/index.js";

const router = express.Router();

// Get all users with optional search, role filter, and pagination
router.get("/", async (req, res) => {
    try {
        const { search, role, page = 1, limit = 10 } = req.query;

        const currentPage = Math.max(1, parseInt(String(page), 10) || 1);
        const limitPerPage = Math.min(Math.max(1, parseInt(String(limit), 10) || 10), 100);
        const offset = (currentPage - 1) * limitPerPage;

        const filterConditions = [];

        if (search) {
            filterConditions.push(
                or(
                    ilike(user.name, `%${search}%`),
                    ilike(user.email, `%${search}%`)
                )
            );
        }

        if (role) {
            filterConditions.push(eq(user.role, role as any));
        }

        const whereClause =
            filterConditions.length > 0 ? and(...filterConditions) : undefined;

        // Count query
        const countResult = await db
            .select({ count: sql<number>`count(*)` })
            .from(user)
            .where(whereClause);

        const totalCount = countResult[0]?.count ?? 0;

        // Data query
        const usersList = await db
            .select({
                ...getTableColumns(user),
            })
            .from(user)
            .where(whereClause)
            .orderBy(desc(user.createdAt))
            .limit(limitPerPage)
            .offset(offset);

        res.status(200).json({
            data: usersList,
            pagination: {
                page: currentPage,
                limit: limitPerPage,
                total: totalCount,
                totalPages: Math.ceil(totalCount / limitPerPage),
            },
        });
    } catch (error) {
        console.error("GET /users error:", error);
        res.status(500).json({ error: "Failed to fetch users" });
    }
});

// Get user by ID
router.get("/:id", async (req, res) => {
    try {
        const id = req.params.id;

        const [userDetails] = await db
            .select()
            .from(user)
            .where(eq(user.id, id));

        if (!userDetails) {
            return res.status(404).json({ error: "User not found" });
        }

        res.status(200).json({ data: userDetails });
    } catch (error) {
        console.error("GET /users/:id error:", error);
        res.status(500).json({ error: "Failed to fetch user" });
    }
});

// Create user (Note: This is normally handled by Better Auth, but for Admin CRUD we might need it)
router.post("/", async (req, res) => {
    try {
        const { name, email, role, image, imageCldPubId } = req.body;

        if (!name || !email) {
            return res.status(400).json({ error: "Name and email are required" });
        }

        // Generate a random ID for manual insertion if not using Better Auth's sign-up
        const id = Math.random().toString(36).substring(2, 15);

        const [newUser] = await db
            .insert(user)
            .values({
                id,
                name,
                email,
                role: role || "student",
                image,
                imageCldPubId,
                emailVerified: false,
            })
            .returning();

        res.status(201).json({ data: newUser });
    } catch (error) {
        console.error("POST /users error:", error);
        res.status(500).json({ error: "Failed to create user" });
    }
});

// Update user
router.put("/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const { name, email, role, image, imageCldPubId } = req.body;

        const [updatedUser] = await db
            .update(user)
            .set({ name, email, role, image, imageCldPubId })
            .where(eq(user.id, id))
            .returning();

        if (!updatedUser) {
            return res.status(404).json({ error: "User not found" });
        }

        res.status(200).json({ data: updatedUser });
    } catch (error) {
        console.error("PUT /users/:id error:", error);
        res.status(500).json({ error: "Failed to update user" });
    }
});

// Delete user
router.delete("/:id", async (req, res) => {
    try {
        const id = req.params.id;

        const [deletedUser] = await db
            .delete(user)
            .where(eq(user.id, id))
            .returning();

        if (!deletedUser) {
            return res.status(404).json({ error: "User not found" });
        }

        res.status(200).json({ data: deletedUser });
    } catch (error) {
        console.error("DELETE /users/:id error:", error);
        res.status(500).json({ error: "Failed to delete user" });
    }
});

export default router;
