// @ts-check
const openApiData = require("./openapi.json");

function collectRefs(obj, collection = new Set()) {
  for (let key in obj) {
    if (key === "$ref") {
      collection.add(obj[key]);
    } else if (
      typeof obj[key] === "object" &&
      obj[key] !== null
    ) {
      if (key === "200") obj[key].description ??= "OK";
      if (key === "400")
        obj[key].description ??= "Bad Request";
      if (key === "401")
        obj[key].description ??= "Unauthorized";
      if (key === "403")
        obj[key].description ??= "Forbidden";
      if (key === "422")
        obj[key].description ??= "Unprocessable Entity";
      collectRefs(obj[key], collection);
    }
  }
  return [...collection];
}

function removeXmlTagsFromDescription(obj) {
  if (typeof obj !== "object" || obj === null) return;

  for (let key in obj) {
    if (
      key === "description" &&
      typeof obj[key] === "string"
    ) {
      obj[key] = obj[key].replace(
        /<style[^>]*>.*?<\/style>/gs,
        ""
      );
      // Replace XML tags with an empty string
      obj[key] = obj[key].replace(/<[^>]*>?/gm, "");
      obj[key] = obj[key].replace(/\s+/g, " ").trim();
    } else {
      removeXmlTagsFromDescription(obj[key]);
    }
  }
}

removeXmlTagsFromDescription(openApiData);

// Fix types for required fields
const getRkCountResponse =
  openApiData.paths["/adv/v0/count"].get.responses["200"]
    .content["application/json"].schema;

getRkCountResponse.properties.adverts.items.required = [
  "type",
  "status",
  "count",
];

getRkCountResponse.required = ["all", "adverts"];

const getRkResponse =
  openApiData.paths["/adv/v0/advert"].get.responses["200"]
    .content["application/json"].schema;

getRkResponse.properties.params.items.properties.intervals.items.required =
  ["begin", "end"];

getRkResponse.properties.params.items.properties.intervals.items.properties.begin =
  getRkResponse.properties.params.items.properties.intervals.items.properties.Begin;
getRkResponse.properties.params.items.properties.intervals.items.properties.end =
  getRkResponse.properties.params.items.properties.intervals.items.properties.End;
delete getRkResponse.properties.params.items.properties
  .intervals.items.properties.Begin;
delete getRkResponse.properties.params.items.properties
  .intervals.items.properties.End;

getRkResponse.properties.params.items.properties.nms.items.required =
  ["nm", "active"];

getRkResponse.properties.params.items.required = [
  "intervals",
  "price",
];

getRkResponse.required = [
  "advertId",
  "name",
  "type",
  "status",
  "dailyBudget",
  "createTime",
  "changeTime",
  "startTime",
  "endTime",
  "params",
];

const getRksResponse =
  openApiData.paths["/adv/v0/adverts"].get.responses["200"]
    .content["application/json"].schema;

getRksResponse.items.properties.dailyBudget.type =
  "integer";
getRksResponse.items.required = [
  "advertId",
  "name",
  "type",
  "status",
  "dailyBudget",
  "createTime",
  "changeTime",
  "startTime",
  "endTime",
];

const getAllCpmResponse =
  openApiData.paths["/adv/v0/cpm"].get.responses["200"]
    .content["application/json"].schema;
getAllCpmResponse.items.properties.Cpm =
  getAllCpmResponse.items.properties.Cmp;
delete getAllCpmResponse.items.properties.Cmp;

getAllCpmResponse.items.required = ["Cpm", "Count"];

const allCpmByTypeResponse =
  openApiData.paths["/adv/v0/allcpm"].post.responses["200"]
    .content["application/json"].schema;
allCpmByTypeResponse.items.required = ["param", "cpm"];
allCpmByTypeResponse.items.properties.cpm.items.required = [
  "Cpm",
  "Count",
];

openApiData.paths[
  "/adv/v0/active"
].get.parameters[2].schema.type = "boolean";

openApiData.paths[
  "/adv/v0/nmactive"
].post.requestBody.content[
  "application/json"
].schema.required = ["advertId", "active", "param"];

openApiData.paths["/adv/v0/nmactive"].post.requestBody
  .content["application/json"].schema.properties.active
  .items.required = ["nm", "active"];

openApiData.paths["/adv/v0/params/subject"].get.responses[
  "200"
].content["application/json"].schema.items.required = [
  "id",
  "name",
];

openApiData.paths["/adv/v0/params/menu"].get.responses[
  "200"
].content["application/json"].schema.items.required = [
  "id",
  "name",
];

