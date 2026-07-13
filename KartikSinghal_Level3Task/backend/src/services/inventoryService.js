import Inventory from '../models/Inventory.js';
import Pizza from '../models/Pizza.js';
import { getCustomizationIngredientNames } from '../config/customizationOptions.js';
import { sendLowStockAlert } from './mailService.js';

const DEFAULT_SYNC_ITEM = {
  quantity: 0,
  threshold: 0,
  unit: 'units',
};

const SIZE_MULTIPLIER = {
  small: 1,
  medium: 1.5,
  large: 2,
};

export const normalizeIngredientName = (value) =>
  String(value || '').trim().replace(/\s+/g, ' ').toLowerCase();

const cleanIngredientName = (value) =>
  String(value || '').trim().replace(/\s+/g, ' ');

const asArray = (value) => {
  if (Array.isArray(value)) return value;
  if (value === undefined || value === null || value === '') return [];
  return [value];
};

const uniqueIngredientNames = (names) => {
  const ingredients = new Map();

  for (const name of names || []) {
    const displayName = cleanIngredientName(name);
    const normalizedName = normalizeIngredientName(displayName);
    if (!normalizedName || ingredients.has(normalizedName)) continue;
    ingredients.set(normalizedName, displayName);
  }

  return ingredients;
};

const withSession = (query, session) => (session ? query.session(session) : query);

const getAllInventoryRecords = async (session) =>
  withSession(Inventory.find({}), session);

