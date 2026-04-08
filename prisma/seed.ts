import bcrypt from "bcryptjs";
import { PrismaClient, StatusMapping } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const email = "darshan@example.com";
  const passwordHash = await bcrypt.hash("password123", 10);

  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      name: "Darshan",
      email,
      passwordHash
    }
  });

  await prisma.customer.upsert({
    where: { name: "Acme Corp" },
    update: {},
    create: { name: "Acme Corp" }
  });

  await prisma.feature.upsert({
    where: { name: "Checkout" },
    update: {},
    create: { name: "Checkout" }
  });

  const processName = "Defect - Darshan";
  const existing = await prisma.processTemplate.findUnique({ where: { name: processName } });
  if (!existing) {
    await prisma.processTemplate.create({
      data: {
        name: processName,
        createdById: user.id,
        defaultOwnerId: user.id,
        participants: {
          create: [{ userId: user.id }]
        },
        statuses: {
          create: [
            { label: "New", mapping: StatusMapping.PENDING, order: 1 },
            { label: "In Progress", mapping: StatusMapping.PENDING, order: 2 },
            { label: "Resolved", mapping: StatusMapping.COMPLETED, order: 3 }
          ]
        },
        fields: {
          create: [
            {
              section: "Basic Information",
              label: "Date defect was reported",
              key: "dateDefectReported",
              type: "date",
              required: true,
              order: 1
            },
            {
              section: "Basic Information",
              label: "Customer",
              key: "customer",
              type: "link",
              linkedProcess: "customer",
              allowMultiple: false,
              required: true,
              order: 2
            },
            {
              section: "Defect Details",
              label: "Description of the defect",
              key: "description",
              type: "text",
              required: true,
              order: 3
            },
            {
              section: "Defect Details",
              label: "Category of the defect",
              key: "category",
              type: "single_select",
              options: ["Functional Bugs", "Logical Bugs", "Workflow Bugs", "Other"],
              required: true,
              order: 4
            },
            {
              section: "Defect Details",
              label: "Upload screenshots or any files shared by the customer",
              key: "screenshots",
              type: "file_upload",
              required: false,
              order: 5
            },
            {
              section: "Defect Details",
              label: "Feature",
              key: "feature",
              type: "link",
              linkedProcess: "feature",
              allowMultiple: false,
              required: true,
              order: 6
            },
            {
              section: "Related Tasks",
              label: "Related Tasks",
              key: "relatedTasks",
              type: "link",
              linkedProcess: "task",
              allowMultiple: true,
              showStatus: true,
              showOwner: true,
              showDueDate: true,
              required: false,
              order: 7
            }
          ]
        }
      }
    });
  }

  console.log("Seed completed.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
