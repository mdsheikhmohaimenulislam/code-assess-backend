import app from "./app.js";
import config from "./app/config/index.js";
import { prisma } from "./app/lib/prisma.js";



const PORT = Number(config.port);


const main = async () => {
  try {
    await prisma.$connect();
    console.log("Connected to the database successfully.");

    // await redisClient.connect();
    // console.log("Redis Connected Successfully.");

    // await transporter.verify();
    // console.log("Nodemailer connected successfully.");

    // await seedSuperAdmin();
    // await seedTesterAdmin();
    // await seedTesterDoctor();

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Error starting the server:", error);
    await prisma.$disconnect();
    process.exit(1);
  }
};

main();
