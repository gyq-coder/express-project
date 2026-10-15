import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma",
  datasource: {
    url: "mysql://root:admin@localhost:3306/test",
  },
});
