// Function to load SQL files from the sql directory
import { readFileSync } from "fs";
import { join } from "path";

export default function loadSQL(filename: string): string {
    return readFileSync(join(__dirname, "../../sql", filename), "utf8");
}
