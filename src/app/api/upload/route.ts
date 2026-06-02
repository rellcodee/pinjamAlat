import { NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import path from "path";
import { auth } from "@/auth";

export async function POST(req: Request) {
    const session = await auth();

    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const formData = await req.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json({ error: "No file received." }, { status: 400 });
        }

        // Validate size (< 2MB)
        if (file.size > 2 * 1024 * 1024) {
             return NextResponse.json({ error: "File size exceeds 2MB limit." }, { status: 400 });
        }

        // Validate type (jpg, jpeg, png)
        if (!["image/jpeg", "image/png", "image/jpg"].includes(file.type)) {
            return NextResponse.json({ error: "Unsupported file format. Use JPG or PNG." }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const filename = `${Date.now()}-${file.name.replace(/\s/g, "_")}`;
        const filePath = path.join(process.cwd(), "public/uploads", filename);

        await writeFile(filePath, buffer);

        return NextResponse.json({ url: `/uploads/${filename}` });
    } catch (error: any) {
        console.error("Upload Error:", error);
        return NextResponse.json({ error: "Upload failed." }, { status: 500 });
    }
}
