import { NextRequest, NextResponse } from "next/server";
import neo4j, { Driver } from "neo4j-driver";
import { queries } from "../../../server/queries";

const demoPaths = [
  {
    title: "Machine Learning Engineer",
    company: "Northstar Labs",
    fit: 87,
    steps: ["Python", "ML systems", "Model deployment"],
    salary: "$142k-$176k",
    time: "2 skill moves",
  },
  {
    title: "Product Data Scientist",
    company: "Arc & Arrow",
    fit: 76,
    steps: ["SQL", "Experiment design", "Product sense"],
    salary: "$128k-$158k",
    time: "3 skill moves",
  },
  {
    title: "Analytics Lead",
    company: "Lumen Health",
    fit: 71,
    steps: ["Data storytelling", "Leadership", "Strategy"],
    salary: "$119k-$149k",
    time: "3 skill moves",
  },
];

const toNumber = (value: unknown) =>
  neo4j.isInt(value) ? value.toNumber() : Number(value);

let driver: Driver | undefined;

if (
  process.env.COGNODB_URI &&
  process.env.COGNODB_PASSWORD
) {
  driver = neo4j.driver(
    process.env.COGNODB_URI,
    neo4j.auth.basic(
      process.env.COGNODB_USER || "cognodb",
      process.env.COGNODB_PASSWORD
    )
  );
}

export async function GET(request: NextRequest) {
  const role =
    request.nextUrl.searchParams.get("role") ||
    "Machine learning engineer";

  if (!driver) {
    return NextResponse.json({
      source: "demo",
      paths: demoPaths,
    });
  }

  try {
    const result = await driver.executeQuery(
      queries.paths,
      {
        role,
        person: "taylor-stone",
      }
    );

    const paths = result.records.map((record) => {
      const hops = toNumber(record.get("hops"));

      return {
        title: record.get("title"),
        company: record.get("company"),
        fit: Math.max(58, 100 - hops * 8),
        steps: record.get("bridgeSkills"),
        salary: record.get("salary"),
        time: `${hops} skill moves`,
      };
    });

    return NextResponse.json({
      source: "cognodb",
      paths,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json({
      source: "demo",
      paths: demoPaths,
    });
  }
}