import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import ExcelJS from "exceljs";

export async function GET() {
    const session = await auth();

    // 🔐 PROTECT
    if (!session || session.user.role !== "petugas") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        // 🔥 AMBIL DATA
        const data = await db.peminjaman.findMany({
            include: {
                peminjam: true,
                details: {
                    include: {
                        alatUnit: {
                            include: {
                                alat: true
                            }
                        }
                    }
                }
            },
            orderBy: { id: "desc" }
        });

        // 📦 BUAT EXCEL
        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet("Peminjaman");

        // 🔥 TEMPLATE KOLOM
        sheet.columns = [
            { header: "ID", key: "id", width: 10 },
            { header: "Peminjam", key: "nama", width: 25 },
            { header: "Tanggal Pinjam", key: "pinjam", width: 20 },
            { header: "Target Kembali", key: "target", width: 20 },
            { header: "Durasi (Hari)", key: "durasi", width: 15 },
            { header: "Status", key: "status", width: 15 },
            { header: "Jumlah Unit", key: "jumlah", width: 15 },
            { header: "List Alat", key: "alat", width: 40 },
        ];

        // 🔥 STYLE HEADER
        sheet.getRow(1).font = { bold: true };
        sheet.getRow(1).alignment = { horizontal: "center" };

        // 🔥 ISI DATA
        data.forEach((p) => {
            const pinjam = new Date(p.tanggalPinjam);
            const target = new Date(p.tanggalRencanaKembali);
            const listAlat = p.details
                .map((d) => `${d.alatUnit.alat.nama} (${d.alatUnit.kodeUnit})`)
                .join(", ");

            const durasi = Math.ceil(
                (target.getTime() - pinjam.getTime()) /
                (1000 * 60 * 60 * 24)
            );

            sheet.addRow({
                id: p.id,
                nama: p.peminjam?.nama,
                pinjam: pinjam.toLocaleString("id-ID"),
                target: target.toLocaleString("id-ID"),
                durasi,
                status: p.status,
                jumlah: p.details.length,
                alat: listAlat,
            });
        });

        // 📤 EXPORT
        const buffer = await workbook.xlsx.writeBuffer();

        return new Response(buffer, {
            headers: {
                "Content-Type":
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                "Content-Disposition": "attachment; filename=peminjaman.xlsx",
            },
        });

    } catch (error) {
        console.error("EXPORT ERROR:", error);
        return NextResponse.json({ error: "Gagal export" }, { status: 500 });
    }
}