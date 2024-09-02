import supabase from "../utils/supabase";

type Output = {
  site_uuid: string;
};

export default async function matchSite(
  primaryKeyword: string,
  secondaryKeywords: string[],
  industry: string,
  drHigh: number,
  drLow: number,
  project_uuid: string
): Promise<Output[] | Error> {
  // Ensure DR values are within valid range (0-100)
  drHigh = Math.min(100, Math.max(drHigh, 0));
  drLow = Math.min(100, Math.max(drLow, 0));

  // Check if DR high is less than DR low
  if (drHigh < drLow) {
    return new Error("DR high cannot be less than DR low");
  }

  // Fetch sites based on DR range
  const { data: sites, error } = await supabase
    .from("sites")
    .select("id, industry") // Select only the necessary fields
    .gt("dr", drLow)
    .lt("dr", drHigh)
    .eq("project_uuid", project_uuid);

  // Handle error case
  if (error) {
    return new Error(error.message);
  }

  // Filter sites based on keywords and industry
  let matchedSites = sites.filter((site) => {
    return (
      site.industry === primaryKeyword ||
      secondaryKeywords.includes(site.industry) ||
      site.industry === industry
    );
  });

  // If no matched sites are found, fetch random sites
  if (matchedSites.length === 0) {
    const { data: randomSites, error: randomError } = await supabase
      .from("sites")
      .select("id") // Fetch only the id field for random sites
      .eq("project_uuid", project_uuid)
      .order("dr", { ascending: false })
      .limit(5); // Limit the number of random sites returned

    if (randomError) {
      return new Error(randomError.message);
    }

    matchedSites = randomSites as typeof sites; // Type assertion to match expected type
  }

  // Return an array of matched site UUIDs
  return matchedSites.map(({ id }) => ({ site_uuid: id }));
}
