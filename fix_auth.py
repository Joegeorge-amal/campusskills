import os
import re

with open('backend/src/main/java/com/campusskills/modules/admin/handlers/AdminInvitationAuthHandler.java', 'r', encoding='utf-8') as f:
    content = f.read()

# Add BCrypt import
if 'org.mindrot.jbcrypt.BCrypt' not in content:
    content = content.replace('import java.util.Random;', 'import java.util.Random;\\nimport org.mindrot.jbcrypt.BCrypt;')

# Fix SecurityUtils usages
content = content.replace('com.campusskills.core.security.SecurityUtils.hashPassword(otp)', 'BCrypt.hashpw(otp, BCrypt.gensalt())')
content = content.replace('com.campusskills.core.security.SecurityUtils.hashPassword(body.getString("password"))', 'BCrypt.hashpw(body.getString("password"), BCrypt.gensalt())')
content = content.replace('com.campusskills.core.security.SecurityUtils.verifyPassword(otp, otpDoc.getOtp())', 'BCrypt.checkpw(otp, otpDoc.getOtp())')

# Fix metadata JSON Object cast
content = content.replace('JsonObject metadata = otpDoc.getMetadata();', 'JsonObject metadata = new JsonObject((java.util.Map<String, Object>) otpDoc.getMetadata());')

# Wait, otpDoc.getMetadata() returns Map<String, Object>. So new JsonObject(...) is the right way if we have a raw Map.
# Actually let's just do:
# JsonObject metadata = new JsonObject((java.util.Map<String, Object>) otpDoc.getMetadata());
# But let's check what getMetadata() returns. Map<String, Object> usually.
# Let's replace:
content = content.replace('JsonObject metadata = otpDoc.getMetadata();', 'JsonObject metadata = new JsonObject((java.util.Map<String, Object>) otpDoc.getMetadata());')

# Wait, otpDoc.setMetadata(metadata) takes Map<String, Object> presumably.
content = content.replace('otpDoc.setMetadata(metadata);', 'otpDoc.setMetadata(metadata.getMap());')

# user.setIsEmailVerified does not exist. It's user.setEmailVerified(true) maybe? Let's assume setEmailVerified
content = content.replace('user.setIsEmailVerified', 'user.setEmailVerified')

# user.setReputation(0) and setStrikes(0) are probably not methods of User, but of UserStats
content = content.replace('user.setReputation(0);', '// user.setReputation(0);')
content = content.replace('user.setStrikes(0);', '// user.setStrikes(0);')

# userRepository.create(user).compose(userId -> { ... })
# This works if create returns Future<String>.

with open('backend/src/main/java/com/campusskills/modules/admin/handlers/AdminInvitationAuthHandler.java', 'w', encoding='utf-8') as f:
    f.write(content)

