"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// // ultrasound/frontend/electron/main.ts
const electron_1 = require("electron");
const path_1 = __importDefault(require("path"));
const ipc_handlers_1 = require("./ipc-handlers");
const protocolHandlers_1 = require("./ipc/protocolHandlers");
const database_1 = require("./database/database");
let mainWindow = null;
function createWindow() {
    const dbManager = database_1.DatabaseManager.getInstance();
    const iconPath = path_1.default.join(__dirname, "..", "build", "us-icon.png");
    console.log("ICON PATH:", iconPath);
    mainWindow = new electron_1.BrowserWindow({
        width: 1400,
        height: 900,
        minWidth: 1000,
        minHeight: 700,
        frame: false,
        titleBarStyle: "hidden",
        autoHideMenuBar: true,
        backgroundColor: "#f8fafc",
        show: false,
        icon: iconPath,
        webPreferences: {
            preload: path_1.default.join(__dirname, "preload.js"),
            nodeIntegration: false,
            contextIsolation: true,
        },
    });
    (0, ipc_handlers_1.setupAuthHandlers)(mainWindow);
    (0, protocolHandlers_1.setupProtocolHandlers)(dbManager.protocol);
    if (process.env.NODE_ENV === "development") {
        mainWindow.loadURL(`http://localhost:${process.env.VITE_PORT ?? "5174"}`);
    }
    else {
        mainWindow.loadFile(path_1.default.join(__dirname, "../dist/index.html"));
    }
    mainWindow.once("ready-to-show", () => {
        mainWindow?.show();
    });
    mainWindow.on("closed", () => {
        mainWindow = null;
    });
}
electron_1.app.whenReady().then(createWindow);
electron_1.app.on("window-all-closed", () => {
    if (process.platform !== "darwin")
        electron_1.app.quit();
});
electron_1.app.on("activate", () => {
    if (electron_1.BrowserWindow.getAllWindows().length === 0)
        createWindow();
});
