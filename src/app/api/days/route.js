import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const days = await prisma.day.findMany({
      orderBy: {
        id: "asc",
      },
      include: {
        topics: {
          orderBy: {
            id: "asc",
          },
        },
      },
    });

    return NextResponse.json(days);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: error.message,
      },
      {
        status: 500,
      }
    );
  }
}