import { adminDb } from "@/lib/firebase-admin";
import { getServerSession } from "@/lib/auth-server";
import { NextResponse } from "next/server";

export async function PATCH(req, { params }) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { lastAccessedChapter } = await req.json();

    if (typeof lastAccessedChapter !== "number" || lastAccessedChapter < 0) {
      return NextResponse.json(
        { message: "Invalid lastAccessedChapter. Must be a non-negative number." },
        { status: 400 }
      );
    }

    const courseRef = adminDb
      .collection("users")
      .doc(session.user.email)
      .collection("roadmaps")
      .doc(id);

    const courseSnap = await courseRef.get();

    if (!courseSnap.exists) {
      return NextResponse.json({ message: "Course not found" }, { status: 404 });
    }

    await courseRef.update({
      lastAccessedAt: new Date().toISOString(),
      lastAccessedChapter: lastAccessedChapter,
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: "Progress updated",
      lastAccessedAt: new Date().toISOString(),
      lastAccessedChapter,
    });
  } catch (error) {
    console.error("Error updating course progress:", error);
    return NextResponse.json(
      { message: "Failed to update progress", error: error.message },
      { status: 500 }
    );
  }
}
