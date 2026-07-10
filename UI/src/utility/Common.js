let lastId = 0;

export function getNewId(prefix = "id") {
  lastId++;
  return `${prefix}${lastId}`;
}
