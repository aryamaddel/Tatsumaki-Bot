import { readdirSync } from "node:fs";
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
    const folders = readdirSync(folderPath);

    folders.forEach((folder) => {
      const filesPath = join(folderPath, folder);
      const files = readdirSync(filesPath).filter((file) => file.endsWith(fileExtension));

      files.forEach((file) => {
        try {
          const filePath = join(filesPath, file);
          const fileContent = require(filePath);
          callback(fileContent, filePath);
        } catch (error) {
          console.error(`Error loading file ${file}:`, error);
        }
      });
    });
  } catch (error) {
    console.error(`Error loading directory ${dir}:`, error);
  }
}
