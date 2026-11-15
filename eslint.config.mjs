import next from "eslint-config-next";

const config = [...next, { ignores: ["public/**", ".next/**", "node_modules/**"] }];
export default config;
