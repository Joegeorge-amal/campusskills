package com.campusskills.modules.images.services;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;

import java.util.HashMap;
import java.util.Map;
import com.campusskills.core.config.Env;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class CloudinaryService {

    private static final Logger log = LoggerFactory.getLogger(CloudinaryService.class);
    private final Cloudinary cloudinary;

    public CloudinaryService() {
        String cloudName = Env.get("CLOUDINARY_CLOUD_NAME");
        String apiKey = Env.get("CLOUDINARY_API_KEY");
        String apiSecret = Env.get("CLOUDINARY_API_SECRET");

        if (cloudName == null || apiKey == null || apiSecret == null) {
            log.warn("Cloudinary environment variables are missing.");
        }

        this.cloudinary = new Cloudinary(ObjectUtils.asMap(
            "cloud_name", cloudName,
            "api_key", apiKey,
            "api_secret", apiSecret,
            "secure", true
        ));
    }

    public Map<String, Object> generateUploadSignature(String userId, String type) {
        try {
            long timestamp = System.currentTimeMillis() / 1000L;
            
            // Generate deterministic public ID based on user and image type
            String folder = type.equals("banner") ? "banners" : "avatars";
            String publicId = "campusskills/" + folder + "/" + userId;
            
            Map<String, Object> paramsToSign = new HashMap<>();
            paramsToSign.put("public_id", publicId);
            paramsToSign.put("overwrite", true);
            paramsToSign.put("timestamp", timestamp);

            String signature = cloudinary.apiSignRequest(paramsToSign, cloudinary.config.apiSecret);

            Map<String, Object> response = new HashMap<>();
            response.put("signature", signature);
            response.put("timestamp", timestamp);
            response.put("public_id", publicId);
            response.put("api_key", cloudinary.config.apiKey);
            response.put("cloud_name", cloudinary.config.cloudName);

            return response;
        } catch (Exception e) {
            log.error("Failed to generate Cloudinary upload signature", e);
            return null;
        }
    }
}
