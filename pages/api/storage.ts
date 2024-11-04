import formidable from "formidable";
import { readFileSync, unlinkSync } from "fs";
import { tmpdir } from "os";

async function handler(req: any, res: any) {
  if (req.method != "POST") {
    return res.status(403).json({ error: `Unsupported method ${req.method}` });
  }
  try {
    // Parse req body and save image in /tmp
    const data: any = await new Promise((resolve, reject) => {
      const form = formidable({ multiples: true, uploadDir: tmpdir() });

      form.parse(req, (err: any, fields: any, files: any) => {
        if (err) reject(err);
        resolve({ ...fields, ...files });
      });
    });
    // Read image from /tmp
    const {
      filepath,
      originalFilename = "image",
      mimetype = "image",
    } = data.image[0];

    const buffer = readFileSync(filepath);
    const arraybuffer = Uint8Array.from(buffer).buffer;
    const formData = new FormData();
    formData.append("file", new Blob([arraybuffer]), "image.png"); // Append the image file
    formData.append("name", data.name[0]); // Append the NFT name
    formData.append("description", data.description[0]);

    let metadata : any= await fetch("https://uploads.pinata.cloud/v3/files", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + process.env.PINATA_JWT,
      },
      body: formData,
    });
      metadata = await metadata.json();

    res.status(201).json({ uri: metadata.data.cid });

    // Delete tmp image
    unlinkSync(filepath);
    // return tokenURI
  } catch (e) {
    console.log(e);
    return res.status(400).json(e);
  }
}

// Must disable bodyParser for formidable to work
export const config = {
  api: {
    bodyParser: false,
  },
};
export default handler;
