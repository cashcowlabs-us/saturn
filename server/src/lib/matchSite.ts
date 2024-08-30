import supabase from "../utils/supabase";

type Output = {
  site_uuid: string;
};

export default async function matchSite(
  primaryKeyword: string,
  secondaryKeywords: string[],
  industry: string,
  drHigh: number,
  drLow: number
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
    .select("*")
    .gt("dr", drLow)
    .lt("dr", drHigh);
  
    // Handle error case
  if (error) {
    return Error(error.message);
  }

  // Filter sites based on keywords and industry
  const matchedSites = sites.filter((site) => {
    return (
      site.industry === primaryKeyword ||
      secondaryKeywords.includes(site.industry) ||
      site.industry === industry
    );
  });

  // Return an array of matched site UUIDs
  return matchedSites.map(({ id }) => ({ site_uuid: id }));
}
