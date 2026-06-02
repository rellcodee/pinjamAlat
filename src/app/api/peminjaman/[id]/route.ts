import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  const resolvedParams = await params;
  const id = Number(resolvedParams.id);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await db.peminjaman.findUnique({
      where: { id },
      include: {
        peminjam: true,
        petugas: true,
        details: {
          include: {
            alatUnit: {
              include: {
                alat: true
              }
            }
          }
        },
        pengembalian: {
          include: {
            petugas: true
          }
        }
      }
    });

    if (!data) {
      return NextResponse.json({ error: "Data not found" }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
