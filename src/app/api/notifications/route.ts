import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { 
    getNotifications, 
    markAllAsRead, 
    checkDeadlineReminders,
    deleteAllNotifications 
} from "@/services/notificationService";


export async function GET(request: Request) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    try {
        const notifications = await getNotifications(parseInt(session.user.id), page, limit);
        return NextResponse.json(notifications);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT() {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        await markAllAsRead(parseInt(session.user.id));
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE() {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        await deleteAllNotifications(parseInt(session.user.id));
        return NextResponse.json({ success: true });
    } catch (error: any) {

        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}


// Optional: Endpoint to trigger deadline reminders (can be called by Cron)
export async function POST(request: Request) {
    // Basic security check (e.g., specific header or from local/trusted source)
    // For now, let's just allow it for testing or add a simple secret
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get("secret");
    
    if (secret !== process.env.CRON_SECRET && process.env.NODE_ENV === 'production') {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    try {
        const count = await checkDeadlineReminders();
        return NextResponse.json({ success: true, remindersSent: count });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
