import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import {
  DocumentAnalysisClient,
  AzureKeyCredential,
} from "@azure/ai-form-recognizer";

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  try {
    // Ensure the request is a POST request
    if (req.method !== "POST") {
      context.res = {
        status: 400,
        body: "Bad Request. Only POST requests are allowed.",
      };
      return;
    }

    // Parse the request body
    const formPdfContent = Buffer.from(req.body);

    // Your Form Recognizer logic
    const result = await analyzePdf(formPdfContent);

    // Respond with the result
    context.res = {
      status: 200,
      body: { success: true, result },
    };
  } catch (error) {
    console.error("An error occurred:", error);
    context.res = {
      status: 500,
      body: "Internal Service Error",
    };
  }
};

async function analyzePdf(formPdfContent: Buffer): Promise<any> {
  const endpoint = "https://internship.cognitiveservices.azure.com/";
  const key = "7a3bca43eb534fa18cc342d1abb57293";

  const client = new DocumentAnalysisClient(
    endpoint,
    new AzureKeyCredential(key)
  );

  const poller = await client.beginAnalyzeDocument(
    "prebuilt-invoice",
    formPdfContent
  );

  const { content, pages, languages, styles } = await poller.pollUntilDone();

  const regex =
    /ORARI DI CONSEGNA: (\d{1,2}\.\d{2} - \d{1,2}\.\d{2} \/ \d{1,2}\.\d{2}-\d{1,2}\.\d{2})/;

  // Search for the pattern in the content
  const match = content.match(regex);

  // If a match is found, extract the delivery time range
  const rangeForDelivery = match ? match[1] : null;

  return { rangeForDelivery };
}

export default httpTrigger;
