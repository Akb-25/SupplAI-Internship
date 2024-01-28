"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const httpTrigger = function (context, req) {
    return __awaiter(this, void 0, void 0, function* () {
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
            const result = yield analyzePdf(formPdfContent);
            // Respond with the result
            context.res = {
                status: 200,
                body: { success: true, result },
            };
        }
        catch (error) {
            console.error("An error occurred:", error);
            context.res = {
                status: 500,
                body: "Internal Service Error",
            };
        }
    });
};
function analyzePdf(formPdfContent) {
    return __awaiter(this, void 0, void 0, function* () {
        const endpoint = "https://internship.cognitiveservices.azure.com/";
        const key = "7a3bca43eb534fa18cc342d1abb57293";
        const client = new DocumentAnalysisClient(endpoint, new AzureKeyCredential(key));
        const poller = yield client.beginAnalyzeDocument("prebuilt-invoice", formPdfContent);
        const { content, pages, languages, styles } = yield poller.pollUntilDone();
        const regex = /ORARI DI CONSEGNA: (\d{1,2}\.\d{2} - \d{1,2}\.\d{2} \/ \d{1,2}\.\d{2}-\d{1,2}\.\d{2})/;
        // Search for the pattern in the content
        const match = content.match(regex);
        // If a match is found, extract the delivery time range
        const rangeForDelivery = match ? match[1] : null;
        return { rangeForDelivery };
    });
}
exports.default = httpTrigger;
