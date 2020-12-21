const R = require("ramda")
const { lineByLine } = require("../utils/rxFile")
const { reduce } = require("rxjs/operators")

FILE = "./data.txt"

const parseFood = (acc, line) => {
  const [__, ingredientsStr, allergensStr] = line.match(
      /(.*) \(contains (.*)\)/
    ),
    ingredients = ingredientsStr.split(" "),
    allergens = allergensStr.split(", ")
  return [...acc, [ingredients, allergens]]
}

const food$ = lineByLine(FILE).pipe(reduce(parseFood, []))

food$.subscribe((foodMap) => {
  const allergensMap = R.reduce(
      (acc, [ingredients, allergens]) => {
        for (let allergen of allergens) {
          if (!acc[allergen]) {
            acc[allergen] = ingredients
          } else {
            acc[allergen] = R.intersection(acc[allergen], ingredients)
          }
        }
        return acc
      },
      {},
      foodMap
    ),
    allIngredients = R.chain(R.head, foodMap),
    allIngredientsWithAllergens = R.pipe(
      R.values,
      R.flatten,
      R.uniq
    )(allergensMap),
    safeIngredientsCount = R.without(
      allIngredientsWithAllergens,
      allIngredients
    ).length

  console.log(
    `\nIngredients that can't possibly contain allergens appear a total of ${safeIngredientsCount} times\n`
  )

  const purgedAllergensMap = R.pipe(
    R.toPairs,
    R.sortBy(([_, ingredients]) => ingredients.length),
    R.reduce((acc, [allergen, ingredients]) => {
      acc[allergen] = R.head(R.without(Object.values(acc), ingredients))
      return acc
    }, {})
  )(allergensMap)

  const canonicalDangerousList = R.pipe(
    R.keys,
    R.sortBy(R.identity),
    R.map((allergen) => purgedAllergensMap[allergen]),
    R.join(",")
  )(purgedAllergensMap)

  console.log(
    `Canonical dangerous ingredient list is:\n${canonicalDangerousList}\n`
  )
})
