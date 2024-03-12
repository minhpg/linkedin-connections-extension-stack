import { test, expect } from "vitest";
import { getConnections, jsToRestli } from "./fetchNeighbours";
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

test("referrerParams", () => {
  const params = getConnections("ACoAABveS-EBYF6A7flrnn_KWGV1AH7_XrTaIME", [
    "F",
    "S",
  ]);
  expect(params).toBe(
    encodeURI(
      `https://www.linkedin.com/search/results/people/?connectionOf=["ACoAABveS-EBYF6A7flrnn_KWGV1AH7_XrTaIME"]&network=["F","S"]&origin=MEMBER_PROFILE_CANNED_SEARCH&sid=~zu`,
    ),
  );
  console.log(params);
});
test("profileConnection", () => {
  // TODO figure how to get vitest to use chrome extension api

  const test_ids = [
    "ACoAADtMuHABG1As3mx2OIsLW4sdLpbcf66Oy0s",
    "ACoAADjS5VIBjMWQ8sCJvfAs8jftm4JbFw7LHic",
    "ACoAADXVN0oBLR_K1CCAKAzwpHkg1Expml3atXA",
    "ACoAAC8pCWkBlixvfG434-j9XHpMkz9zP3IZmtA",
    "ACoAACvd5uEBr_VqSjj9vTSQ4KC_gosqC4SFfQE",
    "ACoAAB3UX3QBUxAj29smnQhYeyvZlxCGyWHrnb4",
    "ACoAABveS-EBYF6A7flrnn_KWGV1AH7_XrTaIME",
    "ACoAADNhc3MBadbl-qjY2orFCfebC8XqKibxtcI",
  ] as const;
  // const urn_id = "ACoAABveS-EBYF6A7flrnn_KWGV1AH7_XrTaIME";
  const urn_id = test_ids[1];
});
