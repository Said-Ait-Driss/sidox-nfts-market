import { NextApiRequest, NextApiResponse } from "next";
import NodeCache from "node-cache";
const cache = new NodeCache({ stdTTL: 100, checkperiod: 120 });

const pinataGateway = process.env.PINATA_URL as string;
const pinataJwt = process.env.PINATA_JWT as string;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const { cid } = req.body;

    // Check cache first
    const cachedResponse = cache.get(cid);
    if (cachedResponse) {
      return res.status(200).json(cachedResponse);
    }

    const options = {
      method: "POST",
      headers: {
        Authorization: "Bearer " + pinataJwt,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url: `https://${pinataGateway}/files/${cid}`,
        expires: 50,
        date: Date.now(),
        method: "GET",
      }),
    };

    try {
      const response = await fetch(
        "https://api.pinata.cloud/v3/files/sign",
        options
      );
      const data = await response.json();
      cache.set(cid, data); // Cache the response
      res.status(response.status).json(data);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch from Pinata" });
    }
  } else if (req.method == "GET") {
    const { tokenURI } = req.query;

    const options = {
      headers: {
        Authorization: "Bearer " + pinataJwt,
      },
    };

    try {
      const response = await fetch(
        `https://api.pinata.cloud/v3/files?cid=${tokenURI}`,
        options
      );
      const data = await response.json();
      res.status(response.status).json(data);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to fetch metadata from Pinata" });
    }
  } else {
    res.setHeader("Allow", ["POST", "GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
