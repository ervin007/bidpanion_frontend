import { db } from "../src/server/db";

async function main() {
  const result = await db.tender.updateMany({
    where: {
      processingStatus: { in: ["PROCESSING", "QUEUED"] }
    },
    data: {
      processingStatus: "COMPLETED"
    }
  });
  console.log(`Successfully reset ${result.count} stuck tenders to COMPLETED status.`);
}

main().catch(console.error);
