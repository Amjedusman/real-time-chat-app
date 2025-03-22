import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";

const MONGODB_CONFIG = {
  host: 'mongodb://localhost:27017/',
  database: 'face_recognition_db',
  collection: 'users'
};

export async function POST(req: Request) {
  try {
    const { image, email } = await req.json();

    if (!image || !email) {
      return NextResponse.json({ 
        success: false, 
        message: "Image and email are required" 
      }, { status: 400 });
    }

    // Connect to MongoDB using config
    const client = await MongoClient.connect(MONGODB_CONFIG.host);
    const db = client.db(MONGODB_CONFIG.database);
    const collection = db.collection(MONGODB_CONFIG.collection);

    // Check if email already exists
    const existingUser = await collection.findOne({ name: email });
    if (existingUser) {
      await client.close();
      return NextResponse.json({ 
        success: false, 
        message: "User with this email already exists" 
      }, { status: 400 });
    }

    try {
      // Convert base64 image to buffer
      const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
      const imageBuffer = Buffer.from(base64Data, 'base64');

      // Store in MongoDB with email as name
      await collection.insertOne({
        name: email,
        face_encoding: imageBuffer,
        created_at: new Date()
      });

      await client.close();

      return NextResponse.json({ 
        success: true, 
        message: "Face registered successfully" 
      });
    } catch (dbError) {
      console.error('Database operation error:', dbError);
      return NextResponse.json({ 
        success: false, 
        message: "Failed to store face data" 
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Face registration error:', error);
    return NextResponse.json(
      { success: false, message: String(error) },
      { status: 500 }
    );
  }
}