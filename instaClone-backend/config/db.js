import mongoose from "mongoose";

export const connectDb = async () => {
    try {

        await mongoose.connect("mongodb+srv://areeshazv_db_user:areesha.1@cluster3.3rcxtaa.mongodb.net/?appName=Cluster3")
        console.log("✅ MongoDB connected:");
    } catch (error) {
        console.log("db connection failed", error);

    }
}
