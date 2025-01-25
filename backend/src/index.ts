import express from "express";
import bodyparser from "body-parser";
import mongoose from "mongoose";
import env from "dotenv";
import jwt from "jsonwebtoken";
import z from "zod";
import bcrypt from "bcrypt";
import crypto from "crypto";
import cors from "cors";
import nodemailer from "nodemailer";
import { Redis } from "ioredis";
import metascraper from "metascraper";
import metascraperImage from "metascraper-image";
import got from "got";
import {
  userModel,
  contentModel,
  tagModel,
  typeModel,
  linkModel,
} from "./db.ts";
import { Middleware } from "./middleware.ts";

const app = express();

app.use(express.json());

const port: number = 3000;

const scraper = metascraper([metascraperImage()]);

app.use(bodyparser.json());

env.config();

app.use(
  cors({
    origin: ["https://link-hive-seven.vercel.app", "http://localhost:5173"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "token"],
  }),
);

const saltRounds = 10;

const redis = new Redis(process.env.REDIS_URL!);

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.PASS_USER,
  },
});

const userSchema = z.object({
  username: z
    .string()
    .min(3, { message: "Username must be at least 3 characters long" }),
  email: z.string().email({ message: "Invalid email" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long" })
    .regex(/[A-Z]/, {
      message: "Password must contain at least one capital letter",
    })
    .regex(/[\W_]/, {
      message: "Password must contain at least one special character",
    }),
});

app.post("/api/v1/signup", async (req, res): Promise<any> => {
  const result = userSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      message: "Invalid input",
      errors: result.error.errors,
    });
  }

  const { username, email, password } = result.data;
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  try {
    const existingUser = await userModel.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: "Username already exists" });
    }

    const existingEmail = await userModel.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ error: "Email already exists" });
    }

    await redis.set(
      `signup:${email}`,
      JSON.stringify({ username, email, password }),
      "EX",
      300,
    );
    await redis.set(`otp:${email}`, otp, "EX", 300);

    await transporter.sendMail({
      from: process.env.USER_EMAIL,
      to: email,
      subject: "Your OTP Code",
      text: `Your OTP is: ${otp}. It will expire in 5 minutes.`,
    });
    return res.status(200).json({ message: "OTP sent to your email" });
  } catch (e) {
    console.log("Error during signup:", e);
  }
});

app.post("/api/v1/verify-otp", async (req, res): Promise<any> => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ message: "Email and OTP are required" });
  }

  try {
    const storedOtp = await redis.get(`otp:${email}`);
    const userInfo = await redis.get(`signup:${email}`);

    if (storedOtp !== otp) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    if (!userInfo) {
      return res.status(400).json({ message: "User info not found" });
    }

    const { username, email: userEmail, password } = JSON.parse(userInfo);

    const hashpassword = await bcrypt.hash(password, saltRounds);
    const newUser = await userModel.create({
      username,
      email: userEmail,
      hashpassword,
    });

    await redis.del(`otp:${email}`);
    await redis.del(`signup:${email}`);
    const token = jwt.sign(
      {
        id: newUser._id,
      },
      process.env.JWT_PASSWORD!,
    );
    res.json({
      token: token,
    });
  } catch (e) {
    console.error("Error during OTP verification", e);
    return res.status(500).json({ message: "Server error" });
  }
});

app.post("/api/v1/signin", async (req, res): Promise<any> => {
  const { email, password } = req.body;
  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(403).json({
        message: "User not found",
      });
    }
    if (!user.hashpassword) {
      return res.status(403).json({
        message: "User password is missing",
      });
    }

    const match = await bcrypt.compare(password, user.hashpassword);
    if (match) {
      const token = jwt.sign(
        {
          id: user._id,
        },
        process.env.JWT_PASSWORD!,
      );
      res.json({
        token: token,
      });
    } else {
      res.status(403).json({
        message: "Incorrect cerdentials",
      });
    }
  } catch (e) {
    console.error("Error during login", e);
    return res.status(500).json({ message: "Server error" });
  }
});

