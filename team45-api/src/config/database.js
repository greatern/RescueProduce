require("dotenv").config(); // Add this line if it's not already there and if you don't have a .sequelizerc loading dotenv

console.log("--- Sequelize CLI DB Config Debug ---");
console.log("DB_USER:", process.env.DB_USER);
console.log(
	"DB_PASS (first 3 chars):",
	process.env.DB_PASS ? process.env.DB_PASS.substring(0, 3) + "..." : "N/A"
); // Log partially for security
console.log("DB_HOST:", process.env.DB_HOST);
console.log("DB_NAME:", process.env.DB_NAME);
console.log("------------------------------------");

module.exports = {
	development: {
		username: process.env.DB_USER,
		password: process.env.DB_PASS,
		database: process.env.DB_NAME,
		host: process.env.DB_HOST,
		port: process.env.DB_PORT || 3306,
		dialect: "mysql",
		logging: console.log,
		dialectOptions: {
			bigNumberStrings: true,
			dateStrings: true,
			typeCase: true,
		},
	},
	test: {
		username: process.env.DB_USER,
		password: process.env.DB_PASS,
		database: process.env.DB_NAME,
		host: process.env.DB_HOST,
		port: process.env.DB_PORT || 3306,
		dialect: "mysql",
		logging: false,
		dialectOptions: {
			bigNumberStrings: true,
		},
	},
	production: {
		username: process.env.PROD_DB_USER || process.env.DB_USER,
		password: process.env.PROD_DB_PASS || process.env.DB_PASS,
		database: process.env.PROD_DB_NAME || process.env.DB_NAME,
		host: process.env.PROD_DB_HOST || process.env.DB_HOST,
		port: process.env.PROD_DB_PORT || process.env.DB_PORT || 3306,
		dialect: "mysql",
		logging: false,
		dialectOptions: {
			bigNumberStrings: true,
			ssl:
				process.env.DB_SSL === "true"
					? { rejectUnauthorized: false }
					: undefined,
		},
	},
};
