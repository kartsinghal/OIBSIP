export const CUSTOMIZATION_OPTION_GROUPS = [
  {
    key: 'base',
    label: 'Base',
    options: ['Sourdough', 'Thin Crust', 'Whole Wheat', 'Gluten-Free'],
  },
  {
    key: 'sauce',
    label: 'Sauce',
    options: ['San Marzano', 'White Cream', 'Basil Pesto', 'Smoky BBQ'],
  },
  {
    key: 'cheese',
    label: 'Cheese',
    options: ['Fior di Latte', 'Burrata', 'Fontina', 'Gorgonzola'],
  },
  {
    key: 'toppings',
    label: 'Toppings',
    options: ['Wild Mushrooms', 'Prosciutto', 'Fresh Basil', 'Truffle Oil', 'Jalapeños', 'Black Olives'],
  },
];

export const getCustomizationIngredientNames = () =>
  CUSTOMIZATION_OPTION_GROUPS.flatMap((group) => group.options);
