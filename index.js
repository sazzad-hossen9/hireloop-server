import express from "express";
import cors from "cors";
import { MongoClient, ObjectId } from "mongodb";
import "dotenv/config";

const app = express();
const PORT = process.env.PORT || 5000;
app.use(express.json());
app.use(cors());

const client = new MongoClient(
  `mongodb://${process.env.DB_USER}:${process.env.DB_PASSWORD}@ac-aj5i7wv-shard-00-00.eivcuwr.mongodb.net:27017,ac-aj5i7wv-shard-00-01.eivcuwr.mongodb.net:27017,ac-aj5i7wv-shard-00-02.eivcuwr.mongodb.net:27017/?ssl=true&replicaSet=atlas-679n6z-shard-0&authSource=admin`,
);
export async function connectToMongoDB() {
  try {
    await client.connect();
    console.log("You successfully connected to MongoDB!");
    return client;
  } catch (err) {
    console.dir(err);
  }
}

const connectClient = await connectToMongoDB();
const db = connectClient.db("hireloopdb");
const users = db.collection("user");
const jobs = db.collection("jobs");
app.get("/", (req, res) => {
  res.send("HELLO WORLD");
});

app.get("/users", async (req, res) => {
  const cursor = users.find({});
  const result = await cursor.toArray();
  res.send(result);
});

//! jobs section
app.post("/jobs", async (req, res) => {
  const job = req.body;
  const result = await jobs.insertOne(job);
  res.status(200).send(result);
});
app.get("/jobs", async (req, res) => {
  const query = {};
  console.log("query", req.query);
  if (req.query) {
    if (req.query.jobType) {
      query.jobType = req.query.jobType;
    }
    if (req.query.isRemote) {
      query.isRemote = req.query.isRemote === true;
    }
    if (req.query.jobCategory) {
      query.jobCategory = req.query.jobCategory;
    }
    if (req.query.search) {
      query.$or = [
        { jobTitle: { $regex: req.query.search, $options: "i" } },
        { responsibilities: { $regex: req.query.search, $options: "i" } },
        { requirements: { $regex: req.query.search, $options: "i" } },
      ];
    }
  }
  const cursor = jobs.find(query);
  const result = await cursor.toArray();
  res.send(result);
});

app.delete("/jobs/:id", async (req, res) => {
  const { id } = req.params;
  const query = { _id: new ObjectId(id) };
  const result = await jobs.deleteOne(query);
  res.status(200).send(result);
});
app.listen(PORT, () => {
  console.log(`server is raining ${PORT}`);
});
