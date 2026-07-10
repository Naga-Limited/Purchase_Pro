export function resolveValue(path, obj, separator = ".") {
  var properties = Array.isArray(path) ? path : path.split(separator);
  return properties.reduce((prev, curr) => prev && prev[curr], obj);
}

export function getErrorAndValue(id, form) {
  let { values, errors, touched } = form;
  let ids = id.split(".");
  let selectedValue = ids.length > 0 ? resolveValue(ids, values) : values[id].value?values[id].value:values[id];
  let errorValue = ids.length > 0 ? resolveValue(ids, errors) : errors[id];
  let touchValue = ids.length > 0 ? resolveValue(ids, touched) : touched[id];
  return { selectedValue, touchValue, errorValue };
}
