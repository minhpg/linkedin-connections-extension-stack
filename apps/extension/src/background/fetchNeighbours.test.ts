import { test, expect } from "vitest";
import { jsToRestli } from "./fetchNeighbours";
test("testConversion", () => {
  // variables=(query:(flagshipSearchIntent:SEARCH_SRP,queryParameters:List((key:connectionOf,value:List(ACoAABveS-EBYF6A7flrnn_KWGV1AH7_XrTaIME)),(key:network,value:List(F,S)),(key:resultType,value:List(PEOPLE)))))"

  const jsTest = {
    query: {
      flagshipSearchIntent: "SEARCH_SRP",
      queryParameters: [
        {
          key: "connectionOf",
          value: ["ACoAABveS-EBYF6A7flrnn_KWGV1AH7_XrTaIME"],
        },
        { key: "network", value: ["F", "S"] },
        { key: "resultType", value: ["PEOPLE"] },
      ],
    },
  };
  // test isArray
  expect(Array.isArray(jsTest.query.queryParameters)).toBe(true);
  const expected =
    "(query:(flagshipSearchIntent:SEARCH_SRP,queryParameters:List((key:connectionOf,value:List(ACoAABveS-EBYF6A7flrnn_KWGV1AH7_XrTaIME)),(key:network,value:List(F,S)),(key:resultType,value:List(PEOPLE)))))";
  const restli = jsToRestli(jsTest);
  // console.log(restli);
  // console.log(restli === expected);
  console.log(restli);
  expect(restli).toBe(expected);
});
