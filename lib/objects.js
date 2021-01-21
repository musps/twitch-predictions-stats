import _ from 'lodash'

// @source https://gist.github.com/Yimiprod/7ee176597fef230d1451
export function difference(object, base) {
  function changes(object, base) {
    return _.transform(object, function (result, value, key) {
      if (!_.isEqual(value, base[key])) {
        result[key] =
          _.isObject(value) && _.isObject(base[key])
            ? changes(value, base[key])
            : value
      }
    })
  }
  return changes(object, base)
}

export const compareCache = (input, cache) => {
  try {
    if (input.name !== cache.name) {
      return false
    }

    const diff = difference(input.args, cache.args)

    return Object.keys(diff).length === 0
  } catch (error) {
    return false
  }
}

export function isFieldSelected(fieldNodes, fieldName) {
  const { selections } = fieldNodes[0].selectionSet

  const field = selections.find(
    (selection) =>
      selection.kind === 'Field' && selection.name.value === fieldName
  )

  return !!field
}
