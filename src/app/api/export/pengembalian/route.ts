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
        const data = await db.pengembalian.findMany({
            include: {
                peminjaman: {
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
                    }
                },
                petugas: true
            },
            orderBy: { id: "desc" }
        });

        // 📦 EXCEL
        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet("Pengembalian");

        // 🔥 KOLOM
        sheet.columns = [
            { header: "ID", key: "id", width: 10 },
            { header: "Peminjam", key: "nama", width: 25 },
            { header: "Petugas", key: "petugas", width: 25 },
            { header: "Tanggal Pinjam", key: "pinjam", width: 20 },
            { header: "Target Kembali", key: "target", width: 20 },
            { header: "Tanggal Kembali", key: "kembali", width: 20 },
            { header: "Durasi (Hari)", key: "durasi", width: 15 },
            { header: "Terlambat (Hari)", key: "telat", width: 18 },
            { header: "Total Denda", key: "denda", width: 18 },
            { header: "Jumlah Unit", key: "jumlah", width: 15 },
            { header: "List Alat", key: "alat", width: 45 },
        ];

        // 🔥 HEADER STYLE
        sheet.getRow(1).font = { bold: true };
        sheet.getRow(1).alignment = { horizontal: "center" };

        // 🔥 FORMAT RUPIAH
        const formatRupiah = (n: number) =>
            `Rp ${n.toLocaleString("id-ID")}`;

        // 🔥 LOOP DATA
        data.forEach((p) => {
            const pinjam = new Date(p.peminjaman.tanggalPinjam);
            const target = new Date(p.peminjaman.tanggalRencanaKembali);
            const kembali = new Date(p.tanggalKembaliAktual);

            const durasi = Math.ceil(
                (target.getTime() - pinjam.getTime()) /
                (1000 * 60 * 60 * 24)
            );

            const listAlat = p.peminjaman.details
                .map((d) => `${d.alatUnit.alat.nama} (${d.alatUnit.kodeUnit})`)
                .join(", ");

            sheet.addRow({
                id: p.id,
                nama: p.peminjaman.peminjam?.nama,
                petugas: p.petugas?.nama,
                pinjam: pinjam.toLocaleString("id-ID"),
                target: target.toLocaleString("id-ID"),
                kembali: kembali.toLocaleString("id-ID"),
                durasi,
                telat: p.jumlahHariTerlambat,
                denda: p.totalDenda > 0 ? formatRupiah(p.totalDenda) : "-",
                jumlah: p.peminjaman.details.length,
                alat: listAlat,
            });
        });

        // 📤 EXPORT
        const buffer = await workbook.xlsx.writeBuffer();

        return new Response(buffer, {
            headers: {
                "Content-Type":
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                "Content-Disposition": "attachment; filename=pengembalian.xlsx",
            },
        });

    } catch (error) {
        console.error("EXPORT ERROR:", error);
        return NextResponse.json({ error: "Gagal export" }, { status: 500 });
    }
}