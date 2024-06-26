// jsonwise.ts
import * as fs from 'fs';

/**
 * Interface for JSON data
 */
interface JsonData {
  [key: string]: any;
}

/**
 * Jsonwise class for working with JSON files
 *
 * @typeparam T The type of data stored in the JSON file
 */
class Jsonwise<T> {
  /**
   * File path of the JSON file
   */
  private filePath: string;

  /**
   * JSON data stored in memory
   */
  private data: JsonData;

  /**
   * Constructor
   *
   * @param filePath The file path of the JSON file
   */
  constructor(filePath: string) {
    this.filePath = filePath;
    this.data = this.loadData();
  }

  /**
   * Load data from the JSON file
   *
   * @returns The loaded data
   */
  private loadData(): T[] {
    try {
      return JSON.parse(fs.readFileSync(this.filePath, 'utf8'));
    } catch (error) {
      return [];
    }
  }

  /**
   * Save data to the JSON file
   */
  private saveData(): void {
    fs.writeFileSync(this.filePath, JSON.stringify(this.data, null, 2));
  }

  /**
   * Find Nested
   */
  private findNested(item: any, key: string, value: any): boolean {
    if (typeof value === 'object') {
      for (const nestedKey in value) {
        if (!this.findNested(item[key], nestedKey, value[nestedKey])) {
          return false;
        }
      }
      return true;
    } else if (item[key] !== value) {
      return false;
    }
    return true;
  }
  /**
   * Create a new entry in the JSON file
   *
   * @param obj The object to create
   * @returns The created object
   */
  create(obj: Omit<T, '__id'> & JsonData): T {
    this.data = this.data || [];
    const newId =
      this.data.length === 0
        ? 1
        : ((Math.max(...this.data.map((item: T) => (item as { __id: number }).__id)) +
            1) as unknown as T);
    const newObj = { ...obj, __id: newId } as T;
    this.data.push(newObj);
    this.saveData();
    return newObj;
  }

  /**
   * find an entry from the JSON file
   *
   * @param id The ID of the entry to read
   * @returns The read entry or null if not found
   */
  find(where: { [key: string]: any }): T | null {
    for (const item of Object.values(this.data)) {
      let match = true;
      for (const key in where) {
        const value = where[key];
        if (typeof value === 'object') {
          if (!this.findNested(item, key, value)) {
            match = false;
            break;
          }
        } else if (item[key] !== value) {
          match = false;
          break;
        }
      }
      if (match) {
        return item;
      }
    }
    return null;
  }

  /**
   * Update an entry in the JSON file
   *
   * @param id The ID of the entry to update
   * @param obj The updated object
   * @returns The updated object or null if not found
   */
  update(__id: number, obj: T): T | null {
    for (let i = 0; i < this.data.length; i++) {
      if (this.data[i].__id === __id) {
        Object.assign(this.data[i], obj);
        this.saveData();
        return this.data[i];
      }
    }
    return null;
  }
  /**
   * destroy an entry from the JSON file
   *
   * @param id The ID of the entry to delete
   * @returns True if deleted, false if not found
   */
  destroy(__id: number): boolean {
    for (let i = 0; i < this.data.length; i++) {
      if (this.data[i].__id === __id) {
        this.data.splice(i, 1);
        this.saveData();
        return true;
      }
    }
    return false;
  }

  /**
   * Find all entries in the JSON file
   *
   * @returns An array of all entries
   */
  findAll(): T[] {
    return Object.values(this.data);
  }

  /**
   * Count the number of entries in the JSON file
   *
   * @returns The count of entries
   */
  count(): number {
    return Object.keys(this.data).length;
  }
}

export default Jsonwise;
