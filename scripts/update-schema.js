"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var promise_1 = require("mysql2/promise");
var dotenv_1 = require("dotenv");
dotenv_1.default.config();
// Database configuration
var dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT ? Number.parseInt(process.env.DB_PORT) : 3306,
    ssl: {
        rejectUnauthorized: false
    }
};
function updateSchema() {
    return __awaiter(this, void 0, void 0, function () {
        var connection, results, tables, roleColumn, statusColumn, lastLoginColumn, projectTables, updateResult, users, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('Starting database schema update...');
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 26, 29, 32]);
                    return [4 /*yield*/, promise_1.default.createConnection(dbConfig)];
                case 2:
                    // Create a connection to the database
                    connection = _a.sent();
                    console.log('Connected to database');
                    // Start a transaction
                    return [4 /*yield*/, connection.beginTransaction()];
                case 3:
                    // Start a transaction
                    _a.sent();
                    console.log('Transaction started');
                    results = [];
                    return [4 /*yield*/, connection.query("\n      SELECT TABLE_NAME \n      FROM INFORMATION_SCHEMA.TABLES \n      WHERE TABLE_NAME = 'users' AND TABLE_SCHEMA = ?\n    ", [process.env.DB_NAME || 'obd_logger'])];
                case 4:
                    tables = (_a.sent())[0];
                    if (!(tables.length === 0)) return [3 /*break*/, 6];
                    console.log('The users table does not exist. Creating it first...');
                    return [4 /*yield*/, connection.execute("\n        CREATE TABLE users (\n          id INT PRIMARY KEY AUTO_INCREMENT,\n          username VARCHAR(50) UNIQUE NOT NULL,\n          email VARCHAR(100) UNIQUE NOT NULL,\n          password_hash VARCHAR(255) NOT NULL,\n          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,\n          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP\n        )\n      ")];
                case 5:
                    _a.sent();
                    results.push('Created users table');
                    _a.label = 6;
                case 6: return [4 /*yield*/, connection.query("\n      SELECT COLUMN_NAME \n      FROM INFORMATION_SCHEMA.COLUMNS \n      WHERE TABLE_NAME = 'users' AND COLUMN_NAME = 'role' AND TABLE_SCHEMA = ?\n    ", [process.env.DB_NAME || 'obd_logger'])];
                case 7:
                    roleColumn = (_a.sent())[0];
                    if (!(roleColumn.length === 0)) return [3 /*break*/, 9];
                    console.log('Adding role column to users table...');
                    return [4 /*yield*/, connection.execute("\n        ALTER TABLE users \n        ADD COLUMN role VARCHAR(20) DEFAULT 'viewer'\n      ")];
                case 8:
                    _a.sent();
                    results.push('Added role column to users table');
                    return [3 /*break*/, 10];
                case 9:
                    results.push('Role column already exists');
                    _a.label = 10;
                case 10: return [4 /*yield*/, connection.query("\n      SELECT COLUMN_NAME \n      FROM INFORMATION_SCHEMA.COLUMNS \n      WHERE TABLE_NAME = 'users' AND COLUMN_NAME = 'status' AND TABLE_SCHEMA = ?\n    ", [process.env.DB_NAME || 'obd_logger'])];
                case 11:
                    statusColumn = (_a.sent())[0];
                    if (!(statusColumn.length === 0)) return [3 /*break*/, 13];
                    console.log('Adding status column to users table...');
                    return [4 /*yield*/, connection.execute("\n        ALTER TABLE users \n        ADD COLUMN status VARCHAR(20) DEFAULT 'Active'\n      ")];
                case 12:
                    _a.sent();
                    results.push('Added status column to users table');
                    return [3 /*break*/, 14];
                case 13:
                    results.push('Status column already exists');
                    _a.label = 14;
                case 14: return [4 /*yield*/, connection.query("\n      SELECT COLUMN_NAME \n      FROM INFORMATION_SCHEMA.COLUMNS \n      WHERE TABLE_NAME = 'users' AND COLUMN_NAME = 'last_login' AND TABLE_SCHEMA = ?\n    ", [process.env.DB_NAME || 'obd_logger'])];
                case 15:
                    lastLoginColumn = (_a.sent())[0];
                    if (!(lastLoginColumn.length === 0)) return [3 /*break*/, 17];
                    console.log('Adding last_login column to users table...');
                    return [4 /*yield*/, connection.execute("\n        ALTER TABLE users \n        ADD COLUMN last_login TIMESTAMP NULL\n      ")];
                case 16:
                    _a.sent();
                    results.push('Added last_login column to users table');
                    return [3 /*break*/, 18];
                case 17:
                    results.push('Last_login column already exists');
                    _a.label = 18;
                case 18: return [4 /*yield*/, connection.query("\n      SELECT TABLE_NAME \n      FROM INFORMATION_SCHEMA.TABLES \n      WHERE TABLE_NAME = 'user_projects' AND TABLE_SCHEMA = ?\n    ", [process.env.DB_NAME || 'obd_logger'])];
                case 19:
                    projectTables = (_a.sent())[0];
                    if (!(projectTables.length === 0)) return [3 /*break*/, 21];
                    console.log('Creating user_projects table...');
                    return [4 /*yield*/, connection.execute("\n        CREATE TABLE user_projects (\n          id INT PRIMARY KEY AUTO_INCREMENT,\n          user_id INT NOT NULL,\n          project_id INT NOT NULL,\n          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,\n          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,\n          UNIQUE KEY (user_id, project_id)\n        )\n      ")];
                case 20:
                    _a.sent();
                    results.push('Created user_projects table');
                    return [3 /*break*/, 22];
                case 21:
                    results.push('User_projects table already exists');
                    _a.label = 22;
                case 22:
                    // Update admin users to have admin role
                    console.log('Updating admin users...');
                    return [4 /*yield*/, connection.execute("\n      UPDATE users \n      SET role = 'admin' \n      WHERE id = 1 OR username = 'admin' OR email = 'admin@example.com'\n    ")];
                case 23:
                    updateResult = (_a.sent())[0];
                    results.push("Updated ".concat(updateResult.affectedRows, " admin users"));
                    return [4 /*yield*/, connection.execute("\n      SELECT id, username, email, role, status, last_login \n      FROM users \n      LIMIT 5\n    ")];
                case 24:
                    users = (_a.sent())[0];
                    console.log('\nCurrent users in the table:');
                    console.log(users);
                    // Commit the transaction
                    return [4 /*yield*/, connection.commit()];
                case 25:
                    // Commit the transaction
                    _a.sent();
                    console.log('Transaction committed');
                    console.log('\nSchema update results:');
                    results.forEach(function (result) { return console.log(" - ".concat(result)); });
                    console.log('\n✅ Schema update complete!');
                    return [3 /*break*/, 32];
                case 26:
                    error_1 = _a.sent();
                    if (!connection) return [3 /*break*/, 28];
                    return [4 /*yield*/, connection.rollback()];
                case 27:
                    _a.sent();
                    _a.label = 28;
                case 28:
                    console.error('❌ Error updating schema:', error_1);
                    return [3 /*break*/, 32];
                case 29:
                    if (!connection) return [3 /*break*/, 31];
                    return [4 /*yield*/, connection.end()];
                case 30:
                    _a.sent();
                    _a.label = 31;
                case 31:
                    console.log('Database connection closed');
                    return [7 /*endfinally*/];
                case 32: return [2 /*return*/];
            }
        });
    });
}
// Run the script
updateSchema().catch(function (error) {
    console.error('Unhandled error:', error);
    process.exit(1);
});
