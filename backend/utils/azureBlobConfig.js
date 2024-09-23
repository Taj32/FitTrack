import { BlobServiceClient } from '@azure/storage-blob';



const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
const containerClient = blobServiceClient.getContainerClient(containerName);

export { containerClient };