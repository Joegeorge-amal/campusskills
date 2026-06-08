// MongoDB migration script to backfill new v2 Listing fields
// Run with: mongosh <database_name> --file migrate_listings_to_v2.js

print("Starting migration to v2 Listing model...");

const collection = db.getCollection("skill_listings");

let modifiedCount = 0;

collection.find({}).forEach(function(doc) {
    const updates = {};
    const unsets = {};

    // 1. ownerId
    if (doc.teacherId && !doc.ownerId) {
        updates.ownerId = doc.teacherId;
    }

    // 2. listingType
    if (doc.sessionType && !doc.listingType) {
        if (doc.sessionType === "PAID") {
            updates.listingType = "TEACH";
        } else if (doc.sessionType === "SWAP") {
            updates.listingType = "SWAP";
        } else if (doc.sessionType === "BOTH") {
            updates.listingType = "TEACH"; // Defaulting BOTH to TEACH per strategy
        }
    }

    // 3. offeredSkills
    if (doc.skills && !doc.offeredSkills) {
        updates.offeredSkills = doc.skills;
    }

    // 4. requestedSkills
    if (doc.preferredSkills && !doc.requestedSkills) {
        updates.requestedSkills = doc.preferredSkills;
    }

    if (Object.keys(updates).length > 0) {
        collection.updateOne(
            { _id: doc._id },
            { $set: updates }
        );
        modifiedCount++;
    }
});

print("Migration completed. Documents modified: " + modifiedCount);
