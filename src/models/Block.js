import mongoose from "mongoose";

const blockSchema = new mongoose.Schema({
  index: Number,
  timestamp: String,
  transactions: [mongoose.Schema.Types.Mixed],
  previousHash: String,
  nonce: Number,
  hash: String
});

const Block = mongoose.model("Block", blockSchema);
export default Block;
