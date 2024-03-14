export default function parseIdentifier(identifier: string) {
  const temp = decodeURIComponent(identifier);
  let publicIdentifier;
  let entityUrn;

  if (temp.charAt(0) == "@") {
    publicIdentifier = temp.replace("@", "");
  }

  if (temp.includes("urn:fsd_profile")) {
    entityUrn = temp;
  }
  return {
    publicIdentifier,
    entityUrn,
  };
}