export const ingredientNamesFromDescription = (description = '') => {
  const cleanedDescription = String(description)
    .replace(/\bno\s+cheese\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();

  if (!cleanedDescription) return [];

  return cleanedDescription
    .split(',')
    .map((part) =>
      part
        .replace(/\s+[-–—]\s+.*$/u, '')
        .replace(/\s+/g, ' ')
        .trim()
    )
    .filter(Boolean);
};

export const extractIngredientNamesFromPizza = (pizza) => {
  if (normalizeIngredientName(pizza?.name) === 'custom pizza') return [];

  const explicitIngredients = [...uniqueIngredientNames(pizza?.ingredients || []).values()];
  if (explicitIngredients.length > 0) return explicitIngredients;
  return ingredientNamesFromDescription(pizza?.description || '');
};

export const extractIngredientNamesFromOrderItems = (items = []) => {
  const names = [];

  for (const item of items) {
    names.push(...asArray(item.pizzaIngredients));
    names.push(item.base, item.sauce, item.cheese);
    names.push(...asArray(item.veggies));
    names.push(...asArray(item.meat));
    names.push(...asArray(item.toppings));

    if (item.extraCheese) {
      names.push(item.cheese || 'cheese');
    }
  }

  return [...uniqueIngredientNames(names).values()];
};

export const findInventoryByIngredientName = async (ingredientName, session) => {
  const normalizedName = normalizeIngredientName(ingredientName);
  if (!normalizedName) return null;

  const direct = await withSession(Inventory.findOne({ normalizedName }), session);
  if (direct) return direct;

  const records = await getAllInventoryRecords(session);
  return records.find((record) => normalizeIngredientName(record.ingredientName) === normalizedName) || null;
};

export const syncInventoryIngredients = async (ingredientNames = [], { session } = {}) => {
  const ingredients = uniqueIngredientNames(ingredientNames);
  if (ingredients.size === 0) return { created: [], existing: [] };

  const records = await getAllInventoryRecords(session);
  const existingByName = new Map();

  for (const record of records) {
    const normalizedName = record.normalizedName || normalizeIngredientName(record.ingredientName);
    if (normalizedName && !existingByName.has(normalizedName)) {
      existingByName.set(normalizedName, record);
    }
  }

  const created = [];
  const existing = [];

  for (const [normalizedName, displayName] of ingredients.entries()) {
    const current = existingByName.get(normalizedName);

    if (current) {
      if (current.normalizedName !== normalizedName) {
        current.normalizedName = normalizedName;
        await current.save(session ? { session } : undefined);
      }
      existing.push(current);
      continue;
    }

    try {
      const [item] = await Inventory.create([{
        ingredientName: displayName,
        normalizedName,
        ...DEFAULT_SYNC_ITEM,
      }], session ? { session } : undefined);

      existingByName.set(normalizedName, item);
      created.push(item);
    } catch (err) {
      if (err.code !== 11000) throw err;

      const racedItem = await findInventoryByIngredientName(displayName, session);
      if (!racedItem) throw err;
      existingByName.set(normalizedName, racedItem);
      existing.push(racedItem);
    }
  }

  return { created, existing };
};

export const syncInventoryFromCatalog = async ({ session } = {}) => {
  const query = Pizza.find({});
  const pizzas = await withSession(query, session);
  const names = [...getCustomizationIngredientNames()];

  for (const pizza of pizzas) {
    names.push(...extractIngredientNamesFromPizza(pizza));
  }

  return syncInventoryIngredients(names, { session });
};

const findInventoryRecordsForRequirements = async (requirements, session) => {
  const names = Object.keys(requirements);
  if (names.length === 0) return new Map();

  const query = Inventory.find({ normalizedName: { $in: names } });
  const records = await withSession(query, session);
  const recordsByName = new Map(
    records.map((record) => [record.normalizedName || normalizeIngredientName(record.ingredientName), record])
  );

  if (recordsByName.size < names.length) {
    const allRecords = await getAllInventoryRecords(session);
    for (const record of allRecords) {
      const normalizedName = record.normalizedName || normalizeIngredientName(record.ingredientName);
      if (normalizedName && names.includes(normalizedName) && !recordsByName.has(normalizedName)) {
        recordsByName.set(normalizedName, record);
      }
    }
  }

  return recordsByName;
};

export const buildRequirements = (items) => {
  const requirements = {};

  const add = (name, qty) => {
    const normalizedName = normalizeIngredientName(name);
    if (!normalizedName || qty <= 0) return;
    requirements[normalizedName] = (requirements[normalizedName] || 0) + qty;
  };

  for (const item of items || []) {
    const sizeMultiplier = SIZE_MULTIPLIER[item.size] || 1;
    const itemQty = item.quantity || 1;
    const sizedQty = sizeMultiplier * itemQty;

    for (const ingredient of asArray(item.pizzaIngredients)) {
      add(ingredient, sizedQty);
    }

    add(item.base, sizedQty);
    add(item.sauce, sizedQty);
    add(item.cheese, sizedQty);

    if (item.extraCheese) {
      add(item.cheese || 'cheese', sizedQty);
    }

    for (const ingredient of asArray(item.veggies)) {
      add(ingredient, itemQty);
    }
    for (const ingredient of asArray(item.meat)) {
      add(ingredient, itemQty);
    }
    for (const ingredient of asArray(item.toppings)) {
      add(ingredient, itemQty);
    }
  }

  return requirements;
};

export const checkInventory = async (requirements, session, { syncMissing = false } = {}) => {
  const names = Object.keys(requirements);
  if (names.length === 0) return;

  if (syncMissing) {
    await syncInventoryIngredients(names, { session });
  }

  const recordsByName = await findInventoryRecordsForRequirements(requirements, session);
  const outOfStock = [];

  for (const name of names) {
    const record = recordsByName.get(name);
    if (!record) continue;

    if (record.quantity < requirements[name]) {
      outOfStock.push(record.ingredientName);
    }
  }

  if (outOfStock.length > 0) {
    const err = new Error(`Out of stock: ${outOfStock.join(', ')}`);
    err.statusCode = 409;
    throw err;
  }
};

export const deductInventory = async (items, session) => {
  await syncInventoryIngredients(extractIngredientNamesFromOrderItems(items), { session });

  const requirements = buildRequirements(items);
  const names = Object.keys(requirements);
  if (names.length === 0) return;

  const recordsByName = await findInventoryRecordsForRequirements(requirements, session);
  const lowItems = [];

  for (const name of names) {
    const record = recordsByName.get(name);
    if (!record) continue;

    record.quantity = Math.max(0, record.quantity - requirements[name]);

    if (session) {
      await record.save({ session });
    } else {
      await record.save();
    }

    if (record.quantity <= record.threshold) {
      lowItems.push(record);
    }
  }

  if (lowItems.length > 0) {
    sendLowStockAlert(lowItems).catch(() => {});
  }
};

export const restoreInventory = async (items, session) => {
  await syncInventoryIngredients(extractIngredientNamesFromOrderItems(items), { session });

  const requirements = buildRequirements(items);
  const names = Object.keys(requirements);
  if (names.length === 0) return;

  const recordsByName = await findInventoryRecordsForRequirements(requirements, session);

  for (const name of names) {
    const record = recordsByName.get(name);
    if (!record) continue;

    record.quantity += requirements[name];

    if (session) {
      await record.save({ session });
    } else {
      await record.save();
    }
  }
};

export const isIngredientReferenced = async (ingredientName) => {
  const normalizedName = normalizeIngredientName(ingredientName);
  if (!normalizedName) return false;

  const customizationMatch = getCustomizationIngredientNames()
    .some((name) => normalizeIngredientName(name) === normalizedName);
  if (customizationMatch) return true;

  const pizzas = await Pizza.find({}).select('ingredients description').lean();
  return pizzas.some((pizza) =>
    extractIngredientNamesFromPizza(pizza)
      .some((name) => normalizeIngredientName(name) === normalizedName)
  );
};
