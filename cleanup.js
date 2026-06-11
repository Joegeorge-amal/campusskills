const db = db.getSiblingDB('campusskills');
const userIds = db.users.find({}, { _id: 1 }).map(u => u._id.toString());
const profileResult = db.profiles.deleteMany({ userId: { $nin: userIds } });
const statsResult = db.userstats.deleteMany({ userId: { $nin: userIds } });
print('Deleted profiles:', profileResult.deletedCount);
print('Deleted stats:', statsResult.deletedCount);
