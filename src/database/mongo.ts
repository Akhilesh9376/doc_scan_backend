import mongoose, { Model } from "mongoose";
import { GridFSBucket } from "mongodb";

export const isMongoConnected = () => mongoose.connection.readyState === 1;

export const getModel = (name: string): Model<any> => {
  if (!mongoose.models[name]) {
    throw new mongoose.Error.MissingSchemaError(name);
  }
  return mongoose.model(name);
};

// GridFS
export const bucketName = "documentUploads";
export let gfs: GridFSBucket | undefined;

export const initializeGridFS = () => {
  if (mongoose.connection.db) {
    gfs = new GridFSBucket(mongoose.connection.db, { bucketName });
    console.log(`GridFS bucket '${bucketName}' initialized.`);
  } else {
    console.warn("Mongoose connection.db not immediately available.");
  }
};

if (isMongoConnected()) {
  initializeGridFS();
}
mongoose.connection.once("connected", initializeGridFS);
