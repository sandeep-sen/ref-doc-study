"use strict";

import { BlobServiceClient } from "@azure/storage-blob";
import "dotenv/config"

async function getBlobServiceClient(): Promise<BlobServiceClient> {
    console.log("\nAuthenticating credentials for Azure Storage Account and creating a service client");

    const AZURE_STORAGE_CONNECTION_STRING =
        process.env.AZURE_STORAGE_CONNECTION_STRING;
    if (!AZURE_STORAGE_CONNECTION_STRING) {
        throw Error('Azure Storage Connection string not found');
    }
    // Create the BlobServiceClient object with connection string
    const blobServiceClient = BlobServiceClient.fromConnectionString(
        AZURE_STORAGE_CONNECTION_STRING
    );
    return blobServiceClient
}

async function listBlobsInContainer(): Promise<void> {
    const blobServiceClient = await getBlobServiceClient();
    
    console.log("\nList of Blobs");
    const CONTAINER_NAME = process.env.CONTAINER_NAME;
    if (!CONTAINER_NAME) {
        throw Error('Azure Storage Container name not found');
    }
    const containerClient = blobServiceClient.getContainerClient(CONTAINER_NAME);
    console.log("Blobs:");
    for await (const blob of containerClient.listBlobsFlat()) {
        console.log(`- ${blob.name}`);
    }
}

async function streamToBuffer(stream: NodeJS.ReadableStream): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      stream.on("data", (data) => {
        chunks.push(Buffer.isBuffer(data) ? data : Buffer.from(data));
      });
      stream.on("end", () => {
        resolve(Buffer.concat(chunks));
      });
      stream.on("error", reject);
    });
  }

async function getBlobDataAsString(blobName: string): Promise<void> {
    const blobServiceClient = await getBlobServiceClient();

    console.log("\nBlob Content");
    const CONTAINER_NAME = process.env.CONTAINER_NAME;
    if (!CONTAINER_NAME) {
        throw Error('Azure Storage Container name not found');
    }
    const containerClient = blobServiceClient.getContainerClient(CONTAINER_NAME);

    let blockBlobClient = containerClient.getBlockBlobClient(blobName);
    const downloadBlockBlobResponse = await blockBlobClient.download();
    console.log(
      `Downloaded blob content: \n ${(
        await streamToBuffer(downloadBlockBlobResponse.readableStreamBody!)
      ).toString()},`
    );
    console.log(
      `requestId - ${downloadBlockBlobResponse.requestId}, statusCode - ${downloadBlockBlobResponse._response.status}\n`
    );
  }

getBlobDataAsString("2022-12-22-09-00.txt");
listBlobsInContainer();