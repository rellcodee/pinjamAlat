import { db } from "@/lib/db";
import { logActivity } from "./logService";
import { StatusUnit, Kondisi } from "@/generated/prisma/enums";


// GET ALL
export async function getAllAlatUnit() {
    return db.alatUnit.findMany({
        include: {
            alat: true
        },
        orderBy: {
            id: "desc"
        }
    });
}

function generateKode(nama: string, lastNumber: number) {
    const words = nama.split(" ");
    const prefix = words.map(w => w[0]).join("").toUpperCase();
    const number = String(lastNumber + 1).padStart(3, "0");

    return `${prefix}${number}`;
}

export async function createAlatUnit(
    alatId: number,
    currentUserId: number
) {
    const alat = await db.alat.findUnique({
        where: { id: alatId }
    });

    if (!alat) throw new Error("Alat tidak ditemukan");

    const count = await db.alatUnit.count({
        where: { alatId: alatId }
    });

    const kode = generateKode(alat.nama, count);

    const unit = await db.alatUnit.create({
        data: {
            alatId: alatId,
            kodeUnit: kode,
            kondisi: "baik",
            status: "tersedia"
        }
    });

    await logActivity(
        currentUserId,
        "CREATE_UNIT",
        `Menambahkan unit ${kode} : ${alat.nama}`
    );

    return unit;
}

export async function updateAlatUnit(
    id: number,
    status: StatusUnit,
    kondisi: Kondisi,
    currentUserId: number
) {
    const unit = await db.alatUnit.findUnique({
        where: { id },
        include: { alat: true },
    });

    if (!unit) throw new Error("Unit tidak ditemukan");

    // VALIDASI ENUM (PENTING)
    const validStatus = ["tersedia", "dipinjam", "tidak_tersedia"];
    const validKondisi = ["baik", "rusak_ringan", "rusak_berat"];

    if (!validStatus.includes(status)) {
        throw new Error("Status tidak valid");
    }

    if (!validKondisi.includes(kondisi)) {
        throw new Error("Kondisi tidak valid");
    }

    const updated = await db.alatUnit.update({
        where: { id },
        data: {
            status,
            kondisi
        }
    });

    await logActivity(
        currentUserId,
        "UPDATE_UNIT",
        `Update unit ${unit.kodeUnit} : ${unit.alat.nama}`
    );

    return updated;
}

export async function deleteAlatUnit(
    id: number,
    currentUserId: number
) {
    const unit = await db.alatUnit.findUnique({
        where: { id },
        include: { alat: true }
    });

    if (!unit) throw new Error("Unit tidak ditemukan");

    const deleted = await db.alatUnit.delete({
        where: { id }
    });

    await logActivity(
        currentUserId,
        "DELETE_UNIT",
        `Menghapus unit ${unit.kodeUnit} : ${unit.alat.nama}`
    );

    return deleted;
}