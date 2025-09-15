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
import {
  userModel,
  contentModel,
  typeModel,
  linkModel,
  IType,
  ITag,
  ILinkPopulated,
} from "./db.ts";
import { Middleware } from "./middleware.ts";
import {
  getCreateTags,
  getCreateType,
  extractImageIframe,
} from "./utils/contentutils.ts";
const app = express();

app.use(express.json());

const port: number = 3000;
app.use(bodyparser.json());

env.config();

app.use(
  cors({
    origin: ["https://link-hive-seven.vercel.app", "http://localhost:5173"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "token"],
    credentials: true,
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

    const tagId = await getCreateTags(tags);
    const typeId = await getCreateType(type);
    const imageUrl = await extractImageIframe(link);
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
    console.error("Error adding content", e);
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

app.get("/api/v1/content/:id", Middleware, async (req, res): Promise<any> => {
  try {
    const userId = req.userId;
    const id = req.params.id;
    const contentById = await contentModel
      .findOne({ userId, _id: id })
      .populate("type tags");
    if (!contentById) {
      return res.status(404).json({ message: "Content Data not found" });
    } else {
      return res
        .status(201)
        .json({ message: "Content Data found", contentById });
    }
  } catch (e) {
    console.error("Error getting content data", e);
    return res.status(500).json({ messgae: "Server Error" });
  }
});

app.get("/api/v1/share-link", Middleware, async (req, res): Promise<any> => {
  try {
    const userId = req.userId;
    const existingLink = await linkModel.findOne({ userId });

    if (existingLink) {
      const shareableLink = existingLink.hash;
      return res
        .status(201)
        .json({ message: "Link already exist", shareableLink });
    }

    const hash = crypto.randomBytes(16).toString("hex");
    await linkModel.create({ hash, userId });
    const shareableLink = hash;
    return res
      .status(201)
      .json({ message: "Link created successfully", shareableLink });
  } catch (e) {
    console.error("Error generating link", e);
    return res.status(500).json({ message: "Server error" });
  }
});

app.get("/api/v1/shareablecontent/:hash", async (req, res): Promise<any> => {
  try {
    const hash = req.params.hash;
    const link = (await linkModel
      .findOne({ hash })
      .populate("userId", "username")) as ILinkPopulated | null;
    if (!link) {
      return res.status(404).json({ message: "Link not found" });
    }
    const userId = link.userId._id;
    const username = link.userId.username;
    const contents = await contentModel.find({ userId }).populate("tags");
    return res.status(200).json({ contents, username });
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
    const contents = await contentModel
      .find({ userId, type: typeId })
      .populate("tags");
    return res.status(200).json({ contents });
  } catch (e) {
    console.error("Error accessing contents", e);
    return res.status(500).json({ message: "Server error" });
  }
});

app.put(
  "/api/v1/updatecontent/:id",
  Middleware,
  async (req, res): Promise<any> => {
    try {
      const id = req.params.id;
      const userId = req.userId;
      const { title, link, type, tags } = req.body;
      const existingContent = await contentModel
        .findOne({ userId, _id: id })
        .populate("type tags");
      if (!existingContent) {
        return res.status(404).json({ error: "Content not found" });
      }
      let updated = false;

      if (title && title !== existingContent.title) {
        existingContent.title = title;
        updated = true;
      }
      if (link && link !== existingContent.link) {
        existingContent.link = link;
        existingContent.imageUrl = await extractImageIframe(link);
        updated = true;
      }

      if (type && (existingContent.type as IType).type !== type) {
        existingContent.type = await getCreateType(type);
        updated = true;
      }

      if (
        tags &&
        JSON.stringify(
          (existingContent.tags as ITag[]).map((t) => t.tags).sort(),
        ) !== JSON.stringify(tags.sort())
      ) {
        existingContent.tags = await getCreateTags(tags);
        updated = true;
      }
      if (updated) {
        await existingContent.save();
        return res.status(200).json({
          message: "Content updated successfully",
        });
      } else {
        return res.status(200).json({
          message: "No changes detected",
        });
      }
    } catch (e) {
      console.error("Error updating content", e);
      return res.status(500).json({ message: "Server error" });
    }
  },
);

async function main() {
  const mongoUri = process.env.MONGODB_STRING!;
  await mongoose.connect(mongoUri);
  app.listen(port, () => {
    console.log(`listening on port ${port}`);
  });
}

main();