openApiData.paths["/adv/v0/params/set"].get.responses[
  "200"
].content["application/json"].schema.items.required = [
  "id",
  "name",
];

const advRoutes = {
  "/adv/v0/count": {
    get: {
      description: "Получение РК",
      operationId: "getRkCount",
    },
  },
  "/adv/v0/adverts": {
    get: {
      description: "Список РК",
      operationId: "getRks",
    },
  },
  "/adv/v0/advert": {
    get: {
      description: "Информация о РК",
      operationId: "getRk",
    },
  },
  "/adv/v0/start": {
    get: {
      description: "Запуск РК",
      operationId: "startRk",
    },
  },
  "/adv/v0/pause": {
    get: {
      description: "Пауза РК",
      operationId: "pauseRk",
    },
  },
  "/adv/v0/stop": {
    get: {
      description: "Завершение РК",
      operationId: "stopRk",
    },
  },
  "/adv/v0/cpm": {
    get: {
      description: "Список ставок",
      operationId: "getAllCpm",
    },
    post: {
      description: "Изменение ставки у РК",
      operationId: "setCpm",
    },
  },
  "/adv/v0/allcpm": {
    post: {
      description: "Список ставок по типу размещения РК",
      operationId: "allCpmByType",
    },
  },
  "/adv/v0/active": {
    get: {
      description:
        "Изменение активности предметной группы для РК в поиске",
      operationId: "changeActiveSubjectIdRk",
    },
  },
  "/adv/v0/rename": {
    post: {
      description: "Переименование РК",
      operationId: "renameRk",
    },
  },
  "/adv/v0/intervals": {
    post: {
      description: "Изменение интервалов показа РК",
      operationId: "setIntervalsRk",
    },
  },
  "/adv/v0/nmactive": {
    post: {
      description: "Изменение активности номенклатур РК",
      operationId: "setNmActiveRk",
    },
  },
  "/adv/v0/params/subject": {
    get: {
      description: "Словарь значений параметра subjectId",
      operationId: "getSubjectIdDict",
    },
  },
  "/adv/v0/params/menu": {
    get: {
      description: "Словарь значений параметра menuId",
      operationId: "getMenuIdDict",
    },
  },
  "/adv/v0/params/set": {
    get: {
      description: "Словарь значений параметра setId",
      operationId: "getSetIdDict",
    },
  },
};

const filteredPaths = Object.fromEntries(
  Object.entries(openApiData.paths)
    .filter(([path, pathData]) => {
      return path.startsWith("/adv/");
    })
    .map(([path, pathData]) => {
      if (advRoutes[path]) {
        if (pathData.get && advRoutes[path].get)
          pathData.get.operationId =
            advRoutes[path].get.operationId;
        if (pathData.post && advRoutes[path].post)
          pathData.post.operationId =
            advRoutes[path].post.operationId;
      }
      return [path, pathData];
    })
);

const refs = collectRefs(filteredPaths);
const filteredOpenApiData = {
  ...openApiData,
  paths: filteredPaths,
  "x-tagGroups": openApiData["x-tagGroups"].filter(
    (tagGroup) => {
      return tagGroup.name === "Реклама";
    }
  ),
  tags: openApiData.tags.filter((tag) => {
    return tag.name === "Реклама";
  }),
  components: {
    ...openApiData.components,
    schemas: Object.fromEntries(
      Object.entries(openApiData.components.schemas).filter(
        ([schemaName]) => {
          return refs.some((ref) =>
            ref.includes("/schemas/" + schemaName)
          );
        }
      )
    ),
    responses: Object.fromEntries(
      Object.entries(
        openApiData.components.responses
      ).filter(([responseName]) => {
        return refs.some((ref) =>
          ref.includes("/responses/" + responseName)
        );
      })
    ),
    requestBodies: Object.fromEntries(
      Object.entries(
        openApiData.components.requestBodies
      ).filter(([requestBodyName]) => {
        return refs.some((ref) =>
          ref.includes("/requestBodies/" + requestBodyName)
        );
      })
    ),
    examples: Object.fromEntries(
      Object.entries(
        openApiData.components.examples
      ).filter(([exampleName]) => {
        return refs.some((ref) =>
          ref.includes("/examples/" + exampleName)
        );
      })
    ),
    parameters: Object.fromEntries(
      Object.entries(
        openApiData.components.parameters
      ).filter(([parameterName]) => {
        return refs.some((ref) =>
          ref.includes("/parameters/" + parameterName)
        );
      })
    ),
  },
};

const fs = require("fs");
fs.writeFileSync(
  "./openapi-filtered.json",
  JSON.stringify(filteredOpenApiData, null, 2)
);
