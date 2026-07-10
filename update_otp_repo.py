import os

with open('backend/src/main/java/com/campusskills/modules/users/repositories/OtpVerificationRepository.java', 'r') as f:
    content = f.read()

# Add findByEmailAndType and deleteByEmailAndType
new_methods = '''
    public Future<OtpVerification> findByEmailAndType(String email, String type) {
        JsonObject query = new JsonObject().put("email", email).put("type", type);
        return client.findOne(COLLECTION, query, null).map(doc -> {
            if (doc == null) return null;
            if (doc.getValue("expiresAt") instanceof JsonObject) {
                JsonObject expiresAtObj = doc.getJsonObject("expiresAt");
                if (expiresAtObj.containsKey("")) {
                    try {
                        String isoDate = expiresAtObj.getString("");
                        long millis = java.time.Instant.parse(isoDate).toEpochMilli();
                        doc.put("expiresAt", millis);
                    } catch (Exception e) {
                        Object val = expiresAtObj.getValue("");
                        if (val instanceof Number) {
                            doc.put("expiresAt", ((Number) val).longValue());
                        }
                    }
                }
            }
            return doc.mapTo(OtpVerification.class);
        });
    }

    public Future<Void> deleteByEmailAndType(String email, String type) {
        JsonObject query = new JsonObject().put("email", email).put("type", type);
        return client.removeDocument(COLLECTION, query).mapEmpty();
    }
'''

content = content.replace('public Future<Void> delete(String id) {', new_methods + '\\n    public Future<Void> delete(String id) {')

with open('backend/src/main/java/com/campusskills/modules/users/repositories/OtpVerificationRepository.java', 'w') as f:
    f.write(content)
