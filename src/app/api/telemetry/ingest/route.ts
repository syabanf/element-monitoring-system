import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const ingestSchema = z.object({
  sensorId: z.string(),
  timestamp: z.string().optional(),
  metricName: z.string(),
  metricValue: z.number(),
  unit: z.string(),
  qualityStatus: z.enum(["GOOD", "UNCERTAIN", "BAD", "MISSING"]).optional(),
  sourceProtocol: z.string().optional(),
  gatewayId: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = ingestSchema.parse(body);

    const reading = await prisma.telemetryReading.create({
      data: {
        sensorId: data.sensorId,
        timestamp: data.timestamp ? new Date(data.timestamp) : new Date(),
        metricName: data.metricName,
        metricValue: data.metricValue,
        unit: data.unit,
        qualityStatus: (data.qualityStatus ?? "GOOD") as any,
        sourceProtocol: data.sourceProtocol,
        gatewayId: data.gatewayId,
      },
    });

    // Update sensor last reading
    await prisma.sensor.update({
      where: { id: data.sensorId },
      data: { lastReadingAt: reading.timestamp, lastValue: data.metricValue },
    });

    return NextResponse.json(reading, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
