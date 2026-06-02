import { db } from "./db";

/**
 * Reusable function to create notifications for multiple users
 * @param userIds Array of user IDs to receive the notification
 * @param title Notification title
 * @param message Notification message
 * @param type Notification type (INFO, WARNING, SUCCESS, DANGER)
 */
export async function createNotifications(
    userIds: number[],
    title: string,
    message: string,
    type: string = "INFO",
    link?: string
) {
    if (userIds.length === 0) return null;

    const data = userIds.map((userId) => ({
        userId,
        title,
        message,
        type,
        link,
    }));

    return await db.notification.createMany({
        data,
    });
}
