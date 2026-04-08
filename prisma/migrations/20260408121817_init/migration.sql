-- CreateEnum
CREATE TYPE "StatusMapping" AS ENUM ('PENDING', 'COMPLETED');

-- CreateEnum
CREATE TYPE "DefectCategory" AS ENUM ('FUNCTIONAL_BUGS', 'LOGICAL_BUGS', 'WORKFLOW_BUGS', 'OTHER');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProcessTemplate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "defaultOwnerId" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProcessTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProcessParticipant" (
    "id" TEXT NOT NULL,
    "processId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "ProcessParticipant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProcessStatus" (
    "id" TEXT NOT NULL,
    "processId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "mapping" "StatusMapping" NOT NULL,

    CONSTRAINT "ProcessStatus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChecklistField" (
    "id" TEXT NOT NULL,
    "processId" TEXT NOT NULL,
    "section" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "required" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL,
    "options" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "linkedProcess" TEXT,
    "allowMultiple" BOOLEAN NOT NULL DEFAULT false,
    "showStatus" BOOLEAN NOT NULL DEFAULT false,
    "showOwner" BOOLEAN NOT NULL DEFAULT false,
    "showDueDate" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "ChecklistField_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Customer" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Feature" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Feature_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DefectConversation" (
    "id" TEXT NOT NULL,
    "processId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "statusId" TEXT NOT NULL,
    "dateDefectReported" TIMESTAMP(3) NOT NULL,
    "customerId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" "DefectCategory" NOT NULL,
    "screenshotUrls" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "featureId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DefectConversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DefectParticipant" (
    "id" TEXT NOT NULL,
    "defectId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "DefectParticipant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Task" (
    "id" TEXT NOT NULL,
    "defectId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "statusId" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "dueDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "ProcessTemplate_name_key" ON "ProcessTemplate"("name");

-- CreateIndex
CREATE UNIQUE INDEX "ProcessParticipant_processId_userId_key" ON "ProcessParticipant"("processId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "ProcessStatus_processId_label_key" ON "ProcessStatus"("processId", "label");

-- CreateIndex
CREATE UNIQUE INDEX "ProcessStatus_processId_order_key" ON "ProcessStatus"("processId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "ChecklistField_processId_key_key" ON "ChecklistField"("processId", "key");

-- CreateIndex
CREATE UNIQUE INDEX "ChecklistField_processId_order_key" ON "ChecklistField"("processId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_name_key" ON "Customer"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Feature_name_key" ON "Feature"("name");

-- CreateIndex
CREATE UNIQUE INDEX "DefectParticipant_defectId_userId_key" ON "DefectParticipant"("defectId", "userId");

-- AddForeignKey
ALTER TABLE "ProcessTemplate" ADD CONSTRAINT "ProcessTemplate_defaultOwnerId_fkey" FOREIGN KEY ("defaultOwnerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProcessTemplate" ADD CONSTRAINT "ProcessTemplate_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProcessParticipant" ADD CONSTRAINT "ProcessParticipant_processId_fkey" FOREIGN KEY ("processId") REFERENCES "ProcessTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProcessParticipant" ADD CONSTRAINT "ProcessParticipant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProcessStatus" ADD CONSTRAINT "ProcessStatus_processId_fkey" FOREIGN KEY ("processId") REFERENCES "ProcessTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChecklistField" ADD CONSTRAINT "ChecklistField_processId_fkey" FOREIGN KEY ("processId") REFERENCES "ProcessTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DefectConversation" ADD CONSTRAINT "DefectConversation_processId_fkey" FOREIGN KEY ("processId") REFERENCES "ProcessTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DefectConversation" ADD CONSTRAINT "DefectConversation_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DefectConversation" ADD CONSTRAINT "DefectConversation_statusId_fkey" FOREIGN KEY ("statusId") REFERENCES "ProcessStatus"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DefectConversation" ADD CONSTRAINT "DefectConversation_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DefectConversation" ADD CONSTRAINT "DefectConversation_featureId_fkey" FOREIGN KEY ("featureId") REFERENCES "Feature"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DefectConversation" ADD CONSTRAINT "DefectConversation_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DefectParticipant" ADD CONSTRAINT "DefectParticipant_defectId_fkey" FOREIGN KEY ("defectId") REFERENCES "DefectConversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DefectParticipant" ADD CONSTRAINT "DefectParticipant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_defectId_fkey" FOREIGN KEY ("defectId") REFERENCES "DefectConversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_statusId_fkey" FOREIGN KEY ("statusId") REFERENCES "ProcessStatus"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
