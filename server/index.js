const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const requestRoutes = require("./routes/requestRoutes");
const adminRoutes = require("./routes/adminRoutes");
const { seedInitialAdmin } = require("./utils/seedAdmin");
const { seedSystemRoles } = require("./utils/roleService");

dotenv.config();
connectDB().then(async () => {
  await seedSystemRoles();
  await seedInitialAdmin();
});

const app = express();
app.use(cors({ origin: [process.env.CLIENT_URL || "*" ]}));
app.use(express.json());

app.get("/api/health", (req, res) => res.json({ message: "Server running" }));
app.use("/api/auth", authRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/admin", adminRoutes);

const basePort = parseInt(process.env.PORT, 10) || 5000;
const maxPort = basePort + 10;

const tryListen = (port) => {
  const server = app.listen(port, () =>
    console.log(`Server listening on port ${port}`),
  );

  server.on("error", (error) => {
    if (error.code === "EADDRINUSE") {
      const nextPort = port + 1;
      if (nextPort <= maxPort) {
        console.warn(
          `Port ${port} is already in use${process.env.PORT ? ` (requested by PORT=${process.env.PORT})` : ""}, trying ${nextPort} instead...`,
        );
        tryListen(nextPort);
        return;
      }

      console.error(
        `Ports ${basePort} through ${maxPort} are all in use. Please stop existing services or set PORT to an available port.`,
      );
      process.exit(1);
    }

    console.error(error);
    process.exit(1);
  });
};

tryListen(basePort);
