const R = require("ramda")
const { lineByLine } = require("../utils/rxFile")
const { map, reduce } = require("rxjs/operators")
const fs = require("fs")

FILE = "./data.txt"
REPEATS = 11
MONSTER_REGEX = /#(.|\r?\n){78}#.{4}##.{4}##.{4}###(.|\r?\n){78}#.{2}#.{2}#.{2}#.{2}#.{2}#/m

const DIRECTIONS = {
  top: 0,
  right: 1,
  bottom: 2,
  left: 3
}

const oppositeIndex = (direction) => (DIRECTIONS[direction] + 2) % 4

const parseLine = ({ tiles, currentTile, mode }, line) => {
  const parseId = (line) => R.head(line.match(/\d+/g))
  const addRow = (tile, line) => ({
    ...tile,
    data: [...tile.data, line.split("")]
  })

  switch (mode) {
    case "TILE_ID":
      return {
        tiles,
        currentTile: { id: parseId(line), data: [] },
        mode: "TILE_DATA"
      }
    case "TILE_DATA":
      return line === ""
        ? { tiles: [...tiles, currentTile], currentTile: {}, mode: "TILE_ID" }
        : { tiles, currentTile: addRow(currentTile, line), mode }
  }
}

const addEdges = (tile) => {
  const transposedData = R.transpose(tile.data)
  const edges = [
    R.head(tile.data),
    R.last(transposedData),
    R.last(tile.data),
    R.head(transposedData)
  ]

  return { ...tile, edges: R.map(R.join(""), edges) }
}

const normalizedEdge = (edge) => R.max(edge, R.reverse(edge))

const matchingEdges = (edge1, edge2) =>
  normalizedEdge(edge1) === normalizedEdge(edge2)

const tile$ = lineByLine(FILE).pipe(
  reduce(parseLine, { tiles: [], currentTile: {}, mode: "TILE_ID" }),
  map(({ tiles, currentTile }) => R.map(addEdges, [...tiles, currentTile]))
)

const renderTile = ({ data }) =>
  R.pipe(R.map(R.join("")), R.forEach(console.log))(data)

const rotate = (tile) => {
  const newData = R.map(R.reverse, R.transpose(tile.data))
  const [top, right, bottom, left] = tile.edges
  return {
    ...tile,
    data: newData,
    edges: [R.reverse(left), top, R.reverse(right), bottom]
  }
}

const flipVertical = (tile) => {
  const newData = R.reverse(tile.data)
  const [top, right, bottom, left] = tile.edges
  return {
    ...tile,
    data: newData,
    edges: [bottom, R.reverse(right), top, R.reverse(left)]
  }
}

const flipHorizontal = (tile) => {
  const newData = R.map(R.reverse, tile.data)
  const [top, right, bottom, left] = tile.edges
  return {
    ...tile,
    data: newData,
    edges: [R.reverse(top), left, R.reverse(bottom), right]
  }
}

const arrangeStartTile = (tile, edgesMap) => {
  const borders = R.filter(
    (edge) => {
      const tiles = edgesMap.get(edge)
      return tiles.length === 1 && R.head(tiles) === tile.id
    },
    [...edgesMap.keys()]
  )

  const isOriented = (tile) => {
    const [top, right, bottom, left] = tile.edges
    return borders.includes(top) && borders.includes(left)
  }

  while (!isOriented(tile)) {
    tile = rotate(tile)
  }

  return tile
}

const findAdjacentTile = (tile, edgesMap, tilesMap, direction = "right") => {
  const bindingEdge = tile.edges[DIRECTIONS[direction]]
  const nextTileId = R.head(
    R.without([tile.id], edgesMap.get(normalizedEdge(bindingEdge)))
  )
  const targetEdge = (tile) => tile.edges[oppositeIndex(direction)]
  let nextTile = tilesMap[nextTileId]

  while (!matchingEdges(bindingEdge, targetEdge(nextTile))) {
    nextTile = rotate(nextTile)
  }

  if (bindingEdge !== targetEdge(nextTile)) {
    nextTile =
      direction === "right" ? flipVertical(nextTile) : flipHorizontal(nextTile)
  }

  return nextTile
}

