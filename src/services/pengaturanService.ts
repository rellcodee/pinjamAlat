import { db } from "@/lib/db";
import { logActivity } from "./logService";

export async function getPengaturan(kunci: string) {
    const setting = await db.pengaturan.findUnique({
        where: { kunci }
    });
    return setting ? setting.nilai : null;
}

export async function setPengaturan(kunci: string, nilai: string, currentUserId: number) {
    const existing = await db.pengaturan.findUnique({ where: { kunci } });

    let pengaturan;
    if (existing) {
        pengaturan = await db.pengaturan.update({
            where: { kunci },
            data: { nilai }
        });
    } else {
        pengaturan = await db.pengaturan.create({
            data: { kunci, nilai }
        });
    }

    await logActivity(
        currentUserId,
        "UPDATE_SETTING",
        `Mengupdate pengaturan ${kunci} menjadi ${nilai}`
    );

    return pengaturan;
}
