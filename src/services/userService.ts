import { Role } from "@/generated/prisma/enums";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { logActivity } from "./logService";
// GET ALL USERS
export async function getAllUsers() {
    return await db.user.findMany({
        select: {
            id: true,
            nama: true,
            username: true,
            role: true
        }
    });
}

// POST
export async function createUser(
    id: number,
    nama: string,
    username: string,
    password: string,
    role: Role,
    currentUserId: number
) {
    try {
        const exists = await db.user.findFirst({
            where: {
                username,
                NOT: { id }
            }
        });

        if (exists) throw new Error("Username sudah dipakai");

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await db.user.create({
            data: {
                nama,
                username,
                password: hashedPassword,
                role
            },
        });
        await logActivity(
            currentUserId,
            "CREATE_USER",
            `Membuat user ${username}`
        );
        return user;
    }
    catch (error: any) {
        throw new Error(error.message);
    }
}

// Edit
export async function updateUser(
    id: number,
    nama: string,
    username: string,
    password: string,
    role: Role,
    currentUserId: number
) {
    try {

        const exists = await db.user.findFirst({
            where: {
                username,
                NOT: { id }
            }
        });

        if (exists) throw new Error("Username sudah dipakai");

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await db.user.findUnique({ where: { id } });
        if (!user) throw new Error("User tidak ditemukan");


        await logActivity(
            currentUserId,
            "UPDATE_USER",
            `Mengupdate user ${username}`
        );
        return db.user.update({
            where: { id },
            data: {
                nama,
                username,
                role,
                ...(password && { password: hashedPassword })
            },
        });
    }
    catch (error: any) {
        throw new Error(error.message);
    }
}

// Delete
export async function deleteUser(id: number, currentUserId: number) {

    try {
        const user = await db.user.delete({
            where: { id },
        });
        await logActivity(
            currentUserId,
            "DELETE_USER",
            `Menghapus user ${user.username}`
        );
        return user;
    }
    catch (error: any) {
        throw new Error(error.message);
    }
}