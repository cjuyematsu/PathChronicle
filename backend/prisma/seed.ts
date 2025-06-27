import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
    console.log("Seeding database...");

    // Create users
    const user1 = await prisma.user.upsert({
        where: { email: "john@example.com" },
        update: {},
        create: {
            email: "john@example.com",
            name: "John Doe",
        },
    });

    const user2 = await prisma.user.upsert({
        where: { email: "jane@example.com" },
        update: {},
        create: {
            email: "jane@example.com",
            name: "Jane Smith",
        },
    });
    console.log("Database seeded successfully!");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