app.post("/api/v1/content", Middleware, async (req, res): Promise<any> => {
  try {
    const { title, link, tags, type } = req.body;
    const userId = req.userId;
    const { body: html } = await got(link);

    const metadata = await scraper({ html: html, url: link });

    const imageUrl = metadata.image;

    const tagId = await Promise.all(
      tags.map(async (tagName: string) => {
        let tag = await tagModel.findOne({ tags: tagName });
        if (!tag) {
          tag = await tagModel.create({ tags: tagName });
        }
        return tag._id;
      }),
    );
    const getTypeId = async (typeName: string) => {
      try {
        let type = await typeModel.findOne({ type: typeName });
        if (!type) {
          type = await typeModel.create({ type: typeName });
        }
        return type._id;
      } catch (e) {
        console.error("Error getting type ID", e);
        throw e;
      }
    };
    const typeId = await getTypeId(type);

    const content = await contentModel.create({
      title: title,
      link: link,
      imageUrl: imageUrl,
      type: typeId,
      tags: tagId,
      userId: userId,
    });
    return res
      .status(201)
      .json({ message: "Content added successfully", content });
  } catch (e) {
    console.error("Error adding link", e);
    return res.status(500).json({ message: "Server error", e });
  }
});

app.get("/api/v1/content", Middleware, async (req, res): Promise<any> => {
  try {
    const userId = req.userId;
    const contents = await contentModel.find({ userId }).populate("tags");
    return res.status(201).json({ contents });
  } catch (e) {
    console.error("Error loading content", e);
    return res.status(500).json({ message: "Server error" });
  }
});

app.delete(
  "/api/v1/content/:id",
  Middleware,
  async (req, res): Promise<any> => {
    try {
      const id = req.params.id;
      const deletedContent = await contentModel.deleteOne({ _id: id });
      if (deletedContent.deletedCount === 0) {
        return res.status(404).json({ message: "Content not found" });
      }
      return res
        .status(201)
        .json({ message: "Content deleted successfully", deletedContent });
    } catch (e) {
      console.error("Error deleting content", e);
      return res.status(500).json({ message: "Server error" });
    }
  },
);

app.get("/api/v1/content/share", Middleware, async (req, res): Promise<any> => {
  try {
    const userId = req.userId;
    const existingLink = await linkModel.findOne({ userId });

    if (existingLink) {
      const shareableLink = `${req.protocol}://${req.get("host")}/api/v1/content/${existingLink.hash}`;
      return res
        .status(201)
        .json({ message: "Link already exist", shareableLink });
    }

    const hash = crypto.randomBytes(16).toString("hex");
    await linkModel.create({ hash, userId });
    const shareableLink = `${req.protocol}://${req.get("host")}/api/v1/content/${hash}`;
    return res
      .status(201)
      .json({ message: "Link created successfully", shareableLink });
  } catch (e) {
    console.error("Error generating link", e);
    return res.status(500).json({ message: "Server error" });
  }
});

app.get("/api/v1/content/:hash", async (req, res): Promise<any> => {
  try {
    const hash = req.params.hash;
    const link = await linkModel.findOne({ hash });
    const userId = link?.userId;
    const contents = await contentModel.find({ userId });
    return res.status(200).json({ contents });
  } catch (e) {
    console.error("Error accessing user links", e);
    return res.status(500).json({ message: "Server error" });
  }
});

app.get("/api/v1/types", Middleware, async (req, res): Promise<any> => {
  try {
    const userId = req.userId;
    const typeIds = await contentModel.distinct("type", { userId });
    const populatedTypes = await typeModel.find({ _id: { $in: typeIds } });
    return res.status(200).json({ types: populatedTypes });
  } catch (e) {
    console.error("Error fetching types", e);
    return res.status(500).json({ message: "Server error" });
  }
});

app.get("/api/v1/types/:typeid", Middleware, async (req, res): Promise<any> => {
  try {
    const typeId = req.params.typeid;
    const userId = req.userId;
    const contents = await contentModel.find({ userId, type: typeId });
    return res.status(200).json({ contents });
  } catch (e) {
    console.error("Error accessing contents", e);
    return res.status(500).json({ message: "Server error" });
  }
});

async function main() {
  const mongoUri = process.env.MONGODB_STRING!;
  await mongoose.connect(mongoUri);
  app.listen(port, () => {
    console.log(`listening on port ${port}`);
  });
}

main();
