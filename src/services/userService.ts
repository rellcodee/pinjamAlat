import { Role } from "@/generated/prisma/enums";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { logActivity } from "./logService";
// GET ALL USERS
export async function getAllUsers() {
    return await db.user.findMany({
        where: {
            deletedAt: null
        },
        select: {
            id: true,
            nama: true,
            username: true,
            role: true,
            kelas: true,
            noTelp: true
        }
    });
}

// GET USER BY ID
export async function getUserById(id: number) {
    return await db.user.findFirst({
        where: {
            id,
            deletedAt: null
        },
        select: {
            id: true,
            nama: true,
            username: true,
            role: true,
            kelas: true,
            noTelp: true
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
    kelas: string,
    noTelp: string,
    currentUserId: number
) {
    try {
        const exists = await db.user.findFirst({
            where: {
                username,
                ...(id && { NOT: { id } })
            }
        });

        if (exists) throw new Error("Username sudah dipakai");

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await db.user.create({
            data: {
                nama,
                username,
                password: hashedPassword,
                role,
                kelas,
                noTelp
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
    kelas: string,
    noTelp: string,
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
                kelas,
                noTelp,
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
        const user = await db.user.findUnique({ where: { id } });
        if (!user) throw new Error("User tidak ditemukan");

        const updated = await db.user.update({    // 👈 GANTI dari delete() ke update()
            where: { id },
            data: { deletedAt: new Date() }       // 👈 ISI deletedAt dengan waktu sekarang
        });

        await logActivity(currentUserId, "DELETE_USER", `Menghapus user ${user.username}`);
        return updated;
    } catch (error: any) {
        throw new Error(error.message);
    }
}

// export async function deleteUser(id: number, currentUserId: number) {

//     try {
//         const user = await db.user.delete({
//             where: { id },
//         });
//         await logActivity(
//             currentUserId,
//             "DELETE_USER",
//             `Menghapus user ${user.username}`
//         );
//         return user;
//     }
//     catch (error: any) {
//         throw new Error(error.message);
//     }
// }