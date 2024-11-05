import { readdirSync, statSync } from "node:fs";
import { join } from "node:path";

/**
 * Load files from a specified directory and apply a callback function to each one.
 * @param {string} dir - The directory to load files from.
 * @param {Function} callback - A function to process each loaded file.
 * @param {string} fileExtension - The file extension to filter by (default: '.js').
 */
export function loadFiles(dir, callback, fileExtension = ".js") {
  try {
    const folderPath = join(process.cwd(), dir);
    const items = readdirSync(folderPath);

    items.forEach((item) => {
      const itemPath = join(folderPath, item);
      if (statSync(itemPath).isDirectory()) {
        // Recursively load files from nested directories
        loadFiles(join(dir, item), callback, fileExtension);
      } else if (item.endsWith(fileExtension)) {
        try {
          const fileContent = require(itemPath);
          callback(fileContent, itemPath);
        } catch (error) {
          console.error(`Error loading file ${item}:`, error);
        }
      }
    });
  } catch (error) {
    console.error(`Error loading directory ${dir}:`, error);
  }
}