const arrangeTiles = (tilesMap, edgesMap, startTile) => {
  let nextTile = arrangeStartTile(tilesMap[startTile], edgesMap),
    row = [nextTile],
    arrangedTiles = [row]

  const fillRow = () => {
    R.times(() => {
      nextTile = findAdjacentTile(nextTile, edgesMap, tilesMap)
      row.push(nextTile)
    }, REPEATS)
  }

  fillRow()

  R.times(() => {
    nextTile = findAdjacentTile(R.head(row), edgesMap, tilesMap, "bottom")
    row = [nextTile]
    fillRow()
    arrangedTiles.push(row)
  }, REPEATS)

  return arrangedTiles
}

const mergeTiles = (arrangedTiles) => {
  const trimLimits = R.pipe(R.init, R.tail)
  const removeTileEdges = ({ data }) =>
    R.map((row) => trimLimits(row).join(""), trimLimits(data))
  const trimmedTiles = R.map(R.pipe(R.map(removeTileEdges)), arrangedTiles)
  let mergedTiles = []
  for (tileRow of trimmedTiles) {
    const rows = R.reduce(
      R.pipe(R.zip, R.map(R.join(""))),
      R.head(tileRow),
      R.tail(tileRow)
    )
    mergedTiles = [...mergedTiles, ...rows]
  }

  return mergedTiles
}

const findSeaMonsters = (imageLines) => {
  const joinLines = R.map(R.join(""))
  const rotate = (lines) => joinLines(R.map(R.reverse, R.transpose(lines)))
  const flipVertical = R.reverse
  const flipHorizonal = joinLines(R.map(R.reverse))

  let hasMatch,
    countMatches = 0,
    strIndex,
    imgStr

  const tryRotations = () => {
    for (i = 0; i < 4; i++) {
      imageStr = R.join("\n", imageLines)
      hasMatch = imageStr.match(MONSTER_REGEX)
      if (hasMatch) return
      imageLines = rotate(imageLines)
    }
    return
  }

  tryRotations()

  if (!hasMatch) {
    imageLines = flipVertical(imageLines)
    tryRotations()
  }

  if (!hasMatch) {
    imageLines = flipVertical(imageLines)
    tryRotations()
  }

  strIndex = hasMatch.index
  while (strIndex) {
    countMatches++
    imageStr = imageStr.substr(strIndex + 1)
    strIndex = R.match(MONSTER_REGEX, imageStr).index
  }

  return countMatches
}

const analyze = (tiles) => {
  const edgesMap = R.reduce(
    (acc, { id, edges }) => {
      for (edge of edges) {
        const edgeKey = normalizedEdge(edge),
          entries = acc.get(edgeKey)
        acc.set(edgeKey, entries ? [...entries, id] : [id])
      }
      return acc
    },
    new Map(),
    tiles
  )

  const corners = R.pipe(
    R.filter((x) => x.length === 1),
    R.map(R.head),
    R.groupBy(R.identity),
    R.filter((x) => x.length === 2),
    R.keys
  )([...edgesMap.values()])

  console.log(`Product of corners is: ${R.product(corners)}`)

  const arrangedTiles = arrangeTiles(
    R.indexBy(R.prop("id"), tiles),
    edgesMap,
    R.head(corners)
  )

  const mergedTiles = mergeTiles(arrangedTiles)

  const matches = findSeaMonsters(mergedTiles)
  const spaces = R.pipe(
    R.join(""),
    R.filter((x) => x === "#"),
    R.length
  )(mergedTiles)
  const freeSpaces = spaces - matches * 15
  console.log(`Total free spaces: ${freeSpaces}`)
}

tile$.subscribe(analyze)
